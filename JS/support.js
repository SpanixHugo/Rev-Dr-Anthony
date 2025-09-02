/* ===== Minimal State ===== */
let selectedAmount = null;
let isRecurring = false;
let selectedCategory = "ministry";
let selectedPaymentMethod = "card";
let donorName = "";
let donorEmail = "";
let customAmountOneTime = "";
let customAmountMonthly = "";
let isMemorial = false;
let memorialName = "";

/* ===== Data ===== */
const donationAmounts = [25, 50, 100, 250, 500, 1000];

const categories = [
    { id: "ministry", title: "Ministry Operations", icon: "heart", color: "primary" },
    { id: "outreach", title: "Community Outreach", icon: "users", color: "secondary" },
    { id: "youth", title: "Youth & Education", icon: "graduation-cap", color: "green" },
    { id: "building", title: "Building & Facilities", icon: "building", color: "accent" },
    { id: "missions", title: "Mission Work", icon: "globe", color: "primary" },
    { id: "emergency", title: "Emergency Fund", icon: "shield", color: "gold" }
];

const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: "credit-card", color: "primary" },
    { id: "paypal", name: "PayPal", icon: "dollar-sign", color: "slate" },
    { id: "paystack", name: "Paystack", icon: "credit-card", color: "emerald" },
    { id: "cashapp", name: "Cash App", icon: "smartphone", color: "green" },
    { id: "bitcoin", name: "Bitcoin", icon: "bitcoin", color: "orange" },
    { id: "zelle", name: "Zelle", icon: "zap", color: "purple" },
    { id: "venmo", name: "Venmo", icon: "smartphone", color: "primary" },
    { id: "bank", name: "Bank Transfer", icon: "banknote", color: "slate" },
    { id: "check", name: "Check/Money Order", icon: "mail", color: "orange" }
];

/* ===== Helpers ===== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const money = n => `$${Number(n).toLocaleString()}`;

/* ===== Render Functions ===== */
function renderCategories() {
    const host = $("#category-list");
    if (!host) return;
    host.innerHTML = "";
    categories.forEach(cat => {
        const item = document.createElement("div");
        item.className = "item";
        item.dataset.id = cat.id;
        if (cat.id === selectedCategory) item.classList.add("is-active");
        item.innerHTML = `
            <div class="square ${cat.color}"><i data-lucide="${cat.icon}"></i></div>
            <div style="min-width:0;flex:1">
                <div class="b s" style="color:var(--blue)">${cat.title}</div>
            </div>
        `;
        item.addEventListener("click", () => {
            selectedCategory = cat.id;
            $$("#category-list .item").forEach(el => el.classList.toggle("is-active", el === item));
        });
        host.appendChild(item);
    });

    // Refresh icons
    if (window.lucide) lucide.createIcons();
}

function renderQuickAmounts() {
    const oneTimeHost = $("#one-time-quick");
    const recurringHost = $("#recurring-quick");
    if (!oneTimeHost || !recurringHost) return;

    oneTimeHost.innerHTML = "";
    recurringHost.innerHTML = "";

    function createButton(amount, recurring = false) {
        const btn = document.createElement("button");
        btn.className = "btn quick-amount";
        btn.textContent = recurring ? `${money(amount)}/mo` : money(amount);

        btn.addEventListener("click", () => {
            isRecurring = recurring;
            selectedAmount = amount;

            if (recurring) {
                customAmountMonthly = "";
                $("#custom-monthly").value = "";
            } else {
                customAmountOneTime = "";
                $("#custom-amount").value = "";
                $(".tabs-trigger[data-tab='one-time']")?.classList.add("is-active");
                $(".tabs-trigger[data-tab='recurring']")?.classList.remove("is-active");
                $("[data-content='one-time']")?.classList.add("is-active");
                $("[data-content='recurring']")?.classList.remove("is-active");
            }

            refreshDonateButton();

            // Highlight active button
            const siblingBtns = btn.parentNode.querySelectorAll(".quick-amount");
            siblingBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });

        return btn;
    }

    donationAmounts.forEach(a => oneTimeHost.appendChild(createButton(a)));
    [25, 50, 100, 250].forEach(a => recurringHost.appendChild(createButton(a, true)));
}

function renderPayments() {
    const host = $("#payment-list");
    if (!host) return;
    host.innerHTML = "";

    paymentMethods.forEach(pm => {
        const item = document.createElement("div");
        item.className = "item";
        item.dataset.id = pm.id;
        if (pm.id === selectedPaymentMethod) item.classList.add("is-active");
        item.innerHTML = `
            <div class="square ${pm.color}"><i data-lucide="${pm.icon}"></i></div>
            <div style="min-width:0;flex:1">
                <div class="b s" style="color:var(--blue)">${pm.name}</div>
            </div>
        `;
        item.addEventListener("click", () => showPaymentPanel(pm.id));
        host.appendChild(item);
    });

    showPaymentPanel(selectedPaymentMethod);

    // Refresh icons
    if (window.lucide) lucide.createIcons();
}

function showPaymentPanel(id) {
    selectedPaymentMethod = id;
    $$("#payment-list .item").forEach(el => {
        el.classList.toggle("is-active", el.dataset.id === id);
    });
    $$(".pm").forEach(p => p.classList.add("hidden"));

    const map = {
        card: "#pm-card", paypal: "#pm-paypal", paystack: "#pm-paystack",
        cashapp: "#pm-cashapp", bitcoin: "#pm-bitcoin", zelle: "#pm-zelle",
        venmo: "#pm-venmo", bank: "#pm-bank", check: "#pm-check"
    };
    const panel = $(map[id]);
    if (panel) panel.classList.remove("hidden");
}

/* ===== Donate Button ===== */
function refreshDonateButton() {
    const btn = $("#donate-btn");
    const label = $("#donate-btn-text");
    const amount = isRecurring
        ? ((selectedAmount ?? Number(customAmountMonthly)) || 0)
        : ((selectedAmount ?? Number(customAmountOneTime)) || 0);
    const can = donorName.trim() && /\S+@\S+\.\S+/.test(donorEmail) && amount > 0;
    btn.disabled = !can;
    label.textContent = `${isRecurring ? "Set Up Monthly" : "Donate"} ${money(amount)}`;
}

function handleDonate(e) {
    e.preventDefault();
    const amount = isRecurring
        ? ((selectedAmount ?? Number(customAmountMonthly)) || 0)
        : ((selectedAmount ?? Number(customAmountOneTime)) || 0);

    if (selectedPaymentMethod === "paystack") {
        const handler = PaystackPop.setup({
            key: "pk_test_xxxxxxxxxxxxxxxxxx", // replace with your key
            email: donorEmail || "donor@example.com",
            amount: amount * 100,
            currency: "NGN",
            ref: '' + Math.floor((Math.random() * 1000000000) + 1),
            callback: function(response) {
                alert(`Payment successful! Reference: ${response.reference}`);
            },
            onClose: function() {
                alert("Payment window closed.");
            }
        });
        handler.openIframe();
    } else {
        alert(`Thank you ${donorName} for donating ${money(amount)} via ${selectedPaymentMethod}!`);
    }
}

/* ===== Tabs ===== */
function setupTabs() {
    const triggers = $$(".tabs-trigger");
    triggers.forEach(tr => {
        tr.addEventListener("click", () => {
            triggers.forEach(t => t.classList.remove("is-active"));
            tr.classList.add("is-active");

            const contents = $$(".tabs-content");
            contents.forEach(c => c.classList.remove("is-active"));
            $(`[data-content="${tr.dataset.tab}"]`)?.classList.add("is-active");

            isRecurring = tr.dataset.tab === "recurring";
            selectedAmount = null;
            if (isRecurring) { customAmountOneTime = ""; $("#custom-amount").value = ""; }
            else { customAmountMonthly = ""; $("#custom-monthly").value = ""; }
            refreshDonateButton();
        });
    });
}

/* ===== Init ===== */
document.addEventListener("DOMContentLoaded", () => {
    renderCategories();
    renderQuickAmounts();
    renderPayments();
    setupTabs();

    if (window.lucide) lucide.createIcons();

    $("#custom-amount")?.addEventListener("input", e => {
        isRecurring = false;
        selectedAmount = null;
        customAmountOneTime = e.target.value;
        refreshDonateButton();
    });

    $("#custom-monthly")?.addEventListener("input", e => {
        isRecurring = true;
        selectedAmount = null;
        customAmountMonthly = e.target.value;
        refreshDonateButton();
    });

    $("#memorial-switch")?.addEventListener("change", e => {
        isMemorial = e.target.checked;
        $("#memorial-name-wrap")?.classList.toggle("hidden", !isMemorial);
    });

    $("#memorial-name")?.addEventListener("input", e => {
        memorialName = e.target.value;
    });

    $("#donor-name")?.addEventListener("input", e => {
        donorName = e.target.value;
        refreshDonateButton();
    });

    $("#donor-email")?.addEventListener("input", e => {
        donorEmail = e.target.value;
        refreshDonateButton();
    });

    $("#donate-btn")?.addEventListener("click", handleDonate);
});

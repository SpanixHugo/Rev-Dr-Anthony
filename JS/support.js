// support.js - improved amount + tab handling (replace the whole file with this)

document.addEventListener("DOMContentLoaded", () => {
  // --- Elements ---
  const donateBtn = document.getElementById("donate-btn");
  const donateText = document.getElementById("donate-btn-text");

  const selectedAmountInput = document.getElementById("selected-amount"); // hidden
  // optional: you may still have selected-payment; not used for amounts
  // const selectedPaymentInput = document.getElementById("selected-payment");

  const quickAmounts = Array.from(document.querySelectorAll(".quick-amount"));
  const customAmount = document.getElementById("custom-amount");   // one-time input
  const customMonthly = document.getElementById("custom-monthly"); // monthly input

  // Tabs & support type fields
  const tabs = Array.from(document.querySelectorAll(".tabs-trigger"));
  const contents = Array.from(document.querySelectorAll(".tabs-content"));
  const supportTypeInput = document.getElementById("support-type");
  const supportTypeOther = document.getElementById("support_type_other");

  // Utility: normalize numeric input (allow decimals)
  function normalizeAmount(val) {
    if (val == null) return 0;
    const s = String(val).replace(/[^\d.]/g, "");
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  }

  // Update donate button label and hidden selected amount
  function updateDonateLabel(amount) {
    const n = normalizeAmount(amount);
    if (donateText) {
      donateText.textContent = n > 0 ? `Support ${n}` : "Support";
    }
    if (donateBtn) {
      donateBtn.disabled = !(n > 0);
    }
    if (selectedAmountInput) {
      selectedAmountInput.value = n > 0 ? n : "";
    }
  }

  // Initialize from any existing hidden value (if present)
  if (selectedAmountInput && selectedAmountInput.value) {
    updateDonateLabel(selectedAmountInput.value);
  }

  // --- Quick amounts (if any) ---
  if (quickAmounts.length) {
    quickAmounts.forEach(q => {
      q.addEventListener("click", () => {
        quickAmounts.forEach(b => b.classList.remove("active"));
        q.classList.add("active");

        // clear custom inputs
        if (customAmount) customAmount.value = "";
        if (customMonthly) customMonthly.value = "";

        // parse digits from button text
        const val = q.textContent.replace(/[^0-9.]/g, "");
        updateDonateLabel(val);
      });
    });
  }

  // --- Custom inputs (one-time & monthly) ---
  if (customAmount) {
    customAmount.addEventListener("input", (e) => {
      quickAmounts.forEach(b => b.classList.remove("active"));
      updateDonateLabel(e.target.value);
    });
  }

  if (customMonthly) {
    customMonthly.addEventListener("input", (e) => {
      quickAmounts.forEach(b => b.classList.remove("active"));
      updateDonateLabel(e.target.value);
    });
  }

  // --- Tabs: switching and setting support type ---
  // Accept either data-tab values: 'recurring' or 'monthly' => Monthly
  const monthlyTokens = new Set(["recurring", "monthly"]);

  if (tabs.length && contents.length) {
    tabs.forEach(btn => {
      btn.addEventListener("click", () => {
        // toggle active tab classes
        tabs.forEach(b => b.classList.remove("is-active"));
        contents.forEach(c => c.classList.remove("is-active"));

        btn.classList.add("is-active");
        const content = document.querySelector(`[data-content="${btn.dataset.tab}"]`);
        if (content) content.classList.add("is-active");

        // reset quick amounts and visible custom inputs
        quickAmounts.forEach(b => b.classList.remove("active"));
        if (customAmount) customAmount.value = "";
        if (customMonthly) customMonthly.value = "";
        updateDonateLabel(0);

        // set support type in hidden fields
        const type = monthlyTokens.has(btn.dataset.tab) ? "Monthly" : "One-Time";
        if (supportTypeInput) supportTypeInput.value = type;
        if (supportTypeOther) supportTypeOther.value = type;
      });
    });
  }

  // --- Copy buttons (works per data-copy-target) ---
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const targetSel = btn.getAttribute("data-copy-target");
      const el = document.querySelector(targetSel);
      if (!el) return;
      const text = el.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        const old = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied';
        setTimeout(() => (btn.innerHTML = old), 1200);
      } catch (err) {
        console.error("Clipboard write failed", err);
      }
    });
  });

  // --- Alternative support panel toggle ---
  const altBtn = document.getElementById("alt-support-btn");
  const altPanel = document.getElementById("alt-support-panel");
  if (altBtn && altPanel) {
    altBtn.addEventListener("click", () => {
      altPanel.style.display = altPanel.style.display === "none" ? "block" : "none";
    });
  }

  // --- Ensure donate button visible state correctness on load ---
  // If page loads with a value in custom fields, reflect it:
  const initialOneTime = customAmount?.value;
  const initialMonthly = customMonthly?.value;
  if (initialOneTime) updateDonateLabel(initialOneTime);
  else if (initialMonthly) updateDonateLabel(initialMonthly);

  const donationForm = document.getElementById("donationForm");
  if (donationForm) {
    donationForm.addEventListener("submit", () => {
      // after submit, clear values
      if (customAmount) customAmount.value = "";
      if (customMonthly) customMonthly.value = "";
      if (selectedAmountInput) selectedAmountInput.value = "";

      quickAmounts.forEach(b => b.classList.remove("active"));
      updateDonateLabel(0);
    });
  }

}); // end DOMContentLoaded

  const donateBtn = document.getElementById("donate-btn");
  const donateText = document.getElementById("donate-btn-text");

  const selectedAreaInput = document.getElementById("selected-area");
  const selectedAmountInput = document.getElementById("selected-amount");
  const selectedPaymentInput = document.getElementById("selected-payment");

  const quickAmounts = document.querySelectorAll(".quick-amount");
  const customAmount = document.getElementById("custom-amount");
  const customMonthly = document.getElementById("custom-monthly");

  // CATEGORY SELECTION
  document.querySelectorAll("#category-list .item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll("#category-list .item").forEach(i => i.classList.remove("is-active"));
      item.classList.add("is-active");
      selectedAreaInput.value = item.innerText.trim();
    });
  });

  // UPDATE DONATE LABEL
  function updateDonateLabel(amount) {
    const n = Number(amount || 0);
    if (n > 0) {
      donateText.textContent = "Donate $" + n;
      donateBtn.disabled = false;
      selectedAmountInput.value = n;
    } else {
      donateText.textContent = "Donate $0";
      donateBtn.disabled = true;
      selectedAmountInput.value = "";
    }
  }

  // QUICK AMOUNTS
  quickAmounts.forEach(q => {
    q.addEventListener("click", () => {
      quickAmounts.forEach(b => b.classList.remove("active"));
      q.classList.add("active");
      if (customAmount) customAmount.value = "";
      if (customMonthly) customMonthly.value = "";
      let val = q.textContent.replace(/[^0-9]/g, "");
      updateDonateLabel(val);
    });
  });

  // CUSTOM ONE-TIME
  if (customAmount) {
    customAmount.addEventListener("input", e => {
      quickAmounts.forEach(b => b.classList.remove("active"));
      updateDonateLabel(e.target.value);
    });
  }

  // CUSTOM MONTHLY
  if (customMonthly) {
    customMonthly.addEventListener("input", e => {
      quickAmounts.forEach(b => b.classList.remove("active"));
      updateDonateLabel(e.target.value);
    });
  }

  // TAB SWITCHING
  const tabs = document.querySelectorAll(".tabs-trigger");
  const contents = document.querySelectorAll(".tabs-content");
  tabs.forEach(btn => btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("is-active"));
    contents.forEach(c => c.classList.remove("is-active"));
    btn.classList.add("is-active");
    document.querySelector(`[data-content="${btn.dataset.tab}"]`).classList.add("is-active");

    // reset amounts when switching
    quickAmounts.forEach(b => b.classList.remove("active"));
    if (customAmount) customAmount.value = "";
    if (customMonthly) customMonthly.value = "";
    updateDonateLabel(0);
  }));

  // PAYMENT METHODS + PANELS
  const paymentItems = document.querySelectorAll("#payment-list .item");
  const payPanels = document.querySelectorAll(".pay-panel");

  function togglePanel(method) {
    payPanels.forEach(p => {
      const show = p.dataset.panel === method;
      p.classList.toggle("is-active", show);
      // only active panel inputs are required
      p.querySelectorAll('input[data-req="panel"], select[data-req="panel"]').forEach(el => {
        el.required = show;
      });
    });
  }

  paymentItems.forEach(item => {
    item.addEventListener("click", () => {
      paymentItems.forEach(i => i.classList.remove("is-active"));
      item.classList.add("is-active");
      const method = item.dataset.method;
      selectedPaymentInput.value = method;
      togglePanel(method);
    });
  });

  // Initialize panels on load using the currently active method
  const activePayItem = document.querySelector("#payment-list .item.is-active");
  if (activePayItem) togglePanel(activePayItem.dataset.method);

  // Copy buttons
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetSel = btn.getAttribute("data-copy-target");
      const el = document.querySelector(targetSel);
      if (!el) return;
      const text = el.textContent.trim();
      navigator.clipboard.writeText(text).then(() => {
        const old = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied';
        setTimeout(() => (btn.innerHTML = old), 1200);
      });
    });
  });
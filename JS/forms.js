const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyDMfU_j0wuGboZmbHBPYDg6hW1lZGY3sK7o4gBjyQoKUnXGnVckUedz2nVnZ84muKw0w/exec";

// Safe fetch to handle local CORS issues
async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (err) {
    // Simulate success on localhost to avoid CORS errors
    if (location.hostname === "127.0.0.1" || location.hostname === "localhost") {
      console.warn("CORS blocked locally, simulating success:", err);
      return { status: "success" };
    }
    throw err;
  }
}

function handleFormSubmit(form, formType) {
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const formData = new FormData(form);
    formData.append("formType", formType);

    const data = {};
    formData.forEach((v, k) => data[k] = v);

    let statusBox = form.querySelector(".form-status");
    if (!statusBox) {
      statusBox = document.createElement("div");
      statusBox.className = "form-status";
      form.appendChild(statusBox);
    }
    statusBox.textContent = "⏳ Sending...";

    const submitBtn = form.querySelector("[type='submit']");
    if (submitBtn) submitBtn.disabled = true;

    try {
      const result = await safeFetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString()
      });

      if (result.status === "success") {
        statusBox.textContent = "✅ Form submitted successfully!";
        form.reset();
      } else {
        statusBox.textContent = "⚠️ Error: " + (result.message || "Unknown error");
      }
    } catch (err) {
      console.error("Form submit error:", err);
      statusBox.textContent = "❌ Network error, please try again later.";
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// Donation form interactive fields
function handleDonationInteractions() {
  // Category selection
  document.querySelectorAll("#category-list .item").forEach(item => {
    item.addEventListener("click", () => {
      document.getElementById("selected-area").value = item.textContent.trim();
      document.querySelectorAll("#category-list .item").forEach(i => i.classList.remove("is-active"));
      item.classList.add("is-active");
    });
  });

  // Amount selection
  document.querySelectorAll(".quick-amount").forEach(amount => {
    amount.addEventListener("click", () => {
      document.getElementById("selected-amount").value = amount.textContent.replace(/\D/g, '');
      document.querySelectorAll(".quick-amount").forEach(a => a.classList.remove("is-active"));
      amount.classList.add("is-active");
      updateDonateButtonText();
    });
  });

  // Custom amount input
  const customInput = document.querySelector("#custom-amount, #custom-monthly");
  if (customInput) {
    customInput.addEventListener("input", () => {
      document.getElementById("selected-amount").value = customInput.value;
      updateDonateButtonText();
    });
  }

  // Payment method selection
  document.querySelectorAll("#payment-list .item").forEach(method => {
    method.addEventListener("click", () => {
      document.getElementById("selected-payment").value = method.dataset.method;
      document.querySelectorAll("#payment-list .item").forEach(m => m.classList.remove("is-active"));
      method.classList.add("is-active");

      // Show relevant panel
      document.querySelectorAll(".pay-panel").forEach(panel => panel.classList.remove("is-active"));
      const panel = document.querySelector(`.pay-panel[data-panel="${method.dataset.method}"]`);
      if (panel) panel.classList.add("is-active");
    });
  });
}

// Update donate button text dynamically
function updateDonateButtonText() {
  const amount = document.getElementById("selected-amount").value || "0";
  const btnText = document.getElementById("donate-btn-text");
  if (btnText) btnText.textContent = `Donate $${amount}`;
  const donateBtn = document.getElementById("donate-btn");
  if (donateBtn) donateBtn.disabled = amount === "0";
}

document.addEventListener("DOMContentLoaded", () => {
  handleFormSubmit(document.getElementById("applicationForm"), "Applications");
  handleFormSubmit(document.querySelector(".contact-form"), "Contacts");
  handleFormSubmit(document.getElementById("bookingForm"), "Bookings");
  handleFormSubmit(document.getElementById("donationForm"), "Donations");
  handleDonationInteractions();
  updateDonateButtonText();
});

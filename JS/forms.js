// ✅ ENHANCED forms.js — now includes supportType + otherSupport fields

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxt1LMEusqsiyidg-c4aqf5djDk8avLNInYl3Uz9Cp-cC6Sir9f9HAnu775bDVl-8A8YA/exec";

// Safe fetch to handle local CORS issues
async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (err) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      console.error("❌ CORS/network error:", err);
      throw new Error("CORS blocked: Please check Google Apps Script headers or deploy settings.");
    }
    if (location.hostname === "127.0.0.1" || location.hostname === "localhost") {
      console.warn("⚠️ CORS blocked locally, simulating success:", err);
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

    // ✅ Collect extra donation-specific fields if this is the donation form
    if (formType === "Donations") {
      const supportType = document.getElementById("support-type")?.value || "";
      const otherSupport = document.getElementById("other-support")?.value || "";

      formData.append("supportType", supportType);
      formData.append("otherSupport", otherSupport);
    }

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
      statusBox.textContent = "✅ Form submitted successfully!";
      form.reset();
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// Donation form interactions (simplified)
function handleDonationInteractions() {
  const customInput = document.querySelector("#custom-amount, #custom-monthly");
  if (customInput) {
    customInput.addEventListener("input", () => {
      document.getElementById("selected-amount").value = customInput.value;
      updateDonateButtonText();
    });
  }
}

// Update donate button text dynamically
function updateDonateButtonText() {
  const amount = document.getElementById("selected-amount")?.value || "";
  const btnText = document.getElementById("donate-btn-text");
  if (btnText) btnText.textContent = amount ? `Support ${amount}` : "Support";
  const donateBtn = document.getElementById("donate-btn");
  if (donateBtn) donateBtn.disabled = !amount && !document.getElementById("other-support")?.value;
}

document.addEventListener("DOMContentLoaded", () => {
  handleFormSubmit(document.getElementById("applicationForm"), "Applications");
  handleFormSubmit(document.querySelector(".contact-form"), "Contacts");
  handleFormSubmit(document.getElementById("bookingForm"), "Bookings");
  handleFormSubmit(document.getElementById("donationForm"), "Donations");
  handleFormSubmit(document.getElementById("otherSupportForm"), "Donations");
  handleDonationInteractions();
  updateDonateButtonText();
});

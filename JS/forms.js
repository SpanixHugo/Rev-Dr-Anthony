const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw8ixV3_1lBN2u5r6R_8sAfIUejugtvbbY3Gm1Lle1xStistU6Oo8v5tvzEZHAOc_GWlQ/exec"; 

function handleFormSubmit(form, formType) {
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    formData.append("formType", formType);

    const data = {};
    formData.forEach((v,k)=> data[k]=v);

    // Status box
    let statusBox = form.querySelector(".form-status");
    if (!statusBox) {
      statusBox = document.createElement("div");
      statusBox.className = "form-status";
      form.appendChild(statusBox);
    }
    statusBox.textContent = "⏳ Sending...";
    
    const submitBtn = form.querySelector("[type='submit']");
    if(submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
      });

      if(!res.ok) throw new Error("HTTP "+res.status);

      const result = await res.json();
      if(result.status==="success") {
        statusBox.textContent="✅ Form submitted successfully!";
        form.reset();
      } else {
        statusBox.textContent="⚠️ Error: "+result.message;
      }

    } catch(err) {
      console.error("Form submit error:", err);
      statusBox.textContent="❌ Network error, please try again later.";
    } finally {
      if(submitBtn) submitBtn.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded",()=>{
  handleFormSubmit(document.getElementById("applicationForm"),"Applications");
  handleFormSubmit(document.querySelector(".contact-form"),"Contacts");
  handleFormSubmit(document.getElementById("bookingForm"),"Bookings");
  handleFormSubmit(document.getElementById("donationForm"),"Donations");
});

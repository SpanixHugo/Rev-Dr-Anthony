function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000); // wait up to 10s to avoid conflicts

    const ss = SpreadsheetApp.openById("YOUR_SHEET_ID"); // 🔹 replace with your Google Sheet ID
    const data = JSON.parse(e.postData.contents);
    const formType = data.formType || "Unknown";

    let sheet = ss.getSheetByName(formType);
    if (!sheet) sheet = ss.insertSheet(formType);

    let row = [new Date()]; // timestamp
    let tableRows = "";
    let senderEmail = data.email || data.donor_email || ""; // fallback

    // helper to add row to email body
    function addRow(label, value) {
      tableRows += `<tr><td style="padding:6px; font-weight:bold;">${label}</td><td style="padding:6px;">${value || ""}</td></tr>`;
    }

    switch (formType) {
      case "Donations":
        row.push(
          data.fullname || "",
          data.email || "",
          data.selected_area || "",
          data.gift_type || "",
          data.amount || "",
          data.selected_payment || "",
          data.payment_ref || ""
        );
        addRow("Form Type", "Donations");
        addRow("Full Name", data.fullname);
        addRow("Email", data.email);
        addRow("Ministry Area", data.selected_area);
        addRow("Gift Type", data.gift_type);
        addRow("Amount", data.amount);
        addRow("Payment Method", data.selected_payment);
        addRow("Payment Ref", data.payment_ref);
        break;

      case "Applications":
        row.push(
          data.fullname || "",
          data.email || "",
          data.phone || "",
          data.program || "",
          data.message || ""
        );
        addRow("Form Type", "Applications");
        addRow("Full Name", data.fullname);
        addRow("Email", data.email);
        addRow("Phone", data.phone);
        addRow("Program", data.program);
        addRow("Message", data.message);
        break;

      case "Contacts":
        row.push(
          data.name || "",
          data.email || "",
          data.subject || "",
          data.message || ""
        );
        addRow("Form Type", "Contacts");
        addRow("Name", data.name);
        addRow("Email", data.email);
        addRow("Subject", data.subject);
        addRow("Message", data.message);
        break;

      case "Bookings":
        row.push(
          data.name || "",
          data.email || "",
          data.phone || "",
          data.session || "",
          data.message || ""
        );
        addRow("Form Type", "Bookings");
        addRow("Full Name", data.name);
        addRow("Email", data.email);
        addRow("Phone", data.phone);
        addRow("Session", data.session);
        addRow("Notes", data.message);
        break;

      default:
        row.push(JSON.stringify(data));
        addRow("Raw Data", JSON.stringify(data, null, 2));
    }

    // ✅ Save in Google Sheet
    sheet.appendRow(row);

    // ✅ Styled email body
    const htmlBody = `
      <div style="font-family:Arial, sans-serif; line-height:1.5;">
        <h2 style="color:#2c3e50;">📩 New ${formType} Submission</h2>
        <table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse; width:100%; max-width:600px;">
          ${tableRows}
        </table>
        <p style="margin-top:15px; font-size:13px; color:#555;">This message was sent automatically from your website forms.</p>
      </div>
    `;

    // ✅ Send to admin
    MailApp.sendEmail({
      to: "toniezekwu@gmail.com",
      subject: `New ${formType} Submission`,
      htmlBody: htmlBody,
    });

    // ✅ Also send confirmation to sender if email exists
    if (senderEmail) {
      MailApp.sendEmail({
        to: senderEmail,
        subject: `We received your ${formType} submission`,
        htmlBody: `
          <div style="font-family:Arial, sans-serif; line-height:1.5;">
            <h2 style="color:#2c3e50;">✅ Thank you for your ${formType} submission</h2>
            <p>Here are the details you provided:</p>
            <table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse; width:100%; max-width:600px;">
              ${tableRows}
            </table>
            <p style="margin-top:15px; font-size:13px; color:#555;">We’ll get back to you shortly if needed.</p>
          </div>
        `,
      });
    }

    lock.releaseLock();

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

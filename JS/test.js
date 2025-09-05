const ADMIN_EMAIL = "spanixhugo@gmail.com";

function doGet(e) {
  return ContentService.createTextOutput("Google Apps Script running ✅")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    // Lock to prevent concurrent writes
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // Use URL-encoded data
    const data = e.parameter || {};
    const formType = data.formType || "Unknown";

    // Get or create sheet for this formType
    let sheet = ss.getSheetByName(formType);
    if (!sheet) sheet = ss.insertSheet(formType);

    // Get headers (or create if empty)
    let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (!headers || headers.length === 0) {
      headers = ["Timestamp", ...Object.keys(data).filter(k => k !== "formType")];
      sheet.appendRow(headers);
    }

    // Build row in the same order as headers
    const row = headers.map(h => h === "Timestamp" ? new Date() : data[h] || "");
    sheet.appendRow(row);

    // Send admin email notification
    const htmlBody = `<h2>New ${formType} Submission</h2>
      <table border="1" cellpadding="5" style="border-collapse:collapse;">
        ${Object.keys(data).map(k => `<tr><td><b>${k}</b></td><td>${data[k]}</td></tr>`).join("")}
      </table>`;
    MailApp.sendEmail({to: ADMIN_EMAIL, subject: `New ${formType} Submission`, htmlBody});

    lock.releaseLock();

    // Return JSON with CORS header
    return ContentService.createTextOutput(JSON.stringify({status:"success"}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");

  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status:"error", message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
}

// Optional: handle preflight requests for CORS
function doOptions() {
  return ContentService.createTextOutput()
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

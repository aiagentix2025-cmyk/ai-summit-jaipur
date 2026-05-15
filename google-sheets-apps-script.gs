const SPREADSHEET_ID = "1Huev9R4ncqKdl3e6TeiPcMqMASPEmaBZPllemHEJSog";
const SHEET_NAME = "Sheet1";

// Email configuration
const SENDER_NAME = "AGENTiX";
const SENDER_EMAIL = "aiagentix2025@gmail.com";
const NOTIFICATION_EMAIL = "aiagentix2025@gmail.com";

const COLUMNS = [
  "Name",
  "Company Name",
  "Industry",
  "Phone Number",
  "Email",
  "Budget Range",
  "Current Tools You Use",
  "What bottleneck do you want to solve?",
  "Preferred Timeline",
  "Timestamp" // Moved to end to not break existing columns A-I
];

/**
 * doGet – Primary handler. The frontend sends data as GET query params
 * because fetch with mode:"no-cors" is most reliable with GET requests.
 */
function doGet(e) {
  return handleSubmission(e);
}

/**
 * doPost – Fallback handler for backward compatibility.
 */
function doPost(e) {
  return handleSubmission(e);
}

function handleSubmission(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // Write header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS);
      sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
    }

    const params = (e && e.parameter) ? e.parameter : {};

    // Skip if no actual form data (just a health check)
    if (!params["Name"] && !params["Email"]) {
      return ContentService
        .createTextOutput("AGENTiX lead capture endpoint is active.")
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // Build the row
    const row = COLUMNS.map(function(col) {
      var val = params[col] || "";
      val = String(val).trim();
      // Prevent formula evaluation error for phone numbers
      if (col === "Phone Number" && val.startsWith("+")) {
        val = "'" + val;
      }
      return val;
    });

    sheet.appendRow(row);

    // Send confirmation email to the lead
    var leadEmail = (params["Email"] || "").trim();
    var leadName = (params["Name"] || "there").trim();

    if (leadEmail && leadEmail.indexOf("@") > -1) {
      sendConfirmationEmail(leadEmail, leadName, params);
    }

    // Send notification to AGENTiX team
    sendTeamNotification(params);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error: " + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Send confirmation email to the person who submitted the form
 */
function sendConfirmationEmail(email, name, data) {
  try {
    var subject = "AGENTiX // Bottleneck Analysis Initiated";
    var htmlBody = '<!DOCTYPE html><html><body style="font-family:\'Inter\',-apple-system,BlinkMacSystemFont,sans-serif;background-color:#0d1117;margin:0;padding:40px 20px;">'
      + '<div style="max-width:600px;margin:0 auto;background-color:#1a1f2b;border:1px solid #3d4450;border-radius:12px;overflow:hidden;">'
      // Header
      + '<div style="padding:40px 40px 32px;text-align:center;border-bottom:1px solid #3d4450;">'
      + '<h1 style="color:#f37021;font-size:28px;font-weight:900;letter-spacing:-0.02em;margin:0;">AGENTiX</h1>'
      + '<p style="color:#9ca3af;font-size:12px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;margin:12px 0 0;">System Diagnostics Active</p>'
      + '</div>'
      // Body
      + '<div style="padding:40px;">'
      + '<p style="font-size:16px;color:#f3f4f6;margin:0 0 24px;">Hi ' + name + ',</p>'
      + '<p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 24px;">Your operational bottleneck has been securely logged into the AGENTiX core. Our team is analyzing the data to architect an AI-powered execution layer for your business.</p>'
      
      // Status block
      + '<div style="background-color:#0d1117;border:1px solid #3d4450;border-radius:8px;padding:24px;margin-bottom:32px;">'
      + '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">'
      + '<tr><td style="padding-bottom:12px;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;" width="120">Status</td><td style="padding-bottom:12px;color:#10b981;font-weight:700;font-size:14px;">● PROCESSING</td></tr>'
      + '<tr><td style="padding-bottom:12px;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Company</td><td style="padding-bottom:12px;color:#f3f4f6;font-size:14px;font-weight:600;">' + (data["Company Name"] || "—") + '</td></tr>'
      + '<tr><td style="color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Target</td><td style="color:#f3f4f6;font-size:14px;font-weight:600;">' + (data["What bottleneck do you want to solve?"] || "—") + '</td></tr>'
      + '</table>'
      + '</div>'

      // Next steps
      + '<h3 style="color:#f3f4f6;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 16px;">Next Execution Steps:</h3>'
      + '<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">'
      + '<tr><td width="24" valign="top" style="color:#f37021;font-weight:bold;padding-bottom:12px;">01</td><td style="color:#d1d5db;font-size:14px;line-height:1.5;padding-bottom:12px;">Deep dive review of your current workflow and tech stack.</td></tr>'
      + '<tr><td width="24" valign="top" style="color:#f37021;font-weight:bold;padding-bottom:12px;">02</td><td style="color:#d1d5db;font-size:14px;line-height:1.5;padding-bottom:12px;">Discovery call to map out the exact AI architecture required.</td></tr>'
      + '<tr><td width="24" valign="top" style="color:#f37021;font-weight:bold;">03</td><td style="color:#d1d5db;font-size:14px;line-height:1.5;">Deployment of custom agents, dashboards, and automations.</td></tr>'
      + '</table>'
      
      + '<p style="color:#9ca3af;font-size:14px;margin:0;">Expect a direct communication from our engineering team within 24 hours.</p>'
      + '</div>'
      
      // Footer
      + '<div style="background-color:#071d2b;padding:24px 40px;text-align:center;border-top:1px solid #3d4450;">'
      + '<p style="color:#f37021;font-weight:700;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px;">Problem first. AI second. Execution always.</p>'
      + '<p style="color:#6b7280;font-size:11px;margin:0;">© 2026 AGENTiX Enterprise Solutions. All rights reserved.</p>'
      + '</div>'
      
      + '</div></body></html>';

    GmailApp.sendEmail(email, subject, "", {
      htmlBody: htmlBody,
      name: SENDER_NAME
    });
  } catch (err) {
    Logger.log("Email to lead failed: " + err.message);
  }
}

/**
 * Send notification email to AGENTiX team
 */
function sendTeamNotification(data) {
  try {
    var subject = "🔥 New Lead: " + (data["Name"] || "Unknown") + " — " + (data["Company Name"] || "Unknown Company");
    var body = "NEW BOTTLENECK SUBMISSION\n"
      + "========================\n\n"
      + "Name: " + (data["Name"] || "") + "\n"
      + "Company: " + (data["Company Name"] || "") + "\n"
      + "Industry: " + (data["Industry"] || "") + "\n"
      + "Phone: " + (data["Phone Number"] || "") + "\n"
      + "Email: " + (data["Email"] || "") + "\n"
      + "Budget: " + (data["Budget Range"] || "") + "\n"
      + "Tools: " + (data["Current Tools You Use"] || "") + "\n"
      + "Bottleneck: " + (data["What bottleneck do you want to solve?"] || "") + "\n"
      + "Timeline: " + (data["Preferred Timeline"] || "") + "\n"
      + "Submitted: " + (data["Timestamp"] || new Date().toISOString()) + "\n";

    GmailApp.sendEmail(NOTIFICATION_EMAIL, subject, body, {
      name: SENDER_NAME,
      from: SENDER_EMAIL
    });
  } catch (err) {
    Logger.log("Team notification failed: " + err.message);
  }
}

/** Test function — run from Apps Script editor */
function testAppendRow() {
  var e = {
    parameter: {
      "Name": "Test User",
      "Company Name": "Test Corp",
      "Industry": "Healthcare",
      "Phone Number": "+91 98765 43210",
      "Email": "test@example.com",
      "Budget Range": "2L-5L",
      "Current Tools You Use": "CRM, WhatsApp",
      "What bottleneck do you want to solve?": "Testing the form submission flow",
      "Preferred Timeline": "This week",
      "Timestamp": new Date().toLocaleString()
    }
  };
  handleSubmission(e);
  Logger.log("Test completed — check sheet + emails");
}

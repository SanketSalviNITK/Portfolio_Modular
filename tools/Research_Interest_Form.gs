/**********************************************************************
 * Research Interest Form — receiver (Google Apps Script web app)
 * --------------------------------------------------------------------
 * research.html posts the "Join my research" form here; each submission
 * becomes one row in the "Interest" tab of the Sheet this script is bound
 * to, and (optionally) you get an email for each one.
 *
 * HOW TO INSTALL (once, about 5 minutes)
 *   1. Create a new Google Sheet, e.g. "Research Interest". It stays private.
 *   2. Extensions ▸ Apps Script. Delete any sample code, paste THIS file. Save.
 *   3. Deploy ▸ New deployment ▸ type "Web app".
 *        Execute as:     Me
 *        Who has access: Anyone
 *      Deploy, and allow the permissions it asks for (Sheets, and Gmail if
 *      NOTIFY is true).
 *   4. Copy the Web app URL (ends in /exec) into data/research.json as
 *      "interestFormUrl", commit and push.
 *   "Anyone" only lets the site SEND a row; nobody can read the Sheet.
 *   After editing this file, use Deploy ▸ Manage deployments ▸ Edit ▸
 *   New version, so the URL stays the same.
 **********************************************************************/

var SHEET_NAME = "Interest";
var NOTIFY = true;                  // email the script owner for every submission
var HEADERS = ["Received", "Name", "Affiliation", "Email", "Phone", "Domain", "Project", "Message", "Consent", "Page"];
var LIMITS = { name: 120, affiliation: 200, email: 200, phone: 40, domain: 120, project: 200, message: 2000 };

function doPost(e) {
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (d.website) return reply({ ok: true });              // honeypot: bots fill the hidden field
    var f = {};
    for (var k in LIMITS) f[k] = String(d[k] || "").trim().slice(0, LIMITS[k]);
    if (!f.name || !f.affiliation || !f.domain) return reply({ ok: false, error: "Please fill in your name, affiliation and domain." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return reply({ ok: false, error: "Please enter a valid email address." });
    if (d.consent !== true) return reply({ ok: false, error: "Please agree to be contacted." });

    // one submission per email address per 10 minutes, to keep out floods
    var cache = CacheService.getScriptCache(), key = "seen:" + f.email.toLowerCase();
    if (cache.get(key)) return reply({ ok: true });
    cache.put(key, "1", 600);

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = sheetFor();
      sheet.appendRow([new Date(), f.name, f.affiliation, f.email, f.phone, f.domain, f.project, f.message, "Yes",
                       String(d.page || "").slice(0, 200)].map(safe));
    } finally {
      lock.releaseLock();
    }
    if (NOTIFY) {
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(), "Research interest: " + f.name + " (" + f.domain + ")",
        "Name: " + f.name + "\nAffiliation: " + f.affiliation + "\nEmail: " + f.email + "\nPhone: " + (f.phone || "-") +
        "\nDomain: " + f.domain + "\nProject: " + (f.project || "-") + "\n\n" + (f.message || ""), { replyTo: f.email });
    }
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: "Something went wrong. Please email instead." });
  }
}

function sheetFor() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

// a cell that starts with = + - @ would run as a formula in the Sheet
function safe(v) {
  return typeof v === "string" && /^[=+\-@]/.test(v) ? "'" + v : v;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

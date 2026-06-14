/**********************************************************************
 * Salvi Résumé — JSON Generator (Google Apps Script)
 * --------------------------------------------------------------------
 * Reads the master workbook and produces privacy-filtered outputs:
 *   • resume-data.json   → only rows ticked "On Website"  (for the site)
 *   • resume-cv.json     → only rows ticked "In Résumé"   (downloadable résumé view)
 *   • niit-form.json     → only rows ticked "In NIT/IIT Form" (credit-point view)
 *
 * PRIVACY: a row is emitted to an output ONLY if its matching OUTPUT
 * checkbox is TRUE. Untouched/blank = excluded. Sensitive tabs default
 * to NOT "On Website", so private data never reaches the public site.
 *
 * HOW TO INSTALL
 *   1. Open your Google Sheet (imported from Salvi_Master_Resume_Data.xlsx).
 *   2. Extensions ▸ Apps Script. Delete any sample code, paste THIS file.
 *   3. Save. Reload the Sheet — a new menu "Résumé Tools" appears.
 *   4. Use:  Résumé Tools ▸ Generate Website JSON  (downloads / shows JSON).
 *
 * The header row is row 2; data starts at row 3 (row 3 may be the sample row).
 **********************************************************************/

/* ---- fixed tag vocabularies (must match the workbook headers) ---- */
var OUTPUTS = ["On Website", "In Résumé", "In NIT/IIT Form"];
var MARKERS = ["Laptop","Li-Fi Rig","Field Hardware","Lecture Notes","VR Headset",
               "Patents","Awards","Credentials","3D Printer","Humanoid","Robotic Arm",
               "IoT Testbed","Drone","Hobbies","Journals","Chapters","Conferences",
               "Scanner","Server"];
var TOPICS  = ["Li-Fi","VLC","IoT","AI/ML","Computer Vision","Healthcare","Full-Stack",
               "Blockchain","AR/VR","Robotics"];
var HEADER_ROW = 2;
var DATA_START = 3;
var SAMPLE_HINT = "‹ sample row";   // skip the template's sample row if present

/* ---- which tabs feed which website marker section (grouping) ---- */
/* The site groups items by their ticked MARKER columns; this map is only
   used to give each emitted item a stable "section" label as a convenience. */

/* read the singleton Profile tab (key→value) into an object */
function readProfile() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Profile");
  if (!sheet) return null;
  var last = sheet.getLastRow();
  if (last < 3) return null;
  var rows = sheet.getRange(3, 1, last - 2, 2).getValues();
  var kv = {};
  rows.forEach(function (r) {
    var k = (r[0] == null ? "" : String(r[0]).trim());
    if (k) kv[k] = (r[1] == null ? "" : String(r[1]).trim());
  });
  function collect(prefix, aKey, bKey, outKeys) {
    var arr = [];
    for (var i = 1; i <= 6; i++) {
      var a = kv[prefix + " " + i + " " + aKey];
      var b = kv[prefix + " " + i + " " + bKey];
      if ((a && a !== "") || (b && b !== "")) {
        var o = {}; o[outKeys[0]] = a || ""; o[outKeys[1]] = b || ""; arr.push(o);
      }
    }
    return arr;
  }
  return {
    header: {
      name: kv["Name"] || "",
      title: kv["Title line"] || "",
      location: kv["Location"] || "",
      email: kv["Email"] || "",
      links: collect("Link", "label", "URL", ["label", "url"])
    },
    summary: {
      text: kv["Summary"] || "",
      counts: collect("Count", "value", "label", ["value", "label"])
    },
    publications: { metrics: kv["Publications metrics line"] || "" }
  };
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Résumé Tools")
    .addItem("Generate Website JSON", "generateWebsiteJSON")
    .addItem("Generate Résumé (CV) JSON", "generateResumeJSON")
    .addItem("Generate NIT/IIT Form JSON", "generateNiitJSON")
    .addToUi();
}

/* core: read every category tab, return array of row-objects with tags */
function readAllRows() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var out = [];
  ss.getSheets().forEach(function (sheet) {
    var name = sheet.getName();
    if (name === "READ ME" || name === "Profile") return;
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < DATA_START || lastCol < 1) return;

    var headers = sheet.getRange(HEADER_ROW, 1, 1, lastCol).getValues()[0];
    var values  = sheet.getRange(DATA_START, 1, lastRow - DATA_START + 1, lastCol).getValues();

    // index helper
    function colIdx(h) { return headers.indexOf(h); }

    // content columns = everything before the first OUTPUT column
    var firstOut = lastCol;
    OUTPUTS.forEach(function (o) { var i = colIdx(o); if (i > -1 && i < firstOut) firstOut = i; });
    var contentHeaders = headers.slice(0, firstOut);

    values.forEach(function (row) {
      // skip the sample/template row and fully empty rows
      var firstCell = (row[0] == null ? "" : String(row[0]));
      if (firstCell.indexOf(SAMPLE_HINT) === 0) return;
      var hasContent = contentHeaders.some(function (h, i) {
        return row[i] != null && String(row[i]).trim() !== "";
      });
      if (!hasContent) return;

      // build content object
      var content = {};
      contentHeaders.forEach(function (h, i) {
        if (h && row[i] != null && String(row[i]).trim() !== "") content[h] = row[i];
      });

      // read tags
      function isTrue(h) { var i = colIdx(h); return i > -1 && truthy(row[i]); }
      var outputs = OUTPUTS.filter(isTrue);
      var markers = MARKERS.filter(isTrue);
      var topics  = TOPICS.filter(isTrue);
      var extraI  = colIdx("Extra Topics");
      if (extraI > -1 && row[extraI] != null && String(row[extraI]).trim() !== "") {
        String(row[extraI]).split(/[,;]+/).forEach(function (t) {
          t = t.trim(); if (t) topics.push(t);
        });
      }

      out.push({
        category: name,
        content: content,
        outputs: outputs,
        markers: markers,
        topics: topics
      });
    });
  });
  return out;
}

function truthy(v) {
  if (v === true) return true;
  if (typeof v === "number") return v === 1;
  var s = String(v).trim().toLowerCase();
  return s === "true" || s === "yes" || s === "✓" || s === "x" || s === "1";
}

/* ---- builders for each output, filtered by the matching checkbox ---- */
function buildFiltered(flag) {
  var rows = readAllRows().filter(function (r) { return r.outputs.indexOf(flag) > -1; });
  // group by category, attach markers/topics per item
  var byCategory = {};
  rows.forEach(function (r) {
    (byCategory[r.category] = byCategory[r.category] || []).push({
      content: r.content, markers: r.markers, topics: r.topics
    });
  });
  // also group by marker (useful for the 3D dossiers)
  var byMarker = {};
  rows.forEach(function (r) {
    r.markers.forEach(function (m) {
      (byMarker[m] = byMarker[m] || []).push({ category: r.category, content: r.content, topics: r.topics });
    });
  });
  return {
    meta: {
      generated: new Date().toISOString(),
      source: SpreadsheetApp.getActiveSpreadsheet().getName(),
      filter: flag,
      itemCount: rows.length
    },
    profile: readProfile(),
    byCategory: byCategory,
    byMarker: byMarker,
    items: rows.map(function (r) { return { category: r.category, content: r.content, markers: r.markers, topics: r.topics }; })
  };
}

function showJSON(title, obj) {
  var json = JSON.stringify(obj, null, 2);
  var safe = json.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  var html = HtmlService.createHtmlOutput(
    '<p style="font:13px Arial">'+obj.meta.itemCount+' items · filter: <b>'+obj.meta.filter+
    '</b>. Copy the JSON below (or use the button) and commit it to your repo.</p>' +
    '<textarea id="t" style="width:100%;height:420px;font:12px monospace">'+safe+'</textarea>' +
    '<div style="margin-top:8px">' +
    '<button onclick="navigator.clipboard.writeText(document.getElementById(\'t\').value);this.textContent=\'Copied!\'">Copy to clipboard</button>' +
    '<button onclick="var b=new Blob([document.getElementById(\'t\').value],{type:\'application/json\'});var a=document.createElement(\'a\');a.href=URL.createObjectURL(b);a.download=\''+title+'\';a.click()" style="margin-left:8px">Download '+title+'</button>' +
    '</div>'
  ).setWidth(760).setHeight(560);
  SpreadsheetApp.getUi().showModalDialog(html, "Generated: " + title);
}

function generateWebsiteJSON() { showJSON("resume-data.json", buildFiltered("On Website")); }
function generateResumeJSON()  { showJSON("resume-cv.json",   buildFiltered("In Résumé")); }
function generateNiitJSON()    { showJSON("niit-form.json",   buildFiltered("In NIT/IIT Form")); }

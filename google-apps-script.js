// ═══════════════════════════════════════
// TECHPICK — Google Apps Script
// Paste this in your Google Sheet's
// Extensions → Apps Script editor
// ═══════════════════════════════════════

const SHEET_NAME = 'Posts'; // Name of your sheet tab

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'get') return getPosts();
  return jsonResponse({ error: 'Unknown action' });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.action === 'append') return appendPost(body.row);
  if (body.action === 'delete') return deletePost(body.index);
  return jsonResponse({ error: 'Unknown action' });
}

function getPosts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return jsonResponse({ posts: [] });

  const posts = rows.slice(1).map(r => ({
    date:  r[0] || '',
    type:  r[1] || 'deal',
    title: r[2] || '',
    desc:  r[3] || '',
    price: r[4] || '',
    link:  r[5] || '#',
    img:   r[6] || '',
    tags:  r[7] || ''
  }));

  return jsonResponse({ posts });
}

function appendPost(row) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sheet.appendRow(row);
  return jsonResponse({ success: true });
}

function deletePost(index) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  // +2 because: 1 for header row, 1 because Sheets rows are 1-indexed
  sheet.deleteRow(index + 2);
  return jsonResponse({ success: true });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

const SHEET_ID = '1fN3PCCz82KzXFNBpuJadoa1TUxyTyVasoNHOfTPiins';
const SHEET_NAME = 'Details';
const FOLDER_ID = '1Qiv2Bhm3k7j_Ucs-lctFH_asmU-O5UDn';

// รับ POST request จาก GitHub Pages
function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);

  sheet.appendRow([
    new Date().toLocaleDateString('th-TH'),
    data.type,
    data.category,
    data.description,
    parseFloat(data.amount),
    data.imageUrl || '-'
  ]);

  // อนุญาตให้ GitHub Pages เรียกได้ (CORS)
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'บันทึกสำเร็จ' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// รับ GET request ดึงสรุปยอด
function doGet(e) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  let income = 0, expense = 0;
  for (let i = 1; i < data.length; i++) {
    const amount = parseFloat(data[i][4]) || 0;
    if (data[i][1] === 'รายรับ') income += amount;
    else expense += amount;
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      income: income,
      expense: expense,
      balance: income - expense
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function uploadReceiptImage(base64Data, fileName) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const blob = Utilities.newBlob(
    Utilities.base64Decode(base64Data),
    'image/jpeg',
    fileName
  );
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

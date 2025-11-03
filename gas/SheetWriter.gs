// ============================================
// 📝 SheetWriter.gs - Sheet 写入模块
// ============================================

/**
 * 写入数据到 Google Sheet
 * @param {string} date - 日期
 * @param {number} amount - 金额
 * @param {string} store - 店名
 * @param {string} taxRate - 税率
 * @param {string} hasTNumber - T番号
 * @param {string} ocrText - OCR 原文
 * @param {number} confidence - 置信度
 */
function writeToSheet(date, amount, store, taxRate, hasTNumber, ocrText, confidence) {
  debugLog('开始写入 Sheet');
  
  try {
    var sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getActiveSheet();
    
    // 确定状态
    var status = getStatus(confidence);
    
    // 写入数据（新表头：日期 | 金额 | 店名 | 税率 | T番号 | OCR原文 | 状态）
    sheet.appendRow([
      date,
      amount,
      store,
      taxRate,
      hasTNumber,
      ocrText.substring(0, 500),  // 限制长度
      status
    ]);
    
    debugLog('✅ 数据已写入 Sheet');
    
  } catch (error) {
    debugLog('❌ 写入 Sheet 失败: ' + error.toString());
    throw new Error('写入 Sheet 失败: ' + error.message);
  }
}

/**
 * 根据置信度确定状态
 */
function getStatus(confidence) {
  if (confidence >= CONFIG.CONFIDENCE_THRESHOLD.HIGH) {
    return `✅ 识别成功 (${confidence}%)`;
  } else if (confidence >= CONFIG.CONFIDENCE_THRESHOLD.MEDIUM) {
    return `⚠️ 需复核 (${confidence}%)`;
  } else {
    return `❌ 识别失败 (${confidence}%)`;
  }
}

/**
 * 测试 Sheet 写入
 */
function testSheetWrite() {
  try {
    Logger.log('🧪 开始测试 Sheet 写入...');
    
    const testDate = new Date().toLocaleDateString('ja-JP');
    const testText = 'これはテストデータです\nTest Data';
    const testConfidence = 85;
    
    writeToSheet(testDate, testText, testConfidence);
    
    Logger.log('✅ Sheet 写入测试成功！');
    Logger.log('请检查你的 Google Sheet 是否有新数据');
    return true;
    
  } catch (error) {
    Logger.log('❌ Sheet 写入测试失败: ' + error.toString());
    Logger.log('请检查：');
    Logger.log('1. SHEET_ID 是否正确');
    Logger.log('2. 是否有 Sheet 编辑权限');
    return false;
  }
}
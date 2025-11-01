// ============================================
// 🚀 Code.gs - 主入口
// ============================================

/**
 * GET 请求测试端点
 */
function doGet(e) {
  debugLog('收到 GET 请求');
  
  return HtmlService.createHtmlOutput('<html><body>' +
    '<h1>📸 收据识别 API</h1>' +
    '<p>✅ 服务运行正常</p>' +
    '<p>部署时间: ' + new Date().toISOString() + '</p>' +
    '</body></html>');
}

/**
 * Web App 入口：接收 POST 请求
 */
function doPost(e) {
  var startTime = new Date().getTime();
  
  try {
    debugLog('========== 收到新请求 ==========');
    
    // 验证输入
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('无效的请求数据');
    }
    
    // 解析请求
    var params = JSON.parse(e.postData.contents);
    
    // 验证 token
    if (!params.token || params.token !== CONFIG.SECRET_TOKEN) {
      debugLog('❌ Token 验证失败');
      return createResponse({ success: false, error: '无效的 token' });
    }
    
    // 解码图片
    if (!params.image_base64) {
      throw new Error('缺少图片数据');
    }
    
    var base64Data = params.image_base64;
    if (base64Data.indexOf(',') !== -1) {
      base64Data = base64Data.split(',')[1];
    }
    
    var imageBytes = Utilities.base64Decode(base64Data);
    debugLog('图片大小: ' + imageBytes.length + ' bytes');
    
    if (imageBytes.length < 100) {
      throw new Error('图片数据太小');
    }
    
    // OCR 识别
    var ocrStartTime = new Date().getTime();
    var ocrText = callVisionAPI(imageBytes);
    var ocrDuration = new Date().getTime() - ocrStartTime;
    debugLog('⏱️ OCR 耗时: ' + ocrDuration + 'ms');
    
    // 解析字段
    var parsed = parseReceipt(ocrText);
    
    // 写入 Sheet
    writeToSheet(parsed.date, ocrText, parsed.confidence);
    
    // 总耗时
    var totalDuration = new Date().getTime() - startTime;
    debugLog('⏱️ 总耗时: ' + totalDuration + 'ms');
    debugLog('========== 处理完成 ==========');
    
    // 返回结果
    return createResponse({
      success: true,
      result: {
        date: parsed.date,
        amount: parsed.amount,
        store: parsed.store,
        taxRate: parsed.taxRate,
        hasTNumber: parsed.hasTNumber,
        confidence: parsed.confidence + '%'
      },
      performance: {
        ocrTime: ocrDuration + 'ms',
        totalTime: totalDuration + 'ms'
      }
    });
    
  } catch (error) {
    debugLog('❌ 处理失败: ' + error.toString());
    
    return createResponse({
      success: false,
      error: error.toString(),
      errorType: error.name
    });
  }
}

/**
 * 创建 HTTP 响应
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 测试整个流程
 */
function testFullFlow() {
  Logger.log('🧪 开始测试完整流程...');
  Logger.log('');
  
  // 测试 Vision API
  Logger.log('1️⃣ 测试 Vision API...');
  if (!testVisionAPI()) {
    Logger.log('❌ Vision API 测试失败');
    return;
  }
  Logger.log('');
  
  // 测试 Sheet 写入
  Logger.log('2️⃣ 测试 Sheet 写入...');
  if (!testSheetWrite()) {
    Logger.log('❌ Sheet 写入测试失败');
    return;
  }
  Logger.log('');
  
  // 测试解析
  Logger.log('3️⃣ 测试解析逻辑...');
  var testText = 'セブンイレブン\n2024年10月25日\n合計 ¥1,250\nT1234567890123';
  var parsed = parseReceipt(testText);
  Logger.log('解析结果: ' + JSON.stringify(parsed, null, 2));
  Logger.log('');
  
  Logger.log('✅ 所有测试通过！');
}

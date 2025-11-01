// ============================================
// 👁️ VisionAPI.gs - OCR 识别模块
// ============================================

/**
 * 调用 Google Cloud Vision API
 * @param {Byte[]} imageBytes - 图片字节数组
 * @return {string} OCR 识别文本
 */
function callVisionAPI(imageBytes) {
  debugLog('开始调用 Vision API');
  debugLog('图片大小: ' + imageBytes.length + ' bytes');
  
  var url = 'https://vision.googleapis.com/v1/images:annotate?key=' + CONFIG.VISION_API_KEY;
  
  var payload = {
    requests: [{
      image: { content: Utilities.base64Encode(imageBytes) },
      features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
      imageContext: {
        languageHints: ['ja', 'en']  // 支持日文和英文
      }
    }]
  };
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    var statusCode = response.getResponseCode();
    var responseText = response.getContentText();
    
    debugLog('API 状态码: ' + statusCode);
    
    if (statusCode !== 200) {
      throw new Error('API 请求失败 (HTTP ' + statusCode + '): ' + responseText);
    }
    
    var result = JSON.parse(responseText);
    
    // 检查响应结构
    if (!result.responses || !result.responses[0]) {
      throw new Error('API 响应格式错误: ' + responseText);
    }
    
    // 检查是否有错误
    if (result.responses[0].error) {
      var error = result.responses[0].error;
      throw new Error('Vision API 错误: ' + error.message + ' (代码: ' + error.code + ')');
    }
    
    // 获取文本
    var text = result.responses[0].fullTextAnnotation ? 
               result.responses[0].fullTextAnnotation.text : '';
    
    if (!text) {
      debugLog('⚠️ 未识别到任何文字');
      return '';
    }
    
    debugLog('✅ OCR 成功，识别到 ' + text.length + ' 个字符');
    
    return text;
    
  } catch (error) {
    debugLog('❌ Vision API 调用失败: ' + error.toString());
    throw error;
  }
}

/**
 * 测试 Vision API 配置
 */
function testVisionAPI() {
  try {
    // 创建一个测试图片（1x1 像素）
    var testImage = Utilities.base64Decode(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    );
    
    Logger.log('🧪 开始测试 Vision API...');
    var result = callVisionAPI(testImage);
    Logger.log('✅ Vision API 配置正确！');
    return true;
    
  } catch (error) {
    Logger.log('❌ Vision API 测试失败: ' + error.toString());
    Logger.log('请检查：');
    Logger.log('1. API Key 是否正确');
    Logger.log('2. Vision API 是否已启用');
    Logger.log('3. 是否已绑定信用卡');
    return false;
  }
}

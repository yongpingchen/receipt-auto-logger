// ============================================
// 🚀 Code.gs - 主入口
// ============================================

/**
 * GET 请求测试端点（用于验证部署）
 */
function doGet(e) {
  debugLog('收到 GET 请求');
  
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>收据识别 API</title>
      <style>
        body {
          font-family: -apple-system, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .card {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #667eea; }
        .status { 
          color: #28a745; 
          font-size: 24px;
          font-weight: bold;
        }
        .info {
          margin: 20px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 5px;
          font-size: 14px;
        }
        code {
          background: #e9ecef;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>📸 收据自动识别 API</h1>
        <div class="status">✅ 服务运行正常</div>
        
        <div class="info">
          <p><strong>部署时间:</strong> ${new Date().toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})}</p>
          <p><strong>API 版本:</strong> v1.0</p>
          <p><strong>调试模式:</strong> ${CONFIG.DEBUG_MODE ? '开启' : '关闭'}</p>
        </div>
        
        <div class="info">
          <p><strong>使用方法:</strong></p>
          <p>发送 POST 请求到此 URL，包含以下参数：</p>
          <pre style="background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 5px; overflow-x: auto;">
{
  "token": "your_token",
  "image_base64": "base64_encoded_image"
}</pre>
        </div>
        
        <div class="info">
          <p><strong>测试步骤:</strong></p>
          <ol>
            <li>打开手机测试页面</li>
            <li>输入此 URL</li>
            <li>输入 token: <code>${CONFIG.SECRET_TOKEN}</code></li>
            <li>拍摄收据并上传</li>
          </ol>
        </div>
      </div>
    </body>
    </html>
  `);
}

/**
 * Web App 入口：接收 POST 请求
 */
function doPost(e) {
  // 记录开始时间
  const startTime = new Date().getTime();
  
  // 最外层错误捕获，确保始终返回 JSON
  try {
    // 检查请求数据
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('无效的请求数据');
    }
    
    debugLog('========== 收到新请求 ==========');
    debugLog('请求内容长度: ' + e.postData.contents.length);
    
    // 1. 解析请求
    let params;
    try {
      params = JSON.parse(e.postData.contents);
    } catch (parseError) {
      throw new Error('JSON 解析失败: ' + parseError.message);
    }
    
    // 2. 验证 token
    if (!params.token) {
      throw new Error('缺少 token 参数');
    }
    if (params.token !== CONFIG.SECRET_TOKEN) {
      debugLog('❌ Token 验证失败');
      return createResponse({ error: '无效的 token' });
    }
    
    // 3. 验证图片数据
    if (!params.image_base64) {
      throw new Error('缺少图片数据');
    }
    
    // 3. 解码图片
    debugLog('Base64 字符串长度: ' + params.image_base64.length);
    debugLog('Base64 前 50 字符: ' + params.image_base64.substring(0, 50));
    
    // 检查是否包含 data:image 前缀
    let base64Data = params.image_base64;
    if (base64Data.includes(',')) {
      debugLog('⚠️ 检测到 data URL 前缀，正在移除...');
      base64Data = base64Data.split(',')[1];
    }
    
    let imageBytes;
    try {
      imageBytes = Utilities.base64Decode(base64Data);
    } catch (decodeError) {
      throw new Error('Base64 解码失败: ' + decodeError.message);
    }
    
    debugLog('图片大小: ' + imageBytes.length + ' bytes');
    
    // 验证图片大小合理性
    if (imageBytes.length < 100) {
      throw new Error('图片数据太小（' + imageBytes.length + ' bytes），可能解码失败');
    }
    if (imageBytes.length > 10 * 1024 * 1024) {
      throw new Error('图片太大（' + Math.round(imageBytes.length / 1024 / 1024) + 'MB），请压缩后上传');
    }
    
    // 4. OCR 识别
    const ocrStartTime = new Date().getTime();
    debugLog('⏱️ 开始 OCR 识别...');
    const ocrText = callVisionAPI(imageBytes);
    const ocrDuration = new Date().getTime() - ocrStartTime;
    debugLog('⏱️ OCR 完成，耗时: ' + ocrDuration + 'ms');
    
    // 5. 解析字段
    const parsed = parseReceipt(ocrText);
    
    // 6. 写入 Sheet
    const sheetStartTime = new Date().getTime();
    writeToSheet(parsed.date, ocrText, parsed.confidence);
    const sheetDuration = new Date().getTime() - sheetStartTime;
    debugLog('⏱️ Sheet 写入完成，耗时: ' + sheetDuration + 'ms');
    
    // 总耗时
    const totalDuration = new Date().getTime() - startTime;
    debugLog('⏱️ 总耗时: ' + totalDuration + 'ms');
    
    // 7. 返回结果
    debugLog('========== 处理完成 ==========');
    return createResponse({
      success: true,
      result: {
        date: parsed.date,
        amount: parsed.amount,
        store: parsed.store,
        taxRate: parsed.taxRate,
        hasTNumber: parsed.hasTNumber,
        confidence: parsed.confidence + '%',
        preview: ocrText.substring(0, 100) + '...'
      },
      performance: {
        ocrTime: ocrDuration + 'ms',
        sheetTime: sheetDuration + 'ms',
        totalTime: totalDuration + 'ms'
      }
    });
    
  } catch (error) {
    // 确保错误也以 JSON 格式返回
    debugLog('❌ 处理失败: ' + error.toString());
    if (error.stack) {
      debugLog('错误堆栈: ' + error.stack);
    }
    
    return createResponse({ 
      success: false,
      error: error.toString(),
      errorType: error.name || 'Error',
      details: CONFIG.DEBUG_MODE ? error.stack : undefined
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
 * 测试整个流程（模拟 POST 请求）
 */
function testFullFlow() {
  Logger.log('🧪 开始测试完整流程...');
  Logger.log('');
  
  // 步骤 1: 测试 Vision API
  Logger.log('1️⃣ 测试 Vision API 配置...');
  if (!testVisionAPI()) {
    Logger.log('❌ Vision API 测试失败，请先修复配置');
    return;
  }
  Logger.log('');
  
  // 步骤 2: 测试 Sheet 写入
  Logger.log('2️⃣ 测试 Sheet 写入...');
  if (!testSheetWrite()) {
    Logger.log('❌ Sheet 写入测试失败，请先修复配置');
    return;
  }
  Logger.log('');
  
  // 步骤 3: 测试解析逻辑
  Logger.log('3️⃣ 测试解析逻辑...');
  const testText = `
セブンイレブン
2024年10月25日
合計 ¥1,250
T1234567890123
`;
  const parsed = parseReceipt(testText);
  Logger.log('解析结果: ' + JSON.stringify(parsed, null, 2));
  Logger.log('');
  
  Logger.log('✅ 所有测试通过！');
  Logger.log('现在可以从手机端测试上传收据了');
}

/**
 * 测试 Base64 解码（手动测试用）
 */
function testBase64Decode() {
  // 这是一个 1x1 像素的测试图片
  const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  try {
    const bytes = Utilities.base64Decode(testBase64);
    Logger.log('✅ Base64 解码成功');
    Logger.log('字节数: ' + bytes.length);
    
    // 测试 Vision API
    const result = callVisionAPI(bytes);
    Logger.log('OCR 结果: ' + result);
    
  } catch (error) {
    Logger.log('❌ 测试失败: ' + error.toString());
  }
}
#!/bin/bash

# ============================================
# 添加核心代码文件到项目
# ============================================

set -e

echo "📝 开始添加代码文件..."
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================
# 1. 创建 gas/Config.gs
# ============================================
echo -e "${BLUE}创建 gas/Config.gs...${NC}"

cat > gas/Config.gs << 'CONFIG_EOF'
// ============================================
// 📋 Config.gs - 配置模块
// ============================================

var CONFIG = {
  // 🔑 API 配置（从 Script Properties 读取）
  VISION_API_KEY: PropertiesService.getScriptProperties().getProperty('VISION_API_KEY'),
  SHEET_ID: PropertiesService.getScriptProperties().getProperty('SHEET_ID'),
  SECRET_TOKEN: PropertiesService.getScriptProperties().getProperty('SECRET_TOKEN') || 'test123',
  
  // 🎯 置信度阈值
  CONFIDENCE_THRESHOLD: {
    HIGH: 85,    // 直接入库
    MEDIUM: 60   // 需要复核
  },
  
  // 🐛 调试模式
  DEBUG_MODE: true  // 设为 false 关闭详细日志
};

/**
 * 调试日志函数
 * @param {string} message - 日志消息
 * @param {*} data - 可选的数据对象
 */
function debugLog(message, data) {
  if (!CONFIG.DEBUG_MODE) return;
  
  var timestamp = new Date().toISOString();
  var logMessage = '[' + timestamp + '] ' + message;
  
  // 同时输出到 Logger 和 console
  console.log(logMessage);
  Logger.log(logMessage);
  
  if (data !== undefined) {
    var dataStr = typeof data === 'object' 
      ? JSON.stringify(data, null, 2)
      : String(data);
    console.log(dataStr);
    Logger.log(dataStr);
  }
}
CONFIG_EOF

echo -e "${GREEN}✓ gas/Config.gs 创建完成${NC}"

# ============================================
# 2. 创建 gas/VisionAPI.gs
# ============================================
echo -e "${BLUE}创建 gas/VisionAPI.gs...${NC}"

cat > gas/VisionAPI.gs << 'VISIONAPI_EOF'
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
VISIONAPI_EOF

echo -e "${GREEN}✓ gas/VisionAPI.gs 创建完成${NC}"

# ============================================
# 3. 创建 gas/Parser.gs
# ============================================
echo -e "${BLUE}创建 gas/Parser.gs...${NC}"

cat > gas/Parser.gs << 'PARSER_EOF'
// ============================================
// 🧠 Parser.gs - 收据解析模块
// ============================================

/**
 * 解析 OCR 文本，提取结构化字段
 * @param {string} text - OCR 识别的文本
 * @return {Object} 解析结果
 */
function parseReceipt(text) {
  debugLog('开始解析收据文本');
  
  var lines = text.split('\n');
  var cleanLines = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line) {
      cleanLines.push(line);
    }
  }
  
  debugLog('文本行数: ' + cleanLines.length);
  
  var result = {
    date: extractDate(cleanLines),
    amount: extractAmount(cleanLines),
    store: extractStore(cleanLines),
    taxRate: extractTaxRate(text),
    hasTNumber: extractTNumber(text),
    confidence: 0
  };
  
  // 计算置信度
  result.confidence = calculateConfidence(result);
  
  debugLog('解析结果', result);
  return result;
}

/**
 * 提取日期
 */
function extractDate(lines) {
  var patterns = [
    /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})/,
    /(\d{4})\.(\d{2})\.(\d{2})/
  ];
  
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    for (var j = 0; j < patterns.length; j++) {
      var match = line.match(patterns[j]);
      if (match) {
        var year = match[1];
        var month = match[2].length === 1 ? '0' + match[2] : match[2];
        var day = match[3].length === 1 ? '0' + match[3] : match[3];
        return year + '-' + month + '-' + day;
      }
    }
  }
  
  // 默认返回今天
  var today = new Date();
  var year = today.getFullYear();
  var month = String(today.getMonth() + 1).padStart(2, '0');
  var day = String(today.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

/**
 * 提取金额（从后往前搜索）
 */
function extractAmount(lines) {
  var keywords = ['合計/', '合計', '総計', 'お会計', '計', 'total'];
  
  // 从后往前搜索
  for (var i = lines.length - 1; i >= 0; i--) {
    var line = lines[i];
    
    for (var j = 0; j < keywords.length; j++) {
      if (line.indexOf(keywords[j]) !== -1) {
        var nums = line.match(/[\d,，]+/g);
        if (nums) {
          var lastNum = nums[nums.length - 1];
          var amount = parseInt(lastNum.replace(/[,，]/g, ''));
          if (amount > 0 && amount < 1000000) {
            debugLog('在"' + keywords[j] + '"行找到金额: ' + amount);
            return amount;
          }
        }
      }
    }
  }
  
  return 0;
}

/**
 * 提取店名
 */
function extractStore(lines) {
  var excludeKeywords = [
    '領収書', '領収証', 'レシート', 'RECEIPT',
    'TEL', 'Tel', '電話', '住所', 'Address'
  ];
  
  for (var i = 0; i < Math.min(5, lines.length); i++) {
    var line = lines[i];
    
    // 过滤关键词
    var hasExcluded = false;
    for (var j = 0; j < excludeKeywords.length; j++) {
      if (line.indexOf(excludeKeywords[j]) !== -1) {
        hasExcluded = true;
        break;
      }
    }
    if (hasExcluded) continue;
    
    // 长度合理
    if (line.length >= 3 && line.length <= 30) {
      debugLog('找到店名: ' + line);
      return line;
    }
  }
  
  return '不明';
}

/**
 * 提取税率
 */
function extractTaxRate(text) {
  if (text.match(/軽減税率|8%対象|8％|税率8/)) {
    return '8%';
  }
  return '10%';
}

/**
 * 提取 T 番号
 */
function extractTNumber(text) {
  var match = text.match(/T\d{13}/);
  return match ? '有' : '無';
}

/**
 * 计算置信度
 */
function calculateConfidence(result) {
  var today = new Date();
  var todayStr = today.getFullYear() + '-' + 
                 String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(today.getDate()).padStart(2, '0');
  
  var checks = [
    result.date !== todayStr,
    result.amount > 0,
    result.store !== '不明',
    result.hasTNumber === '有'
  ];
  
  var score = 0;
  for (var i = 0; i < checks.length; i++) {
    if (checks[i]) score++;
  }
  
  return Math.round((score / checks.length) * 100);
}
PARSER_EOF

echo -e "${GREEN}✓ gas/Parser.gs 创建完成${NC}"

# ============================================
# 4. 创建 gas/SheetWriter.gs
# ============================================
echo -e "${BLUE}创建 gas/SheetWriter.gs...${NC}"

cat > gas/SheetWriter.gs << 'SHEETWRITER_EOF'
// ============================================
// 📝 SheetWriter.gs - Sheet 写入模块
// ============================================

/**
 * 写入数据到 Google Sheet
 * @param {string} date - 日期
 * @param {string} ocrText - OCR 原文
 * @param {number} confidence - 置信度
 */
function writeToSheet(date, ocrText, confidence) {
  debugLog('开始写入 Sheet');
  
  try {
    var sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getActiveSheet();
    
    // 确定状态
    var status = getStatus(confidence);
    
    // 写入数据
    sheet.appendRow([
      date,
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
    return '✅ 识别成功 (' + confidence + '%)';
  } else if (confidence >= CONFIG.CONFIDENCE_THRESHOLD.MEDIUM) {
    return '⚠️ 需复核 (' + confidence + '%)';
  } else {
    return '❌ 识别失败 (' + confidence + '%)';
  }
}

/**
 * 测试 Sheet 写入
 */
function testSheetWrite() {
  try {
    Logger.log('🧪 开始测试 Sheet 写入...');
    
    var testDate = new Date().toLocaleDateString('ja-JP');
    var testText = 'これはテストデータです\nTest Data';
    var testConfidence = 85;
    
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
SHEETWRITER_EOF

echo -e "${GREEN}✓ gas/SheetWriter.gs 创建完成${NC}"

# ============================================
# 5. 创建 gas/Code.gs
# ============================================
echo -e "${BLUE}创建 gas/Code.gs...${NC}"

cat > gas/Code.gs << 'CODE_EOF'
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
CODE_EOF

echo -e "${GREEN}✓ gas/Code.gs 创建完成${NC}"

# ============================================
# 6. 创建 frontend 文件
# ============================================
echo -e "${BLUE}创建 frontend 文件...${NC}"

# 由于文件太大，分别创建
cat > frontend/test.html << 'TESTHTML_EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📸 收据识别测试</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>📸 收据识别测试</h1>
        
        <div class="input-group">
            <label>Web App URL:</label>
            <input type="text" id="apiUrl" placeholder="https://script.google.com/macros/s/.../exec">
        </div>
        
        <div class="input-group">
            <label>Token:</label>
            <input type="text" id="token" value="test123">
        </div>
        
        <div class="input-group">
            <label>选择收据照片:</label>
            <input type="file" id="imageFile" accept="image/jpeg,image/jpg,image/png" capture="environment">
            <p class="hint">⚠️ 仅支持 JPG/PNG 格式（不支持 HEIC）</p>
        </div>
        
        <button class="btn" onclick="uploadReceipt()">🚀 开始识别</button>
        
        <div id="result"></div>
    </div>

    <script src="config.js"></script>
    <script src="utils.js"></script>
    <script>
        async function uploadReceipt() {
            const apiUrl = document.getElementById('apiUrl').value;
            const token = document.getElementById('token').value;
            const fileInput = document.getElementById('imageFile');
            const resultDiv = document.getElementById('result');
            
            if (!apiUrl) {
                alert('请输入 Web App URL');
                return;
            }
            if (!fileInput.files[0]) {
                alert('请选择一张收据照片');
                return;
            }
            
            resultDiv.style.display = 'block';
            resultDiv.className = '';
            resultDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>正在识别中...</p></div>';
            
            try {
                const file = fileInput.files[0];
                validateFile(file);
                
                const base64 = await fileToBase64(file);
                const pureBase64 = base64.split(',')[1];
                
                const data = await sendRequest(apiUrl, token, pureBase64);
                displayResult(resultDiv, data);
                
            } catch (error) {
                displayError(resultDiv, error);
            }
        }
    </script>
</body>
</html>
TESTHTML_EOF

echo -e "${GREEN}✓ frontend/test.html 创建完成${NC}"

cat > frontend/config.js << 'CONFIGJS_EOF'
// 前端配置
var APP_CONFIG = {
    DEFAULT_TOKEN: 'test123',
    REQUEST_TIMEOUT: 30000,
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png'],
    BLOCKED_EXTENSIONS: ['.heic', '.heif']
};
CONFIGJS_EOF

echo -e "${GREEN}✓ frontend/config.js 创建完成${NC}"

cat > frontend/utils.js << 'UTILSJS_EOF'
// 工具函数
function validateFile(file) {
    if (APP_CONFIG.BLOCKED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))) {
        throw new Error('不支持 HEIC 格式');
    }
    if (!file.type.startsWith('image/')) {
        throw new Error('请选择图片文件');
    }
    if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
        throw new Error('图片太大');
    }
    return true;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function sendRequest(apiUrl, token, base64Image) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.REQUEST_TIMEOUT);
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify({ token: token, image_base64: base64Image }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

function displayResult(resultDiv, data) {
    if (data.success) {
        resultDiv.className = 'success';
        resultDiv.innerHTML = `
            <h3>✅ 识别成功</h3>
            <div class="result-item"><strong>日期:</strong> ${data.result.date}</div>
            <div class="result-item"><strong>金额:</strong> ¥${data.result.amount}</div>
            <div class="result-item"><strong>店名:</strong> ${data.result.store}</div>
            <div class="result-item"><strong>置信度:</strong> ${data.result.confidence}</div>
        `;
    } else {
        throw new Error(data.error || '未知错误');
    }
}

function displayError(resultDiv, error) {
    resultDiv.className = 'error';
    resultDiv.innerHTML = `<h3>❌ 识别失败</h3><p>${error.message}</p>`;
}
UTILSJS_EOF

echo -e "${GREEN}✓ frontend/utils.js 创建完成${NC}"

cat > frontend/styles.css << 'STYLESCSS_EOF'
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: -apple-system, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
}
.container {
    max-width: 500px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
h1 {
    text-align: center;
    color: #667eea;
    margin-bottom: 30px;
}
.input-group {
    margin-bottom: 20px;
}
label {
    display: block;
    color: #555;
    margin-bottom: 8px;
    font-weight: 600;
}
input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 14px;
}
input:focus {
    outline: none;
    border-color: #667eea;
}
.btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
}
.btn:hover {
    transform: translateY(-2px);
}
#result {
    margin-top: 20px;
    padding: 20px;
    border-radius: 10px;
    display: none;
}
.success {
    background: #d4edda;
    border-left: 4px solid #28a745;
    display: block;
}
.error {
    background: #f8d7da;
    border-left: 4px solid #dc3545;
    display: block;
}
.result-item {
    margin: 10px 0;
    padding: 10px;
    background: white;
    border-radius: 5px;
}
.loading {
    text-align: center;
}
.spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.hint {
    font-size: 12px;
    color: #666;
    margin-top: 5px;
}
STYLESCSS_EOF

echo -e "${GREEN}✓ frontend/styles.css 创建完成${NC}"

# ============================================
# 7. 提交到 Git
# ============================================
echo ""
echo -e "${BLUE}📦 提交到 Git...${NC}"

git add gas/ frontend/
git commit -m "feat: add core code files

- Add GAS backend modules (Code, Config, VisionAPI, Parser, SheetWriter)
- Add frontend test page (HTML, CSS, JS)
- Ready for deployment and testing"

echo -e "${GREEN}✓ Git 提交完成${NC}"

# ============================================
# 完成
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 所有代码文件已添加！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📁 已创建的文件：${NC}"
echo "  gas/"
echo "    ├── Code.gs          ✅"
echo "    ├── Config.gs        ✅"
echo "    ├── VisionAPI.gs     ✅"
echo "    ├── Parser.gs        ✅"
echo "    └── SheetWriter.gs   ✅"
echo ""
echo "  frontend/"
echo "    ├── test.html        ✅"
echo "    ├── config.js        ✅"
echo "    ├── utils.js         ✅"
echo "    └── styles.css       ✅"
echo ""
echo -e "${BLUE}🎯 下一步操作：${NC}"
echo ""
echo "  1️⃣  配置 Google Cloud Vision API"
echo "     https://console.cloud.google.com"
echo ""
echo "  2️⃣  配置 Google Apps Script"
echo "     - 复制 gas/*.gs 到 GAS 编辑器"
echo "     - 设置 Script Properties："
echo "       • VISION_API_KEY"
echo "       • SHEET_ID"
echo "       • SECRET_TOKEN"
echo ""
echo "  3️⃣  测试"
echo "     在 GAS 编辑器运行："
echo "     testFullFlow()"
echo ""
echo "  4️⃣  部署"
echo "     部署 → 新部署 → 网络应用"
echo ""
echo "  5️⃣  前端测试"
echo "     打开 frontend/test.html"
echo ""
echo -e "${GREEN}完成！🚀${NC}"
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

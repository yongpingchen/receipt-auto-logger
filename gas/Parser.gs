
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
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  debugLog('文本行数: ' + lines.length);
  
  const result = {
    date: extractDate(lines),
    amount: extractAmount(lines),
    store: extractStore(lines),
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
  const patterns = [
    /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})/,
    /令和(\d+)年(\d{1,2})月(\d{1,2})日/,
    /(\d{4})\.(\d{2})\.(\d{2})/,
    /(\d{2})\/(\d{2})\/(\d{4})/  // MM/DD/YYYY
  ];
  
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        if (line.includes('令和')) {
          // 令和年号转西历
          const reiwaYear = parseInt(match[1]) + 2018;
          return `${reiwaYear}-${pad(match[2])}-${pad(match[3])}`;
        } else if (match[4]) {
          // MM/DD/YYYY 格式
          return `${match[3]}-${pad(match[1])}-${pad(match[2])}`;
        } else {
          return `${match[1]}-${pad(match[2])}-${pad(match[3])}`;
        }
      }
    }
  }
  
  // 默认返回今天
  const today = new Date();
  return Utilities.formatDate(today, 'Asia/Tokyo', 'yyyy-MM-dd');
}

/**
 * 提取金额
 */
function extractAmount(lines) {
  // 关键词优先级（按重要性排序）
  const highPriorityKeywords = ['合計/', '合計', '総計'];
  const mediumPriorityKeywords = ['お会計', '計', 'total', 'Total'];
  const lowPriorityKeywords = ['小計', '小计'];
  
  let bestAmount = 0;
  let bestPriority = 0;
  
  // 先找高优先级关键词
  for (const keyword of highPriorityKeywords) {
    for (let i = lines.length - 1; i >= 0; i--) {  // 🔥 从后往前找
      const line = lines[i];
      if (line.includes(keyword)) {
        const amount = extractNumberFromLine(line);
        if (amount > 0 && amount < 1000000) {
          debugLog(`在"${keyword}"行找到金额: ${amount} (行: ${line})`);
          return amount;  // 立即返回
        }
      }
    }
  }
  
  // 找中等优先级
  for (const keyword of mediumPriorityKeywords) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.includes(keyword)) {
        const amount = extractNumberFromLine(line);
        if (amount > 0 && amount < 1000000) {
          debugLog(`在"${keyword}"行找到金额: ${amount} (行: ${line})`);
          return amount;
        }
      }
    }
  }
  
  // 最后找小计
  for (const keyword of lowPriorityKeywords) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.includes(keyword)) {
        const amount = extractNumberFromLine(line);
        if (amount > 0 && amount < 1000000) {
          debugLog(`在"${keyword}"行找到金额: ${amount} (行: ${line})`);
          return amount;
        }
      }
    }
  }
  
  // 备选：找包含"円"且金额较大的行
  let maxAmount = 0;
  for (const line of lines) {
    if (line.includes('円') || line.includes('¥') || line.includes('￥')) {
      const amount = extractNumberFromLine(line);
      if (amount > maxAmount && amount < 1000000) {
        maxAmount = amount;
      }
    }
  }
  
  if (maxAmount > 0) {
    debugLog(`通过"円"标记找到最大金额: ${maxAmount}`);
    return maxAmount;
  }
  
  return 0;
}

/**
 * 从行中提取数字（处理各种格式）
 */
function extractNumberFromLine(line) {
  // 移除空格和全角字符
  const cleanLine = line.replace(/\s+/g, '').replace(/[￥¥円]/g, '');
  
  // 查找所有数字（包括逗号分隔）
  const nums = cleanLine.match(/[\d,，]+/g);
  if (!nums) return 0;
  
  // 取最后一个数字（通常是金额）
  const lastNum = nums[nums.length - 1];
  const amount = parseInt(lastNum.replace(/[,，]/g, ''));
  
  return isNaN(amount) ? 0 : amount;
}

/**
 * 提取店名
 */
function extractStore(lines) {
  const excludeKeywords = [
    '領収書', '領収証', 'レシート', 'RECEIPT',
    'TEL', 'Tel', '電話', '住所', 'Address',
    'FAX', 'Fax', '営業時間', '登録番号'
  ];
  
  // 在前 5 行中查找
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    
    // 过滤掉关键词
    if (excludeKeywords.some(kw => line.includes(kw))) {
      continue;
    }
    
    // 过滤掉纯数字行
    if (/^\d+$/.test(line)) {
      continue;
    }
    
    // 长度合理的行
    if (line.length >= 3 && line.length <= 30) {
      debugLog(`找到店名: ${line}`);
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
  return '10%';  // 默认标准税率
}

/**
 * 提取 T 番号
 */
function extractTNumber(text) {
  const match = text.match(/T\d{13}/);
  return match ? '有' : '無';
}

/**
 * 计算置信度
 */
function calculateConfidence(result) {
  const checks = [
    result.date !== Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd'),  // 日期非今天
    result.amount > 0,
    result.store !== '不明',
    result.hasTNumber === '有'
  ];
  
  const score = checks.filter(Boolean).length;
  return Math.round((score / checks.length) * 100);
}

/**
 * 辅助函数：补零
 */
function pad(num) {
  return String(num).padStart(2, '0');
}
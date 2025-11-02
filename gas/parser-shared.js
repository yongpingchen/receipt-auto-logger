// ============================================
// 🧠 parser-shared.js - 收据解析逻辑（共享版本）
// ============================================
// 
// 用途：
// 1. GAS 的 Parser.gs 从这里复制代码
// 2. 测试页面直接引用此文件
// 
// ⚠️ 必须使用 ES5 语法！
// ============================================

/**
 * 提取金额（改进版：只接受带货币符号的金额）
 * @param {Array<string>} lines - 收据文本行数组
 * @return {number} 提取到的金额
 */
function extractAmount(lines) {
    // 关键词优先级（按重要性排序）
    var highPriorityKeywords = ['合計', '合计', '総計'];
    var mediumPriorityKeywords = ['お会計', '計', 'total', 'Total'];
    var lowPriorityKeywords = ['小計', '小计'];
    
    // 🔥 辅助函数：提取带货币符号的金额
    function extractAmountWithCurrency(line) {
        var currencyPattern = /[￥¥円]\s*[\d,，]+/;
        var match = line.match(currencyPattern);
        if (match) {
            var numStr = match[0].replace(/[￥¥円,，\s]/g, '');
            var amount = parseInt(numStr, 10);
            if (!isNaN(amount) && amount > 0 && amount < 1000000) {
                return amount;
            }
        }
        return 0;
    }
    
    // 先找高优先级关键词
    for (var k = 0; k < highPriorityKeywords.length; k++) {
        var keyword = highPriorityKeywords[k];
        for (var i = lines.length - 1; i >= 0; i--) {
            var line = lines[i];
            if (line.includes(keyword)) {
                debugLog('找到关键词"' + keyword + '"在行: ' + line);
                
                // 🔥 尝试当前行（必须有货币符号）
                var amount = extractAmountWithCurrency(line);
                if (amount > 0) {
                    debugLog('✅ 在"' + keyword + '"当前行找到带¥金额: ' + amount);
                    return amount;
                }
                
                // 🔥 当前行没有货币符号，向下查找最多3行
                for (var j = 1; j <= 3; j++) {
                    if (i + j < lines.length) {
                        var nextLine = lines[i + j];
                        var amountNext = extractAmountWithCurrency(nextLine);
                        if (amountNext > 0) {
                            debugLog('✅ 在"' + keyword + '"后第' + j + '行找到带¥金额: ' + amountNext + ' (行: ' + nextLine + ')');
                            return amountNext;
                        }
                    }
                }
                
                debugLog('⚠️ "' + keyword + '"行及后续3行都没有货币符号，跳过');
            }
        }
    }
    
    // 找中等优先级
    for (var k = 0; k < mediumPriorityKeywords.length; k++) {
        var keyword = mediumPriorityKeywords[k];
        for (var i = lines.length - 1; i >= 0; i--) {
            var line = lines[i];
            if (line.includes(keyword)) {
                var amount = extractAmountWithCurrency(line);
                if (amount > 0) {
                    debugLog('✅ 在"' + keyword + '"行找到带¥金额: ' + amount);
                    return amount;
                }
                
                for (var j = 1; j <= 3; j++) {
                    if (i + j < lines.length) {
                        var nextLine = lines[i + j];
                        var amountNext = extractAmountWithCurrency(nextLine);
                        if (amountNext > 0) {
                            debugLog('✅ 在"' + keyword + '"后第' + j + '行找到带¥金额: ' + amountNext);
                            return amountNext;
                        }
                    }
                }
            }
        }
    }
    
    // 最后找小计
    for (var k = 0; k < lowPriorityKeywords.length; k++) {
        var keyword = lowPriorityKeywords[k];
        for (var i = lines.length - 1; i >= 0; i--) {
            var line = lines[i];
            if (line.includes(keyword)) {
                var amount = extractAmountWithCurrency(line);
                if (amount > 0) {
                    debugLog('✅ 在"' + keyword + '"行找到带¥金额: ' + amount);
                    return amount;
                }
            }
        }
    }
    
    // 🔥 备选：从后往前找第一个带货币符号的较大金额
    debugLog('⚠️ 未找到关键词，尝试查找最后出现的货币符号');
    for (var i = lines.length - 1; i >= 0; i--) {
        var line = lines[i];
        var amount = extractAmountWithCurrency(line);
        if (amount >= 100) {  // 至少100円
            debugLog('✅ 找到带货币符号的金额: ' + amount + ' (行: ' + line + ')');
            return amount;
        }
    }
    
    return 0;
}
/**
 * 从行中提取数字（处理各种格式）
 * @param {string} line - 文本行
 * @return {number} 提取到的数字
 */
function extractNumberFromLine(line) {
    // 移除多余空格
    var cleanLine = line.replace(/\s+/g, '');
    
    // 🔥 策略1: 优先查找货币符号后的数字
    var currencyPattern = /[￥¥円]\s*[\d,，]+/g;
    var currencyMatches = cleanLine.match(currencyPattern);
    
    if (currencyMatches && currencyMatches.length > 0) {
        // 从最后一个货币数字中提取
        var lastMatch = currencyMatches[currencyMatches.length - 1];
        var numStr = lastMatch.replace(/[￥¥円,，]/g, '');
        var amount = parseInt(numStr, 10);
        
        if (!isNaN(amount) && amount > 0) {
            debugLog('通过货币符号提取金额: ' + amount);
            return amount;
        }
    }
    
    // 🔥 策略2: 查找所有数字，过滤掉小数字（可能是"点"字）
    var allNums = cleanLine.match(/[\d,，]+/g);
    
    if (!allNums || allNums.length === 0) {
        return 0;
    }
    
    // 转换为数字数组并排序（从大到小）
    var amounts = [];
    for (var i = 0; i < allNums.length; i++) {
        var numStr = allNums[i].replace(/[,，]/g, '');
        var num = parseInt(numStr, 10);
        if (!isNaN(num)) {
            amounts.push(num);
        }
    }
    
    if (amounts.length === 0) {
        return 0;
    }
    
    // 排序：从大到小
    amounts.sort(function(a, b) { return b - a; });
    
    // 🔥 策略3: 返回最大的合理金额
    // 过滤掉太小的数字（< 10 可能是"点"、"件"等单位数字）
    for (var i = 0; i < amounts.length; i++) {
        if (amounts[i] >= 10 && amounts[i] < 1000000) {
            debugLog('提取到金额: ' + amounts[i] + ' (从行: ' + line + ')');
            return amounts[i];
        }
    }
    
    // 兜底：返回最大的数字（即使很小）
    return amounts[0];
}

/**
 * 辅助函数：补零
 */
function pad(num) {
    return String(num).padStart(2, '0');
}

/**
 * 提取日期
 */
function extractDate(lines) {
    var patterns = [
        /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})/,
        /令和(\d+)年(\d{1,2})月(\d{1,2})日/,
        /(\d{4})\.(\d{2})\.(\d{2})/,
        /(\d{2})\/(\d{2})\/(\d{4})/
    ];
    
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        for (var j = 0; j < patterns.length; j++) {
            var pattern = patterns[j];
            var match = line.match(pattern);
            if (match) {
                if (line.includes('令和')) {
                    var reiwaYear = parseInt(match[1]) + 2018;
                    return reiwaYear + '-' + pad(match[2]) + '-' + pad(match[3]);
                } else if (match[4]) {
                    return match[3] + '-' + pad(match[1]) + '-' + pad(match[2]);
                } else {
                    return match[1] + '-' + pad(match[2]) + '-' + pad(match[3]);
                }
            }
        }
    }
    
    // 默认返回今天
    var today = new Date();
    var year = today.getFullYear();
    var month = pad(today.getMonth() + 1);
    var day = pad(today.getDate());
    return year + '-' + month + '-' + day;
}

/**
 * 提取店名
 */
function extractStore(lines) {
    var excludeKeywords = [
        '領収書', '領収証', 'レシート', 'RECEIPT',
        'TEL', 'Tel', '電話', '住所', 'Address',
        'FAX', 'Fax', '営業時間', '登録番号'
    ];
    
    for (var i = 0; i < Math.min(5, lines.length); i++) {
        var line = lines[i];
        
        var shouldSkip = false;
        for (var j = 0; j < excludeKeywords.length; j++) {
            if (line.includes(excludeKeywords[j])) {
                shouldSkip = true;
                break;
            }
        }
        
        if (shouldSkip) {
            continue;
        }
        
        if (/^\d+$/.test(line)) {
            continue;
        }
        
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
                   pad(today.getMonth() + 1) + '-' + 
                   pad(today.getDate());
    
    var checks = [
        result.date !== todayStr,
        result.amount > 0,
        result.store !== '不明',
        result.hasTNumber === '有'
    ];
    
    var score = 0;
    for (var i = 0; i < checks.length; i++) {
        if (checks[i]) {
            score++;
        }
    }
    
    return Math.round((score / checks.length) * 100);
}

/**
 * 解析收据主函数
 */
function parseReceipt(text) {
    debugLog('开始解析收据文本');
    
    var lines = text.split('\n').map(function(l) {
        return l.trim();
    }).filter(function(l) {
        return l;
    });
    
    debugLog('文本行数: ' + lines.length);
    
    var result = {
        date: extractDate(lines),
        amount: extractAmount(lines),
        store: extractStore(lines),
        taxRate: extractTaxRate(text),
        hasTNumber: extractTNumber(text),
        confidence: 0
    };
    
    result.confidence = calculateConfidence(result);
    
    debugLog('解析结果', result);
    return result;
}
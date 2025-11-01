# 📚 代码片段库

常用的 ES5 代码模板和最佳实践

---

## 🔄 循环模式

### For 循环（推荐）

```javascript
// 数组遍历
for (var i = 0; i < array.length; i++) {
  var item = array[i];
  debugLog('Processing item: ' + item);
}

// 倒序遍历
for (var i = array.length - 1; i >= 0; i--) {
  var item = array[i];
  // ...
}

// 对象属性遍历
for (var key in object) {
  if (object.hasOwnProperty(key)) {
    var value = object[key];
    debugLog(key + ': ' + value);
  }
}
```

---

## 🛡️ 错误处理

### Try-Catch 标准模式

```javascript
/**
 * 标准错误处理模式
 */
function someFunction() {
  try {
    // 业务逻辑
    var result = doSomething();
    
    // 验证结果
    if (!result) {
      throw new Error('Operation failed');
    }
    
    return result;
    
  } catch (error) {
    debugLog('❌ Error in someFunction: ' + error.toString());
    debugLog('Stack trace: ' + error.stack);
    
    // 返回安全的默认值
    return null;
  }
}
```

### GAS Web App 错误处理

```javascript
/**
 * Web App 入口点错误处理
 */
function doPost(e) {
  try {
    // 验证输入
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Invalid request data');
    }
    
    // 解析请求
    var params = JSON.parse(e.postData.contents);
    
    // 业务逻辑
    var result = processRequest(params);
    
    // 返回成功响应
    return createResponse({
      success: true,
      result: result
    });
    
  } catch (error) {
    debugLog('❌ doPost error: ' + error.toString());
    
    // 返回错误响应（仍然是 JSON）
    return createResponse({
      success: false,
      error: error.message,
      errorType: error.name
    });
  }
}
```

---

## 📝 字符串处理

### 字符串拼接

```javascript
// ES5 方式：使用 + 连接
var message = 'Hello ' + name + ', you have ' + count + ' items.';

// 多行字符串
var html = '<div>' +
  '<h1>' + title + '</h1>' +
  '<p>' + content + '</p>' +
'</div>';
```

### 字符串清理

```javascript
/**
 * 清理和规范化字符串
 */
function cleanString(str) {
  if (!str) return '';
  
  return str
    .replace(/\s+/g, ' ')        // 多个空格变一个
    .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')  // trim
    .replace(/[,，]/g, '');      // 移除逗号
}
```

---

## 🔍 数组操作

### 数组查找

```javascript
/**
 * 查找数组中的元素
 */
function findInArray(array, predicate) {
  for (var i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return array[i];
    }
  }
  return null;
}

// 使用示例
var found = findInArray(users, function(user) {
  return user.id === targetId;
});
```

### 数组过滤

```javascript
/**
 * 过滤数组
 */
function filterArray(array, predicate) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      result.push(array[i]);
    }
  }
  return result;
}

// 使用示例
var adults = filterArray(users, function(user) {
  return user.age >= 18;
});
```

### 数组映射

```javascript
/**
 * 映射数组
 */
function mapArray(array, transform) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    result.push(transform(array[i]));
  }
  return result;
}

// 使用示例
var names = mapArray(users, function(user) {
  return user.name;
});
```

---

## 📊 对象操作

### 对象深拷贝

```javascript
/**
 * 简单对象深拷贝
 * 注意：不处理循环引用和函数
 */
function deepCopy(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Array) {
    var copy = [];
    for (var i = 0; i < obj.length; i++) {
      copy[i] = deepCopy(obj[i]);
    }
    return copy;
  }
  
  if (obj instanceof Object) {
    var copy = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = deepCopy(obj[key]);
      }
    }
    return copy;
  }
}
```

### 对象合并

```javascript
/**
 * 合并对象（浅合并）
 */
function mergeObjects(target, source) {
  var result = {};
  
  // 复制 target
  for (var key in target) {
    if (target.hasOwnProperty(key)) {
      result[key] = target[key];
    }
  }
  
  // 覆盖或添加 source 的属性
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      result[key] = source[key];
    }
  }
  
  return result;
}
```

---

## 🧪 正则表达式

### 常用模式

```javascript
// 日期匹配
var datePatterns = {
  standard: /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})/,
  reiwa: /令和(\d+)年(\d{1,2})月(\d{1,2})日/,
  dotFormat: /(\d{4})\.(\d{2})\.(\d{2})/
};

// 金额匹配
var amountPattern = /[\d,，]+/g;

// T番号匹配
var tNumberPattern = /T\d{13}/;

// 邮箱匹配
var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### 正则使用模板

```javascript
/**
 * 从文本中提取匹配项
 */
function extractWithPattern(text, pattern) {
  var match = text.match(pattern);
  if (match) {
    debugLog('找到匹配: ' + match[0]);
    return match[0];
  }
  
  debugLog('未找到匹配');
  return null;
}

/**
 * 查找所有匹配项
 */
function findAllMatches(text, pattern) {
  var matches = [];
  var match;
  
  // 确保使用全局标志
  var globalPattern = new RegExp(pattern.source, 'g');
  
  while ((match = globalPattern.exec(text)) !== null) {
    matches.push(match[0]);
  }
  
  return matches;
}
```

---

## 📡 HTTP 请求

### UrlFetchApp 模板

```javascript
/**
 * GET 请求
 */
function httpGet(url, headers) {
  var options = {
    method: 'get',
    headers: headers || {},
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    var statusCode = response.getResponseCode();
    
    if (statusCode !== 200) {
      throw new Error('HTTP ' + statusCode + ': ' + response.getContentText());
    }
    
    return JSON.parse(response.getContentText());
    
  } catch (error) {
    debugLog('GET request failed: ' + error.toString());
    throw error;
  }
}

/**
 * POST 请求
 */
function httpPost(url, data, headers) {
  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: headers || {},
    payload: JSON.stringify(data),
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    var statusCode = response.getResponseCode();
    
    if (statusCode !== 200) {
      throw new Error('HTTP ' + statusCode + ': ' + response.getContentText());
    }
    
    return JSON.parse(response.getContentText());
    
  } catch (error) {
    debugLog('POST request failed: ' + error.toString());
    throw error;
  }
}
```

---

## 📝 日志模式

### 调试日志

```javascript
/**
 * 统一的调试日志函数
 */
function debugLog(message, data) {
  if (!CONFIG.DEBUG_MODE) return;
  
  var timestamp = new Date().toISOString();
  var logMessage = '[' + timestamp + '] ' + message;
  
  // 同时输出到 Logger 和 console
  console.log(logMessage);
  Logger.log(logMessage);
  
  // 如果有数据，格式化输出
  if (data !== undefined) {
    var dataStr = typeof data === 'object' 
      ? JSON.stringify(data, null, 2)
      : String(data);
    console.log(dataStr);
    Logger.log(dataStr);
  }
}

/**
 * 性能日志
 */
function perfLog(label, startTime) {
  var duration = new Date().getTime() - startTime;
  debugLog('⏱️ ' + label + ': ' + duration + 'ms');
}

// 使用示例
var start = new Date().getTime();
doSomething();
perfLog('doSomething', start);
```

---

## 🔐 数据验证

### 输入验证模板

```javascript
/**
 * 验证必填字段
 */
function validateRequired(data, requiredFields) {
  var errors = [];
  
  for (var i = 0; i < requiredFields.length; i++) {
    var field = requiredFields[i];
    if (!data[field]) {
      errors.push('Missing required field: ' + field);
    }
  }
  
  return errors;
}

/**
 * 验证数据类型
 */
function validateType(value, expectedType) {
  var actualType = typeof value;
  if (actualType !== expectedType) {
    throw new Error('Expected ' + expectedType + ', got ' + actualType);
  }
  return true;
}

/**
 * 验证数字范围
 */
function validateRange(value, min, max) {
  if (value < min || value > max) {
    throw new Error('Value ' + value + ' out of range [' + min + ', ' + max + ']');
  }
  return true;
}
```

---

## 🎨 函数模板

### JSDoc 注释模板

```javascript
/**
 * 函数简短描述
 * 
 * 详细说明函数的功能和用途
 * 
 * @param {string} param1 - 参数1的描述
 * @param {number} param2 - 参数2的描述
 * @param {Object} options - 可选参数对象
 * @param {boolean} options.flag - 选项标志
 * @return {Object} 返回值描述
 * @return {boolean} return.success - 是否成功
 * @return {string} return.message - 结果消息
 * 
 * @throws {Error} 什么情况下会抛出错误
 * 
 * @example
 * var result = myFunction('test', 123, { flag: true });
 * if (result.success) {
 *   console.log(result.message);
 * }
 */
function myFunction(param1, param2, options) {
  // 参数默认值
  options = options || {};
  var flag = options.flag !== undefined ? options.flag : false;
  
  // 实现
  // ...
  
  return {
    success: true,
    message: 'Operation completed'
  };
}
```

---

## 🔄 异步处理模拟

### 轮询模式

```javascript
/**
 * 轮询直到满足条件
 * @param {Function} checkFn - 检查函数
 * @param {number} maxAttempts - 最大尝试次数
 * @param {number} interval - 间隔时间（毫秒）
 */
function pollUntil(checkFn, maxAttempts, interval) {
  var attempts = 0;
  
  while (attempts < maxAttempts) {
    if (checkFn()) {
      return true;
    }
    
    Utilities.sleep(interval);
    attempts++;
  }
  
  return false;
}

// 使用示例
var success = pollUntil(
  function() {
    return checkStatus() === 'complete';
  },
  10,    // 最多尝试 10 次
  1000   // 每次间隔 1 秒
);
```

---

## 📦 缓存模式

### 简单缓存

```javascript
var Cache = {
  store: {},
  
  get: function(key) {
    return this.store[key] || null;
  },
  
  set: function(key, value, ttl) {
    this.store[key] = {
      value: value,
      expires: ttl ? Date.now() + ttl : null
    };
  },
  
  has: function(key) {
    var item = this.store[key];
    if (!item) return false;
    
    if (item.expires && item.expires < Date.now()) {
      delete this.store[key];
      return false;
    }
    
    return true;
  },
  
  clear: function() {
    this.store = {};
  }
};

// 使用示例
Cache.set('user:123', { name: 'John' }, 60000);  // 1分钟 TTL
var user = Cache.get('user:123');
```

---

## 🎯 使用建议

### 在 Claude 对话中引用

```
"请使用 snippets.md 中的 '错误处理标准模式' 
生成一个新的数据处理函数"
```

### 在 Cursor 中快速查找

```
Cmd+P → 输入 "snippets.md"
Cmd+F → 搜索需要的模式
```

### 创建自己的片段

```javascript
// 将常用代码添加到这个文件
// 按类别组织
// 添加清晰的注释和示例
```

---

**最后更新**: 2025-11-01
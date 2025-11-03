# 📝 Receipt Auto Logger - 确认页面功能改进 Summary

> **版本**: v1.2  
> **创建日期**: 2025-11-02  
> **改进目标**: 添加识别结果确认和手动编辑功能

---

## 🎯 需求概述

### 当前流程（v1.1）
```
拍照/选择 → 上传识别 → 显示结果（结束）
```

### 新流程（v1.2）
```
拍照/选择 → 上传识别 → 确认页面（可编辑）→ 提交到Sheet
```

### 核心改进
- ✅ 用户可以查看和编辑识别结果
- ✅ 提交前二次确认，提高数据准确性
- ✅ 支持手动修正错误识别

---

## 📦 涉及的模块

### 前端改动（主要）

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `frontend/index.html` | 🔨 修改 | 添加确认页面 HTML 结构 |
| `frontend/upload-handler.js` | 🔨 修改 | 识别成功后跳转到确认页 |
| `frontend/page-switcher.js` | ✨ 新建 | 管理页面切换逻辑 |
| `frontend/confirm-handler.js` | ✨ 新建 | 处理确认页面交互和提交 |

### 后端改动（较少）

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `gas/Code.gs` | 🔨 修改 | 支持 action 参数（ocr/submit）|
| `gas/SheetWriter.gs` | 🔨 修改 | 接收更多字段（金额、店名等）|

---

## 🔧 技术实现要点

### 1. 页面架构（单页多视图）

```html
<!-- index.html 结构 -->
<body>
    <div id="uploadPage">
        <!-- 现有的上传页面 -->
    </div>
    
    <div id="confirmPage" style="display:none">
        <!-- 新增的确认页面 -->
        <form id="confirmForm">
            <input name="date" />
            <input name="amount" />
            <input name="store" />
            <!-- ... -->
        </form>
        <button onclick="ConfirmHandler.submitToSheet()">提交</button>
        <button onclick="PageSwitcher.showUploadPage()">返回</button>
    </div>
</body>
```

### 2. 后端 API 改动

#### 请求格式变化

**识别请求**（现有流程，改为不写Sheet）
```javascript
POST /exec
{
    "action": "ocr",           // ⭐ 新增
    "token": "test123",
    "image_base64": "..."
}

// 响应（只返回识别结果，不写Sheet）
{
    "success": true,
    "result": {
        "date": "2025-11-02",
        "amount": 1250,
        "store": "セブンイレブン",
        "taxRate": "10%",
        "hasTNumber": "有",
        "confidence": "85%"
    },
    "ocrText": "原始OCR文本..."  // ⭐ 新增，供提交时使用
}
```

**提交请求**（新增）
```javascript
POST /exec
{
    "action": "submit",        // ⭐ 新增
    "token": "test123",
    "data": {
        "date": "2025-11-02",
        "amount": 1250,
        "store": "セブンイレブン",
        "taxRate": "10%",
        "hasTNumber": "有",
        "ocrText": "原始OCR文本...",
        "confidence": 85
    }
}

// 响应
{
    "success": true,
    "message": "数据已写入Sheet"
}
```

#### Code.gs 改动逻辑

```javascript
function doPost(e) {
    var params = JSON.parse(e.postData.contents);
    
    // 路由判断
    if (params.action === 'ocr') {
        // 只做 OCR，不写 Sheet
        var imageBytes = Utilities.base64Decode(params.image_base64);
        var ocrText = callVisionAPI(imageBytes);
        var parsed = parseReceipt(ocrText);
        
        return createResponse({
            success: true,
            result: parsed,
            ocrText: ocrText  // ⭐ 保存原文，供提交时使用
        });
    }
    
    if (params.action === 'submit') {
        // 直接写 Sheet
        var data = params.data;
        writeToSheet(
            data.date,
            data.amount,
            data.store,
            data.taxRate,
            data.hasTNumber,
            data.ocrText,
            data.confidence
        );
        
        return createResponse({
            success: true,
            message: '数据已写入Sheet'
        });
    }
}
```

### 3. Sheet 表头更新

**当前表头**:
```
日期 | OCR原文 | 状态
```

**新表头**:
```
日期 | 金额 | 店名 | 税率 | T番号 | OCR原文 | 状态
```

**说明**:
- OCR原文保留在倒数第二列（方便调试）
- 状态列移到最后

---

## 🎨 UI/UX 设计决策

### 1. 确认页面布局
- **所有字段可编辑**（日期、金额、店名、税率、T番号）
- 使用表单输入框（type 根据字段选择）
- 显示置信度（只读，供用户参考）

### 2. 交互逻辑
- **提交失败** → 留在确认页，显示错误，允许重试
- **点击返回** → 回到上传页，保留图片和识别结果
- **重新识别** → 可以重新上传同一张图片

### 3. 错误处理
- 表单验证：日期格式、金额为数字
- 网络错误：显示友好提示，允许重试
- 超时处理：30秒超时，提示用户

---

## 📋 实施顺序

### Phase 1: 后端准备（先行）
1. ⬜ 修改 `SheetWriter.gs` → 支持更多字段
2. ⬜ 修改 `Code.gs` → 添加 action 参数处理

### Phase 2: 前端基础架构
3. ⬜ 新建 `page-switcher.js` → 实现页面切换
4. ⬜ 修改 `index.html` → 添加确认页面 HTML

### Phase 3: 前端逻辑
5. ⬜ 新建 `confirm-handler.js` → 实现表单渲染和提交
6. ⬜ 修改 `upload-handler.js` → 识别成功后跳转

### Phase 4: 联调测试
7. ⬜ 完整流程测试
8. ⬜ 边界情况处理

---

## 🔍 关键代码片段参考

### page-switcher.js 接口
```javascript
var PageSwitcher = (function() {
    function showUploadPage() {
        document.getElementById('uploadPage').style.display = 'block';
        document.getElementById('confirmPage').style.display = 'none';
    }
    
    function showConfirmPage(data, ocrText) {
        document.getElementById('uploadPage').style.display = 'none';
        document.getElementById('confirmPage').style.display = 'block';
        ConfirmHandler.renderData(data, ocrText);  // 填充表单
    }
    
    return {
        showUploadPage: showUploadPage,
        showConfirmPage: showConfirmPage
    };
})();
```

### confirm-handler.js 接口
```javascript
var ConfirmHandler = (function() {
    var currentOcrText = '';  // 保存原始OCR文本
    var currentConfidence = 0; // 保存置信度
    
    function renderData(data, ocrText) {
        currentOcrText = ocrText;
        currentConfidence = parseInt(data.confidence, 10);
        
        document.getElementById('date').value = data.date;
        document.getElementById('amount').value = data.amount;
        document.getElementById('store').value = data.store;
        document.getElementById('taxRate').value = data.taxRate;
        document.getElementById('hasTNumber').value = data.hasTNumber;
        document.getElementById('confidence').textContent = data.confidence;
    }
    
    function submitToSheet() {
        // 获取表单数据
        var formData = {
            date: document.getElementById('date').value,
            amount: parseInt(document.getElementById('amount').value, 10),
            store: document.getElementById('store').value,
            taxRate: document.getElementById('taxRate').value,
            hasTNumber: document.getElementById('hasTNumber').value,
            ocrText: currentOcrText,
            confidence: currentConfidence
        };
        
        // 验证
        if (!validateForm(formData)) {
            return;
        }
        
        // 发送 submit 请求
        sendSubmitRequest(formData)
            .then(function(result) {
                alert('提交成功！');
                PageSwitcher.showUploadPage();
                ImageHandler.clearCurrentFile();
            })
            .catch(function(error) {
                alert('提交失败: ' + error.message);
            });
    }
    
    return {
        renderData: renderData,
        submitToSheet: submitToSheet
    };
})();
```

### upload-handler.js 改动点
```javascript
// 原代码
.then(function(data) {
    displayResult(resultDiv, data);  // ❌ 删除
})

// 新代码
.then(function(data) {
    if (data.success) {
        PageSwitcher.showConfirmPage(data.result, data.ocrText);  // ✅ 跳转
    } else {
        displayError(resultDiv, new Error(data.error));
    }
})
```

---

## 🚨 注意事项

### ES5 语法约束
- ✅ 使用 `var`（不用 const/let）
- ✅ 使用 `function() {}`（不用箭头函数）
- ✅ 使用 `'字符串' + 变量`（不用模板字符串）
- ✅ 使用 `array.indexOf() !== -1`（不用 includes）

### 命名空间模式
```javascript
// ✅ 正确的模块导出
var ModuleName = (function() {
    // 私有变量和函数
    var privateVar = null;
    
    function privateFunc() {}
    
    // 公开接口
    return {
        publicMethod: function() {}
    };
})();
```

### 异步处理
```javascript
// ✅ 使用 Promise + .then()（不用 async/await）
sendRequest(url, data)
    .then(function(result) { 
        // 处理成功
    })
    .catch(function(error) { 
        // 处理错误
    });
```

---

## 📝 后续优化方向（v1.3+）

- [ ] 添加加载动画（提交时）
- [ ] 表单字段智能验证
- [ ] 支持键盘快捷键（Enter提交）
- [ ] 历史记录预填充（店名自动补全）
- [ ] 离线缓存（PWA）

---

## 🔗 相关文档

- [项目整体架构](../docs/context.md)
- [ES5 语法规范](../.cursorrules)
- [项目说明](../project_instructions_for_claude.md)

---

## 🎯 新 Chat 使用方法

在新对话中：

1. **粘贴本 Summary**
2. **粘贴要修改的模块代码**（从项目中复制）
3. **说明具体需求**

示例：
```
[粘贴本 Summary]
[粘贴 gas/Code.gs]
[粘贴 gas/SheetWriter.gs]

请帮我实现 Phase 1: 修改后端以支持新的 action 参数
```

---

**创建者**: @chenyongping  
**用途**: 用于新 Chat 快速建立上下文  
**更新**: 每个 Phase 完成后更新进度复选框

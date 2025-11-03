# Receipt Auto Logger - Quick Context (新对话必读)

> **用途**: 在新的 Claude 对话中，只需粘贴此文档 + 相关模块代码，即可快速建立上下文

---

## 🎯 项目简介

**收据自动识别系统** - 手机拍照识别日文收据，自动提取信息并记录到 Google Sheet

**技术栈**: Google Apps Script (ES5) + Google Cloud Vision API + HTML/CSS/JS (模块化)

---

## 📁 核心文件结构

```
项目/
├── gas/                    # Google Apps Script 后端
│   ├── Code.gs            # 主入口 (doPost/doGet)
│   ├── Config.gs          # 配置管理
│   ├── VisionAPI.gs       # OCR 识别
│   ├── Parser.gs          # 收据解析 ⭐ 常修改
│   └── SheetWriter.gs     # Sheet 操作
│
└── frontend/               # 前端（模块化）
    ├── index.html         # UI 结构 ⭐ v1.2: 双页面
    ├── styles.css         # 样式表
    ├── config.js          # 配置常量
    ├── utils.js           # 通用工具函数
    ├── image-handler.js   # 图片处理
    ├── page-switcher.js   # ✨ v1.2: 页面切换
    ├── confirm-handler.js # ✨ v1.2: 确认页逻辑
    └── upload-handler.js  # 上传流程
```

---

## 🔍 快速定位指南

| 用户需求 | 修改文件 |
|---------|---------|
| 改进金额识别 | `gas/Parser.gs` |
| 修改 OCR 调用 | `gas/VisionAPI.gs` |
| 改变 Sheet 写入格式 | `gas/SheetWriter.gs` |
| 修改拍照/相册功能 | `frontend/image-handler.js` |
| 修改确认页面布局 | `frontend/index.html` |
| 修改确认页面交互 | `frontend/confirm-handler.js` |
| 修改页面切换 | `frontend/page-switcher.js` |
| 修改提交逻辑 | `frontend/confirm-handler.js` + `gas/Code.gs` |
| 添加工具函数 | `frontend/utils.js` |
| 修改 UI 样式 | `frontend/styles.css` |

---

## 📋 模块职责速查表

### 后端 (GAS)

| 文件 | 职责 |
|------|------|
| Code.gs | 主入口、路由 (action 参数) |
| Parser.gs | 收据解析逻辑 |
| VisionAPI.gs | OCR 调用 |
| SheetWriter.gs | Sheet 操作 |
| Config.gs | 配置管理 |

### 前端 (Modular JS)

| 文件 | 命名空间 | 职责 |
|------|---------|------|
| image-handler.js | `ImageHandler` | 拍照、相册、预览 |
| page-switcher.js | `PageSwitcher` | 页面切换 ✨ v1.2 |
| confirm-handler.js | `ConfirmHandler` | 确认页逻辑 ✨ v1.2 |
| upload-handler.js | `UploadHandler` | 上传流程 |
| utils.js | 全局函数 | 工具函数 |
| config.js | `APP_CONFIG` | 前端配置 |

---

## 🚨 关键约束（必须遵守）

### 1. ES5 语法
```javascript
// ❌ 禁止
const x = 1;
let y = 2;
const fn = () => {};
arr.find(x => x > 1);

// ✅ 必须
var x = 1;
var y = 2;
function fn() {}
for (var i = 0; i < arr.length; i++) { ... }
```

### 2. 模块化规范
- 使用 **IIFE + 命名空间模式**
- 私有变量/函数放在闭包内
- 只暴露必要的公开接口

### 3. 代码风格
- 函数长度 < 50 行
- 必须添加 JSDoc 注释
- 驼峰命名法 (camelCase)
- 常量用 UPPER_SNAKE_CASE

---

## 💡 在新对话中的使用方法

### 场景 1: 修改某个模块
```
[粘贴 context.md]
[粘贴要修改的模块代码]

需求: [描述需求]
```

### 场景 2: 跨模块修改
```
[粘贴 context.md]
[粘贴多个相关模块代码]

需求: [描述需求]
```

### 场景 3: 修改确认页面
```
[粘贴 context.md]
[粘贴 confirm-handler.js]
[粘贴 page-switcher.js]

需求: [描述需求]
```

---

## 🎯 关键设计模式

### 命名空间模式
```javascript
var ModuleName = (function() {
    var privateVar = null;
    
    function privateFunc() {}
    
    return {
        publicMethod: function() {}
    };
})();
```

### 跨模块通信
```javascript
// upload-handler.js
PageSwitcher.showConfirmPage(data.result, data.ocrText);

// page-switcher.js
ConfirmHandler.renderData(data, ocrText);
```

---

## 📝 常见问题速查

### Q: 为什么不用 ES6?
A: Google Apps Script 只支持 ES5

### Q: 如何测试模块?
```javascript
// 浏览器控制台
ImageHandler.selectFromGallery();
PageSwitcher.showConfirmPage(testData, 'OCR文本');
```

### Q: 识别后没跳转到确认页?
A: 检查：
1. `upload-handler.js` 是否调用 `PageSwitcher.showConfirmPage()`
2. 脚本加载顺序是否正确
3. 浏览器控制台是否有错误

### Q: 确认页表单无法填充?
A: 检查：
1. `confirm-handler.js` 是否加载
2. 表单字段 ID 是否匹配
3. 后端返回数据是否包含 `ocrText`

### Q: 提交到 Sheet 失败?
A: 检查：
1. 后端 `Code.gs` 是否支持 `action: 'submit'`
2. Sheet 表头是否更新（需包含：金额、店名、税率、T番号）

---

## 🔧 快速调试

### 前端
```javascript
// 检查模块加载
console.log(typeof PageSwitcher);    // "object"
console.log(typeof ConfirmHandler);  // "object"

// 测试页面切换
PageSwitcher.showConfirmPage({
    date: '2025-11-02',
    amount: 1250,
    store: 'テスト店',
    taxRate: '10%',
    hasTNumber: '有',
    confidence: '85%'
}, 'OCR原文测试');

// 检查当前页面
console.log(PageSwitcher.getCurrentPage());
```

### 后端
```javascript
// GAS 编辑器
Logger.log(CONFIG.DEBUG_MODE);
testFullFlow();
```

---

## 📌 重要提示

1. **ES5 合规性**: 不使用任何 ES6+ 特性
2. **模块职责单一**: 一个文件只做一件事
3. **函数简短**: < 50 行，超过就拆分
4. **注释完整**: 每个函数必须有 JSDoc

---

## 🚀 开始使用

**基本用法**:
```
我要修改 [功能名称]

[粘贴本 context.md]
[粘贴相关模块代码]

具体需求: [描述需求]
```

**v1.2 新增模块提示**:
- 修改确认页 → 粘贴 `confirm-handler.js` + `page-switcher.js`
- 修改页面切换 → 粘贴 `page-switcher.js`
- 修改提交逻辑 → 粘贴 `confirm-handler.js` + `Code.gs`

---

## 🔗 相关文档

- [工作流程详解](workflow.md) - 完整流程图和版本对比
- [项目 README](../README.md) - 项目概述和配置指南

---

**最后更新**: 2025-11-02  
**项目版本**: v1.2  
**维护者**: @chenyongping

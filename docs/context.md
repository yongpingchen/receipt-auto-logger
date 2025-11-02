# Receipt Auto Logger - Quick Context (新对话必读)

> **用途**: 在新的 Claude 对话中，只需粘贴此文档 + 相关模块代码，即可快速建立上下文

---

## 🎯 项目简介

**收据自动识别系统** - 手机拍照识别日文收据，自动提取信息并记录到 Google Sheet

**技术栈**:
- 后端: Google Apps Script (ES5 语法)
- OCR: Google Cloud Vision API
- 前端: HTML/CSS/JS (模块化)

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
    ├── test.html          # UI 结构（仅 UI）
    ├── styles.css         # 样式表
    ├── config.js          # 配置常量
    ├── utils.js           # 通用工具函数
    ├── image-handler.js   # 图片处理 ⭐ 拍照/相册
    └── upload-handler.js  # 上传流程 ⭐ 识别流程
```

---

## 🔍 快速定位指南

### 用户说...                     → 修改文件
- "改进金额识别"                  → `gas/Parser.gs`
- "修改 OCR 调用"                 → `gas/VisionAPI.gs`
- "改变 Sheet 写入格式"           → `gas/SheetWriter.gs`
- "修改拍照/相册功能"             → `frontend/image-handler.js`
- "改进上传流程"                  → `frontend/upload-handler.js`
- "添加工具函数"                  → `frontend/utils.js`
- "修改 UI 样式"                  → `frontend/test.html` + `styles.css`
- "修改配置项"                    → `gas/Config.gs` 或 `frontend/config.js`

---

## 📋 模块职责速查表

### 后端 (GAS)

| 文件 | 职责 | 常见任务 |
|------|------|----------|
| Code.gs | 主入口、路由 | 修改 API 接口、错误处理 |
| Parser.gs | 收据解析逻辑 | 改进识别规则、提取算法 |
| VisionAPI.gs | OCR 调用 | 修改 API 参数、错误处理 |
| SheetWriter.gs | Sheet 操作 | 修改写入格式、添加列 |
| Config.gs | 配置管理 | 修改阈值、开关 |

### 前端 (Modular JS)

| 文件 | 职责 | 导出命名空间 |
|------|------|------------|
| image-handler.js | 拍照、相册、预览、保存 | `ImageHandler` |
| upload-handler.js | 上传流程控制 | `UploadHandler` |
| utils.js | 通用工具函数 | 全局函数 |
| config.js | 前端配置 | `APP_CONFIG` |

---

## 🚨 关键约束（必须遵守）

### 1. ES5 语法（GAS 和前端都是）
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
// 使用 for 循环替代 find
```

### 2. 模块化规范（前端）
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

---

## 🪙 Token 优化规则（重要）

> **目标**: 在保持清晰的前提下，最小化 Token 消耗

### 代码回复最小化原则

Claude 在回复代码修改时，遵循 **"最小必要改动"** 原则：

#### 📏 回复粒度

| 修改范围 | 回复内容 | Token 消耗 |
|---------|---------|-----------|
| 1-2 行代码 | 只给修改的行 + 2 行上下文 | ~50 tokens ⭐⭐⭐⭐⭐ |
| 单个函数 | 只给该函数的完整代码 | ~200 tokens ⭐⭐⭐⭐ |
| 多个函数 | 逐个列出，带文件名和行号 | ~500 tokens ⭐⭐⭐ |
| 整个文件 | 给出完整文件（仅当必要） | ~1000+ tokens ⭐⭐ |

#### 📋 标准回复格式
```
📍 文件：frontend/utils.js
🔧 修改：第 44 行

找到：
  xhr.setRequestHeader('Content-Type', 'application/json');

替换为：
  xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');

💡 说明：避免 CORS 预检请求
```

#### 🎯 何时给完整代码

**只有以下情况才给完整文件：**
- 用户明确要求："给我完整的 X 文件"
- 创建新文件
- 重构整个模块
- 修改超过 5 处且分散

#### ✅ 用户反馈

如果 Claude 回复太长，用户可以说：
- "只要改动部分"
- "只要 diff"
- "太长了"

---

### 场景 1: 修改某个模块

**你只需提供**:
1. 本文档 (CONTEXT.md)
2. 要修改的模块代码 (如 `upload-handler.js`)
3. 你的需求描述

**示例**:
```
[粘贴 CONTEXT.md]
[粘贴 upload-handler.js 代码]

需求: 在上传前添加图片压缩功能
```

### 场景 2: 跨模块修改

**你需提供**:
1. 本文档 (CONTEXT.md)
2. 相关的多个模块代码
3. 你的需求描述

**示例**:
```
[粘贴 CONTEXT.md]
[粘贴 utils.js]
[粘贴 upload-handler.js]

需求: 添加图片压缩，并在上传前应用
```

### 场景 3: 添加新功能

**你需提供**:
1. 本文档 (CONTEXT.md)
2. 可能涉及的模块代码
3. 功能描述

**示例**:
```
[粘贴 CONTEXT.md]
[粘贴 image-handler.js]

需求: 添加图片裁剪功能
```

---

## 🎯 关键设计模式

### 前端命名空间模式
```javascript
var ImageHandler = (function() {
    // 私有变量
    var privateVar = null;
    
    // 私有函数
    function privateFunc() {}
    
    // 公开接口
    return {
        publicMethod1: function() {},
        publicMethod2: function() {}
    };
})();
```

### 后端错误处理模式
```javascript
function someFunction() {
    try {
        debugLog('开始处理');
        // 业务逻辑
        debugLog('处理完成');
    } catch (error) {
        debugLog('❌ 错误: ' + error.toString());
        throw error;
    }
}
```

---

## 📝 常见问题速查

### Q: 为什么不用 ES6?
A: Google Apps Script 只支持 ES5

### Q: 前端为什么用命名空间?
A: 避免全局变量污染，模块间职责清晰

### Q: 如何测试某个模块?
A: 在浏览器控制台直接调用命名空间方法
```javascript
ImageHandler.selectFromGallery();
UploadHandler.uploadReceipt();
```

### Q: 修改某个功能需要看几个文件?
A: 通常只需要 1-2 个文件（这就是模块化的优势）

---

## 🔧 快速调试

### 前端调试
```javascript
// 浏览器控制台
console.log(ImageHandler.getCurrentFile());
console.log(APP_CONFIG);
```

### 后端调试
```javascript
// GAS 编辑器
Logger.log(CONFIG.DEBUG_MODE);
testFullFlow();  // 运行测试函数
```

---

## 📌 重要提示

1. **始终检查 ES5 合规性**: 不要使用任何 ES6+ 特性
2. **模块职责单一**: 一个文件只做一件事
3. **函数简短**: < 50 行，超过就拆分
4. **注释完整**: 每个函数必须有 JSDoc

---

## 🚀 开始使用

在新对话中，直接说：

```
我要修改 [功能名称]

[粘贴本 CONTEXT.md]
[粘贴相关模块代码]

具体需求: [描述你的需求]
```

Claude 会根据上下文，只返回需要修改的模块代码，节省 Token！

---

**最后更新**: 2025-11-02
**项目版本**: v1.0
**维护者**: @chenyongping
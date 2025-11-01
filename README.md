# 📸 Receipt Auto Logger

自动识别收据并记录到 Google Sheet 的报账助手

---

## 🎯 项目概述

基于 Google Apps Script 的收据自动识别系统，通过拍照上传收据，自动提取关键信息并记录到 Google Sheet。

### 核心功能

- ✅ OCR 识别日文收据
- ✅ 自动提取日期、金额、店名、税率
- ✅ T 番号识别（日本发票制度）
- ✅ 自动上传并重命名文件
- ✅ 写入 Google Sheet
- ✅ 手机端拍照上传

### 技术栈

- **后端**: Google Apps Script (ES5)
- **OCR**: Google Cloud Vision API
- **存储**: Google Sheets + Google Drive
- **前端**: HTML/JavaScript

---

## 📁 项目结构

```
receipt-auto-logger/
├── gas/              # GAS 后端代码
├── frontend/         # 前端测试界面
├── docs/             # 项目文档
├── workflows/        # 任务管理
├── sync/             # 跨工具同步（不提交 Git）
├── tests/            # 测试文件
└── scripts/          # 工具脚本
```

---

## 🚀 快速开始

### 前置要求

1. Google 账号
2. Google Cloud 项目（启用 Vision API）
3. Google Sheet（创建报账表格）

### 配置步骤

详见 [docs/setup.md](docs/setup.md)

---

## 💻 开发指南

### 开发工具组合

```
Cursor Free       → 日常编码（Cmd+K）
Claude.ai Pro     → 架构设计和代码审查
ChatGPT Plus      → 技术调研（联网搜索）
```

### 代码规范

- ✅ ES5 语法（var, function）
- ✅ 使用 debugLog() 而非 console.log()
- ✅ 添加 JSDoc 注释
- ✅ 函数长度 < 50 行

详见 [.cursorrules](.cursorrules)

---

## 📋 任务管理

### 创建新任务

```bash
./scripts/new-task.sh TASK-001
```

### 清空同步文件

```bash
./scripts/clear-sync.sh
```

---

## 📊 项目状态

**当前版本**: v1.0.0  
**最后更新**: 2025-11-01

---

## 📞 联系方式

- 作者: @chenyongping
- 项目: receipt-auto-logger

---

**祝开发顺利！** 🚀

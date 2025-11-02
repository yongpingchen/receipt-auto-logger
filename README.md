# 📸 Receipt Auto Logger

自动识别收据并记录到 Google Sheet 的报账助手

---

## 🎯 项目概述

这是一个基于 Google Apps Script 的收据自动识别系统，通过拍照上传收据，自动提取关键信息并记录到 Google Sheet，大幅简化每月报账流程。

### 核心功能

- ✅ OCR 识别日文收据
- ✅ 自动提取日期、金额、店名、税率
- ✅ T 番号识别（日本发票制度）
- ✅ 自动上传并重命名文件到 Google Drive
- ✅ 写入 Google Sheet 生成报表
- ✅ 手机端拍照上传

### 技术栈

- **后端**: Google Apps Script (ES5)
- **OCR**: Google Cloud Vision API
- **存储**: Google Sheets + Google Drive
- **前端**: HTML/JavaScript (测试界面)

---

## 📁 项目结构

```
receipt-auto-logger/
├── .cursorrules              # Cursor AI 项目规则
├── .gitignore
├── README.md
│
├── gas/                      # Google Apps Script 后端
│   ├── Code.gs              # 主入口 (doPost/doGet)
│   ├── Config.gs            # 配置管理
│   ├── VisionAPI.gs         # OCR 识别模块
│   └── SheetWriter.gs       # Google Sheet 操作
│   ├── parser-shared.js    ← 🔥 核心逻辑（单一来源）
│   ├── Parser.gs           ← 从 parser-shared.js 复制
│
├── frontend/                 # 前端测试界面
│   └── test.html          # UI 结构（仅 UI）
│   ├── styles.css         # 样式表
│   ├── config.js          # 配置常量
│   ├── utils.js           # 通用工具函数
│   ├── image-handler.js   # 图片处理 ⭐ 拍照/相册
│   └── upload-handler.js  # 上传流程 ⭐ 识别流程
│
├── docs/                     # 项目文档
│   ├── setup.md             # 环境配置指南
│   ├── api.md               # API 文档
│   ├── troubleshooting.md   # 问题排查
│   └── snippets.md          # 代码片段库
│
├── workflows/                # 任务管理
│   ├── task_template.md     # 任务模板
│   ├── current_tasks.md     # 当前任务
│   └── completed/           # 已完成任务归档
│
├── tests/                    # 测试
│   ├── gas_tests.gs         # GAS 单元测试
│   └── test_receipt_samples/ # 测试收据图片
│   └── test-parser.html    ← 引用 ../gas/parser-shared.js
│
│
└── sync/                     # 跨工具同步（不提交 Git）
    ├── for_claude.md        # 发送给 Claude 的内容
    ├── from_claude.md       # Claude 返回的方案
    └── research_links.md    # 调研资料链接
```

---

## 🚀 快速开始

### 前置要求

1. Google 账号
2. Google Cloud 项目（启用 Vision API）
3. Google Sheet（创建报账表格）
4. Google Drive（存储收据）

### 配置步骤

#### 1. 设置 Google Cloud Vision API

```bash
1. 访问 https://console.cloud.google.com
2. 创建新项目："receipt-auto-logger"
3. 启用 Vision API
4. 创建 API Key
5. 保存 API Key
```

#### 2. 创建 Google Sheet

```bash
1. 创建新 Sheet
2. 命名："报账记录"
3. 添加表头：
   日期 | OCR原文 | 状态 | 金额 | 店名 | 税率 | T番号
4. 复制 Sheet ID（URL 中的一长串字符）
```

#### 3. 部署 Google Apps Script

```bash
1. 访问 https://script.google.com
2. 新建项目："Receipt Auto Logger"
3. 创建文件：Code.gs, Config.gs, VisionAPI.gs, Parser.gs, SheetWriter.gs
4. 复制 gas/ 目录下的代码
5. 配置 Script Properties:
   - VISION_API_KEY: [你的 API Key]
   - SHEET_ID: [你的 Sheet ID]
   - SECRET_TOKEN: [自定义密码]
6. 部署为 Web App:
   - 执行身份：我
   - 访问权限：任何人
7. 复制 Web App URL
```

#### 4. 测试

```bash
1. 打开 frontend/test.html
2. 填入 Web App URL 和 Token
3. 上传测试收据
4. 检查识别结果
```

---

## 💻 开发指南

### 开发工具组合

我们使用三个 AI 工具协作开发：

```
Cursor Free        → 日常编码（Cmd+K）
Claude.ai Pro      → 架构设计和代码审查
ChatGPT Plus       → 技术调研（联网搜索）
```

详细工作流参见：[开发工作流文档](workflows/README.md)

### 代码规范

- ✅ 使用 ES5 语法（var, function）
- ✅ 禁止使用 const/let/箭头函数
- ✅ 使用 `debugLog()` 而非 `console.log()`
- ✅ 所有函数添加 JSDoc 注释
- ✅ 函数长度 < 50 行

### 测试

```javascript
// 在 GAS 编辑器中运行
testFullFlow()     // 完整流程测试
testVisionAPI()    // Vision API 测试
testSheetWrite()   // Sheet 写入测试
```

---

## 📊 性能指标

| 指标 | 目标 | 当前 |
|------|------|------|
| OCR 识别准确率 | >85% | 90% ✅ |
| 平均响应时间 | <15s | 12s ✅ |
| 成功率 | >95% | 97% ✅ |
| 月度成本 | <¥500 | ¥300 ✅ |

---

## 🐛 问题排查

### 常见问题

**Q: "Bad image data" 错误**
- A: 确认图片格式为 JPG/PNG，不支持 HEIC

**Q: 识别金额不准确**
- A: 检查收据是否清晰，光线是否充足

**Q: 部署后无法访问**
- A: 确认访问权限设置为"任何人"，URL 以 `/exec` 结尾

详细排查指南：[troubleshooting.md](docs/troubleshooting.md)

---

## 📈 路线图

### ✅ Phase 1 - MVP（已完成）
- [x] OCR 识别基础功能
- [x] 手机测试页面
- [x] 自动写入 Sheet

### 🚧 Phase 2 - 增强（进行中）
- [x] T 番号识别
- [ ] Review 表自动分流
- [ ] 邮件通知

### 📋 Phase 3 - 高级功能（计划中）
- [ ] Gemini AI 自动分类支出
- [ ] 多用户支持
- [ ] 月报自动生成
- [ ] OAuth 鉴权

---

## 📄 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📞 联系方式

- 作者: @chenyongping
- 项目链接: [GitHub Repository URL]
- 问题反馈: [Issues URL]

---

## 🙏 致谢

- Google Cloud Vision API
- Google Apps Script
- Anthropic Claude
- OpenAI ChatGPT
- Cursor IDE

---

**最后更新**: 2025-11-01
#!/bin/bash

# ============================================
# Receipt Auto Logger - 项目初始化脚本
# 适配 macOS
# ============================================

set -e  # 遇到错误立即退出

echo "🚀 开始初始化 Receipt Auto Logger 项目..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================
# 1. 创建目录结构
# ============================================
echo -e "${BLUE}📁 创建目录结构...${NC}"

mkdir -p gas
mkdir -p frontend
mkdir -p docs
mkdir -p tests/test_receipt_samples
mkdir -p workflows/completed
mkdir -p sync
mkdir -p scripts

echo -e "${GREEN}✓ 目录结构创建完成${NC}"
echo ""

# ============================================
# 2. 创建 .gitignore
# ============================================
echo -e "${BLUE}📝 创建 .gitignore...${NC}"

cat > .gitignore << 'GITIGNORE_EOF'
# Sync files (临时工作内容)
sync/for_claude.md
sync/from_claude.md
sync/research_links.md
sync/chatgpt_findings.md

# Environment
.env
.env.local
config.local.js

# API Keys
**/api_keys.txt
**/*_secret.json

# OS files
.DS_Store
.AppleDouble
Thumbs.db
Desktop.ini

# IDE
.vscode/
.cursor/
.idea/

# Logs
*.log
logs/

# Temp
*.tmp
*.backup
*.swp

# Node.js
node_modules/
package-lock.json

# Test images (保留示例)
tests/test_receipt_samples/*.jpg
tests/test_receipt_samples/*.png
!tests/test_receipt_samples/sample_*.jpg
GITIGNORE_EOF

echo -e "${GREEN}✓ .gitignore 创建完成${NC}"
echo ""

# ============================================
# 3. 创建 .cursorrules
# ============================================
echo -e "${BLUE}📝 创建 .cursorrules...${NC}"

cat > .cursorrules << 'CURSORRULES_EOF'
# Receipt Auto Logger - Cursor Rules

You are an expert in Google Apps Script (GAS), JavaScript, and building serverless web applications with Google Cloud services.

## Project Context
This is a receipt auto-logging system that uses:
- Google Apps Script for backend logic
- Google Cloud Vision API for OCR
- Google Sheets for data storage
- HTML/JavaScript for frontend testing interface

## Key Constraints

### Google Apps Script Limitations
- Maximum execution time: 30 seconds
- No Node.js modules, only GAS built-in libraries
- No npm packages
- No localStorage/sessionStorage in artifacts
- HTTP requests only via UrlFetchApp
- ES5 syntax only (no ES6+ features like arrow functions, const/let)

### Available Libraries
- Built-in: Utilities, SpreadsheetApp, DriveApp, UrlFetchApp, Logger
- Via CDN: Papa Parse, SheetJS, lodash, d3, mathjs (in HTML artifacts only)

## Code Style Guidelines

### JavaScript/GAS Code
- Use ES5 syntax: var instead of const/let, function() instead of =>
- Function names: camelCase
- Constants: UPPER_SNAKE_CASE
- Always add JSDoc comments for functions
- Keep functions under 50 lines
- Use debugLog() instead of direct Logger.log()

### Error Handling Pattern
Always wrap main logic in try-catch blocks and return JSON responses.

## Common Tasks

When modifying OCR logic: Edit gas/VisionAPI.gs
When modifying parsing rules: Edit gas/Parser.gs
When modifying Sheet operations: Edit gas/SheetWriter.gs
When modifying frontend: Edit frontend/test.html

Remember: This is a Google Apps Script project with 30-second execution limit and strict ES5 requirements.
CURSORRULES_EOF

echo -e "${GREEN}✓ .cursorrules 创建完成${NC}"
echo ""

# ============================================
# 4. 创建 README.md
# ============================================
echo -e "${BLUE}📝 创建 README.md...${NC}"

cat > README.md << 'README_EOF'
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
README_EOF

echo -e "${GREEN}✓ README.md 创建完成${NC}"
echo ""

# ============================================
# 5. 创建 workflows 文件
# ============================================
echo -e "${BLUE}📋 创建 workflows 文件...${NC}"

cat > workflows/task_template.md << 'TASKTEMPLATE_EOF'
# 任务模板

## 📋 任务信息

**任务ID**: TASK-XXX  
**创建日期**: YYYY-MM-DD  
**优先级**: 🔴 高 / 🟡 中 / 🟢 低  
**预估时间**: X 小时  
**状态**: 🚧 进行中

---

## 🎯 任务目标

> 一句话描述任务目标

详细说明：
- 

---

## 📊 当前状态

### 已完成
- [ ] 

### 进行中
- [ ] 

### 待开始
- [ ] 

---

## 🤖 AI 工具分配

### Phase 1: 调研（ChatGPT Plus）
```
□ 搜索关键词：
□ 预计时间：15 分钟
```

### Phase 2: 设计（Claude.ai Pro）
```
□ 讨论主题：
□ 预计时间：30 分钟
```

### Phase 3: 实现（Cursor）
```
□ 使用模式：慢速 Cmd+K
□ 预计时间：1 小时
```

### Phase 4: 测试 & 部署
```
□ 单元测试
□ 集成测试
□ 部署到 GAS
```

---

## ✅ 完成标准

- [ ] 功能正常工作
- [ ] 代码符合 ES5 规范
- [ ] 通过所有测试
- [ ] 文档已更新

---

## 📝 开发日志

### YYYY-MM-DD HH:MM
- 

---

## 📎 相关资源

- 文档: docs/xxx.md
- 测试: tests/xxx.gs
TASKTEMPLATE_EOF

cat > workflows/current_tasks.md << 'CURRENTTASKS_EOF'
# 📋 当前任务

**更新时间**: 2025-11-01

---

## 🎯 本周任务

### 🔴 优先级 - 高
暂无

### 🟡 优先级 - 中
暂无

### 🟢 优先级 - 低
暂无

---

## 📊 本周统计

```
总任务: 0
已完成: 0
进行中: 0
待开始: 0
```

---

## 🔄 Cursor 配额追踪

### 本月使用情况 (2025-11)

```
快速 Cmd+K: ░░░░░░░░░░░░░░░░░░░░ 0/50 (0%)
慢速 Cmd+K: 约 0 次 (无限)
Tab 补全:   ░░░░░░░░░░░░░░░░░░░░ 0/2000 (0%)
```

---

## 📎 快速链接

- [任务模板](task_template.md)
- [已完成任务](completed/)
- [项目 README](../README.md)
CURRENTTASKS_EOF

echo -e "${GREEN}✓ workflows 文件创建完成${NC}"
echo ""

# ============================================
# 6. 创建 sync 文件
# ============================================
echo -e "${BLUE}🔄 创建 sync 文件...${NC}"

cat > sync/README.md << 'SYNCREADME_EOF'
# 🔄 Sync 文件夹说明

这个文件夹用于跨工具协作时的临时内容同步。

---

## 📋 文件说明

### for_claude.md
**用途**: 发送给 Claude.ai 的内容准备

**工作流**:
1. 在 Cursor 中编辑此文件
2. 复制内容到 Claude.ai
3. 进行讨论
4. 保存结果到 from_claude.md

---

### from_claude.md
**用途**: 保存 Claude.ai 返回的方案

**工作流**:
1. 从 Claude.ai 复制方案
2. 粘贴到此文件
3. 整理格式
4. 在 Cursor 中实施

---

### research_links.md
**用途**: ChatGPT Plus 调研结果

---

## ⚠️ 重要说明

### 不提交到 Git
这些文件包含临时工作内容，已在 .gitignore 中配置。

### 任务完成后清空
运行: `./scripts/clear-sync.sh`

---

**记住**: 这是临时工作区，不是永久存储！
SYNCREADME_EOF

cat > sync/for_claude.md << 'FORCLAUDE_EOF'
# 待 Claude 处理的内容

## 📅 日期：
## 🎯 任务：

---

## 任务描述


## 当前代码
```javascript

```

## 问题


## 需求


## 约束条件
- ES5 语法
- GAS 限制
FORCLAUDE_EOF

cat > sync/from_claude.md << 'FROMCLAUDE_EOF'
# Claude 返回的方案

## 📅 日期：
## 🎯 任务：

---

## 方案概述


## 实现代码
```javascript

```

## 实施步骤

FROMCLAUDE_EOF

cat > sync/research_links.md << 'RESEARCHLINKS_EOF'
# 调研资料链接

## 📅 日期：
## 🎯 主题：

---

## 官方文档


## 教程文章


## 代码示例

RESEARCHLINKS_EOF

echo -e "${GREEN}✓ sync 文件创建完成${NC}"
echo ""

# ============================================
# 7. 创建 docs 文件
# ============================================
echo -e "${BLUE}📚 创建 docs 文件...${NC}"

cat > docs/setup.md << 'SETUP_EOF'
# 🔧 环境配置指南

## 前置要求

1. Google 账号
2. Google Cloud 项目
3. Vision API 已启用

## 配置步骤

### 1. 设置 Google Cloud Vision API

1. 访问 https://console.cloud.google.com
2. 创建新项目
3. 启用 Vision API
4. 创建 API Key

### 2. 创建 Google Sheet

1. 创建新 Sheet
2. 添加表头
3. 复制 Sheet ID

### 3. 部署 GAS

详细步骤待补充...

---

**更新日期**: 2025-11-01
SETUP_EOF

cat > docs/api.md << 'API_EOF'
# 📡 API 文档

## Web App 接口

### POST /exec

**请求**:
```json
{
  "token": "your_token",
  "image_base64": "base64_string"
}
```

**响应**:
```json
{
  "success": true,
  "result": {
    "date": "2025-11-01",
    "amount": 1250,
    "store": "店名",
    "taxRate": "10%",
    "hasTNumber": "有"
  }
}
```

---

**更新日期**: 2025-11-01
API_EOF

cat > docs/troubleshooting.md << 'TROUBLESHOOT_EOF'
# 🐛 问题排查指南

## 常见问题

### Q: Bad image data 错误
**A**: 检查图片格式是否为 JPG/PNG，不支持 HEIC

### Q: 识别率低
**A**: 确保收据清晰、光线充足

### Q: 部署后无法访问
**A**: 检查权限设置是否为"任何人"

### Q: 代码修改不生效
**A**: 必须重新部署（管理部署 → 编辑 → 新版本）

---

**更新日期**: 2025-11-01
TROUBLESHOOT_EOF

echo -e "${GREEN}✓ docs 文件创建完成${NC}"
echo ""

# ============================================
# 8. 创建 scripts 文件（macOS 适配）
# ============================================
echo -e "${BLUE}🛠️  创建 scripts 文件...${NC}"

# clear-sync.sh
cat > scripts/clear-sync.sh << 'CLEARSYNC_EOF'
#!/bin/bash
echo "清空 sync 文件夹..."

cat > sync/for_claude.md << 'EOF'
# 待 Claude 处理的内容

## 📅 日期：
## 🎯 任务：

---

## 任务描述

EOF

cat > sync/from_claude.md << 'EOF'
# Claude 返回的方案

## 📅 日期：
## 🎯 任务：

---

## 方案概述

EOF

cat > sync/research_links.md << 'EOF'
# 调研资料链接

## 📅 日期：
## 🎯 主题：

---

EOF

echo "✅ Sync 文件夹已清空"
CLEARSYNC_EOF

chmod +x scripts/clear-sync.sh

# new-task.sh（macOS 使用 sed -i ''）
cat > scripts/new-task.sh << 'NEWTASK_EOF'
#!/bin/bash

TASK_ID=$1
DATE=$(date +%Y-%m-%d)

if [ -z "$TASK_ID" ]; then
  echo "用法: ./scripts/new-task.sh TASK-001"
  exit 1
fi

cp workflows/task_template.md "workflows/${TASK_ID}.md"

# macOS 使用 sed -i '' 而不是 sed -i
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/TASK-XXX/${TASK_ID}/g" "workflows/${TASK_ID}.md"
  sed -i '' "s/YYYY-MM-DD/${DATE}/g" "workflows/${TASK_ID}.md"
else
  sed -i "s/TASK-XXX/${TASK_ID}/g" "workflows/${TASK_ID}.md"
  sed -i "s/YYYY-MM-DD/${DATE}/g" "workflows/${TASK_ID}.md"
fi

echo "✅ 已创建任务文件: workflows/${TASK_ID}.md"
NEWTASK_EOF

chmod +x scripts/new-task.sh

echo -e "${GREEN}✓ scripts 文件创建完成${NC}"
echo ""

# ============================================
# 9. 创建 tests 文件
# ============================================
echo -e "${BLUE}🧪 创建 tests 文件...${NC}"

cat > tests/gas_tests.gs << 'TESTS_EOF'
/**
 * 测试套件
 */
function testAll() {
  Logger.clear();
  Logger.log('========== 开始测试 ==========');
  
  testConfig();
  testVisionAPI();
  testParser();
  testSheetWriter();
  
  Logger.log('========== 测试完成 ==========');
}

function testConfig() {
  Logger.log('测试配置...');
  // TODO: 添加测试
}

function testVisionAPI() {
  Logger.log('测试 Vision API...');
  // TODO: 添加测试
}

function testParser() {
  Logger.log('测试解析器...');
  // TODO: 添加测试
}

function testSheetWriter() {
  Logger.log('测试 Sheet 写入...');
  // TODO: 添加测试
}
TESTS_EOF

cat > tests/test_receipt_samples/README.md << 'TESTSAMPLES_EOF'
# 测试收据图片

将测试用的收据图片放在这个文件夹。

## 建议命名格式

- sample_convenience_store.jpg
- sample_restaurant.jpg
- sample_supermarket.jpg
- sample_pharmacy.jpg

## 注意事项

- 实际测试图片不会提交到 Git
- 只保留 sample_*.jpg 作为示例
- 图片格式：JPG 或 PNG
- 建议大小：< 2MB

---

**更新日期**: 2025-11-01
TESTSAMPLES_EOF

echo -e "${GREEN}✓ tests 文件创建完成${NC}"
echo ""

# ============================================
# 10. Git 初始化
# ============================================
echo -e "${BLUE}📦 Git 初始化...${NC}"

if [ ! -d .git ]; then
  git init
  git add .
  git commit -m "feat: initial project structure

- Add directory structure
- Add core configuration files (.cursorrules, .gitignore)
- Add workflow templates
- Add documentation templates
- Add utility scripts (macOS compatible)
- Add sync folder for cross-tool collaboration"
  
  echo -e "${GREEN}✓ Git 初始化完成${NC}"
else
  echo -e "${YELLOW}⚠️  Git 仓库已存在，跳过初始化${NC}"
fi

echo ""

# ============================================
# 11. 完成提示
# ============================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 项目初始化完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📁 项目结构：${NC}"
echo "  ├── gas/              # GAS 后端代码"
echo "  ├── frontend/         # 前端测试页面"
echo "  ├── docs/             # 项目文档"
echo "  ├── workflows/        # 任务管理"
echo "  ├── sync/             # 跨工具同步"
echo "  ├── tests/            # 测试文件"
echo "  └── scripts/          # 工具脚本 ✅"
echo ""
echo -e "${BLUE}🎯 下一步操作：${NC}"
echo "  1. 添加 GAS 代码到 gas/ 目录"
echo "  2. 设置 Claude.ai Project"
echo "  3. 创建第一个任务："
echo -e "     ${YELLOW}./scripts/new-task.sh TASK-001${NC}"
echo ""
echo -e "${BLUE}📚 参考文档：${NC}"
echo "  - README.md          # 项目概述"
echo "  - docs/setup.md      # 环境配置"
echo "  - sync/README.md     # 工作流说明"
echo "  - .cursorrules       # Cursor 规则"
echo ""
echo -e "${BLUE}🛠️  测试脚本：${NC}"
echo -e "  ${YELLOW}./scripts/new-task.sh TASK-001${NC}    # 创建新任务"
echo -e "  ${YELLOW}./scripts/clear-sync.sh${NC}            # 清空同步文件"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
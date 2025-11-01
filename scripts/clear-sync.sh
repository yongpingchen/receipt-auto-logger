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

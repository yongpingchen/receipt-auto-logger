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

#!/bin/bash

# ============================================
# 🚀 一键部署脚本（无交互版本）
# ============================================
# 用途: 自动将 frontend/ 部署到 gh-pages（无需手动确认）
# 使用: ./quick-deploy.sh
# ============================================

set -e

# 颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 开始自动部署...${NC}"

# 1. 检查
if [ ! -d .git ] || [ ! -d frontend ]; then
    echo "❌ 错误: 请在项目根目录运行"
    exit 1
fi

# 2. 保存当前分支
CURRENT_BRANCH=$(git branch --show-current)

# 3. 切换到 gh-pages（如果不存在则创建）
if git show-ref --verify --quiet refs/heads/gh-pages; then
    git checkout gh-pages
else
    git checkout --orphan gh-pages
    git rm -rf . 2>/dev/null || true
fi

# 4. 备份 CNAME
[ -f CNAME ] && mv CNAME /tmp/CNAME.backup

# 5. 清理并复制
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +
git checkout "$CURRENT_BRANCH" -- frontend/
mv frontend/* .
rm -rf frontend/

# 6. 恢复 CNAME
[ -f /tmp/CNAME.backup ] && mv /tmp/CNAME.backup CNAME

# 7. 提交并推送
git add .
if [ -n "$(git status --porcelain)" ]; then
    git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin gh-pages --force
    echo -e "${GREEN}✅ 部署成功!${NC}"
else
    echo "⚠️  没有更改"
fi

# 8. 切换回原分支
git checkout "$CURRENT_BRANCH"

# 9. 显示访问地址
REMOTE_URL=$(git config --get remote.origin.url)
if [[ $REMOTE_URL =~ github.com[:/]([^/]+)/([^/.]+) ]]; then
    USERNAME="${BASH_REMATCH[1]}"
    REPO="${BASH_REMATCH[2]}"
    echo ""
    echo -e "${GREEN}🌐 访问: https://${USERNAME}.github.io/${REPO}/${NC}"
fi
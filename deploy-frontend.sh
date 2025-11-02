#!/bin/bash

# ============================================
# 📦 Frontend 自动部署到 GitHub Pages
# ============================================
# 用途: 将 main 分支的 frontend/ 文件夹同步到 gh-pages 分支
# 环境: macOS
# 作者: @chenyongping
# 最后更新: 2025-11-02
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ============================================
# 1. 前置检查
# ============================================

print_info "开始部署流程..."
echo ""

# 检查是否在 Git 仓库中
if [ ! -d .git ]; then
    print_error "当前目录不是 Git 仓库！"
    exit 1
fi

# 检查 frontend 文件夹是否存在
if [ ! -d frontend ]; then
    print_error "frontend/ 文件夹不存在！"
    exit 1
fi

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
print_info "当前分支: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    print_warning "当前不在 main/master 分支，是否继续? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        print_info "已取消部署"
        exit 0
    fi
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    print_warning "检测到未提交的更改:"
    git status --short
    echo ""
    print_warning "是否先提交这些更改? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        print_info "请输入 commit 消息:"
        read -r commit_msg
        git add .
        git commit -m "$commit_msg"
        print_success "已提交更改"
    else
        print_warning "继续部署（未提交的更改不会被部署）"
    fi
fi

# ============================================
# 2. 推送 main 分支（可选）
# ============================================

print_info "是否推送 main 分支到远程? (y/n)"
read -r push_main
if [ "$push_main" = "y" ]; then
    print_info "推送 main 分支..."
    git push origin "$CURRENT_BRANCH"
    print_success "main 分支已推送"
fi

echo ""

# ============================================
# 3. 切换到 gh-pages 分支
# ============================================

print_info "切换到 gh-pages 分支..."

# 检查 gh-pages 分支是否存在
if git show-ref --verify --quiet refs/heads/gh-pages; then
    # 分支存在，直接切换
    git checkout gh-pages
else
    # 分支不存在，创建孤儿分支
    print_warning "gh-pages 分支不存在，正在创建..."
    git checkout --orphan gh-pages
    git rm -rf .
    print_success "已创建 gh-pages 分支"
fi

print_success "已切换到 gh-pages 分支"
echo ""

# ============================================
# 4. 清理旧文件并复制新文件
# ============================================

print_info "清理 gh-pages 分支的旧文件..."

# 删除所有文件（除了 .git 和 CNAME）
if [ -f CNAME ]; then
    mv CNAME /tmp/CNAME.backup
    print_info "已备份 CNAME 文件"
fi

# 删除所有文件
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +

print_success "旧文件已清理"
echo ""

# ============================================
# 5. 从 main 分支复制 frontend 文件
# ============================================

print_info "从 main 分支复制 frontend/ 文件..."

# 复制 frontend 文件夹
git checkout "$CURRENT_BRANCH" -- frontend/

# 将 frontend/ 里的文件移到根目录
mv frontend/* .
rm -rf frontend/

# 恢复 CNAME（如果存在）
if [ -f /tmp/CNAME.backup ]; then
    mv /tmp/CNAME.backup CNAME
    print_info "已恢复 CNAME 文件"
fi

print_success "文件复制完成"
echo ""

# ============================================
# 6. 显示文件列表
# ============================================

print_info "gh-pages 分支当前文件:"
ls -lh
echo ""

# ============================================
# 7. 提交更改
# ============================================

print_info "是否提交这些更改? (y/n)"
read -r do_commit

if [ "$do_commit" = "y" ]; then
    # 添加所有文件
    git add .
    
    # 检查是否有更改
    if [ -z "$(git status --porcelain)" ]; then
        print_warning "没有检测到更改，无需提交"
    else
        # 生成提交消息
        COMMIT_MSG="Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
        
        print_info "提交消息: $COMMIT_MSG"
        git commit -m "$COMMIT_MSG"
        print_success "已提交更改"
        
        # ============================================
        # 8. 推送到 GitHub
        # ============================================
        
        print_info "是否推送到 GitHub? (y/n)"
        read -r do_push
        
        if [ "$do_push" = "y" ]; then
            print_info "推送到 gh-pages 分支..."
            git push origin gh-pages --force
            print_success "推送成功!"
            echo ""
            print_success "🎉 部署完成!"
            
            # 获取 GitHub 用户名和仓库名
            REMOTE_URL=$(git config --get remote.origin.url)
            if [[ $REMOTE_URL =~ github.com[:/]([^/]+)/([^/.]+) ]]; then
                USERNAME="${BASH_REMATCH[1]}"
                REPO="${BASH_REMATCH[2]}"
                print_info "访问地址: https://${USERNAME}.github.io/${REPO}/"
            fi
        else
            print_info "已跳过推送"
        fi
    fi
else
    print_info "已跳过提交"
fi

echo ""

# ============================================
# 9. 切换回原分支
# ============================================

print_info "是否切换回 $CURRENT_BRANCH 分支? (y/n)"
read -r switch_back

if [ "$switch_back" = "y" ]; then
    git checkout "$CURRENT_BRANCH"
    print_success "已切换回 $CURRENT_BRANCH 分支"
else
    print_warning "当前停留在 gh-pages 分支"
fi

echo ""
print_success "========== 部署流程结束 =========="
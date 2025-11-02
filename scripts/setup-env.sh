#!/bin/bash

# ============================================
# 环境配置助手
# 帮助你快速配置 .env 文件
# ============================================

set -e

echo "🔧 Receipt Auto Logger - 环境配置助手"
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查 .env 是否存在
if [ -f .env ]; then
  echo -e "${YELLOW}⚠️  .env 文件已存在${NC}"
  read -p "是否覆盖？(y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
  fi
fi

echo -e "${BLUE}开始配置...${NC}"
echo ""

# ============================================
# 收集必需配置
# ============================================

echo "请输入以下信息（按 Enter 跳过使用默认值）："
echo ""

# Vision API Key
echo -e "${BLUE}1. Google Cloud Vision API Key${NC}"
echo "   获取方式：https://console.cloud.google.com → 凭据"
read -p "   API Key: " VISION_API_KEY
echo ""

# Sheet ID
echo -e "${BLUE}2. Google Sheet ID${NC}"
echo "   从 Sheet URL 中复制（d/ 后面的部分）"
read -p "   Sheet ID: " SHEET_ID
echo ""

# Secret Token
echo -e "${BLUE}3. API 访问令牌${NC}"
echo "   自定义密码（建议至少 16 字符）"
read -p "   Token [test123]: " SECRET_TOKEN
SECRET_TOKEN=${SECRET_TOKEN:-test123}
echo ""

# Drive Folder ID (可选)
echo -e "${BLUE}4. Google Drive 文件夹 ID (可选)${NC}"
read -p "   Folder ID [跳过]: " DRIVE_FOLDER_ID
echo ""

# ============================================
# 生成 .env 文件
# ============================================

cat > .env << EOF
# ============================================
# Receipt Auto Logger - 环境变量
# 自动生成于: $(date)
# ============================================

# ============================================
# Google Cloud 配置
# ============================================

VISION_API_KEY=${VISION_API_KEY}
GCP_PROJECT_ID=receipt-auto-logger

# ============================================
# Google Sheets 配置
# ============================================

SHEET_ID=${SHEET_ID}
DRIVE_FOLDER_ID=${DRIVE_FOLDER_ID}

# ============================================
# 安全配置
# ============================================

SECRET_TOKEN=${SECRET_TOKEN}

# ============================================
# 应用配置
# ============================================

DEBUG_MODE=true
CONFIDENCE_HIGH=85
CONFIDENCE_MEDIUM=60
OCR_LANGUAGE_HINTS=ja,en,zh
MAX_IMAGE_SIZE=10485760
REQUEST_TIMEOUT=30000

# ============================================
# 功能开关
# ============================================

ENABLE_T_NUMBER=true
ENABLE_AUTO_CATEGORY=false
ENABLE_EMAIL_NOTIFICATION=false

# ============================================
# 注意事项
# ============================================
# 
# 此文件包含敏感信息，不要提交到 Git
# 已在 .gitignore 中配置忽略
# 
# ============================================
EOF

echo -e "${GREEN}✅ .env 文件已创建${NC}"
echo ""

# ============================================
# 验证配置
# ============================================

echo -e "${BLUE}验证配置...${NC}"
echo ""

# 检查必需字段
ERRORS=0

if [ -z "$VISION_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  VISION_API_KEY 未设置${NC}"
  ERRORS=$((ERRORS + 1))
fi

if [ -z "$SHEET_ID" ]; then
  echo -e "${YELLOW}⚠️  SHEET_ID 未设置${NC}"
  ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ 配置验证通过${NC}"
else
  echo -e "${YELLOW}⚠️  有 ${ERRORS} 个配置项需要补充${NC}"
  echo "   请编辑 .env 文件补充缺失的值"
fi

echo ""

# ============================================
# 显示下一步
# ============================================

echo -e "${BLUE}📋 下一步操作：${NC}"
echo ""
echo "  1. 在 GAS 编辑器中设置 Script Properties："
echo "     - VISION_API_KEY"
echo "     - SHEET_ID"
echo "     - SECRET_TOKEN"
echo ""
echo "  2. 运行测试："
echo "     testFullFlow()"
echo ""
echo "  3. 部署 Web App"
echo ""
echo -e "${GREEN}完成！${NC}"
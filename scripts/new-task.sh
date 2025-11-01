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

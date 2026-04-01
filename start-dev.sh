#!/bin/bash

echo "🚀 启动海龟汤游戏开发环境..."

# 检查并启动后端服务
if [ ! "$(ps aux | grep "node index.js" | grep -v grep)" ]; then
    echo "🔧 启动后端服务..."
    cd ai-haigui-backend
    npm start &
    cd ..
    sleep 3
fi

# 启动前端服务
echo "🎮 启动前端服务..."
npm run dev &
echo ""
echo "✅ 服务已启动："
echo "   前端: http://localhost:5173/"
echo "   后端: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务"
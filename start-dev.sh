#!/bin/bash

# 清理可能存在的旧进程
echo "🧹 清理旧进程..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo "🚀 启动海龟汤游戏开发环境..."
echo ""

# 启动后端服务
echo "🔧 启动后端服务（端口 3001）..."
cd ai-haigui-backend
npm start &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 启动前端服务
echo "🎮 启动前端服务（端口 5173）..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 服务已启动："
echo "   前端: http://localhost:5173/"
echo "   后端: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 捕获 Ctrl+C 信号
cleanup() {
    echo ""
    echo "🛑 正在停止服务..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# 保持脚本运行
wait
#!/bin/bash

echo "🔧 开始修复依赖版本..."
echo ""

# 方案选择
echo "请选择修复方案："
echo "1) 方案 A: 最稳定配置（Vite 5.4 + React 18.x）"
echo "2) 方案 B: 保持 React 19，但使用稳定构建工具"
echo ""
read -p "请输入选项 (1 或 2): " choice

case $choice in
  1)
    echo ""
    echo "📦 安装方案 A（最稳定配置）..."
    npm install \
      vite@5.4.11 \
      @vitejs/plugin-react@4.3.4 \
      react@18.3.1 \
      react-dom@18.3.1 \
      @types/react@18.3.12 \
      @types/react-dom@18.3.1 \
      --legacy-peer-deps
    ;;
  2)
    echo ""
    echo "📦 安装方案 B（React 19 + 稳定构建工具）..."
    npm install \
      vite@5.4.11 \
      @vitejs/plugin-react@4.3.4 \
      @types/react@18.3.12 \
      @types/react-dom@18.3.1 \
      --legacy-peer-deps
    ;;
  *)
    echo "❌ 无效选项"
    exit 1
    ;;
esac

echo ""
echo "✅ 依赖更新完成！"
echo ""
echo "清理缓存并重新安装..."
rm -rf node_modules package-lock.json
npm install

echo ""
echo "🧪 验证构建..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "🎉 构建成功！版本已更新为稳定配置。"
else
  echo ""
  echo "❌ 构建失败，请检查错误信息。"
fi

# 开发环境指南

## 快速启动

### 方法一：使用 npm scripts（推荐）
```bash
npm run dev
```

### 方法二：使用启动脚本
```bash
./start-dev.sh
```

### 方法三：分别启动
```bash
# 启动后端（端口 3001）
cd ai-haigui-backend
npm start

# 启动前端（端口 5173）
npm run dev
```

## 服务地址

- **前端**: http://localhost:5173/
- **后端 API**: http://localhost:3001/api/chat

## 环境配置

### 本地开发环境
创建 `.env.local` 文件：
```bash
VITE_API_BASE_URL=
```

### 后端环境变量
在 `ai-haigui-backend/.env` 中配置：
```bash
DEEPSEEK_API_KEY=your-api-key
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
```

## 故障排查

### 1. 端口占用
如果端口被占用，先杀掉进程：
```bash
# 检查端口
lsof -i :5173
lsof -i :3001

# 杀掉进程
kill -9 <PID>
```

### 2. Vite 错误
如果出现 "Vite not found"：
```bash
rm -rf node_modules
npm install
```

### 3. API 连接错误
检查 API 地址是否正确：
- 开发环境：前端会通过 Vite 代理到后端
- 生产环境：需要设置 `VITE_API_BASE_URL`

## 目录结构

```
ai-haigui-game/
├── ai-haigui-backend/     # 后端服务（Node.js + Express）
├── src/                  # 前端源码
├── public/               # 静态资源
├── package.json          # 前端配置
└── vite.config.ts        # Vite 配置
```

## 代理配置

开发环境下的 API 代理在 `vite.config.ts` 中配置：
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  },
}
```

这样前端可以直接访问 `/api/chat`，不需要完整 URL。
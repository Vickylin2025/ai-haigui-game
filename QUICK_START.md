# 快速启动指南

## 方法一：分别启动（推荐）

### 1. 启动后端
```bash
cd ai-haigui-backend
npm start
```
后端将在 http://localhost:3001 运行

### 2. 启动前端（新开一个终端）
```bash
npm run dev
```
前端将在 http://localhost:5173 运行

---

## 方法二：使用启动脚本

```bash
./start-dev.sh
```

---

## 服务地址

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:5173/ |
| 后端 API | http://localhost:3001/api/chat |

---

## 停止服务

在终端中按 `Ctrl+C` 停止服务

---

## 常见问题

### Q: 端口被占用？
```bash
# 杀掉占用 5173 端口的进程
lsof -ti:5173 | xargs kill -9

# 杀掉占用 3001 端口的进程
lsof -ti:3001 | xargs kill -9
```

### Q: 显示 "Vite not found"？
```bash
rm -rf node_modules
npm install
```

### Q: API 调用失败？
检查后端是否正常运行：
```bash
curl http://localhost:3001/
```
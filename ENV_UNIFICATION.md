# 环境变量统一说明

## 概述
为了确保海龟汤游戏在本地开发、移动端和 PC 端的生产环境中有一致的 AI 回答表现，需要统一配置以下关键参数。

## 关键参数

### 1. API 接口统一
- **移动端和 PC 端使用相同的 API 端点**
- **环境变量**: `VITE_API_BASE_URL`
- **作用**: 指向后端服务地址

| 环境 | 配置方式 | 示例值 |
|------|----------|---------|
| 开发环境 | Vite 代理 | 空字符串（使用相对路径） |
| 生产环境（Vercel） | 环境变量 | `https://your-vercel-backend.vercel.app` |
| 生产环境（Railway） | 环境变量 | `https://your-backend.railway.app` |

### 2. AI 参数配置（后端使用）
在部署后端服务时，需要在部署平台的环境变量中配置：

```bash
# DeepSeek API 配置
DEEPSEEK_API_KEY=sk-your-api-key
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions

# 可选：自定义系统 Prompt（如果需要）
# DEEPSEEK_SYSTEM_PROMPT="自定义的详细系统 Prompt"
```

### 3. 网络感知重试
- **移动端**: 自动检测网络类型，配置智能重试策略
- **PC 端**: 默认使用快速重试策略（2次，最长3秒）
- **配置位置**: `src/services/api.ts` 中的 `getRetryConfig()` 函数

## 部署配置

### Vercel 前端部署
在 `vercel.json` 或 Vercel Dashboard 中设置：
```json
{
  "env": {
    "VITE_API_BASE_URL": "https://your-backend-service-url.vercel.app"
  }
}
```

### Railway 后端部署
在 Railway Dashboard 的 Variables 中设置：
```
DEEPSEEK_API_KEY=your-key
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
```

### 本地开发
使用 `.env.local` 文件：
```bash
# 前端配置（可选）
VITE_API_BASE_URL=

# 后端配置（在 ai-haigui-backend/.env 中）
DEEPSEEK_API_KEY=your-key
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
```

## 一致性保证

1. **统一 Prompt**: 后端使用相同的 `SYSTEM_PROMPT`
2. **统一参数**: `temperature=0`, `max_tokens=50`
3. **统一解析**: JSON 格式优先，字符串解析兜底
4. **统一重试**: 网络感知的重试策略

## 故障排查

如果移动端和 PC 端回答不一致：
1. 检查两个环境是否使用相同的服务地址
2. 检查 API Key 是否正确配置
3. 查看 Console 日志中的网络检测信息
4. 确认后端服务返回的响应格式
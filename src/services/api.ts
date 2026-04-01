import axios, { AxiosError } from 'axios'
import type { Story } from '../data/stories'

// 默认回答
const DEFAULT_AI_ANSWER = '无关'

// 网络感知重试配置
interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
}

// 根据网络条件配置重试策略
function getRetryConfig(): RetryConfig {
  // 检查网络连接质量
  const connection = (navigator as any).connection ||
                   (navigator as any).mozConnection ||
                   (navigator as any).webkitConnection

  if (connection) {
    const { effectiveType, downlink } = connection

    // 根据网络类型调整重试策略
    switch (effectiveType) {
      case 'slow-2g':
        return { maxAttempts: 4, baseDelay: 2000, maxDelay: 10000 }
      case '2g':
        return { maxAttempts: 3, baseDelay: 1500, maxDelay: 8000 }
      case '3g':
        return { maxAttempts: 2, baseDelay: 1000, maxDelay: 5000 }
      default: // 4g, wifi, etc.
        return { maxAttempts: 2, baseDelay: 800, maxDelay: 3000 }
    }
  }

  // 默认配置（未知网络）
  return { maxAttempts: 2, baseDelay: 1000, maxDelay: 5000 }
}

// 获取后端 API 地址
// 优先级：环境变量 > 开发代理路径
function getApiBaseUrl(): string {
  // 生产环境：使用环境变量配置的后端地址
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl) {
    return envUrl
  }
  // 开发环境：使用 Vite 代理，直接请求相对路径
  return ''
}

/**
 * askAI(question, story) -> Promise<'是' | '否' | '无关'>
 * 支持网络感知的重试机制
 */
export async function askAI(question: string, story: Story): Promise<{ answer: string; isFallback: boolean }> {
  const q = question.trim()
  if (!q) return { answer: DEFAULT_AI_ANSWER, isFallback: false }

  const baseUrl = getApiBaseUrl()
  const apiUrl = `${baseUrl}/api/chat`
  const retryConfig = getRetryConfig()

  console.log("【前端日志】API请求地址：", apiUrl)
  console.log("【前端日志-输入】用户提问：", q)
  console.log("【前端日志】网络类型检测到：", (navigator as any).connection?.effectiveType || 'unknown')
  console.log("【前端日志】重试配置：", retryConfig)

  // 递归重试函数
  const attemptRequest = async (attempt: number = 1): Promise<{ answer: string; isFallback: boolean }> => {
    try {
      const response = await axios.post(apiUrl, {
        question: q,
        story: story,
      }, {
        timeout: 15000 * attempt, // 随重试次数增加超时时间
        validateStatus: (status) => status >= 200 && status < 300 // 只接受2xx响应
      })

      console.log(`【前端日志-输出】第${attempt}次尝试成功：`, response.data)

      const { answer, isFallback } = response.data
      // 严格校验，只允许是/否/无关
      if (typeof answer === 'string' && ['是', '否', '无关'].includes(answer)) {
        return { answer, isFallback: isFallback || false }
      } else {
        console.warn(`【前端日志】第${attempt}次尝试 - 后端返回格式异常：`, response.data)

        // 响应格式异常，直接返回兜底答案（不重试，因为已收到响应）
        return { answer: DEFAULT_AI_ANSWER, isFallback: true }
      }
    } catch (error) {
      const axiosError = error as AxiosError

      console.error(`【前端日志】第${attempt}次尝试失败：`, axiosError.message)

      // 检查是否应该重试
      if (attempt < retryConfig.maxAttempts && shouldRetry(axiosError)) {
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(2, attempt - 1), // 指退避
          retryConfig.maxDelay
        )

        console.log(`【前端日志】等待 ${delay}ms 后进行第${attempt + 1}次尝试...`)
        await new Promise(resolve => setTimeout(resolve, delay))

        return attemptRequest(attempt + 1)
      }

      console.error('【前端日志】达到最大重试次数，返回兜底答案')
      return { answer: DEFAULT_AI_ANSWER, isFallback: true }
    }
  }

  return attemptRequest()
}

// 判断是否应该重试
function shouldRetry(error: AxiosError): boolean {
  // 网络错误
  if (!error.response) {
    return true
  }

  // 5xx 服务器错误
  if (error.response.status >= 500) {
    return true
  }

  // 429 请求过于频繁
  if (error.response.status === 429) {
    return true
  }

  // 超时错误
  if (error.code === 'ECONNABORTED' || error.code === 'TIMEOUT') {
    return true
  }

  return false
}

// 判断是否是网络错误
function isNetworkError(error: any): boolean {
  if (!error || !error.response) {
    return true
  }

  return error.response.status >= 500 || error.code === 'ECONNABORTED' || error.code === 'TIMEOUT'
}
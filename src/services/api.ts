import axios from 'axios'
import type { Story } from '../data/stories'

// 默认回答
const DEFAULT_AI_ANSWER = '无关'

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
 */
export async function askAI(question: string, story: Story): Promise<{ answer: string; isFallback: boolean }> {
  const q = question.trim()
  if (!q) return { answer: DEFAULT_AI_ANSWER, isFallback: false }

  const baseUrl = getApiBaseUrl()
  const apiUrl = `${baseUrl}/api/chat`

  console.log("【前端日志】API请求地址：", apiUrl)
  console.log("【前端日志-输入】用户提问：", q)

  try {
    const response = await axios.post(apiUrl, {
      question: q,
      story: story,
    }, {
      timeout: 15000, // 15秒超时
    })

    console.log("【前端日志-输出】后端响应：", response.data)

    const { answer, isFallback } = response.data
    // 严格校验，只允许是/否/无关
    if (typeof answer === 'string' && ['是', '否', '无关'].includes(answer)) {
      return { answer, isFallback: isFallback || false }
    } else {
      console.warn('【前端日志】后端返回格式异常：', response.data)
      return { answer: DEFAULT_AI_ANSWER, isFallback: true }
    }
  } catch (error) {
    console.error('【前端日志】API调用失败：', error)
    return { answer: DEFAULT_AI_ANSWER, isFallback: true }
  }
}
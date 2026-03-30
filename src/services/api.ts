import axios from 'axios'
import type { Story } from '../data/stories'

// 绝对禁止默认无关，兜底为是
const DEFAULT_AI_ANSWER = '无关'
const BACKEND_API_URL = 'http://localhost:3001/api/chat'

/**
 * askAI(question, story) -> Promise<'是' | '否' | '无关'>
 */
export async function askAI(question: string, story: Story): Promise<{ answer: string; isFallback: boolean }> {
  const q = question.trim()
  if (!q) return { answer: DEFAULT_AI_ANSWER, isFallback: false }

  // 【关键日志】打印输入
  console.log("【前端日志-输入】当前汤底完整内容：", story);
  console.log("【前端日志-输入】用户提问：", q);

  try {
    const response = await axios.post(BACKEND_API_URL, {
      question: q,
      story: story,
    });

    // 【关键日志】打印后端完整响应
    console.log("【前端日志-输出】后端完整响应：", response.data);

    const { answer, isFallback } = response.data;
    // 严格校验，只允许是/否/无关，兜底为无关
    if (typeof answer === 'string' && ['是', '否', '无关'].includes(answer)) {
      return { answer, isFallback: isFallback || false };
    } else {
      console.warn('Backend returned an unexpected answer format:', response.data);
      return { answer: DEFAULT_AI_ANSWER, isFallback: true };
    }
  } catch (error) {
    console.error('Error calling backend AI API:', error);
    return { answer: DEFAULT_AI_ANSWER, isFallback: true };
  }
}
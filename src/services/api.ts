import axios from 'axios'
import type { Story } from '../data/stories'

const DEFAULT_AI_ANSWER = '无关'
const BACKEND_API_URL = 'http://localhost:3001/api/chat'

/**
 * askAI(question, story) -> Promise<'是' | '否' | '无关'>
 */
export async function askAI(question: string, story: Story): Promise<{ answer: string; isFallback: boolean }> {
  const q = question.trim()
    if (!q) return { answer: DEFAULT_AI_ANSWER, isFallback: false }

    try {
      const response = await axios.post(BACKEND_API_URL, {
        question: q,
        story: story,
      });

      const { answer, isFallback } = response.data;
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


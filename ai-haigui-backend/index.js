require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

/**
 * 智能解析AI输出，提取有效回答（支持JSON和字符串）
 * @param {string} rawOutput - AI原始输出
 * @returns {string} - 返回'是'/'否'/'无关'
 */
function parseAIAnswer(rawOutput) {
  if (!rawOutput || typeof rawOutput !== 'string') return '无关'

  // 清理输出：去除空白、引号，保留JSON结构
  const cleaned = rawOutput.trim()

  console.log('【后端日志-解析】原始输出：', rawOutput)
  console.log('【后端日志-解析】清理后：', cleaned)

  // 尝试提取JSON中的answer值
  const jsonMatch = cleaned.match(/\{"answer"\s*:\s*["']?(是|否|无关)["']?/)
  if (jsonMatch) {
    const answer = jsonMatch[1]
    console.log('【后端日志-解析】从JSON提取成功：', answer)
    return answer
  }

  // 尝试匹配JSON格式的完整响应
  try {
    // 提取可能的JSON部分
    const jsonStart = cleaned.indexOf('{')
    if (jsonStart !== -1) {
      const jsonStr = cleaned.slice(jsonStart)
      const parsed = JSON.parse(jsonStr)
      if (parsed.answer && ['是', '否', '无关'].includes(parsed.answer)) {
        console.log('【后端日志-解析】完整JSON解析成功：', parsed.answer)
        return parsed.answer
      }
    }
  } catch (e) {
    // JSON解析失败，继续字符串匹配
  }

  // 字符串精确匹配（优先级最高）
  if (cleaned === '是' || cleaned === 'yes' || cleaned === 'Yes' || cleaned === 'YES') return '是'
  if (cleaned === '否' || cleaned === 'no' || cleaned === 'No' || cleaned === 'NO') return '否'
  if (cleaned === '无关' || cleaned === 'irrelevant') return '无关'

  // 字符串模糊匹配（按优先级）
  // 检查是否是JSON格式的字符串
  if (cleaned.includes('无关') && !cleaned.includes('reason')) return '无关'
  if (cleaned.includes('不是') || cleaned.includes('不对') || cleaned.includes('错误')) return '否'
  if (cleaned.includes('是') && !cleaned.includes('reason')) return '是'
  if (cleaned.includes('否') && !cleaned.includes('不')) return '否'

  // 默认返回无关
  return '无关'
}

// 严格版系统Prompt（强制约束AI输出格式）
const SYSTEM_PROMPT = `你是海龟汤游戏的AI主持人。你的唯一任务是根据故事真相判断玩家问题，并给出回答。

## 输出格式（必须严格遵守）
必须严格输出 JSON 格式，包含以下字段：
{
  "answer": "是|否|无关",  // 只能是这三个值之一
  "reason": "简短理由"      // 10字以内的判断理由
}

## 判断逻辑
1. 如果问题所述事实与汤底一致 -> answer="是"
2. 如果问题所述事实与汤底矛盾 -> answer="否"
3. 如果问题与汤底无关或无法判断 -> answer="无关"

## Few-shot 示例
示例1：
汤底="小明吃了个毒苹果死了"
问题="小明是被毒死的吗？"
输出：{"answer":"是","reason":"直接命中汤底"}

示例2：
汤底="小明吃了个毒苹果死了"
问题="小明是被枪杀的吗？"
输出：{"answer":"否","reason":"与汤底矛盾"}

示例3：
汤底="小明吃了个毒苹果死了"
问题="今天天气怎么样？"
输出：{"answer":"无关","reason":"与汤底无关"}

示例4：
汤底="死者从楼上跳下，自由落体过程中身体擦撞到顶楼门板发出敲门声。他开门时，死者已坠落到楼下。"
问题="死者是自杀的吗？"
输出：{"answer":"是","reason":"从汤底推断"}

示例5：
汤底="死者从楼上跳下，自由落体过程中身体擦撞到顶楼门板发出敲门声。他开门时，死者已坠落到楼下。"
问题="门外有人推了他一把？"
输出：{"answer":"否","reason":"汤底无人推搡"}

## 禁止事项
- 禁止输出任何JSON格式以外的内容
- 禁止添加注释、解释、代码标记
- 禁止输出多余字符、空格、换行
- 必须严格遵守JSON语法

现在请开始判断：`;

// 聊天接口
app.post('/api/chat', async (req, res) => {
  try {
    const { question, story } = req.body

    console.log('【后端日志-输入】用户提问：', question)
    console.log('【后端日志-输入】当前汤底：', story?.title || '未知')

    if (!question || !story) {
      return res.json({ answer: '无关', isFallback: false })
    }

    // 调用DeepSeek API
    const response = await axios.post(
      process.env.DEEPSEEK_API_URL,
      {
        model: process.env.DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `请根据以下汤面和汤底判断玩家问题：
汤面：${story.surface}
汤底：${story.bottom}
玩家问题：${question}` }
        ],
        temperature: 0, // 严格确定性输出
        max_tokens: 50  // 足够输出JSON
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒超时
      }
    )

    // 解析AI输出
    const aiRawAnswer = response.data.choices[0].message.content.trim()
    console.log('【后端日志-输出】AI原始输出：', aiRawAnswer)

    // 优先尝试解析JSON格式
    let answer = '无关'
    try {
      const parsed = JSON.parse(aiRawAnswer)
      if (parsed.answer && ['是', '否', '无关'].includes(parsed.answer)) {
        answer = parsed.answer
        console.log('【后端日志-解析】JSON格式解析成功：', answer)
      } else {
        console.warn('【后端日志-解析】JSON格式错误，回退到字符串解析')
      }
    } catch (e) {
      // JSON解析失败，使用字符串解析作为兜底
      console.warn('【后端日志-解析】非JSON格式，使用字符串解析')
      answer = parseAIAnswer(aiRawAnswer)
    }

    res.json({ answer, isFallback: false })

  } catch (error) {
    console.error('【后端日志-错误】API调用失败：', error.message)
    // 错误时返回无关，不显示兜底提示（避免误报）
    res.json({ answer: '无关', isFallback: false })
  }
})

// 测试接口
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// 服务信息
app.get('/', (req, res) => {
  res.json({
    service: 'AI海龟汤后端',
    status: 'running',
    port: PORT
  });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log('POST /api/chat -> AI 对话');
});
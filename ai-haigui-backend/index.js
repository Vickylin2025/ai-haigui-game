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
 * 智能解析AI输出，提取有效回答
 * @param {string} rawOutput - AI原始输出
 * @returns {string|null} - 返回'是'/'否'/'无关'，无法解析返回null
 */
function parseAIAnswer(rawOutput) {
  if (!rawOutput || typeof rawOutput !== 'string') return null;

  // 清理输出：去除空白、标点、引号
  const cleaned = rawOutput
    .trim()
    .replace(/[。！？，、；：""''（）【】《》\s.!?,'"]/g, '')
    .toLowerCase();

  // 优先匹配完整词汇
  if (cleaned === '是' || cleaned === 'yes') return '是';
  if (cleaned === '否' || cleaned === 'no') return '否';
  if (cleaned === '无关' || cleaned === 'irrelevant') return '无关';

  // 模糊匹配：检查是否包含关键词
  if (cleaned.includes('是') && !cleaned.includes('无关') && !cleaned.includes('否')) return '是';
  if (cleaned.includes('否') && !cleaned.includes('无关')) return '否';
  if (cleaned.includes('无关')) return '无关';

  // 无法解析
  return null;
}

// 严格版系统Prompt（强制约束AI输出格式）
const SYSTEM_PROMPT = `你是海龟汤游戏的AI主持人。你的唯一任务是根据故事真相判断玩家问题，并给出回答。

## 输出规则（绝对强制）
你只能输出以下三个词之一，禁止输出任何其他内容：
- 是
- 否
- 无关

## 判断逻辑
1. 如果问题所述事实与汤底一致 -> 回答"是"
2. 如果问题所述事实与汤底矛盾 -> 回答"否"
3. 如果问题与汤底无关或无法判断 -> 回答"无关"

## 禁止事项
- 禁止输出标点符号
- 禁止输出解释或推理过程
- 禁止输出多余字符
- 禁止换行

## 示例
输入：汤底="小明吃了个毒苹果死了" 问题="小明是被毒死的吗？"
输出：是

输入：汤底="小明吃了个毒苹果死了" 问题="小明是被枪杀的吗？"
输出：否

输入：汤底="小明吃了个毒苹果死了" 问题="今天天气怎么样？"
输出：无关

现在开始判断，只输出一个词。`;

// 聊天接口
app.post('/api/chat', async (req, res) => {
  try {
    const { question, story } = req.body;
    
    // 【关键日志】打印输入，监控每一次请求
    console.log('【后端日志-输入】用户提问：', question);
    console.log('【后端日志-输入】当前汤底：', story);

    if (!question || !story) {
      return res.json({ answer: '无关', isFallback: true });
    }

    // 调用DeepSeek API
    const response = await axios.post(
      process.env.DEEPSEEK_API_URL,
      {
        model: process.env.DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `汤面：${story.surface}\n汤底：${story.bottom}\n玩家问题：${question}` }
        ],
        temperature: 0, // 绝对0温度，完全 deterministic
        max_tokens: 10 // 足够输出"无关"及可能的标点
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 【关键日志】打印AI真实输出
    const aiRawAnswer = response.data.choices[0].message.content.trim();
    console.log('【后端日志-输出】AI真实输出：', aiRawAnswer);

    // 智能解析AI输出，提取有效回答
    const answer = parseAIAnswer(aiRawAnswer);
    const isFallback = answer === null;

    if (isFallback) {
      // 完全无法解析，返回无关并标记为兜底
      console.warn('【后端日志-兜底】AI输出无法解析，自动兜底为：无关，原始输出：', aiRawAnswer);
      res.json({ answer: '无关', isFallback: true });
    } else {
      res.json({ answer, isFallback: false });
    }

  } catch (error) {
    console.error('【后端日志-错误】API调用失败：', error.message);
    // 网络或API错误时返回无关
    res.json({ answer: '无关', isFallback: true });
  }
});

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
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 严格版系统Prompt（强制约束AI输出格式）
const SYSTEM_PROMPT = `你是一个严格的海龟汤游戏AI主持人，你的唯一任务是根据提供的汤底真相，进行严谨的语义推理，并针对玩家的问题给出最精确的判断。

【强制要求】
1. 必须先完整理解汤底，再做语义推理，绝对禁止关键词匹配、禁止摆烂（禁止所有问题都返回“无关”）。
2. 只允许返回3种结果：是 / 否 / 无关，绝对不能加任何解释、废话、标点符号，只能是这三个词语之一。
3. 必须严格按汤底事实判断。

【当前汤底真相（必须严格遵守）】
死者是攀爬顶楼外墙的人，扒在门边敲门求助，屋主开门时，门把死者撞下顶楼摔死了，死者就是敲门的人。

【推理规则】
- 是: 玩家问题内容和汤底事实完全一致、符合逻辑。
  - 示例：死者是敲门的人、死者从楼上摔下、敲门的人在求救。
- 否: 玩家问题和汤底事实明显矛盾。
  - 示例：死者是被谋杀的、敲门的人是鬼。
- 无关: 玩家问题和汤底完全不相关。
  - 示例：屋主是明星、楼下有超市。

现在，请你根据上述严格规则和汤底真相，判断玩家的问题，并直接输出“是”、“否”或“无关”。`;

// 聊天接口
app.post('/api/chat', async (req, res) => {
  try {
    const { question, story } = req.body;

    console.log('【后端日志-输入】用户提问：', question);
    console.log('【后端日志-输入】当前汤底：', story?.title || '未知');

    if (!question || !story) {
      return res.json({ answer: '无关', isFallback: false });
    }

    // 调用DeepSeek API
    const response = await axios.post(
      process.env.DEEPSEEK_API_URL,
      {
        model: process.env.DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `请根据以下汤面和汤底判断玩家问题：\n汤面：${story.surface}\n汤底：${story.bottom}\n玩家问题：${question}` }
        ],
        temperature: 0, // 严格确定性输出
        max_tokens: 50  // 足够输出“是/否/无关”三个字
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒超时
      }
    );

    // 解析AI输出
    const aiRawAnswer = response.data.choices[0].message.content.trim();
    console.log('【后端日志-输出】AI原始输出：', aiRawAnswer);

    // 检查AI输出是否是“是/否/无关”之一，否则默认为“无关”
    let answer = '无关';
    if (['是', '否', '无关'].includes(aiRawAnswer)) {
      answer = aiRawAnswer;
    } else {
      console.warn('【后端日志-解析】AI输出非标准格式，默认为“无关”：', aiRawAnswer);
    }

    res.json({ answer, isFallback: false });

  } catch (error) {
    console.error('【后端日志-错误】API调用失败：', error.message);
    // 错误时返回无关，不显示兜底提示（避免误报）
    res.json({ answer: '无关', isFallback: false });
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

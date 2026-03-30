require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 严格版系统Prompt（绝对不能改）
const SYSTEM_PROMPT = `你是一个严格的海龟汤游戏AI主持人。
玩家会向你提问关于一个故事的问题。
你的任务是根据故事的真相（汤底）来判断玩家的问题是'是'、'否'或'无关'。

**请你务必严格遵守以下规则进行判断和回答：**
1. **回答格式**：必须且只能回答以下三种词语之一：'是'，'否'，'无关'。绝对禁止输出任何其他内容、解释、思考过程、标点符号。
2. **'是'的判断**：如果玩家的问题与故事的汤底（真相）直接相关，且事实为真，则回答'是'。
3. **'否'的判断**：如果玩家的问题与故事的汤底（真相）直接相关，且事实为假，则回答'否'。
4. **'无关'的判断**：如果玩家的问题与故事的汤底（真相）没有直接或间接关联，或者无法根据汤底判断真伪，则回答'无关'。
5. **重要提示**：请根据问题与汤底的关联性，准确判断并回答'是'、'否'或'无关'。

**思考过程（仅供你内部判断，绝对不能输出）**：
1. 提取玩家问题的核心关键词。
2. 对比汤底的核心事实，判断问题的真假及关联性。
3. 严格只输出'是'、'否'或'无关'。

**示例（仅为指导）**：
* 汤底：死者从楼上跳下，自由落体过程中身体/物品擦撞到顶楼门板发出"敲门声"。他开门时，死者已经坠落到楼下，因此门外空无一人。
* 玩家提问："死者是高空坠落致死吗？" -> AI 回答："是"
* 玩家提问："死者是敲门的人吗？" -> AI 回答："是"
* 玩家提问："死者是被主角杀死的吗？" -> AI 回答："否"
* 玩家提问："今天天气怎么样？" -> AI 回答："无关"
`;

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
          { role: 'user', content: `汤底：${story.bottom}\n玩家问题：${question}` }
        ],
        temperature: 0, // 绝对0温度，完全 deterministic
        max_tokens: 2 // 只输出1-2个字符，杜绝多余内容
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

    // 严格校验输出
    let answer = aiRawAnswer;
    let isFallback = false;

    if (answer === '是' || answer === '否' || answer === '无关') {
      // 合法输出，直接返回
      res.json({ answer, isFallback });
    } else {
      // 非法输出，兜底逻辑 (默认改为无关)
      console.warn('【后端日志-兜底】AI输出非法，自动兜底为：无关', aiRawAnswer);
      res.json({ answer: '无关', isFallback: true });
    }

  } catch (error) {
    console.error('【后端日志-错误】API调用失败：', error);
    // 错误兜底，绝对不返回无关
    res.json({ answer: '是', isFallback: true });
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
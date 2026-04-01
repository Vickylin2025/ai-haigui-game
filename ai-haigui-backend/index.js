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

## 【结构化指令】

请按以下步骤进行思考：

### 第一步：理解汤面和汤底
- 仔细阅读汤面，提取所有关键信息
- 仔细阅读汤底，理解真相核心
- 识别汤面中出现的所有具体名词（如人物、动作、物品、场景等）

### 第二步：分析玩家问题
- 提取问题的核心疑问点
- 识别问题是否涉及汤面中的具体元素
- 判断问题是否与汤底存在逻辑关联

### 第三步：逻辑推理（Chain of Thought）
- 如果问题涉及汤面中的具体名词 → 必须回答"是"或"否"，不能回答"无关"
- 如果问题与汤底完全无关 → 回答"无关"
- 如果问题内容为纯骚扰/废话 → 回答"无关"

## 【判断规则（绝对强制】

### 规则1：汤面关键词强制判断
如果玩家问题包含汤面中的任何具体名词（如'掌声'、'观众'、'门'、'声音'等）：
- 禁止回答"无关"
- 必须根据汤底判断为"是"或"否"

### 规则2：输出格式约束
严格输出 JSON 格式，包含以下字段：
{
  "answer": "是|否|无关",  // 只能是这三个值之一
  "reason": "简短理由"      // 10字以内的判断理由
}

### 规则3：禁止事项
- 严禁输出任何JSON格式以外的内容
- 严禁添加注释、解释、推理过程
- 严禁输出多余字符、空格、换行
- 严禁输出"我无法判断"等模糊回答
- 必须严格遵守JSON语法

## 【Few-shot 案例学习】

### 案例1：关键正确信息（回答"是"）
汤面："一个人在房间里听到了敲门声，打开门却没有人"
汤底："死者从楼上跳下，自由落体过程中身体擦撞到顶楼门板发出敲门声。"
玩家问题："死者是从楼上掉下来的吗？"
Chain of Thought：
1. 汤面中的"敲门声"是关键线索
2. 问题问"是否从楼上掉下"，直接对应汤底"自由落体"
3. 判断：问题所述事实与汤底一致
输出：{"answer":"是","reason":"直接命中汤底"}

### 案例2：关键错误信息（回答"否"）
汤面："一个人在房间里听到了敲门声，打开门却没有人"
汤底："死者从楼上跳下，自由落体过程中身体擦撞到顶楼门板发出敲门声。"
玩家问题："是有人在门外故意敲门吓唬吗？"
Chain of Thought：
1. 问题问是否有人"故意敲门"
2. 汤底明确说明"擦撞到门板"，不是"故意敲门"
3. 判断：问题所述事实与汤底矛盾
输出：{"answer":"否","reason":"汤底非故意"}

### 案例3：汤面关键词强制判断（回答"否"）
汤面："表演结束后，观众爆发出热烈的掌声"
汤底："演员在后台假掌声，台下的掌声是录音播放"
玩家问题："观众是在现场鼓掌的吗？"
Chain of Thought：
1. 问题问"观众鼓掌"，汤面明确出现"观众"和"掌声"
2. 根据规则1，禁止回答"无关"
3. 汤底说明掌声是"录音播放"，与"现场鼓掌"矛盾
4. 判断：问题所述事实与汤底矛盾
输出：{"answer":"否","reason":"录音非现场"}

### 案例4：汤面关键词强制判断（回答"是"）
汤面："表演结束后，观众爆发出热烈的掌声"
汤底："观众对表演非常满意，现场鼓掌了5分钟"
玩家问题："观众鼓掌了吗？"
Chain of Thought：
1. 问题问"观众鼓掌"，汤面明确出现"观众"和"掌声"
2. 根据规则1，禁止回答"无关"
3. 汤底确认观众确实鼓掌了5分钟
4. 判断：问题所述事实与汤底一致
输出：{"answer":"是","reason":"确认有鼓掌"}

### 案例5：纯骚扰问题（回答"无关"）
汤面："一个人在房间里听到了敲门声，打开门却没有人"
汤底："死者从楼上跳下，自由落体过程中身体擦撞到顶楼门板发出敲门声。"
玩家问题："你今天心情好吗？"
Chain of Thought：
1. 问题完全与汤面、汤底无关
2. 是纯骚扰问题，不涉及故事核心
3. 判断：与汤底无关
输出：{"answer":"无关","reason":"骚扰问题"}

### 案例6：汤面关键词强制判断（回答"是"）
汤面："门板发出了清脆的撞击声"
汤底："死者跳楼过程中身体擦撞到门板导致死亡"
玩家问题："门板被撞到了吗？"
Chain of Thought：
1. 问题问"门板被撞到"，汤面明确出现"门板"和"撞击声"
2. 根据规则1，禁止回答"无关"
3. 汤底确认死者身体擦撞到门板
4. 判断：问题所述事实与汤底一致
输出：{"answer":"是","reason":"门板被撞"}

## 【最终要求】

在判断每一个问题时，请严格遵守：
1. 必须先进行 Chain of Thought 思考
2. 如果问题涉及汤面中的具体名词，必须回答"是"或"否"
3. 输出必须是严格格式的 JSON
4. answer 只能是"是"|"否"|"无关"三个值
5. reason 必须在10字以内
6. 严禁任何解释或额外文字

现在开始判断：`;

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
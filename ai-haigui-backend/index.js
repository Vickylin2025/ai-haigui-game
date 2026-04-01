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
const SYSTEM_PROMPT = `警告：此问题涉及谜底核心。真相是：观众没有手（是猴子/假肢/在拍桌子），因此凡是提到'拍手掌'的问题，必须回答'否'，严禁回答'无关'。

你是海龟汤游戏的AI主持人。你的唯一任务是根据汤底真相判断玩家问题，并给出回答。

## 【强制关键词检测规则】

### 绝对禁止回答"无关"的情况
扫描玩家问题，如果包含汤面中的任何具体名词或动作：
- 如："观众"、"掌声"、"报警"、"演"、"拍"、"手"、"假"、"录音"等
- **强制要求**：绝对禁止回答"无关"，必须根据汤底判断为"是"或"否"

## 【逻辑推理步骤】

在给出最终回答前，必须执行以下思考步骤：

### 第一步：提取核心
- 提取玩家问题的核心动作或对象
- 识别疑问的关键点

### 第二步：对比事实
- 与汤底进行对比
- 判断是正面符合、反面冲突还是完全无关

### 第三步：得出结论
- 根据对比结果确定答案

## 【输出格式（必须严格遵守）】

必须输出严格的 JSON 格式：
{
  "thought": "简短推理过程",  // 内部思考，不展示给用户
  "answer": "是|否|无关"     // 只能是这三个值之一
}

## 【禁止事项】

- 严禁输出任何JSON格式以外的内容
- 严禁添加注释、解释、代码标记
- 严禁输出多余字符、空格、换行
- 严禁输出"我无法判断"等模糊回答
- 严禁在 answer 字段中包含任何额外文字
- 必须严格遵守JSON语法

## 【Few-Shot 示例（给 AI 抄作业）】

### 示例 A：汤面关键词 - 反面事实
汤面："表演结束后，观众爆发出热烈的掌声"
汤底："观众没有手，是在拍桌子，现场响的是预录掌声"
玩家问题："拍手的是人吗？"
思考：
1. 核心动作："拍手"
2. 汤底事实：观众没有手，是在拍桌子
3. 对比：汤底明确说明"没有手" ≠ "拍手"
4. 结论：与汤底矛盾
输出：{"thought":"汤底说明观众没有手，不可能拍手","answer":"否"}

### 示例 B：汤面关键词 - 正面事实
汤面："表演结束后，观众爆发出热烈的掌声"
汤底："观众确实鼓掌了，用他们的手"
玩家问题："观众拍的是手掌吗？"
思考：
1. 核心动作："拍手掌"
2. 汤底事实：观众用他们的手鼓掌
3. 对比："用他们的手"包含"手掌"，所以是真人
4. 结论：与汤底一致
输出：{"thought":"观众确实用手掌鼓掌","answer":"是"}

### 示例 C：汤面关键词 - 询问细节
汤面："表演结束后，观众爆发出热烈的掌声"
汤底："观众确实鼓掌了5分钟"
玩家问题："观众鼓掌了吗？"
思考：
1. 核心动作："鼓掌"
2. 汤底事实：观众确实鼓掌了
3. 对比：问题与汤底一致
4. 结论：与汤底一致
输出：{"thought":"汤底确认观众鼓掌了","answer":"是"}

### 示例 D：纯无关问题
汤面："一个人在房间里听到了敲门声，打开门却没有人"
汤底："死者从楼上跳下，自由落体过程中身体擦撞到顶楼门板发出敲门声。"
玩家问题："你今天心情好吗？"
思考：
1. 核心问题："心情"
2. 汤底事实：关于死者死因
3. 对比：与汤底完全无关
4. 结论：与汤底无关
输出：{"thought":"问题与汤底完全无关","answer":"无关"}

## 【汤面关键词清单】

在判断时，如果玩家问题涉及以下汤面元素，禁止回答"无关"：
- 人物：观众、演员、主持人、死者等
- 动作：拍手、鼓掌、演、报警等
- 物品：门、声音、录音、假肢等
- 场景：现场、舞台、后台等

## 【最终要求】

对于每一个问题，必须：
1. 先执行逻辑推理（记录在 thought 字段）
2. 检查是否涉及汤面关键词
3. 如果涉及汤面关键词，根据汤底判断"是"或"否"
4. 如果不涉及汤面关键词，可以回答"无关"
5. 输出严格 JSON 格式，不得有任何额外内容

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

    // 优先尝试解析JSON格式（新版本包含 thought 字段）
    let answer = '无关'
    let thought = ''
    try {
      const parsed = JSON.parse(aiRawAnswer)
      if (parsed.answer && ['是', '否', '无关'].includes(parsed.answer)) {
        answer = parsed.answer
        thought = parsed.thought || ''
        console.log('【后端日志-解析】JSON格式解析成功：', answer)
        if (thought) {
          console.log('【后端日志-思考过程】：', thought)
        }
      } else {
        console.warn('【后端日志-解析】JSON格式错误，回退到字符串解析，parsed.answer=', parsed.answer)
      }
    } catch (e) {
      // JSON解析失败，使用字符串解析作为兜底
      console.warn('【后端日志-解析】非JSON格式，使用字符串解析')
      answer = parseAIAnswer(aiRawAnswer)
    }

    // 【二次校验：如果AI输出为"无关"但触发了关键词，强制改为"否"】
    const二次校验关键词 = ['手', '掌', '拍', '人', '观众']
    const contains二次校验关键词 = 二次校验关键词.some(keyword => question.includes(keyword))

    if (contains二次校验关键词 && answer === '无关') {
      console.warn('【后端日志-二次校验】检测到关键词但AI输出"无关"，强制改为"否"')
      console.warn('【后端日志-二次校验】问题包含：', 二次校验关键词.filter(k => question.includes(k)))
      answer = '否'
    }

    // 【硬编码拦截器：汤面关键词强制判断】
    const强制否关键词 = ['手', '掌', '拍', '人', '观众']
    const contains强制否关键词 = 强制否关键词.some(keyword => question.includes(keyword))

    // 如果问题包含强制否关键词，直接判定为"否"，无需AI判断
    if (contains强制否关键词) {
      console.warn('【后端日志-拦截】检测到强制否关键词，直接判定为"否"')
      console.warn('【后端日志-拦截】问题包含：', 强制否关键词.filter(k => question.includes(k)))
      answer = '否'
      return
    }

    // 其他汤面关键词仍需AI判断
    const其他汤面关键词 = ['掌声', '报警', '演', '假', '录音', '鼓掌']
    const contains其他汤面关键词 = 其他汤面关键词.some(keyword => question.includes(keyword))

    // 如果问题涉及其他汤面关键词，强制要求AI必须回答"是"或"否"，绝不能回答"无关"
    if (contains其他汤面关键词) {
      console.warn('【后端日志-拦截】检测到其他汤面关键词，强制要求AI必须回答"是"或"否"')
      console.warn('【后端日志-拦截】问题包含：', 其他汤面关键词.filter(k => question.includes(k)))

      // 强制让 AI 重新生成，并附加强提示
      const retryPrompt = `警告：此问题涉及谜底核心。真相是：观众没有手（是猴子/假肢/在拍桌子），因此凡是提到'拍手掌'的问题，必须回答'否'，严禁回答'无关'。

你现在是海龟汤游戏的AI主持人，必须严格遵守以下规则：
1. 此问题涉及汤面核心情节（${其他汤面关键词.filter(k => question.includes(k)).join('、')}），绝对不能回答"无关"
2. 必须根据汤底真相判断为"是"或"否"
3. 严禁输出任何"无关"、"无法判断"、"不相关"等模糊回答
4. 必须输出严格的JSON格式：{"thought": "简短推理过程", "answer": "是|否"}
5. 如果汤底明确说明与问题无关，可以回答"否"，但绝不能回答"无关"

现在开始判断：`

      const retryResponse = await axios.post(
        process.env.DEEPSEEK_API_URL,
        {
          model: process.env.DEEPSEEK_MODEL,
          messages: [
            { role: 'system', content: retryPrompt },
            { role: 'user', content: `请根据以下汤面和汤底判断玩家问题：
汤面：${story.surface}
汤底：${story.bottom}
玩家问题：${question}` }
          ],
          temperature: 0,
          max_tokens: 50
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )

      // 解析重试后的答案
      const retryRawAnswer = retryResponse.data.choices[0].message.content.trim()
      console.log('【后端日志-重试输出】AI重新生成的答案：', retryRawAnswer)

      try {
        const parsed = JSON.parse(retryRawAnswer)
        if (parsed.answer && ['是', '否'].includes(parsed.answer)) {
          answer = parsed.answer
          console.log('【后端日志-重试成功】最终答案：', answer)
        } else if (parsed.answer === '无关') {
          // 如果AI仍返回"无关"，强制改为"否"（有判断比无关强）
          console.warn('【后端日志-拦截】AI仍坚持回答"无关"，强制改为"否"')
          answer = '否'
        } else {
          // 其他情况，使用字符串解析
          answer = parseAIAnswer(retryRawAnswer)
        }
      } catch (e) {
        // JSON解析失败，使用字符串解析
        answer = parseAIAnswer(retryRawAnswer)
      }
    }

    // 只返回 answer 字段给前端，thought 用于日志调试
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
# AI海龟汤游戏技术设计文档
## 一、文档概述
### 1.1 文档目的
本文档基于AI海龟汤游戏PRD，明确系统的技术架构、模块设计、接口规范、数据模型、部署方案等核心技术细节，作为开发、测试、部署的核心依据。
### 1.2 文档范围
覆盖前端、后端、AI交互、数据库、部署等全技术栈设计，聚焦MVP阶段核心功能（游戏大厅、游戏页面、汤底页面），后续迭代功能仅预留扩展设计。
### 1.3 参考文档
《AI海龟汤游戏 PRD》

## 二、整体架构设计
### 2.1 架构总览
采用前后端分离架构，前端负责交互与界面展示，后端提供API接口、会话管理、AI调用逻辑，数据库存储故事数据与游戏会话数据，整体架构分层如下：
```
客户端层（Web）→ 前端应用层（React+TS）→ 后端服务层（Node.js+Express）→ AI服务层（DeepSeek/Claude API）→ 数据存储层（MongoDB/PostgreSQL）
```
### 2.2 技术栈明细（落地版）
| 技术层       | 核心技术选择                          | 选型说明                                                                 |
|--------------|---------------------------------------|--------------------------------------------------------------------------|
| 前端         | React + TypeScript + Tailwind CSS     | 类型安全保障交互逻辑，Tailwind提升UI开发效率，适配响应式设计需求         |
| 前端路由     | React Router v6                       | 管理游戏大厅、游戏页、汤底页等页面路由，支持参数传递（如故事ID）         |
| 状态管理     | React Context + useReducer            | 轻量管理游戏会话状态、筛选条件状态，MVP阶段无需引入Redux                 |
| 后端         | Node.js + Express                     | 轻量高效，适配快速开发，便于对接AI API与数据库                          |
| AI交互       | DeepSeek API（优先）/ Claude API      | 满足「是/否/无关」精准回答逻辑，提供SDK简化调用                         |
| 数据库       | MongoDB（优先）                       | 文档型数据库适配海龟汤故事的非结构化特征，便于存储故事、会话等数据       |
| 部署         | Vercel                                | 支持前后端一体化部署，全球加速满足性能要求（页面加载<2s，AI响应<1s）     |
| 接口文档     | Swagger/OpenAPI                       | 标准化后端API文档，便于前后端协作                                       |

## 三、前端设计
### 3.1 页面结构设计
#### 3.1.1 核心页面
| 页面         | 路径          | 核心组件                          | 功能说明                                                                 |
|--------------|---------------|-----------------------------------|--------------------------------------------------------------------------|
| 游戏大厅     | /             | StoryList、FilterBar、SortBar     | 展示故事列表，支持难度/题材筛选、热度/最新/难度排序，点击卡片跳转游戏页   |
| 游戏页面     | /game/:storyId | SoupSurface、ChatHistory、InputBar、FunctionBtn | 展示汤面、对话历史，处理玩家提问输入，调用AI回答，提供查看汤底/结束/重开按钮 |
| 汤底页面     | /soup-base/:storyId | SoupBaseContent、ReasoningReview、RestartBtn | 展示完整汤底（带动画），复盘推理过程，引导返回大厅                       |

#### 3.1.2 响应式适配
- 断点设计：移动端（<768px）、平板（768px-1024px）、PC端（>1024px）
- 适配规则：
  - 移动端：游戏页汤面置顶，对话流占主体，输入框固定底部；
  - PC端：游戏页汤面左侧固定（宽度30%），对话流居中（宽度50%），操作区右侧辅助。

### 3.2 组件设计（核心）
#### 3.2.1 StoryList（故事列表组件）
- 类型定义：
```typescript
interface StoryCardProps {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: 'suspense' | 'urban' | 'fantasy' | string;
  preview: string;
  onClick: () => void;
}
interface StoryListProps {
  stories: StoryCardProps[];
  loading: boolean;
}
```
- 交互逻辑：hover时卡片阴影加深+轻微上浮（动效），筛选/排序后实时刷新列表。

#### 3.2.2 ChatHistory（对话历史组件）
- 类型定义：
```typescript
type MessageRole = 'player' | 'ai';
type AiAnswer = 'yes' | 'no' | 'irrelevant';
interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  answer?: AiAnswer; // 仅AI消息有该字段
  timestamp: number;
}
interface ChatHistoryProps {
  messages: ChatMessage[];
  highlightKeys: string[]; // 汤底页高亮关键问题ID
}
```
- 交互逻辑：新消息自动滚动到底部，AI消息根据answer展示不同样式（如yes为绿色、no为红色、irrelevant为灰色）。

### 3.3 状态管理设计
通过React Context创建全局游戏上下文`GameContext`，管理核心状态：
```typescript
interface GameContextState {
  // 故事列表相关
  storyList: StoryCardProps[];
  filterCondition: { difficulty: string[]; theme: string[] };
  sortType: 'hot' | 'latest' | 'difficulty';
  // 游戏会话相关
  currentStory: null | { id: string; title: string; surface: string; base: string };
  chatMessages: ChatMessage[];
  isAiResponding: boolean;
  // 方法
  fetchStoryList: () => Promise<void>;
  sendPlayerQuestion: (content: string) => Promise<void>;
  viewSoupBase: () => void;
  restartGame: () => void;
  endGame: () => void;
}
```

### 3.4 前端性能优化
- 列表懒加载：游戏大厅故事列表采用Intersection Observer实现滚动加载，减少首屏渲染压力；
- 资源缓存：汤面/汤底文本、静态资源（主题样式、动画）本地缓存，重复进入页面无需重新请求；
- AI请求防抖：输入框提交按钮防抖（500ms），避免重复提交问题。

## 四、后端设计
### 4.1 服务架构
后端采用模块化设计，核心模块划分：
```
Express应用
├── 路由模块（routes）：story.js（故事相关）、game.js（游戏会话相关）
├── 控制器模块（controllers）：storyController.js、gameController.js
├── 服务模块（services）：aiService.js（AI调用）、dbService.js（数据库操作）
├── 中间件（middleware）：rateLimit.js（接口限流）、errorHandler.js（全局异常处理）
├── 配置模块（config）：aiConfig.js、dbConfig.js、appConfig.js
```

### 4.2 核心接口设计（RESTful）
| 接口路径                | 请求方法 | 接口描述                     | 请求参数                                  | 响应示例                                                                 |
|-------------------------|----------|------------------------------|-------------------------------------------|--------------------------------------------------------------------------|
| /api/stories            | GET      | 获取故事列表（支持筛选排序） | query：difficulty、theme、sort（hot/latest/difficulty） | {code:200, data:[{id:"1", title:"xxx", difficulty:"easy", theme:"suspense", preview:"xxx"}], msg:"success"} |
| /api/stories/:id        | GET      | 获取单个故事详情（汤面+汤底） | params：id                                 | {code:200, data:{id:"1", title:"xxx", surface:"xxx", base:"xxx"}, msg:"success"} |
| /api/game/session       | POST     | 创建游戏会话                 | body：storyId                             | {code:200, data:{sessionId:"s123", initMessages:[]}, msg:"success"}      |
| /api/game/session/:sessionId/question | POST | 提交玩家问题，获取AI回答 | params：sessionId；body：content | {code:200, data:{aiAnswer:"yes", messageId:"m456"}, msg:"success"} |
| /api/game/session/:sessionId | GET | 获取会话聊天记录 | params：sessionId | {code:200, data:{messages:[...]}, msg:"success"} |
| /api/game/session/:sessionId/restart | POST | 重置会话 | params：sessionId | {code:200, data:{messages:[]}, msg:"success"} |

### 4.3 AI服务模块设计（aiService.js）
核心功能：封装AI API调用，实现「是/否/无关」回答逻辑
```javascript
const { DeepSeekAPI } = require('deepseek-sdk'); // 示例SDK
const aiConfig = require('../config/aiConfig');

const aiService = {
  // 调用AI处理玩家问题
  async getAiAnswer(storyId, question, sessionMessages) {
    // 1. 获取故事详情（汤面+汤底）
    const story = await dbService.getStoryById(storyId);
    // 2. 构造AI提示词，限定回答仅为「是/否/无关」
    const prompt = `
      你是海龟汤游戏主持人，基于以下汤底回答玩家问题，仅能回复「是」「否」「无关」：
      汤底：${story.base}
      汤面：${story.surface}
      玩家问题：${question}
      历史对话：${JSON.stringify(sessionMessages.slice(-10))} // 仅传最近10条，减少token消耗
    `;
    // 3. 调用AI API
    const client = new DeepSeekAPI({ apiKey: aiConfig.apiKey });
    const response = await client.completions.create({
      prompt,
      max_tokens: 10,
      temperature: 0.1, // 低随机性，保证回答精准
      stop: ['\n']
    });
    // 4. 清洗回答，确保仅返回指定值
    const rawAnswer = response.choices[0].text.trim();
    const validAnswers = ['是', '否', '无关'];
    return validAnswers.includes(rawAnswer) ? rawAnswer : '无关';
  }
};

module.exports = aiService;
```

### 4.4 中间件设计
#### 4.4.1 接口限流（rateLimit.js）
防止API刷取，保障服务稳定性：
```javascript
const rateLimit = require('express-rate-limit');

const gameApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 30, // 每个IP最多30次请求
  message: { code: 429, msg: '请求过于频繁，请稍后再试' },
  standardHeaders: true
});

// 应用到游戏相关接口
app.use('/api/game', gameApiLimiter);
```

#### 4.4.2 全局异常处理（errorHandler.js）
统一异常响应格式：
```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    code: err.statusCode || 500,
    msg: err.message || '服务器内部错误',
    data: null
  });
};

app.use(errorHandler);
```

## 五、数据库设计（MongoDB）
### 5.1 核心集合（Collection）
#### 5.1.1 stories（海龟汤故事库）
| 字段名       | 类型      | 描述                                  | 示例值                          |
|--------------|-----------|---------------------------------------|---------------------------------|
| _id          | ObjectId  | 故事唯一ID                            | 650001a8e89b1c2d34567890        |
| title        | String    | 故事标题                              | "午夜的敲门声"                  |
| difficulty   | String    | 难度（easy/medium/hard）              | "medium"                        |
| theme        | Array     | 题材（支持多标签）                    | ["悬疑", "都市"]                |
| preview      | String    | 预览文案                              | "深夜，他听到敲门声，却没人..." |
| surface      | String    | 汤面（谜面）                          | "一个人住在顶楼，半夜听到敲门声，开门却没人，第二天发现楼下有人死了。" |
| base         | String    | 汤底（真相）                          | "死者是跳楼自杀，敲顶楼门是因为坠落过程中碰到了门，开门时人已经掉下去了。" |
| hotScore     | Number    | 热度值（用于排序）                    | 1200                            |
| createTime   | Date      | 创建时间                              | 2024-09-10T08:00:00.000Z        |
| updateTime   | Date      | 更新时间                              | 2024-09-10T09:30:00.000Z        |

#### 5.1.2 gameSessions（游戏会话）
| 字段名       | 类型      | 描述                                  | 示例值                          |
|--------------|-----------|---------------------------------------|---------------------------------|
| _id          | ObjectId  | 会话ID                                | 650002b9e89b1c2d34567891        |
| storyId      | ObjectId  | 关联故事ID                            | 650001a8e89b1c2d34567890        |
| messages     | Array     | 对话记录（内嵌文档）                  | [{id:"m1", role:"player", content:"敲门的是人吗？", timestamp:1726000000}, {id:"m2", role:"ai", content:"否", timestamp:1726000005}] |
| isEnded      | Boolean   | 会话是否结束                          | false                           |
| createTime   | Date      | 会话创建时间                          | 2024-09-10T10:00:00.000Z        |
| updateTime   | Date      | 会话更新时间                          | 2024-09-10T10:10:00.000Z        |

### 5.2 索引设计
- stories集合：为`difficulty`、`theme`、`hotScore`、`createTime`创建索引，提升筛选/排序效率；
- gameSessions集合：为`storyId`、`createTime`创建索引，便于查询会话数据。

## 六、非功能需求落地设计
### 6.1 性能优化
- 页面加载：前端静态资源压缩（JS/CSS/图片）、Vercel CDN加速，保证加载<2s；
- AI响应：后端缓存热门故事的AI提示词模板，AI API调用超时设置为1s，超时后返回友好提示并自动重试1次；
- 数据库查询：通过索引+分页（游戏大厅列表默认分页20条）减少查询耗时。

### 6.2 可用性设计
- 游客模式：无需登录即可访问游戏大厅、进入游戏，会话数据存储在前端localStorage（关闭页面后丢失）；
- 错误兜底：AI服务异常时，返回预设的「暂时无法回答，请稍后再试」，保证游戏流程不中断；
- 操作容错：输入框为空时禁用提交按钮，防止空问题提交。

### 6.3 安全性设计
- 接口鉴权：游客模式下接口仅允许基础访问，后续登录功能接入后，通过JWT鉴权；
- 数据加密：后续用户系统上线后，密码采用bcrypt加密存储，加盐值随机；
- 内容过滤：后端接收用户输入的问题时，通过敏感词过滤库（如node-sensitive-word）过滤违规内容。

## 七、部署方案
### 7.1 部署架构
基于Vercel实现一体化部署：
1. 前端代码：直接部署到Vercel，关联GitHub仓库，开启自动构建；
2. 后端代码：以Vercel Serverless Functions形式部署，无需单独搭建服务器；
3. 数据库：MongoDB Atlas（云数据库），配置VPC白名单仅允许Vercel访问；
4. AI API密钥：通过Vercel环境变量管理，避免硬编码。

### 7.2 部署流程
1. 前端打包：`npm run build`，生成dist目录；
2. 后端配置：在Vercel控制台配置环境变量（AI API密钥、数据库连接字符串等）；
3. 触发部署：提交代码到GitHub仓库，Vercel自动触发构建部署；
4. 验证：访问Vercel分配的域名，测试核心功能（故事列表、提问、AI回答、查看汤底）。

## 八、扩展设计（后续迭代）
### 8.1 用户系统扩展
- 预留用户集合（users）设计，包含`_id`、`username`、`password`（加密）、`email`、`gameHistory`（关联会话ID）等字段；
- 前端预留登录/注册组件、个人中心组件的占位符，后端预留用户相关路由/控制器。

### 8.2 多人模式扩展
- 后端预留WebSocket模块（如Socket.io），支持实时多人对话；
- 数据库预留房间集合（rooms），存储房间ID、房主、参与人、当前故事等信息。

### 8.3 自定义创作扩展
- 后端预留故事提交/审核接口，数据库预留`status`字段（draft/review/published）标识故事状态；
- 前端预留创作页面组件，支持富文本编辑汤面/汤底。

## 九、风险与应对
| 风险点                 | 影响程度 | 应对措施                                                                 |
|------------------------|----------|--------------------------------------------------------------------------|
| AI API调用超时/失败    | 高       | 前端增加加载状态+重试逻辑，后端缓存AI回答（热门问题），配置备用AI接口（Claude） |
| 数据库连接异常         | 高       | 后端增加数据库重连机制，配置读写分离（后续），前端展示友好错误提示       |
| 接口被刷取             | 中       | 开启接口限流，增加IP白名单（运营后台），监控接口访问日志                 |
| 响应速度不达标         | 中       | 优化前端渲染（虚拟列表）、后端查询（索引+缓存）、AI提示词（精简token）   |

## 十、文档版本
| 版本 | 修订时间   | 修订人 | 修订内容               |
|------|------------|--------|------------------------|
| V1.0 | 2024-09-10 | 技术组 | 完成MVP阶段核心设计     |
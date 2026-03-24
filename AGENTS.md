# AGENTS.md
## 项目概述
基于React + TypeScript + Tailwind CSS技术栈开发AI海龟汤游戏的智能交互Agent模块，该模块负责处理玩家提问、调用AI接口、生成标准化回答，并与游戏核心逻辑联动，保障海龟汤游戏中AI主持人的交互体验。

## 开发规范
- 使用TypeScript编写所有代码，严格定义类型接口，确保类型安全
- 采用函数式编程思想 + React Hooks（如useCallback、useEffect）管理Agent逻辑
- 样式遵循项目统一的Tailwind CSS规范，仅在Agent相关UI组件中使用
- 核心逻辑封装为可复用的hooks/工具函数，代码关键逻辑需添加清晰注释
- Agent模块需做分层设计（请求层、处理层、响应层），便于维护和扩展

## 代码风格
- 组件名使用PascalCase：如`AiAnswerAgent`、`QuestionProcessor`
- 函数名使用camelCase：如`processPlayerQuestion`、`formatAiResponse`
- 常量使用UPPER_SNAKE_CASE：如`AI_API_TIMEOUT`、`VALID_ANSWER_TYPES`
- 类型定义以T开头：如`TAiMessage`、`TQuestionParams`
- 接口定义以I开头：如`IAiService`、`IQuestionProcessor`

## 设计要求
### 视觉适配
- 遵循项目整体风格：神秘悬疑，深蓝色调（bg-slate-900）
- 强调色：金色（text-amber-400），用于AI回答结果高亮
- 圆角：rounded-lg，应用于AI消息气泡、加载组件
- 阴影：shadow-lg，用于AI状态提示卡片

### 功能设计
- AI响应超时时间控制在1秒内，超时展示友好提示
- 严格限制AI回答格式为「是/否/无关」，非标准回答自动修正为「无关」
- 实现提问防抖（500ms），避免重复请求AI接口
- 支持历史对话上下文传递，提升AI回答准确性
- 设计降级策略：AI接口异常时，返回预设兜底回答

## 注意事项
- 保持Agent模块代码简洁，聚焦核心交互逻辑，避免过度设计
- 优先实现「提问-回答」核心流程，再扩展上下文、缓存等优化功能
- 确保移动端适配：AI消息流在小屏设备上正常展示，输入框固定底部不遮挡
- AI API Key通过环境变量（.env文件）管理，代码中使用`process.env.REACT_APP_AI_API_KEY`读取，禁止硬编码
- 对玩家输入的问题做敏感词过滤，避免违规内容调用AI接口
- 封装AI接口调用逻辑为独立service，便于后续切换不同AI服务商（DeepSeek/Claude）

## 测试要求
- 功能测试：验证不同类型问题下AI回答是否符合「是/否/无关」规范
- 异常测试：模拟AI接口超时、失败、返回非标准内容，验证降级策略是否生效
- 兼容性测试：确保在移动端、平板、PC端不同屏幕尺寸下，AI交互流程正常
- 性能测试：连续发送10次提问，验证接口防抖、响应速度是否符合要求
- 安全测试：检查代码中是否存在AI API Key硬编码、敏感词过滤是否生效

## 核心类型定义示例
```typescript
// AI消息类型
export type TAiAnswer = 'yes' | 'no' | 'irrelevant';
export type TMessageRole = 'player' | 'ai';

// 消息结构
export interface TMessage {
  id: string;
  role: TMessageRole;
  content: string;
  answer?: TAiAnswer; // 仅AI消息包含
  timestamp: number;
}

// AI服务接口
export interface IAiService {
  getAnswer: (
    storyId: string,
    question: string,
    history: TMessage[]
  ) => Promise<TAiAnswer>;
}

// 常量定义
export const AI_API_TIMEOUT = 1000; // AI接口超时时间(ms)
export const VALID_ANSWER_TYPES: TAiAnswer[] = ['yes', 'no', 'irrelevant'];
export const DEFAULT_AI_ANSWER: TAiAnswer = 'irrelevant'; // 兜底回答
```

## 核心函数示例
```typescript
import { IAiService, TMessage, TAiAnswer, AI_API_TIMEOUT, VALID_ANSWER_TYPES, DEFAULT_AI_ANSWER } from './types';

/**
 * 处理玩家提问，调用AI服务并返回标准化回答
 * @param storyId 故事ID
 * @param question 玩家问题
 * @param history 对话历史
 * @param aiService AI服务实例
 * @returns 标准化的AI回答
 */
export const processPlayerQuestion = async (
  storyId: string,
  question: string,
  history: TMessage[],
  aiService: IAiService
): Promise<TAiAnswer> => {
  // 空问题直接返回无关
  if (!question.trim()) return DEFAULT_AI_ANSWER;

  try {
    // 设置超时控制
    const timeoutPromise = new Promise<TAiAnswer>((_, reject) => 
      setTimeout(() => reject(new Error('AI响应超时')), AI_API_TIMEOUT)
    );
    
    const aiPromise = aiService.getAnswer(storyId, question, history);
    const rawAnswer = await Promise.race([aiPromise, timeoutPromise]);
    
    // 标准化回答格式
    return VALID_ANSWER_TYPES.includes(rawAnswer) ? rawAnswer : DEFAULT_AI_ANSWER;
  } catch (error) {
    console.error('处理玩家提问失败:', error);
    return DEFAULT_AI_ANSWER; // 异常时返回兜底回答
  }
};
```

### 总结
1. AI海龟汤Agent模块需严格遵循TypeScript类型规范、代码命名风格和视觉设计要求，核心聚焦「提问-标准化回答」的交互逻辑；
2. 重点保障AI接口调用的安全性（API Key环境变量）、稳定性（超时控制+降级策略）和准确性（回答格式校验）；
3. 测试需覆盖功能、异常、兼容性、性能等维度，确保Agent模块在不同场景下稳定运行。
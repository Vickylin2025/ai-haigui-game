import React from 'react';

/**
 * 消息角色类型：玩家（用户）或 AI
 */
export type TMessageRole = 'player' | 'ai';

/**
 * 单条消息的接口定义
 * @interface IMessage
 * @property {TMessageRole} role - 消息发送者角色
 * @property {string} content - 消息内容
 * @property {boolean} [isError] - 是否为错误消息（仅 AI 消息生效）
 */
export interface IMessage {
  role: TMessageRole;
  content: string;
  isError?: boolean; // 标记 AI 消息是否为错误提示
}

/**
 * 消息组件的属性接口
 * @interface MessageProps
 * @property {IMessage} message - 要展示的消息数据
 * @property {string} [className] - 自定义外层容器类名（可选）
 */
export interface MessageProps {
  message: IMessage;
  className?: string;
}

/**
 * 聊天消息展示组件
 * 支持区分玩家/AI 消息、错误状态展示、加载中动画
 * @param {MessageProps} props - 组件属性
 * @returns {React.ReactElement} 渲染后的消息组件
 */
export const Message: React.FC<MessageProps> = ({
  message,
  className = '',
}) => {
  // 判断是否为玩家（用户）消息
  const isPlayer = message.role === 'player';
  // 判断是否为加载中状态
  const isThinking = message.content === '思考中...';

  return (
    <div
      className={[
        'flex py-2 px-1 sm:px-2', // 基础间距
        isPlayer ? 'justify-end' : 'justify-start', // 对齐方式
        className, // 自定义类名
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'flex max-w-[88%] items-end gap-2 sm:max-w-[70%]', // 最大宽度 + 对齐 + 间距
          isPlayer ? 'flex-row-reverse' : 'flex-row', // 头像和内容的排列方向
        ].join(' ')}
      >
        {/* 头像容器 */}
        <div
          aria-hidden="true"
          className={[
            'grid size-9 shrink-0 place-items-center rounded-full shadow-lg transition-colors duration-200',
            isPlayer
              ? 'bg-amber-400 text-slate-900 hover:bg-amber-500' // 玩家头像样式 + 悬浮效果
              : 'bg-slate-800 text-amber-400 hover:bg-slate-700', // AI 头像样式 + 悬浮效果
          ].join(' ')}
          title={isPlayer ? '你' : 'AI'}
        >
          <span className="text-xs font-bold tracking-tight">
            {isPlayer ? '你' : 'AI'}
          </span>
        </div>

        {/* 消息内容容器 */}
        <div
          className={[
            'rounded-lg px-3 py-2 text-sm leading-6 shadow-lg transition-all duration-200',
            isPlayer
              ? 'bg-amber-400 text-slate-900 hover:bg-amber-500/90' // 玩家消息样式 + 悬浮效果
              : message.isError
                ? 'bg-red-700 text-white hover:bg-red-800' // AI 错误消息样式
                : 'border border-slate-800 bg-slate-950/40 text-slate-100 hover:bg-slate-950/60', // AI 正常消息样式
            isThinking ? 'min-h-[40px] flex items-center' : '', // 加载中状态最小高度
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {/* 加载中状态处理 */}
          {isThinking ? (
            isPlayer ? (
              <span className="flex items-center">
                思考中
                <span className="ml-1 animate-pulse">...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-slate-100"></span>
                <span>思考中...</span>
              </span>
            )
          ) : (
            // 普通消息内容（支持换行）
            <span className="whitespace-pre-wrap">{message.content}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// 默认导出，方便其他模块导入
export default Message;
import { useEffect, useMemo, useRef, useState } from 'react'
import { Message, type IMessage } from './Message'

// 工具函数：彻底清理输入字符，统一格式
function cleanUserInput(input: string): string {
  if (!input) return '';
  
  return input
    // 1. 全角转半角（解决输入法全角符号问题）
    .replace(/[\uff01-\uff5e]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    // 2. 移除所有不可见控制字符（零宽空格、制表符、换行等）
    .replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, '')
    // 3. 连续空格/换行合并为单个空格
    .replace(/\s+/g, ' ')
    // 4. 首尾空格彻底清除
    .trim()
    // 5. 统一问号格式（把全角？转半角?）
    .replace(/？/g, '?')
}

export interface ChatBoxProps {
  messages: IMessage[]
  onSend: (content: string) => void | Promise<void>
  placeholder?: string
  disabled?: boolean
}

export function ChatBox({
  messages,
  onSend,
  placeholder = '请输入你的问题（回车发送）',
  disabled = false,
}: ChatBoxProps) {
  const [value, setValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const listEndRef = useRef<HTMLDivElement | null>(null)

  // 判断是否可以发送（基于清洗后的值）
  const canSend = useMemo(() => {
    if (disabled) return false
    if (isSending) return false
    return cleanUserInput(value).length > 0
  }, [disabled, isSending, value])

  // 消息列表自动滚动到底部
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages.length])

  // 发送消息逻辑
  const send = async () => {
    const content = cleanUserInput(value)
    if (!content || !canSend) return

    try {
      setIsSending(true)
      await onSend(content)
      setValue('') // 发送成功后清空输入框
    } catch (error) {
      console.error('发送消息失败:', error)
      // 可根据需求添加错误提示
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-slate-800 bg-slate-950/20 shadow-lg">
      {/* 消息列表区域 */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 1 && messages[0].content === '规则提示：我只会回答「是 / 否 / 无关」。开始提问吧。' ? (
          <div className="text-center text-slate-400 py-8">
            <p className="text-lg mb-2">欢迎来到海龟汤游戏！</p>
            <p>请提出你的第一个问题，AI会用「是 / 否 / 无关」来回答。</p>
            <p className="mt-4 text-slate-500 text-sm">{messages[0].content}</p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <Message key={`${m.role}-${idx}-${m.content}`} message={m} />
          ))
        )}
        <div ref={listEndRef} />
      </div>

      {/* 输入框区域 */}
      <div className="border-t border-slate-800 bg-slate-950/60 p-3">
        <div className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => setValue(cleanUserInput(e.target.value))}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              if (e.shiftKey) return // 允许shift+enter换行（如果需要）
              e.preventDefault()
              void send()
            }}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!canSend}
            className={`rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg transition-all duration-200 ease-in-out
              ${canSend ? 'hover:bg-amber-300 hover:scale-105 active:scale-95' : ''}
              ${!canSend ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            {isSending ? '发送中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  )
}
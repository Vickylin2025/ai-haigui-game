import { useEffect, useMemo, useRef, useState } from 'react'
import { Message, type IMessage } from './Message'

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

  const canSend = useMemo(() => {
    if (disabled) return false
    if (isSending) return false
    return value.trim().length > 0
  }, [disabled, isSending, value])

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages.length])

  const send = async () => {
    const content = value.trim()
    if (!content || !canSend) return

    try {
      setIsSending(true)
      await onSend(content)
      setValue('')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-slate-800 bg-slate-950/20 shadow-lg">
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

      <div className="border-t border-slate-800 bg-slate-950/60 p-3">
        <div className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              if (e.shiftKey) return
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
              ${disabled || isSending ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}


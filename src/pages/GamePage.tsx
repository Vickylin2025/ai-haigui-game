import { useCallback, useMemo, useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ChatBox } from '../components/ChatBox'
import type { IMessage } from '../components/Message'
import { stories } from '../data/stories'
import { askAI } from '../services/api'
import { useGame } from '../context/GameContext'

export function GamePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { startGame, endGame } = useGame()

  const story = useMemo(() => stories.find((s) => s.id === id), [id])

  useEffect(() => {
    if (story) {
      startGame()
    } else {
      endGame()
    }
    return () => {
      endGame()
    }
  }, [story, startGame, endGame])

  const [messages, setMessages] = useState<IMessage[]>(() => [
    { role: 'ai', content: '规则提示：我只会回答「是 / 否 / 无关」。开始提问吧。' },
  ])
  const [isAiResponding, setIsAiResponding] = useState(false)

  const onSend = useCallback(
    async (content: string) => {
      if (!story) return
      const question = content.trim()
      if (!question) return
      if (isAiResponding) return

      setIsAiResponding(true)
      setMessages((prev) => [
        ...prev,
        { role: 'player', content: question },
        { role: 'ai', content: '思考中...' },
      ])

      try {
        const { answer, isFallback } = await askAI(question, story)
        setMessages((prev) => {
          if (prev.length === 0) return prev
          const next = prev.slice()
          const lastIdx = next.length - 1

          // ✅ 完美兜底逻辑：正常=是/否，异常=无关+提示
          let finalAnswer = answer;
          if (isFallback) {
            finalAnswer = `${answer} (AI可能未能理解您的提问，请尝试换种问法)`
          }

          if (next[lastIdx]?.role === 'ai' && next[lastIdx]?.content === '思考中...') {
            next[lastIdx] = { role: 'ai', content: finalAnswer }
            return next
          }
          return [...next, { role: 'ai', content: finalAnswer }]
        })
      } catch (err) {
        setMessages((prev) => {
          const next = prev.slice()
          const lastIdx = next.length - 1
          const friendly = 'AI暂时无法响应，请检查网络或稍后再试。'
          if (next[lastIdx]?.role === 'ai' && next[lastIdx]?.content === '思考中...') {
            next[lastIdx] = { role: 'ai', content: friendly, isError: true }
            return next
          }
          return [...next, { role: 'ai', content: friendly, isError: true }]
        })
      } finally {
        setIsAiResponding(false)
      }
    },
    [isAiResponding, story]
  )

  if (!story) {
    return (
      <div className="min-h-dvh bg-slate-900 text-slate-100">
        <div className="mx-auto w-full max-w-5xl px-4 py-10">
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-5 shadow-lg">
            <div className="text-sm text-slate-400">未找到该故事</div>
            <div className="mt-2 text-lg font-semibold tracking-tight text-amber-400">
              这个房间里没有答案
            </div>
            <Link
              to="/"
              className="mt-4 inline-flex rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg hover:bg-amber-300"
            >
              返回大厅
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-slate-900 text-slate-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4">
        <header className="py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight text-amber-400">
                {story.title}
              </h1>
              <div className="mt-1 text-xs text-slate-400">
                只问是/否问题，逼近真相。
              </div>
            </div>
            <Link
              to="/"
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-950/40"
            >
              返回大厅
            </Link>
          </div>

          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/40 p-4 shadow-lg">
            <div className="text-sm font-medium text-slate-200">汤面</div>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              {story.surface}
            </p>
          </div>
        </header>

        <main className="min-h-0 flex-1 pb-24">
          {isAiResponding && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            </div>
          )}
          <ChatBox
            messages={messages}
            onSend={onSend}
            placeholder="请输入你的问题（回车发送）"
            disabled={isAiResponding}
          />
        </main>

        <footer className="sticky bottom-0 border-t border-slate-800 bg-slate-950/80 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                const dialogueHistory = messages
                  .filter(
                    (msg) =>
                      msg.content !== '思考中...' &&
                      msg.content !== '规则提示：我只会回答「是 / 否」。开始提问吧。'
                  )
                  .map((msg) => ({ speaker: msg.role === 'player' ? '玩家' : 'AI', text: msg.content }))

                navigate('/result', {
                  state: {
                    storyTitle: story.title,
                    soupBase: story.bottom,
                    dialogueHistory: dialogueHistory,
                  },
                })
              }}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-900"
            >
              查看汤底
            </button>
            <button
              onClick={() => navigate('/')}
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg hover:bg-amber-300"
            >
              结束游戏
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
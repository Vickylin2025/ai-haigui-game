import { Link } from 'react-router-dom'
import { GameCard } from '../components/GameCard'
import { stories } from '../data/stories'

export function HomePage() {
  return (
    <div className="min-h-dvh bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-amber-400">
                AI海龟汤
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                你只需要提出<strong className="text-amber-300">是/否</strong>
                问题，AI 主持人只会回答「是 / 否 / 无关」。在有限信息里抽丝剥茧，逼近那句被黑暗藏起来的真相。
              </p>
            </div>
            <Link
              to="/preview"
              className="shrink-0 rounded-lg border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
            >
              游戏介绍
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <section className="rounded-lg border border-slate-800 bg-slate-950/20 p-4 shadow-lg">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-slate-200">
                选择一个故事开始
              </div>
              <div className="mt-1 text-xs text-slate-400">
                难度越高，误导越多；但真相永远只有一个。
              </div>
            </div>
            <div className="text-xs text-slate-500">
              共 {stories.length} 个故事
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <GameCard key={story.id} story={story} />
          ))}
        </section>
      </main>
    </div>
  )
}


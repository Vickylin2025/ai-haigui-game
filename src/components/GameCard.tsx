import { Link } from 'react-router-dom'
import type { IStory, TDifficulty } from '../data/stories'

export interface GameCardProps {
  story: IStory
}

function getDifficultyMeta(difficulty: TDifficulty) {
  switch (difficulty) {
    case 'easy':
      return { label: '简单', className: 'bg-emerald-500/15 text-emerald-200' }
    case 'medium':
      return { label: '中等', className: 'bg-amber-400/15 text-amber-300' }
    case 'hard':
      return { label: '困难', className: 'bg-rose-500/15 text-rose-200' }
  }
}

export function GameCard({ story }: GameCardProps) {
  const meta = getDifficultyMeta(story.difficulty)

  return (
    <Link
      to={`/game/${story.id}`}
      className="group block rounded-lg border border-slate-800 bg-slate-950/40 p-4 shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:border-slate-700 hover:bg-slate-950/60 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold tracking-tight text-slate-100 group-hover:text-amber-200">
            {story.title}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={[
                'inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium',
                meta.className,
              ].join(' ')}
            >
              {meta.label}
            </span>
            <span className="text-xs text-slate-400">点击开始推理</span>
          </div>
        </div>

        <span className="mt-0.5 shrink-0 text-amber-400/80 transition group-hover:text-amber-300">
          →
        </span>
      </div>
    </Link>
  )
}


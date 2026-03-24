import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-dvh bg-slate-900 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-10">
        <div className="text-sm text-slate-400">404</div>
        <h1 className="text-xl font-semibold tracking-tight text-amber-400">
          页面不存在
        </h1>
        <Link
          to="/"
          className="mt-2 w-fit rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg hover:bg-amber-300"
        >
          返回大厅
        </Link>
      </div>
    </div>
  )
}


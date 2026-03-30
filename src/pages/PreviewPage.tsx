import { Link } from 'react-router-dom'
import { stories } from '../data/stories'

const features = [
  {
    icon: '🎭',
    title: '沉浸式推理',
    description: '每个故事都是精心设计的谜题，等你抽丝剥茧，揭开真相。',
  },
  {
    icon: '🤖',
    title: 'AI主持人',
    description: '智能AI扮演主持人角色，只回答"是/否/无关"，让推理更具挑战。',
  },
  {
    icon: '🏆',
    title: '多难度挑战',
    description: '从简单到困难，循序渐进，满足不同水平的推理爱好者。',
  },
  {
    icon: '✨',
    title: '经典海龟汤',
    description: '精选经典情境推理故事，逻辑严密，真相出人意料却又合情合理。',
  },
]

const rules = [
  { step: 1, title: '阅读汤面', description: '仔细阅读故事的开端，这是你唯一的线索。' },
  { step: 2, title: '提出问题', description: '提出可以用"是"或"否"回答的问题来获取信息。' },
  { step: 3, title: '分析答案', description: '根据AI的回答，排除不可能，缩小真相范围。' },
  { step: 4, title: '揭开真相', description: '当你觉得已经推理出答案，可以查看汤底揭晓谜底。' },
]

// 预览示例故事（随机选一个展示）
const previewStory = stories[0]

export function PreviewPage() {
  return (
    <div className="min-h-dvh bg-slate-900 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-slate-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm text-amber-300">
              <span className="mr-2">🐢</span>
              情境推理游戏
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-6xl">
              <span className="text-amber-400">AI</span>海龟汤
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              你只需要提出<span className="font-semibold text-amber-300">是/否</span>问题，
              AI 主持人只会回答「是 / 否 / 无关」。
              在有限信息里抽丝剥茧，逼近那句被黑暗藏起来的真相。
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/"
                className="rounded-lg bg-amber-400 px-8 py-3.5 text-base font-semibold text-slate-900 shadow-lg transition hover:bg-amber-300 hover:shadow-xl"
              >
                开始游戏
              </Link>
              <a
                href="#how-to-play"
                className="rounded-lg border border-slate-700 px-8 py-3.5 text-base font-medium transition hover:bg-slate-800"
              >
                了解玩法
              </a>
            </div>

            {/* 统计信息 */}
            <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8">
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:p-6">
                <div className="text-2xl font-bold text-amber-400 sm:text-3xl">{stories.length}</div>
                <div className="mt-1 text-sm text-slate-400">精选故事</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:p-6">
                <div className="text-2xl font-bold text-amber-400 sm:text-3xl">3</div>
                <div className="mt-1 text-sm text-slate-400">难度等级</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:p-6">
                <div className="text-2xl font-bold text-amber-400 sm:text-3xl">AI</div>
                <div className="mt-1 text-sm text-slate-400">智能主持</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-slate-800 bg-slate-950/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
              为什么选择<span className="text-amber-400">AI海龟汤</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">
              经典的情境推理游戏，结合现代AI技术，带来全新的推理体验
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-lg border border-slate-800 bg-slate-950/40 p-6 transition-all hover:border-slate-700 hover:bg-slate-950/60"
              >
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="mt-4 text-lg font-semibold text-slate-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section id="how-to-play" className="border-t border-slate-800">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
              如何游玩
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">
              简单四步，开启你的推理之旅
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {rules.map((rule, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-start rounded-lg border border-slate-800 bg-slate-950/40 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-lg font-bold text-slate-900">
                    {rule.step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-100">
                    {rule.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {rule.description}
                  </p>
                </div>
                {index < rules.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center text-slate-600 lg:flex">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Preview Section */}
      <section className="border-t border-slate-800 bg-slate-950/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
              故事预览
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">
              精选精彩故事，每个都是一道独特的推理谜题
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 汤面预览 */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-6 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-amber-400/15 px-2 py-1 text-xs font-medium text-amber-300">
                  汤面
                </span>
                <span className="text-xs text-slate-500">谜面</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-100">
                {previewStory.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-300">
                {previewStory.surface}
              </p>
              <div className="mt-6 flex items-center justify-between">
                <span className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-200">
                  简单难度
                </span>
                <span className="text-sm text-slate-500">你能猜到真相吗？</span>
              </div>
            </div>

            {/* 更多故事列表 */}
            <div className="space-y-4">
              {stories.slice(1, 5).map((story) => (
                <div
                  key={story.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 transition hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h4 className="truncate font-medium text-slate-100">
                        {story.title}
                      </h4>
                      <p className="mt-1 truncate text-sm text-slate-400">
                        {story.surface.slice(0, 40)}...
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-lg px-2 py-1 text-xs font-medium ${
                        story.difficulty === 'easy'
                          ? 'bg-emerald-500/15 text-emerald-200'
                          : story.difficulty === 'medium'
                            ? 'bg-amber-400/15 text-amber-300'
                            : 'bg-rose-500/15 text-rose-200'
                      }`}
                    >
                      {story.difficulty === 'easy' ? '简单' : story.difficulty === 'medium' ? '中等' : '困难'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/"
              className="inline-flex rounded-lg bg-amber-400 px-8 py-3 text-base font-semibold text-slate-900 shadow-lg transition hover:bg-amber-300"
            >
              查看全部 {stories.length} 个故事
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-800">
        <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:py-20">
          <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 to-slate-950/40 p-8 text-center shadow-xl sm:p-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
              准备好揭开真相了吗？
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-300">
              每一个故事背后，都有一个出人意料却又合情合理的真相。现在就开始你的推理之旅吧！
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex rounded-lg bg-amber-400 px-8 py-3.5 text-base font-semibold text-slate-900 shadow-lg transition hover:bg-amber-300 hover:shadow-xl"
            >
              立即开始
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐢</span>
              <span className="font-semibold text-amber-400">AI海龟汤</span>
            </div>
            <p className="text-sm text-slate-500">
              经典情境推理游戏 · AI智能主持
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

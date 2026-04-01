import { Link } from 'react-router-dom';
import type { IStory as OriginalIStory, TDifficulty as OriginalTDifficulty } from '../data/stories';

// 重新导出类型（确保外部使用时的一致性）
export type TDifficulty = OriginalTDifficulty extends 'easy' | 'medium' | 'hard' 
  ? OriginalTDifficulty 
  : 'easy' | 'medium' | 'hard';

// 扩展并覆盖接口（确保类型安全）
export interface IStory extends Omit<OriginalIStory, 'difficulty'> {
  id: string | number;
  title: string;
  difficulty: TDifficulty;
  description?: string;
  coverImg?: string;
}

export interface GameCardProps {
  story: IStory;
}

/**
 * 获取难度对应的元信息（标签文本 + 样式类名）
 * @param difficulty 难度等级
 * @returns 难度元信息对象
 */
function getDifficultyMeta(difficulty: unknown): { label: string; className: string } {
  // 类型守卫：确保难度值合法
  const validDifficulties: TDifficulty[] = ['easy', 'medium', 'hard'];
  if (!validDifficulties.includes(difficulty as TDifficulty)) {
    return { label: '未知', className: 'bg-slate-500/15 text-slate-200' };
  }

  const safeDifficulty = difficulty as TDifficulty;
  switch (safeDifficulty) {
    case 'easy':
      return { label: '简单', className: 'bg-emerald-500/15 text-emerald-200' };
    case 'medium':
      return { label: '中等', className: 'bg-amber-400/15 text-amber-300' };
    case 'hard':
      return { label: '困难', className: 'bg-rose-500/15 text-rose-200' };
  }
}

/**
 * 游戏卡片组件
 * 展示单个故事的卡片，包含标题、难度标签，点击可跳转至游戏页面
 * @param props 组件属性（包含单个故事数据）
 * @returns 渲染后的游戏卡片
 */
export function GameCard({ story }: GameCardProps) {
  // 空值保护
  if (!story) return null;

  const meta = getDifficultyMeta(story.difficulty);
  const cardAriaLabel = `开始推理：${story.title}（难度：${meta.label}）`;

  return (
    <Link
      to={`/game/${story.id}`}
      className="group block rounded-lg border border-slate-800 bg-slate-950/40 p-4 shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:border-slate-700 hover:bg-slate-950/60 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
      aria-label={cardAriaLabel}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* 标题 */}
          <h3 className="truncate text-base font-semibold tracking-tight text-slate-100 group-hover:text-amber-200">
            {story.title || '未命名故事'}
          </h3>
          
          {/* 难度标签 + 提示文本 */}
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium ${meta.className}`}
            >
              {meta.label}
            </span>
            <span className="text-xs text-slate-400">点击开始推理</span>
          </div>

          {/* 故事简介（有则显示） */}
          {story.description && story.description.trim() ? (
            <p className="mt-2 text-xs text-slate-500 line-clamp-2">
              {story.description}
            </p>
          ) : null}
        </div>

        {/* 箭头图标（改用 SVG 更通用） */}
        <span className="mt-0.5 shrink-0 text-amber-400/80 transition-all group-hover:text-amber-300 group-hover:translate-x-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M13.5 4.5L21 12L13.5 19.5L12 18L17.25 12.75L3 12.75L3 11.25L17.25 11.25L12 6L13.5 4.5Z" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

// 默认导出（方便导入使用）
export default GameCard;
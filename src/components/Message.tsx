export type TMessageRole = 'player' | 'ai'

export interface IMessage {
  role: TMessageRole
  content: string
  isError?: boolean // Add isError property
}

export interface MessageProps {
  message: IMessage
}

export function Message({ message }: MessageProps) {
  const isPlayer = message.role === 'player'

  return (
    <div className={['flex', isPlayer ? 'justify-end' : 'justify-start'].join(' ')}>
      <div
        className={[
          'flex max-w-[88%] items-end gap-2 sm:max-w-[70%]',
          isPlayer ? 'flex-row-reverse' : 'flex-row',
        ].join(' ')}
      >
        <div
          aria-hidden="true"
          className={[
            'grid size-9 shrink-0 place-items-center rounded-full shadow-lg',
            isPlayer
              ? 'bg-amber-400 text-slate-900'
              : 'bg-slate-800 text-amber-400',
          ].join(' ')}
          title={isPlayer ? '你' : 'AI'}
        >
          <span className="text-xs font-bold tracking-tight">
            {isPlayer ? '你' : 'AI'}
          </span>
        </div>

        <div
          className={[
            'rounded-lg px-3 py-2 text-sm leading-6 shadow-lg',
            isPlayer
              ? 'bg-amber-400 text-slate-900'
              : message.isError
                ? 'bg-red-700 text-white' // Error style
                : 'border border-slate-800 bg-slate-950/40 text-slate-100',
          ].join(' ')}
        >
          {message.role === 'ai' && message.content === '思考中...' ? (
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-slate-100"></span>
          ) : message.content === '思考中...' ? (
            <span className="flex items-center">
              思考中
              <span className="ml-1 animate-pulse">...</span>
            </span>
          ) : (
            message.content
          )}
        </div>
      </div>
    </div>
  )
}


// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { cn } from '../../../utils/cn'

const STEPS = ['日時選択', '患者情報', '内容確認', '予約完了']

export function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center">
      {STEPS.map((label, i) => {
        const done   = i < current
        const active = i === current
        const last   = i === STEPS.length - 1
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                done   && 'bg-[#1B3664] text-white',
                active && 'bg-[#C9A84C] text-white ring-4 ring-[#C9A84C]/20',
                !done && !active && 'bg-[#E4DDD2] text-[#8A9BAC]',
              )}>
                {done ? '✓' : i + 1}
              </div>
              <span className={cn(
                'text-xs whitespace-nowrap hidden sm:block',
                active  ? 'text-[#C9A84C] font-medium' : 'text-[#8A9BAC]',
              )}>
                {label}
              </span>
            </div>
            {!last && (
              <div className={cn(
                'w-10 sm:w-16 h-0.5 mx-1 mb-4 sm:mb-0 transition-all duration-300',
                done ? 'bg-[#1B3664]' : 'bg-[#E4DDD2]',
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

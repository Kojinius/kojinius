// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { cn } from '../../../utils/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <span className={cn(
      'inline-block w-5 h-5 border-2 border-[#1B3664] border-t-transparent rounded-full animate-spin',
      className
    )} />
  )
}

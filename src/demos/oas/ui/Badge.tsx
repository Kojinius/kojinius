// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { cn } from '../../../utils/cn'
import type { ReservationStatus } from '../types'

const LABELS: Record<ReservationStatus, string> = {
  pending:   '受付中',
  confirmed: '確定',
  completed: '来院済',
  cancelled: 'キャンセル',
}

const CLASSES: Record<ReservationStatus, string> = {
  pending:   'oas-badge-pending',
  confirmed: 'oas-badge-confirmed',
  completed: 'oas-badge-completed',
  cancelled: 'oas-badge-cancelled',
}

interface Props {
  status: ReservationStatus
  className?: string
}

export function StatusBadge({ status, className }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
      CLASSES[status], className
    )}>
      {LABELS[status]}
    </span>
  )
}

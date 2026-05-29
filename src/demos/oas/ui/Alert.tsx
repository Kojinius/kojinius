// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { cn } from '../../../utils/cn'
import type { ReactNode } from 'react'

type AlertType = 'info' | 'success' | 'warning' | 'error'

const STYLES: Record<AlertType, { wrap: string; icon: string }> = {
  info:    { wrap: 'bg-blue-50 border-blue-200 text-blue-800',   icon: 'ℹ' },
  success: { wrap: 'bg-green-50 border-green-200 text-green-800', icon: '✓' },
  warning: { wrap: 'bg-yellow-50 border-yellow-200 text-yellow-800', icon: '⚠' },
  error:   { wrap: 'bg-red-50 border-red-200 text-red-700',      icon: '✕' },
}

interface Props {
  type?: AlertType
  title?: string
  children: ReactNode
  className?: string
}

export function Alert({ type = 'info', title, children, className }: Props) {
  const s = STYLES[type]
  return (
    <div className={cn('flex gap-3 p-4 rounded-lg border', s.wrap, className)}>
      <span className="text-sm leading-none mt-0.5 shrink-0">{s.icon}</span>
      <div>
        {title && <p className="font-semibold text-sm mb-0.5">{title}</p>}
        <p className="text-sm">{children}</p>
      </div>
    </div>
  )
}

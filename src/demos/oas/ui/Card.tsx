// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { cn } from '../../../utils/cn'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
}

export function Card({ children, className, title, subtitle }: Props) {
  return (
    <div className={cn('oas-card p-6', className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title    && <h3 className="text-base font-semibold text-[#1C2E45]">{title}</h3>}
          {subtitle && <p className="text-sm text-[#8A9BAC] mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

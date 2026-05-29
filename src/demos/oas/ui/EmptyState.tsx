// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import type { ReactNode } from 'react'

interface Props {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon = '📋', title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <span className="text-4xl mb-4">{icon}</span>
      <p className="text-sm font-medium text-[#1C2E45] mb-1">{title}</p>
      {description && <p className="text-xs text-[#8A9BAC] mb-4">{description}</p>}
      {action}
    </div>
  )
}

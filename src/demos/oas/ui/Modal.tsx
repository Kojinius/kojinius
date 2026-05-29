// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { useEffect } from 'react'
import { cn } from '../../../utils/cn'
import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' }

export function Modal({ open, onClose, title, children, className, size = 'md' }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden oas-fade-in',
        SIZES[size], className
      )}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4DDD2]">
            <h2 className="text-base font-semibold text-[#1C2E45]">{title}</h2>
            <button onClick={onClose} className="text-[#8A9BAC] hover:text-[#1C2E45] transition-colors text-xl leading-none">×</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

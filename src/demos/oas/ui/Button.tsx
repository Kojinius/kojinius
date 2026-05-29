// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1'

const variants: Record<Variant, string> = {
  primary:   'bg-[#1B3664] text-white hover:bg-[#0F2140] focus-visible:ring-[#1B3664]',
  secondary: 'border border-[#1B3664] text-[#1B3664] hover:bg-[#EEF3FA] focus-visible:ring-[#1B3664]',
  ghost:     'text-[#4E6073] hover:bg-[#F0ECE3] focus-visible:ring-[#4E6073]',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-sm',
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: Props) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />}
      {children}
    </button>
  )
}

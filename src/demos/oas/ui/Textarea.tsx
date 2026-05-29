// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../../utils/cn'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
}

export function Textarea({ label, error, hint, required, className, id, rows = 4, ...props }: Props) {
  const inputId = id ?? label
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#1C2E45]">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          'px-3 py-2.5 rounded-lg border text-sm bg-white resize-none transition-colors duration-150 placeholder:text-[#8A9BAC] focus:outline-none',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-[#E4DDD2] focus:border-[#1B3664] focus:ring-2 focus:ring-[#1B3664]/10',
          className
        )}
        {...props}
      />
      {error  && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-[#8A9BAC]">{hint}</p>}
    </div>
  )
}

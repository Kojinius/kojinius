// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../../utils/cn'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  required?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, required, options, placeholder, className, id, ...props }: Props) {
  const selectId = id ?? label
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-[#1C2E45]">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'px-3 py-2.5 rounded-lg border text-sm bg-white cursor-pointer transition-colors duration-150 focus:outline-none',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-[#E4DDD2] focus:border-[#1B3664] focus:ring-2 focus:ring-[#1B3664]/10',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

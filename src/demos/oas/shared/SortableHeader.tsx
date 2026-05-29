// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { cn } from '../../../utils/cn'

interface Props {
  label: string
  field: string
  sort: { field: string; asc: boolean }
  onSort: (field: string) => void
  className?: string
}

export function SortableHeader({ label, field, sort, onSort, className }: Props) {
  const active = sort.field === field
  return (
    <th
      onClick={() => onSort(field)}
      className={cn(
        'text-left text-xs font-medium uppercase tracking-wide cursor-pointer select-none px-4 py-3 transition-colors hover:text-[#1C2E45]',
        active ? 'text-[#1B3664]' : 'text-[#8A9BAC]',
        className,
      )}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className="text-[0.55rem] leading-none opacity-70">
          {active ? (sort.asc ? '↑' : '↓') : '⇅'}
        </span>
      </span>
    </th>
  )
}

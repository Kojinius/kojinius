// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { useState } from 'react'
import { cn } from '../../../utils/cn'
import { today, formatDate, generateTimeSlots } from '../utils'
import { MOCK_BOOKED_SLOTS, MOCK_BUSINESS_HOURS } from '../mockData'

const DOW_JA = ['日', '月', '火', '水', '木', '金', '土']

function getAvailableCount(dateStr: string): number {
  const dow = String(new Date(dateStr).getDay())
  const bh  = MOCK_BUSINESS_HOURS[dow]
  if (!bh.open) return 0
  const slots: string[] = []
  if (bh.amOpen && bh.amStart && bh.amEnd) slots.push(...generateTimeSlots(bh.amStart, bh.amEnd))
  if (bh.pmOpen && bh.pmStart && bh.pmEnd) slots.push(...generateTimeSlots(bh.pmStart, bh.pmEnd))
  const booked = (MOCK_BOOKED_SLOTS[dateStr] || []).length
  return Math.max(0, slots.length - booked)
}

interface Props {
  value: string
  onChange: (date: string) => void
}

export function Calendar({ value, onChange }: Props) {
  const todayStr = today()
  const [view, setView] = useState(() => {
    const d = value ? new Date(value) : new Date(todayStr)
    return { y: d.getFullYear(), m: d.getMonth() }
  })

  const firstDay  = new Date(view.y, view.m, 1)
  const lastDay   = new Date(view.y, view.m + 1, 0)
  const startDow  = firstDay.getDay()
  const totalCell = Math.ceil((startDow + lastDay.getDate()) / 7) * 7

  const prevMonth = () => setView(v => { const d = new Date(v.y, v.m - 1, 1); return { y: d.getFullYear(), m: d.getMonth() } })
  const nextMonth = () => setView(v => { const d = new Date(v.y, v.m + 1, 1); return { y: d.getFullYear(), m: d.getMonth() } })

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-[#F0ECE3] text-[#4E6073] flex items-center justify-center text-lg transition-colors">‹</button>
        <span className="text-sm font-semibold text-[#1C2E45]">{view.y}年{view.m + 1}月</span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-[#F0ECE3] text-[#4E6073] flex items-center justify-center text-lg transition-colors">›</button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DOW_JA.map((d, i) => (
          <div key={d} className={cn(
            'text-center text-xs font-medium py-1',
            i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#8A9BAC]',
          )}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: totalCell }, (_, i) => {
          const dayNum = i - startDow + 1
          if (dayNum < 1 || dayNum > lastDay.getDate()) return <div key={i} />
          const dateStr    = formatDate(new Date(view.y, view.m, dayNum))
          const isPast     = dateStr < todayStr
          const isToday    = dateStr === todayStr
          const isSelected = dateStr === value
          const avail      = getAvailableCount(dateStr)
          const isClosed   = avail === 0
          const disabled   = isPast || isClosed
          const hasAvail   = !isPast && !isClosed && avail > 0
          const dow        = i % 7

          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => !disabled && onChange(dateStr)}
              className={cn(
                'relative flex flex-col items-center justify-center h-10 rounded-lg text-sm transition-all duration-150',
                isSelected && 'bg-[#1B3664] text-white font-semibold',
                !isSelected && isToday    && 'border border-[#1B3664] text-[#1B3664] font-semibold',
                !isSelected && !isToday && !disabled && 'hover:bg-[#EEF3FA]',
                disabled && 'opacity-30 cursor-not-allowed text-[#8A9BAC]',
                dow === 0 && !isSelected && 'text-red-400',
                dow === 6 && !isSelected && 'text-blue-400',
              )}
            >
              {dayNum}
              {hasAvail && !isSelected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#C9A84C]" />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex gap-4 mt-3 text-xs text-[#8A9BAC]">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] inline-block" />空きあり
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E4DDD2] inline-block" />満員・休診
        </span>
      </div>
    </div>
  )
}

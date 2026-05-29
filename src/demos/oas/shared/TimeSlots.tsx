// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { cn } from '../../../utils/cn'
import { MOCK_BOOKED_SLOTS, MOCK_BUSINESS_HOURS } from '../mockData'
import { generateTimeSlots } from '../utils'

interface Props {
  date: string
  value: string
  onChange: (time: string) => void
}

function SlotGrid({ label, slots, booked, value, onChange }: {
  label: string
  slots: string[]
  booked: string[]
  value: string
  onChange: (t: string) => void
}) {
  if (!slots.length) return null
  return (
    <div>
      <p className="text-xs font-medium text-[#8A9BAC] uppercase tracking-wide mb-2">{label}</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {slots.map(t => {
          const isBooked   = booked.includes(t)
          const isSelected = value === t
          return (
            <button
              key={t}
              disabled={isBooked}
              onClick={() => !isBooked && onChange(t)}
              className={cn(
                'py-2 rounded-lg text-sm font-medium border transition-all duration-150',
                isSelected   && 'bg-[#1B3664] text-white border-[#1B3664]',
                !isSelected && !isBooked && 'border-[#E4DDD2] text-[#1C2E45] hover:border-[#1B3664] hover:text-[#1B3664]',
                isBooked     && 'border-[#E4DDD2] text-[#8A9BAC] bg-[#FAF8F3] cursor-not-allowed line-through opacity-40',
              )}
            >
              {t}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function TimeSlots({ date, value, onChange }: Props) {
  if (!date) return null
  const dow    = String(new Date(date).getDay())
  const bh     = MOCK_BUSINESS_HOURS[dow]
  const booked = MOCK_BOOKED_SLOTS[date] || []

  if (!bh.open) return <p className="text-sm text-[#8A9BAC] py-4">この日は休診日です。</p>

  const amSlots = (bh.amOpen && bh.amStart && bh.amEnd) ? generateTimeSlots(bh.amStart, bh.amEnd) : []
  const pmSlots = (bh.pmOpen && bh.pmStart && bh.pmEnd) ? generateTimeSlots(bh.pmStart, bh.pmEnd) : []

  return (
    <div className="flex flex-col gap-5">
      <SlotGrid label="午前" slots={amSlots} booked={booked} value={value} onChange={onChange} />
      <SlotGrid label="午後" slots={pmSlots} booked={booked} value={value} onChange={onChange} />
    </div>
  )
}

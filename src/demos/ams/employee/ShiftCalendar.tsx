// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { useState, useMemo } from 'react'
import { SHIFT_RECORDS, WORK_TYPES } from '../mockData'
import type { ShiftRecord } from '../types'

const WEEKDAYS = ['日','月','火','水','木','金','土']
const SHIFT_STATUS_COLORS: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-matsu/10 text-matsu',
  rejected: 'bg-shu/10 text-shu',
}
const SHIFT_STATUS_LABELS: Record<string, string> = { pending: '承認待', approved: '承認済', rejected: '却下' }

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${className}`}>{children}</span>
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export default function ShiftCalendar() {
  const today = toISO(new Date())
  const [viewYear, setViewYear]   = useState(2026)
  const [viewMonth, setViewMonth] = useState(3) // 0-indexed → 3 = April
  const [selected, setSelected]   = useState<string[]>([])
  const [shiftType, setShiftType] = useState(WORK_TYPES[1]) // 遅刻
  const [reason, setReason]       = useState('')
  const [filter, setFilter]       = useState('all')
  const [shifts, setShifts]       = useState<ShiftRecord[]>(
    SHIFT_RECORDS.filter(s => s.uid === SHIFT_RECORDS[0].uid) // SELF shifts
  )
  const [submitted, setSubmitted] = useState(false)

  const calDays = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate()
    const cells: (Date | null)[] = []
    for (let i = 0; i < first.getDay(); i++) cells.push(null)
    for (let d = 1; d <= lastDate; d++) cells.push(new Date(viewYear, viewMonth, d))
    return cells
  }, [viewYear, viewMonth])

  const shiftDateMap = useMemo(() => {
    const m = new Map<string, ShiftRecord>()
    for (const s of shifts) {
      for (const d of s.dates) m.set(d, s)
    }
    return m
  }, [shifts])

  function prevMonth() { viewMonth === 0 ? (setViewYear(y => y-1), setViewMonth(11)) : setViewMonth(m => m-1) }
  function nextMonth() { viewMonth === 11 ? (setViewYear(y => y+1), setViewMonth(0)) : setViewMonth(m => m+1) }

  function toggle(iso: string) {
    if (iso <= today) return
    if (shiftDateMap.has(iso)) return
    setSelected(prev => prev.includes(iso) ? prev.filter(d => d !== iso) : [...prev, iso].sort())
  }

  function handleSubmit() {
    if (!selected.length || !reason.trim()) return
    const newShift: ShiftRecord = {
      id: `SHF_DEMO_${Date.now()}`,
      uid: 'SELF', displayName: '橋本 晃治',
      dates: [...selected], shiftType, reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    setShifts(prev => [newShift, ...prev])
    setSelected([])
    setReason('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2000)
  }

  function handleCancel(id: string) {
    setShifts(prev => prev.filter(s => s.id !== id))
  }

  const filteredShifts = filter === 'all' ? shifts : shifts.filter(s => s.status === filter)

  return (
    <div className="animate-fade-in-up space-y-4">
      <h2 className="text-xl font-heading font-black uppercase text-bauhaus-black">
        シフト申請<span className="text-bauhaus-red">.</span>
      </h2>

      {submitted && (
        <div className="bg-matsu/10 border-2 border-matsu p-3 text-sm font-heading font-bold text-matsu">
          申請を送信しました。管理者の承認をお待ちください。
        </div>
      )}

      <div className="flex gap-3 flex-col lg:flex-row">
        {/* カレンダー */}
        <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus p-4 lg:flex-1">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-sumi-100">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="font-heading font-black text-sm">{viewYear}年{viewMonth+1}月</span>
            <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-sumi-100">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((w,i) => (
              <div key={w} className={`text-center text-[10px] font-heading font-black py-1 ${i===0?'text-shu':i===6?'text-sky-400':'text-sumi-400'}`}>{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {calDays.map((date, i) => {
              if (!date) return <div key={`e${i}`} className="aspect-square" />
              const iso = toISO(date)
              const isSelected = selected.includes(iso)
              const isPast = iso <= today
              const shift = shiftDateMap.get(iso)
              const dow = date.getDay()
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={isPast || !!shift}
                  onClick={() => toggle(iso)}
                  className={[
                    'relative w-full aspect-square flex flex-col items-center justify-center text-xs rounded transition-all',
                    isPast && 'opacity-30 cursor-not-allowed',
                    isSelected && 'bg-shu text-white',
                    !isSelected && !isPast && !shift && 'hover:bg-sumi-50 cursor-pointer',
                    !isSelected && !shift && dow===0 && 'text-shu',
                    !isSelected && !shift && dow===6 && 'text-sky-400',
                    iso === today && !isSelected && 'ring-2 ring-shu/40',
                  ].filter(Boolean).join(' ')}
                >
                  <span className="leading-none">{date.getDate()}</span>
                  {shift && !isSelected && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${shift.status==='pending'?'bg-amber-400':shift.status==='approved'?'bg-matsu':'bg-shu'}`} />
                  )}
                </button>
              )
            })}
          </div>
          {selected.length > 0 && (
            <div className="mt-3 pt-3 border-t-2 border-bauhaus-black space-y-2">
              <div className="text-[10px] font-heading font-black uppercase text-sumi-500">{selected.length}日選択中</div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-0.5">種別</label>
                <select value={shiftType} onChange={e => setShiftType(e.target.value)}
                  className="w-full border-2 border-sumi-200 px-2 py-1 text-xs focus:border-bauhaus-black outline-none">
                  {['遅刻','早退','欠勤','産休','育休'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-0.5">理由 <span className="text-shu">*</span></label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
                  className="w-full border-2 border-sumi-200 px-2 py-1 text-xs resize-none focus:border-bauhaus-black outline-none" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setSelected([]); setReason('') }}
                  className="flex-1 py-1.5 border-2 border-bauhaus-black text-[10px] font-heading font-black uppercase hover:bg-sumi-50">
                  クリア
                </button>
                <button type="button" onClick={handleSubmit} disabled={!reason.trim()}
                  className="flex-1 py-1.5 bg-bauhaus-black text-white border-2 border-bauhaus-black text-[10px] font-heading font-black uppercase disabled:opacity-40">
                  申請
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 申請一覧 */}
        <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus lg:w-56 shrink-0">
          <div className="px-3 py-2 border-b-2 border-bauhaus-black bg-bauhaus-black">
            <h3 className="font-heading font-black text-[11px] text-white uppercase">申請履歴</h3>
          </div>
          <div className="flex gap-1 p-2 border-b border-sumi-200">
            {['all','pending','approved','rejected'].map(f => (
              <button key={f} type="button" onClick={() => setFilter(f)}
                className={`px-1.5 py-0.5 text-[9px] font-heading font-black uppercase rounded-sm transition-colors ${filter===f?'bg-bauhaus-black text-white':'bg-sumi-100 text-sumi-500 hover:bg-sumi-200'}`}>
                {f==='all'?'全て':SHIFT_STATUS_LABELS[f]}
              </button>
            ))}
          </div>
          <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
            {filteredShifts.length === 0 ? (
              <p className="text-[10px] text-sumi-400 text-center py-4 font-heading font-black uppercase">申請なし</p>
            ) : filteredShifts.map(s => (
              <div key={s.id} className="border border-sumi-200 p-2 rounded-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge className={SHIFT_STATUS_COLORS[s.status]}>{SHIFT_STATUS_LABELS[s.status]}</Badge>
                  <span className="text-[10px] font-heading font-bold text-sumi-700">{s.shiftType}</span>
                </div>
                <div className="text-[10px] text-sumi-500 mb-0.5">{s.dates.join(', ')}</div>
                <div className="text-[9px] text-sumi-400 line-clamp-1">{s.reason}</div>
                {s.adminComment && <div className="text-[9px] text-shu mt-0.5">{s.adminComment}</div>}
                {(s.status === 'pending' || s.status === 'rejected') && (
                  <button type="button" onClick={() => handleCancel(s.id)}
                    className="mt-1 text-[9px] text-shu font-heading font-black uppercase hover:underline">
                    取消
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

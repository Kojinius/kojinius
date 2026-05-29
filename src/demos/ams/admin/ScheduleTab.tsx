// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { useState } from 'react'
import { SHIFT_RECORDS } from '../mockData'
import type { ShiftRecord } from '../types'

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${className}`}>{children}</span>
}

const STATUS_COLORS: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-matsu/10 text-matsu',
  rejected: 'bg-shu/10 text-shu',
}
const STATUS_LABELS: Record<string, string> = { pending: '承認待ち', approved: '承認済み', rejected: '却下' }

export default function ScheduleTab() {
  const [shifts, setShifts] = useState<ShiftRecord[]>(SHIFT_RECORDS)
  const [filter, setFilter] = useState('pending')
  const [comment, setComment] = useState<Record<string, string>>({})

  function approve(id: string) {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' as const, approverName: '橋本 晃治', adminComment: comment[id] || undefined } : s))
  }
  function reject(id: string) {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' as const, approverName: '橋本 晃治', adminComment: comment[id] || '対応困難のため却下' } : s))
  }

  const filtered = filter === 'all' ? shifts : shifts.filter(s => s.status === filter)
  const pendingCount = shifts.filter(s => s.status === 'pending').length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-black text-sm uppercase text-bauhaus-black">
          シフト申請<span className="text-bauhaus-red">.</span>
        </h3>
        <div className="flex gap-1">
          {['all','pending','approved','rejected'].map(f => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={`px-2 py-0.5 text-[10px] font-heading font-black uppercase border transition-colors ${filter===f?'bg-bauhaus-black text-white border-bauhaus-black':'bg-white text-sumi-500 border-sumi-200 hover:border-bauhaus-black'}`}>
              {f === 'all' ? '全て' : STATUS_LABELS[f]}
              {f === 'pending' && pendingCount > 0 && <span className="ml-1 text-shu font-black">{pendingCount}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border-2 border-bauhaus-black p-8 text-center text-sumi-400 font-heading font-black uppercase text-[10px]">申請なし</div>
        ) : filtered.map(s => (
          <div key={s.id} className="bg-white border-2 border-bauhaus-black shadow-bauhaus-sm p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={STATUS_COLORS[s.status]}>{STATUS_LABELS[s.status]}</Badge>
                  <span className="text-xs font-heading font-black text-sumi-800">{s.displayName}</span>
                  <span className="text-xs font-heading font-bold text-bauhaus-black">{s.shiftType}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-1">
                  {s.dates.map(d => (
                    <span key={d} className="text-[10px] font-mono bg-sumi-100 px-1.5 py-0.5">{d}</span>
                  ))}
                </div>
                <p className="text-[10px] text-sumi-500">{s.reason}</p>
              </div>
            </div>
            {s.status === 'pending' && (
              <div className="border-t border-sumi-100 pt-2 space-y-1.5">
                <input
                  placeholder="コメント（任意）"
                  value={comment[s.id] || ''}
                  onChange={e => setComment(prev => ({ ...prev, [s.id]: e.target.value }))}
                  className="w-full border-2 border-sumi-200 px-2 py-1 text-xs focus:border-bauhaus-black outline-none"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => approve(s.id)}
                    className="flex-1 py-1.5 bg-matsu text-white text-[10px] font-heading font-black uppercase border-2 border-matsu hover:bg-matsu-dark transition-colors">
                    承認
                  </button>
                  <button type="button" onClick={() => reject(s.id)}
                    className="flex-1 py-1.5 border-2 border-shu text-shu text-[10px] font-heading font-black uppercase hover:bg-shu/5 transition-colors">
                    却下
                  </button>
                </div>
              </div>
            )}
            {s.adminComment && <p className="text-[10px] text-shu border-l-2 border-shu pl-2">{s.adminComment}</p>}
            {s.approverName && <p className="text-[9px] text-sumi-300">承認者: {s.approverName}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

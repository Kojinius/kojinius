// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { useState } from 'react'
import { CORRECTION_REQUESTS } from '../mockData'

const STATUS_COLORS: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-matsu/10 text-matsu',
  rejected: 'bg-shu/10 text-shu',
}
const STATUS_LABELS: Record<string, string> = { pending: '承認待ち', approved: '承認済み', rejected: '却下' }

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${className}`}>{children}</span>
}

export default function CorrectionsTab() {
  const [corrections, setCorrections] = useState(CORRECTION_REQUESTS)
  const [filter, setFilter] = useState<string>('pending')

  function approve(id: string) {
    setCorrections(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' as const, approverName: '橋本 晃治' } : c))
  }
  function reject(id: string) {
    setCorrections(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' as const, approverName: '橋本 晃治' } : c))
  }

  const filtered = filter === 'all' ? corrections : corrections.filter(c => c.status === filter)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-black text-sm uppercase text-bauhaus-black">
          修正申請<span className="text-bauhaus-red">.</span>
        </h3>
        <div className="flex gap-1">
          {['all','pending','approved','rejected'].map(f => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={`px-2 py-0.5 text-[10px] font-heading font-black uppercase border transition-colors ${filter===f?'bg-bauhaus-black text-white border-bauhaus-black':'bg-white text-sumi-500 border-sumi-200 hover:border-bauhaus-black'}`}>
              {f === 'all' ? '全て' : STATUS_LABELS[f]}
              {f === 'pending' && <span className="ml-1 text-shu">{corrections.filter(c => c.status === 'pending').length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border-2 border-bauhaus-black p-8 text-center text-sumi-400 font-heading font-black uppercase text-[10px]">申請なし</div>
        ) : filtered.map(c => (
          <div key={c.id} className="bg-white border-2 border-bauhaus-black shadow-bauhaus-sm p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={STATUS_COLORS[c.status]}>{STATUS_LABELS[c.status]}</Badge>
                  <span className="text-xs font-heading font-black text-sumi-800">{c.displayName}</span>
                  <span className="text-xs font-mono text-sumi-500">{c.targetDate}</span>
                </div>
                <p className="text-[10px] text-sumi-500 line-clamp-2">{c.reason}</p>
              </div>
              {c.status === 'pending' && (
                <div className="flex gap-1.5 shrink-0">
                  <button type="button" onClick={() => approve(c.id)}
                    className="px-2 py-1 bg-matsu text-white text-[10px] font-heading font-black uppercase border-2 border-matsu hover:bg-matsu-dark transition-colors">
                    承認
                  </button>
                  <button type="button" onClick={() => reject(c.id)}
                    className="px-2 py-1 border-2 border-shu text-shu text-[10px] font-heading font-black uppercase hover:bg-shu/5 transition-colors">
                    却下
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-[10px] border-t border-sumi-100 pt-2 mt-2">
              <div>
                <p className="font-heading font-black uppercase text-sumi-400 mb-1">修正前</p>
                <p className="font-mono text-sumi-600">{c.originalData.startTime} 〜 {c.originalData.endTime}</p>
                <p className="text-sumi-500">{c.originalData.attendanceType}</p>
              </div>
              <div>
                <p className="font-heading font-black uppercase text-sumi-400 mb-1">修正後</p>
                <p className="font-mono text-bauhaus-black">
                  {c.correctedData.startTime || c.originalData.startTime} 〜 {c.correctedData.endTime || c.originalData.endTime}
                </p>
                <p className="text-bauhaus-black">{c.correctedData.attendanceType || c.originalData.attendanceType}</p>
              </div>
            </div>
            {c.approverName && (
              <p className="text-[9px] text-sumi-300 mt-1">承認者: {c.approverName}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

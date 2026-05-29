// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { useState } from 'react'
import { LEAVE_REQUESTS } from '../mockData'
import type { LeaveRequest } from '../types'

const LEAVE_TYPE_LABELS: Record<string, string> = {
  full: '全日', half_am: '午前休', half_pm: '午後休', hourly: '時間休',
}
const STATUS_COLORS: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-matsu/10 text-matsu',
  rejected: 'bg-shu/10 text-shu',
}
const STATUS_LABELS: Record<string, string> = { pending: '承認待ち', approved: '承認済み', rejected: '却下' }

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${className}`}>{children}</span>
}

export default function LeaveTab() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(LEAVE_REQUESTS)
  const [filter, setFilter] = useState('pending')

  function approve(id: string) {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' as const, approverName: '橋本 晃治' } : l))
  }
  function reject(id: string) {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected' as const, approverName: '橋本 晃治' } : l))
  }

  const filtered = filter === 'all' ? leaves : leaves.filter(l => l.status === filter)
  const pendingCount = leaves.filter(l => l.status === 'pending').length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-black text-sm uppercase text-bauhaus-black">
          有給管理<span className="text-bauhaus-red">.</span>
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

      <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-bauhaus-black text-white">
              {['申請者','対象日','種別','理由','状態','操作'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-heading font-black uppercase text-[10px] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sumi-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-sumi-400 font-heading font-black uppercase text-[10px]">申請なし</td></tr>
            ) : filtered.map((l, i) => (
              <tr key={l.id} className={`hover:bg-sumi-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-sumi-50/50'}`}>
                <td className="px-3 py-2.5 font-heading font-bold whitespace-nowrap">{l.displayName}</td>
                <td className="px-3 py-2.5 font-mono whitespace-nowrap">{l.targetDate}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">{LEAVE_TYPE_LABELS[l.leaveType]}</td>
                <td className="px-3 py-2.5 text-sumi-500 max-w-[120px] truncate">{l.reason}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <Badge className={STATUS_COLORS[l.status]}>{STATUS_LABELS[l.status]}</Badge>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  {l.status === 'pending' ? (
                    <div className="flex gap-1">
                      <button type="button" onClick={() => approve(l.id)}
                        className="px-1.5 py-0.5 bg-matsu text-white text-[9px] font-heading font-black uppercase">承認</button>
                      <button type="button" onClick={() => reject(l.id)}
                        className="px-1.5 py-0.5 border border-shu text-shu text-[9px] font-heading font-black uppercase">却下</button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-sumi-400">{l.approverName || '-'}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

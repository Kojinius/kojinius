// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { useState, useMemo } from 'react'
import { AdminLayout } from '../layout/AdminLayout'
import { StatusBadge } from '../ui/Badge'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EmptyState } from '../ui/EmptyState'
import { MOCK_RESERVATIONS, MOCK_CLINIC } from '../mockData'
import { today, formatDateShort, calcAge } from '../utils'
import type { ReservationRecord, ReservationStatus } from '../types'

export function Dashboard() {
  const T = today()
  const [list, setList]           = useState<ReservationRecord[]>(MOCK_RESERVATIONS)
  const [cancelTarget, setCancelTarget] = useState<ReservationRecord | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<ReservationRecord | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const todayList = useMemo(() =>
    list.filter(r => r.date === T).sort((a, b) => a.time.localeCompare(b.time)),
    [list, T]
  )

  const stats = useMemo(() => ({
    today:     todayList.length,
    pending:   todayList.filter(r => r.status === 'pending').length,
    confirmed: todayList.filter(r => r.status === 'confirmed').length,
    thisMonth: list.filter(r => r.date.startsWith(T.slice(0, 7))).length,
  }), [list, todayList, T])

  const update = (id: string, status: ReservationStatus) =>
    setList(prev => prev.map(r => r.id === id ? { ...r, status } : r))

  const STAT_CARDS = [
    { label: '本日の予約', value: stats.today,     cls: 'bg-[#1B3664] text-white' },
    { label: '受付待ち',   value: stats.pending,   cls: 'bg-[#FEF3C7] text-[#92400E]' },
    { label: '確定済み',   value: stats.confirmed, cls: 'bg-[#DBEAFE] text-[#1E40AF]' },
    { label: '今月累計',   value: stats.thisMonth, cls: 'bg-white text-[#1C2E45]' },
  ]

  return (
    <AdminLayout>
      <div className="p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-[#1C2E45] oas-heading">{MOCK_CLINIC.clinicName}</h1>
          <p className="text-sm text-[#8A9BAC] mt-0.5">{formatDateShort(T)}　ダッシュボード</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(s => (
            <div key={s.label} className={`oas-card p-5 ${s.cls}`}>
              <p className="text-xs opacity-70 mb-1">{s.label}</p>
              <p className="text-3xl font-bold leading-none">
                {s.value}<span className="text-sm font-normal ml-1">件</span>
              </p>
            </div>
          ))}
        </div>

        {/* Today's list */}
        <div className="oas-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E4DDD2] flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#1C2E45]">本日の予約一覧</h2>
            <span className="text-xs text-[#8A9BAC]">{todayList.length}件</span>
          </div>

          {todayList.length === 0
            ? <EmptyState icon="📋" title="本日の予約はありません" />
            : (
              <div className="divide-y divide-[#E4DDD2]">
                {todayList.map(r => (
                  <div key={r.id}>
                    <div
                      className="flex items-center gap-3 px-5 py-4 hover:bg-[#FAF8F3] cursor-pointer transition-colors"
                      onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    >
                      <span className="text-sm font-mono font-bold text-[#1B3664] w-12 shrink-0">{r.time}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1C2E45] truncate">{r.name}</p>
                        <p className="text-xs text-[#8A9BAC]">
                          {r.visitType}・{r.insurance}
                          {calcAge(r.birthdate) !== null && `・${calcAge(r.birthdate)}歳`}
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                      <div className="flex gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                        {r.status === 'pending' && (
                          <button
                            className="text-xs bg-[#1B3664] text-white px-2.5 py-1 rounded-md hover:bg-[#0F2140] transition-colors"
                            onClick={() => setConfirmTarget(r)}
                          >確定</button>
                        )}
                        {(r.status === 'pending' || r.status === 'confirmed') && (
                          <button
                            className="text-xs border border-red-300 text-red-600 px-2.5 py-1 rounded-md hover:bg-red-50 transition-colors"
                            onClick={() => setCancelTarget(r)}
                          >取消</button>
                        )}
                        {r.status === 'confirmed' && (
                          <button
                            className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-md hover:bg-green-700 transition-colors"
                            onClick={() => update(r.id, 'completed')}
                          >来院済</button>
                        )}
                      </div>
                    </div>

                    {expandedId === r.id && (
                      <div className="px-5 pb-4 bg-[#FAF8F3] border-t border-[#E4DDD2]">
                        <dl className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3 text-sm">
                          <div><span className="text-[#8A9BAC]">電話: </span>{r.phone}</div>
                          <div><span className="text-[#8A9BAC]">メール: </span>{r.email || '—'}</div>
                          <div className="col-span-2"><span className="text-[#8A9BAC]">症状: </span>{r.symptoms}</div>
                          {r.notes && <div className="col-span-2"><span className="text-[#8A9BAC]">備考: </span>{r.notes}</div>}
                          <div className="col-span-2 text-xs text-[#8A9BAC] font-mono">{r.id}</div>
                        </dl>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      <ConfirmDialog
        open={!!cancelTarget} danger
        onClose={() => setCancelTarget(null)}
        onConfirm={() => { if (cancelTarget) { update(cancelTarget.id, 'cancelled'); setCancelTarget(null) } }}
        title="予約取消"
        message={`${cancelTarget?.name} 様（${cancelTarget?.time}）の予約を取消しますか？`}
        confirmLabel="取消する" cancelLabel="戻る"
      />
      <ConfirmDialog
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => { if (confirmTarget) { update(confirmTarget.id, 'confirmed'); setConfirmTarget(null) } }}
        title="予約確定"
        message={`${confirmTarget?.name} 様（${confirmTarget?.time}）の予約を確定しますか？`}
        confirmLabel="確定する"
      />
    </AdminLayout>
  )
}

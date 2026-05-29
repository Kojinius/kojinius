// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { useState, useMemo, Fragment } from 'react'
import { AdminLayout } from '../layout/AdminLayout'
import { StatusBadge } from '../ui/Badge'
import { SortableHeader } from '../shared/SortableHeader'
import { EmptyState } from '../ui/EmptyState'
import { MOCK_RESERVATIONS } from '../mockData'
import { calcAge } from '../utils'

export function VisitHistory() {
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('')
  const [sort, setSort]           = useState({ field: 'date', asc: false })
  const [expandedId, setExpanded] = useState<string | null>(null)

  const handleSort = (field: string) =>
    setSort(s => s.field === field ? { field, asc: !s.asc } : { field, asc: true })

  const filtered = useMemo(() => {
    let items = [...MOCK_RESERVATIONS]
    if (statusFilter) items = items.filter(r => r.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(r =>
        r.name.includes(search) || r.furigana.includes(search) ||
        r.phone.includes(q) || r.id.toLowerCase().includes(q) ||
        r.symptoms.toLowerCase().includes(q)
      )
    }
    items.sort((a, b) => {
      let cmp = 0
      if (sort.field === 'date')   cmp = `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
      if (sort.field === 'name')   cmp = a.name.localeCompare(b.name, 'ja')
      if (sort.field === 'status') cmp = a.status.localeCompare(b.status)
      return sort.asc ? cmp : -cmp
    })
    return items
  }, [search, statusFilter, sort])

  return (
    <AdminLayout>
      <div className="p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-[#1C2E45] oas-heading">予約履歴</h1>
          <p className="text-sm text-[#8A9BAC] mt-0.5">
            全 {MOCK_RESERVATIONS.length} 件中 {filtered.length} 件表示
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="氏名・電話・症状で検索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-3 py-2 rounded-lg border border-[#E4DDD2] text-sm focus:outline-none focus:border-[#1B3664] focus:ring-2 focus:ring-[#1B3664]/10 bg-white"
          />
          <select
            value={statusFilter}
            onChange={e => setStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E4DDD2] text-sm focus:outline-none cursor-pointer bg-white"
          >
            <option value="">すべてのステータス</option>
            <option value="pending">受付中</option>
            <option value="confirmed">確定</option>
            <option value="completed">来院済</option>
            <option value="cancelled">キャンセル</option>
          </select>
        </div>

        {/* Table */}
        <div className="oas-card overflow-hidden">
          {filtered.length === 0
            ? <EmptyState icon="🔍" title="該当する予約が見つかりません" />
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#E4DDD2] bg-[#FAF8F3]">
                    <tr>
                      <SortableHeader label="日時"       field="date"   sort={sort} onSort={handleSort} />
                      <SortableHeader label="患者名"     field="name"   sort={sort} onSort={handleSort} />
                      <th className="text-left text-xs font-medium text-[#8A9BAC] uppercase tracking-wide px-4 py-3">区分</th>
                      <SortableHeader label="ステータス" field="status" sort={sort} onSort={handleSort} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4DDD2]">
                    {filtered.map(r => (
                      <Fragment key={r.id}>
                        <tr
                          className="hover:bg-[#FAF8F3] cursor-pointer transition-colors"
                          onClick={() => setExpanded(expandedId === r.id ? null : r.id)}
                        >
                          <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                            <p className="text-[#4E6073]">{r.date}</p>
                            <p className="font-bold text-[#1B3664] text-sm">{r.time}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-[#1C2E45]">{r.name}</p>
                            <p className="text-xs text-[#8A9BAC]">{r.furigana}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#4E6073] whitespace-nowrap">
                            {r.visitType}・{r.insurance}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={r.status} />
                          </td>
                        </tr>
                        {expandedId === r.id && (
                          <tr className="bg-[#F5F3EF]">
                            <td colSpan={4} className="px-4 py-4">
                              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2 text-xs">
                                <div><span className="text-[#8A9BAC]">電話: </span>{r.phone}</div>
                                <div><span className="text-[#8A9BAC]">メール: </span>{r.email || '—'}</div>
                                <div><span className="text-[#8A9BAC]">年齢: </span>{calcAge(r.birthdate) ?? '—'}歳</div>
                                <div className="col-span-2 sm:col-span-3">
                                  <span className="text-[#8A9BAC]">住所: </span>{r.address}
                                </div>
                                <div className="col-span-2 sm:col-span-3">
                                  <span className="text-[#8A9BAC]">症状: </span>{r.symptoms}
                                </div>
                                {r.cancelReason && (
                                  <div className="col-span-2 sm:col-span-3">
                                    <span className="text-[#8A9BAC]">キャンセル理由: </span>
                                    {r.cancelReason}（{r.cancelledBy === 'admin' ? '院側' : '患者'}）
                                  </div>
                                )}
                                <div className="col-span-2 sm:col-span-3 font-mono text-[#8A9BAC]">
                                  ID: {r.id}
                                </div>
                              </dl>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      </div>
    </AdminLayout>
  )
}

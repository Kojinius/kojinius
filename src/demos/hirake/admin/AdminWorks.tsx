import { useState } from 'react'
import { MOCK_ALL_WORKS, MOCK_MEMBERS } from '../mockData'
import type { WorkEntry } from '../mockData'
import type { WorkDoc } from '../types'

const TYPE_LABEL: Record<WorkDoc['type'], string> = {
  image: 'IMAGE', video: 'YouTube', audio: 'AUDIO', pdf: 'PDF', website: 'WEBSITE',
}

const STATUS_BADGE = {
  pending:   { text: '審査待ち', cls: 'text-[var(--amber)] border-[var(--amber)]/40' },
  published: { text: '公開中',   cls: 'text-green-400 border-green-500/40' },
}

const memberMap = Object.fromEntries(MOCK_MEMBERS.map(m => [m.id, m.data.name]))

export function AdminWorks() {
  const [works,        setWorks]        = useState<WorkEntry[]>(MOCK_ALL_WORKS)
  const [filterMember, setFilterMember] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = works.filter(w =>
    (filterMember === 'all' || w.memberId === filterMember) &&
    (filterStatus === 'all' || w.status === filterStatus)
  )

  const toggleStatus = (id: string) => {
    setWorks(prev => prev.map(w => w.id === id ? { ...w, status: w.status === 'published' ? 'pending' : 'published' } : w))
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="mb-8">
        <div className="h-px w-8 bg-[var(--amber)] mb-4" />
        <h2 className="font-display text-3xl font-black tracking-tight">Works</h2>
        <p className="text-[var(--text-3)] text-xs mt-1">{filtered.length} 件</p>
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterMember} onChange={e => setFilterMember(e.target.value)}
          className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text-2)] text-xs font-mono px-3 py-1.5 focus:border-[var(--amber)] focus:outline-none">
          <option value="all">全メンバー</option>
          {MOCK_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.data.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text-2)] text-xs font-mono px-3 py-1.5 focus:border-[var(--amber)] focus:outline-none">
          <option value="all">全ステータス</option>
          <option value="published">公開中</option>
          <option value="pending">審査待ち</option>
        </select>
      </div>

      <div className="flex flex-col border border-[var(--border)]">
        {filtered.map(work => {
          const badge = STATUS_BADGE[work.status]
          return (
            <div key={work.id} className="border-b border-[var(--border)] last:border-b-0">
              <div className="flex items-center gap-4 px-5 py-4 bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors">
                <div className="w-14 h-10 flex-none overflow-hidden bg-[var(--surface-2)]">
                  {work.thumbnail
                    ? <img src={work.thumbnail} alt={work.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-[8px] text-[var(--text-3)] font-mono">{TYPE_LABEL[work.type]}</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-[var(--text-1)] text-sm truncate">{work.title}</p>
                  <p className="text-[9px] text-[var(--text-3)] font-mono mt-0.5">{memberMap[work.memberId] ?? work.memberId}</p>
                </div>
                <span className={`hidden sm:inline text-[9px] font-mono border px-1.5 py-0.5 ${badge.cls}`}>{badge.text}</span>
                <div className="flex items-center gap-2 flex-none">
                  <button onClick={() => toggleStatus(work.id)} className="text-[10px] text-[var(--text-3)] hover:text-[var(--amber)] font-mono tracking-wider transition-colors px-2 py-1">
                    {work.status === 'published' ? '審査中に戻す' : '公開する'}
                  </button>
                  <button onClick={() => setConfirmDelete(confirmDelete === work.id ? null : work.id)}
                    className={`text-[10px] font-mono tracking-wider transition-colors px-2 py-1 ${confirmDelete === work.id ? 'text-red-400' : 'text-[var(--text-3)] hover:text-red-400'}`}>
                    削除
                  </button>
                </div>
              </div>
              {confirmDelete === work.id && (
                <div className="px-5 py-3 bg-red-500/5 border-t border-red-500/20 flex items-center gap-3">
                  <p className="flex-1 text-[10px] text-red-400 font-mono">⚠ この作品を削除します。</p>
                  <button onClick={() => setConfirmDelete(null)} className="text-xs text-red-400 font-mono px-3 py-1.5 border border-red-500/30 transition-colors">削除する（デモ）</button>
                  <button onClick={() => setConfirmDelete(null)} className="text-xs text-[var(--text-3)] font-mono px-3 py-1.5 transition-colors">キャンセル</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

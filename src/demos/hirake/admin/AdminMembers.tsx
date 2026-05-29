import { useState } from 'react'
import { useMockAuth } from '../MockAuthContext'
import { MOCK_MEMBERS } from '../mockData'
import type { MemberEntry } from '../mockData'

function AvatarPlaceholder() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="100" height="100" fill="var(--surface-2)" />
      <circle cx="50" cy="36" r="17" fill="var(--text-3)" opacity="0.28" />
      <ellipse cx="50" cy="82" rx="30" ry="22" fill="var(--text-3)" opacity="0.16" />
    </svg>
  )
}

interface EditState { id: string; name: string; role: string; bio: string }

export function AdminMembers() {
  const { role } = useMockAuth()
  const isAdmin  = role === 'admin'
  const [members]       = useState<MemberEntry[]>(MOCK_MEMBERS)
  const [editState,     setEditState]     = useState<EditState | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const openEdit = (entry: MemberEntry) =>
    setEditState({ id: entry.id, name: entry.data.name, role: entry.data.role, bio: entry.data.bio })

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-8">
        <div className="h-px w-8 bg-[var(--amber)] mb-4" />
        <h2 className="font-display text-3xl font-black tracking-tight">Members</h2>
        <p className="text-[var(--text-3)] text-xs mt-1">{members.length} 件</p>
      </div>

      <div className="flex flex-col border border-[var(--border)]">
        {members.map(entry => (
          <div key={entry.id} className="border-b border-[var(--border)] last:border-b-0">
            <div className="flex items-center gap-4 px-5 py-4 bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors">
              <div className="w-10 h-10 flex-none overflow-hidden bg-[var(--surface-2)]">
                {entry.data.avatar ? <img src={entry.data.avatar} alt={entry.data.name} className="w-full h-full object-cover" /> : <AvatarPlaceholder />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-[var(--text-1)] text-sm truncate">{entry.data.name}</p>
                <p className="text-[9px] text-[var(--amber)] tracking-[0.2em] uppercase font-mono mt-0.5">{entry.data.role || '—'}</p>
              </div>
              <p className="text-[var(--text-3)] text-xs flex-1 min-w-0 truncate hidden md:block">{entry.data.bio || '—'}</p>
              <div className="flex items-center gap-2 flex-none">
                <button onClick={() => openEdit(entry)} className="text-[10px] text-[var(--text-3)] hover:text-[var(--amber)] font-mono tracking-wider transition-colors px-2 py-1">編集</button>
                {isAdmin && (
                  <button onClick={() => setConfirmDelete(confirmDelete === entry.id ? null : entry.id)}
                    className={`text-[10px] font-mono tracking-wider transition-colors px-2 py-1 ${confirmDelete === entry.id ? 'text-red-400' : 'text-[var(--text-3)] hover:text-red-400'}`}>
                    削除
                  </button>
                )}
              </div>
            </div>
            {isAdmin && confirmDelete === entry.id && (
              <div className="px-5 py-3 bg-red-500/5 border-t border-red-500/20 flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="flex-1 text-[10px] text-red-400 font-mono leading-relaxed">⚠ プロフィール・作品・ファイルをすべて削除します。この操作は取り消せません。</p>
                <div className="flex gap-2 flex-none">
                  <button onClick={() => setConfirmDelete(null)} className="text-xs text-red-400 hover:text-red-300 font-mono px-3 py-1.5 border border-red-500/30 hover:border-red-400/50 transition-colors">削除する（デモ）</button>
                  <button onClick={() => setConfirmDelete(null)} className="text-xs text-[var(--text-3)] hover:text-[var(--text-1)] font-mono px-3 py-1.5 transition-colors">キャンセル</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {editState && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setEditState(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-[var(--bg)] border border-[var(--border)] w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[9px] text-[var(--amber)] tracking-[0.3em] uppercase font-mono">Edit Member</p>
              <button onClick={() => setEditState(null)} className="text-[var(--text-3)] hover:text-[var(--text-1)]">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">NAME</label>
                <input value={editState.name} onChange={e => setEditState(s => s && ({ ...s, name: e.target.value }))}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">POSITION</label>
                <input value={editState.role} onChange={e => setEditState(s => s && ({ ...s, role: e.target.value }))}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">TAGLINE</label>
                <textarea value={editState.bio} onChange={e => setEditState(s => s && ({ ...s, bio: e.target.value }))}
                  rows={3} className="w-full bg-[var(--surface)] border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none transition-colors resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditState(null)} className="px-4 py-2 text-xs font-mono text-[var(--text-3)] border border-[var(--border)] hover:border-[var(--text-3)] transition-colors">キャンセル</button>
              <button onClick={() => setEditState(null)} className="px-4 py-2 text-xs font-mono bg-[var(--amber)] text-black hover:opacity-80 transition-opacity">保存（デモ）</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

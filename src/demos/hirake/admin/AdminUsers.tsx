import { useState } from 'react'
import { MOCK_USERS, MOCK_MY_UID } from '../mockData'
import type { UserEntry } from '../mockData'
import type { Role } from '../types'

const ROLES: Role[] = ['admin', 'manager', 'staff']

const ROLE_COLOR: Record<Role, string> = {
  admin:   'text-red-400',
  manager: 'text-[var(--amber)]',
  staff:   'text-blue-400',
  guest:   'text-[var(--text-3)]',
}

export function AdminUsers() {
  const [users,         setUsers]         = useState<UserEntry[]>(MOCK_USERS)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [showForm,      setShowForm]      = useState(false)
  const [newId,         setNewId]         = useState('')
  const [newName,       setNewName]       = useState('')
  const [newRole,       setNewRole]       = useState<Role>('staff')

  const changeRole = (uid: string, r: Role) => {
    if (uid === MOCK_MY_UID) return
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, data: { ...u.data, role: r } } : u))
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="h-px w-8 bg-[var(--amber)] mb-4" />
          <h2 className="font-display text-3xl font-black tracking-tight">Users</h2>
          <p className="text-[var(--text-3)] text-xs mt-1">{users.length} 件</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="text-xs font-mono border border-[var(--border)] text-[var(--text-2)] hover:border-[var(--amber)] hover:text-[var(--text-1)] transition-all duration-200 px-4 py-2">
          {showForm ? '閉じる' : '+ 新規ユーザー'}
        </button>
      </div>

      {/* 新規ユーザーフォーム */}
      {showForm && (
        <div className="mb-6 bg-[var(--surface)] border border-[var(--border)] p-6">
          <p className="text-[9px] text-[var(--amber)] tracking-[0.3em] uppercase font-mono mb-4">New User</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">ID</label>
              <input value={newId} onChange={e => setNewId(e.target.value)} placeholder="m8"
                className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">名前</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="氏名"
                className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">ロール</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value as Role)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="text-xs text-[var(--text-3)] font-mono px-4 py-2 border border-[var(--border)]">キャンセル</button>
            <button onClick={() => setShowForm(false)} className="text-xs font-mono bg-[var(--amber)] text-black px-4 py-2 hover:opacity-80 transition-opacity">作成（デモ）</button>
          </div>
        </div>
      )}

      <div className="flex flex-col border border-[var(--border)]">
        {users.map(user => (
          <div key={user.id} className="border-b border-[var(--border)] last:border-b-0">
            <div className="flex items-center gap-4 px-5 py-4 bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-[var(--text-1)] truncate">
                  {user.data.displayName}
                  {user.id === MOCK_MY_UID && <span className="ml-2 text-[8px] text-[var(--amber)] tracking-widest">YOU</span>}
                </p>
                <p className="text-[9px] text-[var(--text-3)] font-mono mt-0.5">{user.data.email}</p>
              </div>
              <select value={user.data.role} disabled={user.id === MOCK_MY_UID} onChange={e => changeRole(user.id, e.target.value as Role)}
                className={`bg-[var(--surface-2)] border border-[var(--border)] text-xs font-mono px-2 py-1 focus:border-[var(--amber)] focus:outline-none disabled:opacity-50 ${ROLE_COLOR[user.data.role]}`}>
                {(['admin', 'manager', 'staff', 'guest'] as Role[]).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {user.id !== MOCK_MY_UID && (
                <button onClick={() => setConfirmDelete(confirmDelete === user.id ? null : user.id)}
                  className={`text-[10px] font-mono tracking-wider transition-colors px-2 py-1 ${confirmDelete === user.id ? 'text-red-400' : 'text-[var(--text-3)] hover:text-red-400'}`}>
                  削除
                </button>
              )}
            </div>
            {confirmDelete === user.id && (
              <div className="px-5 py-3 bg-red-500/5 border-t border-red-500/20 flex items-center gap-3">
                <p className="flex-1 text-[10px] text-red-400 font-mono">⚠ ユーザーを削除します。</p>
                <button onClick={() => setConfirmDelete(null)} className="text-xs text-red-400 font-mono px-3 py-1.5 border border-red-500/30">削除する（デモ）</button>
                <button onClick={() => setConfirmDelete(null)} className="text-xs text-[var(--text-3)] font-mono px-3 py-1.5">キャンセル</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

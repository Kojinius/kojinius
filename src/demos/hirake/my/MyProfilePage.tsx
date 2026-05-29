// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { useState } from 'react'
import { useMockAuth } from '../MockAuthContext'
import { MOCK_MEMBERS } from '../mockData'

function AvatarPlaceholder() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="100" height="100" fill="var(--surface-2)" />
      <circle cx="50" cy="36" r="17" fill="var(--text-3)" opacity="0.28" />
      <ellipse cx="50" cy="82" rx="30" ry="22" fill="var(--text-3)" opacity="0.16" />
    </svg>
  )
}

export function MyProfilePage() {
  const { uid } = useMockAuth()
  const me = MOCK_MEMBERS.find(m => m.id === uid)

  const [name, setName] = useState(me?.data.name ?? '')
  const [role, setRole] = useState(me?.data.role ?? '')
  const [bio,  setBio]  = useState(me?.data.bio ?? '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-8">
        <div className="h-px w-8 bg-[var(--amber)] mb-4" />
        <h2 className="font-display text-3xl font-black tracking-tight">My Profile</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-8 mb-8">
        <div className="flex-none">
          <div className="w-24 h-24 overflow-hidden bg-[var(--surface-2)] mb-3">
            {me?.data.avatar
              ? <img src={me.data.avatar} alt={me.data.name} className="w-full h-full object-cover" />
              : <AvatarPlaceholder />}
          </div>
          <button className="w-full text-[10px] font-mono text-[var(--text-3)] border border-[var(--border)] px-3 py-1.5 hover:border-[var(--amber)] hover:text-[var(--text-2)] transition-colors">
            変更（デモ）
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">NAME</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">POSITION</label>
            <input value={role} onChange={e => setRole(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">TAGLINE</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              className="w-full bg-[var(--surface)] border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none transition-colors resize-none" />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-6 flex justify-end gap-3">
        <button onClick={handleSave}
          className={`px-6 py-2.5 text-xs font-mono transition-all duration-200 ${
            saved
              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
              : 'bg-[var(--amber)] text-black hover:opacity-80'
          }`}>
          {saved ? '保存しました（デモ）' : '保存する'}
        </button>
      </div>

      <div className="mt-10 border border-[var(--border)] p-6">
        <p className="text-[9px] text-[var(--amber)] tracking-[0.3em] uppercase font-mono mb-4">Password</p>
        <div className="flex flex-col gap-3 mb-4">
          <div>
            <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">現在のパスワード</label>
            <input type="password" placeholder="••••••••"
              className="w-full bg-[var(--surface)] border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">新しいパスワード</label>
            <input type="password" placeholder="••••••••"
              className="w-full bg-[var(--surface)] border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none transition-colors" />
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 text-xs font-mono border border-[var(--border)] text-[var(--text-2)] hover:border-[var(--amber)] hover:text-[var(--text-1)] transition-colors">
            変更する（デモ）
          </button>
        </div>
      </div>
    </div>
  )
}

// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { useState } from 'react'
import { MOCK_INVITES, MOCK_MEMBERS } from '../mockData'
import type { InviteEntry } from '../mockData'

const memberMap = Object.fromEntries(MOCK_MEMBERS.map(m => [m.id, m.data.name]))

function statusOf(inv: InviteEntry) {
  if (inv.data.revoked) return 'revoked'
  if (new Date(inv.data.expiresAt) < new Date('2026-04-22')) return 'expired'
  if (inv.data.usedCount >= inv.data.maxUses) return 'full'
  return 'active'
}

const STATUS_BADGE = {
  active:  { text: '有効',       cls: 'text-green-400 border-green-500/40' },
  revoked: { text: '無効化済み', cls: 'text-[var(--text-3)] border-[var(--border)]' },
  expired: { text: '期限切れ',   cls: 'text-red-400 border-red-500/40' },
  full:    { text: '上限到達',   cls: 'text-[var(--amber)] border-[var(--amber)]/40' },
}

export function AdminInvites() {
  const [invites, setInvites]       = useState<InviteEntry[]>(MOCK_INVITES)
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null)
  const [showForm, setShowForm]     = useState(false)
  const [copied, setCopied]         = useState<string | null>(null)
  const [newLabel, setNewLabel]     = useState('')
  const [newExpiry, setNewExpiry]   = useState('2026-05-31')
  const [newMax, setNewMax]         = useState(5)

  const copyLink = (id: string) => {
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const revoke = (id: string) => {
    setInvites(prev => prev.map(inv => inv.id === id ? { ...inv, data: { ...inv.data, revoked: true } } : inv))
    setConfirmRevoke(null)
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="h-px w-8 bg-[var(--amber)] mb-4" />
          <h2 className="font-display text-3xl font-black tracking-tight">Invites</h2>
          <p className="text-[var(--text-3)] text-xs mt-1">{invites.length} 件</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="text-xs font-mono border border-[var(--border)] text-[var(--text-2)] hover:border-[var(--amber)] hover:text-[var(--text-1)] transition-all duration-200 px-4 py-2">
          {showForm ? '閉じる' : '+ 招待リンク発行'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-[var(--surface)] border border-[var(--border)] p-6">
          <p className="text-[9px] text-[var(--amber)] tracking-[0.3em] uppercase font-mono mb-4">New Invite Link</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-3">
              <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">ラベル</label>
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="例：デザイン部新メンバー向け"
                className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">有効期限</label>
              <input type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">最大使用回数</label>
              <input type="number" min={1} max={100} value={newMax} onChange={e => setNewMax(Number(e.target.value))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="text-xs text-[var(--text-3)] font-mono px-4 py-2 border border-[var(--border)]">キャンセル</button>
            <button onClick={() => setShowForm(false)} className="text-xs font-mono bg-[var(--amber)] text-black px-4 py-2 hover:opacity-80 transition-opacity">発行（デモ）</button>
          </div>
        </div>
      )}

      <div className="flex flex-col border border-[var(--border)]">
        {invites.map(inv => {
          const st    = statusOf(inv)
          const badge = STATUS_BADGE[st]
          return (
            <div key={inv.id} className="border-b border-[var(--border)] last:border-b-0">
              <div className="flex items-start gap-4 px-5 py-4 bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-[var(--text-1)] truncate">{inv.data.label}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <p className="text-[9px] text-[var(--text-3)] font-mono">
                      発行者: {memberMap[inv.data.createdBy] ?? inv.data.createdBy}
                    </p>
                    <p className="text-[9px] text-[var(--text-3)] font-mono">
                      期限: {inv.data.expiresAt}
                    </p>
                    <p className="text-[9px] text-[var(--text-3)] font-mono">
                      使用: {inv.data.usedCount} / {inv.data.maxUses}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-none mt-0.5">
                  <span className={`text-[9px] font-mono border px-1.5 py-0.5 ${badge.cls}`}>{badge.text}</span>
                  {st === 'active' && (
                    <>
                      <button onClick={() => copyLink(inv.id)}
                        className={`text-[10px] font-mono tracking-wider transition-colors px-2 py-1 ${copied === inv.id ? 'text-green-400' : 'text-[var(--text-3)] hover:text-[var(--amber)]'}`}>
                        {copied === inv.id ? 'コピー済み' : 'リンクコピー'}
                      </button>
                      <button onClick={() => setConfirmRevoke(confirmRevoke === inv.id ? null : inv.id)}
                        className={`text-[10px] font-mono tracking-wider transition-colors px-2 py-1 ${confirmRevoke === inv.id ? 'text-red-400' : 'text-[var(--text-3)] hover:text-red-400'}`}>
                        無効化
                      </button>
                    </>
                  )}
                </div>
              </div>
              {confirmRevoke === inv.id && (
                <div className="px-5 py-3 bg-red-500/5 border-t border-red-500/20 flex items-center gap-3">
                  <p className="flex-1 text-[10px] text-red-400 font-mono">⚠ このリンクを無効化します。既存の使用には影響しません。</p>
                  <button onClick={() => revoke(inv.id)} className="text-xs text-red-400 font-mono px-3 py-1.5 border border-red-500/30">無効化する</button>
                  <button onClick={() => setConfirmRevoke(null)} className="text-xs text-[var(--text-3)] font-mono px-3 py-1.5">キャンセル</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

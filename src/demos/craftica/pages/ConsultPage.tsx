// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// 先生に相談 — 2ペイン: 自分の課題一覧 + 課題ごとのコメントスレッド

import { useState, useMemo, useEffect, useRef } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { useMockAuth } from '../MockAuthContext'
import { MOCK_CONSULTS, MOCK_BANKS, MEMBER_LIST } from '../mockData'
import type { ConsultMessage } from '../types'
import { colorOf } from '../types'

function formatTime(ms: number) {
  const diff = Date.now() - ms
  const day = Math.floor(diff / 86400_000)
  if (day >= 1) return `${day}日前`
  const hr = Math.floor(diff / 3600_000)
  if (hr >= 1) return `${hr}時間前`
  const min = Math.floor(diff / 60_000)
  return `${min}分前`
}

export default function ConsultPage() {
  const { user } = useMockAuth()
  const [threads, setThreads] = useState(() => MOCK_CONSULTS)
  const [activeId, setActiveId] = useState<string>(threads[0]?.id ?? '')
  const [input, setInput] = useState('')
  const messagesRef = useRef<HTMLDivElement>(null)

  // member は自分のスレッドのみ、manager+ は全件
  const visibleThreads = useMemo(() => {
    if (!user) return []
    return user.role === 'member' ? threads.filter(t => t.memberUid === user.uid) : threads
  }, [threads, user])

  // active が visible に居なければ先頭に戻す
  useEffect(() => {
    if (visibleThreads.length === 0) return
    if (!visibleThreads.some(t => t.id === activeId)) setActiveId(visibleThreads[0].id)
  }, [visibleThreads, activeId])

  const active = threads.find(t => t.id === activeId)

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight })
  }, [active?.messages.length])

  if (!user) return null

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || !active) return
    const newMsg: ConsultMessage = { id: `cm-${Date.now()}`, uid: user.uid, text: trimmed, createdAt: Date.now() }
    setThreads(prev => prev.map(t => t.id === active.id ? { ...t, messages: [...t.messages, newMsg] } : t))
    setInput('')
  }

  // バンクごとにグルーピング（左ペイン）
  const grouped = useMemo(() => {
    const map = new Map<string, typeof visibleThreads>()
    visibleThreads.forEach(t => {
      const list = map.get(t.bankId) ?? []
      list.push(t)
      map.set(t.bankId, list)
    })
    return Array.from(map.entries()).map(([bankId, list]) => ({
      bank: MOCK_BANKS.find(b => b.id === bankId)!,
      threads: list,
    }))
  }, [visibleThreads])

  return (
    <div style={{ paddingBottom: 28 }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
          📩 先生に相談
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 0' }}>
          課題ごとに先生とアプリ内で相談（メールではない・アプリ内完結）。
          {user.role !== 'member' && '※ manager+ は全メンバーのスレッドを閲覧可能。'}
        </p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '280px 1fr', gap: 14,
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16,
        minHeight: 540, overflow: 'hidden',
      }}>
        {/* 左ペイン */}
        <aside style={{ borderRight: '1px solid var(--line)', padding: 10, background: 'var(--paper-2)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, padding: '6px 8px', letterSpacing: '0.06em' }}>
            {user.role === 'member' ? 'あなたの相談' : '受信箱'}
          </div>
          {grouped.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--ink-4)', padding: 10 }}>まだ相談スレッドがありません。</p>
          )}
          {grouped.map(({ bank, threads }) => (
            <div key={bank.id} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', padding: '4px 8px' }}>
                📚 {bank.title}
              </div>
              {threads.map(t => {
                const member = MEMBER_LIST.find(m => m.uid === t.memberUid)
                const color = member ? colorOf(member.memberKey) : { hex: '#888', soft: '#ccc', deep: '#444' }
                const last = t.messages[t.messages.length - 1]
                const isActive = t.id === activeId
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveId(t.id)}
                    style={{
                      width: '100%', textAlign: 'left',
                      display: 'flex', gap: 8,
                      padding: '8px 10px', borderRadius: 10, marginBottom: 4,
                      background: isActive ? 'var(--card)' : 'transparent',
                      border: '1px solid', borderColor: isActive ? 'var(--clay)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: color.hex, color: '#fff',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>{member?.initial ?? '?'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.courseTitle}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {last?.text ?? ''}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--ink-4)', flexShrink: 0 }}>
                      {last ? formatTime(last.createdAt) : ''}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </aside>

        {/* 右ペイン */}
        <section style={{ display: 'flex', flexDirection: 'column' }}>
          {active ? (
            <>
              <header style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{active.bankTitle}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{active.courseTitle}</div>
              </header>
              <div ref={messagesRef} style={{ flex: 1, overflowY: 'auto', padding: 16, maxHeight: 440 }}>
                {active.messages.map(m => {
                  const isMe = m.uid === user.uid
                  const member = MEMBER_LIST.find(x => x.uid === m.uid)
                  const memberKey = member?.memberKey ?? m.uid
                  const color = colorOf(memberKey)
                  const isTeacher = m.uid === 'u-manager' || m.uid === 'u-admin'
                  return (
                    <div key={m.id} style={{
                      display: 'flex', gap: 8, marginBottom: 12,
                      flexDirection: isMe ? 'row-reverse' : 'row',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: isTeacher ? 'var(--sky)' : color.hex, color: '#fff',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                      }}>
                        {isTeacher ? '師' : (member?.initial ?? '?')}
                      </div>
                      <div style={{
                        maxWidth: '72%',
                        padding: '8px 12px',
                        borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                        background: isMe ? 'var(--clay)' : 'var(--paper-2)',
                        color: isMe ? '#fff' : 'var(--ink)',
                        fontSize: 13, lineHeight: 1.65,
                      }}>
                        {m.text}
                        <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>{formatTime(m.createdAt)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ padding: 12, borderTop: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="メッセージを入力（Enter で送信 / Shift+Enter で改行）"
                    rows={1}
                    style={{ flex: 1, resize: 'none', maxHeight: 120 }}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="ck-btn-primary"
                    style={{ opacity: input.trim() ? 1 : 0.5 }}
                  >
                    <Send size={14} /> 送信
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: 'var(--ink-3)' }}>
              <MessageSquare size={32} />
              <p style={{ fontSize: 13, margin: 0 }}>左から相談スレッドを選んでください</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

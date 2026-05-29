// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// プランモード — チャット UI で課題バンク提案 → PlanPreviewCard → 作成ボタン

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Navigation as NavIcon } from 'lucide-react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useMockAuth } from '../MockAuthContext'
import { MOCK_CHATS } from '../mockData'
import type { ChatMessage, PlanDraft } from '../types'
import { ChatBubble } from '../components/ChatBubble'
import { PlanPreviewCard } from '../components/PlanPreviewCard'

const PRESET_PLAN: PlanDraft = MOCK_CHATS.find(c => c.mode === 'plan')!.planDraft!

const PRESET_INTRO = 'いいね、年齢層が中学生だと「身近で楽しい題材」+「すぐ達成感が出る難易度」がコツだよ。\n\n以下の構成で5課題作ったので、内容を見て調整してくれる？'

export default function PlanModePage() {
  const { user } = useMockAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [plan, setPlan] = useState<PlanDraft | null>(null)
  const [applied, setApplied] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, isThinking, plan])

  if (!user) return null
  if (user.role === 'member') return <Navigate to="/demo/craftica/dashboard" replace />

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isThinking) return
    const userMsg: ChatMessage = { id: `m-${Date.now()}`, role: 'user', content: trimmed, createdAt: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsThinking(true)

    setTimeout(() => {
      const reply: ChatMessage = {
        id: `m-${Date.now() + 1}`, role: 'assistant',
        content: PRESET_INTRO,
        createdAt: Date.now(),
      }
      setMessages(prev => [...prev, reply])
      setPlan(PRESET_PLAN)
      setIsThinking(false)
    }, 900)
  }

  const handleApply = () => {
    setApplied(true)
    setTimeout(() => {
      navigate('/demo/craftica/dashboard')
    }, 1200)
  }

  return (
    <div style={{ paddingBottom: 28 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 4, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={13} color="var(--clay)" /> プランモード（manager+ 限定）
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
          AI と一緒に課題バンクを設計する
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 0' }}>
          年齢層・テーマ・難度を伝えると、AI が複数課題で構成された「バンク」を提案します。納得したら1クリックで投入。
        </p>
      </div>

      <section style={{
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16,
        display: 'flex', flexDirection: 'column', minHeight: 540,
      }}>
        <div ref={messagesRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 10px', maxHeight: 540 }}>
          {messages.length === 0 && !plan && (
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✨</div>
              <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0 }}>
                例: 「中学生向けの『デザインに興味を持つ』最初の5課題を作って」<br />
                例: 「Web 制作の基礎を1ヶ月で学ぶ全8課題」
              </p>
              <button
                type="button"
                onClick={() => setInput('中学生向けの「デザインに興味を持つ」最初の5課題を作って')}
                className="ck-btn-ghost"
                style={{ marginTop: 14 }}
              >
                <NavIcon size={13} /> サンプルプロンプトを入力
              </button>
            </div>
          )}
          {messages.map(m => (
            <ChatBubble key={m.id} message={m} userInitial={user.initial} userColor={user.color.hex} />
          ))}
          {isThinking && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--clay)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>🪴</div>
              <div style={{ padding: '10px 14px', borderRadius: 14, background: 'var(--paper-2)', display: 'inline-flex', gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-3)',
                    animation: `ck-dot 1.2s ease-in-out ${i * 0.15}s infinite`,
                  }} />
                ))}
                <style>{`@keyframes ck-dot { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }`}</style>
              </div>
            </div>
          )}
          {plan && (
            <PlanPreviewCard
              plan={plan}
              applied={applied}
              onApply={handleApply}
            />
          )}
        </div>

        <div style={{ padding: 14, borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', border: '1px solid var(--line)', borderRadius: 14, padding: 8, background: 'var(--card)' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="どんなメンバーに、何を学ばせたい？"
              rows={1}
              style={{ flex: 1, border: 'none', resize: 'none', padding: '6px 4px', fontSize: 14, outline: 'none', background: 'transparent', maxHeight: 120 }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              style={{
                width: 32, height: 32, borderRadius: 10, border: 'none',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                background: input.trim() ? 'var(--clay)' : 'var(--paper-2)',
                color: input.trim() ? '#fff' : 'var(--ink-4)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

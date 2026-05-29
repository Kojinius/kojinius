// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// AIチャット — サイドバー + メッセージリスト + 入力欄

import { useState, useRef, useEffect } from 'react'
import { Plus, Send, Sparkles, Mic, Image as ImageIcon, Video } from 'lucide-react'
import { useMockAuth } from '../MockAuthContext'
import { MOCK_CHATS } from '../mockData'
import type { ChatMessage } from '../types'
import { ChatBubble } from '../components/ChatBubble'

type Model = 'sonnet' | 'opus'

const PRESET_REPLIES: { trigger: RegExp; reply: string }[] = [
  {
    trigger: /Figma|figma/i,
    reply: 'Figma の基本は4つだよ。\n\n1. **フレーム**: アートボードのようなコンテナ。\n2. **オートレイアウト**: padding と gap で要素を整列。\n3. **コンポーネント**: 何度も使うパーツを部品化。\n4. **バリアント**: 同じ部品の状態違い（hover / active 等）をまとめる。\n\nまずは A4 フレームを作って、テキストと長方形だけで自己紹介スライドを1枚作ってみるのがおすすめ！',
  },
  {
    trigger: /Photoshop|フォトショ|フォトショップ|画像.*リサイズ/i,
    reply: 'Photoshop で画像リサイズは3ステップだよ。\n\n1. **イメージ → 画像解像度**\n2. **単位を pixel に**して、幅・高さを入力\n3. **再サンプル: バイキュービック（自動）** で OK\n\nコツ: 元画像より拡大すると荒れる。SNS なら 1080×1080 か 1920×1080 を覚えておけば困らない。',
  },
  {
    trigger: /HTML|html/i,
    reply: 'HTML の基本構造はこんな感じ:\n\n```\n<!DOCTYPE html>\n<html lang="ja">\n<head>\n  <meta charset="UTF-8">\n  <title>ページタイトル</title>\n</head>\n<body>\n  <h1>大見出し</h1>\n  <p>段落のテキスト</p>\n</body>\n</html>\n```\n\nまず `h1`〜`h6`（見出し）、`p`（段落）、`a`（リンク）、`img`（画像）、`ul`/`li`（リスト）を覚えれば大体書けるよ。',
  },
  {
    trigger: /CSS|css|レイアウト|Flexbox|flexbox/i,
    reply: 'Flexbox は親に `display: flex` を付けるだけでスタート。\n\n- `justify-content`: **主軸（横方向）** の配置\n- `align-items`: **交差軸（縦方向）** の配置\n- `gap`: 子要素の間隔\n\n「親が横並びなら、横は justify、縦は align」と覚えると迷わない。Grid も似てるけど、まずは Flex から触るのが楽だよ。',
  },
  {
    trigger: /CapCut|capcut|動画|編集|YouTube/i,
    reply: 'CapCut の最初の3アクションはこれ:\n\n1. **素材インポート**: 右上「+」から動画ファイルを読み込む\n2. **タイムラインで分割**: ハサミアイコンで不要部分をカット\n3. **テキストを追加**: 上のメニュー「テキスト」→ プリセットから選ぶだけ\n\nYouTube Shorts は **9:16 縦動画** で書き出し（プロジェクト → 比率 → 9:16）。1本目は30秒以内のショート1本作ってみると感覚つかめるよ！',
  },
]

function defaultReply(_q: string): string {
  return 'いい質問だね！\n\n具体的にどの部分でつまずいてるか教えてくれる？\nたとえば：\n- 操作方法（どこのメニューか分からない）\n- 使い分け（どっちを選ぶべきか）\n- 完成イメージが湧かない\n\nのどれに近いかな？あと、いま使ってるツール名も教えてくれると的確に答えられるよ。'
}

function generateReply(q: string): string {
  for (const { trigger, reply } of PRESET_REPLIES) {
    if (trigger.test(q)) return reply
  }
  return defaultReply(q)
}

function groupByDate(chats: typeof MOCK_CHATS) {
  const groups: { label: string; chats: typeof MOCK_CHATS }[] = []
  const today = new Date()
  chats.forEach(c => {
    const last = c.messages[c.messages.length - 1]?.createdAt ?? 0
    const diffDays = Math.floor((today.getTime() - last) / 86400_000)
    const label = diffDays === 0 ? '今日' : diffDays <= 1 ? '昨日' : diffDays <= 7 ? '今週' : 'それ以前'
    const g = groups.find(x => x.label === label)
    if (g) g.chats.push(c)
    else groups.push({ label, chats: [c] })
  })
  return groups
}

export default function ChatPage() {
  const { user } = useMockAuth()
  const [conversations, setConversations] = useState(() => MOCK_CHATS.filter(c => c.mode === 'chat'))
  const [activeId, setActiveId] = useState<string>(() => conversations[0]?.id ?? 'new')
  const [input, setInput] = useState('')
  const [model, setModel] = useState<Model>('sonnet')
  const [isThinking, setIsThinking] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)

  const activeChat = conversations.find(c => c.id === activeId)
  const messages = activeChat?.messages ?? []

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, isThinking])

  if (!user) return null

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isThinking) return
    const userMsg: ChatMessage = { id: `m-${Date.now()}`, role: 'user', content: trimmed, createdAt: Date.now() }
    if (!activeChat) {
      // 新規会話
      const newChat = {
        id: `chat-${Date.now()}`,
        uid: user.uid,
        title: trimmed.slice(0, 20),
        mode: 'chat' as const,
        messages: [userMsg],
      }
      setConversations(prev => [newChat, ...prev])
      setActiveId(newChat.id)
    } else {
      setConversations(prev => prev.map(c => c.id === activeId
        ? { ...c, messages: [...c.messages, userMsg] }
        : c,
      ))
    }
    setInput('')
    setIsThinking(true)

    setTimeout(() => {
      const reply: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        role: 'assistant',
        content: generateReply(trimmed),
        createdAt: Date.now(),
      }
      setConversations(prev => prev.map(c => {
        // activeChat が無い時に作った会話 or 既存会話の最新へ
        if (c.id === activeId || (!activeChat && c.messages.length === 1 && c.messages[0].id === userMsg.id)) {
          return { ...c, messages: [...c.messages, reply] }
        }
        return c
      }))
      setIsThinking(false)
    }, 600)
  }

  const groups = groupByDate(conversations)

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '260px 1fr', gap: 18,
      minHeight: 'calc(100vh - 200px)',
    }}>
      {/* サイドバー */}
      <aside style={{
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16,
        padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
        height: 'fit-content', position: 'sticky', top: 80,
      }}>
        <button
          type="button"
          onClick={() => setActiveId('new')}
          className="ck-btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Plus size={14} /> 新規チャット
        </button>
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 480, overflowY: 'auto' }}>
          {groups.map(g => (
            <div key={g.label}>
              <div style={{ fontSize: 10, color: 'var(--ink-4)', fontWeight: 700, letterSpacing: '0.06em', padding: '4px 6px' }}>
                {g.label.toUpperCase()}
              </div>
              {g.chats.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '8px 10px', borderRadius: 8, marginBottom: 2,
                    background: c.id === activeId ? 'var(--clay-soft)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    color: c.id === activeId ? 'var(--clay-deep)' : 'var(--ink-2)',
                    fontSize: 12, fontWeight: c.id === activeId ? 600 : 500,
                  }}
                >
                  {c.title}
                  <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>{c.messages.length} メッセージ</div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* メイン */}
      <section style={{
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16,
        display: 'flex', flexDirection: 'column', minHeight: 600,
      }}>
        {/* ヘッダー */}
        <div style={{
          padding: '14px 18px', borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {activeChat?.title ?? '新規チャット'}
          </h2>
          <span style={{ flex: 1 }} />
          <div style={{ display: 'inline-flex', borderRadius: 999, background: 'var(--paper-2)', padding: 2, border: '1px solid var(--line)' }}>
            {(['sonnet', 'opus'] as Model[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setModel(m)}
                style={{
                  padding: '4px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: model === m ? 'var(--clay)' : 'transparent',
                  color: model === m ? '#fff' : 'var(--ink-3)',
                  fontSize: 11, fontWeight: 600,
                }}
              >
                {m === 'sonnet' ? '⚡ Sonnet' : '✨ Opus'}
              </button>
            ))}
          </div>
        </div>

        {/* メッセージ */}
        <div
          ref={messagesRef}
          style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 10px', maxHeight: 520 }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🪴</div>
              <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0 }}>
                Craftica AI 講師に何でも聞いてみよう。<br />
                Photoshop / Figma / HTML / 動画編集 などの質問が得意。
              </p>
            </div>
          ) : (
            messages.map(m => (
              <ChatBubble
                key={m.id}
                message={m}
                userInitial={user.initial}
                userColor={user.color.hex}
              />
            ))
          )}
          {isThinking && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'var(--clay)', color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>🪴</div>
              <div style={{
                padding: '10px 14px', borderRadius: 14,
                background: 'var(--paper-2)', display: 'inline-flex', gap: 4,
              }}>
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
        </div>

        {/* 入力欄 */}
        <div style={{ padding: 14, borderTop: '1px solid var(--line)' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 8,
            border: '1px solid var(--line)', borderRadius: 14, padding: 8, background: 'var(--card)',
          }}>
            <button type="button" style={btnStyle} title="マイク（飾り）"><Mic size={16} /></button>
            <button type="button" style={btnStyle} title="画像生成（飾り）"><ImageIcon size={16} /></button>
            <button type="button" style={btnStyle} title="動画生成（飾り）"><Video size={16} /></button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="何でも聞いてみよう（Enter で送信 / Shift+Enter で改行）"
              rows={1}
              style={{
                flex: 1, border: 'none', resize: 'none', padding: '6px 4px',
                fontSize: 14, outline: 'none', background: 'transparent', maxHeight: 120,
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              style={{
                width: 32, height: 32, borderRadius: 10, border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
                background: input.trim() ? 'var(--clay)' : 'var(--paper-2)',
                color: input.trim() ? '#fff' : 'var(--ink-4)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Send size={14} />
            </button>
          </div>
          <p style={{ fontSize: 10, color: 'var(--ink-4)', textAlign: 'center', margin: '8px 0 0' }}>
            <Sparkles size={10} style={{ verticalAlign: 'middle' }} /> AI が自律的に生成するため、内容は必ず確認してください。
          </p>
        </div>
      </section>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 8, border: 'none',
  background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}

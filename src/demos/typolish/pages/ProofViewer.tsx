// 2026-04-22 claude-sonnet-4-6 セッションターン数：1
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMockAuth } from '../MockAuthContext'
import {
  MOCK_ANNOTATIONS, MOCK_COMMENT_THREADS, MOCK_AI_FINDINGS,
  MOCK_VERSIONS, MOCK_PROOFS,
} from '../mockData'

const TOOLS = [
  { id: 'select', icon: '↖', label: '選択' },
  { id: 'pin',    icon: '📍', label: 'ピン' },
  { id: 'rect',   icon: '⬜', label: '矩形' },
  { id: 'arrow',  icon: '↗', label: '矢印' },
  { id: 'free',   icon: '✏️', label: '手書き' },
]

type Panel = 'comments' | 'ai'
type ApprovalState = 'pending' | 'approved' | 'rejected'

/* ---------- Mock proof canvas ---------- */
function MockProofCanvas({ annotations, activeId, onClickAnnotation }:
  { annotations: typeof MOCK_ANNOTATIONS; activeId: string | null; onClickAnnotation: (id: string) => void }) {
  return (
    <div className="relative w-full select-none" style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #db2777 100%)' }}>
      {/* Mock LP layout */}
      {/* Nav */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 h-10" style={{ background: 'rgba(0,0,0,0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-white" />
          <div className="w-20 h-3 rounded-full bg-white/70" />
        </div>
        <div className="hidden sm:flex gap-5">
          <div className="w-12 h-2.5 rounded-full bg-white/40" />
          <div className="w-12 h-2.5 rounded-full bg-white/40" />
          <div className="w-12 h-2.5 rounded-full bg-white/40" />
        </div>
        <div className="w-20 h-7 rounded-md bg-orange-400" />
      </div>
      {/* Hero */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pt-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/90 mb-1" />
        <div className="w-3/5 sm:w-2/5 h-5 sm:h-8 rounded-full bg-white/90" />
        <div className="w-2/5 sm:w-1/3 h-3 sm:h-5 rounded-full bg-white/55" />
        <div className="w-1/3 sm:w-1/4 h-2.5 sm:h-4 rounded-full bg-white/35" />
        <div className="flex gap-3 mt-3">
          <div className="w-24 sm:w-32 h-8 sm:h-10 rounded-lg bg-orange-400" />
          <div className="w-24 sm:w-32 h-8 sm:h-10 rounded-lg border-2 border-white/50" />
        </div>
      </div>
      {/* Features row */}
      <div className="absolute bottom-8 left-8 right-8 hidden sm:grid grid-cols-3 gap-4">
        {[0,1,2].map(i => (
          <div key={i} className="rounded-xl p-3 flex flex-col gap-1.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="w-7 h-7 rounded-lg bg-white/80" />
            <div className="w-20 h-2.5 rounded-full bg-white/70" />
            <div className="w-16 h-2 rounded-full bg-white/40" />
          </div>
        ))}
      </div>

      {/* Annotation overlays */}
      {annotations.map(a => (
        a.type === 'pin' ? (
          <button
            key={a.id}
            type="button"
            onClick={() => onClickAnnotation(a.id)}
            style={{
              position: 'absolute',
              left: `${a.x}%`, top: `${a.y}%`,
              transform: 'translate(-50%, -50%)',
              width: 28, height: 28,
              borderRadius: '50%',
              border: `2px solid ${a.color}`,
              backgroundColor: a.resolved ? 'transparent' : a.color,
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              transition: 'transform 0.15s',
              zIndex: 10,
              scale: activeId === a.id ? '1.3' : '1',
            }}>
            {a.commentCount}
          </button>
        ) : (
          <button
            key={a.id}
            type="button"
            onClick={() => onClickAnnotation(a.id)}
            style={{
              position: 'absolute',
              left: `${a.x}%`, top: `${a.y}%`,
              width: `${a.w ?? 20}%`, height: `${a.h ?? 15}%`,
              border: `2px solid ${a.color}`,
              background: `${a.color}20`,
              zIndex: 10,
              outline: activeId === a.id ? '2px solid white' : undefined,
            }}
          />
        )
      ))}
    </div>
  )
}

/* ---------- Comment thread ---------- */
function CommentPanel({ activeId, onClickThread }:
  { activeId: string | null; onClickThread: (id: string) => void }) {
  const [newComment, setNewComment] = useState('')
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {MOCK_COMMENT_THREADS.map(thread => (
          <div
            key={thread.annotationId}
            onClick={() => onClickThread(thread.annotationId)}
            className={`rounded-xl border p-3 cursor-pointer transition-all ${
              activeId === thread.annotationId ? 'ring-2' : 'hover:brightness-95'
            }`}
            style={{
              background: 'var(--tp-surface)',
              borderColor: 'var(--tp-border)',
              outline: activeId === thread.annotationId ? '2px solid var(--tp-accent)' : undefined,
            }}>
            {thread.comments.map(c => (
              <div key={c.id} className="flex gap-2.5 mb-3 last:mb-0">
                <div className="w-7 h-7 rounded-full bg-[#F79321] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold" style={{ color: 'var(--tp-text)' }}>{c.author}</span>
                    <span className="text-[10px]" style={{ color: 'var(--tp-subtle)' }}>{c.time}</span>
                    {thread.comments[0].resolved && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">解決済み</span>}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--tp-text)' }}>{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Reply input */}
      <div className="border-t p-3" style={{ borderColor: 'var(--tp-border)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="コメントを追加..."
            className="flex-1 rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2"
            style={{ background: 'var(--tp-bg)', borderColor: 'var(--tp-border)', color: 'var(--tp-text)',
              '--tw-ring-color': 'var(--tp-accent)' } as React.CSSProperties}
          />
          <button type="button"
            className="px-3 py-2 rounded-lg text-white text-xs font-medium transition-opacity hover:opacity-90"
            style={{ background: 'var(--tp-accent)' }}>
            送信
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- AI Review panel ---------- */
function AiPanel() {
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(true)
  const SEVERITY_STYLE = {
    error:   'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    info:    'bg-sky-100 text-sky-700',
  } as const

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--tp-border)' }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--tp-text)' }}>AI スペルチェック</p>
          <p className="text-xs" style={{ color: 'var(--tp-subtle)' }}>Claude Vision で誤字・表記ゆれを検出</p>
        </div>
        {!done && (
          <button type="button" onClick={() => { setRunning(true); setTimeout(() => { setRunning(false); setDone(true) }, 1800) }}
            disabled={running}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: 'var(--tp-accent)' }}>
            {running ? '解析中...' : '実行'}
          </button>
        )}
      </div>
      {done ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--tp-subtle)' }}>
            {MOCK_AI_FINDINGS.length} 件の指摘が見つかりました
          </p>
          {MOCK_AI_FINDINGS.map(f => (
            <div key={f.id} className="rounded-lg border p-3 space-y-1.5"
              style={{ background: 'var(--tp-surface)', borderColor: 'var(--tp-border)' }}>
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${SEVERITY_STYLE[f.severity]}`}>
                  {f.type}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--tp-text)' }}>{f.message}</p>
              <p className="text-xs font-mono" style={{ color: 'var(--tp-accent)' }}>→ {f.suggestion}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm" style={{ color: 'var(--tp-subtle)' }}>「実行」でAI解析を開始</p>
        </div>
      )}
    </div>
  )
}

/* ---------- Main ProofViewer ---------- */
export default function ProofViewer() {
  const { id, proofId } = useParams()
  const navigate = useNavigate()
  const { theme } = useMockAuth()
  const proof = MOCK_PROOFS.find(p => p.id === proofId) ?? MOCK_PROOFS[0]

  const [activeTool, setActiveTool]       = useState('select')
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null)
  const [panel, setPanel]                 = useState<Panel>('comments')
  const [approval, setApproval]           = useState<ApprovalState>('pending')
  const [zoom, setZoom]                   = useState(100)
  const [activeVersion, setActiveVersion] = useState('v3')

  const ZOOM_LEVELS = [50, 75, 100, 125, 150]

  return (
    <div className="flex flex-col" style={{ height: '100dvh', background: 'var(--tp-bg)' }}>
      {/* Toolbar */}
      <div className="shrink-0 border-b flex items-center gap-3 px-4 h-12"
        style={{ background: 'var(--tp-surface)', borderColor: 'var(--tp-border)' }}>
        <button type="button" onClick={() => navigate(`/demo/typolish/p/${id}`)}
          className="p-1.5 rounded hover:opacity-70 transition-opacity" style={{ color: 'var(--tp-text)' }}>
          ←
        </button>
        <span className="text-sm font-medium truncate max-w-[200px]" style={{ color: 'var(--tp-text)' }}>
          {proof.title}
        </span>
        <div className="w-px h-5 mx-1" style={{ background: 'var(--tp-border)' }} />

        {/* Tools */}
        <div className="flex gap-0.5">
          {TOOLS.map(t => (
            <button key={t.id} type="button" onClick={() => setActiveTool(t.id)}
              title={t.label}
              className="w-8 h-8 flex items-center justify-center rounded text-sm transition-colors"
              style={activeTool === t.id
                ? { background: 'var(--tp-accent)', color: '#fff' }
                : { color: 'var(--tp-subtle)' }}>
              {t.icon}
            </button>
          ))}
        </div>
        <div className="w-px h-5 mx-1" style={{ background: 'var(--tp-border)' }} />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setZoom(z => Math.max(50,  ZOOM_LEVELS[ZOOM_LEVELS.indexOf(z) - 1] ?? 50))}
            className="w-6 h-6 flex items-center justify-center rounded text-xs transition-colors hover:opacity-70" style={{ color: 'var(--tp-text)' }}>−</button>
          <span className="text-xs font-mono w-10 text-center" style={{ color: 'var(--tp-text)' }}>{zoom}%</span>
          <button type="button" onClick={() => setZoom(z => Math.min(150, ZOOM_LEVELS[ZOOM_LEVELS.indexOf(z) + 1] ?? 150))}
            className="w-6 h-6 flex items-center justify-center rounded text-xs transition-colors hover:opacity-70" style={{ color: 'var(--tp-text)' }}>＋</button>
        </div>
        <div className="w-px h-5 mx-1" style={{ background: 'var(--tp-border)' }} />

        {/* Version selector */}
        <select value={activeVersion} onChange={e => setActiveVersion(e.target.value)}
          className="text-xs rounded px-2 py-1 border outline-none"
          style={{ background: 'var(--tp-surface)', borderColor: 'var(--tp-border)', color: 'var(--tp-text)' }}>
          {MOCK_VERSIONS.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
        </select>

        <div className="flex-1" />

        {/* Share */}
        <button type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:opacity-80"
          style={{ borderColor: 'var(--tp-border)', color: 'var(--tp-text)', background: 'var(--tp-surface)' }}>
          🔗 共有
        </button>
      </div>

      {/* Body: Canvas + Sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center overflow-auto p-6"
          style={{ background: theme === 'wire' ? '#111' : theme === 'dark' ? '#0d0a08' : '#e8e0d0' }}>
          <div style={{ width: `${zoom}%`, maxWidth: '100%', transition: 'width 0.2s' }}>
            <MockProofCanvas
              annotations={MOCK_ANNOTATIONS}
              activeId={activeAnnotation}
              onClickAnnotation={id => setActiveAnnotation(a => a === id ? null : id)}
            />
          </div>
        </div>

        {/* Right panel */}
        <div className="w-80 border-l flex flex-col shrink-0"
          style={{ background: 'var(--tp-surface)', borderColor: 'var(--tp-border)' }}>
          {/* Panel tabs */}
          <div className="flex border-b shrink-0" style={{ borderColor: 'var(--tp-border)' }}>
            {(['comments', 'ai'] as Panel[]).map(p => (
              <button key={p} type="button" onClick={() => setPanel(p)}
                className="flex-1 py-2.5 text-xs font-medium transition-colors"
                style={panel === p
                  ? { color: 'var(--tp-accent)', borderBottom: '2px solid var(--tp-accent)' }
                  : { color: 'var(--tp-subtle)' }}>
                {p === 'comments' ? `💬 コメント (${MOCK_COMMENT_THREADS.length})` : '🤖 AIレビュー'}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0">
            {panel === 'comments'
              ? <CommentPanel activeId={activeAnnotation} onClickThread={id => setActiveAnnotation(a => a === id ? null : id)} />
              : <AiPanel />}
          </div>
        </div>
      </div>

      {/* Approval bar */}
      <div className="shrink-0 border-t flex items-center justify-between gap-4 px-6 py-3"
        style={{ background: 'var(--tp-surface)', borderColor: 'var(--tp-border)' }}>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--tp-subtle)' }}>承認ステータス:</span>
          {approval === 'pending'  && <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">未決定</span>}
          {approval === 'approved' && <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">✓ 承認済み</span>}
          {approval === 'rejected' && <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">↩ 差し戻し</span>}
        </div>
        {approval === 'pending' ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setApproval('rejected')}
              className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:opacity-80"
              style={{ borderColor: '#ef4444', color: '#ef4444', background: 'var(--tp-surface)' }}>
              差し戻し
            </button>
            <button type="button" onClick={() => setApproval('approved')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: '#10b981' }}>
              ✓ 承認する
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setApproval('pending')}
            className="text-xs underline opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--tp-text)' }}>
            取り消す
          </button>
        )}
      </div>
    </div>
  )
}

// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { useState } from 'react'
import { useMockAuth } from '../MockAuthContext'
import { MOCK_WORKS } from '../mockData'
import type { WorkEntry } from '../mockData'
import type { WorkDoc } from '../types'

const TYPE_LABEL: Record<WorkDoc['type'], string> = {
  image: 'IMAGE', video: 'YouTube', audio: 'AUDIO', pdf: 'PDF', website: 'WEBSITE',
}

const STATUS_BADGE = {
  pending:   { text: '審査待ち', cls: 'text-[var(--amber)] border-[var(--amber)]/40' },
  published: { text: '公開中',   cls: 'text-green-400 border-green-500/40' },
}

export function MyWorksPage() {
  const { uid }    = useMockAuth()
  const [works]    = useState<WorkEntry[]>(MOCK_WORKS[uid] ?? [])
  const [showForm, setShowForm] = useState(false)
  const [lightbox, setLightbox] = useState<WorkEntry | null>(null)

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="h-px w-8 bg-[var(--amber)] mb-4" />
          <h2 className="font-display text-3xl font-black tracking-tight">My Works</h2>
          <p className="text-[var(--text-3)] text-xs mt-1">{works.length} 件</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="text-xs font-mono border border-[var(--border)] text-[var(--text-2)] hover:border-[var(--amber)] hover:text-[var(--text-1)] transition-all duration-200 px-4 py-2">
          {showForm ? '閉じる' : '+ 作品を追加'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-[var(--surface)] border border-[var(--border)] p-6">
          <p className="text-[9px] text-[var(--amber)] tracking-[0.3em] uppercase font-mono mb-4">Add Work</p>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">タイトル</label>
              <input placeholder="作品タイトル"
                className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">種別</label>
              <select className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none">
                {(['image', 'video', 'audio', 'pdf', 'website'] as const).map(t =>
                  <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">URL</label>
              <input placeholder="https://..."
                className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] text-[var(--text-3)] tracking-wider font-mono mb-1.5">説明</label>
              <textarea rows={2} placeholder="作品の説明..."
                className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-1)] focus:border-[var(--amber)] focus:outline-none resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="text-xs text-[var(--text-3)] font-mono px-4 py-2 border border-[var(--border)]">キャンセル</button>
            <button onClick={() => setShowForm(false)} className="text-xs font-mono bg-[var(--amber)] text-black px-4 py-2 hover:opacity-80 transition-opacity">追加（デモ）</button>
          </div>
        </div>
      )}

      <div className="flex flex-col border border-[var(--border)]">
        {works.length === 0 && (
          <div className="px-5 py-12 text-center text-[var(--text-3)] text-xs font-mono">作品がまだありません</div>
        )}
        {works.map(work => {
          const badge = STATUS_BADGE[work.status]
          return (
            <div key={work.id} className="border-b border-[var(--border)] last:border-b-0">
              <div className="flex items-center gap-4 px-5 py-4 bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors">
                <button
                  onClick={() => work.type === 'image' && work.thumbnail ? setLightbox(work) : undefined}
                  className="w-14 h-10 flex-none overflow-hidden bg-[var(--surface-2)]">
                  {work.thumbnail
                    ? <img src={work.thumbnail} alt={work.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-[8px] text-[var(--text-3)] font-mono">{TYPE_LABEL[work.type]}</div>
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-[var(--text-1)] text-sm truncate">{work.title}</p>
                  <p className="text-[9px] text-[var(--text-3)] font-mono mt-0.5 line-clamp-1">{work.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-none">
                  <span className={`text-[9px] font-mono border px-1.5 py-0.5 ${badge.cls}`}>{badge.text}</span>
                  <button className="text-[10px] text-[var(--text-3)] hover:text-[var(--amber)] font-mono tracking-wider transition-colors px-2 py-1">
                    編集（デモ）
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div onClick={e => e.stopPropagation()} className="relative max-w-3xl w-full">
            <img src={lightbox.url} alt={lightbox.title} className="w-full object-contain max-h-[80vh]" />
            <div className="mt-3 flex items-start justify-between">
              <div>
                <p className="font-display font-bold text-white text-lg">{lightbox.title}</p>
                <p className="text-sm text-white/60 mt-1">{lightbox.description}</p>
              </div>
              <button onClick={() => setLightbox(null)} className="text-white/60 hover:text-white ml-4 mt-1">✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

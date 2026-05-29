// 2026-04-22 claude-sonnet-4-6 セッションターン数：1
import { useNavigate } from 'react-router-dom'
import { MOCK_PROJECTS, STATUS_LABELS, STATUS_COLORS } from '../mockData'

const TYPE_ICONS: Record<string, string> = { in_review: '🔍', approved: '✅', pending: '⏳', rejected: '↩️' }

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fraunces',serif] text-3xl font-bold" style={{ color: 'var(--tp-text)' }}>
            プロジェクト
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--tp-subtle)' }}>
            成果物をアップロードして、チームでレビューしよう
          </p>
        </div>
        <button type="button" onClick={() => navigate('/demo/typolish/p/p1')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--tp-accent)' }}>
          <span>＋</span> 新しいプロジェクト
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'プロジェクト', value: MOCK_PROJECTS.length },
          { label: 'レビュー中',   value: MOCK_PROJECTS.filter(p => p.status === 'in_review').length },
          { label: '承認済み',     value: MOCK_PROJECTS.filter(p => p.status === 'approved').length },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-5 border" style={{ background: 'var(--tp-surface)', borderColor: 'var(--tp-border)' }}>
            <p className="text-2xl font-bold font-mono" style={{ color: 'var(--tp-accent)' }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--tp-subtle)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MOCK_PROJECTS.map(p => (
          <button key={p.id} type="button" onClick={() => navigate(`/demo/typolish/p/${p.id}`)}
            className="text-left rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: 'var(--tp-surface)', borderColor: 'var(--tp-border)' }}>
            {/* Thumbnail strip */}
            <div className="h-28 rounded-lg mb-4 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, var(--tp-border) 0%, var(--tp-subtle)30 100%)' }}>
              <div className="h-full flex items-center justify-center text-4xl opacity-30">
                {TYPE_ICONS[p.status]}
              </div>
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-base truncate" style={{ color: 'var(--tp-text)' }}>{p.title}</h3>
                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--tp-subtle)' }}>{p.description}</p>
              </div>
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[p.status]}`}>
                {STATUS_LABELS[p.status]}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'var(--tp-subtle)' }}>
              <span>📁 {p.proofCount} 件</span>
              <span>👥 {p.memberCount} 人</span>
              <span className="ml-auto">{p.updatedAt}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

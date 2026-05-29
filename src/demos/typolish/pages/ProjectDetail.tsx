// 2026-04-22 claude-sonnet-4-6 セッションターン数：1
import { useNavigate, useParams } from 'react-router-dom'
import { MOCK_PROOFS, MOCK_PROJECTS, PROOF_TYPE_LABELS, STATUS_COLORS, STATUS_LABELS } from '../mockData'

const TYPE_BADGE_COLORS: Record<string, string> = {
  image: 'bg-violet-100 text-violet-700',
  pdf:   'bg-rose-100 text-rose-700',
  web:   'bg-sky-100 text-sky-700',
  video: 'bg-amber-100 text-amber-700',
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const project = MOCK_PROJECTS.find(p => p.id === id) ?? MOCK_PROJECTS[0]
  const filter = 'all'

  const filters = ['all', 'image', 'pdf', 'web', 'video']
  const filtered = MOCK_PROOFS

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--tp-subtle)' }}>
        <button type="button" onClick={() => navigate('/demo/typolish')} className="hover:underline">
          プロジェクト
        </button>
        <span>/</span>
        <span style={{ color: 'var(--tp-text)' }}>{project.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-['Fraunces',serif] text-2xl font-bold" style={{ color: 'var(--tp-text)' }}>
            {project.title}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--tp-subtle)' }}>{project.description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button type="button" className="px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--tp-border)', color: 'var(--tp-text)', background: 'var(--tp-surface)' }}>
            👥 メンバー (3)
          </button>
          <button type="button"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ background: 'var(--tp-accent)' }}>
            ＋ Proof を追加
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg p-1 w-fit" style={{ background: 'var(--tp-surface)', border: '1px solid var(--tp-border)' }}>
        {filters.map(f => (
          <button key={f} type="button"
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={f === filter
              ? { background: 'var(--tp-accent)', color: '#fff' }
              : { color: 'var(--tp-subtle)' }}>
            {f === 'all' ? 'すべて' : PROOF_TYPE_LABELS[f] ?? f}
          </button>
        ))}
      </div>

      {/* Proof grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map(proof => (
          <button key={proof.id} type="button"
            onClick={() => navigate(`/demo/typolish/p/${id}/pr/${proof.id}`)}
            className="text-left rounded-xl border overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: 'var(--tp-surface)', borderColor: 'var(--tp-border)' }}>
            {/* Thumbnail */}
            <div className={`h-36 bg-gradient-to-br ${proof.color} relative`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl opacity-30">
                  {proof.type === 'image' ? '🖼' : proof.type === 'pdf' ? '📄' : proof.type === 'web' ? '🌐' : '🎬'}
                </span>
              </div>
              {proof.versionCount > 1 && (
                <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                  v{proof.versionCount}
                </span>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between gap-1 mb-2">
                <h3 className="text-sm font-medium leading-tight" style={{ color: 'var(--tp-text)' }}>{proof.title}</h3>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_BADGE_COLORS[proof.type] ?? 'bg-stone-100 text-stone-600'}`}>
                  {PROOF_TYPE_LABELS[proof.type]}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[proof.status]}`}>
                  {STATUS_LABELS[proof.status]}
                </span>
              </div>
              {proof.commentCount > 0 && (
                <p className="text-[11px] mt-2" style={{ color: 'var(--tp-subtle)' }}>
                  💬 {proof.commentCount} コメント
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

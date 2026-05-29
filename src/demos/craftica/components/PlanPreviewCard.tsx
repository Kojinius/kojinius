// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// プランモードのバンク提案プレビューカード

import { Check, Grid2x2, LayoutGrid, Users, Sparkles } from 'lucide-react'
import type { PlanDraft } from '../types'
import { COURSE_TYPE_EMOJI } from '../types'

interface Props {
  plan: PlanDraft
  applied: boolean
  onApply: () => void
}

export function PlanPreviewCard({ plan, applied, onApply }: Props) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFF9EE 0%, #FBF8F3 100%)',
      border: '2px solid var(--clay)',
      borderRadius: 18, padding: 20,
      boxShadow: '0 8px 24px rgba(198,107,61,0.18)',
      margin: '12px 0',
    }} className="ck-fade-in">
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, background: 'var(--clay)', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 12 }}>
        <Sparkles size={12} /> AI が提案する課題バンク
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'var(--clay-soft)', color: 'var(--clay-deep)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Grid2x2 size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>{plan.bankTitle}</h3>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0, lineHeight: 1.6 }}>{plan.bankDescription}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--ink-3)', marginBottom: 14 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <LayoutGrid size={12} />{plan.courses.length} 課題
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Users size={12} />{plan.difficultyLevels.join(' / ')}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {plan.courses.map((c, i) => (
          <div
            key={i}
            style={{
              display: 'flex', gap: 10, alignItems: 'center',
              padding: '8px 12px', borderRadius: 10,
              background: 'var(--card)', border: '1px solid var(--line)',
            }}
          >
            <span style={{ fontSize: 18 }}>{COURSE_TYPE_EMOJI[c.type]}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{c.title}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{c.deliverableSpec}</div>
            </div>
            <span style={{
              padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
              background: 'var(--sun-soft)', color: '#8B6914',
            }}>{c.difficulty}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onApply}
        disabled={applied}
        className="ck-btn-primary"
        style={{
          width: '100%', justifyContent: 'center', minHeight: 44,
          background: applied ? 'var(--leaf)' : undefined,
          borderColor: applied ? 'var(--leaf)' : undefined,
          opacity: applied ? 0.85 : 1, cursor: applied ? 'default' : 'pointer',
        }}
      >
        {applied ? <><Check size={14} /> このバンクを作成しました</> : <><Sparkles size={14} /> このバンクを作成（1クリック）</>}
      </button>
      <p style={{ fontSize: 11, color: 'var(--ink-4)', textAlign: 'center', margin: '8px 0 0' }}>
        Firestore に banks + courses をアトミックに書き込み（writeBatch）
      </p>
    </div>
  )
}

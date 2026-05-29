// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// 修了証セクション — バンク完走（platinum 想定）相当の修了証プレビュー

import type { Trophy } from '../types'
import { Award, Download } from 'lucide-react'

export function CertificateSection({ trophies }: { trophies: Trophy[] }) {
  // デモではトロフィー数が3つ以上のバンクを「完走相当」として表示
  const certs = (() => {
    const byBank = new Map<string, Trophy[]>()
    trophies.forEach(t => {
      const list = byBank.get(t.bankId) ?? []
      list.push(t)
      byBank.set(t.bankId, list)
    })
    return Array.from(byBank.entries())
      .filter(([, list]) => list.length >= 3)
      .map(([, list]) => list[0])
  })()

  if (certs.length === 0) {
    return (
      <p style={{ fontSize: 13, color: 'var(--ink-4)', textAlign: 'center', padding: '24px 0' }}>
        まだ修了証はありません。バンクを完走すると獲得できます。
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      {certs.map(c => (
        <div
          key={c.bankId}
          style={{
            background: 'linear-gradient(135deg, #FFF9EE 0%, #F8EBC8 100%)',
            border: '2px solid var(--sun)',
            borderRadius: 16, padding: 24,
            minWidth: 280, maxWidth: 360,
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <Award size={20} color="var(--sun)" />
          </div>
          <div style={{
            fontSize: 10, color: '#8B6914', letterSpacing: '0.2em', fontWeight: 700,
            textAlign: 'center', marginBottom: 4,
          }}>CERTIFICATE OF COMPLETION</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center', marginBottom: 14 }}>
            修了証
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', textAlign: 'center', marginBottom: 6 }}>
            {c.bankTitle}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center', marginBottom: 14 }}>
            上記バンクの全課題完了を証する
          </div>
          <div style={{
            borderTop: '1px solid var(--sun)', paddingTop: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-3)',
          }}>
            <span>発行日: {c.earnedAt}</span>
            <button
              type="button"
              style={{
                background: 'transparent', border: 'none', color: 'var(--clay)', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
              }}
            >
              <Download size={11} />PDF
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// 2026-06-15 claude-opus-4-8[1m] セッションターン数：16
// knit デモバナー — 画面下部固定。画面説明 + ポートフォリオへ戻るリンク。
import { useState } from 'react'
import { Link } from 'react-router-dom'

const FEATURES = [
  'スキーマ（Zod）が型・入力UI・バリデーション・差分の単一ソース',
  '左で編集すると右のプレビューへ即時反映（ビュー完結編集）',
  '下書き → 公開 → ロールバックの安全なコンテンツフロー',
  'WordPress テーマカスタマイザを超える全粒度の theme 制御',
]

export function DemoBanner() {
  const [open, setOpen] = useState(true)
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(15, 18, 28, 0.97)', backdropFilter: 'blur(8px)',
      borderTop: '1px solid rgba(129, 140, 248, 0.5)', color: '#E5E7F0',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div onClick={() => setOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', userSelect: 'none' }}>
        <span style={{ background: '#818CF8', color: '#0b0e1a', fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', padding: '2px 8px', borderRadius: 4 }}>DEMO</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>🧶 Knit — schema-driven CMS</span>
        <span style={{ flex: 1 }} />
        <Link to="/" onClick={(e) => e.stopPropagation()} style={{ fontSize: 11, color: '#E5E7F0', opacity: 0.75, textDecoration: 'underline' }}>
          ← ポートフォリオに戻る
        </Link>
        <span style={{ display: 'inline-block', transition: 'transform 200ms', transform: open ? 'rotate(0deg)' : 'rotate(180deg)', fontSize: 10 }}>▼</span>
      </div>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 200ms ease' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', padding: '4px 14px 10px', borderTop: '1px solid rgba(129,140,248,0.18)' }}>
            {FEATURES.map((f, i) => (
              <span key={i} style={{ fontSize: 11, opacity: 0.85, display: 'inline-flex', gap: 4, alignItems: 'baseline' }}>
                <span style={{ color: '#A5B4FC' }}>•</span>{f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

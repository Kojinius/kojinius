// 2026-06-15 claude-opus-4-8[1m] セッションターン数：14
// meoscope デモバナー — 画面下部固定。画面説明 + ポートフォリオへ戻るリンク。
import { useState } from 'react'
import { Link } from 'react-router-dom'

const FEATURES = [
  '企業名 / 地図クリック / エリア＋業種 の3導線で分析対象を確定',
  '半径3km の同業を抽出しリーダー/チャレンジャー/フォロワー/ニッチャーに分類',
  '競合密度・飽和度・評価・デジタル存在感を 0–100 でスコアリング',
  'Claude で SWOT を生成し、impact最大×難易度最小の「次の一手」を断定提示',
]

export function DemoBanner() {
  const [open, setOpen] = useState(true)
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(8, 12, 18, 0.96)', backdropFilter: 'blur(8px)',
      borderTop: '1px solid rgba(34, 211, 238, 0.4)', color: '#D6E2EC',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div onClick={() => setOpen(v => !v)} style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', userSelect: 'none',
      }}>
        <span style={{
          background: '#22D3EE', color: '#06121d', fontSize: 10, fontWeight: 800,
          letterSpacing: '0.18em', padding: '2px 8px', borderRadius: 4,
        }}>DEMO</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>🔭 meoscope — MEO 競合・市場分析</span>
        <span style={{ flex: 1 }} />
        <Link to="/" onClick={(e) => e.stopPropagation()}
          style={{ fontSize: 11, color: '#D6E2EC', opacity: 0.75, textDecoration: 'underline' }}>
          ← ポートフォリオに戻る
        </Link>
        <span style={{ display: 'inline-block', transition: 'transform 200ms', transform: open ? 'rotate(0deg)' : 'rotate(180deg)', fontSize: 10 }}>▼</span>
      </div>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 200ms ease' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', padding: '4px 14px 10px', borderTop: '1px solid rgba(34,211,238,0.15)' }}>
            {FEATURES.map((f, i) => (
              <span key={i} style={{ fontSize: 11, opacity: 0.85, display: 'inline-flex', gap: 4, alignItems: 'baseline' }}>
                <span style={{ color: '#34D399' }}>•</span>{f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

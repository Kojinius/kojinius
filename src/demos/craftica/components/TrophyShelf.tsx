// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// TrophyShelf — 獲得トロフィー表示。tier に応じて色 + 絵文字

import type { Trophy } from '../types'

const TIER_INFO: Record<Trophy['tier'], { emoji: string; label: string; bg: string; ring: string; deep: string }> = {
  bronze:   { emoji: '⭐',   label: 'ブロンズ',   bg: '#F4DECC', ring: '#C66B3D', deep: '#8E4825' },
  silver:   { emoji: '⭐⭐',  label: 'シルバー',   bg: '#E5DECF', ring: '#8C8275', deep: '#5C544A' },
  gold:     { emoji: '⭐⭐⭐', label: 'ゴールド',   bg: '#F8EBC8', ring: '#E8B547', deep: '#8B6914' },
  platinum: { emoji: '👑',   label: 'プラチナ',   bg: '#D7E5F0', ring: '#5388B5', deep: '#3D5C7A' },
}

export function TrophyShelf({ trophies }: { trophies: Trophy[] }) {
  if (trophies.length === 0) {
    return (
      <p style={{ fontSize: 13, color: 'var(--ink-4)', textAlign: 'center', padding: '24px 0' }}>
        まだトロフィーはありません。完了 + 振り返り記入で獲得できます。
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {trophies.map(t => {
        const info = TIER_INFO[t.tier]
        return (
          <div
            key={`${t.bankId}-${t.courseId}`}
            style={{
              padding: 14, borderRadius: 14,
              background: info.bg, border: `2px solid ${info.ring}`,
              minWidth: 140, position: 'relative',
            }}
          >
            <div style={{ fontSize: 32, lineHeight: 1, textAlign: 'center', marginBottom: 8 }}>{info.emoji}</div>
            <div style={{ fontSize: 11, color: info.deep, fontWeight: 700, textAlign: 'center', marginBottom: 2 }}>
              {info.label}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>
              {t.courseTitle}
            </div>
            <div style={{ fontSize: 10, color: 'var(--ink-3)', textAlign: 'center', marginTop: 4 }}>
              {t.bankTitle} ・ {t.earnedAt}
            </div>
          </div>
        )
      })}
    </div>
  )
}

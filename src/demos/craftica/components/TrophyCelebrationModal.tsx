// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// トロフィー獲得お祝いモーダル — 完了 + 振り返り保存後に発火

import { useEffect } from 'react'
import type { Trophy } from '../types'

const TIER_INFO: Record<Trophy['tier'], { emoji: string; label: string; bg: string; deep: string; glow: string }> = {
  bronze:   { emoji: '⭐',   label: 'ブロンズ',   bg: '#F4DECC', deep: '#8E4825', glow: 'rgba(198,107,61,0.35)' },
  silver:   { emoji: '⭐⭐',  label: 'シルバー',   bg: '#E5DECF', deep: '#5C544A', glow: 'rgba(140,130,117,0.35)' },
  gold:     { emoji: '⭐⭐⭐', label: 'ゴールド',   bg: '#F8EBC8', deep: '#8B6914', glow: 'rgba(232,181,71,0.45)' },
  platinum: { emoji: '👑',   label: 'プラチナ',   bg: '#D7E5F0', deep: '#3D5C7A', glow: 'rgba(83,136,181,0.45)' },
}

interface Props {
  trophy: Trophy
  onClose: () => void
}

export function TrophyCelebrationModal({ trophy, onClose }: Props) {
  const info = TIER_INFO[trophy.tier]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const isPlatinum = trophy.tier === 'platinum'

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(42, 37, 32, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ck-celebrate"
        style={{
          background: 'var(--card)', borderRadius: 24, padding: 40,
          maxWidth: 420, width: '100%', textAlign: 'center',
          boxShadow: `0 20px 60px ${info.glow}`,
          border: `3px solid ${info.deep}`,
          position: 'relative', overflow: 'hidden',
        }}
      >
        {isPlatinum && (
          <>
            {/* 紙吹雪（CSS のみ） */}
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  left: `${(i * 17) % 100}%`,
                  top: `-${(i * 5) % 40}px`,
                  width: 8, height: 8, borderRadius: 2,
                  background: ['#C66B3D', '#E8B547', '#5B8C5A', '#5388B5', '#B8456A'][i % 5],
                  animation: `confettiDrop 1.4s ease-out ${i * 60}ms forwards`,
                  transform: 'rotate(45deg)',
                }}
              />
            ))}
            <style>{`@keyframes confettiDrop { from { transform: translateY(0) rotate(0); opacity: 1; } to { transform: translateY(360px) rotate(720deg); opacity: 0; } }`}</style>
          </>
        )}

        <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 12 }}>{info.emoji}</div>
        <div style={{
          display: 'inline-block', padding: '4px 12px', borderRadius: 999,
          background: info.bg, color: info.deep,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16,
        }}>
          {info.label} 獲得
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: 'var(--ink)' }}>
          {isPlatinum ? 'バンク完走おめでとう！' : '課題クリア！'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 18px' }}>
          <strong>{trophy.courseTitle}</strong><br />
          <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>{trophy.bankTitle}</span>
        </p>
        <button type="button" onClick={onClose} className="ck-btn-primary" style={{ minWidth: 180 }}>
          続ける
        </button>
      </div>
    </div>
  )
}

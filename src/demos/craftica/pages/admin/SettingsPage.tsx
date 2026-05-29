// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// 管理 — アプリ設定

import { useState } from 'react'

interface Toggle { id: string; label: string; desc: string; defaultOn: boolean }

const TOGGLES: Toggle[] = [
  { id: 'fal',       label: 'fal.ai 画像/動画生成',     desc: 'Claude が IMAGE_GEN / VIDEO_GEN マーカーを出した時のみ生成。$0.003/枚・$0.07/sec。', defaultOn: true },
  { id: 'websearch', label: 'Anthropic Web 検索',     desc: '全チャットで web_search_20260209 を有効化。最新情報を AI が自動で引いてくる。',     defaultOn: true },
  { id: 'hirake',    label: 'Hiraké アカウント連携',    desc: 'Craftica の課題完了 → Hiraké のポートフォリオ自動公開（manager+ で個別承認）。', defaultOn: false },
  { id: 'mail',      label: '通知メール送信',          desc: '公開承認・トロフィー獲得などのメール通知。本人がベル横でも切替可。',             defaultOn: true },
]

const LIMITS: { label: string; value: string; sub: string }[] = [
  { label: 'AI 利用上限（member/manager）', value: '5 / 日', sub: 'admin は無制限。JST 基準でリセット。' },
  { label: 'アップロード上限',              value: '100 MB', sub: '教材ファイル・成果物に共通。' },
  { label: '監査ログ保持期間',              value: '90 日',  sub: '期間経過後は自動削除（cron）。' },
]

export default function SettingsPage() {
  const [state, setState] = useState(() => Object.fromEntries(TOGGLES.map(t => [t.id, t.defaultOn])) as Record<string, boolean>)

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
          アプリ設定
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 0' }}>
          外部連携・AI 利用上限・保持期間などのテナント全体設定。すべての変更は audit_logs に記録。
        </p>
      </div>

      <section style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 18, marginBottom: 18 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: 'var(--ink)' }}>🔌 外部連携</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TOGGLES.map(t => (
            <div key={t.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 10, background: 'var(--paper-2)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{t.label}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.6 }}>{t.desc}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={state[t.id]}
                onClick={() => setState(s => ({ ...s, [t.id]: !s[t.id] }))}
                style={{
                  width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: state[t.id] ? 'var(--clay)' : 'var(--paper-3)',
                  position: 'relative', flexShrink: 0,
                  transition: 'background 150ms',
                }}
              >
                <span style={{
                  position: 'absolute', top: 2, left: state[t.id] ? 22 : 2,
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  boxShadow: '0 1px 3px rgba(60,45,25,0.2)',
                  transition: 'left 150ms',
                }} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 18 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: 'var(--ink)' }}>📊 利用上限・保持期間</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LIMITS.map(l => (
            <div key={l.label} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: 'var(--paper-2)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{l.label}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{l.sub}</div>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--clay)' }}>{l.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

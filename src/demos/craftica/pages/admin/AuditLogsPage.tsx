// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// 管理 — 監査ログ

import { Download } from 'lucide-react'

interface Log {
  ts: string
  severity: 'info' | 'warn' | 'critical'
  actor: string
  action: string
  target: string
}

const LOGS: Log[] = [
  { ts: '5/20 09:14', severity: 'info',     actor: 'admin',           action: 'role_granted',                target: 'kojihashimoto@kojinius.jp → manager' },
  { ts: '5/19 17:42', severity: 'info',     actor: '橋本 晃治',        action: 'bank_bulk_imported',          target: 'デザイン基礎バンク (6 courses)' },
  { ts: '5/19 14:08', severity: 'warn',     actor: 'system',          action: 'user_flagged',                target: 'u-oki' },
  { ts: '5/18 21:33', severity: 'info',     actor: '森本',             action: 'publication_submitted_to_review', target: 'Photoshop で画像をリサイズする' },
  { ts: '5/18 09:55', severity: 'info',     actor: '橋本 晃治',        action: 'publication_approved',        target: 'Figma で名刺デザイン (片岡)' },
  { ts: '5/16 11:20', severity: 'critical', actor: 'admin',           action: 'account_deleted',             target: 'u-test01@craftica.local' },
  { ts: '5/15 18:00', severity: 'info',     actor: 'system (cron)',   action: 'publication_published',       target: 'Web 制作入門バンク 自動公開' },
  { ts: '5/14 10:32', severity: 'info',     actor: '橋本 晃治',        action: 'user_invited',                target: 'newmember@craftica.local' },
]

const SEV_COLOR: Record<Log['severity'], { bg: string; fg: string }> = {
  info:     { bg: 'var(--sky-soft)',   fg: 'var(--sky)' },
  warn:     { bg: 'var(--sun-soft)',   fg: '#8B6914' },
  critical: { bg: 'var(--berry-soft)', fg: 'var(--berry)' },
}

export default function AuditLogsPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
            監査ログ
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 0' }}>
            ユーザー操作・公開フロー・課題削除の監査。90日間保持。
          </p>
        </div>
        <button type="button" className="ck-btn-ghost">
          <Download size={13} /> CSV エクスポート
        </button>
      </div>

      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16,
        overflowX: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>日時</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>レベル</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>実行者</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>アクション</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>対象</th>
            </tr>
          </thead>
          <tbody>
            {LOGS.map((l, i) => {
              const c = SEV_COLOR[l.severity]
              return (
                <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{l.ts}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                      background: c.bg, color: c.fg,
                    }}>{l.severity}</span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>{l.actor}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--ink-2)', fontFamily: 'monospace' }}>{l.action}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--ink-2)' }}>{l.target}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

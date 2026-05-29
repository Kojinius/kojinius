// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// 管理 — ユーザー管理：ロール変更 / 無効化 / 要監視フラグ（デモ）

import { MEMBER_LIST, MOCK_USERS } from '../../mockData'
import { colorOf } from '../../types'
import { ShieldAlert, Check } from 'lucide-react'

interface UserRow {
  uid: string
  displayName: string
  email: string
  role: 'admin' | 'manager' | 'member'
  memberKey: string
  initial: string
  active: boolean
  flagged?: boolean
}

const ROWS: UserRow[] = [
  { uid: 'u-admin',    displayName: '管理者',      email: 'admin@craftica.local',         role: 'admin',   memberKey: 'admin',    initial: '管', active: true },
  { uid: 'u-manager',  displayName: '橋本 晃治',  email: 'kojihashimoto@kojinius.jp',    role: 'manager', memberKey: 'manager',  initial: '橋', active: true },
  ...MEMBER_LIST.map(m => ({
    uid: m.uid, displayName: m.displayName,
    email: `${m.memberKey}@craftica.local`,
    role: 'member' as const,
    memberKey: m.memberKey,
    initial: m.initial,
    active: true,
    flagged: m.uid === 'u-oki',
  })),
]

void MOCK_USERS

export default function UsersPage() {
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
          ユーザー管理
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 0' }}>
          allowed_emails 管理・ロール変更・無効化・要監視フラグ。すべての操作は audit_logs に記録。
        </p>
      </div>

      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 8,
        overflowX: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>ユーザー</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>メール</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>ロール</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>状態</th>
              <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(r => {
              const color = colorOf(r.memberKey)
              return (
                <tr key={r.uid} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', background: color.hex, color: '#fff',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                      }}>{r.initial}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                          {r.displayName}
                          {r.flagged && (
                            <span style={{ marginLeft: 8, color: 'var(--berry)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                              <ShieldAlert size={12} /> 要監視
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'monospace' }}>{r.uid}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--ink-2)' }}>{r.email}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                      background: r.role === 'admin' ? 'var(--berry-soft)' : r.role === 'manager' ? 'var(--clay-soft)' : 'var(--paper-2)',
                      color:      r.role === 'admin' ? 'var(--berry)'      : r.role === 'manager' ? 'var(--clay-deep)' : 'var(--ink-3)',
                    }}>
                      {r.role === 'admin' ? '管理者' : r.role === 'manager' ? 'マネージャー' : 'メンバー'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {r.active ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--leaf)', fontWeight: 600 }}>
                        <Check size={12} /> 有効
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>無効</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <button type="button" className="ck-btn-ghost" style={{ padding: '6px 12px', fontSize: 11 }}>編集</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

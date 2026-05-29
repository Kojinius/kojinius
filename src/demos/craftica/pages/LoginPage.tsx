// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// Craftica ログインデモ — Google ボタン（飾り）+ DEV ロール切替

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMockAuth } from '../MockAuthContext'
import type { Role } from '../types'

const DEV_USERS: { role: Role; label: string; email: string }[] = [
  { role: 'admin',   label: '管理者でログイン',         email: 'admin@craftica.local' },
  { role: 'manager', label: 'マネージャー（橋本）でログイン', email: 'kojihashimoto@kojinius.jp' },
  { role: 'member',  label: 'メンバー（森本）でログイン',  email: 'morimoto@craftica.local' },
]

export default function LoginPage() {
  const { signIn, isLoggedIn } = useMockAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn) navigate('/demo/craftica/dashboard', { replace: true })
  }, [isLoggedIn, navigate])

  const handleLogin = (role: Role) => {
    signIn(role)
    navigate('/demo/craftica/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--paper)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', position: 'relative', overflow: 'hidden',
    }}>
      {/* 背景ブロブ */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-8%', right: '-4%',
          width: 360, height: 360, borderRadius: '50%',
          background: 'var(--clay-soft)', opacity: 0.55, filter: 'blur(72px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-8%', left: '-4%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'var(--sun-soft)', opacity: 0.55, filter: 'blur(64px)',
        }} />
        <div style={{
          position: 'absolute', top: '38%', left: '8%',
          width: 220, height: 220, borderRadius: '50%',
          background: 'var(--leaf-soft)', opacity: 0.4, filter: 'blur(56px)',
        }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 400,
        background: 'var(--card)', border: '1px solid var(--line)',
        borderRadius: 24, padding: 40, boxShadow: 'var(--shadow-lg)',
      }} className="ck-fade-in">
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 46, height: 46, borderRadius: 14, background: 'var(--clay)',
            marginBottom: 18, boxShadow: '0 2px 10px rgba(198, 107, 61, 0.28)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', margin: 0, marginBottom: 6, letterSpacing: '-0.01em' }}>
            Craftica
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0, lineHeight: 1.6 }}>
            AI と一緒にデザイン・Web・動画を学ぶ<br />研修プラットフォーム
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleLogin('admin')}
          style={{
            width: '100%', padding: '13px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            border: '1px solid var(--line)', borderRadius: 14,
            background: 'var(--card)', color: 'var(--ink-2)',
            fontSize: 15, fontWeight: 500, cursor: 'pointer',
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--paper)'; e.currentTarget.style.borderColor = 'var(--clay)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.borderColor = 'var(--line)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" />
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" />
          </svg>
          Google でサインイン
        </button>

        <p style={{ marginTop: 14, fontSize: 12, lineHeight: 1.6, color: 'var(--ink-4)', textAlign: 'center' }}>
          ログインすることで、
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--clay)', textDecoration: 'underline' }}>利用規約</a>
          {' '}および{' '}
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--clay)', textDecoration: 'underline' }}>プライバシーポリシー</a>
          に同意したものとみなされます。
        </p>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
          <p style={{ fontSize: 11, textAlign: 'center', color: 'var(--ink-4)', marginBottom: 10, fontFamily: 'monospace' }}>
            DEMO MODE — ロールを選んでログイン
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DEV_USERS.map(u => (
              <button
                key={u.role}
                type="button"
                onClick={() => handleLogin(u.role)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10,
                  background: 'var(--paper-2)', border: '1px solid var(--line)',
                  color: 'var(--ink-2)', fontSize: 13,
                  cursor: 'pointer', fontFamily: 'monospace', textAlign: 'left',
                  transition: 'background 0.1s, border-color 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--paper-3)'; e.currentTarget.style.borderColor = 'var(--line-2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--paper-2)'; e.currentTarget.style.borderColor = 'var(--line)' }}
              >
                {u.label} <span style={{ color: 'var(--ink-4)', fontSize: 11 }}>({u.email})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

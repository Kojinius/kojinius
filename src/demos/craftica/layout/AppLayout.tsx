// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// Craftica ダッシュボード系の共通ヘッダー + サイドナビ

import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { LogOut, MessageSquare, Sparkles, LayoutDashboard, BookHeart, Shield } from 'lucide-react'
import { useMockAuth } from '../MockAuthContext'

function Avatar({ hex, initial }: { hex: string; initial: string }) {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: '50%', background: hex, color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14, fontWeight: 700,
      boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.12), 0 1px 2px rgba(60,45,25,0.12)',
    }}>{initial}</div>
  )
}

const NAV_BASE_STYLE: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', borderRadius: 10,
  fontSize: 14, fontWeight: 500,
  color: 'var(--ink-2)', textDecoration: 'none',
  transition: 'background 120ms, color 120ms',
}

export function AppLayout() {
  const { user, signOut, isLoggedIn } = useMockAuth()
  const navigate = useNavigate()

  if (!isLoggedIn || !user) return <Navigate to="/demo/craftica" replace />

  const isAdmin = user.role === 'admin'
  const isManagerPlus = user.role === 'admin' || user.role === 'manager'

  return (
    <div>
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(251, 248, 243, 0.92)',
        borderBottom: '1px solid var(--line)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '12px 24px',
          display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <button
            type="button"
            onClick={() => navigate('/demo/craftica/dashboard')}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: 0,
            }}
          >
            <span style={{
              width: 32, height: 32, borderRadius: 10, background: 'var(--clay)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(198,107,61,0.3)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
              Craftica
            </span>
          </button>

          <nav style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
            <NavLink to="/demo/craftica/dashboard" end style={({ isActive }) => ({
              ...NAV_BASE_STYLE,
              background: isActive ? 'var(--clay-soft)' : 'transparent',
              color: isActive ? 'var(--clay-deep)' : 'var(--ink-2)',
            })}>
              <LayoutDashboard size={15} />ホーム
            </NavLink>
            <NavLink to="/demo/craftica/dashboard/chat" style={({ isActive }) => ({
              ...NAV_BASE_STYLE,
              background: isActive ? 'var(--clay-soft)' : 'transparent',
              color: isActive ? 'var(--clay-deep)' : 'var(--ink-2)',
            })}>
              <MessageSquare size={15} />AIチャット
            </NavLink>
            {isManagerPlus && (
              <NavLink to="/demo/craftica/dashboard/plan" style={({ isActive }) => ({
                ...NAV_BASE_STYLE,
                background: isActive ? 'var(--clay-soft)' : 'transparent',
                color: isActive ? 'var(--clay-deep)' : 'var(--ink-2)',
              })}>
                <Sparkles size={15} />プランモード
              </NavLink>
            )}
            <NavLink to="/demo/craftica/dashboard/consult" style={({ isActive }) => ({
              ...NAV_BASE_STYLE,
              background: isActive ? 'var(--clay-soft)' : 'transparent',
              color: isActive ? 'var(--clay-deep)' : 'var(--ink-2)',
            })}>
              <BookHeart size={15} />先生に相談
            </NavLink>
            {isManagerPlus && (
              <NavLink to="/demo/craftica/dashboard/admin/teachers" style={({ isActive }) => ({
                ...NAV_BASE_STYLE,
                background: isActive ? 'var(--clay-soft)' : 'transparent',
                color: isActive ? 'var(--clay-deep)' : 'var(--ink-2)',
              })}>
                <Shield size={15} />管理
              </NavLink>
            )}
          </nav>

          <div style={{ flex: 1 }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '4px 8px 4px 4px', borderRadius: 999,
            background: 'var(--paper-2)', border: '1px solid var(--line)',
          }}>
            <Avatar hex={user.color.hex} initial={user.initial} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{user.displayName}</span>
              <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                {user.role === 'admin' ? '管理者' : user.role === 'manager' ? 'マネージャー' : 'メンバー'}
                {isAdmin && ' / 全権限'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => { signOut(); navigate('/demo/craftica') }}
              title="ログアウト"
              style={{
                width: 28, height: 28, borderRadius: '50%', border: 'none',
                background: 'transparent', cursor: 'pointer', color: 'var(--ink-3)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        <Outlet />
      </main>
    </div>
  )
}

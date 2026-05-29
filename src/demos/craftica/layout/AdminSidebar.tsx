// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// 管理画面の共通サイドバー

import { Outlet, NavLink, Navigate } from 'react-router-dom'
import { LayoutDashboard, Users, Grid2x2, ScrollText, Settings, Sparkles } from 'lucide-react'
import { useMockAuth } from '../MockAuthContext'

interface MenuItem {
  to: string
  label: string
  icon: React.ReactNode
  adminOnly?: boolean
}

const ITEMS: MenuItem[] = [
  { to: '/demo/craftica/dashboard',              label: 'ダッシュボード', icon: <LayoutDashboard size={15} /> },
  { to: '/demo/craftica/dashboard/admin/teachers', label: '先生管理',     icon: <Sparkles size={15} /> },
  { to: '/demo/craftica/dashboard/admin/courses',  label: '課題管理',     icon: <Grid2x2 size={15} /> },
  { to: '/demo/craftica/dashboard/admin/users',    label: 'ユーザー管理', icon: <Users size={15} />, adminOnly: true },
  { to: '/demo/craftica/dashboard/admin/audit',    label: '監査ログ',     icon: <ScrollText size={15} />, adminOnly: true },
  { to: '/demo/craftica/dashboard/admin/settings', label: '設定',         icon: <Settings size={15} />, adminOnly: true },
]

export function AdminSidebar() {
  const { user } = useMockAuth()
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return <Navigate to="/demo/craftica/dashboard" replace />
  }
  const isAdmin = user.role === 'admin'

  const adminOnlyIdx = ITEMS.findIndex(i => i.adminOnly)
  const visible: (MenuItem | 'divider')[] = []
  ITEMS.forEach((item, idx) => {
    if (idx === adminOnlyIdx) visible.push('divider')
    if (item.adminOnly && !isAdmin) return
    visible.push(item)
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
      <aside style={{
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16,
        padding: 12, height: 'fit-content', position: 'sticky', top: 80,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '0.08em', padding: '6px 10px 10px' }}>
          管理画面
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {visible.map((it, i) =>
            it === 'divider' ? (
              <div key={`d-${i}`} style={{
                fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase',
                letterSpacing: '0.1em', padding: '14px 10px 6px',
                borderTop: '1px solid var(--line)', marginTop: 6,
              }}>
                Admin Only
              </div>
            ) : (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === '/demo/craftica/dashboard'}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: 13, fontWeight: 500,
                  background: isActive ? 'var(--clay-soft)' : 'transparent',
                  color: isActive ? 'var(--clay-deep)' : 'var(--ink-2)',
                })}
              >
                <span style={{ color: 'var(--ink-3)' }}>{it.icon}</span>
                {it.label}
              </NavLink>
            ),
          )}
        </div>
      </aside>
      <div>
        <Outlet />
      </div>
    </div>
  )
}

// 2026-04-22 claude-sonnet-4-6 セッションターン数：1
import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useMockAuth } from '../MockAuthContext'

const NAV = [
  { to: '/demo/ams',            label: '打刻',     icon: '🏠' },
  { to: '/demo/ams/attendance', label: '勤怠照会', icon: '📋' },
  { to: '/demo/ams/shift',      label: 'シフト申請', icon: '📅' },
  { to: '/demo/ams/leave',      label: '有給管理', icon: '🌴' },
]

function RoleToggle() {
  const { currentRole, setRole } = useMockAuth()
  return (
    <button
      type="button"
      onClick={() => setRole(currentRole === 'employee' ? 'admin' : 'employee')}
      className="px-3 py-1.5 text-xs font-heading font-black uppercase border-2 border-bauhaus-black bg-white hover:bg-sumi-50 transition-colors"
    >
      {currentRole === 'employee' ? '社員モード' : '管理者モード'}
    </button>
  )
}

export function AppLayout() {
  const { user, isAdmin } = useMockAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bauhaus-canvas">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-bauhaus-black">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-bauhaus-red flex items-center justify-center shrink-0">
              <span className="text-sm font-heading font-black text-white">勤</span>
            </div>
            <span className="font-heading font-black text-base uppercase text-bauhaus-black tracking-tight">勤怠管理システム</span>
          </div>
          <div className="flex items-center gap-4">
            <RoleToggle />
            <span className="text-sm text-sumi-600 font-heading font-bold hidden sm:inline">{user.displayName}</span>
            {isAdmin && (
              <button type="button" onClick={() => navigate('/demo/ams/admin')}
                className="text-xs font-heading font-black uppercase text-matsu hover:underline hidden lg:inline">
                管理者パネル →
              </button>
            )}
            <button type="button" onClick={() => setMenuOpen(o => !o)}
              className="lg:hidden p-2 hover:bg-sumi-50 transition-colors" aria-label="メニュー">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t-2 border-bauhaus-black bg-white animate-slide-down">
            <div className="max-w-6xl mx-auto px-6 py-2">
              {NAV.map(n => (
                <Link key={n.to} to={n.to} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 font-heading font-black text-sm uppercase tracking-tight transition-colors ${
                    location.pathname === n.to ? 'bg-bauhaus-black text-white' : 'text-sumi-500 hover:bg-sumi-50'
                  }`}>
                  <span className="text-lg">{n.icon}</span><span>{n.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-6 pt-6 pb-28 lg:pb-10">
        <div className="lg:flex lg:gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-52 shrink-0">
            <nav className="sticky top-20 border-2 border-bauhaus-black bg-white p-2 space-y-0.5">
              {NAV.map(n => {
                const active = location.pathname === n.to
                return (
                  <Link key={n.to} to={n.to}
                    className={`flex items-center gap-3 px-3 py-3 font-heading font-black text-sm uppercase tracking-tight transition-colors ${
                      active ? 'bg-bauhaus-black text-white' : 'text-sumi-500 hover:bg-sumi-50 hover:text-bauhaus-black'
                    }`}>
                    <span className="text-xl leading-none shrink-0">{n.icon}</span>
                    <span>{n.label}</span>
                  </Link>
                )
              })}
              {isAdmin && (
                <div className="pt-2 border-t-2 border-sumi-100">
                  <button type="button" onClick={() => navigate('/demo/ams/admin')}
                    className="w-full flex items-center gap-3 px-3 py-3 font-heading font-black text-sm uppercase tracking-tight text-matsu hover:bg-sumi-50 transition-colors">
                    <span className="text-xl leading-none shrink-0">⚙️</span>
                    <span>管理者パネル</span>
                  </button>
                </div>
              )}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Bottom Nav (mobile only) */}
      <nav className="lg:hidden fixed bottom-6 left-0 right-0 z-30 flex justify-center">
        <div className="flex bg-white border-2 border-bauhaus-black shadow-bauhaus">
          {NAV.map(n => {
            const active = location.pathname === n.to
            return (
              <Link key={n.to} to={n.to}
                className={`flex flex-col items-center px-5 py-3 text-xs font-heading font-black uppercase transition-colors ${
                  active ? 'bg-bauhaus-black text-white' : 'text-sumi-500 hover:bg-sumi-50'
                }`}>
                <span className="text-xl leading-none mb-1">{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

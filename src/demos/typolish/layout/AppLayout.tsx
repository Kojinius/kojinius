// 2026-04-22 claude-sonnet-4-6 セッションターン数：1
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useMockAuth } from '../MockAuthContext'

const THEME_LABELS = { light: '☀️ Light', dark: '🌙 Dark', wire: '📐 Wire' } as const
const THEMES = ['light', 'dark', 'wire'] as const

export function AppLayout() {
  const { user, theme, setTheme } = useMockAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen pb-10" style={{ background: 'var(--tp-bg)', color: 'var(--tp-text)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b" style={{ background: 'var(--tp-surface)', borderColor: 'var(--tp-border)' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <button type="button" onClick={() => navigate('/demo/typolish')}
            className="font-['Fraunces',serif] font-bold text-xl tracking-tight" style={{ color: 'var(--tp-text)' }}>
            Typolish
          </button>
          <div className="flex-1" />
          {/* Theme toggle */}
          <div className="flex rounded-lg overflow-hidden border text-xs" style={{ borderColor: 'var(--tp-border)' }}>
            {THEMES.map(t => (
              <button key={t} type="button" onClick={() => setTheme(t)}
                className="px-3 py-1.5 font-medium transition-colors"
                style={theme === t
                  ? { background: 'var(--tp-accent)', color: '#fff' }
                  : { background: 'var(--tp-surface)', color: 'var(--tp-subtle)' }}>
                {THEME_LABELS[t]}
              </button>
            ))}
          </div>
          <Link to="/demo/typolish/settings"
            className="text-sm font-medium transition-opacity opacity-70 hover:opacity-100"
            style={{ color: 'var(--tp-text)' }}>
            設定
          </Link>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#F79321] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user.initials}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-8">
        <Outlet />
      </main>
    </div>
  )
}

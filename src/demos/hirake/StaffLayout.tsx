import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useMockAuth } from './MockAuthContext'
import { ThemeToggle } from './ThemeToggle'

const BASE = '/demo/hirake'

const NAV_ITEMS = [
  { to: `${BASE}/my/profile`, label: 'PROFILE' },
  { to: `${BASE}/my/works`,   label: 'WORKS'   },
]

export function StaffLayout() {
  const { userDoc } = useMockAuth()
  const navigate    = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 text-[10px] tracking-[0.22em] font-mono
    border-l-2 transition-all duration-200 ${
      isActive
        ? 'border-[var(--amber)] text-[var(--text-1)] bg-[var(--surface)]'
        : 'border-transparent text-[var(--text-3)] hover:text-[var(--text-2)] hover:border-[var(--border)]'
    }`

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] flex flex-col pb-[120px]">
      <header className="flex-none border-b border-[var(--border)] px-4 md:px-8 py-4 md:py-5 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-5">
          <button onClick={() => navigate(BASE)} className="flex items-center gap-2.5 group">
            <span className="text-[var(--amber)] transition-transform duration-200 group-hover:-translate-x-1">←</span>
            <span className="font-display text-xl md:text-2xl font-black tracking-tight leading-none">
              Hirak<span className="text-[var(--amber)]">é</span>
            </span>
          </button>
          <span className="hidden sm:inline text-[9px] text-[var(--text-3)] tracking-[0.3em] uppercase font-mono border border-[var(--border)] px-2 py-0.5">
            マイページ
          </span>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <span className="hidden md:block text-xs text-[var(--text-3)]">{userDoc.displayName}</span>
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden flex flex-col gap-1.5 p-1"
            aria-label="メニューを開く"
          >
            <span className={`block w-5 h-px bg-[var(--text-2)] transition-transform duration-200 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block w-5 h-px bg-[var(--text-2)] transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-[var(--text-2)] transition-transform duration-200 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="md:hidden border-b border-[var(--border)] bg-[var(--surface)] flex flex-col">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <nav className="hidden md:flex w-48 flex-none border-r border-[var(--border)] flex-col pt-8 pb-4 px-4 gap-0.5">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>{item.label}</NavLink>
          ))}
        </nav>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  )
}

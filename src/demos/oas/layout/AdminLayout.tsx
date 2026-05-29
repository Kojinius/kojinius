// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '../../../utils/cn'
import { MOCK_CLINIC } from '../mockData'

const NAV = [
  { to: '/demo/oas/admin',          label: 'ダッシュボード', icon: '📊', end: true  },
  { to: '/demo/oas/admin/history',  label: '予約履歴',       icon: '📋', end: false },
  { to: '/demo/oas/admin/settings', label: '診療時間設定',   icon: '⚙️', end: false },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-dvh flex">
      <aside className="w-52 bg-[#1B3664] text-white flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-white/10">
          <p className="text-xs text-white/50 mb-1">管理者ポータル</p>
          <h1 className="text-sm font-bold leading-snug oas-heading tracking-wide">
            {MOCK_CLINIC.clinicName}
          </h1>
        </div>

        <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/60 hover:bg-white/10 hover:text-white',
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <button
            onClick={() => navigate('/demo/oas')}
            className="w-full text-left text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-2"
          >
            ← 予約ページへ
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-[#FAF8F3] overflow-auto pb-12">
        {children}
      </main>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { useMockAuth } from '../MockAuthContext'
import { MOCK_MEMBERS, MOCK_ALL_WORKS, MOCK_USERS } from '../mockData'

const BASE = '/demo/hirake'

export function AdminDashboard() {
  const navigate = useNavigate()
  const { role } = useMockAuth()
  const isAdmin  = role === 'admin'

  const stats = [
    { label: 'MEMBERS', count: MOCK_MEMBERS.length,  to: `${BASE}/admin/members` },
    { label: 'WORKS',   count: MOCK_ALL_WORKS.length, to: `${BASE}/admin/works`   },
    ...(isAdmin ? [{ label: 'USERS', count: MOCK_USERS.length, to: `${BASE}/admin/users` }] : []),
  ]

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-10">
        <div className="h-px w-8 bg-[var(--amber)] mb-4" />
        <h2 className="font-display text-3xl font-black tracking-tight">Dashboard</h2>
      </div>

      <div className={`grid gap-3 md:gap-4 mb-12 ${stats.length === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
        {stats.map(stat => (
          <button key={stat.label} onClick={() => navigate(stat.to)}
            className="bg-[var(--surface)] border border-[var(--border)] p-6 text-left hover:border-[var(--amber)] transition-colors duration-200 group">
            <p className="text-[9px] text-[var(--text-3)] tracking-[0.3em] font-mono mb-3">{stat.label}</p>
            <p className="font-display text-5xl font-black text-[var(--text-1)] leading-none">{stat.count}</p>
            <p className="text-[10px] text-[var(--amber)] tracking-wider mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-mono">管理する →</p>
          </button>
        ))}
      </div>

      <div>
        <p className="text-[9px] text-[var(--text-3)] tracking-[0.3em] uppercase font-mono mb-4">Quick Actions</p>
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'メンバー管理',   to: `${BASE}/admin/members`  },
            { label: '作品管理',       to: `${BASE}/admin/works`    },
            { label: '招待リンク発行', to: `${BASE}/admin/invites`  },
          ].map(link => (
            <button key={link.to} onClick={() => navigate(link.to)}
              className="px-4 py-2 text-xs font-mono border border-[var(--border)] text-[var(--text-2)] hover:border-[var(--amber)] hover:text-[var(--text-1)] transition-all duration-200">
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

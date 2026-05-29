// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMockAuth } from '../MockAuthContext'
import UsersTab       from './UsersTab'
import AttendanceTab  from './AttendanceTab'
import CorrectionsTab from './CorrectionsTab'
import ScheduleTab    from './ScheduleTab'
import LeaveTab       from './LeaveTab'
import PayrollTab     from './PayrollTab'
import OvertimeTab    from './OvertimeTab'
import OrganizationTab from './OrganizationTab'
import MasterTab      from './MasterTab'
import GeofenceTab    from './GeofenceTab'
import ChatworkTab    from './ChatworkTab'
import AuditLogTab    from './AuditLogTab'
import { CORRECTION_REQUESTS, SHIFT_RECORDS, LEAVE_REQUESTS } from '../mockData'

const TABS = [
  { id: 'users',        label: 'ユーザー管理', icon: '👥' },
  { id: 'master',       label: 'マスタ管理',   icon: '⚙️' },
  { id: 'organization', label: '組織',          icon: '🏢' },
  { id: 'attendance',   label: '勤怠管理',      icon: '🕐' },
  { id: 'schedule',     label: 'シフト申請',    icon: '📅' },
  { id: 'overtime',     label: '残業管理',       icon: '📊' },
  { id: 'corrections',  label: '修正申請',       icon: '✏️' },
  { id: 'payroll',      label: '給与計算',       icon: '💰' },
  { id: 'leave',        label: '有給管理',       icon: '🌴' },
  { id: 'geofence',     label: 'ジオフェンス',   icon: '📍' },
  { id: 'chatwork',     label: 'Chatwork',       icon: '💬' },
  { id: 'auditLog',     label: '監査ログ',        icon: '🛡️' },
] as const

type TabId = typeof TABS[number]['id']

const PENDING: Partial<Record<TabId, number>> = {
  corrections: CORRECTION_REQUESTS.filter(c => c.status === 'pending').length,
  schedule:    SHIFT_RECORDS.filter(s => s.status === 'pending').length,
  leave:       LEAVE_REQUESTS.filter(l => l.status === 'pending').length,
}

function TabContent({ tab }: { tab: TabId }) {
  switch (tab) {
    case 'users':        return <UsersTab />
    case 'attendance':   return <AttendanceTab />
    case 'corrections':  return <CorrectionsTab />
    case 'schedule':     return <ScheduleTab />
    case 'leave':        return <LeaveTab />
    case 'payroll':      return <PayrollTab />
    case 'overtime':     return <OvertimeTab />
    case 'organization': return <OrganizationTab />
    case 'master':       return <MasterTab />
    case 'geofence':     return <GeofenceTab />
    case 'chatwork':     return <ChatworkTab />
    case 'auditLog':     return <AuditLogTab />
    default:             return null
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useMockAuth()
  const [params, setParams] = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const tabParam = params.get('tab') as TabId | null
  const activeTab: TabId = TABS.some(t => t.id === tabParam) ? tabParam! : 'users'
  const activeTabDef = TABS.find(t => t.id === activeTab)!

  function setTab(id: TabId) {
    setParams({ tab: id })
    setMobileOpen(false)
  }

  return (
    <div className="min-h-screen bg-bauhaus-canvas">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-bauhaus-black">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center gap-3">
          <button type="button" onClick={() => navigate('/demo/ams')} className="p-1.5 hover:bg-sumi-50 border border-sumi-200 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-7 h-7 bg-bauhaus-red flex items-center justify-center">
            <span className="text-xs font-heading font-black text-white">管</span>
          </div>
          <span className="font-heading font-black text-sm uppercase text-bauhaus-black flex-1">管理者パネル</span>
          <span className="text-xs text-sumi-500 font-heading font-bold">{user.displayName}</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-4 pb-16">
        {/* モバイルナビ */}
        <div className="lg:hidden mb-4">
          <button type="button" onClick={() => setMobileOpen(o => !o)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border-2 border-bauhaus-black shadow-bauhaus-sm font-heading font-black text-sm uppercase">
            <span className="flex items-center gap-2">
              <span>{activeTabDef.icon}</span>{activeTabDef.label}
            </span>
            <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 text-sumi-400 transition-transform ${mobileOpen && 'rotate-180'}`}>
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
          {mobileOpen && (
            <div className="mt-1 bg-white border-2 border-bauhaus-black shadow-bauhaus animate-slide-down">
              {TABS.map(tab => {
                const count = PENDING[tab.id] ?? 0
                return (
                  <button key={tab.id} type="button" onClick={() => setTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-heading font-black uppercase tracking-tight transition-colors border-b border-sumi-100 last:border-0 ${
                      activeTab === tab.id ? 'bg-bauhaus-black text-white' : 'text-sumi-500 hover:bg-sumi-50'
                    }`}>
                    <span>{tab.icon}</span>
                    <span className="flex-1 text-left">{tab.label}</span>
                    {count > 0 && <span className="bg-bauhaus-red text-white text-[10px] font-black px-1 min-w-[18px] text-center">{count}</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* デスクトップ: サイドバー + コンテンツ */}
        <div className="lg:flex lg:gap-5">
          {/* サイドバー */}
          <aside className="hidden lg:block w-48 shrink-0">
            <nav className="sticky top-20 border-2 border-bauhaus-black bg-white p-1.5 space-y-0.5">
              {TABS.map(tab => {
                const count = PENDING[tab.id] ?? 0
                const isActive = activeTab === tab.id
                return (
                  <button key={tab.id} type="button" onClick={() => setTab(tab.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 text-[12px] font-heading font-black uppercase tracking-tight transition-colors ${
                      isActive ? 'bg-bauhaus-black text-white' : 'text-sumi-500 hover:bg-sumi-50 hover:text-bauhaus-black'
                    }`}>
                    <span className="shrink-0 text-base leading-none">{tab.icon}</span>
                    <span className="flex-1 text-left truncate">{tab.label}</span>
                    {count > 0 && (
                      <span className={`text-[10px] font-black px-1 min-w-[16px] text-center leading-none py-0.5 ${isActive ? 'bg-white text-bauhaus-black' : 'bg-bauhaus-red text-white'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* メインコンテンツ */}
          <div className="flex-1 min-w-0 animate-fade-in-up" key={activeTab}>
            <TabContent tab={activeTab} />
          </div>
        </div>
      </div>
    </div>
  )
}

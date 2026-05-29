// 2026-04-22 claude-sonnet-4-6 セッションターン数：1
import { Routes, Route, Navigate } from 'react-router-dom'
import { MockAuthProvider } from './MockAuthContext'
import { DemoBanner }      from './DemoBanner'
import { AppLayout }       from './layout/AppLayout'
import Home                from './employee/Home'
import AttendanceList      from './employee/AttendanceList'
import ShiftCalendar       from './employee/ShiftCalendar'
import LeaveOverview       from './employee/LeaveOverview'
import LeaveRequest        from './employee/LeaveRequest'
import Dashboard           from './admin/Dashboard'

export function AmsDemo() {
  return (
    <MockAuthProvider>
      <div className="ams-demo">
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="attendance" element={<AttendanceList />} />
            <Route path="shift"      element={<ShiftCalendar />} />
            <Route path="leave"      element={<LeaveOverview />} />
            <Route path="leave/request" element={<LeaveRequest />} />
          </Route>
          <Route path="admin/*" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/demo/ams" replace />} />
        </Routes>
        <DemoBanner />
      </div>
    </MockAuthProvider>
  )
}

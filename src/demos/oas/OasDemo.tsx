// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { Routes, Route, Navigate } from 'react-router-dom'
import { BookingPage } from './booking/BookingPage'
import { Dashboard } from './admin/Dashboard'
import { VisitHistory } from './admin/VisitHistory'
import { Settings } from './admin/Settings'
import { DemoBanner } from './DemoBanner'

export function OasDemo() {
  return (
    <div className="oas-demo">
      <Routes>
        <Route index element={<BookingPage />} />
        <Route path="admin"          element={<Dashboard />} />
        <Route path="admin/history"  element={<VisitHistory />} />
        <Route path="admin/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/demo/oas" replace />} />
      </Routes>
      <DemoBanner />
    </div>
  )
}

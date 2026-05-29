// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// Craftica デモのルート — Theme + MockAuth + Routes + Banner

import { Routes, Route, Navigate } from 'react-router-dom'
import { MockAuthProvider } from './MockAuthContext'
import { DemoBanner } from './DemoBanner'
import { AppLayout } from './layout/AppLayout'
import { AdminSidebar } from './layout/AdminSidebar'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import BankDetailPage from './pages/BankDetailPage'
import CourseDetailPage from './pages/CourseDetailPage'
import ChatPage from './pages/ChatPage'
import PlanModePage from './pages/PlanModePage'
import ConsultPage from './pages/ConsultPage'
import TeachersPage from './pages/admin/TeachersPage'
import CoursesPage from './pages/admin/CoursesPage'
import UsersPage from './pages/admin/UsersPage'
import AuditLogsPage from './pages/admin/AuditLogsPage'
import SettingsPage from './pages/admin/SettingsPage'
import './theme.css'

export function CrafticaDemo() {
  return (
    <MockAuthProvider>
      <div data-theme="craftica" className="craftica-demo">
        <Routes>
          <Route index element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="dashboard/banks/:bankId" element={<BankDetailPage />} />
            <Route path="dashboard/banks/:bankId/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="dashboard/chat" element={<ChatPage />} />
            <Route path="dashboard/plan" element={<PlanModePage />} />
            <Route path="dashboard/consult" element={<ConsultPage />} />
            <Route element={<AdminSidebar />}>
              <Route path="dashboard/admin/teachers" element={<TeachersPage />} />
              <Route path="dashboard/admin/courses"  element={<CoursesPage />} />
              <Route path="dashboard/admin/users"    element={<UsersPage />} />
              <Route path="dashboard/admin/audit"    element={<AuditLogsPage />} />
              <Route path="dashboard/admin/settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/demo/craftica" replace />} />
        </Routes>
        <DemoBanner />
      </div>
    </MockAuthProvider>
  )
}

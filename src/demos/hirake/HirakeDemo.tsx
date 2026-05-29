// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { HirakeThemeProvider }  from './HirakeThemeContext'
import { MockAuthProvider }     from './MockAuthContext'
import { DemoBanner }           from './DemoBanner'
import { AdminLayout }          from './AdminLayout'
import { StaffLayout }          from './StaffLayout'
import { TopPage }              from './TopPage'
import { MemberPage }           from './MemberPage'
import { AdminDashboard }       from './admin/AdminDashboard'
import { AdminMembers }         from './admin/AdminMembers'
import { AdminWorks }           from './admin/AdminWorks'
import { AdminUsers }           from './admin/AdminUsers'
import { AdminInvites }         from './admin/AdminInvites'
import { MyProfilePage }        from './my/MyProfilePage'
import { MyWorksPage }          from './my/MyWorksPage'

export function HirakeDemo() {
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  return (
    <HirakeThemeProvider wrapperRef={wrapperRef}>
      <MockAuthProvider>
        <div ref={wrapperRef} className="hirake-demo">
          <Routes>
            <Route index element={<TopPage />} />
            <Route path="member/:id" element={<MemberPage />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="works"   element={<AdminWorks />} />
              <Route path="users"   element={<AdminUsers />} />
              <Route path="invites" element={<AdminInvites />} />
            </Route>
            <Route path="my" element={<StaffLayout />}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<MyProfilePage />} />
              <Route path="works"   element={<MyWorksPage />} />
            </Route>
          </Routes>
          <DemoBanner />
        </div>
      </MockAuthProvider>
    </HirakeThemeProvider>
  )
}

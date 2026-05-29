// 2026-04-22 claude-sonnet-4-6 セッションターン数：1
import { Routes, Route, Navigate } from 'react-router-dom'
import { MockAuthProvider, useMockAuth } from './MockAuthContext'
import { DemoBanner }    from './DemoBanner'
import { AppLayout }     from './layout/AppLayout'
import Dashboard         from './pages/Dashboard'
import ProjectDetail     from './pages/ProjectDetail'
import ProofViewer       from './pages/ProofViewer'
import Settings          from './pages/Settings'

function ThemedRoot() {
  const { theme } = useMockAuth()
  return (
    <div className="typolish-demo" data-theme={theme}>
      <Routes>
        <Route path="p/:id/pr/:proofId" element={<ProofViewer />} />
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="p/:id" element={<ProjectDetail />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/demo/typolish" replace />} />
      </Routes>
      <DemoBanner />
    </div>
  )
}

export function TypolishDemo() {
  return (
    <MockAuthProvider>
      <ThemedRoot />
    </MockAuthProvider>
  )
}

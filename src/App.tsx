// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Header } from '@/components/Header';

const Home          = lazy(() => import('@/pages/Home'));
const ResumeCreator = lazy(() => import('@/pages/ResumeCreator'));
const CVCreator     = lazy(() => import('@/pages/CVCreator'));
// 2026-05-04 claude-sonnet-4-6 セッションターン数：2
// 2026-06-01 claude-opus-4-8[1m] セッションターン数：3 — MD Editor を Craftica Editor に置換
const CrafticaEditorPage = lazy(() => import('@/pages/CrafticaEditorPage'));
const HirakeDemo    = lazy(() =>
  import('./demos/hirake/HirakeDemo').then(m => ({ default: m.HirakeDemo }))
);
// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
const OasDemo       = lazy(() =>
  import('./demos/oas/OasDemo').then(m => ({ default: m.OasDemo }))
);
// 2026-04-22 claude-sonnet-4-6 セッションターン数：1
const AmsDemo       = lazy(() =>
  import('./demos/ams/AmsDemo').then(m => ({ default: m.AmsDemo }))
);
// 2026-04-22 claude-sonnet-4-6 セッションターン数：1
const TypolishDemo  = lazy(() =>
  import('./demos/typolish/TypolishDemo').then(m => ({ default: m.TypolishDemo }))
);
// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
const CrafticaDemo  = lazy(() =>
  import('./demos/craftica/CrafticaDemo').then(m => ({ default: m.CrafticaDemo }))
);

const Spinner = () => (
  <div className="flex items-center justify-center h-32">
    <div className="w-6 h-6 border-2 border-brown-300 border-t-accent rounded-full animate-spin" />
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Hirake demo — full-screen, own header, own theme */}
        <Route path="/demo/hirake/*" element={
          <Suspense fallback={<Spinner />}>
            <HirakeDemo />
          </Suspense>
        } />
        {/* OAS demo — full-screen, own layout */}
        <Route path="/demo/oas/*" element={
          <Suspense fallback={<Spinner />}>
            <OasDemo />
          </Suspense>
        } />
        {/* AMS demo — full-screen, own layout */}
        <Route path="/demo/ams/*" element={
          <Suspense fallback={<Spinner />}>
            <AmsDemo />
          </Suspense>
        } />
        {/* Typolish demo — full-screen, own layout */}
        <Route path="/demo/typolish/*" element={
          <Suspense fallback={<Spinner />}>
            <TypolishDemo />
          </Suspense>
        } />
        {/* 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
            Craftica demo — full-screen, own layout */}
        <Route path="/demo/craftica/*" element={
          <Suspense fallback={<Spinner />}>
            <CrafticaDemo />
          </Suspense>
        } />
        {/* Craftica Editor（旧 MD Editor）— full-screen, no site header。パスは /md-editor を維持 */}
        <Route path="/md-editor" element={
          <Suspense fallback={<Spinner />}>
            <CrafticaEditorPage />
          </Suspense>
        } />
        {/* kojinius portfolio */}
        <Route path="*" element={
          <ThemeProvider>
            <div className="min-h-screen">
              <Header />
              <Suspense fallback={<Spinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/resume" element={<ResumeCreator />} />
                  <Route path="/cv" element={<CVCreator />} />
                </Routes>
              </Suspense>
            </div>
          </ThemeProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}

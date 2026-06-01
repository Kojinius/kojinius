# kojinius.jp — Work Log

## Project Overview
Portfolio SPA for kojinius.jp (Vite + React 19 + TypeScript + Tailwind).
Showcases projects built via Claude Code, with in-site interactive demos
(Craftica, Typolish, Hiraké, OAS, AMS) plus standalone tools (Markdown Editor,
Resume / CV makers). Deployed to Firebase Hosting
(project `project-3040e21e-879f-4c66-a7d`, target `portfolio`).
Static subsites (`/typolish/`, `/post-pilot/`, `/post-pilot-kantan/`) live under
`public/` and are copied into `dist/` at build time, so a deploy is a full
replace of `dist/` — always `npm run build` before deploying.

## 2026-05-29
- Restored production after a stale-deploy incident. Live kojinius.jp was serving a
  pre-Craftica / pre-MdEditor build (bundle `index-CIsfqHFz.js`), so the Craftica and
  Markdown Editor cards were missing and product cards linked to live apps instead of
  the in-site demos.
- Root cause: the latest local build was never deployed; production kept an old release.
  Additionally `/typolish/` existed only in `public/` and was absent from the previously
  built `dist/`, so a naive redeploy would have wiped it.
- Fix: `npm run build` to regenerate `dist/` with all demo chunks (CrafticaDemo, MdEditor)
  and all static subsites copied in; verified `dist/typolish`, `dist/post-pilot/proposals`,
  `dist/post-pilot-kantan` all present; then `firebase deploy --only hosting:portfolio`.
- Post-deploy verification (live): `/` now loads the new SPA (`index-DprDke1j.js`) whose
  bundle contains Craftica / MdEditor / the `/demo/craftica` route; `/typolish/`,
  `/post-pilot/proposals/`, `/post-pilot-kantan/` all still serve their real static content.
- Committed the previously-uncommitted feature work: in-site demos (`src/demos/**`),
  Markdown Editor page (`src/pages/MdEditor.tsx`), project cards (`src/data/projects.ts`),
  Firebase config (`.firebaserc`, `firebase.json`), and the Craftica demo design doc.

## 2026-06-02
- Replaced the `/md-editor` page (old Markdown Editor) with **Craftica Editor**, ported
  wholesale from the sibling `craftica` project (`src/components/crafticaEditor/**` +
  `src/lib/speech.ts`). Stripped the craftica-only "submit to course" flow
  (firebase / Vercel Blob / next-router / jszip / sonner) since kojinius has no backend.
- Added a **Japanese→English real-time translation** view (🌐 翻訳 / Alt+4) using the
  Chrome built-in Translator API (on-device, free, no API key, no external send), with an
  **auto-translate ON/OFF toggle** (localStorage-persisted) and a fallback notice for
  unsupported browsers (Chrome/Edge 138+ desktop only).
- Added prismjs + sucrase. Fixed a Vite worker-inlining trap: `sql.worker.js` (4045 B) fell
  under the 4 KB inline threshold and became a data URL, breaking the module worker; forced
  `*.worker.js` to always emit as files via `build.assetsInlineLimit`. Fixed an
  `erasableSyntaxOnly` violation (workerHost constructor parameter properties).
- Rebranded "MD Editor" → "Craftica Editor" across Header nav, projects card, PWA manifest,
  and document.title; kept the `/md-editor` URL (PWA start_url / external links).
- Verified: `npm run build` (tsc strict + vite) passes; all 3 runner worker chunks emit.
  Real-browser smoke test (system Chrome via Playwright) confirmed the editor, Markdown
  preview, and **actual ja→en translation** ("私は毎朝コーヒーを飲みます…" → "I drink coffee
  every morning…"). Clean load = zero 4xx.
- PR #3 (`feature/md-editor-to-craftica-editor`). Code review fixes applied: translator
  `destroy()` on unmount, removed dead submit CSS, de-duplicated `document.title`.
- **Not yet deployed** (Firebase Hosting is manual; remember: `npm run build` before deploy).
  KNOWN PRODUCTION BLOCKER for the runners: `firebase.json` CSP lacks `'wasm-unsafe-eval'`
  and `https://cdn.jsdelivr.net` / `https://esm.sh` (script-src / connect-src). Python /
  Ruby / SQL execution will be blocked on kojinius.jp until the CSP is updated — a security
  tradeoff left for boss decision. Translation + Markdown/HTML preview are unaffected.
- Design doc: `documents/design/craftica-editor-port-to-kojinius.md`.

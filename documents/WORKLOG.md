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

# Craftica Editor を kojinius.jp/md-editor へ移植（MD Editor 全面置換）

> 2026-06-01 claude-opus-4-8[1m] セッションターン数：1
> ボス指示「https://kojinius.jp/md-editor を、Craftica Editor にまるっと変更して」

## 1. 背景・目的

`kojinius/src/pages/MdEditor.tsx`（marked ベースの素の Markdown エディタ、922 行）は、もともと
2026-05 に Craftica へ移植され `craftica/src/components/crafticaEditor/`（2247 行 + ランナー/教育/
ローダー各サブシステム）へ大幅進化した。本タスクは、その進化版 **Craftica Editor を kojinius へ
逆輸入** し、`/md-editor` ルートを丸ごと置換する。

得られる機能差分（MdEditor には無い Craftica Editor の機能）:
- Python / Ruby / SQL の **ブラウザ内実行**（Web Worker + CDN WASM。Pyodide / ruby.wasm / sql.js）
- HTML/JS/JSX/TS の **ライブプレビュー**（sucrase トランスパイル + esm.sh importmap iframe）
- Prism シンタックスハイライト（多言語）
- 教育レイヤー（ミス→レッスン提示・補完候補・リファレンスリンク・TTS 読み上げ）
- 言語自動判定 + 言語ピッカー

## 2. 生命線検証結果（着手前・実コード裏取り済み / MUST 0）

| 生命線（偽なら設計崩壊） | 検証 | 結果 |
|---|---|---|
| CrafticaEditor は Vite(kojinius) に移植可能か | `@/` 外部 import を全 grep | **可**。外部結合は `@/lib/firebase`(index.tsx) と `@/lib/speech`(educator/speak.ts) のみ |
| Next.js 固有 API への依存 | `next/*` を grep | `next/navigation` の `useRouter` **1 箇所のみ**（index.tsx:1060、course 提出後遷移）。course 無指定の standalone では到達不能パス |
| Web Worker は Vite で動くか | runner の Worker 生成方式 | `new Worker(new URL('./x.worker.js', import.meta.url), {type:'module'})` = **Vite ネイティブ対応の書式**。worker 内 WASM は実行時 CDN fetch で bundler 非依存 → Next/Vite パリティ成立 |
| i18n への依存 | `useTranslation` を全 grep | **無し**。文言はハードコード日本語 |
| craftica のデザイントークン依存 | `var(--*)` を全 grep | ほぼ無し（`--split-ratio` は自前設定）。CSS は index.tsx の `<style>` ブロックに literal color で内包 = 見た目が部品ごと移動する |
| className は tailwind utility か | render 部確認 | **カスタムクラス**（`.md-shell` 等、`<style>` ブロックで定義）。kojinius の tailwind v3 と無関係 |
| props は standalone で省略可か | types.ts | 全 props optional。`<CrafticaEditor />` 単体で動作、course/learner 機能は未指定時 no-op |
| 追加 npm 依存 | bare-specifier 全 grep | 追加要は **prismjs / sucrase** のみ（react/react-dom/marked/lucide-react は kojinius 既存。jszip/sonner/@vercel/blob は提出機能と共に除去） |

結論: **生命線は全て真**。クリーンに移植可能。

## 3. Props 定義（types.ts、移植後も不変）

```ts
interface CrafticaEditorProps {
  learner?: { uid: string; role: 'admin'|'manager'|'member'; level: 'beginner'|'intermediate'|'advanced' };
  course?:  { bankId: string; courseId: string; title: string; type: string };
  onMistake?: (lesson: { code: string; type: string; explanation: string }) => void;
  onMastery?: (symbol: string) => void;
  reducedMotion?: boolean;
  preferredLanguage?: PrismLang;
}
```

kojinius 側は **props 無し** で描画する（`<CrafticaEditor />`）。learner/course は craftica 専用の
学習文脈であり、ポートフォリオ公開ツールには存在しないため。

## 4. データフロー

- **編集状態**: textarea ⇄ React state（tabs[]）⇄ localStorage（`md-editor-tabs` / `md-editor-active`）。
  MdEditor と同一キーを踏襲（既存 PWA ユーザーのデータ継続）。
- **プレビュー**: Markdown → marked → sanitize → `dangerouslySetInnerHTML`。HTML/JS 系 → sucrase →
  iframe srcdoc（esm.sh importmap）。
- **ランナー**: code → useRunner → WorkerHost → `*.worker.js` → CDN WASM 取得・実行 → RunResult →
  RunnerOutput 描画。
- **ファイル I/O**: File System Access API（保存）/ ダウンロード（フォールバック）/ ファイル open。
  すべてブラウザ完結・サーバー不要。

## 5. ステート管理

CrafticaEditor 単一コンポーネントが全 state を保持（tabs, activeId, viewMode, 言語, ランナー状態,
教育レイヤー state 等）。kojinius のページ wrapper は state を持たず描画のみ。

## 6. 削除する機能（craftica 専用・kojinius にバックエンド無し）

「課題に提出」フロー一式を index.tsx から除去する:
- import: `next/navigation`, `@vercel/blob/client`, `jszip`, `sonner`, `@/lib/firebase`
- `const router = useRouter()`
- `handleSubmitToCourse()`（997–1068 行）
- 提出系 state（`submitting` / `submitPhase` / `submitDlgOpen` 等）
- 提出ボタン・提出ダイアログ UI（course 指定時のみ表示だが、依存ごと削除）

→ これにより jszip/sonner/@vercel/blob/firebase/next の依存が消え、追加 npm は prismjs/sucrase のみ。

## 7. リブランド範囲（scope-search-rule で全件洗い出し済み）

URL パス `/md-editor` は**維持**（PWA `start_url`・外部リンク・kojinius.jp/md-editor を壊さない）。
表示名のみ「Craftica Editor」へ統一:

| ファイル | 変更 |
|---|---|
| `src/components/Header.tsx:10` | nav label `MD Editor` → `Craftica Editor` |
| `src/data/projects.ts`（カード） | name/description/emoji/stack を Craftica Editor の実機能に更新 |
| `public/md-editor-manifest.json` | name/short_name → Craftica Editor |
| ページ `document.title` | `✏️ MD Editor` → `Craftica Editor` |
| `src/App.tsx` | lazy import 名・route コメント（パスは据置） |

## 8. エラーハンドリング

- ランナー WASM 取得失敗 / オフライン → LoaderMessages が WifiOff 等で通知（既存実装踏襲）。
- localStorage 破損 → try/catch で null フォールバック（既存）。
- File System Access API 非対応ブラウザ → ダウンロード経路にフォールバック（既存）。
- 提出フロー削除に伴い、提出系エラーハンドリングは丸ごと不要化。

## 9. エッジケース

- **空状態**: タブ 0 件時の新規タブ生成（既存）。
- **大量データ**: 大きな Markdown / 長時間ランナー → Worker は terminate 可能（abort 実装済）。
- **同時操作**: 単一ユーザーのブラウザ完結ツールのため競合なし。
- **通信断**: 初回 WASM 取得のみネット必須。取得後はキャッシュ。Markdown/編集はオフライン可（PWA）。

## 10. セキュリティ

- 公開ツール（認証なし）。ユーザー入力は自身のブラウザ内のみで完結、サーバー送信なし。
- ライブプレビューは iframe（sandbox 属性は既存実装に従う）。XSS 面は自分のコードを自分で実行する
  プレイグラウンド性質のため許容範囲（craftica と同条件）。
- 提出フロー削除により firebase 認証・Blob アップロードの攻撃面が消える（縮小方向）。

## 11. UI 仕様

- 全画面シェル（`/md-editor` は kojinius サイトヘッダ無しの独立レイアウト = 既存ルート構成を踏襲）。
- ダークテーマ（Catppuccin 系 literal color、index.tsx `<style>` 内蔵）。レスポンシブは既存実装。

## 12. 移植手順（ファイル単位）

1. `craftica/src/components/crafticaEditor/**` → `kojinius/src/components/crafticaEditor/**`（再帰コピー）
2. `craftica/src/lib/speech.ts` → `kojinius/src/lib/speech.ts`
3. `kojinius/src/components/crafticaEditor/index.tsx`: §6 の提出フロー除去
4. `kojinius` に `prismjs@^1.30.0` / `sucrase@^3.35.1` / `@types/prismjs`(dev) 追加
5. ページ wrapper 作成（`src/pages/CrafticaEditorPage.tsx`）＝ `<CrafticaEditor />` 全画面 + manifest link + title
6. `App.tsx` ルート差し替え（パス維持）、旧 `MdEditor.tsx` 削除
7. §7 リブランド適用

## 13. 検証手順（断定しない・ボスが写経再現可能な形）

1. 他 PJ の dev サーバ稼働を `netstat` で確認（巻き込み防止、test-process ルール）。
2. kojinius を別 port で `npm run dev`、URL バーに `http://localhost:<port>/md-editor` を直接入力。
3. 実ブラウザ（Playwright chromium、クリーンプロファイル）で:
   - Markdown 入力 → プレビュー反映を確認
   - 言語ピッカーで Python 選択 → コード実行 → 出力表示を確認（WASM 取得に数秒）
   - HTML/JS ライブプレビュー iframe 表示を確認
   - タブ追加/保存/localStorage 永続を確認
   - フルページスクショで証跡
4. `npm run build`（`tsc -b && vite build`）成功 = worker/WASM の Vite 解決を確認。
5. preview ビルドで `/md-editor` を実機確認。

## 14. リスク・未検証事項

- **Vite の `.worker.js` + `{type:'module'}` 解決**: 書式は Vite 対応だが、craftica は Next bundler。
  worker 内が module worker で `importScripts` を使う場合 Vite/Next で挙動差の可能性 → ビルド後に
  実ブラウザでランナー実行を確認（§13-3）。NG なら worker 取得方式のみ Vite 流儀へ調整。
- **lucide-react**: kojinius `^1.16.0` / craftica `^1.8.0`（共に v1 系）。使用アイコンは標準のため
  互換想定だが、ビルドで未 export が出たら個別対応。

## 15. リアルタイム翻訳（左=日本語 → 右=英語） ※2026-06-01 追加・ボス要望

> 2026-06-01 claude-opus-4-8[1m] セッションターン数：2
> ボス要望「左ペインに日本語で入力したらリアルタイムで英語に翻訳」。
> **i18n では実現不可**（i18n は固定文言の辞書切替であり、任意入力文は訳せない）→ 機械翻訳(MT)が必須。

### 方式: Chrome 内蔵 Translator API（オンデバイス AI）= ボス選択
kojinius は BE 無しの公開 SPA。クラウド MT（DeepL/Google/LLM）は ①APIキー露出 ②従量課金
③外部送信(PP 対応必須) の三重苦で不採用。Chrome 内蔵 Translator API は端末内完結・無料・キー不要で
要件に合致。

### 裏取り済み仕様（公式 docs / developer.chrome.com/docs/ai/translator-api・2026-06-01 確認）
- グローバル: `Translator`（`'Translator' in self` で feature detect）
- 可用性: `await Translator.availability({ sourceLanguage:'ja', targetLanguage:'en' })`
  → `'available'` | `'downloadable'` | `'after-download'`（複数値を許容判定する）
- 生成: `await Translator.create({ sourceLanguage:'ja', targetLanguage:'en', monitor(m){ m.addEventListener('downloadprogress', e => /* e.loaded: 0..1 */) } })`
- 翻訳: `await translator.translate(text)` / `translator.translateStreaming(text)`（async iterable）
- 対応: Chrome / Edge **138+**・**デスクトップのみ（モバイル不可）**・Safari/Firefox 非対応
- ja/en ペアは対応言語表に記載あり ✓
- secure context（https / localhost）前提。本番 kojinius.jp は https で充足
- ※ 最終的な呼び出し挙動は実装時に実ブラウザ PoC で確認（ハルシネーション防止・断定しない）

### UI 仕様
- `ViewMode` に `'translate'` を追加（既存 `'split'|'editor'|'preview'`）。ビュータブ「🌐 翻訳」（Alt+4）。
- translate モード時: 左=既存エディタ（日本語入力）、右=英語翻訳結果（読み取り専用ペイン）。
- **自動翻訳 ON/OFF トグル**（ボス要望・2026-06-01）: 右ペインヘッダにトグルを配置。
  - ON（既定）: 入力を **500ms デバウンス** → 自動 translate → 右ペイン更新。
  - OFF: 自動翻訳を停止（最後の結果は残す）。右ペインに「今すぐ翻訳」ボタンを出し手動実行。
  - トグル状態は localStorage（`md-editor-autotranslate`）に永続。
- 逐次表示は translateStreaming でも可。

### ステート設計
- `translatorStatus`: `'idle'|'unsupported'|'downloadable'|'downloading'|'ready'|'translating'|'error'`
- `autoTranslate`: boolean（localStorage 永続・既定 true）← ON/OFF トグル
- `downloadPct`: number（モデル DL 進捗 0–100）
- `translatedText`: string
- translator インスタンスは ref 保持・遅延生成（初回翻訳時に create）。アンマウントで `destroy()`。

### エラー / フォールバック
- `'Translator' in self` が false（Safari/Firefox/モバイル/旧 Chrome）→ 右ペインに
  「このブラウザはオンデバイス翻訳に未対応。Chrome / Edge 138+（デスクトップ）でご利用ください」表示。
- availability='downloadable' → 初回 create でモデル DL（進捗バー表示・数十〜数百 MB）。
- translate 例外 → エラー表示 + リトライ導線。

### セキュリティ / 法的
- 入力は端末内処理のみ・**外部送信ゼロ** → PP の外部送信告知は不要（クラウド MT を選ばない最大理由）。

### 型
- `Translator` は TS 標準 lib 未収載 → `src/types/translator.d.ts` に ambient 宣言を追加。

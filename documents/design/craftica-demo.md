# Craftica デモ実装設計書

## 1. 目的
kojinius.jp 内に Craftica の**ログイン不要なインタラクティブデモ**を `/demo/craftica/*` で提供する。
既存の Hiraké / OAS / AMS / Typolish デモと同じ統合方式（MockAuth + mockData + DemoBanner）。

## 2. スコープ（ボス承認済 = フル再現）

| エリア | 含む | 備考 |
|---|---|---|
| 認証 | ログイン画面 | DEV ユーザーカード3種で遷移 |
| ホーム | ダッシュボード | バンクカード一覧 + 主要 KPI 4枚 |
| バンク | バンク詳細（進捗グリッド） | メンバー×課題マトリクス。完了=成果物サムネ、着手中=色付き、未着手=グレー |
| 課題 | 課題詳細 | 進捗ステップ・振り返り編集・成果物カード一覧 |
| AI | チャットモード / プランモード | プリセット応答スクリプト |
| 相談 | 先生に相談（CourseConsult） | 2ペイン（自分の課題一覧 / スレッド） |
| トロフィー | TrophyShelf + TrophyCelebrationModal + CertificateSection | 修了証は擬似 PDF（プレビュー画像） |
| 管理 | AdminSidebar + 準備中ページ | 先生管理 / 課題管理 / ユーザー管理 / 監査ログ / 設定 |

**ロール切替**: admin / manager / member の3ロールをデモバナーから動的切替。
切替時は AdminSidebar の項目可視性と各画面の操作可能性が変わる。

## 3. ファイル構成

```
kojinius/src/demos/craftica/
├── CrafticaDemo.tsx                 # Routes + Theme + MockAuthProvider 統合
├── DemoBanner.tsx                   # ロール切替 + 画面説明
├── MockAuthContext.tsx              # uid/role/displayName/photoColor を保持
├── theme.css                        # data-theme="craftica" 配下に Craftica パレット
├── mockData.ts                      # users / teachers / banks / courses / progress / deliverables / chats
├── types.ts                         # 軽量型（types/index.ts の Craftica 抜粋を簡略化）
├── layout/
│   ├── AppLayout.tsx                # ダッシュボード系の共通レイアウト（ヘッダー）
│   └── AdminSidebar.tsx             # /demo/craftica/dashboard/admin/* 共通サイドバー
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── BankDetailPage.tsx
│   ├── CourseDetailPage.tsx
│   ├── ConsultPage.tsx
│   ├── ChatPage.tsx
│   ├── PlanModePage.tsx
│   └── admin/
│       ├── TeachersPage.tsx
│       ├── CoursesPage.tsx
│       ├── UsersPage.tsx
│       ├── AuditLogsPage.tsx
│       └── SettingsPage.tsx
└── components/
    ├── ProgressGrid.tsx
    ├── DeliverableCard.tsx
    ├── ChatBubble.tsx
    ├── PlanPreviewCard.tsx
    ├── TrophyShelf.tsx
    ├── TrophyCelebrationModal.tsx
    └── CertificateSection.tsx
```

## 4. ルーティング

| パス | 画面 | 認証 |
|---|---|---|
| `/demo/craftica` | LoginPage | 未ログイン |
| `/demo/craftica/dashboard` | DashboardPage（バンク一覧）| ログイン後 |
| `/demo/craftica/dashboard/banks/:bankId` | BankDetailPage（進捗グリッド）| ログイン後 |
| `/demo/craftica/dashboard/banks/:bankId/courses/:courseId` | CourseDetailPage | ログイン後 |
| `/demo/craftica/dashboard/chat` | ChatPage | ログイン後 |
| `/demo/craftica/dashboard/plan` | PlanModePage | manager+ |
| `/demo/craftica/dashboard/consult` | ConsultPage | ログイン後 |
| `/demo/craftica/dashboard/admin/teachers` 〜 `/settings` | 各 admin ページ | manager+（一部 admin only）|

未ログインで `/dashboard/*` に来たら LoginPage にフォールバック。

## 5. MockAuth 仕様

```ts
type Role = 'admin' | 'manager' | 'member'
interface MockUser {
  uid: string
  role: Role
  displayName: string
  email: string
  memberKey: string       // 色決定用
}
const value = {
  user: MockUser | null
  isLoggedIn: boolean
  signIn: (uid: string) => void
  signOut: () => void
  setRole: (r: Role) => void   // デモバナー用
}
```

初期状態は未ログイン。ログインボタンで admin → dashboard。
DemoBanner で「ロール切替」セレクタ（admin/manager/member）。切替で `setRole` を呼び、同時に user.uid を該当プリセット uid に差し替える。

## 6. モックデータ

### Users（5名）
| uid | role | 名前 |
|---|---|---|
| `u-admin` | admin | 管理者 |
| `u-manager` | manager | 橋本 晃治 |
| `u-morimoto` | member | 森本 |
| `u-kataoka` | member | 片岡 |
| `u-shiino` | member | 椎野 |

### Banks（3個）
1. `b-design` 「デザイン基礎バンク」(category: デザイン / 6 courses / memberUids=[森本, 片岡, 椎野])
2. `b-web` 「Web 制作入門バンク」(category: Web 制作 / 5 courses / memberUids=[森本, 片岡])
3. `b-video` 「動画編集スタートバンク」(category: メディア制作 / 4 courses / memberUids=[森本, 椎野])

### Courses（15個 = 6+5+4）
各 course: id / bankId / title / type / difficulty / deliverableSpec / sortOrder。

### Progress（メンバー × コース）
ステータス分布で擬似データ生成: `未着手 / 着手中 / 完了` を sortOrder * memberIdx をシードに決定論的に割当。完了は約45%、着手中15%、未着手40%。

### Deliverables
完了ステータスに対し1件成果物を持たせる。`thumbColor` のグラデと絵文字（COURSE_TYPE_EMOJI 相当）で表現。`/public/deliverables/` は使わずダミー（CSS グラデ + 絵文字）。

### Chat conversations
- Simple Chat: 「Photoshop でリサイズする方法を教えて」プリセット応答1往復
- Plan Mode: 「中学生向けのデザイン課題を5個作って」→ PlanDraft 提示 → 「このバンクを作成」ボタン

### Consult Threads
- 森本 + b-design/c1 課題への相談 1スレッド・5 メッセージ
- 片岡 + b-web/c2 課題への相談 1スレッド・3 メッセージ

## 7. 主要画面の構造

### 7.1 LoginPage
- 中央カード + 背景ブロブ（clay-soft / sun-soft / leaf-soft）
- Google ボタン（飾り、押すと admin として signIn）
- DEV ユーザーカード（admin / manager / member 各 1）
- 「← ポートフォリオに戻る」リンク

### 7.2 DashboardPage（manager+）
- 上段: 挨拶 + タイトル + ボタン2つ（「○月の振り返り」「AIで課題バンクを作る」）
- KPI 4枚: 完了率（leaf） / 今週完了（sun） / 着手中（clay） / AIチャット（sky）
- メンバーロスター（5名） + 最近の動き（リスト）
- 今週の作品（4×grid・サムネ）
- バンクカード一覧（公開/非公開 2セクション）

### 7.2.1 DashboardPage（member）
- メンバー専用ホーム: 「受講中の課題」「受講可能な課題」+ TrophyShelf

### 7.3 BankDetailPage（ProgressGrid）
- ヘッダー: バンク名 / カテゴリ / 課題数 / メンバー数
- グリッド: 行=メンバー、列=課題。セルはステータス色で 80×80px。完了は CSS グラデサムネ + 絵文字。クリックで CourseDetailPage へ。

### 7.4 CourseDetailPage
- ヘッダー: 課題名 + 難易度バッジ + 種類絵文字
- 左カラム: 提出仕様 / メンバー別進捗（状態切替セレクタ・member は自分のみ操作）
- 右カラム: 振り返り編集（goodPoints / improvements / nextActions の3つの textarea）+ 「完了 + 振り返り送信」ボタン → TrophyCelebrationModal 発火（擬似）

### 7.5 ChatPage
- 左サイドバー: 会話履歴（日付グルーピング）+ 「+ 新規」ボタン
- メインエリア: メッセージリスト（user/assistant）+ モデル切替ピル（Sonnet/Opus 飾り）+ 入力欄
- 入力に既定文を入れて Enter で プリセット応答（300ms 待機 → 擬似 streaming → 完了）

### 7.6 PlanModePage
- 同じチャット UI で mode=plan のヘッダー
- 入力に「中学生向け…」と入れて送信 → AI が PlanDraft 形式で応答 → `PlanPreviewCard` 表示 → 「このバンクを作成」 → toast + banks に擬似追加（state のみ）→ ダッシュボードへ遷移

### 7.7 ConsultPage
- 左ペイン: 自分の課題一覧（バンクグルーピング・未読バッジ）
- 右ペイン: 選択した課題の messages リスト + 入力欄（Enter 送信）

### 7.8 Admin 各ページ
- AdminSidebar 共通: 6項目（ダッシュボード/先生管理/課題管理/ユーザー管理/監査ログ/設定）+ admin only divider
- TeachersPage: 4 先生プリセット（優子・金七・滝沢・Boss）の編集 UI（飾り）
- CoursesPage / UsersPage / AuditLogsPage / SettingsPage: UnderConstruction（準備中）プレースホルダ

## 8. テーマ（CSS）

`theme.css` を `data-theme="craftica"` スコープで作成し、Craftica の warm cream パレットを移植:

```css
[data-theme="craftica"] {
  --paper: #FBF8F3;
  --paper-2: #F4EFE6;
  --paper-3: #ECE5D8;
  --ink: #2A2520;
  --ink-2: #5C544A;
  --ink-3: #8C8275;
  --ink-4: #B5AC9E;
  --line: #E5DECF;
  --line-2: #D6CDB8;
  --card: #FFFFFF;
  --clay: #C66B3D;
  --clay-soft: #F5DDD0;
  --clay-deep: #8E4825;
  --leaf: #5B8C5A;
  --leaf-soft: #DCEAD2;
  --sun: #E8B547;
  --sun-soft: #F8EBC8;
  --berry: #B8456A;
  --berry-soft: #F5D9E1;
  --sky: #5388B5;
  --sky-soft: #D7E5F0;
}
```

`CrafticaDemo` のルート div に `data-theme="craftica"` を付与し、配下の inline-style `var(--clay)` などをそのまま流用。

## 9. DemoBanner 仕様
画面下部固定。Hiraké の DemoBanner を踏襲しつつ:
- 左: 「DEMO」バッジ + 画面タイトル
- 中央: 機能の箇条書き
- 右: **ロール切替ピル**（admin / manager / member）+ ポートフォリオへ戻るリンク

ロール切替で画面が再レンダーされる（特に DashboardPage は member 用ホームに切り替わる）。

## 10. エラーハンドリング・エッジケース
- 未ログインで `/dashboard/*` → `/demo/craftica` redirect
- ロール権限なし（member が plan/admin ページ）→ ダッシュボードへ redirect
- 空状態（バンク0 / メンバー0 等）はデモなので発生しないが、空配列を渡しても安全に動くようガード
- AI モックの応答は即時（setTimeout 300ms 程度の擬似ローディング）。失敗パスなし

## 11. セキュリティ
デモはすべてフロントエンド・モック。Firebase 接続なし、API キーなし、PII なし。

## 12. projects.ts 更新

`kojinius/src/data/projects.ts` の Kalenex の次（Typolish の前）にカード追加:

```ts
{
  name: 'Craftica — B型就労支援向け AI研修管理プラットフォーム',
  period: { start: '2026-04-25' },
  description:
    'B型就労継続支援事業所向けの AI 研修プラットフォーム。マネージャーが課題バンクを設計しメンバーに配布、メンバーは AI 講師と対話しながらデザイン・Web・動画制作を学ぶ。完了時にトロフィーと修了証を獲得。Claude API（チャット+プランモード）、fal.ai（画像/動画生成）、Firestore 連携。',
  emoji: '🪴',
  url: '/demo/craftica',
  stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Firebase', 'Claude AI', 'fal.ai', 'Vercel'],
},
```

## 13. App.tsx 更新

```tsx
const CrafticaDemo = lazy(() =>
  import('./demos/craftica/CrafticaDemo').then(m => ({ default: m.CrafticaDemo }))
)
// Routes 内に追加
<Route path="/demo/craftica/*" element={
  <Suspense fallback={<Spinner />}>
    <CrafticaDemo />
  </Suspense>
} />
```

## 14. 受け入れ基準
- [ ] `npm run build` が通る
- [ ] `/demo/craftica` でログイン画面表示
- [ ] DEV ボタン押下 → ダッシュボード遷移
- [ ] DemoBanner からロール切替で画面が切り替わる
- [ ] バンクカード → 進捗グリッド → 課題詳細の遷移成立
- [ ] チャット送信 → 擬似応答到達
- [ ] プランモードで「バンクを作成」を押すと toast + バンク一覧に追加表示
- [ ] member ロールで /admin/* に行くと dashboard へ戻される
- [ ] kojinius カード一覧に Craftica が表示

export interface Project {
  name: string;
  description: string;
  emoji: string;
  url: string;
  stack: string[];
  external?: boolean;
  newTab?: boolean;
  // 2026-04-22 claude-sonnet-4-6 セッションターン数：8
  period?: { start: string; end?: string };
}

export const projects: Project[] = [
  {
    // 2026-05-20 claude-opus-4-7[1m] セッションターン数：3 — B型限定文言を削除（将来他業種展開予定のため汎用化）
    name: 'Craftica — AI研修管理プラットフォーム',
    period: { start: '2026-04-25' },
    description:
      'マネージャーが課題バンクを設計してメンバーに配布、メンバーは AI 講師と対話しながらデザイン・Web・動画制作を学ぶ研修プラットフォーム。完了時に難度別トロフィー（⭐〜⭐⭐⭐）+ バンク完走で修了証 PDF を獲得。Claude API（チャット + プランモード）、fal.ai 画像/動画生成、Firestore リアルタイム連携、3 レイヤー学習 UI（見る/理解する/挑戦する）、先生システム（4 先生プリセット）を搭載。',
    emoji: '🪴',
    url: '/demo/craftica',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Firebase', 'Cloud Functions', 'Claude AI', 'fal.ai', 'Vercel'],
  },
  {
    // 2026-04-22 claude-sonnet-4-6 セッションターン数：1
    name: 'Typolish — ビジュアル校正・プルーフィングツール',
    period: { start: '2026-04-10' },
    description:
      'デザイン・動画・PDF・Officeファイルをアップロードし、ピンポイントの注釈とチャットで校正・承認フローをオンライン完結するプルーフィングSaaS。Cloud RunによるPDF／Office変換、Claude APIビジョンによるAIスペルチェック、Stripe課金、3テーマ対応（Light / Dark / Wireframe）。',
    emoji: '✍️',
    // 2026-04-22 claude-sonnet-4-6 セッションターン数：1
    url: '/demo/typolish',
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS v4', 'Firebase', 'Cloud Run', 'Stripe', 'Claude AI', 'Resend'],
  },
  {
    name: 'KALENEX — ワークマネジメントSaaS',
    period: { start: '2026-03-27', end: '2026-04-22' },
    description:
      'カレンダー・シフト・タスク・日報・メモを一元管理するワークマネジメントプラットフォーム。WorkHubキャンバスでプロジェクト全体を俯瞰し、AIアシスタントがスケジュール調整から文章生成まで支援。Chatwork・Notion連携、申請承認フロー、Stripeサブスクリプション課金を搭載。',
    emoji: '📅',
    url: 'https://kalenex.kojinius.jp',
    stack: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Firebase', 'React Flow', 'dnd-kit', 'TipTap', 'Stripe', 'Claude AI'],
    external: true,
  },
  {
    name: 'Hiraké — デザイナー系ポートフォリオサイト',
    period: { start: '2026-03-26', end: '2026-03-28' },
    description:
      'デザイナー系スタッフの作品を一元管理・公開するポートフォリオプラットフォーム。エディトリアルダーク×アンバーのデザインシステム、FLIP アニメーション、スクロールリビール、PWA 対応。招待リンクによるゲスト認証とロールベースの作品審査フローを備える。',
    emoji: '🎨',
    url: '/demo/hirake',
    stack: ['React 19', 'Vite 6', 'TypeScript', 'Tailwind CSS', 'Firebase Auth', 'Cloud Functions Gen2', 'PWA'],
  },
  {
    name: '医療業界特化型オンライン予約システム',
    period: { start: '2026-03-04', end: '2026-04-11' },
    description:
      '患者が 24 時間予約できる Web アプリ。スタッフ向け管理ダッシュボード・メール通知・PDF出力などを実装。',
    emoji: '🏥',
    url: '/demo/oas',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase', 'Cloud Functions', 'Resend'],
  },
  {
    name: '勤怠管理システム',
    period: { start: '2026-03-09', end: '2026-03-24' },
    description:
      '社員の勤怠打刻・照会・修正・シフト申請をオンラインで完結する業務 Web アプリ。管理者によるユーザー管理・全社員の勤怠検索・シフト承認・CSV／PDF 出力に対応。Firebase Auth のカスタムクレームでロールベースアクセス制御を実装。',
    emoji: '🕐',
    // 2026-04-22 claude-sonnet-4-6 セッションターン数：1
    url: '/demo/ams',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase Auth', 'Firestore', 'Cloud Functions'],
  },
  // 2026-05-04 claude-sonnet-4-6 セッションターン数：1
  {
    name: 'Markdown Editor — ブラウザで動くMDエディタ',
    period: { start: '2026-05-04', end: '2026-05-04' },
    description:
      'インストール不要のブラウザ完結型Markdownエディタ。リアルタイムプレビュー・複数タブ・ファイル保存（File System Access API）・自動保存（localStorage）・チェックボックスリスト・コードブロック・テーブルなどを搭載。PWAとして端末にインストール可能。',
    emoji: '✏️',
    url: '/md-editor',
    newTab: true,
    stack: ['Vanilla JS', 'HTML/CSS', 'marked.js', 'PWA', 'File System Access API'],
  },
  {
    name: '職務経歴書作成ツール',
    period: { start: '2026-03-02', end: '2026-03-04' },
    description:
      'ブラウザだけで動作する日本語職務経歴書メーカー。リアルタイム A4 プレビュー・証明写真ドラッグ＆ドロップ・PDF ダウンロードをサーバー不要で実現。郵便番号からの住所自動入力にも対応。',
    emoji: '📋',
    url: '/cv',
    stack: ['React', 'TypeScript', 'pdf-lib', 'Tailwind CSS'],
  },
  {
    name: '履歴書作成ツール',
    period: { start: '2026-03-02', end: '2026-03-04' },
    description:
      'ブラウザだけで動作する日本語履歴書メーカー。リアルタイム A4 プレビュー・証明写真ドラッグ＆ドロップ・PDF ダウンロードをサーバー不要で実現。',
    emoji: '📄',
    url: '/resume',
    stack: ['React', 'TypeScript', 'pdf-lib', 'Tailwind CSS'],
  },
];

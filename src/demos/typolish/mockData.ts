// 2026-04-22 claude-sonnet-4-6 セッションターン数：1
export const MOCK_USER = {
  uid: 'u1', name: '橋本晃治', email: 'koji@kojinius.jp',
  plan: 'pro' as const, initials: 'KH',
}

export const MOCK_PROJECTS = [
  { id: 'p1', title: 'Kalenex LP リニューアル', description: 'トップページ完全刷新。ヒーロー・料金セクション・CTA',
    proofCount: 4, memberCount: 3, status: 'in_review' as const, updatedAt: '2026-04-20' },
  { id: 'p2', title: '夏キャンペーンバナー', description: 'SNS・Web用バナー一式 6種類',
    proofCount: 6, memberCount: 2, status: 'approved' as const, updatedAt: '2026-04-18' },
  { id: 'p3', title: '採用サイト改修', description: 'エンジニア採用向けデザインリニューアル',
    proofCount: 7, memberCount: 4, status: 'pending' as const, updatedAt: '2026-04-15' },
  { id: 'p4', title: 'アプリ紹介動画', description: 'プロダクト紹介 60秒ショート動画',
    proofCount: 2, memberCount: 2, status: 'in_review' as const, updatedAt: '2026-04-12' },
]

export const MOCK_PROOFS = [
  { id: 'pr1', title: 'LP ヒーロービジュアル', type: 'image' as const,   status: 'in_review' as const, versionCount: 3, commentCount: 4, color: 'from-indigo-500 to-purple-600' },
  { id: 'pr2', title: 'パンフレット PDF',       type: 'pdf' as const,     status: 'pending'  as const, versionCount: 1, commentCount: 2, color: 'from-rose-500 to-pink-600'   },
  { id: 'pr3', title: 'トップページ Web',       type: 'web' as const,     status: 'approved' as const, versionCount: 2, commentCount: 0, color: 'from-sky-500 to-blue-600'    },
  { id: 'pr4', title: 'SNS バナー 1200×630',    type: 'image' as const,   status: 'in_review' as const, versionCount: 1, commentCount: 6, color: 'from-amber-500 to-orange-600'},
]

export const MOCK_ANNOTATIONS = [
  { id: 'a1', type: 'pin',  x: 22, y: 38, color: '#ef4444', resolved: false, commentCount: 2 },
  { id: 'a2', type: 'rect', x: 54, y: 17, w: 28, h: 18, color: '#f59e0b', resolved: false, commentCount: 1 },
  { id: 'a3', type: 'pin',  x: 72, y: 68, color: '#10b981', resolved: true,  commentCount: 1 },
]

export const MOCK_COMMENT_THREADS = [
  { annotationId: 'a1', comments: [
    { id: 'c1', author: '橋本晃治', initials: 'KH', isYou: true,
      body: 'ヒーローのキャッチコピー、フォントが小さすぎます。最低でも48px以上にしてください。', time: '14:30', resolved: false },
    { id: 'c2', author: '田中デザイナー', initials: 'TD', isYou: false,
      body: '承知しました。v4で56pxに修正します。レスポンシブも合わせて対応予定です。', time: '15:02', resolved: false },
  ]},
  { annotationId: 'a2', comments: [
    { id: 'c3', author: '橋本晃治', initials: 'KH', isYou: true,
      body: 'この背景画像、著作権フリーのものに差し替えが必要です。出典を確認してください。', time: '14:31', resolved: false },
  ]},
  { annotationId: 'a3', comments: [
    { id: 'c4', author: '鈴木ディレクター', initials: 'SD', isYou: false,
      body: 'CTAボタンの配色OK！ブランドカラーと一致してます。', time: '10:15', resolved: true },
  ]},
]

export const MOCK_AI_FINDINGS = [
  { id: 'f1', severity: 'error'   as const, type: '誤字', message: '「ビジュアル校正ツーl」— 末尾が「l」になっています', suggestion: 'ツール' },
  { id: 'f2', severity: 'error'   as const, type: '重複語', message: '「ファイルををアップロード」— 「を」が重複しています', suggestion: 'ファイルをアップロード' },
  { id: 'f3', severity: 'warning' as const, type: '句読点', message: '「校正ツール、成果物に」— 読点の位置が不自然です', suggestion: '校正ツール。成果物に' },
  { id: 'f4', severity: 'info'    as const, type: '表記揺れ', message: '「Web」「ウェブ」が混在しています', suggestion: 'Web に統一を推奨' },
]

export const MOCK_VERSIONS = [
  { id: 'v3', label: 'v3 (最新)', uploadedAt: '2026-04-20', uploadedBy: '田中デザイナー', current: true  },
  { id: 'v2', label: 'v2',        uploadedAt: '2026-04-17', uploadedBy: '田中デザイナー', current: false },
  { id: 'v1', label: 'v1',        uploadedAt: '2026-04-10', uploadedBy: '橋本晃治',       current: false },
]

export const PROOF_TYPE_LABELS: Record<string, string> = {
  image: '画像', pdf: 'PDF', web: 'Web', video: '動画', slide: 'スライド', document: '書類',
}

export const STATUS_LABELS: Record<string, string> = {
  pending: '未レビュー', in_review: 'レビュー中', approved: '承認済み', rejected: '差し戻し',
}

export const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-stone-100 text-stone-600',
  in_review: 'bg-amber-100 text-amber-700',
  approved:  'bg-emerald-100 text-emerald-700',
  rejected:  'bg-red-100 text-red-600',
}

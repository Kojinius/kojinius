import type { MemberDoc, WorkDoc, UserDoc, InviteDoc } from './types'

export const MOCK_MY_UID = 'm1'

export interface MemberEntry { id: string; data: MemberDoc }
export interface WorkEntry extends WorkDoc { id: string }
export interface UserEntry { id: string; data: UserDoc }
export interface InviteEntry { id: string; data: InviteDoc }

export const MOCK_MEMBERS: MemberEntry[] = [
  {
    id: 'm1',
    data: {
      name: '山田 花子',
      role: 'Graphic Designer',
      bio: 'ブランドアイデンティティとビジュアルコミュニケーションを専門とする。色と形で物語を語ることが好き。',
      avatar: 'https://picsum.photos/seed/hanako/400/400',
      createdAt: null,
    },
  },
  {
    id: 'm2',
    data: {
      name: '田中 誠',
      role: 'UI/UX Designer',
      bio: 'ユーザー中心設計とプロダクト思考でインターフェースをデザインする。データと感性のバランスを重視。',
      avatar: 'https://picsum.photos/seed/tanaka/400/400',
      createdAt: null,
    },
  },
  {
    id: 'm3',
    data: {
      name: '佐藤 美咲',
      role: 'Illustrator',
      bio: 'デジタルと手描きを組み合わせた独自スタイルで物語性のあるイラストを制作。キャラクターデザインが得意。',
      avatar: 'https://picsum.photos/seed/misaki/400/400',
      createdAt: null,
    },
  },
  {
    id: 'm4',
    data: {
      name: '鈴木 大輔',
      role: 'Motion Designer',
      bio: 'アニメーションと映像制作でブランドに動きと生命を吹き込む。AfterEffectsとCinema4Dを駆使。',
      avatar: 'https://picsum.photos/seed/daisuke/400/400',
      createdAt: null,
    },
  },
  {
    id: 'm5',
    data: {
      name: '伊藤 彩香',
      role: 'Art Director',
      bio: 'チームのクリエイティブ方向性を定め、コンセプトから完成まで一貫したビジョンを持って制作を指揮。',
      avatar: 'https://picsum.photos/seed/ayaka/400/400',
      createdAt: null,
    },
  },
  {
    id: 'm6',
    data: {
      name: '渡辺 拓也',
      role: 'Web Designer',
      bio: 'デザインとフロントエンドの両軸でWebを制作。インタラクションとアクセシビリティを大切にする。',
      avatar: 'https://picsum.photos/seed/takuya/400/400',
      createdAt: null,
    },
  },
  {
    id: 'm7',
    data: {
      name: '小林 莉奈',
      role: 'Brand Designer',
      bio: 'スタートアップから老舗企業まで、ブランドの本質を引き出すアイデンティティデザインを手がける。',
      avatar: 'https://picsum.photos/seed/rina/400/400',
      createdAt: null,
    },
  },
]

export const MOCK_WORKS: Record<string, WorkEntry[]> = {
  m1: [
    { id: 'w1', memberId: 'm1', title: 'ブランドリニューアルプロジェクト', description: '老舗和菓子店のブランドアイデンティティを刷新。伝統と現代性の融合をテーマにしたビジュアルデザイン。', type: 'image', url: 'https://picsum.photos/seed/w1/1200/800', thumbnail: 'https://picsum.photos/seed/w1/800/600', storagePath: null, status: 'published', sortOrder: 0, createdAt: null, updatedAt: null },
    { id: 'w2', memberId: 'm1', title: 'パッケージデザイン：茶葉シリーズ', description: '高級茶葉ブランドの新商品ラインナップ向けパッケージ。和の素材感とミニマルな構成を融合。', type: 'image', url: 'https://picsum.photos/seed/w2/1200/800', thumbnail: 'https://picsum.photos/seed/w2/800/600', storagePath: null, status: 'published', sortOrder: 1, createdAt: null, updatedAt: null },
    { id: 'w3', memberId: 'm1', title: 'ポスターシリーズ：四季', description: '日本の四季をテーマにした展覧会用ポスター4点シリーズ。', type: 'image', url: 'https://picsum.photos/seed/w3/1200/800', thumbnail: 'https://picsum.photos/seed/w3/800/600', storagePath: null, status: 'published', sortOrder: 2, createdAt: null, updatedAt: null },
  ],
  m2: [
    { id: 'w4', memberId: 'm2', title: 'タスク管理アプリのリデザイン', description: 'ユーザーインタビューとヒューリスティック評価に基づいてUIを全面再設計。タスク完了率が32%向上。', type: 'image', url: 'https://picsum.photos/seed/w4/1200/800', thumbnail: 'https://picsum.photos/seed/w4/800/600', storagePath: null, status: 'published', sortOrder: 0, createdAt: null, updatedAt: null },
    { id: 'w5', memberId: 'm2', title: 'デザインシステム構築', description: 'コンポーネントライブラリとトークン設計から始め、デザインと開発の橋渡しとなるシステムを構築。', type: 'website', url: 'https://example.com', thumbnail: 'https://picsum.photos/seed/w5/800/600', storagePath: null, status: 'published', sortOrder: 1, createdAt: null, updatedAt: null },
    { id: 'w6', memberId: 'm2', title: 'ユーザーリサーチレポート', description: '医療DXプロジェクトにおける患者・医師双方の利用体験調査。インタビュー20名・アンケート200名。', type: 'pdf', url: 'https://example.com/report.pdf', thumbnail: null, storagePath: null, status: 'pending', sortOrder: 2, createdAt: null, updatedAt: null },
  ],
  m3: [
    { id: 'w7', memberId: 'm3', title: 'キャラクターデザイン：食の妖精たち', description: '食育教材のためのキャラクター12体。子ども向けにわかりやすく、大人にも愛されるデザイン。', type: 'image', url: 'https://picsum.photos/seed/w7/1200/800', thumbnail: 'https://picsum.photos/seed/w7/800/600', storagePath: null, status: 'published', sortOrder: 0, createdAt: null, updatedAt: null },
    { id: 'w8', memberId: 'm3', title: '絵本「星降る夜に」', description: '自主制作の絵本。テキストとイラストを一人で制作。デジタル×アナログの混在技法。', type: 'image', url: 'https://picsum.photos/seed/w8/1200/800', thumbnail: 'https://picsum.photos/seed/w8/800/600', storagePath: null, status: 'published', sortOrder: 1, createdAt: null, updatedAt: null },
  ],
  m4: [
    { id: 'w9', memberId: 'm4', title: 'プロダクトローンチムービー', description: 'スタートアップの新製品発表に向けた1分のプロモーション映像。コンセプトから撮影・編集まで担当。', type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail: null, storagePath: null, status: 'published', sortOrder: 0, createdAt: null, updatedAt: null },
    { id: 'w10', memberId: 'm4', title: 'UIアニメーション集', description: 'モバイルアプリの画面遷移・マイクロインタラクションを60点制作。Lottieで実装。', type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail: null, storagePath: null, status: 'published', sortOrder: 1, createdAt: null, updatedAt: null },
    { id: 'w11', memberId: 'm4', title: 'ブランドフィルム：暮らしと技', description: '伝統工芸職人へのリスペクトを込めた3分の短編映像。ドキュメンタリー×グラフィックスのハイブリッド表現。', type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail: null, storagePath: null, status: 'published', sortOrder: 2, createdAt: null, updatedAt: null },
  ],
  m5: [
    { id: 'w12', memberId: 'm5', title: 'グローバルキャンペーンディレクション', description: '5か国同時展開のプロダクトキャンペーン。ローカライズとグローバル統一感の両立を指揮。', type: 'image', url: 'https://picsum.photos/seed/w12/1200/800', thumbnail: 'https://picsum.photos/seed/w12/800/600', storagePath: null, status: 'published', sortOrder: 0, createdAt: null, updatedAt: null },
    { id: 'w13', memberId: 'm5', title: '社内クリエイティブガイドライン策定', description: 'チーム20名が参照する社内クリエイティブ基準書を整備。ブランドの一貫性向上に貢献。', type: 'pdf', url: 'https://example.com/guideline.pdf', thumbnail: null, storagePath: null, status: 'published', sortOrder: 1, createdAt: null, updatedAt: null },
  ],
  m6: [
    { id: 'w14', memberId: 'm6', title: 'コーポレートサイトリニューアル', description: '製造業クライアントのコーポレートサイトをフルリニューアル。パフォーマンスとアクセシビリティを重視。', type: 'website', url: 'https://example.com', thumbnail: 'https://picsum.photos/seed/w14/800/600', storagePath: null, status: 'published', sortOrder: 0, createdAt: null, updatedAt: null },
    { id: 'w15', memberId: 'm6', title: 'ECサイト購買体験改善', description: 'A/Bテストと継続的改善でコンバージョン率を18%改善。チェックアウトフローの全面見直し。', type: 'image', url: 'https://picsum.photos/seed/w15/1200/800', thumbnail: 'https://picsum.photos/seed/w15/800/600', storagePath: null, status: 'published', sortOrder: 1, createdAt: null, updatedAt: null },
  ],
  m7: [
    { id: 'w16', memberId: 'm7', title: 'スタートアップVI構築：Lumina', description: 'フィンテックスタートアップのビジュアルアイデンティティをゼロから構築。ロゴ・カラー・タイポグラフィ・グリッド。', type: 'image', url: 'https://picsum.photos/seed/w16/1200/800', thumbnail: 'https://picsum.photos/seed/w16/800/600', storagePath: null, status: 'published', sortOrder: 0, createdAt: null, updatedAt: null },
    { id: 'w17', memberId: 'm7', title: 'ブランドブック：100年企業の再生', description: '創業100年の老舗メーカーのブランド再構築。歴史的資産を活かしながら現代的な解釈を加える。', type: 'pdf', url: 'https://example.com/brandbook.pdf', thumbnail: null, storagePath: null, status: 'published', sortOrder: 1, createdAt: null, updatedAt: null },
    { id: 'w18', memberId: 'm7', title: 'ロゴモーション：3ブランド', description: '異なる業界3社のロゴにモーションを付与。静止画ブランドへの動きの導入。', type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail: null, storagePath: null, status: 'published', sortOrder: 2, createdAt: null, updatedAt: null },
  ],
}

export const MOCK_ALL_WORKS: WorkEntry[] = Object.values(MOCK_WORKS).flat()

export const MOCK_USERS: UserEntry[] = [
  { id: 'm1', data: { displayName: '山田 花子', email: 'm1@hirake.local', role: 'admin',   mustChangePassword: false, createdAt: null } },
  { id: 'm5', data: { displayName: '伊藤 彩香', email: 'm5@hirake.local', role: 'manager', mustChangePassword: false, createdAt: null } },
  { id: 'm2', data: { displayName: '田中 誠',   email: 'm2@hirake.local', role: 'staff',   mustChangePassword: false, createdAt: null } },
  { id: 'm3', data: { displayName: '佐藤 美咲', email: 'm3@hirake.local', role: 'staff',   mustChangePassword: false, createdAt: null } },
  { id: 'm4', data: { displayName: '鈴木 大輔', email: 'm4@hirake.local', role: 'staff',   mustChangePassword: false, createdAt: null } },
  { id: 'm6', data: { displayName: '渡辺 拓也', email: 'm6@hirake.local', role: 'staff',   mustChangePassword: false, createdAt: null } },
  { id: 'm7', data: { displayName: '小林 莉奈', email: 'm7@hirake.local', role: 'guest',   mustChangePassword: false, createdAt: null } },
]

export const MOCK_INVITES: InviteEntry[] = [
  { id: 'inv1', data: { label: 'デザイン部 新メンバー向け', scope: 'guest', expiresAt: '2026-05-01', maxUses: 5, usedCount: 2, revoked: false, createdBy: 'm1', createdAt: '2026-04-01' } },
  { id: 'inv2', data: { label: 'インターン用リンク',         scope: 'guest', expiresAt: '2026-04-30', maxUses: 3, usedCount: 3, revoked: false, createdBy: 'm5', createdAt: '2026-03-20' } },
  { id: 'inv3', data: { label: '旧リンク（無効化済み）',     scope: 'guest', expiresAt: '2026-04-10', maxUses: 1, usedCount: 0, revoked: true,  createdBy: 'm1', createdAt: '2026-03-01' } },
]

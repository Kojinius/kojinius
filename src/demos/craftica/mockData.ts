// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// Craftica デモ用モックデータ — 全てフロントエンドで完結

import type {
  Bank, Course, Progress, Deliverable, Reflection,
  ChatConversation, ConsultThread, Teacher, Trophy, MockUser, Role,
} from './types'
import { colorOf } from './types'

// ─── Users ────────────────────────────────────────────────
export const MOCK_USERS: Record<Role, MockUser> = {
  admin: {
    uid: 'u-admin',
    role: 'admin',
    displayName: '管理者',
    email: 'admin@craftica.local',
    memberKey: 'admin',
    initial: '管',
    color: colorOf('admin'),
  },
  manager: {
    uid: 'u-manager',
    role: 'manager',
    displayName: '橋本 晃治',
    email: 'kojihashimoto@kojinius.jp',
    memberKey: 'manager',
    initial: '橋',
    color: colorOf('manager'),
  },
  member: {
    uid: 'u-morimoto',
    role: 'member',
    displayName: '森本',
    email: 'morimoto@craftica.local',
    memberKey: 'morimoto',
    initial: '森',
    color: colorOf('morimoto'),
  },
}

interface MemberMeta { uid: string; displayName: string; memberKey: string; initial: string }

export const MEMBER_LIST: MemberMeta[] = [
  { uid: 'u-morimoto', displayName: '森本', memberKey: 'morimoto', initial: '森' },
  { uid: 'u-kataoka',  displayName: '片岡', memberKey: 'kataoka',  initial: '片' },
  { uid: 'u-shiino',   displayName: '椎野', memberKey: 'shiino',   initial: '椎' },
  { uid: 'u-oki',      displayName: '大木', memberKey: 'oki',      initial: '大' },
  { uid: 'u-yuyama',   displayName: '湯山', memberKey: 'yuyama',   initial: '湯' },
]

// ─── Teachers ─────────────────────────────────────────────
export const MOCK_TEACHERS: Teacher[] = [
  { id: 'yuko',       name: '優子先生',   tone: '優しくゆっくり',         initial: '優', color: '#D87B9A' },
  { id: 'kinshichi',  name: '金七先生',   tone: '熱血・体育会系',         initial: '金', color: '#E8B547' },
  { id: 'takizawa',   name: '滝沢先生',   tone: 'クールで論理的',         initial: '滝', color: '#5388B5' },
  { id: 'boss',       name: 'ボス先生',   tone: 'プロフェッショナル',     initial: 'ボ', color: '#C66B3D' },
]

// ─── Banks ────────────────────────────────────────────────
export const MOCK_BANKS: Bank[] = [
  {
    id: 'b-design',
    title: 'デザイン基礎バンク',
    description: 'Photoshop / Figma の基礎操作と、デザインの 4 大原則を学ぶ全6課題。',
    category: 'デザイン',
    difficultyLevels: ['初級', '中級'],
    courseCount: 6,
    memberUids: ['u-morimoto', 'u-kataoka', 'u-shiino'],
    isPublic: true,
    notes: '完走時にプラチナトロフィー + 修了証 PDF を獲得',
  },
  {
    id: 'b-web',
    title: 'Web 制作入門バンク',
    description: 'HTML / CSS / JavaScript の基本と、レスポンシブな1枚 LP を作る全5課題。',
    category: 'Web 制作',
    difficultyLevels: ['初級'],
    courseCount: 5,
    memberUids: ['u-morimoto', 'u-kataoka', 'u-oki'],
    isPublic: true,
  },
  {
    id: 'b-video',
    title: '動画編集スタートバンク',
    description: 'CapCut / DaVinci Resolve でカット・テロップ・BGM 付けまでを学ぶ全4課題。',
    category: 'メディア制作',
    difficultyLevels: ['初級'],
    courseCount: 4,
    memberUids: ['u-morimoto', 'u-shiino', 'u-yuyama'],
    isPublic: false,
  },
]

// ─── Courses ──────────────────────────────────────────────
export const MOCK_COURSES: Course[] = [
  // design
  { id: 'c-d1', bankId: 'b-design', title: 'Photoshop で画像をリサイズする',     description: 'カンバスサイズ・画像解像度の違いを理解し、SNS 用に画像を最適サイズへ整える。', difficulty: '初級', type: '画像',     deliverableSpec: '1080×1080 / 1920×1080 / 750×1000 の3サイズ画像', sortOrder: 1 },
  { id: 'c-d2', bankId: 'b-design', title: 'Figma で名刺デザイン',                description: '配色・タイポグラフィ・整列の基本を意識して名刺を1枚作る。',       difficulty: '初級', type: '画像',     deliverableSpec: '91×55mm の表裏 PNG',                     sortOrder: 2 },
  { id: 'c-d3', bankId: 'b-design', title: 'カラーパレットを作る',                description: 'Adobe Color を使い、ブランドに合う5色のパレットを作る。',                    difficulty: '初級', type: 'スライド', deliverableSpec: '5色パレット + 使用例 PPT',                sortOrder: 3 },
  { id: 'c-d4', bankId: 'b-design', title: 'ロゴデザインに挑戦',                  description: 'ヒアリング → アイデアスケッチ → Figma で清書まで一通り経験する。',       difficulty: '中級', type: '画像',     deliverableSpec: 'ロゴ単体 SVG + ガイドライン PDF',          sortOrder: 4 },
  { id: 'c-d5', bankId: 'b-design', title: 'バナー広告制作',                      description: 'ターゲットとオファーを明確にし、Web 広告用バナーを3パターン作る。',     difficulty: '中級', type: '画像',     deliverableSpec: '1200×628 PNG × 3',                       sortOrder: 5 },
  { id: 'c-d6', bankId: 'b-design', title: 'ポートフォリオサイト構成',             description: '自分の強みを軸に、ポートフォリオサイトの IA とワイヤーを Figma で作る。',  difficulty: '中級', type: 'スライド', deliverableSpec: 'Figma ファイル + 構成説明 PDF',            sortOrder: 6 },
  // web
  { id: 'c-w1', bankId: 'b-web',    title: 'HTML の構造を覚える',                description: 'h1〜h6 / p / ul / a など基本要素を使った1ページを作る。',                   difficulty: '初級', type: 'コード',   deliverableSpec: 'index.html 1ファイル',                  sortOrder: 1 },
  { id: 'c-w2', bankId: 'b-web',    title: 'CSS でレイアウトを組む',              description: 'Flexbox を使ってヘッダー / メイン / フッター 3 セクションを組む。',          difficulty: '初級', type: 'コード',   deliverableSpec: 'index.html + style.css',                 sortOrder: 2 },
  { id: 'c-w3', bankId: 'b-web',    title: 'レスポンシブ対応',                   description: 'media query で SP / Tablet / PC の3ブレイクポイントに対応させる。',          difficulty: '初級', type: 'コード',   deliverableSpec: '3デバイスサイズで崩れない LP',           sortOrder: 3 },
  { id: 'c-w4', bankId: 'b-web',    title: 'JavaScript で動きを足す',             description: 'ハンバーガーメニュー・スムーススクロールを実装する。',                        difficulty: '初級', type: 'コード',   deliverableSpec: 'main.js + 動作確認動画',                 sortOrder: 4 },
  { id: 'c-w5', bankId: 'b-web',    title: '完成 LP を Netlify に公開',           description: 'GitHub に push → Netlify 連携で公開 URL を取得する。',                       difficulty: '初級', type: 'Web ページ', deliverableSpec: '公開 URL + リポジトリ URL',              sortOrder: 5 },
  // video
  { id: 'c-v1', bankId: 'b-video',  title: 'CapCut の基本操作',                  description: '素材インポート・カット・並べ替えまでをやってみる。',                          difficulty: '初級', type: '動画',     deliverableSpec: '30秒以内のショート動画 MP4',             sortOrder: 1 },
  { id: 'c-v2', bankId: 'b-video',  title: 'テロップと BGM',                     description: '読みやすいテロップと音量バランスを取った BGM を載せる。',                    difficulty: '初級', type: '動画',     deliverableSpec: 'テロップ・BGM 付き 60 秒動画 MP4',       sortOrder: 2 },
  { id: 'c-v3', bankId: 'b-video',  title: 'Vlog を編集する',                    description: '撮りためた素材で1日 Vlog を作る。',                                          difficulty: '中級', type: '動画',     deliverableSpec: '2〜3 分の Vlog MP4',                      sortOrder: 3 },
  { id: 'c-v4', bankId: 'b-video',  title: 'YouTube Shorts 用に書き出し',         description: '9:16 縦動画として書き出し、サムネ画像も作る。',                              difficulty: '中級', type: '動画',     deliverableSpec: '9:16 60秒動画 + サムネ 1080×1920 PNG',   sortOrder: 4 },
]

// ─── Progress（決定論ジェネレータ）────────────────────────
// status: メンバーインデックス + コース sortOrder の合計を 5 で割って分岐
export const MOCK_PROGRESS: Progress[] = (() => {
  const list: Progress[] = []
  for (const bank of MOCK_BANKS) {
    const courses = MOCK_COURSES.filter(c => c.bankId === bank.id)
    bank.memberUids.forEach((uid, mIdx) => {
      courses.forEach((c) => {
        const seed = (mIdx * 3 + c.sortOrder) % 5
        const status = seed < 2 ? '完了' : seed === 2 ? '着手中' : '未着手'
        list.push({ uid, courseId: c.id, bankId: bank.id, status })
      })
    })
  }
  return list
})()

// ─── Deliverables（完了 progress に紐付く成果物）──────────
export const MOCK_DELIVERABLES: Deliverable[] = MOCK_PROGRESS
  .filter(p => p.status === '完了')
  .map((p, i) => {
    const course = MOCK_COURSES.find(c => c.id === p.courseId)!
    const type = course.type === '動画' ? 'video' as const
      : course.type === '文書' || course.type === 'スライド' || course.type === '表計算' || course.type === 'コード' ? 'pdf' as const
      : 'image' as const
    return {
      id: `dlv-${p.uid}-${p.courseId}`,
      courseId: p.courseId,
      bankId: p.bankId,
      uid: p.uid,
      type,
      caption: `${course.title} の成果物`,
      completedAt: `${5}/${(i % 18) + 1}`,
      thumbColorIdx: (course.sortOrder + i) % 6,
    }
  })

// ─── Reflections ──────────────────────────────────────────
export const MOCK_REFLECTIONS: Reflection[] = MOCK_DELIVERABLES.slice(0, Math.floor(MOCK_DELIVERABLES.length * 0.6)).map(d => ({
  courseId: d.courseId,
  uid: d.uid,
  goodPoints: '思ったより操作に慣れることができた。配色のアドバイスが分かりやすかった。',
  improvements: '余白の取り方をもう少し意識したい。',
  nextActions: '次の課題でも 8px グリッドを意識する。',
}))

// ─── Chat conversations ───────────────────────────────────
export const MOCK_CHATS: ChatConversation[] = [
  {
    id: 'chat-1',
    uid: 'u-morimoto',
    title: 'Photoshop のリサイズ',
    mode: 'chat',
    messages: [
      { id: 'm1', role: 'user',      content: 'Photoshop で画像をリサイズする方法を教えて',                createdAt: Date.now() - 60_000 * 30 },
      { id: 'm2', role: 'assistant', content: 'いいね、3ステップでできるよ。\n\n1. **イメージ → 画像解像度** を開く\n2. 幅・高さの単位を「pixel」にして、目的のサイズを入力\n3. 「再サンプル」のドロップダウンで **バイキュービック（自動）** を選んで OK\n\n大事なポイント: 元画像より大きくすると画質が荒れる。SNS なら 1080×1080 か 1920×1080 にしておけば大体 OK。',
        createdAt: Date.now() - 60_000 * 29 },
      { id: 'm3', role: 'user',      content: 'ありがとう！Instagram のストーリーは？',                  createdAt: Date.now() - 60_000 * 5 },
      { id: 'm4', role: 'assistant', content: 'ストーリーは **1080×1920（9:16 縦長）** が公式推奨だよ。Reels も同じサイズで OK。',
        createdAt: Date.now() - 60_000 * 4 },
    ],
  },
  {
    id: 'chat-2',
    uid: 'u-manager',
    title: '中学生向けデザイン課題（プラン）',
    mode: 'plan',
    messages: [
      { id: 'p1', role: 'user',      content: '中学生向けの「デザインに興味を持つ」最初の5課題を作って',     createdAt: Date.now() - 60_000 * 60 },
      { id: 'p2', role: 'assistant', content: '中学生が「自分の生活に近い」題材から始められる構成にしたよ。Figma も Canva も無料で使えるから、ハードルを下げて好きを伸ばす流れにしてある。',
        createdAt: Date.now() - 60_000 * 59 },
    ],
    planDraft: {
      bankTitle: '中学生のはじめてデザインバンク',
      bankDescription: 'Canva と Figma を行き来しながら、身近な題材でデザインを楽しむ全5課題。',
      difficultyLevels: ['初級'],
      courses: [
        { title: '推しキャラのプロフィールカードを作ろう',  type: '画像',     difficulty: '初級', deliverableSpec: 'A6 サイズの PNG' },
        { title: '学校行事のポスターを作る',                 type: '画像',     difficulty: '初級', deliverableSpec: 'A3 サイズの PDF' },
        { title: 'おしゃれな自己紹介スライド',               type: 'スライド', difficulty: '初級', deliverableSpec: '16:9 スライド 3 枚 PDF' },
        { title: 'YouTube サムネイル',                        type: '画像',     difficulty: '初級', deliverableSpec: '1280×720 PNG' },
        { title: 'お気に入りの曲ジャケットを再デザイン',     type: '画像',     difficulty: '初級', deliverableSpec: '1080×1080 PNG' },
      ],
    },
  },
]

// ─── Consult threads ──────────────────────────────────────
export const MOCK_CONSULTS: ConsultThread[] = [
  {
    id: 't-1',
    memberUid: 'u-morimoto',
    courseId: 'c-d1',
    bankId: 'b-design',
    courseTitle: 'Photoshop で画像をリサイズする',
    bankTitle: 'デザイン基礎バンク',
    messages: [
      { id: 'cm1', uid: 'u-morimoto', text: '解像度の単位が pixel と inch でよく分からなくなります…',  createdAt: Date.now() - 86400_000 * 2 },
      { id: 'cm2', uid: 'u-manager',  text: 'いい質問！Web 用なら **pixel** で固定で OK。inch は印刷のときだけ気にすればいいよ。', createdAt: Date.now() - 86400_000 * 2 + 60_000 * 12 },
      { id: 'cm3', uid: 'u-morimoto', text: 'なるほど、Web 用なら pixel 一択ですね。やってみます！', createdAt: Date.now() - 86400_000 * 1 },
    ],
  },
  {
    id: 't-2',
    memberUid: 'u-kataoka',
    courseId: 'c-w2',
    bankId: 'b-web',
    courseTitle: 'CSS でレイアウトを組む',
    bankTitle: 'Web 制作入門バンク',
    messages: [
      { id: 'cm4', uid: 'u-kataoka', text: 'Flexbox の `justify-content` と `align-items` の使い分けが覚えられません',  createdAt: Date.now() - 86400_000 * 3 },
      { id: 'cm5', uid: 'u-manager', text: '**justify-content = 主軸（横）/ align-items = 交差軸（縦）** と覚えると楽。「親が flex で横並びなら、横は justify、縦は align」だよ。', createdAt: Date.now() - 86400_000 * 3 + 60_000 * 30 },
    ],
  },
]

// ─── Trophies（完了の各バンクで member ごとに獲得想定）────
export const MOCK_TROPHIES_BY_UID: Record<string, Trophy[]> = {
  'u-morimoto': [
    { bankId: 'b-design', bankTitle: 'デザイン基礎バンク',   courseId: 'c-d1', courseTitle: 'Photoshop で画像をリサイズする',     tier: 'gold',   earnedAt: '5/2' },
    { bankId: 'b-design', bankTitle: 'デザイン基礎バンク',   courseId: 'c-d2', courseTitle: 'Figma で名刺デザイン',                tier: 'silver', earnedAt: '5/6' },
    { bankId: 'b-web',    bankTitle: 'Web 制作入門バンク',   courseId: 'c-w1', courseTitle: 'HTML の構造を覚える',                 tier: 'bronze', earnedAt: '5/10' },
  ],
  'u-kataoka': [
    { bankId: 'b-design', bankTitle: 'デザイン基礎バンク',   courseId: 'c-d2', courseTitle: 'Figma で名刺デザイン',                tier: 'silver', earnedAt: '5/9' },
  ],
  'u-shiino': [
    { bankId: 'b-design', bankTitle: 'デザイン基礎バンク',   courseId: 'c-d1', courseTitle: 'Photoshop で画像をリサイズする',     tier: 'bronze', earnedAt: '5/14' },
  ],
}

// ─── Helper ───────────────────────────────────────────────
export function getProgressMap(): Map<string, Progress> {
  const m = new Map<string, Progress>()
  MOCK_PROGRESS.forEach(p => m.set(`${p.uid}-${p.courseId}`, p))
  return m
}

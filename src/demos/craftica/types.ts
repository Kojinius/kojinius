// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// Craftica デモ用の軽量型定義（本体 types/index.ts の Firestore 依存を取り除いた版）

export type Role = 'admin' | 'manager' | 'member'

export interface MockUser {
  uid: string
  role: Role
  displayName: string
  email: string
  memberKey: string
  initial: string
  color: { hex: string; soft: string; deep: string }
}

export type ProgressStatus = '未着手' | '着手中' | '完了'
export type CourseCategory = 'デザイン' | 'メディア制作' | 'Web 制作' | '資料作成' | 'プログラミング'
export type CourseType = '画像' | '動画' | '音声' | '文書' | 'スライド' | '表計算' | 'コード' | 'Web ページ' | 'その他'
export type DeliverableType = 'image' | 'pdf' | 'video'

export interface Bank {
  id: string
  title: string
  description: string
  category: CourseCategory
  difficultyLevels: string[]
  courseCount: number
  memberUids: string[]
  isPublic: boolean
  notes?: string
}

export interface Course {
  id: string
  bankId: string
  title: string
  description: string
  difficulty: string
  type: CourseType
  deliverableSpec: string
  sortOrder: number
}

export interface Progress {
  uid: string
  courseId: string
  bankId: string
  status: ProgressStatus
}

export interface Deliverable {
  id: string
  courseId: string
  bankId: string
  uid: string
  type: DeliverableType
  caption: string
  completedAt: string
  thumbColorIdx: number
}

export interface Reflection {
  courseId: string
  uid: string
  goodPoints: string
  improvements: string
  nextActions: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
}

export interface ChatConversation {
  id: string
  uid: string
  title: string
  mode: 'chat' | 'plan'
  messages: ChatMessage[]
  planDraft?: PlanDraft
}

export interface PlanDraftCourse {
  title: string
  type: CourseType
  difficulty: string
  deliverableSpec: string
}

export interface PlanDraft {
  bankTitle: string
  bankDescription: string
  difficultyLevels: string[]
  courses: PlanDraftCourse[]
}

export interface ConsultMessage {
  id: string
  uid: string
  text: string
  createdAt: number
}

export interface ConsultThread {
  id: string
  memberUid: string
  courseId: string
  bankId: string
  courseTitle: string
  bankTitle: string
  messages: ConsultMessage[]
}

export interface Teacher {
  id: string
  name: string
  tone: string
  initial: string
  color: string
}

export interface Trophy {
  bankId: string
  bankTitle: string
  courseId: string
  courseTitle: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  earnedAt: string
}

export const COURSE_TYPE_EMOJI: Record<CourseType, string> = {
  '画像': '🖼',
  '動画': '🎬',
  '音声': '🎵',
  '文書': '📄',
  'スライド': '📊',
  '表計算': '📈',
  'コード': '💻',
  'Web ページ': '🌐',
  'その他': '📎',
}

export const MEMBER_PALETTE = [
  { hex: '#5B8C5A', soft: '#DCEAD2', deep: '#3D5C3D' },
  { hex: '#C66B3D', soft: '#F5DDD0', deep: '#8E4825' },
  { hex: '#E8B547', soft: '#F8EBC8', deep: '#8B6914' },
  { hex: '#5388B5', soft: '#D7E5F0', deep: '#3D5C7A' },
  { hex: '#B8456A', soft: '#F5D9E1', deep: '#7A2D45' },
  { hex: '#D87B9A', soft: '#F5D9E1', deep: '#8B3D5C' },
] as const

export function colorOf(memberKey: string) {
  let hash = 0
  for (let i = 0; i < memberKey.length; i++) hash = (hash * 31 + memberKey.charCodeAt(i)) | 0
  return MEMBER_PALETTE[Math.abs(hash) % MEMBER_PALETTE.length]
}

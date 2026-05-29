export type Role = 'admin' | 'manager' | 'staff' | 'guest'

export const ROLE_LEVEL: Record<Role, number> = {
  admin:   4,
  manager: 3,
  staff:   2,
  guest:   1,
}

export interface UserDoc {
  displayName: string
  email: string
  role: Role
  mustChangePassword: boolean
  createdAt: unknown
}

export interface MemberDoc {
  name: string
  role: string
  bio: string
  avatar: string
  createdAt: unknown
}

export interface WorkDoc {
  memberId:    string
  title:       string
  description: string
  type:        'image' | 'pdf' | 'video' | 'audio' | 'website'
  url:         string
  thumbnail:   string | null
  storagePath: string | null
  status:      'pending' | 'published'
  sortOrder?:  number
  createdAt:   unknown
  updatedAt:   unknown
}

export interface InviteDoc {
  scope:      string
  expiresAt:  string
  maxUses:    number
  usedCount:  number
  revoked:    boolean
  createdBy:  string
  createdAt:  string
  label:      string
}

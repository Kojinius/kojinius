// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// Craftica デモ用 MockAuth — 未ログイン状態を保持 + ロール切替

import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { MockUser, Role } from './types'
import { MOCK_USERS } from './mockData'

interface MockAuthValue {
  user: MockUser | null
  isLoggedIn: boolean
  signIn: (role: Role) => void
  signOut: () => void
  setRole: (role: Role) => void
}

const Ctx = createContext<MockAuthValue | null>(null)

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null)

  const signIn = useCallback((role: Role) => setUser(MOCK_USERS[role]), [])
  const signOut = useCallback(() => setUser(null), [])
  const setRole = useCallback((role: Role) => setUser(MOCK_USERS[role]), [])

  return (
    <Ctx.Provider value={{ user, isLoggedIn: !!user, signIn, signOut, setRole }}>
      {children}
    </Ctx.Provider>
  )
}

export function useMockAuth(): MockAuthValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useMockAuth must be inside MockAuthProvider')
  return v
}

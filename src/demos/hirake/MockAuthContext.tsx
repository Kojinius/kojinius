import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { Role, UserDoc } from './types'
import { MOCK_MY_UID } from './mockData'

interface MockAuthValue {
  uid:     string
  role:    Role
  userDoc: UserDoc
}

const MockAuthContext = createContext<MockAuthValue | null>(null)

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const value: MockAuthValue = {
    uid:  MOCK_MY_UID,
    role: 'admin',
    userDoc: {
      displayName:        '山田 花子',
      email:              `${MOCK_MY_UID}@hirake.local`,
      role:               'admin',
      mustChangePassword: false,
      createdAt:          null,
    },
  }
  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>
}

export function useMockAuth(): MockAuthValue {
  const ctx = useContext(MockAuthContext)
  if (!ctx) throw new Error('useMockAuth must be inside MockAuthProvider')
  return ctx
}

// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { createContext, useContext, useState } from 'react'
import { SELF, EMPLOYEES } from './mockData'
import type { Employee } from './types'

interface AuthCtx {
  user: Employee
  isAdmin: boolean
  setRole: (r: 'employee' | 'admin') => void
  currentRole: 'employee' | 'admin'
}

const Ctx = createContext<AuthCtx>(null!)
export const useMockAuth = () => useContext(Ctx)

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<'employee' | 'admin'>('employee')

  // admin ロール時は adminフラグをtrueにするが同一ユーザー
  const user: Employee = currentRole === 'admin'
    ? { ...SELF, role: 'admin' }
    : { ...EMPLOYEES[1], role: 'staff' } // staffとしてデモ

  const isAdmin = currentRole === 'admin'

  return (
    <Ctx.Provider value={{ user, isAdmin, setRole: setCurrentRole, currentRole }}>
      {children}
    </Ctx.Provider>
  )
}

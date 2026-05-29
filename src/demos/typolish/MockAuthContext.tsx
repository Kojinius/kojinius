// 2026-04-22 claude-sonnet-4-6 セッションターン数：1
import { createContext, useContext, useState } from 'react'
import { MOCK_USER } from './mockData'

type Theme = 'light' | 'dark' | 'wire'

interface Ctx {
  user: typeof MOCK_USER
  theme: Theme
  setTheme: (t: Theme) => void
}

const Context = createContext<Ctx>(null!)
export const useMockAuth = () => useContext(Context)

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  return (
    <Context.Provider value={{ user: MOCK_USER, theme, setTheme }}>
      {children}
    </Context.Provider>
  )
}

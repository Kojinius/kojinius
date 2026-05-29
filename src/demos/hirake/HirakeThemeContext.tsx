import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface HirakeThemeValue {
  isDark:      boolean
  toggleTheme: () => void
}

const HirakeThemeContext = createContext<HirakeThemeValue | null>(null)

export function HirakeThemeProvider({ children, wrapperRef }: {
  children:   ReactNode
  wrapperRef: React.RefObject<HTMLDivElement | null>
}) {
  const [isDark, setIsDark] = useState(true)

  const toggleTheme = () => {
    setIsDark(v => {
      const next = !v
      if (wrapperRef.current) {
        wrapperRef.current.classList.toggle('light', !next)
      }
      return next
    })
  }

  return (
    <HirakeThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </HirakeThemeContext.Provider>
  )
}

export function useHirakeTheme(): HirakeThemeValue {
  const ctx = useContext(HirakeThemeContext)
  if (!ctx) throw new Error('useHirakeTheme must be inside HirakeThemeProvider')
  return ctx
}

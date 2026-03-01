'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('dasta-theme')
    if (stored === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('dark')
        window.localStorage.setItem('dasta-theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        window.localStorage.setItem('dasta-theme', 'light')
      }
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

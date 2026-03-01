'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { User, Company, Branch } from '@/lib/types'
import { MOCK_USER, MOCK_COMPANY, MOCK_BRANCHES } from '@/lib/mock-data'

interface AuthContextType {
  user: User | null
  company: Company | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (data: { email: string; password: string; fullName: string; companyName: string; branchName: string }) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_USER)
  const [company, setCompany] = useState<Company | null>(MOCK_COMPANY)

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Mock login - always succeeds
    setUser({ ...MOCK_USER, email })
    setCompany(MOCK_COMPANY)
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setCompany(null)
  }, [])

  const register = useCallback(async (_data: { email: string; password: string; fullName: string; companyName: string; branchName: string }): Promise<boolean> => {
    setUser(MOCK_USER)
    setCompany(MOCK_COMPANY)
    return true
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      company,
      isAuthenticated: !!user,
      login,
      logout,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

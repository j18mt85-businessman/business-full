'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { User, Company } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  company: Company | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (data: {
    email: string
    password: string
    fullName: string
    companyName: string
    branchName: string
    taxId?: string
    companyAddress?: string
    companyPhone?: string
    branchAddress?: string
    branchPhone?: string
  }) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapSupabaseUser(supabaseUser: SupabaseUser, profile: Record<string, unknown> | null): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    fullName: (profile?.full_name as string) || supabaseUser.user_metadata?.full_name || supabaseUser.email || '',
    role: (profile?.role as User['role']) || 'owner',
    companyId: (profile?.company_id as string) || '',
    branchIds: (profile?.branch_ids as string[]) || [],
    avatar: (profile?.avatar_url as string) || undefined,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Load user profile and company data from Supabase
  const loadUserData = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      // Try to load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      const mappedUser = mapSupabaseUser(supabaseUser, profile)
      setUser(mappedUser)

      // Load company if profile has company_id
      if (profile?.company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single()

        if (companyData) {
          setCompany({
            id: companyData.id,
            name: companyData.name,
            taxId: companyData.tax_id || '',
            address: companyData.address || '',
            phone: companyData.phone || '',
            email: companyData.email || '',
            plan: companyData.plan || 'free',
            createdAt: companyData.created_at,
          })
        }
      } else {
        // If no company_id in profile, try to find company by user metadata
        setCompany(null)
      }
    } catch {
      // If profile table doesn't exist yet or other error, create a basic user from auth data
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        fullName: supabaseUser.user_metadata?.full_name || supabaseUser.email || '',
        role: 'owner',
        companyId: '',
        branchIds: [],
      })
      setCompany(null)
    }
  }, [supabase])

  // Check initial session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()
        if (supabaseUser) {
          await loadUserData(supabaseUser)
        }
      } catch {
        // No session
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setCompany(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, loadUserData])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      throw new Error(error.message)
    }
    return true
  }, [supabase])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setCompany(null)
  }, [supabase])

  const register = useCallback(async (data: {
    email: string
    password: string
    fullName: string
    companyName: string
    branchName: string
    taxId?: string
    companyAddress?: string
    companyPhone?: string
    branchAddress?: string
    branchPhone?: string
  }): Promise<boolean> => {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: data.fullName,
          company_name: data.companyName,
          branch_name: data.branchName,
          tax_id: data.taxId || '',
          company_address: data.companyAddress || '',
          company_phone: data.companyPhone || '',
          branch_address: data.branchAddress || '',
          branch_phone: data.branchPhone || '',
        },
      },
    })

    if (authError) {
      throw new Error(authError.message)
    }

    // If the user is immediately confirmed (e.g., email confirmation is disabled)
    // we can create the company and branch records
    if (authData.user && authData.session) {
      try {
        // Create company
        const { data: companyRecord, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: data.companyName,
            tax_id: data.taxId || null,
            address: data.companyAddress || null,
            phone: data.companyPhone || null,
            email: data.email,
            plan: 'free',
          })
          .select()
          .single()

        if (companyError) throw companyError

        // Create branch
        const { data: branchRecord, error: branchError } = await supabase
          .from('branches')
          .insert({
            company_id: companyRecord.id,
            name: data.branchName,
            address: data.branchAddress || null,
            phone: data.branchPhone || null,
            is_active: true,
          })
          .select()
          .single()

        if (branchError) throw branchError

        // Update or create profile with company_id and branch_ids
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            full_name: data.fullName,
            role: 'owner',
            company_id: companyRecord.id,
            branch_ids: [branchRecord.id],
          })

        if (profileError) throw profileError
      } catch (err) {
        console.error('Error creating company/branch/profile:', err)
        // Auth signup succeeded but data creation failed
        // User can still log in and we can retry later
      }
    }

    return true
  }, [supabase])

  return (
    <AuthContext.Provider value={{
      user,
      company,
      isAuthenticated: !!user,
      loading,
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

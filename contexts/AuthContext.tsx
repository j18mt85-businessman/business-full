'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as AppUser, Company, Branch } from '@/lib/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthContextType {
  user: AppUser | null
  company: Company | null
  branches: Branch[]
  isAuthenticated: boolean
  isLoading: boolean
  supabaseUser: SupabaseUser | null
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  const fetchProfile = useCallback(async (authUser: SupabaseUser) => {
    try {
      // Get profile with company
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, companies(*)')
        .eq('id', authUser.id)
        .single()

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError)
        setUser(null)
        setCompany(null)
        setBranches([])
        return
      }

      // Get user's branches via profile_branches join
      const { data: profileBranches } = await supabase
        .from('profile_branches')
        .select('branch_id')
        .eq('profile_id', authUser.id)

      const branchIds = profileBranches?.map(pb => pb.branch_id) || []

      // Get full branch objects
      const { data: branchData } = await supabase
        .from('branches')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      const mappedBranches: Branch[] = (branchData || []).map(b => ({
        id: b.id,
        companyId: b.company_id,
        name: b.name,
        address: b.address || '',
        phone: b.phone || '',
        isActive: b.is_active,
      }))

      const comp = profile.companies as Record<string, unknown>
      const mappedCompany: Company = {
        id: comp.id as string,
        name: comp.name as string,
        taxId: (comp.tax_id as string) || '',
        address: (comp.address as string) || '',
        phone: (comp.phone as string) || '',
        email: (comp.email as string) || '',
        plan: comp.plan as Company['plan'],
        createdAt: comp.created_at as string,
      }

      const mappedUser: AppUser = {
        id: profile.id,
        email: profile.email || authUser.email || '',
        fullName: profile.full_name || '',
        role: profile.role,
        companyId: profile.company_id,
        branchIds,
        avatar: profile.avatar_url || undefined,
      }

      setUser(mappedUser)
      setCompany(mappedCompany)
      setBranches(mappedBranches)
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }, [supabase])

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      setSupabaseUser(authUser)
      if (authUser) {
        fetchProfile(authUser).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const authUser = session?.user ?? null
        setSupabaseUser(authUser)
        if (authUser) {
          await fetchProfile(authUser)
        } else {
          setUser(null)
          setCompany(null)
          setBranches([])
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile, supabase.auth])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setCompany(null)
    setBranches([])
    setSupabaseUser(null)
  }, [supabase.auth])

  const refreshProfile = useCallback(async () => {
    if (supabaseUser) {
      await fetchProfile(supabaseUser)
    }
  }, [supabaseUser, fetchProfile])

  return (
    <AuthContext.Provider value={{
      user,
      company,
      branches,
      isAuthenticated: !!user,
      isLoading,
      supabaseUser,
      logout,
      refreshProfile,
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

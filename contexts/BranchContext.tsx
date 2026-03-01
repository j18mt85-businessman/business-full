'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Branch } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

interface BranchContextType {
  branches: Branch[]
  currentBranch: Branch
  setCurrentBranch: (branch: Branch) => void
  getBranch: (id: string) => Branch | undefined
  loading: boolean
}

const BranchContext = createContext<BranchContextType | undefined>(undefined)

const DEFAULT_BRANCH: Branch = {
  id: 'loading',
  companyId: '',
  name: 'Loading...',
  address: '',
  phone: '',
  isActive: true,
}

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const { user, company } = useAuth()
  const [branches, setBranches] = useState<Branch[]>([])
  const [currentBranch, setCurrentBranch] = useState<Branch>(DEFAULT_BRANCH)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!company?.id) {
      setLoading(false)
      return
    }

    const fetchBranches = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('*')
          .eq('company_id', company.id)
          .order('name')

        if (error) throw error

        if (data && data.length > 0) {
          const mapped: Branch[] = data.map(b => ({
            id: b.id,
            companyId: b.company_id,
            name: b.name,
            address: b.address || '',
            phone: b.phone || '',
            isActive: b.is_active ?? true,
          }))

          setBranches(mapped)

          // Set current branch based on user's branch_ids or first available
          const userBranchId = user?.branchIds?.[0]
          const matchedBranch = userBranchId
            ? mapped.find(b => b.id === userBranchId)
            : undefined

          setCurrentBranch(matchedBranch || mapped[0])
        }
      } catch (err) {
        console.error('Error fetching branches:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [company?.id, user?.branchIds, supabase])

  const getBranch = useCallback((id: string) => branches.find(b => b.id === id), [branches])

  return (
    <BranchContext.Provider value={{ branches, currentBranch, setCurrentBranch, getBranch, loading }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const ctx = useContext(BranchContext)
  if (!ctx) throw new Error('useBranch must be used within BranchProvider')
  return ctx
}

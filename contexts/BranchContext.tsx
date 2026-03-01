'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Branch } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useParams } from 'next/navigation'

interface BranchContextType {
  branches: Branch[]
  currentBranch: Branch
  setCurrentBranch: (branch: Branch) => void
  getBranch: (id: string) => Branch | undefined
  isLoading: boolean
}

const FALLBACK_BRANCH: Branch = {
  id: 'loading',
  companyId: '',
  name: 'იტვირთება...',
  address: '',
  phone: '',
  isActive: true,
}

const BranchContext = createContext<BranchContextType | undefined>(undefined)

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const { branches: authBranches, isLoading: authLoading } = useAuth()
  const params = useParams()
  const branchIdFromUrl = params?.branchId as string | undefined

  const [currentBranch, setCurrentBranch] = useState<Branch>(FALLBACK_BRANCH)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (authBranches.length > 0) {
      // Try to match URL branch, otherwise use first
      const matched = branchIdFromUrl
        ? authBranches.find(b => b.id === branchIdFromUrl)
        : undefined
      setCurrentBranch(matched || authBranches[0])
    }
    setIsLoading(false)
  }, [authBranches, authLoading, branchIdFromUrl])

  const getBranch = useCallback(
    (id: string) => authBranches.find(b => b.id === id),
    [authBranches]
  )

  return (
    <BranchContext.Provider value={{
      branches: authBranches,
      currentBranch,
      setCurrentBranch,
      getBranch,
      isLoading,
    }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const ctx = useContext(BranchContext)
  if (!ctx) throw new Error('useBranch must be used within BranchProvider')
  return ctx
}

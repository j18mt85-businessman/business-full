'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Branch } from '@/lib/types'
import { MOCK_BRANCHES } from '@/lib/mock-data'

interface BranchContextType {
  branches: Branch[]
  currentBranch: Branch
  setCurrentBranch: (branch: Branch) => void
  getBranch: (id: string) => Branch | undefined
}

const BranchContext = createContext<BranchContextType | undefined>(undefined)

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches] = useState<Branch[]>(MOCK_BRANCHES)
  const [currentBranch, setCurrentBranch] = useState<Branch>(MOCK_BRANCHES[0])

  const getBranch = useCallback((id: string) => branches.find(b => b.id === id), [branches])

  return (
    <BranchContext.Provider value={{ branches, currentBranch, setCurrentBranch, getBranch }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const ctx = useContext(BranchContext)
  if (!ctx) throw new Error('useBranch must be used within BranchProvider')
  return ctx
}

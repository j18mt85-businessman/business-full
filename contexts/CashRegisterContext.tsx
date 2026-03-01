'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { CashSession, CashMovement } from '@/lib/types'
import { MOCK_CASH_SESSION } from '@/lib/mock-data'
import { generateId } from '@/lib/utils'

interface CashRegisterContextType {
  currentSession: CashSession | null
  pastSessions: CashSession[]
  openSession: (openingBalance: number) => void
  closeSession: (closingBalance: number, note?: string) => void
  addMovement: (type: 'in' | 'out', amount: number, reason: string) => void
}

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined)

export function CashRegisterProvider({ children }: { children: React.ReactNode }) {
  const [currentSession, setCurrentSession] = useState<CashSession | null>(MOCK_CASH_SESSION)
  const [pastSessions, setPastSessions] = useState<CashSession[]>([])

  const openSession = useCallback((openingBalance: number) => {
    const session: CashSession = {
      id: generateId('session'),
      branchId: 'branch-1',
      cashierId: 'user-1',
      cashierName: 'გიორგი ბერიძე',
      openingBalance,
      totalSales: 0,
      totalCash: 0,
      totalCard: 0,
      totalTransfer: 0,
      salesCount: 0,
      movements: [],
      status: 'open',
      openedAt: new Date().toISOString(),
    }
    setCurrentSession(session)
  }, [])

  const closeSession = useCallback((closingBalance: number, note?: string) => {
    if (!currentSession) return
    const movementsNet = currentSession.movements.reduce((sum, m) => sum + (m.type === 'in' ? m.amount : -m.amount), 0)
    const expectedBalance = currentSession.openingBalance + currentSession.totalCash + movementsNet
    const closed: CashSession = {
      ...currentSession,
      closingBalance,
      expectedBalance,
      difference: closingBalance - expectedBalance,
      status: 'closed',
      closedAt: new Date().toISOString(),
      note,
    }
    setPastSessions(prev => [closed, ...prev])
    setCurrentSession(null)
  }, [currentSession])

  const addMovement = useCallback((type: 'in' | 'out', amount: number, reason: string) => {
    if (!currentSession) return
    const movement: CashMovement = {
      id: generateId('mov'),
      sessionId: currentSession.id,
      type,
      amount,
      reason,
      createdAt: new Date().toISOString(),
    }
    setCurrentSession(prev => prev ? { ...prev, movements: [...prev.movements, movement] } : null)
  }, [currentSession])

  return (
    <CashRegisterContext.Provider value={{ currentSession, pastSessions, openSession, closeSession, addMovement }}>
      {children}
    </CashRegisterContext.Provider>
  )
}

export function useCashRegister() {
  const ctx = useContext(CashRegisterContext)
  if (!ctx) throw new Error('useCashRegister must be used within CashRegisterProvider')
  return ctx
}

'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { CashSession, CashMovement } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useBranch } from '@/contexts/BranchContext'
import { useAuth } from '@/contexts/AuthContext'

interface CashRegisterContextType {
  currentSession: CashSession | null
  pastSessions: CashSession[]
  isLoading: boolean
  openSession: (openingBalance: number) => Promise<void>
  closeSession: (closingBalance: number, note?: string) => Promise<void>
  addMovement: (type: 'in' | 'out', amount: number, reason: string) => Promise<void>
  refreshSessions: () => Promise<void>
}

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined)

export function CashRegisterProvider({ children }: { children: React.ReactNode }) {
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null)
  const [pastSessions, setPastSessions] = useState<CashSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { currentBranch } = useBranch()
  const { user, isAuthenticated } = useAuth()
  const supabase = createClient()

  const fetchSessions = useCallback(async () => {
    if (!currentBranch?.id || currentBranch.id === 'loading') return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('cash_sessions')
        .select('*, cash_movements(*)')
        .eq('branch_id', currentBranch.id)
        .order('opened_at', { ascending: false })
        .limit(50)

      if (error) { console.error('Sessions fetch error:', error); return }

      const mapped = (data || []).map(s => ({
        id: s.id,
        branchId: s.branch_id,
        cashierId: s.opened_by,
        cashierName: '',
        openingBalance: Number(s.opening_amount),
        closingBalance: s.closing_amount ? Number(s.closing_amount) : undefined,
        expectedBalance: s.expected_amount ? Number(s.expected_amount) : undefined,
        difference: s.difference ? Number(s.difference) : undefined,
        totalSales: 0,
        totalCash: 0,
        totalCard: 0,
        totalTransfer: 0,
        salesCount: 0,
        movements: ((s.cash_movements || []) as Record<string, unknown>[]).map(m => ({
          id: m.id as string,
          sessionId: m.session_id as string,
          type: (m.type as string) === 'deposit' || (m.type as string) === 'sale' ? 'in' as const : 'out' as const,
          amount: Number(m.amount),
          reason: (m.description as string) || '',
          createdAt: m.created_at as string,
        })),
        status: s.status as 'open' | 'closed',
        openedAt: s.opened_at,
        closedAt: s.closed_at || undefined,
        note: s.notes || undefined,
      }))

      const open = mapped.find(s => s.status === 'open') || null
      const closed = mapped.filter(s => s.status === 'closed')
      setCurrentSession(open)
      setPastSessions(closed)
    } finally {
      setIsLoading(false)
    }
  }, [currentBranch?.id, supabase])

  useEffect(() => {
    if (isAuthenticated) fetchSessions()
  }, [isAuthenticated, fetchSessions])

  const openSession = useCallback(async (openingBalance: number) => {
    const { data, error } = await supabase
      .from('cash_sessions')
      .insert({
        branch_id: currentBranch.id,
        opened_by: user!.id,
        opening_amount: openingBalance,
        status: 'open',
      })
      .select()
      .single()

    if (error || !data) {
      console.error('Open session error:', error)
      throw error || new Error('Failed to open session')
    }

    setCurrentSession({
      id: data.id,
      branchId: data.branch_id,
      cashierId: user!.id,
      cashierName: user!.fullName,
      openingBalance,
      totalSales: 0, totalCash: 0, totalCard: 0, totalTransfer: 0, salesCount: 0,
      movements: [],
      status: 'open',
      openedAt: data.opened_at,
    })
  }, [currentBranch?.id, user, supabase])

  const closeSession = useCallback(async (closingBalance: number, note?: string) => {
    if (!currentSession) return
    const movementsNet = currentSession.movements.reduce(
      (sum, m) => sum + (m.type === 'in' ? m.amount : -m.amount), 0
    )
    const expectedBalance = currentSession.openingBalance + currentSession.totalCash + movementsNet

    const { error } = await supabase
      .from('cash_sessions')
      .update({
        closed_by: user!.id,
        closing_amount: closingBalance,
        expected_amount: expectedBalance,
        difference: closingBalance - expectedBalance,
        status: 'closed',
        closed_at: new Date().toISOString(),
        notes: note || null,
      })
      .eq('id', currentSession.id)

    if (error) { console.error('Close session error:', error); throw error }

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
  }, [currentSession, user, supabase])

  const addMovement = useCallback(async (type: 'in' | 'out', amount: number, reason: string) => {
    if (!currentSession) return
    const dbType = type === 'in' ? 'deposit' : 'withdrawal'

    const { data, error } = await supabase
      .from('cash_movements')
      .insert({
        session_id: currentSession.id,
        type: dbType,
        amount,
        description: reason,
        created_by: user!.id,
      })
      .select()
      .single()

    if (error || !data) {
      console.error('Add movement error:', error)
      throw error || new Error('Failed to add movement')
    }

    const movement: CashMovement = {
      id: data.id,
      sessionId: currentSession.id,
      type,
      amount,
      reason,
      createdAt: data.created_at,
    }
    setCurrentSession(prev => prev ? { ...prev, movements: [...prev.movements, movement] } : null)
  }, [currentSession, user, supabase])

  return (
    <CashRegisterContext.Provider value={{
      currentSession, pastSessions, isLoading,
      openSession, closeSession, addMovement, refreshSessions: fetchSessions,
    }}>
      {children}
    </CashRegisterContext.Provider>
  )
}

export function useCashRegister() {
  const ctx = useContext(CashRegisterContext)
  if (!ctx) throw new Error('useCashRegister must be used within CashRegisterProvider')
  return ctx
}

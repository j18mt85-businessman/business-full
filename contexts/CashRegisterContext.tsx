'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { CashSession, CashMovement } from '@/lib/types'
import { useBranch } from '@/contexts/BranchContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

interface CashRegisterContextType {
  currentSession: CashSession | null
  pastSessions: CashSession[]
  loading: boolean
  openSession: (openingBalance: number) => void
  closeSession: (closingBalance: number, note?: string) => void
  addMovement: (type: 'in' | 'out', amount: number, reason: string) => void
}

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined)

export function CashRegisterProvider({ children }: { children: React.ReactNode }) {
  const { currentBranch } = useBranch()
  const { user } = useAuth()
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null)
  const [pastSessions, setPastSessions] = useState<CashSession[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Fetch sessions for current branch
  useEffect(() => {
    if (!currentBranch?.id || currentBranch.id === 'loading') return

    const fetchSessions = async () => {
      setLoading(true)
      try {
        // Fetch open session
        const { data: openSession } = await supabase
          .from('cash_sessions')
          .select('*, cash_movements(*)')
          .eq('branch_id', currentBranch.id)
          .eq('status', 'open')
          .order('opened_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (openSession) {
          setCurrentSession(mapSession(openSession))
        } else {
          setCurrentSession(null)
        }

        // Fetch past closed sessions
        const { data: closedSessions } = await supabase
          .from('cash_sessions')
          .select('*, cash_movements(*)')
          .eq('branch_id', currentBranch.id)
          .eq('status', 'closed')
          .order('closed_at', { ascending: false })
          .limit(50)

        if (closedSessions) {
          setPastSessions(closedSessions.map(mapSession))
        }
      } catch (err) {
        console.error('Error fetching cash sessions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [currentBranch?.id, supabase])

  function mapSession(s: Record<string, unknown>): CashSession {
    const movements = Array.isArray(s.cash_movements)
      ? (s.cash_movements as Record<string, unknown>[]).map(m => ({
          id: m.id as string,
          sessionId: m.session_id as string,
          type: m.type as 'in' | 'out',
          amount: Number(m.amount) || 0,
          reason: (m.reason as string) || '',
          createdAt: m.created_at as string,
        }))
      : []

    return {
      id: s.id as string,
      branchId: s.branch_id as string,
      cashierId: (s.cashier_id as string) || '',
      cashierName: (s.cashier_name as string) || '',
      openingBalance: Number(s.opening_balance) || 0,
      closingBalance: s.closing_balance != null ? Number(s.closing_balance) : undefined,
      expectedBalance: s.expected_balance != null ? Number(s.expected_balance) : undefined,
      difference: s.difference != null ? Number(s.difference) : undefined,
      totalSales: Number(s.total_sales) || 0,
      totalCash: Number(s.total_cash) || 0,
      totalCard: Number(s.total_card) || 0,
      totalTransfer: Number(s.total_transfer) || 0,
      salesCount: Number(s.sales_count) || 0,
      movements,
      status: (s.status as 'open' | 'closed') || 'closed',
      openedAt: s.opened_at as string,
      closedAt: (s.closed_at as string) || undefined,
      note: (s.note as string) || undefined,
    }
  }

  const openSession = useCallback(async (openingBalance: number) => {
    try {
      const { data, error } = await supabase
        .from('cash_sessions')
        .insert({
          branch_id: currentBranch.id,
          cashier_id: user?.id || null,
          cashier_name: user?.fullName || '',
          opening_balance: openingBalance,
          total_sales: 0,
          total_cash: 0,
          total_card: 0,
          total_transfer: 0,
          sales_count: 0,
          status: 'open',
          opened_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setCurrentSession({
          id: data.id,
          branchId: data.branch_id,
          cashierId: data.cashier_id || '',
          cashierName: data.cashier_name || '',
          openingBalance: Number(data.opening_balance),
          totalSales: 0,
          totalCash: 0,
          totalCard: 0,
          totalTransfer: 0,
          salesCount: 0,
          movements: [],
          status: 'open',
          openedAt: data.opened_at,
        })
      }
    } catch (err) {
      console.error('Error opening session:', err)
    }
  }, [currentBranch.id, user, supabase])

  const closeSession = useCallback(async (closingBalance: number, note?: string) => {
    if (!currentSession) return

    const movementsNet = currentSession.movements.reduce(
      (sum, m) => sum + (m.type === 'in' ? m.amount : -m.amount), 0
    )
    const expectedBalance = currentSession.openingBalance + currentSession.totalCash + movementsNet

    try {
      const { error } = await supabase
        .from('cash_sessions')
        .update({
          closing_balance: closingBalance,
          expected_balance: expectedBalance,
          difference: closingBalance - expectedBalance,
          status: 'closed',
          closed_at: new Date().toISOString(),
          note: note || null,
        })
        .eq('id', currentSession.id)

      if (error) throw error

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
    } catch (err) {
      console.error('Error closing session:', err)
    }
  }, [currentSession, supabase])

  const addMovement = useCallback(async (type: 'in' | 'out', amount: number, reason: string) => {
    if (!currentSession) return

    try {
      const { data, error } = await supabase
        .from('cash_movements')
        .insert({
          session_id: currentSession.id,
          type,
          amount,
          reason,
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        const movement: CashMovement = {
          id: data.id,
          sessionId: data.session_id,
          type: data.type,
          amount: Number(data.amount),
          reason: data.reason || '',
          createdAt: data.created_at,
        }
        setCurrentSession(prev =>
          prev ? { ...prev, movements: [...prev.movements, movement] } : null
        )
      }
    } catch (err) {
      console.error('Error adding movement:', err)
    }
  }, [currentSession, supabase])

  return (
    <CashRegisterContext.Provider value={{ currentSession, pastSessions, loading, openSession, closeSession, addMovement }}>
      {children}
    </CashRegisterContext.Provider>
  )
}

export function useCashRegister() {
  const ctx = useContext(CashRegisterContext)
  if (!ctx) throw new Error('useCashRegister must be used within CashRegisterProvider')
  return ctx
}

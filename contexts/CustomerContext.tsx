'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Customer } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useBranch } from '@/contexts/BranchContext'
import { useAuth } from '@/contexts/AuthContext'

interface CustomerContextType {
  customers: Customer[]
  isLoading: boolean
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'totalPurchases' | 'totalSpent'>) => Promise<void>
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  getCustomer: (id: string) => Customer | undefined
  refreshCustomers: () => Promise<void>
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { currentBranch } = useBranch()
  const { isAuthenticated } = useAuth()
  const supabase = createClient()

  const fetchCustomers = useCallback(async () => {
    if (!currentBranch?.id || currentBranch.id === 'loading') return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .order('name')

      if (error) { console.error('Customers fetch error:', error); return }

      setCustomers((data || []).map(c => ({
        id: c.id,
        fullName: c.name,
        phone: c.phone || undefined,
        email: c.email || undefined,
        type: 'retail' as const,
        loyaltyPoints: 0,
        totalPurchases: 0,
        totalSpent: Number(c.total_purchases),
        debt: Number(c.total_debt),
        branchId: c.branch_id,
        createdAt: c.created_at,
        note: c.notes || undefined,
      })))
    } finally {
      setIsLoading(false)
    }
  }, [currentBranch?.id, supabase])

  useEffect(() => {
    if (isAuthenticated) fetchCustomers()
  }, [isAuthenticated, fetchCustomers])

  const addCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'totalPurchases' | 'totalSpent'>) => {
    const { error } = await supabase.from('customers').insert({
      branch_id: customer.branchId,
      name: customer.fullName,
      phone: customer.phone || null,
      email: customer.email || null,
      notes: customer.note || null,
      total_debt: customer.debt || 0,
    })
    if (error) { console.error('Add customer error:', error); throw error }
    await fetchCustomers()
  }, [supabase, fetchCustomers])

  const updateCustomer = useCallback(async (id: string, data: Partial<Customer>) => {
    const dbUpdates: Record<string, unknown> = {}
    if (data.fullName !== undefined) dbUpdates.name = data.fullName
    if (data.phone !== undefined) dbUpdates.phone = data.phone
    if (data.email !== undefined) dbUpdates.email = data.email
    if (data.note !== undefined) dbUpdates.notes = data.note
    if (data.debt !== undefined) dbUpdates.total_debt = data.debt

    const { error } = await supabase.from('customers').update(dbUpdates).eq('id', id)
    if (error) { console.error('Update customer error:', error); throw error }
    await fetchCustomers()
  }, [supabase, fetchCustomers])

  const deleteCustomer = useCallback(async (id: string) => {
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) { console.error('Delete customer error:', error); throw error }
    setCustomers(prev => prev.filter(c => c.id !== id))
  }, [supabase])

  const getCustomer = useCallback((id: string) => customers.find(c => c.id === id), [customers])

  return (
    <CustomerContext.Provider value={{
      customers, isLoading, addCustomer, updateCustomer, deleteCustomer, getCustomer,
      refreshCustomers: fetchCustomers,
    }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomers() {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomers must be used within CustomerProvider')
  return ctx
}

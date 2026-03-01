'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Customer } from '@/lib/types'
import { useBranch } from '@/contexts/BranchContext'
import { createClient } from '@/lib/supabase/client'

interface CustomerContextType {
  customers: Customer[]
  loading: boolean
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'totalPurchases' | 'totalSpent'>) => void
  updateCustomer: (id: string, data: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  getCustomer: (id: string) => Customer | undefined
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const { currentBranch } = useBranch()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!currentBranch?.id || currentBranch.id === 'loading') return

    const fetchCustomers = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('branch_id', currentBranch.id)
          .order('full_name')

        if (error) throw error

        if (data) {
          setCustomers(data.map(c => ({
            id: c.id,
            fullName: c.full_name || '',
            phone: c.phone || undefined,
            email: c.email || undefined,
            type: (c.type as Customer['type']) || 'retail',
            loyaltyPoints: Number(c.loyalty_points) || 0,
            totalPurchases: Number(c.total_purchases) || 0,
            totalSpent: Number(c.total_spent) || 0,
            debt: Number(c.debt) || 0,
            branchId: c.branch_id,
            createdAt: c.created_at,
            note: c.note || undefined,
          })))
        }
      } catch (err) {
        console.error('Error fetching customers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [currentBranch?.id, supabase])

  const addCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'totalPurchases' | 'totalSpent'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          full_name: customer.fullName,
          phone: customer.phone || null,
          email: customer.email || null,
          type: customer.type,
          debt: customer.debt || 0,
          branch_id: customer.branchId,
          note: customer.note || null,
          loyalty_points: 0,
          total_purchases: 0,
          total_spent: 0,
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setCustomers(prev => [...prev, {
          id: data.id,
          fullName: data.full_name || '',
          phone: data.phone || undefined,
          email: data.email || undefined,
          type: (data.type as Customer['type']) || 'retail',
          loyaltyPoints: 0,
          totalPurchases: 0,
          totalSpent: 0,
          debt: Number(data.debt) || 0,
          branchId: data.branch_id,
          createdAt: data.created_at,
          note: data.note || undefined,
        }])
      }
    } catch (err) {
      console.error('Error adding customer:', err)
    }
  }, [supabase])

  const updateCustomer = useCallback(async (id: string, data: Partial<Customer>) => {
    try {
      const updateData: Record<string, unknown> = {}
      if (data.fullName !== undefined) updateData.full_name = data.fullName
      if (data.phone !== undefined) updateData.phone = data.phone || null
      if (data.email !== undefined) updateData.email = data.email || null
      if (data.type !== undefined) updateData.type = data.type
      if (data.debt !== undefined) updateData.debt = data.debt
      if (data.loyaltyPoints !== undefined) updateData.loyalty_points = data.loyaltyPoints
      if (data.totalPurchases !== undefined) updateData.total_purchases = data.totalPurchases
      if (data.totalSpent !== undefined) updateData.total_spent = data.totalSpent
      if (data.note !== undefined) updateData.note = data.note || null

      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
    } catch (err) {
      console.error('Error updating customer:', err)
    }
  }, [supabase])

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCustomers(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error('Error deleting customer:', err)
    }
  }, [supabase])

  const getCustomer = useCallback((id: string) => customers.find(c => c.id === id), [customers])

  return (
    <CustomerContext.Provider value={{ customers, loading, addCustomer, updateCustomer, deleteCustomer, getCustomer }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomers() {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomers must be used within CustomerProvider')
  return ctx
}

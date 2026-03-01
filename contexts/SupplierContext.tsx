'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Supplier } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useBranch } from '@/contexts/BranchContext'
import { useAuth } from '@/contexts/AuthContext'

interface SupplierContextType {
  suppliers: Supplier[]
  isLoading: boolean
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Promise<void>
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>
  deleteSupplier: (id: string) => Promise<void>
  refreshSuppliers: () => Promise<void>
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined)

export function SupplierProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { currentBranch } = useBranch()
  const { isAuthenticated } = useAuth()
  const supabase = createClient()

  const fetchSuppliers = useCallback(async () => {
    if (!currentBranch?.id || currentBranch.id === 'loading') return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .order('name')

      if (error) { console.error('Suppliers fetch error:', error); return }

      setSuppliers((data || []).map(s => ({
        id: s.id,
        name: s.name,
        contactPerson: s.contact_person || undefined,
        phone: s.phone || undefined,
        email: s.email || undefined,
        address: s.address || undefined,
        balance: Number(s.balance),
        branchId: s.branch_id,
        createdAt: s.created_at,
      })))
    } finally {
      setIsLoading(false)
    }
  }, [currentBranch?.id, supabase])

  useEffect(() => {
    if (isAuthenticated) fetchSuppliers()
  }, [isAuthenticated, fetchSuppliers])

  const addSupplier = useCallback(async (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    const { error } = await supabase.from('suppliers').insert({
      branch_id: supplier.branchId,
      name: supplier.name,
      contact_person: supplier.contactPerson || null,
      phone: supplier.phone || null,
      email: supplier.email || null,
      address: supplier.address || null,
      balance: supplier.balance || 0,
    })
    if (error) { console.error('Add supplier error:', error); throw error }
    await fetchSuppliers()
  }, [supabase, fetchSuppliers])

  const updateSupplier = useCallback(async (id: string, data: Partial<Supplier>) => {
    const dbUpdates: Record<string, unknown> = {}
    if (data.name !== undefined) dbUpdates.name = data.name
    if (data.contactPerson !== undefined) dbUpdates.contact_person = data.contactPerson
    if (data.phone !== undefined) dbUpdates.phone = data.phone
    if (data.email !== undefined) dbUpdates.email = data.email
    if (data.address !== undefined) dbUpdates.address = data.address
    if (data.balance !== undefined) dbUpdates.balance = data.balance

    const { error } = await supabase.from('suppliers').update(dbUpdates).eq('id', id)
    if (error) { console.error('Update supplier error:', error); throw error }
    await fetchSuppliers()
  }, [supabase, fetchSuppliers])

  const deleteSupplier = useCallback(async (id: string) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id)
    if (error) { console.error('Delete supplier error:', error); throw error }
    setSuppliers(prev => prev.filter(s => s.id !== id))
  }, [supabase])

  return (
    <SupplierContext.Provider value={{
      suppliers, isLoading, addSupplier, updateSupplier, deleteSupplier,
      refreshSuppliers: fetchSuppliers,
    }}>
      {children}
    </SupplierContext.Provider>
  )
}

export function useSuppliers() {
  const ctx = useContext(SupplierContext)
  if (!ctx) throw new Error('useSuppliers must be used within SupplierProvider')
  return ctx
}

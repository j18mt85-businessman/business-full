'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Supplier } from '@/lib/types'
import { useBranch } from '@/contexts/BranchContext'
import { createClient } from '@/lib/supabase/client'

interface SupplierContextType {
  suppliers: Supplier[]
  loading: boolean
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void
  updateSupplier: (id: string, data: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined)

export function SupplierProvider({ children }: { children: React.ReactNode }) {
  const { currentBranch } = useBranch()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!currentBranch?.id || currentBranch.id === 'loading') return

    const fetchSuppliers = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .eq('branch_id', currentBranch.id)
          .order('name')

        if (error) throw error

        if (data) {
          setSuppliers(data.map(s => ({
            id: s.id,
            name: s.name || '',
            contactPerson: s.contact_person || undefined,
            phone: s.phone || undefined,
            email: s.email || undefined,
            address: s.address || undefined,
            balance: Number(s.balance) || 0,
            branchId: s.branch_id,
            createdAt: s.created_at,
          })))
        }
      } catch (err) {
        console.error('Error fetching suppliers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [currentBranch?.id, supabase])

  const addSupplier = useCallback(async (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          name: supplier.name,
          contact_person: supplier.contactPerson || null,
          phone: supplier.phone || null,
          email: supplier.email || null,
          address: supplier.address || null,
          balance: supplier.balance || 0,
          branch_id: supplier.branchId,
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setSuppliers(prev => [...prev, {
          id: data.id,
          name: data.name || '',
          contactPerson: data.contact_person || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          address: data.address || undefined,
          balance: Number(data.balance) || 0,
          branchId: data.branch_id,
          createdAt: data.created_at,
        }])
      }
    } catch (err) {
      console.error('Error adding supplier:', err)
    }
  }, [supabase])

  const updateSupplier = useCallback(async (id: string, data: Partial<Supplier>) => {
    try {
      const updateData: Record<string, unknown> = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.contactPerson !== undefined) updateData.contact_person = data.contactPerson || null
      if (data.phone !== undefined) updateData.phone = data.phone || null
      if (data.email !== undefined) updateData.email = data.email || null
      if (data.address !== undefined) updateData.address = data.address || null
      if (data.balance !== undefined) updateData.balance = data.balance

      const { error } = await supabase
        .from('suppliers')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s))
    } catch (err) {
      console.error('Error updating supplier:', err)
    }
  }, [supabase])

  const deleteSupplier = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuppliers(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      console.error('Error deleting supplier:', err)
    }
  }, [supabase])

  return (
    <SupplierContext.Provider value={{ suppliers, loading, addSupplier, updateSupplier, deleteSupplier }}>
      {children}
    </SupplierContext.Provider>
  )
}

export function useSuppliers() {
  const ctx = useContext(SupplierContext)
  if (!ctx) throw new Error('useSuppliers must be used within SupplierProvider')
  return ctx
}

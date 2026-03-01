'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Supplier } from '@/lib/types'
import { MOCK_SUPPLIERS } from '@/lib/mock-data'
import { generateId } from '@/lib/utils'

interface SupplierContextType {
  suppliers: Supplier[]
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void
  updateSupplier: (id: string, data: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined)

export function SupplierProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS)

  const addSupplier = useCallback((supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    setSuppliers(prev => [...prev, { ...supplier, id: generateId('sup'), createdAt: new Date().toISOString() }])
  }, [])

  const updateSupplier = useCallback((id: string, data: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s))
  }, [])

  const deleteSupplier = useCallback((id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id))
  }, [])

  return (
    <SupplierContext.Provider value={{ suppliers, addSupplier, updateSupplier, deleteSupplier }}>
      {children}
    </SupplierContext.Provider>
  )
}

export function useSuppliers() {
  const ctx = useContext(SupplierContext)
  if (!ctx) throw new Error('useSuppliers must be used within SupplierProvider')
  return ctx
}

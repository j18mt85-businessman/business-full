'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Customer } from '@/lib/types'
import { MOCK_CUSTOMERS } from '@/lib/mock-data'
import { generateId } from '@/lib/utils'

interface CustomerContextType {
  customers: Customer[]
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'totalPurchases' | 'totalSpent'>) => void
  updateCustomer: (id: string, data: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  getCustomer: (id: string) => Customer | undefined
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS)

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'totalPurchases' | 'totalSpent'>) => {
    setCustomers(prev => [...prev, {
      ...customer,
      id: generateId('cust'),
      loyaltyPoints: 0,
      totalPurchases: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    }])
  }, [])

  const updateCustomer = useCallback((id: string, data: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }, [])

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id))
  }, [])

  const getCustomer = useCallback((id: string) => customers.find(c => c.id === id), [customers])

  return (
    <CustomerContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer, getCustomer }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomers() {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomers must be used within CustomerProvider')
  return ctx
}

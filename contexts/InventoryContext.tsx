'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { Product, Category, StockAlert } from '@/lib/types'
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mock-data'
import { generateId } from '@/lib/utils'

interface InventoryContextType {
  products: Product[]
  categories: Category[]
  alerts: StockAlert[]
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProduct: (id: string) => Product | undefined
  getCategoryName: (id: string) => string
  updateStock: (productId: string, quantityChange: number) => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [categories] = useState<Category[]>(MOCK_CATEGORIES)

  const alerts = useMemo<StockAlert[]>(() => {
    return products
      .filter(p => p.isActive && p.stock <= p.minStock)
      .map(p => ({
        id: `alert-${p.id}`,
        productId: p.id,
        productName: p.name,
        currentStock: p.stock,
        minStock: p.minStock,
        severity: p.stock === 0 ? 'critical' as const : p.stock <= p.minStock / 2 ? 'warning' as const : 'info' as const,
        branchId: p.branchId,
      }))
      .sort((a, b) => {
        const order = { critical: 0, warning: 1, info: 2 }
        return order[a.severity] - order[b.severity]
      })
  }, [products])

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    setProducts(prev => [...prev, { ...product, id: generateId('prod'), createdAt: now, updatedAt: now }])
  }, [])

  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }, [])

  const getProduct = useCallback((id: string) => products.find(p => p.id === id), [products])

  const getCategoryName = useCallback((id: string) => categories.find(c => c.id === id)?.name || '', [categories])

  const updateStock = useCallback((productId: string, quantityChange: number) => {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, stock: Math.max(0, p.stock + quantityChange), updatedAt: new Date().toISOString() } : p
    ))
  }, [])

  return (
    <InventoryContext.Provider value={{
      products, categories, alerts, addProduct, updateProduct, deleteProduct, getProduct, getCategoryName, updateStock,
    }}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider')
  return ctx
}

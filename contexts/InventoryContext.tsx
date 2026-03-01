'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import type { Product, Category, StockAlert } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useBranch } from '@/contexts/BranchContext'
import { useAuth } from '@/contexts/AuthContext'

interface InventoryContextType {
  products: Product[]
  categories: Category[]
  alerts: StockAlert[]
  isLoading: boolean
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  getProduct: (id: string) => Product | undefined
  getCategoryName: (id: string) => string
  updateStock: (productId: string, quantityChange: number) => Promise<void>
  refreshProducts: () => Promise<void>
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { currentBranch } = useBranch()
  const { company, isAuthenticated } = useAuth()
  const supabase = createClient()

  const fetchProducts = useCallback(async () => {
    if (!currentBranch?.id || currentBranch.id === '' || currentBranch.id === 'loading') return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, color, icon)')
        .eq('branch_id', currentBranch.id)
        .order('name')

      if (error) { console.error('Products fetch error:', error); return }

      const mapped: Product[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku || '',
        barcode: p.barcode || undefined,
        categoryId: p.category_id || '',
        costPrice: Number(p.cost_price),
        salePrice: Number(p.sale_price),
        wholesalePrice: p.wholesale_price ? Number(p.wholesale_price) : undefined,
        stock: Number(p.stock),
        minStock: Number(p.min_stock),
        unit: p.unit,
        isActive: p.is_active,
        imageUrl: p.image_url || undefined,
        description: p.description || undefined,
        branchId: p.branch_id,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }))
      setProducts(mapped)
    } finally {
      setIsLoading(false)
    }
  }, [currentBranch?.id, supabase])

  const fetchCategories = useCallback(async () => {
    if (!company?.id) return
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('company_id', company.id)
      .order('sort_order')

    if (error) { console.error('Categories fetch error:', error); return }

    setCategories((data || []).map(c => ({
      id: c.id,
      name: c.name,
      color: c.color,
      icon: c.icon || undefined,
    })))
  }, [company?.id, supabase])

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts()
      fetchCategories()
    }
  }, [isAuthenticated, fetchProducts, fetchCategories])

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

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('products')
      .insert({
        branch_id: product.branchId,
        category_id: product.categoryId || null,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || null,
        cost_price: product.costPrice,
        sale_price: product.salePrice,
        wholesale_price: product.wholesalePrice || null,
        stock: product.stock,
        min_stock: product.minStock,
        unit: product.unit,
        is_active: product.isActive,
        image_url: product.imageUrl || null,
        description: product.description || null,
      })
      .select()
      .single()

    if (error) { console.error('Add product error:', error); throw error }
    if (data) await fetchProducts()
  }, [supabase, fetchProducts])

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const dbUpdates: Record<string, unknown> = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.sku !== undefined) dbUpdates.sku = updates.sku
    if (updates.barcode !== undefined) dbUpdates.barcode = updates.barcode
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId
    if (updates.costPrice !== undefined) dbUpdates.cost_price = updates.costPrice
    if (updates.salePrice !== undefined) dbUpdates.sale_price = updates.salePrice
    if (updates.wholesalePrice !== undefined) dbUpdates.wholesale_price = updates.wholesalePrice
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock
    if (updates.minStock !== undefined) dbUpdates.min_stock = updates.minStock
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl
    if (updates.description !== undefined) dbUpdates.description = updates.description

    const { error } = await supabase.from('products').update(dbUpdates).eq('id', id)
    if (error) { console.error('Update product error:', error); throw error }
    await fetchProducts()
  }, [supabase, fetchProducts])

  const deleteProduct = useCallback(async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) { console.error('Delete product error:', error); throw error }
    setProducts(prev => prev.filter(p => p.id !== id))
  }, [supabase])

  const getProduct = useCallback((id: string) => products.find(p => p.id === id), [products])
  const getCategoryName = useCallback((id: string) => categories.find(c => c.id === id)?.name || '', [categories])

  const updateStock = useCallback(async (productId: string, quantityChange: number) => {
    const product = products.find(p => p.id === productId)
    if (!product) return
    const newStock = Math.max(0, product.stock + quantityChange)
    await updateProduct(productId, { stock: newStock })
  }, [products, updateProduct])

  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    if (!company?.id) return
    const { error } = await supabase
      .from('categories')
      .insert({
        company_id: company.id,
        name: category.name,
        color: category.color,
        icon: category.icon || null,
      })
    if (error) { console.error('Add category error:', error); throw error }
    await fetchCategories()
  }, [supabase, company?.id, fetchCategories])

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    const dbUpdates: Record<string, unknown> = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.color !== undefined) dbUpdates.color = updates.color
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon
    const { error } = await supabase.from('categories').update(dbUpdates).eq('id', id)
    if (error) { console.error('Update category error:', error); throw error }
    await fetchCategories()
  }, [supabase, fetchCategories])

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) { console.error('Delete category error:', error); throw error }
    setCategories(prev => prev.filter(c => c.id !== id))
  }, [supabase])

  return (
    <InventoryContext.Provider value={{
      products, categories, alerts, isLoading,
      addProduct, updateProduct, deleteProduct, getProduct, getCategoryName, updateStock,
      refreshProducts: fetchProducts,
      addCategory, updateCategory, deleteCategory,
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

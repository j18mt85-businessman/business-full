'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import type { Product, Category, StockAlert } from '@/lib/types'
import { useBranch } from '@/contexts/BranchContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

interface InventoryContextType {
  products: Product[]
  categories: Category[]
  alerts: StockAlert[]
  loading: boolean
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProduct: (id: string) => Product | undefined
  getCategoryName: (id: string) => string
  updateStock: (productId: string, quantityChange: number) => void
  addCategory: (category: Omit<Category, 'id'>) => void
  updateCategory: (id: string, data: Partial<Category>) => void
  deleteCategory: (id: string) => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { currentBranch } = useBranch()
  const { company } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Fetch products for current branch
  useEffect(() => {
    if (!currentBranch?.id || currentBranch.id === 'loading') return

    const fetchProducts = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('branch_id', currentBranch.id)
          .order('name')

        if (error) throw error

        if (data) {
          setProducts(data.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku || '',
            barcode: p.barcode || undefined,
            categoryId: p.category_id || '',
            costPrice: Number(p.cost_price) || 0,
            salePrice: Number(p.sale_price) || 0,
            wholesalePrice: p.wholesale_price ? Number(p.wholesale_price) : undefined,
            stock: Number(p.stock) || 0,
            minStock: Number(p.min_stock) || 0,
            unit: p.unit || 'ცალი',
            isActive: p.is_active ?? true,
            imageUrl: p.image_url || undefined,
            description: p.description || undefined,
            branchId: p.branch_id,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          })))
        }
      } catch (err) {
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentBranch?.id, supabase])

  // Fetch categories for company
  useEffect(() => {
    if (!company?.id) return

    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('company_id', company.id)
          .order('name')

        if (error) throw error

        if (data) {
          setCategories(data.map(c => ({
            id: c.id,
            name: c.name,
            color: c.color || '#6B7280',
            icon: c.icon || undefined,
          })))
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }

    fetchCategories()
  }, [company?.id, supabase])

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
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          sku: product.sku,
          barcode: product.barcode || null,
          category_id: product.categoryId || null,
          cost_price: product.costPrice,
          sale_price: product.salePrice,
          wholesale_price: product.wholesalePrice || null,
          stock: product.stock,
          min_stock: product.minStock,
          unit: product.unit,
          is_active: product.isActive,
          image_url: product.imageUrl || null,
          description: product.description || null,
          branch_id: product.branchId,
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        const newProduct: Product = {
          id: data.id,
          name: data.name,
          sku: data.sku || '',
          barcode: data.barcode || undefined,
          categoryId: data.category_id || '',
          costPrice: Number(data.cost_price) || 0,
          salePrice: Number(data.sale_price) || 0,
          wholesalePrice: data.wholesale_price ? Number(data.wholesale_price) : undefined,
          stock: Number(data.stock) || 0,
          minStock: Number(data.min_stock) || 0,
          unit: data.unit || 'ცალი',
          isActive: data.is_active ?? true,
          imageUrl: data.image_url || undefined,
          description: data.description || undefined,
          branchId: data.branch_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
        setProducts(prev => [...prev, newProduct])
      }
    } catch (err) {
      console.error('Error adding product:', err)
    }
  }, [supabase])

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    try {
      const updateData: Record<string, unknown> = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.sku !== undefined) updateData.sku = data.sku
      if (data.barcode !== undefined) updateData.barcode = data.barcode || null
      if (data.categoryId !== undefined) updateData.category_id = data.categoryId
      if (data.costPrice !== undefined) updateData.cost_price = data.costPrice
      if (data.salePrice !== undefined) updateData.sale_price = data.salePrice
      if (data.wholesalePrice !== undefined) updateData.wholesale_price = data.wholesalePrice || null
      if (data.stock !== undefined) updateData.stock = data.stock
      if (data.minStock !== undefined) updateData.min_stock = data.minStock
      if (data.unit !== undefined) updateData.unit = data.unit
      if (data.isActive !== undefined) updateData.is_active = data.isActive
      if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl || null
      if (data.description !== undefined) updateData.description = data.description || null

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      setProducts(prev => prev.map(p =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      ))
    } catch (err) {
      console.error('Error updating product:', err)
    }
  }, [supabase])

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Error deleting product:', err)
    }
  }, [supabase])

  const getProduct = useCallback((id: string) => products.find(p => p.id === id), [products])

  const getCategoryName = useCallback((id: string) => categories.find(c => c.id === id)?.name || '', [categories])

  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          color: category.color || '#6B7280',
          icon: category.icon || null,
          company_id: company?.id,
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setCategories(prev => [...prev, {
          id: data.id,
          name: data.name,
          color: data.color || '#6B7280',
          icon: data.icon || undefined,
        }])
      }
    } catch (err) {
      console.error('Error adding category:', err)
    }
  }, [supabase, company?.id])

  const updateCategory = useCallback(async (id: string, data: Partial<Category>) => {
    try {
      const updateData: Record<string, unknown> = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.color !== undefined) updateData.color = data.color
      if (data.icon !== undefined) updateData.icon = data.icon || null

      const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      setCategories(prev => prev.map(c =>
        c.id === id ? { ...c, ...data } : c
      ))
    } catch (err) {
      console.error('Error updating category:', err)
    }
  }, [supabase])

  const deleteCategory = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error('Error deleting category:', err)
    }
  }, [supabase])

  const updateStock = useCallback(async (productId: string, quantityChange: number) => {
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return

      const newStock = Math.max(0, product.stock + quantityChange)

      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId)

      if (error) throw error

      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, stock: newStock, updatedAt: new Date().toISOString() } : p
      ))
    } catch (err) {
      console.error('Error updating stock:', err)
    }
  }, [supabase, products])

  return (
    <InventoryContext.Provider value={{
      products, categories, alerts, loading, addProduct, updateProduct, deleteProduct, getProduct, getCategoryName, updateStock, addCategory, updateCategory, deleteCategory,
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

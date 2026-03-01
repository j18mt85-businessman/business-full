'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Sale, SaleItem, CartItem, PaymentMethod } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useBranch } from '@/contexts/BranchContext'
import { useAuth } from '@/contexts/AuthContext'

interface SalesContextType {
  sales: Sale[]
  cart: CartItem[]
  cartTotal: number
  cartDiscount: number
  isLoading: boolean
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setCartDiscount: (discount: number) => void
  completeSale: (paymentMethod: PaymentMethod, cashReceived?: number, customerId?: string, customerName?: string) => Promise<Sale>
  returnSale: (saleId: string) => Promise<void>
  refreshSales: () => Promise<void>
}

const SalesContext = createContext<SalesContextType | undefined>(undefined)

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartDiscount, setCartDiscount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { currentBranch } = useBranch()
  const { user, isAuthenticated } = useAuth()
  const supabase = createClient()

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0) - cartDiscount

  const fetchSales = useCallback(async () => {
    if (!currentBranch?.id || currentBranch.id === 'loading') return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*, sale_items(*), customers(name)')
        .eq('branch_id', currentBranch.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) { console.error('Sales fetch error:', error); return }

      setSales((data || []).map(s => ({
        id: s.id,
        receiptNumber: s.sale_number,
        branchId: s.branch_id,
        customerId: s.customer_id || undefined,
        customerName: (s.customers as Record<string, unknown>)?.name as string || undefined,
        items: ((s.sale_items || []) as Record<string, unknown>[]).map((si) => ({
          productId: (si.product_id as string) || '',
          productName: si.product_name as string,
          quantity: Number(si.quantity),
          unitPrice: Number(si.unit_price),
          discount: Number(si.discount_percent),
          total: Number(si.total),
        })),
        subtotal: Number(s.subtotal),
        discount: Number(s.discount_amount),
        total: Number(s.total),
        paymentMethod: s.payment_method as PaymentMethod,
        cashReceived: s.amount_paid ? Number(s.amount_paid) : undefined,
        change: s.change_amount ? Number(s.change_amount) : undefined,
        status: s.status as Sale['status'],
        cashierId: s.sold_by,
        cashierName: '',
        sessionId: s.session_id || undefined,
        createdAt: s.created_at,
        note: s.notes || undefined,
      })))
    } finally {
      setIsLoading(false)
    }
  }, [currentBranch?.id, supabase])

  useEffect(() => {
    if (isAuthenticated) fetchSales()
  }, [isAuthenticated, fetchSales])

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === item.product.id)
      if (existing) {
        return prev.map(c =>
          c.product.id === item.product.id
            ? { ...c, quantity: c.quantity + item.quantity, total: (c.quantity + item.quantity) * c.product.salePrice }
            : c
        )
      }
      return [...prev, item]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(c => c.product.id !== productId))
  }, [])

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(c => c.product.id !== productId))
      return
    }
    setCart(prev => prev.map(c =>
      c.product.id === productId
        ? { ...c, quantity, total: quantity * c.product.salePrice }
        : c
    ))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setCartDiscount(0)
  }, [])

  const completeSale = useCallback(async (
    paymentMethod: PaymentMethod,
    cashReceived?: number,
    customerId?: string,
    customerName?: string
  ): Promise<Sale> => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
    const total = subtotal - cartDiscount
    const saleNumber = `SALE-${Date.now()}`

    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert({
        branch_id: currentBranch.id,
        customer_id: customerId || null,
        sold_by: user!.id,
        sale_number: saleNumber,
        subtotal,
        discount_amount: cartDiscount,
        tax_amount: 0,
        total,
        payment_method: paymentMethod,
        amount_paid: cashReceived || total,
        change_amount: cashReceived ? cashReceived - total : 0,
        status: 'completed',
      })
      .select()
      .single()

    if (saleError || !saleData) {
      console.error('Create sale error:', saleError)
      throw saleError || new Error('Failed to create sale')
    }

    // Insert sale items
    const saleItems = cart.map(c => ({
      sale_id: saleData.id,
      product_id: c.product.id,
      product_name: c.product.name,
      quantity: c.quantity,
      unit_price: c.product.salePrice,
      discount_percent: c.discount,
      total: c.total,
    }))

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItems)
    if (itemsError) console.error('Insert sale items error:', itemsError)

    // Decrease stock for each product
    for (const item of cart) {
      await supabase
        .from('products')
        .update({ stock: Math.max(0, item.product.stock - item.quantity) })
        .eq('id', item.product.id)
    }

    const sale: Sale = {
      id: saleData.id,
      receiptNumber: saleNumber,
      branchId: currentBranch.id,
      customerId,
      customerName,
      items: cart.map(c => ({
        productId: c.product.id,
        productName: c.product.name,
        quantity: c.quantity,
        unitPrice: c.product.salePrice,
        discount: c.discount,
        total: c.total,
      })),
      subtotal,
      discount: cartDiscount,
      total,
      paymentMethod,
      cashReceived,
      change: cashReceived ? cashReceived - total : undefined,
      status: 'completed',
      cashierId: user!.id,
      cashierName: user!.fullName,
      createdAt: saleData.created_at,
    }

    setSales(prev => [sale, ...prev])
    setCart([])
    setCartDiscount(0)
    return sale
  }, [cart, cartDiscount, currentBranch?.id, user, supabase])

  const returnSale = useCallback(async (saleId: string) => {
    const { error } = await supabase
      .from('sales')
      .update({ status: 'refunded' })
      .eq('id', saleId)
    if (error) { console.error('Return sale error:', error); throw error }
    setSales(prev => prev.map(s =>
      s.id === saleId ? { ...s, status: 'returned' as Sale['status'] } : s
    ))
  }, [supabase])

  return (
    <SalesContext.Provider value={{
      sales, cart, cartTotal, cartDiscount, isLoading,
      addToCart, removeFromCart, updateCartQuantity, clearCart, setCartDiscount,
      completeSale, returnSale, refreshSales: fetchSales,
    }}>
      {children}
    </SalesContext.Provider>
  )
}

export function useSales() {
  const ctx = useContext(SalesContext)
  if (!ctx) throw new Error('useSales must be used within SalesProvider')
  return ctx
}

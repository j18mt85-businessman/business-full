'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Sale, SaleItem, CartItem, PaymentMethod } from '@/lib/types'
import { useBranch } from '@/contexts/BranchContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatReceiptNumber } from '@/lib/utils'

interface SalesContextType {
  sales: Sale[]
  cart: CartItem[]
  cartTotal: number
  cartDiscount: number
  loading: boolean
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setCartDiscount: (discount: number) => void
  completeSale: (paymentMethod: PaymentMethod, cashReceived?: number, customerId?: string, customerName?: string) => Promise<Sale>
  returnSale: (saleId: string) => void
}

const SalesContext = createContext<SalesContextType | undefined>(undefined)

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const { currentBranch } = useBranch()
  const { user } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartDiscount, setCartDiscount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0) - cartDiscount

  // Fetch sales for current branch
  useEffect(() => {
    if (!currentBranch?.id || currentBranch.id === 'loading') return

    const fetchSales = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('sales')
          .select('*, sale_items(*)')
          .eq('branch_id', currentBranch.id)
          .order('created_at', { ascending: false })
          .limit(200)

        if (error) throw error

        if (data) {
          setSales(data.map(s => ({
            id: s.id,
            receiptNumber: s.receipt_number || '',
            branchId: s.branch_id,
            customerId: s.customer_id || undefined,
            customerName: s.customer_name || undefined,
            items: (s.sale_items || []).map((si: Record<string, unknown>) => ({
              productId: si.product_id as string,
              productName: si.product_name as string,
              quantity: Number(si.quantity),
              unitPrice: Number(si.unit_price),
              discount: Number(si.discount) || 0,
              total: Number(si.total),
            })),
            subtotal: Number(s.subtotal) || 0,
            discount: Number(s.discount) || 0,
            total: Number(s.total) || 0,
            paymentMethod: s.payment_method as PaymentMethod,
            cashReceived: s.cash_received ? Number(s.cash_received) : undefined,
            change: s.change_amount ? Number(s.change_amount) : undefined,
            status: s.status as Sale['status'],
            cashierId: s.cashier_id || '',
            cashierName: s.cashier_name || '',
            sessionId: s.session_id || undefined,
            createdAt: s.created_at,
            note: s.note || undefined,
          })))
        }
      } catch (err) {
        console.error('Error fetching sales:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [currentBranch?.id, supabase])

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
    const items: SaleItem[] = cart.map(c => ({
      productId: c.product.id,
      productName: c.product.name,
      quantity: c.quantity,
      unitPrice: c.product.salePrice,
      discount: c.discount,
      total: c.total,
    }))

    const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
    const total = subtotal - cartDiscount

    try {
      // Insert sale
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          receipt_number: formatReceiptNumber(sales.length + 1),
          branch_id: currentBranch.id,
          customer_id: customerId || null,
          customer_name: customerName || null,
          subtotal,
          discount: cartDiscount,
          total,
          payment_method: paymentMethod,
          cash_received: cashReceived || null,
          change_amount: cashReceived ? cashReceived - total : null,
          status: 'completed',
          cashier_id: user?.id || null,
          cashier_name: user?.fullName || '',
          note: null,
        })
        .select()
        .single()

      if (saleError) throw saleError

      // Insert sale items
      if (saleData) {
        const saleItemsToInsert = items.map(item => ({
          sale_id: saleData.id,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
          total: item.total,
        }))

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItemsToInsert)

        if (itemsError) console.error('Error inserting sale items:', itemsError)

        // Update product stock
        for (const cartItem of cart) {
          await supabase
            .from('products')
            .update({
              stock: Math.max(0, cartItem.product.stock - cartItem.quantity),
            })
            .eq('id', cartItem.product.id)
        }
      }

      const sale: Sale = {
        id: saleData.id,
        receiptNumber: saleData.receipt_number,
        branchId: saleData.branch_id,
        customerId: customerId || undefined,
        customerName: customerName || undefined,
        items,
        subtotal,
        discount: cartDiscount,
        total,
        paymentMethod,
        cashReceived,
        change: cashReceived ? cashReceived - total : undefined,
        status: 'completed',
        cashierId: user?.id || '',
        cashierName: user?.fullName || '',
        createdAt: saleData.created_at,
      }

      setSales(prev => [sale, ...prev])
      setCart([])
      setCartDiscount(0)
      return sale
    } catch (err) {
      console.error('Error completing sale:', err)
      // Fallback: create sale locally if DB fails
      const fallbackSale: Sale = {
        id: `local-${Date.now()}`,
        receiptNumber: formatReceiptNumber(sales.length + 1),
        branchId: currentBranch.id,
        customerId,
        customerName,
        items,
        subtotal,
        discount: cartDiscount,
        total,
        paymentMethod,
        cashReceived,
        change: cashReceived ? cashReceived - total : undefined,
        status: 'completed',
        cashierId: user?.id || '',
        cashierName: user?.fullName || '',
        createdAt: new Date().toISOString(),
      }
      setSales(prev => [fallbackSale, ...prev])
      setCart([])
      setCartDiscount(0)
      return fallbackSale
    }
  }, [cart, cartDiscount, sales.length, currentBranch.id, user, supabase])

  const returnSale = useCallback(async (saleId: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .update({ status: 'returned' })
        .eq('id', saleId)

      if (error) throw error

      setSales(prev => prev.map(s =>
        s.id === saleId ? { ...s, status: 'returned' as const } : s
      ))
    } catch (err) {
      console.error('Error returning sale:', err)
      // Update locally anyway
      setSales(prev => prev.map(s =>
        s.id === saleId ? { ...s, status: 'returned' as const } : s
      ))
    }
  }, [supabase])

  return (
    <SalesContext.Provider value={{
      sales, cart, cartTotal, cartDiscount, loading,
      addToCart, removeFromCart, updateCartQuantity, clearCart, setCartDiscount,
      completeSale, returnSale,
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

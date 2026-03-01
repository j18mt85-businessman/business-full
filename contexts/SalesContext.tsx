'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Sale, SaleItem, CartItem, PaymentMethod } from '@/lib/types'
import { MOCK_SALES } from '@/lib/mock-data'
import { generateId, formatReceiptNumber } from '@/lib/utils'

interface SalesContextType {
  sales: Sale[]
  cart: CartItem[]
  cartTotal: number
  cartDiscount: number
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setCartDiscount: (discount: number) => void
  completeSale: (paymentMethod: PaymentMethod, cashReceived?: number, customerId?: string, customerName?: string) => Sale
  returnSale: (saleId: string) => void
}

const SalesContext = createContext<SalesContextType | undefined>(undefined)

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartDiscount, setCartDiscount] = useState(0)

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0) - cartDiscount

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

  const completeSale = useCallback((paymentMethod: PaymentMethod, cashReceived?: number, customerId?: string, customerName?: string): Sale => {
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

    const sale: Sale = {
      id: generateId('sale'),
      receiptNumber: formatReceiptNumber(sales.length + 1),
      branchId: 'branch-1',
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
      cashierId: 'user-1',
      cashierName: 'გიორგი ბერიძე',
      createdAt: new Date().toISOString(),
    }

    setSales(prev => [sale, ...prev])
    setCart([])
    setCartDiscount(0)
    return sale
  }, [cart, cartDiscount, sales.length])

  const returnSale = useCallback((saleId: string) => {
    setSales(prev => prev.map(s =>
      s.id === saleId ? { ...s, status: 'returned' as const } : s
    ))
  }, [])

  return (
    <SalesContext.Provider value={{
      sales, cart, cartTotal, cartDiscount,
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

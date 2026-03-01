'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInventory } from '@/contexts/InventoryContext'
import { useSales } from '@/contexts/SalesContext'
import { useCustomers } from '@/contexts/CustomerContext'
import { formatCurrency } from '@/lib/utils'
import type { Product, PaymentMethod, CartItem, Sale } from '@/lib/types'
import { ProductGrid } from '@/components/pos/ProductGrid'
import { CartPanel } from '@/components/pos/CartPanel'
import { PaymentModal } from '@/components/pos/PaymentModal'
import { ReceiptView } from '@/components/pos/ReceiptView'
import { Button } from '@/components/ui/button'
import { ShoppingCart, X } from 'lucide-react'

export default function POSPage() {
  const { products, updateStock } = useInventory()
  const { cart, cartTotal, cartDiscount, addToCart, removeFromCart, updateCartQuantity, clearCart, setCartDiscount, completeSale } = useSales()
  const { customers } = useCustomers()

  const [paymentOpen, setPaymentOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [lastSale, setLastSale] = useState<Sale | null>(null)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined)

  function handleProductClick(product: Product) {
    if (product.stock <= 0) return
    const item: CartItem = {
      product,
      quantity: 1,
      discount: 0,
      total: product.salePrice,
    }
    addToCart(item)
  }

  function handleCheckout() {
    if (cart.length === 0) return
    setPaymentOpen(true)
  }

  function handlePaymentComplete(method: PaymentMethod, cashReceived?: number) {
    const customer = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : undefined
    const sale = completeSale(method, cashReceived, customer?.id, customer?.fullName)

    // Update stock
    sale.items.forEach(item => {
      updateStock(item.productId, -item.quantity)
    })

    setLastSale(sale)
    setPaymentOpen(false)
    setReceiptOpen(true)
    setSelectedCustomerId(undefined)
    setMobileCartOpen(false)
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'F1') { e.preventDefault(); clearCart() }
      if (e.key === 'Enter' && !paymentOpen && !receiptOpen && cart.length > 0) { e.preventDefault(); handleCheckout() }
      if (e.key === 'Escape') {
        if (receiptOpen) setReceiptOpen(false)
        else if (paymentOpen) setPaymentOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [cart.length, paymentOpen, receiptOpen, clearCart])

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4 lg:flex-row">
      {/* Product grid (left) */}
      <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card">
        <ProductGrid
          products={products.filter(p => p.isActive)}
          onProductClick={handleProductClick}
        />
      </div>

      {/* Cart (right) - desktop */}
      <div className="hidden w-96 flex-col overflow-hidden rounded-xl border border-border bg-card lg:flex">
        <CartPanel
          cart={cart}
          cartTotal={cartTotal}
          cartDiscount={cartDiscount}
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={setSelectedCustomerId}
          onUpdateQuantity={updateCartQuantity}
          onRemove={removeFromCart}
          onSetDiscount={setCartDiscount}
          onClear={clearCart}
          onCheckout={handleCheckout}
        />
      </div>

      {/* Mobile Cart Toggle */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 z-20 lg:hidden">
          <Button
            onClick={() => setMobileCartOpen(true)}
            className="flex h-14 items-center gap-2 rounded-full bg-dasta-green px-6 text-primary-foreground shadow-lg hover:bg-dasta-green-dark"
          >
            <ShoppingCart className="size-5" />
            <span className="font-bold">{cart.reduce((s, c) => s + c.quantity, 0)}</span>
            <span className="mx-1">|</span>
            <span className="font-bold">{formatCurrency(cartTotal)}</span>
          </Button>
        </div>
      )}

      {/* Mobile Cart Sheet */}
      {mobileCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setMobileCartOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-lg font-bold">{'კალათა'}</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileCartOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CartPanel
                cart={cart}
                cartTotal={cartTotal}
                cartDiscount={cartDiscount}
                customers={customers}
                selectedCustomerId={selectedCustomerId}
                onSelectCustomer={setSelectedCustomerId}
                onUpdateQuantity={updateCartQuantity}
                onRemove={removeFromCart}
                onSetDiscount={setCartDiscount}
                onClear={clearCart}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        total={cartTotal}
        onComplete={handlePaymentComplete}
      />

      {/* Receipt Modal */}
      {lastSale && (
        <ReceiptView
          open={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          sale={lastSale}
        />
      )}
    </div>
  )
}

'use client'

// POS Cart Panel Component

import type { CartItem, Customer } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus, Trash2, Percent, CreditCard, User } from 'lucide-react'
import { useState } from 'react'

interface CartPanelProps {
  cart: CartItem[]
  cartTotal: number
  cartDiscount: number
  customers: Customer[]
  selectedCustomerId?: string
  onSelectCustomer: (id: string | undefined) => void
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  onSetDiscount: (discount: number) => void
  onClear: () => void
  onCheckout: () => void
}

export function CartPanel({
  cart, cartTotal, cartDiscount, customers, selectedCustomerId,
  onSelectCustomer, onUpdateQuantity, onRemove, onSetDiscount, onClear, onCheckout,
}: CartPanelProps) {
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')

  const subtotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0)
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)
  const filteredCustomers = customers.filter(c =>
    c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  )

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {'კალათა'}
            {cart.length > 0 && (
              <span className="ml-2 rounded-full bg-dasta-green px-2 py-0.5 text-xs text-primary-foreground">
                {cart.reduce((s, c) => s + c.quantity, 0)}
              </span>
            )}
          </h2>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear} className="text-dasta-danger text-xs">
              <Trash2 className="size-3" />
              {'გასუფთავება'}
            </Button>
          )}
        </div>

        {/* Customer */}
        <div className="mt-3">
          {selectedCustomer ? (
            <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="size-4 text-dasta-green" />
                <span className="font-medium">{selectedCustomer.fullName}</span>
              </div>
              <Button variant="ghost" size="icon" className="size-6" onClick={() => onSelectCustomer(undefined)}>
                <Trash2 className="size-3" />
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => setShowCustomerSearch(!showCustomerSearch)}
              >
                <User className="size-3" />
                {'კლიენტის არჩევა'}
              </Button>
              {showCustomerSearch && (
                <div className="mt-2 space-y-2">
                  <Input
                    placeholder="სახელით ან ტელეფონით..."
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    className="text-xs"
                    autoFocus
                  />
                  <div className="max-h-32 overflow-y-auto rounded-lg border border-border">
                    {filteredCustomers.slice(0, 5).map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onSelectCustomer(c.id)
                          setShowCustomerSearch(false)
                          setCustomerSearch('')
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-secondary"
                      >
                        <span className="font-medium">{c.fullName}</span>
                        <span className="text-xs text-muted-foreground">{c.phone}</span>
                      </button>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <p className="px-3 py-2 text-xs text-muted-foreground">{'ვერ მოიძებნა'}</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <CreditCard className="mb-2 size-8 opacity-30" />
            <p className="text-sm">{'კალათა ცარიელია'}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.product.salePrice)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
                <div className="w-20 text-right">
                  <p className="text-sm font-bold text-foreground">{formatCurrency(item.total)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-dasta-danger"
                  onClick={() => onRemove(item.product.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer totals */}
      {cart.length > 0 && (
        <div className="border-t border-border p-4 space-y-3">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{'ქვეჯამი'}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {cartDiscount > 0 && (
              <div className="flex justify-between text-dasta-danger">
                <span>{'ფასდაკლება'}</span>
                <span>{'-'}{formatCurrency(subtotal * cartDiscount / 100)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>{'ჯამი'}</span>
              <span className="text-dasta-green">{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          {/* Discount input */}
          <div className="flex items-center gap-2">
            <Percent className="size-4 text-muted-foreground" />
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="ფასდაკლება %"
              value={cartDiscount || ''}
              onChange={e => onSetDiscount(Number(e.target.value))}
              className="h-8 text-xs"
            />
          </div>

          <Button
            onClick={onCheckout}
            className="w-full bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark"
            size="lg"
          >
            <CreditCard className="size-4" />
            {'გადახდა'} {formatCurrency(cartTotal)}
          </Button>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useInventory } from '@/contexts/InventoryContext'
import { useSales } from '@/contexts/SalesContext'
import { useCustomers } from '@/contexts/CustomerContext'
import { useBranch } from '@/contexts/BranchContext'
import { formatCurrency, formatDate, getPaymentLabel } from '@/lib/utils'
import type { Product, PaymentMethod, CartItem, Sale, Customer } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  ShoppingCart, X, Search, Package, Grid3X3, List,
  Minus, Plus, Trash2, Percent, CreditCard, User,
  Banknote, ArrowRightLeft, Printer, CheckCircle,
} from 'lucide-react'

/* ───── ProductGrid ───── */
function ProductGrid({ products, onProductClick }: { products: Product[]; onProductClick: (p: Product) => void }) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { categories } = useInventory()

  const filtered = useMemo(() => {
    return products.filter(p => {
      const q = search.toLowerCase()
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.barcode?.includes(search) || p.sku?.toLowerCase().includes(q)
      const matchCategory = !selectedCategory || p.categoryId === selectedCategory
      return matchSearch && matchCategory
    })
  }, [products, search, selectedCategory])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="ძიება სახელით, შტრიხკოდით..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className="size-8" onClick={() => setViewMode('grid')}><Grid3X3 className="size-4" /></Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className="size-8" onClick={() => setViewMode('list')}><List className="size-4" /></Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => setSelectedCategory(null)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!selectedCategory ? 'bg-dasta-green text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>{'ყველა'}</button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedCategory === cat.id ? 'bg-dasta-green text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>{cat.name}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground"><Package className="mb-3 size-10" /><p className="text-sm font-medium">{'პროდუქტი ვერ მოიძებნა'}</p></div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {filtered.map(product => (
              <button key={product.id} onClick={() => onProductClick(product)} disabled={product.stock <= 0}
                className={`group relative flex flex-col rounded-xl border border-border p-3 text-left transition-all ${product.stock <= 0 ? 'cursor-not-allowed opacity-50' : 'hover:border-dasta-green hover:shadow-md active:scale-[0.98]'}`}>
                <div className="mb-2 flex h-16 items-center justify-center rounded-lg bg-secondary"><Package className="size-8 text-muted-foreground/50" /></div>
                <p className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</p>
                <p className="mt-auto pt-2 text-base font-bold text-dasta-green">{formatCurrency(product.salePrice)}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className={`text-xs ${product.stock <= (product.minStock || 5) ? 'text-dasta-danger' : 'text-muted-foreground'}`}>{'მარაგი: '}{product.stock}</span>
                  {product.stock <= (product.minStock || 5) && product.stock > 0 && <Badge variant="destructive" className="text-[10px]">{'მცირე'}</Badge>}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(product => (
              <button key={product.id} onClick={() => onProductClick(product)} disabled={product.stock <= 0}
                className={`flex w-full items-center gap-4 rounded-lg border border-border p-3 text-left transition-all ${product.stock <= 0 ? 'cursor-not-allowed opacity-50' : 'hover:border-dasta-green hover:bg-secondary/50'}`}>
                <div className="flex size-12 items-center justify-center rounded-lg bg-secondary"><Package className="size-6 text-muted-foreground/50" /></div>
                <div className="flex-1"><p className="text-sm font-medium text-foreground">{product.name}</p><p className="text-xs text-muted-foreground">{'მარაგი: '}{product.stock}{product.barcode ? ` | ${product.barcode}` : ''}</p></div>
                <p className="text-base font-bold text-dasta-green">{formatCurrency(product.salePrice)}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ───── CartPanel ───── */
function CartPanel({ cart, cartTotal, cartDiscount, customers, selectedCustomerId, onSelectCustomer, onUpdateQuantity, onRemove, onSetDiscount, onClear, onCheckout }: {
  cart: CartItem[]; cartTotal: number; cartDiscount: number; customers: Customer[]; selectedCustomerId?: string;
  onSelectCustomer: (id: string | undefined) => void; onUpdateQuantity: (id: string, qty: number) => void; onRemove: (id: string) => void;
  onSetDiscount: (d: number) => void; onClear: () => void; onCheckout: () => void
}) {
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const subtotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0)
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)
  const filteredCustomers = customers.filter(c => c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone?.includes(customerSearch))

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{'კალათა'}{cart.length > 0 && <span className="ml-2 rounded-full bg-dasta-green px-2 py-0.5 text-xs text-white">{cart.reduce((s, c) => s + c.quantity, 0)}</span>}</h2>
          {cart.length > 0 && <Button variant="ghost" size="sm" onClick={onClear} className="text-dasta-danger text-xs"><Trash2 className="size-3" />{'გასუფთავება'}</Button>}
        </div>
        <div className="mt-3">
          {selectedCustomer ? (
            <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
              <div className="flex items-center gap-2"><User className="size-4 text-dasta-green" /><span className="font-medium">{selectedCustomer.fullName}</span></div>
              <Button variant="ghost" size="icon" className="size-6" onClick={() => onSelectCustomer(undefined)}><Trash2 className="size-3" /></Button>
            </div>
          ) : (
            <>
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setShowCustomerSearch(!showCustomerSearch)}><User className="size-3" />{'კლიენტის არჩევა'}</Button>
              {showCustomerSearch && (
                <div className="mt-2 space-y-2">
                  <Input placeholder="სახელით ან ტელეფონით..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="text-xs" autoFocus />
                  <div className="max-h-32 overflow-y-auto rounded-lg border border-border">
                    {filteredCustomers.slice(0, 5).map(c => (
                      <button key={c.id} onClick={() => { onSelectCustomer(c.id); setShowCustomerSearch(false); setCustomerSearch('') }} className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-secondary">
                        <span className="font-medium">{c.fullName}</span><span className="text-xs text-muted-foreground">{c.phone}</span>
                      </button>
                    ))}
                    {filteredCustomers.length === 0 && <p className="px-3 py-2 text-xs text-muted-foreground">{'ვერ მოიძებნა'}</p>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"><CreditCard className="mb-2 size-8 opacity-30" /><p className="text-sm">{'კალათა ცარიელია'}</p></div>
        ) : (
          <div className="divide-y divide-border">
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.product.salePrice)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="size-7" onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}><Minus className="size-3" /></Button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="size-7" onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}><Plus className="size-3" /></Button>
                </div>
                <div className="w-20 text-right"><p className="text-sm font-bold text-foreground">{formatCurrency(item.total)}</p></div>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-dasta-danger" onClick={() => onRemove(item.product.id)}><Trash2 className="size-3" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>
      {cart.length > 0 && (
        <div className="space-y-3 border-t border-border p-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>{'ქვეჯამი'}</span><span>{formatCurrency(subtotal)}</span></div>
            {cartDiscount > 0 && <div className="flex justify-between text-dasta-danger"><span>{'ფასდაკლება'}</span><span>{'-'}{formatCurrency(subtotal * cartDiscount / 100)}</span></div>}
            <div className="flex justify-between text-lg font-bold text-foreground"><span>{'ჯამი'}</span><span className="text-dasta-green">{formatCurrency(cartTotal)}</span></div>
          </div>
          <div className="flex items-center gap-2"><Percent className="size-4 text-muted-foreground" /><Input type="number" min="0" max="100" placeholder="ფასდაკლება %" value={cartDiscount || ''} onChange={e => onSetDiscount(Number(e.target.value))} className="h-8 text-xs" /></div>
          <Button onClick={onCheckout} className="w-full bg-dasta-green text-white hover:bg-dasta-green/90" size="lg"><CreditCard className="size-4" />{'გადახდა'} {formatCurrency(cartTotal)}</Button>
        </div>
      )}
    </div>
  )
}

/* ───── PaymentModal ───── */
const paymentMethods = [
  { id: 'cash' as PaymentMethod, label: 'ნაღდი', icon: Banknote, color: 'bg-emerald-600 hover:bg-emerald-700' },
  { id: 'card' as PaymentMethod, label: 'ბარათი', icon: CreditCard, color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'transfer' as PaymentMethod, label: 'გადარიცხვა', icon: ArrowRightLeft, color: 'bg-amber-600 hover:bg-amber-700' },
]

function PaymentModal({ open, onClose, total, onComplete }: { open: boolean; onClose: () => void; total: number; onComplete: (m: PaymentMethod, cash?: number) => void }) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [cashReceived, setCashReceived] = useState('')
  const change = selectedMethod === 'cash' && cashReceived ? Number(cashReceived) - total : 0
  const quickAmounts = [Math.ceil(total / 5) * 5, Math.ceil(total / 10) * 10, Math.ceil(total / 20) * 20, Math.ceil(total / 50) * 50].filter((v, i, a) => a.indexOf(v) === i && v >= total).slice(0, 4)

  function handleComplete() {
    if (!selectedMethod) return
    onComplete(selectedMethod, selectedMethod === 'cash' ? Number(cashReceived) : undefined)
    setSelectedMethod(null)
    setCashReceived('')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="text-center text-lg font-bold">{'გადახდა'}</DialogTitle></DialogHeader>
        <div className="rounded-xl bg-secondary p-6 text-center">
          <p className="text-sm text-muted-foreground">{'გადასახდელი'}</p>
          <p className="mt-1 text-3xl font-bold text-dasta-green">{formatCurrency(total)}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {paymentMethods.map(method => {
            const Icon = method.icon
            return (
              <button key={method.id} onClick={() => setSelectedMethod(method.id)}
                className={`flex flex-col items-center gap-2 rounded-xl p-4 text-sm font-medium transition-all ${selectedMethod === method.id ? `${method.color} text-white shadow-lg scale-[1.02]` : 'border border-border bg-card text-foreground hover:bg-secondary'}`}>
                <Icon className="size-6" />{method.label}
              </button>
            )
          })}
        </div>
        {selectedMethod === 'cash' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{'მიღებული თანხა'}</label>
              <Input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder="0.00" className="text-lg font-bold" autoFocus />
            </div>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map(amount => <Button key={amount} variant="outline" size="sm" className="text-xs" onClick={() => setCashReceived(String(amount))}>{formatCurrency(amount)}</Button>)}
            </div>
            {Number(cashReceived) >= total && (
              <div className="rounded-lg bg-emerald-50 p-3 text-center dark:bg-emerald-900/20">
                <p className="text-sm text-muted-foreground">{'ხურდა'}</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(change)}</p>
              </div>
            )}
          </div>
        )}
        <Button onClick={handleComplete} disabled={!selectedMethod || (selectedMethod === 'cash' && (!cashReceived || Number(cashReceived) < total))} className="w-full bg-dasta-green text-white hover:bg-dasta-green/90" size="lg">{'დასრულება'}</Button>
      </DialogContent>
    </Dialog>
  )
}

/* ───── ReceiptView ───── */
function ReceiptView({ open, onClose, sale }: { open: boolean; onClose: () => void; sale: Sale }) {
  const { currentBranch } = useBranch()
  const receiptRef = useRef<HTMLDivElement>(null)

  function handlePrint() {
    const printContent = receiptRef.current?.innerHTML
    if (!printContent) return
    const w = window.open('', '_blank', 'width=350,height=600')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><title>ჩეკი</title><style>
      body{font-family:monospace;font-size:12px;width:280px;margin:0 auto;padding:10px}
      .center{text-align:center}.bold{font-weight:bold}.line{border-top:1px dashed #000;margin:6px 0}
      .row{display:flex;justify-content:space-between}.total{font-size:14px;font-weight:bold}
      @media print{@page{margin:0;size:80mm auto}}
    </style></head><body>${printContent}</body></html>`)
    w.document.close()
    w.print()
    w.close()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2"><CheckCircle className="size-5 text-emerald-500" />{'გაყიდვა დასრულდა'}</DialogTitle>
        </DialogHeader>
        <div ref={receiptRef} className="rounded-xl border border-border bg-secondary/30 p-5 font-mono text-sm">
          <div className="center text-center">
            <p className="bold text-base font-bold text-foreground">{currentBranch.name}</p>
            <p className="text-xs text-muted-foreground">{currentBranch.address}</p>
            <div className="line my-3 border-b border-dashed border-border" />
          </div>
          <div className="row flex justify-between text-xs text-muted-foreground"><span>{'ჩეკი:'}</span><span className="bold font-bold text-foreground">{sale.receiptNumber}</span></div>
          <div className="row flex justify-between text-xs text-muted-foreground"><span>{'თარიღი:'}</span><span>{formatDate(sale.createdAt, { time: true })}</span></div>
          {sale.customerName && <div className="row flex justify-between text-xs text-muted-foreground"><span>{'კლიენტი:'}</span><span>{sale.customerName}</span></div>}
          <div className="line my-3 border-b border-dashed border-border" />
          <div className="space-y-1">
            {sale.items.map((item, i) => (
              <div key={i} className="row flex justify-between text-xs"><div className="flex-1"><span>{item.productName}</span><span className="text-muted-foreground">{' x'}{item.quantity}</span></div><span className="font-medium">{formatCurrency(item.total)}</span></div>
            ))}
          </div>
          <div className="line my-3 border-b border-dashed border-border" />
          <div className="space-y-1">
            <div className="row flex justify-between text-xs"><span className="text-muted-foreground">{'ქვეჯამი'}</span><span>{formatCurrency(sale.subtotal)}</span></div>
            {sale.discount > 0 && <div className="row flex justify-between text-xs text-dasta-danger"><span>{'ფასდაკლება'}</span><span>{'-'}{formatCurrency(sale.discount)}</span></div>}
            <div className="total row flex justify-between text-sm font-bold text-foreground"><span>{'ჯამი'}</span><span className="text-dasta-green">{formatCurrency(sale.total)}</span></div>
          </div>
          <div className="line my-3 border-b border-dashed border-border" />
          <div className="row flex justify-between text-xs text-muted-foreground"><span>{'გადახდა:'}</span><span>{getPaymentLabel(sale.paymentMethod)}</span></div>
          {sale.cashReceived && sale.cashReceived > 0 && (
            <>
              <div className="row flex justify-between text-xs text-muted-foreground"><span>{'მიღებული:'}</span><span>{formatCurrency(sale.cashReceived)}</span></div>
              <div className="row flex justify-between text-xs text-muted-foreground"><span>{'ხურდა:'}</span><span>{formatCurrency(sale.change || 0)}</span></div>
            </>
          )}
          <div className="line my-3 border-b border-dashed border-border" />
          <p className="center text-center text-[10px] text-muted-foreground">{'გმადლობთ შეძენისთვის!'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handlePrint}><Printer className="size-4" />{'დაბეჭდვა'}</Button>
          <Button className="flex-1 bg-dasta-green text-white hover:bg-dasta-green/90" onClick={onClose}>{'ახალი გაყიდვა'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ───── Main POS Page ───── */
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
    addToCart({ product, quantity: 1, discount: 0, total: product.salePrice })
  }

  function handleCheckout() {
    if (cart.length === 0) return
    setPaymentOpen(true)
  }

  function handlePaymentComplete(method: PaymentMethod, cashReceived?: number) {
    const customer = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : undefined
    const sale = completeSale(method, cashReceived, customer?.id, customer?.fullName)
    sale.items.forEach(item => updateStock(item.productId, -item.quantity))
    setLastSale(sale)
    setPaymentOpen(false)
    setReceiptOpen(true)
    setSelectedCustomerId(undefined)
    setMobileCartOpen(false)
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'F1') { e.preventDefault(); clearCart() }
      if (e.key === 'Enter' && !paymentOpen && !receiptOpen && cart.length > 0) { e.preventDefault(); handleCheckout() }
      if (e.key === 'Escape') { if (receiptOpen) setReceiptOpen(false); else if (paymentOpen) setPaymentOpen(false) }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [cart.length, paymentOpen, receiptOpen, clearCart])

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4 lg:flex-row">
      <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card">
        <ProductGrid products={products.filter(p => p.isActive)} onProductClick={handleProductClick} />
      </div>
      <div className="hidden w-96 flex-col overflow-hidden rounded-xl border border-border bg-card lg:flex">
        <CartPanel cart={cart} cartTotal={cartTotal} cartDiscount={cartDiscount} customers={customers} selectedCustomerId={selectedCustomerId} onSelectCustomer={setSelectedCustomerId} onUpdateQuantity={updateCartQuantity} onRemove={removeFromCart} onSetDiscount={setCartDiscount} onClear={clearCart} onCheckout={handleCheckout} />
      </div>
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 z-20 lg:hidden">
          <Button onClick={() => setMobileCartOpen(true)} className="flex h-14 items-center gap-2 rounded-full bg-dasta-green px-6 text-white shadow-lg hover:bg-dasta-green/90">
            <ShoppingCart className="size-5" /><span className="font-bold">{cart.reduce((s, c) => s + c.quantity, 0)}</span><span className="mx-1">|</span><span className="font-bold">{formatCurrency(cartTotal)}</span>
          </Button>
        </div>
      )}
      {mobileCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setMobileCartOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4"><h2 className="text-lg font-bold">{'კალათა'}</h2><Button variant="ghost" size="icon" onClick={() => setMobileCartOpen(false)}><X className="size-5" /></Button></div>
            <div className="flex-1 overflow-y-auto"><CartPanel cart={cart} cartTotal={cartTotal} cartDiscount={cartDiscount} customers={customers} selectedCustomerId={selectedCustomerId} onSelectCustomer={setSelectedCustomerId} onUpdateQuantity={updateCartQuantity} onRemove={removeFromCart} onSetDiscount={setCartDiscount} onClear={clearCart} onCheckout={handleCheckout} /></div>
          </div>
        </div>
      )}
      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} total={cartTotal} onComplete={handlePaymentComplete} />
      {lastSale && <ReceiptView open={receiptOpen} onClose={() => setReceiptOpen(false)} sale={lastSale} />}
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { useInventory } from '@/contexts/InventoryContext'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Plus, Search, Package, Edit2, Trash2, BarChart3,
  ArrowUpDown, Filter, Download,
} from 'lucide-react'

export default function InventoryPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct, getCategoryName } = useInventory()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const filtered = useMemo(() => {
    let list = [...products]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.barcode?.includes(q) ||
        p.sku?.toLowerCase().includes(q)
      )
    }
    if (categoryFilter) {
      list = list.filter(p => p.categoryId === categoryFilter)
    }
    if (stockFilter === 'low') {
      list = list.filter(p => p.stock > 0 && p.stock <= (p.minStock || 5))
    } else if (stockFilter === 'out') {
      list = list.filter(p => p.stock === 0)
    }

    list.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name, 'ka')
      else if (sortBy === 'price') cmp = a.salePrice - b.salePrice
      else cmp = a.stock - b.stock
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [products, search, categoryFilter, stockFilter, sortBy, sortDir])

  const totalValue = products.reduce((sum, p) => sum + p.salePrice * p.stock, 0)
  const totalCost = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0)
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 5)).length
  const outOfStockCount = products.filter(p => p.stock === 0).length

  function toggleSort(field: 'name' | 'price' | 'stock') {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('asc') }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">{'ინვენტარი'}</h1>
          <p className="text-sm text-muted-foreground">{products.length} {'პროდუქტი'}</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
          <Plus className="size-4" />
          {'ახალი პროდუქტი'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{'ჯამური ღირებულება'}</p>
            <p className="mt-1 text-xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{'თვითღირებულება'}</p>
            <p className="mt-1 text-xl font-bold text-foreground">{formatCurrency(totalCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{'მცირე მარაგი'}</p>
            <p className="mt-1 text-xl font-bold text-dasta-warning">{lowStockCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{'ამოწურული'}</p>
            <p className="mt-1 text-xl font-bold text-dasta-danger">{outOfStockCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ძიება სახელით, შტრიხკოდით, SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter || ''}
            onChange={e => setCategoryFilter(e.target.value || null)}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
          >
            <option value="">{'ყველა კატეგორია'}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="flex rounded-md border border-border">
            {(['all', 'low', 'out'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStockFilter(f)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  stockFilter === f
                    ? 'bg-dasta-green text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {f === 'all' ? 'ყველა' : f === 'low' ? 'მცირე' : 'ამოწურული'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="p-3 text-left font-medium text-muted-foreground">{'პროდუქტი'}</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'კატეგორია'}</th>
                  <th className="cursor-pointer p-3 text-left font-medium text-muted-foreground" onClick={() => toggleSort('price')}>
                    <span className="flex items-center gap-1">{'ფასი'}<ArrowUpDown className="size-3" /></span>
                  </th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'თვითღირებულება'}</th>
                  <th className="cursor-pointer p-3 text-left font-medium text-muted-foreground" onClick={() => toggleSort('stock')}>
                    <span className="flex items-center gap-1">{'მარაგი'}<ArrowUpDown className="size-3" /></span>
                  </th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'სტატუსი'}</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">{'მოქმედება'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30 last:border-0">
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.barcode || product.sku || '-'}</p>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{getCategoryName(product.categoryId)}</td>
                    <td className="p-3 font-semibold text-foreground">{formatCurrency(product.salePrice)}</td>
                    <td className="p-3 text-muted-foreground">{formatCurrency(product.costPrice)}</td>
                    <td className="p-3 font-mono">{product.stock}</td>
                    <td className="p-3">
                      {product.stock === 0 ? (
                        <Badge variant="destructive" className="text-xs">{'ამოწურული'}</Badge>
                      ) : product.stock <= (product.minStock || 5) ? (
                        <Badge className="bg-dasta-warning/10 text-dasta-warning text-xs border-dasta-warning/20">{'მცირე'}</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">{'მარაგშია'}</Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditProduct(product)}>
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 text-dasta-danger" onClick={() => deleteProduct(product.id)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground">
                      <Package className="mx-auto mb-2 size-8 opacity-30" />
                      <p className="text-sm">{'პროდუქტი ვერ მოიძებნა'}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Product Dialog */}
      <ProductFormDialog
        open={isAddOpen || !!editProduct}
        onClose={() => { setIsAddOpen(false); setEditProduct(null) }}
        product={editProduct}
        categories={categories}
        onSave={(data) => {
          if (editProduct) {
            updateProduct(editProduct.id, data)
          } else {
            addProduct(data as Omit<Product, 'id'>)
          }
          setIsAddOpen(false)
          setEditProduct(null)
        }}
      />
    </div>
  )
}

function ProductFormDialog({ open, onClose, product, categories, onSave }: {
  open: boolean
  onClose: () => void
  product: Product | null
  categories: { id: string; name: string }[]
  onSave: (data: Partial<Product>) => void
}) {
  const [form, setForm] = useState({
    name: product?.name || '',
    barcode: product?.barcode || '',
    sku: product?.sku || '',
    categoryId: product?.categoryId || categories[0]?.id || '',
    costPrice: product?.costPrice || 0,
    salePrice: product?.salePrice || 0,
    stock: product?.stock || 0,
    minStock: product?.minStock || 5,
    unit: product?.unit || 'ცალი',
    isActive: product?.isActive ?? true,
  })

  // Reset form when product changes
  useState(() => {
    if (product) {
      setForm({
        name: product.name, barcode: product.barcode || '', sku: product.sku || '',
        categoryId: product.categoryId, costPrice: product.costPrice, salePrice: product.salePrice,
        stock: product.stock, minStock: product.minStock || 5, unit: product.unit, isActive: product.isActive,
      })
    }
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? 'პროდუქტის რედაქტირება' : 'ახალი პროდუქტი'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{'სახელი'}</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{'შტრიხკოდი'}</label>
              <Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{'კატეგორია'}</label>
              <select
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{'ერთეული'}</label>
              <select
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                <option value="ცალი">{'ცალი'}</option>
                <option value="კგ">{'კგ'}</option>
                <option value="ლიტრი">{'ლიტრი'}</option>
                <option value="მეტრი">{'მეტრი'}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{'თვითღირებულება'}</label>
              <Input type="number" step="0.01" value={form.costPrice} onChange={e => setForm(f => ({ ...f, costPrice: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{'გასაყიდი ფასი'}</label>
              <Input type="number" step="0.01" value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{'მარაგი'}</label>
              <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{'მინ. მარაგი'}</label>
              <Input type="number" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>{'გაუქმება'}</Button>
            <Button type="submit" className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
              {product ? 'შენახვა' : 'დამატება'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

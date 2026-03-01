'use client'

// POS Product Grid Component

import { useState, useMemo } from 'react'
import type { Product } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { useInventory } from '@/contexts/InventoryContext'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Package, Grid3X3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductGridProps {
  products: Product[]
  onProductClick: (product: Product) => void
}

export function ProductGrid({ products, onProductClick }: ProductGridProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { categories } = useInventory()

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = search.length === 0 ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.includes(search) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
      const matchCategory = !selectedCategory || p.categoryId === selectedCategory
      return matchSearch && matchCategory
    })
  }, [products, search, selectedCategory])

  return (
    <div className="flex h-full flex-col">
      {/* Search + filters */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ძიება სახელით, შტრიხკოდით..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="size-8"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="size-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="size-8"
              onClick={() => setViewMode('list')}
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              !selectedCategory
                ? 'bg-dasta-green text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            {'ყველა'}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-dasta-green text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <Package className="mb-3 size-10" />
            <p className="text-sm font-medium">{'პროდუქტი ვერ მოიძებნა'}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {filtered.map(product => (
              <button
                key={product.id}
                onClick={() => onProductClick(product)}
                disabled={product.stock <= 0}
                className={`group relative flex flex-col rounded-xl border border-border p-3 text-left transition-all ${
                  product.stock <= 0
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:border-dasta-green hover:shadow-md active:scale-[0.98]'
                }`}
              >
                <div className="mb-2 flex h-16 items-center justify-center rounded-lg bg-secondary">
                  <Package className="size-8 text-muted-foreground/50" />
                </div>
                <p className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</p>
                <p className="mt-auto pt-2 text-base font-bold text-dasta-green">{formatCurrency(product.salePrice)}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className={`text-xs ${
                    product.stock <= (product.minStock || 5) ? 'text-dasta-danger' : 'text-muted-foreground'
                  }`}>
                    {'მარაგი: '}{product.stock}
                  </span>
                  {product.stock <= (product.minStock || 5) && product.stock > 0 && (
                    <Badge variant="destructive" className="text-[10px]">{'მცირე'}</Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(product => (
              <button
                key={product.id}
                onClick={() => onProductClick(product)}
                disabled={product.stock <= 0}
                className={`flex w-full items-center gap-4 rounded-lg border border-border p-3 text-left transition-all ${
                  product.stock <= 0
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:border-dasta-green hover:bg-secondary/50'
                }`}
              >
                <div className="flex size-12 items-center justify-center rounded-lg bg-secondary">
                  <Package className="size-6 text-muted-foreground/50" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{'მარაგი: '}{product.stock} {product.barcode ? ` | ${product.barcode}` : ''}</p>
                </div>
                <p className="text-base font-bold text-dasta-green">{formatCurrency(product.salePrice)}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useInventory } from '@/contexts/InventoryContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Product } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  ClipboardCheck, Search, Package, AlertTriangle, CheckCircle2,
  ArrowUpDown, Download, Play, StopCircle, RotateCcw, Minus, Plus,
  Filter, XCircle,
} from 'lucide-react'

interface StockTakeItem {
  product: Product
  systemStock: number
  countedStock: number | null
  difference: number
  status: 'pending' | 'counted' | 'adjusted'
}

type StockTakeStatus = 'idle' | 'in_progress' | 'review' | 'completed'

export default function StockTakePage() {
  const { products, categories, updateStock, getCategoryName } = useInventory()
  const [status, setStatus] = useState<StockTakeStatus>('idle')
  const [items, setItems] = useState<StockTakeItem[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [completedSessions, setCompletedSessions] = useState<Array<{
    id: string
    date: string
    totalProducts: number
    differences: number
    adjustedValue: number
  }>>([])

  // Start a new stock-take session
  const startStockTake = useCallback(() => {
    const stockTakeItems: StockTakeItem[] = products
      .filter(p => p.isActive)
      .map(p => ({
        product: p,
        systemStock: p.stock,
        countedStock: null,
        difference: 0,
        status: 'pending' as const,
      }))
    setItems(stockTakeItems)
    setStatus('in_progress')
    setSearch('')
    setCategoryFilter(null)
    setShowOnlyDifferences(false)
  }, [products])

  // Update counted stock for a product
  const updateCount = useCallback((productId: string, count: number | null) => {
    setItems(prev => prev.map(item => {
      if (item.product.id !== productId) return item
      const countedStock = count !== null ? Math.max(0, count) : null
      const difference = countedStock !== null ? countedStock - item.systemStock : 0
      return {
        ...item,
        countedStock,
        difference,
        status: countedStock !== null ? 'counted' as const : 'pending' as const,
      }
    }))
  }, [])

  // Increment / decrement count
  const adjustCount = useCallback((productId: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.product.id !== productId) return item
      const current = item.countedStock ?? item.systemStock
      const countedStock = Math.max(0, current + delta)
      return {
        ...item,
        countedStock,
        difference: countedStock - item.systemStock,
        status: 'counted' as const,
      }
    }))
  }, [])

  // Set counted = system (mark as correct)
  const markAsCorrect = useCallback((productId: string) => {
    setItems(prev => prev.map(item => {
      if (item.product.id !== productId) return item
      return {
        ...item,
        countedStock: item.systemStock,
        difference: 0,
        status: 'counted' as const,
      }
    }))
  }, [])

  // Apply all adjustments
  const applyAdjustments = useCallback(async () => {
    const itemsWithDifference = items.filter(i => i.status === 'counted' && i.difference !== 0)
    for (const item of itemsWithDifference) {
      await updateStock(item.product.id, item.difference)
    }

    const session = {
      id: `st-${Date.now()}`,
      date: new Date().toISOString(),
      totalProducts: items.filter(i => i.status === 'counted').length,
      differences: itemsWithDifference.length,
      adjustedValue: itemsWithDifference.reduce((sum, i) =>
        sum + Math.abs(i.difference) * i.product.costPrice, 0
      ),
    }
    setCompletedSessions(prev => [session, ...prev])
    setStatus('completed')
    setConfirmOpen(false)
  }, [items, updateStock])

  // Filter items
  const filtered = useMemo(() => {
    if (status === 'idle') return []
    let list = [...items]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.product.name.toLowerCase().includes(q) ||
        i.product.barcode?.includes(q) ||
        i.product.sku?.toLowerCase().includes(q)
      )
    }
    if (categoryFilter) {
      list = list.filter(i => i.product.categoryId === categoryFilter)
    }
    if (showOnlyDifferences) {
      list = list.filter(i => i.status === 'counted' && i.difference !== 0)
    }

    return list
  }, [items, search, categoryFilter, showOnlyDifferences, status])

  // Stats
  const stats = useMemo(() => {
    const counted = items.filter(i => i.status === 'counted').length
    const pending = items.filter(i => i.status === 'pending').length
    const withDifference = items.filter(i => i.status === 'counted' && i.difference !== 0).length
    const totalDifferenceValue = items
      .filter(i => i.status === 'counted' && i.difference !== 0)
      .reduce((sum, i) => sum + i.difference * i.product.costPrice, 0)
    const surplus = items.filter(i => i.status === 'counted' && i.difference > 0).length
    const shortage = items.filter(i => i.status === 'counted' && i.difference < 0).length
    return { counted, pending, withDifference, totalDifferenceValue, surplus, shortage }
  }, [items])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">{'ინვენტარიზაცია'}</h1>
          <p className="text-sm text-muted-foreground">
            {status === 'idle' && 'მარაგის ფიზიკური შემოწმება და კორექტირება'}
            {status === 'in_progress' && `${stats.counted} / ${items.length} დათვლილი`}
            {status === 'review' && `${stats.withDifference} სხვაობა ნაპოვნი`}
            {status === 'completed' && 'ინვენტარიზაცია დასრულებულია'}
          </p>
        </div>
        <div className="flex gap-2">
          {status === 'idle' && (
            <>
              <Button variant="outline" onClick={() => setHistoryOpen(true)}>
                <RotateCcw className="size-4" />
                {'ისტორია'}
              </Button>
              <Button onClick={startStockTake} className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
                <Play className="size-4" />
                {'დაწყება'}
              </Button>
            </>
          )}
          {status === 'in_progress' && (
            <>
              <Button variant="outline" onClick={() => { setStatus('idle'); setItems([]) }}>
                <XCircle className="size-4" />
                {'გაუქმება'}
              </Button>
              <Button
                onClick={() => setStatus('review')}
                disabled={stats.counted === 0}
                className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark"
              >
                <CheckCircle2 className="size-4" />
                {'შედეგების ნახვა'}
              </Button>
            </>
          )}
          {status === 'review' && (
            <>
              <Button variant="outline" onClick={() => setStatus('in_progress')}>
                {'თვლის გაგრძელება'}
              </Button>
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={stats.withDifference === 0}
                className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark"
              >
                {'კორექტირების შესრულება'}
              </Button>
            </>
          )}
          {status === 'completed' && (
            <Button onClick={() => { setStatus('idle'); setItems([]) }} className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
              {'ახალი ინვენტარიზაცია'}
            </Button>
          )}
        </div>
      </div>

      {/* Idle State */}
      {status === 'idle' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-dasta-green/10">
              <ClipboardCheck className="size-8 text-dasta-green" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">{'ინვენტარიზაციის დაწყება'}</h2>
            <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
              {'ინვენტარიზაცია საშუალებას გაძლევთ შეამოწმოთ ფიზიკური მარაგი, შეადაროთ სისტემურ მონაცემებს და გაასწოროთ სხვაობები.'}
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <Package className="mx-auto mb-2 size-6 text-muted-foreground" />
                <p className="text-2xl font-bold text-foreground">{products.filter(p => p.isActive).length}</p>
                <p className="text-xs text-muted-foreground">{'აქტიური პროდუქტი'}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <AlertTriangle className="mx-auto mb-2 size-6 text-dasta-warning" />
                <p className="text-2xl font-bold text-dasta-warning">{products.filter(p => p.isActive && p.stock <= p.minStock && p.stock > 0).length}</p>
                <p className="text-xs text-muted-foreground">{'მცირე მარაგი'}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <XCircle className="mx-auto mb-2 size-6 text-dasta-danger" />
                <p className="text-2xl font-bold text-dasta-danger">{products.filter(p => p.isActive && p.stock === 0).length}</p>
                <p className="text-xs text-muted-foreground">{'ამოწურული'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* In Progress / Review */}
      {(status === 'in_progress' || status === 'review') && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{'დათვლილი'}</p>
                <p className="mt-1 text-xl font-bold text-foreground">{stats.counted} / {items.length}</p>
                <div className="mt-2 h-1.5 rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-dasta-green transition-all"
                    style={{ width: `${items.length ? (stats.counted / items.length) * 100 : 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{'სხვაობა'}</p>
                <p className="mt-1 text-xl font-bold text-dasta-warning">{stats.withDifference}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stats.surplus > 0 && <span className="text-dasta-green">{`+${stats.surplus} ჭარბი`}</span>}
                  {stats.surplus > 0 && stats.shortage > 0 && ' / '}
                  {stats.shortage > 0 && <span className="text-dasta-danger">{`-${stats.shortage} დანაკლისი`}</span>}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{'სხვაობის ღირებულება'}</p>
                <p className={`mt-1 text-xl font-bold ${stats.totalDifferenceValue < 0 ? 'text-dasta-danger' : stats.totalDifferenceValue > 0 ? 'text-dasta-green' : 'text-foreground'}`}>
                  {stats.totalDifferenceValue >= 0 ? '+' : ''}{formatCurrency(stats.totalDifferenceValue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{'მოლოდინში'}</p>
                <p className="mt-1 text-xl font-bold text-muted-foreground">{stats.pending}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ძიება სახელით, შტრიხკოდით..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
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
            {status === 'review' && (
              <Button
                variant={showOnlyDifferences ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
                className={showOnlyDifferences ? 'bg-dasta-warning text-primary-foreground hover:bg-dasta-warning/90' : ''}
              >
                <Filter className="size-4" />
                {'მხოლოდ სხვაობები'}
              </Button>
            )}
          </div>

          {/* Items Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="p-3 text-left font-medium text-muted-foreground">{'პროდუქტი'}</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">{'კატეგორია'}</th>
                      <th className="p-3 text-center font-medium text-muted-foreground">{'სისტემური'}</th>
                      <th className="p-3 text-center font-medium text-muted-foreground">{'ფაქტობრივი'}</th>
                      <th className="p-3 text-center font-medium text-muted-foreground">{'სხვაობა'}</th>
                      <th className="p-3 text-center font-medium text-muted-foreground">{'სტატუსი'}</th>
                      {status === 'in_progress' && (
                        <th className="p-3 text-right font-medium text-muted-foreground">{'მოქმედება'}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => (
                      <tr
                        key={item.product.id}
                        className={`border-b border-border/50 transition-colors last:border-0 ${
                          item.status === 'counted' && item.difference !== 0
                            ? 'bg-dasta-warning/5'
                            : item.status === 'counted'
                              ? 'bg-dasta-green/5'
                              : 'hover:bg-secondary/30'
                        }`}
                      >
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-foreground">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">{item.product.barcode || item.product.sku || '-'}</p>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{getCategoryName(item.product.categoryId)}</td>
                        <td className="p-3 text-center font-mono text-muted-foreground">{item.systemStock}</td>
                        <td className="p-3 text-center">
                          {status === 'in_progress' ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => adjustCount(item.product.id, -1)}
                                className="flex size-7 items-center justify-center rounded border border-border bg-card text-muted-foreground hover:bg-secondary"
                              >
                                <Minus className="size-3" />
                              </button>
                              <Input
                                type="number"
                                value={item.countedStock ?? ''}
                                onChange={e => updateCount(item.product.id, e.target.value ? Number(e.target.value) : null)}
                                placeholder="-"
                                className="h-7 w-16 text-center font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              />
                              <button
                                onClick={() => adjustCount(item.product.id, 1)}
                                className="flex size-7 items-center justify-center rounded border border-border bg-card text-muted-foreground hover:bg-secondary"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-mono font-semibold text-foreground">
                              {item.countedStock ?? '-'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {item.status === 'counted' ? (
                            <span className={`font-mono font-bold ${
                              item.difference > 0 ? 'text-dasta-green' :
                              item.difference < 0 ? 'text-dasta-danger' :
                              'text-muted-foreground'
                            }`}>
                              {item.difference > 0 ? `+${item.difference}` : item.difference === 0 ? '0' : String(item.difference)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {item.status === 'pending' && (
                            <Badge variant="secondary" className="text-xs">{'მოლოდინში'}</Badge>
                          )}
                          {item.status === 'counted' && item.difference === 0 && (
                            <Badge className="bg-dasta-green/10 text-dasta-green text-xs border-dasta-green/20">{'სწორია'}</Badge>
                          )}
                          {item.status === 'counted' && item.difference > 0 && (
                            <Badge className="bg-dasta-green/10 text-dasta-green text-xs border-dasta-green/20">{'ჭარბი'}</Badge>
                          )}
                          {item.status === 'counted' && item.difference < 0 && (
                            <Badge variant="destructive" className="text-xs">{'დანაკლისი'}</Badge>
                          )}
                        </td>
                        {status === 'in_progress' && (
                          <td className="p-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsCorrect(item.product.id)}
                              disabled={item.status === 'counted' && item.difference === 0}
                              className="text-xs"
                            >
                              <CheckCircle2 className="size-3.5" />
                              {'სწორია'}
                            </Button>
                          </td>
                        )}
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
        </>
      )}

      {/* Completed State */}
      {status === 'completed' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-dasta-green/10">
              <CheckCircle2 className="size-8 text-dasta-green" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">{'ინვენტარიზაცია დასრულებულია'}</h2>
            <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
              {'მარაგის კორექტირებები წარმატებით შესრულდა. ყველა სხვაობა გასწორებულია.'}
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{stats.counted}</p>
                <p className="text-xs text-muted-foreground">{'დათვლილი პროდუქტი'}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-dasta-warning">{stats.withDifference}</p>
                <p className="text-xs text-muted-foreground">{'გასწორებული სხვაობა'}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <p className={`text-2xl font-bold ${stats.totalDifferenceValue < 0 ? 'text-dasta-danger' : 'text-dasta-green'}`}>
                  {formatCurrency(Math.abs(stats.totalDifferenceValue))}
                </p>
                <p className="text-xs text-muted-foreground">{'სხვაობის ღირებულება'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{'კორექტირების დასტური'}</DialogTitle>
            <DialogDescription>
              {'ეს ქმედება შეცვლის პროდუქტების მარაგის რაოდენობას სისტემაში.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-dasta-warning/30 bg-dasta-warning/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 text-dasta-warning" />
                <div>
                  <p className="text-sm font-medium text-foreground">{'ყურადღება'}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {`${stats.withDifference} პროდუქტის მარაგი შეიცვლება. სხვაობის ჯამური ღირებულება: `}
                    <span className="font-semibold">{formatCurrency(Math.abs(stats.totalDifferenceValue))}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="p-2 text-left text-xs font-medium text-muted-foreground">{'პროდუქტი'}</th>
                    <th className="p-2 text-center text-xs font-medium text-muted-foreground">{'ახლა'}</th>
                    <th className="p-2 text-center text-xs font-medium text-muted-foreground">{'იქნება'}</th>
                  </tr>
                </thead>
                <tbody>
                  {items
                    .filter(i => i.status === 'counted' && i.difference !== 0)
                    .map(item => (
                      <tr key={item.product.id} className="border-b border-border/50 last:border-0">
                        <td className="p-2 text-foreground">{item.product.name}</td>
                        <td className="p-2 text-center font-mono text-muted-foreground">{item.systemStock}</td>
                        <td className="p-2 text-center font-mono font-semibold text-foreground">{item.countedStock}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>{'გაუქმება'}</Button>
              <Button onClick={applyAdjustments} className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
                {'კორექტირება'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{'ინვენტარიზაციის ისტორია'}</DialogTitle>
            <DialogDescription>
              {'წინა ინვენტარიზაციების ჩანაწერები.'}
            </DialogDescription>
          </DialogHeader>
          {completedSessions.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {'ჯერ ინვენტარიზაცია არ ჩატარებულა'}
            </div>
          ) : (
            <div className="space-y-3">
              {completedSessions.map(session => (
                <div key={session.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{formatDate(session.date, { time: true })}</p>
                    <Badge variant="secondary" className="text-xs">{session.totalProducts} {'პროდუქტი'}</Badge>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span>{session.differences} {'სხვაობა'}</span>
                    <span>{formatCurrency(session.adjustedValue)} {'ღირებულება'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

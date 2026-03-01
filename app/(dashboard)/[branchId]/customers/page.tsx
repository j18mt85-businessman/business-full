'use client'

import { useState, useMemo } from 'react'
import { useCustomers } from '@/contexts/CustomerContext'
import { formatCurrency } from '@/lib/utils'
import type { Customer } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Plus, Search, Users, Phone, MapPin, Star,
  Edit2, Trash2, Eye, CreditCard,
} from 'lucide-react'

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null)

  const filtered = useMemo(() => {
    let list = [...customers]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.fullName.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.includes(q)
      )
    }
    if (typeFilter !== 'all') {
      list = list.filter(c => c.type === typeFilter)
    }
    return list
  }, [customers, search, typeFilter])

  const totalDebt = customers.reduce((sum, c) => sum + c.debt, 0)
  const totalLoyalty = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">{'კლიენტები'}</h1>
          <p className="text-sm text-muted-foreground">{customers.length} {'კლიენტი'}</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
          <Plus className="size-4" />
          {'ახალი კლიენტი'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-green/10">
              <Users className="size-5 text-dasta-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'სულ კლიენტი'}</p>
              <p className="text-xl font-bold text-foreground">{customers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-info/10">
              <CreditCard className="size-5 text-dasta-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'ჯამური ვალი'}</p>
              <p className="text-xl font-bold text-dasta-danger">{formatCurrency(totalDebt)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-warning/10">
              <Star className="size-5 text-dasta-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'ლოიალობის ქულები'}</p>
              <p className="text-xl font-bold text-foreground">{totalLoyalty}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-success/10">
              <Users className="size-5 text-dasta-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'საცალო'}</p>
              <p className="text-xl font-bold text-foreground">{customers.filter(c => c.type === 'retail').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ძიება სახელით, ტელეფონით, პირადი ნომრით..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex rounded-md border border-border">
          {(['all', 'retail', 'wholesale', 'vip'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                typeFilter === t
                  ? 'bg-dasta-green text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              {t === 'all' ? 'ყველა' : t === 'retail' ? 'საცალო' : t === 'wholesale' ? 'საბითუმო' : 'VIP'}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(customer => (
          <Card key={customer.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-dasta-green/10 text-sm font-bold text-dasta-green">
                    {customer.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{customer.fullName}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {customer.type === 'retail' ? 'საცალო' : customer.type === 'wholesale' ? 'საბითუმო' : 'VIP'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="size-7" onClick={() => setViewCustomer(customer)}>
                    <Eye className="size-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-7" onClick={() => setEditCustomer(customer)}>
                    <Edit2 className="size-3" />
                  </Button>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="size-3" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3" />
                    <span className="truncate">{customer.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-secondary p-2 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground">{'შეკვეთები'}</p>
                  <p className="text-sm font-bold text-foreground">{customer.totalPurchases}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">{'ვალი'}</p>
                  <p className={`text-sm font-bold ${customer.debt > 0 ? 'text-dasta-danger' : 'text-foreground'}`}>
                    {formatCurrency(customer.debt)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">{'ქულები'}</p>
                  <p className="text-sm font-bold text-dasta-warning">{customer.loyaltyPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center py-12 text-center text-muted-foreground">
            <Users className="mb-2 size-8 opacity-30" />
            <p className="text-sm">{'კლიენტი ვერ მოიძებნა'}</p>
          </div>
        )}
      </div>

      {/* Customer Detail Dialog */}
      {viewCustomer && (
        <Dialog open={!!viewCustomer} onOpenChange={() => setViewCustomer(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{viewCustomer.fullName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">{'ტიპი:'}</div>
                <div>{viewCustomer.type === 'retail' ? 'საცალო' : viewCustomer.type === 'wholesale' ? 'საბითუმო' : 'VIP'}</div>
                <div className="text-muted-foreground">{'ტელეფონი:'}</div>
                <div>{viewCustomer.phone || '-'}</div>
                <div className="text-muted-foreground">{'მისამართი:'}</div>
                <div>{viewCustomer.address || '-'}</div>
                <div className="text-muted-foreground">{'მისამართი:'}</div>
                <div>{viewCustomer.note || '-'}</div>
              </div>
              <div className="grid grid-cols-3 gap-3 rounded-lg bg-secondary p-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">{'შეკვეთები'}</p>
                  <p className="text-xl font-bold">{viewCustomer.totalPurchases}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{'ჯამი'}</p>
                  <p className="text-xl font-bold text-dasta-green">{formatCurrency(viewCustomer.totalSpent)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{'ვალი'}</p>
                  <p className={`text-xl font-bold ${viewCustomer.debt > 0 ? 'text-dasta-danger' : 'text-dasta-success'}`}>
                    {formatCurrency(viewCustomer.debt)}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add / Edit Customer Dialog */}
      <CustomerFormDialog
        open={isAddOpen || !!editCustomer}
        onClose={() => { setIsAddOpen(false); setEditCustomer(null) }}
        customer={editCustomer}
        onSave={(data) => {
          if (editCustomer) {
            updateCustomer(editCustomer.id, data)
          } else {
            addCustomer(data as Omit<Customer, 'id'>)
          }
          setIsAddOpen(false)
          setEditCustomer(null)
        }}
      />
    </div>
  )
}

function CustomerFormDialog({ open, onClose, customer, onSave }: {
  open: boolean
  onClose: () => void
  customer: Customer | null
  onSave: (data: Partial<Customer>) => void
}) {
  const [form, setForm] = useState({
    fullName: customer?.fullName || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    note: customer?.note || '',
    type: customer?.type || 'retail' as const,
    debt: customer?.debt || 0,
    loyaltyPoints: customer?.loyaltyPoints || 0,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      ...form,
      totalPurchases: customer?.totalPurchases || 0,
      totalSpent: customer?.totalSpent || 0,
      branchId: 'branch-1',
      createdAt: customer?.createdAt || new Date().toISOString(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{customer ? 'კლიენტის რედაქტირება' : 'ახალი კლიენტი'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{'სახელი / გვარი'}</label>
              <Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{'ტელეფონი'}</label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{'ტიპი'}</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as 'retail' | 'wholesale' | 'vip' }))}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                <option value="retail">{'საცალო'}</option>
                <option value="wholesale">{'საბითუმო'}</option>
                <option value="vip">{'VIP'}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{'ელ. ფოსტა'}</label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">{'შენიშვნა'}</label>
              <Input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>{'გაუქმება'}</Button>
            <Button type="submit" className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
              {customer ? 'შენახვა' : 'დამატება'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

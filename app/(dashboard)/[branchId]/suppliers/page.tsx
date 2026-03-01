'use client'

import { useState, useMemo } from 'react'
import { useSuppliers } from '@/contexts/SupplierContext'
import { formatCurrency } from '@/lib/utils'
import type { Supplier } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Plus, Search, Truck, Phone, MapPin, Edit2, Trash2, Eye,
} from 'lucide-react'

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSuppliers()
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null)

  const filtered = useMemo(() => {
    if (!search) return suppliers
    const q = search.toLowerCase()
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.contactPerson?.toLowerCase().includes(q) ||
      s.phone?.includes(q)
    )
  }, [suppliers, search])

  const totalDebt = suppliers.reduce((sum, s) => sum + s.balance, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">{'მომწოდებლები'}</h1>
          <p className="text-sm text-muted-foreground">{suppliers.length} {'მომწოდებელი'}</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
          <Plus className="size-4" />
          {'ახალი მომწოდებელი'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-green/10">
              <Truck className="size-5 text-dasta-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'სულ მომწოდებელი'}</p>
              <p className="text-xl font-bold text-foreground">{suppliers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-success/10">
              <Truck className="size-5 text-dasta-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'აქტიური'}</p>
              <p className="text-xl font-bold text-foreground">{suppliers.filter(s => s.isActive).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-danger/10">
              <Truck className="size-5 text-dasta-danger" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'ჯამური ბალანსი'}</p>
              <p className="text-xl font-bold text-dasta-danger">{formatCurrency(totalDebt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ძიება სახელით, საკონტაქტოთი..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="p-3 text-left font-medium text-muted-foreground">{'მომწოდებელი'}</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'საკონტაქტო'}</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'ტელეფონი'}</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'სტატუსი'}</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">{'ბალანსი'}</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">{'მოქმედება'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(supplier => (
                  <tr key={supplier.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30 last:border-0">
                    <td className="p-3">
                      <p className="font-medium text-foreground">{supplier.name}</p>
                      <p className="text-xs text-muted-foreground">{supplier.address || '-'}</p>
                    </td>
                    <td className="p-3 text-muted-foreground">{supplier.contactPerson || '-'}</td>
                    <td className="p-3 text-muted-foreground">{supplier.phone || '-'}</td>
                    <td className="p-3">
                      <Badge variant={supplier.isActive ? 'default' : 'secondary'} className={`text-xs ${supplier.isActive ? 'bg-dasta-success/10 text-dasta-success border-dasta-success/20' : ''}`}>
                        {supplier.isActive ? 'აქტიური' : 'არააქტიური'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-semibold text-foreground">{formatCurrency(supplier.balance)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => setViewSupplier(supplier)}>
                          <Eye className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditSupplier(supplier)}>
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 text-dasta-danger" onClick={() => deleteSupplier(supplier.id)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                      <Truck className="mx-auto mb-2 size-8 opacity-30" />
                      <p className="text-sm">{'მომწოდებელი ვერ მოიძებნა'}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      {viewSupplier && (
        <Dialog open={!!viewSupplier} onOpenChange={() => setViewSupplier(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{viewSupplier.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">{'საკონტაქტო:'}</div>
                <div>{viewSupplier.contactPerson || '-'}</div>
                <div className="text-muted-foreground">{'ტელეფონი:'}</div>
                <div>{viewSupplier.phone || '-'}</div>
                <div className="text-muted-foreground">{'ელ. ფოსტა:'}</div>
                <div>{viewSupplier.email || '-'}</div>
                <div className="text-muted-foreground">{'მისამართი:'}</div>
                <div>{viewSupplier.address || '-'}</div>
                <div className="text-muted-foreground">{'ბალანსი:'}</div>
                <div className="font-bold text-foreground">{formatCurrency(viewSupplier.balance)}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add/Edit Dialog */}
      <SupplierFormDialog
        open={isAddOpen || !!editSupplier}
        onClose={() => { setIsAddOpen(false); setEditSupplier(null) }}
        supplier={editSupplier}
        onSave={(data) => {
          if (editSupplier) {
            updateSupplier(editSupplier.id, data)
          } else {
            addSupplier(data as Omit<Supplier, 'id'>)
          }
          setIsAddOpen(false)
          setEditSupplier(null)
        }}
      />
    </div>
  )
}

function SupplierFormDialog({ open, onClose, supplier, onSave }: {
  open: boolean
  onClose: () => void
  supplier: Supplier | null
  onSave: (data: Partial<Supplier>) => void
}) {
  const [form, setForm] = useState({
    name: supplier?.name || '',
    contactPerson: supplier?.contactPerson || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    isActive: supplier?.isActive ?? true,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ ...form, balance: supplier?.balance || 0 })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{supplier ? 'მომწოდებლის რედაქტირება' : 'ახალი მომწოდებელი'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{'კომპანიის სახელი'}</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{'საკონტაქტო პირი'}</label>
              <Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{'ტელეფონი'}</label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{'ელ. ფოსტა'}</label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">{'მისამართი'}</label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>{'გაუქმება'}</Button>
            <Button type="submit" className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
              {supplier ? 'შენახვა' : 'დამატება'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

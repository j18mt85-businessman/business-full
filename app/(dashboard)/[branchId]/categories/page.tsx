'use client'

import { useState, useMemo } from 'react'
import { useInventory } from '@/contexts/InventoryContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  Tag, Plus, Search, Pencil, Trash2, Package, GripVertical,
} from 'lucide-react'
import type { Category } from '@/lib/types'

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#6b7280',
  '#dc2626', '#10b981', '#06b6d4', '#ec4899', '#f97316',
  '#14b8a6', '#84cc16', '#a855f7', '#64748b',
]

export default function CategoriesPage() {
  const {
    categories, products, addCategory, updateCategory, deleteCategory, loading,
  } = useInventory()

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formColor, setFormColor] = useState('#3b82f6')

  // Product count per category
  const productCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of products) {
      map[p.categoryId] = (map[p.categoryId] || 0) + 1
    }
    return map
  }, [products])

  const filtered = useMemo(() => {
    if (!search) return categories
    const q = search.toLowerCase()
    return categories.filter(c => c.name.toLowerCase().includes(q))
  }, [categories, search])

  function openCreateDialog() {
    setEditingCategory(null)
    setFormName('')
    setFormColor('#3b82f6')
    setDialogOpen(true)
  }

  function openEditDialog(cat: Category) {
    setEditingCategory(cat)
    setFormName(cat.name)
    setFormColor(cat.color)
    setDialogOpen(true)
  }

  function handleSubmit() {
    if (!formName.trim()) return

    if (editingCategory) {
      updateCategory(editingCategory.id, { name: formName.trim(), color: formColor })
    } else {
      addCategory({ name: formName.trim(), color: formColor })
    }
    setDialogOpen(false)
    setFormName('')
    setFormColor('#3b82f6')
    setEditingCategory(null)
  }

  function handleDelete() {
    if (!deleteConfirm) return
    deleteCategory(deleteConfirm.id)
    setDeleteConfirm(null)
  }

  const totalProducts = products.length
  const uncategorized = products.filter(p => !p.categoryId || !categories.find(c => c.id === p.categoryId)).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">{'კატეგორიები'}</h1>
          <p className="text-sm text-muted-foreground">{categories.length} {'კატეგორია, '}{totalProducts} {'პროდუქტი'}</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-dasta-green text-primary-foreground hover:bg-dasta-green/90">
          <Plus className="size-4" />
          {'ახალი კატეგორია'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-green/10">
              <Tag className="size-5 text-dasta-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'სულ კატეგორიები'}</p>
              <p className="text-xl font-bold text-foreground">{categories.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-info/10">
              <Package className="size-5 text-dasta-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'სულ პროდუქტები'}</p>
              <p className="text-xl font-bold text-foreground">{totalProducts}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-warning/10">
              <GripVertical className="size-5 text-dasta-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'კატეგორიის გარეშე'}</p>
              <p className="text-xl font-bold text-foreground">{uncategorized}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="კატეგორიის ძიება..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="size-8 animate-spin rounded-full border-4 border-dasta-green border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="mb-3 size-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search ? 'კატეგორია ვერ მოიძებნა' : 'კატეგორიები არ არის. შექმენით ახალი.'}
            </p>
            {!search && (
              <Button onClick={openCreateDialog} variant="outline" className="mt-3">
                <Plus className="size-4" />
                {'პირველი კატეგორიის შექმნა'}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(cat => {
            const count = productCountMap[cat.id] || 0
            return (
              <Card key={cat.id} className="group relative overflow-hidden transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        <Tag className="size-5" style={{ color: cat.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {count} {'პროდუქტი'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEditDialog(cat)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-dasta-danger"
                        onClick={() => setDeleteConfirm(cat)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Color bar */}
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: cat.color,
                        width: count > 0 ? `${Math.min((count / Math.max(totalProducts, 1)) * 100 * 3, 100)}%` : '0%',
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'კატეგორიის რედაქტირება' : 'ახალი კატეგორია'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'შეცვალეთ კატეგორიის სახელი და ფერი.' : 'შექმენით ახალი კატეგორია თქვენი პროდუქტებისთვის.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{'სახელი'}</Label>
              <Input
                placeholder="მაგ: სასმელები"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div className="space-y-2">
              <Label>{'ფერი'}</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setFormColor(color)}
                    className="relative size-8 rounded-lg border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: formColor === color ? 'var(--foreground)' : 'transparent',
                    }}
                  >
                    <span className="sr-only">{color}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={formColor}
                  onChange={e => setFormColor(e.target.value)}
                  className="h-9 w-14 cursor-pointer p-1"
                />
                <span className="text-xs text-muted-foreground">{formColor}</span>
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 text-xs text-muted-foreground">{'გადახედვა'}</p>
              <div className="flex items-center gap-3">
                <div
                  className="flex size-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${formColor}20` }}
                >
                  <Tag className="size-4" style={{ color: formColor }} />
                </div>
                <span className="font-medium text-foreground">{formName || 'კატეგორია'}</span>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {'გაუქმება'}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formName.trim()}
                className="bg-dasta-green text-primary-foreground hover:bg-dasta-green/90"
              >
                {editingCategory ? 'შენახვა' : 'შექმნა'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{'კატეგორიის წაშლა'}</DialogTitle>
            <DialogDescription>
              {'ნამდვილად გსურთ "'}
              <span className="font-semibold">{deleteConfirm?.name}</span>
              {'" კატეგორიის წაშლა?'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {deleteConfirm && (productCountMap[deleteConfirm.id] || 0) > 0 && (
              <div className="rounded-lg border border-dasta-warning/30 bg-dasta-warning/5 p-3">
                <p className="text-sm text-dasta-warning">
                  {'ამ კატეგორიას '}{productCountMap[deleteConfirm.id]}{' პროდუქტი აქვს მინიჭებული. წაშლის შემდეგ ისინი კატეგორიის გარეშე დარჩებიან.'}
                </p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                {'გაუქმება'}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                {'წაშლა'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

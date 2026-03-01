'use client'

import { useState } from 'react'
import { useInventory } from '@/contexts/InventoryContext'
import type { Category } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Tag, Package } from 'lucide-react'

const COLOR_OPTIONS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#6b7280',
  '#dc2626', '#10b981', '#06b6d4', '#ec4899', '#f97316',
]

export default function CategoriesPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useInventory()
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)

  function getProductCount(catId: string): number {
    return products.filter(p => p.categoryId === catId).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">{'კატეგორიები'}</h1>
          <p className="text-sm text-muted-foreground">{categories.length} {'კატეგორია'}</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
          <Plus className="size-4" />
          {'ახალი კატეგორია'}
        </Button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Tag className="mb-3 size-12 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">{'კატეგორიები არ მოიძებნა'}</p>
            <p className="mt-1 text-xs text-muted-foreground">{'დაამატეთ პირველი კატეგორია'}</p>
            <Button onClick={() => setIsAddOpen(true)} className="mt-4 bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark" size="sm">
              <Plus className="size-4" />
              {'დამატება'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map(cat => {
            const count = getProductCount(cat.id)
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
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Package className="size-3" />
                          <span>{count} {'პროდუქტი'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setEditCategory(cat)}
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-dasta-danger"
                        onClick={() => deleteCategory(cat.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  {/* Color bar */}
                  <div className="mt-3 h-1 w-full rounded-full" style={{ backgroundColor: `${cat.color}30` }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: cat.color,
                        width: count > 0 ? `${Math.min(100, (count / 20) * 100)}%` : '0%',
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add / Edit Category Dialog */}
      <CategoryFormDialog
        open={isAddOpen || !!editCategory}
        onClose={() => { setIsAddOpen(false); setEditCategory(null) }}
        category={editCategory}
        onSave={(data) => {
          if (editCategory) {
            updateCategory(editCategory.id, data)
          } else {
            addCategory(data as Omit<Category, 'id'>)
          }
          setIsAddOpen(false)
          setEditCategory(null)
        }}
      />
    </div>
  )
}

function CategoryFormDialog({ open, onClose, category, onSave }: {
  open: boolean
  onClose: () => void
  category: Category | null
  onSave: (data: Partial<Category>) => void
}) {
  const [name, setName] = useState(category?.name || '')
  const [color, setColor] = useState(category?.color || COLOR_OPTIONS[0])

  // Reset form when category changes
  useState(() => {
    if (category) {
      setName(category.name)
      setColor(category.color)
    } else {
      setName('')
      setColor(COLOR_OPTIONS[0])
    }
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), color })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{category ? 'კატეგორიის რედაქტირება' : 'ახალი კატეგორია'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{'სახელი'}</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="მაგ: სასმელები"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">{'ფერი'}</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`size-8 rounded-full border-2 transition-all ${
                    color === c ? 'scale-110 border-foreground' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div
              className="flex size-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}20` }}
            >
              <Tag className="size-4" style={{ color }} />
            </div>
            <span className="text-sm font-medium text-foreground">{name || 'კატეგორიის სახელი'}</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>{'გაუქმება'}</Button>
            <Button type="submit" className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
              {category ? 'შენახვა' : 'დამატება'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

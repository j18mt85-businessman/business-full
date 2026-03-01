'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useBranch } from '@/contexts/BranchContext'
import { useInventory } from '@/contexts/InventoryContext'
import { cn } from '@/lib/utils'
import { SIDEBAR_NAV } from '@/lib/constants'
import {
  LayoutDashboard, ShoppingCart, Package, Tag, Receipt, Users, Truck,
  Landmark, Bell, Settings, ChevronDown, Check, Store, X, Calculator, Globe,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, ShoppingCart, Package, Tag, Receipt, Users, Truck,
  Landmark, Bell, Settings, Calculator, Globe,
}

export function DastaSidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const { branches, currentBranch, setCurrentBranch } = useBranch()
  const { alerts } = useInventory()
  const [branchOpen, setBranchOpen] = useState(false)

  const branchBase = `/${currentBranch.id}`

  function isActive(href: string) {
    const fullPath = `${branchBase}${href}`
    if (href === '') return pathname === branchBase || pathname === `${branchBase}/`
    return pathname.startsWith(fullPath)
  }

  function getBadge(icon: string): number | undefined {
    if (icon === 'Bell') return alerts.length > 0 ? alerts.length : undefined
    return undefined
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-dasta-green to-dasta-green-dark">
              <span className="text-lg font-bold text-primary-foreground">D</span>
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">DASTA</span>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground lg:hidden">
            <X className="size-5" />
          </button>
        </div>

        {/* Branch Switcher */}
        <div className="relative px-3 pb-2">
          <button
            onClick={() => setBranchOpen(!branchOpen)}
            className="flex w-full items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-accent"
          >
            <Store className="size-4 text-dasta-green" />
            <span className="flex-1 truncate text-left font-medium text-sidebar-foreground">{currentBranch.name}</span>
            <ChevronDown className={cn('size-4 text-sidebar-foreground/60 transition-transform', branchOpen && 'rotate-180')} />
          </button>
          {branchOpen && (
            <div className="absolute left-3 right-3 z-10 mt-1 rounded-lg border border-sidebar-border bg-sidebar-accent shadow-lg">
              {branches.filter(b => b.isActive).map(branch => (
                <button
                  key={branch.id}
                  onClick={() => {
                    setCurrentBranch(branch)
                    setBranchOpen(false)
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/80"
                >
                  <Store className="size-4 text-sidebar-foreground/60" />
                  <span className="flex-1 text-left">{branch.name}</span>
                  {branch.id === currentBranch.id && <Check className="size-4 text-dasta-green" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {SIDEBAR_NAV.map(section => (
            <div key={section.title} className="mb-4">
              <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = ICON_MAP[item.icon] || LayoutDashboard
                  const active = isActive(item.href)
                  const badge = getBadge(item.icon)
                  return (
                    <Link
                      key={item.href}
                      href={`${branchBase}${item.href}`}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                        active
                          ? 'bg-gradient-to-r from-dasta-green/20 to-transparent text-dasta-green'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                    >
                      <Icon className={cn('size-5', active ? 'text-dasta-green' : 'text-sidebar-foreground/50')} />
                      <span className="flex-1">{item.label}</span>
                      {badge && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-dasta-danger px-1.5 text-xs font-bold text-primary-foreground">
                          {badge}
                        </span>
                      )}
                      {active && <div className="h-5 w-0.5 rounded-full bg-dasta-green" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            <div className="text-xs font-medium text-sidebar-foreground/60">{'გეგმა'}</div>
            <div className="text-sm font-semibold text-dasta-green">{'პროფესიონალი'}</div>
            <div className="mt-1 h-1.5 rounded-full bg-sidebar-border">
              <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-dasta-green to-dasta-green-dark" />
            </div>
            <div className="mt-1 text-xs text-sidebar-foreground/40">{'20 / 5,000 პროდუქტი'}</div>
          </div>
        </div>
      </aside>
    </>
  )
}

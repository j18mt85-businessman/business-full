'use client'

import { useRouter } from 'next/navigation'
import { useBranch } from '@/contexts/BranchContext'
import { useInventory } from '@/contexts/InventoryContext'
import { useCustomers } from '@/contexts/CustomerContext'
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import {
  LayoutDashboard, ShoppingCart, Package, Receipt, Users, Landmark, Bell, Settings, Search,
} from 'lucide-react'

const PAGES = [
  { label: 'დეშბორდი', href: '', icon: LayoutDashboard },
  { label: 'POS - გაყიდვა', href: '/pos', icon: ShoppingCart },
  { label: 'პროდუქტები', href: '/inventory', icon: Package },
  { label: 'გაყიდვების ისტორია', href: '/sales', icon: Receipt },
  { label: 'კლიენტები', href: '/customers', icon: Users },
  { label: 'სალარო', href: '/cash-register', icon: Landmark },
  { label: 'შეტყობინებები', href: '/alerts', icon: Bell },
  { label: 'პარამეტრები', href: '/settings', icon: Settings },
]

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const { currentBranch } = useBranch()
  const { products } = useInventory()
  const { customers } = useCustomers()

  function navigateTo(href: string) {
    router.push(`/${currentBranch.id}${href}`)
    onOpenChange(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="ძიება გვერდების, პროდუქტების, კლიენტების..." />
      <CommandList>
        <CommandEmpty>{'ვერაფერი მოიძებნა'}</CommandEmpty>
        <CommandGroup heading="გვერდები">
          {PAGES.map(page => (
            <CommandItem key={page.href} onSelect={() => navigateTo(page.href)}>
              <page.icon className="size-4" />
              <span>{page.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="პროდუქტები">
          {products.slice(0, 5).map(product => (
            <CommandItem key={product.id} onSelect={() => navigateTo('/inventory')}>
              <Package className="size-4" />
              <span>{product.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{product.salePrice.toFixed(2)} {'\u20BE'}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="კლიენტები">
          {customers.slice(0, 5).map(customer => (
            <CommandItem key={customer.id} onSelect={() => navigateTo('/customers')}>
              <Users className="size-4" />
              <span>{customer.fullName}</span>
              <span className="ml-auto text-xs text-muted-foreground">{customer.phone}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

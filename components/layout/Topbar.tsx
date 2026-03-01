'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useInventory } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, Search, Bell, Sun, Moon, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Topbar({ onMenuClick, onSearchClick }: { onMenuClick: () => void; onSearchClick?: () => void }) {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { alerts } = useInventory()
  const router = useRouter()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="size-5" />
          <span className="sr-only">მენიუ</span>
        </Button>
        <button
          onClick={onSearchClick}
          className="flex h-9 w-64 items-center gap-2 rounded-lg border border-border bg-secondary px-3 text-sm text-muted-foreground transition-colors hover:bg-accent lg:w-80"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">{'ძიება...'}</span>
          <kbd className="hidden rounded border border-border bg-card px-1.5 py-0.5 text-xs font-mono text-muted-foreground sm:inline">
            {'Ctrl+K'}
          </kbd>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="თემის გადართვა">
          {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative" aria-label="შეტყობინებები">
          <Bell className="size-5" />
          {alerts.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-dasta-danger px-1 text-[10px] font-bold text-primary-foreground">
              {alerts.length}
            </span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dasta-green text-sm font-bold text-primary-foreground">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden text-left md:block">
                <div className="text-sm font-medium text-foreground">{user?.fullName}</div>
                <div className="text-xs text-muted-foreground">{user?.role === 'admin' ? 'ადმინისტრატორი' : user?.role}</div>
              </div>
              <ChevronDown className="hidden size-4 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <div className="text-sm font-medium">{user?.fullName}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="size-4" />
              {'პროფილი'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="size-4" />
              {'პარამეტრები'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-dasta-danger"
              onClick={() => {
                logout()
                router.push('/login')
              }}
            >
              <LogOut className="size-4" />
              {'გასვლა'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

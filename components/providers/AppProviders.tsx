'use client'

import React from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { BranchProvider } from '@/contexts/BranchContext'
import { InventoryProvider } from '@/contexts/InventoryContext'
import { SalesProvider } from '@/contexts/SalesContext'
import { CustomerProvider } from '@/contexts/CustomerContext'
import { SupplierProvider } from '@/contexts/SupplierContext'
import { CashRegisterProvider } from '@/contexts/CashRegisterContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981]">
            <span className="text-2xl font-bold text-white">D</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-5 animate-spin rounded-full border-2 border-[#10B981] border-t-transparent" />
            <span className="text-sm text-muted-foreground">{'იტვირთება...'}</span>
          </div>
        </div>
      </div>
    )
  }

  // If not authenticated, just render children (login/register pages)
  if (!isAuthenticated) {
    return <>{children}</>
  }

  // Authenticated -- wrap with data providers
  return (
    <BranchProvider>
      <InventoryProvider>
        <SalesProvider>
          <CustomerProvider>
            <SupplierProvider>
              <CashRegisterProvider>
                {children}
              </CashRegisterProvider>
            </SupplierProvider>
          </CustomerProvider>
        </SalesProvider>
      </InventoryProvider>
    </BranchProvider>
  )
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate>
          {children}
        </AuthGate>
      </AuthProvider>
    </ThemeProvider>
  )
}

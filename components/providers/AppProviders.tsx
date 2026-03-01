'use client'

import React from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { BranchProvider } from '@/contexts/BranchContext'
import { InventoryProvider } from '@/contexts/InventoryContext'
import { SalesProvider } from '@/contexts/SalesContext'
import { CustomerProvider } from '@/contexts/CustomerContext'
import { SupplierProvider } from '@/contexts/SupplierContext'
import { CashRegisterProvider } from '@/contexts/CashRegisterContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
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
      </AuthProvider>
    </ThemeProvider>
  )
}

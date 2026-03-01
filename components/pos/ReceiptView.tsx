'use client'

// POS Receipt View Component

import type { Sale } from '@/lib/types'
import { formatCurrency, formatDate, getPaymentLabel } from '@/lib/utils'
import { useBranch } from '@/contexts/BranchContext'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Printer, X, CheckCircle } from 'lucide-react'

interface ReceiptViewProps {
  open: boolean
  onClose: () => void
  sale: Sale
}

export function ReceiptView({ open, onClose, sale }: ReceiptViewProps) {
  const { currentBranch } = useBranch()

  function handlePrint() {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <CheckCircle className="size-5 text-dasta-success" />
            {'გაყიდვა დასრულდა'}
          </DialogTitle>
        </DialogHeader>

        {/* Receipt */}
        <div className="rounded-xl border border-border bg-secondary/30 p-5 font-mono text-sm">
          <div className="text-center">
            <p className="text-base font-bold text-foreground">{currentBranch.name}</p>
            <p className="text-xs text-muted-foreground">{currentBranch.address}</p>
            <div className="my-3 border-b border-dashed border-border" />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{'ჩეკი:'}</span>
            <span className="font-bold text-foreground">{sale.receiptNumber}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{'თარიღი:'}</span>
            <span>{formatDate(sale.createdAt, { time: true })}</span>
          </div>
          {sale.customerName && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{'კლიენტი:'}</span>
              <span>{sale.customerName}</span>
            </div>
          )}

          <div className="my-3 border-b border-dashed border-border" />

          {/* Items */}
          <div className="space-y-1">
            {sale.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <div className="flex-1">
                  <span>{item.productName}</span>
                  <span className="text-muted-foreground">{' x'}{item.quantity}</span>
                </div>
                <span className="font-medium">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>

          <div className="my-3 border-b border-dashed border-border" />

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{'ქვეჯამი'}</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-xs text-dasta-danger">
                <span>{'ფასდაკლება'}</span>
                <span>{'-'}{formatCurrency(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-foreground">
              <span>{'ჯამი'}</span>
              <span className="text-dasta-green">{formatCurrency(sale.total)}</span>
            </div>
          </div>

          <div className="my-3 border-b border-dashed border-border" />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{'გადახდა:'}</span>
            <span>{getPaymentLabel(sale.paymentMethod)}</span>
          </div>
          {sale.cashReceived && (
            <>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{'მიღებული:'}</span>
                <span>{formatCurrency(sale.cashReceived)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{'ხურდა:'}</span>
                <span>{formatCurrency(sale.change || 0)}</span>
              </div>
            </>
          )}

          <div className="my-3 border-b border-dashed border-border" />
          <p className="text-center text-[10px] text-muted-foreground">{'გმადლობთ შეძენისთვის!'}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="size-4" />
            {'დაბეჭდვა'}
          </Button>
          <Button className="flex-1 bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark" onClick={onClose}>
            {'ახალი გაყიდვა'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import type { PaymentMethod } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Banknote, CreditCard, ArrowRightLeft, DollarSign } from 'lucide-react'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  total: number
  onComplete: (method: PaymentMethod, cashReceived?: number) => void
}

const paymentMethods = [
  { id: 'cash' as PaymentMethod, label: 'ნაღდი', icon: Banknote, color: 'bg-emerald-600 hover:bg-emerald-700' },
  { id: 'card' as PaymentMethod, label: 'ბარათი', icon: CreditCard, color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'transfer' as PaymentMethod, label: 'გადარიცხვა', icon: ArrowRightLeft, color: 'bg-amber-600 hover:bg-amber-700' },
]

export function PaymentModal({ open, onClose, total, onComplete }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [cashReceived, setCashReceived] = useState('')
  const change = selectedMethod === 'cash' && cashReceived ? Number(cashReceived) - total : 0

  function handleComplete() {
    if (!selectedMethod) return
    onComplete(
      selectedMethod,
      selectedMethod === 'cash' ? Number(cashReceived) : undefined
    )
    setSelectedMethod(null)
    setCashReceived('')
  }

  const quickAmounts = [
    Math.ceil(total / 5) * 5,
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 20) * 20,
    Math.ceil(total / 50) * 50,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total).slice(0, 4)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold">{'გადახდა'}</DialogTitle>
        </DialogHeader>

        {/* Total */}
        <div className="rounded-xl bg-secondary p-6 text-center">
          <p className="text-sm text-muted-foreground">{'გადასახდელი'}</p>
          <p className="mt-1 text-3xl font-bold text-dasta-green">{formatCurrency(total)}</p>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-3 gap-3">
          {paymentMethods.map(method => {
            const Icon = method.icon
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`flex flex-col items-center gap-2 rounded-xl p-4 text-sm font-medium transition-all ${
                  selectedMethod === method.id
                    ? `${method.color} text-white shadow-lg scale-[1.02]`
                    : 'border border-border bg-card text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="size-6" />
                {method.label}
              </button>
            )
          })}
        </div>

        {/* Cash input */}
        {selectedMethod === 'cash' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{'მიღებული თანხა'}</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  value={cashReceived}
                  onChange={e => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  className="pl-9 text-lg font-bold"
                  autoFocus
                />
              </div>
            </div>
            {/* Quick amounts */}
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setCashReceived(String(amount))}
                >
                  {formatCurrency(amount)}
                </Button>
              ))}
            </div>
            {Number(cashReceived) >= total && (
              <div className="rounded-lg bg-dasta-success/10 p-3 text-center">
                <p className="text-sm text-muted-foreground">{'ხურდა'}</p>
                <p className="text-xl font-bold text-dasta-success">{formatCurrency(change)}</p>
              </div>
            )}
          </div>
        )}

        {/* Complete */}
        <Button
          onClick={handleComplete}
          disabled={
            !selectedMethod ||
            (selectedMethod === 'cash' && (!cashReceived || Number(cashReceived) < total))
          }
          className="w-full bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark"
          size="lg"
        >
          {'დასრულება'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

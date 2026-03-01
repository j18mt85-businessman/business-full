'use client'

import { useState, useMemo } from 'react'
import { useSales } from '@/contexts/SalesContext'
import { formatCurrency, formatDate, getPaymentLabel, getStatusLabel } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Search, Receipt, DollarSign, TrendingUp, Eye, RotateCcw,
  Filter, Calendar, Printer, FileText,
} from 'lucide-react'
import type { Sale } from '@/lib/types'
import { printReceipt, printReport } from '@/lib/print-utils'
import { useBranch } from '@/contexts/BranchContext'

export default function SalesPage() {
  const { sales, returnSale } = useSales()
  const { currentBranch } = useBranch()
  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const filtered = useMemo(() => {
    let list = [...sales]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.receiptNumber.toLowerCase().includes(q) ||
        s.customerName?.toLowerCase().includes(q)
      )
    }
    if (paymentFilter !== 'all') {
      list = list.filter(s => s.paymentMethod === paymentFilter)
    }
    if (dateFilter) {
      list = list.filter(s => s.createdAt.startsWith(dateFilter))
    }
    return list
  }, [sales, search, paymentFilter, dateFilter])

  const totalRevenue = sales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.total, 0)
  const totalChecks = sales.length
  const avgCheck = totalChecks > 0 ? totalRevenue / totalChecks : 0

  function handlePrintReceipt(sale: Sale) {
    printReceipt({
      branchName: currentBranch.name,
      branchAddress: currentBranch.address,
      receiptNumber: sale.receiptNumber,
      date: formatDate(sale.createdAt, { time: true }),
      customerName: sale.customerName,
      items: sale.items.map(i => ({ name: i.productName, qty: i.quantity, price: i.unitPrice, total: i.total })),
      subtotal: sale.subtotal,
      discount: sale.discount,
      total: sale.total,
      paymentMethod: getPaymentLabel(sale.paymentMethod),
      cashReceived: sale.cashReceived,
      change: sale.change,
    })
  }

  function handlePrintReport() {
    const cashSales = sales.filter(s => s.paymentMethod === 'cash' && s.status === 'completed').reduce((sum, s) => sum + s.total, 0)
    const cardSales = sales.filter(s => s.paymentMethod === 'card' && s.status === 'completed').reduce((sum, s) => sum + s.total, 0)
    const transferSales = sales.filter(s => s.paymentMethod === 'transfer' && s.status === 'completed').reduce((sum, s) => sum + s.total, 0)
    const returned = sales.filter(s => s.status === 'returned').reduce((sum, s) => sum + s.total, 0)

    printReport({
      title: 'გაყიდვების ანგარიში',
      branchName: currentBranch.name,
      period: 'ყველა პერიოდი',
      generatedAt: new Date().toLocaleString('ka-GE'),
      sections: [
        {
          title: 'ზოგადი მაჩვენებლები',
          rows: [
            { label: 'ჯამური გაყიდვები', value: `${formatCurrency(totalRevenue)}` },
            { label: 'ჩეკების რაოდენობა', value: `${totalChecks}` },
            { label: 'საშუალო ჩეკი', value: `${formatCurrency(avgCheck)}` },
            { label: 'დაბრუნებები', value: `${formatCurrency(returned)}` },
          ],
        },
        {
          title: 'გადახდის მეთოდები',
          rows: [
            { label: 'ნაღდი', value: `${formatCurrency(cashSales)}` },
            { label: 'ბარათი', value: `${formatCurrency(cardSales)}` },
            { label: 'გადარიცხვა', value: `${formatCurrency(transferSales)}` },
          ],
        },
      ],
      tableData: {
        headers: ['ჩეკი', 'თარიღი', 'კლიენტი', 'გადახდა', 'სტატუსი', 'თანხა'],
        rows: sales.slice(0, 50).map(s => [
          s.receiptNumber,
          formatDate(s.createdAt, { time: true }),
          s.customerName || '-',
          getPaymentLabel(s.paymentMethod),
          getStatusLabel(s.status),
          formatCurrency(s.total),
        ]),
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">{'გაყიდვების ისტორია'}</h1>
          <p className="text-sm text-muted-foreground">{sales.length} {'ტრანზაქცია'}</p>
        </div>
        <Button variant="outline" onClick={handlePrintReport}>
          <FileText className="size-4" />
          {'ანგარიშის ბეჭდვა'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-green/10">
              <DollarSign className="size-5 text-dasta-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'ჯამური გაყიდვები'}</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-info/10">
              <Receipt className="size-5 text-dasta-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'ჩეკების რაოდენობა'}</p>
              <p className="text-xl font-bold text-foreground">{totalChecks}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-warning/10">
              <TrendingUp className="size-5 text-dasta-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'საშუალო ჩეკი'}</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(avgCheck)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ძიება ჩეკით, კლიენტით..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={paymentFilter}
          onChange={e => setPaymentFilter(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          <option value="all">{'ყველა გადახდა'}</option>
          <option value="cash">{'ნაღდი'}</option>
          <option value="card">{'ბარათი'}</option>
          <option value="transfer">{'გადარიცხვა'}</option>
        </select>
        <Input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="w-auto"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="p-3 text-left font-medium text-muted-foreground">{'ჩეკი'}</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'თარიღი'}</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'კლიენტი'}</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'პროდუქტები'}</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'გადახდა'}</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'სტატუსი'}</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">{'თანხა'}</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">{'მოქმედება'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(sale => (
                  <tr key={sale.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30 last:border-0">
                    <td className="p-3 font-mono text-xs text-foreground">{sale.receiptNumber}</td>
                    <td className="p-3 text-muted-foreground">{formatDate(sale.createdAt, { time: true })}</td>
                    <td className="p-3">{sale.customerName || '-'}</td>
                    <td className="p-3 text-muted-foreground">{sale.items.length} {'ერთეული'}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">
                        {getPaymentLabel(sale.paymentMethod)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={`text-xs ${
                        sale.status === 'completed' ? 'bg-dasta-success/10 text-dasta-success border-dasta-success/20' :
                        sale.status === 'returned' ? 'bg-dasta-danger/10 text-dasta-danger border-dasta-danger/20' :
                        'bg-dasta-warning/10 text-dasta-warning border-dasta-warning/20'
                      }`}>
                        {getStatusLabel(sale.status)}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-semibold text-foreground">{formatCurrency(sale.total)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => setSelectedSale(sale)}>
                          <Eye className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 text-dasta-info" onClick={() => handlePrintReceipt(sale)}>
                          <Printer className="size-3.5" />
                        </Button>
                        {sale.status === 'completed' && (
                          <Button variant="ghost" size="icon" className="size-8 text-dasta-danger" onClick={() => returnSale(sale.id)}>
                            <RotateCcw className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-muted-foreground">
                      <Receipt className="mx-auto mb-2 size-8 opacity-30" />
                      <p className="text-sm">{'გაყიდვა ვერ მოიძებნა'}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sale Detail Dialog */}
      {selectedSale && (
        <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{'ჩეკი: '}{selectedSale.receiptNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">{'თარიღი:'}</div>
                <div>{formatDate(selectedSale.createdAt, { time: true })}</div>
                <div className="text-muted-foreground">{'კლიენტი:'}</div>
                <div>{selectedSale.customerName || '-'}</div>
                <div className="text-muted-foreground">{'გადახდა:'}</div>
                <div>{getPaymentLabel(selectedSale.paymentMethod)}</div>
                <div className="text-muted-foreground">{'სტატუსი:'}</div>
                <div>{getStatusLabel(selectedSale.status)}</div>
              </div>
              <div className="rounded-lg border border-border">
                <div className="border-b border-border bg-secondary/50 p-2 text-xs font-medium text-muted-foreground">
                  {'პროდუქტები'}
                </div>
                {selectedSale.items.map((item, i) => (
                  <div key={i} className="flex justify-between border-b border-border/50 p-2 text-sm last:border-0">
                    <div>
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-muted-foreground">{' x'}{item.quantity}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>{'ჯამი'}</span>
                <span className="text-dasta-green">{formatCurrency(selectedSale.total)}</span>
              </div>
              <Button variant="outline" className="w-full" onClick={() => handlePrintReceipt(selectedSale)}>
                <Printer className="size-4" />
                {'ჩეკის დაბეჭდვა'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

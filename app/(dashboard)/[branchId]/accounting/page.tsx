'use client'

import { useState, useMemo } from 'react'
import { useSales } from '@/contexts/SalesContext'
import { useInventory } from '@/contexts/InventoryContext'
import { useCustomers } from '@/contexts/CustomerContext'
import { useSuppliers } from '@/contexts/SupplierContext'
import { useBranch } from '@/contexts/BranchContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { printReport } from '@/lib/print-utils'
import {
  TrendingUp, TrendingDown, DollarSign, Receipt, ShoppingBag,
  Users, Truck, Printer, PieChart, BarChart3, ArrowUpRight,
  ArrowDownRight, Wallet, CreditCard, Banknote, FileText,
  Calculator, BookOpen,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AccountingPage() {
  const { sales } = useSales()
  const { products } = useInventory()
  const { customers } = useCustomers()
  const { suppliers } = useSuppliers()
  const { currentBranch } = useBranch()
  const [activeTab, setActiveTab] = useState<'overview' | 'pnl' | 'debts' | 'taxes'>('overview')

  // Computed data
  const completedSales = sales.filter(s => s.status === 'completed')
  const returnedSales = sales.filter(s => s.status === 'returned')

  const totalRevenue = completedSales.reduce((sum, s) => sum + s.total, 0)
  const totalReturns = returnedSales.reduce((sum, s) => sum + s.total, 0)
  const totalDiscounts = completedSales.reduce((sum, s) => sum + s.discount, 0)
  const netRevenue = totalRevenue - totalReturns

  // Estimate COGS at 60% margin
  const estimatedCOGS = completedSales.reduce((sum, s) => {
    return sum + s.items.reduce((itemSum, item) => {
      const product = products.find(p => p.id === item.productId)
      return itemSum + (product?.purchasePrice || item.unitPrice * 0.6) * item.quantity
    }, 0)
  }, 0)

  const grossProfit = netRevenue - estimatedCOGS
  const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0

  // Operating expenses (estimated)
  const estimatedExpenses = netRevenue * 0.15
  const netProfit = grossProfit - estimatedExpenses
  const netMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0

  // Payment method breakdown
  const cashTotal = completedSales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0)
  const cardTotal = completedSales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0)
  const transferTotal = completedSales.filter(s => s.paymentMethod === 'transfer').reduce((sum, s) => sum + s.total, 0)

  const paymentChartData = [
    { name: 'ნაღდი', value: cashTotal },
    { name: 'ბარათი', value: cardTotal },
    { name: 'გადარიცხვა', value: transferTotal },
  ].filter(d => d.value > 0)

  // Daily sales for bar chart
  const dailySales = useMemo(() => {
    const days: Record<string, number> = {}
    completedSales.forEach(s => {
      const day = s.createdAt.split('T')[0]
      days[day] = (days[day] || 0) + s.total
    })
    return Object.entries(days).sort().slice(-7).map(([date, total]) => ({
      date: date.slice(5),
      total,
    }))
  }, [completedSales])

  // Product category breakdown
  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, number> = {}
    completedSales.forEach(s => {
      s.items.forEach(item => {
        const product = products.find(p => p.id === item.productId)
        const catName = product?.categoryId || 'სხვა'
        cats[catName] = (cats[catName] || 0) + item.total
      })
    })
    return Object.entries(cats).map(([name, value]) => ({ name, value }))
  }, [completedSales, products])

  // Debt data
  const customerDebt = customers.reduce((sum, c) => sum + (c.debt || 0), 0)
  const supplierDebt = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0)

  // Inventory value
  const inventoryValue = products.reduce((sum, p) => sum + p.purchasePrice * p.stock, 0)
  const inventoryRetailValue = products.reduce((sum, p) => sum + p.salePrice * p.stock, 0)

  // Estimated tax (18% VAT)
  const estimatedVAT = netRevenue * 0.18
  const estimatedIncomeTax = netProfit > 0 ? netProfit * 0.15 : 0

  function handlePrintPnL() {
    printReport({
      title: 'მოგება-ზარალის ანგარიში',
      branchName: currentBranch.name,
      period: 'ყველა პერიოდი',
      generatedAt: new Date().toLocaleString('ka-GE'),
      sections: [
        {
          title: 'შემოსავალი',
          rows: [
            { label: 'ჯამური გაყიდვები', value: formatCurrency(totalRevenue) },
            { label: 'დაბრუნებები', value: `- ${formatCurrency(totalReturns)}` },
            { label: 'ფასდაკლებები', value: `- ${formatCurrency(totalDiscounts)}` },
            { label: 'წმინდა შემოსავალი', value: formatCurrency(netRevenue) },
          ],
        },
        {
          title: 'ხარჯები',
          rows: [
            { label: 'პროდუქციის ღირებულება (COGS)', value: formatCurrency(estimatedCOGS) },
            { label: 'საოპერაციო ხარჯები', value: formatCurrency(estimatedExpenses) },
          ],
        },
        {
          title: 'მოგება',
          rows: [
            { label: 'მთლიანი მოგება', value: formatCurrency(grossProfit) },
            { label: 'მთლიანი მარჟა', value: `${grossMargin.toFixed(1)}%` },
            { label: 'წმინდა მოგება', value: formatCurrency(netProfit) },
            { label: 'წმინდა მარჟა', value: `${netMargin.toFixed(1)}%` },
          ],
        },
        {
          title: 'სავარაუდო გადასახადები',
          rows: [
            { label: 'დღგ (18%)', value: formatCurrency(estimatedVAT) },
            { label: 'საშემოსავლო (15%)', value: formatCurrency(estimatedIncomeTax) },
          ],
        },
      ],
    })
  }

  const tabs = [
    { id: 'overview' as const, label: 'მიმოხილვა', icon: PieChart },
    { id: 'pnl' as const, label: 'მოგ-ზარ', icon: BarChart3 },
    { id: 'debts' as const, label: 'ვალდებულებები', icon: Wallet },
    { id: 'taxes' as const, label: 'გადასახადები', icon: Calculator },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">{'ბუღალტერია'}</h1>
          <p className="text-sm text-muted-foreground">{'ფინანსური ანალიტიკა და ანგარიშგება'}</p>
        </div>
        <Button variant="outline" onClick={handlePrintPnL}>
          <Printer className="size-4" />
          {'ანგარიშის ბეჭდვა'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-secondary/50 p-1">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10">
                  <DollarSign className="size-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{'წმინდა შემოსავალი'}</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(netRevenue)}</p>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-emerald-500">
                    <ArrowUpRight className="size-3" />
                    <span>{completedSales.length} {'ჩეკი'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <TrendingUp className="size-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{'წმინდა მოგება'}</p>
                  <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(netProfit)}</p>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{'მარჟა:'} {netMargin.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10">
                  <ShoppingBag className="size-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{'მარაგის ღირებულება'}</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(inventoryValue)}</p>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    <span>{'საცალო:'} {formatCurrency(inventoryRetailValue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-red-500/10">
                  <Wallet className="size-6 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{'ვალდებულებები'}</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(customerDebt + supplierDebt)}</p>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    <span>{'კლიენტები + მომწოდებლები'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily Sales Bar Chart */}
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-4 text-sm font-bold text-foreground">{'დღიური გაყიდვები (ბოლო 7 დღე)'}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(2)} ₾`, 'თანხა']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Pie */}
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-4 text-sm font-bold text-foreground">{'გადახდის მეთოდები'}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie data={paymentChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                        {paymentChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v.toFixed(2)} ₾`, '']} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Profit & Loss Tab */}
      {activeTab === 'pnl' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <BookOpen className="size-5" />
                  {'მოგება-ზარალის ანგარიში'}
                </h3>
              </div>
              <div className="space-y-1">
                {/* Revenue Section */}
                <div className="rounded-lg bg-emerald-500/5 p-4">
                  <h4 className="mb-3 text-sm font-bold text-emerald-600 uppercase tracking-wider">{'შემოსავალი'}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{'ჯამური გაყიდვები'}</span><span className="font-medium">{formatCurrency(totalRevenue)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{'დაბრუნებები'}</span><span className="font-medium text-red-500">{'- '}{formatCurrency(totalReturns)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{'ფასდაკლებები'}</span><span className="font-medium text-red-500">{'- '}{formatCurrency(totalDiscounts)}</span></div>
                    <div className="flex justify-between border-t border-emerald-500/20 pt-2 text-sm font-bold"><span>{'წმინდა შემოსავალი'}</span><span className="text-emerald-600">{formatCurrency(netRevenue)}</span></div>
                  </div>
                </div>

                {/* COGS Section */}
                <div className="rounded-lg bg-blue-500/5 p-4">
                  <h4 className="mb-3 text-sm font-bold text-blue-600 uppercase tracking-wider">{'ხარჯები'}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{'პროდუქციის ღირებულება (COGS)'}</span><span className="font-medium">{formatCurrency(estimatedCOGS)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{'საოპერაციო ხარჯები (სავ.)'}</span><span className="font-medium">{formatCurrency(estimatedExpenses)}</span></div>
                  </div>
                </div>

                {/* Profit Section */}
                <div className={`rounded-lg p-4 ${netProfit >= 0 ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
                  <h4 className={`mb-3 text-sm font-bold uppercase tracking-wider ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{'მოგება'}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{'მთლიანი მოგება'}</span><span className="font-medium">{formatCurrency(grossProfit)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{'მთლიანი მარჟა'}</span><span className="font-medium">{grossMargin.toFixed(1)}%</span></div>
                    <div className="flex justify-between border-t border-current/20 pt-2 text-base font-bold"><span>{'წმინდა მოგება'}</span><span className={netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}>{formatCurrency(netProfit)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{'წმინდა მარჟა'}</span><span className="font-medium">{netMargin.toFixed(1)}%</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Debts Tab */}
      {activeTab === 'debts' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10"><Users className="size-5 text-amber-500" /></div>
                  <div><h3 className="text-sm font-bold text-foreground">{'კლიენტების ვალი'}</h3><p className="text-xs text-muted-foreground">{'გვემართებათ'}</p></div>
                  <span className="ml-auto text-lg font-bold text-amber-600">{formatCurrency(customerDebt)}</span>
                </div>
                <div className="space-y-2">
                  {customers.filter(c => c.debt > 0).map(c => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                      <span className="font-medium text-foreground">{c.fullName}</span>
                      <span className="font-bold text-amber-600">{formatCurrency(c.debt)}</span>
                    </div>
                  ))}
                  {customers.filter(c => c.debt > 0).length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">{'კლიენტებს ვალი არ აქვთ'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10"><Truck className="size-5 text-red-500" /></div>
                  <div><h3 className="text-sm font-bold text-foreground">{'მომწოდებლების ვალი'}</h3><p className="text-xs text-muted-foreground">{'ვემართებით'}</p></div>
                  <span className="ml-auto text-lg font-bold text-red-600">{formatCurrency(supplierDebt)}</span>
                </div>
                <div className="space-y-2">
                  {suppliers.filter(s => s.balance > 0).map(s => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                      <span className="font-medium text-foreground">{s.name}</span>
                      <span className="font-bold text-red-600">{formatCurrency(s.balance)}</span>
                    </div>
                  ))}
                  {suppliers.filter(s => s.balance > 0).length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">{'მომწოდებლებთან ვალი არ არის'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Net Position */}
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-4 text-sm font-bold text-foreground">{'წმინდა პოზიცია'}</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-emerald-500/5 p-4 text-center">
                  <p className="text-xs text-muted-foreground">{'მოთხოვნები (გვემართებათ)'}</p>
                  <p className="text-xl font-bold text-emerald-600">{formatCurrency(customerDebt)}</p>
                </div>
                <div className="rounded-lg bg-red-500/5 p-4 text-center">
                  <p className="text-xs text-muted-foreground">{'ვალდებულებები (ვემართებით)'}</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(supplierDebt)}</p>
                </div>
                <div className={`rounded-lg p-4 text-center ${customerDebt - supplierDebt >= 0 ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
                  <p className="text-xs text-muted-foreground">{'წმინდა ბალანსი'}</p>
                  <p className={`text-xl font-bold ${customerDebt - supplierDebt >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(customerDebt - supplierDebt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Taxes Tab */}
      {activeTab === 'taxes' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="flex items-center gap-2 mb-6 text-lg font-bold text-foreground">
                <Calculator className="size-5" />
                {'სავარაუდო გადასახადები'}
              </h3>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 mb-6">
                <p className="text-sm text-amber-700">
                  {'ეს არის სავარაუდო გამოთვლები. საბოლოო გადასახადების გამოთვლისთვის მიმართეთ ბუღალტერს ან გამოიყენეთ RS.GE ინტეგრაცია.'}
                </p>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-secondary/50 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-foreground">{'დღგ (18%)'}</h4>
                    <Badge variant="secondary">{'საქართველოს კანონმდებლობა'}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{'დასაბეგრი ბაზა'}</span><span>{formatCurrency(netRevenue)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{'განაკვეთი'}</span><span>18%</span></div>
                    <div className="flex justify-between text-sm font-bold border-t border-border pt-2"><span>{'სავარაუდო დღგ'}</span><span className="text-amber-600">{formatCurrency(estimatedVAT)}</span></div>
                  </div>
                </div>
                <div className="rounded-lg bg-secondary/50 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-foreground">{'საშემოსავლო გადასახადი (15%)'}</h4>
                    <Badge variant="secondary">{'საქართველოს კანონმდებლობა'}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{'დასაბეგრი მოგება'}</span><span>{formatCurrency(Math.max(0, netProfit))}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{'განაკვეთი'}</span><span>15%</span></div>
                    <div className="flex justify-between text-sm font-bold border-t border-border pt-2"><span>{'სავარაუდო გადასახადი'}</span><span className="text-amber-600">{formatCurrency(estimatedIncomeTax)}</span></div>
                  </div>
                </div>
                <div className="rounded-lg border-2 border-dasta-green/30 bg-dasta-green/5 p-4">
                  <div className="flex justify-between text-base font-bold"><span>{'ჯამური სავარაუდო გადასახადები'}</span><span className="text-dasta-green">{formatCurrency(estimatedVAT + estimatedIncomeTax)}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

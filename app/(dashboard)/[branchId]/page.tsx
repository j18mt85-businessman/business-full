'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useSales } from '@/contexts/SalesContext'
import { useInventory } from '@/contexts/InventoryContext'
import { useCustomers } from '@/contexts/CustomerContext'
import { useBranch } from '@/contexts/BranchContext'
import { formatCurrency, formatDate, getPaymentLabel, timeAgo } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DollarSign, Receipt, TrendingUp, ShoppingCart, Package, AlertTriangle,
  Plus, FileText, ArrowUpRight, ArrowDownRight, Users,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#6b7280', '#dc2626']

export default function DashboardPage() {
  const { sales } = useSales()
  const { products, alerts, getCategoryName } = useInventory()
  const { customers } = useCustomers()
  const { currentBranch } = useBranch()

  const stats = useMemo(() => {
    const todaySales = sales.filter(s => s.status === 'completed')
    const totalRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)
    const totalCost = todaySales.reduce((sum, s) =>
      sum + s.items.reduce((itemSum, item) => {
        const product = products.find(p => p.id === item.productId)
        return itemSum + (product?.costPrice || 0) * item.quantity
      }, 0), 0)
    const avgCheck = todaySales.length > 0 ? totalRevenue / todaySales.length : 0
    const profit = totalRevenue - totalCost

    return {
      revenue: totalRevenue,
      checks: todaySales.length,
      avgCheck,
      profit,
      profitMargin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0,
    }
  }, [sales, products])

  const salesTrend = useMemo(() => {
    const days = ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი']
    return days.map((day, i) => ({
      day,
      sales: Math.floor(Math.random() * 500) + 200 + stats.revenue * (0.1 + Math.random() * 0.2),
    }))
  }, [stats.revenue])

  const categoryData = useMemo(() => {
    const catMap = new Map<string, number>()
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId)
        if (product) {
          const catName = getCategoryName(product.categoryId)
          catMap.set(catName, (catMap.get(catName) || 0) + item.total)
        }
      })
    })
    return Array.from(catMap.entries()).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
  }, [sales, products, getCategoryName])

  const recentSales = sales.slice(0, 8)

  const totalDebt = customers.reduce((sum, c) => sum + c.debt, 0)
  const debtCustomers = customers.filter(c => c.debt > 0).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">{'დეშბორდი'}</h1>
          <p className="text-sm text-muted-foreground">{currentBranch.name} {'- დღის მიმოხილვა'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${currentBranch.id}/pos`}>
            <Button className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
              <Plus className="size-4" />
              {'ახალი გაყიდვა'}
            </Button>
          </Link>
          <Link href={`/${currentBranch.id}/inventory`}>
            <Button variant="outline">
              <Package className="size-4" />
              {'პროდუქტი'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="გაყიდვები დღეს"
          value={formatCurrency(stats.revenue)}
          icon={<DollarSign className="size-5" />}
          trend="+12.5%"
          trendUp
        />
        <StatCard
          title="ჩეკები"
          value={String(stats.checks)}
          icon={<Receipt className="size-5" />}
          trend="+3"
          trendUp
        />
        <StatCard
          title="საშუალო ჩეკი"
          value={formatCurrency(stats.avgCheck)}
          icon={<ShoppingCart className="size-5" />}
          trend="+5.2%"
          trendUp
        />
        <StatCard
          title="მოგება"
          value={formatCurrency(stats.profit)}
          icon={<TrendingUp className="size-5" />}
          trend={`${stats.profitMargin.toFixed(1)}%`}
          trendUp={stats.profitMargin > 20}
        />
      </div>

      {/* Charts + Recent Sales */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">{'გაყიდვების ტრენდი (7 დღე)'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'გაყიდვები']}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{'კატეგორიებით'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debt + Alerts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Debt Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">{'ვალების მიმოხილვა'}</CardTitle>
            <Link href={`/${currentBranch.id}/customers`}>
              <Button variant="ghost" size="sm" className="text-dasta-green">
                {'ყველა'}
                <ArrowUpRight className="size-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-secondary p-4">
                <div className="text-sm text-muted-foreground">{'ჯამური ვალი'}</div>
                <div className="mt-1 text-2xl font-bold text-dasta-danger">{formatCurrency(totalDebt)}</div>
              </div>
              <div className="rounded-lg bg-secondary p-4">
                <div className="text-sm text-muted-foreground">{'მოვალეები'}</div>
                <div className="mt-1 text-2xl font-bold text-foreground">{debtCustomers}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {customers.filter(c => c.debt > 0).slice(0, 3).map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <span className="font-medium">{c.fullName}</span>
                  </div>
                  <span className="font-semibold text-dasta-danger">{formatCurrency(c.debt)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">{'მარაგის გაფრთხილებები'}</CardTitle>
            <Link href={`/${currentBranch.id}/alerts`}>
              <Button variant="ghost" size="sm" className="text-dasta-green">
                {'ყველა'}
                <ArrowUpRight className="size-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{'გაფრთხილებები არ არის'}</p>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 5).map(alert => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                      alert.severity === 'critical' ? 'bg-dasta-danger/10' :
                      alert.severity === 'warning' ? 'bg-dasta-warning/10' : 'bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`size-4 ${
                        alert.severity === 'critical' ? 'text-dasta-danger' :
                        alert.severity === 'warning' ? 'text-dasta-warning' : 'text-dasta-info'
                      }`} />
                      <span className="font-medium">{alert.productName}</span>
                    </div>
                    <span className={`font-mono text-xs font-bold ${
                      alert.severity === 'critical' ? 'text-dasta-danger' :
                      alert.severity === 'warning' ? 'text-dasta-warning' : 'text-muted-foreground'
                    }`}>
                      {alert.currentStock} / {alert.minStock}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">{'ბოლო გაყიდვები'}</CardTitle>
          <Link href={`/${currentBranch.id}/sales`}>
            <Button variant="ghost" size="sm" className="text-dasta-green">
              {'ყველა'}
              <ArrowUpRight className="size-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">{'ჩეკი'}</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">{'დრო'}</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">{'კლიენტი'}</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">{'გადახდა'}</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">{'თანხა'}</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map(sale => (
                  <tr key={sale.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-mono text-xs">{sale.receiptNumber}</td>
                    <td className="py-3 text-muted-foreground">{timeAgo(sale.createdAt)}</td>
                    <td className="py-3">{sale.customerName || '-'}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        sale.paymentMethod === 'cash' ? 'bg-dasta-success/10 text-dasta-success' :
                        sale.paymentMethod === 'card' ? 'bg-dasta-info/10 text-dasta-info' :
                        'bg-dasta-warning/10 text-dasta-warning'
                      }`}>
                        {getPaymentLabel(sale.paymentMethod)}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold">{formatCurrency(sale.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon, trend, trendUp }: {
  title: string; value: string; icon: React.ReactNode; trend: string; trendUp: boolean
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dasta-green/10 text-dasta-green">
            {icon}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs">
          {trendUp ? (
            <ArrowUpRight className="size-3 text-dasta-success" />
          ) : (
            <ArrowDownRight className="size-3 text-dasta-danger" />
          )}
          <span className={trendUp ? 'text-dasta-success' : 'text-dasta-danger'}>{trend}</span>
          <span className="text-muted-foreground">{'წინა პერიოდთან'}</span>
        </div>
      </CardContent>
    </Card>
  )
}

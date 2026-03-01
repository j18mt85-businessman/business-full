'use client'

import { useInventory } from '@/contexts/InventoryContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, Info, Package } from 'lucide-react'

export default function AlertsPage() {
  const { alerts } = useInventory()

  const critical = alerts.filter(a => a.severity === 'critical')
  const warning = alerts.filter(a => a.severity === 'warning')
  const info = alerts.filter(a => a.severity === 'info')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">{'გაფრთხილებები'}</h1>
        <p className="text-sm text-muted-foreground">{alerts.length} {'აქტიური გაფრთხილება'}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-dasta-danger/20 bg-dasta-danger/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-danger/10">
              <AlertCircle className="size-5 text-dasta-danger" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'კრიტიკული'}</p>
              <p className="text-xl font-bold text-dasta-danger">{critical.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-dasta-warning/20 bg-dasta-warning/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-warning/10">
              <AlertTriangle className="size-5 text-dasta-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'გაფრთხილება'}</p>
              <p className="text-xl font-bold text-dasta-warning">{warning.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-dasta-info/20 bg-dasta-info/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-info/10">
              <Info className="size-5 text-dasta-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{'ინფორმაცია'}</p>
              <p className="text-xl font-bold text-dasta-info">{info.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert List */}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Package className="mb-3 size-12 text-dasta-success opacity-50" />
            <h3 className="text-lg font-bold text-foreground">{'ყველაფერი წესრიგშია!'}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{'აქტიური გაფრთხილებები არ არის'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Critical */}
          {critical.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-dasta-danger">
                  <AlertCircle className="size-4" />
                  {'კრიტიკული'} ({critical.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {critical.map(alert => (
                  <AlertRow key={alert.id} alert={alert} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Warning */}
          {warning.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-dasta-warning">
                  <AlertTriangle className="size-4" />
                  {'გაფრთხილება'} ({warning.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {warning.map(alert => (
                  <AlertRow key={alert.id} alert={alert} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Info */}
          {info.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-dasta-info">
                  <Info className="size-4" />
                  {'ინფორმაცია'} ({info.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {info.map(alert => (
                  <AlertRow key={alert.id} alert={alert} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function AlertRow({ alert }: { alert: { id: string; productName: string; currentStock: number; minStock: number; severity: string } }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-4 py-3 ${
      alert.severity === 'critical' ? 'bg-dasta-danger/10' :
      alert.severity === 'warning' ? 'bg-dasta-warning/10' : 'bg-dasta-info/10'
    }`}>
      <div className="flex items-center gap-3">
        <Package className="size-5 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">{alert.productName}</p>
          <p className="text-xs text-muted-foreground">
            {'მიმდინარე მარაგი: '}{alert.currentStock} {' | მინ. მარაგი: '}{alert.minStock}
          </p>
        </div>
      </div>
      <Badge className={`text-xs ${
        alert.severity === 'critical'
          ? 'bg-dasta-danger text-white'
          : alert.severity === 'warning'
          ? 'bg-dasta-warning text-white'
          : 'bg-dasta-info text-white'
      }`}>
        {alert.currentStock === 0 ? 'ამოწურულია' : 'მცირე მარაგი'}
      </Badge>
    </div>
  )
}

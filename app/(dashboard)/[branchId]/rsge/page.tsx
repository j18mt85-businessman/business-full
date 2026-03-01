'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useSales } from '@/contexts/SalesContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Globe, FileText, Send, RefreshCcw, CheckCircle2, XCircle,
  Clock, AlertTriangle, Shield, Settings, Link, Unlink,
  ChevronRight, Truck, Receipt, Building2, Key,
} from 'lucide-react'

type RSStatus = 'connected' | 'disconnected' | 'pending'
type WaybillStatus = 'draft' | 'sent' | 'confirmed' | 'cancelled'

interface Waybill {
  id: string
  number: string
  type: 'inner' | 'transport' | 'return'
  status: WaybillStatus
  date: string
  buyer: string
  total: number
  items: number
}

const MOCK_WAYBILLS: Waybill[] = [
  { id: 'wb-1', number: 'WB-000125', type: 'inner', status: 'confirmed', date: '2026-02-28T14:30:00', buyer: 'შპს ბარსი', total: 2450.00, items: 12 },
  { id: 'wb-2', number: 'WB-000126', type: 'transport', status: 'sent', date: '2026-02-28T16:00:00', buyer: 'შპს მარკეტი', total: 890.50, items: 5 },
  { id: 'wb-3', number: 'WB-000127', type: 'inner', status: 'draft', date: '2026-03-01T09:15:00', buyer: 'შპს დელტა', total: 1340.00, items: 8 },
  { id: 'wb-4', number: 'WB-000128', type: 'return', status: 'cancelled', date: '2026-02-27T11:00:00', buyer: 'შპს ალფა', total: 320.00, items: 2 },
]

export default function RSGEPage() {
  const { sales } = useSales()
  const [rsStatus, setRsStatus] = useState<RSStatus>('disconnected')
  const [activeTab, setActiveTab] = useState<'waybills' | 'invoices' | 'settings'>('waybills')
  const [serviceUser, setServiceUser] = useState('')
  const [servicePassword, setServicePassword] = useState('')
  const [companyTIN, setCompanyTIN] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [waybills] = useState<Waybill[]>(MOCK_WAYBILLS)

  function handleConnect() {
    if (!serviceUser || !servicePassword || !companyTIN) return
    setIsConnecting(true)
    setTimeout(() => {
      setRsStatus('connected')
      setIsConnecting(false)
    }, 1500)
  }

  function handleDisconnect() {
    setRsStatus('disconnected')
    setServiceUser('')
    setServicePassword('')
    setCompanyTIN('')
  }

  function getStatusBadge(status: WaybillStatus) {
    const styles = {
      draft: 'bg-secondary text-muted-foreground',
      sent: 'bg-blue-500/10 text-blue-600',
      confirmed: 'bg-emerald-500/10 text-emerald-600',
      cancelled: 'bg-red-500/10 text-red-600',
    }
    const labels = { draft: 'მონახაზი', sent: 'გაგზავნილი', confirmed: 'დადასტურებული', cancelled: 'გაუქმებული' }
    return <Badge className={`text-xs ${styles[status]}`}>{labels[status]}</Badge>
  }

  function getTypeLabel(type: 'inner' | 'transport' | 'return') {
    const labels = { inner: 'შიდა', transport: 'სატრანსპორტო', return: 'დაბრუნება' }
    return labels[type]
  }

  const tabs = [
    { id: 'waybills' as const, label: 'ზედნადებები', icon: FileText },
    { id: 'invoices' as const, label: 'ინვოისები', icon: Receipt },
    { id: 'settings' as const, label: 'კონფიგურაცია', icon: Settings },
  ]

  const sentToday = waybills.filter(w => w.status !== 'draft').length
  const confirmedToday = waybills.filter(w => w.status === 'confirmed').length
  const pendingToday = waybills.filter(w => w.status === 'sent').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">{'RS.GE ინტეგრაცია'}</h1>
          <p className="text-sm text-muted-foreground">{'შემოსავლების სამსახურის სისტემასთან კავშირი'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
            rsStatus === 'connected'
              ? 'bg-emerald-500/10 text-emerald-600'
              : rsStatus === 'pending'
                ? 'bg-amber-500/10 text-amber-600'
                : 'bg-red-500/10 text-red-600'
          }`}>
            <div className={`size-2 rounded-full ${
              rsStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : rsStatus === 'pending' ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            {rsStatus === 'connected' ? 'დაკავშირებულია' : rsStatus === 'pending' ? 'მოლოდინში...' : 'არ არის დაკავშირებული'}
          </div>
        </div>
      </div>

      {/* Stats */}
      {rsStatus === 'connected' && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10"><Send className="size-5 text-blue-500" /></div>
              <div><p className="text-xs text-muted-foreground">{'გაგზავნილი დღეს'}</p><p className="text-xl font-bold text-foreground">{sentToday}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10"><CheckCircle2 className="size-5 text-emerald-500" /></div>
              <div><p className="text-xs text-muted-foreground">{'დადასტურებული'}</p><p className="text-xl font-bold text-foreground">{confirmedToday}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10"><Clock className="size-5 text-amber-500" /></div>
              <div><p className="text-xs text-muted-foreground">{'მოლოდინში'}</p><p className="text-xl font-bold text-foreground">{pendingToday}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-dasta-green/10"><Globe className="size-5 text-dasta-green" /></div>
              <div><p className="text-xs text-muted-foreground">{'ჯამური თანხა'}</p><p className="text-xl font-bold text-foreground">{formatCurrency(waybills.reduce((s, w) => s + w.total, 0))}</p></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Connection Setup */}
      {rsStatus === 'disconnected' && (
        <Card>
          <CardContent className="p-8">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-dasta-green/10">
                <Globe className="size-8 text-dasta-green" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-foreground">{'RS.GE-სთან დაკავშირება'}</h2>
              <p className="mb-8 text-sm text-muted-foreground">
                {'შეიყვანეთ RS.GE სერვის მომხმარებლის მონაცემები ზედნადებების და ინვოისების ავტომატური გაგზავნისთვის.'}
              </p>
              <div className="space-y-4 text-left">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">{'საიდენტიფიკაციო კოდი (TIN)'}</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={companyTIN} onChange={e => setCompanyTIN(e.target.value)} placeholder="000000000" className="pl-10" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">{'სერვის მომხმარებელი'}</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={serviceUser} onChange={e => setServiceUser(e.target.value)} placeholder="RS.GE სერვის username" className="pl-10" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">{'სერვის პაროლი'}</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="password" value={servicePassword} onChange={e => setServicePassword(e.target.value)} placeholder="RS.GE სერვის password" className="pl-10" />
                  </div>
                </div>
                <Button onClick={handleConnect} disabled={isConnecting || !serviceUser || !servicePassword || !companyTIN} className="w-full bg-dasta-green text-white hover:bg-dasta-green/90" size="lg">
                  {isConnecting ? <><RefreshCcw className="size-4 animate-spin" />{'დაკავშირება...'}</> : <><Link className="size-4" />{'დაკავშირება'}</>}
                </Button>
              </div>
              <div className="mt-6 rounded-lg bg-secondary/50 p-4">
                <h4 className="mb-2 text-xs font-bold text-foreground uppercase tracking-wider">{'როგორ მივიღო სერვის მომხმარებელი?'}</h4>
                <ol className="space-y-1 text-xs text-muted-foreground text-left list-decimal list-inside">
                  <li>{'შედით rs.ge-ზე თქვენი მომხმარებლით'}</li>
                  <li>{'გადახვიდეთ "სერვისის მომხმარებელი" განყოფილებაში'}</li>
                  <li>{'შექმენით ახალი სერვის მომხმარებელი ზედნადებების უფლებით'}</li>
                  <li>{'დაკოპირეთ username და password აქ'}</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected State - Tabs */}
      {rsStatus === 'connected' && (
        <>
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

          {/* Waybills Tab */}
          {activeTab === 'waybills' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{'ზედნადებები'}</h3>
                <Button className="bg-dasta-green text-white hover:bg-dasta-green/90">
                  <FileText className="size-4" />
                  {'ახალი ზედნადები'}
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-secondary/50">
                          <th className="p-3 text-left font-medium text-muted-foreground">{'ნომერი'}</th>
                          <th className="p-3 text-left font-medium text-muted-foreground">{'ტიპი'}</th>
                          <th className="p-3 text-left font-medium text-muted-foreground">{'თარიღი'}</th>
                          <th className="p-3 text-left font-medium text-muted-foreground">{'მყიდველი'}</th>
                          <th className="p-3 text-left font-medium text-muted-foreground">{'ერთეული'}</th>
                          <th className="p-3 text-left font-medium text-muted-foreground">{'სტატუსი'}</th>
                          <th className="p-3 text-right font-medium text-muted-foreground">{'თანხა'}</th>
                          <th className="p-3 text-right font-medium text-muted-foreground">{'მოქმედება'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {waybills.map(wb => (
                          <tr key={wb.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30 last:border-0">
                            <td className="p-3 font-mono text-xs font-bold text-foreground">{wb.number}</td>
                            <td className="p-3"><Badge variant="outline" className="text-xs">{getTypeLabel(wb.type)}</Badge></td>
                            <td className="p-3 text-muted-foreground">{formatDate(wb.date, { time: true })}</td>
                            <td className="p-3 font-medium text-foreground">{wb.buyer}</td>
                            <td className="p-3 text-muted-foreground">{wb.items}</td>
                            <td className="p-3">{getStatusBadge(wb.status)}</td>
                            <td className="p-3 text-right font-bold text-foreground">{formatCurrency(wb.total)}</td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {wb.status === 'draft' && (
                                  <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-500"><Send className="size-3" />{'გაგზავნა'}</Button>
                                )}
                                <Button variant="ghost" size="icon" className="size-7"><ChevronRight className="size-4" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{'ინვოისები'}</h3>
                <Button className="bg-dasta-green text-white hover:bg-dasta-green/90">
                  <Receipt className="size-4" />
                  {'ახალი ინვოისი'}
                </Button>
              </div>
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <Receipt className="mx-auto mb-4 size-12 text-muted-foreground/30" />
                    <h4 className="mb-2 text-lg font-bold text-foreground">{'ინვოისების მოდული'}</h4>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {'RS.GE ინვოისების ავტომატურად გენერირება გაყიდვებიდან. ინვოისი იგზავნება RS.GE-ზე და კლიენტს ელექტრონულად.'}
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3 max-w-lg mx-auto">
                      <div className="rounded-lg bg-secondary/50 p-3 text-center">
                        <p className="text-2xl font-bold text-foreground">{sales.filter(s => s.status === 'completed').length}</p>
                        <p className="text-xs text-muted-foreground">{'გაყიდვები'}</p>
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-3 text-center">
                        <p className="text-2xl font-bold text-amber-500">0</p>
                        <p className="text-xs text-muted-foreground">{'მოლოდინში'}</p>
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-500">0</p>
                        <p className="text-xs text-muted-foreground">{'გაგზავნილი'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="flex items-center gap-2 mb-6 text-lg font-bold text-foreground">
                    <Settings className="size-5" />
                    {'RS.GE კონფიგურაცია'}
                  </h3>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-foreground">{'კავშირის მონაცემები'}</h4>
                      <div className="rounded-lg bg-emerald-500/5 p-4 space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">{'სტატუსი'}</span><span className="font-medium text-emerald-600">{'დაკავშირებულია'}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">{'TIN'}</span><span className="font-medium font-mono">{companyTIN || '000000000'}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">{'მომხმარებელი'}</span><span className="font-medium">{serviceUser || 'service_user'}</span></div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={handleDisconnect} className="w-full">
                        <Unlink className="size-4" />
                        {'კავშირის გათიშვა'}
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-foreground">{'ავტომატიზაცია'}</h4>
                      <div className="space-y-3">
                        {[
                          { label: 'ავტომატური ზედნადები გაყიდვიდან', desc: 'ყოველი გაყიდვისას ავტომატურად იქმნება ზედნადები', enabled: true },
                          { label: 'ავტომატური ინვოისი', desc: 'ინვოისი ავტომატურად იგზავნება RS.GE-ზე', enabled: false },
                          { label: 'საწყობის სინქრონიზაცია', desc: 'მარაგი სინქრონიზდება RS.GE-სთან', enabled: false },
                        ].map((setting, i) => (
                          <div key={i} className="flex items-start justify-between rounded-lg bg-secondary/50 p-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">{setting.label}</p>
                              <p className="text-xs text-muted-foreground">{setting.desc}</p>
                            </div>
                            <button
                              className={`relative h-6 w-11 rounded-full transition-colors ${setting.enabled ? 'bg-dasta-green' : 'bg-border'}`}
                              aria-label={setting.label}
                            >
                              <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${setting.enabled ? 'left-[22px]' : 'left-0.5'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}

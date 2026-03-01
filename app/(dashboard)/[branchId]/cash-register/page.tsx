'use client'

import { useState } from 'react'
import { useCashRegister } from '@/contexts/CashRegisterContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Banknote, Lock, Unlock, Plus, Minus, Clock, ArrowDownLeft, ArrowUpRight,
} from 'lucide-react'

export default function CashRegisterPage() {
  const { pastSessions, currentSession, openSession, closeSession, addMovement } = useCashRegister()
  const [openAmount, setOpenAmount] = useState('')
  const [isOpenDialog, setIsOpenDialog] = useState(false)
  const [isMoveDialog, setIsMoveDialog] = useState(false)
  const [moveType, setMoveType] = useState<'in' | 'out'>('in')
  const [moveAmount, setMoveAmount] = useState('')
  const [moveNote, setMoveNote] = useState('')

  function handleOpen() {
    openSession(Number(openAmount))
    setOpenAmount('')
    setIsOpenDialog(false)
  }

  function handleClose() {
    if (!currentSession) return
    const movementsNet = currentSession.movements.reduce((sum, m) => sum + (m.type === 'in' ? m.amount : -m.amount), 0)
    const calculatedBalance = currentSession.openingBalance + currentSession.totalCash + movementsNet
    closeSession(calculatedBalance)
  }

  function handleMove() {
    if (!currentSession || !moveAmount) return
    addMovement(moveType, Number(moveAmount), moveNote || (moveType === 'in' ? 'ნაღდის შეტანა' : 'ნაღდის გატანა'))
    setMoveAmount('')
    setMoveNote('')
    setIsMoveDialog(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">{'სალარო'}</h1>
          <p className="text-sm text-muted-foreground">{'სალაროს სესიების მართვა'}</p>
        </div>
        {!currentSession ? (
          <Button onClick={() => setIsOpenDialog(true)} className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
            <Unlock className="size-4" />
            {'სალაროს გახსნა'}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => { setMoveType('in'); setIsMoveDialog(true) }} variant="outline">
              <ArrowDownLeft className="size-4 text-dasta-success" />
              {'შეტანა'}
            </Button>
            <Button onClick={() => { setMoveType('out'); setIsMoveDialog(true) }} variant="outline">
              <ArrowUpRight className="size-4 text-dasta-danger" />
              {'გატანა'}
            </Button>
            <Button onClick={handleClose} variant="destructive">
              <Lock className="size-4" />
              {'დახურვა'}
            </Button>
          </div>
        )}
      </div>

      {/* Current Session Status */}
      {currentSession ? (
        <Card className="border-dasta-green/30 bg-dasta-green/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-dasta-green/10">
                <Unlock className="size-6 text-dasta-green" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{'სალარო გახსნილია'}</p>
                <p className="text-sm text-muted-foreground">
                  {'გახსნა: '}{formatDate(currentSession.openedAt, { time: true })}
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground">{'საწყისი თანხა'}</p>
                <p className="mt-1 text-xl font-bold text-foreground">{formatCurrency(currentSession.openingBalance)}</p>
              </div>
              <div className="rounded-lg bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground">{'ნაღდი გაყიდვები'}</p>
                <p className="mt-1 text-xl font-bold text-dasta-success">{formatCurrency(currentSession.totalCash)}</p>
              </div>
              <div className="rounded-lg bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground">{'ბარათით გაყიდვები'}</p>
                <p className="mt-1 text-xl font-bold text-dasta-info">{formatCurrency(currentSession.totalCard)}</p>
              </div>
              <div className="rounded-lg bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground">{'მიმდინარე ბალანსი'}</p>
                <p className="mt-1 text-xl font-bold text-dasta-green">{formatCurrency(
                  currentSession.openingBalance + currentSession.totalCash + currentSession.movements.reduce((s, m) => s + (m.type === 'in' ? m.amount : -m.amount), 0)
                )}</p>
              </div>
            </div>

            {/* Cash Movements */}
            {currentSession.movements.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">{'ნაღდის მოძრაობა'}</h3>
                <div className="space-y-2">
                  {currentSession.movements.map((m, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-card px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        {m.type === 'in' ? (
                          <ArrowDownLeft className="size-4 text-dasta-success" />
                        ) : (
                          <ArrowUpRight className="size-4 text-dasta-danger" />
                        )}
                        <span>{m.reason}</span>
                      </div>
                      <span className={`font-bold ${m.type === 'in' ? 'text-dasta-success' : 'text-dasta-danger'}`}>
                        {m.type === 'in' ? '+' : '-'}{formatCurrency(m.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Lock className="mb-3 size-12 text-muted-foreground/30" />
            <h3 className="text-lg font-bold text-foreground">{'სალარო დახურულია'}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{'გახსენით სალარო გაყიდვების დასაწყებად'}</p>
          </CardContent>
        </Card>
      )}

      {/* Past Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{'წინა სესიები'}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="p-3 text-left font-medium text-muted-foreground">{'გახსნა'}</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'დახურვა'}</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'საწყისი'}</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'ნაღდი'}</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'ბარათი'}</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">{'სტატუსი'}</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">{'დახურვის ბალანსი'}</th>
                </tr>
              </thead>
              <tbody>
                {pastSessions.filter(s => s.status === 'closed').map(session => (
                  <tr key={session.id} className="border-b border-border/50 last:border-0">
                    <td className="p-3 text-muted-foreground">{formatDate(session.openedAt, { time: true })}</td>
                    <td className="p-3 text-muted-foreground">{session.closedAt ? formatDate(session.closedAt, { time: true }) : '-'}</td>
                    <td className="p-3">{formatCurrency(session.openingBalance)}</td>
                    <td className="p-3 text-dasta-success">{formatCurrency(session.totalCash)}</td>
                    <td className="p-3 text-dasta-info">{formatCurrency(session.totalCard)}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">{'დახურული'}</Badge>
                    </td>
                    <td className="p-3 text-right font-semibold">{formatCurrency(session.closingBalance || 0)}</td>
                  </tr>
                ))}
                {pastSessions.filter(s => s.status === 'closed').length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                      {'წინა სესიები არ არის'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Open Session Dialog */}
      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{'სალაროს გახსნა'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{'საწყისი თანხა (ნაღდი)'}</label>
              <Input
                type="number"
                value={openAmount}
                onChange={e => setOpenAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>
            <Button onClick={handleOpen} className="w-full bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
              <Unlock className="size-4" />
              {'გახსნა'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cash Movement Dialog */}
      <Dialog open={isMoveDialog} onOpenChange={setIsMoveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{moveType === 'in' ? 'ნაღდის შეტანა' : 'ნაღდის გატანა'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{'თანხა'}</label>
              <Input
                type="number"
                value={moveAmount}
                onChange={e => setMoveAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{'შენიშვნა'}</label>
              <Input
                value={moveNote}
                onChange={e => setMoveNote(e.target.value)}
                placeholder="მიზეზი..."
              />
            </div>
            <Button onClick={handleMove} className={`w-full ${moveType === 'in' ? 'bg-dasta-success hover:bg-dasta-success/90' : 'bg-dasta-danger hover:bg-dasta-danger/90'} text-white`}>
              {moveType === 'in' ? 'შეტანა' : 'გატანა'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

const STEPS = ['ანგარიში', 'კომპანია', 'ფილიალი']

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', fullName: '',
    companyName: '', taxId: '', companyAddress: '', companyPhone: '',
    branchName: '', branchAddress: '', branchPhone: '',
  })
  const { register } = useAuth()
  const router = useRouter()

  function updateForm(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const success = await register({
        email: form.email, password: form.password, fullName: form.fullName,
        companyName: form.companyName, branchName: form.branchName,
      })
      if (success) {
        toast.success('რეგისტრაცია წარმატებით დასრულდა')
        router.push('/branch-1')
      }
    } catch {
      toast.error('რეგისტრაცია ვერ მოხერხდა')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-dasta-green to-dasta-green-dark">
          <span className="text-xl font-bold text-primary-foreground">D</span>
        </div>
        <span className="text-2xl font-bold text-foreground">DASTA</span>
      </div>

      <Card className="border-border shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{'რეგისტრაცია'}</CardTitle>
          <CardDescription>{'შექმენით ანგარიში 3 მარტივ ნაბიჯში'}</CardDescription>
          {/* Step indicator */}
          <div className="flex items-center gap-2 pt-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i < step ? 'bg-dasta-green text-primary-foreground' :
                  i === step ? 'bg-dasta-green text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {i < step ? <Check className="size-4" /> : i + 1}
                </div>
                <span className={`text-sm ${i === step ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`h-px w-8 ${i < step ? 'bg-dasta-green' : 'bg-border'}`} />}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{'სრული სახელი'}</Label>
                <Input placeholder="გიორგი ბერიძე" value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{'ელ. ფოსტა'}</Label>
                <Input type="email" placeholder="example@mail.ge" value={form.email} onChange={e => updateForm('email', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{'პაროლი'}</Label>
                <Input type="password" placeholder="მინ. 8 სიმბოლო" value={form.password} onChange={e => updateForm('password', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{'პაროლის დადასტურება'}</Label>
                <Input type="password" placeholder="გაიმეორეთ პაროლი" value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{'კომპანიის სახელი'}</Label>
                <Input placeholder='შპს "სახელი"' value={form.companyName} onChange={e => updateForm('companyName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{'საიდენტიფიკაციო კოდი'}</Label>
                <Input placeholder="404123456" value={form.taxId} onChange={e => updateForm('taxId', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{'მისამართი'}</Label>
                <Input placeholder="თბილისი, რუსთაველის გამზ. 24" value={form.companyAddress} onChange={e => updateForm('companyAddress', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{'ტელეფონი'}</Label>
                <Input placeholder="+995 555 12 34 56" value={form.companyPhone} onChange={e => updateForm('companyPhone', e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{'ფილიალის სახელი'}</Label>
                <Input placeholder="მთავარი მაღაზია" value={form.branchName} onChange={e => updateForm('branchName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{'მისამართი'}</Label>
                <Input placeholder="რუსთაველის გამზ. 24" value={form.branchAddress} onChange={e => updateForm('branchAddress', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{'ტელეფონი'}</Label>
                <Input placeholder="+995 555 12 34 56" value={form.branchPhone} onChange={e => updateForm('branchPhone', e.target.value)} />
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
            >
              <ChevronLeft className="size-4" />
              {'უკან'}
            </Button>
            {step < 2 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark"
              >
                {'შემდეგი'}
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark"
                disabled={loading}
              >
                {loading ? 'რეგისტრაცია...' : 'რეგისტრაცია'}
              </Button>
            )}
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {'უკვე გაქვთ ანგარიში? '}
            <Link href="/login" className="font-medium text-dasta-green hover:text-dasta-green-dark">{'შესვლა'}</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

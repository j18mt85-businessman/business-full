'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
    toast.success('ინსტრუქცია გამოგზავნილია ელ. ფოსტაზე')
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
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{'პაროლის აღდგენა'}</CardTitle>
          <CardDescription>
            {sent
              ? 'ინსტრუქცია გამოგზავნილია თქვენს ელ. ფოსტაზე'
              : 'შეიყვანეთ ელ. ფოსტა პაროლის აღსადგენად'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                <Mail className="size-8 text-dasta-green" />
              </div>
              <p className="text-sm text-muted-foreground">
                {'შეამოწმეთ თქვენი ელ. ფოსტა და მიჰყევით ინსტრუქციას პაროლის აღსადგენად.'}
              </p>
              <Button
                variant="outline"
                onClick={() => setSent(false)}
                className="w-full"
              >
                {'ხელახლა გაგზავნა'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{'ელ. ფოსტა'}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@dasta.ge"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark"
              >
                {'ინსტრუქციის გაგზავნა'}
              </Button>
            </form>
          )}
          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" />
              {'დაბრუნება შესვლის გვერდზე'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

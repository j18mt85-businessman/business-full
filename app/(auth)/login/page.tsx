'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('შეავსეთ ყველა ველი')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('არასწორი ელ. ფოსტა ან პაროლი')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('ელ. ფოსტა არ არის დადასტურებული. შეამოწმეთ თქვენი inbox.')
        } else {
          toast.error(error.message)
        }
        return
      }
      toast.success('წარმატებით შეხვედით სისტემაში')
      // Hard redirect to force server-side root page to run (gets branch and redirects to dashboard)
      window.location.href = '/'
    } catch {
      toast.error('შესვლა ვერ მოხერხდა')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mobile logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-dasta-green to-dasta-green-dark">
          <span className="text-xl font-bold text-primary-foreground">D</span>
        </div>
        <span className="text-2xl font-bold text-foreground">DASTA</span>
      </div>

      <Card className="border-border shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{'შესვლა'}</CardTitle>
          <CardDescription>{'შეიყვანეთ თქვენი მონაცემები სისტემაში შესასვლელად'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{'ელ. ფოსტა'}</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@dasta.ge"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{'პაროლი'}</Label>
                <Link href="/forgot-password" className="text-sm text-dasta-green hover:text-dasta-green-dark">
                  {'დაგავიწყდათ პაროლი?'}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  {'შესვლა...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="size-4" />
                  {'შესვლა'}
                </span>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {'არ გაქვთ ანგარიში? '}
            <Link href="/register" className="font-medium text-dasta-green hover:text-dasta-green-dark">
              {'რეგისტრაცია'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

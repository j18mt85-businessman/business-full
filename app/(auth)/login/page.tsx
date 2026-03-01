'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@dasta.ge')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const success = await login(email, password)
      if (success) {
        toast.success('წარმატებით შეხვედით სისტემაში')
        router.push('/branch-1')
      }
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
                placeholder="admin@dasta.ge"
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

      {/* Demo hint */}
      <div className="rounded-lg border border-dasta-green/20 bg-accent p-3 text-center text-sm text-muted-foreground">
        <span className="font-medium text-dasta-green">{'Demo:'}</span>
        {' დააჭირეთ "შესვლა" ღილაკს სადემო რეჟიმში შესასვლელად'}
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{'ავტორიზაციის შეცდომა'}</CardTitle>
          <CardDescription>{'სესიის დამყარება ვერ მოხერხდა. გთხოვთ, სცადეთ თავიდან.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
            <Link href="/login">{'შესვლის გვერდზე დაბრუნება'}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

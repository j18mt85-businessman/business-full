import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-dasta-green to-dasta-green-dark">
          <span className="text-xl font-bold text-primary-foreground">D</span>
        </div>
        <span className="text-2xl font-bold text-foreground">DASTA</span>
      </div>

      <Card className="border-border shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-dasta-green/10">
            <Mail className="size-8 text-dasta-green" />
          </div>
          <CardTitle className="text-2xl font-bold">{'შეამოწმეთ ელ. ფოსტა'}</CardTitle>
          <CardDescription className="text-base">
            {'თქვენს ელ. ფოსტაზე გაიგზავნა დადასტურების ბმული. გთხოვთ, დააჭირეთ ბმულს ანგარიშის გასააქტიურებლად.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-accent p-4 text-center text-sm text-muted-foreground">
            {'თუ ელ. ფოსტა ვერ იპოვეთ, შეამოწმეთ Spam ფოლდერი.'}
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">{'შესვლის გვერდზე დაბრუნება'}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

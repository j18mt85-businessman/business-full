import type { Metadata, Viewport } from 'next'
import { Noto_Sans_Georgian, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProviders } from '@/components/providers/AppProviders'
import { Toaster } from 'sonner'
import './globals.css'

const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ['georgian', 'latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DASTA - ბიზნესის მართვის პლატფორმა',
  description: 'DASTA - ქართული POS და ბიზნესის მართვის სისტემა. გაყიდვები, ინვენტარი, სალარო და RS.GE ინტეგრაცია.',
  generator: 'DASTA.GE',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f1724',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ka" suppressHydrationWarning>
      <body className={`${notoSansGeorgian.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <AppProviders>
          {children}
        </AppProviders>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}

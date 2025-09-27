import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import ContentLayout from './content-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import ErrorBoundary from '@/components/error-boundary'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'etrl.chat - AI Chat Assistant',
  description:
    'A modern AI chat assistant powered by Letta with real-time streaming and reasoning display.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className='dark'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Providers>
            <AuthGuard>
              <ContentLayout>{children}</ContentLayout>
            </AuthGuard>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}

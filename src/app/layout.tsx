import type { Metadata } from 'next'
import { Providers } from '@/app/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Invoice Entry - Transaction Management',
  description: 'Complete invoice and transaction management system',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

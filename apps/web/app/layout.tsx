import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'CareerLink - DK24 Community',
  description: 'CareerLink - Hiring platform for DK24 Community students and recruiters.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-white text-text-main min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

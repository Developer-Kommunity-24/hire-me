import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import type { ReactNode } from 'react'

import './globals.css'
import { Providers } from './providers'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'CareerLink - DK24 Community',
  description: 'CareerLink - Hiring platform for DK24 Community students and recruiters.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="antialiased font-sans bg-white text-text-main min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

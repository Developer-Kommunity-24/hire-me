import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import type { ReactNode } from 'react'
import Providers from './providers'
import './globals.css'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'CareerLink - DK24 Community',
  description: 'CareerLink - Hiring platform for DK24 Community students and recruiters.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      <body className="antialiased font-sans bg-white text-[#0f1f09] min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

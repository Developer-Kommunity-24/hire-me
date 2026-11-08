'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface BrandLogoProps {
  href?: string
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

export function BrandLogo({ href = '/', className, size = 'default' }: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 group cursor-pointer outline-none select-none shrink-0 transition-opacity hover:opacity-90',
        className,
      )}
      aria-label="DK24 CareerLink home"
    >
      <span
        className={cn(
          'font-mono font-black tracking-tight text-brand transition-transform group-hover:scale-105',
          size === 'lg' ? 'text-2xl sm:text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl',
        )}
      >
        DK24
      </span>
      <span
        className={cn(
          'font-extrabold tracking-tight text-text-main group-hover:text-brand transition-colors',
          size === 'lg'
            ? 'text-xl sm:text-2xl'
            : size === 'sm'
              ? 'text-base sm:text-lg'
              : 'text-xl',
        )}
      >
        CareerLink
      </span>
    </Link>
  )
}

export default BrandLogo

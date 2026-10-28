'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, HelpCircle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface HeaderProps {
  title?: string
  subtitle?: string
  icon?: LucideIcon
  backHref?: string
  backLabel?: string
  showLogo?: boolean
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export default function Header({
  title,
  subtitle,
  icon: Icon,
  backHref,
  backLabel = 'Back',
  showLogo,
  leftAction,
  rightAction,
  children,
  className,
}: HeaderProps) {
  const shouldRenderLogo = showLogo ?? (!backHref && !title)

  return (
    <header
      className={cn(
        'sticky top-0 z-20 bg-card/90 backdrop-blur-md border-b border-border-subtle px-5 py-3 flex items-center justify-between shadow-xs',
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {shouldRenderLogo && (
          <Link
            href="/"
            className="flex items-center gap-2 group mr-2"
            aria-label="CareerLink home"
          >
            <span className="text-xl font-black tracking-tight text-brand font-mono">DK24</span>
            <span className="text-base font-extrabold tracking-tight text-text-main group-hover:text-brand transition-colors">
              CareerLink
            </span>
          </Link>
        )}

        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {backLabel}
          </Link>
        )}

        {title && (
          <div>
            <h1 className="text-lg font-bold text-text-main flex items-center gap-2">
              {Icon && <Icon className="w-5 h-5 text-brand shrink-0" />}
              <span className="truncate">{title}</span>
            </h1>
            {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          </div>
        )}

        {leftAction}
        {children}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {rightAction !== undefined ? (
          rightAction
        ) : (
          <a
            href="/help"
            className="text-xs font-medium text-text-muted hover:text-text-main transition-colors duration-150 flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Need Help?</span>
          </a>
        )}
      </div>
    </header>
  )
}

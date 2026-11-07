'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, HelpCircle, Layers, type LucideIcon } from 'lucide-react'
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
  showLogo = true,
  leftAction,
  rightAction,
  children,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'h-14 border-b border-gray-200 bg-white px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 font-sans',
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {showLogo && (
          <Link
            href="/"
            className="flex items-center gap-2.5 group mr-2 shrink-0"
            aria-label="CareerLink home"
          >
            <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight">CareerLink</span>
          </Link>
        )}

        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel}</span>
          </Link>
        )}

        {title && (
          <div className="border-l border-slate-200 pl-3 ml-1">
            <h1 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              {Icon && <Icon className="w-4 h-4 text-emerald-600 shrink-0" />}
              <span className="truncate">{title}</span>
            </h1>
            {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
          </div>
        )}

        {leftAction}
        {children}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {rightAction !== undefined ? (
          rightAction
        ) : (
          <Link
            href="/help"
            className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-gray-400" />
            <span>Need Help?</span>
          </Link>
        )}
      </div>
    </header>
  )
}

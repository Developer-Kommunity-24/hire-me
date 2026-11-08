'use client'

import React from 'react'
import Link from 'next/link'
import { CircleHelp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandLogo } from '@/components/common/BrandLogo'

export interface OnboardingHeaderProps {
  className?: string
  showSwitchRole?: boolean
  showHelp?: boolean
}

export function OnboardingHeader({
  className,
  showSwitchRole = true,
  showHelp = true,
}: OnboardingHeaderProps) {
  return (
    <header
      className={cn(
        'h-16 border-b border-border-subtle bg-white/95 backdrop-blur-md w-full sticky top-0 z-20 shrink-0 font-sans',
        className,
      )}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Brand Logo */}
        <BrandLogo size="default" />

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showSwitchRole && (
            <Link
              href="/role-select"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-all px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-border-subtle active:scale-95 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-text-muted" />
              <span>Switch Role</span>
            </Link>
          )}

          {showHelp && (
            <Link
              href="/help"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-main transition-all px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-border-subtle active:scale-95 cursor-pointer"
            >
              <CircleHelp className="w-3.5 h-3.5 text-text-muted" />
              <span>Need Help?</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default OnboardingHeader

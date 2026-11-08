'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, CircleHelp, Search, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandLogo } from './BrandLogo'
import UserAvatar from '@/components/student-profile/UserAvatar'
import { useOptionalProfile } from '@/components/student-profile/ProfileContext'

export interface HeaderProps {
  title?: string
  subtitle?: string
  icon?: LucideIcon
  role?: 'student' | 'recruiter' | 'admin'
  backHref?: string
  backLabel?: string
  showLogo?: boolean
  showDesktopLogo?: boolean
  hasMobileSidebar?: boolean
  showSearch?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (val: string) => void
  showNotifications?: boolean
  showHelp?: boolean
  showProfile?: boolean
  profileHref?: string
  userName?: string
  userInitials?: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export default function Header({
  title,
  subtitle,
  icon: Icon,
  role = 'student',
  backHref,
  backLabel = 'Back',
  showLogo = true,
  showDesktopLogo = false,
  hasMobileSidebar = true,
  showSearch = false,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  showNotifications = true,
  showHelp = true,
  showProfile = true,
  profileHref,
  userName,
  userInitials,
  leftAction,
  rightAction,
  children,
  className,
}: HeaderProps) {
  const optionalProfile = useOptionalProfile()

  const activeName =
    userName ||
    userInitials ||
    optionalProfile?.profile?.name ||
    (role === 'recruiter' ? 'Recruiter' : role === 'admin' ? 'Admin' : 'Student')

  const resolvedProfileHref =
    profileHref ?? (role === 'recruiter' ? '/dashboard/recruiter' : '/student/profile')

  return (
    <header
      className={cn(
        'h-16 border-b border-border-subtle bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20 font-sans',
        className,
      )}
    >
      {/* Left Section */}
      <div
        className={cn(
          'flex items-center gap-3 min-w-0 flex-1',
          hasMobileSidebar && 'pl-11 lg:pl-0',
        )}
      >
        {/* Mobile / Desktop Brand Logo */}
        {showLogo && (
          <div
            className={cn(
              showDesktopLogo ? 'flex' : 'flex lg:hidden',
              'items-center shrink-0 mr-1',
            )}
          >
            <BrandLogo size="sm" />
          </div>
        )}

        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel}</span>
          </Link>
        )}

        {title && (
          <div
            className={cn(
              'border-l border-slate-200 pl-3 ml-1 min-w-0',
              !backHref && 'lg:border-l-0 lg:pl-0 lg:ml-0',
            )}
          >
            <h1 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              {Icon && <Icon className="w-4 h-4 text-brand shrink-0" />}
              <span className="truncate">{title}</span>
            </h1>
            {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
          </div>
        )}

        {showSearch && (
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full rounded-xl border border-border-subtle bg-bg-page pl-9 pr-4 py-1.5 text-xs sm:text-sm text-text-main outline-none transition placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
          </div>
        )}

        {leftAction}
        {children}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
        {rightAction !== undefined ? (
          rightAction
        ) : (
          <>
            {/* Role Badge */}
            {role && (
              <span
                className={cn(
                  'hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider',
                  role === 'student' &&
                    'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
                  role === 'recruiter' && 'bg-blue-50 text-blue-700 border border-blue-200/60',
                  role === 'admin' && 'bg-purple-50 text-purple-700 border border-purple-200/60',
                )}
              >
                {role === 'student' ? 'Student' : role === 'recruiter' ? 'Recruiter' : 'Admin'}
              </span>
            )}

            {/* Need Help? Link */}
            {showHelp && (
              <Link
                href="/help"
                className="text-xs font-medium text-text-muted hover:text-text-main flex items-center gap-1.5 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50"
              >
                <CircleHelp className="w-4 h-4 text-text-muted" />
                <span className="hidden md:inline">Need Help?</span>
              </Link>
            )}

            {/* Notification Bell */}
            {showNotifications && (
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-white text-text-muted transition-all hover:bg-slate-50 hover:text-text-main hover:border-slate-300 active:scale-95 shadow-2xs cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand" />
              </button>
            )}

            {/* User Profile Avatar */}
            {showProfile && (
              <Link
                href={resolvedProfileHref}
                className="group relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden transition-all shadow-xs active:scale-95 cursor-pointer outline-none ring-2 ring-transparent hover:ring-brand/40"
                aria-label={`User Profile (${activeName})`}
              >
                <UserAvatar
                  name={activeName}
                  size="36"
                  round={false}
                  className="rounded-xl w-9 h-9"
                />
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, FileText, User, Menu, X, CircleHelp, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const DEFAULT_STUDENT_NAV: NavItem[] = [
  { label: 'Job Feed', href: '/student/jobs', icon: Briefcase },
  { label: 'My Applications', href: '/student/applications', icon: FileText },
  { label: 'Profile', href: '/student/profile', icon: User },
]

export interface CommonSidebarProps {
  items?: NavItem[]
  brandTitle?: string
  homeHref?: string
  className?: string
}

export default function Sidebar({
  items = DEFAULT_STUDENT_NAV,
  brandTitle = 'CareerLink',
  homeHref = '/',
  className,
}: CommonSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const currentPath = usePathname()
  const pathname = currentPath || ''

  return (
    <>
      {/* Mobile Menu Trigger Button */}
      <div className="lg:hidden fixed top-3.5 left-3.5 z-50">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4 text-text-main" />
        </Button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-action-dark/30 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex flex-col w-64 min-h-screen bg-card border-r border-border-subtle transition-transform duration-200 ease-in-out lg:translate-x-0 lg:z-30',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          className,
        )}
        aria-label="Main navigation"
      >
        {/* Brand Logo Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border-subtle shrink-0">
          <Link
            href={homeHref}
            className="flex items-center gap-2 group"
            aria-label="CareerLink home"
          >
            <span className="text-2xl font-black tracking-tight text-brand font-mono">DK24</span>
            <span className="text-xl font-extrabold tracking-tight text-text-main group-hover:text-brand transition-colors">
              {brandTitle}
            </span>
          </Link>

          <div className="lg:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Sidebar navigation">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Menu
          </p>
          <ul className="space-y-1" role="list">
            {items.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              const IconComp = item.icon
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150',
                      isActive
                        ? 'text-brand-dark bg-brand-light font-semibold shadow-xs'
                        : 'text-text-muted hover:bg-bg-page hover:text-text-main font-medium',
                    )}
                  >
                    <IconComp
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-brand-dark' : 'text-text-muted',
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom Helper Section */}
        <div className="p-3 border-t border-border-subtle shrink-0">
          <Link
            href="/help"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-text-muted hover:text-text-main hover:bg-bg-page transition-colors"
          >
            <CircleHelp className="w-4 h-4 text-text-muted shrink-0" />
            <span>Help & Support</span>
          </Link>
        </div>
      </aside>
    </>
  )
}

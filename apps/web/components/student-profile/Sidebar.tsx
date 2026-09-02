'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, FileText, User, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from './types'

const NAV_ITEMS: NavItem[] = [
  { label: 'Job Feed', href: '/student/jobs', icon: Briefcase },
  { label: 'My Applications', href: '/student/applications', icon: FileText },
  { label: 'Profile', href: '/student/profile', icon: User },
]

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const currentPath = usePathname()
  const pathname = currentPath || '/student/profile'

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-card rounded-xl shadow-md border border-border-subtle cursor-pointer text-text-main hover:bg-bg-page transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5 text-text-main" />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-action-dark/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex flex-col w-[160px] min-h-screen bg-card border-r border-border-subtle transition-transform duration-200 ease-in-out lg:translate-x-0 lg:z-30',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between gap-1.5 px-4 py-3.5 border-b border-border-subtle">
          <Link href="/" className="flex items-center gap-1 group" aria-label="CareerLink home">
            <span className="text-base font-black tracking-tight text-brand font-mono">DK24</span>
            <span className="text-sm font-extrabold tracking-tight text-text-main">CareerLink</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-page transition-colors duration-150 cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-2.5 py-3.5" aria-label="Sidebar navigation">
          <ul className="space-y-1" role="list">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              const IconComp = item.icon
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-150 ease-in-out',
                      isActive
                        ? 'text-brand-dark bg-brand-light font-semibold border-l-2 border-brand shadow-xs'
                        : 'text-text-muted hover:bg-bg-page hover:text-text-main font-medium',
                    )}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}

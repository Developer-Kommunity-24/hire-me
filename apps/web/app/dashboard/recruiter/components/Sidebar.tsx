'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BriefcaseBusiness, CircleHelp, LayoutDashboard, LogOut, Users } from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard/recruiter',
    icon: LayoutDashboard,
  },
  {
    name: 'Job Postings',
    href: '/dashboard/recruiter/jobs',
    icon: BriefcaseBusiness,
  },
  {
    name: 'Candidates',
    href: '/dashboard/recruiter#applicant-pipeline',
    icon: Users,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
      <div className="border-b border-gray-200 px-6 py-6">
        <h1 className="text-xl font-bold text-text-main">
          DK24 <span className="text-brand-green">CareerLink</span>
        </h1>
        <p className="mt-2 text-sm text-text-muted">Recruiter Portal</p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive =
            item.name === 'Dashboard'
              ? pathname === item.href
              : item.name === 'Job Postings'
                ? pathname.startsWith(item.href)
                : false

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition',
                isActive
                  ? 'bg-bg-page text-text-main'
                  : 'text-text-muted hover:bg-bg-page hover:text-text-main',
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <a
          href="mailto:support@example.com"
          className="mb-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-text-muted transition hover:bg-bg-page"
        >
          <CircleHelp className="h-5 w-5 shrink-0" />
          <span>Help Center</span>
        </a>

        <Link
          href="/"
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  )
}

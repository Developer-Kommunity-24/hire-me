'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, FileText, Users, HelpCircle, Layers } from 'lucide-react'

const navItems = [
  { label: 'Job Feed', href: '/student-admin/job-feed', icon: Briefcase },
  { label: 'My Applications', href: '/student-admin/applications', icon: FileText },
  { label: 'Members', href: '/student-admin/members', icon: Users },
]

export default function StudentAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-gray-200 bg-white px-6 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">CareerLink</span>
        </Link>

        <Link
          href="/help"
          className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-gray-400" />
          <span>Need Help?</span>
        </Link>
      </header>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1">
        <aside className="w-56 bg-white border-r border-gray-200 py-4 shrink-0">
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== '/student-admin' && pathname?.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50/70 font-semibold'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute right-0 top-0 bottom-0 w-[3px] bg-emerald-600" />
                  )}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

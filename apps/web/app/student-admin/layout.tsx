'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Briefcase, FileText, Users } from 'lucide-react'
import Header from '@/components/common/Header'
import { useAuth } from '@/lib/hooks/use-auth'

const navItems = [
  { label: 'Job Feed', href: '/student/jobs', icon: Briefcase },
  { label: 'My Applications', href: '/student/applications', icon: FileText },
  { label: 'Members', href: '/student-admin/members', icon: Users },
]

export default function StudentAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const isClubAdmin = user?.roles?.includes('club_admin') ?? false

  useEffect(() => {
    if (!isLoading && user && !isClubAdmin) {
      router.replace('/student/jobs')
    }
  }, [user, isLoading, isClubAdmin, router])

  if (!isLoading && user && !isClubAdmin) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs max-w-md text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-gray-600 mb-4">
            You do not have student administrator privileges. Only students assigned as a club
            administrator by a Super Admin can access this page.
          </p>
          <Link
            href="/student/jobs"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Return to Job Feed
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-page flex flex-col font-sans">
      {/* Top Header Bar */}
      <Header
        role="admin"
        showLogo
        showDesktopLogo
        hasMobileSidebar={false}
        showNotifications={false}
        showProfile={false}
        showHelp
      />

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1">
        <aside className="w-56 bg-white border-r border-border-subtle py-4 shrink-0">
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

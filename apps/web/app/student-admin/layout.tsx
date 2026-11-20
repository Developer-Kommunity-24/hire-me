'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/common/Header'
import Sidebar from '@/components/student-profile/Sidebar'
import Footer from '@/components/student-profile/Footer'
import { ProfileProvider } from '@/components/student-profile/ProfileContext'
import { useAuth } from '@/lib/hooks/use-auth'

export default function StudentAdminLayout({ children }: { children: React.ReactNode }) {
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
            className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
          >
            Return to Job Feed
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ProfileProvider>
      <div className="min-h-screen bg-bg-page flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
          <Header />
          <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full animate-fade-in flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </ProfileProvider>
  )
}

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const isCoreAdmin = user?.roles?.includes('core_admin') ?? false

  useEffect(() => {
    if (!isLoading && user && !isCoreAdmin) {
      router.replace('/student/jobs')
    }
  }, [user, isLoading, isCoreAdmin, router])

  if (!isLoading && user && !isCoreAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-md text-center">
          <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6">
            You need Super Administrator (Core Admin) privileges to access this control portal.
          </p>
          <Link
            href="/student/jobs"
            className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            Return to App
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Admin Navbar */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-emerald-600 font-mono">
              DK24
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">CareerLink</span>
          </Link>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Super Admin
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/student/jobs"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Student View</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  )
}

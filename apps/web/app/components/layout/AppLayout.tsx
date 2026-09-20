'use client'

import React from 'react'
import Link from 'next/link'
import {
  Briefcase,
  LayoutGrid,
  FileText,
  User,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm">
            <Briefcase size={18} />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">CareerLink</span>
        </div>

        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 rounded-md px-2.5 py-1.5 shadow-sm">
          <HelpCircle size={14} />
          <span>Need Help?</span>
        </button>
      </header>

      {/* Main Layout Body */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between hidden md:flex">
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Student Portal
              </p>
              <nav className="space-y-1">
                <Link
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50/70 rounded-lg border border-emerald-100"
                >
                  <LayoutGrid size={18} className="text-emerald-600" />
                  <span>Job Feed</span>
                </Link>

                <Link
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <FileText size={18} className="text-slate-400" />
                  <span>My Applications</span>
                </Link>

                <Link
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <User size={18} className="text-slate-400" />
                  <span>Profile</span>
                </Link>
              </nav>
            </div>

            {/* Verification Card */}
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>VERIFICATION</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete your profile to unlock &ldquo;Top Match&rdquo; status for roles.
              </p>
              <Link
                href="#"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 pt-1"
              >
                <span>Finish Setup</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* User Profile Badge */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              AM
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-800">Alex Mercer</p>
              <p className="text-slate-400">Stanford &apos;25</p>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 flex flex-col justify-between">
          <div className="p-6 md:p-8 max-w-6xl w-full mx-auto">{children}</div>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white py-4 px-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <div className="flex items-center gap-1">
              <Briefcase size={12} />
              <span>&copy; 2026 CAREERLINK PLATFORM. ALL RIGHTS RESERVED.</span>
            </div>
            <div className="flex items-center gap-6 font-medium">
              <Link href="#" className="hover:text-slate-600">
                HELP CENTER
              </Link>
              <Link href="#" className="hover:text-slate-600">
                PRIVACY POLICY
              </Link>
              <Link href="#" className="hover:text-slate-600">
                TERMS OF SERVICE
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { BriefcaseBusiness, LayoutDashboard, LogOut, Users } from 'lucide-react'
import CommonSidebar, { type NavItem } from '@/components/common/Sidebar'

const RECRUITER_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/recruiter', icon: LayoutDashboard },
  { label: 'Job Postings', href: '/dashboard/recruiter/jobs', icon: BriefcaseBusiness },
  { label: 'Candidates', href: '/dashboard/recruiter#applicant-pipeline', icon: Users },
]

export default function Sidebar({ className }: { className?: string }) {
  return (
    <CommonSidebar
      items={RECRUITER_NAV}
      brandTitle="CareerLink"
      homeHref="/dashboard/recruiter"
      className={className}
      footerAction={
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors active:scale-95 cursor-pointer mt-1"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </Link>
      }
    />
  )
}

'use client'

import { useState } from 'react'
import { BriefcaseBusiness, CircleHelp, LayoutDashboard, LogOut, Users } from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Job Postings',
    icon: BriefcaseBusiness,
  },
  {
    name: 'Candidates',
    icon: Users,
  },
]

export default function Sidebar() {
  const [active, setActive] = useState('Dashboard')

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
          const isActive = active === item.name

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setActive(item.name)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                isActive
                  ? 'bg-bg-plus text-text-main'
                  : 'text-text-muted hover:bg-bg-plus hover:text-text-main'
              }`}
            >
              <Icon />
              {item.name}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <button
          type="button"
          className="mb-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-text-muted transition hover:bg-bg-page"
        >
          <CircleHelp className="h-5 w-5 shrink-0" />

          <span>Help Center</span>
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 shrink-0" />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

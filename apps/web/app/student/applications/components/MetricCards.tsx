'use client'

import { Briefcase, Clock, Award, XCircle } from 'lucide-react'
import type { ApplicationMetrics, ApplicationStatus } from '@/lib/student-applications-api'
import { cn } from '@/lib/utils'

interface MetricCardsProps {
  metrics: ApplicationMetrics
  selectedStatus: ApplicationStatus | 'all'
  onSelectStatus: (status: ApplicationStatus | 'all') => void
}

export function MetricCards({ metrics, selectedStatus, onSelectStatus }: MetricCardsProps) {
  const items = [
    {
      id: 'all' as const,
      label: 'TOTAL APPLIED',
      count: metrics.total,
      icon: Briefcase,
    },
    {
      id: 'interviewing' as const,
      label: 'INTERVIEWING',
      count: metrics.interviewing,
      icon: Clock,
    },
    {
      id: 'accepted' as const,
      label: 'OFFERS',
      count: metrics.offers,
      icon: Award,
    },
    {
      id: 'rejected' as const,
      label: 'REJECTED',
      count: metrics.rejected,
      icon: XCircle,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 py-2">
      {items.map((item) => {
        const Icon = item.icon
        const isSelected = selectedStatus === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectStatus(item.id)}
            aria-label={`Filter by ${item.label}`}
            aria-pressed={isSelected}
            className={cn(
              'flex flex-col text-left group p-1.5 rounded-xl transition-all duration-150 focus:outline-none cursor-pointer active:scale-95',
              isSelected && 'opacity-100',
            )}
          >
            <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 transition-colors">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                {item.label}
              </span>
              <Icon className="w-3.5 h-3.5 opacity-70 text-slate-400" />
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={cn(
                  'text-3xl sm:text-4xl font-extrabold tracking-tight transition-colors',
                  isSelected ? 'text-emerald-700' : 'text-slate-900 group-hover:text-emerald-800',
                )}
              >
                {item.count}
              </span>
            </div>

            {isSelected && <div className="h-0.5 w-8 bg-emerald-600 rounded-full mt-1.5" />}
          </button>
        )
      })}
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import type { StudentApplicationItem } from '@/lib/student-applications-api'
import { formatEmploymentType, formatWorkArrangement } from '@/lib/student-applications-api'
import { ApplicationStatusBadge } from './ApplicationStatusBadge'
import { MilestoneStepper } from './MilestoneStepper'
import { cn } from '@/lib/utils'

interface ApplicationCardProps {
  application: StudentApplicationItem
  isExpanded?: boolean
  onToggleExpand?: () => void
  onWithdraw?: (id: string) => void
}

export function ApplicationCard({
  application,
  isExpanded: controlledExpanded,
  onToggleExpand,
  onWithdraw,
}: ApplicationCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false)
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded

  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand()
    } else {
      setInternalExpanded(!internalExpanded)
    }
  }

  const formattedAppliedDate = new Date(application.appliedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <article
      aria-labelledby={`app-title-${application.id}`}
      className={cn(
        'group bg-white rounded-xl border transition-all duration-200 overflow-hidden',
        isExpanded
          ? 'border-emerald-500/80 ring-1 ring-emerald-500/20 shadow-sm'
          : 'border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs',
      )}
    >
      {/* Clickable Header Area */}
      <div
        onClick={handleToggle}
        className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
      >
        {/* Left Side: Avatar + Role + Metadata + Tech Stack */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Avatar Icon */}
          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200/80 mt-0.5',
              application.companyLogoBg || 'bg-slate-100 text-slate-700',
            )}
            aria-hidden="true"
          >
            {application.companyLogoText || application.companyName.charAt(0)}
          </div>

          <div className="min-w-0 space-y-1.5 flex-1">
            {/* Title + Status Badge */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3
                id={`app-title-${application.id}`}
                className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors"
              >
                {application.roleTitle}
              </h3>
              <ApplicationStatusBadge status={application.status} />
            </div>

            {/* Metadata Line: Company • Location • Arrangement • Compensation */}
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {application.companyName}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {application.location}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {formatEmploymentType(application.employmentType)} •{' '}
                {formatWorkArrangement(application.workArrangement)}
              </span>

              {application.compensation && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                    {application.compensation}
                  </span>
                </>
              )}
            </div>

            {/* Tech Stack Pills */}
            {application.stack && application.stack.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {application.stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200/60"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Applied Date + Stage + Expand Toggle Button */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Applied {formattedAppliedDate}</span>
          </div>

          <div className="text-xs font-semibold text-emerald-700">
            Stage: {application.currentMilestone}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleToggle()
            }}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Hide details' : 'Show milestones'}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors pt-1 focus:outline-none"
          >
            <span>{isExpanded ? 'Hide Details' : 'Milestones'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Inline Content: Milestone History & Actions (NO POPUP) */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-1 animate-fade-in bg-slate-50/40 border-t border-slate-100/90">
          <MilestoneStepper
            milestones={application.milestones}
            currentMilestone={application.currentMilestone}
            currentMilestoneDate={application.currentMilestoneDate}
            interviewFormat={application.interviewFormat}
            orientation="vertical"
          />

          {/* Quick Actions Footer inside the expanded card */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200/60 text-xs">
            {onWithdraw && application.status !== 'rejected' && (
              <button
                type="button"
                onClick={() => onWithdraw(application.id)}
                className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-medium transition-colors"
                aria-label={`Withdraw application for ${application.roleTitle}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Withdraw Application</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Link
                href={`/jobs/${application.postingId}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <span>View Job Posting</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </Link>

              {application.status === 'accepted' && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs shadow-xs">
                  Offer Available
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

import type { ApplicationStatus } from '@/lib/student-applications-api'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, Video, XCircle, FileText } from 'lucide-react'

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus
  className?: string
  showIcon?: boolean
}

interface BadgeConfig {
  label: string
  className: string
  dotClass?: string
  icon: typeof CheckCircle2
}

const BADGE_MAP: Record<ApplicationStatus, BadgeConfig> = {
  interviewing: {
    label: 'Interviewing',
    className: 'bg-emerald-50/80 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    icon: Video,
  },
  accepted: {
    label: 'Offered',
    className: 'bg-blue-50/80 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
    icon: CheckCircle2,
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-amber-50/80 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
    icon: Clock,
  },
  applied: {
    label: 'Applied',
    className: 'bg-slate-50 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
    icon: FileText,
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-rose-50/80 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
    icon: XCircle,
  },
}

export function ApplicationStatusBadge({
  status,
  className,
  showIcon = true,
}: ApplicationStatusBadgeProps) {
  const config = BADGE_MAP[status] || BADGE_MAP.applied
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
        config.className,
        className,
      )}
    >
      {showIcon && <Icon className="w-3 h-3 opacity-90 shrink-0" />}
      <span>{config.label}</span>
    </span>
  )
}

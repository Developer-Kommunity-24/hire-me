import { Check, Clock, Calendar, Sparkles } from 'lucide-react'
import type { ApplicationMilestone } from '@/lib/student-applications-api'
import { cn } from '@/lib/utils'

interface MilestoneStepperProps {
  milestones: ApplicationMilestone[]
  currentMilestone?: string
  currentMilestoneDate?: string
  interviewFormat?: string
  className?: string
  orientation?: 'vertical' | 'horizontal'
}

export function MilestoneStepper({
  milestones,
  currentMilestone,
  currentMilestoneDate,
  interviewFormat,
  className,
  orientation = 'vertical',
}: MilestoneStepperProps) {
  if (!milestones || milestones.length === 0) {
    return null
  }

  // Vertical Milestone Timeline matching user screenshot
  if (orientation === 'vertical') {
    return (
      <div className={cn('w-full pt-4 border-t border-slate-100', className)}>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
          APPLICATION MILESTONE HISTORY
        </p>

        <div className="relative space-y-4 pl-1">
          {milestones.map((milestone, idx) => {
            const isCompleted = milestone.status === 'completed'
            const isCurrent = milestone.status === 'current'
            const isLast = idx === milestones.length - 1

            return (
              <div
                key={milestone.id || idx}
                className="relative flex items-start justify-between gap-4"
              >
                {/* Connecting Line to next step */}
                {!isLast && (
                  <div
                    className={cn(
                      'absolute left-[9px] top-5 w-[2px] h-[calc(100%+8px)] -z-0',
                      isCompleted ? 'bg-emerald-200' : 'bg-slate-200',
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Left: Indicator Icon + Title + Notes */}
                <div className="flex items-start gap-3 min-w-0 z-10">
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-500 flex items-center justify-center shadow-2xs">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full border-2 border-emerald-600 bg-emerald-50/50 flex items-center justify-center ring-4 ring-emerald-500/20 shadow-2xs">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <span
                      className={cn(
                        'text-xs block leading-tight',
                        isCurrent
                          ? 'font-bold text-slate-900'
                          : isCompleted
                            ? 'font-semibold text-slate-800'
                            : 'font-normal text-slate-400',
                      )}
                    >
                      {milestone.label}
                    </span>

                    {milestone.notes && (
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                        {milestone.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Date */}
                {milestone.date && (
                  <span className="text-xs text-slate-400 font-medium shrink-0 pt-0.5">
                    {milestone.date}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Horizontal Stepper fallback
  return (
    <div className={cn('w-full space-y-3', className)}>
      {currentMilestone && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span className="font-semibold text-emerald-950">Active Milestone:</span>
            <span className="font-bold underline decoration-emerald-500/40">
              {currentMilestone}
            </span>
          </div>

          {(currentMilestoneDate || interviewFormat) && (
            <div className="flex items-center gap-2 text-emerald-800 font-medium text-[11px]">
              {currentMilestoneDate && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-600" />
                  {currentMilestoneDate}
                </span>
              )}
              {interviewFormat && (
                <span className="hidden sm:inline-flex items-center gap-1 bg-white/70 px-2 py-0.5 rounded-md border border-emerald-200/50">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  {interviewFormat}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="pt-2">
        <div className="relative flex items-center justify-between">
          <div
            className="absolute left-3 right-3 top-3.5 -translate-y-1/2 h-0.5 bg-slate-200"
            aria-hidden="true"
          />

          {milestones.map((milestone, idx) => {
            const isCompleted = milestone.status === 'completed'
            const isCurrent = milestone.status === 'current'
            const isUpcoming = milestone.status === 'upcoming'

            return (
              <div
                key={milestone.id || idx}
                className="relative z-10 flex flex-col items-center flex-1 text-center px-1"
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 shadow-xs',
                    isCompleted && 'bg-emerald-600 text-white border-2 border-emerald-600',
                    isCurrent &&
                      'bg-white text-emerald-700 border-2 border-emerald-600 ring-4 ring-emerald-500/20 font-bold',
                    isUpcoming && 'bg-white text-slate-400 border-2 border-slate-200',
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <Clock className="w-3.5 h-3.5 animate-pulse text-emerald-600 stroke-[2.5]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <span
                  className={cn(
                    'text-[11px] mt-1.5 line-clamp-1 max-w-[110px] leading-tight',
                    isCurrent
                      ? 'font-bold text-emerald-950'
                      : isCompleted
                        ? 'font-medium text-slate-700'
                        : 'text-slate-400 font-normal',
                  )}
                >
                  {milestone.label}
                </span>

                {milestone.date && (
                  <span className="text-[10px] text-slate-400 mt-0.5 hidden md:block">
                    {milestone.date}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

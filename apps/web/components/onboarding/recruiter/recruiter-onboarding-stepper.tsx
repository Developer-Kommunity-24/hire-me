'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RecruiterStepNumber } from '@/lib/schemas/recruiter-onboarding.schema'

export interface RecruiterStepItem {
  id: RecruiterStepNumber
  label: string
}

export const RECRUITER_STEPS: readonly RecruiterStepItem[] = [
  { id: 1, label: 'About you' },
  { id: 2, label: 'Company' },
  { id: 3, label: 'Bio & Review' },
] as const

export interface RecruiterOnboardingStepperProps {
  currentStep: RecruiterStepNumber
  onStepClick: (step: RecruiterStepNumber) => void
}

export function RecruiterOnboardingStepper({
  currentStep,
  onStepClick,
}: RecruiterOnboardingStepperProps) {
  return (
    <div
      role="tablist"
      aria-label="Recruiter onboarding wizard steps"
      className="w-full shrink-0 pb-3 border-b border-border-subtle/50"
    >
      <div className="w-full flex items-start justify-between">
        {RECRUITER_STEPS.map((step, idx) => {
          const isPassed = currentStep > step.id
          const isCurrent = currentStep === step.id

          const circleClasses = cn(
            'size-8.5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
            isPassed && 'bg-brand text-white shadow-xs',
            isCurrent && 'bg-brand text-white ring-4 ring-brand/25',
            !isPassed &&
              !isCurrent &&
              'bg-card border-2 border-border-subtle text-text-muted group-hover:border-border-muted',
          )

          const labelClasses = cn(
            'text-xs whitespace-nowrap transition-colors',
            isCurrent && 'font-bold text-brand',
            isPassed && 'font-semibold text-text-main',
            !isPassed && !isCurrent && 'font-medium text-text-muted',
          )

          const lineWidth = isPassed ? '100%' : '0%'

          return (
            <div key={step.id} className="contents">
              <button
                type="button"
                role="tab"
                aria-selected={isCurrent}
                aria-label={`Step ${step.id}: ${step.label}`}
                disabled={step.id > currentStep}
                onClick={() => onStepClick(step.id)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0 bg-transparent border-0 outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-lg transition-transform active:scale-95"
              >
                <div className={circleClasses}>
                  {isPassed ? <Check className="w-4 h-4 stroke-2" /> : step.id}
                </div>
                <span className={labelClasses}>{step.label}</span>
              </button>

              {idx < RECRUITER_STEPS.length - 1 && (
                <div className="flex-1 h-0.5 bg-border-subtle mt-4 mx-2 sm:mx-4 relative overflow-hidden rounded-full">
                  <div
                    className="h-full bg-brand transition-all duration-300 ease-out"
                    style={{ width: lineWidth }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

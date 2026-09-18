'use client'

import { Check } from 'lucide-react'

export type StepNumber = 1 | 2 | 3 | 4

interface StepItem {
  id: StepNumber
  label: string
}

const STEPS: StepItem[] = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Education' },
  { id: 3, label: 'Skills & Exp' },
  { id: 4, label: 'Profiles' },
]

interface StudentOnboardingStepperProps {
  currentStep: StepNumber
  onStepClick: (step: StepNumber) => void
}

export function StudentOnboardingStepper({
  currentStep,
  onStepClick,
}: StudentOnboardingStepperProps) {
  return (
    <div
      role="tablist"
      aria-label="Student onboarding wizard steps"
      className="w-full shrink-0 pb-3 border-b border-border-subtle/50"
    >
      <div className="w-full flex items-start justify-between">
        {STEPS.map((step, idx) => {
          const isPassed = currentStep > step.id
          const isCurrent = currentStep === step.id

          return (
            <div key={step.id} className="contents">
              {/* Step Button */}
              <button
                type="button"
                role="tab"
                aria-selected={isCurrent}
                aria-label={`Step ${step.id}: ${step.label}`}
                onClick={() => onStepClick(step.id)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0 bg-transparent border-0 outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-lg transition-transform active:scale-95"
              >
                <div
                  className={`size-8.5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isPassed
                      ? 'bg-brand text-white shadow-xs'
                      : isCurrent
                        ? 'bg-brand text-white ring-4 ring-brand/25'
                        : 'bg-card border-2 border-border-subtle text-text-muted group-hover:border-slate-300'
                  }`}
                >
                  {isPassed ? <Check className="w-4 h-4 stroke-2" /> : step.id}
                </div>
                <span
                  className={`text-xs whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'font-bold text-brand'
                      : isPassed
                        ? 'font-semibold text-slate-700'
                        : 'font-medium text-text-muted'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector Line (between steps) */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 bg-border-subtle mt-4 mx-1 sm:mx-2 relative overflow-hidden rounded-full">
                  <div
                    className="h-full bg-brand transition-all duration-300 ease-out"
                    style={{ width: currentStep > step.id ? '100%' : '0%' }}
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

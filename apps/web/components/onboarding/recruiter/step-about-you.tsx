'use client'

import { Briefcase, User } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import type { RecruiterWizardInput } from '@/lib/schemas/recruiter-onboarding.schema'

export interface StepAboutYouProps {
  register: UseFormRegister<RecruiterWizardInput>
  errors: FieldErrors<RecruiterWizardInput>
}

export function StepAboutYou({ register, errors }: StepAboutYouProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
          About You
        </h2>
        <p className="text-xs sm:text-sm text-text-muted font-medium">
          Tell us about yourself so candidates and teammates know who is hiring.
        </p>
      </div>

      <div className="space-y-4 pt-1">
        <FormField label="Full Name" htmlFor="fullName" required error={errors.fullName?.message}>
          <div className="flex items-center gap-2">
            <User className="size-4 shrink-0 text-text-muted" />
            <Input
              id="fullName"
              type="text"
              placeholder="e.g. Alex Chen"
              {...register('fullName')}
            />
          </div>
        </FormField>

        <FormField
          label="Job Title"
          htmlFor="jobTitle"
          required
          error={errors.jobTitle?.message}
          description="Your official role at your organization."
        >
          <div className="flex items-center gap-2">
            <Briefcase className="size-4 shrink-0 text-text-muted" />
            <Input
              id="jobTitle"
              type="text"
              placeholder="e.g. Senior Technical Recruiter"
              {...register('jobTitle')}
            />
          </div>
        </FormField>
      </div>
    </div>
  )
}

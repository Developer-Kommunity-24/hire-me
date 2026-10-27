'use client'

import { Building2, Globe, Mail, MapPin } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import type { RecruiterWizardInput } from '@/lib/schemas/recruiter-onboarding.schema'

export interface StepCompanyProps {
  register: UseFormRegister<RecruiterWizardInput>
  errors: FieldErrors<RecruiterWizardInput>
}

export function StepCompany({ register, errors }: StepCompanyProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
          Company Details
        </h2>
        <p className="text-xs sm:text-sm text-text-muted font-medium">
          Set up your verified company profile to start hiring talent from the DK24 network.
        </p>
      </div>

      <div className="space-y-3.5 pt-1">
        <FormField
          label="Company Name"
          htmlFor="companyName"
          required
          error={errors.companyName?.message}
        >
          <div className="flex items-center gap-2">
            <Building2 className="size-4 shrink-0 text-text-muted" />
            <Input
              id="companyName"
              type="text"
              placeholder="e.g. Acme Innovations Inc."
              {...register('companyName')}
            />
          </div>
        </FormField>

        <FormField
          label="Company Work Email"
          htmlFor="companyMail"
          required
          error={errors.companyMail?.message}
          description="Official corporate email for candidate correspondence and verification."
        >
          <div className="flex items-center gap-2">
            <Mail className="size-4 shrink-0 text-text-muted" />
            <Input
              id="companyMail"
              type="email"
              placeholder="recruiting@company.com"
              {...register('companyMail')}
            />
          </div>
        </FormField>

        <FormField
          label="Company Website URL"
          htmlFor="companyUrl"
          error={errors.companyUrl?.message}
        >
          <div className="flex items-center gap-2">
            <Globe className="size-4 shrink-0 text-text-muted" />
            <Input
              id="companyUrl"
              type="url"
              placeholder="https://acme.example.com"
              {...register('companyUrl')}
            />
          </div>
        </FormField>

        <FormField
          label="Headquarters Location"
          htmlFor="headquartersLocation"
          error={errors.headquartersLocation?.message}
        >
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-text-muted" />
            <Input
              id="headquartersLocation"
              type="text"
              placeholder="e.g. Bengaluru, India or San Francisco, CA"
              {...register('headquartersLocation')}
            />
          </div>
        </FormField>
      </div>
    </div>
  )
}

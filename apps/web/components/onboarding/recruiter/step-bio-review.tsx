'use client'

import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { FormField } from '@/components/ui/form-field'
import type { RecruiterWizardInput } from '@/lib/schemas/recruiter-onboarding.schema'

export const BIO_PREVIEW_MAX_LENGTH = 140
export const BIO_TEXTAREA_ROWS = 2

export interface StepBioReviewProps {
  register: UseFormRegister<RecruiterWizardInput>
  errors: FieldErrors<RecruiterWizardInput>
  values: RecruiterWizardInput
}

export function StepBioReview({ register, errors, values }: StepBioReviewProps) {
  const bioExcerpt =
    values.bio && values.bio.length > BIO_PREVIEW_MAX_LENGTH
      ? `${values.bio.slice(0, BIO_PREVIEW_MAX_LENGTH)}...`
      : values.bio

  return (
    <div className="space-y-3.5">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
          Bio &amp; Review
        </h2>
        <p className="text-xs sm:text-sm text-text-muted font-medium">
          Add an optional bio and review your profile before completing setup.
        </p>
      </div>

      <div className="space-y-3 pt-1">
        <FormField
          label="Short Bio"
          htmlFor="bio"
          error={errors.bio?.message}
          description="A quick summary of your team culture and hiring focus."
        >
          <textarea
            id="bio"
            rows={BIO_TEXTAREA_ROWS}
            placeholder="Tell candidates about your mission, culture, and what your team is building..."
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs sm:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none placeholder:text-muted-foreground"
            {...register('bio')}
          />
        </FormField>

        <div className="rounded-xl border border-border-subtle bg-card/90 p-3.5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">
            Profile Summary
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-text-muted">
            <div>
              <span className="font-semibold text-text-main">Name:</span> {values.fullName || '—'}
            </div>
            <div>
              <span className="font-semibold text-text-main">Job Title:</span>{' '}
              {values.jobTitle || '—'}
            </div>
            <div>
              <span className="font-semibold text-text-main">Company:</span>{' '}
              {values.companyName || '—'}
            </div>
            <div>
              <span className="font-semibold text-text-main">Email:</span>{' '}
              {values.companyMail || '—'}
            </div>
            {values.companyUrl && (
              <div className="sm:col-span-2">
                <span className="font-semibold text-text-main">Website:</span> {values.companyUrl}
              </div>
            )}
            {values.headquartersLocation && (
              <div className="sm:col-span-2">
                <span className="font-semibold text-text-main">Location:</span>{' '}
                {values.headquartersLocation}
              </div>
            )}
            {bioExcerpt && (
              <div className="sm:col-span-2 pt-1 border-t border-border-subtle">
                <span className="font-semibold text-text-main">Bio:</span> {bioExcerpt}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

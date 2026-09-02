'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { AcademicData, AcademicsEditSectionProps } from '../types'

export default function AcademicsEditSection({
  academics,
  onChange,
  errors,
}: AcademicsEditSectionProps) {
  const handleFieldChange = (field: keyof AcademicData, value: string) => {
    onChange({ ...academics, [field]: value })
  }

  return (
    <Card as="section" className="p-6 sm:p-7">
      <div className="border-b border-border-subtle pb-4 mb-6">
        <h2 className="text-xl font-bold tracking-tight text-text-main">Academics</h2>
        <p className="text-xs text-text-muted mt-1">
          Keep your GPA, degree major, minor, academic honors, and graduation date up-to-date.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label
            htmlFor="edit-gpa"
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            GPA <span className="text-red-500">*</span>
          </label>
          <Input
            id="edit-gpa"
            type="text"
            required
            value={academics.gpa}
            onChange={(e) => handleFieldChange('gpa', e.target.value)}
            placeholder="e.g. 3.9 / 4.0"
            aria-invalid={Boolean(errors?.gpa)}
          />
          {errors?.gpa && (
            <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
              {errors.gpa}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="edit-expected-grad"
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Graduation Date / Expected Graduation <span className="text-red-500">*</span>
          </label>
          <Input
            id="edit-expected-grad"
            type="text"
            required
            value={academics.expectedGraduation}
            onChange={(e) => handleFieldChange('expectedGraduation', e.target.value)}
            placeholder="e.g. May 2025"
            aria-invalid={Boolean(errors?.expectedGraduation)}
          />
          {errors?.expectedGraduation && (
            <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
              {errors.expectedGraduation}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="edit-major"
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Major <span className="text-red-500">*</span>
          </label>
          <Input
            id="edit-major"
            type="text"
            required
            value={academics.major}
            onChange={(e) => handleFieldChange('major', e.target.value)}
            placeholder="e.g. Computer Science"
            aria-invalid={Boolean(errors?.major)}
          />
          {errors?.major && (
            <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
              {errors.major}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="edit-minor"
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Minor
          </label>
          <Input
            id="edit-minor"
            type="text"
            value={academics.minor}
            onChange={(e) => handleFieldChange('minor', e.target.value)}
            placeholder="e.g. Mathematics or None"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="edit-honors"
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Academic Honors / Awards
          </label>
          <Input
            id="edit-honors"
            type="text"
            value={academics.honors}
            onChange={(e) => handleFieldChange('honors', e.target.value)}
            placeholder="e.g. Dean's List (All Semesters), Summa Cum Laude"
          />
        </div>
      </div>
    </Card>
  )
}

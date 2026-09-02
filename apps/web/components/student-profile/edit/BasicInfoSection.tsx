'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { BasicInfoSectionProps, ProfileData } from '../types'

export default function BasicInfoSection({ data, onChange, errors }: BasicInfoSectionProps) {
  const handleFieldChange = (field: keyof ProfileData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <Card as="section" className="p-6 sm:p-7">
      <div className="border-b border-border-subtle pb-4 mb-6">
        <h2 className="text-xl font-bold tracking-tight text-text-main">Basic Information</h2>
        <p className="text-xs text-text-muted mt-1">
          Manage your personal details and public contact information.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div className="sm:col-span-2">
          <label
            htmlFor="edit-name"
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="edit-name"
            type="text"
            required
            value={data.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="e.g. Alex Mercer"
            aria-invalid={Boolean(errors?.name)}
          />
          {errors?.name && (
            <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="edit-degree"
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Headline / Degree Description <span className="text-red-500">*</span>
          </label>
          <Input
            id="edit-degree"
            type="text"
            required
            value={data.degree}
            onChange={(e) => handleFieldChange('degree', e.target.value)}
            placeholder="e.g. B.S. Computer Science, Stanford University '25"
            aria-invalid={Boolean(errors?.degree)}
          />
          {errors?.degree && (
            <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
              {errors.degree}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="edit-university"
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            University
          </label>
          <Input
            id="edit-university"
            type="text"
            value={data.university || ''}
            onChange={(e) => handleFieldChange('university', e.target.value)}
            placeholder="e.g. Stanford University"
          />
        </div>

        <div>
          <label
            htmlFor="edit-grad-year"
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Graduation Year
          </label>
          <Input
            id="edit-grad-year"
            type="text"
            value={data.graduationYear || ''}
            onChange={(e) => handleFieldChange('graduationYear', e.target.value)}
            placeholder="e.g. 2025"
          />
        </div>

        <div>
          <label
            htmlFor="edit-location"
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Location
          </label>
          <Input
            id="edit-location"
            type="text"
            value={data.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            placeholder="e.g. San Francisco, CA"
          />
        </div>

        <div>
          <label
            htmlFor="edit-github"
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            GitHub URL / Handle
          </label>
          <Input
            id="edit-github"
            type="text"
            value={data.github}
            onChange={(e) => handleFieldChange('github', e.target.value)}
            placeholder="e.g. github.com/alexm"
            aria-invalid={Boolean(errors?.github)}
          />
          {errors?.github && (
            <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
              {errors.github}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="edit-email"
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Email Address
          </label>
          <Input
            id="edit-email"
            type="email"
            value={data.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            placeholder="e.g. alex@example.edu"
            aria-invalid={Boolean(errors?.email)}
          />
          {errors?.email && (
            <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="edit-resume-link"
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Resume Link
          </label>
          <Input
            id="edit-resume-link"
            type="url"
            value={data.resumeLink || ''}
            onChange={(e) => handleFieldChange('resumeLink', e.target.value)}
            placeholder="e.g. https://drive.google.com/file/d/.../view"
            aria-invalid={Boolean(errors?.resumeLink)}
          />
          {errors?.resumeLink && (
            <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
              {errors.resumeLink}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

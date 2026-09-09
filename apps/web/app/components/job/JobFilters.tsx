'use client'

import { SlidersHorizontal } from 'lucide-react'

type RoleType = 'All' | 'Internship' | 'Full-time' | 'Part-time' | 'Contract'
type WorkModel = 'All' | 'Remote' | 'Hybrid' | 'On-site'

type JobFiltersProps = {
  roleType: RoleType
  workModel: WorkModel
  onRoleTypeChange: (value: RoleType) => void
  onWorkModelChange: (value: WorkModel) => void
}

const roleTypes: RoleType[] = ['All', 'Internship', 'Full-time', 'Part-time', 'Contract']

const workModels: WorkModel[] = ['All', 'Remote', 'Hybrid', 'On-site']

export default function JobFilters({
  roleType,
  workModel,
  onRoleTypeChange,
  onWorkModelChange,
}: JobFiltersProps) {
  return (
    <aside className="h-fit rounded-2xl border border-border-subtle bg-card p-5 lg:sticky lg:top-24">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-brand" />

        <h2 className="text-sm font-bold text-text-main">Filters</h2>
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Role Type</h3>

        <div className="mt-3 space-y-2.5">
          {roleTypes.map((role) => (
            <label
              key={role}
              className="flex cursor-pointer items-center gap-3 text-sm text-text-main"
            >
              <input
                type="radio"
                name="role-type"
                value={role}
                checked={roleType === role}
                onChange={() => onRoleTypeChange(role)}
                className="h-4 w-4 accent-brand"
              />

              <span>{role}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-7 border-t border-border-subtle pt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Location Model
        </h3>

        <div className="mt-3 space-y-2.5">
          {workModels.map((model) => (
            <label
              key={model}
              className="flex cursor-pointer items-center gap-3 text-sm text-text-main"
            >
              <input
                type="radio"
                name="work-model"
                value={model}
                checked={workModel === model}
                onChange={() => onWorkModelChange(model)}
                className="h-4 w-4 accent-brand"
              />

              <span>{model}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
}

export type { RoleType, WorkModel }

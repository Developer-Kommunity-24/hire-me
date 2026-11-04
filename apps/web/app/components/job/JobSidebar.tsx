import React from 'react'
import { Building2, Users, Calendar, Code2 } from 'lucide-react'
import { Job } from '../../types/job'

export const JobSidebar = ({ job }: { job: Job }) => {
  return (
    <aside className="rounded-2xl border border-border-subtle bg-card p-6 shadow-xs space-y-5">
      <div className="pb-3 border-b border-border-subtle">
        <h2 className="text-lg font-bold text-text-main">Company Overview</h2>
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">Industry</p>
            <p className="font-medium text-text-main">
              {job.companyOverview?.industry ?? 'Technology'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">Company Size</p>
            <p className="font-medium text-text-main">
              {job.companyOverview?.size ?? '50-200 employees'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">Founded</p>
            <p className="font-medium text-text-main">{job.companyOverview?.founded ?? '2020'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Code2 className="w-5 h-5 text-text-muted mt-0.5" />
          <div>
            <p className="text-xs text-text-muted">Tech Stack</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(job.companyOverview?.techStack ?? ['TypeScript', 'Next.js', 'Hono']).map(
                (tech: string) => (
                  <span
                    key={tech}
                    className="rounded-md bg-page-subtle px-2.5 py-1 text-xs font-medium text-text-muted"
                  >
                    {tech}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

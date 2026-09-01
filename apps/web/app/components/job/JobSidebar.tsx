import React from 'react'
import { Building2, Users, Calendar, Code2 } from 'lucide-react'
import { Job } from '../../types/job'

export const JobSidebar = ({ job }: { job: Job }) => {
  return (
    <div className="bg-white p-6 border border-gray-200 rounded-2xl space-y-6">
      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
        Company Overview
      </h3>

      <div className="space-y-4 text-sm">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Industry</p>
            <p className="font-medium text-gray-900">
              {job.companyOverview?.industry ?? 'Technology'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Company Size</p>
            <p className="font-medium text-gray-900">
              {job.companyOverview?.size ?? '50-200 employees'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Founded</p>
            <p className="font-medium text-gray-900">{job.companyOverview?.founded ?? '2020'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Code2 className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Tech Stack</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {(job.companyOverview?.techStack ?? ['TypeScript', 'Next.js', 'Hono']).map(
                (tech: string) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md"
                  >
                    {tech}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

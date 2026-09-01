import React from 'react'
import { Job } from '../../types/job'

export const JobDetails = ({ job }: { job: Job }) => {
  const aboutRole = job.aboutRole ?? [job.description ?? 'No description provided.']
  const responsibilities = job.responsibilities ?? []
  const qualifications = job.qualifications ?? []

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-2xl space-y-8">
      {/* About the Role */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">About the Role</h2>
        <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
          {aboutRole.map((paragraph: string, idx: number) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* Key Responsibilities */}
      {responsibilities.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Key Responsibilities</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            {responsibilities.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Qualifications */}
      {qualifications.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Qualifications</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            {qualifications.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

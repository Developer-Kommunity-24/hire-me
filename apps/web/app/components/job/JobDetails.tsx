import React from 'react'
import { Job } from '../../types/job'

export const JobDetails = ({ job }: { job: Job }) => {
  const aboutRole = job.aboutRole ?? [job.description ?? 'No description provided.']
  const responsibilities = job.responsibilities ?? []
  const qualifications = job.qualifications ?? []

  return (
    <article className="rounded-2xl border border-border-subtle bg-card p-6 space-y-6 shadow-xs">
      {/* About the Role */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-text-main">About the Role</h2>
        <div className="space-y-2 text-sm text-text-muted leading-relaxed whitespace-pre-line">
          {aboutRole.map((paragraph: string, idx: number) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* Key Responsibilities */}
      {responsibilities.length > 0 && (
        <section className="space-y-3 border-t border-border-subtle pt-6">
          <h2 className="text-lg font-bold text-text-main">Key Responsibilities</h2>
          <div className="whitespace-pre-line">
            <ul className="list-disc list-inside space-y-2 text-sm text-text-muted">
              {responsibilities.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Qualifications */}
      {qualifications.length > 0 && (
        <section className="space-y-3 border-t border-border-subtle pt-6">
          <h2 className="text-lg font-bold text-text-main">Qualifications</h2>
          <div className="whitespace-pre-line">
            <ul className="list-disc list-inside space-y-2 text-sm text-text-muted">
              {qualifications.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  )
}

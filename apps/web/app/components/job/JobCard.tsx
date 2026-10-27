'use client'

import { Bookmark, BriefcaseBusiness, MapPin } from 'lucide-react'
import { useState } from 'react'

export type Job = {
  id: string
  title: string
  company: string
  location: string
  roleType: 'Internship' | 'Full-time' | 'Part-time' | 'Contract'
  workModel: 'Remote' | 'Hybrid' | 'On-site'
  compensation: string
  techStack: string[]
}

type JobCardProps = {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  const [bookmarked, setBookmarked] = useState(false)

  return (
    <article className="group rounded-2xl border border-border-subtle bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light font-bold text-brand-dark">
            {job.company.charAt(0)}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-text-main">{job.title}</h3>

            <p className="mt-1 text-sm font-medium text-text-muted">{job.company}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setBookmarked((current) => !current)}
          aria-label={bookmarked ? `Remove ${job.title} bookmark` : `Bookmark ${job.title}`}
          aria-pressed={bookmarked}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
            bookmarked
              ? 'border-brand bg-brand-light text-brand-dark'
              : 'border-border-subtle text-text-muted hover:border-brand/40 hover:text-brand'
          }`}
        >
          <Bookmark className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {job.location}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <BriefcaseBusiness className="h-3.5 w-3.5" />
          {job.workModel}
        </span>

        <span>{job.roleType}</span>
      </div>

      <div className="mt-4 border-t border-border-subtle pt-4">
        <p className="text-sm font-bold text-text-main">{job.compensation}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {job.techStack.map((technology) => (
            <span
              key={technology}
              className="rounded-md bg-page-subtle px-2.5 py-1 text-xs font-medium text-text-muted"
            >
              {technology}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

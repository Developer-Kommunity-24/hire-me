import type { Candidate } from '../data'
import { getInitials } from '@/lib/utils'

type CandidateRowProps = {
  candidate: Candidate
  onViewProfile: (candidate: Candidate) => void
  onContact: (candidate: Candidate) => void
}

export default function CandidateRow({ candidate, onViewProfile, onContact }: CandidateRowProps) {
  const initials = getInitials(candidate.name)

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5 transition hover:shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bg-page font-semibold text-text-main">
          {initials}
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold text-main">{getInitials(candidate.name)}</h3>

          <p className="text-sm text-text-muted">Applied for: {getInitials(candidate.position)}</p>

          <p className="mt-1 text-xs text-text-muted">Applied {getInitials(candidate.appliedAt)}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-bg-page px-2.5 py-1 text-xs font-medium text-text-muted"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 gap-3">
        <button
          type="button"
          onClick={() => onViewProfile(candidate)}
          className="rounded-lg border border-text-main px-4 py-2 text-sm font-semibold text-text-main transition hover:bg-bg-page"
        >
          View Profile
        </button>

        <button
          type="button"
          onClick={() => onContact(candidate)}
          className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Contact
        </button>
      </div>
    </div>
  )
}

import type { Candidate } from '../data'
import { getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type CandidateRowProps = {
  candidate: Candidate
  onViewProfile: (candidate: Candidate) => void
  onContact: (candidate: Candidate) => void
}

export default function CandidateRow({ candidate, onViewProfile, onContact }: CandidateRowProps) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="shrink-0">
          <Avatar>
            <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
          </Avatar>
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">{candidate.name}</h3>

          <p className="text-sm text-muted-foreground">Applied for: {candidate.position}</p>

          <p className="mt-1 text-xs text-muted-foreground">Applied {candidate.appliedAt}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 gap-3">
        <Button type="button" variant="outline" onClick={() => onViewProfile(candidate)}>
          View Profile
        </Button>

        <Button type="button" onClick={() => onContact(candidate)}>
          Contact
        </Button>
      </div>
    </div>
  )
}

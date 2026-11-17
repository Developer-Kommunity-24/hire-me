'use client'

import type { Candidate, CandidateStatus } from '../data'
import { getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, CheckCircle2, ChevronRight, UserCheck, X, XCircle } from 'lucide-react'

type CandidateRowProps = {
  candidate: Candidate
  onViewProfile: (candidate: Candidate) => void
  onContact: (candidate: Candidate) => void
  onStatusChange?: (candidateId: string, nextStatus: CandidateStatus) => void
  isUpdating?: boolean
}

export default function CandidateRow({
  candidate,
  onViewProfile,
  onContact,
  onStatusChange,
  isUpdating = false,
}: CandidateRowProps) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="shrink-0">
          <Avatar>
            <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
          </Avatar>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{candidate.name}</h3>
            {candidate.gradYear && (
              <span className="text-xs text-muted-foreground font-medium">
                Class of {candidate.gradYear}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground">Applied for: {candidate.position}</p>
          <p className="mt-1 text-xs text-muted-foreground">Applied {candidate.appliedAt}</p>

          {candidate.skills && candidate.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center shrink-0 gap-2">
        {/* State Machine Transition Actions */}
        {onStatusChange && candidate.status === 'applied' && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isUpdating}
            onClick={() => onStatusChange(candidate.id, 'under_review')}
          >
            <ChevronRight className="w-3.5 h-3.5 mr-1 text-blue-600" />
            Review
          </Button>
        )}

        {onStatusChange && candidate.status === 'under_review' && (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isUpdating}
              onClick={() => onStatusChange(candidate.id, 'shortlisted')}
            >
              <UserCheck className="w-3.5 h-3.5 mr-1 text-purple-600" />
              Shortlist
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isUpdating}
              onClick={() => onStatusChange(candidate.id, 'rejected')}
            >
              <X className="w-3.5 h-3.5 mr-1 text-rose-600" />
              Reject
            </Button>
          </>
        )}

        {onStatusChange && candidate.status === 'shortlisted' && (
          <>
            <Button
              type="button"
              size="sm"
              disabled={isUpdating}
              onClick={() => onStatusChange(candidate.id, 'accepted')}
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Accept
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isUpdating}
              onClick={() => onStatusChange(candidate.id, 'rejected')}
            >
              <X className="w-3.5 h-3.5 mr-1 text-rose-600" />
              Reject
            </Button>
          </>
        )}

        {candidate.status === 'accepted' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accepted
          </span>
        )}

        {candidate.status === 'rejected' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        )}

        <Button type="button" size="sm" variant="outline" onClick={() => onViewProfile(candidate)}>
          View Profile
        </Button>

        <Button type="button" size="sm" onClick={() => onContact(candidate)}>
          Contact
        </Button>
      </div>
    </div>
  )
}

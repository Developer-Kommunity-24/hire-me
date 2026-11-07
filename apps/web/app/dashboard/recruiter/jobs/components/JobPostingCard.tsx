'use client'

import { useState } from 'react'
import { Calendar, Clock3, MapPin, MoreVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  formatEmploymentType,
  formatRelativeDate,
  formatWorkArrangement,
  type JobPostingItem,
} from '@/lib/postings-api'
import { cn } from '@/lib/utils'

export type { JobPostingItem }

interface JobPostingCardProps {
  job: JobPostingItem
  onClosePosting?: (id: string) => Promise<void> | void
  onEditPosting?: (job: JobPostingItem) => void
  onViewApplicants?: (id: string) => void
  onViewPosting?: (id: string) => void
}

function getStatusBadgeConfig(status: JobPostingItem['status']) {
  switch (status) {
    case 'active':
      return { label: 'Active', variant: 'default' as const }
    case 'closed':
      return { label: 'Closed', variant: 'secondary' as const }
    case 'expired':
      return { label: 'Expired', variant: 'destructive' as const }
    default:
      return { label: status, variant: 'secondary' as const }
  }
}

function getApplicantCountClass(applicants: number): string {
  if (applicants > 50) return 'text-primary'
  if (applicants === 0) return 'text-muted-foreground'
  return 'text-text-main'
}

export default function JobPostingCard({
  job,
  onClosePosting,
  onEditPosting,
  onViewApplicants,
  onViewPosting,
}: JobPostingCardProps) {
  const [isCloseAlertOpen, setIsCloseAlertOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const badgeConfig = getStatusBadgeConfig(job.status)

  const handleConfirmClose = async () => {
    if (!onClosePosting) return
    try {
      setIsClosing(true)
      await onClosePosting(job.id)
    } finally {
      setIsClosing(false)
      setIsCloseAlertOpen(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle>
                <span className="block truncate text-lg font-bold text-text-main" title={job.title}>
                  {job.title}
                </span>
              </CardTitle>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={badgeConfig.variant}>{badgeConfig.label}</Badge>

              <DropdownMenu>
                <div className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-text-main">
                  <DropdownMenuTrigger aria-label={`Open options menu for ${job.title}`}>
                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewPosting?.(job.id)}>
                    View Posting
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditPosting?.(job)}>
                    Edit Posting
                  </DropdownMenuItem>
                  {job.status === 'active' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setIsCloseAlertOpen(true)}
                      >
                        Close Posting
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              {job.location}
            </span>
            <span aria-hidden="true">•</span>
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-text-main">
              {formatEmploymentType(job.employmentType)}
            </span>
            <span aria-hidden="true">•</span>
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-text-muted">
              {formatWorkArrangement(job.workArrangement)}
            </span>
            <span aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              {formatRelativeDate(job.createdAt)}
            </span>
            {job.deadline && (
              <>
                <span aria-hidden="true">•</span>
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <Calendar
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Deadline: {job.deadline}
                </span>
              </>
            )}
          </div>

          {job.stack && job.stack.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.stack.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-border-subtle bg-bg-page px-2 py-0.5 text-xs font-medium text-text-muted"
                >
                  {tech}
                </span>
              ))}
              {job.stack.length > 4 && (
                <span className="rounded-md border border-border-subtle bg-bg-page px-1.5 py-0.5 text-xs font-medium text-text-muted">
                  +{job.stack.length - 4}
                </span>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-3 divide-x divide-border-subtle rounded-lg border border-border-subtle py-3 text-center">
            <div className="px-2">
              <p className={cn('text-3xl font-bold', getApplicantCountClass(job.applicants))}>
                {job.applicants.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Applicants
              </p>
            </div>
            <div className="px-2">
              <p className="text-3xl font-bold text-text-main">{job.inReview.toLocaleString()}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                In Review
              </p>
            </div>
            <div className="px-2">
              <p className="text-3xl font-bold text-text-main">
                {job.interviewing.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Interviewing
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="default"
              onClick={() => onViewApplicants?.(job.id)}
              aria-label={`View applicants for ${job.title}`}
            >
              View Applicants
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onEditPosting?.(job)}
              aria-label={`Edit posting for ${job.title}`}
            >
              Edit Posting
            </Button>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={isCloseAlertOpen} onOpenChange={setIsCloseAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this posting?</AlertDialogTitle>
            <AlertDialogDescription>
              Closing <strong>{job.title}</strong> will stop new candidates from discovering or
              applying for this position.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClosing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmClose}
              disabled={isClosing}
            >
              {isClosing ? 'Closing...' : 'Close Posting'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

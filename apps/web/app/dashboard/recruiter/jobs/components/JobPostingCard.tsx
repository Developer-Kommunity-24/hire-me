'use client'

import { Clock3, MapPin, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
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
import { cn } from '@/lib/utils'

export interface MockJobPosting {
  id: string
  title: string
  location: string
  employmentType: 'Full-time' | 'Internship' | 'Part-time' | 'Contract'
  status: 'active' | 'closed' | 'expired'
  postedAt: string
  applicants: number
  inReview: number
  interviewing: number
}

interface JobPostingCardProps {
  job: MockJobPosting
}

function getStatusBadgeConfig(status: MockJobPosting['status']) {
  switch (status) {
    case 'active':
      return { label: 'Active', variant: 'default' as const }
    case 'closed':
      return { label: 'Closed', variant: 'secondary' as const }
    case 'expired':
      return { label: 'Expired', variant: 'destructive' as const }
  }
}

function getApplicantCountClass(applicants: number): string {
  if (applicants > 50) return 'text-primary'
  if (applicants === 0) return 'text-muted-foreground'
  return 'text-text-main'
}

export default function JobPostingCard({ job }: JobPostingCardProps) {
  const badgeConfig = getStatusBadgeConfig(job.status)

  const handlePrimaryAction = () => {
    if (job.status === 'expired') {
      toast.info('Publishing is not implemented yet.')
    } else {
      toast.info('Opening applicant management...')
    }
  }

  const handleSecondaryAction = () => {
    if (job.status === 'active') {
      toast.info('Opening editor...')
    } else if (job.status === 'closed') {
      toast.info('Reopening is not implemented yet.')
    } else {
      toast.info('Opening draft editor...')
    }
  }

  return (
    <div className="group rounded-xl transition-all duration-200 hover:shadow-lg [&>div]:transition-colors [&>div]:duration-200 [&>div]:hover:border-primary">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle>
                <span className="block truncate">{job.title}</span>
              </CardTitle>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={badgeConfig.variant}>{badgeConfig.label}</Badge>

              <DropdownMenu>
                <div className="flex items-center text-muted-foreground transition-colors hover:text-text-main">
                  <DropdownMenuTrigger aria-label={`Open options menu for ${job.title}`}>
                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent align="end">
                  {job.status === 'active' && (
                    <>
                      <DropdownMenuItem onClick={() => toast.info(`Viewing posting: ${job.title}`)}>
                        View Posting
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toast.info(`Opening editor for ${job.title}...`)}
                      >
                        Edit Posting
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info(`Duplicating ${job.title}...`)}>
                        Duplicate Posting
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => toast.info(`Closing posting: ${job.title}...`)}
                      >
                        Close Posting
                      </DropdownMenuItem>
                    </>
                  )}
                  {job.status === 'closed' && (
                    <>
                      <DropdownMenuItem onClick={() => toast.info(`Viewing posting: ${job.title}`)}>
                        View Posting
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toast.info('Reopening is not implemented yet.')}
                      >
                        Reopen Posting
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info(`Duplicating ${job.title}...`)}>
                        Duplicate Posting
                      </DropdownMenuItem>
                    </>
                  )}
                  {job.status === 'expired' && (
                    <>
                      <DropdownMenuItem onClick={() => toast.info('Opening draft editor...')}>
                        Continue Editing
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toast.info('Publishing is not implemented yet.')}
                      >
                        Publish Posting
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info(`Duplicating ${job.title}...`)}>
                        Duplicate Posting
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
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              {job.postedAt}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-3 divide-x divide-border-subtle rounded-lg border border-border-subtle py-3 text-center">
            <div className="px-2">
              <p className={cn('text-3xl font-bold', getApplicantCountClass(job.applicants))}>
                {job.applicants}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Applicants
              </p>
            </div>
            <div className="px-2">
              <p className="text-3xl font-bold text-text-main">{job.inReview}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                In Review
              </p>
            </div>
            <div className="px-2">
              <p className="text-3xl font-bold text-text-main">{job.interviewing}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Interviewing
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="grid w-full grid-cols-2 gap-3">
            <Button
              type="button"
              variant="default"
              onClick={handlePrimaryAction}
              aria-label={
                job.status === 'expired'
                  ? `Publish posting for ${job.title}`
                  : `View applicants for ${job.title}`
              }
            >
              {job.status === 'expired' ? 'Publish Posting' : 'View Applicants'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSecondaryAction}
              aria-label={
                job.status === 'active'
                  ? `Edit posting for ${job.title}`
                  : job.status === 'closed'
                    ? `Reopen posting for ${job.title}`
                    : `Continue editing draft for ${job.title}`
              }
            >
              {job.status === 'active'
                ? 'Edit Posting'
                : job.status === 'closed'
                  ? 'Reopen Posting'
                  : 'Continue Editing'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

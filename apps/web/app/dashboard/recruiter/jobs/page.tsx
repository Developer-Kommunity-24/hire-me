'use client'

import { useMemo } from 'react'
import { Clock3, MapPin, MoreVertical, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import MetricCard from '../components/MetricCard'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

interface MockJobPosting {
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

const initialMockPostings: MockJobPosting[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    location: 'San Francisco, CA (Hybrid)',
    employmentType: 'Full-time',
    status: 'active',
    postedAt: 'Posted 3 days ago',
    applicants: 42,
    inReview: 12,
    interviewing: 5,
  },
  {
    id: '2',
    title: 'Product Designer',
    location: 'New York, NY (Remote)',
    employmentType: 'Full-time',
    status: 'active',
    postedAt: 'Posted 1 week ago',
    applicants: 89,
    inReview: 24,
    interviewing: 8,
  },
  {
    id: '3',
    title: 'Backend Systems Engineer',
    location: 'Seattle, WA (On-site)',
    employmentType: 'Full-time',
    status: 'closed',
    postedAt: 'Posted 2 weeks ago',
    applicants: 64,
    inReview: 18,
    interviewing: 0,
  },
  {
    id: '4',
    title: 'Data Analyst Intern',
    location: 'Austin, TX',
    employmentType: 'Internship',
    status: 'expired',
    postedAt: 'Posted 1 month ago',
    applicants: 0,
    inReview: 0,
    interviewing: 0,
  },
]

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

export default function JobPostingsPage() {
  const metrics = useMemo(() => {
    let activePostings = 0
    let closedPostings = 0
    let expiredPostings = 0

    for (const job of initialMockPostings) {
      if (job.status === 'active') {
        activePostings += 1
      } else if (job.status === 'closed') {
        closedPostings += 1
      } else if (job.status === 'expired') {
        expiredPostings += 1
      }
    }

    return {
      totalPostings: initialMockPostings.length,
      activePostings,
      closedPostings,
      expiredPostings,
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-bg-page">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Topbar />

        <main className="p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-green">
                Recruiter Portal
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-text-main">Job Postings</h1>
              <p className="mt-2 text-text-muted">
                Manage your company’s job postings, track applicant activity, and manage posting
                status.
              </p>
            </div>

            <div>
              <Button type="button">
                <Plus className="h-4 w-4" />
                Create Posting
              </Button>
            </div>
          </div>

          <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Total Postings" value={metrics.totalPostings} delta="" />
            <MetricCard title="Active Postings" value={metrics.activePostings} delta="" />
            <MetricCard title="Closed Postings" value={metrics.closedPostings} delta="" />
            <MetricCard title="Expired Postings" value={metrics.expiredPostings} delta="" />
          </section>

          <section className="mt-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {initialMockPostings.map((job) => {
                const badgeConfig = getStatusBadgeConfig(job.status)

                return (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <CardTitle>
                            <span className="truncate block">{job.title}</span>
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={badgeConfig.variant}>{badgeConfig.label}</Badge>
                          <button
                            type="button"
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-text-main"
                            aria-label={`Options for ${job.title}`}
                          >
                            <MoreVertical className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin
                            className="h-4 w-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                          {job.location}
                        </span>
                        <span aria-hidden="true">•</span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3
                            className="h-4 w-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                          {job.postedAt}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-3 divide-x divide-border-subtle rounded-lg border border-border-subtle py-3 text-center">
                        <div className="px-2">
                          <p className="text-3xl font-bold text-text-main">{job.applicants}</p>
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
                        <Button type="button" variant="default">
                          {job.status === 'expired' ? 'Publish Posting' : 'View Applicants'}
                        </Button>
                        <Button type="button" variant="outline">
                          {job.status === 'active'
                            ? 'Edit Posting'
                            : job.status === 'closed'
                              ? 'Reopen Posting'
                              : 'Continue Editing'}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

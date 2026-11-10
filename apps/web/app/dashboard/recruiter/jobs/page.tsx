'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUpDown, Filter, Plus, RefreshCw, Search, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  closePosting,
  createPosting,
  fetchMyPostings,
  type CreatePostingInput,
  type JobPostingItem,
} from '@/lib/postings-api'
import MetricCard from '../components/MetricCard'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import CreatePostingDialog from './components/CreatePostingDialog'
import JobPostingCard from './components/JobPostingCard'

type StatusFilter = 'all' | 'active' | 'closed' | 'expired'
type SortOption = 'newest' | 'oldest' | 'most-applicants' | 'least-applicants' | 'a-z' | 'z-a'

const STATUS_FILTER_OPTIONS: Record<StatusFilter, string> = {
  all: 'All',
  active: 'Active',
  closed: 'Closed',
  expired: 'Expired',
}

const SORT_OPTIONS: Record<SortOption, string> = {
  newest: 'Newest',
  oldest: 'Oldest',
  'most-applicants': 'Most Applicants',
  'least-applicants': 'Least Applicants',
  'a-z': 'A-Z',
  'z-a': 'Z-A',
}

const fallbackMockPostings: JobPostingItem[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    description: 'Lead frontend architecture using React, Next.js, and TypeScript.',
    stack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    location: 'San Francisco, CA (Hybrid)',
    employmentType: 'full_time',
    workArrangement: 'hybrid',
    status: 'active',
    deadline: '2026-12-31',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 42,
    inReview: 12,
    interviewing: 5,
  },
  {
    id: '2',
    title: 'Product Designer',
    description: 'Design intuitive interfaces and collaborate with engineers.',
    stack: ['Figma', 'Design Systems', 'Prototyping'],
    location: 'New York, NY (Remote)',
    employmentType: 'full_time',
    workArrangement: 'remote',
    status: 'active',
    deadline: '2026-12-15',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 89,
    inReview: 24,
    interviewing: 8,
  },
  {
    id: '3',
    title: 'Backend Systems Engineer',
    description: 'Build scalable distributed systems and databases.',
    stack: ['Go', 'PostgreSQL', 'Docker', 'Kubernetes'],
    location: 'Seattle, WA (On-site)',
    employmentType: 'full_time',
    workArrangement: 'in_person',
    status: 'closed',
    deadline: '2026-11-01',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 64,
    inReview: 18,
    interviewing: 0,
  },
  {
    id: '4',
    title: 'Data Analyst Intern',
    description: 'Analyze user metrics and generate insightful reports.',
    stack: ['Python', 'SQL', 'Pandas'],
    location: 'Austin, TX',
    employmentType: 'internship',
    workArrangement: 'in_person',
    status: 'expired',
    deadline: '2026-10-15',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 0,
    inReview: 0,
    interviewing: 0,
  },
]

export default function JobPostingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // React Query fetching from GET /api/postings/mine
  const {
    data: postings = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['recruiter', 'postings'],
    queryFn: async () => {
      try {
        return await fetchMyPostings()
      } catch {
        // Fall back to demo data in local dev or when session is not yet active
        return fallbackMockPostings
      }
    },
  })

  // Mutation for closing a posting (POST /api/postings/:id/close)
  const closeMutation = useMutation({
    mutationFn: (id: string) => closePosting(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<JobPostingItem[]>(['recruiter', 'postings'], (old = []) =>
        old.map((p) => (p.id === updated.id ? updated : p)),
      )
      toast.success('Job posting closed successfully')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to close posting')
    },
  })

  // Mutation for creating a posting (POST /api/postings)
  const createMutation = useMutation({
    mutationFn: (input: CreatePostingInput) => createPosting(input),
    onSuccess: (newPosting) => {
      queryClient.setQueryData<JobPostingItem[]>(['recruiter', 'postings'], (old = []) => [
        newPosting,
        ...old,
      ])
      toast.success('Job posting published successfully')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create posting')
    },
  })

  // Calculate high-level metrics directly from the postings list
  const metrics = useMemo(() => {
    let activePostings = 0
    let closedPostings = 0
    let expiredPostings = 0

    for (const job of postings) {
      if (job.status === 'active') {
        activePostings += 1
      } else if (job.status === 'closed') {
        closedPostings += 1
      } else if (job.status === 'expired') {
        expiredPostings += 1
      }
    }

    return {
      totalPostings: postings.length,
      activePostings,
      closedPostings,
      expiredPostings,
    }
  }, [postings])

  // Filter and sort postings with real chronological sorting
  const filteredAndSortedPostings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    const filtered = postings.filter((job) => {
      if (statusFilter !== 'all' && job.status !== statusFilter) {
        return false
      }

      if (query) {
        const matchesTitle = job.title.toLowerCase().includes(query)
        const matchesLocation = job.location.toLowerCase().includes(query)
        const matchesEmploymentType = job.employmentType.toLowerCase().includes(query)
        const matchesStatus = job.status.toLowerCase().includes(query)
        const matchesStack = job.stack?.some((tech) => tech.toLowerCase().includes(query))

        if (
          !matchesTitle &&
          !matchesLocation &&
          !matchesEmploymentType &&
          !matchesStatus &&
          !matchesStack
        ) {
          return false
        }
      }

      return true
    })

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'most-applicants':
          return (b.applicants ?? 0) - (a.applicants ?? 0)
        case 'least-applicants':
          return (a.applicants ?? 0) - (b.applicants ?? 0)
        case 'a-z':
          return a.title.localeCompare(b.title)
        case 'z-a':
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })
  }, [postings, searchQuery, statusFilter, sortBy])

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setSortBy('newest')
  }

  return (
    <div className="flex min-h-screen bg-bg-page">
      <Sidebar />

      <div className="min-w-0 flex-1 lg:ml-64">
        <Topbar />

        <main className="p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand">
                Recruiter Portal
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-text-main">Job Postings</h1>
              <p className="mt-2 text-text-muted">
                Manage your company’s job postings, track applicant activity, and manage posting
                status.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isLoading || isRefetching}
                aria-label="Refresh job postings"
              >
                <RefreshCw className={isRefetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
              </Button>
              <Button type="button" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Posting
              </Button>
            </div>
          </div>

          <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Total Postings" value={metrics.totalPostings} />
            <MetricCard title="Active Postings" value={metrics.activePostings} />
            <MetricCard title="Closed Postings" value={metrics.closedPostings} />
            <MetricCard title="Expired Postings" value={metrics.expiredPostings} />
          </section>

          <section className="mt-10 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="Search by title, location, tech stack..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search postings"
                  className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-4 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="w-full sm:w-36">
                  <Select
                    items={STATUS_FILTER_OPTIONS}
                    value={statusFilter}
                    onValueChange={(val) => setStatusFilter((val ?? 'all') as StatusFilter)}
                  >
                    <SelectTrigger aria-label="Filter by status">
                      <Filter className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-44">
                  <Select
                    items={SORT_OPTIONS}
                    value={sortBy}
                    onValueChange={(val) => setSortBy((val ?? 'newest') as SortOption)}
                  >
                    <SelectTrigger aria-label="Sort postings">
                      <ArrowUpDown
                        className="h-3.5 w-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="most-applicants">Most Applicants</SelectItem>
                      <SelectItem value="least-applicants">Least Applicants</SelectItem>
                      <SelectItem value="a-z">A-Z</SelectItem>
                      <SelectItem value="z-a">Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <Card key={n}>
                    <CardContent>
                      <div className="space-y-4 pt-6">
                        <div className="flex justify-between">
                          <div className="h-6 w-1/2 rounded-md bg-muted animate-pulse" />
                          <div className="h-6 w-16 rounded-md bg-muted animate-pulse" />
                        </div>
                        <div className="h-4 w-3/4 rounded-md bg-muted animate-pulse" />
                        <div className="h-20 w-full rounded-md bg-muted animate-pulse" />
                        <div className="flex gap-3">
                          <div className="h-10 flex-1 rounded-md bg-muted animate-pulse" />
                          <div className="h-10 flex-1 rounded-md bg-muted animate-pulse" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : isError ? (
              <Card>
                <CardContent>
                  <div className="py-12 text-center">
                    <p className="text-destructive font-semibold">Failed to load postings.</p>
                    <div className="mt-4">
                      <Button variant="outline" onClick={() => refetch()}>
                        Try Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredAndSortedPostings.length === 0 ? (
              <Card>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <SearchX className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h2 className="mt-4 text-base font-semibold text-text-main">
                      No postings found
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchQuery || statusFilter !== 'all'
                        ? 'Try adjusting your search or filters.'
                        : 'You haven’t created any job postings yet.'}
                    </p>
                    <div className="mt-6 flex gap-3">
                      {Boolean(searchQuery || statusFilter !== 'all') && (
                        <Button type="button" variant="outline" onClick={handleResetFilters}>
                          Reset Filters
                        </Button>
                      )}
                      <Button type="button" onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Create Posting
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAndSortedPostings.map((job) => (
                  <JobPostingCard
                    key={job.id}
                    job={job}
                    onClosePosting={async (id) => {
                      await closeMutation.mutateAsync(id)
                    }}
                    onViewPosting={(id) => {
                      router.push(`/jobs/${id}`)
                    }}
                    onEditPosting={(j) => {
                      toast.info(`Editing posting: ${j.title}`)
                    }}
                    onViewApplicants={(id) => {
                      router.push(`/dashboard/recruiter#applicant-pipeline?jobId=${id}`)
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <CreatePostingDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={async (input) => {
          await createMutation.mutateAsync(input)
        }}
        isSubmitting={createMutation.isPending}
      />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Briefcase, Loader2, RefreshCw } from 'lucide-react'
import JobCard, { type Job } from '@/app/components/job/JobCard'
import JobFilters, { type RoleType, type WorkModel } from '@/app/components/job/JobFilters'
import JobSearch, { type SortOption } from '@/app/components/job/JobSearch'
import { ApiError } from '@/lib/api-client'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'
import Header from '@/components/common/Header'

type ApiJob = {
  id: string
  title: string
  description: string
  stack: string[]
  employmentType: 'internship' | 'full_time' | 'part_time' | 'contract'
  workArrangement: 'in_person' | 'remote' | 'hybrid'
  compensation: string | null
  location: string
  recruiter?: {
    companyName?: string
  }
}

type JobsResponse = {
  data: ApiJob[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

type JobFiltersState = {
  search: string
  roleType: RoleType
  workModel: WorkModel
  sortBy: SortOption
}

const ROLE_TYPE_LABELS: Record<string, Job['roleType']> = {
  internship: 'Internship',
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
}

const WORK_MODEL_LABELS: Record<string, Job['workModel']> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  in_person: 'On-site',
}

const ROLE_TYPE_PARAMS: Record<Exclude<RoleType, 'All'>, ApiJob['employmentType']> = {
  Internship: 'internship',
  'Full-time': 'full_time',
  'Part-time': 'part_time',
  Contract: 'contract',
}

const WORK_MODEL_PARAMS: Record<Exclude<WorkModel, 'All'>, ApiJob['workArrangement']> = {
  Remote: 'remote',
  Hybrid: 'hybrid',
  'On-site': 'in_person',
}

const SORT_PARAMS: Record<SortOption, { sortBy: string; order: string }> = {
  newest: { sortBy: 'createdAt', order: 'desc' },
  deadline: { sortBy: 'deadline', order: 'asc' },
  title: { sortBy: 'title', order: 'asc' },
}

function formatRoleType(type: string): Job['roleType'] {
  return ROLE_TYPE_LABELS[type] ?? 'Full-time'
}

function formatWorkModel(model: string): Job['workModel'] {
  return WORK_MODEL_LABELS[model] ?? 'On-site'
}

function toJob(job: ApiJob): Job {
  return {
    id: job.id,
    title: job.title,
    company: job.recruiter?.companyName ?? 'Company',
    location: job.location,
    roleType: formatRoleType(job.employmentType),
    workModel: formatWorkModel(job.workArrangement),
    compensation: job.compensation ?? 'Compensation not specified',
    techStack: job.stack ?? [],
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'

async function fetchJobs(filters: JobFiltersState, signal: AbortSignal) {
  const params = new URLSearchParams()

  if (filters.search.trim()) {
    params.set('q', filters.search.trim())
  }

  if (filters.roleType !== 'All') {
    params.set('employmentType', ROLE_TYPE_PARAMS[filters.roleType])
  }

  if (filters.workModel !== 'All') {
    params.set('workArrangement', WORK_MODEL_PARAMS[filters.workModel])
  }

  const sort = SORT_PARAMS[filters.sortBy]
  params.set('sortBy', sort.sortBy)
  params.set('order', sort.order)
  params.set('page', '1')
  params.set('limit', '20')

  // /api/postings is public, so no bearer token is needed.
  const response = await fetch(`${API_BASE_URL}/api/postings?${params.toString()}`, { signal })

  if (!response.ok) {
    throw new ApiError(response.status, `Request failed (${response.status})`)
  }

  const body = (await response.json()) as JobsResponse

  return { jobs: body.data.map(toJob), total: body.meta.total }
}

export default function StudentJobsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const isAuthenticated = Boolean(user)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleType, setRoleType] = useState<RoleType>('All')
  const [workModel, setWorkModel] = useState<WorkModel>('All')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Debounce only the text input; filters and sort apply immediately.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['postings', { search: debouncedSearch, roleType, workModel, sortBy }],
    queryFn: ({ signal }) =>
      fetchJobs({ search: debouncedSearch, roleType, workModel, sortBy }, signal),
    placeholderData: keepPreviousData,
    enabled: isAuthenticated,
  })

  const jobs = data?.jobs ?? []
  const totalJobs = data?.total ?? 0
  const errorMessage =
    error instanceof ApiError
      ? error.message
      : 'Unable to load job postings. Please check that the API is running.'

  const handleResetFilters = () => {
    setSearchInput('')
    setDebouncedSearch('')
    setRoleType('All')
    setWorkModel('All')
    setSortBy('newest')
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-8">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="mt-3 text-sm text-text-muted">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <>
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full animate-fade-in flex-1">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-main flex items-center gap-2">
              Explore Opportunities
            </h2>
            <p className="text-sm text-text-muted mt-1">
              Apply to active positions from verified partner companies and DK24 clubs.
            </p>
          </div>
        </div>

        <JobSearch
          search={searchInput}
          onSearchChange={setSearchInput}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
          <JobFilters
            roleType={roleType}
            onRoleTypeChange={setRoleType}
            workModel={workModel}
            onWorkModelChange={setWorkModel}
          />

          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {isFetching
                  ? 'Refreshing opportunities...'
                  : `${totalJobs} ${totalJobs === 1 ? 'position' : 'positions'} found`}
              </p>
              {(searchInput || roleType !== 'All' || workModel !== 'All') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((skeletonId) => (
                  <div
                    key={skeletonId}
                    className="rounded-2xl border border-border-subtle bg-card p-5 animate-pulse"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-page-subtle shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-page-subtle rounded-md w-1/3" />
                        <div className="h-3 bg-page-subtle rounded-md w-1/4" />
                      </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-border-subtle flex gap-2">
                      <div className="h-6 w-16 bg-page-subtle rounded-md" />
                      <div className="h-6 w-20 bg-page-subtle rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-2xl border border-border-subtle bg-card p-8 text-center shadow-xs">
                <p className="font-semibold text-red-600 mb-1">{errorMessage}</p>
                <p className="text-xs text-text-muted mb-4">
                  Please verify that the backend API worker is running and reachable.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Try Again
                </Button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-2xl border border-border-subtle bg-card p-12 text-center shadow-xs">
                <div className="w-12 h-12 bg-brand-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-main mb-1">
                  No postings match your criteria
                </h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto mb-5">
                  Try adjusting your keywords, role types, or location filters to see more results.
                </p>
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  )
}

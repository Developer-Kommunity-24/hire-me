'use client'

import { useCallback, useEffect, useState } from 'react'
import { Briefcase, RefreshCw, Sparkles } from 'lucide-react'
import JobCard, { type Job } from '@/app/components/job/JobCard'
import JobFilters, { type RoleType, type WorkModel } from '@/app/components/job/JobFilters'
import JobSearch, { type SortOption } from '@/app/components/job/JobSearch'
import { apiFetch, ApiError } from '@/lib/api-client'
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'

function formatRoleType(type: ApiJob['employmentType']): Job['roleType'] {
  switch (type) {
    case 'internship':
      return 'Internship'
    case 'full_time':
      return 'Full-time'
    case 'part_time':
      return 'Part-time'
    case 'contract':
      return 'Contract'
  }
}

function formatWorkModel(model: ApiJob['workArrangement']): Job['workModel'] {
  switch (model) {
    case 'remote':
      return 'Remote'
    case 'hybrid':
      return 'Hybrid'
    case 'in_person':
      return 'On-site'
  }
}

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [search, setSearch] = useState('')
  const [roleType, setRoleType] = useState<RoleType>('All')
  const [workModel, setWorkModel] = useState<WorkModel>('All')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalJobs, setTotalJobs] = useState(0)

  const loadJobs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      if (search.trim()) {
        params.set('q', search.trim())
      }

      if (roleType !== 'All') {
        const roleMap: Record<Exclude<RoleType, 'All'>, ApiJob['employmentType']> = {
          Internship: 'internship',
          'Full-time': 'full_time',
          'Part-time': 'part_time',
          Contract: 'contract',
        }
        params.set('employmentType', roleMap[roleType])
      }

      if (workModel !== 'All') {
        const workMap: Record<Exclude<WorkModel, 'All'>, ApiJob['workArrangement']> = {
          Remote: 'remote',
          Hybrid: 'hybrid',
          'On-site': 'in_person',
        }
        params.set('workArrangement', workMap[workModel])
      }

      if (sortBy === 'newest') {
        params.set('sortBy', 'createdAt')
        params.set('order', 'desc')
      } else if (sortBy === 'deadline') {
        params.set('sortBy', 'deadline')
        params.set('order', 'asc')
      } else {
        params.set('sortBy', 'title')
        params.set('order', 'asc')
      }

      params.set('page', '1')
      params.set('limit', '20')

      const queryString = params.toString()
      let response: JobsResponse

      try {
        response = await apiFetch<JobsResponse>(`/api/postings?${queryString}`)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // Public endpoint fallback if not authenticated in browser session yet
          const res = await fetch(`${API_BASE_URL}/api/postings?${queryString}`)
          if (!res.ok) throw err
          response = (await res.json()) as JobsResponse
        } else {
          throw err
        }
      }

      const formattedJobs: Job[] = response.data.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.recruiter?.companyName ?? 'Company',
        location: job.location,
        roleType: formatRoleType(job.employmentType),
        workModel: formatWorkModel(job.workArrangement),
        compensation: job.compensation ?? 'Compensation not specified',
        techStack: job.stack ?? [],
      }))

      setJobs(formattedJobs)
      setTotalJobs(response.meta.total)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Unable to load job postings. Please check that the API is running.')
      }
      setJobs([])
      setTotalJobs(0)
    } finally {
      setLoading(false)
    }
  }, [search, roleType, workModel, sortBy])

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadJobs()
    }, 300)

    return () => clearTimeout(timeout)
  }, [loadJobs])

  const handleResetFilters = () => {
    setSearch('')
    setRoleType('All')
    setWorkModel('All')
    setSortBy('newest')
  }

  return (
    <>
      <Header
        title="Job Feed"
        subtitle="Discover internships, full-time roles, and opportunities matched for you"
        icon={Briefcase}
      />

      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full animate-fade-in flex-1">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-main flex items-center gap-2">
              Explore Opportunities
              <Sparkles className="w-5 h-5 text-brand" />
            </h2>
            <p className="text-sm text-text-muted mt-1">
              Apply to active positions from verified partner companies and DK24 clubs.
            </p>
          </div>
        </div>

        <JobSearch
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside>
            <JobFilters
              roleType={roleType}
              onRoleTypeChange={setRoleType}
              workModel={workModel}
              onWorkModelChange={setWorkModel}
            />
          </aside>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {loading
                  ? 'Refreshing opportunities...'
                  : `${totalJobs} ${totalJobs === 1 ? 'position' : 'positions'} found`}
              </p>
              {(search || roleType !== 'All' || workModel !== 'All') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {loading ? (
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
            ) : error ? (
              <div className="rounded-2xl border border-border-subtle bg-card p-8 text-center shadow-xs">
                <p className="font-semibold text-red-600 mb-1">{error}</p>
                <p className="text-xs text-text-muted mb-4">
                  Please verify that the backend API worker is running and reachable.
                </p>
                <Button variant="outline" size="sm" onClick={() => loadJobs()}>
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

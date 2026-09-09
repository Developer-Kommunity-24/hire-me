'use client'

import { useEffect, useState } from 'react'
import JobCard, { type Job } from '../components/job/JobCard'
import JobFilters from '../components/job/JobFilters'
import JobSearch from '../components/job/JobSearch'
import { apiFetch, ApiError } from '../../lib/api-client'

type RoleType = 'All' | 'Internship' | 'Full-time' | 'Part-time' | 'Contract'
type WorkModel = 'All' | 'Remote' | 'Hybrid' | 'On-site'
type SortOption = 'newest' | 'deadline' | 'title'

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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [search, setSearch] = useState('')
  const [roleType, setRoleType] = useState<RoleType>('All')
  const [workModel, setWorkModel] = useState<WorkModel>('All')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalJobs, setTotalJobs] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(async () => {
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

        const response = await apiFetch<JobsResponse>(`/api/postings?${params.toString()}`)

        const formattedJobs: Job[] = response.data.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.recruiter?.companyName ?? 'Company',
          location: job.location,
          roleType: formatRoleType(job.employmentType),
          workModel: formatWorkModel(job.workArrangement),
          compensation: job.compensation ?? 'Compensation not specified',
          techStack: job.stack,
        }))

        setJobs(formattedJobs)
        setTotalJobs(response.meta.total)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('Unable to load jobs. Please try again.')
        }

        setJobs([])
        setTotalJobs(0)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [search, roleType, workModel, sortBy])

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-slate-900">DK24 CareerLink</h1>

          <span className="text-sm text-slate-500">Job Discovery</span>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Find your next opportunity</h2>

          <p className="mt-2 text-slate-500">
            Discover jobs and internships that match your skills.
          </p>
        </div>

        <JobSearch
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside>
            <JobFilters
              roleType={roleType}
              onRoleTypeChange={setRoleType}
              workModel={workModel}
              onWorkModelChange={setWorkModel}
            />
          </aside>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {loading ? 'Loading jobs...' : `${totalJobs} jobs found`}
              </p>
            </div>

            {loading ? (
              <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                <p className="text-slate-500">Loading job opportunities...</p>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                <p className="font-medium text-red-600">{error}</p>
                <p className="mt-2 text-sm text-slate-500">
                  Please make sure you are signed in and the API is running.
                </p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                <p className="font-medium text-slate-700">No jobs found</p>

                <p className="mt-2 text-sm text-slate-500">Try changing your search or filters.</p>
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
      </div>
    </main>
  )
}

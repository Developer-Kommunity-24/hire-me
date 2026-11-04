'use client'

import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MetricCard from '../components/MetricCard'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

interface MockJobPosting {
  id: string
  title: string
  status: 'active' | 'closed' | 'expired'
}

const initialMockPostings: MockJobPosting[] = [
  { id: '1', title: 'Senior Frontend Engineer', status: 'active' },
  { id: '2', title: 'Full Stack Developer Intern', status: 'active' },
  { id: '3', title: 'Backend Systems Engineer', status: 'closed' },
  { id: '4', title: 'UI/UX Design Intern', status: 'expired' },
]

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
        </main>
      </div>
    </div>
  )
}

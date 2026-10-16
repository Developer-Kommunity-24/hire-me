import { notFound } from 'next/navigation'
import { AppLayout } from '../../components/layout/AppLayout'
import { JobHeader } from '../../components/job/JobHeader'
import { JobDetails } from '../../components/job/JobDetails'
import { JobSidebar } from '../../components/job/JobSidebar'
import { Job } from '../../types/job'

interface PageProps {
  params: Promise<{ id: string }>
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function getJob(id: string): Promise<Job | null | 'ERROR'> {
  try {
    const res = await fetch(`${BASE_URL}/api/jobs/${id}`, {
      cache: 'no-store',
    })

    if (res.status === 404) {
      return null
    }

    if (!res.ok) {
      return 'ERROR'
    }

    return await res.json()
  } catch (err) {
    console.error(`[Jobs API Error]: Fetch failed for job ID ${id}`, err)
    return 'ERROR'
  }
}

export default async function JobPostingPage({ params }: PageProps) {
  const { id } = await params
  const jobResult = await getJob(id)

  // 1. Trigger Next.js 404 page outside try/catch
  if (jobResult === null) {
    notFound()
  }

  // 2. Handle 500 or Network connection failures gracefully
  if (jobResult === 'ERROR') {
    return (
      <AppLayout>
        <div className="p-6 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-sm font-medium">
          Failed to load job details. Please try again later.
        </div>
      </AppLayout>
    )
  }

  const job = jobResult

  return (
    <AppLayout>
      <JobHeader job={job} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <JobDetails job={job} />
        </div>
        <div className="lg:col-span-1">
          <JobSidebar job={job} />
        </div>
      </div>
    </AppLayout>
  )
}

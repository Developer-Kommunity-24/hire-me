import { notFound } from 'next/navigation'
import { JobHeader } from '../../components/job/JobHeader'
import { JobDetails } from '../../components/job/JobDetails'
import { JobSidebar } from '../../components/job/JobSidebar'
import { getJobServer } from './get-job'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function JobPostingPage({ params }: PageProps) {
  const { id } = await params
  const job = await getJobServer(id)

  if (!job) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <JobHeader job={job} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <JobDetails job={job} />
        </div>
        <div className="lg:col-span-1">
          <JobSidebar job={job} />
        </div>
      </div>
    </div>
  )
}

'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getRecruiterApplicants,
  getRecruiterMetrics,
  type Applicant,
  type RecruiterMetrics,
} from '@/lib/recruiter-api'

export default function RecruiterDashboardData() {
  const metrics = useQuery<RecruiterMetrics>({
    queryKey: ['recruiter', 'metrics'],
    queryFn: getRecruiterMetrics,
  })

  const applicants = useQuery<Applicant[]>({
    queryKey: ['recruiter', 'applicants'],
    queryFn: getRecruiterApplicants,
  })

  if (metrics.isPending || applicants.isPending) {
    return <p className="p-6">Loading recruiter dashboard...</p>
  }

  if (metrics.isError || applicants.isError) {
    return (
      <div className="p-6" role="alert">
        <p>Unable to load recruiter data.</p>
        <button
          className="mt-3 rounded-md border px-4 py-2"
          onClick={() => {
            void metrics.refetch()
            void applicants.refetch()
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border bg-white p-5">
        <p>Active Jobs</p>
        <p className="text-3xl font-semibold">{metrics.data.activeJobs}</p>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <p>Total Applicants</p>
        <p className="text-3xl font-semibold">{metrics.data.totalApplicants}</p>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <p>Pending Reviews</p>
        <p className="text-3xl font-semibold">{metrics.data.pendingReviews}</p>
      </div>

      <div className="col-span-full">
        <h2 className="mb-3 text-xl font-semibold">Applicants</h2>
        {applicants.data.length === 0 ? (
          <p>No applicants yet.</p>
        ) : (
          applicants.data.map((applicant) => (
            <div key={applicant.id} className="mb-3 rounded-xl border bg-white p-4">
              <p className="font-medium">{applicant.name}</p>
              <p className="text-sm text-gray-500">
                {applicant.position} · {applicant.status.replace('_', ' ')}
              </p>
              <p className="text-sm">{applicant.email}</p>
              <p className="text-sm">{applicant.skills.join(', ')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

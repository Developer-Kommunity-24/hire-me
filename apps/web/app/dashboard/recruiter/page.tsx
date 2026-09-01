'use client'

import { useMemo, useState, useEffect } from 'react'

import CandidateRow from './components/CandidateRow'
import MetricCard from './components/MetricCard'
import PipelineTabs from './components/PipelineTabs'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'

import { candidates, dashboardMetrics, type Candidate, type CandidateStatus } from './data'

export default function RecruiterDashboard() {
  useEffect(() => {
    const savedProfile = localStorage.getItem('recruiter_profile')

    if (!savedProfile) {
      return
    }

    try {
      setProfile(JSON.parse(savedProfile))
    } catch {
      console.error('Failed to parse recruiter profile')
      localStorage.removeItem('recruiter_profile')
    }
  }, [])
  const [profile, setProfile] = useState<RecruiterProfile | null>(null)

  const [activeTab, setActiveTab] = useState<CandidateStatus>('applied')

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const [contactCandidate, setContactCandidate] = useState<Candidate | null>(null)

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => candidate.status === activeTab)
  }, [activeTab])

  const counts = candidates.reduce(
    (acc, candidate) => {
      acc[candidate.status] += 1
      return acc
    },
    {
      applied: 0,
      under_review: 0,
      shortlisted: 0,
    },
  )
  interface RecruiterProfile {
    companyName: string
    companyMail: string
    companyUrl: string
    headquartersLocation: string
  }

  return (
    <div className="flex min-h-screen bg-bg-page">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Topbar />

        <main className="p-6 lg:p-8">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-green">
              Recruiter Dashboard
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-text-main">Welcome back!</h1>

            <p className="mt-2 text-text-muted">
              Here's an overview of your recruitment activity
              {profile?.companyName ? ` at ${profile.companyName}` : ''}.
            </p>
          </div>

          <section className="grid gap-5 md:grid-cols-3">
            <MetricCard
              title="Active Jobs"
              value={dashboardMetrics.activeJobs}
              delta={dashboardMetrics.activeJobsDelta}
            />

            <MetricCard
              title="Total Applicants"
              value={dashboardMetrics.totalApplicants}
              delta={dashboardMetrics.applicantsDelta}
            />

            <MetricCard
              title="Pending Reviews"
              value={dashboardMetrics.pendingReviews}
              delta={dashboardMetrics.pendingReviewsDelta}
            />
          </section>

          <section className="mt-10">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-main">Applicant Pipeline Management</h2>

                <p className="mt-1 text-sm text-text-muted">
                  Review and manage candidates across your hiring pipeline.
                </p>
              </div>

              <select className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-text-main outline-none focus:border-brand">
                <option>Date Applied (Newest)</option>
                <option>Date Applied (Oldest)</option>
              </select>
            </div>

            <PipelineTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />

            <div className="mt-5 space-y-3">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => (
                  <CandidateRow
                    key={candidate.id}
                    candidate={candidate}
                    onViewProfile={setSelectedCandidate}
                    onContact={setContactCandidate}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                  <p className="font-semibold text-text-main">No candidates found</p>

                  <p className="mt-1 text-sm text-text-muted">
                    There are no candidates in this stage yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {selectedCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-page p-4"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-main">{selectedCandidate.name}</h2>

                <p className="mt-1 text-text-muted">{selectedCandidate.headline}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="text-2xl text-text-main hover:text-text-main"
              >
                ×
              </button>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-text-main">Applied for</p>

              <p className="mt-1 text-sm text-text-muted">{selectedCandidate.position}</p>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-text-main">Skills</p>

              <div className="mt-2 flex flex-wrap gap-2">
                {selectedCandidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-bg-name px-3 py-1.5 text-sm text-text-muted"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-text-main">Email</p>

              <p className="mt-1 text-sm text-text-muted">{selectedCandidate.email}</p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCandidate(null)}
              className="mt-7 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-green"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {contactCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-page p-4"
          onClick={() => setContactCandidate(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-text-main">Contact {contactCandidate.name}</h2>

            <p className="mt-2 text-sm text-text-muted">{contactCandidate.email}</p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setContactCandidate(null)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-3 font-semibold text-text-muted"
              >
                Cancel
              </button>

              <a
                href={`mailto:${contactCandidate.email}`}
                className="flex-1 rounded-lg bg-bg-page px-4 py-3 text-center font-semibold text-white transition hover:bg-bg-page"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

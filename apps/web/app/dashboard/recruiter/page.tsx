'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, FileText, Globe, Link2, Loader2, RefreshCw, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import RecruiterProfileForm from './components/RecruiterProfileForm'
import CandidateRow from './components/CandidateRow'
import MetricCard from './components/MetricCard'
import PipelineTabs from './components/PipelineTabs'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import { type Candidate, type CandidateStatus } from './data'
import {
  fetchMyRecruiterProfile,
  fetchPostingApplicants,
  recruiterQueryKeys,
  updateApplicationStatus,
  updateRecruiterProfile,
  type RecruiterProfile,
} from '@/lib/recruiter-api'
import { fetchMyPostings, recruiterPostingsQueryKey } from '@/lib/postings-api'

function RecruiterDashboardContent() {
  const searchParams = useSearchParams()
  const initialJobId = searchParams.get('jobId') ?? 'all'
  const queryClient = useQueryClient()

  const [selectedJobFilter, setSelectedJobFilter] = useState<string>(initialJobId)
  const [activeTab, setActiveTab] = useState<CandidateStatus>('applied')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [contactCandidate, setContactCandidate] = useState<Candidate | null>(null)
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // 1. Fetch Recruiter Profile (GET /api/recruiters/me)
  const { data: profile } = useQuery<RecruiterProfile>({
    queryKey: recruiterQueryKeys.profile,
    queryFn: fetchMyRecruiterProfile,
  })

  // 2. Profile Mutation (PATCH /api/recruiters/me)
  const profileMutation = useMutation({
    mutationFn: updateRecruiterProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(recruiterQueryKeys.profile, updated)
      queryClient.invalidateQueries({ queryKey: recruiterQueryKeys.profile })
      toast.success('Company profile updated successfully')
      setIsProfileFormOpen(false)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update company profile')
    },
  })

  // 3. Fetch Recruiter Postings (GET /api/postings/mine)
  const { data: postings = [], isLoading: isLoadingPostings } = useQuery({
    queryKey: recruiterPostingsQueryKey,
    queryFn: fetchMyPostings,
  })

  // 4. Fetch Applicants across postings (GET /api/postings/:id/applications)
  const postingIdsKey = postings
    .map((p) => p.id)
    .sort()
    .join(',')
  const {
    data: candidatesList = [],
    isLoading: isLoadingApplicants,
    refetch: refetchApplicants,
    isRefetching,
  } = useQuery<Candidate[]>({
    queryKey: ['recruiter', 'all-applications', postingIdsKey],
    queryFn: async () => {
      if (postings.length === 0) return []
      const results = await Promise.all(
        postings.map(async (posting) => {
          try {
            const apps = await fetchPostingApplicants(posting.id)
            return apps.map((app) => ({
              id: app.id,
              name: app.student.fullName,
              position: posting.title,
              email: app.student.email,
              headline: app.student.headline ?? 'Candidate',
              skills: [],
              status: app.status as CandidateStatus,
              appliedAt: new Date(app.appliedAt).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              postingId: posting.id,
              studentId: app.studentId,
              resumeUrl: app.student.resumeUrl,
              githubUrl: app.student.githubUrl,
              linkedinUrl: app.student.linkedinUrl,
              gradYear: app.student.gradYear,
            }))
          } catch {
            return []
          }
        }),
      )
      return results.flat()
    },
    enabled: postings.length > 0,
  })

  // 5. Update Applicant Status (PATCH /api/applications/:id/status)
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CandidateStatus }) =>
      updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter', 'all-applications'] })
      queryClient.invalidateQueries({ queryKey: recruiterPostingsQueryKey })
      toast.success('Candidate status updated successfully')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update candidate status')
    },
  })

  // Dynamic Dashboard Metrics
  const metrics = useMemo(() => {
    const activeJobs = postings.filter((p) => p.status === 'active').length
    const totalApplicants = candidatesList.length
    const pendingReviews = candidatesList.filter(
      (c) => c.status === 'applied' || c.status === 'under_review',
    ).length
    return {
      activeJobs,
      totalApplicants,
      pendingReviews,
    }
  }, [postings, candidatesList])

  // Filter candidates by job and current pipeline stage
  const filteredCandidates = useMemo(() => {
    let list = candidatesList
    if (selectedJobFilter !== 'all') {
      list = list.filter((c) => c.postingId === selectedJobFilter)
    }
    list = list.filter((c) => c.status === activeTab)

    return list.slice().sort((a, b) => {
      const dateA = new Date(a.appliedAt).getTime()
      const dateB = new Date(b.appliedAt).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })
  }, [candidatesList, selectedJobFilter, activeTab, sortOrder])

  // Count candidates per pipeline tab
  const counts = useMemo(() => {
    let pool = candidatesList
    if (selectedJobFilter !== 'all') {
      pool = pool.filter((c) => c.postingId === selectedJobFilter)
    }

    const map: Record<CandidateStatus, number> = {
      applied: 0,
      under_review: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0,
    }

    for (const c of pool) {
      if (map[c.status] !== undefined) {
        map[c.status] += 1
      }
    }
    return map
  }, [candidatesList, selectedJobFilter])

  return (
    <div className="flex min-h-screen bg-bg-page font-sans">
      <Sidebar />

      <div className="min-w-0 flex-1 lg:ml-64">
        <Topbar />

        <main className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header & Company Title */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand">
                Recruiter Dashboard
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-text-main">
                Welcome back{profile?.companyName ? `, ${profile.companyName}` : ''}!
              </h1>
              <p className="mt-1 text-text-muted">
                Here is an overview of your recruitment activity and hiring pipeline.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetchApplicants()}
                disabled={isRefetching}
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button type="button" onClick={() => setIsProfileFormOpen(true)}>
                Edit Company Profile
              </Button>
            </div>
          </div>

          {/* Metric Cards */}
          <section
            id="applicant-pipeline"
            className="mt-6 scroll-mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <MetricCard
              title="Active Jobs"
              value={metrics.activeJobs}
              delta={`${postings.length} total postings`}
            />
            <MetricCard title="Total Applicants" value={metrics.totalApplicants} delta="All time" />
            <MetricCard
              title="Pending Reviews"
              value={metrics.pendingReviews}
              delta="Needs action"
            />
          </section>

          {/* Applicant Pipeline Section */}
          <section className="mt-10">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-main">Applicant Pipeline Management</h2>
                <p className="mt-1 text-sm text-text-muted">
                  Review and progress candidates through each stage of your hiring pipeline.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Filter by Job Posting */}
                {postings.length > 0 && (
                  <select
                    value={selectedJobFilter}
                    onChange={(e) => setSelectedJobFilter(e.target.value)}
                    aria-label="Filter applicants by job posting"
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-text-main outline-none focus:border-brand shadow-xs"
                  >
                    <option value="all">All Postings ({candidatesList.length})</option>
                    {postings.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                )}

                {/* Sort Order */}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                  aria-label="Sort applicants by date"
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-text-main outline-none focus:border-brand shadow-xs"
                >
                  <option value="newest">Date Applied (Newest)</option>
                  <option value="oldest">Date Applied (Oldest)</option>
                </select>
              </div>
            </div>

            <PipelineTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />

            <div className="mt-5 space-y-3">
              {isLoadingApplicants || isLoadingPostings ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
                  <p className="text-sm font-medium text-text-muted">Loading applicants...</p>
                </div>
              ) : filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => (
                  <CandidateRow
                    key={candidate.id}
                    candidate={candidate}
                    onViewProfile={setSelectedCandidate}
                    onContact={setContactCandidate}
                    onStatusChange={(id, nextStatus) =>
                      statusMutation.mutate({ id, status: nextStatus })
                    }
                    isUpdating={statusMutation.isPending}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                  <p className="font-semibold text-text-main">No candidates found</p>
                  <p className="mt-1 text-sm text-text-muted">
                    There are no candidates in the &ldquo;{activeTab.replace('_', ' ')}&rdquo;
                    stage.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-main">{selectedCandidate.name}</h2>
                <p className="mt-1 text-text-muted">{selectedCandidate.headline}</p>
                {selectedCandidate.gradYear && (
                  <p className="text-xs text-text-muted mt-0.5">
                    Graduation Year: {selectedCandidate.gradYear}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-subtle bg-white text-text-muted transition-all hover:bg-slate-50 hover:text-text-main hover:border-slate-300 active:scale-95 shadow-2xs cursor-pointer"
                aria-label="Close candidate details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 border-t pt-4">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Applied For
              </p>
              <p className="mt-1 text-sm font-semibold text-text-main">
                {selectedCandidate.position}
              </p>
            </div>

            {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-bg-name px-3 py-1 text-xs text-text-muted font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Contact & Links
              </p>
              <div className="mt-2 space-y-2 text-sm">
                <p className="text-text-main">{selectedCandidate.email}</p>
                <div className="flex flex-wrap gap-3 pt-1">
                  {selectedCandidate.resumeUrl && (
                    <a
                      href={selectedCandidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Resume
                    </a>
                  )}
                  {selectedCandidate.githubUrl && (
                    <a
                      href={selectedCandidate.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      GitHub Profile
                    </a>
                  )}
                  {selectedCandidate.linkedinUrl && (
                    <a
                      href={selectedCandidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setSelectedCandidate(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Candidate Dialog */}
      {contactCandidate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setContactCandidate(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-text-main">Contact {contactCandidate.name}</h2>
            <p className="mt-2 text-sm text-text-muted">{contactCandidate.email}</p>

            <div className="mt-6 flex gap-3 *:flex-1">
              <Button type="button" variant="outline" onClick={() => setContactCandidate(null)}>
                Cancel
              </Button>

              <Button asChild>
                <a href={`mailto:${contactCandidate.email}`}>
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Send Email
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Company Profile Edit Dialog */}
      {isProfileFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-5 text-xl font-bold text-text-main">Company Profile</h2>

            <RecruiterProfileForm
              initialValues={
                profile
                  ? {
                      companyName: profile.companyName,
                      companyMail: profile.companyMail,
                      companyUrl: profile.companyUrl ?? '',
                      headquartersLocation: profile.headquartersLocation ?? '',
                    }
                  : undefined
              }
              onCancel={() => setIsProfileFormOpen(false)}
              onSave={(values) => {
                profileMutation.mutate(values)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function RecruiterDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      }
    >
      <RecruiterDashboardContent />
    </Suspense>
  )
}

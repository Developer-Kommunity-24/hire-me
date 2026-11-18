export type CandidateStatus = 'applied' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected'

export interface Candidate {
  id: string
  name: string
  position: string
  email: string
  headline: string
  skills: string[]
  status: CandidateStatus
  appliedAt: string
  postingId?: string
  studentId?: string
  resumeUrl?: string | null
  githubUrl?: string | null
  linkedinUrl?: string | null
  gradYear?: number | null
}

export const candidates: Candidate[] = []

export const dashboardMetrics = {
  activeJobs: 0,
  activeJobsDelta: '',
  totalApplicants: 0,
  applicantsDelta: '',
  pendingReviews: 0,
  pendingReviewsDelta: '',
}

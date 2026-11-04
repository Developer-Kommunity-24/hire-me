export type CandidateStatus = 'applied' | 'under_review' | 'shortlisted'

export interface Candidate {
  id: number
  name: string
  position: string
  email: string
  headline: string
  skills: string[]
  status: CandidateStatus
  appliedAt: string
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

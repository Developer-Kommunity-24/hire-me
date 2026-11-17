import { apiFetch } from './api-client'

export type ApplicationStatus = 'applied' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected'

export type RecruiterMetrics = {
  activeJobs: number
  totalApplicants: number
  pendingReviews: number
}

export type Applicant = {
  id: string
  name: string
  email: string
  position: string
  headline?: string
  skills: string[]
  status: ApplicationStatus
  appliedAt: string
}

export async function getRecruiterMetrics(): Promise<RecruiterMetrics> {
  return { activeJobs: 0, totalApplicants: 0, pendingReviews: 0 }
}

export async function getRecruiterApplicants(): Promise<Applicant[]> {
  return []
}

export interface RecruiterProfile {
  id: string
  userId: string
  companyName: string
  companyMail: string
  companyUrl: string | null
  headquartersLocation: string | null
  createdAt?: string
}

export interface UpdateRecruiterProfileInput {
  companyName?: string
  companyMail?: string
  companyUrl?: string | null
  headquartersLocation?: string | null
}

export interface PostingApplicant {
  id: string
  studentId: string
  status: ApplicationStatus
  appliedAt: string
  updatedAt: string
  student: {
    fullName: string
    email: string
    headline: string | null
    resumeUrl: string | null
    githubUrl: string | null
    linkedinUrl: string | null
    gradYear: number | null
  }
}

export const recruiterQueryKeys = {
  profile: ['recruiter', 'profile'] as const,
  postingApplications: (postingId: string) => ['postings', postingId, 'applications'] as const,
  allApplications: ['recruiter', 'all-applications'] as const,
}

/**
 * Fetches the authenticated recruiter's own company profile (GET /api/recruiters/me).
 */
export async function fetchMyRecruiterProfile(): Promise<RecruiterProfile> {
  const { recruiter } = await apiFetch<{ recruiter: RecruiterProfile }>('/api/recruiters/me')
  return recruiter
}

/**
 * Updates company profile details (PATCH /api/recruiters/me).
 */
export async function updateRecruiterProfile(
  input: UpdateRecruiterProfileInput,
): Promise<RecruiterProfile> {
  const { recruiter } = await apiFetch<{ recruiter: RecruiterProfile }>('/api/recruiters/me', {
    method: 'PATCH',
    body: input,
  })
  return recruiter
}

/**
 * Fetches candidate applicants for a specific posting (GET /api/postings/:id/applications).
 */
export async function fetchPostingApplicants(postingId: string): Promise<PostingApplicant[]> {
  const { data } = await apiFetch<{ data: PostingApplicant[] }>(
    `/api/postings/${encodeURIComponent(postingId)}/applications`,
  )
  return data
}

/**
 * Updates an applicant's pipeline status (PATCH /api/applications/:id/status).
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
): Promise<{ id: string; status: ApplicationStatus }> {
  const { data } = await apiFetch<{ data: { id: string; status: ApplicationStatus } }>(
    `/api/applications/${encodeURIComponent(applicationId)}/status`,
    {
      method: 'PATCH',
      body: { status },
    },
  )
  return data
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'

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

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`)
  }

  return response.json() as Promise<T>
}

export function getRecruiterMetrics() {
  return request<RecruiterMetrics>('/api/recruiter/metrics')
}

export function getRecruiterApplicants() {
  return request<Applicant[]>('/api/recruiter/applicants')
}

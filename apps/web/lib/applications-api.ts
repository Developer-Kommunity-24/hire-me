import { apiFetch, ApiError } from './api-client'

export { ApiError }

export interface ApplicationRecord {
  id: string
  postingId: string
  studentId: string
  status: 'applied' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected'
  appliedAt: string
  updatedAt: string
}

export interface ApplicationResponse {
  data: ApplicationRecord
}

export interface StudentApplicationListItem {
  id: string
  postingId: string
  status: 'applied' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected'
  appliedAt: string
  updatedAt: string
  posting: {
    title: string
    status: string
    deadline: string | null
    location: string | null
    employmentType: string
    companyName: string
  }
}

/**
 * Applies to an active job posting for the authenticated student.
 */
export async function applyToPosting(postingId: string): Promise<ApplicationRecord> {
  const response = await apiFetch<ApplicationResponse>('/api/applications', {
    method: 'POST',
    body: { postingId },
  })
  return response.data
}

/**
 * Fetches the list of applications submitted by the authenticated student.
 */
export async function listMyApplications(): Promise<StudentApplicationListItem[]> {
  const response = await apiFetch<{ data: StudentApplicationListItem[] }>('/api/applications')
  return response.data
}

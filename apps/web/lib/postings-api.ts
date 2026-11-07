import { apiFetch, ApiError } from './api-client'

export type BackendEmploymentType = 'internship' | 'full_time' | 'part_time' | 'contract'
export type BackendWorkArrangement = 'in_person' | 'remote' | 'hybrid'
export type BackendPostingStatus = 'active' | 'closed' | 'expired'

export interface ApiPosting {
  id: string
  recruiterId: string
  title: string
  description: string
  stack: string[] | null
  employmentType: BackendEmploymentType
  workArrangement: BackendWorkArrangement
  seniorityLevel: string | null
  compensation: string | null
  location: string | null
  deadline: string | null
  status: BackendPostingStatus
  createdAt: string
  updatedAt: string
}

export interface CreatePostingInput {
  title: string
  description: string
  stack: string[]
  employmentType: BackendEmploymentType
  workArrangement: BackendWorkArrangement
  seniorityLevel?: string
  compensation?: string
  location?: string
  deadline?: string
}

export interface UpdatePostingInput {
  title?: string
  description?: string
  stack?: string[]
  employmentType?: BackendEmploymentType
  workArrangement?: BackendWorkArrangement
  seniorityLevel?: string
  compensation?: string
  location?: string
  deadline?: string
}

export interface JobPostingItem {
  id: string
  title: string
  description: string
  stack: string[]
  employmentType: BackendEmploymentType
  workArrangement: BackendWorkArrangement
  location: string
  status: BackendPostingStatus
  deadline: string | null
  createdAt: string
  updatedAt: string
  applicants: number
  inReview: number
  interviewing: number
}

export function formatEmploymentType(type: BackendEmploymentType): string {
  switch (type) {
    case 'internship':
      return 'Internship'
    case 'full_time':
      return 'Full-time'
    case 'part_time':
      return 'Part-time'
    case 'contract':
      return 'Contract'
  }
}

export function formatWorkArrangement(arrangement: BackendWorkArrangement): string {
  switch (arrangement) {
    case 'in_person':
      return 'On-site'
    case 'remote':
      return 'Remote'
    case 'hybrid':
      return 'Hybrid'
  }
}

export function formatRelativeDate(dateString: string | Date): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Recently'

  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays <= 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    if (diffInHours <= 0) return 'Posted today'
    return `Posted ${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }
  if (diffInDays === 1) return 'Posted yesterday'
  if (diffInDays < 7) return `Posted ${diffInDays} days ago`
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `Posted ${weeks} week${weeks > 1 ? 's' : ''} ago`
  }
  const months = Math.floor(diffInDays / 30)
  return `Posted ${months} month${months > 1 ? 's' : ''} ago`
}

export function mapApiPostingToJobItem(posting: ApiPosting): JobPostingItem {
  return {
    id: posting.id,
    title: posting.title,
    description: posting.description,
    stack: posting.stack ?? [],
    employmentType: posting.employmentType,
    workArrangement: posting.workArrangement,
    location:
      posting.location || (posting.workArrangement === 'remote' ? 'Remote' : 'Not specified'),
    status: posting.status,
    deadline: posting.deadline,
    createdAt: posting.createdAt,
    updatedAt: posting.updatedAt,
    applicants: 0,
    inReview: 0,
    interviewing: 0,
  }
}

/**
 * Fetches all job postings owned by the current recruiter (GET /api/postings/mine).
 */
export async function fetchMyPostings(): Promise<JobPostingItem[]> {
  const response = await apiFetch<{ data: ApiPosting[] }>('/api/postings/mine')
  return response.data.map(mapApiPostingToJobItem)
}

/**
 * Closes a posting owned by the current recruiter (POST /api/postings/:id/close).
 */
export async function closePosting(id: string): Promise<JobPostingItem> {
  const response = await apiFetch<{ data: ApiPosting }>(`/api/postings/${id}/close`, {
    method: 'POST',
  })
  return mapApiPostingToJobItem(response.data)
}

/**
 * Creates a new posting (POST /api/postings).
 */
export async function createPosting(input: CreatePostingInput): Promise<JobPostingItem> {
  const response = await apiFetch<{ data: ApiPosting }>('/api/postings', {
    method: 'POST',
    body: input,
  })
  return mapApiPostingToJobItem(response.data)
}

/**
 * Updates a posting owned by the recruiter (PATCH /api/postings/:id).
 */
export async function updatePosting(
  id: string,
  input: UpdatePostingInput,
): Promise<JobPostingItem> {
  const response = await apiFetch<{ data: ApiPosting }>(`/api/postings/${id}`, {
    method: 'PATCH',
    body: input,
  })
  return mapApiPostingToJobItem(response.data)
}

export { ApiError }

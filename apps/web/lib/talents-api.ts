import { apiFetch } from './api-client'

export interface TalentCandidate {
  id: string
  fullName: string
  headline: string | null
  bio: string | null
  gradYear: number | null
  openToWork: boolean
  dk24Status: 'none' | 'pending' | 'verified' | 'rejected' | 'revoked'
  skills: string[]
  school?: string | null
  degree?: string | null
  resumeUrl?: string | null
  githubUrl?: string | null
  linkedinUrl?: string | null
}

export interface TalentSearchFilters {
  page?: number
  limit?: number
  q?: string
  skills?: string[]
  skillMatchMode?: 'all' | 'any'
  openToWork?: boolean
  dk24Status?: 'none' | 'pending' | 'verified' | 'rejected' | 'revoked'
  gradYear?: number
  sortBy?: 'fullName' | 'gradYear' | 'updatedAt'
  order?: 'asc' | 'desc'
}

export interface TalentSearchResponse {
  data: TalentCandidate[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const talentsQueryKey = (filters?: TalentSearchFilters) =>
  ['talents', filters ?? {}] as const

/**
 * Searches candidates by skills, grad year, availability, and verification (GET /api/talents).
 */
export async function searchTalents(
  filters: TalentSearchFilters = {},
): Promise<TalentSearchResponse> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.q?.trim()) params.set('q', filters.q.trim())
  if (filters.skills && filters.skills.length > 0) {
    filters.skills.forEach((s) => params.append('skills', s))
  }
  if (filters.skillMatchMode) params.set('skillMatchMode', filters.skillMatchMode)
  if (filters.openToWork !== undefined) params.set('openToWork', String(filters.openToWork))
  if (filters.dk24Status) params.set('dk24Status', filters.dk24Status)
  if (filters.gradYear) params.set('gradYear', String(filters.gradYear))
  if (filters.sortBy) params.set('sortBy', filters.sortBy)
  if (filters.order) params.set('order', filters.order)

  const queryString = params.toString()
  const path = queryString ? `/api/talents?${queryString}` : '/api/talents'
  return await apiFetch<TalentSearchResponse>(path)
}

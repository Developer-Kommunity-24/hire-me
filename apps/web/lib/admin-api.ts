import { apiFetch } from './api-client'

export interface AdminStats {
  students: number
  recruiters: number
  postings: number
  applications: number
  applicationsByStatus: {
    applied: number
    under_review: number
    shortlisted: number
    accepted: number
    rejected: number
  }
}

export interface AdminClub {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: string
}

export interface ClubAdminItem {
  userId: string
  clubId: string
  userName: string
  userEmail: string
  clubName: string
}

export interface EligibleStudent {
  id: string
  fullName: string
  email: string
}

export const adminQueryKeys = {
  stats: ['admin', 'stats'] as const,
  clubs: ['admin', 'clubs'] as const,
  clubAdmins: ['admin', 'club-admins'] as const,
  students: (query?: string) => ['admin', 'students', query ?? ''] as const,
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data } = await apiFetch<{ data: AdminStats }>('/api/admin/stats')
  return data
}

export async function fetchAdminClubs(): Promise<AdminClub[]> {
  const { data } = await apiFetch<{ data: AdminClub[] }>('/api/admin/clubs')
  return data
}

export async function createAdminClub(input: { name: string; slug: string }): Promise<AdminClub> {
  const { data } = await apiFetch<{ data: AdminClub }>('/api/admin/clubs', {
    method: 'POST',
    body: input,
  })
  return data
}

export async function fetchClubAdmins(): Promise<ClubAdminItem[]> {
  const { data } = await apiFetch<{ data: ClubAdminItem[] }>('/api/admin/club-admins')
  return data
}

export async function appointClubAdmin(input: {
  userId: string
  clubId: string
}): Promise<{ user: unknown; clubAdmin: unknown }> {
  const { data } = await apiFetch<{ data: { user: unknown; clubAdmin: unknown } }>(
    '/api/admin/club-admins',
    {
      method: 'POST',
      body: input,
    },
  )
  return data
}

export async function removeClubAdmin(
  userId: string,
): Promise<{ user: unknown; clubAdmin: unknown }> {
  const { data } = await apiFetch<{ data: { user: unknown; clubAdmin: unknown } }>(
    `/api/admin/club-admins/${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
    },
  )
  return data
}

export async function fetchEligibleStudents(query?: string): Promise<EligibleStudent[]> {
  const path = query?.trim()
    ? `/api/admin/students?q=${encodeURIComponent(query.trim())}`
    : '/api/admin/students'
  const { data } = await apiFetch<{ data: EligibleStudent[] }>(path)
  return data
}

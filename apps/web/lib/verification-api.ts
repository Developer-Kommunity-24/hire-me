import { apiFetch } from './api-client'

export interface StudentVerificationStatus {
  studentId: string
  dk24Status: 'none' | 'pending' | 'verified' | 'rejected' | 'revoked'
  usn: string | null
  latestRequest?: {
    id: string
    status: string
    createdAt: string
    matchedClubName?: string
  } | null
  activeRevocation?: unknown | null
}

export interface VerificationSubmissionResult {
  status: 'verified' | 'pending'
  matched: boolean
  isResubmission: boolean
  resubmitCount: number
  clubName?: string | null
}

export interface ActiveClub {
  id: string
  name: string
  slug: string
}

export const verificationQueryKey = ['verifications', 'me'] as const

/**
 * Retrieves the calling student's verification status (GET /api/verifications/me).
 */
export async function fetchVerificationStatus(): Promise<StudentVerificationStatus> {
  const { data } = await apiFetch<{ data: StudentVerificationStatus }>('/api/verifications/me')
  return data
}

/**
 * Fetches all active clubs for students to request verification from.
 */
export async function fetchActiveClubs(): Promise<ActiveClub[]> {
  const { data } = await apiFetch<{ data: ActiveClub[] }>('/api/verifications/clubs')
  return data
}

/**
 * Submits or resubmits student USN for campus verification (POST /api/verifications).
 */
export async function submitVerification(input: {
  usn: string
  clubId?: string | null
}): Promise<VerificationSubmissionResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await apiFetch<{ data: any }>('/api/verifications', {
    method: 'POST',
    body: input,
  })
  return {
    status: (data.dk24Status ?? data.status) as 'verified' | 'pending',
    matched: Boolean(data.matchedMembership || data.matched),
    isResubmission: Boolean(data.isResubmission),
    resubmitCount: data.request?.resubmitCount ?? data.resubmitCount ?? 0,
    clubName: data.matchedMembership?.clubName ?? data.clubName ?? null,
  }
}

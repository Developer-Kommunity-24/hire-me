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

export const verificationQueryKey = ['verifications', 'me'] as const

/**
 * Retrieves the calling student's verification status (GET /api/verifications/me).
 */
export async function fetchVerificationStatus(): Promise<StudentVerificationStatus> {
  const { data } = await apiFetch<{ data: StudentVerificationStatus }>('/api/verifications/me')
  return data
}

/**
 * Submits or resubmits student USN for campus verification (POST /api/verifications).
 */
export async function submitVerification(input: {
  usn: string
  clubId?: string | null
}): Promise<VerificationSubmissionResult> {
  const { data } = await apiFetch<{ data: VerificationSubmissionResult }>('/api/verifications', {
    method: 'POST',
    body: input,
  })
  return data
}

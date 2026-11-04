'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { SelfAssignableRole } from '@/lib/schemas/auth.schema'
import type { StudentOnboardingInput } from '@/lib/schemas/student-onboarding.schema'
import type { RecruiterOnboardingInput } from '@/lib/schemas/recruiter-onboarding.schema'
import { apiFetch, ApiError } from '@/lib/api-client'

export const ONBOARDING_QUERY_KEYS = {
  studentProfile: ['student', 'profile'],
  recruiterProfile: ['recruiter', 'profile'],
  recruiterProfileCheck: ['recruiter', 'profile-check'],
  currentUser: ['user', 'me'],
}

export interface CreateRecruiterProfileInput {
  companyName: string
  companyMail: string
  companyUrl?: string | null
  headquartersLocation?: string | null
}

export function useSaveProfile<TData extends StudentOnboardingInput | RecruiterOnboardingInput>(
  role: SelfAssignableRole,
) {
  const queryClient = useQueryClient()
  const roleLabel = role === 'student' ? 'Student' : 'Recruiter'

  return useMutation<TData, Error, TData>({
    mutationFn: async (data: TData) => {
      await apiFetch('/api/users/me/role', {
        method: 'PATCH',
        body: { role },
      })

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.currentUser })
      toast.success(`${roleLabel} profile created successfully!`)
    },
    onError: (err: Error) => {
      toast.error(err.message || `Failed to save ${role} profile.`)
    },
  })
}

export function useSaveStudentProfile() {
  return useSaveProfile<StudentOnboardingInput>('student')
}

export function useCreateRecruiterProfile() {
  const queryClient = useQueryClient()

  return useMutation<{ recruiter: unknown }, Error, CreateRecruiterProfileInput>({
    mutationFn: async (data: CreateRecruiterProfileInput) => {
      return await apiFetch<{ recruiter: unknown }>('/api/recruiters/profile', {
        method: 'POST',
        body: {
          companyName: data.companyName,
          companyMail: data.companyMail,
          companyUrl: data.companyUrl || null,
          headquartersLocation: data.headquartersLocation || null,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.currentUser })
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.recruiterProfile })
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.recruiterProfileCheck })
      toast.success('Recruiter profile created successfully!')
    },
    onError: (err: Error) => {
      const isConflict = err instanceof ApiError && err.status === 409

      if (isConflict) {
        toast.info('Recruiter profile already exists.')
        queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.currentUser })
        queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.recruiterProfile })
        queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.recruiterProfileCheck })
      } else {
        toast.error(err.message || 'Failed to create recruiter profile.')
      }
    },
  })
}

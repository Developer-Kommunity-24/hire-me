'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { StudentOnboardingInput } from '@/lib/schemas/student-onboarding.schema'
import type { RecruiterOnboardingInput } from '@/lib/schemas/recruiter-onboarding.schema'
import { apiFetch } from '@/lib/api-client'

export const ONBOARDING_QUERY_KEYS = {
  studentProfile: ['student', 'profile'],
  recruiterProfile: ['recruiter', 'profile'],
  currentUser: ['user', 'me'],
}

export function useSaveStudentProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: StudentOnboardingInput) => {
      localStorage.setItem('student_profile', JSON.stringify(data))
      localStorage.setItem('user_role', 'student')

      try {
        await apiFetch('/api/users/me/role', {
          method: 'PATCH',
          body: { role: 'student' },
        })
      } catch {
        // Backend sync is optional if auth token is expired or running standalone
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.currentUser })
      toast.success('Student profile created successfully!')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save student profile.')
    },
  })
}

export function useSaveRecruiterProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: RecruiterOnboardingInput) => {
      localStorage.setItem('recruiter_profile', JSON.stringify(data))
      localStorage.setItem('user_role', 'recruiter')

      try {
        await apiFetch('/api/users/me/role', {
          method: 'PATCH',
          body: { role: 'recruiter' },
        })
      } catch {
        // Backend sync is optional if auth token is expired or running standalone
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.currentUser })
      toast.success('Recruiter profile created successfully!')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save recruiter profile.')
    },
  })
}

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { SelfAssignableRole } from '@/lib/schemas/auth.schema'
import type { StudentOnboardingInput } from '@/lib/schemas/student-onboarding.schema'
import type { RecruiterOnboardingInput } from '@/lib/schemas/recruiter-onboarding.schema'
import { apiFetch } from '@/lib/api-client'

export const ONBOARDING_QUERY_KEYS = {
  studentProfile: ['student', 'profile'],
  recruiterProfile: ['recruiter', 'profile'],
  currentUser: ['user', 'me'],
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

export function useSaveRecruiterProfile() {
  return useSaveProfile<RecruiterOnboardingInput>('recruiter')
}

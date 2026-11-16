'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchStudentProfile,
  updateStudentProfile,
  type StudentProfileResponse,
  type UpdateStudentProfileInput,
} from '@/components/student-profile/api'
import { ONBOARDING_QUERY_KEYS } from './use-onboarding'

export function useStudentProfile() {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.studentProfile,
    queryFn: fetchStudentProfile,
  })
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient()

  return useMutation<StudentProfileResponse, Error, UpdateStudentProfileInput>({
    mutationFn: updateStudentProfile,
    onSuccess: async (updatedProfile) => {
      queryClient.setQueryData(ONBOARDING_QUERY_KEYS.studentProfile, updatedProfile)
      await queryClient.invalidateQueries({
        queryKey: ONBOARDING_QUERY_KEYS.studentProfile,
      })
      await queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.currentUser })
      toast.success('Profile updated successfully!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update your profile. Please try again.')
    },
  })
}

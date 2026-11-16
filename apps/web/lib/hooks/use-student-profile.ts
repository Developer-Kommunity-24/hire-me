'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchStudentProfile,
  updateStudentProfile,
  fetchStudentProjects,
  fetchStudentExperiences,
  syncStudentProjects,
  syncStudentExperiences,
  mapFullProfileStateToUpdateInput,
  type StudentProfileResponse,
  type ApiProject,
  type ApiExperience,
} from '@/components/student-profile/api'
import type { FullProfileState } from '@/components/student-profile/types'
import { ONBOARDING_QUERY_KEYS } from './use-onboarding'

export const STUDENT_DATA_QUERY_KEYS = {
  projects: ['student-data', 'projects'],
  experience: ['student-data', 'experience'],
}

export function useStudentProfile() {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.studentProfile,
    queryFn: fetchStudentProfile,
  })
}

export function useStudentProjects(options?: { enabled?: boolean }) {
  return useQuery<ApiProject[]>({
    queryKey: STUDENT_DATA_QUERY_KEYS.projects,
    queryFn: fetchStudentProjects,
    enabled: options?.enabled ?? true,
    retry: false,
  })
}

export function useStudentExperiences(options?: { enabled?: boolean }) {
  return useQuery<ApiExperience[]>({
    queryKey: STUDENT_DATA_QUERY_KEYS.experience,
    queryFn: fetchStudentExperiences,
    enabled: options?.enabled ?? true,
    retry: false,
  })
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient()

  return useMutation<StudentProfileResponse, Error, FullProfileState>({
    mutationFn: async (state: FullProfileState) => {
      const updatedProfile = await updateStudentProfile(mapFullProfileStateToUpdateInput(state))

      await Promise.allSettled([
        syncStudentProjects(state.projects),
        syncStudentExperiences(state.experiences),
      ])

      return updatedProfile
    },
    onSuccess: async (updatedProfile) => {
      queryClient.setQueryData(ONBOARDING_QUERY_KEYS.studentProfile, updatedProfile)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.studentProfile }),
        queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.currentUser }),
        queryClient.invalidateQueries({ queryKey: STUDENT_DATA_QUERY_KEYS.projects }),
        queryClient.invalidateQueries({ queryKey: STUDENT_DATA_QUERY_KEYS.experience }),
      ])
      toast.success('Profile updated successfully!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update your profile. Please try again.')
    },
  })
}

export function useFullStudentProfile() {
  const profileQuery = useStudentProfile()
  const projectsQuery = useStudentProjects()
  const experiencesQuery = useStudentExperiences()

  const isPending = profileQuery.isPending || projectsQuery.isPending || experiencesQuery.isPending

  return {
    profile: profileQuery.data,
    projects: projectsQuery.data ?? [],
    experiences: experiencesQuery.data ?? [],
    isPending,
    isError: profileQuery.isError,
    refetch: async () => {
      await Promise.all([
        profileQuery.refetch(),
        projectsQuery.refetch(),
        experiencesQuery.refetch(),
      ])
    },
  }
}

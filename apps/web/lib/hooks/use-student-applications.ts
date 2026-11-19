'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchStudentApplications,
  withdrawStudentApplication,
  computeMetrics,
} from '@/lib/student-applications-api'
import type { StudentApplicationItem } from '@/lib/schemas/student-applications.schema'

export const STUDENT_APPLICATIONS_QUERY_KEYS = {
  all: ['student-applications'] as const,
}

export function useStudentApplications() {
  return useQuery({
    queryKey: STUDENT_APPLICATIONS_QUERY_KEYS.all,
    queryFn: fetchStudentApplications,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  })
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (applicationId: string) => withdrawStudentApplication(applicationId),
    onSuccess: (result) => {
      queryClient.setQueryData<StudentApplicationItem[]>(
        STUDENT_APPLICATIONS_QUERY_KEYS.all,
        (old) => (old ? old.filter((item) => item.id !== result.id) : []),
      )
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      toast.success('Application successfully withdrawn.')
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Failed to withdraw application. Please try again.'
      toast.error(message)
    },
  })
}

export function useApplicationsMetrics(applications?: StudentApplicationItem[]) {
  return computeMetrics(applications ?? [])
}

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchStudentApplications,
  withdrawStudentApplication,
  computeMetrics,
  DEFAULT_STUDENT_APPLICATIONS,
} from '@/lib/student-applications-api'
import type { StudentApplicationItem } from '@/lib/schemas/student-applications.schema'

export const STUDENT_APPLICATIONS_QUERY_KEYS = {
  all: ['student-applications'] as const,
}

export function useStudentApplications() {
  return useQuery({
    queryKey: STUDENT_APPLICATIONS_QUERY_KEYS.all,
    queryFn: fetchStudentApplications,
    initialData: DEFAULT_STUDENT_APPLICATIONS,
    staleTime: 1000 * 60 * 2, // 2 minutes
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
      toast.success('Application successfully withdrawn.')
    },
    onError: () => {
      toast.error('Failed to withdraw application. Please try again.')
    },
  })
}

export function useApplicationsMetrics(applications?: StudentApplicationItem[]) {
  return computeMetrics(applications ?? DEFAULT_STUDENT_APPLICATIONS)
}

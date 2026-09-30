'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { apiFetch } from '@/lib/api-client'
import { type SelfAssignableRole } from '@/lib/schemas/auth.schema'
import { ONBOARDING_QUERY_KEYS } from './use-onboarding'

export interface SocialSignInOptions {
  provider: 'google'
  callbackURL: string
}

export function useSocialSignIn() {
  return useMutation({
    mutationFn: async ({ provider, callbackURL }: SocialSignInOptions) => {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL,
      })

      if (error) {
        throw new Error(error.message ?? 'Could not start sign-in. Please try again.')
      }

      return true
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Authentication failed')
    },
  })
}

export function useSetUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (role: SelfAssignableRole) => {
      const data = await apiFetch<{ user: unknown }>('/api/users/me/role', {
        method: 'PATCH',
        body: { role },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.currentUser })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not save your role.')
    },
  })
}

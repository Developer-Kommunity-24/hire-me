'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { apiFetch } from '@/lib/api-client'
import { type SelfAssignableRole } from '@/lib/schemas/auth.schema'
import { ONBOARDING_QUERY_KEYS } from './use-onboarding'

export interface SocialSignInOptions {
  provider: 'google'
  callbackURL: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  roles: string[]
  role?: string
}

export function useAuth() {
  const session = authClient.useSession()

  const userQuery = useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.currentUser,
    queryFn: async () => {
      try {
        const res = await apiFetch<{
          user: { id: string; email: string; fullName: string; roles: string[] }
        }>('/api/users/me')
        return res.user
      } catch {
        return null
      }
    },
    enabled: Boolean(session.data?.user),
  })

  const sessionUser = session.data?.user
  const dbUser = userQuery.data

  const id = sessionUser?.id || dbUser?.id || ''
  const name = dbUser?.fullName || sessionUser?.name || ''
  const email = dbUser?.email || sessionUser?.email || ''
  const roles = dbUser?.roles || []
  const role = roles[0]

  const user: AuthUser | null = id
    ? {
        id,
        name,
        email,
        roles,
        role,
      }
    : null

  return {
    user,
    isLoading: session.isPending || (Boolean(sessionUser) && userQuery.isLoading),
  }
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

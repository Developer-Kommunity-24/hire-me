import { createNeonAuth } from '@neondatabase/auth/next/server'
import type { NeonAuth } from '@neondatabase/auth/next/server'

let authInstance: NeonAuth | null = null
let handlerInstance: ReturnType<NeonAuth['handler']> | null = null

/**
 * Returns the shared server-side Neon Auth instance.
 *
 * Built lazily rather than at module scope: `createNeonAuth` throws when the
 * cookie secret is shorter than 32 characters, and `next build` imports every
 * module that touches it — so constructing eagerly would fail CI, where no
 * secrets are present. Deferring makes a misconfiguration a request-time error
 * instead of a build failure.
 *
 * @throws If `NEON_AUTH_BASE_URL` or `NEON_AUTH_COOKIE_SECRET` is missing.
 */
export function getAuth(): NeonAuth {
  if (!authInstance) {
    const baseUrl = process.env.NEON_AUTH_BASE_URL
    const secret = process.env.NEON_AUTH_COOKIE_SECRET

    if (!baseUrl) {
      throw new Error('NEON_AUTH_BASE_URL is not set — see docs/auth.md')
    }

    if (!secret) {
      throw new Error('NEON_AUTH_COOKIE_SECRET is not set — see docs/auth.md')
    }

    authInstance = createNeonAuth({ baseUrl, cookies: { secret } })
  }

  return authInstance
}

/** Memoised route handlers backing `/api/auth/[...path]`. */
export function getAuthHandler(): ReturnType<NeonAuth['handler']> {
  if (!handlerInstance) {
    handlerInstance = getAuth().handler()
  }

  return handlerInstance
}

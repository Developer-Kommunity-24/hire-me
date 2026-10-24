'use client'

import { createAuthClient } from '@neondatabase/auth/next'

/**
 * Browser-side auth client.
 *
 * Takes no base URL: it talks to this app's own `/api/auth/*` route, which
 * proxies to Neon Auth and owns the HttpOnly session cookie.
 */
export const authClient = createAuthClient()

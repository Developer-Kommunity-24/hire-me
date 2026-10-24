import { getAuthHandler } from '@/lib/auth/server'

/** Context object Next passes for the catch-all segment. */
type RouteContext = { params: Promise<{ path: string[] }> }

/**
 * Proxies Better Auth traffic to Neon Auth.
 *
 * Covers the OAuth redirect and callback, session reads, sign-out, and
 * `GET /api/auth/token`, which mints the short-lived JWT the API Worker accepts.
 */
export function GET(request: Request, context: RouteContext) {
  return getAuthHandler().GET(request, context)
}

export function POST(request: Request, context: RouteContext) {
  return getAuthHandler().POST(request, context)
}

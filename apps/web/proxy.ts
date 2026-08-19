import type { NextRequest } from 'next/server'
import { getAuth } from './lib/auth/server'

type ProxyHandler = ReturnType<ReturnType<typeof getAuth>['middleware']>

let handler: ProxyHandler | null = null

function getProxyHandler(): ProxyHandler {
  if (!handler) {
    handler = getAuth().middleware({ loginUrl: '/login' })
  }

  return handler
}

/**
 * Guards authenticated routes and refreshes the session cookie when needed.
 *
 * Next 16 reads this file under its new name, `proxy.ts` (formerly
 * `middleware.ts`). Unauthenticated visitors to a matched route are sent to
 * `/login`.
 */
export default function proxy(request: NextRequest) {
  return getProxyHandler()(request)
}

export const config = {
  matcher: ['/role-select', '/student', '/student/:path*', '/recruiter', '/recruiter/:path*'],
}

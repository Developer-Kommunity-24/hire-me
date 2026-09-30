import { createMiddleware } from 'hono/factory'
import { env } from 'hono/adapter'
import { createRemoteJWKSet, decodeJwt, errors, jwtVerify } from 'jose'
import type { JWTVerifyGetKey } from 'jose'
import { eq } from 'drizzle-orm'
import { users, userRoleEnum } from '@repo/db'

// ==========================================
// TYPES
// ==========================================

/**
 * Identity taken from a verified Neon Auth JWT.
 *
 * `id` is the token's `sub`. Neon Auth issues UUIDs, which is why it can be
 * mirrored straight into `users.id` without a schema change.
 */
export interface AuthUser {
  id: string
  email: string
  name: string | null
}

export type AuthVariables = { authUser: AuthUser }

type AuthBindings = { NEON_AUTH_BASE_URL: string }

/** Resolves the JWKS used to verify tokens from a given Neon Auth base URL. */
type KeySetResolver = (baseUrl: string) => JWTVerifyGetKey

// ==========================================
// JWKS CACHE
// ==========================================

/**
 * One key set per base URL, cached for the life of the isolate.
 *
 * `createRemoteJWKSet` does its own fetching, caching and cooldown, so it must
 * be reused rather than rebuilt per request — otherwise every request would hit
 * Neon's JWKS endpoint.
 */
const keySetCache = new Map<string, JWTVerifyGetKey>()

/** Drops trailing slashes so one base URL cannot produce two cache entries. */
const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '')

/**
 * Builds the JWKS URL for a Neon Auth base URL.
 *
 * Neon Auth base URLs carry a path (`https://<endpoint>.neonauth.…/neondb/auth`),
 * so the well-known suffix has to be appended to it. `new URL('/.well-known/…',
 * base)` looks equivalent but is not: the leading slash makes it root-relative,
 * which silently drops the path and requests a URL that 404s.
 *
 * Exported because this is the one part of the middleware that a local-JWKS test
 * stub bypasses, so it needs covering directly.
 */
export function jwksUrl(baseUrl: string): URL {
  return new URL(`${normalizeBaseUrl(baseUrl)}/.well-known/jwks.json`)
}

/**
 * The `iss` value Neon Auth signs tokens with, derived from the base URL.
 *
 * Deliberately the **origin**, while {@link jwksUrl} keeps the full path. The
 * asymmetry is real and verified against the live service: Neon serves the key
 * set under `/<db>/auth` but configures Better Auth's `baseURL` as the bare
 * origin, so that is what lands in `iss`. Making these two agree — in either
 * direction — breaks verification.
 *
 * The origin still pins the token to this project: the hostname carries the Neon
 * endpoint ID.
 */
export function expectedIssuer(baseUrl: string): string {
  return new URL(baseUrl).origin
}

const resolveRemoteKeySet: KeySetResolver = (baseUrl) => {
  const cacheKey = normalizeBaseUrl(baseUrl)
  let keySet = keySetCache.get(cacheKey)

  if (!keySet) {
    keySet = createRemoteJWKSet(jwksUrl(baseUrl))
    keySetCache.set(cacheKey, keySet)
  }

  return keySet
}

// ==========================================
// FAILURE DIAGNOSTICS
// ==========================================

/**
 * Renders a verification failure for the Worker log.
 *
 * An `iss` mismatch is the one failure `jose`'s message cannot explain on its
 * own — it reports that the claim was unexpected without saying what the token
 * held or what was wanted. Both are echoed for that case. Neither is a secret:
 * `iss` is a public identifier, and this goes to our log, never to the caller.
 */
function describeVerifyFailure(error: unknown, token: string, expectedIssuer: string): string {
  const summary = error instanceof Error ? `${error.name}: ${error.message}` : String(error)

  if (!(error instanceof errors.JWTClaimValidationFailed) || error.claim !== 'iss') {
    return summary
  }

  try {
    return `${summary} — expected ${expectedIssuer}, token carries ${JSON.stringify(decodeJwt(token).iss)}`
  } catch {
    // Unparseable payload; the signature check should have caught this already.
    return summary
  }
}

// ==========================================
// MIDDLEWARE
// ==========================================

/**
 * Builds the bearer-token authentication middleware.
 *
 * Exported as a factory so tests can supply a local JWKS instead of reaching
 * out to Neon. Production code should use {@link requireAuth}.
 *
 * @param options.resolveKeySet - Overrides JWKS resolution.
 */
export function createAuthMiddleware(options: { resolveKeySet?: KeySetResolver } = {}) {
  const resolveKeySet = options.resolveKeySet ?? resolveRemoteKeySet

  return createMiddleware<{ Bindings: AuthBindings; Variables: AuthVariables }>(async (c, next) => {
    const header = c.req.header('Authorization')

    if (!header?.startsWith('Bearer ')) {
      console.warn('Missing or malformed Authorization header')
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = header.slice('Bearer '.length).trim()

    if (!token) {
      console.warn('Empty bearer token')
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { NEON_AUTH_BASE_URL } = env<AuthBindings>(c)

    // A missing base URL is a deployment fault, not a client error. Fail
    // closed with a 500 so it can never be mistaken for a valid session.
    if (!NEON_AUTH_BASE_URL) {
      console.error('NEON_AUTH_BASE_URL is not set — see docs/auth.md')
      return c.json({ error: 'Authentication is not configured' }, 500)
    }

    let authUser: AuthUser
    const issuer = expectedIssuer(NEON_AUTH_BASE_URL)

    try {
      // jwtVerify checks the signature plus `exp`/`nbf`; `issuer` pins the
      // token to our own Neon Auth project. Note that the key set and the
      // issuer are derived differently — see `expectedIssuer`.
      const { payload } = await jwtVerify(token, resolveKeySet(NEON_AUTH_BASE_URL), { issuer })

      const { sub, email, name } = payload

      // `users.email` and `users.full_name` are both NOT NULL, so a token
      // without an email cannot be turned into a domain user.
      if (!sub || typeof email !== 'string' || !email) {
        console.warn('Token missing required claims', { sub, email, name })
        return c.json({ error: 'Unauthorized' }, 401)
      }

      authUser = { id: sub, email, name: typeof name === 'string' ? name : null }
    } catch (error) {
      // The 401 body stays opaque: the reason a token failed is not the
      // caller's business, and echoing it back leaks verification internals.
      // Our own logs are the opposite case — without the cause, an
      // unreachable JWKS endpoint is indistinguishable from an expired token.
      console.warn('Token verification failed:', describeVerifyFailure(error, token, issuer))
      return c.json({ error: 'Unauthorized' }, 401)
    }

    c.set('authUser', authUser)
    await next()
  })
}

/** Rejects any request without a valid Neon Auth bearer token. */
export const requireAuth = createAuthMiddleware()

// ==========================================
// STUDENT PROFILE / ROLE AUTH
// ==========================================

export type UserRole = (typeof userRoleEnum.enumValues)[number]

export interface AuthedUser {
  id: string
  fullName: string | null
  email: string
  role: UserRole
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthedUser
  }
}

/**
 * Hono middleware that checks the caller is a student.
 *  - Expects `requireAuth` to have already run (reads `authUser` from context).
 *  - 401 if the user does not exist in the database.
 *  - 403 if the user exists but does not have the `student` role.
 * On success, sets `user` on the context for downstream handlers.
 *
 * Usage: `router.use('*', requireAuth, requireStudentRole())`
 */
export function requireStudentRole() {
  return createMiddleware<{
    Bindings: AuthBindings & { DATABASE_URL: string }
    Variables: AuthVariables & { user: AuthedUser }
  }>(async (c, next) => {
    const authUser = c.get('authUser')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (c as any).var?.db
    if (!db) {
      return c.json({ error: 'Internal Server Error', message: 'Database not available.' }, 500)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user] = await (db as any).select().from(users).where(eq(users.id, authUser.id)).limit(1)

    if (!user) {
      return c.json({ error: 'Unauthorized', message: 'User record not found.' }, 401)
    }

    if (!user.roles.includes('student')) {
      return c.json({ error: 'Forbidden', message: 'Only students can access this resource.' }, 403)
    }

    c.set('user', {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: 'student',
    })

    await next()
  })
}

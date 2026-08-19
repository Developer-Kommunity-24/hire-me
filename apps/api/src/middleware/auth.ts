import { createMiddleware } from 'hono/factory'
import { env } from 'hono/adapter'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { JWTVerifyGetKey } from 'jose'

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

const resolveRemoteKeySet: KeySetResolver = (baseUrl) => {
  let keySet = keySetCache.get(baseUrl)

  if (!keySet) {
    keySet = createRemoteJWKSet(new URL('/.well-known/jwks.json', baseUrl))
    keySetCache.set(baseUrl, keySet)
  }

  return keySet
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
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = header.slice('Bearer '.length).trim()

    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { NEON_AUTH_BASE_URL } = env<AuthBindings>(c)

    // A missing base URL is a deployment fault, not a client error. Fail
    // closed with a 500 so it can never be mistaken for a valid session.
    if (!NEON_AUTH_BASE_URL) {
      return c.json({ error: 'Authentication is not configured' }, 500)
    }

    let authUser: AuthUser

    try {
      // jwtVerify checks the signature plus `exp`/`nbf`; `issuer` pins the
      // token to our own Neon Auth project.
      const { payload } = await jwtVerify(token, resolveKeySet(NEON_AUTH_BASE_URL), {
        issuer: new URL(NEON_AUTH_BASE_URL).origin,
      })

      const { sub, email, name } = payload

      // `users.email` and `users.full_name` are both NOT NULL, so a token
      // without an email cannot be turned into a domain user.
      if (!sub || typeof email !== 'string' || !email) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      authUser = { id: sub, email, name: typeof name === 'string' ? name : null }
    } catch {
      // Deliberately opaque: the reason a token failed is not the caller's
      // business, and echoing it back leaks verification internals.
      return c.json({ error: 'Unauthorized' }, 401)
    }

    c.set('authUser', authUser)
    await next()
  })
}

/** Rejects any request without a valid Neon Auth bearer token. */
export const requireAuth = createAuthMiddleware()

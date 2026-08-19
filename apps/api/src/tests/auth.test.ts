import { Hono } from 'hono'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { app } from '../app.js'
import { createAuthMiddleware, expectedIssuer, jwksUrl } from '../middleware/auth.js'
import type { AuthVariables } from '../middleware/auth.js'
import { createTestKeys, testUser, type TestKeys } from './helpers/tokens.js'

// A base URL with a path, like the real ones: Neon Auth issues
// `https://<endpoint>.neonauth.<region>.aws.neon.tech/<db>/auth`. Anything
// mounted at the origin would hide path-dropping bugs.
const AUTH_BASE_URL = 'https://auth.example.test/api/v1/projects/test-project'
// Neon Auth signs `iss` with the origin, even though it serves the key set under
// the path. See `expectedIssuer`.
const ISSUER = 'https://auth.example.test'
const DATABASE_URL = 'postgresql://user:pass@db.test/hireme'

// Hono's `env()` reads process.env outside workerd, so bindings are set here
// rather than passed to `app.request`.
process.env.DATABASE_URL = DATABASE_URL
process.env.NEON_AUTH_BASE_URL = AUTH_BASE_URL

// ==========================================
// KEYS
// ==========================================

let keys: TestKeys
// A second, unrelated pair — its tokens carry the same `kid` and `alg`, so only
// the signature check can reject them.
let foreignKeys: TestKeys

beforeAll(async () => {
  keys = await createTestKeys(ISSUER)
  foreignKeys = await createTestKeys(ISSUER)
})

// ==========================================
// MIDDLEWARE UNDER TEST
// ==========================================
// A throwaway app so the middleware is exercised without the rest of the API.
// The resolver is read per request, which is why it can close over `keys`.

type GuardedEnv = {
  Bindings: { NEON_AUTH_BASE_URL: string }
  Variables: AuthVariables
}

const guarded = new Hono<GuardedEnv>()
guarded.use('*', createAuthMiddleware({ resolveKeySet: () => keys.keySet }))
guarded.get('/whoami', (c) => c.json({ user: c.var.authUser }))

/** Calls the guarded route with the given headers. */
function whoami(headers: Record<string, string> = {}) {
  return guarded.request('/whoami', { headers })
}

/** Calls the guarded route with a bearer token. */
function whoamiWithToken(token: string) {
  return whoami({ Authorization: `Bearer ${token}` })
}

afterEach(() => {
  vi.unstubAllEnvs()
})

// ==========================================
// URL DERIVATION
// ==========================================
// The middleware suites below stub `resolveKeySet`, so the real JWKS URL never
// gets built there. Both derivations are covered directly instead — pointing at
// the wrong URL made every token fail verification once already.
//
// Expected values are written as literals on purpose. Deriving them with the
// same expression the middleware uses is what let the original bug hide: a wrong
// assumption agrees with itself.

describe('jwksUrl', () => {
  it('appends the well-known path to the base URL path', () => {
    expect(jwksUrl(AUTH_BASE_URL).toString()).toBe(
      'https://auth.example.test/api/v1/projects/test-project/.well-known/jwks.json',
    )
  })

  it('keeps the base URL path rather than resolving against the origin', () => {
    expect(jwksUrl(AUTH_BASE_URL).pathname).toBe(
      '/api/v1/projects/test-project/.well-known/jwks.json',
    )
  })

  it('does not double up on a trailing slash', () => {
    expect(jwksUrl(`${AUTH_BASE_URL}/`).toString()).toBe(
      'https://auth.example.test/api/v1/projects/test-project/.well-known/jwks.json',
    )
  })

  it('handles a base URL with no path', () => {
    expect(jwksUrl('https://auth.example.test').toString()).toBe(
      'https://auth.example.test/.well-known/jwks.json',
    )
  })
})

describe('expectedIssuer', () => {
  it('drops the base URL path', () => {
    expect(expectedIssuer(AUTH_BASE_URL)).toBe('https://auth.example.test')
  })

  it('keeps a non-default port', () => {
    expect(expectedIssuer('https://auth.example.test:8443/neondb/auth')).toBe(
      'https://auth.example.test:8443',
    )
  })

  it('does not agree with the JWKS path', () => {
    // Guards the asymmetry itself: these two must not be collapsed into one
    // derivation, however much they look like they should be.
    expect(jwksUrl(AUTH_BASE_URL).origin).toBe(expectedIssuer(AUTH_BASE_URL))
    expect(jwksUrl(AUTH_BASE_URL).toString()).not.toBe(expectedIssuer(AUTH_BASE_URL))
  })
})

// ==========================================
// ACCEPTED TOKENS
// ==========================================

describe('requireAuth with a valid token', () => {
  it('attaches the identity from the token', async () => {
    const res = await whoamiWithToken(await keys.mint())

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      user: { id: testUser.id, email: testUser.email, name: testUser.name },
    })
  })

  it('treats a missing name claim as null', async () => {
    const res = await whoamiWithToken(await keys.mint({ name: null }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      user: { id: testUser.id, email: testUser.email, name: null },
    })
  })
})

// ==========================================
// REJECTED TOKENS
// ==========================================

describe('requireAuth rejections', () => {
  it('401s without an Authorization header', async () => {
    const res = await whoami()

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('401s on a non-bearer scheme', async () => {
    const res = await whoami({ Authorization: 'Basic dXNlcjpwYXNz' })

    expect(res.status).toBe(401)
  })

  it('401s on an empty bearer token', async () => {
    const res = await whoami({ Authorization: 'Bearer    ' })

    expect(res.status).toBe(401)
  })

  it('401s on a token that is not a JWT', async () => {
    const res = await whoamiWithToken('not-a-jwt')

    expect(res.status).toBe(401)
  })

  it('401s on a token signed by another key', async () => {
    const res = await whoamiWithToken(await foreignKeys.mint())

    expect(res.status).toBe(401)
  })

  it('401s on a token from another issuer', async () => {
    const res = await whoamiWithToken(await keys.mint({ issuer: 'https://attacker.example' }))

    expect(res.status).toBe(401)
  })

  it('401s on a token whose issuer is the base URL including its path', async () => {
    const res = await whoamiWithToken(await keys.mint({ issuer: AUTH_BASE_URL }))

    expect(res.status).toBe(401)
  })

  it('401s on an expired token', async () => {
    const res = await whoamiWithToken(await keys.mint({ expiresInSeconds: -60 }))

    expect(res.status).toBe(401)
  })

  it('401s when the token carries no subject', async () => {
    const res = await whoamiWithToken(await keys.mint({ sub: null }))

    expect(res.status).toBe(401)
  })

  it('401s when the token carries no email', async () => {
    const res = await whoamiWithToken(await keys.mint({ email: null }))

    expect(res.status).toBe(401)
  })

  it('401s on an empty email claim', async () => {
    const res = await whoamiWithToken(await keys.mint({ email: '' }))

    expect(res.status).toBe(401)
  })

  it('does not leak the verification failure reason', async () => {
    const res = await whoamiWithToken(await keys.mint({ expiresInSeconds: -60 }))
    const body = (await res.json()) as { error: string }

    expect(body.error).toBe('Unauthorized')
  })
})

// ==========================================
// MISCONFIGURATION
// ==========================================

describe('requireAuth without a configured base URL', () => {
  it('500s rather than accepting the token', async () => {
    vi.stubEnv('NEON_AUTH_BASE_URL', '')

    const res = await whoamiWithToken(await keys.mint())

    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({ error: 'Authentication is not configured' })
  })
})

// ==========================================
// MOUNTED ROUTES
// ==========================================
// Confirms the router is actually behind the middleware, not just that the
// middleware works in isolation.

describe('authenticated routes', () => {
  it('401s GET /api/users/me without a token', async () => {
    const res = await app.request('/api/users/me')

    expect(res.status).toBe(401)
  })

  it('401s PATCH /api/users/me/role without a token', async () => {
    const res = await app.request('/api/users/me/role', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ role: 'student' }),
    })

    expect(res.status).toBe(401)
  })

  it('leaves public routes open', async () => {
    const res = await app.request('/health')

    expect(res.status).toBe(200)
  })
})

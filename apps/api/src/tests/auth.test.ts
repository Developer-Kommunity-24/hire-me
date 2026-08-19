import { Hono } from 'hono'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { app } from '../app.js'
import { createAuthMiddleware } from '../middleware/auth.js'
import type { AuthVariables } from '../middleware/auth.js'
import { createTestKeys, testUser, type TestKeys } from './helpers/tokens.js'

const AUTH_BASE_URL = 'https://auth.example.test/api/v1/projects/test-project'
const ISSUER = new URL(AUTH_BASE_URL).origin
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

import { describe, expect, it } from 'vitest'
import { app } from '../app.js'
import { normalizeMemberInput } from '../controllers/club-members.controller.js'

// ==========================================
// TEST CONFIG
// ==========================================

// Hono's `env()` reads process.env outside workerd, so bindings are set here
// rather than passed to `app.request`.
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.NEON_AUTH_BASE_URL = 'https://auth.example.test'
process.env.WEB_ORIGIN = 'http://localhost:3000'

describe('Club Members API', () => {
  it('401s on GET /api/clubs/members without token', async () => {
    const res = await app.request('/api/clubs/members')
    expect(res.status).toBe(401)
  })

  it('401s on POST /api/clubs/members without token', async () => {
    const res = await app.request('/api/clubs/members', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fullName: 'Test', usn: '1DK24CS001', email: 'test@college.edu' }),
    })
    expect(res.status).toBe(401)
  })

  it('401s on PATCH /api/clubs/members/:id without token', async () => {
    const res = await app.request('/api/clubs/members/00000000-0000-0000-0000-000000000001', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fullName: 'Updated' }),
    })
    expect(res.status).toBe(401)
  })

  it('401s on DELETE /api/clubs/members/:id without token', async () => {
    const res = await app.request('/api/clubs/members/00000000-0000-0000-0000-000000000001', {
      method: 'DELETE',
    })
    expect(res.status).toBe(401)
  })

  it('normalizes member data before persistence', () => {
    expect(
      normalizeMemberInput({
        fullName: '  Alice Smith  ',
        usn: '1dk24cs001',
        email: 'ALICE@College.edu ',
      }),
    ).toEqual({
      fullName: 'Alice Smith',
      usn: '1DK24CS001',
      email: 'alice@college.edu',
    })
  })
})

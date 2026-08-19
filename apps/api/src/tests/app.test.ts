import { describe, expect, it } from 'vitest'

import { app } from '../app.js'

const DATABASE_URL = 'postgresql://user:pass@db.test/hireme'

process.env.DATABASE_URL = DATABASE_URL

describe('api', () => {
  it('reports healthy', async () => {
    const res = await app.request('/health', {}, { DATABASE_URL })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ status: 'ok' })
  })

  it('returns a greeting', async () => {
    const res = await app.request('/api/hello', {}, { DATABASE_URL })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ message: 'Hello from Hono' })
  })

  it('404s an unknown route', async () => {
    const res = await app.request('/nope', {}, { DATABASE_URL })

    expect(res.status).toBe(404)
  })
})

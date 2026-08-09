import { describe, expect, it } from 'vitest'

import { app } from './app.js'

describe('api', () => {
  it('reports healthy', async () => {
    const res = await app.request('/health')

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ status: 'ok' })
  })

  it('returns a greeting', async () => {
    const res = await app.request('/api/hello')

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ message: 'Hello from Hono' })
  })

  it('404s an unknown route', async () => {
    const res = await app.request('/nope')

    expect(res.status).toBe(404)
  })
})

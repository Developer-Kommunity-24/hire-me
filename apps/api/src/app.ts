import { Hono } from 'hono'
import { logger } from 'hono/logger'

export const app = new Hono()

app.use('*', logger())

app.get('/health', (c) => c.json({ status: 'ok' }))

app.get('/api/hello', (c) => c.json({ message: 'Hello from Hono' }))

export type AppType = typeof app

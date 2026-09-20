import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { env } from 'hono/adapter'
import { logger } from 'hono/logger'
import { dbMiddleware } from './middleware/db.js'
import { postingsRouter } from './routes/postings.js'
import { usersRouter } from './routes/users.js'
import { notificationsRouter } from './routes/notifications.js'
import { clubMembersRouter } from './routes/club-members.js'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
    NEON_AUTH_BASE_URL: string
    WEB_ORIGIN: string
    INTERNAL_SERVICE_KEY?: string
    RESEND_API_KEY?: string
  }
}>()

app.use('*', logger())

/**
 * The web app authenticates with a bearer token rather than a cookie, so no
 * credentialed requests are allowed. Registered before `dbMiddleware` so a
 * preflight never opens a database connection.
 */
app.use(
  '*',
  cors({
    origin: (_origin, c) => env<{ WEB_ORIGIN?: string }>(c).WEB_ORIGIN ?? 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['authorization', 'content-type', 'x-service-key'],
    maxAge: 86400,
  }),
)

app.use('*', dbMiddleware)

app.get('/health', (c) => c.json({ status: 'ok' }))

app.get('/api/hello', (c) => c.json({ message: 'Hello from Hono' }))

// Student job discovery
app.route('/api/postings', postingsRouter)

// Authenticated user record and role selection
app.route('/api/users', usersRouter)

// Notifications
app.route('/api/notifications', notificationsRouter)
// Club admin: membership management for appointed volunteers
app.route('/api/clubs/members', clubMembersRouter)

export { app }
export type AppType = typeof app

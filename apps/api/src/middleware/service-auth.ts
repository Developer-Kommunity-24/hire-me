import { createMiddleware } from 'hono/factory'
import { env } from 'hono/adapter'

export type ServiceAuthBindings = {
  INTERNAL_SERVICE_KEY?: string
}

/**
 * Service-to-service authentication middleware.
 *
 * Verifies that the incoming request carries a valid shared secret in the
 * `x-service-key` header. Used for internal / machine-to-machine endpoints
 * (such as system notification dispatch and email triggers) that should never
 * be invoked directly by browsers or public callers.
 */
export const requireServiceAuth = createMiddleware<{
  Bindings: ServiceAuthBindings
}>(async (c, next) => {
  const serviceKeyHeader = c.req.header('x-service-key')
  const { INTERNAL_SERVICE_KEY } = env<ServiceAuthBindings>(c)

  // Fail closed if the secret is not configured on the server
  if (!INTERNAL_SERVICE_KEY) {
    console.error('INTERNAL_SERVICE_KEY is not set')
    return c.json({ error: 'Service authentication is not configured' }, 500)
  }

  if (!serviceKeyHeader || serviceKeyHeader !== INTERNAL_SERVICE_KEY) {
    console.warn('Missing or invalid x-service-key header')
    return c.json({ error: 'Unauthorized' }, 401)
  }

  await next()
})

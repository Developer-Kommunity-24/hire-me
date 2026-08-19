/**
 * Browser-side client for the Hono API Worker.
 *
 * The session cookie is HttpOnly and never leaves this app, so requests to the
 * Worker are authenticated with a short-lived JWT fetched from our own auth
 * proxy instead.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'

/** Error carrying the HTTP status of a failed API call. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  /** Serialised as JSON when present. */
  body?: unknown
}

const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.'

/**
 * Asks the auth proxy for a JWT the Worker will accept.
 *
 * Neon Auth issues these with a ~15 minute lifetime, so one is fetched per call
 * rather than cached.
 */
async function fetchAccessToken(): Promise<string> {
  const response = await fetch('/api/auth/token', {
    headers: { accept: 'application/json' },
  })

  if (!response.ok) {
    throw new ApiError(401, SESSION_EXPIRED_MESSAGE)
  }

  const payload: unknown = await response.json()
  const token =
    typeof payload === 'object' && payload !== null && 'token' in payload
      ? (payload as { token: unknown }).token
      : null

  if (typeof token !== 'string' || !token) {
    throw new ApiError(401, SESSION_EXPIRED_MESSAGE)
  }

  return token
}

/**
 * Calls the API Worker with a bearer token attached.
 *
 * @param path - Path beginning with `/`, e.g. `/api/users/me`.
 * @throws {ApiError} When the session cannot be exchanged for a token, or the
 *   Worker responds with a non-2xx status.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body } = options
  const token = await fetchAccessToken()
  const hasBody = body !== undefined

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(hasBody ? { 'content-type': 'application/json' } : {}),
    },
    ...(hasBody ? { body: JSON.stringify(body) } : {}),
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`

    try {
      const errorBody: unknown = await response.json()

      if (
        typeof errorBody === 'object' &&
        errorBody !== null &&
        'error' in errorBody &&
        typeof (errorBody as { error: unknown }).error === 'string'
      ) {
        message = (errorBody as { error: string }).error
      }
    } catch {
      // Non-JSON error body — keep the status-based message.
    }

    throw new ApiError(response.status, message)
  }

  return (await response.json()) as T
}

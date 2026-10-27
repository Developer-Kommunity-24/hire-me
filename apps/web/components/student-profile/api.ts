import type { FullProfileState } from './types'

/**
 * Service function to persist student profile data.
 *
 * Current implementation acts as an adapter for local state / context persistence.
 * When integrating a backend API, simply update the implementation here:
 *
 * @example
 * ```ts
 * export async function saveProfileToApi(data: FullProfileState): Promise<FullProfileState> {
 *   const response = await fetch('/api/student/profile', {
 *     method: 'PUT',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(data),
 *   })
 *   if (!response.ok) {
 *     const error = await response.json().catch(() => ({}))
 *     throw new Error(error.message || 'Failed to save student profile')
 *   }
 *   return response.json()
 * }
 * ```
 */
export async function saveProfileToApi(data: FullProfileState): Promise<FullProfileState> {
  // Dispatches async save point for future backend endpoints
  return Promise.resolve(data)
}

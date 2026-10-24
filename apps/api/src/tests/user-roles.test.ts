import { describe, expect, it } from 'vitest'
import { formatUserRoleArray, parseUserRoleArray } from '@repo/db'

// ==========================================
// user_role[] CONVERSION
// ==========================================
// These live in @repo/db, which has no test runner of its own, so they are
// covered from here — the api package already aliases `@repo/db` to source.
//
// Worth covering directly: with no `fromDriver`, `roles` reached the controller
// as the string `'{student}'` while TypeScript reported `string[]`. That 500'd
// `PATCH /api/users/me/role` and made `GET /api/users/me` return a malformed
// `roles` field with a 200. Nothing caught it, because every route test mocks
// the controller and never touches a real driver value.

describe('parseUserRoleArray', () => {
  it('decodes a single-element array literal', () => {
    expect(parseUserRoleArray('{student}')).toEqual(['student'])
  })

  it('decodes several elements', () => {
    expect(parseUserRoleArray('{student,club_admin}')).toEqual(['student', 'club_admin'])
  })

  it('decodes the empty array as empty, not as one blank role', () => {
    expect(parseUserRoleArray('{}')).toEqual([])
  })

  it('strips quotes when Postgres emits them', () => {
    expect(parseUserRoleArray('{"student","core_admin"}')).toEqual(['student', 'core_admin'])
  })

  it('passes through an array the driver already decoded', () => {
    // PGlite, used for local dev without DATABASE_URL, decodes arrays itself.
    expect(parseUserRoleArray(['student', 'recruiter'])).toEqual(['student', 'recruiter'])
  })

  it('returns a value array methods can be called on', () => {
    // The exact failure that reached production: `.filter is not a function`.
    expect(() => parseUserRoleArray('{student}').filter(Boolean)).not.toThrow()
  })
})

describe('formatUserRoleArray', () => {
  it('encodes a single role', () => {
    expect(formatUserRoleArray(['student'])).toBe('{student}')
  })

  it('encodes several roles', () => {
    expect(formatUserRoleArray(['recruiter', 'core_admin'])).toBe('{recruiter,core_admin}')
  })

  it('encodes no roles as the empty array literal', () => {
    expect(formatUserRoleArray([])).toBe('{}')
  })
})

describe('user_role[] round trip', () => {
  it.each([[['student']], [['student', 'club_admin']], [['core_admin']], [[]]])(
    'survives encode then decode: %j',
    (roles: string[]) => {
      expect(parseUserRoleArray(formatUserRoleArray(roles))).toEqual(roles)
    },
  )
})

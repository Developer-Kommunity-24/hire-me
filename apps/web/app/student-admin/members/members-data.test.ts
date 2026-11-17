import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api-client'
import {
  createMember,
  deleteMembers,
  fetchMembers,
  importMembers,
  membersQueryKey,
} from './members-data'

const { apiFetchMock } = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
}))

vi.mock('@/lib/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-client')>()
  return { ...actual, apiFetch: apiFetchMock }
})

describe('members-data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has the expected query key', () => {
    expect(membersQueryKey).toEqual(['members'])
  })

  describe('fetchMembers', () => {
    it('fetches and maps members correctly with addedAt formatted', async () => {
      apiFetchMock.mockResolvedValueOnce({
        data: [
          {
            id: 'm-1',
            fullName: 'Jane Doe',
            usn: '1RV21CS001',
            email: 'jane@example.com',
            addedAt: '2026-03-15T10:00:00.000Z',
          },
          {
            id: 'm-2',
            fullName: 'John Smith',
            usn: '1RV21CS002',
            email: 'john@example.com',
            addedAt: null,
          },
        ],
      })

      const members = await fetchMembers()

      expect(apiFetchMock).toHaveBeenCalledWith('/api/clubs/members')
      expect(members).toHaveLength(2)
      expect(members[0]).toEqual({
        id: 'm-1',
        name: 'Jane Doe',
        usn: '1RV21CS001',
        email: 'jane@example.com',
        joinedDate: expect.stringContaining('2026'),
      })
      expect(members[1]).toEqual({
        id: 'm-2',
        name: 'John Smith',
        usn: '1RV21CS002',
        email: 'john@example.com',
        joinedDate: null,
      })
    })
  })

  describe('createMember', () => {
    it('sends POST /api/clubs/members with transformed fields and returns mapped member', async () => {
      apiFetchMock.mockResolvedValueOnce({
        data: {
          id: 'm-3',
          fullName: 'Alice Bob',
          usn: '1RV21CS003',
          email: 'alice@example.com',
          addedAt: '2026-04-01T00:00:00.000Z',
        },
      })

      const newMember = {
        name: 'Alice Bob',
        usn: '1RV21CS003',
        email: 'alice@example.com',
      }

      const created = await createMember(newMember)

      expect(apiFetchMock).toHaveBeenCalledWith('/api/clubs/members', {
        method: 'POST',
        body: {
          fullName: 'Alice Bob',
          usn: '1RV21CS003',
          email: 'alice@example.com',
        },
      })
      expect(created.id).toBe('m-3')
      expect(created.name).toBe('Alice Bob')
    })
  })

  describe('deleteMembers', () => {
    it('deletes each member individually', async () => {
      apiFetchMock.mockResolvedValue({ data: null })

      await deleteMembers(['id-1', 'id-2'])

      expect(apiFetchMock).toHaveBeenCalledTimes(2)
      expect(apiFetchMock).toHaveBeenCalledWith('/api/clubs/members/id-1', { method: 'DELETE' })
      expect(apiFetchMock).toHaveBeenCalledWith('/api/clubs/members/id-2', { method: 'DELETE' })
    })

    it('treats 404 ApiError as success (idempotent delete)', async () => {
      apiFetchMock
        .mockResolvedValueOnce({ data: null })
        .mockRejectedValueOnce(new ApiError(404, 'Member not found'))

      await expect(deleteMembers(['id-1', 'id-2'])).resolves.toBeUndefined()
    })

    it('throws when deletion fails with non-404 error', async () => {
      apiFetchMock.mockRejectedValueOnce(new ApiError(500, 'Internal Server Error'))

      await expect(deleteMembers(['id-1'])).rejects.toThrow('Failed to delete 1 of 1 member(s)')
    })
  })

  describe('importMembers', () => {
    it('imports all members and reports successful total when all succeed', async () => {
      apiFetchMock.mockResolvedValue({
        data: {
          id: 'm-1',
          fullName: 'Name',
          usn: 'USN',
          email: 'user@example.com',
          addedAt: '2026-01-01T00:00:00.000Z',
        },
      })

      const input = [
        { name: 'Member 1', usn: 'USN1', email: 'm1@example.com' },
        { name: 'Member 2', usn: 'USN2', email: 'm2@example.com' },
      ]

      const result = await importMembers(input)

      expect(result).toEqual({
        total: 2,
        imported: 2,
        failures: [],
      })
      expect(apiFetchMock).toHaveBeenCalledTimes(2)
    })

    it('captures failures and keeps per-row index and error message', async () => {
      apiFetchMock
        .mockResolvedValueOnce({
          data: {
            id: 'm-1',
            fullName: 'Member 1',
            usn: 'USN1',
            email: 'm1@example.com',
          },
        })
        .mockRejectedValueOnce(
          new ApiError(409, 'A member with this USN already exists in your club'),
        )

      const input = [
        { name: 'Member 1', usn: 'USN1', email: 'm1@example.com' },
        { name: 'Member 2', usn: 'USN2', email: 'm2@example.com' },
      ]

      const result = await importMembers(input)

      expect(result).toEqual({
        total: 2,
        imported: 1,
        failures: [
          {
            index: 1,
            message: 'A member with this USN already exists in your club',
          },
        ],
      })
    })
  })
})

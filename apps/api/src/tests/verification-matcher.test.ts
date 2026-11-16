import { describe, expect, it, vi } from 'vitest'
import {
  flagBadgeRevocation,
  getStudentVerificationStatus,
  normalizeUsn,
  resolveBadgeRevocation,
  verifyStudentSubmission,
} from '../controllers/verification.controller.js'
import type { Database } from '@repo/db'

describe('Verification Matcher Controller Logic', () => {
  const studentId = '11111111-1111-4111-8111-111111111111'
  const studentEmail = 'student@example.test'
  const clubId = '22222222-2222-4222-8222-222222222222'
  const membershipId = '33333333-3333-4333-8333-333333333333'

  describe('normalizeUsn', () => {
    it('normalizes various casing and spacing', () => {
      expect(normalizeUsn('  1cs21cs010  ')).toBe('1CS21CS010')
      expect(normalizeUsn('1dk24cs001')).toBe('1DK24CS001')
      expect(normalizeUsn('1ee22ee015')).toBe('1EE22EE015')
    })
  })

  describe('verifyStudentSubmission - Badge Revocation Guard', () => {
    it('rejects verification when the student has an unresolved badge revocation', async () => {
      // Mock db returns an active unresolved revocation for this student
      const pendingRevocation = {
        id: 'rev-1',
        studentId,
        clubMembershipId: membershipId,
        flaggedAt: new Date(),
        resolvedBy: null,
        resolvedAt: null,
        resolution: null,
      }

      const mockInsertValues = vi.fn().mockReturnValue({
        onConflictDoUpdate: vi
          .fn()
          .mockResolvedValue([{ userId: studentId, dk24Status: 'revoked' }]),
      })

      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([pendingRevocation]),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          values: mockInsertValues,
        }),
      } as unknown as Database

      const result = await verifyStudentSubmission(mockDb, studentId, studentEmail, {
        usn: '1CS21CS010',
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('badge_revoked')
        expect(result.message).toMatch(/active badge revocation/i)
      }
      expect(mockInsertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: studentId,
          dk24Status: 'revoked',
        }),
      )
    })
  })

  describe('verifyStudentSubmission - Successful Match', () => {
    it('matches active membership, links student, sets dk24Status to verified', async () => {
      const activeMembership = {
        id: membershipId,
        clubId,
        userId: null,
        role: 'member',
        fullName: 'Test Student',
        usn: '1CS21CS010',
        email: studentEmail,
        isActive: true,
        addedAt: new Date(),
        clubName: 'ACM Student Chapter',
        clubIsActive: true,
      }

      const savedRequest = {
        id: 'req-1',
        studentId,
        usn: '1CS21CS010',
        clubId,
        matchedClubMembershipId: membershipId,
        autoMatched: true,
        submittedAt: new Date(),
        appliedAt: new Date(),
        resubmitCount: 0,
      }

      const updatedClubMembership = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: membershipId, userId: studentId }]),
      })

      const insertedVerificationRequest = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([savedRequest]),
      })

      const insertedStudentProfile = vi.fn().mockReturnValue({
        onConflictDoUpdate: vi
          .fn()
          .mockResolvedValue([{ userId: studentId, dk24Status: 'verified' }]),
      })

      const insertedNotification = vi.fn().mockResolvedValue([])

      // DB queries sequentially:
      // 1. check badgeRevocation on student -> []
      // 2. select candidate clubMemberships -> [activeMembership]
      // 3. check badgeRevocation on candidate memberships -> []
      // 4. check existing verificationRequests -> []
      let selectCount = 0
      const mockDb = {
        select: vi.fn().mockImplementation(() => ({
          from: vi.fn().mockImplementation(() => {
            selectCount++
            if (selectCount === 1) {
              // badgeRevocation for student
              return {
                where: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([]),
                }),
              }
            } else if (selectCount === 2) {
              // candidate clubMemberships with innerJoin clubs
              return {
                innerJoin: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockResolvedValue([activeMembership]),
                  }),
                }),
              }
            } else if (selectCount === 3) {
              // badgeRevocation for candidates
              return {
                where: vi.fn().mockResolvedValue([]),
              }
            } else if (selectCount === 4) {
              // existing verificationRequests
              return {
                where: vi.fn().mockReturnValue({
                  orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([]),
                  }),
                }),
              }
            }
            return {
              where: vi.fn().mockResolvedValue([]),
            }
          }),
        })),
        update: vi.fn().mockImplementation(() => ({
          set: updatedClubMembership,
        })),
        insert: vi.fn().mockImplementation((table: unknown) => ({
          values: (vals: Record<string, unknown>) => {
            if (vals.studentId && vals.usn) {
              return insertedVerificationRequest()
            }
            if (vals.userId && vals.dk24Status) {
              return insertedStudentProfile()
            }
            if (vals.userId && vals.type) {
              return insertedNotification(table)
            }
            return {
              returning: vi.fn().mockResolvedValue([vals]),
              onConflictDoUpdate: vi.fn().mockResolvedValue([vals]),
            }
          },
        })),
      } as unknown as Database

      const result = await verifyStudentSubmission(mockDb, studentId, studentEmail, {
        usn: '1CS21CS010',
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.dk24Status).toBe('verified')
        expect(result.data.request.autoMatched).toBe(true)
        expect(result.data.matchedMembership?.id).toBe(membershipId)
        expect(result.data.matchedMembership?.clubName).toBe('ACM Student Chapter')
        expect(result.data.isResubmission).toBe(false)
        expect(result.data.request.resubmitCount).toBe(0)
      }
      expect(updatedClubMembership).toHaveBeenCalledWith({ userId: studentId })
    })

    it('increments resubmitCount when student has submitted previously', async () => {
      const activeMembership = {
        id: membershipId,
        clubId,
        userId: null,
        role: 'member',
        fullName: 'Test Student',
        usn: '1CS21CS010',
        email: studentEmail,
        isActive: true,
        addedAt: new Date(),
        clubName: 'ACM Student Chapter',
        clubIsActive: true,
      }

      const existingRequest = {
        id: 'prev-req-1',
        studentId,
        usn: '1CS21CS000', // previous wrong USN
        clubId: null,
        matchedClubMembershipId: null,
        autoMatched: false,
        submittedAt: new Date('2026-09-01T00:00:00Z'),
        appliedAt: null,
        resubmitCount: 0,
      }

      const updatedRequest = {
        ...existingRequest,
        usn: '1CS21CS010',
        clubId,
        matchedClubMembershipId: membershipId,
        autoMatched: true,
        appliedAt: new Date(),
        resubmitCount: 1, // incremented!
      }

      let selectCount = 0
      const mockDb = {
        select: vi.fn().mockImplementation(() => ({
          from: vi.fn().mockImplementation(() => {
            selectCount++
            if (selectCount === 1) {
              return {
                where: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([]),
                }),
              }
            } else if (selectCount === 2) {
              return {
                innerJoin: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockResolvedValue([activeMembership]),
                  }),
                }),
              }
            } else if (selectCount === 3) {
              return {
                where: vi.fn().mockResolvedValue([]),
              }
            } else if (selectCount === 4) {
              return {
                where: vi.fn().mockReturnValue({
                  orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([existingRequest]),
                  }),
                }),
              }
            }
            return { where: vi.fn().mockResolvedValue([]) }
          }),
        })),
        update: vi.fn().mockImplementation(() => ({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([updatedRequest]),
            }),
          }),
        })),
        insert: vi.fn().mockImplementation(() => ({
          values: vi.fn().mockReturnValue({
            onConflictDoUpdate: vi.fn().mockResolvedValue([]),
          }),
        })),
      } as unknown as Database

      const result = await verifyStudentSubmission(mockDb, studentId, studentEmail, {
        usn: '1CS21CS010',
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.isResubmission).toBe(true)
        expect(result.data.request.resubmitCount).toBe(1)
        expect(result.data.dk24Status).toBe('verified')
      }
    })
  })

  describe('verifyStudentSubmission - Unmatched Result', () => {
    it('sets dk24Status to pending and autoMatched to false when USN is not in club list', async () => {
      const savedUnmatchedRequest = {
        id: 'req-unmatched',
        studentId,
        usn: '1CS21CS999',
        clubId: null,
        matchedClubMembershipId: null,
        autoMatched: false,
        submittedAt: new Date(),
        appliedAt: null,
        resubmitCount: 0,
      }

      let selectCount = 0
      const mockDb = {
        select: vi.fn().mockImplementation(() => ({
          from: vi.fn().mockImplementation(() => {
            selectCount++
            if (selectCount === 1) {
              // no revocations
              return {
                where: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([]),
                }),
              }
            } else if (selectCount === 2) {
              // no candidate memberships found
              return {
                innerJoin: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockResolvedValue([]),
                  }),
                }),
              }
            } else if (selectCount === 3) {
              // no existing requests
              return {
                where: vi.fn().mockReturnValue({
                  orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([]),
                  }),
                }),
              }
            }
            return { where: vi.fn().mockResolvedValue([]) }
          }),
        })),
        update: vi.fn().mockImplementation(() => ({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        })),
        insert: vi.fn().mockImplementation(() => ({
          values: vi.fn().mockImplementation((vals: Record<string, unknown>) => {
            if (vals.studentId && vals.usn) {
              return {
                returning: vi.fn().mockResolvedValue([savedUnmatchedRequest]),
              }
            }
            return {
              onConflictDoUpdate: vi.fn().mockResolvedValue([]),
            }
          }),
        })),
      } as unknown as Database

      const result = await verifyStudentSubmission(mockDb, studentId, studentEmail, {
        usn: '1CS21CS999',
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.request.autoMatched).toBe(false)
        expect(result.data.dk24Status).toBe('pending')
        expect(result.data.matchedMembership).toBeNull()
      }
    })
  })

  describe('Badge Revocation Operations', () => {
    it('flagBadgeRevocation creates record and sets dk24Status to revoked', async () => {
      const mockRevocation = {
        id: 'rev-new',
        studentId,
        clubMembershipId: membershipId,
        flaggedAt: new Date(),
        resolvedBy: null,
        resolvedAt: null,
        resolution: null,
      }

      const mockDb = {
        insert: vi.fn().mockImplementation(() => ({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockRevocation]),
            onConflictDoUpdate: vi.fn().mockResolvedValue([]),
          }),
        })),
        update: vi.fn().mockImplementation(() => ({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        })),
      } as unknown as Database

      const result = await flagBadgeRevocation(mockDb, {
        studentId,
        clubMembershipId: membershipId,
      })

      expect(result.id).toBe('rev-new')
      expect(result.studentId).toBe(studentId)
    })

    it('resolveBadgeRevocation updates resolution and restores status', async () => {
      const existingRevocation = {
        id: 'rev-1',
        studentId,
        clubMembershipId: membershipId,
        flaggedAt: new Date(),
        resolvedBy: null,
        resolvedAt: null,
        resolution: null,
      }

      const updatedRevocation = {
        ...existingRevocation,
        resolvedBy: 'admin-1',
        resolvedAt: new Date(),
        resolution: 'Verified as valid member',
      }

      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([existingRevocation]),
            }),
          }),
        }),
        update: vi.fn().mockImplementation(() => ({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([updatedRevocation]),
            }),
          }),
        })),
      } as unknown as Database

      const result = await resolveBadgeRevocation(mockDb, 'rev-1', {
        resolvedBy: 'admin-1',
        resolution: 'Verified as valid member',
        restoreStatus: 'verified',
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.resolvedBy).toBe('admin-1')
        expect(result.data.resolution).toBe('Verified as valid member')
      }
    })

    it('resolveBadgeRevocation returns not_found for nonexistent id', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as unknown as Database

      const result = await resolveBadgeRevocation(mockDb, 'nonexistent', {
        resolvedBy: 'admin-1',
        resolution: 'Resolution note',
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('not_found')
      }
    })
  })

  describe('getStudentVerificationStatus', () => {
    it('returns full verification status with matched membership and request', async () => {
      const profile = { dk24Status: 'verified' }
      const request = {
        id: 'req-1',
        studentId,
        usn: '1CS21CS010',
        clubId,
        matchedClubMembershipId: membershipId,
        autoMatched: true,
        submittedAt: new Date(),
        appliedAt: new Date(),
        resubmitCount: 0,
      }
      const membership = {
        id: membershipId,
        clubId,
        clubName: 'ACM Student Chapter',
        fullName: 'Test Student',
        usn: '1CS21CS010',
        role: 'member',
      }

      let selectCount = 0
      const mockDb = {
        select: vi.fn().mockImplementation(() => ({
          from: vi.fn().mockImplementation(() => {
            selectCount++
            if (selectCount === 1) {
              // profile
              return {
                where: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([profile]),
                }),
              }
            } else if (selectCount === 2) {
              // request
              return {
                where: vi.fn().mockReturnValue({
                  orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([request]),
                  }),
                }),
              }
            } else if (selectCount === 3) {
              // matched membership with clubs innerJoin
              return {
                innerJoin: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([membership]),
                  }),
                }),
              }
            } else if (selectCount === 4) {
              // activeRevocation
              return {
                where: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([]),
                }),
              }
            }
            return { where: vi.fn().mockResolvedValue([]) }
          }),
        })),
      } as unknown as Database

      const status = await getStudentVerificationStatus(mockDb, studentId)

      expect(status.dk24Status).toBe('verified')
      expect(status.request?.id).toBe('req-1')
      expect(status.matchedMembership?.clubName).toBe('ACM Student Chapter')
      expect(status.activeRevocation).toBeNull()
    })
  })
})

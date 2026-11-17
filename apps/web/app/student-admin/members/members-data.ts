import { ApiError, apiFetch } from '@/lib/api-client'

// ---- Types ----
export type Member = {
  id: string
  name: string
  usn: string
  email: string
  joinedDate: string | null
}

export type NewMember = {
  name: string
  usn: string
  email: string
}

export type ImportResult = {
  total: number
  imported: number
  failures: { index: number; message: string }[]
}

/** Shape returned by /api/clubs/members (API doc, Domain 10). */
type ApiMember = {
  id: string
  fullName: string
  usn: string
  email: string
  addedAt?: string | null
  createdAt?: string | null
}

export const membersQueryKey = ['members'] as const

function toMember(api: ApiMember): Member {
  const dateStr = api.addedAt ?? api.createdAt
  return {
    id: api.id,
    name: api.fullName,
    usn: api.usn,
    email: api.email,
    joinedDate: dateStr
      ? new Date(dateStr).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      : null,
  }
}

// ---- API calls (all require the club_admin role) ----
export async function fetchMembers(): Promise<Member[]> {
  const { data } = await apiFetch<{ data: ApiMember[] }>('/api/clubs/members')
  return data.map(toMember)
}

export async function createMember(member: NewMember): Promise<Member> {
  const { data } = await apiFetch<{ data: ApiMember }>('/api/clubs/members', {
    method: 'POST',
    body: { fullName: member.name, usn: member.usn, email: member.email },
  })
  return toMember(data)
}

/**
 * The API has no bulk-delete endpoint, so this fires one DELETE per id.
 * A 404 counts as success (the member is already gone), which keeps retries safe.
 */
export async function deleteMembers(ids: string[]): Promise<void> {
  const results = await Promise.allSettled(
    ids.map((id) =>
      apiFetch<{ data: null }>(`/api/clubs/members/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }),
    ),
  )

  const failed = results.filter(
    (r) => r.status === 'rejected' && !(r.reason instanceof ApiError && r.reason.status === 404),
  )

  if (failed.length > 0) {
    throw new Error(`Failed to delete ${failed.length} of ${ids.length} member(s)`)
  }
}

/**
 * The API has no bulk-import endpoint, so rows are POSTed one at a time (in order)
 * and the per-row outcome is reported back instead of failing the whole batch.
 */
export async function importMembers(members: NewMember[]): Promise<ImportResult> {
  const failures: ImportResult['failures'] = []

  for (let index = 0; index < members.length; index++) {
    const member = members[index]
    if (!member) continue

    try {
      await createMember(member)
    } catch (error) {
      failures.push({
        index,
        message: error instanceof Error ? error.message : 'Failed to import this row',
      })
    }
  }

  return { total: members.length, imported: members.length - failures.length, failures }
}

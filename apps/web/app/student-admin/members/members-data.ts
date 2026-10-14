export type Member = {
  id: number
  name: string
  usn: string
  email: string
  joinedDate: string
}

export type NewMember = {
  name: string
  usn: string
  email: string
}

export const membersQueryKey = ['members'] as const

// ---- API calls ----
export async function fetchMembers(): Promise<Member[]> {
  const res = await fetch('/api/members')
  if (!res.ok) throw new Error('Failed to load members')
  return res.json()
}

export async function createMember(member: NewMember) {
  const res = await fetch('/api/members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  })
  if (!res.ok) throw new Error('Failed to add member')
  return res.json()
}

export async function deleteMembers(ids: number[]) {
  const res = await fetch('/api/members', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error('Failed to delete member(s)')
  return res.json()
}

export async function importMembers(members: NewMember[]) {
  const res = await fetch('/api/members/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ members }),
  })
  if (!res.ok) throw new Error('Failed to import members')
  return res.json()
}

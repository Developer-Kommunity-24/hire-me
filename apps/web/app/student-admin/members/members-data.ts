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

export const defaultMembers: Member[] = [
  {
    id: 1,
    name: 'Priya Nair',
    usn: 'priyan',
    email: 'priyan@stanford.edu',
    joinedDate: 'January 2026',
  },
  {
    id: 2,
    name: 'Marcus Webb',
    usn: 'mwebb22',
    email: 'mwebb22@stanford.edu',
    joinedDate: 'February 2026',
  },
  {
    id: 3,
    name: 'Sara Kim',
    usn: 'sarak',
    email: 'sarak@stanford.edu',
    joinedDate: 'March 2026',
  },
]

export const membersQueryKey = ['members'] as const

// ---- API calls ----
export async function fetchMembers(): Promise<Member[]> {
  try {
    const res = await fetch('/api/members')
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // Fall back to default mock members if API route is not running
  }
  return defaultMembers
}

export async function createMember(member: NewMember) {
  try {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    })
    if (res.ok) return await res.json()
  } catch {
    // Mock success for standalone dev
  }
  return { success: true, ...member, id: Date.now(), joinedDate: 'Just now' }
}

export async function deleteMembers(ids: number[]) {
  try {
    const res = await fetch('/api/members', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
    if (res.ok) return await res.json()
  } catch {
    // Mock success for standalone dev
  }
  return { success: true, ids }
}

export async function importMembers(members: NewMember[]) {
  try {
    const res = await fetch('/api/members/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ members }),
    })
    if (res.ok) return await res.json()
  } catch {
    // Mock success for standalone dev
  }
  return { success: true, count: members.length }
}

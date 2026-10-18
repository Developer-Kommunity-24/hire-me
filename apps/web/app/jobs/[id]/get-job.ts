const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'

export async function getJobServer(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/postings/${id}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error('Failed to fetch job:', error)
    return null
  }
}

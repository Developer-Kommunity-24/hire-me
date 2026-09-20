import { Job } from '../../types/job'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'

export async function getJobServer(id: string): Promise<Job | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
      next: { revalidate: 60 }, // Cache job details for 60 seconds
    })

    if (!res.ok) return null
    return (await res.json()) as Job
  } catch (error) {
    console.error('Failed to fetch job metadata:', error)
    return null
  }
}

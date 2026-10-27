import type { Job } from '../../types/job'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'

function formatRoleType(type?: string): string {
  switch (type) {
    case 'internship':
      return 'Internship'
    case 'full_time':
      return 'Full-time'
    case 'part_time':
      return 'Part-time'
    case 'contract':
      return 'Contract'
    default:
      return type ?? 'Full-time'
  }
}

function formatWorkModel(model?: string): string {
  switch (model) {
    case 'remote':
      return 'Remote'
    case 'hybrid':
      return 'Hybrid'
    case 'in_person':
      return 'On-site'
    default:
      return model ?? 'On-site'
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRawToJob(raw: any): Job {
  return {
    id: raw.id,
    title: raw.title ?? 'Job Title',
    company: raw.recruiter?.companyName ?? raw.company ?? 'Company',
    location: raw.location ?? 'Remote',
    salaryRange: raw.compensation ?? 'Compensation not specified',
    type: formatRoleType(raw.employmentType),
    category: formatWorkModel(raw.workArrangement),
    description: raw.description ?? 'No description provided.',
    aboutRole: raw.description ? [raw.description] : ['No description provided.'],
    responsibilities: raw.responsibilities ?? [],
    qualifications: raw.qualifications ?? [],
    companyOverview: {
      industry: raw.recruiter?.industry ?? 'Technology',
      size: raw.recruiter?.companySize ?? '50-200 employees',
      founded: raw.recruiter?.founded ?? '2020',
      techStack:
        Array.isArray(raw.stack) && raw.stack.length > 0
          ? raw.stack
          : ['TypeScript', 'React', 'Node.js'],
    },
  }
}

export async function getJobServer(id: string): Promise<Job | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/postings/${id}`, {
      next: { revalidate: 0 },
    })

    if (res.ok) {
      const json = await res.json()
      const raw = json.data ?? json
      if (raw && raw.id) {
        return mapRawToJob(raw)
      }
    }

    // Fallback: search in active postings list if direct lookup returned 404
    const listRes = await fetch(`${API_BASE_URL}/api/postings?limit=100`, {
      next: { revalidate: 0 },
    })

    if (listRes.ok) {
      const listJson = await listRes.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const match = listJson.data?.find((p: any) => p.id === id)
      if (match) {
        return mapRawToJob(match)
      }
    }

    return null
  } catch (error) {
    console.error('Failed to fetch job:', error)
    return null
  }
}

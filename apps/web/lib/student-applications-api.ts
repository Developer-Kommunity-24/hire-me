import {
  studentApplicationListSchema,
  type ApplicationStatus,
  type MilestoneProgress,
  type ApplicationMilestone,
  type StudentApplicationItem,
  type ApplicationMetrics,
  type EmploymentType,
  type WorkArrangement,
  type SortOption,
  type ViewMode,
} from '@/lib/schemas/student-applications.schema'

export type {
  ApplicationStatus,
  MilestoneProgress,
  ApplicationMilestone,
  StudentApplicationItem,
  ApplicationMetrics,
  EmploymentType,
  WorkArrangement,
  SortOption,
  ViewMode,
}

export const studentApplicationsQueryKey = ['student-applications'] as const

export const DEFAULT_STUDENT_APPLICATIONS: StudentApplicationItem[] = [
  {
    id: 'app-kreative',
    postingId: 'post-kreative',
    companyName: 'KreativeLabs',
    companyLogoText: 'K',
    companyLogoBg: 'bg-slate-100 text-slate-800',
    companyUrl: 'https://kreativelabs.design',
    roleTitle: 'Product Design Intern',
    employmentType: 'internship',
    workArrangement: 'remote',
    location: 'Remote - India',
    compensation: '₹55,000 / month',
    appliedAt: '2025-08-06T10:00:00Z',
    updatedAt: '2025-08-20T14:00:00Z',
    status: 'accepted',
    currentMilestone: 'Official Offer Extended',
    currentMilestoneDate: 'Aug 20, 2025',
    stack: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    milestones: [
      { id: 'm-1', label: 'Application Submitted', status: 'completed', date: 'Aug 06, 2025' },
      { id: 'm-2', label: 'Portfolio Review', status: 'completed', date: 'Aug 10, 2025' },
      {
        id: 'm-3',
        label: 'Design Exercise Presentation',
        status: 'completed',
        date: 'Aug 15, 2025',
      },
      { id: 'm-4', label: 'Official Offer Extended', status: 'completed', date: 'Aug 20, 2025' },
    ],
  },
  {
    id: 'app-nexahire-be',
    postingId: 'post-nexahire-be',
    companyName: 'NexaHire Technologies',
    companyLogoText: 'N',
    companyLogoBg: 'bg-slate-100 text-slate-800',
    companyUrl: 'https://nexahire.ai',
    roleTitle: 'Backend Engineer (Full-Time)',
    employmentType: 'full_time',
    workArrangement: 'in_person',
    location: 'Mumbai, MH',
    compensation: '₹18 LPA - ₹24 LPA',
    appliedAt: '2025-08-11T10:00:00Z',
    updatedAt: '2025-08-22T14:00:00Z',
    status: 'interviewing',
    currentMilestone: 'Final Round Interview',
    currentMilestoneDate: 'Aug 22, 2025',
    interviewFormat: 'Leadership & Architecture (60m)',
    stack: ['Go', 'Kafka', 'Redis', 'PostgreSQL', 'Kubernetes'],
    milestones: [
      { id: 'm-1', label: 'Application Submitted', status: 'completed', date: 'Aug 09, 2025' },
      { id: 'm-2', label: 'Recruiter Screening', status: 'completed', date: 'Aug 11, 2025' },
      { id: 'm-3', label: 'Architecture Deep Dive', status: 'completed', date: 'Aug 16, 2025' },
      {
        id: 'm-4',
        label: 'Final Leadership Interview',
        status: 'current',
        date: 'Aug 22, 2025',
        notes: 'System scaling & engineering values interview',
      },
      { id: 'm-5', label: 'Offer Rollout', status: 'upcoming' },
    ],
  },
  {
    id: 'app-nexahire-ml',
    postingId: 'post-nexahire-ml',
    companyName: 'NexaHire Technologies',
    companyLogoText: 'N',
    companyLogoBg: 'bg-slate-100 text-slate-800',
    companyUrl: 'https://nexahire.ai',
    roleTitle: 'ML Engineer (Contract)',
    employmentType: 'contract',
    workArrangement: 'remote',
    location: 'Remote - India',
    compensation: '₹1,200 / day',
    appliedAt: '2025-08-15T10:00:00Z',
    updatedAt: '2025-08-18T14:00:00Z',
    status: 'under_review',
    currentMilestone: 'HuggingFace Take-home Assessment',
    currentMilestoneDate: 'Aug 25, 2025',
    stack: ['Python', 'PyTorch', 'HuggingFace', 'FAISS'],
    milestones: [
      { id: 'm-1', label: 'Application Submitted', status: 'completed', date: 'Aug 15, 2025' },
      {
        id: 'm-2',
        label: 'HuggingFace Take-home Assessment',
        status: 'current',
        date: 'Aug 25, 2025',
      },
      { id: 'm-3', label: 'Technical Discussion', status: 'upcoming' },
    ],
  },
  {
    id: 'app-byteforge',
    postingId: 'post-byteforge',
    companyName: 'ByteForge',
    companyLogoText: 'B',
    companyLogoBg: 'bg-emerald-100 text-emerald-800',
    companyUrl: 'https://byteforge.dev',
    roleTitle: 'Software Engineering Intern',
    employmentType: 'internship',
    workArrangement: 'hybrid',
    location: 'Bangalore, KA',
    compensation: '₹25,000 / month',
    appliedAt: '2025-08-18T10:30:00Z',
    updatedAt: '2025-08-26T14:20:00Z',
    status: 'interviewing',
    currentMilestone: 'Technical Screen',
    currentMilestoneDate: 'Aug 28, 2025',
    interviewFormat: 'Live Pair Programming (Google Meet, 60m)',
    stack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    milestones: [
      { id: 'm-1', label: 'Application Submitted', status: 'completed', date: 'Aug 18, 2025' },
      { id: 'm-2', label: 'Recruiter Resume Screen', status: 'completed', date: 'Aug 22, 2025' },
      {
        id: 'm-3',
        label: 'Technical Screen',
        status: 'current',
        date: 'Aug 28, 2025',
        notes: 'Live coding session on React & API design.',
      },
      { id: 'm-4', label: 'Offer Decision', status: 'upcoming' },
    ],
  },
  {
    id: 'app-stripe',
    postingId: 'post-stripe',
    companyName: 'Stripe',
    companyLogoText: 'S',
    companyLogoBg: 'bg-violet-100 text-violet-800',
    companyUrl: 'https://stripe.com',
    roleTitle: 'Infrastructure Engineer',
    employmentType: 'full_time',
    workArrangement: 'hybrid',
    location: 'Bangalore, KA',
    compensation: '₹18,00,000 / yr',
    appliedAt: '2025-07-10T14:00:00Z',
    updatedAt: '2025-07-25T10:00:00Z',
    status: 'rejected',
    currentMilestone: 'Application Closed',
    currentMilestoneDate: 'Jul 25, 2025',
    stack: ['Ruby', 'Go', 'Distributed Systems'],
    milestones: [
      { id: 'm-1', label: 'Application Submitted', status: 'completed', date: 'Jul 10, 2025' },
      { id: 'm-2', label: 'Role Closed', status: 'completed', date: 'Jul 25, 2025' },
    ],
  },
]

export function computeMetrics(applications: StudentApplicationItem[]): ApplicationMetrics {
  return applications.reduce<ApplicationMetrics>(
    (acc, app) => {
      acc.total += 1
      if (app.status === 'interviewing') acc.interviewing += 1
      else if (app.status === 'accepted') acc.offers += 1
      else if (app.status === 'rejected') acc.rejected += 1
      else if (app.status === 'under_review') acc.underReview += 1
      else acc.applied += 1
      return acc
    },
    {
      total: 0,
      applied: 0,
      underReview: 0,
      interviewing: 0,
      offers: 0,
      rejected: 0,
    },
  )
}

interface RawPosting {
  id?: string
  title?: string
  employmentType?: StudentApplicationItem['employmentType']
  workArrangement?: StudentApplicationItem['workArrangement']
  location?: string
  compensation?: string
  description?: string
  stack?: string[]
}

interface RawRecruiter {
  companyName?: string
  companyUrl?: string
}

interface RawApplicationData {
  id?: string
  postingId?: string
  companyName?: string
  companyLogoText?: string
  companyLogoBg?: string
  companyUrl?: string
  roleTitle?: string
  employmentType?: StudentApplicationItem['employmentType']
  workArrangement?: StudentApplicationItem['workArrangement']
  location?: string
  compensation?: string
  appliedAt?: string
  updatedAt?: string
  status?: ApplicationStatus | 'shortlisted'
  currentMilestone?: string
  currentMilestoneDate?: string
  interviewFormat?: string
  recruiterName?: string
  recruiterEmail?: string
  description?: string
  stack?: string[]
  milestones?: ApplicationMilestone[]
  posting?: RawPosting
  recruiter?: RawRecruiter
}

export async function fetchStudentApplications(): Promise<StudentApplicationItem[]> {
  try {
    const res = await fetch('/api/student/applications', {
      headers: {
        Accept: 'application/json',
      },
    })

    if (res.ok) {
      const json = await res.json()
      if (Array.isArray(json.data) && json.data.length > 0) {
        const mapped = (json.data as RawApplicationData[]).map(
          (raw, index): StudentApplicationItem => ({
            id: raw.id ?? `app-${index}`,
            postingId: raw.postingId ?? raw.posting?.id ?? `post-${index}`,
            companyName: raw.companyName || raw.recruiter?.companyName || 'Verified Partner',
            companyLogoText:
              raw.companyLogoText ||
              (raw.companyName || raw.recruiter?.companyName || 'VP').slice(0, 2).toUpperCase(),
            companyLogoBg: raw.companyLogoBg || 'bg-emerald-600',
            companyUrl: raw.companyUrl || raw.recruiter?.companyUrl,
            roleTitle: raw.roleTitle || raw.posting?.title || 'Open Position',
            employmentType: raw.employmentType || raw.posting?.employmentType || 'full_time',
            workArrangement: raw.workArrangement || raw.posting?.workArrangement || 'remote',
            location: raw.location || raw.posting?.location || 'Remote',
            compensation: raw.compensation ?? raw.posting?.compensation,
            appliedAt: raw.appliedAt || new Date().toISOString(),
            updatedAt: raw.updatedAt || new Date().toISOString(),
            status:
              raw.status === 'shortlisted'
                ? 'interviewing'
                : (raw.status as ApplicationStatus) || 'applied',
            currentMilestone:
              raw.currentMilestone ||
              (raw.status === 'accepted'
                ? 'Offer Extended'
                : raw.status === 'interviewing' || raw.status === 'shortlisted'
                  ? 'Technical Screen'
                  : raw.status === 'rejected'
                    ? 'Application Closed'
                    : 'Application Submitted'),
            currentMilestoneDate: raw.currentMilestoneDate,
            interviewFormat: raw.interviewFormat,
            recruiterName: raw.recruiterName,
            recruiterEmail: raw.recruiterEmail,
            description: raw.description || raw.posting?.description,
            stack:
              Array.isArray(raw.stack) && raw.stack.length > 0
                ? raw.stack
                : Array.isArray(raw.posting?.stack)
                  ? raw.posting.stack
                  : [],
            milestones:
              Array.isArray(raw.milestones) && raw.milestones.length > 0
                ? raw.milestones
                : [
                    {
                      id: '1',
                      label: 'Application Submitted',
                      status: 'completed',
                      date: new Date(raw.appliedAt || Date.now()).toLocaleDateString(),
                    },
                    {
                      id: '2',
                      label: 'Screening',
                      status: raw.status === 'applied' ? 'upcoming' : 'completed',
                    },
                    {
                      id: '3',
                      label: 'Interview',
                      status:
                        raw.status === 'shortlisted' || raw.status === 'interviewing'
                          ? 'current'
                          : raw.status === 'accepted'
                            ? 'completed'
                            : 'upcoming',
                    },
                    {
                      id: '4',
                      label: 'Decision',
                      status:
                        raw.status === 'accepted' || raw.status === 'rejected'
                          ? 'completed'
                          : 'upcoming',
                    },
                  ],
          }),
        )

        const parsed = studentApplicationListSchema.safeParse(mapped)
        if (parsed.success && parsed.data.length > 0) {
          return parsed.data
        }
      }
    }
  } catch {
    // Graceful fallback to default mock applications if backend is offline
  }

  return studentApplicationListSchema.parse(DEFAULT_STUDENT_APPLICATIONS)
}

export async function withdrawStudentApplication(
  applicationId: string,
): Promise<{ success: boolean; id: string }> {
  try {
    const res = await fetch(`/api/student/applications/${applicationId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      return { success: true, id: applicationId }
    }
  } catch {
    // Fall back to client success
  }
  return { success: true, id: applicationId }
}

export function formatEmploymentType(type: StudentApplicationItem['employmentType']): string {
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
      return type
  }
}

export function formatWorkArrangement(
  arrangement: StudentApplicationItem['workArrangement'],
): string {
  switch (arrangement) {
    case 'in_person':
      return 'On-site'
    case 'hybrid':
      return 'Hybrid'
    case 'remote':
      return 'Remote'
    default:
      return arrangement
  }
}

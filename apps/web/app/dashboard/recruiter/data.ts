export type CandidateStatus = 'applied' | 'under_review' | 'shortlisted'

export type Candidate = {
  id: number
  name: string
  position: string
  email: string
  headline: string
  skills: string[]
  status: CandidateStatus
  appliedAt: string
}

export const dashboardMetrics = {
  activeJobs: 14,
  activeJobsDelta: '+2 this week',

  totalApplicants: 842,
  applicantsDelta: '+156 this week',

  pendingReviews: 47,
  pendingReviewsDelta: 'Requires action',
}

export const candidates: Candidate[] = [
  {
    id: 1,
    name: 'Alex Mercer',
    position: 'Senior Frontend Engineer',
    email: 'alex.mercer@example.com',
    headline: 'CS Senior • Frontend Developer',
    skills: ['React', 'TypeScript', 'System Design'],
    status: 'applied',
    appliedAt: 'Today',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    position: 'Product Designer',
    email: 'sarah.chen@example.com',
    headline: 'Product Designer • UX Research',
    skills: ['Figma', 'Prototyping', 'User Research'],
    status: 'applied',
    appliedAt: 'Yesterday',
  },
  {
    id: 3,
    name: 'Arjun Sharma',
    position: 'Full-Stack Engineer Intern',
    email: 'arjun.sharma@example.com',
    headline: 'Full-Stack Developer',
    skills: ['React', 'Node.js', 'PostgreSQL'],
    status: 'under_review',
    appliedAt: '2 days ago',
  },
  {
    id: 4,
    name: 'Priya Nair',
    position: 'Product Design Intern',
    email: 'priya.nair@example.com',
    headline: 'UI/UX Designer',
    skills: ['Figma', 'Design Systems', 'Research'],
    status: 'under_review',
    appliedAt: '3 days ago',
  },
  {
    id: 5,
    name: 'Kiran Rao',
    position: 'Backend Engineer',
    email: 'kiran.rao@example.com',
    headline: 'Backend Engineer • Distributed Systems',
    skills: ['Go', 'Redis', 'Kubernetes'],
    status: 'shortlisted',
    appliedAt: '4 days ago',
  },
]

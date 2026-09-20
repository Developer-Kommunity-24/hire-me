export interface CompanyOverview {
  industry?: string
  size?: string
  founded?: string
  techStack?: string[]
}

export interface Job {
  id: string
  title: string
  category: string
  location: string
  salaryRange: string
  type: string
  company?: string
  description?: string
  aboutRole?: string[]
  responsibilities?: string[]
  qualifications?: string[]
  companyOverview?: CompanyOverview
}

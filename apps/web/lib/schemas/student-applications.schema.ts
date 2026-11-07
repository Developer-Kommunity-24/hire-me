import { z } from 'zod'

export const applicationStatusSchema = z.enum([
  'applied',
  'under_review',
  'interviewing',
  'accepted',
  'rejected',
])

export const milestoneProgressSchema = z.enum(['completed', 'current', 'upcoming'])

export const applicationMilestoneSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Milestone label is required'),
  status: milestoneProgressSchema,
  date: z.string().optional(),
  notes: z.string().optional(),
})

export const employmentTypeSchema = z.enum(['internship', 'full_time', 'part_time', 'contract'])

export const workArrangementSchema = z.enum(['in_person', 'remote', 'hybrid'])

export const studentApplicationSchema = z.object({
  id: z.string(),
  postingId: z.string(),
  companyName: z.string().min(1, 'Company name is required'),
  companyLogoText: z.string(),
  companyLogoBg: z.string(),
  companyUrl: z.string().url().optional().or(z.literal('')),
  roleTitle: z.string().min(1, 'Role title is required'),
  employmentType: employmentTypeSchema,
  workArrangement: workArrangementSchema,
  location: z.string(),
  compensation: z.string().optional(),
  appliedAt: z.string(),
  updatedAt: z.string(),
  status: applicationStatusSchema,
  currentMilestone: z.string(),
  currentMilestoneDate: z.string().optional(),
  milestones: z.array(applicationMilestoneSchema),
  stack: z.array(z.string()),
  description: z.string().optional(),
  interviewFormat: z.string().optional(),
  recruiterName: z.string().optional(),
  recruiterEmail: z.string().email().optional().or(z.literal('')),
})

export const studentApplicationListSchema = z.array(studentApplicationSchema)

export const applicationMetricsSchema = z.object({
  total: z.number().int().nonnegative(),
  applied: z.number().int().nonnegative(),
  underReview: z.number().int().nonnegative(),
  interviewing: z.number().int().nonnegative(),
  offers: z.number().int().nonnegative(),
  rejected: z.number().int().nonnegative(),
})

export const sortOptionSchema = z.enum(['status', 'date-desc', 'date-asc', 'company'])

export const viewModeSchema = z.enum(['list', 'grid'])

export const applicationsFilterSchema = z.object({
  search: z.string().default(''),
  status: z.union([z.literal('all'), applicationStatusSchema]).default('all'),
  sortBy: sortOptionSchema.default('status'),
  viewMode: viewModeSchema.default('list'),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(5),
})

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>
export type MilestoneProgress = z.infer<typeof milestoneProgressSchema>
export type ApplicationMilestone = z.infer<typeof applicationMilestoneSchema>
export type EmploymentType = z.infer<typeof employmentTypeSchema>
export type WorkArrangement = z.infer<typeof workArrangementSchema>
export type StudentApplicationItem = z.infer<typeof studentApplicationSchema>
export type ApplicationMetrics = z.infer<typeof applicationMetricsSchema>
export type SortOption = z.infer<typeof sortOptionSchema>
export type ViewMode = z.infer<typeof viewModeSchema>
export type ApplicationsFilterInput = z.infer<typeof applicationsFilterSchema>

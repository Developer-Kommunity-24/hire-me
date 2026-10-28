import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import type { AuthVariables } from '../middleware/auth.js'
import type { DbVariables } from '../middleware/db.js'
import {
  createAchievement,
  createExperience,
  createProject,
  createSkill,
  deleteAchievement,
  deleteExperience,
  deleteProject,
  deleteSkill,
  listAchievements,
  listExperience,
  listProjects,
  listSkills,
  updateAchievement,
  updateExperience,
  updateProject,
  updateSkill,
} from '../controllers/student-data.controller.js'

type StudentDataEnv = {
  Bindings: { DATABASE_URL: string; NEON_AUTH_BASE_URL: string }
  Variables: DbVariables & AuthVariables
}

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  }, 'Must be a valid calendar date')

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional()
const optionalUrl = z.string().trim().url().nullable().optional()
const smallint = z.number().int().min(0).max(32767)
const uuidSchema = z.string().uuid()

const skillCreate = z.object({ skill: z.string().trim().min(1).max(255) })
const skillUpdate = skillCreate

const projectFields = {
  title: z.string().trim().min(1).max(255),
  description: optionalText(10000),
  role: optionalText(255),
  contributions: optionalText(10000),
  learnings: optionalText(10000),
  skillsUsed: z.array(z.string().trim().min(1).max(255)).max(100).nullable().optional(),
  liveUrl: optionalUrl,
  githubUrl: optionalUrl,
  displayOrder: smallint.optional(),
}
const projectCreate = z.object(projectFields)
const projectUpdate = z
  .object(projectFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

const experienceFields = {
  companyName: z.string().trim().min(1).max(255),
  role: z.string().trim().min(1).max(255),
  startDate: dateSchema.nullable().optional(),
  endDate: dateSchema.nullable().optional(),
  contributions: optionalText(10000),
}
const experienceCreate = z.object(experienceFields).superRefine((data, ctx) => {
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    ctx.addIssue({
      code: 'custom',
      path: ['endDate'],
      message: 'End date must not be earlier than start date',
    })
  }
})
const experienceUpdate = z
  .object(experienceFields)
  .partial()
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'End date must not be earlier than start date',
      })
    }
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

const achievementFields = {
  type: z.enum(['hackathon', 'certification', 'award', 'other']),
  title: z.string().trim().min(1).max(255),
  description: optionalText(10000),
  date: dateSchema.nullable().optional(),
}
const achievementCreate = z.object(achievementFields)
const achievementUpdate = z
  .object(achievementFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

const resourceId = (id: string) => (uuidSchema.safeParse(id).success ? id : null)

export const studentDataRouter = new Hono<StudentDataEnv>()
studentDataRouter.use('*', requireAuth)

studentDataRouter.get('/skills', async (c) =>
  c.json({ data: await listSkills(c.var.db, c.var.authUser.id) }),
)
studentDataRouter.post('/skills', zValidator('json', skillCreate), async (c) => {
  const result = await createSkill(c.var.db, c.var.authUser.id, c.req.valid('json'))
  if (!result.ok && result.error === 'student_profile_missing') {
    return c.json({ error: 'Student profile not found' }, 404)
  }
  if (!result.ok) return c.json({ error: 'Skill already exists' }, 409)
  return c.json({ data: result.data }, 201)
})
studentDataRouter.patch('/skills/:id', zValidator('json', skillUpdate), async (c) => {
  const id = resourceId(c.req.param('id'))
  if (!id) return c.json({ error: 'Skill not found' }, 404)
  const result = await updateSkill(c.var.db, c.var.authUser.id, id, c.req.valid('json'))
  if (!result.ok)
    return c.json(
      { error: result.error === 'duplicate' ? 'Skill already exists' : 'Skill not found' },
      result.error === 'duplicate' ? 409 : 404,
    )
  return c.json({ data: result.data })
})
studentDataRouter.delete('/skills/:id', async (c) => {
  const id = resourceId(c.req.param('id'))
  if (!id || !(await deleteSkill(c.var.db, c.var.authUser.id, id)))
    return c.json({ error: 'Skill not found' }, 404)
  return c.json({ data: null })
})

studentDataRouter.get('/projects', async (c) =>
  c.json({ data: await listProjects(c.var.db, c.var.authUser.id) }),
)
studentDataRouter.post('/projects', zValidator('json', projectCreate), async (c) => {
  const result = await createProject(c.var.db, c.var.authUser.id, c.req.valid('json'))
  if (!result.ok) return c.json({ error: 'Student profile not found' }, 404)
  return c.json({ data: result.data }, 201)
})
studentDataRouter.patch('/projects/:id', zValidator('json', projectUpdate), async (c) => {
  const id = resourceId(c.req.param('id'))
  if (!id) return c.json({ error: 'Project not found' }, 404)
  const result = await updateProject(c.var.db, c.var.authUser.id, id, c.req.valid('json'))
  if (!result.ok) return c.json({ error: 'Project not found' }, 404)
  return c.json({ data: result.data })
})
studentDataRouter.delete('/projects/:id', async (c) => {
  const id = resourceId(c.req.param('id'))
  if (!id || !(await deleteProject(c.var.db, c.var.authUser.id, id)))
    return c.json({ error: 'Project not found' }, 404)
  return c.json({ data: null })
})

studentDataRouter.get('/experience', async (c) =>
  c.json({ data: await listExperience(c.var.db, c.var.authUser.id) }),
)
studentDataRouter.post('/experience', zValidator('json', experienceCreate), async (c) => {
  const result = await createExperience(c.var.db, c.var.authUser.id, c.req.valid('json'))
  if (!result.ok) return c.json({ error: 'Student profile not found' }, 404)
  return c.json({ data: result.data }, 201)
})
studentDataRouter.patch('/experience/:id', zValidator('json', experienceUpdate), async (c) => {
  const id = resourceId(c.req.param('id'))
  if (!id) return c.json({ error: 'Experience not found' }, 404)
  const result = await updateExperience(c.var.db, c.var.authUser.id, id, c.req.valid('json'))
  if (!result.ok) {
    if (result.error === 'invalid_date_range') {
      return c.json({ error: 'End date must not be earlier than start date' }, 400)
    }
    return c.json({ error: 'Experience not found' }, 404)
  }
  return c.json({ data: result.data })
})
studentDataRouter.delete('/experience/:id', async (c) => {
  const id = resourceId(c.req.param('id'))
  if (!id || !(await deleteExperience(c.var.db, c.var.authUser.id, id)))
    return c.json({ error: 'Experience not found' }, 404)
  return c.json({ data: null })
})

studentDataRouter.get('/achievements', async (c) =>
  c.json({ data: await listAchievements(c.var.db, c.var.authUser.id) }),
)
studentDataRouter.post('/achievements', zValidator('json', achievementCreate), async (c) => {
  const result = await createAchievement(c.var.db, c.var.authUser.id, c.req.valid('json'))
  if (!result.ok) return c.json({ error: 'Student profile not found' }, 404)
  return c.json({ data: result.data }, 201)
})
studentDataRouter.patch('/achievements/:id', zValidator('json', achievementUpdate), async (c) => {
  const id = resourceId(c.req.param('id'))
  if (!id) return c.json({ error: 'Achievement not found' }, 404)
  const result = await updateAchievement(c.var.db, c.var.authUser.id, id, c.req.valid('json'))
  if (!result.ok) return c.json({ error: 'Achievement not found' }, 404)
  return c.json({ data: result.data })
})
studentDataRouter.delete('/achievements/:id', async (c) => {
  const id = resourceId(c.req.param('id'))
  if (!id || !(await deleteAchievement(c.var.db, c.var.authUser.id, id)))
    return c.json({ error: 'Achievement not found' }, 404)
  return c.json({ data: null })
})

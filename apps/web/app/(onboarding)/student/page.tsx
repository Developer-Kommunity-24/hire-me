'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight, Code, FileText, Globe, Link, Plus, Sparkles, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StudentMascotHero } from '@/components/onboarding/student-mascot-hero'
import {
  StudentOnboardingStepper,
  type StepNumber,
} from '@/components/onboarding/student-onboarding-stepper'
import { useSaveStudentProfile } from '@/lib/hooks/use-onboarding'
import {
  studentCompleteOnboardingSchema,
  type StudentOnboardingInput,
} from '@/lib/schemas/student-onboarding.schema'
import { showConfetti, ONBOARDING_REDIRECT_DELAY_MS } from '@/lib/utils/confetti'

const DEFAULT_STUDENT_VALUES: StudentOnboardingInput = {
  fullName: '',
  headline: '',
  bio: '',
  school: '',
  degree: '',
  graduationYear: '2026',
  gpa: '',
  specialization: '',
  skills: [],
  experienceRole: '',
  experienceCompany: '',
  experienceSummary: '',
  githubUrl: '',
  linkedinUrl: '',
  portfolioUrl: '',
  resumeUrl: '',
}

const GRADUATION_YEAR_OPTIONS = ['2024', '2025', '2026', '2027', '2028', '2029', '2030']
const POPULAR_SKILL_SUGGESTIONS = [
  'Python',
  'JavaScript',
  'Node.js',
  'SQL',
  'Docker',
  'Git',
  'Java',
]

export default function StudentOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<StepNumber>(1)
  const [isCompleted, setIsCompleted] = useState(false)
  const [newSkillInput, setNewSkillInput] = useState('')

  const saveStudentMutation = useSaveStudentProfile()

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    control,
    getValues,
    formState: { errors },
  } = useForm<StudentOnboardingInput>({
    resolver: zodResolver(studentCompleteOnboardingSchema),
    mode: 'onTouched',
    defaultValues: DEFAULT_STUDENT_VALUES,
  })

  // Watch skills array specifically for rendering skill badges in Step 3
  const skills = useWatch({ control, name: 'skills' }) || []

  // Interactive Character Eye Tracking & Blinking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [blink, setBlink] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    setMousePos({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    })
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const intervalId = setInterval(
      () => {
        setBlink(true)
        timeoutId = setTimeout(() => setBlink(false), 140)
      },
      3200 + Math.random() * 2600,
    )

    return () => {
      clearInterval(intervalId)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  // Skills management handlers
  const handleAddSkill = (skillToAdd?: string) => {
    const target = (skillToAdd || newSkillInput).trim()
    if (!target) return
    const currentSkills = getValues('skills') || []
    if (!currentSkills.includes(target)) {
      setValue('skills', [...currentSkills, target], { shouldValidate: true })
    }
    setNewSkillInput('')
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = getValues('skills') || []
    setValue(
      'skills',
      currentSkills.filter((s) => s !== skillToRemove),
      { shouldValidate: true },
    )
  }

  const onFinalSubmit = async (data: StudentOnboardingInput) => {
    try {
      await saveStudentMutation.mutateAsync(data)
      setIsCompleted(true)
      showConfetti()

      setTimeout(() => {
        router.push('/landing')
      }, ONBOARDING_REDIRECT_DELAY_MS)
    } catch {
      // Error handled by mutation hook
    }
  }

  // Stepper navigation with Zod schema validation
  const handleNext = async () => {
    if (step === 1) {
      const valid = await trigger(['fullName', 'headline'])
      if (valid) setStep(2)
    } else if (step === 2) {
      const valid = await trigger(['school', 'degree'])
      if (valid) setStep(3)
    } else if (step === 3) {
      const valid = await trigger('skills')
      if (valid) setStep(4)
    } else if (step === 4) {
      void handleSubmit(onFinalSubmit)()
    }
  }

  const handleBack = () => {
    if (step === 1) {
      router.push('/role-select')
    } else {
      setStep((prev) => (prev - 1) as StepNumber)
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="h-screen w-screen bg-bg-page text-text-main flex flex-col justify-between overflow-hidden font-sans select-none selection:bg-brand/20 selection:text-text-main"
    >
      {/* Top Navbar */}
      <header className="w-full z-20 shrink-0">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-3 sm:py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            className="flex items-center gap-1.5 text-2xl tracking-tight cursor-pointer bg-transparent border-0 text-left p-0 outline-none"
            onClick={() => router.push('/')}
          >
            <span className="font-extrabold text-brand">DK24</span>
            <span className="font-bold text-text-main">CareerLink</span>
          </button>
        </div>
      </header>

      {/* Main Container Fixed-Height Card */}
      <main className="flex-1 w-full flex items-center justify-center px-4 sm:px-8 py-2 z-10 overflow-hidden">
        <div className="w-full max-w-6xl h-full max-h-[580px] bg-card rounded-3xl sm:rounded-2xl border border-border-subtle shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* LEFT COLUMN: HERO & 3D MASCOT */}
          <StudentMascotHero mousePos={mousePos} blink={blink} />

          {/* RIGHT COLUMN: MULTI-STEP WIZARD FORM */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-9 flex flex-col justify-between h-full overflow-hidden">
            {/* Top Stepper Indicator */}
            <StudentOnboardingStepper currentStep={step} onStepClick={setStep} />

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto py-4 sm:py-5 pr-1 space-y-5 scrollbar-thin">
              <AnimatePresence mode="wait">
                {/* STEP 1: BASIC INFO */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                        Personal Information
                      </h2>
                      <p className="text-xs text-text-muted mt-0.5">
                        Tell us your name and how you want recruiters to see you.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          type="text"
                          {...register('fullName')}
                          placeholder="e.g. Alex Rivera"
                        />
                        {errors.fullName && (
                          <p role="alert" className="text-xs font-medium text-rose-500 mt-1">
                            {errors.fullName.message}
                          </p>
                        )}
                      </div>

                      {/* Headline */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Headline / Role <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          type="text"
                          {...register('headline')}
                          placeholder="e.g. Computer Science Student | Aspiring Full-Stack Dev"
                        />
                        {errors.headline && (
                          <p role="alert" className="text-xs font-medium text-rose-500 mt-1">
                            {errors.headline.message}
                          </p>
                        )}
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Short Bio (Optional)
                        </label>
                        <textarea
                          {...register('bio')}
                          rows={3}
                          placeholder="Brief introduction about your passion, key achievements, or career goals..."
                          className="w-full px-3.5 py-2 rounded-xl border border-border-subtle focus-visible:border-brand focus-visible:ring-brand/15 text-xs sm:text-sm bg-card outline-none resize-none transition"
                        />
                        {errors.bio && (
                          <p role="alert" className="text-xs font-medium text-rose-500 mt-1">
                            {errors.bio.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: EDUCATION */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                        Education & Academics
                      </h2>
                      <p className="text-xs text-text-muted mt-0.5">
                        Share your academic background and expected graduation.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      {/* School / University */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          School / University <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          type="text"
                          {...register('school')}
                          placeholder="e.g. Stanford University"
                        />
                        {errors.school && (
                          <p role="alert" className="text-xs font-medium text-rose-500 mt-1">
                            {errors.school.message}
                          </p>
                        )}
                      </div>

                      {/* Degree & Specialization Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Degree <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            type="text"
                            {...register('degree')}
                            placeholder="e.g. B.S. Computer Science"
                          />
                          {errors.degree && (
                            <p role="alert" className="text-xs font-medium text-rose-500 mt-1">
                              {errors.degree.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Specialization / Major
                          </label>
                          <Input
                            type="text"
                            {...register('specialization')}
                            placeholder="e.g. Artificial Intelligence"
                          />
                        </div>
                      </div>

                      {/* Grad Year & GPA Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Expected Grad Year
                          </label>
                          <select
                            {...register('graduationYear')}
                            className="w-full px-3 py-2 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 text-xs sm:text-sm bg-card outline-none transition cursor-pointer"
                          >
                            {GRADUATION_YEAR_OPTIONS.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            GPA (Optional)
                          </label>
                          <Input type="text" {...register('gpa')} placeholder="e.g. 3.8 / 4.0" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: SKILLS & EXPERIENCE */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                        Skills & Experience
                      </h2>
                      <p className="text-xs text-text-muted mt-0.5">
                        Add technical skills and optional prior internship or project experience.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Skills Input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Technical Skills <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input
                              type="text"
                              value={newSkillInput}
                              onChange={(e) => setNewSkillInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleAddSkill()
                                }
                              }}
                              placeholder="Add a skill (e.g. React, TypeScript)..."
                            />
                          </div>
                          <Button type="button" size="sm" onClick={() => handleAddSkill()}>
                            <Plus />
                            <span>Add</span>
                          </Button>
                        </div>

                        {/* Current Skill Badges */}
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                <span>{skill}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(skill)}
                                  aria-label={`Remove ${skill}`}
                                  className="hover:text-destructive transition-colors bg-transparent border-0 p-0 cursor-pointer"
                                >
                                  <X className="size-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Popular Skill Suggestions */}
                        <div className="mt-2.5">
                          <span className="text-xs font-semibold text-slate-500">
                            Popular suggestions:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {POPULAR_SKILL_SUGGESTIONS.map((ps) => (
                              <button
                                type="button"
                                key={ps}
                                onClick={() => handleAddSkill(ps)}
                                disabled={skills.includes(ps)}
                                className={`text-xs px-2 py-0.5 rounded-md border transition cursor-pointer ${
                                  skills.includes(ps)
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                                    : 'bg-card text-slate-600 border-border-subtle hover:border-brand hover:text-brand'
                                }`}
                              >
                                + {ps}
                              </button>
                            ))}
                          </div>
                        </div>

                        {errors.skills && (
                          <p role="alert" className="text-xs font-medium text-rose-500 mt-1">
                            {errors.skills.message}
                          </p>
                        )}
                      </div>

                      {/* Recent Experience */}
                      <div className="pt-2 border-t border-border-subtle/50 space-y-3">
                        <span className="text-xs font-bold text-slate-800 block">
                          Most Recent Role / Internship (Optional)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            type="text"
                            {...register('experienceRole')}
                            placeholder="Role (e.g. Frontend Intern)"
                          />
                          <Input
                            type="text"
                            {...register('experienceCompany')}
                            placeholder="Company (e.g. Acme Corp)"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: PROFILES & LINKS */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                        Online Profiles & Links
                      </h2>
                      <p className="text-xs text-text-muted mt-0.5">
                        Add links to your code repositories, LinkedIn, or portfolio.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* GitHub */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          GitHub Profile URL
                        </label>
                        <div className="flex items-center gap-2">
                          <Code className="size-4 shrink-0 text-text-muted" />
                          <Input
                            type="url"
                            {...register('githubUrl')}
                            placeholder="https://github.com/username"
                          />
                        </div>
                        {errors.githubUrl && (
                          <p role="alert" className="text-xs font-medium text-rose-500 mt-1">
                            {errors.githubUrl.message}
                          </p>
                        )}
                      </div>

                      {/* LinkedIn */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          LinkedIn Profile URL
                        </label>
                        <div className="flex items-center gap-2">
                          <Link className="size-4 shrink-0 text-text-muted" />
                          <Input
                            type="url"
                            {...register('linkedinUrl')}
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>
                        {errors.linkedinUrl && (
                          <p role="alert" className="text-xs font-medium text-rose-500 mt-1">
                            {errors.linkedinUrl.message}
                          </p>
                        )}
                      </div>

                      {/* Portfolio */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Portfolio Website URL
                        </label>
                        <div className="flex items-center gap-2">
                          <Globe className="size-4 shrink-0 text-text-muted" />
                          <Input
                            type="url"
                            {...register('portfolioUrl')}
                            placeholder="https://alexrivera.dev"
                          />
                        </div>
                        {errors.portfolioUrl && (
                          <p role="alert" className="text-xs font-medium text-rose-500 mt-1">
                            {errors.portfolioUrl.message}
                          </p>
                        )}
                      </div>

                      {/* Resume */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Resume / CV Link (Optional)
                        </label>
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 shrink-0 text-text-muted" />
                          <Input
                            type="url"
                            {...register('resumeUrl')}
                            placeholder="https://drive.google.com/... or resume URL"
                          />
                        </div>
                        {errors.resumeUrl && (
                          <p role="alert" className="text-xs font-medium text-rose-500 mt-1">
                            {errors.resumeUrl.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-border-subtle/50 shrink-0">
              {/* Back Button */}
              <Button type="button" variant="secondary" onClick={handleBack}>
                <ArrowLeft />
                <span>Back</span>
              </Button>

              {/* Next / Complete Button */}
              <Button
                type="button"
                onClick={handleNext}
                disabled={isCompleted || saveStudentMutation.isPending}
              >
                {step < 4 ? (
                  <>
                    <span>Next</span>
                    <ArrowRight />
                  </>
                ) : (
                  <>
                    <span>{isCompleted ? 'Profile Created!' : 'Finish Setup'}</span>
                    <Sparkles />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

'use client'

import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Globe,
  Mail,
  MapPin,
  Sparkles,
  X,
  User,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { ApiError, apiFetch } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

type OnboardingStep = 1 | 2 | 3

// Base Schema matching backend recruiterUpdateSchema
export const recruiterBaseSchema = z.object({
  fullName: z.string().trim().min(1, 'Please fill in your full name.').optional(),
  jobTitle: z.string().trim().min(1, 'Please fill in your job title.').optional(),
  companyName: z.string().trim().min(1, 'Please fill in your company name.').optional(),
  companyMail: z
    .string()
    .trim()
    .email('Please enter a valid work email address.')
    .optional()
    .or(z.literal('')),
  companyUrl: z
    .string()
    .trim()
    .url('Please enter a valid website URL.')
    .optional()
    .or(z.literal('')),
  headquartersLocation: z.string().trim().optional(),
  bio: z.string().trim().optional(),
})

export type RecruiterFormData = z.infer<typeof recruiterBaseSchema>

export const step1Schema = recruiterBaseSchema.pick({ fullName: true, jobTitle: true }).required()

export const step2Schema = recruiterBaseSchema
  .pick({ companyName: true, companyUrl: true, headquartersLocation: true })
  .required({ companyName: true })
  .extend({
    companyMail: z
      .string()
      .trim()
      .min(1, 'Please provide your work email.')
      .email('Please enter a valid work email address.'),
  })

export const finalSubmitSchema = step1Schema.merge(step2Schema)

function getSanitizedPayload(values: RecruiterFormData, isComplete = false) {
  const payload: Record<string, string | boolean> = {}

  for (const [key, value] of Object.entries(values)) {
    if (typeof value === 'string' && value.trim()) {
      payload[key] = value.trim()
    }
  }

  if (isComplete) {
    payload.isComplete = true
  }

  return payload
}

const getStepCircleClass = (currentStep: number, targetStep: number) => {
  return cn(
    'w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
    currentStep > targetStep && 'bg-brand text-white shadow-xs',
    currentStep === targetStep && 'bg-brand text-white shadow-[0_0_0_5px_var(--brand-green-glow)]',
    currentStep < targetStep && 'bg-card border-2 border-border-subtle text-text-muted',
    currentStep < targetStep && targetStep !== 3 && 'group-hover:border-slate-300',
  )
}

const getStepTextClass = (currentStep: number, targetStep: number) => {
  return cn(
    'text-[11px] whitespace-nowrap transition-colors',
    currentStep === targetStep && 'font-bold text-brand',
    currentStep > targetStep && 'font-semibold text-slate-700',
    currentStep < targetStep && 'font-medium text-text-muted',
  )
}

export default function RecruiterOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>(1)
  const [isCompleted, setIsCompleted] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [step1Error, setStep1Error] = useState('')
  const [step2Error, setStep2Error] = useState('')

  const { register, watch, reset, getValues } = useForm<RecruiterFormData>({
    defaultValues: {
      fullName: '',
      jobTitle: '',
      companyName: '',
      companyMail: '',
      companyUrl: '',
      headquartersLocation: '',
      bio: '',
    },
  })

  // Data Loading using TanStack Query
  const {
    data: initialData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['recruiter-onboarding-init'],
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false
      }
      return failureCount < 3
    },
    queryFn: async () => {
      const userResponse = await apiFetch<{ user: { fullName: string } }>('/api/users/me')
      const recruiterResponse = await apiFetch<{
        recruiter: {
          companyName: string
          companyMail: string
          companyUrl: string | null
          headquartersLocation: string | null
          jobTitle: string | null
          bio: string | null
          isComplete: boolean
        } | null
      }>('/api/recruiters/me')

      return {
        user: userResponse.user,
        recruiter: recruiterResponse.recruiter,
      }
    },
  })

  // Handle Query Error (401 -> redirect to /login)
  useEffect(() => {
    if (queryError) {
      if (queryError instanceof ApiError && queryError.status === 401) {
        router.push('/login')
      } else {
        console.error('Failed to load recruiter data:', queryError)
      }
    }
  }, [queryError, router])

  // Populate form on query success
  useEffect(() => {
    if (initialData) {
      if (initialData.recruiter?.isComplete) {
        router.push('/landing')
        return
      }

      const r = initialData.recruiter
      reset({
        fullName: initialData.user?.fullName || '',
        jobTitle: r?.jobTitle || '',
        companyName: r?.companyName || '',
        companyMail: r?.companyMail || '',
        companyUrl: r?.companyUrl || '',
        headquartersLocation: r?.headquartersLocation || '',
        bio: r?.bio || '',
      })
    }
  }, [initialData, reset, router])

  // Mutation using TanStack Query
  const patchMutation = useMutation({
    mutationFn: async (payload: Record<string, string | boolean>) => {
      return apiFetch<{ recruiter: { isComplete: boolean } }>('/api/recruiters/me', {
        method: 'PATCH',
        body: payload,
      })
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        router.push('/login')
        return
      }
      setErrorMsg(error instanceof ApiError ? error.message : 'Operation failed. Please try again.')
    },
  })

  const isSaving = patchMutation.isPending

  // Save Draft logic
  const saveDraft = async (showConfirmation = true) => {
    setErrorMsg('')
    const payload = getSanitizedPayload(getValues())

    try {
      await patchMutation.mutateAsync(payload)
      if (showConfirmation) {
        setDraftSaved(true)
        setTimeout(() => setDraftSaved(false), 2000)
      }
    } catch {
      // Error handled by mutation onError
    }
  }

  // Stepper navigation with safeParse validation
  const handleNext = async () => {
    const values = getValues()

    if (step === 1) {
      const validation = step1Schema.safeParse(values)
      if (!validation.success) {
        setStep1Error('Please fill in your full name and job title.')
        return
      }
      setStep1Error('')
      await saveDraft(false)
      setStep(2)
    } else if (step === 2) {
      const validation = step2Schema.safeParse(values)
      if (!validation.success) {
        setStep2Error('Please provide your company name and work email.')
        return
      }
      setStep2Error('')
      await saveDraft(false)
      setStep(3)
    } else if (step === 3) {
      const validation = finalSubmitSchema.safeParse(values)
      if (!validation.success) {
        setErrorMsg('Please complete all required fields.')
        return
      }
      setErrorMsg('')

      try {
        const payload = getSanitizedPayload(values, true)

        await patchMutation.mutateAsync(payload)
        setIsCompleted(true)

        await confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#00C26D', '#34D399', '#10B981', '#059669', '#3B82F6'],
        })

        router.push('/landing')
      } catch {
        // Error handled by mutation onError
      }
    }
  }

  const handleBack = () => {
    if (step === 1) {
      router.push('/role-select')
    } else {
      setStep((prev) => (prev - 1) as OnboardingStep)
    }
  }

  const formValues = watch()

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-bg-page text-text-main flex items-center justify-center font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-bg-page text-text-main flex flex-col justify-between overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] select-none selection:bg-brand/20 selection:text-text-main">
      {/* Top Navbar */}
      <header className="w-full z-20 shrink-0">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 py-3 sm:py-4 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-1.5 text-2xl tracking-tight cursor-pointer"
            onClick={() => router.push('/')}
          >
            <span className="font-extrabold text-brand">DK24</span>
            <span className="font-bold text-text-main">CareerLink</span>
          </div>
        </div>
      </header>

      {/* Main Container Card */}
      <main className="flex-1 w-full flex items-center justify-center px-4 sm:px-8 py-2 z-10 overflow-hidden">
        <div className="w-full max-w-[1240px] h-[550px] sm:h-[570px] lg:h-[580px] bg-card rounded-3xl sm:rounded-[32px] border border-border-subtle shadow-[0_12px_44px_-12px_rgba(0,0,0,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: HERO & RECRUITER TALENT SEARCH ILLUSTRATION */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 bg-gradient-to-b from-surface-hero-start to-surface-hero-end border-b lg:border-b-0 lg:border-r border-border-subtle/50 p-6 sm:p-8 lg:p-10 flex flex-col justify-between h-full relative overflow-hidden">
            {/* Top Illustration Scene */}
            <div className="w-full flex items-center justify-center py-4 select-none">
              <svg
                viewBox="0 0 380 260"
                className="w-full max-w-[340px] h-auto overflow-visible"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <filter id="recruiterShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow
                      dx="0"
                      dy="10"
                      stdDeviation="12"
                      floodColor="#0F172A"
                      floodOpacity="0.12"
                    />
                  </filter>
                  <linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#F8FAFC" />
                  </linearGradient>
                  <linearGradient id="laptopChassis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E2E8F0" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                  </linearGradient>
                  <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--brand-mint)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--brand-green)" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Ground plane shadow */}
                <ellipse cx="190" cy="228" rx="140" ry="10" fill="#0F172A" opacity="0.08" />

                {/* 3 Green Team Members / Candidate Silhouettes in Background */}
                <g id="candidate-silhouettes">
                  {/* Left Candidate (Soft mint green) */}
                  <g transform="translate(100, 110)">
                    <circle cx="0" cy="-28" r="22" fill="var(--brand-green-mint)" />
                    <path
                      d="M -30,22 C -30,0 -16,-12 0,-12 C 16,-12 30,0 30,22 Z"
                      fill="var(--brand-green-mint)"
                    />
                  </g>

                  {/* Right Candidate (Soft mint green) */}
                  <g transform="translate(260, 110)">
                    <circle cx="0" cy="-28" r="22" fill="var(--brand-green-mint)" />
                    <path
                      d="M -30,22 C -30,0 -16,-12 0,-12 C 16,-12 30,0 30,22 Z"
                      fill="var(--brand-green-mint)"
                    />
                  </g>

                  {/* Center Main Candidate (Vibrant emerald green) */}
                  <g transform="translate(180, 95)">
                    <circle cx="0" cy="-34" r="28" fill="var(--brand-green)" />
                    <path
                      d="M -40,32 C -40,4 -22,-16 0,-16 C 22,-16 40,4 40,32 Z"
                      fill="var(--brand-green)"
                    />
                  </g>

                  {/* Sparkles / Radiating Accents */}
                  <path
                    d="M 52,90 L 58,82 L 64,90 L 72,96 L 64,102 L 58,110 L 52,102 L 44,96 Z"
                    fill="var(--brand-green)"
                    opacity="0.85"
                    transform="scale(0.65) translate(30, 40)"
                  />
                  <path
                    d="M 50,75 Q 55,65 60,75"
                    stroke="var(--brand-green)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 38,88 Q 44,82 48,90"
                    stroke="var(--brand-green)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>

                {/* Laptop in Foreground with Candidate Search Screen */}
                <g id="recruiter-laptop" filter="url(#recruiterShadow)">
                  {/* Open Screen Body */}
                  <rect
                    x="85"
                    y="102"
                    width="190"
                    height="115"
                    rx="10"
                    fill="#1E293B"
                    stroke="var(--border-muted)"
                    strokeWidth="1.5"
                  />

                  {/* Inner Display Screen */}
                  <rect x="92" y="108" width="176" height="102" rx="6" fill="url(#screenGrad)" />

                  {/* Candidate Row 1 */}
                  <g transform="translate(102, 122)">
                    <circle cx="9" cy="9" r="8" fill="var(--brand-green)" />
                    <circle cx="9" cy="7" r="3.2" fill="#FFFFFF" />
                    <path d="M 4,14 C 4,11 6.5,10 9,10 C 11.5,10 14,14 Z" fill="#FFFFFF" />
                    <rect x="24" y="4" width="70" height="4" rx="2" fill="#94A3B8" />
                    <rect x="24" y="11" width="45" height="3" rx="1.5" fill="var(--border-muted)" />
                  </g>

                  {/* Candidate Row 2 */}
                  <g transform="translate(102, 147)">
                    <circle cx="9" cy="9" r="8" fill="var(--brand-green)" />
                    <circle cx="9" cy="7" r="3.2" fill="#FFFFFF" />
                    <path d="M 4,14 C 4,11 6.5,10 9,10 C 11.5,10 14,14 Z" fill="#FFFFFF" />
                    <rect x="24" y="4" width="80" height="4" rx="2" fill="#94A3B8" />
                    <rect x="24" y="11" width="55" height="3" rx="1.5" fill="var(--border-muted)" />
                  </g>

                  {/* Candidate Row 3 */}
                  <g transform="translate(102, 172)">
                    <circle cx="9" cy="9" r="8" fill="var(--brand-green)" />
                    <circle cx="9" cy="7" r="3.2" fill="#FFFFFF" />
                    <path d="M 4,14 C 4,11 6.5,10 9,10 C 11.5,10 14,14 Z" fill="#FFFFFF" />
                    <rect x="24" y="4" width="65" height="4" rx="2" fill="#94A3B8" />
                    <rect x="24" y="11" width="40" height="3" rx="1.5" fill="var(--border-muted)" />
                  </g>

                  {/* Magnifying Glass Over Candidate Search Screen */}
                  <g transform="translate(252, 168) rotate(35)">
                    {/* Glass Circle */}
                    <circle
                      cx="0"
                      cy="0"
                      r="26"
                      fill="url(#glassGrad)"
                      stroke="var(--brand-green)"
                      strokeWidth="5"
                    />
                    {/* Glass Specular Arc */}
                    <path
                      d="M -16,-12 A 20 20 0 0 1 12,-16"
                      stroke="#FFFFFF"
                      strokeWidth="2.8"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Handle */}
                    <path
                      d="M 0,26 L 0,46"
                      stroke="var(--brand-green)"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Laptop Base Keyboard Deck */}
                  <path
                    d="M 60,217 L 300,217 C 306,217 310,219 308,222 L 290,227 C 288,228 280,228 276,228 L 84,228 C 80,228 72,228 70,227 L 52,222 C 50,219 54,217 60,217 Z"
                    fill="url(#laptopChassis)"
                    stroke="#94A3B8"
                    strokeWidth="1"
                  />
                  {/* Base Trackpad Notch */}
                  <rect x="162" y="218" width="36" height="3" rx="1.5" fill="#94A3B8" />
                </g>
              </svg>
            </div>

            {/* Bottom Hero Text */}
            <div className="space-y-2 pt-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight leading-[1.2]">
                Build a stronger <br />
                team, <span className="text-brand">faster.</span>
              </h1>
              <p className="text-text-muted text-xs sm:text-sm font-medium leading-relaxed max-w-[340px]">
                Create your company profile and start discovering top talent on DK24 CareerLink.
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: MULTI-STEP WIZARD FORM */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between h-full">
            {/* Top Stepper Indicator */}
            <div className="w-full shrink-0 pb-3 border-b border-border-subtle/50">
              <div className="w-full flex items-start justify-between">
                {/* Step 1: About you */}
                <div
                  className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0"
                  onClick={() => setStep(1)}
                >
                  <div className={getStepCircleClass(step, 1)}>
                    {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                  </div>
                  <span className={getStepTextClass(step, 1)}>About you</span>
                </div>

                {/* Connector Line 1 -> 2 */}
                <div className="flex-1 h-[2px] bg-border-subtle mt-[16px] mx-1 sm:mx-2 relative overflow-hidden rounded-full">
                  <div
                    className="h-full bg-brand transition-all duration-400 ease-out"
                    style={{ width: step > 1 ? '100%' : '0%' }}
                  />
                </div>

                {/* Step 2: Company */}
                <div
                  className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0"
                  onClick={() => step > 1 && setStep(2)}
                >
                  <div className={getStepCircleClass(step, 2)}>
                    {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                  </div>
                  <span className={getStepTextClass(step, 2)}>Company</span>
                </div>

                {/* Connector Line 2 -> 3 */}
                <div className="flex-1 h-[2px] bg-border-subtle mt-[16px] mx-1 sm:mx-2 relative overflow-hidden rounded-full">
                  <div
                    className="h-full bg-brand transition-all duration-400 ease-out"
                    style={{ width: step > 2 ? '100%' : '0%' }}
                  />
                </div>

                {/* Step 3: Bio & review */}
                <div
                  className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0"
                  onClick={() => step > 2 && setStep(3)}
                >
                  <div className={getStepCircleClass(step, 3)}>
                    <span>3</span>
                  </div>
                  <span className={getStepTextClass(step, 3)}>Bio &amp; review</span>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div
                role="alert"
                className="my-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between"
              >
                <span>{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => setErrorMsg('')}
                  className="text-red-500 hover:text-red-800 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Draft saved confirmation */}
            {draftSaved && (
              <div className="my-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
                Draft saved successfully
              </div>
            )}

            {/* Step Form Content Body */}
            <div className="flex-1 flex flex-col justify-center overflow-hidden py-1">
              <AnimatePresence mode="wait">
                {/* ------------------------------------------------------------- */}
                {/* STEP 1: ABOUT YOU */}
                {/* ------------------------------------------------------------- */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3.5"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
                        About you
                      </h2>
                      <p className="text-xs text-text-muted font-medium mt-0.5">
                        Let&apos;s start with your basic information.
                      </p>
                    </div>

                    {step1Error && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                        {step1Error}
                      </div>
                    )}

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          {...register('fullName')}
                          placeholder="e.g. Alex Chen"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Job Title */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Job Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('jobTitle')}
                        placeholder="e.g. Senior Technical Recruiter"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card placeholder:text-slate-400"
                      />
                    </div>
                  </motion.div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* STEP 2: COMPANY */}
                {/* ------------------------------------------------------------- */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3.5"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
                        Company Details
                      </h2>
                      <p className="text-xs text-text-muted font-medium mt-0.5">
                        Tell us about the company you represent.
                      </p>
                    </div>

                    {step2Error && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                        {step2Error}
                      </div>
                    )}

                    {/* Company Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          {...register('companyName')}
                          placeholder="e.g. Acme Innovations Inc."
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Company Work Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Company Work Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="email"
                          {...register('companyMail')}
                          placeholder="recruiting@company.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card placeholder:text-slate-400"
                        />
                      </div>
                      <p className="text-[11px] text-text-muted mt-1">
                        Official corporate email for candidate correspondence and verification.
                      </p>
                    </div>

                    {/* Company Website URL */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Company Website URL
                      </label>
                      <div className="relative flex items-center">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="url"
                          {...register('companyUrl')}
                          placeholder="https://acme.example.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Headquarters Location */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Headquarters Location
                      </label>
                      <div className="relative flex items-center">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          {...register('headquartersLocation')}
                          placeholder="e.g. Bengaluru, India or San Francisco, CA"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* STEP 3: BIO & REVIEW */}
                {/* ------------------------------------------------------------- */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3.5"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
                        Bio &amp; Review
                      </h2>
                      <p className="text-xs text-text-muted font-medium mt-0.5">
                        Add a short bio and review your profile before completing.
                      </p>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Short Bio (Optional)
                      </label>
                      <textarea
                        rows={3}
                        {...register('bio')}
                        placeholder="Tell candidates a bit about your company culture and what you're looking for..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card resize-none placeholder:text-slate-400"
                      />
                    </div>

                    {/* Profile Summary */}
                    <div className="border-t border-border-subtle/50 pt-3 mt-2">
                      <h4 className="text-xs font-bold text-slate-800 mb-2">Profile Summary</h4>
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <p>
                          <span className="font-medium">Name:</span>{' '}
                          {formValues.fullName || 'Not provided'}
                        </p>
                        <p>
                          <span className="font-medium">Job Title:</span>{' '}
                          {formValues.jobTitle || 'Not provided'}
                        </p>
                        <p>
                          <span className="font-medium">Company:</span>{' '}
                          {formValues.companyName || 'Not provided'}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span>{' '}
                          {formValues.companyMail || 'Not provided'}
                        </p>
                        {formValues.companyUrl && (
                          <p>
                            <span className="font-medium">Website:</span> {formValues.companyUrl}
                          </p>
                        )}
                        {formValues.headquartersLocation && (
                          <p>
                            <span className="font-medium">Location:</span>{' '}
                            {formValues.headquartersLocation}
                          </p>
                        )}
                        {formValues.bio && (
                          <p>
                            <span className="font-medium">Bio:</span>{' '}
                            {formValues.bio.substring(0, 100)}
                            {formValues.bio.length > 100 ? '...' : ''}
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
              <button
                type="button"
                onClick={handleBack}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Save Draft Button */}
                <button
                  type="button"
                  onClick={() => saveDraft(true)}
                  disabled={isSaving || isCompleted}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-subtle hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Save Draft</span>
                </button>

                {/* Next / Complete Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSaving || isCompleted}
                  className="flex items-center gap-2 px-5 sm:px-6 py-2 rounded-xl bg-action-dark hover:bg-black text-white font-semibold text-xs sm:text-sm transition shadow-md hover:shadow-lg cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {step < 3 ? (
                    <>
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>{isCompleted ? 'Profile Created!' : 'Complete Setup'}</span>
                      {isCompleted ? (
                        <Sparkles className="w-4 h-4 text-brand-emerald" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

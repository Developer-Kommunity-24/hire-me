'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { RecruiterHero } from '@/components/onboarding/recruiter/recruiter-hero'
import { RecruiterOnboardingStepper } from '@/components/onboarding/recruiter/recruiter-onboarding-stepper'
import { StepAboutYou } from '@/components/onboarding/recruiter/step-about-you'
import { StepCompany } from '@/components/onboarding/recruiter/step-company'
import { StepBioReview } from '@/components/onboarding/recruiter/step-bio-review'
import { apiFetch } from '@/lib/api-client'
import { useAuth } from '@/lib/hooks/use-auth'
import { ONBOARDING_QUERY_KEYS, useCreateRecruiterProfile } from '@/lib/hooks/use-onboarding'
import { useRecruiterDraft } from '@/lib/hooks/use-recruiter-draft'
import {
  DEFAULT_RECRUITER_WIZARD_VALUES,
  FINAL_STEP,
  FIRST_STEP,
  recruiterWizardSchema,
  SECOND_STEP,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
  type RecruiterStepNumber,
  type RecruiterWizardInput,
} from '@/lib/schemas/recruiter-onboarding.schema'
import { showConfetti, ONBOARDING_REDIRECT_DELAY_MS } from '@/lib/utils/confetti'

const STEP_TRANSITION = { duration: 0.18 }
const STEP_ANIM_INITIAL = { opacity: 0, y: 6 }
const STEP_ANIM_ANIMATE = { opacity: 1, y: 0 }
const STEP_ANIM_EXIT = { opacity: 0, y: -6 }

export default function RecruiterOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<RecruiterStepNumber>(FIRST_STEP)
  const [isCompleted, setIsCompleted] = useState(false)

  const { user, isLoading: isAuthLoading } = useAuth()
  const createRecruiterMutation = useCreateRecruiterProfile()
  const { loadDraft, saveDraft, clearDraft } = useRecruiterDraft(user?.id)

  const hasHydratedRef = useRef(false)
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  // Check whether a recruiter profile already exists on the backend to avoid re-onboarding
  const { data: profileCheck, isLoading: isCheckingProfile } = useQuery({
    queryKey: [...ONBOARDING_QUERY_KEYS.recruiterProfileCheck, user?.id],
    queryFn: async () => {
      try {
        return await apiFetch<{ recruiter: unknown }>('/api/recruiters/me')
      } catch {
        // 404 (no profile yet), 401, or network errors keep the user on the wizard
        return null
      }
    },
    enabled: Boolean(user?.id),
    retry: false,
  })

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    reset,
    getFieldState,
    formState: { errors },
  } = useForm<RecruiterWizardInput>({
    resolver: zodResolver(recruiterWizardSchema),
    mode: 'onTouched',
    defaultValues: DEFAULT_RECRUITER_WIZARD_VALUES,
  })

  // Removed useWatch to avoid excessive re-renders

  // Redirect to landing only when a completed profile is confirmed by the server
  useEffect(() => {
    if (!isCompleted && !createRecruiterMutation.isPending && profileCheck?.recruiter) {
      router.replace('/landing')
    }
  }, [profileCheck, isCompleted, createRecruiterMutation.isPending, router])

  // Hydrate draft once user identity is resolved; draft always takes precedence over user name
  useEffect(() => {
    if (!user?.id) return

    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true
      const draft = loadDraft()
      if (draft?.values) {
        reset(draft.values)
        if (draft.step) {
          setStep(draft.step)
        }
      } else if (user.name) {
        setValue('fullName', user.name)
      }
    } else if (user.name) {
      // Late-arriving name only populates if user has not typed and field is not dirty
      const currentFullName = getValues('fullName')
      const isDirty = getFieldState('fullName').isDirty
      if (!currentFullName && !isDirty) {
        setValue('fullName', user.name)
      }
    }
  }, [user?.id, user?.name, loadDraft, reset, setValue, getValues, getFieldState])

  const onFinalSubmit = async (data: RecruiterWizardInput) => {
    try {
      // Forward only standard company fields accepted by main's backend schema
      await createRecruiterMutation.mutateAsync({
        companyName: data.companyName,
        companyMail: data.companyMail,
        companyUrl: data.companyUrl,
        headquartersLocation: data.headquartersLocation,
      })

      clearDraft()
      setIsCompleted(true)
      showConfetti()

      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/landing')
      }, ONBOARDING_REDIRECT_DELAY_MS)
    } catch {
      // Handled by mutation hook with sonner toast
    }
  }

  const handleNext = async () => {
    if (step === FIRST_STEP) {
      const isValid = await trigger(STEP_1_FIELDS)
      if (isValid) {
        saveDraft(SECOND_STEP, getValues(), false)
        setStep(SECOND_STEP)
      }
    } else if (step === SECOND_STEP) {
      const isValid = await trigger(STEP_2_FIELDS)
      if (isValid) {
        saveDraft(FINAL_STEP, getValues(), false)
        setStep(FINAL_STEP)
      }
    } else if (step === FINAL_STEP) {
      void handleSubmit(onFinalSubmit)()
    }
  }

  const handleBack = () => {
    if (step === FIRST_STEP) {
      router.push('/role-select')
    } else {
      setStep((prev) => (prev - 1) as RecruiterStepNumber)
    }
  }

  const handleStepClick = async (targetStep: RecruiterStepNumber) => {
    if (targetStep === step) return

    if (targetStep < step) {
      setStep(targetStep)
      return
    }

    if (targetStep === SECOND_STEP) {
      const isStep1Valid = await trigger(STEP_1_FIELDS)
      if (!isStep1Valid) {
        if (step !== FIRST_STEP) setStep(FIRST_STEP)
        return
      }
    } else if (targetStep === FINAL_STEP) {
      const isStep1Valid = await trigger(STEP_1_FIELDS)
      if (!isStep1Valid) {
        if (step !== FIRST_STEP) setStep(FIRST_STEP)
        return
      }

      const isStep2Valid = await trigger(STEP_2_FIELDS)
      if (!isStep2Valid) {
        if (step !== SECOND_STEP) {
          saveDraft(SECOND_STEP, getValues(), false)
          setStep(SECOND_STEP)
        }
        return
      }
    }

    saveDraft(targetStep, getValues(), false)
    setStep(targetStep)
  }

  const isSaving = createRecruiterMutation.isPending

  // Prevent flash of onboarding form while verifying profile status or during redirect
  if (
    !isCompleted &&
    !isSaving &&
    (isAuthLoading || (Boolean(user?.id) && isCheckingProfile) || Boolean(profileCheck?.recruiter))
  ) {
    return (
      <div className="h-screen w-screen bg-bg-page text-text-main flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-muted">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-bg-page text-text-main flex flex-col justify-between overflow-hidden font-sans select-none selection:bg-brand/20 selection:text-text-main">
      <header className="w-full z-20 shrink-0">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-3 sm:py-4 flex items-center justify-between">
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

      <main className="flex-1 w-full flex items-center justify-center px-4 sm:px-8 py-2 z-10 overflow-hidden">
        <div className="w-full max-w-6xl h-full max-h-[580px] bg-card rounded-3xl sm:rounded-2xl border border-border-subtle shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <RecruiterHero />

          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-9 flex flex-col justify-between h-full overflow-hidden">
            <RecruiterOnboardingStepper currentStep={step} onStepClick={handleStepClick} />

            <div className="flex-1 py-3 overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === FIRST_STEP && (
                  <motion.div
                    key="step-1"
                    initial={STEP_ANIM_INITIAL}
                    animate={STEP_ANIM_ANIMATE}
                    exit={STEP_ANIM_EXIT}
                    transition={STEP_TRANSITION}
                  >
                    <StepAboutYou register={register} errors={errors} />
                  </motion.div>
                )}

                {step === SECOND_STEP && (
                  <motion.div
                    key="step-2"
                    initial={STEP_ANIM_INITIAL}
                    animate={STEP_ANIM_ANIMATE}
                    exit={STEP_ANIM_EXIT}
                    transition={STEP_TRANSITION}
                  >
                    <StepCompany register={register} errors={errors} />
                  </motion.div>
                )}

                {step === FINAL_STEP && (
                  <motion.div
                    key="step-3"
                    initial={STEP_ANIM_INITIAL}
                    animate={STEP_ANIM_ANIMATE}
                    exit={STEP_ANIM_EXIT}
                    transition={STEP_TRANSITION}
                  >
                    <StepBioReview register={register} errors={errors} values={getValues()} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border-subtle/50 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={isSaving}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => saveDraft(step, getValues(), true)}
                  disabled={isSaving || isCompleted}
                >
                  <span>Save Draft</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  disabled={isSaving || isCompleted}
                >
                  {step < FINAL_STEP ? (
                    <>
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>{isCompleted ? 'Profile Created!' : 'Complete Setup'}</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

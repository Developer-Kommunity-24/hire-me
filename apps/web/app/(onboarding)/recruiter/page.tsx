'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Globe,
  Mail,
  MapPin,
  Search,
  Sparkles,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSaveRecruiterProfile } from '@/lib/hooks/use-onboarding'
import {
  recruiterOnboardingSchema,
  type RecruiterOnboardingInput,
} from '@/lib/schemas/recruiter-onboarding.schema'
import { showConfetti, ONBOARDING_REDIRECT_DELAY_MS } from '@/lib/utils/confetti'

export interface RecruiterProfileData {
  companyName: string
  companyMail: string
  companyUrl: string
  headquartersLocation: string
}

const DEFAULT_VALUES: RecruiterOnboardingInput = {
  companyName: '',
  companyMail: '',
  companyUrl: '',
  headquartersLocation: '',
}

export default function RecruiterOnboardingPage() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)

  const saveRecruiterMutation = useSaveRecruiterProfile()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecruiterOnboardingInput>({
    resolver: zodResolver(recruiterOnboardingSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const onSubmit = async (data: RecruiterOnboardingInput) => {
    setErrorMsg('')
    try {
      await saveRecruiterMutation.mutateAsync(data)
      setIsCompleted(true)
      showConfetti()

      setTimeout(() => {
        router.push('/landing')
      }, ONBOARDING_REDIRECT_DELAY_MS)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
      }
    }
  }

  const handleBack = () => {
    router.push('/role-select')
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
            {/* Top Illustration Scene using Lucide Icons */}
            <div className="w-full flex flex-col items-center justify-center py-6 select-none relative">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full max-w-[280px] mx-auto pointer-events-none" />

              {/* Hero Icon Card Showcase */}
              <div className="relative z-10 w-full max-w-[320px] bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200/60 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] space-y-3.5">
                {/* Candidate Row 1 */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="h-3 bg-slate-200 rounded-md w-3/4 animate-pulse" />
                    <div className="h-2 bg-slate-100 rounded-md w-1/2" />
                  </div>
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>

                {/* Candidate Row 2 */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="h-3 bg-slate-200 rounded-md w-4/5" />
                    <div className="h-2 bg-slate-100 rounded-md w-2/3" />
                  </div>
                </div>

                {/* Candidate Row 3 */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="h-3 bg-slate-200 rounded-md w-2/3" />
                    <div className="h-2 bg-slate-100 rounded-md w-1/3" />
                  </div>
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              </div>
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
          {/* RIGHT COLUMN: 4 FORM FIELDS (NO PROGRESS BAR) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between h-full">
            {/* Header: Title & Subtitle */}
            <div className="space-y-1 shrink-0 pb-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
                Company &amp; Recruiter Details
              </h2>
              <p className="text-xs sm:text-sm text-text-muted font-medium">
                Set up your verified company profile to start hiring talent from the DK24 network.
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="my-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
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

            {/* 4 Form Fields Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex-1 py-3 flex flex-col justify-center space-y-4"
            >
              {/* Field 1: Company Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                {errors.companyName && (
                  <p role="alert" className="text-xs font-medium text-rose-500 mt-1">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              {/* Field 2: Company Work Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                {errors.companyMail ? (
                  <p role="alert" className="text-xs font-medium text-rose-500 mt-1">
                    {errors.companyMail.message}
                  </p>
                ) : (
                  <p className="text-[11px] text-text-muted mt-1">
                    Official corporate email for candidate correspondence and verification.
                  </p>
                )}
              </div>

              {/* Field 3: Company Website URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                {errors.companyUrl && (
                  <p role="alert" className="text-xs font-medium text-rose-500 mt-1">
                    {errors.companyUrl.message}
                  </p>
                )}
              </div>

              {/* Field 4: Headquarters Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                {errors.headquartersLocation && (
                  <p role="alert" className="text-xs font-medium text-rose-500 mt-1">
                    {errors.headquartersLocation.message}
                  </p>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-border-subtle/60 mt-3 shrink-0">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition cursor-pointer active:scale-[0.98]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                {/* Complete Setup Button */}
                <button
                  type="submit"
                  disabled={isCompleted || saveRecruiterMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-action-dark hover:bg-black text-white font-semibold text-xs sm:text-sm transition shadow-md hover:shadow-lg cursor-pointer active:scale-[0.98] disabled:opacity-70"
                >
                  <span>{isCompleted ? 'Profile Created!' : 'Complete Setup'}</span>
                  {isCompleted ? (
                    <Sparkles className="w-4 h-4 text-brand-emerald" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

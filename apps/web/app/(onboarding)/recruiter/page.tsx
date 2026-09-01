'use client'

import { ArrowLeft, ArrowRight, Building2, Globe, Mail, MapPin, Sparkles, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import confetti from 'canvas-confetti'

export interface RecruiterProfileData {
  companyName: string
  companyMail: string
  companyUrl: string
  headquartersLocation: string
}

export default function RecruiterOnboardingPage() {
  const router = useRouter()
  const REDIRECT_INTERVAL_IN_MS = 1400
  const [companyName, setCompanyName] = useState('')
  const [companyMail, setCompanyMail] = useState('')
  const [companyUrl, setCompanyUrl] = useState('')
  const [headquartersLocation, setHeadquartersLocation] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!companyName.trim()) {
      setErrorMsg('Please enter your company name.')
      return
    }

    if (!companyMail.trim()) {
      setErrorMsg('Please enter your company work email.')
      return
    }

    setErrorMsg('')

    const recruiterProfile: RecruiterProfileData = {
      companyName: companyName.trim(),
      companyMail: companyMail.trim(),
      companyUrl: companyUrl.trim(),
      headquartersLocation: headquartersLocation.trim(),
    }

    localStorage.setItem('recruiter_profile', JSON.stringify(recruiterProfile))
    localStorage.setItem('user_role', 'recruiter')
    setIsCompleted(true)

    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#00C26D', '#34D399', '#10B981', '#059669', '#3B82F6'],
      })
    } catch {
      // Confetti fallback
    }

    setTimeout(() => {
      router.push('/dashboard/recruiter')
    }, REDIRECT_INTERVAL_IN_MS)
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
                    <path d="M 4,14 C 4,11 6.5,10 9,10 C 11.5,10 14,11 14,14 Z" fill="#FFFFFF" />
                    <rect x="24" y="4" width="70" height="4" rx="2" fill="#94A3B8" />
                    <rect x="24" y="11" width="45" height="3" rx="1.5" fill="var(--border-muted)" />
                  </g>

                  {/* Candidate Row 2 */}
                  <g transform="translate(102, 147)">
                    <circle cx="9" cy="9" r="8" fill="var(--brand-green)" />
                    <circle cx="9" cy="7" r="3.2" fill="#FFFFFF" />
                    <path d="M 4,14 C 4,11 6.5,10 9,10 C 11.5,10 14,14 14,14 Z" fill="#FFFFFF" />
                    <rect x="24" y="4" width="80" height="4" rx="2" fill="#94A3B8" />
                    <rect x="24" y="11" width="55" height="3" rx="1.5" fill="var(--border-muted)" />
                  </g>

                  {/* Candidate Row 3 */}
                  <g transform="translate(102, 172)">
                    <circle cx="9" cy="9" r="8" fill="var(--brand-green)" />
                    <circle cx="9" cy="7" r="3.2" fill="#FFFFFF" />
                    <path d="M 4,14 C 4,11 6.5,10 9,10 C 11.5,10 14,14 14,14 Z" fill="#FFFFFF" />
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
              onSubmit={handleSubmit}
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
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Innovations Inc."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card placeholder:text-slate-400"
                  />
                </div>
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
                    required
                    value={companyMail}
                    onChange={(e) => setCompanyMail(e.target.value)}
                    placeholder="recruiting@company.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[11px] text-text-muted mt-1">
                  Official corporate email for candidate correspondence and verification.
                </p>
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
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    placeholder="https://acme.example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card placeholder:text-slate-400"
                  />
                </div>
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
                    value={headquartersLocation}
                    onChange={(e) => setHeadquartersLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, India or San Francisco, CA"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card placeholder:text-slate-400"
                  />
                </div>
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
                  disabled={isCompleted}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-action-dark hover:bg-black text-white font-semibold text-xs sm:text-sm transition shadow-md hover:shadow-lg cursor-pointer active:scale-[0.98]"
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

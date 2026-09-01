'use client'

import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, FileText, Globe, Plus, Sparkles, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type MouseEvent } from 'react'

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

function LinkedinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}

export default function StudentOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [isCompleted, setIsCompleted] = useState(false)

  // Step 1: Basic Details
  const [fullName, setFullName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [step1Error, setStep1Error] = useState('')

  // Step 2: Education
  const [school, setSchool] = useState('')
  const [degree, setDegree] = useState('')
  const [graduationYear, setGraduationYear] = useState('2026')
  const [gpa, setGpa] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [step2Error, setStep2Error] = useState('')

  // Step 3: Skills & Experience
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Next.js', 'Tailwind CSS'])
  const [newSkillInput, setNewSkillInput] = useState('')
  const [experienceRole, setExperienceRole] = useState('')
  const [experienceCompany, setExperienceCompany] = useState('')
  const [experienceSummary, setExperienceSummary] = useState('')

  // Step 4: Links & Finish
  const [githubUrl, setGithubUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')

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
    const interval = setInterval(
      () => {
        setBlink(true)
        setTimeout(() => setBlink(false), 140)
      },
      3200 + Math.random() * 2600,
    )
    return () => clearInterval(interval)
  }, [])

  // Skills handlers
  const handleAddSkill = (skillToAdd?: string) => {
    const target = (skillToAdd || newSkillInput).trim()
    if (!target) return
    if (!skills.includes(target)) {
      setSkills([...skills, target])
    }
    setNewSkillInput('')
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove))
  }

  // Stepper navigation
  const handleNext = () => {
    if (step === 1) {
      if (!fullName.trim() || !headline.trim()) {
        setStep1Error('Please fill in your full name and headline.')
        return
      }
      setStep1Error('')
      setStep(2)
    } else if (step === 2) {
      if (!school.trim() || !degree.trim()) {
        setStep2Error('Please provide your School/University and Degree.')
        return
      }
      setStep2Error('')
      setStep(3)
    } else if (step === 3) {
      setStep(4)
    } else if (step === 4) {
      const studentProfile = {
        name: fullName.trim(),
        headline,
        bio,
        school,
        degree,
        graduationYear,
        gpa,
        specialization,
        skills,
        experienceRole,
        experienceCompany,
        experienceSummary,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
        resumeUrl,
      }
      localStorage.setItem('student_profile', JSON.stringify(studentProfile))
      setIsCompleted(true)
      setTimeout(() => {
        router.push('/student')
      }, 1200)
    }
  }

  const handleBack = () => {
    if (step === 1) {
      router.push('/role-select')
    } else {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)
    }
  }

  const gradYearOptions = ['2024', '2025', '2026', '2027', '2028', '2029', '2030']
  const popularSkills = ['Python', 'JavaScript', 'Node.js', 'SQL', 'Docker', 'Git', 'Java']

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="h-screen w-screen bg-bg-page text-text-main flex flex-col justify-between overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] select-none selection:bg-brand/20 selection:text-text-main"
    >
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

      {/* Main Container Fixed-Height Card */}
      <main className="flex-1 w-full flex items-center justify-center px-4 sm:px-8 py-2 z-10 overflow-hidden">
        <div className="w-full max-w-[1240px] h-[550px] sm:h-[570px] lg:h-[580px] bg-card rounded-3xl sm:rounded-[32px] border border-border-subtle shadow-[0_12px_44px_-12px_rgba(0,0,0,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: HERO & 3D STUDENT WITH LAPTOP (Fixed Height) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 bg-gradient-to-b from-surface-hero-start to-surface-hero-end border-b lg:border-b-0 lg:border-r border-border-subtle/50 p-6 sm:p-8 lg:p-9 flex flex-col justify-between h-full relative overflow-hidden">
            {/* Top Content */}
            <div className="space-y-4 z-10">
              {/* Title & Subtitle */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight leading-[1.2]">
                  Let&apos;s build your <br />
                  <span className="text-brand inline-flex items-center gap-1.5">
                    career profile
                  </span>
                </h1>
                <p className="text-text-muted text-xs sm:text-sm font-medium leading-relaxed mt-2 max-w-[360px]">
                  A complete profile helps recruiters discover you and gives you better
                  opportunities.
                </p>
              </div>
            </div>

            {/* Bottom 3D Scene: Student Character with Laptop */}
            <div className="relative w-full flex-1 min-h-[220px] max-h-[340px] flex items-center justify-center select-none py-1">
              <svg
                viewBox="35 65 310 195"
                className="w-full h-full max-h-[320px] overflow-visible drop-shadow-sm"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow
                      dx="0"
                      dy="8"
                      stdDeviation="12"
                      floodColor="#0F172A"
                      floodOpacity="0.12"
                    />
                  </filter>
                  <filter id="badgeShadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow
                      dx="0"
                      dy="4"
                      stdDeviation="5"
                      floodColor="#0F172A"
                      floodOpacity="0.1"
                    />
                  </filter>
                  <filter id="laptopShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow
                      dx="0"
                      dy="10"
                      stdDeviation="8"
                      floodColor="#0F172A"
                      floodOpacity="0.13"
                    />
                  </filter>

                  <radialGradient id="greenClaySphere" cx="35%" cy="30%" r="68%">
                    <stop offset="0%" stopColor="var(--clay-sphere-start)" />
                    <stop offset="28%" stopColor="var(--brand-green)" />
                    <stop offset="70%" stopColor="var(--clay-sphere-mid2)" />
                    <stop offset="90%" stopColor="var(--clay-sphere-dark)" />
                    <stop offset="100%" stopColor="var(--clay-sphere-end)" />
                  </radialGradient>

                  <linearGradient id="capTop" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#333A44" />
                    <stop offset="50%" stopColor="#22272E" />
                    <stop offset="100%" stopColor="#14181F" />
                  </linearGradient>
                  <linearGradient id="capBevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#181D24" />
                    <stop offset="100%" stopColor="#0D1015" />
                  </linearGradient>

                  <linearGradient id="laptopLid" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F1F5F9" />
                    <stop offset="50%" stopColor="#E2E8F0" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                  </linearGradient>
                  <linearGradient id="laptopBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E2E8F0" />
                    <stop offset="100%" stopColor="#94A3B8" />
                  </linearGradient>
                </defs>

                {/* Ground Shadow */}
                <ellipse cx="200" cy="245" rx="130" ry="10" fill="#0F172A" opacity="0.07" />

                {/* 3D Student Character */}
                <g transform="translate(130, 165)">
                  <circle
                    cx="0"
                    cy="0"
                    r="62"
                    fill="url(#greenClaySphere)"
                    filter="url(#clayShadow)"
                  />

                  {/* Graduation Cap */}
                  <g transform="translate(-22, -60) rotate(-16)">
                    <path
                      d="M -24,10 C -24,-2 24,-2 24,10 C 24,18 -24,18 -24,10 Z"
                      fill="#12161D"
                    />
                    <polygon points="-52,0 -52,5 0,22 52,5 52,0 0,17" fill="url(#capBevel)" />
                    <polygon
                      points="-52,0 0,-18 52,0 0,17"
                      fill="url(#capTop)"
                      stroke="#14181F"
                      strokeWidth="1"
                    />
                    <ellipse cx="0" cy="0" rx="3.5" ry="2.5" fill="#10141A" />
                    <path
                      d="M 0,0 C -28,10 -38,22 -40,42"
                      stroke="var(--brand-green)"
                      strokeWidth="2.8"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <ellipse cx="-40" cy="42" rx="3.5" ry="3" fill="var(--clay-sphere-mid2)" />
                    <path d="M -44,43 C -44,56 -36,56 -36,43 Z" fill="var(--brand-green)" />
                  </g>

                  {/* Left Eye */}
                  <g transform="translate(-8, -4) rotate(-3)">
                    <ellipse cx="0" cy="0" rx="13" ry="12" fill="#FFFFFF" />
                    <motion.circle
                      cx={mousePos.x * 3 + 1.5}
                      cy={mousePos.y * 2 + 3.5}
                      r={5}
                      fill="#1A202C"
                      animate={{ scaleY: blink ? 0.1 : 1 }}
                      transition={{ duration: 0.1 }}
                    />
                    {!blink && (
                      <circle
                        cx={mousePos.x * 1.8}
                        cy={mousePos.y * 1.8 + 1.8}
                        r="1.8"
                        fill="#FFFFFF"
                      />
                    )}
                  </g>

                  {/* Right Eye */}
                  <g transform="translate(22, -8) rotate(3)">
                    <ellipse cx="0" cy="0" rx="13" ry="12" fill="#FFFFFF" />
                    <motion.circle
                      cx={mousePos.x * 3 + 1.5}
                      cy={mousePos.y * 2 + 3.5}
                      r={5}
                      fill="#1A202C"
                      animate={{ scaleY: blink ? 0.1 : 1 }}
                      transition={{ duration: 0.1 }}
                    />
                    {!blink && (
                      <circle
                        cx={mousePos.x * 1.8}
                        cy={mousePos.y * 1.8 + 1.8}
                        r="1.8"
                        fill="#FFFFFF"
                      />
                    )}
                  </g>

                  {/* Smile */}
                  <g transform="translate(8, 14)">
                    <path d="M -10,-2 Q 0,12 10,-2 Q 0,3 -10,-2 Z" fill="#1A202C" />
                  </g>
                </g>

                {/* 3D Laptop */}
                <g transform="translate(195, 180)" filter="url(#laptopShadow)">
                  <polygon
                    points="0,32 14,-32 96,-32 82,32"
                    fill="url(#laptopLid)"
                    stroke="#CBD5E1"
                    strokeWidth="1.2"
                  />
                  <polygon points="4,30 16,-28 92,-28 80,30" fill="#1E293B" />
                  <line
                    x1="25"
                    y1="-14"
                    x2="74"
                    y2="-14"
                    stroke="var(--brand-green)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="22"
                    y1="-5"
                    x2="65"
                    y2="-5"
                    stroke="#38BDF8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <line
                    x1="20"
                    y1="4"
                    x2="55"
                    y2="4"
                    stroke="#818CF8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <polygon
                    points="-12,42 0,32 82,32 100,42"
                    fill="url(#laptopBase)"
                    stroke="#94A3B8"
                    strokeWidth="1.2"
                  />
                  <polygon points="32,39 36,35 58,35 55,39" fill="#CBD5E1" />
                </g>
              </svg>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: MULTI-STEP WIZARD FORM (Fixed Height, No Scrolling) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-9 flex flex-col justify-between h-full overflow-hidden">
            {/* Top Stepper Indicator */}
            <div className="w-full shrink-0 pb-3 border-b border-border-subtle/50">
              <div className="w-full flex items-start justify-between">
                {/* Step 1: Basic Info */}
                <div
                  className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0"
                  onClick={() => setStep(1)}
                >
                  <div
                    className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step > 1
                        ? 'bg-brand text-white shadow-xs'
                        : step === 1
                          ? 'bg-brand text-white shadow-[0_0_0_5px_var(--brand-green-glow)]'
                          : 'bg-card border-2 border-border-subtle text-text-muted group-hover:border-slate-300'
                    }`}
                  >
                    {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                  </div>
                  <span
                    className={`text-[11px] whitespace-nowrap transition-colors ${
                      step === 1
                        ? 'font-bold text-brand'
                        : step > 1
                          ? 'font-semibold text-slate-700'
                          : 'font-medium text-text-muted'
                    }`}
                  >
                    Basic Info
                  </span>
                </div>

                {/* Connector Line 1 -> 2 */}
                <div className="flex-1 h-[2px] bg-border-subtle mt-[16px] mx-1 sm:mx-2 relative overflow-hidden rounded-full">
                  <div
                    className="h-full bg-brand transition-all duration-400 ease-out"
                    style={{ width: step > 1 ? '100%' : '0%' }}
                  />
                </div>

                {/* Step 2: Education */}
                <div
                  className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0"
                  onClick={() => step > 1 && setStep(2)}
                >
                  <div
                    className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step > 2
                        ? 'bg-brand text-white shadow-xs'
                        : step === 2
                          ? 'bg-brand text-white shadow-[0_0_0_5px_var(--brand-green-glow)]'
                          : 'bg-card border-2 border-border-subtle text-text-muted group-hover:border-slate-300'
                    }`}
                  >
                    {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                  </div>
                  <span
                    className={`text-[11px] whitespace-nowrap transition-colors ${
                      step === 2
                        ? 'font-bold text-brand'
                        : step > 2
                          ? 'font-semibold text-slate-700'
                          : 'font-medium text-text-muted'
                    }`}
                  >
                    Education
                  </span>
                </div>

                {/* Connector Line 2 -> 3 */}
                <div className="flex-1 h-[2px] bg-border-subtle mt-[16px] mx-1 sm:mx-2 relative overflow-hidden rounded-full">
                  <div
                    className="h-full bg-brand transition-all duration-400 ease-out"
                    style={{ width: step > 2 ? '100%' : '0%' }}
                  />
                </div>

                {/* Step 3: Skills & Exp */}
                <div
                  className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0"
                  onClick={() => step > 2 && setStep(3)}
                >
                  <div
                    className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step > 3
                        ? 'bg-brand text-white shadow-xs'
                        : step === 3
                          ? 'bg-brand text-white shadow-[0_0_0_5px_var(--brand-green-glow)]'
                          : 'bg-card border-2 border-border-subtle text-text-muted group-hover:border-slate-300'
                    }`}
                  >
                    {step > 3 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
                  </div>
                  <span
                    className={`text-[11px] whitespace-nowrap transition-colors ${
                      step === 3
                        ? 'font-bold text-brand'
                        : step > 3
                          ? 'font-semibold text-slate-700'
                          : 'font-medium text-text-muted'
                    }`}
                  >
                    Skills &amp; Exp
                  </span>
                </div>

                {/* Connector Line 3 -> 4 */}
                <div className="flex-1 h-[2px] bg-border-subtle mt-[16px] mx-1 sm:mx-2 relative overflow-hidden rounded-full">
                  <div
                    className="h-full bg-brand transition-all duration-400 ease-out"
                    style={{ width: step > 3 ? '100%' : '0%' }}
                  />
                </div>

                {/* Step 4: Links & Finish */}
                <div
                  className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0"
                  onClick={() => step > 3 && setStep(4)}
                >
                  <div
                    className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step === 4
                        ? 'bg-brand text-white shadow-[0_0_0_5px_var(--brand-green-glow)]'
                        : 'bg-card border-2 border-border-subtle text-text-muted'
                    }`}
                  >
                    <span>4</span>
                  </div>
                  <span
                    className={`text-[11px] whitespace-nowrap transition-colors ${
                      step === 4 ? 'font-bold text-brand' : 'font-medium text-text-muted'
                    }`}
                  >
                    Links &amp; Finish
                  </span>
                </div>
              </div>
            </div>

            {/* Step Form Content Body (Fixed Area, perfectly fitted) */}
            <div className="flex-1 flex flex-col justify-center overflow-hidden py-1">
              <AnimatePresence mode="wait">
                {/* ------------------------------------------------------------- */}
                {/* STEP 1: BASIC DETAILS */}
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
                        Basic Details
                      </h2>
                      <p className="text-xs text-text-muted font-medium mt-0.5">
                        Start with the basics. You can update these anytime.
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
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alex Chen"
                        className="w-full px-3.5 py-2 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card"
                      />
                    </div>

                    {/* Headline */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-800">
                          Headline <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[11px] text-text-muted font-mono">
                          {headline.length}/80
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={80}
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g. CS Student | Full-Stack Developer | Open to Internships"
                        className="w-full px-3.5 py-2 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card"
                      />
                    </div>

                    {/* Bio / Summary */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-800">Bio / Summary</label>
                        <span className="text-[11px] text-text-muted font-mono">
                          {bio.length}/300
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={300}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell recruiters a bit about yourself, your interests, and goals..."
                        className="w-full px-3.5 py-2 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* STEP 2: EDUCATION */}
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
                        Education
                      </h2>
                      <p className="text-xs text-text-muted font-medium mt-0.5">
                        Where are you studying or what is your academic background?
                      </p>
                    </div>

                    {step2Error && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                        {step2Error}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          School / University <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                          placeholder="e.g. Stanford University or MIT"
                          className="w-full px-3.5 py-2 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Degree &amp; Major <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={degree}
                            onChange={(e) => setDegree(e.target.value)}
                            placeholder="e.g. B.S. Computer Science"
                            className="w-full px-3.5 py-2 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Graduation Year <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={graduationYear}
                            onChange={(e) => setGraduationYear(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card cursor-pointer"
                          >
                            {gradYearOptions.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            GPA (Optional)
                          </label>
                          <input
                            type="text"
                            value={gpa}
                            onChange={(e) => setGpa(e.target.value)}
                            placeholder="e.g. 3.8 / 4.0"
                            className="w-full px-3.5 py-2 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Specialization (Optional)
                          </label>
                          <input
                            type="text"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            placeholder="e.g. AI / Machine Learning"
                            className="w-full px-3.5 py-2 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* STEP 3: SKILLS & EXPERIENCE */}
                {/* ------------------------------------------------------------- */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
                        Skills &amp; Experience
                      </h2>
                      <p className="text-xs text-text-muted font-medium mt-0.5">
                        Showcase your technical superpowers and past work or projects.
                      </p>
                    </div>

                    {/* Skills Input & Badges */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-800">
                        Technical Skills
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSkillInput}
                          onChange={(e) => setNewSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddSkill()
                            }
                          }}
                          placeholder="Type a skill and press Enter..."
                          className="flex-1 px-3.5 py-2 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSkill()}
                          className="px-3.5 py-2 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>

                      {/* Added Skills Badges */}
                      <div className="flex flex-wrap gap-1.5 max-h-[58px] overflow-hidden">
                        {skills.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-light text-brand-dark text-xs font-bold border border-brand/20 shadow-2xs"
                          >
                            {s}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(s)}
                              className="hover:text-red-500 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Quick Add Suggestions */}
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <span className="text-[11px] font-medium text-text-muted mr-1">
                          Popular:
                        </span>
                        {popularSkills
                          .filter((s) => !skills.includes(s))
                          .slice(0, 5)
                          .map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => handleAddSkill(suggestion)}
                              className="text-[10px] font-medium bg-slate-100 hover:bg-brand-light hover:text-brand-hover text-slate-600 px-2 py-0.5 rounded-md transition cursor-pointer"
                            >
                              + {suggestion}
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Past Experience */}
                    <div className="border-t border-border-subtle/50 pt-2.5 space-y-2">
                      <h4 className="text-xs font-bold text-slate-800">
                        Experience / Internships (Optional)
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          value={experienceRole}
                          onChange={(e) => setExperienceRole(e.target.value)}
                          placeholder="Role (e.g. Frontend Intern)"
                          className="w-full px-3 py-1.5 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs transition bg-card"
                        />
                        <input
                          type="text"
                          value={experienceCompany}
                          onChange={(e) => setExperienceCompany(e.target.value)}
                          placeholder="Company (e.g. DK24 Labs)"
                          className="w-full px-3 py-1.5 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs transition bg-card"
                        />
                      </div>

                      <input
                        type="text"
                        value={experienceSummary}
                        onChange={(e) => setExperienceSummary(e.target.value)}
                        placeholder="Brief summary of achievements or projects..."
                        className="w-full px-3 py-1.5 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs transition bg-card"
                      />
                    </div>
                  </motion.div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* STEP 4: LINKS & FINISH */}
                {/* ------------------------------------------------------------- */}
                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3.5"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
                        Links &amp; Finish
                      </h2>
                      <p className="text-xs text-text-muted font-medium mt-0.5">
                        Connect your online profiles so verified recruiters can check your work.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {/* GitHub */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          GitHub Profile URL
                        </label>
                        <div className="relative flex items-center">
                          <GithubIcon className="w-4 h-4 text-slate-400 absolute left-3" />
                          <input
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/yourusername"
                            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card"
                          />
                        </div>
                      </div>

                      {/* LinkedIn */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          LinkedIn Profile URL
                        </label>
                        <div className="relative flex items-center">
                          <LinkedinIcon className="w-4 h-4 text-linkedin absolute left-3" />
                          <input
                            type="url"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            placeholder="https://linkedin.com/in/yourusername"
                            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card"
                          />
                        </div>
                      </div>

                      {/* Portfolio */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Portfolio / Website (Optional)
                        </label>
                        <div className="relative flex items-center">
                          <Globe className="w-4 h-4 text-slate-400 absolute left-3" />
                          <input
                            type="url"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                            placeholder="https://yourportfolio.dev"
                            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card"
                          />
                        </div>
                      </div>

                      {/* Resume */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Resume / CV Link (Optional)
                        </label>
                        <div className="relative flex items-center">
                          <FileText className="w-4 h-4 text-slate-400 absolute left-3" />
                          <input
                            type="url"
                            value={resumeUrl}
                            onChange={(e) => setResumeUrl(e.target.value)}
                            placeholder="https://drive.google.com/... or resume URL"
                            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-xs sm:text-sm transition bg-card"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Actions Bar (Fixed at bottom of right column) */}
            <div className="flex items-center justify-between pt-3 border-t border-border-subtle/50 shrink-0">
              {/* Back Button */}
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition cursor-pointer active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {/* Next / Complete Button */}
              <button
                type="button"
                onClick={handleNext}
                disabled={isCompleted}
                className="flex items-center gap-2 px-5 sm:px-6 py-2 rounded-xl bg-action-dark hover:bg-black text-white font-semibold text-xs sm:text-sm transition shadow-md hover:shadow-lg cursor-pointer active:scale-[0.98]"
              >
                {step < 4 ? (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>{isCompleted ? 'Profile Created!' : 'Finish Setup'}</span>
                    <Sparkles className="w-4 h-4 text-brand-emerald" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

'use client'

import { motion } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { ApiError, apiFetch } from '@/lib/api-client'

export default function RoleSelectPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'student' | 'recruiter' | null>(null)
  const [hoveredRole, setHoveredRole] = useState<'student' | 'recruiter' | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [blink, setBlink] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Track mouse coordinates for interactive eye tracking
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    setMousePos({ x, y })
  }

  // Periodic blinking
  useEffect(() => {
    const interval = setInterval(
      () => {
        setBlink(true)
        setTimeout(() => setBlink(false), 140)
      },
      3000 + Math.random() * 2500,
    )
    return () => clearInterval(interval)
  }, [])

  /**
   * Persists the chosen role, then moves on to the matching dashboard.
   *
   * The role is authorization state, so it lives in Postgres rather than
   * `localStorage` — navigation only happens once the API confirms the write.
   */
  const handleSelect = async (role: 'student' | 'recruiter') => {
    if (isSaving) return

    setSelectedRole(role)
    setIsSaving(true)
    setErrorMsg('')

    try {
      await apiFetch('/api/users/me/role', { method: 'PATCH', body: { role } })
    } catch (error) {
      // An expired session cannot be recovered here — send them back to sign in.
      if (error instanceof ApiError && error.status === 401) {
        router.push('/login')
        return
      }

      setSelectedRole(null)
      setIsSaving(false)
      setErrorMsg(
        error instanceof ApiError
          ? error.message
          : 'Could not save your role. Check your connection and try again.',
      )
      return
    }

    router.push(role === 'student' ? '/student' : '/recruiter')
  }

  // Calculate eye gaze vector
  const getGaze = () => {
    if (hoveredRole === 'student') return { x: -0.8, y: -0.1 }
    if (hoveredRole === 'recruiter') return { x: 0.8, y: -0.1 }
    if (selectedRole === 'student') return { x: -0.6, y: -0.2 }
    if (selectedRole === 'recruiter') return { x: 0.6, y: -0.2 }
    return {
      x: Math.max(-1, Math.min(1, mousePos.x)),
      y: Math.max(-1, Math.min(1, mousePos.y)),
    }
  }

  const gaze = getGaze()

  return (
    <main
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full bg-card flex flex-col justify-between select-none font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden"
    >
      {/* Top Header */}
      <header className="w-full z-20">
        <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 pt-6 sm:pt-8 pb-3 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-1 text-2xl sm:text-3xl tracking-tight cursor-pointer"
            onClick={() => router.push('/')}
          >
            <span className="font-extrabold text-brand">DK24</span>
            <span className="font-bold text-text-main">CareerLink</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex items-center justify-center px-6 sm:px-12 md:px-16 lg:px-20 py-4 sm:py-8 z-10">
        <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-24 items-center justify-between">
          {/* Left Column: Role Selection */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center max-w-[620px]">
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl md:text-[54px] font-extrabold text-text-main tracking-tight leading-[1.12]">
                Welcome! <span className="inline-block animate-wave origin-bottom-right">👋</span>
                <br />
                Choose <span className="text-brand">your role</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed pt-2">
                Select the option that best describes you.
                <br />
                You can always change this later.
              </p>
            </div>

            {/* Role Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mt-8 sm:mt-10">
              {/* Card 1: Student */}
              <button
                type="button"
                id="role-student-btn"
                onClick={() => void handleSelect('student')}
                disabled={isSaving}
                onMouseEnter={() => setHoveredRole('student')}
                onMouseLeave={() => setHoveredRole(null)}
                className={`group relative rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center transition-all duration-300 cursor-pointer select-none bg-card border ${
                  selectedRole === 'student'
                    ? 'border-brand ring-4 ring-brand/15 shadow-xl scale-[1.02]'
                    : hoveredRole === 'student'
                      ? 'border-emerald-200 shadow-xl -translate-y-1'
                      : 'border-slate-100 shadow-[0_6px_30px_-6px_rgba(0,0,0,0.05)] hover:border-slate-200'
                }`}
              >
                {/* 3D Student Badge Icon */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-brand-light flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105">
                  <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none">
                    <path
                      d="M32 14L8 25L32 36L56 25L32 14Z"
                      fill="var(--brand-green)"
                      filter="drop-shadow(0 4px 6px rgba(0,194,109,0.3))"
                    />
                    <path d="M32 14L56 25L32 36L8 25L32 14Z" fill="url(#capGradIcon)" />
                    <path
                      d="M18 31V43C18 43 23 48 32 48C41 48 46 43 46 43V31L32 37.5L18 31Z"
                      fill="var(--brand-green-dark)"
                    />
                    <path
                      d="M48 28.5V44C48 44 49 48 46 49.5"
                      stroke="var(--brand-green)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="46" cy="49.5" r="2.5" fill="var(--brand-green-dark)" />
                    <defs>
                      <linearGradient
                        id="capGradIcon"
                        x1="8"
                        y1="14"
                        x2="56"
                        y2="36"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#10D77D" />
                        <stop offset="1" stopColor="var(--brand-green-hover)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Role Name */}
                <h3 className="text-lg sm:text-xl font-bold text-text-main tracking-tight">
                  I&apos;m a Student
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed min-h-[48px]">
                  Find opportunities, showcase your skills, and connect with top companies.
                </p>

                {/* Arrow Action Button */}
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center mt-5 transition-all duration-300 ${
                    selectedRole === 'student' || hoveredRole === 'student'
                      ? 'bg-brand text-white shadow-md shadow-brand/30 scale-105'
                      : 'bg-emerald-50 text-brand border border-emerald-100/80'
                  }`}
                >
                  {selectedRole === 'student' ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                  )}
                </div>
              </button>

              {/* Card 2: Recruiter */}
              <button
                type="button"
                id="role-recruiter-btn"
                onClick={() => void handleSelect('recruiter')}
                disabled={isSaving}
                onMouseEnter={() => setHoveredRole('recruiter')}
                onMouseLeave={() => setHoveredRole(null)}
                className={`group relative rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center transition-all duration-300 cursor-pointer select-none bg-card border ${
                  selectedRole === 'recruiter'
                    ? 'border-recruiter ring-4 ring-recruiter/15 shadow-xl scale-[1.02]'
                    : hoveredRole === 'recruiter'
                      ? 'border-purple-200 shadow-xl -translate-y-1'
                      : 'border-slate-100 shadow-[0_6px_30px_-6px_rgba(0,0,0,0.05)] hover:border-slate-200'
                }`}
              >
                {/* 3D Recruiter Badge Icon */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-recruiter-light flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105">
                  <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none">
                    <rect
                      x="25"
                      y="16"
                      width="14"
                      height="8"
                      rx="3"
                      stroke="var(--recruiter-purple-dark)"
                      strokeWidth="3"
                      fill="none"
                    />
                    <rect
                      x="12"
                      y="22"
                      width="40"
                      height="28"
                      rx="6"
                      fill="url(#caseGradIcon)"
                      filter="drop-shadow(0 4px 6px rgba(109,40,217,0.25))"
                    />
                    <path d="M12 30H52" stroke="#5B21B6" strokeWidth="2" opacity="0.4" />
                    <rect x="28" y="32" width="8" height="6" rx="2" fill="#FFFFFF" />
                    <defs>
                      <linearGradient
                        id="caseGradIcon"
                        x1="12"
                        y1="22"
                        x2="52"
                        y2="50"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="var(--recruiter-purple)" />
                        <stop offset="1" stopColor="var(--recruiter-purple-dark)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Role Name */}
                <h3 className="text-lg sm:text-xl font-bold text-text-main tracking-tight">
                  I&apos;m a Recruiter
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed min-h-[48px]">
                  Post jobs, discover top campus talent, and build your dream team faster.
                </p>

                {/* Arrow Action Button */}
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center mt-5 transition-all duration-300 ${
                    selectedRole === 'recruiter' || hoveredRole === 'recruiter'
                      ? 'bg-recruiter text-white shadow-md shadow-recruiter/30 scale-105'
                      : 'bg-purple-50 text-recruiter border border-purple-100/80'
                  }`}
                >
                  {selectedRole === 'recruiter' ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                  )}
                </div>
              </button>
            </div>

            {/* Save failure */}
            {errorMsg && (
              <div
                id="role-select-error"
                role="alert"
                className="mt-6 text-sm text-rose-600 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl"
              >
                {errorMsg}
              </div>
            )}
          </div>

          {/* Right Column: Exact Vector 3D Scene */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center lg:justify-end select-none min-h-[520px] sm:min-h-[580px]">
            <div className="relative w-full max-w-[540px] sm:max-w-[580px] aspect-[520/500] flex items-center justify-center">
              <svg
                viewBox="0 0 520 500"
                className="w-full h-full overflow-visible"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Soft 3D Drop Shadows */}
                  <filter id="exactCardShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow
                      dx="0"
                      dy="12"
                      stdDeviation="16"
                      floodColor="#0F172A"
                      floodOpacity="0.08"
                    />
                  </filter>

                  <filter id="exactCharShadow" x="-25%" y="-25%" width="150%" height="150%">
                    <feDropShadow
                      dx="0"
                      dy="16"
                      stdDeviation="18"
                      floodColor="#0F172A"
                      floodOpacity="0.13"
                    />
                  </filter>

                  <filter id="exactBadgeShadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow
                      dx="0"
                      dy="4"
                      stdDeviation="5"
                      floodColor="var(--brand-green)"
                      floodOpacity="0.38"
                    />
                  </filter>

                  <filter id="exactEyeShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow
                      dx="0"
                      dy="3"
                      stdDeviation="3.5"
                      floodColor="#000000"
                      floodOpacity="0.12"
                    />
                  </filter>

                  {/* 3D Green Sphere Radial Gradient */}
                  <radialGradient id="exactGreenClay" cx="35%" cy="30%" r="68%">
                    <stop offset="0%" stopColor="var(--clay-sphere-start)" />
                    <stop offset="28%" stopColor="var(--brand-green)" />
                    <stop offset="70%" stopColor="var(--clay-sphere-mid2)" />
                    <stop offset="90%" stopColor="var(--clay-sphere-dark)" />
                    <stop offset="100%" stopColor="var(--clay-sphere-end)" />
                  </radialGradient>

                  {/* 3D Purple Squircle Radial Gradient */}
                  <radialGradient id="exactPurpleClay" cx="35%" cy="28%" r="72%">
                    <stop offset="0%" stopColor="#A282FF" />
                    <stop offset="30%" stopColor="#8262E8" />
                    <stop offset="72%" stopColor="#6C45D8" />
                    <stop offset="90%" stopColor="#552DBE" />
                    <stop offset="100%" stopColor="#431FA0" />
                  </radialGradient>

                  {/* 3D Graduation Cap Gradients */}
                  <linearGradient id="capTopGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#333A44" />
                    <stop offset="50%" stopColor="#22272E" />
                    <stop offset="100%" stopColor="#14181F" />
                  </linearGradient>

                  <linearGradient id="capBevelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#181D24" />
                    <stop offset="100%" stopColor="#0D1015" />
                  </linearGradient>

                  <linearGradient id="tasselGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--clay-sphere-start)" />
                    <stop offset="50%" stopColor="var(--brand-green)" />
                    <stop offset="100%" stopColor="var(--brand-green-dark)" />
                  </linearGradient>

                  {/* Bar Chart Gradients */}
                  <linearGradient id="exactBar1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A88BFA" />
                    <stop offset="100%" stopColor="#7E55E8" />
                  </linearGradient>
                  <linearGradient id="exactBar2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9065F5" />
                    <stop offset="100%" stopColor="#6C3BD8" />
                  </linearGradient>
                  <linearGradient id="exactBar3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7840E5" />
                    <stop offset="100%" stopColor="#531AB8" />
                  </linearGradient>
                </defs>

                {/* 1. Large Pale Backdrop Glow Circle */}
                <circle cx="260" cy="245" r="215" fill="#F4FAF6" />

                {/* 2. Floating Ambient Dots */}
                <circle cx="450" cy="50" r="8" fill="var(--brand-green)" />
                <circle cx="28" cy="180" r="8.5" fill="var(--brand-green)" />
                <circle cx="270" cy="210" r="7.5" fill="#A78BFA" />

                {/* 3. Floor Ground Accents & Contact Shadows */}
                <rect x="45" y="445" width="200" height="5" rx="2.5" fill="#D3F6E7" />
                <rect x="410" y="448" width="50" height="5" rx="2.5" fill="#D3F6E7" />
                <ellipse cx="460" cy="422" rx="14" ry="4" fill="#D3F6E7" />

                <ellipse cx="170" cy="426" rx="88" ry="15" fill="#0F172A" opacity="0.1" />
                <ellipse cx="350" cy="426" rx="90" ry="15" fill="#0F172A" opacity="0.1" />

                {/* 4. Floating User Profile Card (Far Top-Left) */}
                <motion.g
                  animate={{ y: [0, -9, 0] }}
                  transition={{ repeat: Infinity, duration: 4.6, ease: 'easeInOut' }}
                  transform="translate(42, 65)"
                >
                  {/* Card Background */}
                  <rect
                    x="0"
                    y="0"
                    width="130"
                    height="96"
                    rx="16"
                    fill="#FFFFFF"
                    filter="url(#exactCardShadow)"
                  />

                  {/* Green User Avatar */}
                  <g transform="translate(36, 30)">
                    {/* Head */}
                    <circle cx="0" cy="-6" r="11" fill="var(--brand-green)" />
                    {/* Shoulders / Torso */}
                    <path d="M -16,17 C -16,6 16,6 16,17 Z" fill="#242C38" />
                  </g>

                  {/* Skeleton Text Lines */}
                  <rect x="66" y="22" width="46" height="6" rx="3" fill="#CBD5E1" />
                  <rect x="66" y="34" width="28" height="5" rx="2.5" fill="#E2E8F0" />
                  <rect x="18" y="58" width="76" height="5.5" rx="2.75" fill="#E2E8F0" />
                  <rect x="18" y="70" width="54" height="5.5" rx="2.75" fill="#E2E8F0" />

                  {/* Circular Green Checkmark Badge */}
                  <g transform="translate(120, 74)">
                    <circle
                      cx="0"
                      cy="0"
                      r="14.5"
                      fill="var(--brand-green)"
                      filter="url(#exactBadgeShadow)"
                    />
                    <path
                      d="M -5,-0.5 L -1.5,3 L 5,-3.5"
                      stroke="#FFFFFF"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </g>
                </motion.g>

                {/* 5. Floating Analytics Bar Chart Card (Far Top-Right) */}
                <motion.g
                  animate={{ y: [0, 9, 0] }}
                  transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut', delay: 0.6 }}
                  transform="translate(500, 65)"
                >
                  {/* Card Background */}
                  <rect
                    x="0"
                    y="0"
                    width="138"
                    height="132"
                    rx="16"
                    fill="#FFFFFF"
                    filter="url(#exactCardShadow)"
                  />

                  {/* 3D Purple Gradient Bars (Short, Medium, Tall) */}
                  <g>
                    <rect x="22" y="74" width="24" height="38" rx="8" fill="url(#exactBar1)" />
                    <rect
                      x="22"
                      y="74"
                      width="24"
                      height="12"
                      rx="6"
                      fill="#C4B5FD"
                      opacity="0.6"
                    />
                  </g>

                  <g>
                    <rect x="56" y="52" width="24" height="60" rx="8" fill="url(#exactBar2)" />
                    <rect
                      x="56"
                      y="52"
                      width="24"
                      height="12"
                      rx="6"
                      fill="#DDD6FE"
                      opacity="0.6"
                    />
                  </g>

                  <g>
                    <rect x="90" y="28" width="24" height="84" rx="8" fill="url(#exactBar3)" />
                    <rect
                      x="90"
                      y="28"
                      width="24"
                      height="12"
                      rx="6"
                      fill="#EDE9FE"
                      opacity="0.75"
                    />
                  </g>
                </motion.g>

                {/* 6. GREEN STUDENT SPHERE CHARACTER (Left) */}
                <motion.g
                  animate={{
                    y:
                      selectedRole === 'student'
                        ? -18
                        : hoveredRole === 'student'
                          ? -12
                          : [0, -8, 0],
                    scale: hoveredRole === 'student' || selectedRole === 'student' ? 1.04 : 1,
                  }}
                  transition={{
                    y:
                      selectedRole === 'student' || hoveredRole === 'student'
                        ? { type: 'spring', stiffness: 300, damping: 20 }
                        : { repeat: Infinity, duration: 4.5, ease: 'easeInOut' },
                    scale: { type: 'spring', stiffness: 300, damping: 20 },
                  }}
                  style={{ transformOrigin: '170px 335px' }}
                >
                  {/* 3D Green Sphere Body */}
                  <circle
                    cx="170"
                    cy="335"
                    r="82"
                    fill="url(#exactGreenClay)"
                    filter="url(#exactCharShadow)"
                  />

                  {/* 3D Graduation Cap */}
                  <g transform="translate(136, 245) rotate(-19)">
                    <path
                      d="M -34,16 C -34,-2 34,-2 34,16 C 34,26 -34,26 -34,16 Z"
                      fill="#12161D"
                    />
                    <ellipse cx="0" cy="14" rx="36" ry="12" fill="#181E27" />

                    <polygon points="-72,0 -72,7 0,33 72,7 72,0 0,26" fill="url(#capBevelGrad)" />

                    <polygon
                      points="-72,0 0,-26 72,0 0,26"
                      fill="url(#capTopGrad)"
                      stroke="#14181F"
                      strokeWidth="1.5"
                    />

                    <polygon points="-72,0 0,-26 72,0" fill="#424D5C" opacity="0.3" />

                    <ellipse cx="0" cy="0" rx="5.5" ry="4" fill="#10141A" />
                    <ellipse cx="-1" cy="-1" rx="2" ry="1.5" fill="#4B5563" opacity="0.5" />

                    <path
                      d="M 0,0 C -42,16 -58,34 -60,65"
                      stroke="url(#tasselGrad)"
                      strokeWidth="4.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <ellipse cx="-60" cy="65" rx="5.5" ry="4.5" fill="var(--brand-green-dark)" />
                    <circle cx="-61" cy="64" r="1.5" fill="var(--brand-green-mint)" opacity="0.6" />

                    <path d="M -67,66 C -67,86 -53,86 -53,66 Z" fill="url(#tasselGrad)" />
                    <line
                      x1="-63"
                      y1="84"
                      x2="-63"
                      y2="94"
                      stroke="var(--brand-green-hover)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="-60"
                      y1="84"
                      x2="-60"
                      y2="96"
                      stroke="var(--brand-green)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="-57"
                      y1="84"
                      x2="-57"
                      y2="94"
                      stroke="var(--brand-green-hover)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Left 3D Eye */}
                  <g transform="translate(160, 325) rotate(-6)">
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="18"
                      ry="17"
                      fill="#FFFFFF"
                      filter="url(#exactEyeShadow)"
                    />
                    <motion.circle
                      cx={gaze.x * 6 + 1.5}
                      cy={gaze.y * 6}
                      r={7.2}
                      fill="#1A202C"
                      animate={{
                        cx: gaze.x * 6 + 1.5,
                        cy: gaze.y * 6,
                        scaleY: blink ? 0.1 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    />
                    {!blink && (
                      <circle cx={gaze.x * 5 - 1.5} cy={gaze.y * 5 - 2} r="2.5" fill="#FFFFFF" />
                    )}
                  </g>

                  {/* Right 3D Eye */}
                  <g transform="translate(202, 317) rotate(4)">
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="18"
                      ry="17"
                      fill="#FFFFFF"
                      filter="url(#exactEyeShadow)"
                    />
                    <motion.circle
                      cx={gaze.x * 6 + 1.5}
                      cy={gaze.y * 6}
                      r={7.2}
                      fill="#1A202C"
                      animate={{
                        cx: gaze.x * 6 + 1.5,
                        cy: gaze.y * 6,
                        scaleY: blink ? 0.1 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    />
                    {!blink && (
                      <circle cx={gaze.x * 5 - 1.5} cy={gaze.y * 5 - 2} r="2.5" fill="#FFFFFF" />
                    )}
                  </g>

                  {/* Sweet Open Smile Mouth */}
                  <g transform="translate(184, 353)">
                    <path d="M -16,-4 Q 0,20 16,-4 Q 0,6 -16,-4 Z" fill="#1A202C" />
                  </g>
                </motion.g>

                {/* 7. PURPLE RECRUITER MONSTER CHARACTER (Right) */}
                <motion.g
                  animate={{
                    y:
                      selectedRole === 'recruiter'
                        ? -18
                        : hoveredRole === 'recruiter'
                          ? -12
                          : [0, -7, 0],
                    scale: hoveredRole === 'recruiter' || selectedRole === 'recruiter' ? 1.04 : 1,
                  }}
                  transition={{
                    y:
                      selectedRole === 'recruiter' || hoveredRole === 'recruiter'
                        ? { type: 'spring', stiffness: 300, damping: 20 }
                        : { repeat: Infinity, duration: 4.2, ease: 'easeInOut', delay: 0.3 },
                    scale: { type: 'spring', stiffness: 300, damping: 20 },
                  }}
                  style={{ transformOrigin: '350px 335px' }}
                >
                  {/* 3D Rounded Puffed Squircle Body */}
                  <rect
                    x="268"
                    y="250"
                    width="164"
                    height="156"
                    rx="56"
                    fill="url(#exactPurpleClay)"
                    filter="url(#exactCharShadow)"
                  />

                  {/* Left 3D Eye */}
                  <g transform="translate(328, 308) rotate(-3)">
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="17.5"
                      ry="16.5"
                      fill="#FFFFFF"
                      filter="url(#exactEyeShadow)"
                    />
                    <motion.circle
                      cx={gaze.x * 5.5}
                      cy={gaze.y * 5.5}
                      r={6.6}
                      fill="#1A202C"
                      animate={{
                        cx: gaze.x * 5.5,
                        cy: gaze.y * 5.5,
                        scaleY: blink ? 0.1 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    />
                    {!blink && (
                      <circle
                        cx={gaze.x * 4.5 - 1.5}
                        cy={gaze.y * 4.5 - 2}
                        r="2.3"
                        fill="#FFFFFF"
                      />
                    )}
                  </g>

                  {/* Right 3D Eye */}
                  <g transform="translate(370, 308) rotate(3)">
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="17.5"
                      ry="16.5"
                      fill="#FFFFFF"
                      filter="url(#exactEyeShadow)"
                    />
                    <motion.circle
                      cx={gaze.x * 5.5}
                      cy={gaze.y * 5.5}
                      r={6.6}
                      fill="#1A202C"
                      animate={{
                        cx: gaze.x * 5.5,
                        cy: gaze.y * 5.5,
                        scaleY: blink ? 0.1 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    />
                    {!blink && (
                      <circle
                        cx={gaze.x * 4.5 - 1.5}
                        cy={gaze.y * 4.5 - 2}
                        r="2.3"
                        fill="#FFFFFF"
                      />
                    )}
                  </g>

                  {/* Wide Open Smile Mouth */}
                  <g transform="translate(350, 340)">
                    <path d="M -15,-4 Q 0,20 15,-4 Q 0,6 -15,-4 Z" fill="#1A202C" />
                  </g>

                  {/* 3D Black Business Necktie */}
                  <g transform="translate(342, 374)">
                    {/* Diamond Knot */}
                    <polygon points="-8,-10 8,-10 5,4 -5,4" fill="#14181F" />
                    {/* Tie Body */}
                    <polygon points="-6,4 6,4 12,58 0,72 -12,58" fill="#242C38" />
                    {/* 3D Shadow Split */}
                    <polygon points="0,4 6,4 12,58 0,72" fill="#14181F" opacity="0.42" />
                  </g>
                </motion.g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

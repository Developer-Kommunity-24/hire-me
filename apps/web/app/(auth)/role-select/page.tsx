'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RoleSelectPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'student' | 'recruiter' | null>(null)

  const handleSelect = (role: 'student' | 'recruiter') => {
    setSelectedRole(role)
    localStorage.setItem('user_role', role)

    setTimeout(() => {
      if (role === 'student') {
        router.push('/student')
      } else {
        router.push('/recruiter')
      }
    }, 200)
  }

  return (
    <main className="min-h-screen w-full bg-[#f4f5f7] flex flex-col justify-between items-center py-12 px-4 sm:px-6 md:px-8 selection:bg-[#00d66c]/20 selection:text-slate-900">
      {/* Top Spacer */}
      <div className="w-full" />

      {/* Center Section */}
      <section className="w-full max-w-[960px] mx-auto flex flex-col items-center text-center my-auto py-4">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Welcome to CareerLink
        </h1>

        {/* Subtitle */}
        <p className="text-slate-500 text-sm sm:text-base mt-2.5 max-w-lg mx-auto leading-relaxed">
          Choose your path to get started. Select your platform role to begin your professional journey.
        </p>

        {/* 2 Big White Role Cards */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mt-12 w-full max-w-[840px]">
          {/* Card 1: Student */}
          <button
            type="button"
            onClick={() => handleSelect('student')}
            className={`group bg-white rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center border transition-all duration-200 cursor-pointer select-none text-left ${
              selectedRole === 'student'
                ? 'border-[#00d66c] shadow-lg ring-4 ring-[#00d66c]/15'
                : 'border-slate-100 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.05)] hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            {/* Square Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-[#00d66c]/10 flex items-center justify-center text-slate-800 group-hover:text-[#00a854] transition-colors">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>

            {/* Role Title */}
            <h2 className="text-2xl font-bold text-slate-900 mt-6 tracking-tight">
              Student
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed max-w-xs min-h-[48px]">
              Create a profile, showcase your skills, and apply to job postings matching your qualifications.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#00a854] shadow-2xs">
                <svg className="w-3.5 h-3.5 text-[#00d66c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Resume Builder</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#00a854] shadow-2xs">
                <svg className="w-3.5 h-3.5 text-[#00d66c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Job Feed</span>
              </span>
            </div>
          </button>

          {/* Card 2: Recruiter */}
          <button
            type="button"
            onClick={() => handleSelect('recruiter')}
            className={`group bg-white rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center border transition-all duration-200 cursor-pointer select-none text-left ${
              selectedRole === 'recruiter'
                ? 'border-[#00d66c] shadow-lg ring-4 ring-[#00d66c]/15'
                : 'border-slate-100 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.05)] hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            {/* Square Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-[#00d66c]/10 flex items-center justify-center text-slate-800 group-hover:text-[#00a854] transition-colors">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>

            {/* Role Title */}
            <h2 className="text-2xl font-bold text-slate-900 mt-6 tracking-tight">
              Recruiter
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed max-w-xs min-h-[48px]">
              Post opportunities, review student applications, and connect with top talent directly.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#00a854] shadow-2xs">
                <svg className="w-3.5 h-3.5 text-[#00d66c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                </svg>
                <span>Post Jobs</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#00a854] shadow-2xs">
                <svg className="w-3.5 h-3.5 text-[#00d66c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Review Candidates</span>
              </span>
            </div>
          </button>
        </div>
      </section>

      
    </main>
  )
}

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RecruiterOnboardingPage() {
  const router = useRouter()

  const [step, setStep] = useState<1 | 2>(1)
  const [companyName, setCompanyName] = useState('')
  const [companyMail, setCompanyMail] = useState('')
  const [companyUrl, setCompanyUrl] = useState('')
  const [headquartersLocation, setHeadquartersLocation] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim() || !companyMail.trim()) {
      return
    }
    setStep(2)
  }

  const handleBack = () => {
    if (step === 1) {
      router.push('/role-select')
    } else {
      setStep(1)
    }
  }

  return (
    <main className="min-h-screen w-full bg-white text-[#121212] flex flex-col justify-between items-center py-8 px-4 sm:px-6 md:px-8 selection:bg-[#00d66c]/20 selection:text-[#121212]">
      {step === 1 ? (
        <div className="w-full max-w-xl my-auto py-2 space-y-6 sm:space-y-8 transition-all">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Company & Recruiter Details
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
              Set up your verified company profile to start hiring talent from the DK24 network.
            </p>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* company_name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                COMPANY NAME <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 21h18" />
                    <path d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14" />
                    <path d="M9 9h1" />
                    <path d="M9 13h1" />
                    <path d="M9 17h1" />
                    <path d="M14 9h1" />
                    <path d="M14 13h1" />
                    <path d="M14 17h1" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Innovations Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d66c]/30 focus:border-[#00d66c] transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* company_mail */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                COMPANY WORK EMAIL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  placeholder="recruiting@company.com"
                  value={companyMail}
                  onChange={(e) => setCompanyMail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d66c]/30 focus:border-[#00d66c] transition-all placeholder:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Official corporate email for candidate correspondence and verification.
              </p>
            </div>

            {/* company_url */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                COMPANY WEBSITE URL
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </span>
                <input
                  type="url"
                  placeholder="https://acme.example.com"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d66c]/30 focus:border-[#00d66c] transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* headquarters_location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                HEADQUARTERS LOCATION
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru, India or San Francisco, CA"
                  value={headquartersLocation}
                  onChange={(e) => setHeadquartersLocation(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d66c]/30 focus:border-[#00d66c] transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Back
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#121212] hover:bg-neutral-800 active:scale-95 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
              >
                Complete Setup
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Completion State */
        <div className="w-full max-w-lg my-auto py-10 text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-[#00d66c]/15 text-[#008f48] rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Recruiter Profile Ready!
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              Your company profile for{' '}
              <span className="font-semibold text-slate-900">{companyName}</span> has been set up.
              You can now publish job drives and discover students.
            </p>
          </div>

          {/* Summary Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-left text-xs text-slate-600 space-y-2">
            <div className="font-semibold text-slate-800">Company Overview:</div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-400 block">Company:</span>
                <span className="font-medium text-slate-800 truncate block">{companyName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Work Email:</span>
                <span className="font-medium text-slate-800 truncate block">{companyMail}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Website:</span>
                <span className="font-medium text-slate-800 truncate block">
                  {companyUrl || '(None)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Location:</span>
                <span className="font-medium text-slate-800 truncate block">
                  {headquartersLocation || '(None)'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/landing"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#121212] hover:bg-neutral-800 active:scale-95 text-white font-semibold text-sm transition-all shadow-xs"
            >
              Go to Recruiter Dashboard
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}

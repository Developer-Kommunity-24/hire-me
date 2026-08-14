'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function RecruiterOnboardingPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<1 | 2>(1)
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [shortBio, setShortBio] = useState('')

  // Avatar state (starts empty with placeholder silhouette)
  const [avatarUrl, setAvatarUrl] = useState<string>('')

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarUrl(url)
    }
  }

  const handleRemovePhoto = () => {
    setAvatarUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
        <div className="w-full max-w-2xl my-auto py-2 space-y-6 sm:space-y-8 transition-all">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Complete Your Profile
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
              Let candidates know who they are talking to. This information will appear on your job postings.
            </p>
          </div>

          {/* Profile Photo Section */}
          <div className="flex items-center gap-5 pt-1">
            {/* Avatar image */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Recruiter profile avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-8 h-8 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>

            {/* Actions & info */}
            <div>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/png, image/jpeg, image/gif"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  {avatarUrl ? 'Change Photo' : 'Add Photo'}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                JPG, GIF or PNG. Max size of 2MB.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200/80" />

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Full Name & Company Name */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs font-semibold font-mono tracking-wider uppercase text-slate-600 mb-2">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d66c] focus:border-transparent transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold font-mono tracking-wider uppercase text-slate-600 mb-2">
                  COMPANY NAME
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ace corp"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d66c] focus:border-transparent transition-all bg-white"
                />
              </div>
            </div>

            {/* Row 2: Email Address & Job Title */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs font-semibold font-mono tracking-wider uppercase text-slate-600 mb-2">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    required
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="jane.doe@acmecorp.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d66c] focus:border-transparent transition-all bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold font-mono tracking-wider uppercase text-slate-600 mb-2">
                  JOB TITLE
                </label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Senior Technical Recruiter"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d66c] focus:border-transparent transition-all bg-white"
                />
              </div>
            </div>

            {/* Row 3: Short Bio */}
            <div>
              <label className="block text-xs font-semibold font-mono tracking-wider uppercase text-slate-600 mb-2">
                SHORT BIO (OPTIONAL)
              </label>
              <textarea
                rows={3}
                value={shortBio}
                onChange={(e) => setShortBio(e.target.value)}
                placeholder="Briefly describe your role and what kind of candidates you are looking for..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d66c] focus:border-transparent transition-all resize-none bg-white"
              />
            </div>
          </form>

          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-200/80">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <span>&lsaquo;</span>
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-8 py-2.5 bg-[#00d66c] hover:bg-[#00b247] active:bg-[#009b3e] text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <span>Next</span>
              <span>&rsaquo;</span>
            </button>
          </div>
        </div>
      ) : (
        /* Completion State (Flat, No Card Box) */
        <div className="w-full max-w-lg my-auto py-12 text-center space-y-4">
          <div className="w-16 h-16 bg-[#00d66c]/15 text-[#00d66c] rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-xs">
            ✓
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Recruiter Profile Ready!
          </h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
            Your recruiter profile has been configured. You can now publish job drives, review campus talent, and connect with top candidates.
          </p>

          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#121212] hover:bg-neutral-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Go to Recruiter Dashboard &rarr;
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

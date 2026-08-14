'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ProjectItem {
  id: string
  title: string
  role: string
  description: string
  contributions: string
  learnings: string
  skillsUsed: string[]
  newSkillInput: string
  githubUrl: string
  liveUrl: string
}

export default function StudentOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)

  // Step 1: Basic Info
  const [fullName, setFullName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [step1Error, setStep1Error] = useState('')

  // Step 2: Education & Experience
  const [school, setSchool] = useState('')
  const [degree, setDegree] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [experienceSummary, setExperienceSummary] = useState('')
  const [step2Error, setStep2Error] = useState('')

  // Step 3: Skills & Links (Skills and URLs are Optional)
  const [skills, setSkills] = useState<string[]>([])
  const [newSkillInput, setNewSkillInput] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')

  // Step 4: Projects (Mapped to projects schema, Optional - can add or skip)
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: '1',
      title: '',
      role: '',
      description: '',
      contributions: '',
      learnings: '',
      skillsUsed: [],
      newSkillInput: '',
      githubUrl: '',
      liveUrl: '',
    },
  ])

  const gradYearOptions = ['2024', '2025', '2026', '2027', '2028', '2029', '2030']

  // Global Skills handling (Step 3)
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return
    if (!skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()])
    }
    setNewSkillInput('')
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove))
  }

  // Projects handling (Step 4)
  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        id: Date.now().toString(),
        title: '',
        role: '',
        description: '',
        contributions: '',
        learnings: '',
        skillsUsed: [],
        newSkillInput: '',
        githubUrl: '',
        liveUrl: '',
      },
    ])
  }

  const handleRemoveProject = (idToRemove: string) => {
    if (projects.length === 1) {
      setProjects([
        {
          id: Date.now().toString(),
          title: '',
          role: '',
          description: '',
          contributions: '',
          learnings: '',
          skillsUsed: [],
          newSkillInput: '',
          githubUrl: '',
          liveUrl: '',
        },
      ])
      return
    }
    setProjects(projects.filter((p) => p.id !== idToRemove))
  }

  const handleProjectFieldChange = (
    id: string,
    field: keyof Omit<ProjectItem, 'id' | 'skillsUsed'>,
    value: string,
  ) => {
    setProjects(
      projects.map((p) => {
        if (p.id === id) {
          return { ...p, [field]: value }
        }
        return p
      }),
    )
  }

  const handleAddProjectSkill = (projectId: string) => {
    setProjects(
      projects.map((p) => {
        if (p.id === projectId) {
          const input = p.newSkillInput.trim()
          if (!input || p.skillsUsed.includes(input)) {
            return { ...p, newSkillInput: '' }
          }
          return {
            ...p,
            skillsUsed: [...p.skillsUsed, input],
            newSkillInput: '',
          }
        }
        return p
      }),
    )
  }

  const handleRemoveProjectSkill = (projectId: string, skillToRemove: string) => {
    setProjects(
      projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            skillsUsed: p.skillsUsed.filter((s) => s !== skillToRemove),
          }
        }
        return p
      }),
    )
  }

  const handleNext = () => {
    if (step === 1) {
      if (!fullName.trim() || !headline.trim()) {
        setStep1Error('Please fill in all mandatory fields (Name and Headline).')
        return
      }
      setStep1Error('')
      setStep(2)
    } else if (step === 2) {
      if (!school.trim() || !degree.trim() || !graduationYear) {
        setStep2Error('Please provide your School/University, Degree, and Graduation Year.')
        return
      }
      setStep2Error('')
      setStep(3)
    } else if (step === 3) {
      setStep(4)
    } else if (step === 4) {
      setStep(5)
    }
  }

  const handleSkipStep3 = () => {
    setStep(4)
  }

  const handleSkipProjects = () => {
    setStep(5)
  }

  const handleBack = () => {
    if (step === 1) router.push('/role-select')
    else if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
    else if (step === 4) setStep(3)
    else if (step === 5) setStep(4)
  }

  return (
    <main className="min-h-screen w-full bg-white text-[#121212] flex flex-col justify-between items-center py-8 px-4 sm:px-6 md:px-8 selection:bg-[#00d66c]/20 selection:text-[#121212]">
      {/* Content Container (Flat, No Card Box) */}
      <div className="w-full max-w-xl my-auto py-2 flex flex-col justify-between">
        {/* Connected Node Progress Bar (Top) - 4 Steps */}
        {step < 5 && (
          <div className="w-full mb-8 pt-1">
            <div className="relative flex items-center justify-between px-3">
              {/* Horizontal Connecting Track */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-slate-200 z-0">
                <div
                  className="h-full bg-[#00d66c] transition-all duration-300"
                  style={{
                    width:
                      step === 1 ? '0%' : step === 2 ? '33.33%' : step === 3 ? '66.66%' : '100%',
                  }}
                />
              </div>

              {/* Node 1: Profile */}
              <div className="relative z-10 flex items-center justify-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    step >= 1
                      ? 'bg-[#00d66c] text-white shadow-xs'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {step > 1 ? (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    '1'
                  )}
                </div>
              </div>

              {/* Node 2: Education */}
              <div className="relative z-10 flex items-center justify-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    step >= 2
                      ? 'bg-[#00d66c] text-white shadow-xs'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {step > 2 ? (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    '2'
                  )}
                </div>
              </div>

              {/* Node 3: Skills & Links */}
              <div className="relative z-10 flex items-center justify-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    step >= 3
                      ? 'bg-[#00d66c] text-white shadow-xs'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {step > 3 ? (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    '3'
                  )}
                </div>
              </div>

              {/* Node 4: Projects */}
              <div className="relative z-10 flex items-center justify-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    step >= 4
                      ? 'bg-[#00d66c] text-white shadow-xs'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  <span>4</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: Basic Info */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500 font-sans tracking-wide">
                Step 1 of 4
              </span>
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mt-1 leading-tight">
                Basic Details
              </h1>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Enter your name and headline to begin setting up your profile.
              </p>
            </div>

            {step1Error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {step1Error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleNext()
              }}
              className="space-y-4 pt-1"
            >
              {/* Name (Mandatory) */}
              <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-600">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                    Mandatory
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    if (step1Error) setStep1Error('')
                  }}
                  placeholder="e.g. Jane Doe"
                  className="w-full text-slate-900 font-semibold text-sm sm:text-base outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {/* Headline (Mandatory) */}
              <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-600">
                    Headline <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                    Mandatory
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => {
                    setHeadline(e.target.value)
                    if (step1Error) setStep1Error('')
                  }}
                  placeholder="e.g. Computer Science Student at University"
                  className="w-full text-slate-900 font-semibold text-sm sm:text-base outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {/* Bio (Optional) */}
              <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-500">Bio / Summary</label>
                  <span className="text-[10px] font-medium text-slate-400">Optional</span>
                </div>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell recruiters a bit about yourself, interests, and goals..."
                  className="w-full text-slate-900 font-normal text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 resize-none"
                />
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Education & Experience */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500 font-sans tracking-wide">
                Step 2 of 4
              </span>
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mt-1 leading-tight">
                Education &amp; Experience
              </h1>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Add your academic background and any internship or work experience.
              </p>
            </div>

            {step2Error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {step2Error}
              </div>
            )}

            <div className="space-y-4 pt-1">
              {/* Education Fields (Mandatory: School, Degree, Graduation Year) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Education
                  </h3>
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                    Mandatory
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-600">
                        University / School <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={school}
                      onChange={(e) => {
                        setSchool(e.target.value)
                        if (step2Error) setStep2Error('')
                      }}
                      placeholder="e.g. University of Technology"
                      className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-600">
                        Degree &amp; Major <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={degree}
                      onChange={(e) => {
                        setDegree(e.target.value)
                        if (step2Error) setStep2Error('')
                      }}
                      placeholder="e.g. B.S. in Computer Science"
                      className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                {/* Graduation Year */}
                <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-600">
                      Graduation Year <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      Mandatory
                    </span>
                  </div>
                  <select
                    required
                    value={graduationYear}
                    onChange={(e) => {
                      setGraduationYear(e.target.value)
                      if (step2Error) setStep2Error('')
                    }}
                    className="w-full text-slate-900 font-semibold text-sm sm:text-base outline-none bg-transparent pt-0.5 cursor-pointer appearance-none"
                  >
                    <option value="">Select graduation year</option>
                    {gradYearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Experience Fields (Optional) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Experience
                  </h3>
                  <span className="text-[10px] font-medium text-slate-400">
                    Optional (Can skip)
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                    <label className="block text-xs font-medium text-slate-500">Role / Title</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Frontend Intern"
                      className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                    <label className="block text-xs font-medium text-slate-500">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. TechCorp Solutions"
                      className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                  <label className="block text-xs font-medium text-slate-500">
                    Responsibilities &amp; Achievements
                  </label>
                  <textarea
                    rows={2}
                    value={experienceSummary}
                    onChange={(e) => setExperienceSummary(e.target.value)}
                    placeholder="Briefly describe what you worked on..."
                    className="w-full text-slate-900 font-normal text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Skills & Links (Skills and URLs are Optional) */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500 font-sans tracking-wide">
                Step 3 of 4
              </span>
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mt-1 leading-tight">
                Skills &amp; Links
              </h1>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Add your technical skills, resume, and profile links (all optional).
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Skills Input (Optional) */}
              <div className="space-y-2">
                <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-500">Key Skills</label>
                      <span className="text-[10px] font-medium text-slate-400">Optional</span>
                    </div>
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
                      placeholder="Type skill and press Add (e.g. React, Python, SQL)"
                      className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3.5 py-1.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </div>

                {/* Added Skills List */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-700"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Resume Link (Optional) */}
              <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-500">
                    Resume Link (Google Drive / Cloud URL)
                  </label>
                  <span className="text-[10px] font-medium text-slate-400">Optional</span>
                </div>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... (optional)"
                  className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {/* External Links (Optional) */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-500">LinkedIn URL</label>
                    <span className="text-[10px] font-medium text-slate-400">Can skip</span>
                  </div>
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username (optional)"
                    className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>

                <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-500">
                      Portfolio / GitHub
                    </label>
                    <span className="text-[10px] font-medium text-slate-400">Can skip</span>
                  </div>
                  <input
                    type="text"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://github.com/username (optional)"
                    className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Featured Projects */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500 font-sans tracking-wide">
                Step 4 of 4
              </span>
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mt-1 leading-tight">
                Featured Projects
              </h1>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Add projects to showcase your hands-on experience, or skip for now.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Projects ({projects.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#00d66c]/15 hover:bg-[#00d66c]/25 text-[#008f48] font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <span>+</span> Add Project
                </button>
              </div>

              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Project #{index + 1}
                    </span>
                    {projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(project.id)}
                        className="text-xs font-medium text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Title & Role */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                      <label className="block text-xs font-medium text-slate-500">
                        Project Title
                      </label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) =>
                          handleProjectFieldChange(project.id, 'title', e.target.value)
                        }
                        placeholder="e.g. AI Resume Builder"
                        className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>

                    <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                      <label className="block text-xs font-medium text-slate-500">Your Role</label>
                      <input
                        type="text"
                        value={project.role}
                        onChange={(e) =>
                          handleProjectFieldChange(project.id, 'role', e.target.value)
                        }
                        placeholder="e.g. Lead Frontend Developer"
                        className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                    <label className="block text-xs font-medium text-slate-500">
                      Project Description
                    </label>
                    <textarea
                      rows={2}
                      value={project.description}
                      onChange={(e) =>
                        handleProjectFieldChange(project.id, 'description', e.target.value)
                      }
                      placeholder="High-level overview of what the application does..."
                      className="w-full text-slate-900 font-normal text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  {/* Contributions & Learnings */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                      <label className="block text-xs font-medium text-slate-500">
                        Key Contributions
                      </label>
                      <textarea
                        rows={2}
                        value={project.contributions}
                        onChange={(e) =>
                          handleProjectFieldChange(project.id, 'contributions', e.target.value)
                        }
                        placeholder="Built auth, responsive UI, database schema..."
                        className="w-full text-slate-900 font-normal text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 resize-none"
                      />
                    </div>

                    <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                      <label className="block text-xs font-medium text-slate-500">
                        Learnings &amp; Challenges
                      </label>
                      <textarea
                        rows={2}
                        value={project.learnings}
                        onChange={(e) =>
                          handleProjectFieldChange(project.id, 'learnings', e.target.value)
                        }
                        placeholder="Learned Next.js Server Components, caching..."
                        className="w-full text-slate-900 font-normal text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 resize-none"
                      />
                    </div>
                  </div>

                  {/* Skills Used Tags on Project */}
                  <div className="space-y-1.5">
                    <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-500">
                          Skills Used in this Project
                        </label>
                        <input
                          type="text"
                          value={project.newSkillInput}
                          onChange={(e) =>
                            handleProjectFieldChange(project.id, 'newSkillInput', e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddProjectSkill(project.id)
                            }
                          }}
                          placeholder="Type tech stack item & press Add (e.g. Next.js, Postgres)"
                          className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddProjectSkill(project.id)}
                        className="px-3.5 py-1.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </div>

                    {project.skillsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {project.skillsUsed.map((sk) => (
                          <span
                            key={sk}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                          >
                            <span>{sk}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveProjectSkill(project.id, sk)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* GitHub URL & Live URL */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                      <label className="block text-xs font-medium text-slate-500">
                        GitHub Repository URL
                      </label>
                      <input
                        type="url"
                        value={project.githubUrl}
                        onChange={(e) =>
                          handleProjectFieldChange(project.id, 'githubUrl', e.target.value)
                        }
                        placeholder="https://github.com/username/project"
                        className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>

                    <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                      <label className="block text-xs font-medium text-slate-500">
                        Live Demo URL
                      </label>
                      <input
                        type="url"
                        value={project.liveUrl}
                        onChange={(e) =>
                          handleProjectFieldChange(project.id, 'liveUrl', e.target.value)
                        }
                        placeholder="https://project-demo.com"
                        className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddProject}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>+</span> Add Another Project
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: Success / Confirmation */}
        {/* ========================================================================= */}
        {step === 5 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-[#00d66c]/15 text-[#00d66c] rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-xs">
              ✓
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Profile Complete!
            </h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
              Your student profile has been set up successfully. You can now browse verified
              opportunities and apply seamlessly.
            </p>

            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-neutral-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Go to Dashboard &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        {step < 5 && (
          <div className="flex items-center justify-between pt-8 mt-6 border-t border-slate-100">
            {/* Back Button */}
            <button
              type="button"
              onClick={handleBack}
              className="px-7 py-3 rounded-xl bg-[#f4f4f5] hover:bg-[#e4e4e7] active:bg-[#e4e4e7] text-slate-800 font-semibold text-sm transition-colors cursor-pointer"
            >
              Back
            </button>

            {/* Actions per Step */}
            {step === 3 ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSkipStep3}
                  className="px-6 py-3 rounded-xl bg-[#f4f4f5] hover:bg-[#e4e4e7] text-slate-800 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-9 py-3 rounded-xl bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-semibold text-sm transition-all shadow-sm cursor-pointer active:scale-98"
                >
                  Next
                </button>
              </div>
            ) : step === 4 ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSkipProjects}
                  className="px-6 py-3 rounded-xl bg-[#f4f4f5] hover:bg-[#e4e4e7] text-slate-800 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-9 py-3 rounded-xl bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-semibold text-sm transition-all shadow-sm cursor-pointer active:scale-98"
                >
                  Complete Setup
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-9 py-3 rounded-xl bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-semibold text-sm transition-all shadow-sm cursor-pointer active:scale-98"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

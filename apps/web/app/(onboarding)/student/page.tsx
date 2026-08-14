'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function StudentOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Step 1: Basic Info (starts empty with placeholders)
  const [fullName, setFullName] = useState('')
  const [headline, setHeadline] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [bio, setBio] = useState('')

  // Step 2: Experience & Education (starts empty with placeholders)
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [experienceSummary, setExperienceSummary] = useState('')

  const [school, setSchool] = useState('')
  const [degree, setDegree] = useState('')
  const [gpa, setGpa] = useState('')

  // Step 3: Skills, Links & Projects (starts empty with placeholders)
  const [skills, setSkills] = useState<string[]>([])
  const [newSkillInput, setNewSkillInput] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')

  const [projectTitle, setProjectTitle] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectLink, setProjectLink] = useState('')

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

  const handleNext = () => {
    if (step === 1) setStep(2)
    else if (step === 2) setStep(3)
    else if (step === 3) setStep(4)
  }

  const handleBack = () => {
    if (step === 1) router.push('/role-select')
    else if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
    else if (step === 4) setStep(3)
  }

  return (
    <main className="min-h-screen w-full bg-white text-[#121212] flex flex-col justify-between items-center py-8 px-4 sm:px-6 md:px-8 selection:bg-[#00d66c]/20 selection:text-[#121212]">
      {/* Content Container (Flat, No Card Box) */}
      <div className="w-full max-w-xl my-auto py-2 flex flex-col justify-between">
        {/* Connected Node Progress Bar (Top) */}
        {step < 4 && (
          <div className="w-full mb-8 pt-1">
            <div className="relative flex items-center justify-between px-3">
              {/* Horizontal Connecting Track */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-slate-200 z-0">
                <div
                  className="h-full bg-[#00d66c] transition-all duration-300"
                  style={{
                    width: step === 1 ? '0%' : step === 2 ? '100%' : '100%',
                  }}
                />
              </div>

              {/* Node 1 */}
              <div className="relative z-10 flex items-center justify-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    step >= 1
                      ? 'bg-[#00d66c] text-white shadow-xs'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
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
                </div>
              </div>

              {/* Node 2 */}
              <div className="relative z-10 flex items-center justify-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    step >= 2
                      ? 'bg-[#00d66c] text-white shadow-xs'
                      : 'bg-white border-2 border-[#00d66c] text-[#00d66c]'
                  }`}
                >
                  {step >= 2 ? (
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
                    <span>2</span>
                  )}
                </div>
              </div>

              {/* Node 3 */}
              <div className="relative z-10 flex items-center justify-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    step >= 3
                      ? 'bg-[#00d66c] text-white shadow-xs'
                      : step === 2
                        ? 'bg-white border-2 border-[#00d66c] text-[#00d66c]'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {step >= 3 ? (
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
                    <span>3</span>
                  )}
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
                Step 1 of 3
              </span>
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mt-1 leading-tight">
                Complete Your Profile
              </h1>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Enter your basic details to set up your professional profile.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleNext()
              }}
              className="space-y-4 pt-1"
            >
              {/* Name */}
              <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                <label className="block text-xs font-medium text-slate-500">Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full text-slate-900 font-semibold text-sm sm:text-base outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {/* Headline */}
              <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                <label className="block text-xs font-medium text-slate-500">Headline</label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Computer Science Student at University"
                  className="w-full text-slate-900 font-semibold text-sm sm:text-base outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {/* Graduation Year */}
              <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                <label className="block text-xs font-medium text-slate-500">Graduation Year</label>
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full text-slate-900 font-semibold text-sm sm:text-base outline-none bg-transparent pt-0.5 cursor-pointer appearance-none"
                >
                  <option value="">Select graduation year</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                </select>
              </div>

              {/* Bio */}
              <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                <label className="block text-xs font-medium text-slate-500">Bio / Summary</label>
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
        {/* STEP 2: Experience & Education */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500 font-sans tracking-wide">
                Step 2 of 3
              </span>
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mt-1 leading-tight">
                Experience &amp; Education
              </h1>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Add your background and education details.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Experience Fields */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Experience (Optional)
                </h3>

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

              {/* Education Fields */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Education
                </h3>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                    <label className="block text-xs font-medium text-slate-500">
                      University / School
                    </label>
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="e.g. University of Technology"
                      className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                    <label className="block text-xs font-medium text-slate-500">
                      Degree &amp; Major
                    </label>
                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="e.g. B.S. in Computer Science"
                      className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                  <label className="block text-xs font-medium text-slate-500">GPA (Optional)</label>
                  <input
                    type="text"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    placeholder="e.g. 3.8 / 4.0 or 8.5 / 10.0"
                    className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Skills, Links & Projects */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500 font-sans tracking-wide">
                Step 3 of 3
              </span>
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mt-1 leading-tight">
                Skills &amp; Projects
              </h1>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Add your technical skills, profiles, and key project links.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Skills Input */}
              <div className="space-y-2">
                <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500">Key Skills</label>
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

              {/* External Links */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                  <label className="block text-xs font-medium text-slate-500">LinkedIn URL</label>
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>

                <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                  <label className="block text-xs font-medium text-slate-500">
                    Portfolio / GitHub
                  </label>
                  <input
                    type="text"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://github.com/username or yoursite.com"
                    className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Projects */}
              <div className="space-y-3 pt-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Featured Project (Optional)
                </h3>

                <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                  <label className="block text-xs font-medium text-slate-500">Project Title</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. Real-time Chat App"
                    className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>

                <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                  <label className="block text-xs font-medium text-slate-500">
                    Project Description
                  </label>
                  <textarea
                    rows={2}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Brief description of the technologies used and key features..."
                    className="w-full text-slate-900 font-normal text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 resize-none"
                  />
                </div>

                <div className="rounded-xl border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black px-4 py-2.5 transition-all bg-white">
                  <label className="block text-xs font-medium text-slate-500">
                    Project Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={projectLink}
                    onChange={(e) => setProjectLink(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent pt-0.5 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: Success / Confirmation */}
        {/* ========================================================================= */}
        {step === 4 && (
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
        {step < 4 && (
          <div className="flex items-center justify-between pt-8 mt-6 border-t border-slate-100">
            {/* Back Button */}
            <button
              type="button"
              onClick={handleBack}
              className="px-7 py-3 rounded-xl bg-[#f4f4f5] hover:bg-[#e4e4e7] active:bg-[#e4e4e7] text-slate-800 font-semibold text-sm transition-colors cursor-pointer"
            >
              Back
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="px-9 py-3 rounded-xl bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-semibold text-sm transition-all shadow-sm cursor-pointer active:scale-98"
            >
              {step === 3 ? 'Complete' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

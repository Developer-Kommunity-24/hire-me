'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  FolderGit2,
  Globe,
  GraduationCap,
  Link2,
  Loader2,
  Mail,
  RotateCcw,
  Search,
  SearchX,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Dk24VerifiedBadge from '@/components/common/Dk24VerifiedBadge'
import UserAvatar from '@/components/student-profile/UserAvatar'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import {
  searchTalents,
  talentsQueryKey,
  type TalentCandidate,
  type TalentSearchResponse,
} from '@/lib/talents-api'

const GRAD_YEAR_OPTIONS = ['all', '2024', '2025', '2026', '2027', '2028']

function CandidatesContent() {
  const searchParams = useSearchParams()
  const initialSkill = searchParams.get('skill')

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(initialSkill ?? '')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [gradYear, setGradYear] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'updatedAt' | 'fullName' | 'gradYear'>('updatedAt')
  const [currentPage, setCurrentPage] = useState(1)

  // Dialog State: Candidate selected for "View Profile"
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate | null>(null)
  const [isCopiedEmail, setIsCopiedEmail] = useState(false)

  // Query: Talent search with auto-polling so new accounts appear automatically
  const {
    data: talentData,
    isLoading,
    isError,
    refetch,
  } = useQuery<TalentSearchResponse>({
    queryKey: talentsQueryKey({
      q: searchQuery.trim() || undefined,
      dk24Status: verifiedOnly ? 'verified' : undefined,
      gradYear: gradYear !== 'all' ? Number(gradYear) : undefined,
      sortBy,
      order: sortBy === 'fullName' ? 'asc' : 'desc',
      page: currentPage,
      limit: 12,
    }),
    queryFn: () =>
      searchTalents({
        q: searchQuery.trim() || undefined,
        dk24Status: verifiedOnly ? 'verified' : undefined,
        gradYear: gradYear !== 'all' ? Number(gradYear) : undefined,
        sortBy,
        order: sortBy === 'fullName' ? 'asc' : 'desc',
        page: currentPage,
        limit: 12,
      }),
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  const handleResetFilters = () => {
    setSearchQuery('')
    setVerifiedOnly(false)
    setGradYear('all')
    setSortBy('updatedAt')
    setCurrentPage(1)
  }

  const hasActiveFilters =
    searchQuery.trim() !== '' || verifiedOnly || gradYear !== 'all' || sortBy !== 'updatedAt'

  const candidates = talentData?.data ?? []
  const meta = talentData?.meta ?? {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  }

  const handleCopyEmail = (email?: string) => {
    if (!email) {
      toast.info('Student email address is not publicly listed')
      return
    }
    navigator.clipboard.writeText(email)
    setIsCopiedEmail(true)
    toast.success('Email copied to clipboard')
    setTimeout(() => setIsCopiedEmail(false), 2000)
  }

  return (
    <div className="flex min-h-screen bg-bg-page font-sans">
      <Sidebar />
      <div className="min-w-0 flex-1 lg:ml-64 flex flex-col">
        <Topbar />

        <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-text-main flex items-center gap-2">
                  <Users className="w-6 h-6 text-brand" />
                  Candidate Directory
                </h1>
                <Badge variant="secondary">
                  {meta.total} {meta.total === 1 ? 'student' : 'students'}
                </Badge>
              </div>
              <p className="text-sm text-text-muted mt-1">
                Explore all registered students on Hire-Me.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild size="sm">
                <Link href="/dashboard/recruiter/jobs">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                  View My Jobs
                </Link>
              </Button>
            </div>
          </div>

          {/* Search & Filter Controls Card */}
          <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-xs space-y-4">
            {/* Primary Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search candidates by name, headline, bio, or skills..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-border-subtle bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-text-main outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Secondary Filters Bar: DK24, Grad Year, Sort */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* DK24 Verified Toggle */}
              <button
                type="button"
                onClick={() => {
                  setVerifiedOnly(!verifiedOnly)
                  setCurrentPage(1)
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  verifiedOnly
                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                    : 'bg-white text-slate-600 border-border-subtle hover:bg-slate-50'
                }`}
              >
                <ShieldCheck
                  className={`w-3.5 h-3.5 ${verifiedOnly ? 'text-purple-600' : 'text-slate-400'}`}
                />
                DK24 Verified only
              </button>

              {/* Graduation Year Select */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">Grad Year:</span>
                <select
                  value={gradYear}
                  onChange={(e) => {
                    setGradYear(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="rounded-lg border border-border-subtle bg-white px-2 py-1 text-xs text-text-main outline-none focus:border-brand"
                >
                  <option value="all">All Years</option>
                  {GRAD_YEAR_OPTIONS.filter((y) => y !== 'all').map((year) => (
                    <option key={year} value={year}>
                      Class of {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset all filters */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset all
                </button>
              )}
            </div>
          </div>

          {/* Candidates Grid / Loading / Empty */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-slate-200 bg-white">
              <Loader2 className="w-8 h-8 animate-spin text-brand mb-3" />
              <p className="text-sm font-semibold text-slate-700">Searching candidate pool...</p>
              <p className="text-xs text-slate-400 mt-1">
                Matching student profiles and skills across Hire-Me
              </p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center">
              <SearchX className="w-10 h-10 text-rose-500 mb-3" />
              <h3 className="text-base font-bold text-rose-900">Unable to load candidates</h3>
              <p className="text-xs text-rose-700 max-w-md mt-1 mb-4">
                Failed to communicate with the talent discovery service. Please verify your
                connection and try again.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry Search
              </Button>
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No candidates found</h3>
              <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
                {hasActiveFilters
                  ? 'No students matched all of your filter criteria. Try removing some skills or broadening your search keywords.'
                  : 'There are currently no students listed in the talent directory.'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Candidates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {candidates.map((candidate) => {
                  const isVerified = candidate.dk24Status === 'verified'

                  return (
                    <div
                      key={candidate.id}
                      className="rounded-2xl border border-border-subtle bg-white p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Profile Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={candidate.fullName}
                              size="44"
                              round={false}
                              className="rounded-xl shadow-xs"
                            />
                            <div className="min-w-0">
                              <h3 className="text-base font-bold text-text-main truncate flex items-center gap-1.5">
                                <span className="truncate">{candidate.fullName}</span>
                                {isVerified && (
                                  <Dk24VerifiedBadge iconOnly size="sm" label="DK24 Verified" />
                                )}
                              </h3>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs text-text-muted truncate">
                                  {candidate.headline || 'Student on Hire-Me'}
                                </p>
                                {candidate.openToWork && <Badge variant="outline">Available</Badge>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Education / Grad Year / Degree */}
                        {(candidate.degree || candidate.school || candidate.gradYear) && (
                          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                            {candidate.degree && <span>{candidate.degree}</span>}
                            {candidate.school && <span>• {candidate.school}</span>}
                            {candidate.gradYear && (
                              <span className="font-semibold text-slate-700">
                                • Class of {candidate.gradYear}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Bio summary */}
                        {candidate.bio && (
                          <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {candidate.bio}
                          </p>
                        )}

                        {/* Skills chips */}
                        {candidate.skills && candidate.skills.length > 0 && (
                          <div className="mt-3.5 flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 5).map((skill) => {
                              const isMatched =
                                searchQuery.trim().length > 0 &&
                                skill.toLowerCase().includes(searchQuery.trim().toLowerCase())
                              return (
                                <span
                                  key={skill}
                                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                                    isMatched
                                      ? 'bg-blue-100 text-blue-800 font-semibold border border-blue-200'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {skill}
                                </span>
                              )
                            })}
                            {candidate.skills.length > 5 && (
                              <span className="px-1.5 py-0.5 text-[11px] text-slate-400 font-medium">
                                +{candidate.skills.length - 5}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Projects and Links */}
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                          {candidate.projects && candidate.projects.length > 0 ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                              <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                              {candidate.projects.length}{' '}
                              {candidate.projects.length === 1 ? 'Project' : 'Projects'}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Talent Pool Member</span>
                          )}

                          {/* Social links */}
                          <div className="flex items-center gap-2">
                            {candidate.githubUrl && (
                              <a
                                href={candidate.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-slate-700 transition"
                                title="GitHub Profile"
                              >
                                <Globe className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {candidate.linkedinUrl && (
                              <a
                                href={candidate.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-blue-600 transition"
                                title="LinkedIn Profile"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {candidate.resumeUrl && (
                              <a
                                href={candidate.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand hover:underline font-semibold text-[11px]"
                              >
                                Resume
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 *:flex-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          View Profile
                        </Button>

                        {candidate.email ? (
                          <Button asChild size="sm">
                            <a href={`mailto:${candidate.email}`}>
                              <Mail className="w-3.5 h-3.5 mr-1.5" />
                              Contact
                            </a>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setSelectedCandidate(candidate)}
                          >
                            View Profile
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination Controls */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <p className="text-xs text-slate-500">
                    Showing {(meta.page - 1) * meta.limit + 1}–
                    {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} candidates
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!meta.hasPrev}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                      Previous
                    </Button>
                    <span className="text-xs font-semibold px-2">
                      Page {meta.page} of {meta.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!meta.hasNext}
                      onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))}
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* DIALOG 2: View Full Candidate Profile & Projects */}
          {selectedCandidate && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
              onClick={() => setSelectedCandidate(null)}
            >
              <div
                className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={selectedCandidate.fullName}
                      size="52"
                      round={false}
                      className="rounded-xl shadow-xs"
                    />
                    <div>
                      <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                        {selectedCandidate.fullName}
                        {selectedCandidate.dk24Status === 'verified' && (
                          <Dk24VerifiedBadge size="sm" label="DK24 Verified" />
                        )}
                      </h2>
                      <p className="text-xs text-text-muted">
                        {selectedCandidate.headline || 'Student on Hire-Me'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCandidate(null)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Candidate Email Box */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Email Address
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate block">
                        {selectedCandidate.email || 'Email not publicly listed'}
                      </span>
                    </div>
                  </div>
                  {selectedCandidate.email && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyEmail(selectedCandidate.email)}
                      >
                        {isCopiedEmail ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button asChild size="sm">
                        <a href={`mailto:${selectedCandidate.email}`}>
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          Mail
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                {/* About / Bio */}
                {selectedCandidate.bio && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      About
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {selectedCandidate.bio}
                    </p>
                  </div>
                )}

                {/* Education */}
                {(selectedCandidate.degree ||
                  selectedCandidate.school ||
                  selectedCandidate.gradYear) && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Education
                    </h4>
                    <p className="text-xs text-slate-600">
                      {[
                        selectedCandidate.degree,
                        selectedCandidate.school,
                        selectedCandidate.gradYear
                          ? `Class of ${selectedCandidate.gradYear}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Showcase */}
                {selectedCandidate.projects && selectedCandidate.projects.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-brand" />
                      Projects ({selectedCandidate.projects.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedCandidate.projects.map((project) => (
                        <div
                          key={project.id}
                          className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">
                              {project.title}
                            </span>
                            <div className="flex items-center gap-2">
                              {project.githubUrl && (
                                <a
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
                                >
                                  <Globe className="w-3 h-3" /> Code
                                </a>
                              )}
                              {project.liveUrl && (
                                <a
                                  href={project.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-brand hover:underline inline-flex items-center gap-1 font-semibold"
                                >
                                  <ExternalLink className="w-3 h-3" /> Demo
                                </a>
                              )}
                            </div>
                          </div>
                          {project.description && (
                            <p className="text-xs text-slate-600">{project.description}</p>
                          )}
                          {project.skillsUsed && project.skillsUsed.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {project.skillsUsed.map((s) => (
                                <span
                                  key={s}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* External links */}
                <div className="flex flex-wrap gap-3 pt-2 border-t text-xs">
                  {selectedCandidate.resumeUrl && (
                    <a
                      href={selectedCandidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand font-semibold hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Resume
                    </a>
                  )}
                  {selectedCandidate.githubUrl && (
                    <a
                      href={selectedCandidate.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-700 font-semibold hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" /> GitHub Profile
                    </a>
                  )}
                  {selectedCandidate.linkedinUrl && (
                    <a
                      href={selectedCandidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                    >
                      <Link2 className="w-3.5 h-3.5" /> LinkedIn Profile
                    </a>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedCandidate(null)}
                  >
                    Close
                  </Button>
                  {selectedCandidate.email && (
                    <Button asChild>
                      <a href={`mailto:${selectedCandidate.email}`}>
                        <Mail className="w-3.5 h-3.5 mr-1.5" />
                        Send Email
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function CandidatesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      }
    >
      <CandidatesContent />
    </Suspense>
  )
}

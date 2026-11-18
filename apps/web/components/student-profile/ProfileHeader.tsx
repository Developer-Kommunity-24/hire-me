'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  BadgeCheck,
  Briefcase,
  Download,
  ExternalLink,
  GitFork,
  Globe,
  Link2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import UserAvatar from './UserAvatar'
import StudentVerificationDialog from './StudentVerificationDialog'
import type { ProfileData } from './types'

const AVATAR_SIZE = '88'

function ContactDetail({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {children}
    </span>
  )
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

export default function ProfileHeader({ profile }: { profile: ProfileData }) {
  const [isVerifyOpen, setIsVerifyOpen] = useState(false)
  const githubUrl = normalizeUrl(profile.github)
  const linkedinUrl = normalizeUrl(profile.linkedin)
  const portfolioUrl = normalizeUrl(profile.portfolio)
  const resumeUrl = profile.resumeLink ? normalizeUrl(profile.resumeLink) : ''
  const phoneHref = profile.phone ? `tel:${profile.phone.replace(/\s+/g, '')}` : ''

  const hasContactDetails = Boolean(
    profile.location ||
    profile.email ||
    profile.phone ||
    githubUrl ||
    linkedinUrl ||
    portfolioUrl ||
    profile.otherLinks.length > 0,
  )

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <figure className="relative shrink-0">
            <UserAvatar
              name={profile.name}
              size={AVATAR_SIZE}
              className="ring-4 ring-card shadow-md"
              round
            />
          </figure>

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 className="text-2xl font-extrabold text-text-main tracking-tight leading-tight">
                {profile.name}
              </h1>
              {profile.isVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs bg-brand-light text-brand-dark border border-brand-mint uppercase tracking-wide font-bold">
                  <BadgeCheck className="w-3.5 h-3.5 text-brand" />
                  Verified Student
                </span>
              )}
              {profile.openToWork && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide font-bold">
                  <Briefcase className="w-3.5 h-3.5" />
                  Open to Work
                </span>
              )}
            </div>

            {profile.degree && (
              <p className="text-sm font-medium text-text-muted mb-2.5">{profile.degree}</p>
            )}

            {profile.bio && (
              <p className="text-sm text-text-muted leading-relaxed mb-4">{profile.bio}</p>
            )}

            {hasContactDetails && (
              <address className="not-italic flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-text-muted mb-4">
                {profile.location && (
                  <ContactDetail icon={<MapPin className="w-3.5 h-3.5 shrink-0" />}>
                    {profile.location}
                  </ContactDetail>
                )}

                {profile.email && (
                  <ContactDetail icon={<Mail className="w-3.5 h-3.5 shrink-0" />}>
                    <a
                      href={`mailto:${profile.email}`}
                      className="hover:text-text-main hover:underline transition-colors"
                    >
                      {profile.email}
                    </a>
                  </ContactDetail>
                )}

                {phoneHref && (
                  <ContactDetail icon={<Phone className="w-3.5 h-3.5 shrink-0" />}>
                    <a
                      href={phoneHref}
                      className="hover:text-text-main hover:underline transition-colors"
                    >
                      {profile.phone}
                    </a>
                  </ContactDetail>
                )}

                {githubUrl && (
                  <ContactDetail icon={<GitFork className="w-3.5 h-3.5 shrink-0" />}>
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-text-main hover:underline transition-colors"
                    >
                      {profile.github}
                    </a>
                  </ContactDetail>
                )}

                {linkedinUrl && (
                  <ContactDetail icon={<Link2 className="w-3.5 h-3.5 shrink-0" />}>
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-text-main hover:underline transition-colors"
                    >
                      LinkedIn
                    </a>
                  </ContactDetail>
                )}

                {portfolioUrl && (
                  <ContactDetail icon={<Globe className="w-3.5 h-3.5 shrink-0" />}>
                    <a
                      href={portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-text-main hover:underline transition-colors"
                    >
                      Portfolio
                    </a>
                  </ContactDetail>
                )}

                {profile.otherLinks.map((link) => (
                  <ContactDetail
                    key={`${link.label}-${link.url}`}
                    icon={<ExternalLink className="w-3.5 h-3.5 shrink-0" />}
                  >
                    <a
                      href={normalizeUrl(link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-text-main hover:underline transition-colors"
                    >
                      {link.label}
                    </a>
                  </ContactDetail>
                ))}
              </address>
            )}

            <div className="flex flex-wrap items-center gap-2.5">
              <div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/student/profile/edit">
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </Link>
                </Button>
              </div>

              {!profile.isVerified && (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVerifyOpen(true)}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Get Verified</span>
                  </Button>
                </div>
              )}

              {resumeUrl && (
                <div>
                  <Button asChild variant="outline" size="sm">
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CV</span>
                    </a>
                  </Button>
                </div>
              )}

              <span className="text-xs font-medium text-text-muted">
                Profile completeness: {profile.completionPercentage}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <StudentVerificationDialog isOpen={isVerifyOpen} onClose={() => setIsVerifyOpen(false)} />
    </Card>
  )
}

'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { MapPin, Mail, Download, Pencil, GitFork, BadgeCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import UserAvatar from './UserAvatar'
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

function normalizeGithubUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

export default function ProfileHeader({ profile }: { profile: ProfileData }) {
  const normalizedGithubUrl = normalizeGithubUrl(profile.github)

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
            </div>

            <p className="text-sm font-medium text-text-muted mb-2.5">{profile.degree}</p>

            <address className="not-italic flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-text-muted mb-4">
              <ContactDetail icon={<MapPin className="w-3.5 h-3.5 shrink-0" />}>
                {profile.location}
              </ContactDetail>

              <ContactDetail icon={<Mail className="w-3.5 h-3.5 shrink-0" />}>
                <a
                  href={`mailto:${profile.email}`}
                  className="hover:text-text-main hover:underline transition-colors"
                >
                  {profile.email}
                </a>
              </ContactDetail>

              {normalizedGithubUrl && (
                <ContactDetail icon={<GitFork className="w-3.5 h-3.5 shrink-0" />}>
                  <a
                    href={normalizedGithubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-text-main hover:underline transition-colors"
                  >
                    {profile.github}
                  </a>
                </ContactDetail>
              )}
            </address>

            <div className="flex flex-wrap items-center gap-2.5">
              <div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/student/profile/edit">
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </Link>
                </Button>
              </div>

              {profile.resumeLink && (
                <div>
                  <Button asChild variant="outline" size="sm">
                    <a href={profile.resumeLink} target="_blank" rel="noopener noreferrer">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CV</span>
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

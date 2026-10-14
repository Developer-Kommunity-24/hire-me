'use client'

import { useState, useRef, useEffect, type ChangeEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { Camera, MapPin, Mail, Download, Pencil } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import UserAvatar from './UserAvatar'
import type { ProfileData } from './types'

function GithubIcon({ className = 'w-3.5 h-3.5 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function VerifiedCheckIcon({ className = 'w-3.5 h-3.5 text-brand' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
      />
    </svg>
  )
}

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
  const [photoUrl, setPhotoUrl] = useState<string>(profile.photoUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const blobUrlRef = useRef<string | null>(null)

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
      const previewUrl = URL.createObjectURL(file)
      blobUrlRef.current = previewUrl
      setPhotoUrl(previewUrl)
    }
  }

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
    }
  }, [])

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const normalizedGithubUrl = normalizeGithubUrl(profile.github)

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <figure className="relative shrink-0 group">
          <UserAvatar
            name={profile.name}
            photoUrl={photoUrl}
            size={AVATAR_SIZE}
            className="ring-4 ring-card shadow-md"
            round
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
            aria-label="Upload profile picture"
          />
          <Button
            onClick={handleButtonClick}
            aria-label="Upload profile picture"
            size="icon"
            variant="default"
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand hover:bg-brand-hover p-0 flex items-center justify-center shadow-sm cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </Button>
        </figure>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl font-extrabold text-text-main tracking-tight leading-tight">
              {profile.name}
            </h1>
            {profile.isVerified && (
              <Badge
                variant="secondary"
                className="gap-1.5 px-3 bg-brand-light text-brand-dark border-brand-mint uppercase tracking-wide font-bold"
              >
                <VerifiedCheckIcon className="w-3.5 h-3.5" />
                Verified Student
              </Badge>
            )}
          </div>

          <p className="text-sm font-medium text-text-muted mb-2.5">{profile.degree}</p>

          <address className="not-italic flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-text-muted mb-4">
            <ContactDetail icon={<MapPin className="w-3.5 h-3.5 shrink-0" />}>
              {profile.location}
            </ContactDetail>

            <ContactDetail icon={<GithubIcon className="w-3.5 h-3.5 shrink-0" />}>
              <a
                href={normalizedGithubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-main transition-colors duration-150"
              >
                {profile.github}
              </a>
            </ContactDetail>

            <ContactDetail icon={<Mail className="w-3.5 h-3.5 shrink-0" />}>
              <a
                href={`mailto:${profile.email}`}
                className="hover:text-text-main transition-colors duration-150"
              >
                {profile.email}
              </a>
            </ContactDetail>
          </address>

          <div className="flex flex-wrap gap-3" role="group" aria-label="Profile actions">
            {profile.resumeLink ? (
              <Button asChild className="gap-2 px-5 py-2.5">
                <a href={profile.resumeLink} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4" strokeWidth={2} />
                  Download Resume
                </a>
              </Button>
            ) : (
              <Button
                asChild
                disabled
                variant="secondary"
                className="gap-2 px-5 py-2.5 bg-border-subtle text-text-muted cursor-not-allowed opacity-60 shadow-xs border-transparent hover:bg-border-subtle hover:border-transparent active:scale-100"
              >
                <span aria-disabled="true">
                  <Download className="w-4 h-4" strokeWidth={2} />
                  Download Resume
                </span>
              </Button>
            )}
            <Button asChild variant="outline" className="gap-2 px-5 py-2.5">
              <Link href="/student/profile/edit">
                <Pencil className="w-4 h-4" strokeWidth={2} />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

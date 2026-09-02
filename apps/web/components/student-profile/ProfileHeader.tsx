'use client'

import { useState, useRef, useEffect, type ChangeEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { Camera, MapPin, Mail, Download, Pencil } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GithubIcon, VerifiedCheckIcon } from '@/components/ui/icons'
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
    <Card as="section" className="p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
        <figure className="relative shrink-0 w-[88px] h-[88px]">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
            aria-label="Upload profile photo"
          />
          <UserAvatar
            name={profile.name}
            photoUrl={photoUrl}
            size={AVATAR_SIZE}
            round={true}
            className="w-[88px] h-[88px] ring-4 ring-card shadow-sm"
          />
          <button
            type="button"
            onClick={handleButtonClick}
            className="absolute bottom-0 right-0 w-7 h-7 bg-brand rounded-full flex items-center justify-center shadow-md hover:bg-brand-hover hover:scale-110 active:scale-95 transition-all duration-150 ease-in-out cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            aria-label="Change profile photo"
          >
            <Camera className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </button>
        </figure>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl font-extrabold text-text-main tracking-tight leading-tight">
              {profile.name}
            </h1>
            {profile.isVerified && (
              <Badge variant="emerald" className="gap-1.5 px-3">
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
              <a
                href={profile.resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-hover active:bg-brand-dark active:scale-95 transition-all duration-150 shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <Download className="w-4 h-4" strokeWidth={2} />
                Download Resume
              </a>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-2 bg-border-subtle text-text-muted px-5 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed opacity-60 shadow-xs"
              >
                <Download className="w-4 h-4" strokeWidth={2} />
                Download Resume
              </span>
            )}
            <Link
              href="/student/profile/edit"
              className="inline-flex items-center gap-2 bg-card text-text-main px-5 py-2.5 rounded-xl text-sm font-semibold border border-border-subtle hover:bg-bg-page hover:border-border-muted active:bg-border-subtle active:scale-95 transition-all duration-150 shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Pencil className="w-4 h-4" strokeWidth={2} />
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}

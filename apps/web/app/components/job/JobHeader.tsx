// components/job/JobHeader.tsx
'use client'

import React, { useState } from 'react'
import { Job } from '../../types/job'
import { Button } from '@/components/ui/button'
import { Bookmark, Share2, MapPin, Building2 } from 'lucide-react'

export const JobHeader = ({ job }: { job: Job }) => {
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // 1. Handle Save Toggle with Optimistic Updates & Rollback
  const handleToggleSave = async () => {
    if (isSaving) return

    const previousState = isSaved
    // Optimistically toggle UI state
    setIsSaved(!previousState)
    setIsSaving(true)

    try {
      const res = await fetch(`/api/postings/${job.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        // Rollback state if backend returns an error
        setIsSaved(previousState)
      }
    } catch (err) {
      console.error('Failed to save job:', err)
      // Rollback state if network request fails / running without backend
      setIsSaved(previousState)
    } finally {
      setIsSaving(false)
    }
  }

  // 2. Safe Share / Copy Link Handler
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  return (
    <div className="bg-card border rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            {job.company && (
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {job.company}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial">
            <Button
              variant={isSaved ? 'default' : 'outline'}
              onClick={handleToggleSave}
              disabled={isSaving}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          </div>

          <div className="flex-1 sm:flex-initial">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              {copied ? 'Copied!' : 'Share'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

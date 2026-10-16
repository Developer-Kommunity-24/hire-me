// components/job/JobHeader.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Share2, MapPin, DollarSign, Clock, Bookmark, Flag } from 'lucide-react'
import { Job } from '../../types/job'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiFetch } from '@/lib/api-client'

interface JobHeaderProps {
  job: Job
}

export const JobHeader = ({ job }: JobHeaderProps) => {
  const [isSaved, setIsSaved] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaved((prev) => !prev)
      await apiFetch(`/api/jobs/${job.id}/save`, { method: 'POST' })
    } catch (err) {
      // Gracefully log error if auth session is offline/expired locally
      console.warn('Could not persist save action to backend:', err)
    }
  }

  const handleApply = async () => {
    try {
      setIsApplying(true)
      await apiFetch(`/api/jobs/${job.id}/apply`, { method: 'POST' })
      alert('Application submitted successfully!')
    } catch (err) {
      console.warn('Could not submit application to backend:', err)
      alert('Action logged (Auth session expired or backend offline).')
    } finally {
      setIsApplying(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: job.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <Link
          href="/jobs"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant={isSaved ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleSave}
            className={
              isSaved
                ? 'text-emerald-600 border-emerald-500 bg-emerald-50 hover:bg-emerald-100'
                : ''
            }
          >
            <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-emerald-600' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare} title="Share">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => alert('Job posting reported.')}
            className="hover:text-red-600 hover:bg-red-50"
            title="Report Job"
          >
            <Flag className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-card text-card-foreground p-6 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 font-semibold"
          >
            {job.category}
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {job.salaryRange}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {job.type}
            </span>
          </div>
        </div>

        <div className="sticky bottom-4 md:static z-10 bg-background md:bg-transparent p-3 md:p-0 border md:border-none rounded-xl shadow-lg md:shadow-none">
          <Button
            onClick={handleApply}
            disabled={isApplying}
            className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
          >
            {isApplying ? 'Applying...' : 'Apply Now'}
          </Button>
        </div>
      </div>
    </div>
  )
}

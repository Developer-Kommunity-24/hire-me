'use client'

import React, { useEffect, useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import { AppLayout } from '../../components/layout/AppLayout'
import { JobHeader } from '../../components/job/JobHeader'
import { JobDetails } from '../../components/job/JobDetails'
import { JobSidebar } from '../../components/job/JobSidebar'
import { Job } from '../../types/job'
import { apiFetch, ApiError } from '../../../lib/api-client'

export default function JobPostingPage() {
  const params = useParams()
  const id = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 1. STATE VARIABLES GO HERE:
  const [isSaved, setIsSaved] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true)
        const data = await apiFetch<Job>(`/api/jobs/${id}`)
        setJob(data)
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setJob(null)
        } else {
          setError(err instanceof Error ? err.message : 'An unexpected error occurred')
        }
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchJob()
    }
  }, [id])

  // 2. HANDLER FUNCTIONS GO HERE:
  const handleSave = async () => {
    try {
      setIsSaved((prev) => !prev)
      await apiFetch(`/api/jobs/${id}/save`, { method: 'POST' })
    } catch (err) {
      setIsSaved((prev) => !prev)
      console.error('Failed to save job:', err)
    }
  }

  const handleApply = async () => {
    try {
      setIsApplying(true)
      await apiFetch(`/api/jobs/${id}/apply`, { method: 'POST' })
      alert('Application submitted successfully!')
    } catch (err) {
      console.error('Failed to submit application:', err)
      alert('Could not submit application. Please try again.')
    } finally {
      setIsApplying(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-6 h-6 border-2 border-[#00c950] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200 text-xs">
          Failed to load job posting: {error}
        </div>
      </AppLayout>
    )
  }

  if (!job) {
    notFound()
  }

  return (
    <AppLayout>
      {/* 3. PROPS ARE PASSED TO JOBHEADER HERE IN THE JSX RETURN: */}
      <JobHeader
        job={job}
        isSaved={isSaved}
        isApplying={isApplying}
        onSave={handleSave}
        onApply={handleApply}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <JobDetails job={job} />
        </div>
        <div className="lg:col-span-1">
          <JobSidebar job={job} />
        </div>
      </div>
    </AppLayout>
  )
}

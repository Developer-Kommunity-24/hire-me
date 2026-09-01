'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Share2, MapPin, DollarSign, Clock, Bookmark, Flag } from 'lucide-react'
import { Job } from '../../types/job'

interface JobHeaderProps {
  job: Job
  isSaved?: boolean
  isApplying?: boolean
  onApply?: () => void
  onSave?: () => void
  onReport?: () => void
}

export const JobHeader = ({
  job,
  isSaved = false,
  isApplying = false,
  onApply,
  onSave,
  onReport,
}: JobHeaderProps) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Breadcrumb Navigation & Action Controls */}
      <div className="flex items-center justify-between">
        <Link
          href="/jobs"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className={`inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
              isSaved
                ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: job.title, url: window.location.href })
              } else {
                navigator.clipboard.writeText(window.location.href)
                alert('Link copied to clipboard!')
              }
            }}
            className="p-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onReport ?? (() => alert('Job posting reported.'))}
            className="p-2 border border-gray-200 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title="Report Job"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Role Header */}
      <div className="bg-white p-6 border border-gray-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
            {job.category}
          </span>
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-gray-400" />
              {job.salaryRange}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-400" />
              {job.type}
            </span>
          </div>
        </div>

        {/* Sticky Apply Button wrapper */}
        <div className="sticky bottom-4 md:static z-10 bg-white md:bg-transparent p-3 md:p-0 border md:border-none border-gray-200 rounded-xl shadow-lg md:shadow-none">
          <button
            onClick={onApply}
            disabled={isApplying}
            className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            {isApplying ? 'Applying...' : 'Apply Now'}
          </button>
        </div>
      </div>
    </div>
  )
}

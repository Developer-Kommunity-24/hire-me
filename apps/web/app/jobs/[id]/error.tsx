'use client'

import React, { useEffect } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Job page error caught:', error)
  }, [error])

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
        <p className="text-sm text-gray-500 max-w-md mb-6">
          {error.message ||
            'Failed to load the job details. Please check your network or try again.'}
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </AppLayout>
  )
}

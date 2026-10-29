import Link from 'next/link'
import { Briefcase } from 'lucide-react'

export default function JobPostingsPage() {
  return (
    <main className="min-h-screen bg-bg-page p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/recruiter"
          className="text-sm font-medium text-text-muted hover:text-text-main"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-text-main">Job Postings</h1>

        <p className="mt-2 text-text-muted">Manage your company’s job openings here.</p>

        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bg-page text-text-muted">
            <Briefcase className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-semibold text-text-main">No job postings to display</h2>
          <p className="mt-2 text-sm text-text-muted">
            Job posting data and creation features will be available when the backend integration is
            ready.
          </p>
        </div>
      </div>
    </main>
  )
}

import Link from 'next/link'
import { FileText } from 'lucide-react'

export const metadata = {
  title: 'My Applications — CareerLink',
  description: 'Track and manage your job applications in one place.',
}

export default function ApplicationsPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 py-16 animate-fade-in">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-mint/50">
          <FileText className="w-8 h-8 text-brand" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-text-main mb-2">My Applications</h1>
        <p className="text-text-muted mb-6">
          Your application tracker is coming soon. You&apos;ll be able to monitor every application
          from submission to offer.
        </p>
        <Link
          href="/student/profile"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-dark hover:text-brand transition-colors"
        >
          ← Back to Profile
        </Link>
      </div>
    </main>
  )
}

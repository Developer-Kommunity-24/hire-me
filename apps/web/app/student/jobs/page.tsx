import Link from 'next/link'
import { Briefcase } from 'lucide-react'

export const metadata = {
  title: 'Job Feed — CareerLink',
  description: 'Browse and discover job opportunities tailored to your profile.',
}

export default function JobFeedPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 py-16 animate-fade-in">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-mint/50">
          <Briefcase className="w-8 h-8 text-brand" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-text-main mb-2">Job Feed</h1>
        <p className="text-text-muted mb-6">
          Your personalised job feed is coming soon. We&apos;re working on matching you with the
          best opportunities.
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

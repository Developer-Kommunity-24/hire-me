import Link from 'next/link'
import { Briefcase, FileText, Users } from 'lucide-react'

export default function StudentAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <nav className="flex flex-col gap-3 w-48 p-4 border-r border-border-subtle">
        <Link href="/student-admin/job-feed" className="flex items-center gap-2 text-text-muted">
          <Briefcase size={18} />
          Job Feed
        </Link>
        <Link
          href="/student-admin/applications"
          className="flex items-center gap-2 text-text-muted"
        >
          <FileText size={18} />
          My Applications
        </Link>
        <Link
          href="/student-admin/members"
          className="flex items-center gap-2 text-text-muted font-semibold"
        >
          <Users size={18} />
          Members
        </Link>
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}

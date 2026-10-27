import type { Metadata } from 'next'
import StudentProfileView from '@/components/student-profile/StudentProfileView'

export const metadata: Metadata = {
  title: 'Student Profile — CareerLink',
  description:
    'View and manage your student profile on CareerLink. Showcase your experience, projects, skills, and academics to recruiters.',
}

export default function StudentProfilePage() {
  return <StudentProfileView />
}

import type { Metadata } from 'next'
import EditProfileForm from '@/components/student-profile/edit/EditProfileForm'

export const metadata: Metadata = {
  title: 'Edit Profile — CareerLink',
  description: 'Update your student profile information, skills, experience, and academic details.',
}

export default function EditProfilePage() {
  return <EditProfileForm />
}

import type { ReactNode } from 'react'
import { ProfileProvider } from '@/components/student-profile/ProfileContext'
import Sidebar from '@/components/student-profile/Sidebar'
import Footer from '@/components/student-profile/Footer'

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <div className="min-h-screen bg-bg-page flex">
        <Sidebar />
        <div className="flex-1 lg:ml-[160px] flex flex-col min-h-screen">
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </div>
      </div>
    </ProfileProvider>
  )
}

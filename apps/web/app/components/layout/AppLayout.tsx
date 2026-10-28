'use client'

import React from 'react'
import Sidebar from '@/components/common/Sidebar'
import Header from '@/components/common/Header'
import Footer from '@/components/student-profile/Footer'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-bg-page flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
        <Footer />
      </div>
    </div>
  )
}

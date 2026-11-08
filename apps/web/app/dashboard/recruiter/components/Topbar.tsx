'use client'

import React from 'react'
import Header from '@/components/common/Header'

export interface TopbarProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (val: string) => void
}

export default function Topbar({
  searchPlaceholder = 'Search candidates, jobs...',
  searchValue,
  onSearchChange,
}: TopbarProps) {
  return (
    <Header
      role="recruiter"
      showSearch
      searchPlaceholder={searchPlaceholder}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      showNotifications
      showProfile
      profileHref="/dashboard/recruiter"
      showHelp
      hasMobileSidebar
    />
  )
}

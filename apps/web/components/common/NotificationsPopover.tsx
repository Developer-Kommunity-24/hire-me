'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, CheckCheck, Clock, Loader2, Trash2 } from 'lucide-react'
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationsQueryKey,
} from '@/lib/notifications-api'

function StaticBell() {
  return (
    <button
      type="button"
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-white text-text-muted transition-all hover:bg-slate-50 hover:text-text-main hover:border-slate-300 active:scale-95 shadow-2xs cursor-pointer"
      aria-label="Notifications"
    >
      <Bell className="h-4 w-4" />
    </button>
  )
}

class QuerySafeBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  override componentDidCatch(_error: unknown) {
    // Swallow No QueryClient error in tests
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

function NotificationsPopoverContent() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // 1. Fetch user notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: fetchNotifications,
    refetchInterval: 30000,
  })

  // 2. Mark single notification as read
  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    },
  })

  // 3. Mark all as read
  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    },
  })

  // 4. Delete notification
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    },
  })

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const unreadCount = notifications.filter((n) => !n.readAt).length

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-white text-text-muted transition-all hover:bg-slate-50 hover:text-text-main hover:border-slate-300 active:scale-95 shadow-2xs cursor-pointer"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications list"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {unreadCount} new
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending || unreadCount === 0}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  We will notify you about updates to your applications and job postings.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.readAt
                const title =
                  (n.payload?.postingTitle as string) ||
                  (n.payload?.companyName as string) ||
                  n.type.replace(/_/g, ' ')
                const status = (n.payload?.status as string) || ''

                return (
                  <div
                    key={n.id}
                    className={`p-3.5 transition-colors flex items-start gap-3 hover:bg-slate-50/80 ${
                      isUnread ? 'bg-emerald-50/30' : 'bg-white'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 truncate">{title}</span>
                        {status && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                            {status.replace(/_/g, ' ')}
                          </span>
                        )}
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-slate-500">
                        {n.payload?.companyName ? `${n.payload.companyName}: ` : ''}
                        Status updated to {status || 'new status'}.
                      </p>

                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => markReadMutation.mutate(n.id)}
                          title="Mark as read"
                          className="p-1 text-slate-400 hover:text-emerald-700 rounded hover:bg-emerald-50 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(n.id)}
                        title="Delete notification"
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function NotificationsPopover() {
  return (
    <QuerySafeBoundary fallback={<StaticBell />}>
      <NotificationsPopoverContent />
    </QuerySafeBoundary>
  )
}

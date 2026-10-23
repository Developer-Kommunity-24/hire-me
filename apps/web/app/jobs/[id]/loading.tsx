// apps/web/app/jobs/[id]/loading.tsx
import { AppLayout } from '../../components/layout/AppLayout'

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse space-y-6 max-w-6xl mx-auto p-4">
        {/* Header Skeleton */}
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-6" />

        {/* Grid Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
          <div className="lg:col-span-1">
            <div className="h-80 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

import { Bell, User } from 'lucide-react'
export default function Topbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6 lg:px-8">
      <div className="w-full max-w-xl">
        <input
          type="search"
          placeholder="Search candidates, jobs..."
          className="w-full rounded-lg border border-gray-200 bg-bg-page px-4 py-3 text-sm text-text-main outline-none transition placeholder:text-text-muted focus:border-brand-green focus:ring-2 focus:ring-text-main"
        />
      </div>

      <div className="ml-6 flex items-center gap-5">
        <button
          type="button"
          className="text-lg text-text-muted transition hover:text-text-main"
          aria-label="Notifications"
        >
          <Bell />
        </button>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-page text-sm font-bold text-main"
          aria-label="Profile"
        >
          <User />
        </button>
      </div>
    </header>
  )
}

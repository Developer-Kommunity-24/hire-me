'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [message, setMessage] = useState('')

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    setMessage('')

    localStorage.setItem('user_email', email)

    setTimeout(() => {
      setStatus('success')
      setMessage(`Sign-in successful! Redirecting...`)
      setTimeout(() => {
        router.push('/role-select')
      }, 500)
    }, 600)
  }

  const handleGoogleSignIn = () => {
    setStatus('loading')
    setMessage('')
    localStorage.setItem('user_email', 'google.user@university.edu')

    setTimeout(() => {
      setStatus('success')
      setMessage('Redirecting to role selection...')
      setTimeout(() => {
        router.push('/role-select')
      }, 500)
    }, 500)
  }


  return (
    <main className="min-h-screen h-screen max-h-screen overflow-hidden bg-[#f8fafc] flex items-center justify-center p-0 md:p-6 lg:p-10 selection:bg-[#00d66c]/20 selection:text-[#121212]">
      {/* Dual Pane Container */}
      <div className="w-full max-w-[920px] h-full md:h-[540px] bg-white md:rounded-3xl shadow-2xl border border-slate-200/80 grid md:grid-cols-2 overflow-hidden">
        {/* Left Pane: DK24 Brand Showcase */}
        <div className="relative bg-[#121212] p-8 md:p-10 flex flex-col justify-between overflow-hidden text-white">
          {/* Subtle electric green ambient glows */}
          <div
            className="pointer-events-none absolute -top-16 -right-16 w-60 h-60 rounded-full bg-[#00d66c]/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-0 -left-12 w-56 h-56 rounded-full bg-[#00d66c]/10 blur-3xl"
            aria-hidden="true"
          />

          {/* Top: Brand Logo & Back Link */}
          <div className="relative z-10 flex items-center justify-between -mt-2">
            <Link
              href="/"
              className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              Back
            </Link>
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-tight text-[#00d66c] font-mono">
                DK24
              </span>
            </Link>
          </div>

          {/* Middle: Welcome Message */}
          <div className="relative z-10 my-auto py-4">
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mt-2">
              Welcome
            </h1>
            <p className="text-neutral-400 text-sm mt-2.5 leading-relaxed max-w-[280px]">
              Sign in to manage your DK24 student profile, opportunities, and applications.
            </p>
          </div>
          {/* Bottom: Website Link */}
          <div className="relative z-10 text-xs font-medium text-neutral-500">
            <span>careerlink.dk24.org</span>
          </div>
        </div>

        {/* Right Pane: Clean Sign In Form */}
        <div className="bg-white p-8 md:p-12 flex flex-col justify-center">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              CareerLink
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Sign in to access 
            </p>
          </div>

          {/* Status feedback */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-xl text-xs font-mono transition-all ${status === 'success'
                ? 'bg-surface text-on-primary-container border border-primary-container/50'
                : 'bg-neutral-100 text-on-surface border border-neutral-200'
                }`}
              role="status"
            >
              {message}
            </div>
          )}

          {/* Email Magic Link Form */}
          <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-mono font-semibold tracking-wider text-on-surface-variant uppercase mb-2"
              >
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                disabled={status === 'loading'}
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/70 bg-surface/20 text-on-surface placeholder:text-on-surface-variant/60 placeholder:font-mono text-sm focus:outline-none focus:ring-2 focus:ring-on-surface focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 px-4 bg-on-surface hover:bg-black active:bg-on-surface text-white rounded-lg font-mono text-sm font-medium flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 text-white shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>Send Magic Link</span>
                </>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-outline-variant/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 font-mono text-on-surface-variant font-medium tracking-wider">
                OR
              </span>
            </div>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={status === 'loading'}
            className="w-full py-2.5 px-4 bg-white hover:bg-surface/30 active:bg-surface/50 text-on-surface border border-outline-variant/80 rounded-lg font-mono text-sm font-medium flex items-center justify-center gap-3 transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </main>
  )
}

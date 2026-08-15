import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="bg-card text-text-main min-h-screen flex flex-col justify-between selection:bg-brand/20 selection:text-text-main">
      {/* Top Navigation Bar */}
      <nav className="bg-card/90 backdrop-blur-md border-b border-border-subtle shrink-0 w-full sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 md:px-12 lg:px-16 py-4 max-w-[1360px] mx-auto">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-brand font-mono">
              DK24
            </span>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-text-main">
              CareerLink
            </span>
          </Link>

          {/* Trailing Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="flex items-center justify-center px-5 py-2.5 rounded-xl bg-action-dark hover:bg-black active:scale-95 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full flex items-center py-10 md:py-16">
        <section className="w-full max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left: Typography & Pathways */}
            <div className="flex flex-col z-10">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] font-black tracking-tight leading-[1.12] text-text-main">
                Where college developers meet <span className="text-brand">great companies.</span>
              </h1>

              <p className="text-text-muted text-base sm:text-lg mt-5 leading-relaxed font-normal max-w-lg">
                Showcase what you build, highlight your actual skills, and connect directly with
                teams hiring across the DK24 network.
              </p>

              {/* Dual Action Paths (Flat Typographic Layout) */}
              <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 mt-10 lg:mt-12">
                {/* Path 1: Student */}
                <div className="flex flex-col items-start group">
                  <h2 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
                    I&apos;m a Student
                  </h2>
                  <p className="text-sm text-text-muted leading-relaxed max-w-[260px] mt-1.5">
                    Get the opportunity that boosts your early career trajectory.
                  </p>
                  <Link
                    href="/login"
                    className="font-bold text-sm text-text-main mt-4 inline-flex items-center gap-1.5 group/link group-hover:text-brand transition-colors"
                  >
                    <span>Get Started</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </Link>
                </div>

                {/* Path 2: Recruiter */}
                <div className="flex flex-col items-start group">
                  <h2 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
                    I Want to Hire
                  </h2>
                  <p className="text-sm text-text-muted leading-relaxed max-w-[260px] mt-1.5">
                    Find verified, top-tier entry-level talent in minutes.
                  </p>
                  <Link
                    href="/login"
                    className="font-bold text-sm text-text-main mt-4 inline-flex items-center gap-1.5 group/link group-hover:text-brand transition-colors"
                  >
                    <span>Get Started</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Visual Showcase */}
            <div className="relative h-[420px] lg:h-[460px] w-full hidden lg:block select-none">
              {/* Dark container with DK24 branding */}
              <div className="absolute right-12 top-4 w-[280px] h-[380px] bg-action-dark rounded-3xl p-6 flex flex-col justify-between shadow-2xl border border-neutral-800 z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black font-mono text-brand">DK24</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
                </div>

                <div className="my-auto text-center">
                  <span className="text-5xl font-black text-brand tracking-tight block font-mono">
                    500+
                  </span>
                  <span className="text-xs font-semibold text-neutral-300 mt-1.5 block">
                    Students Hired in Tech
                  </span>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <span>DK24 Community</span>
                  <span className="text-brand font-bold">&check; Verified</span>
                </div>
              </div>

              {/* Floating Talent Preview Card */}
              <div className="absolute right-[-10px] bottom-6 w-[240px] bg-card rounded-2xl p-4 shadow-xl border border-border-subtle z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-bold text-sm">
                    AC
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-main">Alex Chen</h4>
                    <p className="text-[11px] text-text-muted">CS Senior &bull; Frontend</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
                    React
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
                    TypeScript
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
                    Next.js
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

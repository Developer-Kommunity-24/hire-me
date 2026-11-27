import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Briefcase,
  Check,
  FileSpreadsheet,
  GraduationCap,
  IdCard,
  Radar,
  Route,
  Search,
  ShieldCheck,
} from 'lucide-react'
import BrandLogo from '@/components/common/BrandLogo'
import Button from '@/components/common/Button'
import Dk24VerifiedBadge, { Dk24VerifiedIcon } from '@/components/common/Dk24VerifiedBadge'
import { HeroVisual } from './HeroVisual'
import { Reveal } from './Reveal'

export const metadata: Metadata = {
  title: 'DK24 CareerLink — Get hired for what you build',
  description:
    'CareerLink is the hiring platform for the DK24 community. Students showcase real projects and skills; recruiters discover verified talent and track every application.',
}

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#who-its-for', label: 'Students & recruiters' },
  { href: '#verified', label: 'Verification' },
  { href: '#features', label: 'Features' },
]

const STUDENT_POINTS = [
  'Showcase your academics, skills, projects and experience.',
  'Search and filter jobs by role type and work model.',
  'Apply in a click and track every milestone.',
  'Get notified of new roles and status changes.',
]

const RECRUITER_POINTS = [
  'Post roles with stack, compensation and deadline.',
  'Search talent by skill, graduation year and DK24 status.',
  'Move applicants from applied to accepted.',
  'Track jobs, applicants and reviews in one dashboard.',
]

const STEPS = [
  { title: 'Sign in', body: 'Continue with Google and pick your role.' },
  {
    title: 'Build your profile',
    body: 'Add your skills and projects, or your company and roles.',
  },
  { title: 'Get DK24 verified', body: 'Submit your USN to earn the verified badge.' },
  {
    title: 'Apply, hire, track',
    body: 'Follow every application through a clear pipeline.',
  },
]

const FEATURES = [
  {
    icon: Search,
    title: 'A job feed you can actually filter',
    body: 'Filter by role type and work model.',
    tone: 'brand',
  },
  {
    icon: IdCard,
    title: 'Profiles that prove skill',
    body: 'Academics, skills, projects, experience and achievements.',
    tone: 'brand',
  },
  {
    icon: Route,
    title: 'Application tracking',
    body: 'See where every application stands, step by step.',
    tone: 'brand',
  },
  {
    icon: Radar,
    title: 'Talent search for recruiters',
    body: 'Filter by skill, graduation year and verification.',
    tone: 'recruiter',
  },
  {
    icon: Bell,
    title: 'Notifications that matter',
    body: 'New roles, status updates and verification results.',
    tone: 'recruiter',
  },
  {
    icon: FileSpreadsheet,
    title: 'Tools for club admins',
    body: 'Add members one by one or import a CSV.',
    tone: 'recruiter',
  },
] as const

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  invert = false,
}: {
  eyebrow: string
  title: React.ReactNode
  description?: string
  align?: 'center' | 'left'
  invert?: boolean
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
      <p
        className={`text-xs font-extrabold uppercase tracking-[0.18em] ${invert ? 'text-brand' : 'text-brand-dark'}`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-3xl font-black leading-[1.12] tracking-tight text-balance sm:text-4xl lg:text-[44px] ${invert ? 'text-white' : 'text-text-main'}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base leading-relaxed sm:text-lg ${invert ? 'text-slate-400' : 'text-text-muted'}`}
        >
          {description}
        </p>
      )}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-card text-text-main selection:bg-brand/20 selection:text-text-main">
      {/* ───────────── Navigation ───────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-card/85 backdrop-blur-md">
        <nav
          aria-label="Primary"
          className="mx-auto flex w-full max-w-[1360px] items-center justify-between px-6 py-3.5 md:px-12 lg:px-16"
        >
          <BrandLogo />

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-lg px-3.5 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-slate-50 hover:text-text-main"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <Button asChild variant="ghost">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
            <Button asChild>
              <Link href="/login">
                Get started
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ───────────── Hero ───────────── */}
        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_0%,black_20%,transparent_75%)]"
          />
          <div
            aria-hidden="true"
            className="absolute -top-40 right-[-10%] -z-10 size-[560px] rounded-full bg-brand/15 blur-[120px]"
          />
          <div
            aria-hidden="true"
            className="absolute -left-32 top-64 -z-10 size-[420px] rounded-full bg-recruiter/10 blur-[120px]"
          />

          <div className="mx-auto grid w-full max-w-[1360px] items-center gap-14 px-6 pb-20 pt-14 md:px-12 md:pt-20 lg:grid-cols-[1.02fr_1fr] lg:gap-10 lg:px-16 lg:pb-28 lg:pt-24">
            <div className="flex flex-col items-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 py-1.5 pl-2 pr-3.5 text-xs font-bold text-emerald-800 shadow-2xs backdrop-blur">
                <Dk24VerifiedIcon className="size-4" />
                Built for the DK24 community
              </div>

              <h1 className="mt-6 text-[42px] font-black leading-[1.04] tracking-tight text-balance text-text-main sm:text-6xl lg:text-[68px]">
                Get hired for{' '}
                <span className="bg-gradient-to-r from-brand-dark via-brand to-brand-emerald bg-clip-text text-transparent">
                  what you build.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
                Connect with teams hiring across the DK24 network. Show your skills, get verified,
                and track every application.
              </p>

              {/* Dual action paths */}
              <div className="mt-10 grid w-full gap-8 sm:grid-cols-2 sm:gap-12">
                {/* Path 1: Student */}
                <div className="group flex flex-col items-start">
                  <h2 className="text-xl font-bold tracking-tight text-text-main sm:text-2xl">
                    I&apos;m a Student
                  </h2>
                  <p className="mt-1.5 max-w-[260px] text-sm leading-relaxed text-text-muted">
                    Get the opportunity that boosts your early career trajectory.
                  </p>
                  <Link
                    href="/login"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-text-main transition-colors group-hover:text-brand"
                  >
                    <span>Get Started</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>

                {/* Path 2: Recruiter */}
                <div className="group flex flex-col items-start">
                  <h2 className="text-xl font-bold tracking-tight text-text-main sm:text-2xl">
                    I Want to Hire
                  </h2>
                  <p className="mt-1.5 max-w-[260px] text-sm leading-relaxed text-text-muted">
                    Find verified, top-tier entry-level talent in minutes.
                  </p>
                  <Link
                    href="/login"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-text-main transition-colors group-hover:text-brand"
                  >
                    <span>Get Started</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>
              </div>

              <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2.5 text-sm font-medium text-text-muted">
                {['Sign in with Google', 'DK24 verified profiles', 'Live application tracking'].map(
                  (item) => (
                    <li key={item} className="inline-flex items-center gap-2">
                      <span className="flex size-4 items-center justify-center rounded-full bg-brand text-white">
                        <Check className="size-2.5" strokeWidth={3.5} aria-hidden="true" />
                      </span>
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <HeroVisual />
          </div>
        </section>

        {/* ───────────── Two sides ───────────── */}
        <section id="who-its-for" className="scroll-mt-20 py-20 lg:py-28">
          <div className="mx-auto w-full max-w-[1360px] px-6 md:px-12 lg:px-16">
            <Reveal>
              <SectionHeading
                eyebrow="Two sides, one platform"
                title={
                  <>
                    Whether you’re starting out or{' '}
                    <span className="text-brand">scouting talent</span>
                  </>
                }
              />
            </Reveal>

            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              <Reveal>
                <article className="h-full rounded-2xl border border-emerald-200 bg-brand-light p-8 sm:p-10">
                  <div className="flex h-full flex-col">
                    <span className="flex size-14 items-center justify-center rounded-xl bg-brand text-white">
                      <GraduationCap className="size-7" strokeWidth={2.2} aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
                      For students
                    </h3>
                    <p className="mt-2 text-text-muted">
                      Turn what you’ve built into your first offer.
                    </p>
                    <ul className="mt-7 space-y-4">
                      {STUDENT_POINTS.map((point) => (
                        <li key={point} className="flex gap-3 text-[15px] leading-relaxed">
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                            <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-9">
                      <Button asChild variant="brand" size="lg">
                        <Link href="/login">
                          Start as a student
                          <ArrowRight aria-hidden="true" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              </Reveal>

              <Reveal delay={0.12}>
                <article className="h-full rounded-2xl border border-purple-200 bg-recruiter-light p-8 sm:p-10">
                  <div className="flex h-full flex-col">
                    <span className="flex size-14 items-center justify-center rounded-xl bg-recruiter text-white">
                      <Briefcase className="size-7" strokeWidth={2.2} aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
                      For recruiters
                    </h3>
                    <p className="mt-2 text-text-muted">
                      Find motivated, verified entry-level talent faster.
                    </p>
                    <ul className="mt-7 space-y-4">
                      {RECRUITER_POINTS.map((point) => (
                        <li key={point} className="flex gap-3 text-[15px] leading-relaxed">
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-recruiter text-white">
                            <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-9">
                      <Button asChild size="lg">
                        <Link href="/login">
                          Start hiring
                          <ArrowRight aria-hidden="true" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ───────────── How it works ───────────── */}
        <section id="how-it-works" className="scroll-mt-20 bg-bg-page py-20 lg:py-28">
          <div className="mx-auto w-full max-w-[1360px] px-6 md:px-12 lg:px-16">
            <Reveal>
              <SectionHeading eyebrow="How it works" title="From sign-in to offer in four steps" />
            </Reveal>

            <ol className="relative mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <li key={step.title}>
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="group h-full rounded-2xl border border-t-2 border-border-subtle border-t-brand/30 bg-card px-6 pb-8 pt-10 text-center shadow-[0_8px_30px_-12px_rgba(15,23,42,0.15)] transition-shadow duration-300 hover:shadow-[0_16px_40px_-12px_rgba(15,23,42,0.22)]">
                      <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-600">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mt-5 text-lg font-semibold tracking-tight text-text-main">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-text-muted">{step.body}</p>
                      <span
                        aria-hidden="true"
                        className="mx-auto mt-6 block h-0.5 w-8 rounded-full bg-brand/50 transition-all duration-300 group-hover:w-14"
                      />
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ───────────── Verification ───────────── */}
        <section id="verified" className="scroll-mt-20 px-4 py-6 sm:px-6 lg:px-10">
          <div className="relative mx-auto w-full max-w-[1360px] overflow-hidden rounded-[32px] bg-action-dark px-6 py-16 text-white sm:px-12 lg:px-16 lg:py-24">
            <div
              aria-hidden="true"
              className="absolute -left-24 -top-24 size-[420px] rounded-full bg-brand/20 blur-[110px]"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-32 right-0 size-[420px] rounded-full bg-recruiter/20 blur-[120px]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
            />

            <div className="relative grid items-center gap-14 lg:grid-cols-2">
              <Reveal>
                <SectionHeading
                  align="left"
                  invert
                  eyebrow="Trust, built in"
                  title={
                    <>
                      Every <span className="text-brand">DK24 Verified</span> badge is earned
                    </>
                  }
                  description="Matched against club membership rolls, not self-declared."
                />
                <ul className="mt-9 space-y-4">
                  {[
                    'Your USN is auto-matched against club membership.',
                    'Unmatched requests go to admin review.',
                    'Badges are revoked if a membership is flagged.',
                  ].map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-[15px] leading-relaxed text-slate-300"
                    >
                      <ShieldCheck
                        className="mt-0.5 size-5 shrink-0 text-brand"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-md sm:p-8">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Verification
                    </p>
                    <Dk24VerifiedBadge size="md" />
                  </div>
                  <ol className="mt-7 space-y-6">
                    {[
                      { t: 'USN submitted', d: 'Request sent', done: true },
                      {
                        t: 'Matched to club roster',
                        d: 'Checked automatically',
                        done: true,
                      },
                      { t: 'DK24 Verified', d: 'Badge on your profile', done: true },
                    ].map((step, i, arr) => (
                      <li key={step.t} className="relative flex gap-4">
                        {i < arr.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="absolute left-[15px] top-9 h-[calc(100%-4px)] w-[2px] bg-brand/40"
                          />
                        )}
                        <span className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-md shadow-brand/30">
                          <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-bold">{step.t}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{step.d}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ───────────── Features ───────────── */}
        <section id="features" className="scroll-mt-20 py-20 lg:py-28">
          <div className="mx-auto w-full max-w-[1360px] px-6 md:px-12 lg:px-16">
            <Reveal>
              <SectionHeading
                eyebrow="Everything in one place"
                title="The details that make hiring feel effortless"
              />
            </Reveal>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon
                return (
                  <Reveal key={feature.title} delay={(i % 3) * 0.08} className="h-full">
                    <article className="group h-full rounded-2xl border border-t-2 border-border-subtle border-t-brand/30 bg-card px-7 pb-8 pt-10 text-center shadow-[0_8px_30px_-12px_rgba(15,23,42,0.15)] transition-shadow duration-300 hover:shadow-[0_16px_40px_-12px_rgba(15,23,42,0.22)]">
                      <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Icon className="size-5" strokeWidth={2} aria-hidden="true" />
                      </span>
                      <h3 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-text-main">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-text-muted">{feature.body}</p>
                      <span
                        aria-hidden="true"
                        className="mx-auto mt-6 block h-0.5 w-8 rounded-full bg-brand/50 transition-all duration-300 group-hover:w-14"
                      />
                    </article>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* ───────────── Final CTA ───────────── */}
        <section className="px-4 pb-20 sm:px-6 lg:px-10 lg:pb-28">
          <Reveal>
            <div className="mx-auto w-full max-w-[1360px] rounded-[32px] bg-[#5edb92] px-6 py-16 text-center sm:px-12 lg:py-24">
              <div className="relative mx-auto max-w-2xl">
                <h2 className="text-3xl font-black leading-[1.1] tracking-tight text-balance text-text-main sm:text-5xl">
                  Your next opportunity is a sign-in away.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-text-main/80 sm:text-lg">
                  Join the DK24 community on CareerLink.
                </p>
                <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center [&>a]:w-full sm:[&>a]:w-auto">
                  <Button asChild size="lg">
                    <Link href="/login">
                      <GraduationCap aria-hidden="true" />
                      Join as a student
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/login">
                      <Briefcase aria-hidden="true" className="text-recruiter" />
                      Start hiring
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ───────────── Footer ───────────── */}
      <footer className="border-t border-border-subtle bg-bg-page">
        <div className="mx-auto flex w-full max-w-[1360px] flex-col items-center justify-between gap-6 px-6 py-10 md:px-12 lg:flex-row lg:px-16">
          <div className="flex flex-col items-center gap-3 lg:items-start">
            <BrandLogo size="sm" />
            <p className="text-xs text-text-muted">The hiring platform for the DK24 community.</p>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-text-muted">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-text-main">
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/login" className="transition-colors hover:text-text-main">
                Log in
              </Link>
            </li>
          </ul>

          <div className="flex flex-col items-center gap-1 lg:items-end">
            <Image
              src="/consortium.png"
              alt="DK24 Consortium"
              width={866}
              height={288}
              className="-my-5 h-20 w-auto"
            />
            <p className="text-[11px] text-text-muted">© 2026 DK24 CareerLink</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

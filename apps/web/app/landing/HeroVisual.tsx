'use client'

import { motion, useReducedMotion } from 'motion/react'
import { BellRing, CalendarClock, Check, Sparkles } from 'lucide-react'
import Dk24VerifiedBadge from '@/components/common/Dk24VerifiedBadge'
import { cn } from '@/lib/utils'

const PIPELINE = [
  { label: 'Applied', state: 'done' },
  { label: 'Under review', state: 'done' },
  { label: 'Shortlisted', state: 'current' },
  { label: 'Accepted', state: 'todo' },
] as const

function Float({
  children,
  className,
  distance = 8,
  duration = 5,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  distance?: number
  duration?: number
  delay?: number
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      animate={reduceMotion ? undefined : { y: [0, -distance, 0] }}
      transition={{ repeat: Infinity, duration, delay, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Illustrative product preview for the hero. Everything here is sample content
 * built from real platform concepts (DK24 verification, job cards, the
 * applied → accepted pipeline) — no real student data or invented statistics.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
      {/* Soft stage behind the cards */}
      <div
        aria-hidden="true"
        className="absolute inset-x-2 inset-y-4 rounded-[2.5rem] border border-white/70 bg-gradient-to-br from-brand-light via-white to-recruiter-light shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] lg:inset-x-6"
      />
      <div
        aria-hidden="true"
        className="absolute -right-4 top-10 size-40 rounded-full bg-brand/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -left-4 bottom-10 size-40 rounded-full bg-recruiter/20 blur-3xl"
      />

      <div className="relative flex flex-col gap-4 p-5 sm:p-8 lg:block lg:h-[540px] lg:p-0">
        {/* Job card */}
        <Float
          className="w-full lg:absolute lg:right-0 lg:top-3 lg:w-[270px]"
          distance={7}
          duration={5.4}
        >
          <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.3)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-action-dark font-mono text-xs font-black text-brand">
                  AL
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight text-text-main">
                    Frontend Developer Intern
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">Acme Labs</p>
                </div>
              </div>
              <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-dark">
                Active
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-600">
              <span className="rounded-md bg-slate-100 px-2 py-0.5">Internship</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5">Hybrid</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5">
                <CalendarClock className="size-3" aria-hidden="true" />
                Apply by 15 Dec
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['React', 'Next.js', 'TypeScript'].map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-border-subtle px-2 py-0.5 text-[11px] font-semibold text-text-main"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </Float>

        {/* Student profile card */}
        <Float
          className="w-full lg:absolute lg:left-0 lg:top-[130px] lg:w-[285px]"
          distance={9}
          duration={6}
          delay={0.4}
        >
          <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-[0_24px_50px_-20px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-clay-sphere-start to-clay-sphere-dark text-sm font-extrabold text-white shadow-md shadow-brand/30">
                AR
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-text-main">Ananya Rao</p>
                <p className="truncate text-xs text-text-muted">B.E. Computer Science · 2026</p>
              </div>
            </div>
            <Dk24VerifiedBadge size="md" className="mt-3" />
            <p className="mt-3 text-xs leading-relaxed text-text-muted">
              Full-stack builder. Shipped a campus events app and placed in a state-level hackathon.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['React', 'Node.js', 'PostgreSQL', 'Figma'].map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-brand-light px-2 py-0.5 text-[11px] font-semibold text-brand-dark"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3 text-[11px] text-text-muted">
              <span>
                <b className="text-text-main">3</b> projects
              </span>
              <span>
                <b className="text-text-main">1</b> hackathon
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-brand-dark">
                <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
                Open to work
              </span>
            </div>
          </div>
        </Float>

        {/* Application tracker */}
        <Float
          className="w-full lg:absolute lg:right-0 lg:top-[280px] lg:w-[265px]"
          distance={8}
          duration={5.8}
          delay={0.8}
        >
          <div className="rounded-2xl border border-neutral-800 bg-action-dark p-5 text-white shadow-[0_28px_60px_-20px_rgba(15,23,42,0.6)]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Application status
              </p>
              <Sparkles className="size-4 text-brand" aria-hidden="true" />
            </div>
            <ol className="mt-4 space-y-3">
              {PIPELINE.map((step, i) => (
                <li key={step.label} className="relative flex items-center gap-3">
                  {i < PIPELINE.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute left-[9px] top-5 h-[calc(100%+4px)] w-[2px]',
                        step.state === 'done' ? 'bg-brand/60' : 'bg-slate-700',
                      )}
                    />
                  )}
                  {step.state === 'done' ? (
                    <span className="z-10 flex size-5 items-center justify-center rounded-full bg-brand text-white">
                      <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                  ) : step.state === 'current' ? (
                    <span className="z-10 flex size-5 items-center justify-center rounded-full border-2 border-brand bg-action-dark ring-4 ring-brand/20">
                      <span className="size-2 animate-pulse rounded-full bg-brand" />
                    </span>
                  ) : (
                    <span className="z-10 size-5 rounded-full border-2 border-slate-600 bg-action-dark" />
                  )}
                  <span
                    className={cn(
                      'text-sm',
                      step.state === 'current'
                        ? 'font-bold text-white'
                        : step.state === 'done'
                          ? 'font-semibold text-slate-200'
                          : 'font-medium text-slate-500',
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Float>

        {/* Notification pill */}
        <Float
          className="w-full lg:absolute lg:bottom-4 lg:left-6 lg:w-[250px]"
          distance={6}
          duration={4.8}
          delay={1.2}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-card/95 p-3 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.3)] backdrop-blur">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-recruiter-light text-recruiter">
              <BellRing className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-main">You&apos;ve been shortlisted</p>
              <p className="truncate text-[11px] text-text-muted">
                Frontend Developer Intern · just now
              </p>
            </div>
          </div>
        </Float>
      </div>

      <p className="relative mt-3 text-center text-[11px] text-text-muted lg:mt-0 lg:text-right">
        Illustrative preview with sample data
      </p>
    </div>
  )
}

export default HeroVisual

'use client'

import { Briefcase, Search, Sparkles, UserCheck, Users } from 'lucide-react'

export function RecruiterHero() {
  return (
    <div className="lg:col-span-5 bg-gradient-to-b from-surface-hero-start to-surface-hero-end border-b lg:border-b-0 lg:border-r border-border-subtle/50 p-6 sm:p-8 lg:p-10 flex flex-col justify-between h-full relative overflow-hidden">
      <div className="w-full flex flex-col items-center justify-center py-6 select-none relative">
        <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full max-w-[280px] mx-auto pointer-events-none" />

        <div className="relative z-10 w-full max-w-[320px] bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200/60 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] space-y-3.5">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="h-3 bg-slate-200 rounded-md w-3/4 animate-pulse" />
              <div className="h-2 bg-slate-100 rounded-md w-1/2" />
            </div>
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="h-3 bg-slate-200 rounded-md w-4/5" />
              <div className="h-2 bg-slate-100 rounded-md w-2/3" />
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="h-3 bg-slate-200 rounded-md w-2/3" />
              <div className="h-2 bg-slate-100 rounded-md w-1/3" />
            </div>
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight leading-[1.2]">
          Build a stronger <br />
          team, <span className="text-brand">faster.</span>
        </h1>
        <p className="text-text-muted text-xs sm:text-sm font-medium leading-relaxed max-w-[340px]">
          Create your company profile and start discovering top talent on DK24 CareerLink.
        </p>
      </div>
    </div>
  )
}

'use client'

import { ArrowRight, Loader2 } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { authClient } from '@/lib/auth/client'
import { CharactersScene, type CharacterSceneState } from './CharactersScene'
import { sound } from './audio'

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
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
  )
}

export default function LoginPage() {
  const [state, setState] = useState<CharacterSceneState>({
    focusedField: 'none',
    emailLength: 0,
    isSubmitting: false,
    isSuccess: false,
    isError: false,
    isHoveringSubmit: false,
    isHoveringGoogle: false,
    cursorPos: { x: 0, y: 0 },
  })

  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setEmail(val)
    setState((s) => ({ ...s, emailLength: val.length }))
    sound.playKeystroke(val.length)
    setErrorMsg('')
  }

  const failWith = (message: string) => {
    setIsRedirecting(false)
    setErrorMsg(message)
    setState((s) => ({ ...s, isError: true }))
    sound.playError()
  }

  /**
   * Email sign-in is not wired up yet — Google is the only provider. The fields
   * stay in place for a later change, but submitting must never fake a session.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    failWith("Email sign-in isn't available yet — continue with Google.")
  }

  const handleGoogleLogin = async () => {
    setIsRedirecting(true)
    setErrorMsg('')
    setState((s) => ({ ...s, isError: false }))
    sound.playPop(520)

    const { error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/role-select',
    })

    // On success the browser navigates to Google, so this only runs when the
    // handshake could not be started at all.
    if (error) {
      failWith(error.message ?? 'Could not start Google sign-in. Please try again.')
    }
  }

  return (
    <main
      id="app-root"
      className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 md:p-8 bg-page-subtle select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Centered Interactive Login Card */}
      <div
        id="login-card"
        className="w-full max-w-4xl bg-white rounded-3xl shadow-[0_20px_50px_-10px_rgba(15,23,42,0.12)] border border-slate-200/80 overflow-hidden flex flex-col md:flex-row transition-all"
      >
        {/* Left Pane: Characters Scene */}
        <section
          id="characters-pane"
          className="w-full md:w-[48%] lg:w-1/2 min-h-[380px] sm:min-h-[440px] md:min-h-[560px] bg-stage flex shrink-0"
        >
          <CharactersScene state={state} />
        </section>

        {/* Right Pane: Login Form */}
        <section
          id="login-pane"
          className="w-full md:w-[52%] lg:w-1/2 flex flex-col justify-center bg-white"
        >
          <div
            id="login-form-container"
            className="relative flex-1 w-full h-full p-6 sm:p-8 md:p-10 flex flex-col justify-center items-center bg-white"
          >
            {isRedirecting ? (
              <div
                id="redirecting-panel"
                className="flex flex-col items-center justify-center text-center py-8 space-y-5 animate-in fade-in zoom-in-95 duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center shadow-xs">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <p className="text-sm text-zinc-500 max-w-[280px]">
                  Taking you to Google to finish signing in&hellip;
                </p>
              </div>
            ) : (
              <div className="w-full max-w-[360px] mx-auto">
                {/* Header Branding */}
                <div className="flex flex-col items-center text-center mb-6">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                    {isSignUp ? 'Create an account' : 'Welcome'}
                  </h1>
                  <p className="text-sm text-zinc-500 mt-1">
                    {isSignUp ? 'Enter your details to get started.' : 'Sign in to continue.'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-1.5 text-left">
                      <label
                        htmlFor="name-input"
                        className="text-xs font-semibold text-zinc-700 block"
                      >
                        Name
                      </label>
                      <input
                        id="name-input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => {
                          setState((s) => ({ ...s, focusedField: 'email' }))
                          sound.playPop(380)
                        }}
                        onBlur={() => setState((s) => ({ ...s, focusedField: 'none' }))}
                        placeholder="Your full name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition bg-zinc-50/50 hover:bg-zinc-50"
                      />
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-1.5 text-left">
                    <label
                      htmlFor="email-input"
                      className="text-xs font-semibold text-zinc-700 block"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <input
                        id="email-input"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        onFocus={() => {
                          setState((s) => ({ ...s, focusedField: 'email' }))
                          sound.playPop(420)
                        }}
                        onBlur={() => setState((s) => ({ ...s, focusedField: 'none' }))}
                        placeholder="Enter your email"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition bg-zinc-50/40 hover:bg-zinc-50 ${
                          state.focusedField === 'email'
                            ? 'border-zinc-900 ring-2 ring-zinc-900/10 bg-white'
                            : 'border-zinc-200'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Error banner */}
                  {errorMsg && (
                    <div
                      id="login-error"
                      role="alert"
                      className="text-xs text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg"
                    >
                      {errorMsg}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      id="submit-login-btn"
                      onMouseEnter={() => setState((s) => ({ ...s, isHoveringSubmit: true }))}
                      onMouseLeave={() => setState((s) => ({ ...s, isHoveringSubmit: false }))}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800 active:scale-[0.99] transition shadow-xs cursor-pointer disabled:opacity-70"
                    >
                      <span>{isSignUp ? 'Create account' : 'Continue with Email'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Google Sign-in Button */}
                  <div className="pt-0.5">
                    <button
                      type="button"
                      id="google-login-btn"
                      onClick={() => void handleGoogleLogin()}
                      onMouseEnter={() => setState((s) => ({ ...s, isHoveringGoogle: true }))}
                      onMouseLeave={() => setState((s) => ({ ...s, isHoveringGoogle: false }))}
                      className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-zinc-200 bg-white text-zinc-700 font-medium text-sm hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.99] transition shadow-2xs cursor-pointer"
                    >
                      <GoogleIcon className="w-4 h-4" />
                      <span>Continue with Google</span>
                    </button>
                  </div>
                </form>

                {/* Footer toggle */}
                <div className="mt-6 text-center text-xs text-zinc-500">
                  {isSignUp ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        id="toggle-to-login-btn"
                        onClick={() => {
                          setIsSignUp(false)
                          sound.playPop(400)
                        }}
                        className="font-semibold text-zinc-900 hover:underline cursor-pointer ml-1"
                      >
                        Log in
                      </button>
                    </>
                  ) : (
                    <>
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        id="toggle-to-signup-btn"
                        onClick={() => {
                          setIsSignUp(true)
                          sound.playPop(400)
                        }}
                        className="font-semibold text-zinc-900 hover:underline cursor-pointer ml-1"
                      >
                        Sign up
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

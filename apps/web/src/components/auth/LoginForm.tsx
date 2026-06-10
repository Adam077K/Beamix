'use client'

import { useState, useId } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sanitizeNext } from '@/lib/auth/next-param'
import { createClient } from '@/lib/supabase/client'
import { loginSubmit } from './auth-logic'
import { handleGoogleOAuth } from './oauth-click'
import { AuthCard } from './AuthCard'
import { Dots } from './auth-ui'
import { validateEmail, validatePassword } from './auth-validation'

type FormState = 'idle' | 'submitting' | 'error'

interface FieldErrors {
  email?: string
  password?: string
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const next = sanitizeNext(searchParams.get('next'))

  const emailId = useId()
  const passwordId = useId()
  const cardErrorId = useId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })
  const [formState, setFormState] = useState<FormState>('idle')
  const [cardError, setCardError] = useState<string | null>(null)

  const fieldErrors: FieldErrors = {}
  if (touched.email) fieldErrors.email = validateEmail(email)
  if (touched.password) fieldErrors.password = validatePassword(password)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Run full validation on submit
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    setTouched({ email: true, password: true })

    if (emailErr || passwordErr) return

    setFormState('submitting')
    setCardError(null)

    const supabase = createClient()
    const outcome = await loginSubmit(supabase.auth, { email, password })
    if (!outcome.ok) {
      setFormState('error')
      setCardError(outcome.message)
      return
    }

    // Full navigation so the server re-reads the new session cookie set by Supabase.
    window.location.assign(next)
  }

  // No 'success' UI branch: a successful sign-in navigates away via
  // window.location.assign(next), so the form never renders a success state.

  return (
    <AuthCard
      eyebrow="Welcome back"
      heading={
        <>
          Sign <em className="font-[var(--font-serif)] italic font-normal">in.</em>
        </>
      }
      subheading="Your AI search crew is standing by."
      footer={
        <>
          New to Beamix?{' '}
          <Button variant="link" asChild>
            <a href={`/signup${next !== '/dashboard' ? `?next=${encodeURIComponent(next)}` : ''}`}>
              Create an account
            </a>
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate aria-describedby={cardError ? cardErrorId : undefined}>
        {/* Card-level error */}
        {cardError && (
          <div
            id={cardErrorId}
            role="alert"
            className="mb-4 rounded-lg border border-[#FDECEC] bg-[#FDECEC] px-4 py-3 text-[14px] leading-[1.5] text-[#DC2626]"
          >
            {cardError}
          </div>
        )}

        <div className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={emailId}>Email</Label>
            <Input
              id={emailId}
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              aria-invalid={!!fieldErrors.email || undefined}
              aria-describedby={fieldErrors.email ? `${emailId}-err` : undefined}
              disabled={formState === 'submitting'}
            />
            {fieldErrors.email && (
              <p id={`${emailId}-err`} className="text-[13px] text-[#DC2626]" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={passwordId}>Password</Label>
              <a
                href={`/forgot-password${next !== '/dashboard' ? `?next=${encodeURIComponent(next)}` : ''}`}
                className="text-[13px] text-[#6B7280] underline-offset-4 transition-colors hover:text-[#0A0A0A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 rounded"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id={passwordId}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              aria-invalid={!!fieldErrors.password || undefined}
              aria-describedby={fieldErrors.password ? `${passwordId}-err` : undefined}
              disabled={formState === 'submitting'}
            />
            {fieldErrors.password && (
              <p id={`${passwordId}-err`} className="text-[13px] text-[#DC2626]" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="mt-6 w-full"
          disabled={formState === 'submitting'}
          aria-label={formState === 'submitting' ? 'Signing in…' : 'Sign in'}
        >
          {formState === 'submitting' ? <Dots /> : 'Sign in'}
        </Button>

        {/* Divider */}
        <div className="relative my-5 flex items-center" aria-hidden="true">
          <div className="flex-1 border-t border-[#E5E7EB]" />
          <span className="mx-3 text-[12px] text-[#9CA3AF]">or</span>
          <div className="flex-1 border-t border-[#E5E7EB]" />
        </div>

        {/* Google OAuth */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={formState === 'submitting'}
          onClick={() => {
            void handleGoogleOAuth(next, {
              onStart: () => {
                setFormState('submitting')
                setCardError(null)
              },
              onError: (m) => {
                setFormState('error')
                setCardError(m)
              },
            })
          }}
          aria-label="Continue with Google"
        >
          <svg
            className="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
      </form>
    </AuthCard>
  )
}

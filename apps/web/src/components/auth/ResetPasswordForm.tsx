'use client'

import { useEffect, useState, useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { AuthCard } from './AuthCard'

type FormState = 'idle' | 'submitting' | 'error' | 'success'
/** Recovery gate: we only allow a password change when the page was reached via
 *  a genuine recovery link (Supabase fires PASSWORD_RECOVERY after processing
 *  the recovery code in the URL). A direct or already-authenticated visit never
 *  reaches 'ready', so it cannot change a password outside the email-ownership flow. */
type Gate = 'checking' | 'ready' | 'invalid'

function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
}

/** Three animated dots indicator — reuses the scan-dot keyframe from globals.css */
function Dots() {
  return (
    <span className="inline-flex items-center gap-[3px] font-mono" aria-hidden="true">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="inline-block h-[5px] w-[5px] rounded-full bg-white"
          style={{ animation: 'scan-dot 1.2s ease-in-out infinite', animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}

export function ResetPasswordForm() {
  const passwordId = useId()
  const confirmId = useId()
  const cardErrorId = useId()

  const [gate, setGate] = useState<Gate>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [touched, setTouched] = useState({ password: false, confirm: false })
  const [formState, setFormState] = useState<FormState>('idle')
  const [cardError, setCardError] = useState<string | null>(null)

  // Only a PASSWORD_RECOVERY event unlocks the form. If none arrives shortly
  // (direct visit / stale link / normal session), fall back to the invalid state.
  useEffect(() => {
    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setGate('ready')
    })
    const timer = setTimeout(() => {
      setGate((g) => (g === 'checking' ? 'invalid' : g))
    }, 4000)
    return () => {
      data.subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  const passwordError = touched.password ? validatePassword(password) : undefined
  const confirmError =
    touched.confirm && confirm !== password ? 'Passwords do not match.' : undefined

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (gate !== 'ready') return
    const pwErr = validatePassword(password)
    const cfErr = confirm !== password ? 'Passwords do not match.' : undefined
    setTouched({ password: true, confirm: true })
    if (pwErr || cfErr) return

    setFormState('submitting')
    setCardError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setFormState('error')
      if (error.status === 422) {
        // Password failed the project's strength policy — distinct, actionable.
        setCardError('That password does not meet the strength requirements. Try a stronger one.')
      } else {
        setCardError(
          'This reset link is invalid or has expired. Request a new one from the sign-in page.',
        )
      }
      return
    }

    // Revoke every other active session so a previously stolen session cannot
    // outlive the reset, then send the user to sign in fresh.
    await supabase.auth.signOut({ scope: 'global' })
    setFormState('success')
  }

  if (gate === 'invalid') {
    return (
      <AuthCard
        eyebrow="Reset"
        heading={
          <>
            Link <em className="font-[var(--font-serif)] italic font-normal">expired.</em>
          </>
        }
        subheading="This password reset link is invalid or has already been used."
        footer={
          <Button variant="link" asChild>
            <a href="/forgot-password">Request a new link</a>
          </Button>
        }
      >
        <p className="py-2 text-[14px] leading-[1.5] text-[#6B7280]">
          Reset links expire after a short window and can only be used once. Request a fresh one and
          we&apos;ll email it right over.
        </p>
      </AuthCard>
    )
  }

  if (formState === 'success') {
    return (
      <AuthCard
        eyebrow="Reset"
        heading={
          <>
            Password <em className="font-[var(--font-serif)] italic font-normal">updated.</em>
          </>
        }
        footer={
          <Button variant="link" asChild>
            <a href="/login">Continue to sign in</a>
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F5EE]">
            <svg
              className="h-5 w-5 text-[#0E9E6E]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-[15px] leading-[1.5] text-[#374151]">
            Your password has been changed. Sign in with it to continue.
          </p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      eyebrow="Reset"
      heading={
        <>
          Choose a new <em className="font-[var(--font-serif)] italic font-normal">password.</em>
        </>
      }
      subheading="Enter a new password for your account."
      footer={
        <Button variant="link" asChild>
          <a href="/login">Back to sign in</a>
        </Button>
      }
    >
      <form onSubmit={onSubmit} noValidate aria-describedby={cardError ? cardErrorId : undefined}>
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={passwordId}>New password</Label>
            <Input
              id={passwordId}
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              aria-invalid={!!passwordError || undefined}
              aria-describedby={passwordError ? `${passwordId}-err` : undefined}
              disabled={formState === 'submitting' || gate !== 'ready'}
            />
            {passwordError && (
              <p id={`${passwordId}-err`} className="text-[13px] text-[#DC2626]" role="alert">
                {passwordError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={confirmId}>Confirm password</Label>
            <Input
              id={confirmId}
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
              aria-invalid={!!confirmError || undefined}
              aria-describedby={confirmError ? `${confirmId}-err` : undefined}
              disabled={formState === 'submitting' || gate !== 'ready'}
            />
            {confirmError && (
              <p id={`${confirmId}-err`} className="text-[13px] text-[#DC2626]" role="alert">
                {confirmError}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="mt-6 w-full"
          disabled={formState === 'submitting' || gate !== 'ready'}
          aria-label={formState === 'submitting' ? 'Updating password…' : 'Update password'}
        >
          {formState === 'submitting' ? <Dots /> : gate === 'checking' ? 'Verifying link…' : 'Update password'}
        </Button>
      </form>
    </AuthCard>
  )
}

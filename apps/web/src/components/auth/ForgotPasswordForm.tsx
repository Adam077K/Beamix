'use client'

import { useState, useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { AuthCard } from './AuthCard'

type FormState = 'idle' | 'submitting' | 'error' | 'success'

function validateEmail(email: string): string | undefined {
  if (!email) return 'Email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.'
}

/** Three animated dots indicator — reuses the scan-dot keyframe from globals.css */
function Dots() {
  return (
    <span className="inline-flex items-center gap-[3px] font-mono" aria-hidden="true">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="inline-block h-[5px] w-[5px] rounded-full bg-white"
          style={{
            animation: 'scan-dot 1.2s ease-in-out infinite',
            animationDelay: `${delay}ms`,
          }}
        />
      ))}
    </span>
  )
}

/** Mask the email for display: "j•••@domain.com" */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.slice(0, 1)
  return `${visible}•••@${domain}`
}

export function ForgotPasswordForm() {
  const emailId = useId()
  const cardErrorId = useId()

  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [formState, setFormState] = useState<FormState>('idle')
  const [cardError, setCardError] = useState<string | null>(null)
  const [sentEmail, setSentEmail] = useState('')

  const emailError = touched ? validateEmail(email) : undefined

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const err = validateEmail(email)
    setTouched(true)

    if (err) return

    setFormState('submitting')
    setCardError(null)

    const supabase = createClient()
    // Recovery link routes through the callback (exchanges the code → session),
    // then lands on /reset-password where the user sets a new password.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    // Anti-enumeration: always show the same success state regardless of whether
    // the email exists or the call errored — never reveal account existence. Real
    // errors are logged server-side by Supabase; the user always sees "sent".
    if (error) {
      console.error('[forgot-password] resetPasswordForEmail error', { status: error.status })
    }

    setSentEmail(email)
    setFormState('success')
  }

  if (formState === 'success') {
    return (
      <AuthCard
        eyebrow="Reset"
        heading={
          <>
            Check your <em className="font-[var(--font-serif)] italic font-normal">inbox.</em>
          </>
        }
        subheading="The reset link expires in 60 minutes."
        footer={
          <>
            <Button variant="link" asChild>
              <a href="/login">Back to sign in</a>
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 rounded-lg bg-[#F4F6FA] px-4 py-4">
          <p className="text-[14px] leading-[1.5] text-[#374151]">
            We sent a reset link to
          </p>
          <p
            className="font-mono text-[15px] font-medium tracking-[-0.01em] text-[#0A0A0A]"
            aria-label={`Email sent to ${sentEmail}`}
          >
            {maskEmail(sentEmail)}
          </p>
          <p className="text-[13px] leading-[1.5] text-[#6B7280]">
            Didn&apos;t get it? Check your spam folder, or{' '}
            <button
              type="button"
              onClick={() => {
                setFormState('idle')
                setTouched(false)
              }}
              className="text-[#3370FF] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 rounded"
            >
              try again
            </button>
            .
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
          Reset your <em className="font-[var(--font-serif)] italic font-normal">password.</em>
        </>
      }
      subheading="Enter your email and we'll send you a reset link."
      footer={
        <>
          <Button variant="link" asChild>
            <a href="/login">Back to sign in</a>
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
              onBlur={() => setTouched(true)}
              aria-invalid={!!emailError || undefined}
              aria-describedby={emailError ? `${emailId}-err` : undefined}
              disabled={formState === 'submitting'}
            />
            {emailError && (
              <p id={`${emailId}-err`} className="text-[13px] text-[#DC2626]" role="alert">
                {emailError}
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="mt-6 w-full"
          disabled={formState === 'submitting'}
          aria-label={formState === 'submitting' ? 'Sending reset link…' : 'Send reset link'}
        >
          {formState === 'submitting' ? <Dots /> : 'Send reset link'}
        </Button>
      </form>
    </AuthCard>
  )
}

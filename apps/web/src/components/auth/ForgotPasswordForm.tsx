'use client'

import { useState, useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { forgotSubmit } from './auth-logic'
import { AuthCard } from './AuthCard'
import { Dots } from './auth-ui'
import { validateEmail } from './auth-validation'

type FormState = 'idle' | 'submitting' | 'success'

/** Mask the email for display: "j•••@domain.com" */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.slice(0, 1)
  return `${visible}•••@${domain}`
}

export function ForgotPasswordForm() {
  const emailId = useId()

  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [formState, setFormState] = useState<FormState>('idle')
  const [sentEmail, setSentEmail] = useState('')

  const emailError = touched ? validateEmail(email) : undefined

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const err = validateEmail(email)
    setTouched(true)

    if (err) return

    setFormState('submitting')

    const supabase = createClient()
    // forgotSubmit always resolves (anti-enumeration): the recovery link lands
    // directly on /reset-password, and we show the same "sent" state regardless
    // of whether the email exists.
    await forgotSubmit(supabase.auth, email, window.location.origin)

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
      <form onSubmit={onSubmit} noValidate>
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

'use client'

import React, { useState, useId } from 'react'
import Link from 'next/link'
import { Loader2, AlertCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface FieldError {
  email?: string
  general?: string
}

export default function ForgotPasswordPage() {
  const emailId = useId()

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FieldError>({})
  const [submitted, setSubmitted] = useState(false)

  function validate(): FieldError {
    const errs: FieldError = {}
    if (!email.trim()) {
      errs.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address.'
    }
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })
      // Always show success to avoid email enumeration
      if (error) {
        // Log internally but don't surface to user (prevents account enumeration)
        console.error('[forgot-password] reset error:', error.message)
      }
      setSubmitted(true)
    } catch {
      setErrors({ general: 'Network error — check your connection and try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-2" role="status" aria-live="polite">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] border border-[#BFDBFE]">
          <Mail className="size-5 text-[#3370FF]" aria-hidden="true" />
        </div>
        <h2 className="text-[18px] font-medium text-[#0A0A0A] tracking-[-0.2px]">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm text-[#6B7280] max-w-[280px] mx-auto">
          If{' '}
          <span className="font-medium text-[#0A0A0A]">{email}</span> is
          registered, we sent a password reset link. It expires in 60 minutes.
        </p>
        <p className="mt-2 text-xs text-[#6B7280]">
          Didn't receive it? Check spam, or{' '}
          <button
            type="button"
            onClick={() => {
              setSubmitted(false)
            }}
            className="text-[#3370FF] font-medium hover:underline underline-offset-2 transition-colors duration-150"
          >
            try again
          </button>
          .
        </p>
        <div className="mt-6 pt-5 border-t border-[#E5E7EB]">
          <Link
            href="/login"
            className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors duration-150"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-medium text-[#0A0A0A] tracking-[-0.3px] leading-tight">
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">
          Enter your email and we'll send a reset link.
        </p>
      </div>

      {/* General error banner */}
      {errors.general && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2.5 mb-5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-3 text-sm text-[#DC2626]"
        >
          <AlertCircle className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={emailId}
            className="text-sm font-medium text-[#0A0A0A]"
          >
            Email
          </label>
          <Input
            id={emailId}
            type="email"
            autoComplete="email"
            placeholder="you@yourcompany.com"
            value={email}
            onChange={e => {
              setEmail(e.target.value)
              if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
            }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
            disabled={isLoading}
            className={cn(
              errors.email &&
                'border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]/20'
            )}
          />
          {errors.email && (
            <p
              id={`${emailId}-error`}
              role="alert"
              aria-live="polite"
              className="text-xs text-[#EF4444] flex items-center gap-1"
            >
              <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="w-full mt-1 bg-[#3370FF] text-white hover:bg-[#2960DB] active:scale-[0.98] transition-all duration-150"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span>Sending reset link…</span>
            </>
          ) : (
            'Send reset link'
          )}
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors duration-150"
          >
            ← Back to sign in
          </Link>
        </div>
      </form>
    </>
  )
}

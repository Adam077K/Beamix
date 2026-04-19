'use client'

import React, { useState, useId } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface FieldError {
  email?: string
  password?: string
  general?: string
}

interface PasswordRule {
  label: string
  test: (pw: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: pw => pw.length >= 8 },
  { label: 'One uppercase letter', test: pw => /[A-Z]/.test(pw) },
  { label: 'One number', test: pw => /[0-9]/.test(pw) },
]

export default function SignupPage() {
  const router = useRouter()
  const emailId = useId()
  const passwordId = useId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FieldError>({})
  const [success, setSuccess] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const passwordRulesPass = PASSWORD_RULES.map(r => r.test(password))
  const allRulesPass = passwordRulesPass.every(Boolean)

  function validate(): FieldError {
    const errs: FieldError = {}
    if (!email.trim()) {
      errs.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address.'
    }
    if (!password) {
      errs.password = 'Password is required.'
    } else if (!allRulesPass) {
      errs.password = 'Password does not meet all requirements.'
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          setErrors({
            email: 'An account with this email already exists.',
          })
        } else {
          setErrors({ general: 'Something went wrong. Try again in a moment.' })
        }
        return
      }
      setSuccess(true)
    } catch {
      setErrors({ general: 'Network error — check your connection and try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-2" role="status" aria-live="polite">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0FDF4] border border-[#BBF7D0]">
          <Check className="size-6 text-[#10B981]" aria-hidden="true" />
        </div>
        <h2 className="text-[18px] font-medium text-[#0A0A0A] tracking-[-0.2px]">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm text-[#6B7280] max-w-[280px] mx-auto">
          We sent a confirmation link to{' '}
          <span className="font-medium text-[#0A0A0A]">{email}</span>. Open it
          to activate your account.
        </p>
        <p className="mt-5 text-xs text-[#6B7280]">
          Already confirmed?{' '}
          <Link
            href="/login"
            className="text-[#3370FF] font-medium hover:underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-medium text-[#0A0A0A] tracking-[-0.3px] leading-tight">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">
          Already have one?{' '}
          <Link
            href="/login"
            className="text-[#3370FF] font-medium hover:underline underline-offset-2 transition-colors duration-150"
          >
            Sign in
          </Link>
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
            Work email
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

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={passwordId}
            className="text-sm font-medium text-[#0A0A0A]"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id={passwordId}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Choose a strong password"
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
              }}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              aria-invalid={!!errors.password}
              aria-describedby={`${passwordId}-rules${errors.password ? ` ${passwordId}-error` : ''}`}
              disabled={isLoading}
              className={cn(
                'pr-10',
                errors.password &&
                  'border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]/20'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0A0A0A] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded"
              tabIndex={0}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Password rules — shown when focused or when there's an error */}
          {(passwordFocused || errors.password || password.length > 0) && (
            <ul
              id={`${passwordId}-rules`}
              className="flex flex-col gap-1 mt-0.5"
              aria-label="Password requirements"
            >
              {PASSWORD_RULES.map((rule, i) => (
                <li
                  key={i}
                  className={cn(
                    'flex items-center gap-1.5 text-xs transition-colors duration-150',
                    passwordRulesPass[i]
                      ? 'text-[#10B981]'
                      : 'text-[#6B7280]'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-all duration-150',
                      passwordRulesPass[i]
                        ? 'border-[#10B981] bg-[#10B981]'
                        : 'border-[#D1D5DB] bg-transparent'
                    )}
                    aria-hidden="true"
                  >
                    {passwordRulesPass[i] && (
                      <Check className="size-2.5 text-white" strokeWidth={3} />
                    )}
                  </span>
                  <span>{rule.label}</span>
                </li>
              ))}
            </ul>
          )}

          {errors.password && (
            <p
              id={`${passwordId}-error`}
              role="alert"
              aria-live="polite"
              className="text-xs text-[#EF4444] flex items-center gap-1"
            >
              <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
              {errors.password}
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
              <span>Creating account…</span>
            </>
          ) : (
            'Create account'
          )}
        </Button>

        <p className="text-center text-[11px] text-[#6B7280] leading-relaxed">
          By creating an account you agree to our{' '}
          <Link
            href="https://beamix.tech/terms"
            className="underline underline-offset-2 hover:text-[#0A0A0A] transition-colors duration-150"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="https://beamix.tech/privacy"
            className="underline underline-offset-2 hover:text-[#0A0A0A] transition-colors duration-150"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </>
  )
}

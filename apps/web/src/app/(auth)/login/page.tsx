'use client'

import React, { useState, useId } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface FieldError {
  email?: string
  password?: string
  general?: string
}

export default function LoginPage() {
  const router = useRouter()
  const emailId = useId()
  const passwordId = useId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FieldError>({})

  function validate(): FieldError {
    const errs: FieldError = {}
    if (!email.trim()) {
      errs.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address.'
    }
    if (!password) {
      errs.password = 'Password is required.'
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
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setErrors({ general: 'Incorrect email or password. Check your details and try again.' })
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrors({ general: 'Check your inbox — you need to confirm your email first.' })
        } else {
          setErrors({ general: 'Something went wrong. Try again in a moment.' })
        }
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setErrors({ general: 'Network error — check your connection and try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-medium text-[#0A0A0A] tracking-[-0.3px] leading-tight">
          Sign in to Beamix
        </h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">
          No account yet?{' '}
          <Link
            href="/signup"
            className="text-[#3370FF] font-medium hover:underline underline-offset-2 transition-colors duration-150"
          >
            Create one free
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
              errors.email && 'border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]/20'
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
          <div className="flex items-center justify-between">
            <label
              htmlFor={passwordId}
              className="text-sm font-medium text-[#0A0A0A]"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#6B7280] hover:text-[#3370FF] transition-colors duration-150"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id={passwordId}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
              }}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? `${passwordId}-error` : undefined}
              disabled={isLoading}
              className={cn(
                'pr-10',
                errors.password && 'border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]/20'
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
              <span>Signing in…</span>
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </>
  )
}

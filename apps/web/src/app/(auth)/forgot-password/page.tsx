'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function SpinnerIcon() {
  return (
    <svg
      className="size-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/account/reset-password`,
      })
      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  // Success state
  if (sent) {
    return (
      <div className="text-center py-2">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-blue-50">
          <svg className="size-6 text-[#3370FF]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-950 tracking-tight">
          Reset link sent
        </h2>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-[300px] mx-auto">
          If{' '}
          <span className="font-medium text-gray-900">{email}</span> is registered, you&apos;ll
          receive a password reset link shortly.
        </p>
        <p className="mt-3 text-xs text-gray-400">
          Check your spam folder if it doesn&apos;t arrive within a few minutes.
        </p>
        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={() => {
              setSent(false)
              setEmail('')
            }}
            className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Try a different email
          </button>
          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-[#3370FF] hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-[1.375rem] font-semibold text-gray-950 tracking-tight">
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Inline error */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
          >
            <svg
              className="mt-0.5 size-4 shrink-0"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 5v4M8 11v.5M2.5 13.5h11l-5.5-9.5-5.5 9.5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="block w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow duration-150 focus:border-[#3370FF] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 disabled:opacity-50"
            disabled={loading}
          />
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#3370FF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#2860e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <SpinnerIcon />
              Sending reset link&hellip;
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      {/* Back to sign in */}
      <p className="mt-5 text-center text-sm text-gray-500">
        Remember your password?{' '}
        <Link
          href="/login"
          className="font-medium text-[#3370FF] hover:underline focus-visible:outline-none focus-visible:underline"
        >
          Back to sign in
        </Link>
      </p>
    </>
  )
}

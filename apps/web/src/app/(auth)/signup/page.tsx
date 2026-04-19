'use client'

import { useState, useMemo } from 'react'
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

function CheckIcon({ met }: { met: boolean }) {
  return (
    <svg
      className={`size-3.5 shrink-0 transition-colors duration-150 ${met ? 'text-emerald-500' : 'text-gray-300'}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {met ? (
        <path
          d="M3 8l3.5 3.5L13 4.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      )}
    </svg>
  )
}

interface PasswordRule {
  id: string
  label: string
  test: (pw: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: '8 or more characters', test: (pw) => pw.length >= 8 },
  { id: 'number', label: 'One number', test: (pw) => /\d/.test(pw) },
  { id: 'upper', label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
]

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPasswordRules, setShowPasswordRules] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const passwordRulesMet = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, met: r.test(password) })),
    [password]
  )
  const allRulesMet = passwordRulesMet.every((r) => r.met)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!email) {
      setError('Email address is required.')
      return
    }
    if (!allRulesMet) {
      setError('Your password doesn\'t meet all the requirements below.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name.trim() },
        },
      })
      if (authError) {
        if (authError.message.toLowerCase().includes('already registered')) {
          setError('An account with this email already exists. Try signing in instead.')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  // Success state — verify email
  if (success) {
    return (
      <div className="text-center py-2">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-50">
          <svg className="size-6 text-emerald-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 7l-9 9-4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-950 tracking-tight">Check your inbox</h2>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          We&apos;ve sent a confirmation link to{' '}
          <span className="font-medium text-gray-900">{email}</span>. Click the link to activate
          your account.
        </p>
        <p className="mt-5 text-xs text-gray-400">
          Already confirmed?{' '}
          <Link href="/login" className="text-[#3370FF] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-[1.375rem] font-semibold text-gray-950 tracking-tight">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Start improving your AI search visibility today.
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

        {/* Full name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sarah Chen"
            className="block w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow duration-150 focus:border-[#3370FF] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 disabled:opacity-50"
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Work email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sarah@company.com"
            className="block w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow duration-150 focus:border-[#3370FF] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 disabled:opacity-50"
            disabled={loading}
          />
        </div>

        {/* Password with live requirements */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setShowPasswordRules(true)}
            placeholder="Create a strong password"
            aria-describedby="password-requirements"
            className="block w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow duration-150 focus:border-[#3370FF] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 disabled:opacity-50"
            disabled={loading}
          />
          {/* Live requirements — appear on focus */}
          {(showPasswordRules || password.length > 0) && (
            <ul
              id="password-requirements"
              className="mt-2 space-y-1.5"
              aria-label="Password requirements"
            >
              {passwordRulesMet.map((rule) => (
                <li key={rule.id} className="flex items-center gap-2">
                  <CheckIcon met={rule.met} />
                  <span
                    className={`text-xs transition-colors duration-150 ${
                      rule.met ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  >
                    {rule.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
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
              Creating your account&hellip;
            </>
          ) : (
            'Create free account'
          )}
        </button>

        {/* Trust signals */}
        <p className="text-center text-xs text-gray-400">
          No credit card required &middot; 14-day money-back guarantee
        </p>

        {/* Terms */}
        <p className="text-center text-xs text-gray-400 leading-relaxed">
          By creating an account you agree to our{' '}
          <Link
            href="https://beamix.tech/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="https://beamix.tech/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      {/* Sign in link */}
      <p className="mt-5 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-[#3370FF] hover:underline focus-visible:outline-none focus-visible:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}

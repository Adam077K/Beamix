'use client'

/**
 * DiscoveryLeadForm — in-product lead capture form.
 *
 * Rendered when NEXT_PUBLIC_CALCOM_DISCOVERY_LINK is absent.
 * NEVER falls back to a mailto link (DESIGN-DIRECTION §5 #7).
 *
 * On submit: POSTs to /api/discovery/lead. Shows success confirmation.
 * Loading, error, and success states are all handled.
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface DiscoveryLeadFormProps {
  prefillEmail?: string
}

export function DiscoveryLeadForm({ prefillEmail = '' }: DiscoveryLeadFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState(prefillEmail)
  const [company, setCompany] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    setErrorMessage('')

    try {
      const res = await fetch('/api/discovery/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(
          (body as { error?: string }).error ?? 'Something went wrong. Try again.',
        )
      }

      setState('success')
    } catch (err) {
      setState('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Try again.',
      )
    }
  }

  if (state === 'success') {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0FDF4]"
          aria-hidden="true"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 10l4 4 8-8"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-[#0A0A0A]">You're on the list</h2>
        <p className="mt-2 max-w-[280px] text-sm leading-[1.5] text-[#6B7280]">
          We'll reach out within one business day to confirm a time.
        </p>
      </div>
    )
  }

  return (
    <div className="px-8 py-10">
      <h2 className="mb-1 text-[18px] font-semibold text-[#0A0A0A]">
        Request a call
      </h2>
      <p className="mb-7 text-sm leading-[1.5] text-[#6B7280]">
        We'll confirm a 20-minute slot by email within one business day.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* Name */}
        <div>
          <label
            htmlFor="discovery-name"
            className="mb-1.5 block text-sm font-medium text-[#374151]"
          >
            Your name
          </label>
          <input
            id="discovery-name"
            type="text"
            required
            autoComplete="name"
            placeholder="Yossi Cohen"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={state === 'submitting'}
            className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#0A0A0A] placeholder-[#9CA3AF] outline-none transition-[border-color] focus:border-[#3370FF] focus:ring-2 focus:ring-[#3370FF] focus:ring-offset-0 disabled:opacity-50"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="discovery-email"
            className="mb-1.5 block text-sm font-medium text-[#374151]"
          >
            Work email
          </label>
          <input
            id="discovery-email"
            type="email"
            required
            autoComplete="email"
            placeholder="yossi@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state === 'submitting'}
            className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#0A0A0A] placeholder-[#9CA3AF] outline-none transition-[border-color] focus:border-[#3370FF] focus:ring-2 focus:ring-[#3370FF] focus:ring-offset-0 disabled:opacity-50"
          />
        </div>

        {/* Company */}
        <div>
          <label
            htmlFor="discovery-company"
            className="mb-1.5 block text-sm font-medium text-[#374151]"
          >
            Business name
          </label>
          <input
            id="discovery-company"
            type="text"
            autoComplete="organization"
            placeholder="Cohen & Partners"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={state === 'submitting'}
            className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#0A0A0A] placeholder-[#9CA3AF] outline-none transition-[border-color] focus:border-[#3370FF] focus:ring-2 focus:ring-[#3370FF] focus:ring-offset-0 disabled:opacity-50"
          />
        </div>

        {/* Error message */}
        {state === 'error' && errorMessage && (
          <p role="alert" className="text-sm text-[#EF4444]">
            {errorMessage}
          </p>
        )}

        <Button
          type="submit"
          disabled={state === 'submitting' || !name.trim() || !email.trim()}
          className="mt-1 h-10 w-full"
          aria-busy={state === 'submitting'}
        >
          {state === 'submitting' ? 'Sending…' : 'Request a call →'}
        </Button>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { isValidDomain, normalizeDomain } from './scan-mock'

interface ScanEntryProps {
  /** Fired with the normalized domain + optional business name on submit. */
  onSubmit: (domain: string, businessName: string) => void
}

/**
 * ScanEntry — Act A. One confident domain input + optional business name +
 * the full-width blue "Run my free scan →" CTA. Validates a domain shape
 * client-side before kicking the (mock) scan.
 */
export function ScanEntry({ onSubmit }: ScanEntryProps) {
  const [domain, setDomain] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const raw = domain.trim()
    if (!raw) {
      setError('Enter your website to scan.')
      return
    }
    if (!isValidDomain(raw)) {
      setError('That doesn’t look like a website. Try yourbusiness.com.')
      return
    }
    setError(null)
    onSubmit(normalizeDomain(raw), businessName.trim())
  }

  return (
    <div className="w-full">
      <p className="text-xs font-semibold uppercase leading-none tracking-[0.08em] text-[#9CA3AF]">
        Free AI search scan
      </p>
      <h1 className="mt-3 text-[32px] font-medium leading-[1.1] tracking-[-0.02em] text-[#0A0A0A] sm:text-[36px]">
        See where AI search ignores you.
      </h1>
      <p className="mt-3 max-w-[440px] text-[15px] leading-[1.5] text-[#6B7280]">
        Beamix asks ChatGPT, Gemini, and Perplexity about your business — and
        shows you, engine by engine, where you don’t show up.
      </p>

      <form onSubmit={handleSubmit} className="mt-8" noValidate>
        <label htmlFor="scan-domain" className="sr-only">
          Your website
        </label>
        <input
          id="scan-domain"
          type="text"
          inputMode="url"
          autoComplete="url"
          autoFocus
          value={domain}
          onChange={(e) => {
            setDomain(e.target.value)
            if (error) setError(null)
          }}
          placeholder="yourbusiness.com"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'scan-domain-error' : undefined}
          className={[
            'h-14 w-full rounded-xl border bg-white px-4 text-[17px] text-[#0A0A0A] placeholder:text-[#9CA3AF]',
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-0',
            error
              ? 'border-[#EF4444] focus-visible:ring-[#EF4444]'
              : 'border-[#E5E7EB] focus-visible:border-[#3370FF]',
          ].join(' ')}
        />

        {error && (
          <p
            id="scan-domain-error"
            role="alert"
            className="mt-2 text-[13px] text-[#EF4444]"
          >
            {error}
          </p>
        )}

        <label htmlFor="scan-business" className="sr-only">
          Business name (optional)
        </label>
        <input
          id="scan-business"
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Business name (optional)"
          className="mt-3 h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-[15px] text-[#0A0A0A] placeholder:text-[#9CA3AF] transition-colors focus-visible:border-[#3370FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-0"
        />

        <Button
          type="submit"
          size="lg"
          className="mt-4 h-14 w-full rounded-xl text-[16px]"
        >
          Run my free scan →
        </Button>
      </form>

      <p className="mt-4 text-center text-[13px] text-[#9CA3AF]">
        No credit card. No signup to see your score.
      </p>
    </div>
  )
}

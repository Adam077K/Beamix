'use client'

import { useState, type FormEvent } from 'react'
import { cn } from '@/lib/utils'

/**
 * ACT 1 — ENTRY (DESIGN-DIRECTION §4 ACT 1).
 *
 * One confident action. Raycast single-input treatment: mono `https://` affix,
 * mono placeholder, blue focus ring. Progressive disclosure of the optional
 * business-name field. The CTA is a product button (rounded-lg, 8px) — never a
 * marketing pill. Submitting swaps the label to a 3-dot mono pulse, then hands
 * straight into the scanning ledger (no separate loading screen).
 */

export interface EntrySubmitPayload {
  domain: string
  businessName?: string
}

// Plausible-domain pattern: at least one dot, a 2+ char TLD, no spaces.
const DOMAIN_RE = /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i

function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '')
    .toLowerCase()
}

interface EntryFormProps {
  onSubmit: (payload: EntrySubmitPayload) => void
}

export function EntryForm({ onSubmit }: EntryFormProps) {
  const [domain, setDomain] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const normalized = normalizeDomain(domain)
  const domainValid = DOMAIN_RE.test(normalized)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    if (!domainValid) {
      setError('That doesn’t look like a website — try yourbusiness.com')
      return
    }
    setError(null)
    setSubmitting(true)
    // Brief mono-pulse beat, then hand off to the ledger (Superhuman auto-start).
    window.setTimeout(() => {
      onSubmit({
        domain: normalized,
        businessName: businessName.trim() || undefined,
      })
    }, 420)
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center px-6 pt-[42dvh] sm:px-6">
      <div className="w-full max-w-[560px] -translate-y-[42%]">
        {/* Eyebrow */}
        <p className="text-center text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Free AI-Search Scan
        </p>

        {/* Headline — Linear/instrument register, NOT a 64px marketing hero */}
        <h1 className="mx-auto mt-4 max-w-[480px] text-center font-[var(--font-display)] text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-[#0A0A0A] sm:text-[32px]">
          See where AI search can’t find you.
        </h1>

        {/* Subline */}
        <p className="mx-auto mt-2 max-w-[420px] text-center text-[15px] leading-[1.5] text-[#6B7280]">
          We check ChatGPT, Gemini, and Perplexity for your business — in about
          15 seconds.
        </p>

        <form onSubmit={handleSubmit} className="mt-8" noValidate>
          {/* Field label */}
          <label
            htmlFor="scan-domain"
            className="mb-2 block text-[13px] font-normal text-[#6B7280]"
          >
            Your website
          </label>

          {/* The input — single confident field, mono affix + value */}
          <div
            className={cn(
              'flex h-[52px] items-center rounded-lg border bg-white pl-3.5 pr-3 transition-[border-color,box-shadow] duration-150 ease-out sm:h-[56px]',
              error
                ? 'border-[#EF4444] focus-within:ring-2 focus-within:ring-[#EF4444]/20'
                : 'border-[#E5E7EB] focus-within:border-[#3370FF] focus-within:ring-2 focus-within:ring-[#3370FF]/15',
            )}
          >
            <span
              className="select-none font-[var(--font-mono)] text-[15px] text-[#9CA3AF]"
              aria-hidden="true"
            >
              https://
            </span>
            <input
              id="scan-domain"
              type="text"
              inputMode="url"
              autoComplete="url"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value)
                if (error) setError(null)
              }}
              placeholder="yourbusiness.com"
              aria-invalid={!!error}
              aria-describedby={error ? 'scan-domain-error' : undefined}
              className="ml-0.5 h-full w-full bg-transparent font-[var(--font-mono)] text-[16px] text-[#0A0A0A] outline-none placeholder:text-[#9CA3AF] sm:text-[17px]"
            />
          </div>

          {/* Reserved error space — no layout shift */}
          <div className="min-h-[20px] pt-1.5">
            {error && (
              <p
                id="scan-domain-error"
                role="alert"
                className="text-[13px] text-[#EF4444]"
              >
                {error}
              </p>
            )}
          </div>

          {/* Progressive business-name field — appears only once domain is valid */}
          <div
            className={cn(
              'grid transition-all duration-200 ease-out',
              domainValid
                ? 'mt-2 grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0',
            )}
          >
            <div className="overflow-hidden">
              <label
                htmlFor="scan-business"
                className="mb-2 block text-[13px] font-normal text-[#6B7280]"
              >
                Business name{' '}
                <span className="text-[#9CA3AF]">(optional)</span>
              </label>
              <input
                id="scan-business"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Fortucci Dental"
                tabIndex={domainValid ? 0 : -1}
                className="h-[52px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-[15px] text-[#0A0A0A] outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-[#9CA3AF] focus:border-[#3370FF] focus:ring-2 focus:ring-[#3370FF]/15 sm:h-[56px]"
              />
            </div>
          </div>

          {/* CTA — product button, rounded-lg (8px), NOT a marketing pill */}
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              'mt-4 flex h-[52px] w-full items-center justify-center rounded-lg bg-[#3370FF] text-[15px] font-semibold text-white',
              'transition-[transform,background-color,box-shadow] duration-100 ease-out',
              'hover:-translate-y-px hover:bg-[#1f5ce8] hover:shadow-[0_4px_12px_rgba(51,112,255,0.25)]',
              'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2',
              'disabled:cursor-default disabled:opacity-100 disabled:hover:translate-y-0 disabled:hover:shadow-none',
            )}
          >
            {submitting ? <SubmittingDots /> : 'Run my free scan →'}
          </button>

          {/* Trust microcaption */}
          <p className="mt-6 text-center text-[13px] leading-[1.5] text-[#9CA3AF]">
            No credit card. No signup to see your score.
          </p>
        </form>
      </div>
    </div>
  )
}

/** 3-dot mono pulse for the <500ms submit beat (§4 ACT 1 "submitting"). */
function SubmittingDots() {
  return (
    <span
      className="inline-flex items-center gap-1 font-[var(--font-mono)]"
      aria-label="Starting scan"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-white/90 motion-safe:animate-[scan-dot_1s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  )
}

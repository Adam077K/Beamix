'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'
import Image from 'next/image'
import { Turnstile } from '@marsidev/react-turnstile'
import { cn } from '@/lib/utils'

export interface PreScanFormData {
  url: string
  industry: string
  location: string
  competitors: string[]
  turnstileToken: string | null
}

interface PreScanFormProps {
  onSubmit: (data: PreScanFormData) => void
}

const INDUSTRIES = [
  { value: 'software-saas', label: 'Software / SaaS' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'professional-services', label: 'Professional Services' },
  { value: 'health-wellness', label: 'Health & Wellness' },
  { value: 'other', label: 'Other' },
]

function isValidUrl(raw: string): boolean {
  try {
    const withProtocol = raw.startsWith('http') ? raw : `https://${raw}`
    new URL(withProtocol)
    return true
  } catch {
    return false
  }
}

export function PreScanForm({ onSubmit }: PreScanFormProps) {
  const [url, setUrl] = React.useState('')
  const [industry, setIndustry] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [competitors, setCompetitors] = React.useState<string[]>(['', '', ''])
  const [urlError, setUrlError] = React.useState<string | null>(null)
  const [industryError, setIndustryError] = React.useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null)

  function handleUrlBlur() {
    if (!url) {
      setUrlError('Enter your website URL')
    } else if (!isValidUrl(url)) {
      setUrlError('Enter a valid URL — e.g. yourbusiness.com')
    } else {
      setUrlError(null)
    }
  }

  function handleCompetitorChange(index: number, value: string) {
    setCompetitors(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let valid = true

    if (!url) {
      setUrlError('Enter your website URL')
      valid = false
    } else if (!isValidUrl(url)) {
      setUrlError('Enter a valid URL — e.g. yourbusiness.com')
      valid = false
    } else {
      setUrlError(null)
    }

    if (!industry) {
      setIndustryError('Select your industry')
      valid = false
    } else {
      setIndustryError(null)
    }

    if (!valid) return

    onSubmit({
      url: url.startsWith('http') ? url : `https://${url}`,
      industry,
      location,
      competitors: competitors.filter(Boolean),
      turnstileToken,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="w-full max-w-[520px] mx-auto bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#E5E7EB] p-8"
    >
      {/* Logo + heading */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="relative w-28 h-8">
          <Image
            src="/logo/beamix_logo_blue_Primary.png"
            alt="Beamix"
            fill
            className="object-contain object-center"
            priority
          />
        </div>
        <div className="text-center">
          {/* H1 — InterDisplay-Medium equivalent: font-[500] + tight tracking */}
          <h1 className="text-[30px] font-[500] text-[#0A0A0A] tracking-[-0.5px] leading-[1.1]">
            See if AI recommends you
          </h1>
          <p className="mt-2 text-[15px] text-[#6B7280] font-normal leading-relaxed">
            Free scan. No account needed. 60 seconds.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* URL */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="scan-url" className="text-sm font-medium text-[#0A0A0A]">
            Your website
          </label>
          <input
            id="scan-url"
            type="url"
            value={url}
            onChange={e => {
              setUrl(e.target.value)
              if (urlError && isValidUrl(e.target.value)) setUrlError(null)
            }}
            onBlur={handleUrlBlur}
            placeholder="yourbusiness.com"
            autoComplete="url"
            aria-invalid={!!urlError}
            aria-describedby={urlError ? 'url-error' : 'url-hint'}
            className={cn(
              'h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] outline-none transition-all duration-150',
              'focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF]',
              urlError
                ? 'border-[#EF4444] focus:ring-[#EF4444]/20 focus:border-[#EF4444]'
                : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
            )}
          />
          <span id="url-hint" className="sr-only">
            Enter your website without https — e.g. yourbusiness.com
          </span>
          <AnimatePresence>
            {urlError && (
              <motion.p
                id="url-error"
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 text-xs text-[#EF4444]"
              >
                <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                {urlError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Industry */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="scan-industry" className="text-sm font-medium text-[#0A0A0A]">
            Industry
          </label>
          {/* Wrapper div for absolute-positioned chevron */}
          <div className="relative">
            <select
              id="scan-industry"
              value={industry}
              onChange={e => {
                setIndustry(e.target.value)
                if (industryError && e.target.value) setIndustryError(null)
              }}
              aria-invalid={!!industryError}
              aria-describedby={industryError ? 'industry-error' : undefined}
              className={cn(
                'h-11 w-full rounded-lg border bg-white px-3.5 pe-10 text-sm text-[#0A0A0A] outline-none transition-all duration-150 cursor-pointer appearance-none',
                'focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF]',
                !industry && 'text-[#9CA3AF]',
                industryError
                  ? 'border-[#EF4444] focus:ring-[#EF4444]/20 focus:border-[#EF4444]'
                  : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
              )}
            >
              <option value="" disabled>Select your industry</option>
              {INDUSTRIES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <AnimatePresence>
            {industryError && (
              <motion.p
                id="industry-error"
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 text-xs text-[#EF4444]"
              >
                <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                {industryError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="scan-location" className="text-sm font-medium text-[#0A0A0A]">
            Location{' '}
            <span className="text-[#9CA3AF] font-normal text-xs">(optional)</span>
          </label>
          <input
            id="scan-location"
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Tel Aviv, Israel"
            autoComplete="address-level2"
            className="h-11 w-full rounded-lg border border-[#E5E7EB] hover:border-[#D1D5DB] bg-white px-3.5 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] outline-none transition-all duration-150 focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF]"
          />
        </div>

        {/* Competitors */}
        <div className="flex flex-col gap-2">
          <div>
            <span className="text-sm font-medium text-[#0A0A0A]">
              Competitor URLs{' '}
              <span className="text-[#9CA3AF] font-normal text-xs">(optional)</span>
            </span>
            <p className="text-xs text-[#6B7280] mt-0.5">
              We show who AI recommends instead of you.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {competitors.map((val, i) => (
              <div key={i} className="relative">
                <input
                  type="url"
                  value={val}
                  onChange={e => handleCompetitorChange(i, e.target.value)}
                  placeholder={`competitor-${i + 1}.com`}
                  aria-label={`Competitor URL ${i + 1}`}
                  className="h-10 w-full rounded-lg border border-[#E5E7EB] hover:border-[#D1D5DB] bg-white px-3.5 pe-8 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] outline-none transition-all duration-150 focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF]"
                />
                {val && (
                  <button
                    type="button"
                    onClick={() => handleCompetitorChange(i, '')}
                    aria-label={`Clear competitor URL ${i + 1}`}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3370FF] rounded"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Turnstile widget */}
        <div className="flex justify-center">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />
        </div>

        {/* Submit — pill shape is correct for marketing-context CTA */}
        <motion.button
          type="submit"
          disabled={!turnstileToken}
          whileTap={turnstileToken ? { scale: 0.98 } : {}}
          className={cn(
            'mt-1 h-12 w-full rounded-full text-white text-sm font-medium tracking-tight transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2',
            turnstileToken
              ? 'bg-[#3370FF] hover:bg-[#2558E6] cursor-pointer active:scale-[0.98]'
              : 'bg-[#3370FF]/40 cursor-not-allowed'
          )}
          aria-disabled={!turnstileToken}
        >
          Scan my visibility &rarr;
        </motion.button>

        <p className="text-center text-xs text-[#9CA3AF]">
          No account required. Results in about 60 seconds.
        </p>
      </form>
    </motion.div>
  )
}

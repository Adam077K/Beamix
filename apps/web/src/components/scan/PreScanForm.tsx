'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Plus, X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface PreScanFormData {
  url: string
  industry: string
  location: string
  competitors: string[]
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
  const [touched, setTouched] = React.useState(false)

  function handleUrlBlur() {
    if (!url) {
      setUrlError('Enter your website URL')
    } else if (!isValidUrl(url)) {
      setUrlError('Enter a valid URL (e.g. yourbusiness.com)')
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
    setTouched(true)

    let valid = true

    if (!url) {
      setUrlError('Enter your website URL')
      valid = false
    } else if (!isValidUrl(url)) {
      setUrlError('Enter a valid URL (e.g. yourbusiness.com)')
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
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="w-full max-w-[520px] mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
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
          <h1 className="text-2xl font-semibold text-[#0A0A0A] tracking-tight leading-tight">
            See if AI recommends you
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 font-normal">
            Free scan. No signup needed. 60 seconds.
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
            aria-describedby={urlError ? 'url-error' : undefined}
            className={cn(
              'h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-[#0A0A0A] placeholder:text-gray-400 outline-none transition-all duration-150',
              'focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF]',
              urlError
                ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                : 'border-gray-200 hover:border-gray-300'
            )}
          />
          <AnimatePresence>
            {urlError && (
              <motion.p
                id="url-error"
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 text-xs text-red-500"
              >
                <AlertCircle className="size-3 shrink-0" />
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
              'h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-[#0A0A0A] outline-none transition-all duration-150 cursor-pointer appearance-none',
              'focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF]',
              !industry && 'text-gray-400',
              industryError
                ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                : 'border-gray-200 hover:border-gray-300',
              // custom caret
              "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_14px_center]"
            )}
          >
            <option value="" disabled>Select your industry</option>
            {INDUSTRIES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <AnimatePresence>
            {industryError && (
              <motion.p
                id="industry-error"
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 text-xs text-red-500"
              >
                <AlertCircle className="size-3 shrink-0" />
                {industryError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="scan-location" className="text-sm font-medium text-[#0A0A0A]">
            Location{' '}
            <span className="text-gray-400 font-normal text-xs">(optional)</span>
          </label>
          <input
            id="scan-location"
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Tel Aviv, Israel"
            autoComplete="address-level2"
            className="h-11 w-full rounded-lg border border-gray-200 hover:border-gray-300 bg-white px-3.5 text-sm text-[#0A0A0A] placeholder:text-gray-400 outline-none transition-all duration-150 focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF]"
          />
        </div>

        {/* Competitors */}
        <div className="flex flex-col gap-2">
          <div>
            <span className="text-sm font-medium text-[#0A0A0A]">
              Competitor URLs{' '}
              <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </span>
            <p className="text-xs text-gray-400 mt-0.5">We show you who AI recommends instead of you.</p>
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
                  className="h-10 w-full rounded-lg border border-gray-200 hover:border-gray-300 bg-white px-3.5 pr-8 text-sm text-[#0A0A0A] placeholder:text-gray-400 outline-none transition-all duration-150 focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF]"
                />
                {val && (
                  <button
                    type="button"
                    onClick={() => handleCompetitorChange(i, '')}
                    aria-label="Clear competitor URL"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          className="mt-1 h-12 w-full rounded-lg bg-[#3370FF] text-white text-sm font-medium tracking-tight cursor-pointer transition-all duration-150 hover:bg-[#2558e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          Scan my visibility &rarr;
        </motion.button>

        <p className="text-center text-xs text-gray-400">
          No account required. Results ready in about 60 seconds.
        </p>
      </form>
    </motion.div>
  )
}

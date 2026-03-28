'use client'

import { useState, useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { INDUSTRIES } from '@/constants/industries'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────────────────────

interface BusinessFormData {
  businessName: string
  websiteUrl: string
  industry: string
  location: string
  companySize: string
  description: string
  services: string[]
}

// ── Company sizes ───────────────────────────────────────────

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
]

// ── Loading Skeleton ────────────────────────────────────────

function BusinessFormSkeleton() {
  return (
    <div className="animate-pulse" aria-label="Loading business profile">
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
        <div className="flex flex-col gap-5">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-3 w-24 rounded bg-[#F3F4F6]" />
              <div className="h-10 rounded-lg bg-[#F3F4F6]" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-3 w-20 rounded bg-[#F3F4F6]" />
                <div className="h-10 rounded-lg bg-[#F3F4F6]" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 rounded bg-[#F3F4F6]" />
            <div className="h-10 rounded-lg bg-[#F3F4F6]" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 w-16 rounded bg-[#F3F4F6]" />
            <div className="h-[44px] rounded-lg bg-[#F3F4F6]" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 w-24 rounded bg-[#F3F4F6]" />
            <div className="h-[120px] rounded-lg bg-[#F3F4F6]" />
          </div>
        </div>
      </div>
      <div className="mt-8 flex items-center justify-between">
        <div className="h-3 w-32 rounded bg-[#F3F4F6]" />
        <div className="flex gap-4">
          <div className="h-9 w-20 rounded-md bg-[#F3F4F6]" />
          <div className="h-9 w-28 rounded-lg bg-[#F3F4F6]" />
        </div>
      </div>
    </div>
  )
}

// ── Field wrapper ───────────────────────────────────────────

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="text-[12px] font-semibold text-[#111827]"
      >
        {label}
      </label>
      {children}
    </div>
  )
}

// ── Services Tag Display ────────────────────────────────────

function ServicesField({
  services,
  onServicesChange,
}: {
  services: string[]
  onServicesChange: (services: string[]) => void
}) {
  const [inputValue, setInputValue] = useState('')

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = inputValue.trim()
      if (trimmed && !services.includes(trimmed)) {
        onServicesChange([...services, trimmed])
        setInputValue('')
      }
    }
    if (e.key === 'Backspace' && inputValue === '' && services.length > 0) {
      onServicesChange(services.slice(0, -1))
    }
  }

  function removeService(service: string) {
    onServicesChange(services.filter((s) => s !== service))
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12px] font-semibold text-[#111827]">Services</label>
      <div className="flex flex-wrap gap-2 p-2 border border-[#E5E7EB] rounded-lg min-h-[44px] focus-within:border-[#3370FF] transition-all">
        {services.map((service) => (
          <span
            key={service}
            className="inline-flex items-center gap-1 px-2 py-1 bg-[#F3F4F6] text-[#111827] text-[11px] font-medium rounded-[4px]"
          >
            {service}
            <button
              type="button"
              onClick={() => removeService(service)}
              aria-label={`Remove ${service}`}
              className="rounded-full p-0.5 hover:bg-[#E5E7EB] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3370FF]"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={services.length === 0 ? 'Add a service and press Enter' : ''}
          className="flex-1 min-w-[120px] text-[13px] outline-none bg-transparent placeholder:text-[#9CA3AF]"
          aria-label="Add service"
        />
      </div>
      <p className="text-[11px] text-[#9CA3AF]">Type a service and press Enter to add</p>
    </div>
  )
}

// ── Business Profile Tab ────────────────────────────────────

export function SettingsBusinessTab() {
  const [businessName, setBusinessName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [description, setDescription] = useState('')
  const [services, setServices] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Store initial values for discard
  const [initial, setInitial] = useState<BusinessFormData>({
    businessName: '',
    websiteUrl: '',
    industry: '',
    location: '',
    companySize: '',
    description: '',
    services: [],
  })

  useEffect(() => {
    async function loadBusiness() {
      try {
        const res = await fetch('/api/businesses/primary')
        if (res.ok) {
          const data = (await res.json()) as {
            name: string
            website_url: string | null
            industry: string | null
            location: string | null
            company_size: string | null
            description: string | null
            services: string[] | null
          }
          const loaded: BusinessFormData = {
            businessName: data.name ?? '',
            websiteUrl: data.website_url ?? '',
            industry: data.industry ?? '',
            location: data.location ?? '',
            companySize: data.company_size ?? '',
            description: data.description ?? '',
            services: Array.isArray(data.services) ? data.services : [],
          }
          setBusinessName(loaded.businessName)
          setWebsiteUrl(loaded.websiteUrl)
          setIndustry(loaded.industry)
          setLocation(loaded.location)
          setCompanySize(loaded.companySize)
          setDescription(loaded.description)
          setServices(loaded.services)
          setInitial(loaded)
        }
      } catch {
        // Network error — leave form empty and editable
      } finally {
        setLoading(false)
      }
    }
    void loadBusiness()
  }, [])

  const handleDiscard = useCallback(() => {
    setBusinessName(initial.businessName)
    setWebsiteUrl(initial.websiteUrl)
    setIndustry(initial.industry)
    setLocation(initial.location)
    setCompanySize(initial.companySize)
    setDescription(initial.description)
    setServices(initial.services)
    setSaved(false)
    setError(null)
  }, [initial])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const res = await fetch('/api/businesses/primary', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessName,
          website_url: websiteUrl,
          industry,
          location,
          company_size: companySize,
          description,
          services,
        }),
      })
      if (res.ok) {
        setSaved(true)
        setSavedAt('just now')
        setInitial({ businessName, websiteUrl, industry, location, companySize, description, services })
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError('Failed to save changes. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }, [businessName, websiteUrl, industry, location, companySize, description, services])

  const inputClass = cn(
    'h-10 px-3 border border-[#E5E7EB] rounded-lg text-[13px] outline-none',
    'focus:border-[#3370FF] focus:ring-2 focus:ring-blue-600/10 transition-all',
    'bg-white text-[#111827] placeholder:text-[#9CA3AF]',
  )

  const selectTriggerClass = cn(
    'h-10 px-3 border border-[#E5E7EB] rounded-lg text-[13px] outline-none',
    'focus:border-[#3370FF] focus:ring-2 focus:ring-blue-600/10 transition-all',
    'bg-white text-[#111827]',
  )

  if (loading) return <BusinessFormSkeleton />

  return (
    <>
      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
        >
          {error}
        </div>
      )}

      {/* Form card */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
        <form className="flex flex-col gap-5">

          {/* Business Name */}
          <Field label="Business Name" htmlFor="business-name">
            <Input
              id="business-name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your business name"
              className={inputClass}
            />
          </Field>

          {/* Website */}
          <Field label="Website" htmlFor="website-url">
            <Input
              id="website-url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="yourbusiness.com"
              className={inputClass}
            />
          </Field>

          {/* Industry & Location — 2-column grid */}
          <div className="grid grid-cols-2 gap-6">

            <Field label="Industry" htmlFor="industry-select">
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger
                  id="industry-select"
                  className={selectTriggerClass}
                >
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Location" htmlFor="location">
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Tel Aviv, Israel"
                className={inputClass}
              />
            </Field>

          </div>

          {/* Company Size */}
          <Field label="Company Size" htmlFor="company-size">
            <Select value={companySize} onValueChange={setCompanySize}>
              <SelectTrigger
                id="company-size"
                className={selectTriggerClass}
              >
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_SIZES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Services */}
          <ServicesField services={services} onServicesChange={setServices} />

          {/* Description */}
          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setDescription(e.target.value)
                }
              }}
              placeholder="Enter company bio..."
              rows={4}
              className={cn(
                'p-3 border border-[#E5E7EB] rounded-lg text-[13px] outline-none resize-none',
                'focus:border-[#3370FF] focus:ring-2 focus:ring-blue-600/10 transition-all',
                'bg-white text-[#111827] placeholder:text-[#9CA3AF]',
              )}
            />
            <p className="text-end text-[11px] text-[#9CA3AF]">
              {description.length}/500
            </p>
          </Field>

        </form>
      </div>

      {/* Footer — outside the card */}
      <footer className="mt-8 flex items-center justify-between">
        <div className="text-[11px] text-[#9CA3AF] tabular-nums font-medium">
          {savedAt ? `Last saved: ${savedAt}` : saved ? 'Last saved: just now' : '\u00A0'}
        </div>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleDiscard}
            disabled={saving}
            className="px-5 py-2 text-[13px] font-medium text-[#111827] border border-[#E5E7EB] rounded-md hover:bg-gray-50 transition-colors"
          >
            Discard
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-[13px] font-medium text-white bg-[#111827] rounded-lg hover:bg-gray-800 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </footer>

      {/* Information panel — 2-column grid */}
      <div className="mt-12 grid grid-cols-2 gap-8 border-t border-[#E5E7EB] pt-8">
        <div>
          <h3 className="text-[14px] font-semibold text-[#111827] mb-2">Security Verification</h3>
          <p className="text-[12px] text-[#6B7280] leading-relaxed">
            Your business identity is verified periodically to maintain compliance standards.
            Any changes to the legal name will require re-authentication.
          </p>
        </div>
        <div className="bg-blue-50/50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="h-[18px] w-[18px] text-blue-600 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-[12px] font-semibold text-blue-900">Optimization Tip</h4>
              <p className="text-[11px] text-blue-700 mt-1">
                Companies with complete website and industry data see a 40% increase in scan accuracy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

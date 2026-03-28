'use client'

import { useState, useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { INDUSTRIES } from '@/constants/industries'
import { cn } from '@/lib/utils'

// ── Tag Input ──────────────────────────────────────────────

function TagInput({
  tags,
  onTagsChange,
  placeholder,
  maxTags,
}: {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder: string
  maxTags?: number
}) {
  const [inputValue, setInputValue] = useState('')

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = inputValue.trim()
      if (
        trimmed &&
        !tags.includes(trimmed) &&
        (!maxTags || tags.length < maxTags)
      ) {
        onTagsChange([...tags, trimmed])
        setInputValue('')
      }
    }
    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      onTagsChange(tags.slice(0, -1))
    }
  }

  function removeTag(tagToRemove: string) {
    onTagsChange(tags.filter((t) => t !== tagToRemove))
  }

  return (
    <div className="space-y-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#EBF0FF] text-[#3370FF] text-xs font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="rounded-full p-0.5 hover:bg-[#3370FF]/20 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3370FF]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          maxTags !== undefined && tags.length >= maxTags
            ? `Max ${maxTags} items`
            : placeholder
        }
        disabled={maxTags !== undefined && tags.length >= maxTags}
        className="w-full border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] rounded-lg focus-visible:ring-[#3370FF]/40 focus-visible:border-[#3370FF]"
      />
      {maxTags && (
        <p className="text-xs text-[#9CA3AF]">
          {tags.length}/{maxTags} added
        </p>
      )}
    </div>
  )
}

// ── Loading Skeleton ────────────────────────────────────────

function BusinessFormSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-label="Loading business profile">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded bg-[#F3F4F6]" />
            <div className="h-9 rounded-lg bg-[#F3F4F6]" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-[#F3F4F6]" />
        <div className="h-24 rounded-lg bg-[#F3F4F6]" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-28 rounded bg-[#F3F4F6]" />
        <div className="h-9 rounded-lg bg-[#F3F4F6]" />
      </div>
      <div className="h-px bg-[#F3F4F6]" />
      <div className="flex justify-end gap-2">
        <div className="h-9 w-20 rounded-lg bg-[#F3F4F6]" />
        <div className="h-9 w-28 rounded-lg bg-[#F3F4F6]" />
      </div>
    </div>
  )
}

// ── Field wrapper ───────────────────────────────────────────

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-sm font-medium text-[#6B7280]"
      >
        {label}
      </Label>
      {hint && <p className="text-xs text-[#9CA3AF]">{hint}</p>}
      {children}
    </div>
  )
}

// ── Business Profile Tab ────────────────────────────────────

export function SettingsBusinessTab() {
  const [businessName, setBusinessName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [services, setServices] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Store initial values for discard
  const [initial, setInitial] = useState({
    businessName: '',
    websiteUrl: '',
    industry: '',
    location: '',
    description: '',
    services: [] as string[],
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
            description: string | null
            services: string[] | null
          }
          const loaded = {
            businessName: data.name ?? '',
            websiteUrl: data.website_url ?? '',
            industry: data.industry ?? '',
            location: data.location ?? '',
            description: data.description ?? '',
            services: Array.isArray(data.services) ? data.services : [],


          }
          setBusinessName(loaded.businessName)
          setWebsiteUrl(loaded.websiteUrl)
          setIndustry(loaded.industry)
          setLocation(loaded.location)
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
          description,
          services,


        }),
      })
      if (res.ok) {
        setSaved(true)
        setInitial({ businessName, websiteUrl, industry, location, description, services })
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError('Failed to save changes. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }, [businessName, websiteUrl, industry, location, description, services])

  const inputClass = cn(
    'w-full border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] rounded-lg',
    'focus-visible:ring-[#3370FF]/40 focus-visible:border-[#3370FF]',
  )

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-5">

      {/* Section header */}
      <div className="mb-5">
        <h2 className="text-base font-semibold text-[#111827]">Business Profile</h2>
        <p className="mt-0.5 text-sm text-[#6B7280]">
          Update your business information for more accurate scans.
        </p>
      </div>

      {loading ? (
        <BusinessFormSkeleton />
      ) : (
        <div className="space-y-5">

          {/* Error state */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* 2-column grid on desktop */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <Field label="Business Name" htmlFor="business-name">
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your business name"
                className={inputClass}
              />
            </Field>

            <Field label="Website URL" htmlFor="website-url">
              <Input
                id="website-url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourbusiness.com"
                className={inputClass}
              />
            </Field>

            <Field label="Industry" htmlFor="industry-select">
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger
                  id="industry-select"
                  className="w-full border-[#E5E7EB] bg-white text-[#111827] rounded-lg focus:ring-[#3370FF]/40 focus:border-[#3370FF]"
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

            <Field label="Location / Primary Market" htmlFor="location">
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Tel Aviv, Israel"
                className={inputClass}
              />
            </Field>

          </div>

          {/* Description — full width */}
          <Field label="Business Description" htmlFor="description">
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setDescription(e.target.value)
                }
              }}
              placeholder="Describe your business and what makes it unique..."
              rows={4}
              className={cn(inputClass, 'resize-none')}
            />
            <p className="text-end text-xs text-[#9CA3AF]">
              {description.length}/500
            </p>
          </Field>

          {/* Services */}
          <Field
            label="Services / Products"
            hint="Type a service and press Enter to add"
          >
            <TagInput
              tags={services}
              onTagsChange={setServices}
              placeholder="e.g., SEO Consulting"
            />
          </Field>

          {/* Divider */}
          <div className="h-px bg-[#F3F4F6]" />

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3">
            <div>
              {saved && (
                <span className="text-sm font-medium text-[#10B981]">
                  Changes saved successfully
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDiscard}
                disabled={saving}
                className="rounded-lg border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:bg-[#F6F7F9]"
              >
                Discard
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-[#111827] text-white hover:bg-[#1f2937] focus-visible:ring-[#3370FF]/40"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

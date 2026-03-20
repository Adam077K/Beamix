'use client'

import { useState, useCallback, useEffect } from 'react'
import { Save, X, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { INDUSTRIES } from '@/constants/industries'

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
  }

  function removeTag(tagToRemove: string) {
    onTagsChange(tags.filter((t) => t !== tagToRemove))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1 py-1 ps-2.5 pe-1.5 text-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="rounded-full p-0.5 hover:bg-primary/20 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={maxTags !== undefined && tags.length >= maxTags}
        className="input-enhanced w-full"
      />
      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {tags.length}/{maxTags}
        </p>
      )}
    </div>
  )
}

// ── Loading Skeleton ───────────────────────────────────────

function BusinessFormSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-label="Loading business profile">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded-md bg-muted" />
            <div className="h-10 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 rounded-md bg-muted" />
        <div className="h-24 rounded-lg bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-28 rounded-md bg-muted" />
        <div className="h-10 rounded-lg bg-muted" />
      </div>
    </div>
  )
}

// ── Business Profile Tab ───────────────────────────────────

export function SettingsBusinessTab() {
  const [businessName, setBusinessName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [services, setServices] = useState<string[]>([])
  const [competitors, setCompetitors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

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
          setBusinessName(data.name ?? '')
          setWebsiteUrl(data.website_url ?? '')
          setIndustry(data.industry ?? '')
          setLocation(data.location ?? '')
          setDescription(data.description ?? '')
          setServices(Array.isArray(data.services) ? data.services : [])
        }
      } catch {
        // Network error — leave form empty and editable
      } finally {
        setLoading(false)
      }
    }
    void loadBusiness()
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaved(false)
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
          competitors,
        }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }, [businessName, websiteUrl, industry, location, description, services, competitors])

  return (
    <Card className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-card)]">
      <CardHeader className="pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Business Profile
            </CardTitle>
            <CardDescription className="mt-0.5">
              Update your business information for more accurate scans.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {loading ? (
          <BusinessFormSkeleton />
        ) : (
          <>
            {/* 2-column grid on desktop */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Business Name */}
              <div className="space-y-1.5">
                <Label htmlFor="business-name" className="text-sm font-medium">
                  Business Name
                </Label>
                <Input
                  id="business-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your business name"
                  className="input-enhanced w-full"
                />
              </div>

              {/* Website URL */}
              <div className="space-y-1.5">
                <Label htmlFor="website-url" className="text-sm font-medium">
                  Website URL
                </Label>
                <Input
                  id="website-url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourbusiness.com"
                  className="input-enhanced w-full"
                />
              </div>

              {/* Industry */}
              <div className="space-y-1.5">
                <Label htmlFor="industry-select" className="text-sm font-medium">
                  Industry
                </Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger id="industry-select" className="w-full">
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
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-sm font-medium">
                  Location / Primary Market
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Tel Aviv, Israel"
                  className="input-enhanced w-full"
                />
              </div>
            </div>

            {/* Description — full width */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium">
                Business Description
              </Label>
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
                className="resize-none"
              />
              <p className="text-end text-xs text-muted-foreground">
                {description.length}/500
              </p>
            </div>

            {/* Services */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Services / Products</Label>
              <p className="text-xs text-muted-foreground">
                Type a service and press Enter to add
              </p>
              <TagInput
                tags={services}
                onTagsChange={setServices}
                placeholder="e.g., SEO Consulting"
              />
            </div>

            {/* Competitors */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Main Competitors</Label>
              <p className="text-xs text-muted-foreground">
                Add up to 5 competitor names
              </p>
              <TagInput
                tags={competitors}
                onTagsChange={setCompetitors}
                placeholder="Type a competitor name and press Enter"
                maxTags={5}
              />
            </div>

            <Separator className="my-1" />

            <div className="flex items-center justify-between gap-3">
              {saved && (
                <span className="text-sm font-medium text-emerald-600">
                  Changes saved successfully
                </span>
              )}
              {!saved && <span />}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 btn-primary-lift"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

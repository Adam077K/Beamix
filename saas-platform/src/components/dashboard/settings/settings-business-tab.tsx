'use client'

import { useState, useCallback, useEffect } from 'react'
import { Save, X } from 'lucide-react'
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
      if (trimmed && !tags.includes(trimmed) && (!maxTags || tags.length < maxTags)) {
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
            className="gap-1 py-1 ps-2.5 pe-1.5 text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="rounded-full p-0.5 hover:bg-black/10"
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
      />
      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {tags.length}/{maxTags}
        </p>
      )}
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
          const data = await res.json() as {
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
        }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }, [businessName, websiteUrl, industry, location, description, services])

  return (
    <Card className="bg-card rounded-[20px] border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="font-sans font-medium text-lg text-foreground">
          Business Profile
        </CardTitle>
        <CardDescription>
          Update your business information for more accurate scans.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-9 rounded-lg bg-muted" />
            <div className="h-9 rounded-lg bg-muted" />
            <div className="h-9 rounded-lg bg-muted" />
          </div>
        )}

        {!loading && (
          <>
            {/* Business Name */}
            <div className="space-y-1.5">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your business name"
              />
            </div>

            {/* Website URL */}
            <div className="space-y-1.5">
              <Label htmlFor="website-url">Website URL</Label>
              <Input
                id="website-url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourbusiness.com"
              />
            </div>

            {/* Industry */}
            <div className="space-y-1.5">
              <Label htmlFor="industry-select">Industry</Label>
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
              <Label htmlFor="location">Location / Primary Market</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Tel Aviv, Israel"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Business Description</Label>
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
              />
              <p className="text-end text-xs text-muted-foreground">
                {description.length}/500
              </p>
            </div>

            {/* Services */}
            <div className="space-y-1.5">
              <Label>Services / Products</Label>
              <TagInput
                tags={services}
                onTagsChange={setServices}
                placeholder="Type a service and press Enter"
              />
            </div>

            {/* Competitors */}
            <div className="space-y-1.5">
              <Label>Main Competitors</Label>
              <TagInput
                tags={competitors}
                onTagsChange={setCompetitors}
                placeholder="Type a competitor name and press Enter"
                maxTags={5}
              />
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              {saved && (
                <span className="text-sm text-green-600">
                  Changes saved successfully
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

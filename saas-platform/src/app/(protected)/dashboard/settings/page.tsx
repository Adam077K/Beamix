'use client'

import { useState, useCallback } from 'react'
import {
  Building2,
  CreditCard,
  Settings2,
  Puzzle,
  Save,
  X,
  Plus,
  ExternalLink,
  FileText,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { INDUSTRIES } from '@/constants/industries'

// ──────────────────────────────────────────────────────────
// Tag Input Component
// ──────────────────────────────────────────────────────────

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
            className="gap-1 py-1 pl-2.5 pr-1.5 text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
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
        <p className="text-xs text-[var(--color-muted)]">
          {tags.length}/{maxTags}
        </p>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Tab 1: Business Profile
// ──────────────────────────────────────────────────────────

function BusinessProfileTab() {
  const [businessName, setBusinessName] = useState('My Business')
  const [websiteUrl, setWebsiteUrl] = useState('https://example.com')
  const [industry, setIndustry] = useState('tech')
  const [location, setLocation] = useState('Tel Aviv, Israel')
  const [description, setDescription] = useState('')
  const [services, setServices] = useState<string[]>(['Web Development', 'AI Solutions'])
  const [competitors, setCompetitors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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
    <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
      <CardHeader>
        <CardTitle className="font-display text-lg">Business Profile</CardTitle>
        <CardDescription>Update your business information for more accurate scans.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
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
          <Label>Industry</Label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="w-full">
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
          <p className="text-right text-xs text-[var(--color-muted)]">
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
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          {saved && (
            <span className="text-sm text-emerald-600">Changes saved successfully</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────
// Tab 2: Billing
// ──────────────────────────────────────────────────────────

const BILLING_HISTORY = [
  { date: 'March 1, 2026', amount: '$149.00' },
  { date: 'February 1, 2026', amount: '$149.00' },
]

const TOP_UPS = [
  { uses: 5, price: '$15', label: 'Add 5 Uses' },
  { uses: 15, price: '$35', label: 'Add 15 Uses' },
]

function BillingTab() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
        <CardHeader>
          <CardTitle className="font-display text-lg">Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-baseline gap-3">
            <Badge className="bg-[var(--color-accent)] text-white text-sm px-3 py-1">Pro</Badge>
            <span className="font-display text-2xl font-bold text-[var(--color-text)]">$149</span>
            <span className="text-[var(--color-muted)]">/ month</span>
            <span className="text-[var(--color-muted)]">
              Next billing: April 1, 2026
            </span>
          </div>

          <Separator />

          {/* Usage */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Usage This Month</h3>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-text)]">Tracked Queries</span>
                <span className="font-medium text-[var(--color-text)]">18/25</span>
              </div>
              <Progress value={(18 / 25) * 100} className="h-2" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-text)]">Agent Uses</span>
                <span className="font-medium text-[var(--color-text)]">8/15</span>
              </div>
              <Progress value={(8 / 15) * 100} className="h-2" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-text)]">Scans</span>
                <span className="font-medium text-[var(--color-text)]">12 / unlimited</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Top-Ups */}
      <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
        <CardHeader>
          <CardTitle className="font-display text-lg">Agent Top-Ups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {TOP_UPS.map((topUp) => (
              <div
                key={topUp.uses}
                className="flex items-center justify-between rounded-xl border border-[var(--color-card-border)] p-4"
              >
                <div>
                  <p className="font-medium text-[var(--color-text)]">
                    {topUp.uses} extra uses
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">{topUp.price}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-3 w-3" />
                  {topUp.label}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
        <CardHeader>
          <CardTitle className="font-display text-lg">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {BILLING_HISTORY.map((item) => (
              <div
                key={item.date}
                className="flex items-center justify-between rounded-xl bg-[var(--color-bg)] p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-[var(--color-muted)]" />
                  <span className="text-sm text-[var(--color-text)]">{item.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[var(--color-text)]">{item.amount}</span>
                  <Button variant="ghost" size="xs">
                    Invoice
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method + Actions */}
      <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-[var(--color-muted)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Payment Method</p>
              <p className="text-sm text-[var(--color-muted)]">Visa ending in 4242</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              Update Payment Method
            </Button>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              Change Plan
            </Button>
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Tab 3: Preferences
// ──────────────────────────────────────────────────────────

const TIMEZONES = [
  { value: 'Asia/Jerusalem', label: 'Israel (GMT+2)' },
  { value: 'America/New_York', label: 'Eastern Time (GMT-5)' },
  { value: 'America/Chicago', label: 'Central Time (GMT-6)' },
  { value: 'America/Denver', label: 'Mountain Time (GMT-7)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (GMT-8)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'Europe/Berlin', label: 'Central Europe (GMT+1)' },
  { value: 'Europe/Athens', label: 'Eastern Europe (GMT+2)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+11)' },
]

function PreferencesTab() {
  const [interfaceLanguage, setInterfaceLanguage] = useState<'en' | 'he'>('en')
  const [contentLanguage, setContentLanguage] = useState<'en' | 'he'>('en')
  const [timezone, setTimezone] = useState('Asia/Jerusalem')
  const [notifications, setNotifications] = useState({
    weeklyDigest: true,
    rankingDrop: true,
    competitorMovement: false,
    agentComplete: true,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: interfaceLanguage,
          content_language: contentLanguage,
          timezone,
          email_weekly_report: notifications.weeklyDigest,
          email_scan_complete: notifications.rankingDrop,
          email_recommendations: notifications.competitorMovement,
          email_agent_complete: notifications.agentComplete,
        }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }, [interfaceLanguage, contentLanguage, timezone, notifications])

  return (
    <div className="space-y-6">
      {/* Language */}
      <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
        <CardHeader>
          <CardTitle className="font-display text-lg">Language</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Interface Language */}
          <div className="space-y-2">
            <Label>Interface Language</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setInterfaceLanguage('en')}
                className={`rounded-xl border px-4 py-2 text-sm transition ${
                  interfaceLanguage === 'en'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'border-[var(--color-card-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]/50'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setInterfaceLanguage('he')}
                className={`rounded-xl border px-4 py-2 text-sm transition ${
                  interfaceLanguage === 'he'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'border-[var(--color-card-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]/50'
                }`}
              >
                Hebrew
              </button>
            </div>
          </div>

          {/* Content Language */}
          <div className="space-y-2">
            <Label>Content Language</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setContentLanguage('en')}
                className={`rounded-xl border px-4 py-2 text-sm transition ${
                  contentLanguage === 'en'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'border-[var(--color-card-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]/50'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setContentLanguage('he')}
                className={`rounded-xl border px-4 py-2 text-sm transition ${
                  contentLanguage === 'he'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'border-[var(--color-card-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]/50'
                }`}
              >
                Hebrew
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timezone */}
      <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
        <CardHeader>
          <CardTitle className="font-display text-lg">Timezone</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
        <CardHeader>
          <CardTitle className="font-display text-lg">Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Weekly Digest</p>
              <p className="text-xs text-[var(--color-muted)]">Summary every Monday</p>
            </div>
            <Switch
              checked={notifications.weeklyDigest}
              onCheckedChange={() => toggleNotification('weeklyDigest')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Ranking Drop Alerts</p>
              <p className="text-xs text-[var(--color-muted)]">Get notified when your score drops</p>
            </div>
            <Switch
              checked={notifications.rankingDrop}
              onCheckedChange={() => toggleNotification('rankingDrop')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Competitor Movement Alerts</p>
              <p className="text-xs text-[var(--color-muted)]">When competitors gain or lose visibility</p>
            </div>
            <Switch
              checked={notifications.competitorMovement}
              onCheckedChange={() => toggleNotification('competitorMovement')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Agent Complete Notifications</p>
              <p className="text-xs text-[var(--color-muted)]">When an AI agent finishes a task</p>
            </div>
            <Switch
              checked={notifications.agentComplete}
              onCheckedChange={() => toggleNotification('agentComplete')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
        {saved && (
          <span className="text-sm text-emerald-600">Preferences saved successfully</span>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Tab 4: Integrations
// ──────────────────────────────────────────────────────────

const INTEGRATIONS = [
  {
    name: 'WordPress',
    description: 'Publish content directly to your WordPress site.',
    icon: '🔌',
  },
  {
    name: 'Wix',
    description: 'Auto-publish to your Wix website.',
    icon: '🌐',
  },
  {
    name: 'Google Business Profile',
    description: 'Sync business info and post updates.',
    icon: '📍',
  },
  {
    name: 'Facebook Pages',
    description: 'Share content to your Facebook business page.',
    icon: '📘',
  },
]

function IntegrationsTab() {
  return (
    <div className="space-y-4">
      {INTEGRATIONS.map((integration) => (
        <Card
          key={integration.name}
          className="border-[var(--color-card-border)]"
          style={{ borderRadius: 'var(--card-radius)' }}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-bg)] text-2xl">
              {integration.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--color-text)]">{integration.name}</p>
              <p className="text-sm text-[var(--color-muted)]">{integration.description}</p>
            </div>
            <Badge
              variant="secondary"
              className="shrink-0 bg-amber-100 text-amber-700"
            >
              Coming Soon
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Main Settings Page
// ──────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
          Settings
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Manage your account, billing, and preferences
        </p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="w-full justify-start border-b border-[var(--color-card-border)] bg-transparent p-0" variant="line">
          <TabsTrigger value="business" className="gap-1.5 data-[state=active]:text-[var(--color-accent)]">
            <Building2 className="h-4 w-4" />
            Business Profile
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5 data-[state=active]:text-[var(--color-accent)]">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5 data-[state=active]:text-[var(--color-accent)]">
            <Settings2 className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1.5 data-[state=active]:text-[var(--color-accent)]">
            <Puzzle className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <BusinessProfileTab />
        </TabsContent>

        <TabsContent value="billing">
          <BillingTab />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesTab />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

'use client'

import { useState, useCallback, useEffect } from 'react'
import { Save, Moon, Sun, Globe, Clock, Bell } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ── Timezones ──────────────────────────────────────────────

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

// ── Notification items ─────────────────────────────────────

type NotificationKey =
  | 'weeklyDigest'
  | 'rankingDrop'
  | 'competitorMovement'
  | 'agentComplete'

interface NotificationPrefItem {
  key: NotificationKey
  label: string
  description: string
}

const NOTIFICATION_PREFS: NotificationPrefItem[] = [
  {
    key: 'weeklyDigest',
    label: 'Weekly Digest',
    description: 'Summary every Monday',
  },
  {
    key: 'rankingDrop',
    label: 'Ranking Drop Alerts',
    description: 'Get notified when your score drops',
  },
  {
    key: 'competitorMovement',
    label: 'Competitor Movement',
    description: 'When competitors gain or lose visibility',
  },
  {
    key: 'agentComplete',
    label: 'Agent Complete',
    description: 'When an AI agent finishes a task',
  },
]

// ── Loading skeleton ───────────────────────────────────────

function PreferencesSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-label="Loading preferences">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-36 rounded-lg bg-muted" />
      ))}
    </div>
  )
}

// ── Section card wrapper ───────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="bg-card rounded-lg border border-border shadow-[var(--shadow-card)]">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <CardTitle className="text-base font-semibold text-foreground">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// ── Preferences Tab ────────────────────────────────────────

export function SettingsPreferencesTab() {
  const { theme, setTheme } = useTheme()
  const [interfaceLanguage, setInterfaceLanguage] = useState<'en' | 'he'>('en')
  const [contentLanguage, setContentLanguage] = useState<'en' | 'he'>('en')
  const [timezone, setTimezone] = useState('Asia/Jerusalem')
  const [notifications, setNotifications] = useState<
    Record<NotificationKey, boolean>
  >({
    weeklyDigest: true,
    rankingDrop: true,
    competitorMovement: false,
    agentComplete: true,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await fetch('/api/preferences')
        if (res.ok) {
          const data = (await res.json()) as {
            interface_lang?: string
            content_lang?: string
            timezone?: string
            weekly_digest?: boolean
            ranking_change_alerts?: boolean
            competitor_alerts?: boolean
            agent_completion?: boolean
          }
          setInterfaceLanguage((data.interface_lang ?? 'en') as 'en' | 'he')
          setContentLanguage((data.content_lang ?? 'en') as 'en' | 'he')
          setTimezone(data.timezone ?? 'Asia/Jerusalem')
          setNotifications({
            weeklyDigest: data.weekly_digest ?? true,
            rankingDrop: data.ranking_change_alerts ?? true,
            competitorMovement: data.competitor_alerts ?? false,
            agentComplete: data.agent_completion ?? true,
          })
        }
      } catch {
        // Network error — use defaults
      } finally {
        setLoading(false)
      }
    }
    void loadPreferences()
  }, [])

  function toggleNotification(key: NotificationKey) {
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
          interface_lang: interfaceLanguage,
          content_lang: contentLanguage,
          timezone,
          weekly_digest: notifications.weeklyDigest,
          ranking_change_alerts: notifications.rankingDrop,
          competitor_alerts: notifications.competitorMovement,
          agent_completion: notifications.agentComplete,
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

  if (loading) return <PreferencesSkeleton />

  return (
    <div className="space-y-5">

      {/* Appearance */}
      <SectionCard icon={Sun} title="Appearance">
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              {theme === 'dark' ? (
                <Moon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              ) : (
                <Sun className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Dark Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Switch between light and dark theme
              </p>
            </div>
          </div>
          <Switch
            id="dark-mode"
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            aria-label="Toggle dark mode"
          />
        </div>
      </SectionCard>

      {/* Language */}
      <SectionCard icon={Globe} title="Language">
        <div className="space-y-5">
          {/* Interface Language */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Interface Language</Label>
            <div className="flex gap-2">
              {(['en', 'he'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setInterfaceLanguage(lang)}
                  className={cn(
                    'rounded-xl border px-5 py-2 text-sm font-medium transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    interfaceLanguage === lang
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                  )}
                  aria-pressed={interfaceLanguage === lang}
                >
                  {lang === 'en' ? 'English' : 'Hebrew'}
                </button>
              ))}
            </div>
          </div>

          {/* Content Language */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Content Language</Label>
            <p className="text-xs text-muted-foreground">
              Language used when agents write content for you
            </p>
            <div className="flex gap-2">
              {(['en', 'he'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setContentLanguage(lang)}
                  className={cn(
                    'rounded-xl border px-5 py-2 text-sm font-medium transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    contentLanguage === lang
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                  )}
                  aria-pressed={contentLanguage === lang}
                >
                  {lang === 'en' ? 'English' : 'Hebrew'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Timezone */}
      <SectionCard icon={Clock} title="Timezone">
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="w-full" aria-label="Select timezone">
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
      </SectionCard>

      {/* Email Notifications */}
      <SectionCard icon={Bell} title="Email Notifications">
        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border/60">
          {NOTIFICATION_PREFS.map((pref) => (
            <div
              key={pref.key}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/20 transition-colors"
            >
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium text-foreground">
                  {pref.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pref.description}
                </p>
              </div>
              <Switch
                checked={notifications[pref.key]}
                onCheckedChange={() => toggleNotification(pref.key)}
                aria-label={`Toggle ${pref.label}`}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Save */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {saved && (
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Preferences saved successfully
          </span>
        )}
        {!saved && <span />}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 btn-primary-lift"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
}

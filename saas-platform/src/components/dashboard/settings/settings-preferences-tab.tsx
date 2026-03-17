'use client'

import { useState, useCallback, useEffect } from 'react'
import { Save, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
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

// ── Preferences Tab ────────────────────────────────────────

export function SettingsPreferencesTab() {
  const { theme, setTheme } = useTheme()
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await fetch('/api/preferences')
        if (res.ok) {
          const data = await res.json() as {
            interface_lang?: string
            content_lang?: string
            timezone?: string
            weekly_digest?: boolean
            scan_complete_emails?: boolean
            competitor_alerts?: boolean
            agent_completion?: boolean
          }
          setInterfaceLanguage((data.interface_lang ?? 'en') as 'en' | 'he')
          setContentLanguage((data.content_lang ?? 'en') as 'en' | 'he')
          setTimezone(data.timezone ?? 'Asia/Jerusalem')
          setNotifications({
            weeklyDigest: data.weekly_digest ?? true,
            rankingDrop: data.scan_complete_emails ?? true,
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
          interface_lang: interfaceLanguage,
          content_lang: contentLanguage,
          timezone,
          weekly_digest: notifications.weeklyDigest,
          scan_complete_emails: notifications.rankingDrop,
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

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-[20px] bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card className="bg-card rounded-[20px] border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans font-medium text-lg text-foreground">
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">Dark Mode</p>
                <p className="text-xs text-muted-foreground">
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
        </CardContent>
      </Card>

      {/* Language */}
      <Card className="bg-card rounded-[20px] border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans font-medium text-lg text-foreground">
            Language
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Interface Language */}
          <div className="space-y-2">
            <Label>Interface Language</Label>
            <div className="flex gap-3">
              {(['en', 'he'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setInterfaceLanguage(lang)}
                  className={cn(
                    'rounded-xl border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    interfaceLanguage === lang
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-foreground hover:border-primary/50'
                  )}
                >
                  {lang === 'en' ? 'English' : 'Hebrew'}
                </button>
              ))}
            </div>
          </div>

          {/* Content Language */}
          <div className="space-y-2">
            <Label>Content Language</Label>
            <div className="flex gap-3">
              {(['en', 'he'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setContentLanguage(lang)}
                  className={cn(
                    'rounded-xl border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    contentLanguage === lang
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-foreground hover:border-primary/50'
                  )}
                >
                  {lang === 'en' ? 'English' : 'Hebrew'}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timezone */}
      <Card className="bg-card rounded-[20px] border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans font-medium text-lg text-foreground">
            Timezone
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card className="bg-card rounded-[20px] border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans font-medium text-lg text-foreground">
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Weekly Digest
              </p>
              <p className="text-xs text-muted-foreground">
                Summary every Monday
              </p>
            </div>
            <Switch
              checked={notifications.weeklyDigest}
              onCheckedChange={() => toggleNotification('weeklyDigest')}
              aria-label="Toggle weekly digest"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Ranking Drop Alerts
              </p>
              <p className="text-xs text-muted-foreground">
                Get notified when your score drops
              </p>
            </div>
            <Switch
              checked={notifications.rankingDrop}
              onCheckedChange={() => toggleNotification('rankingDrop')}
              aria-label="Toggle ranking drop alerts"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Competitor Movement Alerts
              </p>
              <p className="text-xs text-muted-foreground">
                When competitors gain or lose visibility
              </p>
            </div>
            <Switch
              checked={notifications.competitorMovement}
              onCheckedChange={() => toggleNotification('competitorMovement')}
              aria-label="Toggle competitor movement alerts"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Agent Complete Notifications
              </p>
              <p className="text-xs text-muted-foreground">
                When an AI agent finishes a task
              </p>
            </div>
            <Switch
              checked={notifications.agentComplete}
              onCheckedChange={() => toggleNotification('agentComplete')}
              aria-label="Toggle agent complete notifications"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
        {saved && (
          <span className="text-sm text-green-600">
            Preferences saved successfully
          </span>
        )}
      </div>
    </div>
  )
}

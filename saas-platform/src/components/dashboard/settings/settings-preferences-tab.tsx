'use client'

import { useState, useCallback, useEffect } from 'react'
import { Moon, Sun, Globe, Clock, Bell } from 'lucide-react'
import { useTheme } from 'next-themes'
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

// ── Timezones ───────────────────────────────────────────────

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

// ── Notification items ──────────────────────────────────────

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

// ── Loading skeleton ────────────────────────────────────────

function PreferencesSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-label="Loading preferences">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 rounded-lg bg-[#F3F4F6]" />
      ))}
    </div>
  )
}

// ── Section wrapper ─────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4F6]">
          <Icon className="h-4 w-4 text-[#6B7280]" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ── Language toggle ─────────────────────────────────────────

function LangToggle({
  value,
  onChange,
}: {
  value: 'en' | 'he'
  onChange: (v: 'en' | 'he') => void
}) {
  return (
    <div className="flex gap-2">
      {(['en', 'he'] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          className={cn(
            'rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]/40',
            value === lang
              ? 'border-[#3370FF] bg-[#EBF0FF] text-[#3370FF]'
              : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#3370FF]/40 hover:text-[#111827]',
          )}
          aria-pressed={value === lang}
        >
          {lang === 'en' ? 'English' : 'Hebrew'}
        </button>
      ))}
    </div>
  )
}

// ── Preferences Tab ─────────────────────────────────────────

export function SettingsPreferencesTab() {
  const { theme, setTheme } = useTheme()
  const [interfaceLanguage, setInterfaceLanguage] = useState<'en' | 'he'>('en')
  const [contentLanguage, setContentLanguage] = useState<'en' | 'he'>('en')
  const [timezone, setTimezone] = useState('Asia/Jerusalem')
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    weeklyDigest: true,
    rankingDrop: true,
    competitorMovement: false,
    agentComplete: true,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    setError(null)
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
      } else {
        setError('Failed to save preferences. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }, [interfaceLanguage, contentLanguage, timezone, notifications])

  if (loading) return <PreferencesSkeleton />

  return (
    <div className="space-y-4">

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Appearance */}
      <Section icon={Sun} title="Appearance">
        <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F6F7F9] px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#E5E7EB]">
              {theme === 'dark' ? (
                <Moon className="h-3.5 w-3.5 text-[#6B7280]" aria-hidden="true" />
              ) : (
                <Sun className="h-3.5 w-3.5 text-[#6B7280]" aria-hidden="true" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[#111827]">Dark Mode</p>
              <p className="text-xs text-[#6B7280] mt-0.5">
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
      </Section>

      {/* Language */}
      <Section icon={Globe} title="Language">
        <div className="space-y-5">

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#6B7280]">
              Interface Language
            </Label>
            <LangToggle value={interfaceLanguage} onChange={setInterfaceLanguage} />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#6B7280]">
              Content Language
            </Label>
            <p className="text-xs text-[#9CA3AF]">
              Language used when agents write content for you
            </p>
            <LangToggle value={contentLanguage} onChange={setContentLanguage} />
          </div>

        </div>
      </Section>

      {/* Timezone */}
      <Section icon={Clock} title="Timezone">
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger
            className="w-full border-[#E5E7EB] bg-white text-[#111827] rounded-lg focus:ring-[#3370FF]/40"
            aria-label="Select timezone"
          >
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
      </Section>

      {/* Email Notifications */}
      <Section icon={Bell} title="Email Notifications">
        <div className="rounded-lg border border-[#E5E7EB] overflow-hidden divide-y divide-[#F3F4F6]">
          {NOTIFICATION_PREFS.map((pref) => (
            <div
              key={pref.key}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-[#F6F7F9] transition-colors"
            >
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium text-[#111827]">{pref.label}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{pref.description}</p>
              </div>
              <Switch
                checked={notifications[pref.key]}
                onCheckedChange={() => toggleNotification(pref.key)}
                aria-label={`Toggle ${pref.label}`}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Save footer */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          {saved && (
            <span className="text-sm font-medium text-[#10B981]">
              Preferences saved successfully
            </span>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[#111827] text-white hover:bg-[#1f2937] focus-visible:ring-[#3370FF]/40"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>

    </div>
  )
}

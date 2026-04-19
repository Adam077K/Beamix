'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Building2,
  CreditCard,
  Sliders,
  Bell,
  Plug,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SettingsField } from './SettingsField'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PaywallModal } from '@/components/paywall/PaywallModal'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SettingsUser {
  email: string
  timezone: string
  language: 'en' | 'he'
  planTier: 'discover' | 'build' | 'scale' | null
  business: {
    name: string
    url: string
    industry: string
    location: string
    services: string[]
  }
  notifications: {
    inboxReady: boolean
    scanComplete: boolean
    budgetAlerts: boolean
    competitorMovement: boolean
    dailyDigestHour: number
  }
}

interface Props {
  user: SettingsUser
}

// ─── Tab definitions ─────────────────────────────────────────────────────────

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'automation', label: 'Automation Defaults', icon: Zap },
] as const

type TabId = (typeof TABS)[number]['id']

// ─── Plan display helpers ─────────────────────────────────────────────────────

const PLAN_LABELS: Record<NonNullable<SettingsUser['planTier']>, string> = {
  discover: 'Discover',
  build: 'Build',
  scale: 'Scale',
}

const PLAN_PRICES: Record<NonNullable<SettingsUser['planTier']>, string> = {
  discover: '$79/mo',
  build: '$189/mo',
  scale: '$499/mo',
}

// ─── Save button ──────────────────────────────────────────────────────────────

function SaveButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 px-4 rounded-lg bg-[#3370FF] text-white text-sm font-medium hover:bg-[#2860e8] active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
    >
      Save changes
    </button>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-gray-100">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
    </div>
  )
}

// ─── Profile tab ─────────────────────────────────────────────────────────────

function ProfileTab({ user }: { user: SettingsUser }) {
  const [timezone, setTimezone] = React.useState(user.timezone)
  const [language, setLanguage] = React.useState<'en' | 'he'>(user.language)

  return (
    <div>
      <SectionHeading title="Profile" description="Your account details and preferences." />
      <SettingsField label="Email address" help="Contact support to change your email.">
        <Input
          type="email"
          value={user.email}
          readOnly
          className="w-80 bg-gray-50 text-gray-500 cursor-default"
        />
      </SettingsField>
      <SettingsField label="Timezone">
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Asia/Jerusalem">Asia/Jerusalem (GMT+3)</SelectItem>
            <SelectItem value="Europe/London">Europe/London (GMT+1)</SelectItem>
            <SelectItem value="America/New_York">America/New_York (GMT-4)</SelectItem>
            <SelectItem value="America/Los_Angeles">America/Los_Angeles (GMT-7)</SelectItem>
            <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
          </SelectContent>
        </Select>
      </SettingsField>
      <SettingsField label="Language">
        <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'he')}>
          <SelectTrigger className="w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="he">Hebrew</SelectItem>
          </SelectContent>
        </Select>
      </SettingsField>
      <SaveButton onClick={() => console.log('[Profile] save', { timezone, language })} />
    </div>
  )
}

// ─── Business tab ─────────────────────────────────────────────────────────────

function BusinessTab({ user }: { user: SettingsUser }) {
  const [name, setName] = React.useState(user.business.name)
  const [url, setUrl] = React.useState(user.business.url)
  const [industry, setIndustry] = React.useState(user.business.industry)
  const [location, setLocation] = React.useState(user.business.location)
  const [services, setServices] = React.useState(user.business.services.join('\n'))

  return (
    <div>
      <SectionHeading title="Business profile" description="How Beamix identifies your business in AI search." />
      <SettingsField label="Business name">
        <Input value={name} onChange={(e) => setName(e.target.value)} className="w-80" />
      </SettingsField>
      <SettingsField label="Website URL">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} className="w-80" placeholder="https://" />
      </SettingsField>
      <SettingsField label="Industry">
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger className="w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SaaS / Software">SaaS / Software</SelectItem>
            <SelectItem value="E-commerce">E-commerce</SelectItem>
            <SelectItem value="Professional Services">Professional Services</SelectItem>
            <SelectItem value="Healthcare">Healthcare</SelectItem>
            <SelectItem value="Real Estate">Real Estate</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Education">Education</SelectItem>
            <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </SettingsField>
      <SettingsField label="Location">
        <Input value={location} onChange={(e) => setLocation(e.target.value)} className="w-80" />
      </SettingsField>
      <SettingsField label="Services" help="One service per line. Used to match your business in AI responses.">
        <textarea
          value={services}
          onChange={(e) => setServices(e.target.value)}
          rows={4}
          className="w-80 rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-all outline-none resize-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-1"
        />
      </SettingsField>
      <SaveButton
        onClick={() =>
          console.log('[Business] save', {
            name,
            url,
            industry,
            location,
            services: services.split('\n').filter(Boolean),
          })
        }
      />
    </div>
  )
}

// ─── Billing tab ──────────────────────────────────────────────────────────────

function BillingTab({ user }: { user: SettingsUser }) {
  const [paywallOpen, setPaywallOpen] = React.useState(false)
  const [redirecting, setRedirecting] = React.useState(false)

  function handleManageBilling() {
    console.log('[Billing] → POST /api/billing/portal')
    setRedirecting(true)
    setTimeout(() => setRedirecting(false), 1500)
  }

  const tier = user.planTier

  return (
    <div>
      <SectionHeading title="Billing" description="Manage your subscription and payment details." />

      {/* Current plan card */}
      <div className="rounded-xl border border-gray-200 p-5 mb-6 w-full max-w-md">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Current plan</p>
            <p className="text-2xl font-semibold text-gray-900">
              {tier ? PLAN_LABELS[tier] : 'Free'}
            </p>
          </div>
          {tier && (
            <span className="text-sm font-medium text-[#3370FF] bg-blue-50 px-2.5 py-1 rounded-md">
              {PLAN_PRICES[tier]}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleManageBilling}
            className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-2 transition-colors"
          >
            Manage billing
          </button>
          <span className="text-gray-300">·</span>
          <button
            type="button"
            onClick={() => setPaywallOpen(true)}
            className="text-sm text-[#3370FF] hover:text-[#2860e8] transition-colors font-medium"
          >
            Change plan
          </button>
        </div>
      </div>

      {/* Redirecting banner */}
      <AnimatePresence>
        {redirecting && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="mb-4 flex items-center gap-2 text-sm text-[#3370FF] bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 w-fit"
          >
            <svg className="animate-spin size-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Redirecting to billing portal...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice history */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Invoice history</h3>
        <div className="rounded-lg border border-dashed border-gray-200 px-5 py-8 text-center">
          <p className="text-sm text-gray-400">
            Your invoices will appear here after your first billing cycle.
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400">14-day money-back guarantee on all plans.</p>

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} triggerContext="settings-billing" />
    </div>
  )
}

// ─── Preferences tab ──────────────────────────────────────────────────────────

function PreferencesTab() {
  const [inboxShortcuts, setInboxShortcuts] = React.useState(true)

  return (
    <div>
      <SectionHeading title="Preferences" description="Interface and keyboard customization." />

      {/* Theme */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-900 mb-2">Theme</label>
        <div className="flex gap-2">
          {(['Light', 'Dark', 'System'] as const).map((theme) => (
            <button
              key={theme}
              type="button"
              disabled
              className={cn(
                'h-9 px-4 rounded-lg border text-sm font-medium cursor-not-allowed opacity-50 transition-colors',
                theme === 'System'
                  ? 'border-[#3370FF] bg-blue-50 text-[#3370FF]'
                  : 'border-gray-200 text-gray-600 bg-white'
              )}
            >
              {theme}
            </button>
          ))}
          <span className="inline-flex items-center text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full self-center">
            Coming soon
          </span>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-1.5">Keyboard shortcuts</label>
        <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 bg-gray-50 max-w-md">
          <div>
            <p className="text-sm text-gray-800">Enable j/k/a/r in Inbox</p>
            <p className="text-xs text-gray-500 mt-0.5">Navigate and act on items with keyboard</p>
          </div>
          <Switch
            checked={inboxShortcuts}
            onCheckedChange={setInboxShortcuts}
            aria-label="Enable keyboard shortcuts in Inbox"
          />
        </div>
      </div>

      <SaveButton onClick={() => console.log('[Preferences] save', { inboxShortcuts })} />
    </div>
  )
}

// ─── Notifications tab ────────────────────────────────────────────────────────

function NotificationsTab({ user }: { user: SettingsUser }) {
  const [inboxReady, setInboxReady] = React.useState(user.notifications.inboxReady)
  const [scanComplete, setScanComplete] = React.useState(user.notifications.scanComplete)
  const [budgetAlerts, setBudgetAlerts] = React.useState(user.notifications.budgetAlerts)
  const [competitorMovement, setCompetitorMovement] = React.useState(user.notifications.competitorMovement)
  const [digestHour, setDigestHour] = React.useState(String(user.notifications.dailyDigestHour))

  const switchRows: {
    label: string
    description: string
    checked: boolean
    onChange: (v: boolean) => void
  }[] = [
    { label: 'Inbox items ready', description: 'When agents finish preparing Inbox suggestions', checked: inboxReady, onChange: setInboxReady },
    { label: 'Scan complete', description: 'After each GEO visibility scan finishes', checked: scanComplete, onChange: setScanComplete },
    { label: 'Budget alerts', description: 'When credit usage crosses 80% of your monthly limit', checked: budgetAlerts, onChange: setBudgetAlerts },
    { label: 'Competitor movement', description: 'When tracked competitors gain or lose AI citations', checked: competitorMovement, onChange: setCompetitorMovement },
  ]

  return (
    <div>
      <SectionHeading title="Notifications" description="Control which emails Beamix sends to you." />
      <div className="mb-6 divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
        {switchRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-gray-900">{row.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{row.description}</p>
            </div>
            <Switch
              checked={row.checked}
              onCheckedChange={row.onChange}
              aria-label={row.label}
            />
          </div>
        ))}
      </div>

      <SettingsField label="Daily digest time" help={`Sent to ${user.email}`}>
        <Select value={digestHour} onValueChange={setDigestHour}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => (
              <SelectItem key={h} value={String(h)}>
                {String(h).padStart(2, '0')}:00
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsField>

      <SaveButton
        onClick={() =>
          console.log('[Notifications] save', {
            inboxReady,
            scanComplete,
            budgetAlerts,
            competitorMovement,
            dailyDigestHour: Number(digestHour),
          })
        }
      />
    </div>
  )
}

// ─── Integrations tab ─────────────────────────────────────────────────────────

function IntegrationsTab() {
  const integrations = [
    {
      id: 'ga4',
      name: 'Google Analytics 4',
      description: 'Pull session data to correlate GEO visibility with organic traffic.',
    },
    {
      id: 'gsc',
      name: 'Google Search Console',
      description: 'Monitor impression share alongside AI search mentions.',
    },
    {
      id: 'wp',
      name: 'WordPress',
      description: 'Publish agent-generated content directly to your site.',
    },
  ]

  return (
    <div>
      <SectionHeading title="Integrations" description="Connect third-party tools to Beamix." />
      <div className="grid gap-3">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-xl border border-gray-100 px-5 py-4"
          >
            {/* Logo placeholder */}
            <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <Plug className="size-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled
                className="h-8 px-3 rounded-lg border border-gray-200 text-sm text-gray-400 font-medium cursor-not-allowed"
              >
                Connect
              </button>
              <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                Coming soon
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Automation Defaults tab ──────────────────────────────────────────────────

function AutomationDefaultsTab() {
  const [cadence, setCadence] = React.useState<'weekly' | 'biweekly' | 'monthly'>('weekly')
  const [killSwitch, setKillSwitch] = React.useState<'auto-pause' | 'alert-only'>('auto-pause')

  return (
    <div>
      <SectionHeading title="Automation defaults" description="Default behaviour for all automated agent runs." />

      {/* Cadence */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">Default cadence</label>
        <div className="flex flex-col gap-2 max-w-sm">
          {([
            { value: 'weekly', label: 'Weekly', hint: 'Agents run every 7 days' },
            { value: 'biweekly', label: 'Biweekly', hint: 'Agents run every 14 days' },
            { value: 'monthly', label: 'Monthly', hint: 'Agents run once per month' },
          ] as const).map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex items-center gap-3 cursor-pointer rounded-lg border px-4 py-3 transition-colors',
                cadence === opt.value
                  ? 'border-[#3370FF] bg-blue-50/50'
                  : 'border-gray-100 hover:border-gray-200'
              )}
            >
              <input
                type="radio"
                name="cadence"
                value={opt.value}
                checked={cadence === opt.value}
                onChange={() => setCadence(opt.value)}
                className="accent-[#3370FF]"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                <span className="text-xs text-gray-500 ml-2">{opt.hint}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Kill switch */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">When credits hit 100%</label>
        <div className="flex flex-col gap-2 max-w-sm">
          {([
            { value: 'auto-pause', label: 'Auto-pause', hint: 'Stop all automated runs immediately' },
            { value: 'alert-only', label: 'Alert only', hint: 'Send notification but continue running' },
          ] as const).map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex items-center gap-3 cursor-pointer rounded-lg border px-4 py-3 transition-colors',
                killSwitch === opt.value
                  ? 'border-[#3370FF] bg-blue-50/50'
                  : 'border-gray-100 hover:border-gray-200'
              )}
            >
              <input
                type="radio"
                name="killSwitch"
                value={opt.value}
                checked={killSwitch === opt.value}
                onChange={() => setKillSwitch(opt.value)}
                className="accent-[#3370FF]"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                <span className="text-xs text-gray-500 ml-2">{opt.hint}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <SaveButton onClick={() => console.log('[Automation] save', { cadence, killSwitch })} />
    </div>
  )
}

// ─── Fade-in-up animation wrapper ────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
}

// ─── Main client component ────────────────────────────────────────────────────

export function SettingsClient({ user }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialTab = (searchParams.get('tab') as TabId | null) ?? 'profile'
  const validTab = TABS.some((t) => t.id === initialTab) ? initialTab : 'profile'
  const [activeTab, setActiveTab] = React.useState<TabId>(validTab)

  function handleTabChange(value: string) {
    const tab = value as TabId
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  function renderContent(tab: TabId) {
    switch (tab) {
      case 'profile':
        return <ProfileTab user={user} />
      case 'business':
        return <BusinessTab user={user} />
      case 'billing':
        return <BillingTab user={user} />
      case 'preferences':
        return <PreferencesTab />
      case 'notifications':
        return <NotificationsTab user={user} />
      case 'integrations':
        return <IntegrationsTab />
      case 'automation':
        return <AutomationDefaultsTab />
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Settings</h1>

      <TabsPrimitive.Root
        value={activeTab}
        onValueChange={handleTabChange}
        orientation="vertical"
        className="flex gap-0 items-start"
      >
        {/* Left sidebar nav */}
        <TabsPrimitive.List
          className="flex flex-col gap-0.5 w-[220px] shrink-0 sticky top-24 mr-8"
          aria-label="Settings navigation"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <TabsPrimitive.Trigger
              key={id}
              value={id}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left w-full transition-all duration-150 outline-none',
                'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
                'data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100',
                'focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1'
              )}
            >
              <Icon
                className={cn(
                  'size-4 shrink-0 transition-colors',
                  activeTab === id ? 'text-[#3370FF]' : 'text-gray-400'
                )}
              />
              {label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              {...fadeInUp}
              className="w-full"
            >
              {TABS.map(({ id }) => (
                <TabsPrimitive.Content key={id} value={id} forceMount className={activeTab === id ? 'block' : 'hidden'}>
                  {renderContent(id)}
                </TabsPrimitive.Content>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </TabsPrimitive.Root>
    </div>
  )
}

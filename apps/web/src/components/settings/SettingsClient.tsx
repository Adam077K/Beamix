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
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
  Gauge,
  FileText,
  Globe,
  Trash2,
  ExternalLink,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PaywallModal } from '@/components/paywall/PaywallModal'

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User       },
  { id: 'business',      label: 'Business',      icon: Building2  },
  { id: 'billing',       label: 'Billing',       icon: CreditCard },
  { id: 'preferences',   label: 'Preferences',   icon: Sliders    },
  { id: 'notifications', label: 'Notifications', icon: Bell       },
  { id: 'integrations',  label: 'Integrations',  icon: Plug       },
  { id: 'automation',    label: 'Automation',    icon: Zap        },
] as const

type TabId = (typeof TABS)[number]['id']

// ─── Plan helpers ─────────────────────────────────────────────────────────────

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

const PLAN_RUNS: Record<NonNullable<SettingsUser['planTier']>, number> = {
  discover: 50,
  build: 150,
  scale: 500,
}

// ─── Save button with 4 states ────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function SaveButton({
  state,
  onClick,
  disabled,
}: {
  state: SaveState
  onClick?: () => void
  disabled?: boolean
}) {
  const isDisabled = disabled || state === 'saving' || state === 'saved'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={
        state === 'saving' ? 'Saving changes…' :
        state === 'saved'  ? 'Changes saved'   :
        state === 'error'  ? 'Save failed — try again' :
        'Save changes'
      }
      className={cn(
        'inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2',
        'active:scale-[0.98]',
        state === 'idle'   && !disabled && 'bg-[#3370FF] text-white hover:bg-[#2860e8]',
        state === 'saving' && 'bg-[#3370FF]/80 text-white cursor-wait',
        state === 'saved'  && 'bg-[#10B981] text-white cursor-default',
        state === 'error'  && 'bg-[#EF4444] text-white hover:bg-[#dc2626]',
        (disabled && state === 'idle') && 'bg-[#3370FF] text-white opacity-50 cursor-not-allowed',
      )}
    >
      {state === 'saving' && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
      {state === 'saved'  && <Check className="size-3.5" aria-hidden />}
      {state === 'error'  && <AlertCircle className="size-3.5" aria-hidden />}
      {state === 'saving' ? 'Saving…'     :
       state === 'saved'  ? 'Saved'        :
       state === 'error'  ? 'Try again'   :
       'Save changes'}
    </button>
  )
}

/** Cycles: idle → saving (900ms) → saved (2s) → idle */
function useSaveState() {
  const [state, setState] = React.useState<SaveState>('idle')

  function triggerSave(onSave?: () => void) {
    setState('saving')
    setTimeout(() => {
      setState('saved')
      onSave?.()
      setTimeout(() => setState('idle'), 2000)
    }, 900)
  }

  return { state, triggerSave }
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-gray-100">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="mt-0.5 text-sm text-gray-500">{description}</p>
      )}
    </div>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  help,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  help?: string
  error?: string
  children: React.ReactNode
}) {
  const helpId  = React.useId()
  const errorId = React.useId()

  return (
    <div className="mb-5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-900 mb-1.5"
      >
        {label}
      </label>
      {children}
      {help && !error && (
        <p id={helpId} className="mt-1 text-xs text-gray-500">
          {help}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
          <AlertCircle className="size-3 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Delete account modal ─────────────────────────────────────────────────────

function DeleteAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [confirmText, setConfirmText] = React.useState('')
  const [deleting, setDeleting] = React.useState(false)
  const confirmed = confirmText.trim().toLowerCase() === 'delete'
  const confirmId = React.useId()

  function handleDelete() {
    if (!confirmed) return
    setDeleting(true)
    // Placeholder: real impl calls /api/account/delete
    setTimeout(() => {
      setDeleting(false)
      onClose()
    }, 1400)
  }

  // Reset on close
  React.useEffect(() => {
    if (!open) setConfirmText('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Delete your account</DialogTitle>
          <DialogDescription className="text-gray-500 leading-relaxed">
            This permanently removes your account, all business data, scan history, and agent outputs.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 leading-relaxed">
          All data will be deleted within 30 days. Cancel any active subscription via the billing portal first.
        </div>

        <div>
          <label htmlFor={confirmId} className="block text-sm font-medium text-gray-900 mb-1.5">
            Type <span className="font-mono bg-gray-100 px-1 rounded text-red-600 text-xs">delete</span> to confirm
          </label>
          <Input
            id={confirmId}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete"
            className={cn(
              confirmed
                ? 'border-red-300 focus-visible:ring-red-200'
                : 'focus-visible:ring-[#3370FF]/20'
            )}
          />
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!confirmed || deleting}
            className={cn(
              'inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2',
              confirmed && !deleting
                ? 'bg-[#EF4444] text-white hover:bg-[#dc2626] active:scale-[0.98]'
                : 'bg-red-100 text-red-300 cursor-not-allowed'
            )}
          >
            {deleting && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
            {deleting ? 'Deleting…' : 'Delete account'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Profile tab ──────────────────────────────────────────────────────────────

function ProfileTab({ user }: { user: SettingsUser }) {
  const [timezone, setTimezone] = React.useState(user.timezone)
  const [language, setLanguage] = React.useState<'en' | 'he'>(user.language)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const { state: saveState, triggerSave } = useSaveState()

  const emailId    = React.useId()
  const tzId       = React.useId()
  const langId     = React.useId()

  return (
    <div>
      <SectionHeading title="Profile" description="Your account details and preferences." />

      <Field label="Email address" htmlFor={emailId} help="Contact support to change your email address.">
        <Input
          id={emailId}
          type="email"
          value={user.email}
          readOnly
          className="w-full sm:w-80 bg-gray-50 text-gray-500 cursor-default"
        />
      </Field>

      <Field label="Timezone" htmlFor={tzId} help="Used for daily digest scheduling and report timestamps.">
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger id={tzId} className="w-full sm:w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Asia/Jerusalem">Asia/Jerusalem (GMT+3)</SelectItem>
            <SelectItem value="Europe/London">Europe/London (GMT+1)</SelectItem>
            <SelectItem value="America/New_York">America/New_York (GMT-4)</SelectItem>
            <SelectItem value="America/Los_Angeles">America/Los_Angeles (GMT-7)</SelectItem>
            <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
            <SelectItem value="Europe/Berlin">Europe/Berlin (GMT+2)</SelectItem>
            <SelectItem value="Australia/Sydney">Australia/Sydney (GMT+10)</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <div className="mb-6">
        <label htmlFor={langId} className="block text-sm font-medium text-gray-900 mb-1.5">
          Language
        </label>
        <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'he')}>
          <SelectTrigger id={langId} className="w-full sm:w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="he">עברית — Hebrew</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SaveButton
        state={saveState}
        onClick={() => triggerSave(() => console.log('[Profile] saved', { timezone, language }))}
      />

      {/* Danger zone */}
      <div className="mt-12 pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Danger zone</h3>
        <p className="text-sm text-gray-500 mb-4">
          Permanently delete your account and all associated data.
        </p>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
        >
          <Trash2 className="size-4" aria-hidden />
          Delete account
        </button>
      </div>

      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </div>
  )
}

// ─── Business tab ─────────────────────────────────────────────────────────────

function BusinessTab({ user }: { user: SettingsUser }) {
  const [name,     setName]     = React.useState(user.business.name)
  const [url,      setUrl]      = React.useState(user.business.url)
  const [industry, setIndustry] = React.useState(user.business.industry)
  const [location, setLocation] = React.useState(user.business.location)
  const [services, setServices] = React.useState(user.business.services.join('\n'))
  const { state: saveState, triggerSave } = useSaveState()

  const nameId     = React.useId()
  const urlId      = React.useId()
  const industryId = React.useId()
  const locationId = React.useId()
  const servicesId = React.useId()

  return (
    <div>
      <SectionHeading
        title="Business profile"
        description="How Beamix identifies your business in AI search engines."
      />

      <Field label="Business name" htmlFor={nameId}>
        <Input
          id={nameId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full sm:w-80"
          placeholder="Your business name"
        />
      </Field>

      <Field
        label="Website URL"
        htmlFor={urlId}
        help="The canonical URL Beamix monitors in AI responses."
      >
        <Input
          id={urlId}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full sm:w-80"
          placeholder="https://yourdomain.com"
        />
      </Field>

      <div className="mb-5">
        <label htmlFor={industryId} className="block text-sm font-medium text-gray-900 mb-1.5">
          Industry
        </label>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger id={industryId} className="w-full sm:w-80">
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
            <SelectItem value="Legal">Legal</SelectItem>
            <SelectItem value="Retail">Retail</SelectItem>
            <SelectItem value="Marketing & Advertising">Marketing & Advertising</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Field
        label="Location"
        htmlFor={locationId}
        help="Helps AI engines surface local and regional mentions."
      >
        <Input
          id={locationId}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full sm:w-80"
          placeholder="City, Country"
        />
      </Field>

      <div className="mb-6">
        <label htmlFor={servicesId} className="block text-sm font-medium text-gray-900 mb-1.5">
          Services
        </label>
        <textarea
          id={servicesId}
          value={services}
          onChange={(e) => setServices(e.target.value)}
          rows={4}
          aria-describedby={`${servicesId}-help`}
          className={cn(
            'w-full sm:w-80 rounded-lg border border-input bg-transparent px-3 py-2',
            'text-sm shadow-xs transition-all outline-none resize-none',
            'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-1'
          )}
          placeholder={'AI visibility\nGEO optimization\nContent generation'}
        />
        <p id={`${servicesId}-help`} className="mt-1 text-xs text-gray-500">
          One service per line. These are matched against AI response content.
        </p>
      </div>

      <SaveButton
        state={saveState}
        onClick={() =>
          triggerSave(() =>
            console.log('[Business] saved', {
              name, url, industry, location,
              services: services.split('\n').filter(Boolean),
            })
          )
        }
      />
    </div>
  )
}

// ─── Billing tab ──────────────────────────────────────────────────────────────

function BillingTab({ user }: { user: SettingsUser }) {
  const [paywallOpen, setPaywallOpen] = React.useState(false)
  const [redirecting, setRedirecting] = React.useState(false)

  const tier      = user.planTier
  const totalRuns = tier ? PLAN_RUNS[tier] : 50
  // Realistic mock: 63 of this plan's runs used
  const usedRuns      = 63
  const usagePercent  = Math.round((usedRuns / totalRuns) * 100)
  const isHighUsage   = usagePercent >= 80

  // Mock invoices (real impl would fetch from /api/billing/invoices)
  const invoices = [
    { id: 'INV-2026-04', date: 'Apr 1, 2026', amount: '$189.00', status: 'Paid' },
    { id: 'INV-2026-03', date: 'Mar 1, 2026', amount: '$189.00', status: 'Paid' },
    { id: 'INV-2026-02', date: 'Feb 1, 2026', amount: '$189.00', status: 'Paid' },
  ]

  function handleManageBilling() {
    setRedirecting(true)
    setTimeout(() => setRedirecting(false), 1800)
  }

  return (
    <div>
      <SectionHeading title="Billing" description="Manage your subscription and payment details." />

      {/* Current plan card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 mb-5 w-full max-w-md shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium mb-1">
              Current plan
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {tier ? PLAN_LABELS[tier] : 'Free'}
            </p>
          </div>
          {tier && (
            <span className="text-sm font-semibold text-[#3370FF] bg-blue-50 px-2.5 py-1 rounded-md tabular-nums">
              {PLAN_PRICES[tier]}
            </span>
          )}
        </div>

        {/* Usage bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
              <BarChart3 className="size-3 text-gray-400" aria-hidden />
              AI Runs this month
            </span>
            <span
              className={cn(
                'text-xs font-semibold tabular-nums',
                isHighUsage ? 'text-[#F59E0B]' : 'text-gray-900'
              )}
            >
              {usedRuns} / {totalRuns}
            </span>
          </div>
          <Progress
            value={usagePercent}
            className={cn(
              'h-1.5',
              isHighUsage
                ? '[&>[data-slot=progress-indicator]]:bg-[#F59E0B]'
                : '[&>[data-slot=progress-indicator]]:bg-[#3370FF]'
            )}
            aria-label={`${usedRuns} of ${totalRuns} AI Runs used this month`}
          />
          {isHighUsage && (
            <p className="mt-1.5 text-xs text-[#F59E0B] font-medium">
              {usagePercent}% used — consider upgrading to avoid interruptions.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleManageBilling}
            disabled={redirecting}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:underline disabled:cursor-wait"
          >
            {redirecting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Opening portal…
              </>
            ) : (
              <>
                <ExternalLink className="size-3.5" aria-hidden />
                Manage billing
              </>
            )}
          </button>
          <span className="text-gray-200 select-none" aria-hidden>|</span>
          <button
            type="button"
            onClick={() => setPaywallOpen(true)}
            className="text-sm text-[#3370FF] hover:text-[#2860e8] font-medium transition-colors focus-visible:outline-none focus-visible:underline"
          >
            Change plan
          </button>
        </div>
      </div>

      {/* Upgrade CTA — shown on non-Scale plans */}
      {tier !== 'scale' && (
        <div className="rounded-xl bg-gradient-to-br from-[#EFF4FF] to-[#DBEAFE] border border-[#BFDBFE] px-5 py-4 mb-6 max-w-md">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-[#3370FF] flex items-center justify-center shrink-0 mt-0.5">
              <Gauge className="size-4 text-white" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 mb-0.5">
                {tier === 'discover' ? 'Upgrade to Build' : 'Upgrade to Scale'}
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {tier === 'discover'
                  ? 'Get 3× more AI Runs, competitor monitoring, and automated weekly fixes.'
                  : 'Unlock unlimited scans, priority agent queue, and a dedicated success manager.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPaywallOpen(true)}
              className="shrink-0 inline-flex items-center gap-0.5 text-sm font-medium text-[#3370FF] hover:text-[#2860e8] transition-colors focus-visible:outline-none focus-visible:underline"
              aria-label={`Upgrade to ${tier === 'discover' ? 'Build' : 'Scale'} plan`}
            >
              Upgrade
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {/* Invoice history */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Invoice history</h3>
        {invoices.length > 0 ? (
          <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-gray-400 shrink-0" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{inv.date}</p>
                    <p className="text-xs text-gray-400 font-mono">{inv.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    {inv.amount}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#10B981] bg-green-50 px-2 py-0.5 rounded-full">
                    <Check className="size-3" aria-hidden />
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 px-5 py-8 text-center">
            <p className="text-sm text-gray-400">
              Your invoices will appear here after your first billing cycle.
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        14-day money-back guarantee on all plans. No questions asked.
      </p>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        triggerContext="settings-billing"
      />
    </div>
  )
}

// ─── Preferences tab ──────────────────────────────────────────────────────────

function PreferencesTab() {
  const [inboxShortcuts, setInboxShortcuts] = React.useState(true)
  const [compactMode,    setCompactMode]    = React.useState(false)
  const { state: saveState, triggerSave }   = useSaveState()

  return (
    <div>
      <SectionHeading title="Preferences" description="Interface and keyboard customization." />

      {/* Theme */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-900 mb-2">Theme</p>
        <div className="flex flex-wrap gap-2">
          {(['Light', 'Dark', 'System'] as const).map((theme) => (
            <button
              key={theme}
              type="button"
              disabled
              aria-disabled="true"
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
        </div>
        <p className="mt-2 text-xs text-gray-400">Dark mode is in progress.</p>
      </div>

      {/* Interface toggles */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-900 mb-2">Interface</p>
        <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50 max-w-md">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-900">Keyboard shortcuts in Inbox</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Use{' '}
                <kbd className="font-mono text-[10px] bg-gray-100 border border-gray-200 rounded px-1 py-0.5">j</kbd>{' '}
                <kbd className="font-mono text-[10px] bg-gray-100 border border-gray-200 rounded px-1 py-0.5">k</kbd>{' '}
                <kbd className="font-mono text-[10px] bg-gray-100 border border-gray-200 rounded px-1 py-0.5">a</kbd>{' '}
                <kbd className="font-mono text-[10px] bg-gray-100 border border-gray-200 rounded px-1 py-0.5">r</kbd>{' '}
                to navigate and act
              </p>
            </div>
            <Switch
              checked={inboxShortcuts}
              onCheckedChange={setInboxShortcuts}
              aria-label="Enable keyboard shortcuts in Inbox"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-900">Compact view</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Reduce vertical spacing in lists and tables
              </p>
            </div>
            <Switch
              checked={compactMode}
              onCheckedChange={setCompactMode}
              aria-label="Enable compact view"
            />
          </div>
        </div>
      </div>

      <SaveButton
        state={saveState}
        onClick={() =>
          triggerSave(() =>
            console.log('[Preferences] saved', { inboxShortcuts, compactMode })
          )
        }
      />
    </div>
  )
}

// ─── Notifications tab ────────────────────────────────────────────────────────

function NotificationsTab({ user }: { user: SettingsUser }) {
  const [inboxReady,         setInboxReady]         = React.useState(user.notifications.inboxReady)
  const [scanComplete,       setScanComplete]       = React.useState(user.notifications.scanComplete)
  const [budgetAlerts,       setBudgetAlerts]       = React.useState(user.notifications.budgetAlerts)
  const [competitorMovement, setCompetitorMovement] = React.useState(user.notifications.competitorMovement)
  const [digestHour,         setDigestHour]         = React.useState(String(user.notifications.dailyDigestHour))
  const { state: saveState, triggerSave } = useSaveState()
  const digestId = React.useId()

  const groups = [
    {
      heading: 'Agent activity',
      rows: [
        {
          label: 'Inbox items ready',
          description: 'When agents finish preparing your Inbox suggestions',
          checked: inboxReady,
          onChange: setInboxReady,
        },
        {
          label: 'Scan complete',
          description: 'After each GEO visibility scan finishes',
          checked: scanComplete,
          onChange: setScanComplete,
        },
      ],
    },
    {
      heading: 'Alerts',
      rows: [
        {
          label: 'Budget alerts',
          description: 'When credit usage crosses 80% of your monthly allowance',
          checked: budgetAlerts,
          onChange: setBudgetAlerts,
        },
        {
          label: 'Competitor movement',
          description: 'When tracked competitors gain or lose AI citations',
          checked: competitorMovement,
          onChange: setCompetitorMovement,
        },
      ],
    },
  ] as const

  return (
    <div>
      <SectionHeading title="Notifications" description="Control which emails Beamix sends to you." />

      {groups.map((group) => (
        <div key={group.heading} className="mb-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
            {group.heading}
          </p>
          <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {group.rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3.5">
                <div className="pr-4">
                  <p className="text-sm font-medium text-gray-900">{row.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {row.description}
                  </p>
                </div>
                <Switch
                  checked={row.checked}
                  onCheckedChange={row.onChange}
                  aria-label={row.label}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mb-6">
        <label htmlFor={digestId} className="block text-sm font-medium text-gray-900 mb-1.5">
          Daily digest time
        </label>
        <Select value={digestHour} onValueChange={setDigestHour}>
          <SelectTrigger id={digestId} className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 24 }, (_, i) => i).map((h) => (
              <SelectItem key={h} value={String(h)}>
                {String(h).padStart(2, '0')}:00
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1 text-xs text-gray-500">Sent to {user.email}</p>
      </div>

      <SaveButton
        state={saveState}
        onClick={() =>
          triggerSave(() =>
            console.log('[Notifications] saved', {
              inboxReady, scanComplete, budgetAlerts, competitorMovement,
              dailyDigestHour: Number(digestHour),
            })
          )
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
      category: 'Analytics',
      description: 'Pull session data to correlate AI search visibility with organic traffic trends.',
      accentColor: '#E37400',
      icon: BarChart3,
    },
    {
      id: 'gsc',
      name: 'Google Search Console',
      category: 'Search',
      description: 'Monitor impression share alongside AI mention counts in the same dashboard.',
      accentColor: '#4285F4',
      icon: Globe,
    },
    {
      id: 'wp',
      name: 'WordPress',
      category: 'Publishing',
      description: 'Publish agent-generated content directly to your site — no copy-pasting.',
      accentColor: '#21759B',
      icon: FileText,
    },
    {
      id: 'shopify',
      name: 'Shopify',
      category: 'E-commerce',
      description: 'Surface product pages in AI shopping responses and category discovery queries.',
      accentColor: '#96BF48',
      icon: Globe,
    },
  ]

  return (
    <div>
      <SectionHeading title="Integrations" description="Connect third-party tools to Beamix." />

      <div className="grid gap-3">
        {integrations.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 transition-colors hover:border-gray-200"
            >
              {/* Branded icon tile */}
              <div
                className="size-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${item.accentColor}18` }}
              >
                <Icon
                  className="size-5"
                  style={{ color: item.accentColor }}
                  aria-hidden
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-label={`Connect ${item.name} — coming soon`}
                  className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-400 cursor-not-allowed"
                >
                  Connect
                </button>
                <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                  Soon
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-5 text-xs text-gray-400">
        More integrations ship throughout 2026.{' '}
        <a
          href="#"
          className="text-[#3370FF] hover:underline focus-visible:underline focus-visible:outline-none"
        >
          Vote for your priority
        </a>
        .
      </p>
    </div>
  )
}

// ─── Automation tab ───────────────────────────────────────────────────────────

function AutomationTab() {
  const [cadence,     setCadence]     = React.useState<'weekly' | 'biweekly' | 'monthly'>('weekly')
  const [killSwitch,  setKillSwitch]  = React.useState<'auto-pause' | 'alert-only'>('auto-pause')
  const { state: saveState, triggerSave } = useSaveState()

  const cadenceOpts = [
    { value: 'weekly',   label: 'Weekly',   hint: 'Agents run every 7 days'   },
    { value: 'biweekly', label: 'Biweekly', hint: 'Agents run every 14 days'  },
    { value: 'monthly',  label: 'Monthly',  hint: 'Agents run once per month' },
  ] as const

  const killOpts = [
    { value: 'auto-pause', label: 'Auto-pause',  hint: 'Stop all runs immediately'      },
    { value: 'alert-only', label: 'Alert only',  hint: 'Notify you, but keep running'   },
  ] as const

  function OptionList<T extends string>({
    name,
    value,
    options,
    onChange,
  }: {
    name: string
    value: T
    options: readonly { value: T; label: string; hint: string }[]
    onChange: (v: T) => void
  }) {
    return (
      <div className="flex flex-col gap-2 max-w-sm" role="radiogroup" aria-label={name}>
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              'flex items-center gap-3 cursor-pointer rounded-lg border px-4 py-3 transition-colors',
              value === opt.value
                ? 'border-[#3370FF] bg-blue-50/50'
                : 'border-gray-100 hover:border-gray-200 bg-white'
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-[#3370FF] shrink-0"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">{opt.label}</span>
              <span className="text-xs text-gray-500 ms-2">{opt.hint}</span>
            </div>
          </label>
        ))}
      </div>
    )
  }

  return (
    <div>
      <SectionHeading
        title="Automation defaults"
        description="Default behaviour for all scheduled agent runs."
      />

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-900 mb-2">Default cadence</p>
        <OptionList
          name="cadence"
          value={cadence}
          options={cadenceOpts}
          onChange={setCadence}
        />
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-900 mb-2">When credits hit 100%</p>
        <OptionList
          name="killSwitch"
          value={killSwitch}
          options={killOpts}
          onChange={setKillSwitch}
        />
      </div>

      <SaveButton
        state={saveState}
        onClick={() =>
          triggerSave(() => console.log('[Automation] saved', { cadence, killSwitch }))
        }
      />
    </div>
  )
}

// ─── Fade animation ───────────────────────────────────────────────────────────

const fadeInUp = {
  initial:    { opacity: 0, y: 8  },
  animate:    { opacity: 1, y: 0  },
  exit:       { opacity: 0, y: -4 },
  transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SettingsClient({ user }: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const initialTab = (searchParams.get('tab') as TabId | null) ?? 'profile'
  const validTab   = TABS.some((t) => t.id === initialTab) ? initialTab : 'profile'
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
      case 'profile':       return <ProfileTab user={user} />
      case 'business':      return <BusinessTab user={user} />
      case 'billing':       return <BillingTab user={user} />
      case 'preferences':   return <PreferencesTab />
      case 'notifications': return <NotificationsTab user={user} />
      case 'integrations':  return <IntegrationsTab />
      case 'automation':    return <AutomationTab />
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-8 sm:py-10">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Settings</h1>

      <TabsPrimitive.Root
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col lg:flex-row gap-0 items-start"
      >
        {/*
         * Tab navigation
         * < lg : horizontal scrolling strip (no scrollbar visible)
         * ≥ lg : sticky vertical sidebar
         */}
        <TabsPrimitive.List
          aria-label="Settings navigation"
          className={cn(
            // Mobile / tablet: horizontal strip
            'flex flex-row gap-1 w-full overflow-x-auto pb-2 mb-6',
            // Hide scrollbar cross-browser
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            // Desktop: vertical column
            'lg:flex-col lg:overflow-x-visible lg:w-[196px] lg:shrink-0 lg:sticky lg:top-24',
            'lg:me-8 lg:pb-0 lg:mb-0 lg:gap-0.5',
          )}
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <TabsPrimitive.Trigger
              key={id}
              value={id}
              className={cn(
                // Base
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 outline-none whitespace-nowrap shrink-0',
                // Inactive
                'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
                // Active
                'data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100',
                // Desktop active: left-border accent
                'lg:data-[state=active]:border-s-2 lg:data-[state=active]:border-[#3370FF]',
                'lg:data-[state=active]:rounded-s-none lg:data-[state=active]:ps-[10px]',
                // Focus
                'focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                // Desktop: full width, left-aligned
                'lg:w-full lg:justify-start',
              )}
            >
              <Icon
                className={cn(
                  'size-4 shrink-0 transition-colors',
                  activeTab === id ? 'text-[#3370FF]' : 'text-gray-400'
                )}
                aria-hidden
              />
              {label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>

        {/* Content area */}
        <div className="flex-1 min-w-0 w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={activeTab} {...fadeInUp} className="w-full">
              {TABS.map(({ id }) => (
                <TabsPrimitive.Content
                  key={id}
                  value={id}
                  forceMount
                  className={activeTab === id ? 'block' : 'hidden'}
                >
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

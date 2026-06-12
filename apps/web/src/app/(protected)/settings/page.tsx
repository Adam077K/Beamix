'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { PageHeader } from '@/components/page-header'
import {
  User,
  Fingerprint,
  CreditCard,
  ShieldCheck,
  Plug,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

import { ProfileTab } from './_components/ProfileTab'
import { BrandFingerprintTab } from './_components/BrandFingerprintTab'
import { BillingTab } from './_components/BillingTab'
import { ApprovalPreferencesTab } from './_components/ApprovalPreferencesTab'
import { PublishingIntegrationsTab } from './_components/PublishingIntegrationsTab'
import { CancelTab } from './_components/CancelTab'

/**
 * Settings — two-column console.
 *
 * Shell: 200px fixed left tab-rail (border-right) + scrolling content column
 * (max-w-[760px], left-aligned under rail). <768px: rail collapses to a
 * horizontal scrollable tab strip pinned under PageHeader.
 *
 * Color law: blue (#3370FF) = you — CTAs, active tab, save controls.
 *            violet (#6E56F0) = agents — Tab 4 identity + Tab 2 glyph ONLY.
 *            Violet NEVER on a button.
 *
 * Tabs are URL-addressable via ?tab=<value>.
 */

type TabId = 'profile' | 'brand' | 'billing' | 'approvals' | 'integrations' | 'cancel'

interface Tab {
  id: TabId
  label: string
  Icon: React.ComponentType<{ className?: string }>
  isDestructive?: boolean
  /**
   * Agent-domain tab (M6 — blue=you / violet=agents). Brand fingerprint,
   * Approval preferences, and Publishing integrations all govern what the crew
   * does on your behalf — the rail signals that with a glanceable violet cue so
   * the you-vs-agents law reads here too. Violet stays off every button.
   */
  isAgent?: boolean
}

const TABS: Tab[] = [
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'brand', label: 'Brand fingerprint', Icon: Fingerprint, isAgent: true },
  { id: 'billing', label: 'Billing', Icon: CreditCard },
  { id: 'approvals', label: 'Approval preferences', Icon: ShieldCheck, isAgent: true },
  { id: 'integrations', label: 'Publishing integrations', Icon: Plug, isAgent: true },
  { id: 'cancel', label: 'Cancel', Icon: LogOut, isDestructive: true },
]

function SettingsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = (searchParams.get('tab') as TabId) ?? 'profile'

  function navigate(tab: TabId) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Tab content map
  const content: Record<TabId, React.ReactNode> = {
    profile: <ProfileTab />,
    brand: <BrandFingerprintTab />,
    billing: <BillingTab />,
    approvals: <ApprovalPreferencesTab />,
    integrations: <PublishingIntegrationsTab />,
    cancel: <CancelTab />,
  }

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Settings"
        subtitle="Your profile, your brand voice, billing, and how much the crew does on its own."
      />

      {/* Two-column console layout */}
      <div className="flex flex-col gap-0 md:flex-row md:gap-0">

        {/*
          item #8: tab ARIA fix.
          These tabs are URL-addressable navigation — simplest correct approach
          is plain nav links/buttons (no role="tab") rather than a broken ARIA
          tablist widget that lacks aria-controls/aria-selected wiring.
          Role and aria-selected are dropped; nav landmark + aria-current="page"
          is the correct ARIA pattern for URL-driven navigation tabs.
        */}
        <nav
          aria-label="Settings sections"
          className={cn(
            // Mobile: horizontal scrollable strip
            'flex flex-row overflow-x-auto gap-0.5 pb-2 mb-4 border-b border-[var(--color-border)] scrollbar-hide',
            // Desktop: vertical 200px rail with right border
            'md:flex-col md:overflow-x-visible md:pb-0 md:mb-0 md:border-b-0 md:border-r md:border-[var(--color-border)]',
            'md:w-[200px] md:shrink-0 md:pr-0 md:mr-8',
          )}
        >
          {/* You — personal / account tabs */}
          <div className="flex flex-row gap-0.5 md:flex-col md:gap-0">
            {TABS.filter((t) => !t.isDestructive && !t.isAgent).map((tab) => (
              <RailTab
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                onClick={() => navigate(tab.id)}
              />
            ))}
          </div>

          {/*
            Crew — agent-domain tabs (M6). A violet eyebrow + a violet hairline
            group these visually so the rail itself states the you-vs-agents
            promise. The eyebrow is hidden on the mobile horizontal strip.
          */}
          <div className="hidden md:flex md:items-center md:gap-2 md:px-3 md:pb-1 md:pt-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-agent)]">
              The crew
            </span>
            <span className="h-px flex-1 bg-[var(--color-agent-hairline)]/40" aria-hidden="true" />
          </div>
          <div className="flex flex-row gap-0.5 md:flex-col md:gap-0 md:flex-1">
            {TABS.filter((t) => !t.isDestructive && t.isAgent).map((tab) => (
              <RailTab
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                onClick={() => navigate(tab.id)}
              />
            ))}
          </div>

          {/* Cancel row — separated by a hairline divider on desktop */}
          <div className="flex items-center md:flex-col md:mt-auto">
            <div className="hidden md:block w-full border-t border-[var(--color-border)] my-2" />
            {TABS.filter((t) => t.isDestructive).map((tab) => (
              <RailTab
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                onClick={() => navigate(tab.id)}
                destructive
              />
            ))}
          </div>
        </nav>

        {/* ── Content column ── */}
        <div
          className="min-w-0 flex-1"
          // Tab content transitions: opacity + slight translate
        >
          <div
            key={activeTab}
            className="transition-smooth max-w-[760px]"
            style={{ animationFillMode: 'both' }}
          >
            {content[activeTab] ?? content.profile}
          </div>
        </div>
      </div>
    </div>
  )
}

interface RailTabProps {
  tab: Tab
  active: boolean
  onClick: () => void
  destructive?: boolean
}

function RailTab({ tab, active, onClick, destructive }: RailTabProps) {
  const { Icon, label, isAgent } = tab
  return (
    /*
      item #8: plain button with aria-current="page" (URL-addressable nav pattern).
      No role="tab" — avoids broken tablist widget (no tablist parent, no
      aria-controls, no aria-selected wiring). aria-current is the correct
      ARIA attribute for the active item in a navigation list.

      item #15: destructive inactive previously had the same classes as default inactive
      (dead branch). Cancel tab now gets opacity-75 + critical-tinted hover to signal
      danger zone. Active destructive still gets accent-tint — the divider above provides
      visual separation; the critical hover is the danger signal.
    */
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      aria-label={label}
      onClick={onClick}
      className={cn(
        // Base
        'relative flex items-center gap-2 h-9 px-3 rounded-md text-[13px] font-medium transition-colors text-left',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1',
        // Desktop: stretch full width, add left-border active indicator
        'md:w-full md:rounded-l-md md:rounded-r-none',
        // Inactive — you/account tabs: neutral, blue-grey hover
        !active && !destructive && !isAgent && 'text-[var(--color-text-muted)] hover:bg-[#F4F6FA] hover:text-[var(--color-text-secondary)]',
        // Inactive — agent tabs (M6): violet-tinted hover ground signals "the crew"
        !active && !destructive && isAgent && 'text-[var(--color-text-muted)] hover:bg-[var(--color-agent-zone)] hover:text-[var(--color-agent)]',
        // Destructive (Cancel) inactive: more muted + critical-tinted hover to signal danger
        !active && destructive && 'text-[var(--color-text-muted)] opacity-75 hover:bg-[var(--color-status-critical-bg,#FDECEC)] hover:text-[var(--color-status-critical)] hover:opacity-100',
        // Active — you tabs: blue accent-tint (you are navigating)
        active && !isAgent && 'bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)]',
        // Active — agent tabs: violet zone tint + violet text (the crew's domain)
        active && isAgent && 'bg-[var(--color-agent-zone)] text-[var(--color-agent)]',
        // Mobile: shrink wrap with padding
        'whitespace-nowrap md:whitespace-normal',
      )}
    >
      {/* Active left border — desktop only; violet for agent tabs (M6) */}
      {active && (
        <span
          className={cn(
            'absolute left-0 top-0 hidden h-full w-0.5 rounded-r-sm md:block',
            isAgent ? 'bg-[var(--color-agent)]' : 'bg-[var(--color-accent)]',
          )}
          aria-hidden="true"
        />
      )}
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0 transition-colors',
          // Agent-domain icons carry a resting violet tint so the crew group is
          // glanceable even when inactive (M6). You-tabs stay neutral until active.
          active
            ? isAgent
              ? 'text-[var(--color-agent)]'
              : 'text-[var(--color-accent)]'
            : isAgent
              ? 'text-[var(--color-agent)] opacity-60'
              : 'text-current opacity-70',
        )}
      />
      {/* On mobile, only show icon for compact tabs except first 3 */}
      <span className="hidden sm:inline md:inline">{label}</span>
    </button>
  )
}

export default function SettingsPage() {
  return (
    // Suspense boundary for useSearchParams (Next.js 15 requirement)
    <Suspense fallback={<SettingsShellSkeleton />}>
      <SettingsContent />
    </Suspense>
  )
}

function SettingsShellSkeleton() {
  return (
    <div className="min-h-screen pb-16">
      <div className="mb-8">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-[#F3F4F6]" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="flex gap-8">
        <div className="w-[200px] shrink-0 space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 animate-pulse rounded-md bg-[#F3F4F6]" />
          ))}
        </div>
        <div className="flex-1 max-w-[760px] space-y-4">
          <div className="h-48 animate-pulse rounded-2xl bg-[#F3F4F6]" />
          <div className="h-32 animate-pulse rounded-2xl bg-[#F3F4F6]" />
        </div>
      </div>
    </div>
  )
}

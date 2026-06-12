'use client'

import { useState, useCallback, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ExternalLink, Plus, Check, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { RunControl } from '@/components/console/RunControl'
import { PipelineLedger } from '@/components/console/PipelineLedger'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import { InputSummaryBar } from '@/components/console/InputSummaryBar'
import type { RunMode } from '@/components/console/ModeToggle'
import type { StageState } from '@/components/console/pipeline-contract'
import type { OffsiteRow } from '@/lib/demo/surfaces/types'
import { DEMO_OFFSITE } from '@/lib/demo/surfaces/offsite'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabKey = 'citation' | 'directory' | 'entity' | 'reputation' | 'community'
type TabSurfaceState = 'idle' | 'running' | 'success' | 'empty' | 'error' | 'loading'

/** Public alias so the page can type the `?state=` param it forwards. */
export type OffsiteSurfaceState = TabSurfaceState

interface TabConfig {
  id: TabKey
  label: string
  agentKey: 'offsite_presence_builder' | 'entity_builder' | 'review_presence_planner' | 'reddit_presence_planner' | null
  agentLabel: string | null
  /** 'auto-publish' | 'internal-report' | null (read-only) */
  outputKind: 'auto-publish' | 'internal-report' | null
  /** capped 3/5/10 per tier — only for offsite */
  capped: boolean
}

const TABS: TabConfig[] = [
  {
    id: 'citation',
    label: 'Citations',
    agentKey: null,
    agentLabel: null,
    outputKind: null,
    capped: false,
  },
  {
    id: 'directory',
    label: 'Directories',
    agentKey: 'offsite_presence_builder',
    agentLabel: 'Off-Site Presence Builder',
    outputKind: 'auto-publish',
    capped: true,
  },
  {
    id: 'entity',
    label: 'Entities',
    agentKey: 'entity_builder',
    agentLabel: 'Entity Builder',
    outputKind: 'auto-publish',
    capped: false,
  },
  {
    id: 'reputation',
    label: 'Reputation',
    agentKey: 'review_presence_planner',
    agentLabel: 'Review Presence Planner',
    outputKind: 'internal-report',
    capped: false,
  },
  {
    id: 'community',
    label: 'Community',
    agentKey: 'reddit_presence_planner',
    agentLabel: 'Reddit / Community Planner',
    outputKind: 'internal-report',
    capped: false,
  },
]

// ---------------------------------------------------------------------------
// Status badge helpers
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: OffsiteRow['status'] }) {
  if (status === 'tracked') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F5EE] px-2 py-0.5 text-[11px] font-medium text-[#0E9E6E]">
        <Check className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden="true" />
        Tracked
      </span>
    )
  }
  if (status === 'submitted') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF3E0] px-2 py-0.5 text-[11px] font-medium text-[#B8770B]">
        <Clock className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden="true" />
        Submitted
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#6B7280]">
      Untracked
    </span>
  )
}

// ---------------------------------------------------------------------------
// ImportanceBar — M7 in-cell data shading
// ---------------------------------------------------------------------------

/**
 * Score-band color — DATA-VIZ ONLY. The action accent #3370FF is reserved for
 * the Track action + active nav (brand law / CRAFT tell #8). Importance is data,
 * not an action, so it reads in the score-band ramp.
 */
function importanceColor(value: number): string {
  if (value >= 75) return 'var(--color-data-3)' // cyan — excellent
  if (value >= 50) return 'var(--color-data-4)' // green — good
  if (value >= 25) return 'var(--color-data-5)' // amber — fair
  return 'var(--color-data-6)' //                 red — critical
}

function ImportanceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      {/* M11: mono figure dominates, label/bar recede (number-over-label) */}
      <span
        className="font-[var(--font-mono)] text-[13px] tabular-nums text-[#0A0A0A]"
        aria-label={`Importance ${value} out of 100`}
      >
        {value}
      </span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#F3F4F6]" aria-hidden="true">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${value}%`, backgroundColor: importanceColor(value) }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CitationTable — the shared sortable row table
// ---------------------------------------------------------------------------

interface CitationTableProps {
  rows: OffsiteRow[]
  trackedIds: Set<string>
  onTrack: (id: string) => void
  isLoading?: boolean
  isEmpty?: boolean
  isError?: boolean
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
}

function CitationTable({
  rows,
  trackedIds,
  onTrack,
  isLoading,
  isEmpty,
  isError,
  onRetry,
  emptyTitle = 'No entries found',
  emptyDescription = 'Run a scan to discover citation opportunities.',
}: CitationTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Loading entries">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 flex-1 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load entries"
        description="We hit a snag fetching this data. Try again — it usually clears right up."
        onRetry={onRetry}
        className="py-12"
      />
    )
  }

  if (isEmpty || rows.length === 0) {
    return (
      <EmptyState
        illustration="workspace"
        title={emptyTitle}
        description={emptyDescription}
        align="top"
        className="py-12"
        action={
          <Button variant="default" size="sm" onClick={onRetry} aria-label="Run a scan to discover citations">
            Run first scan
          </Button>
        }
      />
    )
  }

  const trackedCount = rows.filter(
    (r) => trackedIds.has(r.id) || r.status === 'tracked' || r.status === 'submitted',
  ).length

  return (
    <div role="table" aria-label="Citation entries">
      {/* Header — hidden on mobile where rows stack into cards (P1.5) */}
      <div
        role="row"
        className="hidden grid-cols-[1fr_140px_120px_132px] gap-4 border-b border-[#E5E7EB] px-4 pb-2 sm:grid"
      >
        <span role="columnheader" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Source
        </span>
        <span role="columnheader" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Domain
        </span>
        <span role="columnheader" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Importance
        </span>
        <span role="columnheader" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Status
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#F3F4F6]">
        {rows.map((row, i) => {
          const isTracked = trackedIds.has(row.id) || row.status === 'tracked' || row.status === 'submitted'
          const effectiveStatus: OffsiteRow['status'] = trackedIds.has(row.id) ? 'tracked' : row.status
          // M7 hover hairline color follows the row's status band
          const hairline =
            effectiveStatus === 'tracked' ? 'var(--color-status-positive)'
            : effectiveStatus === 'submitted' ? 'var(--color-status-warning)'
            : 'var(--color-status-neutral)'
          return (
            <div
              key={row.id}
              role="row"
              className={cn(
                // mobile: 2-row stacked card; sm+: aligned 4-column grid (P1.5)
                'group relative flex flex-col gap-2 px-4 py-3 transition-colors',
                'sm:grid sm:grid-cols-[1fr_140px_120px_132px] sm:items-center sm:gap-4',
                'craft-enter',
                `craft-enter-${Math.min(i + 1, 8) as 1|2|3|4|5|6|7|8}`,
                'hover:bg-[#F4F6FA]',
                !isTracked && 'cursor-pointer',
              )}
              tabIndex={0}
              aria-label={`${row.title}, importance ${row.importance} of 100, ${effectiveStatus}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (!isTracked) onTrack(row.id)
                }
              }}
            >
              {/* M7 left status-color hairline — felt only on hover/focus */}
              <span
                className="pointer-events-none absolute inset-y-0 left-0 w-0.5 rounded-r opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{ backgroundColor: hairline }}
                aria-hidden="true"
              />

              {/* Source title */}
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-[#0A0A0A]">
                  {row.title}
                </p>
              </div>

              {/* Domain */}
              <div className="flex min-w-0 items-center gap-1">
                <span className="truncate font-[var(--font-mono)] text-[12px] text-[#6B7280]">
                  {row.domain}
                </span>
                <ExternalLink
                  className="h-3 w-3 shrink-0 text-[#9CA3AF] opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </div>

              {/* Importance score */}
              <div>
                <ImportanceBar value={row.importance} />
              </div>

              {/* Status — ONE language: every row carries a status pill (P1.6).
                  Untracked rows reveal a quiet "Track" affordance on hover/focus
                  in a fixed slot, so the column never mixes chip + hollow button. */}
              <div className="flex items-center gap-2 sm:justify-start">
                <StatusBadge status={effectiveStatus} />
                {!isTracked && (
                  <button
                    type="button"
                    onClick={() => onTrack(row.id)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium text-[#3370FF] opacity-100 transition-opacity hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                    aria-label={`Track ${row.title}`}
                  >
                    <Plus className="h-2.5 w-2.5" aria-hidden="true" />
                    Track
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Intentional table rest (P1.3 / P1.6) — the count footer replaces the
          dead-canvas / debug-strip terminus the audit flagged. */}
      <div className="mt-1 flex items-center justify-between border-t border-[#F3F4F6] px-4 pt-3">
        <span className="font-mono text-[12px] tabular-nums text-[#9CA3AF]">
          {rows.length} {rows.length === 1 ? 'source' : 'sources'}
        </span>
        <span className="font-mono text-[12px] tabular-nums text-[#9CA3AF]">
          {trackedCount} tracked
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// OutputSummaryPanel — rendered in Zone 5 after a successful run
// ---------------------------------------------------------------------------

interface OutputSummaryPanelProps {
  summary: string
  completedAt: string
  outputKind: 'auto-publish' | 'internal-report'
  agentLabel: string
  rows: OffsiteRow[]
  trackedIds: Set<string>
  onTrack: (id: string) => void
}

function OutputSummaryPanel({
  summary,
  completedAt,
  outputKind,
  agentLabel,
  rows,
  trackedIds,
  onTrack,
}: OutputSummaryPanelProps) {
  const relativeTime = (() => {
    try {
      const d = new Date(completedAt)
      const diffMs = Date.now() - d.getTime()
      const diffH = Math.floor(diffMs / 3_600_000)
      if (diffH < 1) return 'just now'
      if (diffH < 24) return `${diffH}h ago`
      const diffD = Math.floor(diffH / 24)
      return `${diffD}d ago`
    } catch {
      return ''
    }
  })()

  return (
    <div className="px-6 py-5">
      {/* Run metadata row */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            {agentLabel}
          </p>
          <p className="mt-1 text-[15px] leading-snug text-[#0A0A0A]">
            {summary}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {outputKind === 'auto-publish' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F5EE] px-2.5 py-1 text-[11px] font-medium text-[#0E9E6E]">
              <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
              Auto-published
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-medium text-[#3370FF]">
              Internal report
            </span>
          )}
          <p className="mt-1 font-[var(--font-mono)] text-[12px] tabular-nums text-[#9CA3AF]">
            {relativeTime}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-4 h-px bg-[#F3F4F6]" aria-hidden="true" />

      {/* The updated table */}
      <CitationTable
        rows={rows}
        trackedIds={trackedIds}
        onTrack={onTrack}
        emptyTitle="No entries for this category"
        emptyDescription="Run the agent again to discover new opportunities."
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// TabPanel — one tab's full panel (input + run control + ledger + output)
// ---------------------------------------------------------------------------

interface TabPanelProps {
  config: TabConfig
  rows: OffsiteRow[]
  surfaceState: TabSurfaceState
  onSurfaceStateChange: (state: TabSurfaceState) => void
  runMode: RunMode
  onRunModeChange: (mode: RunMode) => void
  trackedIds: Set<string>
  onTrack: (id: string) => void
  stages: StageState[]
  onSetStages: (stages: StageState[]) => void
  inputCollapsed: boolean
  onInputCollapseChange: (v: boolean) => void
  offsiteRunsUsed?: number
  offsiteRunsCap?: number
}

function TabPanel({
  config,
  rows,
  surfaceState,
  onSurfaceStateChange,
  runMode,
  onRunModeChange,
  trackedIds,
  onTrack,
  stages,
  onSetStages,
  inputCollapsed,
  onInputCollapseChange,
  offsiteRunsUsed,
  offsiteRunsCap,
}: TabPanelProps) {
  const [, startTransition] = useTransition()
  const router = useRouter()

  // Citations tab is read-only — just shows the table
  if (config.agentKey === null) {
    return (
      <div>
        {surfaceState === 'loading' ? (
          <CitationTable rows={[]} trackedIds={trackedIds} onTrack={onTrack} isLoading />
        ) : surfaceState === 'error' ? (
          <CitationTable
            rows={[]}
            trackedIds={trackedIds}
            onTrack={onTrack}
            isError
            onRetry={() => onSurfaceStateChange('idle')}
          />
        ) : surfaceState === 'empty' ? (
          <CitationTable
            rows={[]}
            trackedIds={trackedIds}
            onTrack={onTrack}
            isEmpty
            emptyTitle="No citations found yet"
            emptyDescription="Run your first scan to discover which sites are citing you in AI search results."
            onRetry={() => router.push('/scans')}
          />
        ) : (
          <CitationTable
            rows={rows}
            trackedIds={trackedIds}
            onTrack={onTrack}
            emptyTitle="No citation data"
            emptyDescription="Run a scan to surface citation opportunities."
          />
        )}
      </div>
    )
  }

  // Cap allotment for offsite
  const runState: 'enabled' | 'cap-exhausted' =
    config.capped && offsiteRunsUsed !== undefined && offsiteRunsCap !== undefined && offsiteRunsUsed >= offsiteRunsCap
      ? 'cap-exhausted'
      : 'enabled'

  const allotmentLabel =
    config.capped && offsiteRunsUsed !== undefined && offsiteRunsCap !== undefined
      ? `${offsiteRunsCap - offsiteRunsUsed} of ${offsiteRunsCap} runs left this cycle`
      : undefined

  function handleRun() {
    if (surfaceState === 'running') return
    onSurfaceStateChange('running')
    onInputCollapseChange(true)

    // Simulate pipeline progression in demo mode
    let step = 0
    const interval = window.setInterval(() => {
      step++
      if (step >= (stages.length ?? 0)) {
        window.clearInterval(interval)
        // Slight delay then transition to success
        window.setTimeout(() => {
          onSurfaceStateChange('success')
        }, 800)
        return
      }
      onSetStages(
        stages.map((s, i) => ({
          ...s,
          status: i < step ? 'done' : i === step ? 'active' : 'queued',
        })),
      )
    }, 1400)
  }

  const collapseLabel = (() => {
    if (config.id === 'directory') return `${offsiteRunsUsed ?? 0} runs used · ${config.agentLabel}`
    if (config.id === 'entity') return `Entity signals ready · ${config.agentLabel}`
    if (config.id === 'reputation') return `Review audit ready · ${config.agentLabel}`
    return `Community channels ready · ${config.agentLabel}`
  })()

  const outputData = (() => {
    if (config.id === 'directory') return DEMO_OFFSITE.lastOffsiteRun
    if (config.id === 'entity') return DEMO_OFFSITE.lastEntityRun
    if (config.id === 'reputation') return DEMO_OFFSITE.lastReputationRun
    return DEMO_OFFSITE.lastCommunityRun
  })()

  const currentSubstep = stages.find((s) => s.status === 'active')?.substep ?? null

  return (
    <div className="space-y-0">
      {/* Input panel — target URL / config for this agent */}
      <div className="craft-enter craft-enter-1">
        {inputCollapsed && surfaceState !== 'idle' ? (
          <InputSummaryBar
            summary={collapseLabel}
            onExpand={() => {
              startTransition(() => {
                onInputCollapseChange(false)
                onSurfaceStateChange('idle')
              })
            }}
          />
        ) : (
          <div className="card-console overflow-hidden">
            <div className="px-6 py-4">
              {/* P2.7: identity is a page-level fact (Zone-1 eyebrow). Here the
                  panel states only the technical target the agent acts on. */}
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                Acting on
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 flex-1 items-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3">
                  <span className="font-[var(--font-mono)] text-[13px] text-[#6B7280]">
                    brightsmile-dental.co.il
                  </span>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
                  <span className="text-[13px] text-[#0A0A0A]">Ramat Gan, Israel</span>
                </div>
              </div>

              {config.outputKind === 'auto-publish' && (
                <p className="mt-3 text-[13px] text-[#6B7280]">
                  {config.id === 'directory'
                    ? 'Discovers and submits missing directory listings automatically.'
                    : 'Strengthens knowledge-graph entity signals across authoritative sources.'}
                  {' '}
                  <span className="text-[#3370FF]">No approval needed — auto-publishes.</span>
                </p>
              )}

              {config.outputKind === 'internal-report' && (
                <p className="mt-3 text-[13px] text-[#6B7280]">
                  {config.id === 'reputation'
                    ? 'Audits your review presence and generates outreach templates for key platforms.'
                    : 'Maps community channels where your audience asks dental questions and drafts a presence plan.'}
                  {' '}
                  <span className="text-[#3370FF]">Generates an internal report — nothing is published.</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Run Control — Zone 3 */}
      <div className="craft-enter craft-enter-2 mt-6">
        <RunControl
          mode={runMode}
          onModeChange={onRunModeChange}
          onRun={handleRun}
          runLabel={config.outputKind === 'internal-report' ? 'Generate report' : 'Run'}
          runState={runState}
          allotmentLabel={allotmentLabel}
          scheduleHref="/automation"
        />
      </div>

      {/* Zone 4 — PipelineLedger (running) */}
      {surfaceState === 'running' && config.agentLabel && (
        <div className="craft-enter craft-enter-3 mt-8">
          <PipelineLedger
            stages={stages}
            agentLabel={config.agentLabel}
            currentSubstep={currentSubstep}
            clearing={false}
          />
        </div>
      )}

      {/* Zone 5 — Output (success) */}
      {surfaceState === 'success' && (
        <div className="craft-enter craft-enter-4 mt-10">
          <div className="card-console-hero overflow-hidden">
            <OutputSummaryPanel
              summary={(outputData as { summary: string }).summary}
              completedAt={(outputData as { completedAt: string }).completedAt}
              outputKind={config.outputKind!}
              agentLabel={config.agentLabel!}
              rows={rows}
              trackedIds={trackedIds}
              onTrack={onTrack}
            />
          </div>
        </div>
      )}

      {/* Error state */}
      {surfaceState === 'error' && (
        <div className="mt-10">
          <ErrorState
            title="Agent run failed"
            description="The agent couldn't complete this run. Check your connection and try again."
            onRetry={() => {
              onSurfaceStateChange('idle')
              onInputCollapseChange(false)
            }}
            retryLabel="Try again"
          />
        </div>
      )}

      {/* Idle with data — show the monitoring table */}
      {(surfaceState === 'idle' || surfaceState === 'empty') && config.agentKey !== null && (
        <div className="mt-8">
          {surfaceState === 'empty' ? (
            <EmptyState
              illustration="automation"
              title={`No ${config.label.toLowerCase()} data yet`}
              description={`Run ${config.agentLabel} to start building your ${config.label.toLowerCase()} presence.`}
              align="top"
              action={
                <div className="flex flex-col items-center gap-3">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleRun}
                    aria-label={`Run ${config.agentLabel}`}
                  >
                    {config.outputKind === 'internal-report' ? 'Generate first report' : 'Run now'}
                  </Button>
                  {/* M8 two-tier recovery — quiet secondary link */}
                  <Link
                    href="/scans"
                    className="text-[13px] text-[#6B7280] hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:underline"
                  >
                    Run a scan first →
                  </Link>
                </div>
              }
            />
          ) : (
            <CitationTable
              rows={rows}
              trackedIds={trackedIds}
              onTrack={onTrack}
              emptyTitle={`No ${config.label.toLowerCase()} entries`}
              emptyDescription="Run the agent to discover opportunities."
            />
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// OffsiteTabs — the 5-tab cockpit (Zone 2 of ToolPage)
// ---------------------------------------------------------------------------

export interface OffsiteTabsProps {
  initialState?: TabSurfaceState
}

export function OffsiteTabs({ initialState = 'idle' }: OffsiteTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('citation')
  const [runModes, setRunModes] = useState<Record<TabKey, RunMode>>({
    citation: 'myself',
    directory: 'myself',
    entity: 'myself',
    reputation: 'myself',
    community: 'myself',
  })
  const [tabStates, setTabStates] = useState<Record<TabKey, TabSurfaceState>>({
    citation: initialState,
    directory: initialState,
    entity: initialState,
    reputation: initialState,
    community: initialState,
  })
  const [inputCollapsed, setInputCollapsed] = useState<Record<TabKey, boolean>>({
    citation: false,
    directory: false,
    entity: false,
    reputation: false,
    community: false,
  })
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set())

  // Per-tab pipeline stages (mutable for simulation)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function toStageStates(src: readonly any[]): StageState[] {
    return src.map((s) => ({ id: s.id, label: s.label, status: s.status, substep: s.substep ?? null }))
  }

  const [tabStages, setTabStages] = useState<Record<TabKey, StageState[]>>({
    citation: [],
    directory: toStageStates(DEMO_OFFSITE.offsitePipelineStages),
    entity: toStageStates(DEMO_OFFSITE.entityPipelineStages),
    reputation: toStageStates(DEMO_OFFSITE.reputationPipelineStages),
    community: toStageStates(DEMO_OFFSITE.communityPipelineStages),
  })

  const handleTrack = useCallback((id: string) => {
    setTrackedIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const trackedTotal = DEMO_OFFSITE.rows.filter((r) => r.status === 'tracked').length
  const cycleDelta =
    DEMO_OFFSITE.sparklinePoints.length >= 2
      ? DEMO_OFFSITE.sparklinePoints[DEMO_OFFSITE.sparklinePoints.length - 1] -
        DEMO_OFFSITE.sparklinePoints[DEMO_OFFSITE.sparklinePoints.length - 2]
      : 0

  return (
    <div>
      {/* SerifVerdict beat — M5, one per screen, never in chrome. P2.8: lifted
          onto its own hairline-separated editorial band with air above the tabs,
          instead of a caption buried over tab chrome. P2.9: carries the trend. */}
      <div className="mb-6 border-b border-[#F3F4F6] pb-5">
        <p className="text-[17px] leading-snug text-[#0A0A0A]">
          Your off-site presence is <SerifVerdict>growing</SerifVerdict>.
        </p>
        <p className="mt-1.5 text-[14px] text-[#6B7280]">
          <span className="font-mono tabular-nums text-[#0A0A0A]">{trackedTotal}</span> sources
          tracked across {TABS.length} channels
          {cycleDelta > 0 && (
            <>
              {' · '}
              <span className="font-mono tabular-nums text-[var(--color-status-positive-text)]">
                +{cycleDelta}
              </span>{' '}
              coverage this cycle
            </>
          )}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabKey)}
      >
        {/* Underline tab list */}
        <TabsList variant="underline" className="mb-6">
          {TABS.map((tab) => {
            const tabState = tabStates[tab.id]
            const hasBadge = tabState === 'running'
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                variant="underline"
                className="relative"
                aria-label={`${tab.label}${hasBadge ? ' — running' : ''}`}
              >
                {tab.label}
                {hasBadge && (
                  <span
                    className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#6E56F0]"
                    aria-hidden="true"
                  />
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <TabPanel
              config={tab}
              rows={DEMO_OFFSITE.rows.filter((r) => r.tab === tab.id)}
              surfaceState={tabStates[tab.id]}
              onSurfaceStateChange={(state) =>
                setTabStates((prev) => ({ ...prev, [tab.id]: state }))
              }
              runMode={runModes[tab.id]}
              onRunModeChange={(mode) =>
                setRunModes((prev) => ({ ...prev, [tab.id]: mode }))
              }
              trackedIds={trackedIds}
              onTrack={handleTrack}
              stages={tabStages[tab.id]}
              onSetStages={(stages) =>
                setTabStages((prev) => ({ ...prev, [tab.id]: stages }))
              }
              inputCollapsed={inputCollapsed[tab.id]}
              onInputCollapseChange={(v) =>
                setInputCollapsed((prev) => ({ ...prev, [tab.id]: v }))
              }
              offsiteRunsUsed={DEMO_OFFSITE.offsiteRunsUsed}
              offsiteRunsCap={DEMO_OFFSITE.offsiteRunsCap}
            />
          </TabsContent>
        ))}
      </Tabs>
      {/*
        State testing (P1.3): the on-page DEMO STATES debug strip was removed —
        it terminated the table on a dashed debug artifact and read as unfinished
        chrome. States are now driven by the `initialState` prop, which the page
        sets from an optional `?state=` URL param (dev/preview only). No control
        UI ships in the rendered page.
      */}
    </div>
  )
}

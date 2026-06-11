'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModeToggle, type RunMode } from '@/components/console/ModeToggle'
import type { AutomationRow } from '@/lib/demo/surfaces/types'
import type { AgentConfig } from '@/lib/agents/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgentModeRowProps {
  row: AutomationRow
  config: AgentConfig
  /** Current user plan tier — drives upgrade lock rendering */
  planTier: 'discover' | 'build' | 'scale'
  /** Called when the user flips the toggle; parent manages optimistic state */
  onModeChange: (id: string, mode: RunMode) => void
  /** Stagger index for craft-enter animation (0-based) */
  enterIndex?: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format an ISO timestamp as a relative string e.g. "3 days ago". */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

/** Cap badge — renders Geist Mono count string */
function CapBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[#EEEAFD] px-2 py-0.5 font-[var(--font-mono)] text-[11px] tabular-nums text-[#6E56F0]">
      {label}
    </span>
  )
}

/** Needs sign-off badge for requiresApproval agents */
function ApprovalBadge() {
  return (
    <span
      aria-label="This agent requires your sign-off before publishing"
      className="inline-flex items-center rounded-md border border-[#FDE68A] bg-[#FDF3E0] px-2 py-0.5 text-[11px] font-medium text-[#B8770B]"
    >
      needs your sign-off
    </span>
  )
}

/** Tier-locked upgrade affordance */
function TierLockBadge() {
  return (
    <span
      aria-label="Upgrade to Build plan to unlock this agent"
      className="inline-flex items-center rounded-md border border-[#E5E7EB] bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#6B7280]"
    >
      Build+
    </span>
  )
}

// ---------------------------------------------------------------------------
// AgentModeRow
// ---------------------------------------------------------------------------

/**
 * AgentModeRow — one agent row in the Automation Center (Mode Hub).
 *
 * Layout (asymmetric per M3):
 *   [Name + badges  · schedule/allotment] ··· [ModeToggle] ··· [allotment mono] ··· [Open tool →]
 *
 * Violet law: ModeToggle's "Let Beamix handle it" uses tint+ring, never solid violet.
 * The row itself gets a violet-tinted left border hairline when mode === 'beamix' (M6).
 */
export function AgentModeRow({
  row,
  config,
  planTier,
  onModeChange,
  enterIndex = 0,
}: AgentModeRowProps) {
  const isLocked = !config.availableOnTiers.includes(planTier)
  const showAllotment =
    row.mode === 'beamix' && row.allotmentLabel !== null

  return (
    <div
      className={cn(
        // Base card shape — TIER-2
        'card-console group relative rounded-[16px] border border-[#E5E7EB] bg-white transition-shadow duration-150',
        // Craft-enter stagger (M9) — capped to the 8 available classes
        `craft-enter craft-enter-${Math.min(enterIndex + 1, 8)}`,
        // Violet left-border hairline when autonomous (M6 spatial signal)
        row.mode === 'beamix' && !isLocked
          ? 'before:absolute before:inset-y-4 before:left-0 before:w-[3px] before:rounded-full before:bg-[#6E56F0]/30'
          : '',
        isLocked && 'opacity-75',
      )}
    >
      <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:gap-6">

        {/* — Left column: name + meta — dominant column per M3 */}
        <div className="min-w-0 flex-1">
          {/* Name row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold text-[#0A0A0A]">
              {row.agentLabel}
            </span>
            {isLocked && <TierLockBadge />}
            {config.requiresApproval && !isLocked && <ApprovalBadge />}
          </div>

          {/* Schedule + last run — secondary info (M12 hairline rhythm within cluster) */}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            {row.mode === 'beamix' && row.scheduleLabel && (
              <span className="font-[var(--font-mono)] text-[12px] tabular-nums text-[#6B7280]">
                {row.scheduleLabel}
              </span>
            )}
            {row.mode === 'myself' && (
              <span className="text-[12px] text-[#9CA3AF]">Manual mode</span>
            )}
            {row.lastRunAt && (
              <span className="font-[var(--font-mono)] text-[12px] tabular-nums text-[#9CA3AF]">
                Last run {relativeTime(row.lastRunAt)}
              </span>
            )}
            {!row.lastRunAt && (
              <span className="text-[12px] text-[#9CA3AF]">Never run</span>
            )}
          </div>
        </div>

        {/* — Centre: allotment badge (only for autonomous mode) */}
        {showAllotment && row.allotmentLabel && (
          <div className="shrink-0">
            <CapBadge label={row.allotmentLabel.replace('Beamix runs this ', '')} />
          </div>
        )}

        {/* — ModeToggle (disabled when tier-locked) */}
        <div className="shrink-0">
          <ModeToggle
            mode={row.mode as RunMode}
            onChange={(newMode) => onModeChange(row.id, newMode)}
            allotmentLabel={row.allotmentLabel ?? undefined}
            disabled={isLocked}
          />
        </div>

        {/* — Open tool link */}
        <div className="shrink-0">
          {isLocked ? (
            <span
              aria-disabled="true"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[#D1D5DB]"
            >
              Open tool
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          ) : (
            <Link
              href={row.toolHref}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[#3370FF] transition-colors hover:text-[#2454D6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
              aria-label={`Open ${row.agentLabel} tool`}
            >
              Open tool
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

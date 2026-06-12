'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModeToggle, type RunMode } from '@/components/console/ModeToggle'
import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'
import type { AutomationRow } from '@/lib/demo/surfaces/types'
import type { AgentConfig } from '@/lib/agents/types'
import { AUTOMATION_RUN_HISTORY } from './runHistory'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Visual weight of the row (M1 depth staging — three felt tiers):
 *  - 'focus'  → TIER-2 standard card with shadow. Used for the row that needs
 *               the user's attention right now (an autonomous agent awaiting
 *               sign-off) and for every manual row on the white canvas.
 *  - 'inset'  → TIER-3 recede. A healthy autonomous row sitting INSIDE the
 *               violet agent-zone: the zone carries the weight, the row recedes
 *               into it (transparent ground, hairline, no shadow). Beamix has it
 *               handled, so the row is calm.
 */
type RowTier = 'focus' | 'inset'

interface AgentModeRowProps {
  row: AutomationRow
  config: AgentConfig
  /** Current user plan tier — drives upgrade lock rendering */
  planTier: 'discover' | 'build' | 'scale'
  /** Called when the user flips the toggle; parent manages optimistic state */
  onModeChange: (id: string, mode: RunMode) => void
  /** Depth tier (M1) — set by the parent based on mode + sign-off state */
  tier: RowTier
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
 * Aligned column grid (M3 / fixes the ragged-right tell): the row body is a
 * 4-track grid so the run-history sparkline, the ModeToggle, and the "Open tool"
 * link sit in fixed, aligned columns regardless of which badges are present.
 *
 *   [ name + meta (1fr) ] [ sparkline (88px) ] [ ModeToggle (auto) ] [ link (96px) ]
 *
 * Depth (M1): `tier="inset"` rows recede into the surrounding violet agent-zone;
 * `tier="focus"` rows are TIER-2 cards (manual rows on white, or an autonomous
 * row awaiting sign-off that needs to command attention).
 *
 * Violet law: violet is spatial (the zone + the toggle tint+ring), NEVER a solid
 * button or link. "Open tool" is demoted to neutral so blue stays the one primary
 * action color per row.
 */
export function AgentModeRow({
  row,
  config,
  planTier,
  onModeChange,
  tier,
  enterIndex = 0,
}: AgentModeRowProps) {
  const isLocked = !config.availableOnTiers.includes(planTier)
  const isAutonomous = row.mode === 'beamix' && !isLocked
  const needsSignOff = isAutonomous && config.requiresApproval
  const history = AUTOMATION_RUN_HISTORY[row.id] ?? null

  return (
    <div
      className={cn(
        'group relative rounded-[16px] transition-shadow duration-200',
        // Craft-enter stagger (M9) — capped to the 8 available classes
        `craft-enter craft-enter-${Math.min(enterIndex + 1, 8)}`,
        // M1 depth tiers
        tier === 'inset'
          ? // TIER-3 — recede INTO the violet zone: transparent ground, violet
            // hairline, no shadow. The zone is the weight; the row is calm.
            'border border-[#DED6F8] bg-white/55'
          : // TIER-2 — standard card with felt shadow + hover lift
            'card-console card-hover-lift',
        // An autonomous row awaiting sign-off keeps the violet identity even as a
        // focus card: a solid violet left rule (M6 — violet is spatial, not a button)
        needsSignOff &&
          tier === 'focus' &&
          'before:absolute before:inset-y-4 before:left-0 before:w-[3px] before:rounded-full before:bg-[#6E56F0]',
        isLocked && 'opacity-75',
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-4 px-5 py-4',
          // Aligned column grid at sm+ — sparkline / toggle / link in fixed tracks
          'sm:grid sm:grid-cols-[minmax(0,1fr)_88px_auto_96px] sm:items-center sm:gap-5',
        )}
      >
        {/* — Col 1: name + meta — dominant column (M3) */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold text-[#0A0A0A]">
              {row.agentLabel}
            </span>
            {isLocked && <TierLockBadge />}
            {needsSignOff && <ApprovalBadge />}
          </div>

          {/* Schedule + last run — mono for truth (M11), receding (M12) */}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            {isAutonomous && row.scheduleLabel && (
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

        {/* — Col 2: run-history sparkline (M4 signature detail) —
            Reserved column. Autonomous rows with real history draw the line; all
            others render the intentional flat baseline. Never fabricated. */}
        <div className="hidden sm:flex sm:items-center sm:justify-start">
          {isAutonomous ? (
            <EngineMicroSparkline
              points={history?.scores ?? null}
              currentScore={history?.current ?? null}
              width={72}
              height={22}
            />
          ) : (
            // Manual / locked rows: keep the column rhythm with the baseline only
            <span aria-hidden className="block h-px w-[72px] bg-[#E5E7EB]" />
          )}
        </div>

        {/* — Col 3: ModeToggle (carries the allotment line itself — single home) */}
        <div className="sm:justify-self-start">
          <ModeToggle
            mode={row.mode as RunMode}
            onChange={(newMode) => onModeChange(row.id, newMode)}
            allotmentLabel={row.allotmentLabel ?? undefined}
            disabled={isLocked}
          />
        </div>

        {/* — Col 4: tool / upgrade link — neutral, arrow is the only accent (P3-1) */}
        <div className="sm:justify-self-end">
          {isLocked ? (
            <Link
              href="/settings?tab=billing"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[#3370FF] transition-colors hover:text-[#2454D6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
              aria-label={`Upgrade to unlock ${row.agentLabel}`}
            >
              Upgrade to unlock
              <ArrowRight className="h-3.5 w-3.5 text-[#3370FF]" strokeWidth={2} />
            </Link>
          ) : (
            <Link
              href={row.toolHref}
              className="inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-medium text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
              aria-label={`Open ${row.agentLabel} tool`}
            >
              Open tool
              <ArrowRight className="h-3.5 w-3.5 text-[#3370FF]" strokeWidth={2} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  CalendarClock,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Minus,
  Plus,
  TrendingUp,
  ArrowRight,
  Clock,
  FileText,
  Eye,
  ThumbsUp,
  Globe,
  ChevronDown,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type {
  AutomationStatus,
  AutomationSchedule,
  AutomationRunResult,
  AutomationRecentRun,
  AutomationContentFunnel,
} from '@/lib/types/shared'
import { KillSwitchConfirm } from './KillSwitchConfirm'
import { AddScheduleModal } from './AddScheduleModal'

interface AutomationClientProps {
  status: AutomationStatus
}

type Cadence = AutomationSchedule['cadence']

const CADENCE_LABELS: Record<Cadence, string> = {
  daily: 'Every day at 09:00',
  weekly: 'Every Monday at 09:00',
  biweekly: 'Every 2 weeks',
  monthly: 'First of the month',
}

const AGENT_LABELS: Record<string, string> = {
  content_optimizer: 'Content Optimizer',
  performance_tracker: 'Performance Tracker',
  freshness_agent: 'Freshness Agent',
  faq_builder: 'FAQ Builder',
  competitor_intelligence: 'Competitor Intel',
  schema_optimizer: 'Schema Optimizer',
  blog_strategist: 'Blog Strategist',
}

const AGENT_TRIGGER_LABELS: Record<string, string> = {
  content_optimizer: 'On new scan result',
  performance_tracker: 'Scheduled',
  freshness_agent: 'Scheduled',
  faq_builder: 'On new scan result',
  competitor_intelligence: 'Scheduled',
  schema_optimizer: 'On new scan result',
  blog_strategist: 'Scheduled',
}

function formatNextRun(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / 86_400_000)
  if (diffDays <= 0) return 'Due now'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `In ${diffDays} days`
  if (diffDays < 14) return `In 1 week`
  return `In ${Math.floor(diffDays / 7)} weeks`
}

function formatTimeAgo(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60_000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}d ago`
}

// ─── Inline sparkline (7-bar run history) ────────────────────────────────

interface RunSparklineProps {
  runs: Array<boolean | null>
}

function RunSparkline({ runs }: RunSparklineProps) {
  const bars = [...runs]
  while (bars.length < 7) bars.unshift(null)

  return (
    <div className="flex items-end gap-[2px] h-[18px]" aria-label="Last 7 run results">
      {bars.map((val, i) => (
        <div
          key={i}
          className={cn(
            'w-[6px] rounded-sm',
            val === true && 'bg-emerald-400 h-[14px]',
            val === false && 'bg-red-400 h-[14px]',
            val === null && 'bg-gray-200 h-[6px]',
          )}
          title={val === true ? 'Success' : val === false ? 'Failed' : 'Skipped'}
        />
      ))}
    </div>
  )
}

// ─── 14-day daily sparkline (SVG bar chart) ───────────────────────────────

interface DailySparklineProps {
  data: number[]
}

function DailySparkline({ data }: DailySparklineProps) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data, 1)
  const totalW = 128
  const height = 32
  const n = data.length
  const barW = Math.max(4, Math.floor((totalW - (n - 1)) / n))

  return (
    <svg
      width={totalW}
      height={height}
      className="shrink-0"
      aria-label="Daily AI actions — last 14 days"
    >
      {data.map((val, i) => {
        const h = Math.max(2, Math.round((val / max) * height))
        const x = i * (barW + 1)
        const y = height - h
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx={1}
            fill={i === n - 1 ? '#3370FF' : '#93b4ff'}
          />
        )
      })}
    </svg>
  )
}

// ─── Status pill ──────────────────────────────────────────────────────────

interface StatusPillProps {
  isPaused: boolean
  globalPaused: boolean
  hasError?: boolean
}

function StatusPill({ isPaused, globalPaused, hasError }: StatusPillProps) {
  if (hasError) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
        <AlertCircle className="size-3" />
        Error
      </span>
    )
  }
  if (globalPaused || isPaused) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
        <Pause className="size-3" />
        Paused
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
      <CheckCircle2 className="size-3" />
      Running
    </span>
  )
}

// ─── Last run result cell ─────────────────────────────────────────────────

function LastRunResultCell({ result }: { result?: AutomationRunResult | null }) {
  if (!result) {
    return <span className="text-xs text-gray-400">No runs yet</span>
  }
  if (result.status === 'success') {
    return (
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
        <span className="text-xs text-gray-700 leading-tight">{result.label}</span>
      </div>
    )
  }
  if (result.status === 'failed') {
    return (
      <div className="flex items-center gap-1.5">
        <XCircle className="size-3.5 text-red-500 shrink-0" />
        <span className="text-xs text-red-600 leading-tight">{result.label}</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5">
      <Minus className="size-3.5 text-gray-400 shrink-0" />
      <span className="text-xs text-gray-500 leading-tight">{result.label}</span>
    </div>
  )
}

// ─── Table row ────────────────────────────────────────────────────────────

interface ScheduleRowProps {
  schedule: AutomationSchedule
  globalPaused: boolean
  onTogglePause: (id: string, paused: boolean) => void
  onChangeCadence: (id: string, cadence: Cadence) => void
  onRemove: (id: string) => void
}

function ScheduleRow({
  schedule,
  globalPaused,
  onTogglePause,
  onChangeCadence,
  onRemove,
}: ScheduleRowProps) {
  const effectivelyPaused = globalPaused || schedule.isPaused
  const agentLabel = AGENT_LABELS[schedule.agentType] ?? schedule.agentType
  const triggerLabel = AGENT_TRIGGER_LABELS[schedule.agentType] ?? 'Scheduled'
  const runs7: Array<boolean | null> = schedule.runHistory7 ?? []

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="group border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors duration-100"
    >
      {/* Agent */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Zap className="size-3.5 text-[#3370FF]" />
          </div>
          <span className="text-sm font-medium text-gray-900 leading-tight whitespace-nowrap">
            {agentLabel}
          </span>
        </div>
      </td>

      {/* Trigger */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-xs text-gray-500 whitespace-nowrap">{triggerLabel}</span>
      </td>

      {/* Frequency */}
      <td className="px-4 py-3 hidden md:table-cell">
        <Select
          defaultValue={schedule.cadence}
          onValueChange={(v) => onChangeCadence(schedule.id, v as Cadence)}
          disabled={effectivelyPaused}
        >
          <SelectTrigger
            size="sm"
            className="h-7 w-[160px] gap-1 border-gray-200 bg-transparent px-2 text-xs hover:border-gray-300 disabled:opacity-40"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(CADENCE_LABELS) as Cadence[]).map((c) => (
              <SelectItem key={c} value={c} className="text-xs">
                {CADENCE_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>

      {/* Last run result */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <LastRunResultCell result={schedule.lastRunResult} />
      </td>

      {/* Next run */}
      <td className="px-4 py-3 hidden xl:table-cell">
        <span className="text-xs text-gray-500 tabular-nums whitespace-nowrap">
          {formatNextRun(schedule.nextRunAt)}
        </span>
      </td>

      {/* 7-run sparkline */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <RunSparkline runs={runs7} />
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusPill isPaused={schedule.isPaused} globalPaused={globalPaused} />
      </td>

      {/* Toggle + kebab */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2.5">
          <Switch
            size="sm"
            checked={!schedule.isPaused}
            onCheckedChange={(checked) => onTogglePause(schedule.id, !checked)}
            aria-label={schedule.isPaused ? `Resume ${agentLabel}` : `Pause ${agentLabel}`}
            disabled={globalPaused}
            className="data-[state=checked]:bg-[#3370FF]"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
                aria-label={`Options for ${agentLabel}`}
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                className="gap-2 text-xs"
                onClick={() => onTogglePause(schedule.id, !schedule.isPaused)}
                disabled={globalPaused}
              >
                {schedule.isPaused ? (
                  <>
                    <Play className="size-3.5" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="size-3.5" />
                    Pause
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-xs text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => onRemove(schedule.id)}
              >
                <Trash2 className="size-3.5" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </motion.tr>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────

function EmptySchedules() {
  return (
    <tr>
      <td colSpan={8} className="px-4 py-14 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
            <Zap className="size-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">No automations yet</p>
            <p className="mt-0.5 text-xs text-gray-500 max-w-xs mx-auto">
              Accept a suggestion from your inbox to create a schedule, or add one manually.
            </p>
          </div>
        </div>
      </td>
    </tr>
  )
}

// ─── AI Runs projection card ──────────────────────────────────────────────

interface RunsProjectionCardProps {
  used: number
  cap: number
  pct: number
  daysElapsed: number
  daysRemaining: number
  dailyRuns: number[]
}

function RunsProjectionCard({
  used,
  cap,
  pct,
  daysElapsed,
  daysRemaining,
  dailyRuns,
}: RunsProjectionCardProps) {
  const remaining = cap - used
  const isLow = pct >= 80
  const isCritical = pct >= 90

  const projectedTotal = daysElapsed > 0
    ? Math.round((used / daysElapsed) * (daysElapsed + daysRemaining))
    : used

  const projectedLabel =
    projectedTotal <= cap
      ? `At this rate, you'll use ${projectedTotal} this month — well within limit.`
      : `At this rate, you may exceed your limit by ${projectedTotal - cap}.`

  const progressColor = isCritical
    ? 'bg-red-500'
    : isLow
    ? 'bg-amber-400'
    : 'bg-[#3370FF]'

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-3.5 text-gray-400 shrink-0" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            AI Actions
          </span>
        </div>
        <DailySparkline data={dailyRuns} />
      </div>

      <div className="mb-3">
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-2xl font-semibold tabular-nums text-gray-900 tracking-tight">
            {used}
          </span>
          <span className="text-sm text-gray-400">of {cap} used · Resets in {daysRemaining} days</span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className={cn('h-full rounded-full', progressColor)}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, pct)}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-gray-400 tabular-nums">{remaining} remaining</span>
          <span className="text-[11px] text-gray-400 tabular-nums">{pct.toFixed(0)}% used</span>
        </div>
      </div>

      <div
        className={cn(
          'rounded-lg px-3 py-2 text-xs leading-relaxed',
          projectedTotal > cap
            ? 'bg-amber-50 text-amber-700 border border-amber-100'
            : 'bg-gray-50 text-gray-600',
        )}
      >
        <TrendingUp className="size-3 inline mr-1 opacity-60" />
        {projectedLabel}
      </div>

      {isLow && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5">
          <div>
            <p className="text-xs font-medium text-blue-900">Running low?</p>
            <p className="text-[11px] text-blue-700 mt-0.5">
              Add 25 actions for $19, or upgrade your plan.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-[#3370FF] px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-[#2860e8] active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          >
            <Plus className="size-3" />
            Add actions
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Output funnel card ───────────────────────────────────────────────────

interface FunnelCardProps {
  funnel: AutomationContentFunnel
}

const FUNNEL_STEPS: Array<{
  key: keyof AutomationContentFunnel
  label: string
  Icon: React.FC<{ className?: string }>
  barColor: string
}> = [
  { key: 'draft', label: 'Draft', Icon: FileText, barColor: 'bg-gray-300' },
  { key: 'in_review', label: 'In Review', Icon: Eye, barColor: 'bg-amber-300' },
  { key: 'approved', label: 'Approved', Icon: ThumbsUp, barColor: 'bg-blue-400' },
  { key: 'published', label: 'Published', Icon: Globe, barColor: 'bg-emerald-400' },
]

function OutputFunnelCard({ funnel }: FunnelCardProps) {
  const total = Math.max(
    funnel.draft + funnel.in_review + funnel.approved + funnel.published,
    1,
  )

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRight className="size-3.5 text-gray-400" />
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Output Pipeline
        </span>
      </div>

      <div className="space-y-3">
        {FUNNEL_STEPS.map((step, idx) => {
          const count = funnel[step.key]
          const widthPct = Math.max(6, Math.round((count / total) * 100))
          const Icon = step.Icon

          return (
            <div key={step.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Icon className="size-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{step.label}</span>
                  {idx < FUNNEL_STEPS.length - 1 && (
                    <ChevronDown className="size-3 text-gray-300" />
                  )}
                </div>
                <span className="text-xs font-medium tabular-nums text-gray-900">{count}</span>
              </div>
              <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full', step.barColor)}
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.07,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-3.5 text-[11px] text-gray-400 border-t border-gray-100 pt-2.5 leading-relaxed">
        {funnel.draft} drafts · {funnel.in_review} in review · {funnel.approved} approved ·{' '}
        {funnel.published} published this month
      </p>
    </div>
  )
}

// ─── Run history card ─────────────────────────────────────────────────────

interface RunHistoryCardProps {
  runs: AutomationRecentRun[]
}

function RunHistoryCard({ runs }: RunHistoryCardProps) {
  if (runs.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="size-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Recent Runs
          </span>
        </div>
        <p className="text-xs text-gray-400 py-4 text-center">No runs recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="size-3.5 text-gray-400" />
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Recent Runs
        </span>
      </div>

      <div className="divide-y divide-gray-50">
        {runs.map((run, i) => (
          <div key={i} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
            <div
              className={cn(
                'size-5 rounded flex items-center justify-center shrink-0',
                run.status === 'success' && 'bg-emerald-50',
                run.status === 'failed' && 'bg-red-50',
                run.status === 'skipped' && 'bg-gray-50',
              )}
            >
              {run.status === 'success' && (
                <CheckCircle2 className="size-3 text-emerald-500" />
              )}
              {run.status === 'failed' && <XCircle className="size-3 text-red-500" />}
              {run.status === 'skipped' && <Minus className="size-3 text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 truncate leading-tight">
                {AGENT_LABELS[run.agentType] ?? run.agentType}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                {formatTimeAgo(run.completedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────

export function AutomationClient({ status }: AutomationClientProps) {
  const [globalKill, setGlobalKill] = React.useState(status.globalKillSwitch)
  const [killPending, setKillPending] = React.useState(false)
  const [addModalOpen, setAddModalOpen] = React.useState(false)
  const [schedules, setSchedules] = React.useState<AutomationSchedule[]>(status.schedules)

  function handleKillButtonClick() {
    if (globalKill) {
      setGlobalKill(false)
    } else {
      setKillPending(true)
    }
  }

  function handleKillConfirm() {
    setGlobalKill(true)
    setKillPending(false)
  }

  function handleKillCancel() {
    setKillPending(false)
  }

  function handleTogglePause(id: string, paused: boolean) {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, isPaused: paused } : s)))
  }

  function handleChangeCadence(id: string, cadence: Cadence) {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, cadence } : s)))
  }

  function handleRemove(id: string) {
    setSchedules((prev) => prev.filter((s) => s.id !== id))
  }

  function handleScheduleAdded(newSchedule: AutomationSchedule) {
    setSchedules((prev) => {
      const existingIdx = prev.findIndex((s) => s.agentType === newSchedule.agentType)
      if (existingIdx !== -1) {
        const updated = [...prev]
        updated[existingIdx] = newSchedule
        return updated
      }
      return [newSchedule, ...prev]
    })
    setAddModalOpen(false)
  }

  const activeCount = schedules.filter((s) => !s.isPaused && !globalKill).length
  const pausedCount = schedules.filter((s) => s.isPaused).length

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 sm:py-10">
      {/* Top strip */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Auto-pilot</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {globalKill
              ? 'All automation is paused'
              : `${activeCount} agent${activeCount !== 1 ? 's' : ''} running automatically this week${
                  pausedCount > 0 ? ` · ${pausedCount} paused` : ''
                }`}
          </p>
        </div>

        {/* Kill switch pill */}
        <button
          type="button"
          onClick={handleKillButtonClick}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            globalKill
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 focus-visible:ring-amber-500'
              : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 focus-visible:ring-red-500',
          )}
          aria-label={globalKill ? 'Re-enable all automation' : 'Pause all automation'}
        >
          {globalKill ? (
            <>
              <Play className="size-3.5" />
              Re-enable automation
            </>
          ) : (
            <>
              <Pause className="size-3.5" />
              Pause all
            </>
          )}
        </button>
      </div>

      {/* Global paused banner */}
      <AnimatePresence>
        {globalKill && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="mb-5 overflow-hidden"
          >
            <div className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <Pause className="size-4 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800">
                All automations are paused. No scheduled runs will execute until re-enabled.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main grid: content + aside */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        {/* Left column */}
        <div className="flex flex-col gap-5 min-w-0">
          <RunsProjectionCard
            used={status.creditsUsedThisMonth}
            cap={status.creditsCapThisMonth}
            pct={status.creditsUsedPercent}
            daysElapsed={status.daysElapsed}
            daysRemaining={status.daysRemaining}
            dailyRuns={status.dailyRunsLast14}
          />

          {/* Schedules table */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Agent
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400 hidden sm:table-cell">
                      Trigger
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400 hidden md:table-cell">
                      Frequency
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400 hidden lg:table-cell">
                      Last result
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400 hidden xl:table-cell">
                      Next run
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400 hidden lg:table-cell">
                      7 runs
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {schedules.length === 0 ? (
                      <EmptySchedules />
                    ) : (
                      schedules.map((schedule) => (
                        <ScheduleRow
                          key={schedule.id}
                          schedule={schedule}
                          globalPaused={globalKill}
                          onTogglePause={handleTogglePause}
                          onChangeCadence={handleChangeCadence}
                          onRemove={handleRemove}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Add schedule CTA */}
            <div className="border-t border-gray-100 px-4 py-3">
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-[#3370FF] hover:bg-blue-50 border border-dashed border-gray-200 hover:border-blue-200 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98]"
              >
                <Plus className="size-3.5" />
                Add automation schedule
              </button>
            </div>
          </div>
        </div>

        {/* Right aside */}
        <div className="flex flex-col gap-4">
          <OutputFunnelCard funnel={status.contentFunnel} />
          <RunHistoryCard runs={status.runHistoryRecent} />
        </div>
      </div>

      {/* Modals */}
      <KillSwitchConfirm
        open={killPending}
        onConfirm={handleKillConfirm}
        onCancel={handleKillCancel}
      />

      <AddScheduleModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onScheduleAdded={handleScheduleAdded}
        existingAgentTypes={schedules.map((s) => s.agentType)}
      />
    </main>
  )
}

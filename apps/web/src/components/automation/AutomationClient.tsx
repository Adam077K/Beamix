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
import type { AutomationStatus, AutomationSchedule } from '@/lib/types/shared'
import { KillSwitchConfirm } from './KillSwitchConfirm'

interface AutomationClientProps {
  status: AutomationStatus
}

type Cadence = AutomationSchedule['cadence']

const CADENCE_LABELS: Record<Cadence, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
}

const AGENT_LABELS: Record<string, string> = {
  content_optimizer: 'Content Optimizer',
  performance_tracker: 'Performance Tracker',
  freshness_agent: 'Freshness Agent',
  faq_builder: 'FAQ Builder',
  competitor_intelligence: 'Competitor Intelligence',
  schema_optimizer: 'Schema Optimizer',
  blog_strategist: 'Blog Strategist',
}

function formatRelativeDate(iso: string | null): string {
  if (!iso) return 'Never'
  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date)
}

function formatNextRun(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / 86_400_000)
  if (diffDays <= 0) return 'Due now'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `In ${diffDays}d`
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date)
}

// ─── Status pill ──────────────────────────────────────────────────────────────

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

// ─── Table row ────────────────────────────────────────────────────────────────

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
  const triggerLabel = schedule.actionLabel ?? agentLabel

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="group border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors duration-100"
    >
      {/* Agent */}
      <td className="px-4 py-3.5 w-[220px]">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Zap className="size-3.5 text-[#3370FF]" />
          </div>
          <span className="text-sm font-medium text-gray-900 leading-tight">{agentLabel}</span>
        </div>
      </td>

      {/* Trigger */}
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <span className="text-xs text-gray-500 leading-tight line-clamp-1 max-w-[180px]">
          {triggerLabel}
        </span>
      </td>

      {/* Frequency */}
      <td className="px-4 py-3.5 hidden md:table-cell">
        <Select
          defaultValue={schedule.cadence}
          onValueChange={(v) => onChangeCadence(schedule.id, v as Cadence)}
          disabled={effectivelyPaused}
        >
          <SelectTrigger
            size="sm"
            className="h-7 w-[130px] gap-1 border-gray-200 bg-transparent px-2 text-xs hover:border-gray-300 disabled:opacity-40"
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

      {/* Last run */}
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500 tabular-nums">
            {formatRelativeDate(schedule.lastRunAt)}
          </span>
          <span className="text-[11px] text-gray-400">
            Next: {formatNextRun(schedule.nextRunAt)}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <StatusPill isPaused={schedule.isPaused} globalPaused={globalPaused} />
      </td>

      {/* Toggle + kebab */}
      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-3">
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

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptySchedules() {
  return (
    <tr>
      <td colSpan={6} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
            <Zap className="size-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">No automations yet</p>
            <p className="mt-0.5 text-xs text-gray-500 max-w-xs mx-auto">
              Your first scan configures these. Accept a suggestion from your inbox to create a
              schedule.
            </p>
          </div>
        </div>
      </td>
    </tr>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function AutomationClient({ status }: AutomationClientProps) {
  const [globalKill, setGlobalKill] = React.useState(status.globalKillSwitch)
  const [killPending, setKillPending] = React.useState(false)
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

  const activeCount = schedules.filter((s) => !s.isPaused).length
  const creditPct = Math.min(100, status.creditsUsedPercent)

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Automation</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {globalKill
              ? 'All automation is paused'
              : `${activeCount} active schedule${activeCount !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Kill switch pill button (red, top-right) */}
        <button
          type="button"
          onClick={handleKillButtonClick}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            globalKill
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 focus-visible:ring-amber-500'
              : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 focus-visible:ring-red-500'
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

      {/* Credit usage bar */}
      <div className="mb-7 rounded-xl border border-gray-200 bg-white px-4 py-3.5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CalendarClock className="size-3.5 text-gray-400" />
            <span className="text-xs font-medium text-gray-700">AI runs this month</span>
          </div>
          <span className="tabular-nums text-xs text-gray-500">
            {status.creditsUsedThisMonth} / {status.creditsCapThisMonth}
          </span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className={cn(
              'h-full rounded-full',
              creditPct >= 90 ? 'bg-red-500' : creditPct >= 75 ? 'bg-amber-400' : 'bg-[#3370FF]',
            )}
            initial={{ width: 0 }}
            animate={{ width: `${creditPct}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-400">
          {status.creditsCapThisMonth - status.creditsUsedThisMonth} runs remaining
        </p>
      </div>

      {/* Schedules table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
                  Last run
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-gray-400">
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
      </div>

      {/* Kill switch confirm modal */}
      <KillSwitchConfirm
        open={killPending}
        onConfirm={handleKillConfirm}
        onCancel={handleKillCancel}
      />
    </main>
  )
}

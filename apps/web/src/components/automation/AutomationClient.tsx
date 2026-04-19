'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  CalendarClock,
  AlertCircle,
  CirclePause,
  CirclePlay,
  OctagonX,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { AutomationStatus, AutomationSchedule } from '@/lib/types/shared'
import { KillSwitchConfirm } from './KillSwitchConfirm'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AutomationClientProps {
  status: AutomationStatus
}

type Cadence = AutomationSchedule['cadence']
type RunStatus = 'running' | 'paused' | 'error'

interface ScheduleWithStatus extends AutomationSchedule {
  runStatus: RunStatus
  errorCount?: number
  triggerLabel: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CADENCE_LABELS: Record<Cadence, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
}

const STATUS_CONFIG: Record<
  RunStatus,
  { label: string; dotClass: string; badgeClass: string; icon: React.ElementType }
> = {
  running: {
    label: 'Running',
    dotClass: 'bg-[#10B981]',
    badgeClass: 'bg-emerald-50 text-emerald-700',
    icon: CirclePlay,
  },
  paused: {
    label: 'Paused',
    dotClass: 'bg-gray-400',
    badgeClass: 'bg-gray-100 text-gray-500',
    icon: CirclePause,
  },
  error: {
    label: 'Error',
    dotClass: 'bg-[#EF4444]',
    badgeClass: 'bg-red-50 text-[#EF4444]',
    icon: AlertCircle,
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.round((d.getTime() - now.getTime()) / 86_400_000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0 && diffDays < 7) return `In ${diffDays}d`
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)}d ago`

  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(d)
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status, errorCount }: { status: RunStatus; errorCount?: number }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        config.badgeClass,
      )}
    >
      {status === 'running' ? (
        <span className="relative flex size-1.5">
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              config.dotClass,
            )}
          />
          <span className={cn('relative inline-flex size-1.5 rounded-full', config.dotClass)} />
        </span>
      ) : (
        <Icon size={11} className="shrink-0" aria-hidden="true" />
      )}
      {config.label}
      {status === 'error' && typeof errorCount === 'number' && errorCount > 0 && (
        <span className="tabular-nums">({errorCount})</span>
      )}
    </span>
  )
}

// ─── Table row ────────────────────────────────────────────────────────────────

interface ScheduleRowProps {
  schedule: ScheduleWithStatus
  globalPaused: boolean
  onTogglePause: (id: string, paused: boolean) => void
  onChangeCadence: (id: string, cadence: Cadence) => void
  onKillIndividual: (id: string) => void
  index: number
}

function ScheduleRow({
  schedule,
  globalPaused,
  onTogglePause,
  onChangeCadence,
  onKillIndividual,
  index,
}: ScheduleRowProps) {
  const effectivelyPaused = globalPaused || schedule.isPaused
  const runStatus: RunStatus = globalPaused
    ? 'paused'
    : schedule.runStatus === 'error'
      ? 'error'
      : schedule.isPaused
        ? 'paused'
        : 'running'

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
      className={cn(
        'group border-b border-gray-100 transition-colors duration-150',
        'hover:bg-gray-50/60',
        effectivelyPaused && 'opacity-60',
      )}
    >
      {/* Agent / action */}
      <td className="py-3 pl-4 pr-3 sm:pl-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">{schedule.actionLabel}</p>
          <p className="mt-0.5 truncate text-xs text-gray-400">{schedule.triggerLabel}</p>
        </div>
      </td>

      {/* Frequency */}
      <td className="hidden px-3 py-3 sm:table-cell">
        <Select
          defaultValue={schedule.cadence}
          onValueChange={(v) => onChangeCadence(schedule.id, v as Cadence)}
          disabled={effectivelyPaused}
        >
          <SelectTrigger
            size="sm"
            className="h-7 w-[140px] gap-1 border-gray-200 bg-transparent px-2 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
      <td className="hidden px-3 py-3 text-xs tabular-nums text-gray-500 sm:table-cell">
        <span className="flex items-center gap-1.5">
          <CalendarClock size={12} className="shrink-0 text-gray-400" aria-hidden="true" />
          {formatRelativeDate(schedule.lastRunAt)}
        </span>
      </td>

      {/* Status */}
      <td className="px-3 py-3">
        <StatusPill status={runStatus} errorCount={schedule.errorCount} />
      </td>

      {/* Controls */}
      <td className="py-3 pl-3 pr-4 sm:pr-6">
        <div className="flex items-center justify-end gap-2">
          {/* Retry button — only on error */}
          {runStatus === 'error' && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="h-6 gap-1 px-2 text-xs text-[#EF4444] hover:bg-red-50 hover:text-[#DC2626]"
              aria-label={`Retry ${schedule.actionLabel}`}
            >
              <RefreshCw size={11} aria-hidden="true" />
              Retry
            </Button>
          )}

          {/* Pause/resume toggle */}
          <Switch
            size="sm"
            checked={!schedule.isPaused}
            onCheckedChange={(checked) => onTogglePause(schedule.id, !checked)}
            aria-label={
              schedule.isPaused
                ? `Resume ${schedule.actionLabel}`
                : `Pause ${schedule.actionLabel}`
            }
            disabled={globalPaused}
          />

          {/* Per-row stop — removes this schedule */}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className={cn(
              'h-6 w-6 p-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100',
              'text-gray-400 hover:bg-red-50 hover:text-[#EF4444]',
              'focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#EF4444] focus-visible:ring-offset-1',
            )}
            onClick={() => onKillIndividual(schedule.id)}
            aria-label={`Stop ${schedule.actionLabel} permanently`}
          >
            <OctagonX size={13} aria-hidden="true" />
          </Button>
        </div>
      </td>
    </motion.tr>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptySchedules() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
        <Zap className="size-5 text-gray-300" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-gray-900">No automations yet</p>
      <p className="mt-1.5 max-w-[260px] text-xs leading-relaxed text-gray-500">
        Your first scan will set these up. Accept a suggestion from your Inbox to create a
        schedule.
      </p>
    </div>
  )
}

// ─── Main client ──────────────────────────────────────────────────────────────

export function AutomationClient({ status }: AutomationClientProps) {
  const [globalKill, setGlobalKill] = React.useState(status.globalKillSwitch)
  const [killPending, setKillPending] = React.useState(false)
  const [schedules, setSchedules] = React.useState<ScheduleWithStatus[]>(() =>
    status.schedules.map((s) => ({
      ...s,
      runStatus: (s.isPaused ? 'paused' : 'running') as RunStatus,
      triggerLabel: 'On schedule',
    })),
  )

  const activeCount = schedules.filter((s) => !s.isPaused && !globalKill).length
  const errorCount = schedules.filter((s) => s.runStatus === 'error').length
  const creditPct = Math.min(100, status.creditsUsedPercent)

  function handleKillToggle(checked: boolean) {
    if (checked) {
      setKillPending(true)
    } else {
      setGlobalKill(false)
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
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, isPaused: paused, runStatus: (paused ? 'paused' : 'running') as RunStatus }
          : s,
      ),
    )
  }

  function handleChangeCadence(id: string, cadence: Cadence) {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, cadence } : s)))
  }

  function handleKillIndividual(id: string) {
    setSchedules((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {/* ── Page header ── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Automation</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {globalKill ? (
              'All automation is paused'
            ) : errorCount > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <AlertCircle size={13} className="text-[#EF4444]" aria-hidden="true" />
                {activeCount} active
                <span className="text-gray-300">·</span>
                <span className="text-[#EF4444]">
                  {errorCount} error{errorCount !== 1 ? 's' : ''}
                </span>
              </span>
            ) : (
              `${activeCount} active schedule${activeCount !== 1 ? 's' : ''}`
            )}
          </p>
        </div>

        {/* Kill switch — prominent, destructive styling */}
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors duration-200',
            globalKill
              ? 'border-red-200 bg-red-50'
              : 'border-gray-200 bg-gray-50 hover:border-red-200 hover:bg-red-50/40',
          )}
        >
          <Switch
            checked={globalKill}
            onCheckedChange={handleKillToggle}
            aria-label={
              globalKill ? 'Re-enable all automation' : 'Pause all automation'
            }
            className="data-[state=checked]:bg-[#EF4444]"
          />
          <span
            className={cn(
              'text-xs font-medium transition-colors duration-150',
              globalKill ? 'text-[#EF4444]' : 'text-gray-600',
            )}
          >
            {globalKill ? 'Automation paused' : 'Pause all'}
          </span>
          <AnimatePresence>
            {globalKill && (
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-[#EF4444]"
              >
                OFF
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Credit usage bar ── */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white px-4 py-3.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">AI runs this month</span>
          <span className="tabular-nums text-xs text-gray-500">
            {status.creditsUsedThisMonth} / {status.creditsCapThisMonth}
          </span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <motion.div
            className={cn(
              'h-full rounded-full',
              creditPct >= 90
                ? 'bg-[#EF4444]'
                : creditPct >= 75
                  ? 'bg-[#F59E0B]'
                  : 'bg-[#3370FF]',
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

      {/* ── Schedules table ── */}
      {schedules.length === 0 ? (
        <EmptySchedules />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] table-fixed border-collapse">
              <colgroup>
                <col className="w-[35%]" />
                <col className="hidden w-[20%] sm:table-column" />
                <col className="hidden w-[15%] sm:table-column" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th
                    scope="col"
                    className="py-2.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 sm:pl-6"
                  >
                    Agent
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-2.5 text-left text-xs font-medium text-gray-500 sm:table-cell"
                  >
                    Frequency
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-2.5 text-left text-xs font-medium text-gray-500 sm:table-cell"
                  >
                    Last run
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-medium text-gray-500"
                  >
                    Status
                  </th>
                  <th scope="col" className="py-2.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Controls</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {schedules.map((schedule, index) => (
                    <ScheduleRow
                      key={schedule.id}
                      schedule={schedule}
                      globalPaused={globalKill}
                      onTogglePause={handleTogglePause}
                      onChangeCadence={handleChangeCadence}
                      onKillIndividual={handleKillIndividual}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Kill switch confirm modal ── */}
      <KillSwitchConfirm
        open={killPending}
        onConfirm={handleKillConfirm}
        onCancel={handleKillCancel}
      />
    </main>
  )
}

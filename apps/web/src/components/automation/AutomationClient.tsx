'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarClock, Zap, PauseCircle, PlayCircle } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

function formatRelativeDate(iso: string | null): string {
  if (!iso) return 'Never'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(iso))
}

interface ScheduleCardProps {
  schedule: AutomationSchedule
  globalPaused: boolean
  onTogglePause: (id: string, paused: boolean) => void
  onChangeCadence: (id: string, cadence: Cadence) => void
}

function ScheduleCard({ schedule, globalPaused, onTogglePause, onChangeCadence }: ScheduleCardProps) {
  const effectivelyPaused = globalPaused || schedule.isPaused

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: effectivelyPaused ? 0.55 : 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]',
        effectivelyPaused && 'pointer-events-none select-none',
      )}
      style={{ pointerEvents: effectivelyPaused ? 'none' : 'auto' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">{schedule.actionLabel}</p>

          {/* Cadence select */}
          <div className="mt-2.5">
            <Select
              defaultValue={schedule.cadence}
              onValueChange={(v) => onChangeCadence(schedule.id, v as Cadence)}
              disabled={effectivelyPaused}
            >
              <SelectTrigger size="sm" className="h-7 w-auto gap-1 border-gray-200 bg-gray-50 px-2 text-xs">
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
          </div>

          {/* Date row */}
          <div className="mt-3 flex flex-col gap-0.5 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-3 shrink-0 text-gray-400" />
              Next: {formatRelativeDate(schedule.nextRunAt)}
            </span>
            <span className="text-xs text-gray-400">
              Last: {formatRelativeDate(schedule.lastRunAt)}
            </span>
          </div>
        </div>

        {/* Pause toggle */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
          <Switch
            size="sm"
            checked={!schedule.isPaused}
            onCheckedChange={(checked) => onTogglePause(schedule.id, !checked)}
            aria-label={schedule.isPaused ? 'Resume schedule' : 'Pause schedule'}
            disabled={globalPaused}
          />
          {schedule.isPaused ? (
            <PauseCircle className="size-3 text-gray-400" />
          ) : (
            <PlayCircle className="size-3 text-[#3370FF]" />
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Empty state for when all schedules are removed
function EmptySchedules() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
        <Zap className="size-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-900">No scheduled automations</p>
      <p className="mt-1 max-w-xs text-xs text-gray-500">
        Accept a suggestion from your inbox to create an automation schedule.
      </p>
    </div>
  )
}

export function AutomationClient({ status }: AutomationClientProps) {
  const [globalKill, setGlobalKill] = React.useState(status.globalKillSwitch)
  const [killPending, setKillPending] = React.useState(false)
  const [schedules, setSchedules] = React.useState<AutomationSchedule[]>(status.schedules)

  function handleKillToggle(checked: boolean) {
    if (checked) {
      // Turning ON the kill switch = pausing all — show confirm
      setKillPending(true)
    } else {
      // Re-enabling automation
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
      prev.map((s) => (s.id === id ? { ...s, isPaused: paused } : s)),
    )
  }

  function handleChangeCadence(id: string, cadence: Cadence) {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, cadence } : s)),
    )
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

        {/* Kill switch */}
        <div className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <Switch
            checked={globalKill}
            onCheckedChange={handleKillToggle}
            aria-label={globalKill ? 'Re-enable all automation' : 'Pause all automation'}
            className="data-[state=checked]:bg-gray-700"
          />
          <span className="text-xs font-medium text-gray-700">
            {globalKill ? 'Automation paused' : 'Pause all'}
          </span>
          {globalKill && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
            >
              OFF
            </motion.span>
          )}
        </div>
      </div>

      {/* Credit usage bar */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white px-4 py-3.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">AI runs this month</span>
          <span className="tabular-nums text-xs text-gray-500">
            {status.creditsUsedThisMonth} / {status.creditsCapThisMonth}
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <motion.div
            className={cn(
              'h-full rounded-full',
              creditPct >= 90
                ? 'bg-red-500'
                : creditPct >= 75
                  ? 'bg-amber-400'
                  : 'bg-[#3370FF]',
            )}
            initial={{ width: 0 }}
            animate={{ width: `${creditPct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-400">
          {status.creditsCapThisMonth - status.creditsUsedThisMonth} runs remaining
        </p>
      </div>

      {/* Schedule cards */}
      {schedules.length === 0 ? (
        <EmptySchedules />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AnimatePresence>
            {schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                globalPaused={globalKill}
                onTogglePause={handleTogglePause}
                onChangeCadence={handleChangeCadence}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Kill switch confirm modal */}
      <KillSwitchConfirm
        open={killPending}
        onConfirm={handleKillConfirm}
        onCancel={handleKillCancel}
      />
    </main>
  )
}

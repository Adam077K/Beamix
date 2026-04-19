'use client'

import * as React from 'react'
import { Zap, Loader2, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { AutomationSchedule, AgentType } from '@/lib/types/shared'

interface AddScheduleModalProps {
  open: boolean
  onClose: () => void
  onScheduleAdded: (schedule: AutomationSchedule) => void
  existingAgentTypes: AgentType[]
}

type FrequencyOption = {
  value: string
  label: string
}

type TriggerOption = {
  value: string
  label: string
}

const AGENT_OPTIONS: Array<{ value: AgentType; label: string; description: string }> = [
  {
    value: 'content_optimizer',
    label: 'Content Optimizer',
    description: 'Rewrites thin pages to rank in AI search.',
  },
  {
    value: 'performance_tracker',
    label: 'Performance Tracker',
    description: 'Monitors your AI visibility week over week.',
  },
  {
    value: 'freshness_agent',
    label: 'Freshness Agent',
    description: 'Flags and refreshes stale content automatically.',
  },
  {
    value: 'faq_builder',
    label: 'FAQ Builder',
    description: 'Generates structured FAQ pages from scan queries.',
  },
  {
    value: 'competitor_intelligence',
    label: 'Competitor Intel',
    description: 'Tracks how competitors rank in AI answers.',
  },
  {
    value: 'schema_optimizer',
    label: 'Schema Optimizer',
    description: 'Adds and corrects structured data markup.',
  },
  {
    value: 'blog_strategist',
    label: 'Blog Strategist',
    description: 'Plans content that directly answers AI queries.',
  },
]

const TRIGGER_OPTIONS: TriggerOption[] = [
  { value: 'scheduled', label: 'Scheduled (time-based)' },
  { value: 'on_new_scan', label: 'On new scan result' },
  { value: 'event_based', label: 'Event-based (competitor change)' },
]

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { value: 'daily', label: 'Every day at 09:00' },
  { value: 'weekly', label: 'Every Monday at 09:00' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'First of the month' },
]

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

export function AddScheduleModal({
  open,
  onClose,
  onScheduleAdded,
  existingAgentTypes,
}: AddScheduleModalProps) {
  const [agentType, setAgentType] = React.useState<AgentType | ''>('')
  const [trigger, setTrigger] = React.useState('scheduled')
  const [frequency, setFrequency] = React.useState('weekly')
  const [submitState, setSubmitState] = React.useState<SubmitState>('idle')
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  // Reset on open/close
  React.useEffect(() => {
    if (!open) {
      setAgentType('')
      setTrigger('scheduled')
      setFrequency('weekly')
      setSubmitState('idle')
      setErrorMsg(null)
    }
  }, [open])

  const selectedAgent = AGENT_OPTIONS.find((a) => a.value === agentType) ?? null
  const alreadyScheduled = agentType !== '' && existingAgentTypes.includes(agentType as AgentType)
  const canSubmit = agentType !== '' && submitState === 'idle'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setSubmitState('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/automation/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType,
          frequency,
          trigger,
          isEnabled: true,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error?.message ?? `Request failed (${res.status})`)
      }

      const data = await res.json()

      // Build optimistic schedule object
      const newSchedule: AutomationSchedule = {
        id: data.schedule?.id ?? `opt-${Date.now()}`,
        agentType: agentType as AgentType,
        actionLabel: selectedAgent?.label,
        cadence: frequency as AutomationSchedule['cadence'],
        nextRunAt: data.schedule?.next_run_at ?? new Date(Date.now() + 7 * 86_400_000).toISOString(),
        lastRunAt: null,
        isPaused: false,
        runHistory7: [],
        lastRunResult: null,
      }

      setSubmitState('success')
      // Brief success flash before closing
      setTimeout(() => {
        onScheduleAdded(newSchedule)
      }, 600)
    } catch (err) {
      setSubmitState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    }
  }

  function handleRetry() {
    setSubmitState('idle')
    setErrorMsg(null)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg border border-blue-200 bg-blue-50">
            <Zap className="size-5 text-[#3370FF]" strokeWidth={1.5} />
          </div>
          <DialogTitle className="text-base font-semibold text-gray-900">
            Add automation schedule
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Pick an agent, trigger, and how often it runs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-4">
          {/* Agent */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-agent" className="text-xs font-medium text-gray-700">
              Agent
            </Label>
            <Select
              value={agentType}
              onValueChange={(v) => setAgentType(v as AgentType)}
            >
              <SelectTrigger
                id="add-agent"
                className="h-9 text-sm border-gray-200"
              >
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {AGENT_OPTIONS.map((agent) => (
                  <SelectItem
                    key={agent.value}
                    value={agent.value}
                    className="text-sm"
                  >
                    {agent.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAgent && (
              <p className="text-[11px] text-gray-500 leading-relaxed">
                {selectedAgent.description}
              </p>
            )}
            {alreadyScheduled && (
              <p className="text-[11px] text-amber-600">
                This agent is already scheduled. Saving will update its settings.
              </p>
            )}
          </div>

          {/* Trigger */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-trigger" className="text-xs font-medium text-gray-700">
              Trigger
            </Label>
            <Select value={trigger} onValueChange={setTrigger}>
              <SelectTrigger id="add-trigger" className="h-9 text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-sm">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frequency (only when scheduled) */}
          {trigger === 'scheduled' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-frequency" className="text-xs font-medium text-gray-700">
                Frequency
              </Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger id="add-frequency" className="h-9 text-sm border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Error state */}
          {submitState === 'error' && errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <p className="text-xs text-red-700">{errorMsg}</p>
            </div>
          )}

          <DialogFooter className="mt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitState === 'loading'}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!canSubmit || submitState === 'loading' || submitState === 'success'}
              className={cn(
                'transition-all duration-150 active:scale-[0.98] focus-visible:ring-[#3370FF]',
                submitState === 'success'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-[#3370FF] text-white hover:bg-[#2860e8]',
              )}
              onClick={submitState === 'error' ? handleRetry : undefined}
            >
              {submitState === 'loading' && (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              )}
              {submitState === 'success' && (
                <CheckCircle2 className="size-3.5 mr-1.5" />
              )}
              {submitState === 'idle' && 'Save schedule'}
              {submitState === 'loading' && 'Saving…'}
              {submitState === 'success' && 'Saved'}
              {submitState === 'error' && 'Retry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

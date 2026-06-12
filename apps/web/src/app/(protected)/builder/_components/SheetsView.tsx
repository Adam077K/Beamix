'use client'

import { CalendarClock, Workflow as WorkflowIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { SavedWorkflow } from '@/lib/demo/surfaces'

/**
 * SheetsView — the bulk-run / parallel-orchestration grid.
 *
 * The ONE place /builder uses a table — and it is run-orchestration state, NOT
 * the Analytics Console's read-only metrics table. Each ROW = a saved workflow
 * (a parallel run target); columns carry schedule + last-run (Geist Mono
 * timestamps) + a per-stage status strip using the violet StageRow tokens.
 *
 * Every figure is Geist Mono tabular-nums. Violet marks agent work; blue stays
 * for your structure (never a violet button here).
 */

interface SheetsViewProps {
  savedWorkflows: SavedWorkflow[]
}

// A small, calm per-stage status strip — mirrors the StageRow status tokens.
type Tok = 'done' | 'running' | 'queued' | 'idle'

const STAGE_LABELS = ['plan', 'research', 'do', 'qa', 'sum'] as const

// Deterministic mock progress per row (design-only — no live runner).
function rowProgress(i: number): Tok[] {
  const patterns: Tok[][] = [
    ['done', 'done', 'done', 'done', 'done'],
    ['done', 'done', 'running', 'queued', 'queued'],
    ['done', 'running', 'queued', 'queued', 'queued'],
    ['idle', 'idle', 'idle', 'idle', 'idle'],
  ]
  return patterns[i % patterns.length]
}

function StatusDot({ tok }: { tok: Tok }) {
  if (tok === 'done')
    return <span className="block h-2 w-2 rounded-full bg-[#6E56F0]" />
  if (tok === 'running')
    return (
      <span
        className="block h-2 w-2 rounded-full bg-[#6E56F0] motion-safe:animate-[scan-shimmer_1.5s_ease-in-out_infinite]"
        aria-hidden="true"
      />
    )
  if (tok === 'queued')
    return <span className="block h-2 w-2 rounded-full border border-[#C7BFF6]" />
  return <span className="block h-2 w-2 rounded-full border border-[#E5E7EB]" />
}

function formatTs(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SheetsView({ savedWorkflows }: SheetsViewProps) {
  return (
    <div className="card-console overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.08em] text-[#9CA3AF]">
            Run orchestration
          </p>
          <p className="mt-1.5 text-[14px] font-medium text-[#0A0A0A]">
            Your saved workflows
          </p>
        </div>
        <span className="font-[var(--font-mono)] text-[12px] tabular-nums text-[#9CA3AF]">
          {savedWorkflows.length} workflows
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-[#E5E7EB] hover:bg-transparent">
            <TableHead className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
              Workflow
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
              Stages
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
              Schedule
            </TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
              Last run
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {savedWorkflows.map((wf, i) => {
            const prog = rowProgress(i)
            return (
              <TableRow
                key={wf.name}
                className="border-[#F0F0F0] transition-colors hover:bg-[#F7F6F2]"
              >
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#EEEAFD] text-[#6E56F0]">
                      <WorkflowIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-[14px] font-medium text-[#0A0A0A]">
                      {wf.name}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-3.5">
                  <div className="flex items-center gap-2" aria-label="Stage progress">
                    {STAGE_LABELS.map((label, s) => (
                      <span
                        key={label}
                        className="flex flex-col items-center gap-1"
                        title={`${label}: ${prog[s]}`}
                      >
                        <StatusDot tok={prog[s]} />
                      </span>
                    ))}
                  </div>
                </TableCell>

                <TableCell className="py-3.5">
                  {wf.schedule ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-2.5 py-1">
                      <CalendarClock
                        className="h-3 w-3 text-[#3370FF]"
                        aria-hidden="true"
                      />
                      <span className="text-[12px] font-medium text-[#3370FF]">
                        {wf.schedule}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[12px] text-[#9CA3AF]">Manual only</span>
                  )}
                </TableCell>

                <TableCell
                  className={cn(
                    'py-3.5 text-right font-[var(--font-mono)] text-[13px] tabular-nums',
                    wf.lastRun ? 'text-[#6B7280]' : 'text-[#9CA3AF]',
                  )}
                >
                  {formatTs(wf.lastRun)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

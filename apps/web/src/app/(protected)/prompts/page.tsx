'use client'

/**
 * Prompt / Query Explorer — /prompts
 *
 * Console Spine surface #1 (internal-report, query_mapper, 5-stage pipeline).
 * Phase 1 = design + mock data only. ZERO backend calls.
 *
 * Zones:
 *   Zone 1: Context Header — tracked prompt count + sparkline stat
 *   Zone 2: Input Panel — seed / URL / custom instructions (pre-filled, editable)
 *   Zone 3: Run Control — ModeToggle + Run (query_mapper has no cap / no gate)
 *   Zone 4: PipelineLedger — 5-stage (plan→research→do→qa→summarize) while running
 *   Zone 5: Output — PromptTable (4 states: loading, empty, error, populated)
 *   Zone 6: History link
 *
 * SerifVerdict beat: appears in the populated output header.
 */

import { useState, useCallback } from 'react'
import { ToolPage } from '@/components/console/ToolPage'
import { ContextStat } from '@/components/console/ContextStat'
import { RunControl } from '@/components/console/RunControl'
import { PipelineLedger } from '@/components/console/PipelineLedger'
import { InputSummaryBar } from '@/components/console/InputSummaryBar'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import type { RunMode } from '@/components/console/ModeToggle'
import type { ToolPageState } from '@/components/console/ToolPage'
import type { StageState } from '@/components/console/pipeline-contract'
import { PromptTable, type PromptTableViewState } from './_components/PromptTable'
import { DEMO_PROMPTS } from '@/lib/demo/surfaces/prompts'
import { DEMO_BUSINESS } from '@/lib/demo/surfaces/types'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Static pipeline stages for query_mapper (plan→research→do→qa→summarize)
// ---------------------------------------------------------------------------

const INITIAL_STAGES: StageState[] = [
  { id: 'plan', label: 'Plan', status: 'queued' },
  { id: 'research', label: 'Research', status: 'queued' },
  { id: 'do', label: 'Map queries', status: 'queued' },
  { id: 'qa', label: 'QA', status: 'queued' },
  { id: 'summarize', label: 'Summarise', status: 'queued' },
]

// ---------------------------------------------------------------------------
// Simulated pipeline progression (mock — Phase 1, no real API)
// ---------------------------------------------------------------------------

function buildProgressionStages(step: number): StageState[] {
  return INITIAL_STAGES.map((s, i) => ({
    ...s,
    status:
      i < step ? 'done' : i === step ? 'active' : 'queued',
  }))
}

const SUBSTEPS_BY_STAGE: Record<number, string> = {
  0: 'Analysing business profile and seed keywords…',
  1: 'Fetching query volume signals from ChatGPT, Gemini, Perplexity…',
  2: 'Mapping fan-out clusters for teeth whitening, implants, emergency care…',
  3: 'Scoring citation gaps against competitor profiles…',
  4: 'Generating prompt intelligence summary…',
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PromptsPage() {
  // Page-level state
  const [toolState, setToolState] = useState<ToolPageState>('success')
  const [tableState, setTableState] = useState<PromptTableViewState>('populated')
  const [inputCollapsed, setInputCollapsed] = useState(true)

  // Run control
  const [runMode, setRunMode] = useState<RunMode>('myself')

  // Pipeline simulation (Phase 1: visual-only)
  const [pipelineStep, setPipelineStep] = useState<number>(0)
  const [clearingLedger, setClearingLedger] = useState(false)
  const [runInputSeed, setRunInputSeed] = useState('brightsmile-dental.co.il')
  const [runInputInstructions, setRunInputInstructions] = useState(
    'Focus on local dental queries in Ramat Gan and the Gush Dan area. Include Hebrew and English variations.',
  )

  // Simulate run
  const handleRun = useCallback(() => {
    if (toolState === 'running') return
    setToolState('running')
    setInputCollapsed(true)
    setPipelineStep(0)

    let step = 0
    const interval = window.setInterval(() => {
      step += 1
      if (step >= 5) {
        window.clearInterval(interval)
        // Start clearing the ledger → hand off to output
        setClearingLedger(true)
        return
      }
      setPipelineStep(step)
    }, 1200)
  }, [toolState])

  const handleLedgerCleared = useCallback(() => {
    setClearingLedger(false)
    setPipelineStep(0)
    setToolState('success')
    setTableState('populated')
  }, [])

  const handleRetry = useCallback(() => {
    setToolState('idle')
    setTableState('populated')
  }, [])

  const handleRunQueryMapper = useCallback(() => {
    setToolState('idle')
    setInputCollapsed(false)
  }, [])

  // Switch between demo states (for dev preview / QA)
  const cycleTableState = useCallback(() => {
    const states: PromptTableViewState[] = ['populated', 'loading', 'empty', 'error']
    setTableState((prev) => {
      const idx = states.indexOf(prev)
      return states[(idx + 1) % states.length]
    })
  }, [])

  // Stages
  const stages = buildProgressionStages(pipelineStep)
  const currentSubstep =
    toolState === 'running' ? (SUBSTEPS_BY_STAGE[pipelineStep] ?? null) : null

  // Input summary bar text
  const inputSummary = `${runInputSeed} · ChatGPT, Gemini, Perplexity`

  // Context stat values — from fixture sparkline
  const sparklinePoints: number[] = [...DEMO_PROMPTS.sparklinePoints]
  const trackedCount = DEMO_PROMPTS.rows.length

  // PromptTable verdict — used in the serif beat
  const coveredCount = DEMO_PROMPTS.rows.filter((r) => r.covered).length
  const gapCount = trackedCount - coveredCount
  const trendWord: string = gapCount < 3 ? 'strong' : 'growing'

  return (
    <ToolPage
      eyebrow={DEMO_BUSINESS.name}
      title="Prompt Explorer"
      whatThisDoes="See every query AI engines receive about your business, who's cited for each, and where your gaps are."
      contextStat={
        <ContextStat
          value={trackedCount}
          label="tracked prompts"
          sparklinePoints={sparklinePoints}
          currentScore={78}
        />
      }
      inputPanel={<InputPanel seed={runInputSeed} setSeed={setRunInputSeed} instructions={runInputInstructions} setInstructions={setRunInputInstructions} />}
      collapsedSummary={
        <InputSummaryBar summary={inputSummary} onExpand={() => setInputCollapsed(false)} />
      }
      inputCollapsed={inputCollapsed}
      onToggleInput={() => setInputCollapsed(false)}
      runControl={
        <RunControl
          mode={runMode}
          onModeChange={setRunMode}
          onRun={handleRun}
          runLabel="Run Query Mapper"
          runState="enabled"
          allotmentLabel="Query Mapper · uncapped"
          uncapped={true}
        />
      }
      ledger={
        <PipelineLedger
          stages={stages}
          agentLabel="Query Mapper"
          currentSubstep={currentSubstep}
          clearing={clearingLedger}
          onCleared={handleLedgerCleared}
        />
      }
      output={
        <PromptOutput
          tableState={tableState}
          trendWord={trendWord}
          onRunQueryMapper={handleRunQueryMapper}
          onRetry={handleRetry}
          onCycleState={cycleTableState}
        />
      }
      state={toolState}
      historyHref="/archive"
      widthMode="wide"
      rail={
        <CoverageRail
          tracked={trackedCount}
          covered={coveredCount}
          gap={gapCount}
        />
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Coverage rail (Zone "earn the width" — M3/M10)
//
// The dense table fills the working area in widthMode="wide"; the rail keeps the
// freed right space alive with persistent context instead of dead white (audit
// P1-1). Shows the covered-vs-gap split and the queries competitors own that you
// don't — the single "what to do next" signal beside the table.
// ---------------------------------------------------------------------------

interface CoverageRailProps {
  tracked: number
  covered: number
  gap: number
}

function CoverageRail({ tracked, covered, gap }: CoverageRailProps) {
  const coveredPct = tracked > 0 ? Math.round((covered / tracked) * 100) : 0
  const topGaps = DEMO_PROMPTS.uncitedGaps.slice(0, 4)

  return (
    <div className="flex flex-col gap-5">
      {/* Coverage split card */}
      <div className="card-inset px-5 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Coverage
        </p>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="font-[var(--font-mono)] text-[40px] leading-none tabular-nums tracking-[-0.02em] text-[#0A0A0A]">
            {covered}
          </span>
          <span className="font-[var(--font-mono)] text-[15px] tabular-nums text-[#9CA3AF]">
            / {tracked} covered
          </span>
        </div>

        {/* Split bar — covered (positive) vs gap (critical), glanceable */}
        <div
          className="mt-3 flex h-2 overflow-hidden rounded-full bg-[#F3F4F6]"
          role="img"
          aria-label={`${covered} of ${tracked} prompts covered, ${gap} gaps`}
        >
          <div
            className="h-full bg-[#0E9E6E]"
            style={{ width: `${coveredPct}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[12px]">
          <span className="inline-flex items-center gap-1.5 text-[#6B7280]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0E9E6E]" aria-hidden />
            Covered
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#6B7280]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" aria-hidden />
            {gap} gaps
          </span>
        </div>
      </div>

      {/* Top uncited gaps — competitors own these, you don't */}
      <div className="card-inset px-5 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Top gaps to close
        </p>
        <ul className="mt-3 flex flex-col gap-3">
          {topGaps.map((g) => (
            <li key={g.id} className="flex flex-col gap-1">
              <span className="text-[13px] font-medium leading-snug text-[#0A0A0A]">
                {g.query}
              </span>
              <span className="text-[11px] text-[#9CA3AF]">
                {g.volume} volume · owned by {g.ownedBy.join(', ')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Input panel
// ---------------------------------------------------------------------------

interface InputPanelProps {
  seed: string
  setSeed: (v: string) => void
  instructions: string
  setInstructions: (v: string) => void
}

function InputPanel({ seed, setSeed, instructions, setInstructions }: InputPanelProps) {
  return (
    <div className="flex flex-col gap-5 px-6 py-5">
      {/* Row 1: seed / URL */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="prompt-seed"
          className="text-[12px] font-semibold text-[#0A0A0A]"
        >
          Seed — website URL, keyword, or topic
        </label>
        <input
          id="prompt-seed"
          type="text"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="e.g. brightsmile-dental.co.il or teeth whitening"
          className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#0A0A0A] placeholder-[#9CA3AF] transition-colors focus:border-[#3370FF] focus:outline-none focus:ring-1 focus:ring-[#3370FF]"
        />
        <p className="text-[12px] text-[#9CA3AF]">
          Query Mapper expands this into a full cluster of AI search queries.
        </p>
      </div>

      {/* Row 2: custom instructions */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="prompt-instructions"
          className="text-[12px] font-semibold text-[#0A0A0A]"
        >
          Custom instructions{' '}
          <span className="font-normal text-[#9CA3AF]">(optional)</span>
        </label>
        <textarea
          id="prompt-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={2}
          placeholder="e.g. Focus on local queries in Ramat Gan, include Hebrew variations"
          className="w-full resize-none rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#0A0A0A] placeholder-[#9CA3AF] transition-colors focus:border-[#3370FF] focus:outline-none focus:ring-1 focus:ring-[#3370FF]"
        />
      </div>

      {/* Engines row */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-semibold text-[#0A0A0A]">
          Target engines
        </span>
        <div className="flex flex-wrap gap-2">
          {['ChatGPT', 'Gemini', 'Perplexity'].map((engine) => (
            <span
              key={engine}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12px] font-medium text-[#0A0A0A]"
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#0E9E6E]"
                aria-hidden="true"
              />
              {engine}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Prompt output (Zone 5 content)
// ---------------------------------------------------------------------------

interface PromptOutputProps {
  tableState: PromptTableViewState
  trendWord: string
  onRunQueryMapper: () => void
  onRetry: () => void
  onCycleState: () => void
}

function PromptOutput({
  tableState,
  trendWord,
  onRunQueryMapper,
  onRetry,
  onCycleState,
}: PromptOutputProps) {
  // For loading/empty/error states the table manages its own wrapper
  if (tableState !== 'populated') {
    return (
      <PromptTable
        viewState={tableState}
        onRunQueryMapper={onRunQueryMapper}
        onRetry={onRetry}
      />
    )
  }

  // Populated — table is inside a TIER-1 card (card-console-hero wraps come from
  // ToolPage Zone 5). We need to add the header inside.
  return (
    <div>
      {/* Output header — SerifVerdict beat at STEP-2 weight (M2/M5, one verdict
          per screen). Was rendered at 15px body grey, undersized vs the type
          contract (audit P2-2); now a 30px InterDisplay verdict line so the beat
          actually lands as the report headline. */}
      <div className="flex items-start justify-between gap-4 border-b border-[#F3F4F6] px-5 pb-5 pt-6">
        <div className="min-w-0">
          <p className="font-[var(--font-display)] text-[30px] font-medium leading-[1.15] tracking-[-0.02em] text-[#0A0A0A]">
            Your query landscape is{' '}
            <SerifVerdict>{trendWord}</SerifVerdict>.
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[#6B7280]">
            Run Query Mapper to expand it — every gap below is a query competitors
            already own.
          </p>
        </div>
        {/* Dev state cycle button — visible only in dev for QA review */}
        {process.env.NODE_ENV === 'development' && (
          <button
            type="button"
            onClick={onCycleState}
            className={cn(
              'shrink-0 rounded px-2 py-0.5 text-[11px] font-medium',
              'border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#6B7280]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]',
            )}
            aria-label="Cycle table state (dev only)"
          >
            Cycle state
          </button>
        )}
      </div>

      <PromptTable
        viewState={tableState}
        onRunQueryMapper={onRunQueryMapper}
        onRetry={onRetry}
      />
    </div>
  )
}

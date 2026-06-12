'use client'

/**
 * Schema Generator — /schema
 *
 * Console Spine surface #3: auto-publish, THREE_STEP pipeline (plan→do→qa),
 * requiresApproval=false, cap 20/day all tiers.
 *
 * Phase 1: design + full mock data. ZERO backend. All data from DEMO_SCHEMA.
 *
 * Zones (ToolPage):
 *   Zone 1 — ContextStat: "9/9 valid" + sparkline of last 5 validity scores
 *   Zone 2 — URL field + schema-type Select + customInstructions textarea
 *   Zone 3 — RunControl (mode toggle + Run button, cap=20, allotment line)
 *   Zone 4 — PipelineLedger (3 stages while running)
 *   Zone 5 — JsonLdPreview (success) | EmptyState | ErrorState
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { ToolPage, type ToolPageState } from '@/components/console/ToolPage'
import { ContextStat } from '@/components/console/ContextStat'
import { InputSummaryBar } from '@/components/console/InputSummaryBar'
import { RunControl } from '@/components/console/RunControl'
import type { RunState } from '@/components/console/RunControl'
import { PipelineLedger } from '@/components/console/PipelineLedger'
import type { StageState } from '@/components/console/pipeline-contract'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { SchemaContextRail } from './_components/SchemaContextRail'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { RunMode } from '@/components/console/ModeToggle'
import { DEMO_SCHEMA } from '@/lib/demo/surfaces/schema'
import { DEMO_BUSINESS } from '@/lib/demo/surfaces/types'
import { JsonLdPreview } from './_components/JsonLdPreview'

// ---------------------------------------------------------------------------
// Schema type options
// ---------------------------------------------------------------------------

const SCHEMA_TYPES = [
  { value: 'Dentist', label: 'Dentist' },
  { value: 'LocalBusiness', label: 'LocalBusiness' },
  { value: 'FAQ', label: 'FAQ Page' },
  { value: 'Service', label: 'Service' },
  { value: 'Product', label: 'Product' },
] as const

type SchemaTypeValue = typeof SCHEMA_TYPES[number]['value']

// ---------------------------------------------------------------------------
// Pipeline stages for schema_generator (THREE_STEP: plan → do → qa)
// ---------------------------------------------------------------------------

const INITIAL_STAGES: StageState[] = [
  { id: 'plan', label: 'Plan', status: 'queued' },
  { id: 'do', label: 'Generate', status: 'queued' },
  { id: 'qa', label: 'Validate', status: 'queued' },
]

// Stage substep copy for the live ledger stream
const STAGE_SUBSTEPS: Record<string, string[]> = {
  plan: [
    'Reading business profile for Bright Smile Dental…',
    'Identifying required fields for Dentist schema…',
    'Checking areaServed signals from prior scans…',
  ],
  do: [
    'Building JSON-LD structure…',
    'Populating address and geo coordinates…',
    'Adding acceptsInsurance, priceRange, and service list…',
    'Attaching openingHoursSpecification…',
    'Linking sameAs URLs from citation index…',
  ],
  qa: [
    'Validating 9 required fields…',
    'Cross-checking address consistency…',
    'Verifying schema.org vocabulary…',
    'Scoring completeness — 9/9 valid.',
  ],
}

// ---------------------------------------------------------------------------
// Error message variants
// ---------------------------------------------------------------------------

type ErrorVariant = 'cap-exhausted' | 'run-fail'

function getErrorProps(variant: ErrorVariant, onRetry: () => void) {
  if (variant === 'cap-exhausted') {
    return {
      title: 'Daily cap reached',
      description:
        "You've used all 20 schema runs for today. The cap resets at midnight — or let Beamix handle this on a schedule.",
      onRetry,
      retryLabel: 'Check again tomorrow',
    }
  }
  return {
    title: 'Schema generation failed',
    description:
      'The generator hit an issue building this schema. Double-check the URL is reachable and try again.',
    onRetry,
    retryLabel: 'Try again',
  }
}

// ---------------------------------------------------------------------------
// SchemaPage
// ---------------------------------------------------------------------------

export default function SchemaPage() {
  // — Input state
  const [url, setUrl] = useState('https://brightsmile-dental.co.il')
  const [schemaType, setSchemaType] = useState<SchemaTypeValue>('Dentist')
  const [customInstructions, setCustomInstructions] = useState('')

  // — Page state machine
  const [pageState, setPageState] = useState<ToolPageState>('idle')
  const [inputCollapsed, setInputCollapsed] = useState(false)

  // — Run mode
  const [runMode, setRunMode] = useState<RunMode>('myself')

  // — Cap state (demo: 3 of 20 used)
  const [runsToday, setRunsToday] = useState<number>(DEMO_SCHEMA.runsToday)
  const dailyCap = DEMO_SCHEMA.dailyCap

  // — Ledger state
  const [stages, setStages] = useState<StageState[]>(INITIAL_STAGES)
  const [currentSubstep, setCurrentSubstep] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

  // — Result / error state
  const [hasResult, setHasResult] = useState(false)
  const [errorVariant, setErrorVariant] = useState<ErrorVariant>('run-fail')

  // Refs for cleanup
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout)
    timerRefs.current = []
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  // Run state derivation
  const runState: RunState =
    runsToday >= dailyCap ? 'cap-exhausted' : 'enabled'

  // ---------------------------------------------------------------------------
  // Simulate a mock pipeline run
  // ---------------------------------------------------------------------------
  const startRun = useCallback(() => {
    if (runState === 'cap-exhausted') {
      setErrorVariant('cap-exhausted')
      setPageState('error')
      return
    }

    clearTimers()

    // Reset ledger
    setStages(INITIAL_STAGES.map((s) => ({ ...s, status: 'queued' as const })))
    setCurrentSubstep(null)
    setClearing(false)
    setPageState('running')
    setInputCollapsed(false)

    const schedule: { delay: number; action: () => void }[] = []
    let cursor = 0

    // Helper to queue a timer
    const at = (delay: number, action: () => void) => {
      schedule.push({ delay, action })
    }

    // Stage: plan
    at(400, () => {
      setStages((prev) =>
        prev.map((s) => (s.id === 'plan' ? { ...s, status: 'active' } : s)),
      )
    })
    STAGE_SUBSTEPS.plan.forEach((substep, i) => {
      at(700 + i * 900, () => setCurrentSubstep(substep))
    })
    at(700 + STAGE_SUBSTEPS.plan.length * 900 + 400, () => {
      setStages((prev) =>
        prev.map((s) => (s.id === 'plan' ? { ...s, status: 'done' } : s)),
      )
    })
    cursor = 700 + STAGE_SUBSTEPS.plan.length * 900 + 600

    // Stage: do
    at(cursor, () => {
      setStages((prev) =>
        prev.map((s) => (s.id === 'do' ? { ...s, status: 'active' } : s)),
      )
    })
    STAGE_SUBSTEPS.do.forEach((substep, i) => {
      at(cursor + 400 + i * 850, () => setCurrentSubstep(substep))
    })
    const doEnd = cursor + 400 + STAGE_SUBSTEPS.do.length * 850 + 500
    at(doEnd, () => {
      setStages((prev) =>
        prev.map((s) => (s.id === 'do' ? { ...s, status: 'done' } : s)),
      )
    })
    cursor = doEnd + 300

    // Stage: qa
    at(cursor, () => {
      setStages((prev) =>
        prev.map((s) => (s.id === 'qa' ? { ...s, status: 'active' } : s)),
      )
    })
    STAGE_SUBSTEPS.qa.forEach((substep, i) => {
      at(cursor + 300 + i * 700, () => setCurrentSubstep(substep))
    })
    const qaEnd = cursor + 300 + STAGE_SUBSTEPS.qa.length * 700 + 400
    at(qaEnd, () => {
      setStages((prev) =>
        prev.map((s) => (s.id === 'qa' ? { ...s, status: 'done' } : s)),
      )
      setCurrentSubstep(null)
    })

    // Clear animation → hand off to Zone 5
    at(qaEnd + 600, () => setClearing(true))

    // All timers registered — fire them
    schedule.forEach(({ delay, action }) => {
      const t = setTimeout(action, delay)
      timerRefs.current.push(t)
    })
  }, [runState, clearTimers])

  // Called when PipelineLedger completion animation finishes
  const handleCleared = useCallback(() => {
    setRunsToday((n) => Math.min(n + 1, dailyCap))
    setHasResult(true)
    setPageState('success')
    setInputCollapsed(true)
  }, [dailyCap])

  // Error retry
  const handleRetry = useCallback(() => {
    setPageState('idle')
    setErrorVariant('run-fail')
  }, [])

  // Toggle input back open
  const handleToggleInput = useCallback(() => {
    setInputCollapsed(false)
  }, [])

  // ---------------------------------------------------------------------------
  // Collapsed summary for the input bar
  // ---------------------------------------------------------------------------
  const collapsedSummary = (
    <InputSummaryBar
      summary={`${url} · ${schemaType}`}
      onExpand={handleToggleInput}
    />
  )

  // ---------------------------------------------------------------------------
  // Zone 1 — ContextStat (tell #1 / M10: the hero is a VALUE signal, never the cap)
  //
  // The one STEP-1 figure on the screen is the standing schema-coverage signal
  // ("9/9 VALID") carried over from the last run — not the rate-limit quota.
  // In idle it shows the most recent result's validity; in success it shows the
  // fresh run's validity. The quota is stated exactly once, quietly, in the rail.
  // ---------------------------------------------------------------------------
  const result = DEMO_SCHEMA.results[0]
  const historyPoints: number[] = [...DEMO_SCHEMA.validityHistory]

  // The last completed run's validity is real prior data — show it standing in
  // idle so the sparkline draws in band color (tell #4) instead of a bare number.
  const lastValidityScore = historyPoints[historyPoints.length - 1] // 100
  const currentValidityScore = lastValidityScore

  // STEP-1 figure: valid-field ratio (value), never "RUNS LEFT" (the cap).
  const heroValue = '9/9'
  const heroLabel = hasResult ? 'VALID FIELDS' : 'VALID · LAST RUN'

  const contextStat = (
    <ContextStat
      value={heroValue}
      label={heroLabel}
      sparklinePoints={historyPoints}
      currentScore={currentValidityScore}
    />
  )

  // ---------------------------------------------------------------------------
  // Zone 2 — Input Panel
  // ---------------------------------------------------------------------------
  const inputPanel = (
    <div className="px-6 py-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_200px]">
        {/* URL field — dominant left column */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="schema-url"
            className="text-[13px] font-medium text-[#0A0A0A]"
          >
            Page URL
          </Label>
          <Input
            id="schema-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-site.com/page"
            aria-label="URL to generate schema for"
          />
          <p className="text-[12px] text-[#9CA3AF]">
            The page the schema describes — usually your homepage or a service page.
          </p>
        </div>

        {/* Schema type — narrow right rail */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="schema-type"
            className="text-[13px] font-medium text-[#0A0A0A]"
          >
            Schema type
          </Label>
          <Select
            value={schemaType}
            onValueChange={(v) => setSchemaType(v as SchemaTypeValue)}
          >
            <SelectTrigger id="schema-type" aria-label="Schema type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {SCHEMA_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Custom instructions — optional, full width */}
      <div className="mt-4 flex flex-col gap-1.5">
        <Label
          htmlFor="schema-instructions"
          className="text-[13px] font-medium text-[#0A0A0A]"
        >
          Custom instructions{' '}
          <span className="font-normal text-[#9CA3AF]">(optional)</span>
        </Label>
        <Textarea
          id="schema-instructions"
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          placeholder="e.g. Include acceptsInsurance: true and areaServed for Ramat Gan and Tel Aviv"
          rows={2}
          className="resize-none"
          aria-label="Custom instructions for the schema generator"
        />
      </div>
      {/* NOTE (tell #7 / M12): the quota is stated exactly ONCE, quietly, in the
          context rail (SchemaContextRail). It is deliberately NOT repeated here —
          the input panel is about WHAT to run, not how much budget is left. */}
    </div>
  )

  // ---------------------------------------------------------------------------
  // Zone 3 — RunControl
  // ---------------------------------------------------------------------------
  const allotmentLabel =
    runMode === 'beamix'
      ? 'Beamix runs this weekly · 6 of 10 autonomous runs left'
      : `${dailyCap - runsToday} runs left today`

  const runControl = (
    <RunControl
      mode={runMode}
      onModeChange={setRunMode}
      onRun={startRun}
      runLabel="Generate Schema"
      runState={runState}
      allotmentLabel={allotmentLabel}
    />
  )

  // ---------------------------------------------------------------------------
  // Zone 4 — PipelineLedger
  // ---------------------------------------------------------------------------
  const ledger = (
    <PipelineLedger
      stages={stages}
      agentLabel="Schema Generator"
      currentSubstep={currentSubstep}
      clearing={clearing}
      onCleared={handleCleared}
    />
  )

  // ---------------------------------------------------------------------------
  // Zone 5 — Output routing
  // ---------------------------------------------------------------------------
  let output: React.ReactNode = null

  if (pageState === 'success' && hasResult) {
    output = (
      <JsonLdPreview
        jsonLd={result.jsonLd}
        schemaType={result.schemaType}
        validityScore={result.validityScore}
        missingFields={result.missingFields}
        published={result.published}
        publishedAt={result.publishedAt ?? null}
        publishTarget={result.publishTarget}
        url={result.url}
        onInject={() => {
          // In a real implementation this opens the publishing integration flow
          alert('Inject via publishing integration')
        }}
      />
    )
  }
  // NOTE (tell #3 / M1/M10): in IDLE there is NO standalone below-fold EmptyState.
  // The expanded, pre-primed input panel + the run control + the context rail ARE
  // the empty state — one coherent focal that composes top-to-fold. A second
  // "start here" card under the run button (the old EmptyState) created two
  // competing CTAs and a dead 40% band. The EmptyState template is reserved for
  // the genuinely-empty `pageState === 'empty'` route below.
  else if (pageState === 'empty') {
    output = (
      <EmptyState
        glyph={
          // Structured-data glyph — a code bracket with a schema.org mark
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF4FF]"
            aria-hidden="true"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Angle brackets */}
              <path
                d="M8 9 L3 14 L8 19"
                stroke="#3370FF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 9 L25 14 L20 19"
                stroke="#3370FF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Slash */}
              <line
                x1="16"
                y1="7"
                x2="12"
                y2="21"
                stroke="#3370FF"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
          </div>
        }
        title="Pick a page and a type"
        description="Enter the URL of the page you want to describe, choose a schema type, and run. Your structured data is auto-published — no approval needed."
        action={
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button
              variant="default"
              size="default"
              onClick={startRun}
              disabled={runState === 'cap-exhausted'}
            >
              Generate Dentist Schema
            </Button>
            <button
              type="button"
              className="text-[13px] text-[#6B7280] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
              onClick={() =>
                window.open('https://schema.org/Dentist', '_blank', 'noopener')
              }
            >
              Browse schema.org types
            </button>
          </div>
        }
      />
    )
  } else if (pageState === 'error') {
    const errorProps = getErrorProps(errorVariant, handleRetry)
    output = (
      <ErrorState
        title={errorProps.title}
        description={errorProps.description}
        onRetry={errorProps.onRetry}
        retryLabel={errorProps.retryLabel}
      />
    )
  }

  // State routing. In IDLE the page composes top-to-fold with NO Zone 5 output
  // (the input+run+rail is the focal). 'idle' maps to 'empty' only so the
  // ToolPage chrome stays in the pre-run shape; output is null, so Zone 5 is
  // simply absent — no dead band, no second CTA (tell #3).
  const effectiveState: ToolPageState =
    pageState === 'idle' ? 'empty' : pageState

  // "Earn the width" rail (tell #3 / M3/M10): the freed right column carries live
  // standing context — last validity verdict (with the one Fraunces beat, tell
  // #6), where it published, and the single quiet quota line (tell #7). Only in
  // the pre-run states; once a fresh result fills Zone 5 the rail steps aside so
  // the TIER-1 output owns the screen.
  const showRail = pageState === 'idle' || pageState === 'empty'
  const rail = showRail ? (
    <SchemaContextRail
      lastValidityScore={lastValidityScore}
      lastSchemaType={result.schemaType}
      publishTarget={result.publishTarget ?? null}
      publishedAt={result.publishedAt ?? null}
      runsToday={runsToday}
      dailyCap={dailyCap}
    />
  ) : undefined

  return (
    <ToolPage
      eyebrow={DEMO_BUSINESS.name}
      title="Schema Generator"
      whatThisDoes="Generate valid JSON-LD structured data — auto-published to your site. Free, 20 runs/day."
      contextStat={contextStat}
      inputPanel={inputPanel}
      collapsedSummary={collapsedSummary}
      inputCollapsed={inputCollapsed && pageState === 'success'}
      onToggleInput={handleToggleInput}
      runControl={runControl}
      ledger={ledger}
      output={output}
      state={effectiveState}
      rail={rail}
      historyHref="/archive"
    />
  )
}

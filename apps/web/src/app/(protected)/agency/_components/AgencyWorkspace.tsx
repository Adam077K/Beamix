'use client'

/**
 * AgencyWorkspace — the /agency client shell.
 *
 * Spine: the 5-zone Console ToolPage. The Generate tab IS the tool; Clients,
 * White-label, and Leads are supporting tabs reached after (M10).
 *
 * The narrative: ONE blue "Generate audit" button (you commissioning the work) →
 * a violet PipelineLedger (the agents doing it) → a branded audit (the result).
 * blue = you, violet = agents, made spatial across the whole flow.
 *
 * Phase 1B: design + mock only. The run is a timed simulation driven by the
 * DEMO_AGENCY.dryRunSteps fixture — ZERO backend. The PipelineLedger and the
 * pipeline-contract are the single seam where a real Inngest stream plugs in
 * later with zero UI change.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { ToolPage, type ToolPageState } from '@/components/console/ToolPage'
import { ContextStat } from '@/components/console/ContextStat'
import { InputSummaryBar } from '@/components/console/InputSummaryBar'
import { PipelineLedger } from '@/components/console/PipelineLedger'
import type { StageState } from '@/components/console/pipeline-contract'
import type { PipelineStage } from '@/lib/agents/types'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles } from 'lucide-react'
import { DEMO_AGENCY } from '@/lib/demo/surfaces/agency'
import { AuditReport } from './AuditReport'
import { ClientsTab } from './ClientsTab'
import { WhiteLabelTab } from './WhiteLabelTab'
import { LeadsTab } from './LeadsTab'

export type AgencyInitialState = ToolPageState

// ---------------------------------------------------------------------------
// Scope options
// ---------------------------------------------------------------------------

const SCOPE_OPTIONS = [
  { value: 'all', label: 'All engines' },
  { value: 'chatgpt', label: 'ChatGPT only' },
  { value: 'gemini', label: 'Gemini only' },
  { value: 'perplexity', label: 'Perplexity only' },
] as const

type ScopeValue = (typeof SCOPE_OPTIONS)[number]['value']

// ---------------------------------------------------------------------------
// Domain validation (Zod-shaped url check — design-only, no real submit)
// ---------------------------------------------------------------------------

const DOMAIN_RE = /^([a-z0-9-]+\.)+[a-z]{2,}$/i

function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .toLowerCase()
}

function isValidDomain(raw: string): boolean {
  return DOMAIN_RE.test(normalizeDomain(raw))
}

// ---------------------------------------------------------------------------
// Ledger stages — the 5 PipelineStage enum ids, labeled for the audit run.
// The 6 fixture dryRunSteps feed the live substep stream beneath the ledger.
// ---------------------------------------------------------------------------

const LEDGER_STAGES: { id: PipelineStage; label: string }[] = [
  { id: 'plan', label: 'Crawl domain' },
  { id: 'research', label: 'Run AI search scans' },
  { id: 'do', label: 'Map competitor set' },
  { id: 'qa', label: 'Audit schema + citations' },
  { id: 'summarize', label: 'Compile branded report' },
]

const INITIAL_STAGES: StageState[] = LEDGER_STAGES.map((s) => ({
  id: s.id,
  label: s.label,
  status: 'queued' as const,
}))

// Map each enum stage to one or two fixture substep detail lines.
const SUBSTEPS_BY_STAGE: Record<PipelineStage, string[]> = {
  plan: [DEMO_AGENCY.dryRunSteps[0].detail],
  research: [DEMO_AGENCY.dryRunSteps[1].detail],
  do: [DEMO_AGENCY.dryRunSteps[2].detail],
  qa: [DEMO_AGENCY.dryRunSteps[3].detail, DEMO_AGENCY.dryRunSteps[4].detail],
  summarize: [DEMO_AGENCY.dryRunSteps[5].detail],
}

type Tab = 'generate' | 'clients' | 'whitelabel' | 'leads'

interface AgencyWorkspaceProps {
  initialState: AgencyInitialState
}

export function AgencyWorkspace({ initialState }: AgencyWorkspaceProps) {
  const audit = DEMO_AGENCY.sampleAudit
  const activeWhiteLabel = DEMO_AGENCY.whiteLabel[0] ?? null

  // — Tab
  const [tab, setTab] = useState<Tab>('generate')

  // — Input
  const [domain, setDomain] = useState(
    initialState === 'success' || initialState === 'running' ? audit.prospectDomain : '',
  )
  const [scope, setScope] = useState<ScopeValue>('all')

  // — Page state machine
  const [pageState, setPageState] = useState<ToolPageState>(initialState)
  const [inputCollapsed, setInputCollapsed] = useState(initialState === 'success')

  // — Ledger
  const [stages, setStages] = useState<StageState[]>(() =>
    initialState === 'running'
      ? INITIAL_STAGES.map((s, i) => ({ ...s, status: i === 0 ? 'active' : 'queued' }))
      : INITIAL_STAGES,
  )
  const [currentSubstep, setCurrentSubstep] = useState<string | null>(
    initialState === 'running' ? SUBSTEPS_BY_STAGE.plan[0] : null,
  )
  const [clearing, setClearing] = useState(false)

  // — Result
  const [hasResult, setHasResult] = useState(initialState === 'success')
  const [toast, setToast] = useState<string | null>(null)

  const domainValid = isValidDomain(domain)

  // Timer cleanup
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([])
  const clearTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout)
    timerRefs.current = []
  }, [])
  useEffect(() => () => clearTimers(), [clearTimers])

  // ── Run simulation ──────────────────────────────────────────────────────
  const startRun = useCallback(() => {
    if (!domainValid) return
    clearTimers()

    setStages(INITIAL_STAGES.map((s) => ({ ...s, status: 'queued' as const })))
    setCurrentSubstep(null)
    setClearing(false)
    setHasResult(false)
    setPageState('running')
    setInputCollapsed(false)
    setTab('generate')

    const schedule: { delay: number; action: () => void }[] = []
    const at = (delay: number, action: () => void) => schedule.push({ delay, action })

    let cursor = 300
    for (const { id } of LEDGER_STAGES) {
      const startAt = cursor
      at(startAt, () => {
        setStages((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'active' } : s)))
      })
      const substeps = SUBSTEPS_BY_STAGE[id]
      substeps.forEach((sub, i) => {
        at(startAt + 300 + i * 850, () => setCurrentSubstep(sub))
      })
      const endAt = startAt + 300 + substeps.length * 850 + 350
      at(endAt, () => {
        setStages((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'done' } : s)))
      })
      cursor = endAt + 250
    }

    at(cursor, () => {
      setCurrentSubstep(null)
      setClearing(true)
    })

    schedule.forEach(({ delay, action }) => {
      timerRefs.current.push(setTimeout(action, delay))
    })
  }, [domainValid, clearTimers])

  const handleCleared = useCallback(() => {
    setHasResult(true)
    setPageState('success')
    setInputCollapsed(true)
  }, [])

  const handleShare = useCallback(() => {
    setToast('Audit ready — share link copied')
    window.setTimeout(() => setToast(null), 2600)
  }, [])

  const handleRetry = useCallback(() => {
    setPageState('idle')
    setHasResult(false)
  }, [])

  const handleToggleInput = useCallback(() => setInputCollapsed(false), [])

  const goGenerate = useCallback(() => {
    setTab('generate')
    setPageState('idle')
    setInputCollapsed(false)
  }, [])

  // ── Zone 1 — ContextStat ────────────────────────────────────────────────
  const contextStat = (
    <ContextStat
      value={hasResult ? audit.score : DEMO_AGENCY.clients.length}
      label={hasResult ? 'PROSPECT SCORE' : 'CLIENTS'}
      sparklinePoints={hasResult ? [9, 14, 22, 27, audit.score] : null}
      currentScore={hasResult ? audit.score : null}
    />
  )

  // ── Zone 2 — Input panel ──────────────────────────────────────────────────
  const inputPanel = (
    <div className="px-6 py-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_200px]">
        {/* Domain — dominant */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prospect-domain" className="text-[13px] font-medium text-[#0A0A0A]">
            Prospect domain
          </Label>
          <Input
            id="prospect-domain"
            type="text"
            inputMode="url"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && domainValid) startRun()
            }}
            placeholder="prospect.com"
            aria-label="Prospect domain to audit"
            aria-invalid={domain.length > 0 && !domainValid}
          />
          <p className="text-[12px] text-[#9CA3AF]">
            {domain.length > 0 && !domainValid
              ? 'Enter a valid domain, e.g. prospect.com'
              : 'Any competitor or prospect domain — we run the full GEO audit.'}
          </p>
        </div>

        {/* Scope — narrow rail */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="audit-scope" className="text-[13px] font-medium text-[#0A0A0A]">
            Scope
          </Label>
          <Select value={scope} onValueChange={(v) => setScope(v as ScopeValue)}>
            <SelectTrigger id="audit-scope" aria-label="Audit scope">
              <SelectValue placeholder="Engines" />
            </SelectTrigger>
            <SelectContent>
              {SCOPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  // ── Zone 3 — Run control (one blue focal) ────────────────────────────────
  const runControl =
    pageState === 'running' ? null : (
      <div className="flex flex-col gap-2">
        <Button
          variant="default"
          size="default"
          onClick={startRun}
          disabled={!domainValid}
          aria-label="Generate prospect audit"
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Generate audit
        </Button>
        <button
          type="button"
          onClick={() => setScope('all')}
          className="self-start text-[13px] text-[#6B7280] underline-offset-2 transition-colors hover:text-[#0A0A0A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
        >
          Use last scope
        </button>
      </div>
    )

  const ledger = (
    <PipelineLedger
      stages={stages}
      agentLabel="Audit crew"
      currentSubstep={currentSubstep}
      clearing={clearing}
      onCleared={handleCleared}
    />
  )

  // ── Zone 5 — output routing ───────────────────────────────────────────────
  let output: React.ReactNode = null
  if (pageState === 'success' && hasResult) {
    output = (
      <AuditReport
        audit={audit}
        whiteLabel={activeWhiteLabel}
        onShare={handleShare}
        onRerun={startRun}
      />
    )
  } else if (pageState === 'error') {
    output = (
      <ErrorState
        title="Couldn't reach that domain"
        description="We couldn't load that prospect's site. Check the URL is reachable, then run the audit again."
        onRetry={handleRetry}
        retryLabel="Retry"
      />
    )
  } else if (pageState === 'empty' || pageState === 'idle') {
    output = (
      <EmptyState
        illustration="scan"
        title="Audit any prospect in one run"
        description="Enter a prospect's domain above and press Generate. Your crew runs a full GEO audit across ChatGPT, Gemini, and Perplexity — then hands you a branded, shareable report."
        action={
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button
              variant="default"
              size="default"
              onClick={() => {
                if (!domain) setDomain('goldendental.co.il')
                document.getElementById('prospect-domain')?.focus()
              }}
            >
              Try a sample prospect
            </Button>
            <button
              type="button"
              onClick={() => setTab('clients')}
              className="text-[13px] text-[#6B7280] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
            >
              View client roster
            </button>
          </div>
        }
      />
    )
  }

  // ToolPage shows Zone 5 in all non-running states; idle maps to empty surface.
  const effectiveState: ToolPageState = pageState === 'idle' ? 'empty' : pageState

  const collapsedSummary = (
    <InputSummaryBar
      summary={`${domain || audit.prospectDomain} · ${
        SCOPE_OPTIONS.find((o) => o.value === scope)?.label ?? 'All engines'
      }`}
      onExpand={handleToggleInput}
    />
  )

  const tabTriggerClass = 'text-[14px]'

  return (
    <div className="relative">
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        {/* Tabs bar — active tab underline in blue */}
        <div className="mx-auto w-full max-w-[880px] px-4 pt-8 sm:px-6">
          <TabsList variant="underline">
            <TabsTrigger variant="underline" value="generate" className={tabTriggerClass}>
              Generate
            </TabsTrigger>
            <TabsTrigger variant="underline" value="clients" className={tabTriggerClass}>
              Clients
            </TabsTrigger>
            <TabsTrigger variant="underline" value="whitelabel" className={tabTriggerClass}>
              White-label
            </TabsTrigger>
            <TabsTrigger variant="underline" value="leads" className={tabTriggerClass}>
              Leads
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Generate — the ToolPage spine */}
        <TabsContent value="generate" className="mt-0">
          <ToolPage
            eyebrow="PITCH WORKSPACE"
            title="Generate a prospect audit"
            whatThisDoes="Enter any prospect's domain. Your crew runs a full GEO audit and hands you a branded, shareable report."
            contextStat={contextStat}
            inputPanel={inputPanel}
            collapsedSummary={collapsedSummary}
            inputCollapsed={inputCollapsed && pageState === 'success'}
            onToggleInput={handleToggleInput}
            runControl={runControl}
            ledger={ledger}
            output={output}
            state={effectiveState}
          />
        </TabsContent>

        {/* Supporting tabs — each in the same centered document register */}
        <TabsContent value="clients" className="mt-0">
          <div className="mx-auto w-full max-w-[880px] px-4 pb-16 pt-8 sm:px-6">
            <ClientsTab
              clients={DEMO_AGENCY.clients}
              whiteLabel={DEMO_AGENCY.whiteLabel}
              onGenerate={goGenerate}
            />
          </div>
        </TabsContent>

        <TabsContent value="whitelabel" className="mt-0">
          <div className="mx-auto w-full max-w-[880px] px-4 pb-16 pt-8 sm:px-6">
            <WhiteLabelTab clients={DEMO_AGENCY.clients} whiteLabel={DEMO_AGENCY.whiteLabel} />
          </div>
        </TabsContent>

        <TabsContent value="leads" className="mt-0">
          <div className="mx-auto w-full max-w-[880px] px-4 pb-16 pt-8 sm:px-6">
            <LeadsTab leads={DEMO_AGENCY.leads} onGenerate={goGenerate} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Success toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#0A0A0A] px-4 py-2 text-[13px] font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  )
}

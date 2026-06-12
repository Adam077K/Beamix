'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ToolPage, type ToolPageState } from '@/components/console/ToolPage'
import { ContextStat } from '@/components/console/ContextStat'
import { RunControl } from '@/components/console/RunControl'
import { InputSummaryBar } from '@/components/console/InputSummaryBar'
import { PipelineLedger } from '@/components/console/PipelineLedger'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { DiffEditor } from './DiffEditor'
import { DEMO_CONTENT } from '@/lib/demo/surfaces/content'
import { DEMO_BUSINESS } from '@/lib/demo/surfaces/types'
import type { RunMode } from '@/components/console/ModeToggle'
import type { RunState } from '@/components/console/RunControl'
import type { StageState } from '@/components/console/pipeline-contract'
import type { ContentDoc } from '@/lib/demo/surfaces/types'
import { SerifVerdict } from '@/components/console/SerifVerdict'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ContentTab = 'optimize' | 'refresh' | 'faq'

type ErrorKind =
  | 'run-failed'
  | 'page-lock-conflict'
  | 'cap-exhausted'
  | 'network'

interface TabConfig {
  id: ContentTab
  label: string
  agentType: 'content_optimizer' | 'freshness_agent' | 'faq_builder'
  agentLabel: string
  requiresPageLock: boolean
  isCapped: boolean
  dailyCap: number
  stageCount: 5 | 3
}

// ---------------------------------------------------------------------------
// Tab configuration — derived from registry
// ---------------------------------------------------------------------------

const TAB_CONFIG: Record<ContentTab, TabConfig> = {
  optimize: {
    id: 'optimize',
    label: 'Optimize',
    agentType: 'content_optimizer',
    agentLabel: 'Content Optimizer',
    requiresPageLock: true,
    isCapped: false,
    dailyCap: 0,
    stageCount: 5,
  },
  refresh: {
    id: 'refresh',
    label: 'Refresh',
    agentType: 'freshness_agent',
    agentLabel: 'Freshness Agent',
    requiresPageLock: true,
    isCapped: false,
    dailyCap: 0,
    stageCount: 5,
  },
  faq: {
    id: 'faq',
    label: 'FAQ',
    agentType: 'faq_builder',
    agentLabel: 'FAQ Builder',
    requiresPageLock: false,
    isCapped: true,
    // Discover plan: 3/day
    dailyCap: 3,
    stageCount: 3,
  },
}

// ---------------------------------------------------------------------------
// Stage shapes per tab
// ---------------------------------------------------------------------------

function getFiveStageInitial(agentLabel: string): StageState[] {
  return [
    { id: 'plan', label: 'Plan', status: 'queued' },
    { id: 'research', label: `Research ${agentLabel === 'Content Optimizer' ? 'competitors' : 'content gaps'}`, status: 'queued' },
    { id: 'do', label: 'Write draft', status: 'queued' },
    { id: 'qa', label: 'QA review', status: 'queued' },
    { id: 'summarize', label: 'Summarize', status: 'queued' },
  ]
}

function getThreeStageInitial(): StageState[] {
  return [
    { id: 'plan', label: 'Plan FAQ structure', status: 'queued' },
    { id: 'do', label: 'Generate answers', status: 'queued' },
    { id: 'qa', label: 'QA review', status: 'queued' },
  ]
}

// ---------------------------------------------------------------------------
// Demo stage runner — simulated pipeline progress
// ---------------------------------------------------------------------------

function runDemoStages(
  tab: ContentTab,
  onUpdate: (stages: StageState[], substep: string | null) => void,
  onComplete: () => void,
): () => void {
  const config = TAB_CONFIG[tab]

  let cancelled = false
  const timeouts: ReturnType<typeof setTimeout>[] = []

  const t = (fn: () => void, ms: number) => {
    if (cancelled) return
    const id = setTimeout(() => {
      if (!cancelled) fn()
    }, ms)
    timeouts.push(id)
  }

  const substepsByTab: Record<ContentTab, string[][]> = {
    optimize: [
      ['Analyzing page structure…', 'Identifying content gaps…'],
      ['Scanning competitor pages…', 'Extracting ranking signals…'],
      ['Writing optimized H1…', 'Adding FAQ block…', 'Inserting local price data…'],
      ['Checking GEO signals…', 'Verifying citations…'],
      ['Building summary…'],
    ],
    refresh: [
      ['Checking freshness score…', 'Identifying stale sections…'],
      ['Pulling latest stats…', 'Verifying competitor updates…'],
      ['Updating introduction…', 'Refreshing pricing info…', 'Adding new FAQ answers…'],
      ['Checking GEO signals…', 'Verifying factual claims…'],
      ['Building summary…'],
    ],
    faq: [
      ['Analyzing top queries…', 'Structuring FAQ format…'],
      ['Generating answer 1 of 3…', 'Generating answer 2 of 3…', 'Generating answer 3 of 3…'],
      ['Checking YMYL compliance…', 'Verifying accuracy…'],
    ],
  }

  const tabSubsteps = substepsByTab[tab]
  let cursor = 0

  function advanceStage(stageIdx: number) {
    const currentStages = config.stageCount === 5
      ? getFiveStageInitial(config.agentLabel)
      : getThreeStageInitial()

    // Mark all previous done, current active, rest queued
    const updated = currentStages.map((s, i) => ({
      ...s,
      status: i < stageIdx ? 'done' : i === stageIdx ? 'active' : 'queued',
    } as StageState))

    const substepList = tabSubsteps[stageIdx] ?? []
    const substep = substepList[0] ?? null
    onUpdate(updated, substep)

    // Cycle through substeps
    substepList.slice(1).forEach((sub, si) => {
      t(() => {
        if (!cancelled) onUpdate(updated, sub)
      }, (si + 1) * 900)
    })
  }

  const stageCount = config.stageCount
  const stageDurations = config.stageCount === 5
    ? [1400, 2200, 2800, 1800, 800]
    : [1200, 2600, 1600]

  // Kick off stage 0 immediately
  advanceStage(0)
  cursor = stageDurations[0] ?? 1400

  for (let i = 1; i < stageCount; i++) {
    const idx = i
    const delay = cursor
    t(() => advanceStage(idx), delay)
    cursor += stageDurations[idx] ?? 1400
  }

  // Complete
  t(() => {
    // All done
    const finalStages = (config.stageCount === 5
      ? getFiveStageInitial(config.agentLabel)
      : getThreeStageInitial()
    ).map((s) => ({ ...s, status: 'done' as const }))
    onUpdate(finalStages, null)
    t(onComplete, 500)
  }, cursor)

  return () => {
    cancelled = true
    timeouts.forEach(clearTimeout)
  }
}

// ---------------------------------------------------------------------------
// ContentTabs — the main surface component
// ---------------------------------------------------------------------------

/**
 * ContentTabs — renders the full 5-zone ToolPage spine for the Content Editor.
 *
 * Manages all 4 states (empty / loading / success / error) across 3 tabs.
 * Tab switching resets state to empty per tab context.
 *
 * GATED: all agents require approval — the output always routes to /approvals.
 * PAGE-LOCK: shown inline in the input panel for content_optimizer + freshness_agent.
 */
export function ContentTabs() {
  const [activeTab, setActiveTab] = useState<ContentTab>('optimize')
  const [pageState, setPageState] = useState<ToolPageState>('empty')
  const [mode, setMode] = useState<RunMode>('myself')
  const [inputCollapsed, setInputCollapsed] = useState(false)

  // Per-tab selected doc
  const [selectedDocId, setSelectedDocId] = useState<Record<ContentTab, string | null>>({
    optimize: null,
    refresh: null,
    faq: null,
  })

  // Topic input for FAQ tab
  const [faqTopic, setFaqTopic] = useState('How much does teeth whitening cost in Ramat Gan?')

  // Custom instructions
  const [customInstructions, setCustomInstructions] = useState('')

  // Pipeline state
  const [stages, setStages] = useState<StageState[]>([])
  const [currentSubstep, setCurrentSubstep] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

  // Error state
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null)

  // FAQ cap (simulate 2 used of 3 for demo)
  const [faqUsedToday] = useState(2)

  const cancelRunRef = useRef<(() => void) | null>(null)

  const config = TAB_CONFIG[activeTab]
  const docs = DEMO_CONTENT.docs.filter((d) => d.tab === activeTab)
  const selectedId = selectedDocId[activeTab]
  const selectedDoc = docs.find((d) => d.id === selectedId) ?? null

  // Derive RunState
  const runState: RunState =
    config.isCapped && faqUsedToday >= config.dailyCap
      ? 'cap-exhausted'
      : 'enabled'

  // FAQ remaining
  const faqRemaining = Math.max(0, config.dailyCap - faqUsedToday)

  function handleTabChange(tab: ContentTab) {
    if (tab === activeTab) return
    cancelRunRef.current?.()
    cancelRunRef.current = null
    setActiveTab(tab)
    setPageState(tab === 'faq' ? 'idle' : selectedDocId[tab] ? 'idle' : 'empty')
    setInputCollapsed(false)
    setStages([])
    setCurrentSubstep(null)
    setClearing(false)
    setErrorKind(null)
  }

  function handleDocSelect(docId: string) {
    setSelectedDocId((prev) => ({ ...prev, [activeTab]: docId }))
    setPageState('idle')
    setInputCollapsed(false)
    setErrorKind(null)
  }

  function handleRun() {
    if (runState === 'cap-exhausted') return

    // Check page lock
    if (config.requiresPageLock && selectedDoc?.pageLocked) {
      setPageState('error')
      setErrorKind('page-lock-conflict')
      return
    }

    // Check doc selected (except FAQ where topic is used)
    if (activeTab !== 'faq' && !selectedDoc) return

    setPageState('running')
    setInputCollapsed(false)
    setErrorKind(null)

    const initialStages = config.stageCount === 5
      ? getFiveStageInitial(config.agentLabel)
      : getThreeStageInitial()
    setStages(initialStages)
    setCurrentSubstep(null)

    cancelRunRef.current = runDemoStages(
      activeTab,
      (updatedStages, substep) => {
        setStages(updatedStages)
        setCurrentSubstep(substep)
      },
      () => {
        setClearing(true)
      },
    )
  }

  function handleCleared() {
    setClearing(false)
    setInputCollapsed(true)
    setPageState('success')
  }

  function handleRetry() {
    setPageState('idle')
    setErrorKind(null)
    setInputCollapsed(false)
  }

  // Derive collapsed summary
  const collapsedSummary = useCallback(() => {
    if (activeTab === 'faq') {
      return (
        <InputSummaryBar
          summary={`FAQ: "${faqTopic.slice(0, 48)}${faqTopic.length > 48 ? '…' : ''}"`}
          onExpand={() => {
            setInputCollapsed(false)
            setPageState('idle')
          }}
        />
      )
    }
    if (!selectedDoc) return null
    return (
      <InputSummaryBar
        summary={`${selectedDoc.title.split('—')[0]?.trim() ?? selectedDoc.url}`}
        onExpand={() => {
          setInputCollapsed(false)
          setPageState('idle')
        }}
      />
    )
  }, [activeTab, faqTopic, selectedDoc])

  // Context stat: avg visibility score across tab's docs
  const tabDocs = DEMO_CONTENT.docs.filter((d) => d.tab === activeTab)
  const avgScore = tabDocs.length > 0
    ? Math.round(tabDocs.reduce((sum, d) => sum + d.visibilityScore, 0) / tabDocs.length)
    : null
  // M4: no real per-page run-history series exists in demo state. Pass null so the
  // foundation sparkline renders its designed baseline + endpoint dot — NEVER a
  // fabricated 5-point wiggle (CRAFT-SYSTEM tell #4 / "never fake data").
  const sparklinePoints = null

  // Lowest-scoring page in this tab = highest-opportunity target (real fixture
  // data, not fabricated). Drives the rail's verdict beat + opportunity callout.
  const opportunityDoc = tabDocs.length > 0
    ? tabDocs.reduce((lowest, d) => (d.visibilityScore < lowest.visibilityScore ? d : lowest), tabDocs[0])
    : null

  // What this does — per tab
  const whatThisDoes: Record<ContentTab, string> = {
    optimize: 'Rewrites a page to rank higher across AI search engines — adding local signals, FAQ blocks, and structured price data.',
    refresh: 'Updates stale pages with current stats, pricing, and fresher language so AI engines keep citing you.',
    faq: `Generates citation-ready FAQ answers for the queries your competitors rank for. ${config.isCapped ? `${faqRemaining} of ${config.dailyCap} runs left today.` : ''}`,
  }

  return (
    <ToolPage
      eyebrow={DEMO_BUSINESS.name}
      title="Content Editor"
      whatThisDoes={whatThisDoes[activeTab]}
      contextStat={
        <ContextStat
          value={avgScore ?? '—'}
          label="Avg visibility"
          sparklinePoints={sparklinePoints}
          currentScore={avgScore}
        />
      }
      inputPanel={
        <div>
          {/* Tab bar */}
          <div
            className="flex border-b border-[#E5E7EB] px-5 pt-4"
            role="tablist"
            aria-label="Content agent"
          >
            {(Object.keys(TAB_CONFIG) as ContentTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  '-mb-px mr-1 px-3 pb-3 pt-1 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                  activeTab === tab
                    ? 'border-b-2 border-[#3370FF] text-[#3370FF]'
                    : 'border-b-2 border-transparent text-[#6B7280] hover:text-[#0A0A0A]',
                )}
              >
                {TAB_CONFIG[tab].label}
                {tab === 'faq' && config.isCapped && (
                  <span className="ml-1.5 inline-flex h-4 items-center rounded-full bg-[#F3F4F6] px-1.5 font-[var(--font-mono)] text-[10px] tabular-nums text-[#6B7280]">
                    {faqRemaining}/{config.dailyCap}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-5 py-5">
            {activeTab === 'faq' ? (
              <FAQInputPanel
                topic={faqTopic}
                onTopicChange={setFaqTopic}
                customInstructions={customInstructions}
                onCustomInstructionsChange={setCustomInstructions}
                faqUsedToday={faqUsedToday}
                faqDailyCap={config.dailyCap}
              />
            ) : (
              <PageLockInputPanel
                tab={activeTab}
                docs={docs}
                selectedDocId={selectedId}
                onDocSelect={handleDocSelect}
                customInstructions={customInstructions}
                onCustomInstructionsChange={setCustomInstructions}
              />
            )}
          </div>
        </div>
      }
      collapsedSummary={collapsedSummary() ?? undefined}
      inputCollapsed={inputCollapsed}
      onToggleInput={() => {
        setInputCollapsed(false)
        setPageState('idle')
      }}
      runControl={
        <RunControl
          mode={mode}
          onModeChange={setMode}
          onRun={handleRun}
          runLabel={`Run ${config.agentLabel}`}
          runState={runState}
          allotmentLabel={
            config.isCapped
              ? `${config.agentLabel} runs this on request · ${faqRemaining} of ${config.dailyCap} runs left today`
              : 'Beamix runs this weekly · 6 of 10 autonomous runs left'
          }
          lockedTierCta={
            <Link
              href="/settings/billing"
              className="text-[13px] font-medium text-[#3370FF] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
            >
              Upgrade to unlock →
            </Link>
          }
        />
      }
      ledger={
        stages.length > 0 ? (
          <PipelineLedger
            stages={stages}
            agentLabel={config.agentLabel}
            currentSubstep={currentSubstep}
            clearing={clearing}
            onCleared={handleCleared}
          />
        ) : undefined
      }
      output={<OutputZone
        tab={activeTab}
        pageState={pageState}
        errorKind={errorKind}
        selectedDoc={selectedDoc}
        onRetry={handleRetry}
        config={config}
      />}
      state={pageState}
      historyHref="/archive"
      widthMode="wide"
      rail={
        <ContentContextRail
          tab={activeTab}
          docs={tabDocs}
          opportunityDoc={opportunityDoc}
          agentLabel={config.agentLabel}
          /* M5: at most ONE Fraunces beat per rendered screen. The FAQ success
             output already carries its beat ("Ready"); the rail beat is shown
             only where no other beat is present (idle / empty / running / error). */
          showBeat={pageState !== 'success'}
        />
      }
    />
  )
}

// ---------------------------------------------------------------------------
// ContentContextRail — "earn the width" live-context rail (M3/M10)
// ---------------------------------------------------------------------------

const SCORE_BANDS = [
  { min: 75, label: 'Excellent', text: '#06B6D4', bg: '#ECFEFF' },
  { min: 50, label: 'Good', text: '#10B981', bg: '#ECFDF5' },
  { min: 25, label: 'Fair', text: '#B8770B', bg: '#FDF3E0' },
  { min: 0, label: 'Critical', text: '#DC2626', bg: '#FDECEC' },
] as const

function bandFor(score: number) {
  return SCORE_BANDS.find((b) => score >= b.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1]
}

/**
 * ContentContextRail — fills the freed working area on wide viewports with REAL
 * context (the pages this agent can act on + their visibility bands), so the
 * lower/right canvas earns its space instead of reading half-finished
 * (CRAFT-SYSTEM tell #5 / P1-4). Stacks under the spine below lg.
 *
 * Carries the single Fraunces beat for the idle state (M5) — one verdict word
 * naming the band of the highest-opportunity page, inline in a sans sentence.
 * All numbers are Geist Mono tabular (M11).
 */
function ContentContextRail({
  tab,
  docs,
  opportunityDoc,
  agentLabel,
  showBeat,
}: {
  tab: ContentTab
  docs: ContentDoc[]
  opportunityDoc: ContentDoc | null
  agentLabel: string
  showBeat: boolean
}) {
  const isFaq = tab === 'faq'

  return (
    <div className="flex flex-col gap-4">
      {/* Opportunity verdict — the one Fraunces beat (M5) */}
      {showBeat && opportunityDoc && (
        <div className="card-inset px-4 py-4">
          <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Biggest opportunity
          </p>
          <p className="text-[14px] leading-relaxed text-[#374151]">
            {opportunityDoc.title.split('—')[0]?.trim()} is your{' '}
            <SerifVerdict>{bandFor(opportunityDoc.visibilityScore).label.toLowerCase()}</SerifVerdict>{' '}
            page — a{' '}
            <span className="font-[var(--font-mono)] tabular-nums text-[#0A0A0A]">
              {opportunityDoc.visibilityScore}
            </span>{' '}
            visibility score is where {agentLabel} makes the most difference.
          </p>
        </div>
      )}

      {/* Pages this agent can act on (real fixture rows, band-shaded) */}
      {!isFaq && docs.length > 0 && (
        <div className="card-inset px-4 py-4">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            {tab === 'optimize' ? 'Pages to optimize' : 'Stale pages'}
          </p>
          <ul className="flex flex-col gap-2.5">
            {docs.map((doc) => {
              const band = bandFor(doc.visibilityScore)
              return (
                <li key={doc.id} className="flex items-center gap-3">
                  <span
                    className="h-7 w-[3px] shrink-0 rounded-full"
                    style={{ backgroundColor: band.text }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[#374151]">
                    {doc.title.split('—')[0]?.trim()}
                  </span>
                  <span
                    className="font-[var(--font-mono)] text-[13px] tabular-nums"
                    style={{ color: band.text }}
                  >
                    {doc.visibilityScore}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* What a run produces — quiet "here's the payoff" affordance */}
      <div className="card-inset px-4 py-4">
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          What you&apos;ll get
        </p>
        <ul className="flex flex-col gap-2 text-[13px] leading-relaxed text-[#6B7280]">
          {(isFaq
            ? ['Citation-ready FAQ answers', 'Mapped to your scan-gap queries', 'Routed to approvals before publish']
            : ['A side-by-side content diff', 'Local signals + structured price data', 'Routed to approvals before publish']
          ).map((line) => (
            <li key={line} className="flex items-start gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              >
                <path d="M2.5 7L5.5 10L11.5 4" stroke="#3370FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/archive"
          className="mt-3 inline-flex text-[13px] font-medium text-[#3370FF] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
        >
          See previous runs →
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PageLockInputPanel — URL picker for optimize/refresh tabs
// ---------------------------------------------------------------------------

interface PageLockInputPanelProps {
  tab: ContentTab
  docs: ContentDoc[]
  selectedDocId: string | null
  onDocSelect: (id: string) => void
  customInstructions: string
  onCustomInstructionsChange: (v: string) => void
}

function PageLockInputPanel({
  tab,
  docs,
  selectedDocId,
  onDocSelect,
  customInstructions,
  onCustomInstructionsChange,
}: PageLockInputPanelProps) {
  const placeholder =
    tab === 'optimize'
      ? 'Pick a page to optimize…'
      : 'Pick a stale page to refresh…'

  return (
    <div className="flex flex-col gap-4">
      {/* Page picker */}
      <div>
        <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Target page
        </label>
        <div className="flex flex-col gap-2">
          {docs.length === 0 ? (
            <p className="text-[13px] text-[#6B7280]">{placeholder}</p>
          ) : (
            docs.map((doc) => (
              <DocSelectRow
                key={doc.id}
                doc={doc}
                selected={selectedDocId === doc.id}
                onSelect={() => onDocSelect(doc.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Page-lock info */}
      <div className="flex items-start gap-2 rounded-lg bg-[#EEEAFD] px-3 py-2.5">
        <div
          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#6E56F0]/20"
          aria-hidden="true"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <path
              d="M4 1.5V4M4 5.5h.01"
              stroke="#6E56F0"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="text-[12px] leading-relaxed text-[#4C3D9E]">
          This agent requires a{' '}
          <strong className="font-semibold">page lock</strong> — only one run per page at a time.
          If a run is already active on this page, the new run will be queued.
        </p>
      </div>

      {/* Custom instructions */}
      <CustomInstructionsField
        value={customInstructions}
        onChange={onCustomInstructionsChange}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// DocSelectRow — single page option in the picker
// ---------------------------------------------------------------------------

function DocSelectRow({
  doc,
  selected,
  onSelect,
}: {
  doc: ContentDoc
  selected: boolean
  onSelect: () => void
}) {
  const band = bandFor(doc.visibilityScore)

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group relative flex w-full items-center gap-3 overflow-hidden rounded-lg border px-3 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
        selected
          ? 'border-[#3370FF] bg-[#EEF2FF]'
          : 'border-[#E5E7EB] bg-white hover:border-[#C7D7FF] hover:bg-[#F8FAFF]',
      )}
    >
      {/* M7 left status-color hairline keyed to the visibility band */}
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: band.text }}
        aria-hidden="true"
      />

      {/* Selected indicator */}
      <div
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
          selected
            ? 'border-[#3370FF] bg-[#3370FF]'
            : 'border-[#D1D5DB] bg-white group-hover:border-[#3370FF]',
        )}
        aria-hidden="true"
      >
        {selected && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path
              d="M1.5 4L3.5 6L6.5 2.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Doc info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium text-[#0A0A0A]">
            {doc.title.split('—')[0]?.trim() ?? doc.title}
          </span>
          {doc.pageLocked && (
            <span className="shrink-0 rounded bg-[#FDF3E0] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#B8770B]">
              Locked
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate font-[var(--font-mono)] text-[11px] tabular-nums text-[#9CA3AF]">
          {doc.url}
        </p>
      </div>

      {/* Stats rail — M7 number-over-label: the band-colored score dominates,
          the label recedes. */}
      <div className="flex shrink-0 flex-col items-end gap-0 text-right">
        <span
          className="font-[var(--font-mono)] text-[17px] font-medium leading-none tabular-nums tracking-[-0.02em]"
          style={{ color: band.text }}
        >
          {doc.visibilityScore}
        </span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-[#9CA3AF]">
          visibility
        </span>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// FAQInputPanel — topic input for the FAQ Builder tab
// ---------------------------------------------------------------------------

interface FAQInputPanelProps {
  topic: string
  onTopicChange: (v: string) => void
  customInstructions: string
  onCustomInstructionsChange: (v: string) => void
  faqUsedToday: number
  faqDailyCap: number
}

function FAQInputPanel({
  topic,
  onTopicChange,
  customInstructions,
  onCustomInstructionsChange,
  faqUsedToday,
  faqDailyCap,
}: FAQInputPanelProps) {
  const capReached = faqUsedToday >= faqDailyCap
  const remaining = Math.max(0, faqDailyCap - faqUsedToday)

  return (
    <div className="flex flex-col gap-4">
      {/* Topic input */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="faq-topic"
            className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
          >
            Topic or query
          </label>
          <span
            className="font-[var(--font-mono)] text-[11px] tabular-nums text-[#9CA3AF]"
            aria-live="polite"
            aria-label={`${remaining} of ${faqDailyCap} FAQ runs remaining today`}
          >
            {remaining}/{faqDailyCap} today
          </span>
        </div>
        <input
          id="faq-topic"
          type="text"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          disabled={capReached}
          placeholder="e.g. How much does teeth whitening cost in Ramat Gan?"
          className={cn(
            'w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#3370FF] focus:ring-2 focus:ring-[#3370FF]/20',
            capReached && 'cursor-not-allowed bg-[#F9FAFB] text-[#9CA3AF]',
          )}
          aria-describedby="faq-topic-hint"
        />
        <p id="faq-topic-hint" className="mt-1.5 text-[12px] text-[#9CA3AF]">
          Pre-filled from your top scan gap. Edit to target a specific question.
        </p>
      </div>

      {/* Cap status */}
      {capReached ? (
        <div className="flex items-start gap-2 rounded-lg border border-[#FDE68A] bg-[#FDF3E0] px-3 py-2.5">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-[#B8770B]"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 2L14 13H2L8 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M8 6v3M8 11h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-[12px] font-semibold text-[#92400E]">Daily cap reached</p>
            <p className="mt-0.5 text-[12px] text-[#B8770B]">
              You&apos;ve used all {faqDailyCap} FAQ runs for today on the Discover plan.{' '}
              <Link
                href="/settings/billing"
                className="font-medium underline underline-offset-2 hover:text-[#92400E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]"
              >
                Upgrade to Build
              </Link>{' '}
              for 5 runs/day.
            </p>
          </div>
        </div>
      ) : null}

      <CustomInstructionsField
        value={customInstructions}
        onChange={onCustomInstructionsChange}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// CustomInstructionsField — shared textarea
// ---------------------------------------------------------------------------

function CustomInstructionsField({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label
        htmlFor="custom-instructions"
        className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
      >
        Custom instructions{' '}
        <span className="ml-1 font-normal normal-case tracking-normal text-[#9CA3AF]">
          (optional)
        </span>
      </label>
      <textarea
        id="custom-instructions"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="e.g. Keep a friendly, jargon-free tone. Focus on price transparency."
        className="w-full resize-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#3370FF] focus:ring-2 focus:ring-[#3370FF]/20"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// OutputZone — Zone 5 router
// ---------------------------------------------------------------------------

interface OutputZoneProps {
  tab: ContentTab
  pageState: ToolPageState
  errorKind: ErrorKind | null
  selectedDoc: ContentDoc | null
  onRetry: () => void
  config: TabConfig
}

function OutputZone({
  tab,
  pageState,
  errorKind,
  selectedDoc,
  onRetry,
  config,
}: OutputZoneProps) {
  if (pageState === 'empty') {
    return (
      <EmptyState
        glyph={
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2FF]" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="20" height="24" rx="3" stroke="#3370FF" strokeWidth="1.75" fill="none" />
              <path d="M8 10h12M8 14h8M8 18h10" stroke="#3370FF" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M17 20l3 3 5-5" stroke="#3370FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
            </svg>
          </div>
        }
        title="No page selected"
        description={
          tab === 'faq'
            ? 'Enter a topic or query above — the FAQ Builder will generate citation-ready answers targeting your scan gaps.'
            : `Pick a ${tab === 'optimize' ? 'page to optimize' : 'stale page to refresh'} from the list above, then run the ${config.agentLabel}.`
        }
        action={
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/scans"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#3370FF] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#1f5ce8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
            >
              View scan gaps →
            </Link>
            <Link
              href="/archive"
              className="text-[13px] text-[#6B7280] underline-offset-2 hover:text-[#0A0A0A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
            >
              See previous runs
            </Link>
          </div>
        }
        align="top"
      />
    )
  }

  if (pageState === 'error') {
    const errorTitle =
      errorKind === 'page-lock-conflict'
        ? 'Page is already in use'
        : errorKind === 'cap-exhausted'
          ? 'Daily cap reached'
          : 'Run failed'

    const errorDescription =
      errorKind === 'page-lock-conflict'
        ? `${selectedDoc?.title ?? 'This page'} is being edited by another run. Wait for it to finish or select a different page.`
        : errorKind === 'cap-exhausted'
          ? `You've used all ${config.dailyCap} ${config.agentLabel} runs today. Your cap resets at midnight.`
          : 'The agent hit an unexpected error. Your draft was not saved — try again and it usually clears right up.'

    return (
      <ErrorState
        title={errorTitle}
        description={errorDescription}
        onRetry={onRetry}
        retryLabel={errorKind === 'page-lock-conflict' ? 'Select another page' : 'Try again'}
      />
    )
  }

  if (pageState === 'success') {
    const docId = tab === 'faq' ? 'c3' : selectedDoc?.id ?? 'c1'
    const diff = DEMO_CONTENT.diffs[docId]

    if (!diff) return null

    if (tab === 'faq') {
      return <FAQOutput config={config} />
    }

    return (
      <DiffEditor
        diff={diff}
        agentLabel={config.agentLabel}
      />
    )
  }

  return null
}

// ---------------------------------------------------------------------------
// FAQOutput — FAQ tab success state with individual FAQ cards
// ---------------------------------------------------------------------------

function FAQOutput({ config }: { config: TabConfig }) {
  const [sentItems, setSentItems] = useState<Set<number>>(new Set())

  function handleSendAll() {
    setSentItems(new Set([0, 1, 2]))
  }

  const allSent = sentItems.size >= DEMO_CONTENT.faqItems.length

  return (
    <div className="overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] bg-[#FAFAFA] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              {config.agentLabel} · {DEMO_CONTENT.faqItems.length} answers generated
            </p>
            <p className="mt-0.5 text-[15px] text-[#6B7280]">
              Your FAQs are{' '}
              <SerifVerdict>Ready</SerifVerdict>{' '}
              to review.
            </p>
          </div>
          {allSent ? (
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#0E9E6E]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="#0E9E6E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              All sent to approvals
            </div>
          ) : (
            <Link
              href="/approvals"
              onClick={handleSendAll}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#3370FF] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#1f5ce8] active:bg-[#1a52d6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
            >
              Send all to approvals →
            </Link>
          )}
        </div>
      </div>

      {/* FAQ cards */}
      <div className="px-6 py-5">
        <div className="flex flex-col gap-3">
          {DEMO_CONTENT.faqItems.map((item, i) => (
            <FAQCard
              key={i}
              item={item}
              index={i}
              sent={sentItems.has(i)}
              onSend={() => setSentItems((prev) => new Set([...prev, i]))}
            />
          ))}
        </div>
      </div>

      {/* Gate bar */}
      <div className="border-t border-[#E5E7EB] bg-[#FAFAFA] px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEEAFD]" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1.5v4M5 7.5h.01" stroke="#6E56F0" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[12px] text-[#6B7280]">
            FAQ content requires approval before publishing. Approved items appear in your{' '}
            <Link href="/approvals" className="font-medium text-[#3370FF] underline-offset-2 hover:underline">
              approvals queue
            </Link>.
          </p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FAQCard — individual FAQ item card
// ---------------------------------------------------------------------------

interface FAQCardProps {
  item: { question: string; answer: string; targetQuery: string }
  index: number
  sent: boolean
  onSend: () => void
}

function FAQCard({ item, index, sent, onSend }: FAQCardProps) {
  const [expanded, setExpanded] = useState(index === 0)

  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        sent ? 'border-[#D1FAE5] bg-[#F0FDF4]' : 'border-[#E5E7EB] bg-white',
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
        aria-expanded={expanded}
        aria-controls={`faq-card-body-${index}`}
      >
        <span className="mt-0.5 font-[var(--font-mono)] text-[11px] tabular-nums text-[#9CA3AF]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 text-[13px] font-medium text-[#0A0A0A]">
          {item.question}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {sent && (
            <span className="text-[11px] font-medium text-[#0E9E6E]">Sent</span>
          )}
          <svg
            className={cn('h-4 w-4 text-[#9CA3AF] transition-transform', expanded && 'rotate-180')}
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div id={`faq-card-body-${index}`} className="border-t border-[#E5E7EB] px-4 pb-4 pt-3">
          <p className="mb-3 text-[13px] leading-relaxed text-[#374151]">
            {item.answer}
          </p>
          <div className="flex items-center justify-between gap-4">
            <span className="font-[var(--font-mono)] text-[11px] tabular-nums text-[#9CA3AF]">
              Target: {item.targetQuery}
            </span>
            {!sent ? (
              <Link
                href="/approvals"
                onClick={onSend}
                className="text-[12px] font-medium text-[#3370FF] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
              >
                Send to approvals →
              </Link>
            ) : (
              <span className="text-[12px] font-medium text-[#0E9E6E]">Sent to approvals</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

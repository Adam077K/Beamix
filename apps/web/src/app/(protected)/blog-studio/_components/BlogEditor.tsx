'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ToolPage } from '@/components/console/ToolPage'
import { ContextStat } from '@/components/console/ContextStat'
import { RunControl } from '@/components/console/RunControl'
import { PipelineLedger } from '@/components/console/PipelineLedger'
import { InputSummaryBar } from '@/components/console/InputSummaryBar'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Skeleton } from '@/components/loading-state'
import { Button } from '@/components/ui/button'
import type { RunMode } from '@/components/console/ModeToggle'
import type { StageState } from '@/components/console/pipeline-contract'
import type { ToolPageState } from '@/components/console/ToolPage'
import { DEMO_BLOG } from '@/lib/demo/surfaces/blog-studio'
import { DEMO_BUSINESS } from '@/lib/demo/surfaces/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PlanTier = 'discover' | 'build' | 'scale'

interface BlogEditorProps {
  planTier: PlanTier
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BLOG_STAGES: StageState[] = [
  { id: 'plan', label: 'Planning content strategy', status: 'queued' },
  { id: 'research', label: 'Researching citations + YMYL sources', status: 'queued' },
  { id: 'do', label: 'Drafting long-form article', status: 'queued' },
  { id: 'qa', label: 'Reviewing for accuracy + tone', status: 'queued' },
  { id: 'summarize', label: 'Preparing draft for review', status: 'queued' },
]

// Sparkline of blog-article content scores over last 5 runs (higher = better AI visibility)
const SPARKLINE: number[] = [44, 51, 58, 63, 71]

// ---------------------------------------------------------------------------
// Glyph — bespoke "article + pen" mark for the blog-studio empty state
// ---------------------------------------------------------------------------

function BlogGlyph() {
  return (
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
        {/* Document body */}
        <rect x="4" y="3" width="16" height="20" rx="2" fill="#EFF4FF" stroke="#3370FF" strokeWidth="1.5" />
        {/* Text lines */}
        <line x1="8" y1="9" x2="16" y2="9" stroke="#3370FF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="13" x2="16" y2="13" stroke="#3370FF" strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="17" x2="13" y2="17" stroke="#3370FF" strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round" />
        {/* Pen stroke — bottom right */}
        <path d="M18 20 L24 14 L22 12 L16 18 L16 22 L18 20Z" fill="#3370FF" fillOpacity="0.8" />
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TierLockBanner — first-class Discover upgrade state
// ---------------------------------------------------------------------------

function TierLockBanner() {
  return (
    <div className="rounded-[var(--radius-card)] border border-[#E5E7EB] bg-[#F7F6F2] px-6 py-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
        {/* Icon chip */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white"
          style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.07)' }}
          aria-hidden="true"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="10" width="12" height="9" rx="2" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1.4" />
            <path d="M8 10V7a3 3 0 1 1 6 0v3" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            <circle cx="11" cy="15" r="1.5" fill="#9CA3AF" />
          </svg>
        </div>

        {/* Copy */}
        <div className="flex-1">
          <p className="mb-0.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Build + Scale only
          </p>
          <h2 className="mb-2 font-[var(--font-display)] text-[22px] font-medium leading-[1.15] tracking-[-0.015em] text-[#0A0A0A]">
            Authority Blog Strategist is a Build feature
          </h2>
          <p className="max-w-[480px] text-[15px] leading-relaxed text-[#6B7280]">
            Long-form YMYL content — the kind AI search engines cite — requires the full research pipeline. That pipeline costs more per run, so it lives on Build and Scale plans.
          </p>

          {/* What you get at Build */}
          <ul className="mt-4 space-y-1.5">
            {[
              '5-step research + drafting pipeline per article',
              'YMYL-grade citation sourcing and fact-check pass',
              'Every draft reviewed by you before anything publishes',
              'Connects to your existing approvals queue',
            ].map((line) => (
              <li key={line} className="flex items-start gap-2 text-[14px] text-[#6B7280]">
                <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#3370FF]" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>

          {/* Two-tier CTA — M8 */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild variant="default" size="default">
              <Link href="/settings/billing">
                Upgrade to Build →
              </Link>
            </Button>
            <Link
              href="/dashboard"
              className="text-[13px] text-[#6B7280] underline-offset-2 hover:text-[#0A0A0A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// BlogInputPanel — Zone 2 inputs for Build/Scale
// ---------------------------------------------------------------------------

interface BlogInputPanelProps {
  topic: string
  onTopicChange: (v: string) => void
  customInstructions: string
  onCustomInstructionsChange: (v: string) => void
  disabled?: boolean
}

function BlogInputPanel({
  topic,
  onTopicChange,
  customInstructions,
  onCustomInstructionsChange,
  disabled = false,
}: BlogInputPanelProps) {
  return (
    <div className="px-6 py-5">
      <div className="flex flex-col gap-5">
        {/* Topic / cluster */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="blog-topic"
            className="text-[13px] font-medium text-[#0A0A0A]"
          >
            Topic or question cluster
          </label>
          <p className="text-[12px] text-[#9CA3AF]">
            The primary question or cluster this article should answer. The more specific, the better it ranks.
          </p>
          <input
            id="blog-topic"
            type="text"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. Is teeth whitening safe for sensitive teeth?"
            className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#0A0A0A] placeholder:text-[#D1D5DB] focus:border-[#3370FF] focus:outline-none focus:ring-2 focus:ring-[#3370FF] focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
            aria-describedby="blog-topic-hint"
          />
          <span id="blog-topic-hint" className="sr-only">
            Enter the main topic or question your article should answer
          </span>
        </div>

        {/* Page lock indicator */}
        <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0 text-[#9CA3AF]"
          >
            <rect x="2.5" y="6" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
          </svg>
          <p className="text-[12px] text-[#6B7280]">
            <span className="font-medium text-[#0A0A0A]">Page lock active.</span>{' '}
            The article will be locked for editing while the agent runs.
          </p>
        </div>

        {/* Custom instructions — collapsed by default */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="blog-instructions"
            className="text-[13px] font-medium text-[#0A0A0A]"
          >
            Custom instructions{' '}
            <span className="font-normal text-[#9CA3AF]">(optional)</span>
          </label>
          <textarea
            id="blog-instructions"
            value={customInstructions}
            onChange={(e) => onCustomInstructionsChange(e.target.value)}
            disabled={disabled}
            rows={3}
            placeholder="e.g. Focus on post-procedure care. Avoid mentioning specific product brands. Target a patient who has never had implants before."
            className="w-full resize-y rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] text-[#0A0A0A] placeholder:text-[#D1D5DB] focus:border-[#3370FF] focus:outline-none focus:ring-2 focus:ring-[#3370FF] focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// MarkdownEditorSkeleton — loading state for the editor zone
// ---------------------------------------------------------------------------

function MarkdownEditorSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading draft…"
      className="px-7 py-6"
    >
      {/* Title skeleton */}
      <Skeleton className="mb-5 h-8 w-3/4" />
      {/* Sub-head */}
      <Skeleton className="mb-4 h-4 w-1/2" />
      {/* Body paragraphs */}
      <div className="space-y-2.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      {/* Paragraph break */}
      <div className="mt-6 space-y-2.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <span className="sr-only">Loading draft…</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// MarkdownEditor — the long-form populated editor with approvals CTA
// ---------------------------------------------------------------------------

interface MarkdownEditorProps {
  draft: (typeof DEMO_BLOG.drafts)[0]
  onContentChange: (content: string) => void
}

function MarkdownEditor({ draft, onContentChange }: MarkdownEditorProps) {
  const wordCount = draft.content.split(/\s+/).filter(Boolean).length
  const targetPct = Math.min(Math.round((wordCount / draft.targetWordCount) * 100), 100)

  return (
    <div className="flex flex-col">
      {/* Editor header */}
      <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] px-7 py-4">
        <div className="flex items-center gap-3">
          {/* Word count mono */}
          <span
            className="font-[var(--font-mono)] text-[13px] tabular-nums text-[#6B7280]"
            aria-label={`${wordCount} of ${draft.targetWordCount} words`}
          >
            {wordCount.toLocaleString()} / {draft.targetWordCount.toLocaleString()} words
          </span>
          {/* Progress bar */}
          <div
            className="h-1.5 w-20 overflow-hidden rounded-full bg-[#F3F4F6]"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full bg-[#3370FF] transition-[width] duration-500"
              style={{ width: `${targetPct}%` }}
            />
          </div>
        </div>

        {/* Status chip */}
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${
            draft.status === 'approved'
              ? 'bg-[#E6F5EE] text-[#0E9E6E]'
              : draft.status === 'pending_approval'
              ? 'bg-[#EEEAFD] text-[#6E56F0]'
              : 'bg-[#F3F4F6] text-[#6B7280]'
          }`}
        >
          {draft.status === 'approved'
            ? 'Approved'
            : draft.status === 'pending_approval'
            ? 'Pending review'
            : 'Draft'}
        </span>
      </div>

      {/* YMYL notice band */}
      <div className="flex items-start gap-2 border-b border-[#E5E7EB] bg-[#FDF9EE] px-7 py-3">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mt-[2px] shrink-0"
          aria-hidden="true"
        >
          <path
            d="M7 1.5 L12.5 11 H1.5 Z"
            stroke="#B8770B"
            strokeWidth="1.3"
            strokeLinejoin="round"
            fill="none"
          />
          <line x1="7" y1="6" x2="7" y2="9" stroke="#B8770B" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="7" cy="10.5" r="0.7" fill="#B8770B" />
        </svg>
        <p className="text-[12px] leading-relaxed text-[#92640A]">
          <span className="font-semibold">YMYL content.</span> Health-related articles require your review before anything publishes. This draft will not go live without your explicit approval.
        </p>
      </div>

      {/* Markdown textarea */}
      <div className="relative">
        <textarea
          value={draft.content}
          onChange={(e) => onContentChange(e.target.value)}
          spellCheck
          className="min-h-[520px] w-full resize-y px-7 py-6 font-[var(--font-mono)] text-[14px] leading-[1.8] text-[#0A0A0A] focus:outline-none"
          style={{ border: 'none' }}
          aria-label="Article content"
          placeholder="Start writing your article in Markdown…"
        />
      </div>

      {/* Serif verdict beat (M5 — one per screen) */}
      <div className="border-t border-[#E5E7EB] px-7 py-5">
        <p className="text-[15px] leading-relaxed text-[#6B7280]">
          This draft is{' '}
          <SerifVerdict>ready</SerifVerdict>{' '}
          for your review — check the content, make any edits, then send it to approvals.
        </p>
      </div>

      {/* Approvals CTA footer */}
      <div className="flex items-center justify-between gap-4 border-t border-[#E5E7EB] bg-[#F9FAFB] px-7 py-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-[13px] font-medium text-[#0A0A0A]">Send to approvals</p>
          <p className="text-[12px] text-[#9CA3AF]">
            YMYL content is always gated — you review before anything publishes.
          </p>
        </div>
        <Button asChild variant="default" size="default">
          <Link href="/approvals">
            Send to approvals →
          </Link>
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// BlogEditor — main stateful surface
// ---------------------------------------------------------------------------

export function BlogEditor({ planTier }: BlogEditorProps) {
  const isDiscoverTier = planTier === 'discover'

  // Input state
  const [topic, setTopic] = useState(
    DEMO_BLOG.drafts[0].topic
  )
  const [customInstructions, setCustomInstructions] = useState('')
  const [mode, setMode] = useState<RunMode>('myself')

  // Surface state machine
  const [pageState, setPageState] = useState<ToolPageState>('idle')
  const [inputCollapsed, setInputCollapsed] = useState(false)
  const [activeStages, setActiveStages] = useState<StageState[]>(BLOG_STAGES)
  const [currentSubstep, setCurrentSubstep] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const [draftContent, setDraftContent] = useState(DEMO_BLOG.drafts[0].content)

  // ---------------------------------------------------------------------------
  // Simulated run (demo mode — no real backend)
  // ---------------------------------------------------------------------------

  const handleRun = useCallback(() => {
    if (isDiscoverTier) return

    // Reset stages
    setActiveStages(BLOG_STAGES.map((s) => ({ ...s, status: 'queued' as const })))
    setClearing(false)
    setPageState('running')
    setInputCollapsed(false)

    const substepMap: Record<string, string[]> = {
      plan: [
        'Analysing topic cluster for YMYL signals…',
        'Mapping citation patterns across ChatGPT, Gemini, Perplexity…',
      ],
      research: [
        'Sourcing clinical references…',
        'Cross-checking competitor coverage for "teeth whitening safety"…',
        'Identifying uncited authority angles…',
      ],
      do: [
        'Drafting introduction and clinical overview…',
        'Writing comparison table…',
        'Adding FAQ block targeting Perplexity People Also Ask…',
      ],
      qa: [
        'Reviewing health claims for accuracy…',
        'Checking YMYL duty-of-care language…',
      ],
      summarize: ['Packaging draft for review queue…'],
    }

    const stages: Array<{
      id: StageState['id']
      label: string
    }> = [
      { id: 'plan', label: 'Planning content strategy' },
      { id: 'research', label: 'Researching citations + YMYL sources' },
      { id: 'do', label: 'Drafting long-form article' },
      { id: 'qa', label: 'Reviewing for accuracy + tone' },
      { id: 'summarize', label: 'Preparing draft for review' },
    ]

    let timeOffset = 0

    stages.forEach((stage, stageIdx) => {
      const stageDelay = timeOffset

      // Mark active
      setTimeout(() => {
        setActiveStages((prev) =>
          prev.map((s, i) =>
            i === stageIdx
              ? { ...s, status: 'active' as const }
              : s,
          ),
        )
      }, stageDelay)

      // Cycle substeps during this stage
      const substeps = substepMap[stage.id] ?? []
      substeps.forEach((substep, si) => {
        setTimeout(() => {
          setCurrentSubstep(substep)
        }, stageDelay + si * 600)
      })

      const stageDuration = 600 + substeps.length * 600

      // Mark done
      setTimeout(() => {
        setActiveStages((prev) =>
          prev.map((s, i) =>
            i === stageIdx ? { ...s, status: 'done' as const } : s,
          ),
        )
        if (stageIdx === stages.length - 1) {
          setCurrentSubstep(null)
        }
      }, stageDelay + stageDuration)

      timeOffset += stageDuration + 200
    })

    // Trigger clearing → output
    const totalDuration = timeOffset + 400
    setTimeout(() => {
      setClearing(true)
    }, totalDuration)
  }, [isDiscoverTier])

  const handleCleared = useCallback(() => {
    setPageState('success')
    setInputCollapsed(true)
  }, [])

  const handleRetry = useCallback(() => {
    setPageState('idle')
    setInputCollapsed(false)
    setActiveStages(BLOG_STAGES)
    setClearing(false)
    setCurrentSubstep(null)
  }, [])

  // ---------------------------------------------------------------------------
  // Derived: run state
  // ---------------------------------------------------------------------------

  const runState = isDiscoverTier
    ? 'tier-locked'
    : topic.trim().length < 5
    ? 'enabled' // allow but noop below; let validation be visible
    : 'enabled'

  // ---------------------------------------------------------------------------
  // Sub-nodes
  // ---------------------------------------------------------------------------

  const contextStat = (
    <ContextStat
      value={isDiscoverTier ? '—' : '71'}
      label="blog content score"
      sparklinePoints={isDiscoverTier ? null : SPARKLINE}
      currentScore={isDiscoverTier ? null : 71}
    />
  )

  const inputPanel = isDiscoverTier ? (
    // Discover: still render the input panel shape, but locked
    <BlogInputPanel
      topic={topic}
      onTopicChange={setTopic}
      customInstructions={customInstructions}
      onCustomInstructionsChange={setCustomInstructions}
      disabled
    />
  ) : (
    <BlogInputPanel
      topic={topic}
      onTopicChange={setTopic}
      customInstructions={customInstructions}
      onCustomInstructionsChange={setCustomInstructions}
      disabled={pageState === 'running'}
    />
  )

  const collapsedSummary = (
    <InputSummaryBar
      summary={`"${topic.slice(0, 60)}${topic.length > 60 ? '…' : ''}" · Build plan · YMYL-gated`}
      onExpand={() => setInputCollapsed(false)}
    />
  )

  const runControl = (
    <RunControl
      mode={mode}
      onModeChange={setMode}
      onRun={handleRun}
      runLabel="Run Authority Blog Strategist"
      runState={isDiscoverTier ? 'tier-locked' : runState}
      allotmentLabel="Beamix runs this weekly · 6 of 10 autonomous runs left"
      lockedTierCta={
        isDiscoverTier ? (
          <Link
            href="/settings/billing"
            className="font-medium text-[#3370FF] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          >
            Upgrade to Build to unlock →
          </Link>
        ) : undefined
      }
    />
  )

  const ledger = (
    <PipelineLedger
      stages={activeStages}
      agentLabel="Authority Blog Strategist"
      currentSubstep={currentSubstep}
      clearing={clearing}
      onCleared={handleCleared}
    />
  )

  // Zone 5 output
  let output: React.ReactNode = null

  if (pageState === 'success') {
    const activeDraft = {
      ...DEMO_BLOG.drafts[0],
      topic,
      content: draftContent,
    }
    output = (
      <MarkdownEditor
        draft={activeDraft}
        onContentChange={setDraftContent}
      />
    )
  } else if (pageState === 'empty') {
    output = (
      <EmptyState
        glyph={<BlogGlyph />}
        title="What should we write about?"
        description="Pick a topic or question that your patients ask. The agent researches, drafts, and structures an article ready for your review — nothing publishes without your approval."
        action={
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
            <Button
              type="button"
              variant="default"
              onClick={() => {
                setTopic('Is teeth whitening safe for sensitive teeth?')
                setPageState('idle')
              }}
            >
              Use suggested topic
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPageState('idle')}
            >
              Enter my own topic
            </Button>
          </div>
        }
        align="top"
      />
    )
  } else if (pageState === 'error') {
    output = (
      <ErrorState
        title="The agent couldn't finish the draft"
        description="This sometimes happens when the research step can't reach external sources. Try again — it usually clears up."
        onRetry={handleRetry}
        retryLabel="Try again"
      />
    )
  } else if (pageState === 'running') {
    // Loading state lives in the ledger (Zone 4) — no separate Zone 5 needed.
    // But if clearing just fired and output hasn't landed yet, show skeleton.
    output = clearing ? (
      <MarkdownEditorSkeleton />
    ) : null
  }

  // ---------------------------------------------------------------------------
  // Tier-locked: replace Zone 2 + 3 with the upgrade banner
  // when on Discover, we still show the full page skeleton but lock everything
  // ---------------------------------------------------------------------------

  if (isDiscoverTier) {
    return (
      <div className="mx-auto w-full max-w-[880px] px-4 pb-16 pt-8 sm:px-6">
        {/* Zone 1 — Context Header (TIER-3 .card-inset) */}
        <div className="card-inset craft-enter craft-enter-1 px-6 py-5">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                {DEMO_BUSINESS.name}
              </p>
              <h1 className="font-[var(--font-display)] text-[30px] font-medium leading-[1.1] tracking-[-0.02em] text-[#0A0A0A]">
                Blog Studio
              </h1>
              <p className="mt-1.5 text-[15px] leading-relaxed text-[#6B7280]">
                Research, draft, and publish authority articles that AI engines cite.
              </p>
            </div>
            <div className="shrink-0">{contextStat}</div>
          </div>
        </div>

        {/* Tier-lock banner — Zone 2+3 replacement */}
        <div className="craft-enter craft-enter-2 mt-8">
          <TierLockBanner />
        </div>

        {/* Disabled run control — visual completeness */}
        <div className="craft-enter craft-enter-3 mt-6">
          {runControl}
        </div>

        {/* History link */}
        <div className="craft-enter craft-enter-4 mt-8">
          <Link
            href="/archive"
            className="text-[13px] text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          >
            View in Run History →
          </Link>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Build/Scale: full 5-zone spine
  // ---------------------------------------------------------------------------

  return (
    <ToolPage
      eyebrow={DEMO_BUSINESS.name}
      title="Blog Studio"
      whatThisDoes="Research, draft, and publish authority articles that AI engines cite."
      contextStat={contextStat}
      inputPanel={inputPanel}
      collapsedSummary={collapsedSummary}
      inputCollapsed={inputCollapsed}
      onToggleInput={() => setInputCollapsed(false)}
      runControl={runControl}
      ledger={ledger}
      output={output ?? undefined}
      state={pageState}
      historyHref="/archive"
    />
  )
}

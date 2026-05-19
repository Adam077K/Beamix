'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import WorkspaceEditor from './WorkspaceEditor'

// ─── Agent display labels ──────────────────────────────────────────────────

const AGENT_LABEL: Record<string, string> = {
  query_mapper: 'Query Mapper',
  content_optimizer: 'Content Optimizer',
  freshness_agent: 'Freshness Agent',
  faq_builder: 'FAQ Builder',
  schema_generator: 'Schema Generator',
  offsite_presence_builder: 'Listings Builder',
  review_presence_planner: 'Review Planner',
  entity_builder: 'Entity Builder',
  authority_blog_strategist: 'Blog Strategist',
  performance_tracker: 'Performance Tracker',
  reddit_presence_planner: 'Reddit Planner',
  video_seo_agent: 'Video SEO Agent',
}

// ─── Types ─────────────────────────────────────────────────────────────────

interface JobMeta {
  id: string
  agentType: string
  status: string
  createdAt: string
  completedAt: string | null
  creditsCost: number
  qaScore: number | null
  triggerSource: string | null
  targetQueryIds: string[]
}

interface ContentItemMeta {
  id: string
  title: string
  content: string
  estimatedImpact: string | null
  evidence: Record<string, unknown> | null
  targetQueries: string[]
  userEditedContent: string | null
  status: string
}

interface WorkspaceClientProps {
  jobId: string
  job: JobMeta
  contentItem: ContentItemMeta | null
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-2.5 border-b border-gray-50 last:border-0">
      <dt className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </dt>
      <dd className="text-[13px] text-gray-700">{value}</dd>
    </div>
  )
}

type ReviewState = 'accepted' | 'rejected' | 'changes_requested' | null

// ─── Component ─────────────────────────────────────────────────────────────

export default function WorkspaceClient({ jobId, job, contentItem }: WorkspaceClientProps) {
  const [reviewState, setReviewState] = useState<ReviewState>(null)
  const [changesInput, setChangesInput] = useState('')
  const [changesOpen, setChangesOpen] = useState(false)
  const [isActioning, setIsActioning] = useState(false)

  const agentLabel = AGENT_LABEL[job.agentType] ?? job.agentType

  const handleAction = useCallback(
    async (action: NonNullable<ReviewState>) => {
      if (isActioning) return
      setIsActioning(true)
      // Optimistic UI — in production this would call PATCH /api/inbox/[itemId]
      await new Promise((r) => setTimeout(r, 400))
      setReviewState(action)
      setIsActioning(false)
      if (action === 'changes_requested') setChangesOpen(false)
    },
    [isActioning],
  )

  const evidenceRaw = contentItem?.evidence as
    | { targetQueries?: string[]; triggerSource?: string; impactEstimate?: string; citations?: unknown[] }
    | null

  const targetQueries =
    contentItem?.targetQueries?.length
      ? contentItem.targetQueries
      : (evidenceRaw?.targetQueries ?? [])

  const triggerSource =
    job.triggerSource ?? (evidenceRaw?.triggerSource as string | undefined) ?? null

  const impactEstimate =
    contentItem?.estimatedImpact ?? (evidenceRaw?.impactEstimate as string | undefined) ?? null

  // QA confidence as percentage
  const confidence =
    job.qaScore != null ? `${Math.round(job.qaScore * 100)}%` : null

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-gray-100 px-5">
        <Link
          href="/inbox"
          className="flex items-center gap-1.5 text-[12px] text-gray-500 transition-colors hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Inbox
        </Link>

        {/* Review state badge */}
        {reviewState && (
          <span
            className={cn(
              'inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-medium',
              reviewState === 'accepted' && 'bg-emerald-50 text-emerald-700 border border-emerald-200',
              reviewState === 'rejected' && 'bg-red-50 text-red-600 border border-red-200',
              reviewState === 'changes_requested' && 'bg-amber-50 text-amber-700 border border-amber-200',
            )}
          >
            {reviewState === 'accepted' && 'Approved — queued for publish'}
            {reviewState === 'rejected' && 'Rejected'}
            {reviewState === 'changes_requested' && 'Changes requested'}
          </span>
        )}
      </div>

      {/* ── 3-column layout ─────────────────────────────────────────────── */}
      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[260px_1fr_300px]">

        {/* ── LEFT: Agent metadata ─────────────────────────────────────── */}
        <aside className="hidden overflow-y-auto border-r border-gray-100 lg:block">
          <div className="p-5">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Agent run
            </h2>
            <dl>
              <MetaRow label="Agent" value={agentLabel} />
              <MetaRow
                label="Run date"
                value={
                  <time dateTime={job.createdAt}>
                    {formatDate(job.createdAt)}
                  </time>
                }
              />
              {confidence && (
                <MetaRow
                  label="Confidence"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          parseInt(confidence) >= 80
                            ? 'bg-emerald-500'
                            : parseInt(confidence) >= 60
                            ? 'bg-amber-400'
                            : 'bg-red-400',
                        )}
                      />
                      {confidence}
                    </span>
                  }
                />
              )}
              {impactEstimate && (
                <MetaRow label="Est. impact" value={impactEstimate} />
              )}
              {triggerSource && (
                <MetaRow label="Trigger" value={triggerSource} />
              )}
              <MetaRow
                label="Credits used"
                value={
                  <span className="font-mono text-[12px]">{job.creditsCost}</span>
                }
              />
            </dl>

            {/* Job ID footer */}
            <div className="mt-6 border-t border-gray-50 pt-4">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-300">
                Job ID
              </p>
              <p className="break-all font-mono text-[10px] text-gray-300">
                {job.id}
              </p>
            </div>
          </div>
        </aside>

        {/* ── CENTER: Content editor ───────────────────────────────────── */}
        <main className="flex min-w-0 flex-col overflow-hidden">
          {contentItem ? (
            <WorkspaceEditor
              contentItemId={contentItem.id}
              title={contentItem.title}
              content={contentItem.userEditedContent ?? contentItem.content}
              isLocked={reviewState !== null}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="2" y="4" width="12" height="1.5" rx="0.75" fill="#9CA3AF" />
                  <rect x="2" y="7.25" width="9" height="1.5" rx="0.75" fill="#9CA3AF" />
                  <rect x="2" y="10.5" width="10.5" height="1.5" rx="0.75" fill="#9CA3AF" />
                </svg>
              </div>
              <p className="text-[13px] text-gray-500">No content was produced by this run.</p>
            </div>
          )}
        </main>

        {/* ── RIGHT: Context panel ─────────────────────────────────────── */}
        <aside className="hidden overflow-y-auto border-l border-gray-100 lg:block">
          <div className="p-5">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Context
            </h2>

            {/* Target queries */}
            {targetQueries.length > 0 && (
              <div className="mb-5">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Queries targeted
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {targetQueries.map((q, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] text-[#3370FF]"
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Engines scanned */}
            <div className="mb-5">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Engines
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(['ChatGPT', 'Gemini', 'Perplexity'] as const).map((engine) => (
                  <span
                    key={engine}
                    className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600"
                  >
                    {engine}
                  </span>
                ))}
              </div>
            </div>

            {/* Evidence: citations if available */}
            {Array.isArray((evidenceRaw as { citations?: unknown[] } | null)?.citations) &&
              ((evidenceRaw as { citations: unknown[] }).citations.length > 0) && (
                <div className="mb-5">
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Sources
                  </h3>
                  <div className="space-y-2">
                    {(
                      (evidenceRaw as { citations: Array<{ url?: string; title?: string }> }).citations
                    ).slice(0, 4).map((c, i) => (
                      <a
                        key={i}
                        href={c.url ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-[12px] text-[#3370FF] transition-colors hover:text-[#2860e8]"
                      >
                        {c.title ?? c.url ?? 'Source'}
                      </a>
                    ))}
                  </div>
                </div>
              )}

            {/* Competitor mentions placeholder */}
            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Competitor mentions
              </h3>
              <p className="text-[12px] text-gray-400">
                Run a full scan to see competitor data alongside this output.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Sticky bottom action bar ─────────────────────────────────────── */}
      <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-3">
        <div className="flex items-center gap-2">
          {/* Accept */}
          <button
            type="button"
            onClick={() => handleAction('accepted')}
            disabled={isActioning || reviewState !== null}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-[#3370FF] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#2860e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Accept
          </button>

          {/* Request changes toggle */}
          <button
            type="button"
            onClick={() => setChangesOpen((v) => !v)}
            disabled={isActioning || reviewState !== null}
            className="flex h-8 items-center rounded-lg px-3 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Request changes
          </button>

          {/* Reject */}
          <button
            type="button"
            onClick={() => handleAction('rejected')}
            disabled={isActioning || reviewState !== null}
            className="flex h-8 items-center rounded-lg border border-gray-200 px-3 text-[13px] font-medium text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reject
          </button>

          {/* Archive icon */}
          <button
            type="button"
            disabled={isActioning || reviewState !== null}
            className="ms-auto flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Archive"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <rect x="1.5" y="3.5" width="12" height="2.5" rx="0.75" stroke="currentColor" strokeWidth="1.3" />
              <path d="M2.5 6v5a1 1 0 001 1h8a1 1 0 001-1V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M5.5 9.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Inline changes request input */}
        {changesOpen && reviewState === null && (
          <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
            <input
              type="text"
              placeholder="Describe what to change..."
              value={changesInput}
              onChange={(e) => setChangesInput(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[13px] text-gray-800 placeholder:text-gray-400 focus:border-[#3370FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && changesInput.trim()) {
                  handleAction('changes_requested')
                }
              }}
            />
            <button
              type="button"
              onClick={() => changesInput.trim() && handleAction('changes_requested')}
              disabled={!changesInput.trim() || isActioning}
              className="flex h-8 items-center rounded-lg bg-[#3370FF] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#2860e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
            <button
              type="button"
              onClick={() => setChangesOpen(false)}
              className="flex h-8 items-center rounded-lg px-2 text-[13px] text-gray-400 transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

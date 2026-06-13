'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import type { PromptRow, PromptDrawerData } from '@/lib/demo/surfaces/types'

// ---------------------------------------------------------------------------
// Engine logo initial (accessible label fallback)
// ---------------------------------------------------------------------------

const ENGINE_COLORS: Record<string, { bg: string; text: string }> = {
  ChatGPT: { bg: '#EEF2FF', text: '#3370FF' },
  Gemini: { bg: '#E6F5EE', text: '#0E9E6E' },
  Perplexity: { bg: '#EEEAFD', text: '#6E56F0' },
}

function EngineInitial({ engine }: { engine: string }) {
  const color = ENGINE_COLORS[engine] ?? { bg: '#F3F4F6', text: '#6B7280' }
  const initial = engine[0]?.toUpperCase() ?? '?'
  return (
    <span
      className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[10px] font-bold"
      style={{ backgroundColor: color.bg, color: color.text }}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Intent label
// ---------------------------------------------------------------------------

const INTENT_DISPLAY: Record<PromptRow['intent'], string> = {
  transactional: 'Transactional — user ready to act',
  informational: 'Informational — user researching options',
  navigational: 'Navigational — user looking for your brand',
}

// ---------------------------------------------------------------------------
// Gap volume color
// ---------------------------------------------------------------------------

function volumeColor(volume: string): string {
  if (volume === 'High') return '#EF4444'
  if (volume === 'Medium') return '#B8770B'
  return '#6B7280'
}

// ---------------------------------------------------------------------------
// Gap item
// ---------------------------------------------------------------------------

interface GapItem {
  id: string
  query: string
  volume: string
  ownedBy: string[]
}

function GapListItem({ gap }: { gap: GapItem }) {
  return (
    <div className="flex items-start gap-3 py-2.5 first:pt-0">
      <span
        className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={{ backgroundColor: volumeColor(gap.volume) }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[#0A0A0A]">{gap.query}</p>
        <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
          Owned by {gap.ownedBy.join(', ')} ·{' '}
          <span style={{ color: volumeColor(gap.volume) }}>{gap.volume} volume</span>
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Fan-out tree node
// ---------------------------------------------------------------------------

function FanOutCitation({
  citation,
}: {
  citation: { domain: string; title: string; snippet: string }
}) {
  return (
    <div className="rounded-md border border-[#F3F4F6] bg-[#FAFAFA] px-3.5 py-2.5">
      <p className="text-[12px] font-medium text-[#0A0A0A]">{citation.title}</p>
      <p className="mt-0.5 font-[var(--font-mono)] text-[11px] tabular-nums text-[#3370FF]">
        {citation.domain}
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-[#6B7280]">
        {citation.snippet}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Drawer props
// ---------------------------------------------------------------------------

interface PromptDrawerProps {
  open: boolean
  onClose: () => void
  row: PromptRow
  drawerData: PromptDrawerData
  gaps: GapItem[]
}

// ---------------------------------------------------------------------------
// Main drawer
// ---------------------------------------------------------------------------

export function PromptDrawer({
  open,
  onClose,
  row,
  drawerData,
  gaps,
}: PromptDrawerProps) {
  const hasTree =
    drawerData.tree && drawerData.tree.length > 0

  const topGaps = gaps.slice(0, 3)

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full max-w-[460px] flex-col gap-0 overflow-y-auto p-0"
        aria-label={`Query details: ${row.query}`}
      >
        {/* Header */}
        <SheetHeader className="flex-row items-start justify-between gap-4 border-b border-[#E5E7EB] px-6 py-5">
          <div className="min-w-0 flex-1">
            {/* STEP-3 eyebrow */}
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              Query details
            </p>
            {/* Query as heading */}
            <SheetTitle className="text-[15px] font-semibold leading-snug text-[#0A0A0A]">
              {row.query}
            </SheetTitle>
            {/* Intent */}
            <p className="mt-1.5 text-[12px] text-[#6B7280]">
              {INTENT_DISPLAY[drawerData.intent]}
            </p>
          </div>
          <SheetClose className="mt-1 flex-shrink-0 rounded text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1">
            <span className="sr-only">Close</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 space-y-0 divide-y divide-[#F3F4F6]">
          {/* ----------------------------------------------------------------
               Fan-out tree — the signature data shape for this surface
          ---------------------------------------------------------------- */}
          <section className="px-6 py-5" aria-labelledby="fanout-heading">
            <h3
              id="fanout-heading"
              className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
            >
              Query fan-out tree
            </h3>

            {!hasTree ? (
              <div className="rounded-lg border border-[#F3F4F6] bg-[#F9FAFB] px-4 py-5 text-center">
                <p className="text-[13px] font-medium text-[#0A0A0A]">
                  No competitors found for this query
                </p>
                <p className="mt-1 text-[12px] text-[#6B7280]">
                  This is the one query where you already own the space — competitors
                  aren&apos;t appearing here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {drawerData.tree.map((branch) => (
                  <div key={branch.engine}>
                    {/* Engine header */}
                    <div className="mb-2 flex items-center gap-2">
                      <EngineInitial engine={branch.engine} />
                      <span className="text-[12px] font-semibold text-[#0A0A0A]">
                        {branch.engine}
                      </span>
                      <span className="ml-auto font-[var(--font-mono)] text-[11px] tabular-nums text-[#9CA3AF]">
                        {branch.citations.length}{' '}
                        {branch.citations.length === 1 ? 'result' : 'results'}
                      </span>
                    </div>

                    {/* Citations */}
                    <div className="space-y-2 pl-7">
                      {branch.citations.map((c, i) => (
                        <FanOutCitation key={`${branch.engine}-${i}`} citation={c} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ----------------------------------------------------------------
               Gap description — uncited angle
          ---------------------------------------------------------------- */}
          {drawerData.gapDescription && (
            <section className="px-6 py-5" aria-labelledby="gap-heading">
              <h3
                id="gap-heading"
                className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
              >
                Gap analysis
              </h3>
              <div className="rounded-lg border border-[#FDECEC] bg-[#FDECEC]/40 px-4 py-3.5">
                <p className="text-[13px] leading-relaxed text-[#374151]">
                  {drawerData.gapDescription}
                </p>
              </div>
            </section>
          )}

          {/* ----------------------------------------------------------------
               Co-citation count
          ---------------------------------------------------------------- */}
          {row.coCitations > 0 && (
            <section className="px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#0A0A0A]">
                    Competitor co-citations
                  </p>
                  <p className="mt-0.5 text-[12px] text-[#6B7280]">
                    Brands appearing alongside competitors for this query
                  </p>
                </div>
                <span className="font-[var(--font-mono)] text-[28px] leading-none tabular-nums text-[#0A0A0A]">
                  {row.coCitations}
                </span>
              </div>
            </section>
          )}

          {/* ----------------------------------------------------------------
               Uncited gap rail — the sidebar data shape
          ---------------------------------------------------------------- */}
          <section className="px-6 py-5" aria-labelledby="gaps-rail-heading">
            <h3
              id="gaps-rail-heading"
              className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
            >
              Other uncited gaps
            </h3>

            {topGaps.length === 0 ? (
              <p className="text-[13px] text-[#6B7280]">No gaps identified yet.</p>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {topGaps.map((gap) => (
                  <GapListItem key={gap.id} gap={gap} />
                ))}
              </div>
            )}

            {gaps.length > 3 && (
              <p className="mt-3 text-[12px] text-[#9CA3AF]">
                +{gaps.length - 3} more gaps — run Query Mapper to see the full list
              </p>
            )}
          </section>
        </div>

        {/* Footer CTA */}
        <div className="border-t border-[#E5E7EB] px-6 py-4">
          <p className="text-[12px] text-[#6B7280]">
            Run Query Mapper to re-score this prompt and discover new fan-out queries.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

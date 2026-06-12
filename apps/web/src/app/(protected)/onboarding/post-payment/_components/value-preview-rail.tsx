'use client'

/**
 * Value-preview rail — the right half of the post-payment split.
 *
 * This is the answer to audit P1-1: instead of a lonely card in a white void,
 * the right rail PREVIEWS what the customer just paid for being assembled live
 * — the way Profound's ranked panel and Otterly's product-preview fill the
 * viewport. It is the violet agent ZONE (M6): the crew at work, glanceable as a
 * spatial region from across the room, never a button.
 *
 * Two sub-states inside the zone:
 *  - skeleton placeholders while the crew is still working (before drafts land)
 *  - real DraftCard rows as each draft surfaces (M9 staggered entrance)
 *
 * COLOR LAW: this whole region is violet (agents). The left ritual carries the
 * blue (your progress fill + CTA). Violet NEVER on a button here.
 */

import { DEMO_DAY1 } from '@/lib/demo/fixtures'
import type { Day1Draft } from '@/types/day1'

const KIND_LABELS: Record<Day1Draft['kind'], string> = {
  faq: 'FAQ',
  schema: 'Schema',
  citation: 'Citation',
  content: 'Content',
}

// ── Single draft row — TIER-3 inset receding inside the violet zone ──────────
function DraftCard({ draft, enterDelay }: { draft: Day1Draft; enterDelay: number }) {
  return (
    <div
      className="card-inset craft-enter relative overflow-hidden p-4"
      style={{ animationDelay: `${enterDelay}ms` }}
      aria-label={`Draft: ${draft.title}`}
    >
      {/* Violet structure: 2px left accent rule — the crew's signature */}
      <span
        className="absolute inset-y-0 left-0 w-[2px]"
        style={{ background: 'var(--color-agent)' }}
        aria-hidden="true"
      />

      <div className="mb-2 flex items-center gap-2 pl-1">
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]"
          style={{ background: 'var(--color-agent-tint)', color: 'var(--color-agent)' }}
        >
          {KIND_LABELS[draft.kind]}
        </span>
        <span className="text-[11px] text-[var(--color-text-disabled)]">
          drafted by the crew
        </span>
      </div>

      <p className="pl-1 text-[13px] font-medium leading-snug text-[var(--color-text-primary)]">
        {draft.title}
      </p>
      <p className="mt-1 pl-1 text-[12px] leading-relaxed text-[var(--color-text-muted)]">
        {draft.summary}
      </p>
    </div>
  )
}

// ── Skeleton placeholder row — what's coming, before a draft lands ───────────
function DraftSkeleton({ i }: { i: number }) {
  return (
    <div
      className="card-inset relative overflow-hidden p-4"
      aria-hidden="true"
      style={{ opacity: 1 - i * 0.18 }}
    >
      <span
        className="absolute inset-y-0 left-0 w-[2px]"
        style={{ background: 'var(--color-agent-hairline)' }}
      />
      <div className="mb-3 flex items-center gap-2 pl-1">
        <span
          className="h-4 w-12 rounded-full motion-safe:animate-[scan-dot_1.8s_ease-in-out_infinite]"
          style={{ background: 'var(--color-agent-tint)', animationDelay: `${i * 200}ms` }}
        />
        <span
          className="h-3 w-20 rounded-full"
          style={{ background: 'var(--color-border-subtle)' }}
        />
      </div>
      <span
        className="mb-2 block h-3 w-[88%] rounded-full motion-safe:animate-[scan-dot_1.8s_ease-in-out_infinite]"
        style={{ background: 'var(--color-border-subtle)', animationDelay: `${i * 200 + 120}ms` }}
      />
      <span
        className="block h-3 w-[64%] rounded-full"
        style={{ background: 'var(--color-border-subtle)' }}
      />
    </div>
  )
}

export function ValuePreviewRail({
  revealedDraftIds,
  totalExpected,
}: {
  revealedDraftIds: Set<string>
  totalExpected: number
}) {
  const visibleDrafts = DEMO_DAY1.drafts.filter((d) => revealedDraftIds.has(d.id))
  const skeletonCount = Math.max(0, totalExpected - visibleDrafts.length)

  return (
    <aside
      className="agent-zone agent-zone-accent craft-enter craft-enter-3 flex h-full flex-col p-6"
      aria-label="What the crew is preparing for you"
    >
      {/* Zone header — violet structure, glanceable from across the room */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: 'var(--color-agent)' }}
          >
            <span
              className="block h-1.5 w-1.5 rounded-full motion-safe:animate-[scan-dot_1.4s_ease-in-out_infinite]"
              style={{ background: 'var(--color-agent)' }}
              aria-hidden="true"
            />
            The crew, already at work
          </span>
          <p className="text-[13px] leading-relaxed text-[var(--color-text-muted)]">
            Your plan includes hands-on fixes. Here are the first ones being
            drafted right now.
          </p>
        </div>

        {/* Count — mono for truth (M11) */}
        <span
          className="shrink-0 font-[var(--font-mono)] text-[13px] tabular-nums"
          style={{ color: 'var(--color-agent)' }}
          aria-label={`${visibleDrafts.length} of ${totalExpected} drafts ready`}
        >
          {visibleDrafts.length}
          <span className="text-[var(--color-text-disabled)]">/{totalExpected}</span>
        </span>
      </div>

      {/* Hairline divider — M12 rhythm */}
      <div
        className="my-5 h-px w-full"
        style={{ background: 'var(--color-agent-hairline)', opacity: 0.5 }}
        aria-hidden="true"
      />

      {/* Draft list: revealed cards then skeletons for what's coming */}
      <div className="flex flex-1 flex-col gap-3" aria-live="polite">
        {visibleDrafts.map((draft, i) => (
          <DraftCard key={draft.id} draft={draft} enterDelay={i * 80} />
        ))}
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <DraftSkeleton key={`skeleton-${i}`} i={i} />
        ))}
      </div>
    </aside>
  )
}

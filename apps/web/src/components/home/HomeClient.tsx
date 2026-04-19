'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ScanSearch, Clock, Bot, FileCheck2, ArrowRight } from 'lucide-react'
import { ScoreHero, ScoreHeroSkeleton } from './ScoreHero'
import { SuggestionsFeed, SuggestionsFeedSkeleton } from './SuggestionsFeed'
import type { SuggestionItem } from './SuggestionsFeed'
import { spring, fadeInUp } from '@/lib/motion'
import { cn } from '@/lib/utils'

export interface HomeActivityItem {
  id: string
  /** Short description of what happened */
  title: string
  /** Event type — drives icon */
  type: 'agent_run' | 'suggestion' | 'inbox_ready'
  /** Relative time string, e.g. "2h ago" */
  ageLabel: string
}

interface HomeInboxPreviewItem {
  id: string
  /** What the action does */
  actionLabel: string
  /** Content title */
  title: string
  ageLabel: string
}

interface HomeClientProps {
  score: number | null
  delta: number
  sparkline: number[]
  suggestions: SuggestionItem[]
  inboxPreview: HomeInboxPreviewItem[]
  credits: { used: number; cap: number }
  nextRun: string
  /** Pass true while data is loading to show skeletons */
  loading?: boolean
}

/* ─── Section heading ──────────────────────────────────────── */
function SectionHeading({
  children,
  action,
}: {
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-semibold text-foreground">{children}</h2>
      {action}
    </div>
  )
}

/* ─── Activity feed row ─────────────────────────────────────── */
const activityIcon: Record<HomeActivityItem['type'], React.ElementType> = {
  agent_run: Bot,
  suggestion: ScanSearch,
  inbox_ready: FileCheck2,
}

function ActivityRow({ item }: { item: HomeActivityItem }) {
  const Icon = activityIcon[item.type]
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EFF4FF]">
        <Icon size={13} className="text-[#3370FF]" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">{item.title}</p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{item.ageLabel}</span>
    </div>
  )
}

/* ─── Inbox preview row ─────────────────────────────────────── */
function InboxRow({ item }: { item: HomeInboxPreviewItem }) {
  return (
    <Link
      href="/inbox"
      className={cn(
        'flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0',
        'hover:bg-muted/40 -mx-1 px-1 rounded-lg',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
      )}
      aria-label={`Open: ${item.actionLabel}`}
    >
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50">
        <FileCheck2 size={13} className="text-[#10B981]" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.actionLabel}</p>
        <p className="truncate text-xs text-muted-foreground">{item.title}</p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{item.ageLabel}</span>
    </Link>
  )
}

/* ─── Empty state (no scan yet) ─────────────────────────────── */
function NoScanYet() {
  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={spring.subtle}
      className={cn(
        'flex min-h-[420px] flex-col items-center justify-center',
        'rounded-[20px] border border-dashed border-border bg-muted/20 p-8 text-center',
      )}
    >
      <span
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF4FF]"
        aria-hidden="true"
      >
        <ScanSearch size={32} className="text-[#3370FF]" />
      </span>
      {/* h1 lives here because ScoreHero h1 isn't rendered in this state */}
      <h1 className="mb-2 text-xl font-semibold text-foreground">Run your first scan</h1>
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Beamix checks every major AI search engine to find where your business is missing. It takes
        about 60 seconds.
      </p>
      <Link
        href="/scan"
        className={cn(
          'inline-flex items-center gap-2 rounded-lg bg-[#3370FF] px-5 py-2.5 text-sm font-medium text-white',
          'hover:bg-[#2960DB] transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2',
          'active:scale-[0.98]',
        )}
      >
        Scan your business
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </motion.div>
  )
}

/* ─── Loading skeleton ──────────────────────────────────────── */
function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <ScoreHeroSkeleton />
      <div>
        <div className="mb-4 h-5 w-24 animate-pulse rounded bg-muted" />
        <SuggestionsFeedSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="md:col-span-3 rounded-[20px] border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-3 w-14 animate-pulse rounded bg-muted" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
              <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
              <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="md:col-span-2 rounded-[20px] border border-border bg-card p-5 shadow-sm">
          <div className="h-4 w-24 animate-pulse rounded bg-muted mb-2" />
          <div className="h-3 w-40 animate-pulse rounded bg-muted mb-6" />
          <div className="flex items-center justify-between mb-2">
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
            <div className="h-3 w-12 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────── */
export function HomeClient({
  score,
  delta,
  sparkline,
  suggestions,
  inboxPreview,
  credits,
  nextRun,
  loading = false,
}: HomeClientProps) {
  const creditPercent = Math.round((credits.used / credits.cap) * 100)
  const isHighUsage = creditPercent >= 75
  const hasData = score !== null

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <HomeSkeleton />
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <NoScanYet />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-8">
        {/* Score Hero */}
        <motion.section
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...spring.subtle, delay: 0 }}
          aria-labelledby="score-heading"
        >
          <ScoreHero score={score} delta={delta} sparkline={sparkline} />
        </motion.section>

        {/* What's next — suggestions */}
        {suggestions.length > 0 && (
          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...spring.subtle, delay: 0.06 }}
            aria-label="What's next"
          >
            <SectionHeading>What&apos;s next</SectionHeading>
            <SuggestionsFeed suggestions={suggestions} />
          </motion.section>
        )}

        {/* Bottom row: Inbox preview + Automation */}
        <motion.div
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...spring.subtle, delay: 0.12 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-5"
        >
          {/* Inbox ready — 3 cols */}
          <section
            className={cn(
              'md:col-span-3 rounded-[20px] border border-border bg-card p-5 shadow-sm',
            )}
            aria-label="Inbox — items ready for review"
          >
            <SectionHeading
              action={
                <Link
                  href="/inbox"
                  className={cn(
                    'text-xs font-medium text-[#3370FF]',
                    'hover:underline underline-offset-2',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded',
                  )}
                  aria-label="View all inbox items"
                >
                  View all
                </Link>
              }
            >
              Inbox
            </SectionHeading>

            {inboxPreview.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">Nothing waiting for review.</p>
            ) : (
              <div>
                {inboxPreview.map((item) => (
                  <InboxRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          {/* Automation status — 2 cols */}
          <section
            className={cn(
              'md:col-span-2 rounded-[20px] border border-border bg-card p-5 shadow-sm',
              'flex flex-col justify-between gap-6',
            )}
            aria-label="Automation status"
          >
            <div>
              <h2 className="text-base font-semibold text-foreground">Automation</h2>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={11} aria-hidden="true" />
                Next run:{' '}
                <span className="font-medium text-foreground">{nextRun}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Credits this month</span>
                <span
                  className={cn(
                    'text-xs font-medium font-mono',
                    isHighUsage ? 'text-amber-600' : 'text-foreground',
                  )}
                  aria-label={`${credits.used} of ${credits.cap} credits used`}
                >
                  {credits.used}
                  <span className="text-muted-foreground">/{credits.cap}</span>
                </span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={credits.used}
                aria-valuemin={0}
                aria-valuemax={credits.cap}
                aria-label={`${credits.used} of ${credits.cap} credits used`}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(creditPercent, 100)}%`,
                    backgroundColor: isHighUsage ? '#F59E0B' : '#3370FF',
                  }}
                />
              </div>
              {isHighUsage && (
                <p className="text-[11px] text-amber-600">
                  {100 - creditPercent}% remaining — consider upgrading.
                </p>
              )}
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  )
}

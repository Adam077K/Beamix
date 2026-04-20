'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { spring, fadeInUp } from '@/lib/motion'
import { KpiStripNew, type KpiStripData } from './KpiStripNew'
import { EngineBreakdownGrid, type EngineCell } from './EngineBreakdownGrid'
import { NextStepsSection, type NextStepItem } from './NextStepsSection'
import { RoadmapTab, type RoadmapAction } from './RoadmapTab'
import { ActivityFeedNew, type ActivityEvent } from './ActivityFeedNew'

// ─── Types ────────────────────────────────────────────────────────────────────

interface InboxPreviewItem {
  id: string
  title: string
  agentLabel: string
  ageLabel: string
}

interface AutomationStatus {
  nextRun: string
  creditsUsed: number
  creditsCap: number
}

export interface HomeV2Props {
  kpi: KpiStripData
  engines: EngineCell[]
  nextSteps: NextStepItem[]
  roadmapActions: RoadmapAction[]
  activityFeed: ActivityEvent[]
  inboxPreview: InboxPreviewItem[]
  automation: AutomationStatus
  businessName?: string
  isPaywalled?: boolean
}

// ─── Tab selector ─────────────────────────────────────────────────────────────

type Tab = 'overview' | 'roadmap'

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1" role="tablist" aria-label="Home views">
      {(['overview', 'roadmap'] as Tab[]).map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className={cn(
            'relative flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            active === tab
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          )}
        >
          {tab === 'overview' ? 'Overview' : 'Roadmap'}
        </button>
      ))}
    </div>
  )
}

// ─── Score hero header bar ─────────────────────────────────────────────────────

function ScoreBar({
  score,
  verdictSubtitle,
  businessName,
}: {
  score: number
  verdictSubtitle: string
  businessName?: string
}) {
  function scoreColor(s: number) {
    if (s >= 75) return '#06B6D4'
    if (s >= 50) return '#10B981'
    if (s >= 25) return '#F59E0B'
    return '#EF4444'
  }

  const color = scoreColor(score)

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-[28px] font-semibold leading-none text-gray-900 tabular-nums">
          <span style={{ color }}>{score}</span>
          <span className="text-base font-normal text-gray-300 ml-1">/100</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500 max-w-sm">{verdictSubtitle}</p>
        {businessName && (
          <p className="mt-0.5 text-xs font-medium text-gray-400">{businessName}</p>
        )}
      </div>
    </div>
  )
}

// ─── Inbox preview row ─────────────────────────────────────────────────────────

function InboxPreviewRow({ item }: { item: InboxPreviewItem }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
        <p className="text-xs text-gray-400 truncate">{item.agentLabel}</p>
      </div>
      <span className="text-xs text-gray-400 shrink-0">{item.ageLabel}</span>
    </div>
  )
}

// ─── Paywall banner ───────────────────────────────────────────────────────────

function PaywallBanner() {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex items-center justify-between gap-4">
      <p className="text-sm text-blue-800 font-medium">
        You&apos;re seeing your results — upgrade to start fixing them
      </p>
      <Link
        href="/settings/billing"
        className="shrink-0 rounded-lg bg-[#3370FF] px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
      >
        Upgrade
      </Link>
    </div>
  )
}

// ─── Empty / no-scan state ────────────────────────────────────────────────────

function NoScanYet() {
  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={spring.subtle}
      className="flex flex-col items-center justify-center min-h-[340px] rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="9" stroke="#3370FF" strokeWidth="1.5" />
          <circle cx="11" cy="11" r="4" stroke="#3370FF" strokeWidth="1.5" />
          <circle cx="11" cy="11" r="1" fill="#3370FF" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-gray-900">Setting up your workspace</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-xs leading-relaxed">
        Your first scan is running. Results appear here in a few minutes.
      </p>
    </motion.div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function HomeClientV2({
  kpi,
  engines,
  nextSteps,
  roadmapActions,
  activityFeed,
  inboxPreview,
  automation,
  businessName,
  isPaywalled,
}: HomeV2Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const hasData = kpi.score > 0

  const creditPct = Math.min(100, Math.round((automation.creditsUsed / automation.creditsCap) * 100))
  const isHighCredits = creditPct >= 75

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      {/* Paywall banner */}
      {isPaywalled && (
        <motion.div
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={spring.subtle}
          className="mb-6"
        >
          <PaywallBanner />
        </motion.div>
      )}

      {!hasData ? (
        <NoScanYet />
      ) : (
        <div className="flex flex-col gap-5 md:grid md:grid-cols-[1fr_300px] md:items-start">
          {/* ── LEFT MAIN COLUMN ── */}
          <div className="flex flex-col gap-5 min-w-0">
            {/* Score header */}
            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...spring.subtle, delay: 0 }}
            >
              <ScoreBar
                score={kpi.score}
                verdictSubtitle={kpi.verdictSubtitle}
                businessName={businessName}
              />
            </motion.div>

            {/* KPI strip */}
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...spring.subtle, delay: 0.04 }}
              aria-label="Key performance indicators"
            >
              <KpiStripNew {...kpi} />
            </motion.section>

            {/* Engine breakdown */}
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...spring.subtle, delay: 0.08 }}
              aria-label="AI engine breakdown"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">Engine breakdown</h2>
                <span className="text-xs text-gray-400">Last 7 days</span>
              </div>
              <EngineBreakdownGrid engines={engines} />
            </motion.section>

            {/* Tab selector + content */}
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...spring.subtle, delay: 0.12 }}
            >
              <TabBar active={activeTab} onChange={setActiveTab} />

              <div className="mt-4">
                {activeTab === 'overview' && (
                  <div className="flex flex-col gap-3">
                    <h2 className="text-sm font-semibold text-gray-700">
                      Here&apos;s what to fix this week
                    </h2>
                    <NextStepsSection items={nextSteps} />
                  </div>
                )}

                {activeTab === 'roadmap' && (
                  <RoadmapTab actions={roadmapActions} />
                )}
              </div>
            </motion.section>
          </div>

          {/* ── RIGHT ASIDE COLUMN ── */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* Activity feed */}
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...spring.subtle, delay: 0.1 }}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              aria-label="Recent activity"
            >
              <h2 className="mb-3 text-sm font-semibold text-gray-700">Recent activity</h2>
              <ActivityFeedNew items={activityFeed} />
            </motion.section>

            {/* Inbox preview */}
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...spring.subtle, delay: 0.14 }}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              aria-label="Inbox preview"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">Inbox</h2>
                <Link
                  href="/inbox"
                  className="text-xs font-medium text-[#3370FF] hover:underline"
                  aria-label="View all inbox items"
                >
                  View all
                </Link>
              </div>
              {inboxPreview.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No drafts yet — accept a suggestion to queue your first agent
                </p>
              ) : (
                <div>
                  {inboxPreview.map((item) => (
                    <InboxPreviewRow key={item.id} item={item} />
                  ))}
                </div>
              )}
            </motion.section>

            {/* Automation mini */}
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...spring.subtle, delay: 0.18 }}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              aria-label="Automation status"
            >
              <h2 className="mb-3 text-sm font-semibold text-gray-700">Automation</h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Next run</span>
                  <span className="text-xs font-medium text-gray-700">{automation.nextRun}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Actions used</span>
                    <span
                      className={cn(
                        'text-xs font-semibold tabular-nums',
                        isHighCredits ? 'text-amber-600' : 'text-gray-700',
                      )}
                    >
                      {automation.creditsUsed} / {automation.creditsCap}
                    </span>
                  </div>
                  <div
                    className="h-1 w-full overflow-hidden rounded-full bg-gray-100"
                    role="progressbar"
                    aria-valuenow={automation.creditsUsed}
                    aria-valuemin={0}
                    aria-valuemax={automation.creditsCap}
                    aria-label={`${automation.creditsUsed} of ${automation.creditsCap} actions used`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${creditPct}%`,
                        backgroundColor: isHighCredits ? '#F59E0B' : '#3370FF',
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      )}
    </div>
  )
}

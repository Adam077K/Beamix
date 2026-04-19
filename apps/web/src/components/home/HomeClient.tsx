'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ScoreHero } from './ScoreHero'
import { SuggestionsFeed } from './SuggestionsFeed'
import { spring, fadeInUp } from '@/lib/motion'

interface HomeSuggestion {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  estimatedRuns: number
  actionLabel: string
}

interface HomeInboxPreviewItem {
  id: string
  actionLabel: string
  title: string
  ageLabel: string
}

interface HomeClientProps {
  score: number
  delta: number
  sparkline: number[]
  suggestions: HomeSuggestion[]
  inboxPreview: HomeInboxPreviewItem[]
  credits: { used: number; cap: number }
  nextRun: string
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-lg font-medium text-gray-900">{children}</h2>
}

function InboxPreviewRow({ item }: { item: HomeInboxPreviewItem }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.actionLabel}</p>
        <p className="text-xs text-gray-500 truncate">{item.title}</p>
      </div>
      <span className="text-xs text-gray-400 flex-shrink-0 ms-auto">{item.ageLabel}</span>
    </div>
  )
}

export function HomeClient({
  score,
  delta,
  sparkline,
  suggestions,
  inboxPreview,
  credits,
  nextRun,
}: HomeClientProps) {
  const creditPercent = Math.round((credits.used / credits.cap) * 100)
  const isHighUsage = creditPercent >= 75

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-8">
        {/* Score Hero */}
        <motion.section
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...spring.subtle, delay: 0 }}
          aria-label="AI Visibility Score"
        >
          <ScoreHero score={score} delta={delta} sparkline={sparkline} />
        </motion.section>

        {/* Suggestions */}
        <motion.section
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...spring.subtle, delay: 0.06 }}
          aria-label="Next steps"
        >
          <SectionHeading>Next steps</SectionHeading>
          <SuggestionsFeed suggestions={suggestions} />
        </motion.section>

        {/* Bottom row: Inbox preview + Automation strip */}
        <motion.div
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...spring.subtle, delay: 0.12 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-5"
        >
          {/* Inbox preview (3 cols) */}
          <section
            className="md:col-span-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            aria-label="Inbox preview"
          >
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-base font-medium text-gray-900">Inbox</h2>
              <Link
                href="/inbox"
                className="text-xs font-medium text-[#3370FF] hover:underline"
                aria-label="View all inbox items"
              >
                View all →
              </Link>
            </div>

            {inboxPreview.length === 0 ? (
              <p className="pt-4 text-sm text-gray-400">Nothing waiting for review.</p>
            ) : (
              <div className="mt-2">
                {inboxPreview.map((item) => (
                  <InboxPreviewRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          {/* Automation strip (2 cols) */}
          <section
            className="md:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col justify-between gap-4"
            aria-label="Automation status"
          >
            <div>
              <h2 className="text-base font-medium text-gray-900">Automation</h2>
              <p className="mt-1 text-xs text-gray-500">
                Next run:{' '}
                <span className="font-medium text-gray-700">{nextRun}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Credits this month</span>
                <span
                  className={`text-xs font-medium ${isHighUsage ? 'text-amber-600' : 'text-gray-600'}`}
                >
                  {credits.used} / {credits.cap}
                </span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
                role="progressbar"
                aria-valuenow={credits.used}
                aria-valuemin={0}
                aria-valuemax={credits.cap}
                aria-label={`${credits.used} of ${credits.cap} credits used`}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(creditPercent, 100)}%`,
                    backgroundColor: isHighUsage ? '#F59E0B' : '#3370FF',
                  }}
                />
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  )
}

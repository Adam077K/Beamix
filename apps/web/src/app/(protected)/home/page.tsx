import { HomeClient } from '@/components/home/HomeClient'
import type { SuggestionItem } from '@/components/home/SuggestionsFeed'

// ── Mock data (replace with real Supabase fetch when wiring backend) ──────────
const mockScore = 62
const mockDelta = +5
const mockSparkline = [41, 47, 51, 49, 54, 57, 59, 62]

const mockSuggestions: SuggestionItem[] = [
  {
    id: 's-1',
    title: 'Add FAQ to your pricing page',
    description:
      'ChatGPT surfaces "how much does Beamix cost?" as a common query — no structured FAQ ranks for it. Adding FAQ schema can lift AI citation rate by ~30%.',
    impact: 'high',
    estimatedRuns: 1,
    actionLabel: 'Generate FAQ content',
  },
  {
    id: 's-2',
    title: 'Refresh your homepage copy',
    description:
      'Last updated 94 days ago. Competitors publish weekly. Fresh, date-stamped content signals recency to AI search engines and improves citation odds.',
    impact: 'medium',
    estimatedRuns: 2,
    actionLabel: 'Rewrite homepage',
  },
  {
    id: 's-3',
    title: 'Claim your Yelp listing',
    description:
      'Presence Planner found 3 directories with incomplete or unclaimed profiles. Listings with verified details are cited 2× more often by AI engines.',
    impact: 'medium',
    estimatedRuns: 0,
    actionLabel: 'Fix directory listings',
  },
]

const mockInboxPreview = [
  {
    id: 'i-1',
    actionLabel: 'Rewrite homepage hero',
    title: 'Homepage rewrite ready for review',
    ageLabel: '2h ago',
  },
  {
    id: 'i-2',
    actionLabel: 'Pricing FAQ content',
    title: '8-question FAQ draft ready',
    ageLabel: '5h ago',
  },
  {
    id: 'i-3',
    actionLabel: 'Directory listing audit',
    title: '3 gaps found across Yelp, G2, Capterra',
    ageLabel: 'yesterday',
  },
]

const mockCredits = { used: 28, cap: 90 }
const mockNextRun = 'tomorrow at 09:00'

export default function HomePage() {
  return (
    <HomeClient
      score={mockScore}
      delta={mockDelta}
      sparkline={mockSparkline}
      suggestions={mockSuggestions}
      inboxPreview={mockInboxPreview}
      credits={mockCredits}
      nextRun={mockNextRun}
    />
  )
}

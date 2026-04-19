import { HomeClient } from '@/components/home/HomeClient'

const mockScore = 62
const mockDelta = +5
const mockSparkline = [45, 48, 52, 50, 55, 58, 60, 62]

const mockSuggestions = [
  {
    id: '1',
    title: 'Add FAQ to your pricing page',
    description:
      'ChatGPT asks "how much does beamix cost" — no FAQ ranks. Adding structured FAQ content can lift AI citation rate by ~30%.',
    impact: 'high' as const,
    estimatedRuns: 1,
    actionLabel: 'Generate FAQ page',
  },
  {
    id: '2',
    title: 'Refresh your homepage copy',
    description:
      'Last updated 94 days ago. Competitors publish weekly. Fresh content signals recency to AI search engines.',
    impact: 'medium' as const,
    estimatedRuns: 2,
    actionLabel: 'Optimize homepage',
  },
  {
    id: '3',
    title: 'Claim your Yelp listing',
    description:
      'Review Presence Planner found 3 directories with missing profiles. Unclaimed listings miss citation opportunities.',
    impact: 'medium' as const,
    estimatedRuns: 0,
    actionLabel: 'Check directory listings',
  },
]

const mockInboxPreview = [
  {
    id: 'i1',
    actionLabel: 'Optimize your homepage',
    title: 'Homepage rewrite ready',
    ageLabel: '2h ago',
  },
  {
    id: 'i2',
    actionLabel: 'Generate FAQ page',
    title: 'Pricing FAQ ready',
    ageLabel: '5h ago',
  },
  {
    id: 'i3',
    actionLabel: 'Check directory listings',
    title: '3 directories found',
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

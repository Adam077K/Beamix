import { HomeClientV2 } from '@/components/home/HomeClientV2'
import type { HomeV2Props } from '@/components/home/HomeClientV2'

const mockData: HomeV2Props = {
  businessName: 'Volta Coffee Roasters',

  kpi: {
    score: 62,
    scoreDelta: 5,
    verdict: 'Fair',
    verdictSubtitle: 'Cited in 3 of 7 AI engines. Ranking behind 2 competitors on pricing queries.',
    citationsThisMonth: 41,
    citationsLastMonth: 28,
    impressionsAdded: 1200,
    creditsUsed: 28,
    creditsCap: 90,
    creditsResetDays: 14,
  },

  engines: [
    { engine: 'ChatGPT',    mentionRate: 71, weeklyDelta: 4,  sparkline: [60, 62, 64, 66, 68, 69, 71] },
    { engine: 'Gemini',     mentionRate: 48, weeklyDelta: -2, sparkline: [52, 51, 50, 49, 50, 49, 48] },
    { engine: 'Perplexity', mentionRate: 83, weeklyDelta: 7,  sparkline: [70, 72, 74, 77, 79, 81, 83] },
    { engine: 'Claude',     mentionRate: 35, weeklyDelta: 0,  sparkline: [34, 35, 35, 36, 34, 35, 35] },
  ],

  nextSteps: [
    {
      id: 'n1',
      title: 'Add FAQ to your pricing page',
      description:
        'ChatGPT asks "how much does Volta Coffee cost" — no FAQ ranks. Adding structured FAQ content can lift AI citation rate by ~30%.',
      impact: 'high',
      estimatedRuns: 1,
      actionLabel: 'Generate FAQ page',
    },
    {
      id: 'n2',
      title: 'Refresh your homepage copy',
      description:
        'Last updated 94 days ago. Competitors publish weekly. Fresh content signals recency to AI search engines.',
      impact: 'medium',
      estimatedRuns: 2,
      actionLabel: 'Optimize homepage',
    },
    {
      id: 'n3',
      title: 'Claim your Yelp listing',
      description:
        'Review Presence Planner found 3 directories with missing profiles. Unclaimed listings miss citation opportunities.',
      impact: 'medium',
      estimatedRuns: 0,
      actionLabel: 'Check directory listings',
    },
  ],

  // RoadmapTab uses its own internal mock data when passed an empty array
  roadmapActions: [],

  activityFeed: [
    {
      id: 'a1',
      type: 'scan_complete',
      message: 'Weekly scan completed — score up 5 pts',
      relativeTime: '2h ago',
    },
    {
      id: 'a2',
      type: 'agent_run',
      message: 'Homepage rewrite ready for review',
      relativeTime: '5h ago',
    },
    {
      id: 'a3',
      type: 'competitor_alert',
      message: 'Rival Roasters gained 3 new citations this week',
      relativeTime: 'yesterday',
      isAlert: true,
    },
    {
      id: 'a4',
      type: 'content_ranking',
      message: 'FAQ page now ranking in Perplexity',
      relativeTime: '2 days ago',
    },
  ],

  inboxPreview: [
    {
      id: 'i1',
      title: 'Homepage rewrite ready',
      agentLabel: 'Content Architect',
      ageLabel: '2h ago',
    },
    {
      id: 'i2',
      title: 'Pricing FAQ ready',
      agentLabel: 'FAQ Builder',
      ageLabel: '5h ago',
    },
    {
      id: 'i3',
      title: '3 directories found',
      agentLabel: 'Presence Planner',
      ageLabel: 'yesterday',
    },
  ],

  automation: {
    nextRun: 'tomorrow at 09:00',
    creditsUsed: 28,
    creditsCap: 90,
  },
}

export default function HomePage() {
  return <HomeClientV2 {...mockData} />
}

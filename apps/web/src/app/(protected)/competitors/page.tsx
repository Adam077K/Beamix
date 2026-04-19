import { CompetitorsClient } from '@/components/competitors/CompetitorsClient'

const mockCompetitors = [
  {
    id: 'c1',
    name: 'RivalCo',
    url: 'rivalco.com',
    appearanceRate: 0.36,
    queriesWhereAppears: [
      'best AI visibility tool',
      'beamix alternative',
      'AI SEO platform',
      'how to rank in ChatGPT',
      'schema generator tools',
    ],
    fourWeekTrend: [4, 5, 7, 8],
  },
  {
    id: 'c2',
    name: 'Challenger.io',
    url: 'challenger.io',
    appearanceRate: 0.22,
    queriesWhereAppears: [
      'AI search analytics',
      'track LLM mentions',
      'GEO platform',
    ],
    fourWeekTrend: [3, 4, 4, 5],
  },
  {
    id: 'c3',
    name: 'NewcomerLabs',
    url: 'newcomerlabs.ai',
    appearanceRate: 0.14,
    queriesWhereAppears: [
      'affordable AI SEO',
      'AI visibility for startups',
      'cheap GEO tool',
    ],
    fourWeekTrend: [1, 2, 3, 3],
  },
]

const mockMissedQueries = [
  'best AI visibility tool',
  'how to rank in ChatGPT',
  'beamix alternative',
  'AI SEO platform',
]

export default function CompetitorsPage() {
  return (
    <CompetitorsClient
      competitors={mockCompetitors}
      missedQueries={mockMissedQueries}
    />
  )
}

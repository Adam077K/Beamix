import { CompetitorsClient } from '@/components/competitors/CompetitorsClient'
import type { Competitor, TrackedQuery, SovWeek } from '@/components/competitors/types'

// ─── Mock data ────────────────────────────────────────────────────────────────
// Realistic SMB GEO scenario — replaced when Supabase RPC is available

const mockCompetitors: Competitor[] = [
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
    engineRates: {
      ChatGPT: 0.62,
      Gemini: 0.41,
      Perplexity: 0.55,
      Claude: 0.28,
      AIO: 0.33,
      Grok: 0.19,
    },
    publishCadence: '3–4 articles/week',
    queryCoverage: 14,
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
    engineRates: {
      ChatGPT: 0.38,
      Gemini: 0.24,
      Perplexity: 0.31,
      Claude: 0.14,
      AIO: 0.21,
    },
    publishCadence: '1–2 articles/week',
    queryCoverage: 9,
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
    engineRates: {
      ChatGPT: 0.18,
      Gemini: 0.12,
      Perplexity: 0.09,
    },
    publishCadence: '2–3 articles/week',
    queryCoverage: 6,
  },
]

const mockYourSoV = 28
const mockYourSoVTrend = [22, 24, 25, 28]
const mockYourEngineRates = {
  ChatGPT: 0.45,
  Gemini: 0.31,
  Perplexity: 0.38,
  Claude: 0.52,
  AIO: 0.27,
  Grok: 0.14,
  'You.com': 0.08,
} as const

const mockTrackedQueries: TrackedQuery[] = [
  {
    query: 'best AI visibility tool',
    volume: 1200,
    enginePresence: { ChatGPT: 0.78, Gemini: 0.52, Perplexity: 0.64 },
    competitorPresence: ['RivalCo', 'Challenger.io'],
    youPresent: false,
    gap: 3,
  },
  {
    query: 'how to rank in ChatGPT',
    volume: 890,
    enginePresence: { ChatGPT: 0.91, Gemini: 0.44, Perplexity: 0.71 },
    competitorPresence: ['RivalCo'],
    youPresent: false,
    gap: 2,
  },
  {
    query: 'GEO platform',
    volume: 650,
    enginePresence: { ChatGPT: 0.55, Gemini: 0.38, Perplexity: 0.48 },
    competitorPresence: ['Challenger.io'],
    youPresent: true,
    gap: 1,
  },
  {
    query: 'AI SEO platform',
    volume: 540,
    enginePresence: { ChatGPT: 0.62, Gemini: 0.29, Perplexity: 0.41 },
    competitorPresence: ['RivalCo', 'Challenger.io'],
    youPresent: false,
    gap: 2,
  },
  {
    query: 'track LLM mentions',
    volume: 420,
    enginePresence: { ChatGPT: 0.44, Gemini: 0.33, Perplexity: 0.51 },
    competitorPresence: ['Challenger.io'],
    youPresent: true,
    gap: 0,
  },
  {
    query: 'AI search analytics',
    volume: 380,
    enginePresence: { ChatGPT: 0.39, Gemini: 0.22, Perplexity: 0.35 },
    competitorPresence: ['Challenger.io', 'NewcomerLabs'],
    youPresent: false,
    gap: 2,
  },
]

// 12-week SoV trend
const mockSovTrend: SovWeek[] = [
  { week: 'W1', you: 18, competitors: { RivalCo: 28, 'Challenger.io': 19, NewcomerLabs: 10 } },
  { week: 'W2', you: 19, competitors: { RivalCo: 29, 'Challenger.io': 20, NewcomerLabs: 10 } },
  { week: 'W3', you: 20, competitors: { RivalCo: 30, 'Challenger.io': 20, NewcomerLabs: 11 } },
  { week: 'W4', you: 22, competitors: { RivalCo: 31, 'Challenger.io': 21, NewcomerLabs: 11 } },
  { week: 'W5', you: 21, competitors: { RivalCo: 32, 'Challenger.io': 20, NewcomerLabs: 12 } },
  { week: 'W6', you: 23, competitors: { RivalCo: 33, 'Challenger.io': 21, NewcomerLabs: 12 } },
  { week: 'W7', you: 24, competitors: { RivalCo: 34, 'Challenger.io': 22, NewcomerLabs: 13 } },
  { week: 'W8', you: 24, competitors: { RivalCo: 35, 'Challenger.io': 21, NewcomerLabs: 13 } },
  { week: 'W9', you: 25, competitors: { RivalCo: 35, 'Challenger.io': 22, NewcomerLabs: 13 } },
  { week: 'W10', you: 26, competitors: { RivalCo: 36, 'Challenger.io': 22, NewcomerLabs: 14 } },
  { week: 'W11', you: 27, competitors: { RivalCo: 36, 'Challenger.io': 22, NewcomerLabs: 14 } },
  { week: 'W12', you: 28, competitors: { RivalCo: 36, 'Challenger.io': 22, NewcomerLabs: 14 } },
]

const mockMissedQueries = [
  'best AI visibility tool',
  'how to rank in ChatGPT',
  'AI SEO platform',
  'AI search analytics',
]

export default function CompetitorsPage() {
  return (
    <CompetitorsClient
      competitors={mockCompetitors}
      yourSoV={mockYourSoV}
      yourSoVTrend={mockYourSoVTrend}
      yourEngineRates={mockYourEngineRates}
      trackedQueries={mockTrackedQueries}
      sovTrend={mockSovTrend}
      missedQueries={mockMissedQueries}
    />
  )
}

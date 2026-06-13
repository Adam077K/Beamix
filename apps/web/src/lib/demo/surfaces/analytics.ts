import type {
  DemoAnalytics,
  EngineVisibilityPoint,
  SovTrendPoint,
  AvgPositionStat,
  TopicRankCell,
  AnalyticsDrillData,
} from './types'

/**
 * DEMO_ANALYTICS — Analytics surface fixture
 * Business: Bright Smile Dental, Ramat Gan
 *
 * Story arc: continues from DEMO_COMPETITORS.
 * SoV climbs 9% → 23% over 8 weekly snapshots.
 * Two violet agent-event annotations mark the weeks content + schema agents ran.
 * Smile Center leads at 34% but the gap is narrowing to 11pp.
 */

// ---------------------------------------------------------------------------
// Visibility trend — per-engine weekly values
// ---------------------------------------------------------------------------

const visibilityTrend: EngineVisibilityPoint[] = [
  {
    date: '2026-04-28',
    values: { ChatGPT: 14, Gemini: 8, Perplexity: 18, Claude: 6, 'AI Overviews': 5 },
  },
  {
    date: '2026-05-05',
    values: { ChatGPT: 16, Gemini: 9, Perplexity: 19, Claude: 7, 'AI Overviews': 6 },
  },
  {
    date: '2026-05-12',
    values: { ChatGPT: 18, Gemini: 10, Perplexity: 22, Claude: 8, 'AI Overviews': 6 },
    agentEvent: { label: 'Content agent ran.' },
  },
  {
    date: '2026-05-19',
    values: { ChatGPT: 22, Gemini: 13, Perplexity: 24, Claude: 9, 'AI Overviews': 8 },
  },
  {
    date: '2026-05-26',
    values: { ChatGPT: 24, Gemini: 15, Perplexity: 26, Claude: 10, 'AI Overviews': 9 },
  },
  {
    date: '2026-06-02',
    values: { ChatGPT: 26, Gemini: 16, Perplexity: 29, Claude: 12, 'AI Overviews': 10 },
    agentEvent: { label: 'Schema agent ran.' },
  },
  {
    date: '2026-06-09',
    values: { ChatGPT: 28, Gemini: 19, Perplexity: 31, Claude: 14, 'AI Overviews': 11 },
  },
  {
    date: '2026-06-16',
    values: { ChatGPT: 28, Gemini: 19, Perplexity: 31, Claude: 14, 'AI Overviews': 11 },
  },
]

// ---------------------------------------------------------------------------
// SoV trend — stacked competitor chart
// ---------------------------------------------------------------------------

const sovTrend: SovTrendPoint[] = [
  {
    date: '2026-04-28',
    us: 9,
    competitors: { 'Smile Center': 36, 'Dental Plus': 28, 'Ramat Gan Dental': 18, Others: 9 },
  },
  {
    date: '2026-05-05',
    us: 11,
    competitors: { 'Smile Center': 36, 'Dental Plus': 27, 'Ramat Gan Dental': 18, Others: 8 },
  },
  {
    date: '2026-05-12',
    us: 13,
    competitors: { 'Smile Center': 35, 'Dental Plus': 27, 'Ramat Gan Dental': 18, Others: 7 },
    agentEvent: { label: 'Content agent ran.' },
  },
  {
    date: '2026-05-19',
    us: 16,
    competitors: { 'Smile Center': 35, 'Dental Plus': 26, 'Ramat Gan Dental': 17, Others: 6 },
  },
  {
    date: '2026-05-26',
    us: 18,
    competitors: { 'Smile Center': 35, 'Dental Plus': 26, 'Ramat Gan Dental': 16, Others: 5 },
  },
  {
    date: '2026-06-02',
    us: 20,
    competitors: { 'Smile Center': 34, 'Dental Plus': 27, 'Ramat Gan Dental': 14, Others: 5 },
    agentEvent: { label: 'Schema agent ran.' },
  },
  {
    date: '2026-06-09',
    us: 23,
    competitors: { 'Smile Center': 34, 'Dental Plus': 27, 'Ramat Gan Dental': 11, Others: 5 },
  },
  {
    date: '2026-06-16',
    us: 23,
    competitors: { 'Smile Center': 34, 'Dental Plus': 27, 'Ramat Gan Dental': 11, Others: 5 },
  },
]

// ---------------------------------------------------------------------------
// Per-engine average positions (current period, lower = better)
// ---------------------------------------------------------------------------

const avgPositions: AvgPositionStat[] = [
  {
    engine: 'Perplexity',
    avgPosition: 1.4,
    sparkline: [2.1, 1.9, 1.7, 1.5, 1.4],
  },
  {
    engine: 'ChatGPT',
    avgPosition: 1.9,
    sparkline: [2.8, 2.5, 2.4, 2.1, 1.9],
  },
  {
    engine: 'Claude',
    avgPosition: 2.3,
    sparkline: [3.1, 3.0, 2.8, 2.5, 2.3],
  },
  {
    engine: 'Gemini',
    avgPosition: 2.9,
    sparkline: [3.6, 3.5, 3.3, 3.1, 2.9],
  },
  {
    engine: 'AI Overviews',
    avgPosition: 3.8,
    sparkline: [4.4, 4.3, 4.2, 4.0, 3.8],
  },
]

// ---------------------------------------------------------------------------
// Topic × engine ranking matrix (6 topics × 5 engines)
// ---------------------------------------------------------------------------

const TOPICS = [
  'Emergency dentist',
  'Teeth whitening',
  'Invisalign',
  'Dental implants',
  'Pediatric dentist',
  'Root canal',
]

const ENGINES = ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'AI Overviews']

// [topic][engine] => avgRank
const rankGrid: Record<string, Record<string, number>> = {
  'Emergency dentist': {
    ChatGPT: 1.2,
    Gemini: 1.8,
    Perplexity: 1.1,
    Claude: 2.0,
    'AI Overviews': 2.4,
  },
  'Teeth whitening': {
    ChatGPT: 2.1,
    Gemini: 3.4,
    Perplexity: 1.8,
    Claude: 3.0,
    'AI Overviews': 4.2,
  },
  Invisalign: {
    ChatGPT: 3.2,
    Gemini: 4.1,
    Perplexity: 2.6,
    Claude: 3.8,
    'AI Overviews': 5.1,
  },
  'Dental implants': {
    ChatGPT: 2.8,
    Gemini: 3.9,
    Perplexity: 2.2,
    Claude: 2.9,
    'AI Overviews': 4.6,
  },
  'Pediatric dentist': {
    ChatGPT: 1.6,
    Gemini: 2.3,
    Perplexity: 1.4,
    Claude: 2.1,
    'AI Overviews': 3.1,
  },
  'Root canal': {
    ChatGPT: 2.4,
    Gemini: 3.1,
    Perplexity: 1.9,
    Claude: 2.5,
    'AI Overviews': 3.7,
  },
}

function rankToScoreBand(rank: number): TopicRankCell['scoreBand'] {
  if (rank <= 1.5) return 'excellent'
  if (rank <= 2.5) return 'good'
  if (rank <= 3.5) return 'fair'
  return 'critical'
}

const topicMatrix: TopicRankCell[] = TOPICS.flatMap((topic) =>
  ENGINES.map((engine) => {
    const avgRank = rankGrid[topic]?.[engine] ?? 4.5
    return {
      topic,
      engine,
      avgRank,
      scoreBand: rankToScoreBand(avgRank),
    }
  }),
)

// ---------------------------------------------------------------------------
// Drill data (3 pre-built datasets)
// ---------------------------------------------------------------------------

const drillData: Record<string, AnalyticsDrillData> = {
  'Emergency dentist__Perplexity': {
    topic: 'Emergency dentist',
    engine: 'Perplexity',
    promptsTested: [
      'emergency dentist Ramat Gan open now',
      'dentist emergency appointment today Israel',
      'urgent dental care Gush Dan',
    ],
    ourSnippet:
      'Bright Smile Dental in Ramat Gan offers same-day emergency appointments. Call or book online for immediate care including broken teeth, severe toothache, and lost crowns.',
    competitorSnippet:
      'Smile Center provides 24-hour emergency dental services in central Israel with walk-in hours most evenings.',
    competitorName: 'Smile Center',
    agentNote:
      'Adding structured FAQPage schema targeting "same-day emergency dentist" could improve ranking for urgent-intent queries on ChatGPT.',
  },
  'Teeth whitening__ChatGPT': {
    topic: 'Teeth whitening',
    engine: 'ChatGPT',
    promptsTested: [
      'professional teeth whitening cost Ramat Gan',
      'best teeth whitening dentist near me Israel',
      'how much does whitening cost at a dentist Israel',
    ],
    ourSnippet:
      'Bright Smile Dental offers in-office Zoom whitening sessions. Results in one visit. Contact the clinic for current pricing.',
    competitorSnippet:
      'Smile Center lists whitening packages from ₪400 to ₪800 with before/after photos and an online booking tool for consultations.',
    competitorName: 'Smile Center',
    agentNote:
      'ChatGPT favors pages with explicit pricing ranges and before/after evidence. A dedicated whitening landing page with price ranges would likely move this from position 2.1 to top-3.',
  },
  'Invisalign__Perplexity': {
    topic: 'Invisalign',
    engine: 'Perplexity',
    promptsTested: [
      'Invisalign provider Ramat Gan',
      'clear aligners dentist Israel',
      'Invisalign vs braces cost Israel dentist',
    ],
    ourSnippet:
      'Bright Smile Dental is a certified Invisalign provider. Treatment plans start with a complimentary digital scan.',
    competitorSnippet:
      'Dental Plus has an Invisalign Platinum Provider badge, case gallery, and a cost calculator starting from ₪6,500 for mild cases.',
    competitorName: 'Dental Plus',
    agentNote:
      'Perplexity surfaces providers with provider-tier badges and galleries. Updating the Invisalign page with case count and provider tier details is the highest-leverage action here.',
  },
}

// ---------------------------------------------------------------------------
// Top-level export
// ---------------------------------------------------------------------------

export const DEMO_ANALYTICS: DemoAnalytics = {
  heroSov: 23,
  sovDelta: 6,
  visibilityTrend,
  sovTrend,
  avgPositions,
  topicMatrix,
  drillData,
}

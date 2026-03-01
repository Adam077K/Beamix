import type {
  ScanResults,
  EngineResult,
  QuickWin,
  LeaderboardEntry,
  LLMEngine,
} from '@/lib/types'
import { INDUSTRY_COMPETITORS } from '@/constants/industries'

/**
 * Simple seeded PRNG (mulberry32) for deterministic mock results.
 * Same scan_id always produces the same results.
 */
function seededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  return function () {
    h |= 0
    h = (h + 0x6d2b79f5) | 0
    let t = Math.imul(h ^ (h >>> 15), 1 | h)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5)
  return shuffled.slice(0, n)
}

const ENGINES: LLMEngine[] = ['chatgpt', 'gemini', 'perplexity', 'claude']

const ENGINE_LABELS: Record<LLMEngine, string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  claude: 'Claude',
}

const SENTIMENTS = ['positive', 'neutral', 'negative'] as const

const QUICK_WIN_TEMPLATES: Array<{
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  engine_benefit?: string
}> = [
  {
    title: 'Add FAQ Schema Markup',
    description:
      'Structured FAQ data helps AI engines understand and cite your expertise. Add JSON-LD FAQ schema to your homepage.',
    impact: 'high',
    engine_benefit: 'Especially effective for Google AI Overviews and Perplexity',
  },
  {
    title: 'Create a "Best of" Comparison Page',
    description:
      'AI engines love authoritative comparison content. Create a page comparing your services to alternatives in your area.',
    impact: 'high',
    engine_benefit: 'Improves visibility across all engines',
  },
  {
    title: 'Optimize Google Business Profile',
    description:
      'A complete GBP with recent reviews, photos, and accurate categories directly influences AI engine citations.',
    impact: 'high',
    engine_benefit: 'Critical for ChatGPT and Gemini local results',
  },
  {
    title: 'Publish Expert Blog Content',
    description:
      'Write 3-5 authoritative blog posts answering common questions in your industry. AI engines prioritize expertise signals.',
    impact: 'medium',
    engine_benefit: 'Perplexity and Claude weight original content heavily',
  },
  {
    title: 'Get Listed on Industry Directories',
    description:
      'AI engines cross-reference multiple sources. Being listed on 5+ relevant directories boosts your citation likelihood.',
    impact: 'medium',
    engine_benefit: 'Builds trust signals across all engines',
  },
  {
    title: 'Add Customer Testimonials Page',
    description:
      'Dedicated testimonials with full names and specifics give AI engines quotable proof of your quality.',
    impact: 'medium',
  },
  {
    title: 'Improve Page Load Speed',
    description:
      'AI engines favor sources from fast, well-structured sites. Aim for under 2s load time.',
    impact: 'low',
  },
  {
    title: 'Add Location-Specific Landing Pages',
    description:
      'Create separate pages for each service area to capture location-specific AI queries.',
    impact: 'high',
    engine_benefit: 'Significant boost for Gemini and ChatGPT local queries',
  },
]

function generateEngineResult(
  engine: LLMEngine,
  businessName: string,
  sector: string,
  rng: () => number
): EngineResult {
  const isMentioned = rng() > 0.55
  const competitors = INDUSTRY_COMPETITORS[sector] ?? [
    'Competitor A',
    'Competitor B',
    'Competitor C',
  ]

  const mentionedCompetitors = pickN(
    competitors,
    Math.floor(rng() * 3) + 1,
    rng
  )

  const snippets = isMentioned
    ? [
        `${businessName} is recognized as a notable provider in the ${sector} space, known for quality service and customer satisfaction.`,
        `Among the top options, ${businessName} stands out for its strong reputation and comprehensive offerings.`,
        `${businessName} is frequently recommended by customers in the area, particularly for their professional approach.`,
      ]
    : [
        `The top providers in this area include ${mentionedCompetitors.slice(0, 2).join(' and ')}, both known for excellent service.`,
        `Based on customer reviews and industry data, ${mentionedCompetitors[0]} leads the market in this category.`,
        `Several established businesses serve this area, with ${mentionedCompetitors[0]} being the most frequently cited option.`,
      ]

  return {
    engine,
    is_mentioned: isMentioned,
    mention_position: isMentioned ? Math.floor(rng() * 5) + 1 : null,
    sentiment: isMentioned
      ? pick([...SENTIMENTS], rng)
      : null,
    competitors_mentioned: mentionedCompetitors,
    response_snippet: pick(snippets, rng),
  }
}

function generateLeaderboard(
  businessName: string,
  userScore: number,
  sector: string,
  rng: () => number
): LeaderboardEntry[] {
  const competitors = INDUSTRY_COMPETITORS[sector] ?? [
    'Competitor A',
    'Competitor B',
    'Competitor C',
    'Competitor D',
    'Competitor E',
  ]

  const entries: LeaderboardEntry[] = competitors.slice(0, 5).map((name) => ({
    name,
    score: Math.round((rng() * 60 + 30) * 10) / 10,
    rank: 0,
    is_user: false,
  }))

  entries.push({
    name: businessName,
    score: userScore,
    rank: 0,
    is_user: true,
  })

  entries.sort((a, b) => b.score - a.score)
  entries.forEach((e, i) => {
    e.rank = i + 1
  })

  return entries
}

export async function runMockScan(
  scanId: string,
  businessName: string,
  sector: string
): Promise<ScanResults> {
  // Simulate async LLM processing delay (3-5s)
  const delay = 3000 + Math.random() * 2000
  await new Promise((resolve) => setTimeout(resolve, delay))

  return generateScanResults(scanId, businessName, sector)
}

function generateScanResults(
  scanId: string,
  businessName: string,
  sector: string
): ScanResults {
  const rng = seededRandom(scanId)

  const engines = ENGINES.map((engine) =>
    generateEngineResult(engine, businessName, sector, rng)
  )

  const mentionedCount = engines.filter((e) => e.is_mentioned).length
  const visibilityScore = Math.round(
    (mentionedCount / engines.length) * 70 + rng() * 30
  )

  const quickWins = pickN(QUICK_WIN_TEMPLATES, 3 + Math.floor(rng() * 2), rng)

  const competitors = INDUSTRY_COMPETITORS[sector] ?? ['Top Competitor']
  const topCompetitor = pick(competitors, rng)
  const topCompetitorScore = Math.round(
    Math.min(visibilityScore + 15 + rng() * 20, 95) * 10
  ) / 10

  const leaderboard = generateLeaderboard(
    businessName,
    visibilityScore,
    sector,
    rng
  )

  const userEntry = leaderboard.find((e) => e.is_user)

  return {
    visibility_score: visibilityScore,
    engines,
    top_competitor: topCompetitor,
    top_competitor_score: topCompetitorScore,
    quick_wins: quickWins,
    rank: userEntry?.rank ?? leaderboard.length,
    total_businesses: leaderboard.length,
    leaderboard,
  }
}

export { ENGINE_LABELS }

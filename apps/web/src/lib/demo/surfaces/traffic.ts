import type {
  DemoTraffic,
  CrawlerTrend,
  ReferralAttribution,
  ContentPerformance,
  TrafficDrillRow,
} from './types'

/**
 * DEMO_TRAFFIC — AI Traffic & Crawler Analytics fixture
 * Business: Bright Smile Dental, Ramat Gan
 *
 * Story arc: continues BSd growth story. GPTBot crawls spiked after sitemap
 * submission (week of 2026-05-12). AI-referred sessions up +18% vs previous
 * 30-day period following FAQ and schema agent deployments.
 * Date spine: 2026-05-12 → 2026-06-16 weekly.
 */

// ---------------------------------------------------------------------------
// Crawler trend — per-bot weekly hit counts
// ---------------------------------------------------------------------------

const crawlerTrend: CrawlerTrend[] = [
  {
    bot: 'GPTBot',
    points: [
      { date: '2026-05-12', hits: 142, agentEvent: { label: 'Sitemap submitted.' } },
      { date: '2026-05-19', hits: 198 },
      { date: '2026-05-26', hits: 221 },
      { date: '2026-06-02', hits: 247, agentEvent: { label: 'Schema agent ran.' } },
      { date: '2026-06-09', hits: 284 },
      { date: '2026-06-16', hits: 291 },
    ],
  },
  {
    bot: 'ClaudeBot',
    points: [
      { date: '2026-05-12', hits: 87 },
      { date: '2026-05-19', hits: 94 },
      { date: '2026-05-26', hits: 101 },
      { date: '2026-06-02', hits: 118 },
      { date: '2026-06-09', hits: 129 },
      { date: '2026-06-16', hits: 133 },
    ],
  },
  {
    bot: 'PerplexityBot',
    points: [
      { date: '2026-05-12', hits: 63 },
      { date: '2026-05-19', hits: 79 },
      { date: '2026-05-26', hits: 88 },
      { date: '2026-06-02', hits: 97 },
      { date: '2026-06-09', hits: 112 },
      { date: '2026-06-16', hits: 118 },
    ],
  },
  {
    bot: 'Google-Extended',
    points: [
      { date: '2026-05-12', hits: 54 },
      { date: '2026-05-19', hits: 59 },
      { date: '2026-05-26', hits: 61 },
      { date: '2026-06-02', hits: 68 },
      { date: '2026-06-09', hits: 74 },
      { date: '2026-06-16', hits: 77 },
    ],
  },
  {
    bot: 'Bingbot',
    points: [
      { date: '2026-05-12', hits: 38 },
      { date: '2026-05-19', hits: 41 },
      { date: '2026-05-26', hits: 43 },
      { date: '2026-06-02', hits: 46 },
      { date: '2026-06-09', hits: 49 },
      { date: '2026-06-16', hits: 51 },
    ],
  },
  {
    bot: 'CCBot',
    points: [
      { date: '2026-05-12', hits: 19 },
      { date: '2026-05-19', hits: 22 },
      { date: '2026-05-26', hits: 24 },
      { date: '2026-06-02', hits: 27 },
      { date: '2026-06-09', hits: 29 },
      { date: '2026-06-16', hits: 30 },
    ],
  },
]

// ---------------------------------------------------------------------------
// Per-engine referral attribution (last 30 days)
// ---------------------------------------------------------------------------

const referralAttribution: ReferralAttribution[] = [
  { engine: 'ChatGPT', sessions: 487, conversions: 38 },
  { engine: 'Perplexity', sessions: 361, conversions: 29 },
  { engine: 'Gemini', sessions: 254, conversions: 17 },
  { engine: 'Claude', sessions: 132, conversions: 11 },
  { engine: 'AI Overviews', sessions: 50, conversions: 3 },
]

// ---------------------------------------------------------------------------
// Top content pages by crawl hits + citations
// ---------------------------------------------------------------------------

const contentPerformance: ContentPerformance[] = [
  { path: '/emergency-dentist', crawlHits: 312, citations: 47 },
  { path: '/teeth-whitening', crawlHits: 241, citations: 31 },
  { path: '/invisalign', crawlHits: 189, citations: 22 },
  { path: '/dental-implants', crawlHits: 164, citations: 19 },
  { path: '/pediatric-dentist', crawlHits: 118, citations: 14 },
]

// ---------------------------------------------------------------------------
// Per-page drill rows
// ---------------------------------------------------------------------------

const drill: TrafficDrillRow[] = [
  {
    path: '/emergency-dentist',
    pageTitle: 'Emergency Dentist Ramat Gan',
    crawlHits: 312,
    citations: 47,
    aiSessions: 394,
    conversionRate: 9.1,
  },
  {
    path: '/teeth-whitening',
    pageTitle: 'Professional Teeth Whitening',
    crawlHits: 241,
    citations: 31,
    aiSessions: 287,
    conversionRate: 7.3,
  },
  {
    path: '/invisalign',
    pageTitle: 'Invisalign Provider Ramat Gan',
    crawlHits: 189,
    citations: 22,
    aiSessions: 201,
    conversionRate: 6.2,
  },
  {
    path: '/dental-implants',
    pageTitle: 'Dental Implants — Cost & Process',
    crawlHits: 164,
    citations: 19,
    aiSessions: 178,
    conversionRate: 5.8,
  },
  {
    path: '/pediatric-dentist',
    pageTitle: 'Pediatric Dentist for Kids',
    crawlHits: 118,
    citations: 14,
    aiSessions: 143,
    conversionRate: 4.9,
  },
  {
    path: '/root-canal',
    pageTitle: 'Root Canal Treatment',
    crawlHits: 97,
    citations: 11,
    aiSessions: 112,
    conversionRate: 4.1,
  },
  {
    path: '/dental-checkup',
    pageTitle: 'New Patient Checkup',
    crawlHits: 83,
    citations: 8,
    aiSessions: 89,
    conversionRate: 3.4,
  },
]

// ---------------------------------------------------------------------------
// Top-level export
// ---------------------------------------------------------------------------

export const DEMO_TRAFFIC: DemoTraffic = {
  aiReferredSessions: 1284,
  aiReferredDelta: 18,
  crawlerTrend,
  referralAttribution,
  contentPerformance,
  drill,
}

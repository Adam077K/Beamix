import type {
  DemoMarket,
  MarketPromptRow,
  TrendingPrompt,
  MarketDemographics,
  MarketPromptDrill,
} from './types'

/**
 * DEMO_MARKET — Market Intelligence & Prompt Volume fixture
 * Business: Bright Smile Dental, Ramat Gan
 *
 * Story arc: 48,200 addressable monthly prompt volume across dental queries
 * in the Gush Dan / Israel region. Mix of tracked + untracked + uncited queries.
 * Competitors (Smile Center, Dental Plus, etc.) dominate several transactional
 * queries that BSd is not yet cited for.
 */

// ---------------------------------------------------------------------------
// Prompt rows
// ---------------------------------------------------------------------------

const prompts: MarketPromptRow[] = [
  {
    id: 'p1',
    query: 'emergency dentist Ramat Gan open now',
    monthlyVolume: 4200,
    region: 'Ramat Gan, IL',
    intent: 'transactional',
    cited: true,
    tracked: true,
  },
  {
    id: 'p2',
    query: 'teeth whitening cost dentist Israel',
    monthlyVolume: 3800,
    region: 'Israel',
    intent: 'transactional',
    cited: false,
    tracked: true,
  },
  {
    id: 'p3',
    query: 'Invisalign provider Ramat Gan',
    monthlyVolume: 3100,
    region: 'Ramat Gan, IL',
    intent: 'transactional',
    cited: false,
    tracked: true,
  },
  {
    id: 'p4',
    query: 'dental implants price Israel 2026',
    monthlyVolume: 2900,
    region: 'Israel',
    intent: 'informational',
    cited: false,
    tracked: true,
  },
  {
    id: 'p5',
    query: 'best dentist near Gush Dan',
    monthlyVolume: 2700,
    region: 'Gush Dan, IL',
    intent: 'navigational',
    cited: true,
    tracked: true,
  },
  {
    id: 'p6',
    query: 'pediatric dentist Ramat Gan kids',
    monthlyVolume: 2400,
    region: 'Ramat Gan, IL',
    intent: 'navigational',
    cited: true,
    tracked: true,
  },
  {
    id: 'p7',
    query: 'root canal treatment near me Gush Dan',
    monthlyVolume: 2200,
    region: 'Gush Dan, IL',
    intent: 'transactional',
    cited: false,
    tracked: true,
  },
  {
    id: 'p8',
    query: 'dental clinic open Saturday Israel',
    monthlyVolume: 1900,
    region: 'Israel',
    intent: 'informational',
    cited: false,
    tracked: false,
  },
  {
    id: 'p9',
    query: 'Invisalign vs braces cost Israel dentist',
    monthlyVolume: 1800,
    region: 'Israel',
    intent: 'informational',
    cited: false,
    tracked: false,
  },
  {
    id: 'p10',
    query: 'dental veneer cost Israel',
    monthlyVolume: 1600,
    region: 'Israel',
    intent: 'informational',
    cited: false,
    tracked: false,
  },
  {
    id: 'p11',
    query: 'does Maccabi cover dental implants',
    monthlyVolume: 1500,
    region: 'Israel',
    intent: 'informational',
    cited: false,
    tracked: false,
  },
  {
    id: 'p12',
    query: 'sedation dentistry Israel anxious patients',
    monthlyVolume: 1400,
    region: 'Israel',
    intent: 'informational',
    cited: true,
    tracked: true,
  },
  {
    id: 'p13',
    query: 'dentist Clalit Mushlam Ramat Gan',
    monthlyVolume: 1300,
    region: 'Ramat Gan, IL',
    intent: 'navigational',
    cited: true,
    tracked: true,
  },
  {
    id: 'p14',
    query: 'zoom whitening one session Israel',
    monthlyVolume: 1100,
    region: 'Israel',
    intent: 'transactional',
    cited: false,
    tracked: false,
  },
  {
    id: 'p15',
    query: 'dental crown cost how long lasts Israel',
    monthlyVolume: 900,
    region: 'Israel',
    intent: 'informational',
    cited: false,
    tracked: false,
  },
]

// ---------------------------------------------------------------------------
// Trending / emerging prompts
// ---------------------------------------------------------------------------

const trendingPrompts: TrendingPrompt[] = [
  {
    query: 'AI smile design dentist Israel',
    weeklyVolumeGrowth: 42,
    intent: 'informational',
  },
  {
    query: 'same-day crown dentist Ramat Gan',
    weeklyVolumeGrowth: 31,
    intent: 'transactional',
  },
  {
    query: 'teeth bonding cost Israel vs veneer',
    weeklyVolumeGrowth: 24,
    intent: 'informational',
  },
  {
    query: 'dentist payment plan Israel',
    weeklyVolumeGrowth: 19,
    intent: 'transactional',
  },
]

// ---------------------------------------------------------------------------
// Audience demographics (shared across surface)
// ---------------------------------------------------------------------------

const demographics: MarketDemographics = {
  ageBands: [
    { range: '18–24', pct: 8 },
    { range: '25–34', pct: 22 },
    { range: '35–44', pct: 31 },
    { range: '45–54', pct: 24 },
    { range: '55–64', pct: 11 },
    { range: '65+', pct: 4 },
  ],
  incomeBands: [
    { range: '< ₪6,000/mo', pct: 12 },
    { range: '₪6,000–10,000', pct: 28 },
    { range: '₪10,000–16,000', pct: 34 },
    { range: '₪16,000–25,000', pct: 18 },
    { range: '> ₪25,000/mo', pct: 8 },
  ],
  genderSplit: { male: 44, female: 54, other: 2 },
}

// ---------------------------------------------------------------------------
// Per-prompt drill data
// ---------------------------------------------------------------------------

const drill: Record<string, MarketPromptDrill> = {
  p2: {
    promptId: 'p2',
    volumeTrend: [3100, 3300, 3500, 3700, 3800],
    demographics: {
      ageBands: [
        { range: '18–24', pct: 6 },
        { range: '25–34', pct: 26 },
        { range: '35–44', pct: 33 },
        { range: '45–54', pct: 22 },
        { range: '55–64', pct: 10 },
        { range: '65+', pct: 3 },
      ],
      incomeBands: [
        { range: '< ₪6,000/mo', pct: 9 },
        { range: '₪6,000–10,000', pct: 24 },
        { range: '₪10,000–16,000', pct: 38 },
        { range: '₪16,000–25,000', pct: 21 },
        { range: '> ₪25,000/mo', pct: 8 },
      ],
      genderSplit: { male: 38, female: 60, other: 2 },
    },
    whoCited: ['Smile Center', 'Dental Plus'],
  },
  p3: {
    promptId: 'p3',
    volumeTrend: [2400, 2600, 2700, 2900, 3100],
    demographics: {
      ageBands: [
        { range: '18–24', pct: 11 },
        { range: '25–34', pct: 34 },
        { range: '35–44', pct: 29 },
        { range: '45–54', pct: 17 },
        { range: '55–64', pct: 7 },
        { range: '65+', pct: 2 },
      ],
      incomeBands: [
        { range: '< ₪6,000/mo', pct: 7 },
        { range: '₪6,000–10,000', pct: 21 },
        { range: '₪10,000–16,000', pct: 36 },
        { range: '₪16,000–25,000', pct: 25 },
        { range: '> ₪25,000/mo', pct: 11 },
      ],
      genderSplit: { male: 41, female: 57, other: 2 },
    },
    whoCited: ['Dental Plus', 'PerfectSmile IL'],
  },
  p1: {
    promptId: 'p1',
    volumeTrend: [3600, 3800, 3900, 4100, 4200],
    demographics,
    whoCited: ['Bright Smile Dental', 'Smile Center', 'Ramat Gan Dental'],
  },
}

// ---------------------------------------------------------------------------
// Top-level export
// ---------------------------------------------------------------------------

export const DEMO_MARKET: DemoMarket = {
  addressableVolume: 48200,
  prompts,
  trendingPrompts,
  demographics,
  drill,
}

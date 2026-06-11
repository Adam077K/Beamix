/**
 * Demo Mode — Fixtures
 *
 * Coherent dataset for "Bright Smile Dental", Ramat Gan, Israel.
 * One business. One story. Every page tells the same arc: AI search
 * visibility climbing over the past 4 weeks thanks to targeted work.
 *
 * Types are imported from the real contracts — if a type changes, this
 * file fails at build time. No invented shapes.
 *
 * Engineering Principle #9: no agent_id, no agent_type, no agent names
 * in customer-facing copy. Use kind labels only ("the crew").
 */

import type { DashboardOutcomes } from '@/types/outcomes'
import type { ApprovalQueueItem } from '@/app/(protected)/approvals/_data'
import type { WeeklyDigest } from '@/types/digest'
import type { TraceabilityData } from '@/types/traceability'
import { DEMO_SCAN_ID } from './index'

// ---------------------------------------------------------------------------
// Shared business details
// ---------------------------------------------------------------------------

const BUSINESS = {
  name: 'Bright Smile Dental',
  website: 'brightsmile-dental.co.il',
  location: 'Ramat Gan, Israel',
}

// ---------------------------------------------------------------------------
// DEMO_APPROVALS — ApprovalQueueItem[] (pending)
// Declared before DEMO_DASHBOARD so approvalCount can derive from .length.
// ---------------------------------------------------------------------------

export const DEMO_APPROVALS: ApprovalQueueItem[] = [
  {
    id: '11111111-1111-4111-8111-111111111001',
    kind: 'content_publish',
    state: 'pending',
    resource: {
      title: 'FAQ: "How much does teeth whitening cost in Ramat Gan?"',
      summary:
        'Adds a structured FAQ answer targeting the top whitening cost query in your area. Perplexity already surfaces this query for two competitors.',
      body: 'Professional teeth whitening in Ramat Gan typically costs between ₪600–₪1,200 depending on the method chosen. At Bright Smile Dental, we offer both in-clinic power whitening and take-home trays — book a consultation to find the right fit for your goals and budget.',
      rationale:
        'This query has a high Perplexity citation rate for local dental clinics. Publishing a direct answer closes a visibility gap against your top two competitors who rank for it.',
    },
    evidenceUrl:
      'https://brightsmile-dental.co.il/services/whitening',
    expiresAt: '2026-06-18T08:00:00.000Z',
    createdAt: '2026-06-10T07:30:00.000Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111002',
    kind: 'schema_push',
    state: 'pending',
    resource: {
      title: 'Dentist schema update — add acceptsInsurance and priceRange',
      summary:
        'Adds two missing schema fields that all three AI engines now use to surface local dental results: insurance acceptance and price range.',
      diff:
        '+ "acceptsInsurance": true\n+ "priceRange": "₪₪"\n+ "hasMap": "https://maps.app.goo.gl/brightsmile"',
      rationale:
        'ChatGPT and Gemini weight these fields in local dental queries. Your current schema omits them, which costs you placement on "dentist near me that takes insurance" queries.',
    },
    evidenceUrl:
      'https://brightsmile-dental.co.il/schema.json',
    expiresAt: '2026-06-20T08:00:00.000Z',
    createdAt: '2026-06-10T09:15:00.000Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111003',
    kind: 'citation_submit',
    state: 'pending',
    resource: {
      title: 'Citation submission — Denta.co.il directory',
      summary:
        'Submits your business listing to Denta.co.il, a dental-specific Israeli directory that feeds directly into Perplexity\'s local index for the Gush Dan area.',
      rationale:
        'Perplexity has indexed 4 of your competitors via this directory. Your absence creates a gap that this single citation closes.',
    },
    evidenceUrl:
      'https://denta.co.il/listings/ramat-gan',
    expiresAt: '2026-06-17T08:00:00.000Z',
    createdAt: '2026-06-10T11:00:00.000Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111004',
    kind: 'content_publish',
    state: 'pending',
    resource: {
      title:
        'YMYL review: "What to do in a dental emergency at night in Ramat Gan"',
      summary:
        'Publishes guidance for after-hours dental emergencies. Flagged for your review because it contains health-related recommendations.',
      body: 'If you experience a dental emergency outside of office hours — severe pain, a knocked-out tooth, or a cracked crown — call the Maccabi after-hours dental line at *3555. For a knocked-out tooth: keep it moist (milk or saline), do not scrub it, and reach emergency dental care within 30 minutes for the best chance of reimplantation. At Bright Smile Dental, we hold emergency slots on Monday and Thursday mornings — call ahead to secure one.',
      rationale:
        'Emergency dental queries in Hebrew and English rank in all three AI engines for Ramat Gan. This page fills a clear gap and handles YMYL duty-of-care by directing to official emergency resources first.',
      risk: 'ymyl',
    },
    evidenceUrl:
      'https://brightsmile-dental.co.il/emergency',
    expiresAt: '2026-06-21T08:00:00.000Z',
    createdAt: '2026-06-10T12:00:00.000Z',
  },
]

// ---------------------------------------------------------------------------
// DEMO_RESOLVED_APPROVALS — ApprovalQueueItem[] (resolved)
// Used by the Resolved history view (/approvals/resolved).
// ---------------------------------------------------------------------------

export const DEMO_RESOLVED_APPROVALS: ApprovalQueueItem[] = [
  {
    id: '11111111-1111-4111-8111-111111111010',
    kind: 'content_publish',
    state: 'approved',
    resource: {
      title: 'Service comparison article: implants vs. bridges in Ramat Gan',
      summary:
        'Published a comparison article targeting patients researching implants vs. bridges. Now ranking for 6 new queries across Perplexity and ChatGPT.',
    },
    evidenceUrl:
      'https://brightsmile-dental.co.il/articles/implants-vs-bridges',
    expiresAt: '2026-06-07T08:00:00.000Z',
    createdAt: '2026-06-05T09:00:00.000Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111011',
    kind: 'schema_push',
    state: 'approved',
    resource: {
      title: 'LocalBusiness + Dentist schema — initial deploy',
      summary:
        'Deployed Dentist and LocalBusiness structured data. ChatGPT began surfacing the practice for local dental queries within 48 hours.',
    },
    evidenceUrl:
      'https://brightsmile-dental.co.il/schema.json',
    expiresAt: '2026-06-05T08:00:00.000Z',
    createdAt: '2026-06-03T10:00:00.000Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111012',
    kind: 'citation_submit',
    state: 'approved',
    resource: {
      title: '3 local directory citations — initial batch',
      summary:
        'Submitted to Yelp IL, Zap Doctors, and Yellow Pages IL. All three index the practice with consistent NAP data now.',
    },
    evidenceUrl:
      'https://brightsmile-dental.co.il',
    expiresAt: '2026-06-04T08:00:00.000Z',
    createdAt: '2026-06-02T09:00:00.000Z',
  },
]

// ---------------------------------------------------------------------------
// DEMO_DASHBOARD — DashboardOutcomes
// approvalCount derives from DEMO_APPROVALS.length so they can't drift.
// ---------------------------------------------------------------------------

export const DEMO_DASHBOARD: DashboardOutcomes = {
  visibilityScores: [
    {
      engine: 'chatgpt',
      score: 71,
      trend: 'up',
      lastUpdatedAt: '2026-06-10T08:00:00.000Z',
    },
    {
      engine: 'gemini',
      score: 64,
      trend: 'up',
      lastUpdatedAt: '2026-06-10T08:00:00.000Z',
    },
    {
      engine: 'perplexity',
      score: 78,
      trend: 'up',
      lastUpdatedAt: '2026-06-10T08:00:00.000Z',
    },
  ],
  weeklyNarrative: {
    type: 'wins',
    items: [
      {
        id: 'demo-win-1',
        description:
          'FAQ block published for "emergency dentist Ramat Gan" — Perplexity citing it within 48 hours.',
        achievedAt: '2026-06-09T10:00:00.000Z',
      },
      {
        id: 'demo-win-2',
        description:
          'Dentist + LocalBusiness schema deployed to production — ChatGPT picked up the structured address and hours.',
        achievedAt: '2026-06-08T14:00:00.000Z',
      },
      {
        id: 'demo-win-3',
        description:
          '3 new citations placed in local dental directories — NAP consistency improved across all three engines.',
        achievedAt: '2026-06-07T11:00:00.000Z',
      },
      {
        id: 'demo-win-4',
        description:
          'Service-page comparison article published: "Dental implants vs. bridges in Ramat Gan" — ranking for 6 new queries.',
        achievedAt: '2026-06-06T09:00:00.000Z',
      },
    ],
  },
  approvalCount: DEMO_APPROVALS.length,
}

// ---------------------------------------------------------------------------
// DEMO_DIGESTS — WeeklyDigest[]
// Three Sundays. Same business arc — building from baseline to measurable wins.
// ---------------------------------------------------------------------------

export const DEMO_DIGESTS: WeeklyDigest[] = [
  {
    id: `demo-digest-${BUSINESS.name}-2026-06-08`,
    weekOf: '2026-06-08',
    weekLabel: 'Week of Jun 8',
    weekYear: '2026',
    weekRelative: 'This week',
    digest: {
      headline:
        'Perplexity picked up your FAQ block — three queries landing this week',
      narrativeLine:
        'A schema update and a new FAQ section pushed your Perplexity score up 17 points since the start of the month. ChatGPT held at 71. Gemini is still re-crawling the updated schema.',
      wins: [
        {
          id: 'demo-w1',
          type: 'faq',
          description:
            'New FAQ block published for "emergency dentist Ramat Gan" — Perplexity cited it for the query within 48 hours of publication.',
          query: 'emergency dentist Ramat Gan',
        },
        {
          id: 'demo-w2',
          type: 'schema',
          description:
            'Dentist + LocalBusiness schema deployed with correct address, hours, and geo-coordinates — ChatGPT surface area improved immediately.',
        },
        {
          id: 'demo-w3',
          type: 'citation',
          description:
            '3 new citations placed across local dental directories — NAP consistency now confirmed across all three engines.',
        },
        {
          id: 'demo-w4',
          type: 'content',
          description:
            'Service-page comparison article published for "implants vs. bridges" — ranking for 6 new queries on Perplexity and ChatGPT.',
        },
      ],
      engineDeltas: [
        { engine: 'chatgpt', thisWeek: 71, lastWeek: 68, fourWeeksAgo: 58, delta: 3 },
        { engine: 'gemini', thisWeek: 64, lastWeek: 63, fourWeeksAgo: 52, delta: 1 },
        { engine: 'perplexity', thisWeek: 78, lastWeek: 70, fourWeeksAgo: 61, delta: 8 },
      ],
      resolvedApprovals: [
        {
          id: 'demo-ra1',
          title: 'Service comparison article: implants vs. bridges',
          type: 'content',
          previewSnippet:
            'Dental implants and bridges both replace missing teeth — here is how to choose the right option for your situation and budget in Ramat Gan…',
          status: 'approved',
        },
        {
          id: 'demo-ra2',
          title: 'LocalBusiness + Dentist schema — initial deploy',
          type: 'schema',
          previewSnippet:
            'Structured data now includes practice name, address, phone, hours, accepted insurance, geo-coordinates, and service types…',
          status: 'approved',
        },
      ],
      customerNote:
        `Perplexity is responding faster than expected to the FAQ work — this is the engine to push hard on this month. The Gemini dip is temporary while they re-crawl the new schema; it should recover fully by next week. The citation trio from last week is already feeding into Perplexity\'s local index. ${BUSINESS.name} is on a strong upward trajectory.`,
    },
  },
  {
    id: `demo-digest-${BUSINESS.name}-2026-06-01`,
    weekOf: '2026-06-01',
    weekLabel: 'Week of Jun 1',
    weekYear: '2026',
    weekRelative: 'Last week',
    digest: {
      headline:
        'Schema fix lands — ChatGPT begins picking up your practice for local queries',
      narrativeLine:
        'A corrected LocalBusiness schema gave ChatGPT what it needed. Your score jumped from 58 to 68. The crew drafted three more content pieces awaiting your review.',
      wins: [
        {
          id: 'demo-w5',
          type: 'schema',
          description:
            'Critical schema error fixed — practice address and phone number now match across all citation sources and the Dentist markup.',
        },
        {
          id: 'demo-w6',
          type: 'citation',
          description:
            'Yelp IL and Zap Doctors listings updated to match the corrected schema — consistency score improved across all three engines.',
        },
        {
          id: 'demo-w7',
          type: 'outreach',
          description:
            'Outreach draft prepared for two local health publications with strong Perplexity indexing — awaiting your sign-off before send.',
        },
      ],
      engineDeltas: [
        { engine: 'chatgpt', thisWeek: 68, lastWeek: 62, fourWeeksAgo: 58, delta: 6 },
        { engine: 'gemini', thisWeek: 63, lastWeek: 59, fourWeeksAgo: 52, delta: 4 },
        { engine: 'perplexity', thisWeek: 70, lastWeek: 67, fourWeeksAgo: 61, delta: 3 },
      ],
      resolvedApprovals: [
        {
          id: 'demo-ra3',
          title: '3 local directory citations — initial batch',
          type: 'content',
          previewSnippet:
            'Yelp IL, Zap Doctors, and Yellow Pages IL now show consistent NAP data matching your schema. All three feed into Perplexity\'s local dental index.',
          status: 'approved',
        },
        {
          id: 'demo-ra4',
          title: 'After-hours emergency guidance draft',
          type: 'content',
          previewSnippet:
            'For a knocked-out tooth: keep it moist, do not scrub it, and reach emergency dental care within 30 minutes…',
          status: 'rejected',
        },
      ],
      customerNote:
        'The schema fix was overdue and ChatGPT rewarded it immediately. You are now visible for eight local queries you were not showing up for two weeks ago. The citation consistency work is the unsexy part — but it matters enormously for Perplexity. Next priority is the FAQ block for emergency queries, then the implants comparison article.',
    },
  },
  {
    id: `demo-digest-${BUSINESS.name}-2026-05-25`,
    weekOf: '2026-05-25',
    weekLabel: 'Week of May 25',
    weekYear: '2026',
    weekRelative: '2 weeks ago',
    digest: {
      headline:
        'Audit complete — 5 structural gaps identified, crew starts on schema first',
      narrativeLine:
        'Your first full AI search audit surfaced five addressable gaps across schema, citations, and content. The crew started on schema — the fastest signal for local ranking — and scheduled content work for the following week.',
      wins: [
        {
          id: 'demo-w8',
          type: 'schema',
          description:
            'Full schema audit complete — LocalBusiness, Dentist, Service, and Review markup assessed against all three engine requirements.',
        },
        {
          id: 'demo-w9',
          type: 'content',
          description:
            'Competitor gap report ready — your top 4 competitors in Ramat Gan analyzed for content, citation, and schema patterns.',
        },
      ],
      engineDeltas: [
        { engine: 'chatgpt', thisWeek: 62, lastWeek: 60, fourWeeksAgo: null, delta: 2 },
        { engine: 'gemini', thisWeek: 59, lastWeek: 55, fourWeeksAgo: null, delta: 4 },
        { engine: 'perplexity', thisWeek: 67, lastWeek: 63, fourWeeksAgo: null, delta: 4 },
      ],
      resolvedApprovals: [
        {
          id: 'demo-ra5',
          title: 'Initial content and schema audit summary',
          type: 'content',
          previewSnippet:
            'Your services page is missing structured answers to the 11 most common pre-appointment questions. Schema has two critical errors affecting ChatGPT indexing…',
          status: 'approved',
        },
      ],
      customerNote:
        'This was your baseline week — the crew ran a full audit so every move going forward is targeted, not guesswork. Schema is first because the return on investment is the fastest. Your visibility scores already nudged upward from the audit alone because the crew submitted a schema correction flag to Perplexity directly. Content work starts next week once the schema signals have had time to settle.',
    },
  },
]

// ---------------------------------------------------------------------------
// DEMO_TRACEABILITY — TraceabilityData
// ---------------------------------------------------------------------------

export const DEMO_TRACEABILITY: TraceabilityData = {
  state: 'ready',
  outcomes: [
    {
      id: 'demo-outcome-1',
      statement:
        'Now ranked #2 on Perplexity for "best dental clinic in Ramat Gan"',
      engine: 'perplexity',
      deltaPoints: 17,
      achievedAt: '2026-06-09T10:00:00.000Z',
      deliverables: [
        {
          id: 'demo-d1',
          kind: 'article',
          label: 'FAQ: Emergency dental care in Ramat Gan',
          url: 'https://brightsmile-dental.co.il/faq/emergency-dentist-ramat-gan',
          occurredAt: '2026-06-09T08:00:00.000Z',
        },
        {
          id: 'demo-d2',
          kind: 'schema',
          label: 'Dentist + LocalBusiness structured data — v2',
          url: 'https://brightsmile-dental.co.il/schema.json',
          occurredAt: '2026-06-08T14:00:00.000Z',
        },
        {
          id: 'demo-d3',
          kind: 'citation',
          label: 'Denta.co.il listing — Ramat Gan dental directory',
          url: 'https://denta.co.il/listings/bright-smile-ramat-gan',
          occurredAt: '2026-06-07T11:00:00.000Z',
        },
      ],
    },
    {
      id: 'demo-outcome-2',
      statement:
        'ChatGPT now surfaces the practice for 8 new local queries it missed 4 weeks ago',
      engine: 'chatgpt',
      deltaPoints: 13,
      achievedAt: '2026-06-08T10:00:00.000Z',
      deliverables: [
        {
          id: 'demo-d4',
          kind: 'schema',
          label: 'LocalBusiness schema — address, hours, and geo-coordinates corrected',
          url: 'https://brightsmile-dental.co.il/schema.json',
          occurredAt: '2026-06-03T10:00:00.000Z',
        },
        {
          id: 'demo-d5',
          kind: 'citation',
          label: 'Yelp IL — listing corrected to match schema',
          url: 'https://www.yelp.com/biz/bright-smile-dental-ramat-gan',
          occurredAt: '2026-06-02T09:00:00.000Z',
        },
      ],
    },
    {
      id: 'demo-outcome-3',
      statement:
        'Service comparison article ranking for "dental implants vs bridges Ramat Gan" on Gemini',
      engine: 'gemini',
      deltaPoints: 9,
      achievedAt: '2026-06-06T14:00:00.000Z',
      deliverables: [
        {
          id: 'demo-d6',
          kind: 'article',
          label: 'Comparison article: dental implants vs. bridges in Ramat Gan',
          url: 'https://brightsmile-dental.co.il/articles/implants-vs-bridges-ramat-gan',
          occurredAt: '2026-06-06T09:00:00.000Z',
        },
        {
          id: 'demo-d7',
          kind: 'citation',
          label: 'Zap Doctors — practice profile with procedure list added',
          url: 'https://www.zap.co.il/ramat-gan/bright-smile-dental',
          occurredAt: '2026-06-05T11:00:00.000Z',
        },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------
// DEMO_SCAN — shape consumed by the /scan/[scan_id] page
// ---------------------------------------------------------------------------

/**
 * Returned by getFreeScan when scanId === DEMO_SCAN_ID.
 * Matches the inline ScanResult + FreeScanResults interfaces in that page
 * without importing them (they are defined inline there, not exported).
 */
export const DEMO_SCAN = {
  id: DEMO_SCAN_ID,
  business_name: BUSINESS.name,
  website_url: BUSINESS.website,
  status: 'complete' as const,
  results: {
    visibility_score: 71,
    engines_checked: 3,
    total_issues: 4,
    engine_results: [
      {
        id: 'chatgpt' as const,
        label: 'ChatGPT',
        score: 71,
        mentioned: true,
        verdict: 'Mentioned for 4 of 6 tested queries.',
      },
      {
        id: 'gemini' as const,
        label: 'Gemini',
        score: 64,
        mentioned: true,
        verdict: 'Mentioned for 3 of 6 tested queries.',
      },
      {
        id: 'perplexity' as const,
        label: 'Perplexity',
        score: 78,
        mentioned: true,
        verdict: 'Cited for 5 of 6 tested queries — highest of the three.',
      },
    ],
    issues: [
      { category: 'Schema coverage', count: 2 },
      { category: 'Citation consistency', count: 1 },
      { category: 'FAQ coverage', count: 1 },
    ],
    scores: {
      chatgpt: 71,
      gemini: 64,
      perplexity: 78,
    },
  },
}

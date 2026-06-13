import type { OffsiteRow } from './types'

/**
 * DEMO_OFFSITE — Citation / Off-Site Manager fixture data
 * Business: Bright Smile Dental, Ramat Gan, Israel
 *
 * Story arc: 34 citations found, 9 tracked, 6 auto-published this week.
 * The coverage score is climbing: 62 → a measurable gap vs the two
 * key competitors who dominate Denta.co.il and Google Business.
 */
export const DEMO_OFFSITE = {
  // ---------------------------------------------------------------------------
  // Context stat — right-rail hero number
  // ---------------------------------------------------------------------------
  coverageScore: 62,
  /** Last ~5 scan coverage scores (flat baseline if no history) */
  sparklinePoints: [44, 51, 55, 58, 62],

  // ---------------------------------------------------------------------------
  // Off-Site Presence Builder allotment (capped: 3 / 5 / 10)
  // Current tier = Build → 5/month. 3 used this cycle.
  // ---------------------------------------------------------------------------
  offsiteRunsUsed: 3,
  offsiteRunsCap: 5,

  // ---------------------------------------------------------------------------
  // Rows
  // ---------------------------------------------------------------------------
  rows: [
    // ---- Citations (read-only monitoring tab) --------------------------------
    {
      id: 'c1',
      tab: 'citation',
      title: 'Denta.co.il — Dental Directory',
      domain: 'denta.co.il',
      status: 'tracked',
      importance: 91,
    },
    {
      id: 'c2',
      tab: 'citation',
      title: 'Zap Doctors — Consumer health listings',
      domain: 'zap.co.il',
      status: 'tracked',
      importance: 78,
    },
    {
      id: 'c3',
      tab: 'citation',
      title: 'Yelp Israel',
      domain: 'yelp.co.il',
      status: 'untracked',
      importance: 71,
    },
    {
      id: 'c4',
      tab: 'citation',
      title: 'Meuhedet Health Fund directory',
      domain: 'meuhedet.co.il',
      status: 'untracked',
      importance: 68,
    },
    {
      id: 'c5',
      tab: 'citation',
      title: 'Klalit smile dental portal',
      domain: 'klalit.co.il',
      status: 'untracked',
      importance: 64,
    },
    {
      id: 'c6',
      tab: 'citation',
      title: 'Israel Health Ministry clinic registry',
      domain: 'health.gov.il',
      status: 'tracked',
      importance: 88,
    },
    {
      id: 'c7',
      tab: 'citation',
      title: 'Yad2 Business listings',
      domain: 'yad2.co.il',
      status: 'untracked',
      importance: 52,
    },
    {
      id: 'c8',
      tab: 'citation',
      title: 'Walla Health consumer portal',
      domain: 'health.walla.co.il',
      status: 'untracked',
      importance: 60,
    },

    // ---- Directories / Off-Site (offsite_presence_builder — auto-publish) ---
    {
      id: 'd1',
      tab: 'directory',
      title: 'Google Business Profile',
      domain: 'business.google.com',
      status: 'tracked',
      importance: 99,
    },
    {
      id: 'd2',
      tab: 'directory',
      title: 'Walla Health directory listing',
      domain: 'health.walla.co.il',
      status: 'submitted',
      importance: 72,
    },
    {
      id: 'd3',
      tab: 'directory',
      title: 'Denta.co.il — Full profile',
      domain: 'denta.co.il',
      status: 'submitted',
      importance: 89,
    },
    {
      id: 'd4',
      tab: 'directory',
      title: 'Apple Maps — Places',
      domain: 'maps.apple.com',
      status: 'untracked',
      importance: 81,
    },
    {
      id: 'd5',
      tab: 'directory',
      title: 'Bing Places for Business',
      domain: 'bingplaces.com',
      status: 'untracked',
      importance: 67,
    },
    {
      id: 'd6',
      tab: 'directory',
      title: 'Zap Doctors — Verified profile',
      domain: 'zap.co.il',
      status: 'tracked',
      importance: 78,
    },
    {
      id: 'd7',
      tab: 'directory',
      title: 'Foursquare / Swarm',
      domain: 'foursquare.com',
      status: 'untracked',
      importance: 43,
    },

    // ---- Entities (entity_builder — auto-publish) ----------------------------
    {
      id: 'e1',
      tab: 'entity',
      title: 'Wikidata — dental clinic entity',
      domain: 'wikidata.org',
      status: 'untracked',
      importance: 65,
    },
    {
      id: 'e2',
      tab: 'entity',
      title: 'Wikipedia — knowledge graph mention',
      domain: 'wikipedia.org',
      status: 'untracked',
      importance: 58,
    },
    {
      id: 'e3',
      tab: 'entity',
      title: 'Google Knowledge Panel — verified',
      domain: 'google.com',
      status: 'tracked',
      importance: 97,
    },
    {
      id: 'e4',
      tab: 'entity',
      title: 'Schema.org — Dentist entity markup',
      domain: 'brightsmile-dental.co.il',
      status: 'submitted',
      importance: 82,
    },
    {
      id: 'e5',
      tab: 'entity',
      title: 'LinkedIn company page',
      domain: 'linkedin.com',
      status: 'tracked',
      importance: 54,
    },
    {
      id: 'e6',
      tab: 'entity',
      title: 'Crunchbase — organization profile',
      domain: 'crunchbase.com',
      status: 'untracked',
      importance: 41,
    },

    // ---- Reputation (review_presence_planner — internal report) -------------
    {
      id: 'r1',
      tab: 'reputation',
      title: 'Google Reviews — 4.7 ★ (183 reviews)',
      domain: 'google.com',
      status: 'tracked',
      importance: 95,
    },
    {
      id: 'r2',
      tab: 'reputation',
      title: 'Facebook Reviews — 4.5 ★ (62 reviews)',
      domain: 'facebook.com',
      status: 'tracked',
      importance: 74,
    },
    {
      id: 'r3',
      tab: 'reputation',
      title: 'Zap Doctors — ratings',
      domain: 'zap.co.il',
      status: 'untracked',
      importance: 69,
    },
    {
      id: 'r4',
      tab: 'reputation',
      title: 'Yelp Israel — reviews',
      domain: 'yelp.co.il',
      status: 'untracked',
      importance: 61,
    },
    {
      id: 'r5',
      tab: 'reputation',
      title: 'Waze Local — user reviews',
      domain: 'waze.com',
      status: 'untracked',
      importance: 55,
    },
    {
      id: 'r6',
      tab: 'reputation',
      title: 'Denta.co.il — patient feedback',
      domain: 'denta.co.il',
      status: 'submitted',
      importance: 80,
    },

    // ---- Community (reddit_presence_planner — internal report) --------------
    {
      id: 'cm1',
      tab: 'community',
      title: 'r/Israel — local business discussions',
      domain: 'reddit.com/r/israel',
      status: 'untracked',
      importance: 44,
    },
    {
      id: 'cm2',
      tab: 'community',
      title: 'Facebook group — Ramat Gan residents',
      domain: 'facebook.com',
      status: 'untracked',
      importance: 58,
    },
    {
      id: 'cm3',
      tab: 'community',
      title: 'WhatsApp community — Gush Dan health',
      domain: 'whatsapp.com',
      status: 'untracked',
      importance: 47,
    },
    {
      id: 'cm4',
      tab: 'community',
      title: 'Nextdoor Israel (Shkhuna) — local recs',
      domain: 'nextdoor.com',
      status: 'untracked',
      importance: 63,
    },
    {
      id: 'cm5',
      tab: 'community',
      title: 'Twitter/X — dental Q&A mentions',
      domain: 'twitter.com',
      status: 'untracked',
      importance: 38,
    },
  ] as OffsiteRow[],

  // ---------------------------------------------------------------------------
  // Pipeline stage snapshots — for simulated running states
  // ---------------------------------------------------------------------------
  offsitePipelineStages: [
    { id: 'plan' as const, label: 'Plan', status: 'done' as const },
    { id: 'research' as const, label: 'Research directories', status: 'active' as const, substep: 'Scanning denta.co.il API for unverified listings…' },
    { id: 'do' as const, label: 'Submit listings', status: 'queued' as const },
    { id: 'qa' as const, label: 'QA', status: 'queued' as const },
    { id: 'summarize' as const, label: 'Summarize', status: 'queued' as const },
  ],

  entityPipelineStages: [
    { id: 'plan' as const, label: 'Plan', status: 'done' as const },
    { id: 'research' as const, label: 'Research entity signals', status: 'done' as const },
    { id: 'do' as const, label: 'Strengthen entity links', status: 'active' as const, substep: 'Writing Wikidata entity with location attributes…' },
    { id: 'qa' as const, label: 'QA', status: 'queued' as const },
    { id: 'summarize' as const, label: 'Summarize', status: 'queued' as const },
  ],

  reputationPipelineStages: [
    { id: 'plan' as const, label: 'Plan', status: 'done' as const },
    { id: 'research' as const, label: 'Research review platforms', status: 'done' as const },
    { id: 'do' as const, label: 'Build reputation plan', status: 'active' as const, substep: 'Generating review-request templates for Zap Doctors…' },
    { id: 'qa' as const, label: 'QA', status: 'queued' as const },
    { id: 'summarize' as const, label: 'Summarize', status: 'queued' as const },
  ],

  communityPipelineStages: [
    { id: 'plan' as const, label: 'Plan', status: 'done' as const },
    { id: 'research' as const, label: 'Research community channels', status: 'done' as const },
    { id: 'do' as const, label: 'Draft presence plan', status: 'active' as const, substep: 'Mapping Ramat Gan Facebook groups for dental Q&A…' },
    { id: 'qa' as const, label: 'QA', status: 'queued' as const },
    { id: 'summarize' as const, label: 'Summarize', status: 'queued' as const },
  ],

  // ---------------------------------------------------------------------------
  // Output snapshots — populated state table metadata
  // ---------------------------------------------------------------------------
  lastOffsiteRun: {
    completedAt: '2026-06-10T14:32:00.000Z',
    submitted: 3,
    verified: 2,
    summary: 'Submitted 3 directories · 2 verified · Bing Places pending',
  },

  lastEntityRun: {
    completedAt: '2026-06-09T09:15:00.000Z',
    entitySignals: 7,
    summary: 'Added 7 entity signals · Wikidata entry created · Schema.org enriched',
  },

  lastReputationRun: {
    completedAt: '2026-06-08T16:45:00.000Z',
    platforms: 4,
    summary: '4 platforms audited · 2 review-request templates generated',
  },

  lastCommunityRun: {
    completedAt: '2026-06-07T11:20:00.000Z',
    channels: 3,
    summary: '3 community channels identified · Ramat Gan Shkhuna group shortlisted',
  },
} as const

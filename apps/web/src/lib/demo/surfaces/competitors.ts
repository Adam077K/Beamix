import type { CompetitorRow, ShareOfVoicePoint } from './types'

/**
 * DEMO_COMPETITORS — Competitor Tracker fixture data
 * Business: Bright Smile Dental, Ramat Gan
 *
 * Story arc: BSd starts at 9% SoV (week 1) → climbs to 23% by week 5
 * as the crew deploys FAQs, schema, and citations.
 * Smile Center holds lead but their advantage is narrowing.
 */

// ---------------------------------------------------------------------------
// Competitor rows (the tracked competitor list)
// ---------------------------------------------------------------------------

export const DEMO_COMPETITORS = {
  rows: [
    {
      id: 'comp1',
      name: 'Smile Center',
      domain: 'smile-center.co.il',
      shareOfVoice: 34,
      engines: ['ChatGPT', 'Gemini'],
      gapCount: 8,
    },
    {
      id: 'comp2',
      name: 'Dental Plus',
      domain: 'dentalplus.co.il',
      shareOfVoice: 27,
      engines: ['Gemini', 'Perplexity'],
      gapCount: 5,
    },
    {
      id: 'comp3',
      name: 'Ramat Gan Dental',
      domain: 'rgdental.co.il',
      shareOfVoice: 19,
      engines: ['Perplexity'],
      gapCount: 3,
    },
    {
      id: 'comp4',
      name: 'PerfectSmile IL',
      domain: 'perfectsmile.co.il',
      shareOfVoice: 11,
      engines: ['ChatGPT'],
      gapCount: 2,
    },
  ] as CompetitorRow[],

  // Share-of-voice history: 5 weekly snapshots — BSd climbing
  shareOfVoiceHistory: [
    { date: '2026-05-12', us: 9, topCompetitor: 36 },
    { date: '2026-05-19', us: 12, topCompetitor: 35 },
    { date: '2026-05-26', us: 15, topCompetitor: 34 },
    { date: '2026-06-02', us: 18, topCompetitor: 34 },
    { date: '2026-06-09', us: 23, topCompetitor: 34 },
  ] as ShareOfVoicePoint[],

  // Per-engine SoV breakdown (last snapshot, week of Jun 9)
  engineBreakdown: [
    {
      engine: 'ChatGPT',
      us: 28,
      competitors: [
        { name: 'Smile Center', value: 39 },
        { name: 'PerfectSmile IL', value: 18 },
        { name: 'Others', value: 15 },
      ],
    },
    {
      engine: 'Gemini',
      us: 19,
      competitors: [
        { name: 'Smile Center', value: 31 },
        { name: 'Dental Plus', value: 29 },
        { name: 'Others', value: 21 },
      ],
    },
    {
      engine: 'Perplexity',
      us: 31,
      competitors: [
        { name: 'Dental Plus', value: 26 },
        { name: 'Ramat Gan Dental', value: 22 },
        { name: 'Others', value: 21 },
      ],
    },
  ],

  // Gap table: prompts where competitors rank and we don't
  gaps: [
    {
      id: 'gap1',
      prompt: 'teeth whitening cost Ramat Gan',
      competitorsCited: ['Smile Center', 'Dental Plus'],
      usCited: false,
      suggestedAction: 'content_optimizer' as const,
      actionLabel: 'Optimize content',
      actionHref: '/content?topic=teeth-whitening-cost-ramat-gan',
      engines: ['ChatGPT', 'Gemini'],
      priority: 'high' as const,
    },
    {
      id: 'gap2',
      prompt: 'dental implants price Israel',
      competitorsCited: ['Smile Center'],
      usCited: false,
      suggestedAction: 'faq_builder' as const,
      actionLabel: 'Build FAQ',
      actionHref: '/content?topic=dental-implants-price-israel&mode=faq',
      engines: ['Gemini'],
      priority: 'high' as const,
    },
    {
      id: 'gap3',
      prompt: 'Invisalign Ramat Gan dentist',
      competitorsCited: ['Dental Plus', 'PerfectSmile IL'],
      usCited: false,
      suggestedAction: 'content_optimizer' as const,
      actionLabel: 'Optimize content',
      actionHref: '/content?topic=invisalign-ramat-gan',
      engines: ['ChatGPT', 'Gemini', 'Perplexity'],
      priority: 'high' as const,
    },
    {
      id: 'gap4',
      prompt: 'root canal treatment near me Gush Dan',
      competitorsCited: ['Ramat Gan Dental'],
      usCited: false,
      suggestedAction: 'faq_builder' as const,
      actionLabel: 'Build FAQ',
      actionHref: '/content?topic=root-canal-gush-dan&mode=faq',
      engines: ['Perplexity'],
      priority: 'medium' as const,
    },
    {
      id: 'gap5',
      prompt: 'pediatric dentist Ramat Gan',
      competitorsCited: ['Smile Center'],
      usCited: false,
      suggestedAction: 'content_optimizer' as const,
      actionLabel: 'Optimize content',
      actionHref: '/content?topic=pediatric-dentist-ramat-gan',
      engines: ['ChatGPT'],
      priority: 'medium' as const,
    },
    {
      id: 'gap6',
      prompt: 'dental clinic open Saturday Israel',
      competitorsCited: ['Dental Plus', 'Smile Center'],
      usCited: false,
      suggestedAction: 'faq_builder' as const,
      actionLabel: 'Build FAQ',
      actionHref: '/content?topic=dental-clinic-saturday&mode=faq',
      engines: ['ChatGPT', 'Perplexity'],
      priority: 'medium' as const,
    },
    {
      id: 'gap7',
      prompt: 'dental veneer cost Israel',
      competitorsCited: ['PerfectSmile IL'],
      usCited: false,
      suggestedAction: 'content_optimizer' as const,
      actionLabel: 'Optimize content',
      actionHref: '/content?topic=dental-veneer-cost',
      engines: ['Gemini'],
      priority: 'low' as const,
    },
  ],

  // Co-citation: who appears in the same AI responses as us
  coCitations: [
    {
      domain: 'smile-center.co.il',
      name: 'Smile Center',
      sharedQueries: 6,
      engines: ['ChatGPT', 'Gemini'],
      relationship: 'direct-competitor' as const,
    },
    {
      domain: 'dental-association.co.il',
      name: 'Israel Dental Association',
      sharedQueries: 4,
      engines: ['ChatGPT', 'Gemini', 'Perplexity'],
      relationship: 'authority' as const,
    },
    {
      domain: 'dentalplus.co.il',
      name: 'Dental Plus',
      sharedQueries: 3,
      engines: ['Gemini', 'Perplexity'],
      relationship: 'direct-competitor' as const,
    },
    {
      domain: 'maccabi.co.il',
      name: 'Maccabi Health Services',
      sharedQueries: 3,
      engines: ['ChatGPT', 'Perplexity'],
      relationship: 'authority' as const,
    },
    {
      domain: 'zap.co.il',
      name: 'Zap Doctors',
      sharedQueries: 2,
      engines: ['Perplexity'],
      relationship: 'directory' as const,
    },
  ],

  // Auto-suggested competitors not yet tracked
  suggestions: [
    { domain: 'dclinic.co.il', name: 'D-Clinic Dental', reason: 'Cited for 3 queries you rank for' },
    { domain: 'klinikdent.co.il', name: 'KlinikDent', reason: 'Cited by Gemini for whitening queries' },
    { domain: 'hadar-dental.co.il', name: 'Hadar Dental', reason: 'Cited alongside Smile Center 4 times' },
  ],
} as const

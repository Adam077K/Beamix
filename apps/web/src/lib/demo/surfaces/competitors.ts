import type { CompetitorRow, ShareOfVoicePoint } from './types'

/**
 * DEMO_COMPETITORS — Competitor Tracker fixture data
 * Business: Bright Smile Dental, Ramat Gan
 */
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
  ] as CompetitorRow[],

  shareOfVoiceHistory: [
    { date: '2026-05-12', us: 9, topCompetitor: 36 },
    { date: '2026-05-19', us: 12, topCompetitor: 35 },
    { date: '2026-05-26', us: 15, topCompetitor: 34 },
    { date: '2026-06-02', us: 18, topCompetitor: 34 },
    { date: '2026-06-09', us: 23, topCompetitor: 34 },
  ] as ShareOfVoicePoint[],
} as const

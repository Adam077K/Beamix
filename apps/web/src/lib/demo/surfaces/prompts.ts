import type { PromptRow, PromptDrawerData } from './types'

/**
 * DEMO_PROMPTS — Prompt/Query Explorer fixture data
 * Business: Bright Smile Dental, Ramat Gan
 * Surface workers fill rich data. These are minimal valid shapes.
 */
export const DEMO_PROMPTS = {
  rows: [
    {
      id: 'p1',
      query: 'best family dentist near Ramat Gan',
      frequency: 42,
      competitorEngines: ['ChatGPT', 'Gemini'],
      coCitations: 3,
      intent: 'transactional',
      covered: false,
    },
    {
      id: 'p2',
      query: 'emergency dentist open now Tel Aviv area',
      frequency: 31,
      competitorEngines: ['Perplexity'],
      coCitations: 1,
      intent: 'transactional',
      covered: true,
    },
    {
      id: 'p3',
      query: 'Invisalign cost Ramat Gan',
      frequency: 28,
      competitorEngines: ['ChatGPT', 'Perplexity'],
      coCitations: 2,
      intent: 'informational',
      covered: false,
    },
    {
      id: 'p4',
      query: 'dental implants clinic Gush Dan reviews',
      frequency: 19,
      competitorEngines: ['Gemini'],
      coCitations: 1,
      intent: 'transactional',
      covered: false,
    },
    {
      id: 'p5',
      query: 'teeth whitening near me Ramat Gan',
      frequency: 16,
      competitorEngines: [],
      coCitations: 0,
      intent: 'transactional',
      covered: true,
    },
  ] as PromptRow[],

  drawerData: {
    p1: {
      promptId: 'p1',
      query: 'best family dentist near Ramat Gan',
      tree: [
        {
          engine: 'ChatGPT',
          citations: [
            { domain: 'smile-center.co.il', title: 'Smile Center Ramat Gan', snippet: 'Family dentistry for all ages…' },
          ],
        },
        {
          engine: 'Gemini',
          citations: [
            { domain: 'dentalplus.co.il', title: 'Dental Plus', snippet: 'Comprehensive family dental care…' },
          ],
        },
      ],
      intent: 'transactional',
      gapDescription: 'No page on your site targets "family dentist near Ramat Gan" with sufficient specificity.',
    } as PromptDrawerData,
  },
} as const

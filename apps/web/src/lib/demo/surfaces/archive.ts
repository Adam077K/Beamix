import type { RunRow, RunTrace } from './types'

/**
 * DEMO_RUNS — Run History fixture data
 * Business: Bright Smile Dental, Ramat Gan
 */
export const DEMO_RUNS = {
  rows: [
    {
      id: 'r1',
      agentLabel: 'Content Optimizer',
      mode: 'myself',
      status: 'success',
      timestamp: '2026-06-11T14:22:00.000Z',
      costUsd: 0.04,
      snippet: 'Optimized whitening page — added local pricing context and Ramat Gan specifics.',
    },
    {
      id: 'r2',
      agentLabel: 'Schema Generator',
      mode: 'beamix',
      status: 'success',
      timestamp: '2026-06-10T09:15:00.000Z',
      costUsd: 0.01,
      snippet: 'Generated Dentist schema with 8 fields. Missing: acceptsInsurance, priceRange.',
    },
    {
      id: 'r3',
      agentLabel: 'Query Mapper',
      mode: 'myself',
      status: 'success',
      timestamp: '2026-06-09T11:00:00.000Z',
      costUsd: 0.06,
      snippet: 'Identified 5 high-frequency queries with competitor coverage gaps.',
    },
    {
      id: 'r4',
      agentLabel: 'FAQ Builder',
      mode: 'beamix',
      status: 'failed',
      timestamp: '2026-06-08T16:45:00.000Z',
      costUsd: 0.00,
      snippet: 'Pipeline stopped at QA stage — content failed YMYL review.',
    },
  ] as RunRow[],

  traces: {
    r1: {
      runId: 'r1',
      stages: [
        { id: 'plan', label: 'Plan', status: 'done', substep: 'Analyzed page content', durationMs: 1200 },
        { id: 'research', label: 'Research', status: 'done', substep: 'Pulled competitor rankings', durationMs: 3400 },
        { id: 'do', label: 'Do', status: 'done', substep: 'Rewrote 3 sections', durationMs: 8100 },
        { id: 'qa', label: 'QA', status: 'done', substep: 'Verified citations', durationMs: 2200 },
        { id: 'summarize', label: 'Summarize', status: 'done', substep: 'Generated inbox card', durationMs: 900 },
      ],
      outputSnippet: 'Optimized whitening page — added local pricing context and Ramat Gan specifics.',
    } as RunTrace,
  },
} as const

import type { AutomationRow } from './types'

/**
 * DEMO_AUTOMATION — Automation Center (Mode Hub) fixture data
 * Business: Bright Smile Dental, Ramat Gan
 */
export const DEMO_AUTOMATION = {
  rows: [
    {
      id: 'a1',
      agentLabel: 'Query Mapper',
      mode: 'beamix',
      scheduleLabel: 'Weekly · Mondays 9am',
      allotmentLabel: 'Beamix runs this weekly · 6 of 10 autonomous runs left',
      lastRunAt: '2026-06-09T09:00:00.000Z',
      toolHref: '/prompts',
    },
    {
      id: 'a2',
      agentLabel: 'Content Optimizer',
      mode: 'myself',
      scheduleLabel: null,
      allotmentLabel: null,
      lastRunAt: '2026-06-11T14:22:00.000Z',
      toolHref: '/content',
    },
    {
      id: 'a3',
      agentLabel: 'Schema Generator',
      mode: 'beamix',
      scheduleLabel: 'Monthly · 1st of month',
      allotmentLabel: 'Beamix runs this monthly · 1 of 1 autonomous run left',
      lastRunAt: '2026-06-01T08:00:00.000Z',
      toolHref: '/schema',
    },
    {
      id: 'a4',
      agentLabel: 'Competitor Tracker',
      mode: 'beamix',
      scheduleLabel: 'Weekly · Wednesdays 8am',
      allotmentLabel: 'Beamix runs this weekly · 4 of 10 autonomous runs left',
      lastRunAt: '2026-06-11T08:00:00.000Z',
      toolHref: '/competitors',
    },
    {
      id: 'a5',
      agentLabel: 'Off-Site Builder',
      mode: 'myself',
      scheduleLabel: null,
      allotmentLabel: null,
      lastRunAt: '2026-06-08T11:30:00.000Z',
      toolHref: '/offsite',
    },
    {
      id: 'a6',
      agentLabel: 'Blog Studio',
      mode: 'myself',
      scheduleLabel: null,
      allotmentLabel: null,
      lastRunAt: null,
      toolHref: '/blog-studio',
    },
  ] as AutomationRow[],
} as const

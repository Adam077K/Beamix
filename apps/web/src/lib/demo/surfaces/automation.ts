import type { AutomationRow } from './types'

/**
 * DEMO_AUTOMATION — Automation Center (Mode Hub) fixture data
 * Business: Bright Smile Dental, Ramat Gan
 *
 * 11 agents, believable mix of modes:
 *   - 4 handed to Beamix (beamix) — the well-configured ones
 *   - 7 still on Manual (myself) — mix of "not yet configured" and "needs sign-off"
 *
 * allotmentLabel mirrors the actual dailyCap from registry.ts per tier.
 * Rows with dailyCap: null use null allotmentLabel (unlimited / credit-gated).
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
      agentLabel: 'Freshness Agent',
      mode: 'myself',
      scheduleLabel: null,
      allotmentLabel: null,
      lastRunAt: '2026-06-10T11:00:00.000Z',
      toolHref: '/content',
    },
    {
      id: 'a4',
      agentLabel: 'FAQ Builder',
      mode: 'beamix',
      scheduleLabel: 'Weekly · Wednesdays 8am',
      allotmentLabel: 'Beamix runs this weekly · 3 of 5 autonomous runs left',
      lastRunAt: '2026-06-11T08:00:00.000Z',
      toolHref: '/content',
    },
    {
      id: 'a5',
      agentLabel: 'Schema Generator',
      mode: 'beamix',
      scheduleLabel: 'Monthly · 1st of month',
      allotmentLabel: 'Beamix runs this monthly · 1 of 1 autonomous run left',
      lastRunAt: '2026-06-01T08:00:00.000Z',
      toolHref: '/schema',
    },
    {
      id: 'a6',
      agentLabel: 'Off-Site Presence Builder',
      mode: 'myself',
      scheduleLabel: null,
      allotmentLabel: null,
      lastRunAt: '2026-06-08T11:30:00.000Z',
      toolHref: '/offsite',
    },
    {
      id: 'a7',
      agentLabel: 'Review Presence Planner',
      mode: 'myself',
      scheduleLabel: null,
      allotmentLabel: null,
      lastRunAt: '2026-06-07T10:00:00.000Z',
      toolHref: '/offsite',
    },
    {
      id: 'a8',
      agentLabel: 'Entity Builder',
      mode: 'beamix',
      scheduleLabel: 'Bi-weekly · Fridays 7am',
      allotmentLabel: 'Beamix runs this bi-weekly · 2 of 10 autonomous runs left',
      lastRunAt: '2026-06-06T07:00:00.000Z',
      toolHref: '/offsite',
    },
    {
      id: 'a9',
      agentLabel: 'Authority Blog Strategist',
      mode: 'myself',
      scheduleLabel: null,
      allotmentLabel: null,
      lastRunAt: null,
      toolHref: '/blog-studio',
    },
    {
      id: 'a10',
      agentLabel: 'Performance Tracker',
      mode: 'myself',
      scheduleLabel: null,
      allotmentLabel: null,
      lastRunAt: '2026-06-11T06:00:00.000Z',
      toolHref: '/archive',
    },
    {
      id: 'a11',
      agentLabel: 'Reddit Presence Planner',
      mode: 'myself',
      scheduleLabel: null,
      allotmentLabel: null,
      lastRunAt: null,
      toolHref: '/offsite',
    },
  ] as AutomationRow[],
} as const

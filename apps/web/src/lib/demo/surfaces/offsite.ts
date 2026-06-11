import type { OffsiteRow } from './types'

/**
 * DEMO_OFFSITE — Citation/Off-Site Manager fixture data
 * Business: Bright Smile Dental, Ramat Gan
 */
export const DEMO_OFFSITE = {
  rows: [
    {
      id: 'o1',
      tab: 'citation',
      title: 'Denta.co.il Directory',
      domain: 'denta.co.il',
      status: 'untracked',
      importance: 91,
    },
    {
      id: 'o2',
      tab: 'citation',
      title: 'Zap Doctors',
      domain: 'zap.co.il',
      status: 'tracked',
      importance: 78,
    },
    {
      id: 'o3',
      tab: 'directory',
      title: 'Google Business Profile',
      domain: 'business.google.com',
      status: 'tracked',
      importance: 99,
    },
    {
      id: 'o4',
      tab: 'directory',
      title: 'Walla Health',
      domain: 'health.walla.co.il',
      status: 'submitted',
      importance: 72,
    },
    {
      id: 'o5',
      tab: 'entity',
      title: 'Wikidata business entity',
      domain: 'wikidata.org',
      status: 'untracked',
      importance: 65,
    },
    {
      id: 'o6',
      tab: 'reputation',
      title: 'Google Reviews',
      domain: 'google.com',
      status: 'tracked',
      importance: 95,
    },
    {
      id: 'o7',
      tab: 'community',
      title: 'Reddit r/Israel dental',
      domain: 'reddit.com',
      status: 'untracked',
      importance: 44,
    },
  ] as OffsiteRow[],
} as const

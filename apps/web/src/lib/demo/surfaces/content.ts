import type { ContentDoc, ContentDiff } from './types'

/**
 * DEMO_CONTENT — Content Editor fixture data
 * Business: Bright Smile Dental, Ramat Gan
 */
export const DEMO_CONTENT = {
  docs: [
    {
      id: 'c1',
      url: 'https://brightsmile-dental.co.il/services/whitening',
      title: 'Teeth Whitening — Bright Smile Dental',
      tab: 'optimize',
      wordCount: 412,
      daysSinceUpdate: 47,
      visibilityScore: 31,
      pageLocked: false,
    },
    {
      id: 'c2',
      url: 'https://brightsmile-dental.co.il/services/implants',
      title: 'Dental Implants — Bright Smile Dental',
      tab: 'refresh',
      wordCount: 638,
      daysSinceUpdate: 92,
      visibilityScore: 18,
      pageLocked: false,
    },
    {
      id: 'c3',
      url: 'https://brightsmile-dental.co.il/faq',
      title: 'FAQ — Bright Smile Dental',
      tab: 'faq',
      wordCount: 280,
      daysSinceUpdate: 14,
      visibilityScore: 44,
      pageLocked: false,
    },
  ] as ContentDoc[],

  diffs: {
    c1: {
      docId: 'c1',
      before: 'Professional teeth whitening at our clinic.',
      after: 'Professional teeth whitening in Ramat Gan — results in one 60-minute visit, from ₪600.',
      diffLines: [
        { type: 'removed', content: 'Professional teeth whitening at our clinic.' },
        { type: 'added', content: 'Professional teeth whitening in Ramat Gan — results in one 60-minute visit, from ₪600.' },
      ],
    } as ContentDiff,
  },
} as const

import type { BlogDraft } from './types'

/**
 * DEMO_BLOG — Blog Studio fixture data
 * Business: Bright Smile Dental, Ramat Gan
 */
export const DEMO_BLOG = {
  drafts: [
    {
      id: 'b1',
      topic: '5 Questions to Ask Your Dentist Before Getting Implants in Ramat Gan',
      locked: false,
      targetWordCount: 1200,
      lastSavedAt: '2026-06-10T15:30:00.000Z',
      content: '# 5 Questions to Ask Your Dentist Before Getting Implants\n\nDental implants are a significant investment…',
      status: 'draft',
    },
    {
      id: 'b2',
      topic: 'Why AI Search Engines Recommend Certain Dental Clinics',
      locked: true,
      targetWordCount: 1500,
      lastSavedAt: null,
      content: '',
      status: 'draft',
    },
  ] as BlogDraft[],
} as const

/**
 * STUB_DIGESTS — Wave 1 placeholder data for real (non-demo) users.
 *
 * Wave 2: replace with `await fetchWeeklyDigests(customerId)` from Supabase.
 *
 * This module is imported by both the list page and the detail page so the
 * stub set stays in sync. Exported as a named array — same shape as DEMO_DIGESTS.
 *
 * Engineering Principle #9 (applied): `agentName` / `agentProposer` fields ARE
 * present in the raw type but must NOT be rendered in any customer-facing UI.
 * The detail page reads from this list; it skips those fields by design.
 */

import type { WeeklyDigest } from '@/types/digest'

export const STUB_DIGESTS: WeeklyDigest[] = [
  {
    id: 'digest-2026-06-08',
    weekOf: '2026-06-08',
    weekLabel: 'Week of Jun 8',
    weekYear: '2026',
    weekRelative: 'This week',
    digest: {
      headline: 'Perplexity picked up your FAQ block — three queries landing this week',
      narrativeLine:
        'A schema update and a new FAQ section pushed your Perplexity score up 8 points. ChatGPT held steady and Gemini is still indexing the new content.',
      wins: [
        {
          id: 'w1',
          type: 'faq',
          description:
            'New FAQ block added to your services page — Perplexity cited it for "dental implants cost near me"',
          query: 'dental implants cost near me',
        },
        {
          id: 'w2',
          type: 'schema',
          description:
            'LocalBusiness schema updated with correct service area and hours — picked up by ChatGPT within 48 hours',
        },
        {
          id: 'w3',
          type: 'citation',
          description:
            'Your business name now appears in 2 new citation sources that feed Perplexity\'s local index',
        },
        {
          id: 'w4',
          type: 'content',
          description:
            'Services page intro rewritten to answer "what makes a good cosmetic dentist" — ranking signal strengthened',
        },
      ],
      engineDeltas: [
        { engine: 'chatgpt', thisWeek: 71, lastWeek: 70, fourWeeksAgo: 65, delta: 1 },
        { engine: 'gemini', thisWeek: 58, lastWeek: 60, fourWeeksAgo: 55, delta: -2 },
        { engine: 'perplexity', thisWeek: 74, lastWeek: 66, fourWeeksAgo: 61, delta: 8 },
      ],
      resolvedApprovals: [
        {
          id: 'a1',
          title: 'Services page intro rewrite',
          type: 'content',
          previewSnippet:
            'At Smile Studio, we combine precision technique with a calming chair-side manner…',
          status: 'approved',
        },
        {
          id: 'a2',
          title: 'New FAQ: "Do you accept insurance?"',
          type: 'faq',
          previewSnippet:
            'Yes — we work directly with most PPO dental plans including Delta Dental and Cigna…',
          status: 'approved',
        },
      ],
      customerNote:
        'Perplexity is responding faster than expected to your FAQ work — this is the engine to push hard on this month. The Gemini dip is normal while they re-crawl the updated schema; expect it to recover by next week.',
    },
  },
  {
    id: 'digest-2026-06-01',
    weekOf: '2026-06-01',
    weekLabel: 'Week of Jun 1',
    weekYear: '2026',
    weekRelative: 'Last week',
    digest: {
      headline: 'Schema fix lands — ChatGPT begins picking up your practice for local queries',
      narrativeLine:
        'A corrected LocalBusiness schema gave ChatGPT what it needed. Your score jumped 6 points. The crew drafted two more content pieces awaiting your review.',
      wins: [
        {
          id: 'w5',
          type: 'schema',
          description:
            'Critical schema error fixed — practice address and phone number now match across all citation sources',
        },
        {
          id: 'w6',
          type: 'citation',
          description:
            'Yelp and Healthgrades listings updated to match schema — consistency score improved across all three engines',
        },
        {
          id: 'w7',
          type: 'outreach',
          description:
            'Outreach draft sent to two local health publications for backlink opportunities',
        },
      ],
      engineDeltas: [
        { engine: 'chatgpt', thisWeek: 70, lastWeek: 64, fourWeeksAgo: 63, delta: 6 },
        { engine: 'gemini', thisWeek: 60, lastWeek: 57, fourWeeksAgo: 55, delta: 3 },
        { engine: 'perplexity', thisWeek: 66, lastWeek: 64, fourWeeksAgo: 61, delta: 2 },
      ],
      resolvedApprovals: [
        {
          id: 'a3',
          title: 'Competitor gap analysis — implants page',
          type: 'content',
          previewSnippet:
            'Your implants page is missing cost guidance that three competitors rank for. Suggested: add a pricing range section…',
          status: 'approved',
        },
        {
          id: 'a4',
          title: 'After-hours contact FAQ',
          type: 'faq',
          previewSnippet:
            'For dental emergencies outside of office hours, please call our emergency line at…',
          status: 'rejected',
        },
        {
          id: 'a5',
          title: 'Google Business Profile description update',
          type: 'schema',
          previewSnippet:
            'Award-winning family and cosmetic dentistry in downtown Portland. Same-day appointments available…',
          status: 'expired',
        },
      ],
      customerNote:
        'The schema fix was overdue and ChatGPT rewarded it immediately. You\'re now visible for six local queries you weren\'t showing up for two weeks ago. Next priority is pushing Perplexity — it has the highest ceiling for your category right now.',
    },
  },
  {
    id: 'digest-2026-05-25',
    weekOf: '2026-05-25',
    weekLabel: 'Week of May 25',
    weekYear: '2026',
    weekRelative: '2 weeks ago',
    digest: {
      headline: 'Audit complete — 4 structural gaps identified, crew begins on schema first',
      narrativeLine:
        'Your first full audit surfaced four addressable gaps. The crew started on schema — the fastest signal for local ranking — and scheduled content work for the following week.',
      wins: [
        {
          id: 'w8',
          type: 'schema',
          description:
            'Full schema audit complete — LocalBusiness, Service, and Review markup assessed against all three engine requirements',
        },
        {
          id: 'w9',
          type: 'content',
          description:
            'Competitor gap report ready — your top 3 competitors analyzed for content and citation patterns',
        },
      ],
      engineDeltas: [
        { engine: 'chatgpt', thisWeek: 64, lastWeek: 63, fourWeeksAgo: null, delta: 1 },
        { engine: 'gemini', thisWeek: 57, lastWeek: 55, fourWeeksAgo: null, delta: 2 },
        { engine: 'perplexity', thisWeek: 64, lastWeek: 63, fourWeeksAgo: null, delta: 1 },
      ],
      resolvedApprovals: [
        {
          id: 'a6',
          title: 'Initial content audit summary',
          type: 'content',
          previewSnippet:
            'Your services page is missing structured answers to the 12 most common questions patients ask before choosing a dentist…',
          status: 'approved',
        },
      ],
      customerNote:
        'This was your baseline week — the crew ran a full audit so every move going forward is targeted, not guesswork. Schema is first because the return is fastest. Content work starts next week once the schema signals have had time to settle.',
    },
  },
]

/**
 * Resolve a single digest from the stub list by ID.
 * Returns undefined when no match is found.
 */
export function getStubDigestById(id: string): WeeklyDigest | undefined {
  return STUB_DIGESTS.find((d) => d.id === id)
}

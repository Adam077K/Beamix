import type { DemoAsk, AskMessage, GroundingStep } from './types'

/**
 * DEMO_ASK — Ask Beamix copilot fixture
 * Business: Bright Smile Dental, Ramat Gan
 *
 * Story arc: the clinic owner asks why Smile Center is ahead on teeth whitening,
 * and gets a cited, grounded answer referencing real scans, competitor data, and
 * the specific prompts and engine behavior that explains the gap.
 * A follow-up question leads to an actionable recommendation.
 */

// ---------------------------------------------------------------------------
// Suggested starter questions
// ---------------------------------------------------------------------------

const suggestedQuestions: string[] = [
  'Why is Smile Center ranking above us on teeth whitening?',
  'Which queries are sending the most AI traffic to our site right now?',
  'What did the FAQ agent change last week and did it help?',
  'Which competitor is growing fastest in AI search this month?',
]

// ---------------------------------------------------------------------------
// Thread — a believable 3-turn conversation
// ---------------------------------------------------------------------------

const thread: AskMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Why is Smile Center ranking above us on teeth whitening queries?',
  },
  {
    id: 'msg-2',
    role: 'beamix',
    content:
      "Across the three most-searched teeth whitening queries in your region, Smile Center is cited first by ChatGPT and Gemini in 5 out of 6 tests. The gap comes down to two specific factors.\n\nFirst, their whitening page lists explicit price ranges (₪400–₪800) with before-and-after images. ChatGPT and Gemini consistently surface pages that include pricing evidence for cost-intent queries, and your current page only says 'contact for pricing.'\n\nSecond, Smile Center has an online booking widget for whitening consultations directly on that page. Perplexity weights pages with conversion paths higher for transactional queries.\n\nYour whitening page does rank #1 on Perplexity for 'gentle teeth whitening' — an area where their page is silent. That's the gap you can widen while also closing the pricing one.",
    citations: [
      {
        type: 'scan',
        label: 'Scan: week of Jun 9 · ChatGPT whitening results',
        href: '/archive?run=scan-2026-06-09-chatgpt',
      },
      {
        type: 'competitor',
        label: 'Smile Center — /teeth-whitening page',
        href: '/competitors?domain=smile-center.co.il',
      },
      {
        type: 'prompt',
        label: 'Prompt: teeth whitening cost dentist Israel (3,800/mo)',
        href: '/prompts?id=p2',
      },
      {
        type: 'prompt',
        label: 'Prompt: professional teeth whitening near me Ramat Gan',
        href: '/prompts?id=p14',
      },
    ],
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'What would closing that pricing gap actually do to our rankings?',
  },
  {
    id: 'msg-4',
    role: 'beamix',
    content:
      "Based on the ranking patterns I see across your 30 tracked prompts, adding a visible price range and a book-a-consultation CTA to your whitening page would likely move you from position 2.1 to within striking distance of position 1 on ChatGPT for price-intent whitening queries.\n\nThe evidence: the three other pages that displaced Smile Center on non-price whitening queries all had an explicit cost signal plus a clear booking path. Your emergency-dentist page does this well — it ranks #1.2 on ChatGPT — and that page's structure is a near-perfect model to replicate here.\n\nThe Content agent can draft the updated page copy with a pricing section and FAQ schema in one run. Want me to queue that task?",
    citations: [
      {
        type: 'page',
        label: 'Your /emergency-dentist page — #1.2 on ChatGPT',
        href: '/analytics?topic=Emergency+dentist&engine=ChatGPT',
      },
      {
        type: 'scan',
        label: 'Scan: week of Jun 2 · post-schema agent run',
        href: '/archive?run=scan-2026-06-02-post-schema',
      },
      {
        type: 'prompt',
        label: 'Prompt: zoom whitening one session Israel (1,100/mo)',
        href: '/prompts?id=p21',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Grounding steps — what the agent ran to produce the answer
// ---------------------------------------------------------------------------

const groundingSteps: GroundingStep[] = [
  {
    label: 'Loaded business context',
    detail: 'brightsmile-dental.co.il · Ramat Gan · dental vertical',
  },
  {
    label: 'Read scan history',
    detail: 'Read 6 scans · weeks 2026-05-12 → 2026-06-09',
  },
  {
    label: 'Queried tracked prompts',
    detail: 'Matched 4 prompts tagged intent:transactional + topic:whitening',
  },
  {
    label: 'Fetched competitor pages',
    detail: 'Pulled Smile Center /teeth-whitening · Dental Plus /whitening',
  },
  {
    label: 'Cross-referenced ranking matrix',
    detail: 'Checked Teeth whitening × ChatGPT, Gemini, Perplexity cells',
  },
  {
    label: 'Synthesised answer',
    detail: 'Identified 2 structural gaps: pricing evidence + booking CTA',
  },
]

// ---------------------------------------------------------------------------
// Top-level export
// ---------------------------------------------------------------------------

export const DEMO_ASK: DemoAsk = {
  suggestedQuestions,
  thread,
  groundingSteps,
}

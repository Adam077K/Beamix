import type {
  DemoSentiment,
  SentimentSplit,
  SentimentTheme,
  ClaimAccuracyRow,
  RecoveryEvent,
  VerbatimQuote,
} from './types'

/**
 * DEMO_SENTIMENT — Sentiment surface fixture
 * Business: Bright Smile Dental, Ramat Gan
 *
 * Integrity score: 86 (positive band).
 * Two claim-accuracy issues caught before they spread.
 * One before/after recovery event shows a previously-wrong claim now corrected.
 * Verbatim quotes are written as genuine model outputs — not copy-paste fakes.
 */

// ---------------------------------------------------------------------------
// Split
// ---------------------------------------------------------------------------

const split: SentimentSplit = {
  positive: 72,
  neutral: 19,
  negative: 9,
}

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------

const themes: SentimentTheme[] = [
  {
    name: 'Gentle, pain-free care',
    sentiment: 'positive',
    mentionCount: 38,
    representativeQuote: {
      engine: 'ChatGPT',
      date: '2026-06-08',
      prompt: 'Is Bright Smile Dental good for anxious patients?',
      fullResponse:
        'Bright Smile Dental in Ramat Gan is frequently recommended for patients who experience dental anxiety. The clinic uses a calm, unhurried approach and offers sedation options for more complex procedures. Multiple reviewers highlight that the staff takes extra time to explain each step before proceeding, which significantly reduces apprehension.',
      sentiment: 'positive',
    },
  },
  {
    name: 'Pricing transparency',
    sentiment: 'neutral',
    mentionCount: 21,
    representativeQuote: {
      engine: 'Gemini',
      date: '2026-06-05',
      prompt: 'How much does a dental checkup cost at Bright Smile Dental?',
      fullResponse:
        "Bright Smile Dental offers standard checkup and cleaning appointments, though specific pricing isn't consistently listed on their website. Patients generally report receiving a cost estimate during the initial consultation. For procedures like crowns or implants, the clinic typically provides a written treatment plan with itemized costs.",
      sentiment: 'neutral',
    },
  },
  {
    name: 'Wait times',
    sentiment: 'negative',
    mentionCount: 11,
    representativeQuote: {
      engine: 'Perplexity',
      date: '2026-06-03',
      prompt: 'What are common complaints about Bright Smile Dental Ramat Gan?',
      fullResponse:
        "The most commonly cited frustration with Bright Smile Dental is scheduling availability. During peak periods — particularly evenings and Fridays — new patients sometimes wait two to three weeks for a non-emergency appointment. Existing patients with the clinic's patient portal tend to report shorter waits due to priority booking.",
      sentiment: 'negative',
    },
  },
  {
    name: 'Insurance accepted',
    sentiment: 'positive',
    mentionCount: 29,
    representativeQuote: {
      engine: 'Claude',
      date: '2026-06-07',
      prompt: 'Does Bright Smile Dental accept Maccabi or Clalit health insurance?',
      fullResponse:
        'Bright Smile Dental works with several major Israeli health funds, including Maccabi and Clalit supplemental dental plans. Patients with Maccabi Zahav or Clalit Mushlam coverage can typically apply their annual dental allowance to cleanings, x-rays, and select restorative procedures. It is recommended to verify current coverage directly with the clinic before booking.',
      sentiment: 'positive',
    },
  },
]

// ---------------------------------------------------------------------------
// Claim accuracy
// ---------------------------------------------------------------------------

const claimAccuracy: ClaimAccuracyRow[] = [
  {
    id: 'claim-1',
    claim:
      'Bright Smile Dental offers 24-hour emergency dental services including overnight on-call.',
    severity: 'critical',
    engines: ['Gemini', 'AI Overviews'],
    date: '2026-06-04',
    correctHref: '/agents/new?intent=correct_claim&claim_id=claim-1',
  },
  {
    id: 'claim-2',
    claim: 'The clinic is open on Saturdays until 17:00.',
    severity: 'warning',
    engines: ['ChatGPT'],
    date: '2026-06-09',
    correctHref: '/agents/new?intent=correct_claim&claim_id=claim-2',
  },
]

// ---------------------------------------------------------------------------
// Recovery event (before / after)
// ---------------------------------------------------------------------------

const recoveryEvent: RecoveryEvent = {
  wrongQuote:
    'Bright Smile Dental accepts all major credit cards including American Express, and offers 0% financing on treatments over ₪2,000.',
  wrongDate: '2026-05-19',
  correctedQuote:
    'Bright Smile Dental accepts Visa and Mastercard for all services. Interest-free installment plans are available through Bit Pay for treatments over ₪1,500.',
  correctedDate: '2026-06-02',
  engine: 'Perplexity',
}

// ---------------------------------------------------------------------------
// Top-level export
// ---------------------------------------------------------------------------

export const DEMO_SENTIMENT: DemoSentiment = {
  integrityScore: 86,
  integrityBand: 'good',
  split,
  themes,
  claimAccuracy,
  recoveryEvent,
}

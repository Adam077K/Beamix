import type {
  DemoAgency,
  ProspectAudit,
  AgencyDryRunStep,
  AgencyClient,
  WhiteLabelConfig,
  AgencyLead,
} from './types'

/**
 * DEMO_AGENCY — Agency / Pitch Workspace surface fixture
 * Business: Bright Smile Dental, Ramat Gan (using Beamix as their own agency tool)
 *
 * Story arc: Bright Smile Dental is itself a Beamix client (active).
 * The owner is also pitching two prospective dental clients with generated audits.
 * The sample audit is for a prospect in Tel Aviv with a score of 31/100 —
 * a strong case for GEO services. White-label config exists for one active client.
 */

// ---------------------------------------------------------------------------
// Sample prospect audit
// ---------------------------------------------------------------------------

const sampleAudit: ProspectAudit = {
  prospectDomain: 'goldendental.co.il',
  score: 31,
  headline:
    'Golden Dental is nearly invisible in AI search — cited in only 2 of 22 tracked queries across ChatGPT, Gemini, and Perplexity.',
  findings: [
    {
      label: 'No FAQPage schema on any service page',
      severity: 'critical',
      detail:
        'ChatGPT and Gemini prioritise structured Q&A for informational dental queries. None of the 8 key service pages carry FAQPage JSON-LD.',
    },
    {
      label: 'Pricing missing from whitening and implant pages',
      severity: 'critical',
      detail:
        'Transactional queries for teeth whitening and implants in Tel Aviv show Smile Center and Dental Plus first — both list explicit price ranges. Golden Dental does not.',
    },
    {
      label: 'No citations from authoritative dental directories',
      severity: 'warning',
      detail:
        'Israel Dental Association and Maccabi\'s provider directory do not list Golden Dental. These co-citation sources influence AI ranking signals.',
    },
    {
      label: 'Competitor claims unchallenged in AI responses',
      severity: 'warning',
      detail:
        'Perplexity incorrectly describes Golden Dental as "cash-only" — likely from an outdated review. No correction mechanism is in place.',
    },
    {
      label: 'Entity not established in AI knowledge bases',
      severity: 'info',
      detail:
        'No structured entity markup (LocalBusiness schema with geo coordinates, opening hours, specialties) on the homepage.',
    },
  ],
  generatedAt: '2026-06-11T11:00:00Z',
}

// ---------------------------------------------------------------------------
// Dry-run audit pipeline ledger
// ---------------------------------------------------------------------------

const dryRunSteps: AgencyDryRunStep[] = [
  {
    label: 'Crawled prospect domain',
    detail: 'goldendental.co.il · 14 pages indexed',
  },
  {
    label: 'Ran AI search scans',
    detail: '22 queries · ChatGPT, Gemini, Perplexity',
  },
  {
    label: 'Identified competitor set',
    detail: '4 competitors with higher SoV in same query set',
  },
  {
    label: 'Audited schema + structured data',
    detail: 'No FAQPage, no LocalBusiness schema found',
  },
  {
    label: 'Checked entity citations',
    detail: 'Israel Dental Association · Maccabi · Zap Doctors — not listed',
  },
  {
    label: 'Generated audit report',
    detail: 'Score 31/100 · 5 findings · headline written',
  },
]

// ---------------------------------------------------------------------------
// Client roster
// ---------------------------------------------------------------------------

const clients: AgencyClient[] = [
  {
    name: 'Bright Smile Dental',
    domain: 'brightsmile-dental.co.il',
    status: 'active',
  },
  {
    name: 'Golden Dental Tel Aviv',
    domain: 'goldendental.co.il',
    status: 'pitching',
  },
  {
    name: 'HaifaSmile Clinic',
    domain: 'haifasmile.co.il',
    status: 'pitching',
  },
  {
    name: 'Rehovot Family Dental',
    domain: 'rfamilydental.co.il',
    status: 'lead',
  },
]

// ---------------------------------------------------------------------------
// White-label config per client
// ---------------------------------------------------------------------------

const whiteLabel: WhiteLabelConfig[] = [
  {
    clientId: 'brightsmile-dental.co.il',
    logoUrl: null,
    accent: '#3370FF',
    customDomain: null,
  },
]

// ---------------------------------------------------------------------------
// Agency pipeline leads
// ---------------------------------------------------------------------------

const leads: AgencyLead[] = [
  { prospect: 'Golden Dental Tel Aviv', stage: 'pitch' },
  { prospect: 'HaifaSmile Clinic', stage: 'audit' },
  { prospect: 'Rehovot Family Dental', stage: 'audit' },
]

// ---------------------------------------------------------------------------
// Top-level export
// ---------------------------------------------------------------------------

export const DEMO_AGENCY: DemoAgency = {
  sampleAudit,
  dryRunSteps,
  clients,
  whiteLabel,
  leads,
}

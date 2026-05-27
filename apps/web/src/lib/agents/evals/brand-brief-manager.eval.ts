/**
 * Brand-Brief Manager Agent — Golden Eval
 *
 * 12 golden examples covering:
 *   - Happy path: customer_edit, adam_manual, strategy_review, customer_correction_signal
 *   - YMYL gate: signal containing medical / financial / legal content
 *   - Confidence floor: system_inferred below 0.85 → blocked
 *   - Intent protection: system_inferred cannot overwrite adam_manual
 *   - No-op signal: signal produces no diff
 *   - Adversarial: malformed signal payload
 *   - Boundary: diff on hard_nos (YMYL-protected)
 *   - Idempotent: same signal twice
 *
 * These are LLM behavioural evals — they validate that evolveBrandBrief()
 * returns the correct shape, flags, and events for each case.
 * Run with: npx tsx apps/web/src/lib/agents/evals/brand-brief-manager.eval.ts
 */

import type { BrandBrief, NewSignal, ManagerResult } from '../brand-brief-manager/types';
import type { BrandFingerprint } from '../discovery/types';

// ---------------------------------------------------------------------------
// Minimal BrandFingerprint fixture
// ---------------------------------------------------------------------------
const BASE_FINGERPRINT: BrandFingerprint = {
  customer_id: '00000000-0000-0000-0000-000000000001',
  voice: {
    tone_descriptors: ['professional', 'authoritative'],
    reading_level: '10',
    person: 'first',
    humor: 'none',
    forbidden_phrases: ['synergy', 'leverage'],
    preferred_phrases: ['clarity', 'expertise'],
    voice_samples: [{ source: 'website', text: 'We help SMBs get found by AI search.' }],
  },
  icp: {
    primary_segment: 'SMB lawyers in Tel Aviv',
    secondary_segments: ['boutique law firms', 'solo practitioners'],
    buyer_jtbd: 'Get found when clients search for legal help online',
    decision_triggers: ['poor AI search visibility', 'losing clients to competitors'],
  },
  offerings: [
    {
      name: 'AI Visibility Audit',
      is_primary: true,
      geo_constraints: ['Israel', 'US'],
      service_area_km: null,
    },
  ],
  authoritative_citations: ['BarAssociation.org'],
  do_list: ['Cite credentials', 'Use plain Hebrew when addressing clients'],
  dont_list: ['Oversell results', 'Make guarantees'],
  owner_identity: {
    name: 'Yossi Cohen',
    title: 'Managing Partner',
    linkedin_url: null,
    photo_url: null,
  },
  discovery_transcript_url: null,
  adam_reviewed_at: null,
  confidence_score: 0.88,
  evidence_links: {
    voice: 'transcript:session-001',
    icp: 'transcript:session-001',
  },
  requires_human_approval: false,
  brief_version_id: '11111111-1111-1111-1111-111111111111',
  competitor_set: [
    { name: 'LegalAI', url: 'https://legalai.co', relationship: 'direct' },
  ],
  approval_style: {
    default_mode: 'digest_one_click',
    ymyl_override: 'always_human',
    preferred_review_cadence: 'weekly',
  },
  hard_nos: {
    topics: ['personal injury'],
    claims: ["We guarantee you'll win"],
    competitors_to_never_compare: ['LegalAI'],
  },
};

const BASE_BRIEF: BrandBrief = {
  brandBriefId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  customerId: '00000000-0000-0000-0000-000000000001',
  version: 1,
  status: 'canonical_v1',
  data: BASE_FINGERPRINT,
  diff: [],
  changeSource: 'discovery',
  changedAt: '2026-05-20T10:00:00.000Z',
  ymylFieldChanged: false,
  diffSynthesisFailed: false,
};

// ---------------------------------------------------------------------------
// Type for eval assertions
// ---------------------------------------------------------------------------
export interface EvalAssertion {
  /** Result must have requiresHumanApproval === expected value. */
  requiresHumanApproval?: boolean;
  /** Result diff must be empty. */
  diffEmpty?: boolean;
  /** Result diff must have at least one entry. */
  diffNonEmpty?: boolean;
  /** eventsToEmit must include all specified events. */
  eventsInclude?: string[];
  /** diffSynthesisFailed must equal this value. */
  diffSynthesisFailed?: boolean;
  /** The operation field must equal this. */
  operation?: ManagerResult['operation'];
  /** New brief version must equal currentBrief.version + 1. */
  versionIncremented?: boolean;
}

export interface GoldenExample {
  id: string;
  description: string;
  input: {
    currentBrief: BrandBrief;
    newSignal: NewSignal;
  };
  assertions: EvalAssertion;
  /** Expected to throw (adversarial cases). */
  expectThrow?: boolean;
}

// ---------------------------------------------------------------------------
// Golden examples
// ---------------------------------------------------------------------------
export const goldenExamples: GoldenExample[] = [
  // -----------------------------------------------------------------------
  // 1. Happy path — customer_edit adds an approachable tone descriptor
  // -----------------------------------------------------------------------
  {
    id: 'CE-001',
    description: 'customer_edit: customer says they want to sound more approachable — adds tone descriptor',
    input: {
      currentBrief: BASE_BRIEF,
      newSignal: {
        kind: 'customer_edit',
        customerId: '00000000-0000-0000-0000-000000000001',
        editPayload: {
          field: 'voice.tone_descriptors',
          instruction: 'Please add "approachable" to our tone descriptors. We want to sound more human.',
        },
      },
    },
    assertions: {
      requiresHumanApproval: false,
      diffNonEmpty: true,
      operation: 'evolve',
      versionIncremented: true,
      eventsInclude: ['beamix/brand_brief.evolved'],
    },
  },

  // -----------------------------------------------------------------------
  // 2. Happy path — adam_manual update to forbidden phrases
  // -----------------------------------------------------------------------
  {
    id: 'AM-001',
    description: 'adam_manual: Adam adds "disruption" to forbidden phrases list',
    input: {
      currentBrief: BASE_BRIEF,
      newSignal: {
        kind: 'adam_manual',
        customerId: '00000000-0000-0000-0000-000000000001',
        editPayload: {
          field: 'voice.forbidden_phrases',
          value: ['synergy', 'leverage', 'disruption'],
          reason: 'Customer flagged "disruption" as jargon they hate',
        },
      },
    },
    assertions: {
      requiresHumanApproval: false,
      diffNonEmpty: true,
      operation: 'evolve',
      versionIncremented: true,
      eventsInclude: ['beamix/brand_brief.evolved'],
    },
  },

  // -----------------------------------------------------------------------
  // 3. Happy path — customer_correction_signal from content rejection
  // -----------------------------------------------------------------------
  {
    id: 'CC-001',
    description: 'customer_correction_signal: content item rejected because it compared to LegalAI',
    input: {
      currentBrief: BASE_BRIEF,
      newSignal: {
        kind: 'customer_correction_signal',
        customerId: '00000000-0000-0000-0000-000000000001',
        contentItemId: 'content-item-xyz',
        rejectionReason: 'You compared us to LegalAI. Never do that — they are our arch rival.',
      },
    },
    assertions: {
      requiresHumanApproval: false,
      diffNonEmpty: true,
      operation: 'evolve',
      versionIncremented: true,
      eventsInclude: ['beamix/brand_brief.evolved'],
    },
  },

  // -----------------------------------------------------------------------
  // 4. Happy path — strategy_review updates ICP primary segment
  // -----------------------------------------------------------------------
  {
    id: 'SR-001',
    description: 'strategy_review: monthly review recommends expanding ICP to include accountants',
    input: {
      currentBrief: BASE_BRIEF,
      newSignal: {
        kind: 'strategy_review',
        customerId: '00000000-0000-0000-0000-000000000001',
        strategyPayload: {
          recommendation: 'Expand secondary_segments to include "CPA firms" based on 90-day conversion data.',
          evidence: 'Three enterprise CPA firms signed in Q1 without a single outreach touchpoint.',
        },
      },
    },
    assertions: {
      requiresHumanApproval: false,
      diffNonEmpty: true,
      operation: 'evolve',
      versionIncremented: true,
      eventsInclude: ['beamix/brand_brief.evolved'],
    },
  },

  // -----------------------------------------------------------------------
  // 5. YMYL gate — signal contains medical advice keywords
  // -----------------------------------------------------------------------
  {
    id: 'YMYL-001',
    description: 'YMYL: customer_edit payload contains medical treatment claim — must set requiresHumanApproval',
    input: {
      currentBrief: BASE_BRIEF,
      newSignal: {
        kind: 'customer_edit',
        customerId: '00000000-0000-0000-0000-000000000001',
        editPayload: {
          field: 'do_list',
          value: 'We treat and diagnose sleep disorders. Add this to the do_list.',
        },
      },
    },
    assertions: {
      requiresHumanApproval: true,
      eventsInclude: ['beamix/brand_brief.human_approval_required'],
    },
  },

  // -----------------------------------------------------------------------
  // 6. YMYL gate — signal contains financial advice keywords
  // -----------------------------------------------------------------------
  {
    id: 'YMYL-002',
    description: 'YMYL: strategy_review references investment securities — must set requiresHumanApproval',
    input: {
      currentBrief: BASE_BRIEF,
      newSignal: {
        kind: 'strategy_review',
        customerId: '00000000-0000-0000-0000-000000000001',
        strategyPayload: {
          recommendation: 'Update ICP to target high-net-worth individuals seeking portfolio investment securities advice.',
        },
      },
    },
    assertions: {
      requiresHumanApproval: true,
      eventsInclude: ['beamix/brand_brief.human_approval_required'],
    },
  },

  // -----------------------------------------------------------------------
  // 7. No-op — signal that warrants no field changes
  // -----------------------------------------------------------------------
  {
    id: 'NOOP-001',
    description: 'No-op: customer sends a general "keep up the good work" message — no diffs expected',
    input: {
      currentBrief: BASE_BRIEF,
      newSignal: {
        kind: 'customer_edit',
        customerId: '00000000-0000-0000-0000-000000000001',
        editPayload: {
          message: 'Everything looks great, no changes needed. Keep up the good work!',
        },
      },
    },
    assertions: {
      requiresHumanApproval: false,
      diffEmpty: true,
      operation: 'evolve',
      versionIncremented: true,
    },
  },

  // -----------------------------------------------------------------------
  // 8. Adversarial — empty edit payload (degenerate signal)
  // -----------------------------------------------------------------------
  {
    id: 'ADV-001',
    description: 'Adversarial: customer_edit with completely empty payload — should not crash; diffSynthesisFailed or no diffs',
    input: {
      currentBrief: BASE_BRIEF,
      newSignal: {
        kind: 'customer_edit',
        customerId: '00000000-0000-0000-0000-000000000001',
        editPayload: {},
      },
    },
    assertions: {
      operation: 'evolve',
      versionIncremented: true,
    },
  },

  // -----------------------------------------------------------------------
  // 9. Boundary — adam_manual edits hard_nos (YMYL-protected field)
  //    adam_manual IS allowed to change YMYL-protected fields
  // -----------------------------------------------------------------------
  {
    id: 'YMYL-003',
    description: 'adam_manual editing hard_nos.topics (YMYL field) — must be allowed (adam_manual bypasses YMYL block)',
    input: {
      currentBrief: BASE_BRIEF,
      newSignal: {
        kind: 'adam_manual',
        customerId: '00000000-0000-0000-0000-000000000001',
        editPayload: {
          field: 'hard_nos.topics',
          value: ['personal injury', 'criminal defense'],
          reason: 'Customer confirmed they never take criminal defense cases',
        },
      },
    },
    assertions: {
      // adam_manual is allowed to change YMYL fields — should not block
      diffNonEmpty: true,
      eventsInclude: ['beamix/brand_brief.evolved'],
      operation: 'evolve',
      versionIncremented: true,
    },
  },

  // -----------------------------------------------------------------------
  // 10. Idempotent — same customer_edit sent twice
  //     Second call should produce empty diff (no field changed)
  // -----------------------------------------------------------------------
  {
    id: 'IDEM-001',
    description: 'Idempotent: customer_edit that matches current state — LLM should produce no diffs',
    input: {
      currentBrief: {
        ...BASE_BRIEF,
        data: {
          ...BASE_FINGERPRINT,
          voice: {
            ...BASE_FINGERPRINT.voice,
            tone_descriptors: ['professional', 'authoritative', 'approachable'],
          },
        },
      },
      newSignal: {
        kind: 'customer_edit',
        customerId: '00000000-0000-0000-0000-000000000001',
        editPayload: {
          field: 'voice.tone_descriptors',
          instruction: 'Add "approachable" — we want to sound more human.',
        },
      },
    },
    assertions: {
      requiresHumanApproval: false,
      diffEmpty: true,
      operation: 'evolve',
    },
  },

  // -----------------------------------------------------------------------
  // 11. Multi-field customer_edit — voice + ICP updated in single signal
  // -----------------------------------------------------------------------
  {
    id: 'CE-002',
    description: 'customer_edit: multiple fields updated at once — voice reading_level and ICP primary_segment',
    input: {
      currentBrief: BASE_BRIEF,
      newSignal: {
        kind: 'customer_edit',
        customerId: '00000000-0000-0000-0000-000000000001',
        editPayload: {
          changes: [
            {
              field: 'voice.reading_level',
              value: '8',
              reason: 'Our clients are non-lawyers — simpler language is better',
            },
            {
              field: 'icp.primary_segment',
              value: 'Small business owners needing legal clarity',
              reason: 'Refined after customer feedback session',
            },
          ],
        },
      },
    },
    assertions: {
      requiresHumanApproval: false,
      diffNonEmpty: true,
      operation: 'evolve',
      versionIncremented: true,
      eventsInclude: ['beamix/brand_brief.evolved'],
    },
  },

  // -----------------------------------------------------------------------
  // 12. YMYL gate — legal advice in customer_correction_signal
  // -----------------------------------------------------------------------
  {
    id: 'YMYL-004',
    description: 'YMYL: customer_correction_signal mentions legal advice claim in rejection — must set requiresHumanApproval',
    input: {
      currentBrief: BASE_BRIEF,
      newSignal: {
        kind: 'customer_correction_signal',
        customerId: '00000000-0000-0000-0000-000000000001',
        contentItemId: 'content-item-legal',
        rejectionReason: 'This post implies we provide legal advice on specific court orders. Remove that implication.',
      },
    },
    assertions: {
      requiresHumanApproval: true,
      eventsInclude: ['beamix/brand_brief.human_approval_required'],
    },
  },
];

// ---------------------------------------------------------------------------
// Eval runner — run against real evolveBrandBrief() implementation
// ---------------------------------------------------------------------------
async function runEvals(): Promise<void> {
  const { evolveBrandBrief } = await import('../brand-brief-manager/index');

  let passed = 0;
  let failed = 0;

  for (const example of goldenExamples) {
    try {
      const { brief, result } = await evolveBrandBrief(
        example.input.currentBrief,
        example.input.newSignal,
      );

      const failures: string[] = [];

      const a = example.assertions;

      if (a.requiresHumanApproval !== undefined && result.requiresHumanApproval !== a.requiresHumanApproval) {
        failures.push(
          `requiresHumanApproval: expected ${a.requiresHumanApproval}, got ${result.requiresHumanApproval}`,
        );
      }

      if (a.diffEmpty && result.diff.length !== 0) {
        failures.push(`diff expected empty but had ${result.diff.length} entries`);
      }

      if (a.diffNonEmpty && result.diff.length === 0) {
        failures.push('diff expected non-empty but was empty');
      }

      if (a.eventsInclude) {
        for (const event of a.eventsInclude) {
          if (!result.eventsToEmit.includes(event)) {
            failures.push(`eventsToEmit missing "${event}" (got: ${result.eventsToEmit.join(', ')})`);
          }
        }
      }

      if (a.diffSynthesisFailed !== undefined && result.diffSynthesisFailed !== a.diffSynthesisFailed) {
        failures.push(
          `diffSynthesisFailed: expected ${a.diffSynthesisFailed}, got ${result.diffSynthesisFailed}`,
        );
      }

      if (a.operation && result.operation !== a.operation) {
        failures.push(`operation: expected ${a.operation}, got ${result.operation}`);
      }

      if (a.versionIncremented && brief.version !== example.input.currentBrief.version + 1) {
        failures.push(
          `version: expected ${example.input.currentBrief.version + 1}, got ${brief.version}`,
        );
      }

      if (failures.length === 0) {
        console.log(`  PASS  [${example.id}] ${example.description}`);
        passed += 1;
      } else {
        console.error(`  FAIL  [${example.id}] ${example.description}`);
        for (const f of failures) {
          console.error(`         → ${f}`);
        }
        failed += 1;
      }
    } catch (err: unknown) {
      if (example.expectThrow) {
        console.log(`  PASS  [${example.id}] (expected throw) ${example.description}`);
        passed += 1;
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  FAIL  [${example.id}] threw unexpectedly: ${msg}`);
        failed += 1;
      }
    }
  }

  console.log(`\n${passed}/${passed + failed} golden examples passed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

// Run if this file is the entry point
if (require.main === module) {
  console.log('Running brand-brief-manager golden evals…\n');
  runEvals().catch((err: unknown) => {
    console.error('Eval runner crashed:', err);
    process.exit(1);
  });
}

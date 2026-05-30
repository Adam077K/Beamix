/**
 * YMYL Detection — shared by Customer Success + Approval-Gate Writer agents.
 *
 * Defence-in-depth: every external publish path scans both inbound context
 * AND generated artifacts. YMYL = Your Money or Your Life (Google's term).
 * In Beamix's pipeline a YMYL hit means HARD GATE — no auto-publish, ever.
 *
 * Mirror the pattern already in `brand-brief-manager/index.ts`; the rules
 * are deliberately broad — false positives route through human review,
 * which is cheap. False negatives ship YMYL claims that may be wrong.
 */

export interface YmylMatch {
  /** Human-readable category (e.g. "Medical advice"). */
  reason: string;
  /** The first matching token from the corpus — useful for audit_log. */
  pattern: string;
}

/**
 * The patterns used to flag YMYL content. Each entry is [regex, category].
 * Patterns are case-insensitive (applied against a lowercased corpus).
 *
 * Adding a pattern? Add positive + negative test fixtures in the eval file.
 */
export const YMYL_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  // Medical / health
  [
    /\b(medical|diagnos(?:is|es|e|ed)|treatment|prescription|drug|medication|symptom|cure|prevent|treat|side[- ]effect|clinical[- ]trial|dosage|FDA[- ]approved)\b/i,
    'Medical advice',
  ],
  [/\b(health claim|wellness claim|nutritional claim|supplement claim)\b/i, 'Health claim'],
  // Legal
  [
    /\b(legal advice|attorney[- ]client|lawsuit|sue\b|litigation|court order|plead guilty|statute of limitations|legally binding|liability waiver|class[- ]action)\b/i,
    'Legal advice',
  ],
  // Financial
  [
    /\b(financial advice|investment advice|portfolio allocation|securities|stock pick|crypto signal|tax advice|tax shelter|guaranteed return|APR\b|fiduciary duty)\b/i,
    'Financial advice',
  ],
  // Catch-all explicit YMYL marker (used by upstream agents to set flags)
  [/\bYMYL\b/i, 'Explicit YMYL flag'],
];

/**
 * Scan a corpus and return the first YMYL match, or null. The corpus may be
 * any concatenation of relevant strings — the caller is responsible for
 * deciding what to scan (e.g. inbound context + LLM draft).
 */
export function detectYmyl(corpus: string): YmylMatch | null {
  if (!corpus) return null;
  for (const [pattern, reason] of YMYL_PATTERNS) {
    const match = pattern.exec(corpus);
    if (match) {
      return { reason, pattern: match[0] };
    }
  }
  return null;
}

/**
 * True when any YMYL pattern matches. Convenience wrapper.
 */
export function hasYmyl(corpus: string): boolean {
  return detectYmyl(corpus) !== null;
}

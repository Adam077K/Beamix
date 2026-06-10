/**
 * narration.ts — Evidence-bound LLM narration layer for Wave 6.
 *
 * DESIGN CONTRACT (non-negotiable):
 *
 *   The LLM NARRATES, never computes. It receives code-derived RankedGap[],
 *   per-engine subscores/bands, competitor names, and contrastive_evidence strings.
 *   It phrases them in plain language. It MUST NOT produce a new number, a new issue,
 *   or a causal "why" that was not already in the inputs.
 *
 *   CHEAP CODE CHECK (mandated, blocking): after the LLM returns, CODE verifies that
 *   every quoted span AND every competitor name in the narration actually appears in the
 *   stored evidence (raw_response + competitors_with_factor + RankedGap fields + subscore
 *   numeric strings). Strip or flag any ungrounded quote/competitor/number claim.
 *   This check is DETERMINISTIC — no second LLM verifier.
 *
 *   HONESTY SPINE: FACT/OBSERVATION class only.
 *   BANNED phrasing: "invisible BECAUSE X", "WILL raise your score Y%", "this will improve…"
 *   Hygiene gaps (promises_lift=false / Tier-3) are described as hygiene, NEVER as wins.
 *
 *   "WHY THEY BEAT YOU" = OUR verified evidence only (contrastive_evidence + competitor
 *   factor audits we ran). NEVER use an engine's confabulated stated reason as the finding.
 *
 *   FALLBACK: on any LLM/parse error → deterministic template summary from rankedGaps
 *   (top-N lift gaps' contrastive_evidence), with verified=false, degraded=true,
 *   model_id=null. NEVER throw.
 *
 * NARRATION STAGE NOTE:
 *   This function runs over STORED evidence on the agent's key — NOT during the probe.
 *   The no-leak probe surface is a separate firewall (see measurement-types.ts).
 *   businessName here is for narration OUTPUT labeling only; it never enters a probe prompt.
 *
 * MODEL ROUTING (per SCAN-ORCHESTRATION.md §"Model routing"):
 *   Narration = cheap model free tier / slightly better model paid tier.
 *   Default: 'google/gemini-2.5-flash' (cheap, fast, matches other scan stages).
 *   Haiku intent / Sonnet intent expressed via input.tier + deps.model override.
 */

import { callOpenRouter } from './openrouter-client';
import type { OpenRouterRequest, OpenRouterResponse } from './openrouter-client';
import { sanitizeForPrompt } from './prompts';
import { splitLiftVsHygiene } from './gap-list-ordering';
import type { RankedGap } from './gap-types';
import type { EngineSubscore, EngineProbeObservation } from './measurement-types';

// ---------------------------------------------------------------------------
// Default narration model
// ---------------------------------------------------------------------------

/**
 * Default OpenRouter model for narration.
 * Cheap + fast; matches other scan stages (google/gemini-2.5-flash).
 * Override via deps.model for paid-tier Sonnet calls.
 * Per SCAN-ORCHESTRATION.md §"Model routing": Haiku free / Sonnet paid.
 */
export const DEFAULT_NARRATION_MODEL = 'google/gemini-2.5-flash';

/**
 * Model for paid-tier narration (richer phrasing, same grounding rules).
 * Selected automatically when input.tier === 'paid' and no deps.model override.
 */
export const PAID_NARRATION_MODEL = 'anthropic/claude-haiku-4-5';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * The structured output from narrate().
 *
 * summary           — 2–4 sentence plain-language summary of the scan state and top gaps.
 * gap_explanations  — Per-gap plain-language sentence, one per RankedGap in input.
 * verified          — true when every surviving claim is grounded in the evidence corpus.
 *                     false when fallback was used OR after stripping something.
 * ungrounded_claims_stripped — Count of sentences/explanations stripped by the code check.
 * degraded          — true when anything was stripped OR fallback was used.
 * model_id          — The OpenRouter model used, or null if fallback (no LLM).
 */
export interface NarrationResult {
  summary: string;
  gap_explanations: Array<{ factor_key: string; text: string }>;
  verified: boolean;
  ungrounded_claims_stripped: number;
  degraded: boolean;
  model_id: string | null;
}

/**
 * All inputs to the narration stage.
 *
 * NOTE: businessName is for narration OUTPUT labeling only.
 * This stage runs on the agent key over STORED evidence — it is NOT the probe surface.
 * The no-leak firewall (NeutralQuery / ClientIdentity split) is a separate concern.
 *
 * tier controls model selection (free → cheap model, paid → richer model).
 * deps.model overrides tier-based selection.
 */
export interface NarrationInput {
  rankedGaps: RankedGap[];
  subscores: EngineSubscore[];
  observations: EngineProbeObservation[];
  businessName: string;
  tier?: 'free' | 'paid';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Strip markdown code fences from a raw LLM string before JSON.parse.
 * Mirrors the pattern in sentiment-judge.ts and prompts.ts.
 */
function stripFences(raw: string): string {
  return raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
}

// ---------------------------------------------------------------------------
// Prompt builder (pure — no I/O)
// ---------------------------------------------------------------------------

/**
 * Build the system + user prompts for the narration LLM call.
 *
 * The model receives ONLY:
 *   - Ranked gaps with their contrastive_evidence sentences (FACT-class)
 *   - Per-engine bands/presence numbers (code-computed)
 *   - Competitor names (from competitors_with_factor)
 *   - The business name (for output labeling)
 *
 * It is explicitly instructed to:
 *   - ONLY restate the provided facts and numbers
 *   - NOT invent issues, numbers, or reasons
 *   - NOT produce hypothesis/causal language ("invisible BECAUSE", "WILL raise Y%")
 *   - Quote an engine line ONLY if it is in the provided evidence
 *   - Describe hygiene items as hygiene, not wins
 *
 * All user-derived strings are sanitized before interpolation.
 */
export function buildNarrationPrompt(input: NarrationInput): { system: string; user: string } {
  const safeName = sanitizeForPrompt(input.businessName);

  const { lift: liftGaps, hygiene: hygieneGaps } = splitLiftVsHygiene(input.rankedGaps);

  // Build gap evidence block — include only what the model is allowed to restate.
  // contrastive_evidence is already FACT-class; include factor_key for the JSON output contract.
  const liftBlock = liftGaps
    .slice(0, 6) // cap to avoid prompt bloat; top 6 is sufficient for narration
    .map(
      (g, i) =>
        `  ${i + 1}. [${g.factor_key}] ${sanitizeForPrompt(g.display_name)}: ${sanitizeForPrompt(g.contrastive_evidence)}` +
        (g.competitors_with_factor.length > 0
          ? ` (competitors: ${g.competitors_with_factor.map(sanitizeForPrompt).join(', ')})`
          : ''),
    )
    .join('\n');

  const hygieneBlock = hygieneGaps
    .slice(0, 4)
    .map(
      (g, i) =>
        `  ${i + 1}. [${g.factor_key}] ${sanitizeForPrompt(g.display_name)}: ${sanitizeForPrompt(g.contrastive_evidence)}`,
    )
    .join('\n');

  // Build per-engine score block — bands/presence numbers only, no invented claims.
  const scoreBlock = input.subscores
    .map(
      (s) =>
        `  ${s.engine}: presence=${(s.dimensions.presence * 100).toFixed(0)}% (CI ${s.band.ci_low}–${s.band.ci_high}, n=${s.sample_n})` +
        (s.dimensions.position !== null ? `, avg_position=${s.dimensions.position.toFixed(1)}` : ''),
    )
    .join('\n');

  // All gap factor keys for the JSON contract
  const allGapFactorKeys = input.rankedGaps.map((g) => g.factor_key);

  const orderingNote =
    input.rankedGaps.length > 0 && input.rankedGaps[0]!.ordering_mode === 'impact_fallback'
      ? 'NOTE: gaps ordered by impact estimate (no competitor comparison available this scan).'
      : '';

  const system =
    'You are a scan result narrator. Your ONLY job is to phrase the code-derived facts ' +
    'provided to you in plain, readable language. You MUST NOT invent a new issue, number, ' +
    'or reason. You MUST NOT produce hypothesis or causation language ("invisible because X", ' +
    '"will raise your score Y%", "this will improve…"). ' +
    'Hygiene gaps are hygiene — never frame them as wins or competitive opportunities. ' +
    'If you quote an engine line, it MUST be from the provided evidence verbatim. ' +
    'Respond ONLY with a valid JSON object — no markdown, no explanation, no extra text.';

  const user =
    `Narrate the AI-search scan results for ${safeName}.\n\n` +
    (scoreBlock ? `Per-engine scores (these are the ONLY numbers you may restate):\n${scoreBlock}\n\n` : '') +
    (liftBlock ? `Top gaps (competitive — state the evidence as given; do NOT add causal reasons):\n${liftBlock}\n\n` : '') +
    (hygieneBlock ? `Hygiene gaps (describe as hygiene only, never as wins):\n${hygieneBlock}\n\n` : '') +
    (orderingNote ? `${orderingNote}\n\n` : '') +
    `Gap factor keys you MUST cover in gap_explanations: ${JSON.stringify(allGapFactorKeys)}\n\n` +
    'Return EXACTLY this JSON:\n' +
    '{\n' +
    '  "summary": "<2-4 sentences: plain-language overview of scan state and top gaps>",\n' +
    '  "gap_explanations": [\n' +
    '    { "factor_key": "<factor_key>", "text": "<1 sentence: restate the evidence fact; no invented reasons>" },\n' +
    '    ...\n' +
    '  ]\n' +
    '}';

  return { system, user };
}

// ---------------------------------------------------------------------------
// Evidence corpus builder (used by the grounding code-check)
// ---------------------------------------------------------------------------

/**
 * Build the set of strings the narration is allowed to reference.
 *
 * Grounding corpus = union of:
 *   - All observations[].raw_response (full engine response text)
 *   - All competitors_with_factor from every RankedGap
 *   - All display_name and contrastive_evidence strings from RankedGap
 *   - Numeric strings from subscores (presence %, position, CI bounds, sample_n)
 *   - The businessName itself (it appears in output as a label)
 *
 * All entries are lowercased for case-insensitive matching.
 * Numeric strings are included as formatted in the prompt (toFixed(0/1)) so the
 * code-check matches exactly what the model was shown.
 */
function buildEvidenceCorpus(input: NarrationInput): {
  rawTexts: string[]; // for substring checks on quoted spans
  knownCompetitors: Set<string>; // lowercased; for competitor name checks
  knownFactorKeys: Set<string>; // for factor_key checks in gap_explanations
} {
  const rawTexts: string[] = [];
  const knownCompetitors = new Set<string>();
  const knownFactorKeys = new Set<string>();

  // Raw engine responses
  for (const obs of input.observations) {
    if (obs.raw_response) {
      rawTexts.push(obs.raw_response);
    }
  }

  // Gap-derived strings: contrastive_evidence, display_name, competitors
  for (const gap of input.rankedGaps) {
    rawTexts.push(gap.contrastive_evidence);
    rawTexts.push(gap.display_name);
    knownFactorKeys.add(gap.factor_key);
    for (const c of gap.competitors_with_factor) {
      knownCompetitors.add(c.toLowerCase());
    }
  }

  // Competitor mentions from observations
  for (const obs of input.observations) {
    for (const c of obs.competitors) {
      knownCompetitors.add(c.name.toLowerCase());
    }
  }

  // Subscore numeric strings (exactly as formatted in the prompt)
  for (const s of input.subscores) {
    rawTexts.push(`${(s.dimensions.presence * 100).toFixed(0)}%`);
    rawTexts.push(`${s.band.ci_low}`);
    rawTexts.push(`${s.band.ci_high}`);
    rawTexts.push(`${s.sample_n}`);
    if (s.dimensions.position !== null) {
      rawTexts.push(s.dimensions.position.toFixed(1));
    }
    // Engine names are allowed references in narration output (e.g. "on ChatGPT")
    rawTexts.push(s.engine);
  }

  // All observation engine names are allowed references
  for (const obs of input.observations) {
    rawTexts.push(obs.engine);
  }

  // Canonical engine display names (capitalized variants)
  rawTexts.push('ChatGPT', 'Gemini', 'Perplexity');

  // BusinessName itself is an allowed reference in output
  rawTexts.push(input.businessName);

  return { rawTexts, knownCompetitors, knownFactorKeys };
}

// ---------------------------------------------------------------------------
// Grounding code-check helpers
// ---------------------------------------------------------------------------

/**
 * Extract all quoted spans (text inside double-quotes) from a sentence.
 * We only check spans that are explicitly quoted — ordinary prose is not restricted.
 * Conservative: also checks for competitor names (proper nouns in competitors_with_factor)
 * and standalone numbers not in the evidence.
 *
 * Returns quoted spans (each ≥ 4 chars to avoid false positives on short words).
 */
function extractQuotedSpans(text: string): string[] {
  const spans: string[] = [];
  const quoteRegex = /"([^"]{4,})"/g;
  let match: RegExpExecArray | null;
  while ((match = quoteRegex.exec(text)) !== null) {
    if (match[1]) spans.push(match[1]);
  }
  return spans;
}

/**
 * Extract standalone numbers from a sentence.
 * Matches integers and decimals (e.g. "42", "3.5", "20%").
 * Short numbers (0-9) are excluded to avoid flagging ordinals and list markers.
 */
function extractNumbers(text: string): string[] {
  const numRegex = /\b(\d{2,}(?:\.\d+)?%?)\b/g;
  const numbers: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = numRegex.exec(text)) !== null) {
    if (match[1]) numbers.push(match[1]);
  }
  return numbers;
}

/**
 * Check whether a value appears in any of the raw text strings (case-insensitive substring).
 */
function appearsInCorpus(value: string, rawTexts: string[]): boolean {
  const lower = value.toLowerCase();
  return rawTexts.some((t) => t.toLowerCase().includes(lower));
}

/**
 * Check a single sentence for grounding violations.
 *
 * Violations:
 *   (a) Any quoted span (≥ 4 chars) not found in rawTexts → ungrounded fabricated quote
 *   (b) Any word/phrase from the knownCompetitors set that appears in the sentence →
 *       allowed (trivially grounded). Any multi-word capitalized sequence that looks like
 *       a business name AND is not in rawTexts → ungrounded fabricated competitor.
 *       Only checks sequences that look specifically like a business/org name:
 *       multi-word CamelCase sequences (e.g. "MadeUpClinic", "FakeRival Labs").
 *       Single common words like "ChatGPT", engine names, or location words are
 *       checked against rawTexts; if they appear there they pass.
 *   (c) Any standalone number (≥ 2 digits) not found in rawTexts → fabricated statistic
 *
 * Conservative design: prefers to strip a borderline sentence over shipping an ungrounded
 * claim. Ordinary prose (no quotes, no competitor names, no numbers) always passes.
 *
 * Returns: true if the sentence passes grounding; false if it should be stripped.
 */
function isSentenceGrounded(
  sentence: string,
  corpus: { rawTexts: string[]; knownCompetitors: Set<string> },
): boolean {
  // (a) Quoted span check
  const quotedSpans = extractQuotedSpans(sentence);
  for (const span of quotedSpans) {
    if (!appearsInCorpus(span, corpus.rawTexts)) {
      console.error('[scan/narration] Grounding check: ungrounded quoted span', {
        span: span.slice(0, 80),
      });
      return false;
    }
  }

  // (b) Competitor name check (targeted — multi-word proper nouns only)
  //
  // Strategy: extract multi-word capitalized sequences (≥ 2 consecutive capitalized words)
  // that look like business/organization names. Only these are checked against the evidence
  // corpus. Single capitalized words (sentence starts, engine names, common nouns) are NOT
  // checked — they are too prone to false positives.
  //
  // A hallucinated competitor like "MadeUp Dental" or "FakeClinic Labs" will be caught here
  // because it is (a) a multi-capitalized sequence, (b) not in rawTexts, (c) not in
  // knownCompetitors. Single words like "Presence", "ChatGPT", "Tel" pass through unchecked.
  //
  // We also check single CamelCase words (no spaces, but internal capitals like "MadeUpClinic")
  // as these are a common pattern for fabricated business names.
  if (corpus.knownCompetitors.size > 0) {
    // Check for CamelCase single tokens (e.g. "MadeUpClinic") — internal capital = business name pattern
    const camelCasePattern = /\b([A-Z][a-z]+(?:[A-Z][a-z]+)+)\b/g;
    let camelMatch: RegExpExecArray | null;
    while ((camelMatch = camelCasePattern.exec(sentence)) !== null) {
      const candidate = camelMatch[1]!;
      const candidateLower = candidate.toLowerCase();
      if (corpus.knownCompetitors.has(candidateLower)) continue;
      if (appearsInCorpus(candidate, corpus.rawTexts)) continue;
      console.error('[scan/narration] Grounding check: possible ungrounded camelcase business name', {
        candidate,
      });
      return false;
    }

    // Check for multi-word capitalized sequences (e.g. "Acme Dental", "Beta Rival Labs")
    const multiWordPattern = /\b([A-Z][a-z]{1,}(?:\s+[A-Z][a-z]{1,})+)\b/g;
    let multiMatch: RegExpExecArray | null;
    while ((multiMatch = multiWordPattern.exec(sentence)) !== null) {
      const candidate = multiMatch[1]!;
      const candidateLower = candidate.toLowerCase();
      if (corpus.knownCompetitors.has(candidateLower)) continue;
      if (appearsInCorpus(candidate, corpus.rawTexts)) continue;
      console.error('[scan/narration] Grounding check: possible ungrounded multi-word competitor name', {
        candidate,
      });
      return false;
    }
  }

  // (c) Number check — standalone numbers ≥ 2 digits not in evidence
  const numbers = extractNumbers(sentence);
  for (const num of numbers) {
    if (!appearsInCorpus(num, corpus.rawTexts)) {
      console.error('[scan/narration] Grounding check: ungrounded number', { num });
      return false;
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Deterministic fallback (no LLM)
// ---------------------------------------------------------------------------

/**
 * Build a deterministic fallback NarrationResult from rankedGaps alone.
 * Used when the LLM call fails, returns empty output, or JSON is unparseable.
 * NEVER throws. Returns verified=false, degraded=true, model_id=null.
 *
 * Templates top-N lift gaps' contrastive_evidence directly — all FACT-class.
 */
function buildFallback(input: NarrationInput): NarrationResult {
  const { lift: liftGaps, hygiene: hygieneGaps } = splitLiftVsHygiene(input.rankedGaps);

  const topLift = liftGaps.slice(0, 3);
  const safeName = sanitizeForPrompt(input.businessName);

  let summary: string;
  if (topLift.length === 0 && input.rankedGaps.length === 0) {
    summary = `No gaps were detected for ${safeName} in this scan.`;
  } else if (topLift.length === 0) {
    summary =
      `${safeName} has ${hygieneGaps.length} hygiene gap${hygieneGaps.length === 1 ? '' : 's'} to address. ` +
      `No competitive lift gaps were identified this scan.`;
  } else {
    const evidenceSentences = topLift
      .map((g) => `${g.display_name}: ${g.contrastive_evidence}.`)
      .join(' ');
    summary =
      `${safeName} has ${input.rankedGaps.length} gap${input.rankedGaps.length === 1 ? '' : 's'} identified. ` +
      `Top priorities: ${evidenceSentences}`;
  }

  const gap_explanations = input.rankedGaps.map((g) => ({
    factor_key: g.factor_key,
    text: `${g.display_name}: ${g.contrastive_evidence}.`,
  }));

  return {
    summary,
    gap_explanations,
    verified: false,
    ungrounded_claims_stripped: 0,
    degraded: true,
    model_id: null,
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Narrate the scan results for a business.
 *
 * The LLM's ONLY job is to phrase code-derived facts in plain language.
 * It MUST NOT invent issues, numbers, or reasons.
 * After the call, CODE verifies every quoted span, competitor name, and number
 * is grounded in the stored evidence. Ungrounded sentences are stripped.
 *
 * NEVER throws — any error path returns a deterministic fallback.
 *
 * INJECTABLE:
 *   deps.call  — inject a stub for tests (no network calls in tests).
 *   deps.model — override the narration model (e.g. for paid-tier Sonnet).
 *                If not provided, model is selected by input.tier:
 *                  'free' → DEFAULT_NARRATION_MODEL (google/gemini-2.5-flash)
 *                  'paid' → PAID_NARRATION_MODEL    (anthropic/claude-haiku-4-5)
 *                  unset  → DEFAULT_NARRATION_MODEL
 */
export async function narrate(
  input: NarrationInput,
  deps?: {
    call?: (req: OpenRouterRequest) => Promise<OpenRouterResponse>;
    model?: string;
  },
): Promise<NarrationResult> {
  const call = deps?.call ?? callOpenRouter;
  const model =
    deps?.model ??
    (input.tier === 'paid' ? PAID_NARRATION_MODEL : DEFAULT_NARRATION_MODEL);

  const { system, user } = buildNarrationPrompt(input);
  const corpus = buildEvidenceCorpus(input);

  // ── LLM call ─────────────────────────────────────────────────────────────
  let rawText: string;
  try {
    const response = await call({
      model,
      systemPrompt: system,
      userPrompt: user,
      maxTokens: 800,
      temperature: 0,
    });
    rawText = response.text;
  } catch (err) {
    console.error('[scan/narration] LLM call failed', {
      model,
      error: err instanceof Error ? err.message : String(err),
    });
    return buildFallback(input);
  }

  // ── JSON parse ────────────────────────────────────────────────────────────
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(stripFences(rawText)) as Record<string, unknown>;
  } catch {
    console.error('[scan/narration] JSON parse failed', {
      raw: rawText.slice(0, 300),
    });
    return buildFallback(input);
  }

  // ── Extract fields ────────────────────────────────────────────────────────
  const rawSummary = parsed['summary'];
  const rawExplanations = parsed['gap_explanations'];

  if (typeof rawSummary !== 'string' || !Array.isArray(rawExplanations)) {
    console.error('[scan/narration] Missing required fields in LLM response', {
      hasSummary: typeof rawSummary === 'string',
      hasExplanations: Array.isArray(rawExplanations),
    });
    return buildFallback(input);
  }

  // Validate and filter gap_explanations shape
  const validExplanations = rawExplanations.filter(
    (item): item is { factor_key: string; text: string } =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Record<string, unknown>)['factor_key'] === 'string' &&
      typeof (item as Record<string, unknown>)['text'] === 'string',
  );

  // ── Grounding code-check ──────────────────────────────────────────────────
  //
  // For each sentence in summary: strip any that fail the grounding check.
  // For each gap_explanation: strip any whose text fails grounding OR whose
  // factor_key is not in the known gap list.
  //
  // Grounding check covers:
  //   (a) Quoted spans ≥ 4 chars → must appear in rawTexts (case-insensitive)
  //   (b) Capitalized names that look like competitors → must be in knownCompetitors
  //       OR appear in rawTexts
  //   (c) Standalone numbers ≥ 2 digits → must appear in rawTexts
  //
  // Conservative: strip borderline sentences, keep plain prose.

  let ungrounded_claims_stripped = 0;

  // Check summary sentences
  // Split on ". " boundaries — each sentence is checked independently.
  const summarySentences = rawSummary
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const groundedSummarySentences: string[] = [];
  for (const sentence of summarySentences) {
    if (isSentenceGrounded(sentence, corpus)) {
      groundedSummarySentences.push(sentence);
    } else {
      ungrounded_claims_stripped++;
    }
  }

  // Check gap_explanations
  const groundedExplanations: Array<{ factor_key: string; text: string }> = [];
  for (const expl of validExplanations) {
    // (d) factor_key must be in the known gap list
    if (!corpus.knownFactorKeys.has(expl.factor_key)) {
      console.error('[scan/narration] Grounding check: unknown factor_key in explanation', {
        factor_key: expl.factor_key,
      });
      ungrounded_claims_stripped++;
      continue;
    }
    if (isSentenceGrounded(expl.text, corpus)) {
      groundedExplanations.push(expl);
    } else {
      ungrounded_claims_stripped++;
    }
  }

  // ── Build result ──────────────────────────────────────────────────────────
  const summary = groundedSummarySentences.join(' ').trim();
  const degraded = ungrounded_claims_stripped > 0;
  const verified = !degraded;

  // If summary became empty after stripping (everything was ungrounded), fall back.
  if (summary.length === 0) {
    console.error('[scan/narration] Summary entirely stripped by grounding check — using fallback');
    const fallback = buildFallback(input);
    return {
      ...fallback,
      ungrounded_claims_stripped,
    };
  }

  return {
    summary,
    gap_explanations: groundedExplanations,
    verified,
    ungrounded_claims_stripped,
    degraded,
    model_id: model,
  };
}

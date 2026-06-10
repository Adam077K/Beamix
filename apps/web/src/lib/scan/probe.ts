/**
 * Wave 5 — Neutral probe builder + leak-gate.
 *
 * DESIGN: the probe builder receives ONLY a NeutralQuery (no identity fields).
 * Identity is a separate param used ONLY by the leak-gate — never by the builder.
 * This enforces the structural firewall from SCAN-ORCHESTRATION.md §"The firewall is STRUCTURAL".
 *
 * The leak-gate (checkProbeLeak / assertProbeClean) is the lint-gate the scan will call
 * to fail-closed if identity accidentally bleeds in during a refactor.
 * Wire-up into scan-free.ts is deferred to a later wave — the gate is built and tested here.
 */

import { sanitizeForPrompt } from './prompts';
import { extractDomainRoot } from './client-detection';
import type { NeutralQuery, ClientIdentity, LeakCheckResult } from './measurement-types';

// ---------------------------------------------------------------------------
// Typed error for probe leaks
// ---------------------------------------------------------------------------

/**
 * Thrown by assertProbeClean() when the probe contains identity tokens.
 * Callers that need structured handling can inspect .violations.
 */
export class ProbeLeakError extends Error {
  readonly violations: string[];

  constructor(violations: string[]) {
    super(
      `Probe leak detected — identity tokens found in prompt: ${violations.join(', ')}. ` +
        'Scan aborted to preserve measurement validity.',
    );
    this.name = 'ProbeLeakError';
    this.violations = violations;
  }
}

// ---------------------------------------------------------------------------
// Probe builder
// ---------------------------------------------------------------------------

/**
 * Build a neutral probe for one NeutralQuery.
 *
 * CONTRACT:
 *   - system: a minimal neutral assistant persona. No instruction to produce a list,
 *     no JSON envelope, no mention of any specific business. The engine should answer
 *     as it naturally would when a real person asks the query.
 *   - user: essentially the real-user query_text, lightly sanitized via sanitizeForPrompt()
 *     (injection-safety only — no identity injected).
 *
 * NOTE on why we do NOT embed category/location in the user turn:
 *   The query_text already carries the real-user intent (e.g. "best dental clinic in Tel Aviv").
 *   Re-injecting category+location from the NeutralQuery struct would risk leaking structured
 *   context that a contaminated caller might populate with identity-bearing values.
 *   If the query_text needs location, it must already contain it. This is the conservative
 *   interpretation of the no-leak contract — documented here.
 */
export function buildNeutralProbe(q: NeutralQuery): { system: string; user: string } {
  const system = 'You are a helpful AI assistant answering a real person\'s question.';

  // sanitizeForPrompt strips newlines (prevents multi-line injection) and known
  // prompt-injection patterns. It does NOT strip business identity — that guarantee
  // is enforced by the data contract (NeutralQuery has no identity fields).
  const user = sanitizeForPrompt(q.query_text);

  return { system, user };
}

// ---------------------------------------------------------------------------
// Leak gate helpers
// ---------------------------------------------------------------------------

/**
 * Build the set of non-empty identity tokens to search for in a probe.
 *
 * Rules:
 *   - Always include business_name (trimmed, non-empty)
 *   - Always include the full domain value (trimmed, non-empty)
 *   - Always include the domain root (extracted, length ≥ 3)
 *   - Include each alias that is trimmed, non-empty, and length ≥ 3
 *     (aliases shorter than 3 chars are skipped to avoid false positives on common
 *      abbreviations like "AI", "IT", "US" — this guard is intentional and documented)
 *
 * Returns: an array of [tokenLabel, tokenValue] pairs for reporting.
 */
function buildIdentityTokens(
  identity: ClientIdentity,
): Array<{ label: string; value: string }> {
  const tokens: Array<{ label: string; value: string }> = [];

  const name = identity.business_name.trim();
  if (name.length > 0) {
    tokens.push({ label: 'business_name', value: name });
  }

  const domain = identity.domain.trim();
  if (domain.length > 0) {
    tokens.push({ label: 'domain', value: domain });
    const root = extractDomainRoot(domain);
    // Only add the root token if it is meaningfully long (≥3 chars) and different from
    // the full domain string already in the list (avoids redundant "example" / "example.com"
    // double-report on very simple domains, but both are checked independently).
    if (root.length >= 3) {
      tokens.push({ label: 'domain_root', value: root });
    }
  }

  for (const alias of identity.aliases) {
    const a = alias.trim();
    // Skip aliases shorter than 3 characters — too short to reliably distinguish from
    // common words. Examples that would false-positive: "AI", "IT", "US", "UK", "Dr".
    if (a.length >= 3) {
      tokens.push({ label: `alias:${a}`, value: a });
    }
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Public leak-gate API
// ---------------------------------------------------------------------------

/**
 * Options for checkProbeLeak / assertProbeClean.
 *
 * branded (default: false):
 *   When true, the leak-gate is bypassed entirely and the probe is treated as clean.
 *   Use ONLY for probes built from branded/navigational queries, where the identity
 *   appearing in the prompt is BY DESIGN (the query IS about the client).
 *
 *   IMPORTANT — branded probes are scored SEPARATELY (SCAN-ORCHESTRATION.md §"Branded
 *   queries are the one identity-bearing probe — scored SEPARATELY, never folded into
 *   visibility"). They MUST NOT feed the visibility band. Never set branded=true on a
 *   non-branded probe; doing so defeats measurement validity.
 *
 *   Default: false → strict gate enforced (current behavior, unchanged).
 */
export interface ProbeLeakOptions {
  branded?: boolean;
}

/**
 * Check whether a probe prompt contains any business-identity tokens.
 *
 * Performs a case-insensitive substring search across the combined
 * (system + "\n" + user) text for each identity token.
 *
 * Returns { ok: true, violations: [] } when clean.
 * Returns { ok: false, violations: [...] } naming each token that leaked.
 *
 * When options.branded === true, bypasses the gate (returns ok=true immediately)
 * because identity in a branded query is intentional. See ProbeLeakOptions above.
 */
export function checkProbeLeak(
  probe: { system: string; user: string },
  identity: ClientIdentity,
  options?: ProbeLeakOptions,
): LeakCheckResult {
  // Branded probes carry identity by design — gate bypass is intentional.
  // These probes must be scored in a separate branded-visibility track and
  // NEVER folded into the headline visibility band.
  if (options?.branded === true) {
    return { ok: true, violations: [] };
  }

  const haystack = `${probe.system}\n${probe.user}`.toLowerCase();
  const tokens = buildIdentityTokens(identity);

  const violations: string[] = [];
  for (const { label, value } of tokens) {
    if (haystack.includes(value.toLowerCase())) {
      violations.push(label);
    }
  }

  return { ok: violations.length === 0, violations };
}

/**
 * Assert that a probe is clean of identity tokens.
 * Throws ProbeLeakError (carrying the violations array) when a leak is detected.
 *
 * This is the fail-closed gate — the scan orchestrator calls this before sending
 * the probe to any engine. A ProbeLeakError aborts the scan; the observation is
 * NOT recorded. Measurement validity is more important than scan completion.
 *
 * When options.branded === true, the gate is bypassed (branded probes carry identity
 * by design). See ProbeLeakOptions for the invariant that must be maintained.
 *
 * Wire-up into the scan Inngest function is deferred (Wave 5 later stage).
 * The gate is built and tested here so it is ready to plug in.
 */
export function assertProbeClean(
  probe: { system: string; user: string },
  identity: ClientIdentity,
  options?: ProbeLeakOptions,
): void {
  const result = checkProbeLeak(probe, identity, options);
  if (!result.ok) {
    throw new ProbeLeakError(result.violations);
  }
}

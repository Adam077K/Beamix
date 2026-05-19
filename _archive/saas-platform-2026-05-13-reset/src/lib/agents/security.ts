/**
 * security.ts — Input sanitisation + cost circuit breaker.
 *
 * Every user-supplied string that flows into an LLM prompt MUST pass through
 * sanitizeUserInput first. The cost circuit breaker aborts any job whose
 * running spend exceeds 15 % of the user's monthly subscription price.
 */

import type { CircuitBreakerDecision, PlanTier } from './types';

const TIER_MONTHLY_USD: Record<PlanTier, number> = {
  discover: 79,
  build: 189,
  scale: 499,
};

/**
 * Strip XML-like wrapper tags and null bytes, then cap length.
 * Defends against trivial prompt-injection attempts.
 */
export function sanitizeUserInput(raw: string, maxLen = 500): string {
  const stripped = raw
    .replace(
      /<\/?(system|user|assistant|instructions|prompt|role|tool|function)[^>]*>/gi,
      '',
    )
    .replace(/\u0000/g, '')
    .trim();
  return stripped.length > maxLen ? stripped.slice(0, maxLen) + '\u2026' : stripped;
}

/**
 * Abort the pipeline if estimated spend on a single job exceeds 15 % of the
 * user's monthly subscription price.
 */
export function costCircuitBreaker(
  estimatedCostUsd: number,
  userTier: PlanTier,
): CircuitBreakerDecision {
  const cap = TIER_MONTHLY_USD[userTier] * 0.15;
  if (estimatedCostUsd > cap) {
    return {
      abort: true,
      reason: `estimated cost $${estimatedCostUsd.toFixed(2)} exceeds 15% of ${userTier} tier ($${cap.toFixed(2)})`,
      estimatedCostUsd,
      cap,
    };
  }
  return { abort: false, estimatedCostUsd, cap };
}

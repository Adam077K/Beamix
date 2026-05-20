/**
 * Beamix Agent System — Shared Prompt Building Blocks
 *
 * Every agent prompt file imports from here so the system-wide rules
 * (`12-AGENT-BUILD-SPEC.md` §System Prompt Rules) are authored exactly once. This is
 * also where the `<USER_DATA>` untrusted-input rule lives — it must appear verbatim in
 * every PLAN / RESEARCH / DO system prompt.
 *
 * NOTE: There is deliberately NO AI-disclosure language anywhere in this file or any
 * prompt that imports it. Per `07-AGENT-ROSTER-V2.md` §Content Output Policy, agent
 * output reads as professional, human-quality work. This is a hard rule.
 */

import { USER_DATA_SYSTEM_RULE } from '../../security/input-guard';

/**
 * A single stage prompt: a cacheable, business-invariant `system` block and the
 * per-request `instruction` text. The pipeline appends the assembled, `<USER_DATA>`-
 * wrapped business context to `instruction` to form the final user message.
 */
export interface StagePrompt {
  system: string;
  instruction: string;
}

/**
 * The untrusted-input rule, re-exported so prompt files have a single import. This
 * string MUST appear near the top of every PLAN / RESEARCH / DO system prompt.
 */
export const UNTRUSTED_INPUT_RULE = USER_DATA_SYSTEM_RULE;

/**
 * Voice + output-policy block shared by every content-producing agent. States the
 * no-disclosure rule (the model must never add "as an AI" or similar markers) and the
 * professional-author framing.
 */
export const OUTPUT_POLICY_BLOCK = [
  'OUTPUT POLICY:',
  '- Write as a professional practitioner producing finished, publishable work.',
  '- Never include disclosure markers, hedging meta-commentary, or any statement about how the content was produced.',
  '- The reader is the business owner who will review, edit, and publish under their own name.',
  '- Do not address the reader as a customer of an AI tool. Produce the deliverable directly.',
].join('\n');

/**
 * GEO-signals requirement block shared by every content-producing agent. The three
 * proven GEO levers — statistics, citations, expert quotes — are mandatory and the QA
 * stage enforces them.
 */
export const GEO_SIGNALS_BLOCK = [
  'GEO REQUIREMENTS (mandatory — the QA stage rejects output that omits these):',
  '- Include at least one concrete, sourced statistic relevant to the topic.',
  '- Include at least one citation to a credible, nameable source (publication, study, or authority).',
  '- Include at least one expert quote or expert-attributed claim.',
  '- Prefer data published within the last 90 days; mark any older data with its date.',
  '- If the business is location-specific, ground the content in that location.',
].join('\n');

/**
 * YMYL block — appended to the PLAN system prompt when `business.ymylCategory` is true.
 * Health / finance / legal content carries elevated review risk.
 */
export const YMYL_BLOCK = [
  'YMYL NOTICE:',
  'This business operates in a YMYL category (health, finance, or legal). Flag every medical,',
  'legal, or financial claim in your output. Where a claim would normally require professional',
  'qualification, phrase it so a human reviewer can clearly see what needs verification before publishing.',
].join('\n');

/**
 * Compose the standard system-prompt header used by PLAN / RESEARCH / DO stages:
 * a role line, the untrusted-input rule, and (optionally) the output policy.
 *
 * Keeping this block FIRST and business-invariant is what makes Anthropic native
 * prompt caching effective — the cacheable prefix never changes per request.
 */
export function systemHeader(role: string, opts: { includeOutputPolicy?: boolean } = {}): string {
  const parts = [role, '', UNTRUSTED_INPUT_RULE];
  if (opts.includeOutputPolicy) {
    parts.push('', OUTPUT_POLICY_BLOCK);
  }
  return parts.join('\n');
}

/**
 * Standard language-instruction line. Resolved from `business.language` at runtime by
 * the pipeline; the prompt template just carries the placeholder rule.
 */
export const LANGUAGE_RULE =
  'Produce all output in the business language indicated in the business context ' +
  '(Hebrew or English). Never mix languages within a single piece of content.';

/**
 * Off-Site Presence Builder — prompt templates (5-step pipeline).
 *
 * Free agent that runs the full pipeline. Maps the third-party sources AI engines
 * trust, identifies where the business is missing, and produces per-directory
 * submission guides. 85% of AI brand mentions come from third-party sources.
 *
 * All user-controlled spans reach these prompts ONLY inside `<USER_DATA>` tags.
 */

import {
  systemHeader,
  GEO_SIGNALS_BLOCK,
  LANGUAGE_RULE,
  type StagePrompt,
} from './_shared';

export type { StagePrompt };

export const PLAN_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are an off-site GEO strategist. You plan how to map the third-party directories and ' +
      'sources AI search engines trust for a business category.',
  ),
  instruction: [
    'Plan the off-site presence mapping. Using the business context below:',
    '1. Identify the categories of third-party source relevant to this business — general directories,',
    '   niche/industry directories, review platforms, local listings, association pages.',
    '2. Note the business\'s known existing listings, so the gap analysis can exclude them.',
    '3. Decide a prioritisation strategy weighted by AI-citation value.',
    'Return a concise plan as a structured list. Do not produce the directory list yet.',
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const RESEARCH_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a research analyst identifying the specific directories and third-party sources AI ' +
      'engines cite for a business category and location.',
  ),
  instruction: [
    'Research the third-party sources that matter for this business. Find:',
    '- The directories, listing sites, and niche sources AI engines (especially ChatGPT and',
    '  Perplexity) draw on for this category and location.',
    '- Each source\'s relative authority and submission requirements.',
    'Cite the basis for each recommendation. Return a structured source brief.',
  ].join('\n'),
};

export const DO_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are an off-site GEO consultant producing a finished, prioritised presence-gap plan. Your ' +
      'output is the primary deliverable — a guided action plan, not automated submissions.',
    { includeOutputPolicy: true },
  ),
  instruction: [
    'Produce a prioritised off-site presence plan. For each recommended source include:',
    '- The source name and why AI engines trust it for this category.',
    '- Whether the business is currently listed (gap or covered).',
    '- A step-by-step submission guide.',
    '- A priority rating weighted by AI-citation value.',
    'Order by priority, highest first. Output as a Markdown plan with one task card per source.',
    '',
    GEO_SIGNALS_BLOCK,
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const QA_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a QA reviewer for off-site presence plans. You verify the plan is specific, actionable, ' +
      'and correctly prioritised.',
  ),
  instruction: [
    'Review the off-site presence plan below. Check:',
    '- Sources are specific to this business category and location, not generic.',
    '- Each source has a gap/covered status and a usable submission guide.',
    '- The plan is correctly ordered by AI-citation value.',
    'Respond with strict JSON: {"passed": boolean, "geoSignals": {"hasStatistics": boolean,',
    '"hasCitations": boolean, "hasExpertQuotes": boolean, "hasFreshData": boolean,',
    '"hasLocalContext": boolean}, "ymylFlagged": false, "issues": string[],',
    '"retryRecommended": boolean}.',
  ].join('\n'),
};

export const SUMMARIZE_PROMPT: StagePrompt = {
  system: systemHeader(
    'You compress a completed off-site presence plan into a short Inbox card summary.',
  ),
  instruction: [
    'Summarise the off-site presence plan in 2–3 sentences for an Inbox card. State how many sources',
    'were mapped, how many are gaps, and the highest-priority listing to pursue. Then produce a',
    'one-sentence trigger reason. Respond with strict JSON: {"summaryText": string,',
    '"triggerReason": string, "targetQueries": string[], "estimatedImpact": "low" | "medium" | "high"}.',
  ].join('\n'),
};

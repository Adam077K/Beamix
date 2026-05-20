/**
 * Review Presence Planner — prompt templates (5-step pipeline).
 *
 * Builds a review strategy targeting the platforms AI engines trust — ChatGPT draws
 * 48.7% of citations from Yelp, TripAdvisor, and review sites. Output is a strategy
 * doc plus templated ask sequences. Human executes.
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
    'You are a review-strategy consultant. You plan how a business should build review presence on ' +
      'the platforms AI search engines cite most.',
  ),
  instruction: [
    'Plan the review presence strategy. Using the business context below:',
    '1. Identify the review platforms relevant to this business category and location.',
    '2. Note the business\'s current review presence, so the plan targets the gaps.',
    '3. Decide the cadence and method for earning reviews ethically.',
    'Return a concise plan as a structured list. Do not write the strategy doc yet.',
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const RESEARCH_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a research analyst identifying which review platforms AI engines cite for a business ' +
      'category and how those platforms rank trust signals.',
  ),
  instruction: [
    'Research the review landscape for this business. Find:',
    '- The review platforms AI engines (especially ChatGPT) draw citations from for this category.',
    '- Each platform\'s relative weight and review-policy constraints.',
    '- Benchmarks for review volume and rating in this category.',
    'Cite the basis for each finding. Return a structured review-landscape brief.',
  ].join('\n'),
};

export const DO_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a review-strategy consultant producing a finished review presence plan. Your output is ' +
      'the primary deliverable — a strategy doc with templated, ethical review-ask sequences.',
    { includeOutputPolicy: true },
  ),
  instruction: [
    'Produce the review presence strategy. Include:',
    '- A prioritised platform list with the rationale for each.',
    '- Ethical review-request templates the business can send to customers (no incentivised or fake reviews).',
    '- Response templates for positive and negative reviews.',
    '- A realistic cadence for earning reviews over the next quarter.',
    'Output as a structured Markdown strategy doc.',
    '',
    GEO_SIGNALS_BLOCK,
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const QA_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a QA reviewer for review-presence strategies. You verify the strategy is specific, ' +
      'ethical, and actionable.',
  ),
  instruction: [
    'Review the review presence strategy below. Check:',
    '- Platforms are specific to this business category and location.',
    '- Review-request templates are personalised and ethical — flag any incentivised-review language.',
    '- The plan includes both ask and response templates and a realistic cadence.',
    'Respond with strict JSON: {"passed": boolean, "geoSignals": {"hasStatistics": boolean,',
    '"hasCitations": boolean, "hasExpertQuotes": boolean, "hasFreshData": boolean,',
    '"hasLocalContext": boolean}, "ymylFlagged": false, "issues": string[],',
    '"retryRecommended": boolean}.',
  ].join('\n'),
};

export const SUMMARIZE_PROMPT: StagePrompt = {
  system: systemHeader(
    'You compress a completed review presence strategy into a short Inbox card summary.',
  ),
  instruction: [
    'Summarise the review presence strategy in 2–3 sentences for an Inbox card. State the top-priority',
    'platform, the recommended approach, and the expected benefit. Then produce a one-sentence trigger',
    'reason. Respond with strict JSON: {"summaryText": string, "triggerReason": string,',
    '"targetQueries": string[], "estimatedImpact": "low" | "medium" | "high"}.',
  ].join('\n'),
};

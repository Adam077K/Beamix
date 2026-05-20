/**
 * Performance Tracker — prompt templates (3-step pipeline: PLAN → DO → QA).
 *
 * Free agent. Measures before/after for every agent action — which engine improved and
 * by how much. No RESEARCH stage (works on scan data). No SUMMARIZE stage (output is a
 * delta report shown directly). Comparison requires at least 2 scans.
 *
 * All user-controlled spans reach these prompts ONLY inside `<USER_DATA>` tags.
 */

import { systemHeader, LANGUAGE_RULE, type StagePrompt } from './_shared';

export type { StagePrompt };

export const PLAN_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a GEO performance analyst. You plan how to compare two scans of a business to measure ' +
      'whether agent actions actually improved AI-search visibility.',
  ),
  instruction: [
    'Plan the performance comparison. Using the before/after scan data and the action log below:',
    '1. Confirm two comparable scans are available; if not, note what is missing.',
    '2. Identify which engines and which tracked queries to compare.',
    '3. Note the actions taken between the scans, so the report can attribute changes carefully.',
    'Return a concise comparison plan as a structured list.',
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const DO_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a GEO performance analyst producing a finished before/after report. Your output is the ' +
      'primary deliverable — a delta report a business owner reads to see what changed.',
    { includeOutputPolicy: true },
  ),
  instruction: [
    'Produce the before/after performance report. Include:',
    '- A per-engine visibility delta (score, mention rate, average position).',
    '- A query-level before/after table for the tracked queries.',
    '- A careful attribution note — if multiple actions were taken, state that attribution is approximate.',
    '- One recommended next action based on what moved and what did not.',
    'Output as a structured Markdown report. Use only the supplied scan data — do not invent numbers.',
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const QA_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a QA reviewer for performance reports. You verify the numbers trace to the supplied scan ' +
      'data and the attribution is honest.',
  ),
  instruction: [
    'Review the performance report below. Check:',
    '- Every figure traces to the supplied before/after scan data — flag any invented number.',
    '- The delta calculations are arithmetically correct.',
    '- Attribution is appropriately cautious when multiple actions were taken.',
    '- The recommended next action follows from the data.',
    'Respond with strict JSON: {"passed": boolean, "geoSignals": {"hasStatistics": true,',
    '"hasCitations": false, "hasExpertQuotes": false, "hasFreshData": true,',
    '"hasLocalContext": false}, "ymylFlagged": false, "issues": string[],',
    '"retryRecommended": boolean}. A performance report is data-driven, so hasStatistics and',
    'hasFreshData are true when the report correctly uses the scan data.',
  ].join('\n'),
};

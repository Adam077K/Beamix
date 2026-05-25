/**
 * FAQ Builder — prompt templates (3-step pipeline: PLAN → DO → QA).
 *
 * Free agent. Creates comprehensive FAQ pages per query cluster that AI engines
 * actively cite. Topic-ledger tracked to avoid duplicate coverage. No RESEARCH stage
 * (no external research needed). No SUMMARIZE stage (output displays directly).
 * QA stage runs Perplexity Sonar citation verification.
 *
 * `queryCluster`, `customInstructions`, and business spans reach these prompts ONLY
 * inside `<USER_DATA>` tags emitted by `wrapUserData()`.
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
    'You are a GEO content strategist. You plan FAQ pages that AI search engines extract Q&A pairs ' +
      'from directly. You avoid topics the business has already covered.',
  ),
  instruction: [
    'Plan the FAQ page. Using the query cluster and business context below:',
    '1. Group the query cluster into a coherent FAQ theme.',
    '2. Draft a list of up to 20 questions a real customer would ask — specific to this business,',
    '   not generic boilerplate. Require at least 3 questions grounded in real customer concerns.',
    '3. Check the covered-topics list provided; do not propose questions that duplicate existing coverage.',
    'Return the planned question list and theme as a structured list. Do not write the answers yet.',
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const DO_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a GEO content writer producing a finished, publish-ready FAQ page. Your output is the ' +
      'primary deliverable a business owner will review and post.',
    { includeOutputPolicy: true },
  ),
  instruction: [
    'Write the full FAQ page from the planned questions. Requirements:',
    '- Answer each question concisely and accurately, answer-first, in a way AI engines can extract.',
    '- Ground answers in the business\'s real services and context — no generic filler.',
    '- For any health, legal, or financial question, phrase the answer so a human reviewer can see',
    '  where professional advice should be recommended.',
    'Output the FAQ page as Markdown, followed by a valid JSON-LD FAQPage schema block, and a GEO',
    'signal checklist.',
    '',
    GEO_SIGNALS_BLOCK,
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const QA_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a QA reviewer for FAQ pages. You verify the page is specific, accurate, well-formed, ' +
      'and carries valid FAQ schema.',
  ),
  instruction: [
    'Review the FAQ page below. Check:',
    '- Questions and answers are specific to this business — not generic boilerplate.',
    '- Answers are answer-first and extractable; supporting statistics or sources appear where useful.',
    '- The JSON-LD FAQPage schema is valid and matches the visible Q&A pairs.',
    '- Health, legal, or financial answers are flagged as YMYL risk and recommend professional advice.',
    'Respond with strict JSON: {"passed": boolean, "geoSignals": {"hasStatistics": boolean,',
    '"hasCitations": boolean, "hasExpertQuotes": boolean, "hasFreshData": boolean,',
    '"hasLocalContext": boolean}, "ymylFlagged": boolean, "issues": string[],',
    '"retryRecommended": boolean}.',
  ].join('\n'),
};

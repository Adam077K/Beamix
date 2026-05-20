/**
 * Freshness Agent — prompt templates (5-step pipeline).
 *
 * Detects stale content and updates it with current data, dates, and fresh citations
 * so AI engines keep citing it. Page-locked. Shows old vs new diff.
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
    'You are a content-freshness analyst. You plan how to refresh a stale web page so it keeps ' +
      'earning AI-search citations — 76% of ChatGPT\'s top citations were updated within 30 days.',
  ),
  instruction: [
    'Plan the freshness update. Using the page content and last-updated date below:',
    '1. Identify stale elements — outdated statistics, old dates, dead references, superseded claims.',
    '2. Flag sections the business owner should review for accuracy.',
    '3. Decide which data points need fresh sourcing.',
    'Return a concise refresh plan as a structured list. Do not update the page yet.',
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const RESEARCH_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a research analyst sourcing current data to replace stale content on a web page.',
  ),
  instruction: [
    'Research current replacements for the stale elements identified in the plan. Find:',
    '- Up-to-date statistics to replace outdated figures.',
    '- Recent, credible citations to replace dead or superseded references.',
    '- Any material change in the topic since the page was last updated.',
    'Cite the date of every data point. Return a structured freshness brief.',
  ].join('\n'),
};

export const DO_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a content writer producing a freshness-updated version of an existing page. Your ' +
      'output is the primary deliverable — a refreshed, publish-ready page.',
    { includeOutputPolicy: true },
  ),
  instruction: [
    'Update the page below with current data while preserving its structure and voice. Requirements:',
    '- Replace stale statistics, dates, and references with the researched current data.',
    '- Add visible freshness markers (e.g. an updated date) where appropriate.',
    '- Do not rewrite sections that are already current — change only what is stale.',
    'Output the full updated page in Markdown, followed by an old-vs-new change list and a GEO',
    'signal checklist.',
    '',
    GEO_SIGNALS_BLOCK,
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const QA_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a QA reviewer for content-freshness updates. You verify stale data was actually ' +
      'replaced with current, attributable data.',
  ),
  instruction: [
    'Review the freshness update below. Check:',
    '- Every stale element flagged in the plan was addressed.',
    '- New data points are current and attributable — flag any vague or invented figure.',
    '- The page structure and voice were preserved; unchanged sections were left alone.',
    '- Flag any medical, legal, or financial claim as YMYL risk.',
    'Respond with strict JSON: {"passed": boolean, "geoSignals": {"hasStatistics": boolean,',
    '"hasCitations": boolean, "hasExpertQuotes": boolean, "hasFreshData": boolean,',
    '"hasLocalContext": boolean}, "ymylFlagged": boolean, "issues": string[],',
    '"retryRecommended": boolean}.',
  ].join('\n'),
};

export const SUMMARIZE_PROMPT: StagePrompt = {
  system: systemHeader(
    'You compress a completed freshness update into a short Inbox card summary.',
  ),
  instruction: [
    'Summarise the freshness update in 2–3 sentences for an Inbox card. State which page was',
    'refreshed, how stale it was, and what was updated. Then produce a one-sentence trigger reason',
    '(e.g. "Content was 45 days old"). Respond with strict JSON: {"summaryText": string,',
    '"triggerReason": string, "targetQueries": string[], "estimatedImpact": "low" | "medium" | "high"}.',
  ].join('\n'),
};

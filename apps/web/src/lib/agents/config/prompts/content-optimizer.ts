/**
 * Content Optimizer — prompt templates (5-step pipeline).
 *
 * Rewrites existing pages to include statistics, citations, and expert quotes — the
 * three proven GEO levers. Human review required before publish. Page-locked.
 * QA stage runs Perplexity Sonar citation verification.
 *
 * `targetUrl` / `targetContent` and all business spans reach these prompts ONLY inside
 * `<USER_DATA>` tags emitted by `wrapUserData()`.
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
    'You are a GEO content strategist. You plan how to rewrite an existing web page so AI search ' +
      'engines are more likely to cite it — using statistics, citations, and expert quotes.',
  ),
  instruction: [
    'Plan the page rewrite. Using the page content and business context below:',
    '1. Identify the page\'s current GEO weaknesses (missing stats, missing citations, no quotes,',
    '   stale data, weak structure for extraction).',
    '2. Map the target queries this page should win, from the query map provided.',
    '3. Decide the rewrite strategy — what to keep, what to strengthen, what to add.',
    'Return a concise rewrite plan as a structured list. Do not rewrite the page yet.',
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const RESEARCH_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a GEO research analyst. You gather current statistics, credible sources, and expert ' +
      'commentary that can be woven into a page rewrite.',
  ),
  instruction: [
    'Research supporting evidence for this page rewrite. Find:',
    '- Recent, citable statistics relevant to the page topic and business category.',
    '- Credible, nameable sources (studies, publications, recognised authorities).',
    '- Expert quotes or expert-attributed positions that strengthen the page.',
    'Every item must be real and attributable. Return a structured evidence brief.',
  ].join('\n'),
};

export const DO_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a GEO content writer producing a finished page rewrite. Your output is the primary ' +
      'deliverable — a publish-ready page a business owner will review and post.',
    { includeOutputPolicy: true },
  ),
  instruction: [
    'Rewrite the page below for maximum AI-search citability. Requirements:',
    '- Preserve the page\'s core message and the business\'s factual claims.',
    '- Integrate the researched statistics, citations, and expert quotes naturally.',
    '- Structure for extraction: clear headings, concise answer-first paragraphs, scannable lists.',
    '- Target the queries identified in the plan.',
    'Output the full rewritten page in Markdown, followed by a short "Changes made" summary listing',
    'each GEO improvement and a GEO signal checklist (statistics / citations / quotes).',
    '',
    GEO_SIGNALS_BLOCK,
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const QA_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a senior QA reviewer for GEO page rewrites. You verify the rewrite is publish-ready, ' +
      'evidence-backed, and free of generic filler or unsupported claims.',
  ),
  instruction: [
    'Review the page rewrite below. Check:',
    '- At least one concrete statistic, one named citation, and one expert quote are present.',
    '- Every statistic and citation is specific and attributable — flag any vague or invented claim.',
    '- The rewrite preserves the original factual claims and does not fabricate business facts.',
    '- Structure supports AI extraction (headings, answer-first paragraphs).',
    '- Flag any medical, legal, or financial claim as YMYL risk.',
    'Respond with strict JSON: {"passed": boolean, "geoSignals": {"hasStatistics": boolean,',
    '"hasCitations": boolean, "hasExpertQuotes": boolean, "hasFreshData": boolean,',
    '"hasLocalContext": boolean}, "ymylFlagged": boolean, "issues": string[],',
    '"retryRecommended": boolean}.',
  ].join('\n'),
};

export const SUMMARIZE_PROMPT: StagePrompt = {
  system: systemHeader(
    'You compress a completed page rewrite into a short Inbox card summary for a business owner.',
  ),
  instruction: [
    'Summarise the page rewrite in 2–3 sentences for an Inbox card. State which page was rewritten,',
    'the key GEO improvements made, and the expected visibility benefit. Then produce a one-sentence',
    'trigger reason. Respond with strict JSON: {"summaryText": string, "triggerReason": string,',
    '"targetQueries": string[], "estimatedImpact": "low" | "medium" | "high"}.',
  ].join('\n'),
};

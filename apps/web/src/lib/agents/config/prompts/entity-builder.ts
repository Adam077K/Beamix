/**
 * Entity Builder — prompt templates (5-step pipeline).
 *
 * Guides a business through building a complete knowledge-graph presence — Wikidata,
 * Google Business Profile, entity markers. Entity recognition is foundational for LLM
 * training data; Wikipedia is 16.3% of ChatGPT citations.
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
    'You are a knowledge-graph strategist. You plan how a business builds entity presence across ' +
      'Wikidata, Google Business Profile, and other entity sources AI engines learn from.',
  ),
  instruction: [
    'Plan the entity-building run. Using the business context below:',
    '1. Assess the business\'s current entity footprint and likely Wikidata notability.',
    '2. Identify which entity sources are realistically achievable for this business.',
    '3. Decide a step-by-step build order, monthly-cadence appropriate.',
    'Return a concise plan as a structured list. Do not produce the deliverables yet.',
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const RESEARCH_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a research analyst checking a business\'s existing knowledge-graph presence and the ' +
      'requirements of each entity source.',
  ),
  instruction: [
    'Research the business\'s entity landscape. Find:',
    '- Any existing Wikipedia, Wikidata, or knowledge-panel presence.',
    '- The notability and sourcing requirements for a Wikidata entry in this category.',
    '- Google Business Profile optimisation opportunities for this business type.',
    'Cite the basis for each finding. Return a structured entity brief.',
  ].join('\n'),
};

export const DO_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a knowledge-graph consultant producing finished entity-building deliverables. Your ' +
      'output is the primary deliverable — a guided checklist and a Wikidata entry draft.',
    { includeOutputPolicy: true },
  ),
  instruction: [
    'Produce the entity-building deliverables. Include:',
    '- A Wikidata entry draft with the supportable claims and the sources that back them. If the',
    '  business likely fails notability, say so plainly and recommend the prerequisite steps instead.',
    '- A Google Business Profile optimisation checklist.',
    '- An entity attribute list (consistent name, identifiers, category, sameAs links).',
    'Output as a structured Markdown plan with one section per deliverable.',
    '',
    GEO_SIGNALS_BLOCK,
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const QA_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a senior QA reviewer for knowledge-graph deliverables. You verify the Wikidata draft is ' +
      'notability-honest and every claim is sourced.',
  ),
  instruction: [
    'Review the entity-building deliverables below. Check:',
    '- The Wikidata draft only contains claims backed by a named, credible source.',
    '- If notability is doubtful, the deliverable says so rather than producing an entry likely to be rejected.',
    '- The GBP checklist and attribute list are specific to this business.',
    'Respond with strict JSON: {"passed": boolean, "geoSignals": {"hasStatistics": boolean,',
    '"hasCitations": boolean, "hasExpertQuotes": boolean, "hasFreshData": boolean,',
    '"hasLocalContext": boolean}, "ymylFlagged": false, "issues": string[],',
    '"retryRecommended": boolean}.',
  ].join('\n'),
};

export const SUMMARIZE_PROMPT: StagePrompt = {
  system: systemHeader(
    'You compress a completed entity-building run into a short Inbox card summary.',
  ),
  instruction: [
    'Summarise the entity-building deliverables in 2–3 sentences for an Inbox card. State whether a',
    'Wikidata draft was produced or notability prerequisites were recommended, and the top GBP action.',
    'Then produce a one-sentence trigger reason. Respond with strict JSON: {"summaryText": string,',
    '"triggerReason": string, "targetQueries": string[], "estimatedImpact": "low" | "medium" | "high"}.',
  ].join('\n'),
};

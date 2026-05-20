/**
 * Schema Generator — prompt templates (3-step pipeline: PLAN → DO → QA).
 *
 * Free agent. Generates correct JSON-LD markup for LocalBusiness, Product, FAQ, and
 * Article types. No RESEARCH stage. No SUMMARIZE stage. One-click — the user copies
 * the output to their page `<head>`.
 *
 * All user-controlled spans reach these prompts ONLY inside `<USER_DATA>` tags.
 */

import { systemHeader, LANGUAGE_RULE, type StagePrompt } from './_shared';

export type { StagePrompt };

export const PLAN_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a structured-data specialist. You select the correct schema.org JSON-LD type for a ' +
      'web page so AI search engines and Google AI Overviews can parse the page reliably.',
  ),
  instruction: [
    'Plan the JSON-LD generation. Using the page content and business context below:',
    '1. Detect the page type and select the correct schema type — one or more of LocalBusiness,',
    '   Product, FAQPage, Article.',
    '2. List the schema properties that can be populated from the supplied business data.',
    '3. Note any required property for which data is missing, so the owner can fill the gap.',
    'Return the selected schema type(s) and property map as a structured list.',
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const DO_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a structured-data engineer producing finished, valid JSON-LD markup. Your output is ' +
      'the primary deliverable — a block the business owner pastes into their page.',
    { includeOutputPolicy: true },
  ),
  instruction: [
    'Generate the JSON-LD block(s) for the selected schema type(s). Requirements:',
    '- Use only data present in the business context — never invent values for required properties.',
    '- Produce valid schema.org JSON-LD that passes the Google Rich Results validator.',
    '- For a missing required property, emit a clearly-marked placeholder the owner must replace.',
    'Output each JSON-LD block inside a fenced code block, followed by short implementation',
    'instructions (where to paste it, one block per page).',
  ].join('\n'),
};

export const QA_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a QA reviewer for JSON-LD structured data. You verify the markup is valid and matches ' +
      'the page it describes.',
  ),
  instruction: [
    'Review the JSON-LD output below. Check:',
    '- The schema type is correct for the page.',
    '- The JSON is syntactically valid and conforms to schema.org.',
    '- No required property is missing without a clearly-marked placeholder.',
    '- No property value was invented — values trace to the supplied business data.',
    'Respond with strict JSON: {"passed": boolean, "geoSignals": {"hasStatistics": false,',
    '"hasCitations": false, "hasExpertQuotes": false, "hasFreshData": false,',
    '"hasLocalContext": boolean}, "ymylFlagged": false, "issues": string[],',
    '"retryRecommended": boolean}. Schema markup is not prose, so the content GEO signals are false;',
    'set hasLocalContext true only when a LocalBusiness schema with a real address was produced.',
  ].join('\n'),
};

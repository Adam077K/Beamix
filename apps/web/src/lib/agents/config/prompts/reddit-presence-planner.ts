/**
 * Reddit Presence Planner — prompt templates (5-step pipeline).
 *
 * Identifies subreddits where the business's audience asks questions it should be
 * answering. Reddit is 46.7% of Perplexity's top sources and 21% of Google AI
 * Overviews. Output is a strategy doc plus comment/thread templates. Human executes.
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
    'You are a community-presence strategist. You plan how a business should build authentic Reddit ' +
      'presence so it surfaces in Perplexity and Google AI Overview citations.',
  ),
  instruction: [
    'Plan the Reddit presence strategy. Using the business context and target queries below:',
    '1. Identify the subreddit themes where this business\'s audience asks relevant questions.',
    '2. Decide an authentic, value-first engagement approach — no spam, no covert promotion.',
    '3. Note language/location constraints that affect which communities are relevant.',
    'Return a concise plan as a structured list. Do not produce the subreddit list yet.',
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const RESEARCH_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a research analyst identifying the specific subreddits and discussion patterns relevant ' +
      'to a business category.',
  ),
  instruction: [
    'Research the Reddit landscape for this business. Find:',
    '- The specific subreddits where the target audience discusses this category and asks the target queries.',
    '- Each subreddit\'s size, activity level, and self-promotion rules.',
    '- The recurring questions in those communities the business is qualified to answer.',
    'Cite the basis for each finding. Return a structured community brief.',
  ].join('\n'),
};

export const DO_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a community-presence consultant producing a finished Reddit strategy. Your output is the ' +
      'primary deliverable — a strategy doc with authentic engagement templates. Human executes; there ' +
      'is no automated posting.',
    { includeOutputPolicy: true },
  ),
  instruction: [
    'Produce the Reddit presence strategy. Include:',
    '- A prioritised subreddit list with size, activity, and a per-subreddit rule summary.',
    '- Authentic, value-first comment and thread templates — disclose affiliation where the subreddit',
    '  requires it; never recommend covert promotion or vote manipulation.',
    '- A realistic posting calendar.',
    'Output as a structured Markdown strategy doc.',
    '',
    GEO_SIGNALS_BLOCK,
    '',
    LANGUAGE_RULE,
  ].join('\n'),
};

export const QA_PROMPT: StagePrompt = {
  system: systemHeader(
    'You are a QA reviewer for Reddit presence strategies. You verify the strategy is specific, ' +
      'authentic, and rule-compliant.',
  ),
  instruction: [
    'Review the Reddit strategy below. Check:',
    '- Subreddits are specific to this business category and audience.',
    '- Each subreddit has a rule summary; templates respect those rules.',
    '- The engagement approach is value-first and authentic — flag any spam, covert promotion, or',
    '  vote-manipulation language.',
    'Respond with strict JSON: {"passed": boolean, "geoSignals": {"hasStatistics": boolean,',
    '"hasCitations": boolean, "hasExpertQuotes": boolean, "hasFreshData": boolean,',
    '"hasLocalContext": boolean}, "ymylFlagged": false, "issues": string[],',
    '"retryRecommended": boolean}.',
  ].join('\n'),
};

export const SUMMARIZE_PROMPT: StagePrompt = {
  system: systemHeader(
    'You compress a completed Reddit presence strategy into a short Inbox card summary.',
  ),
  instruction: [
    'Summarise the Reddit strategy in 2–3 sentences for an Inbox card. State how many subreddits were',
    'identified, the top-priority community, and the recommended approach. Then produce a one-sentence',
    'trigger reason. Respond with strict JSON: {"summaryText": string, "triggerReason": string,',
    '"targetQueries": string[], "estimatedImpact": "low" | "medium" | "high"}.',
  ].join('\n'),
};

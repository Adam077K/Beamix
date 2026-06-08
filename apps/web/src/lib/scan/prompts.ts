/**
 * Beamix Free Scan — prompt builders.
 *
 * Pure string functions: no I/O, no side effects.
 * This module is unit-testable without mocking.
 */

import type { BusinessContext, EngineRawResult, ScanInput } from './types';

// ---------------------------------------------------------------------------
// Prompt injection sanitizer
// ---------------------------------------------------------------------------

/** Tokens that could hijack the model's instruction-following. */
const INJECTION_PATTERN =
  /ignore\s+previous|system\s*:|assistant\s*:|<\s*\/?\s*(?:system|assistant|instruction|prompt)\s*>/gi;

/**
 * Sanitize a user-controlled string before interpolating into a prompt.
 * - Collapses newlines/carriage-returns to a single space (prevents
 *   multi-line injection via the prompt text).
 * - Strips tokens that match common prompt-injection patterns.
 */
export function sanitizeForPrompt(value: string): string {
  return value
    .replace(/[\r\n]+/g, ' ')
    .replace(INJECTION_PATTERN, '[redacted]')
    .trim();
}

// ---------------------------------------------------------------------------
// Stage 1 — Perplexity research prompt
// ---------------------------------------------------------------------------

/**
 * Build the system + user prompts for the Perplexity research stage.
 * Returns { system, user } so the caller can pass them separately to the LLM.
 */
export function buildResearchPrompt(input: ScanInput): { system: string; user: string } {
  const system = `You are a business research assistant. Your job is to extract factual,
structured information about a business from publicly available sources.
Respond ONLY with a valid JSON object — no markdown, no explanation, no extra text.`;

  const safeName = sanitizeForPrompt(input.business_name);
  const safeUrl = sanitizeForPrompt(input.website_url);
  const safeDomain = sanitizeForPrompt(input.domain);

  const user = `Research this business and return structured JSON.

<business_name>${safeName}</business_name>
<website_url>${safeUrl}</website_url>
<domain>${safeDomain}</domain>

Return EXACTLY this JSON shape (all fields required):
{
  "business_name": "<confirmed or corrected business name>",
  "website_url": "<website url>",
  "business_summary": "<1-2 sentence summary of what the business does>",
  "key_services": ["<service 1>", "<service 2>", "<service 3>"],
  "target_audience": "<who the business serves>",
  "category": "<single business category, e.g. 'dental clinic', 'law firm', 'e-commerce store'>",
  "location": "<primary city/region, or 'global' if not location-specific>"
}`;

  return { system, user };
}

/**
 * Parse the raw JSON string from the research LLM into a BusinessContext.
 * Falls back to a minimal context using the scan input if parsing fails.
 */
export function parseBusinessContext(
  raw: string,
  input: ScanInput,
): BusinessContext {
  // Strip any accidental markdown code fences
  const cleaned = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    return {
      business_name: String(parsed['business_name'] ?? input.business_name),
      website_url: String(parsed['website_url'] ?? input.website_url),
      business_summary: String(parsed['business_summary'] ?? ''),
      key_services: Array.isArray(parsed['key_services'])
        ? (parsed['key_services'] as unknown[]).map(String)
        : [],
      target_audience: String(parsed['target_audience'] ?? ''),
      category: String(parsed['category'] ?? 'business'),
      location: String(parsed['location'] ?? 'global'),
    };
  } catch {
    console.error('[scan/prompts] Failed to parse BusinessContext JSON', {
      raw: raw.slice(0, 200),
    });
    return {
      business_name: input.business_name,
      website_url: input.website_url,
      business_summary: '',
      key_services: [],
      target_audience: '',
      category: 'business',
      location: 'global',
    };
  }
}

// ---------------------------------------------------------------------------
// Stage 2 — Engine query prompt
// ---------------------------------------------------------------------------

/**
 * Build the system + user prompts for a GEO engine query.
 * Prompts are IDENTICAL across all three engines (ChatGPT, Gemini, Perplexity)
 * to ensure comparability of results. Do not add engine-specific framing.
 */
export function buildEnginePrompt(
  ctx: BusinessContext,
  input: ScanInput,
): { system: string; user: string } {
  const safeCategory = sanitizeForPrompt(ctx.category);
  const safeLocation = sanitizeForPrompt(ctx.location);
  const safeName = sanitizeForPrompt(input.business_name);
  const safeUrl = sanitizeForPrompt(input.website_url);

  const locationSuffix = safeLocation !== 'global' ? ` in ${safeLocation}` : '';

  const system = `You are a potential customer looking for ${safeCategory} services${locationSuffix}.
You are using an AI assistant to find the best providers.
Answer naturally as if you are the AI assistant responding to the customer.
Respond ONLY with a valid JSON object — no markdown, no explanation.`;

  const user = `A customer asks: "What are the best ${safeCategory} providers${locationSuffix}?"

Give your top 5 recommendations. For each include:
- name: business name
- why: 1-sentence reason
- rank: 1-5 (1 = most recommended)

Then answer these questions about:
<business_name>${safeName}</business_name>
<website_url>${safeUrl}</website_url>

- is_mentioned: true/false — does it appear in your top 5?
- rank_position: 1-5 or null (if not mentioned)
- sentiment: "positive", "neutral", "negative", or null (if not mentioned)

Return EXACTLY this JSON:
{
  "recommendations": [
    { "rank": 1, "name": "<name>", "why": "<reason>" },
    { "rank": 2, "name": "<name>", "why": "<reason>" },
    { "rank": 3, "name": "<name>", "why": "<reason>" },
    { "rank": 4, "name": "<name>", "why": "<reason>" },
    { "rank": 5, "name": "<name>", "why": "<reason>" }
  ],
  "is_mentioned": <true|false>,
  "rank_position": <1-5|null>,
  "sentiment": <"positive"|"neutral"|"negative"|null>
}`;

  return { system, user };
}

/**
 * Parse the raw JSON string from an engine query into an EngineRawResult.
 * Always returns a result — never throws.
 */
export function parseEngineResult(
  raw: string,
  engine: EngineRawResult['engine'],
): EngineRawResult {
  const cleaned = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    const isMentioned = parsed['is_mentioned'] === true;
    const rankRaw = parsed['rank_position'];
    const rankPosition = typeof rankRaw === 'number' && isMentioned ? rankRaw : null;
    const sentimentRaw = parsed['sentiment'];
    const sentiment =
      isMentioned && (sentimentRaw === 'positive' || sentimentRaw === 'neutral' || sentimentRaw === 'negative')
        ? sentimentRaw
        : null;
    // retrieval_mode defaults to 'parametric_memory'; engine-query.ts overrides per engine/flag.
    return { engine, is_mentioned: isMentioned, rank_position: rankPosition, sentiment, raw_response: raw, retrieval_mode: 'parametric_memory' };
  } catch {
    console.error('[scan/prompts] Failed to parse engine result JSON', {
      engine,
      raw: raw.slice(0, 200),
    });
    return { engine, is_mentioned: false, rank_position: null, sentiment: null, raw_response: raw, retrieval_mode: 'parametric_memory' };
  }
}

// ---------------------------------------------------------------------------
// Stage 3 — Analysis prompt
// ---------------------------------------------------------------------------

/**
 * Build the system + user prompts for the Gemini Flash analysis stage.
 */
export function buildAnalysisPrompt(
  results: EngineRawResult[],
  ctx: BusinessContext,
): { system: string; user: string } {
  const system = `You are a GEO (Generative Engine Optimisation) analyst.
Your job is to diagnose how visible a business is across AI-powered search engines
and identify specific issues preventing better visibility.
Respond ONLY with a valid JSON object — no markdown, no explanation.`;

  const safeName = sanitizeForPrompt(ctx.business_name);
  const safeUrl = sanitizeForPrompt(ctx.website_url);
  const safeCategory = sanitizeForPrompt(ctx.category);
  const safeLocation = sanitizeForPrompt(ctx.location);

  const mentionedCount = results.filter((r) => r.is_mentioned).length;
  const totalEngines = results.length;
  const engineSummaries = results
    .map(
      (r) =>
        `Engine: ${r.engine} | Mentioned: ${r.is_mentioned} | Rank: ${r.rank_position ?? 'N/A'} | Sentiment: ${r.sentiment ?? 'N/A'}`,
    )
    .join('\n');

  const user = `Analyse GEO visibility for this business:

<business_name>${safeName}</business_name>
<website_url>${safeUrl}</website_url>
Category: ${safeCategory}
Location: ${safeLocation !== 'global' ? safeLocation : 'not location-specific'}

ENGINE RESULTS (${mentionedCount}/${totalEngines} engines mentioned this business):
${engineSummaries}

Based on this data, identify visibility issues. Common issue categories:
- "Missing from AI answers" (not mentioned by engines)
- "Weak authority signals" (mentioned but low rank)
- "No location context" (service-area business not localised)
- "Missing structured data" (no schema markup signals)
- "Thin content signals" (low-quality or sparse content detected)
- "No citation sources" (not referenced by third-party sources)

Return EXACTLY this JSON (issues must be non-empty if any engine did not mention the business):
{
  "overall_score": <0-100>,
  "issues": [
    { "category": "<issue category>", "count": <number> },
    ...
  ]
}

Scoring guide:
- 80-100: Strong visibility across all engines
- 60-79: Visible on most engines, room for improvement
- 40-59: Partial visibility, significant gaps
- 20-39: Weak visibility, major gaps
- 0-19: Not visible, critical gaps`;

  return { system, user };
}

/**
 * Parse the raw JSON string from the analysis LLM into an AnalysisResult shape.
 * Returns a fallback on parse failure.
 * total_issues is ALWAYS computed from issues.reduce — LLM-provided value discarded.
 */
export function parseAnalysisResult(raw: string): {
  overall_score: number;
  issues: Array<{ category: string; count: number }>;
  total_issues: number;
} {
  const cleaned = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    const score = typeof parsed['overall_score'] === 'number'
      ? Math.min(100, Math.max(0, parsed['overall_score']))
      : 0;
    const rawIssues = Array.isArray(parsed['issues']) ? parsed['issues'] : [];
    const issues = (rawIssues as unknown[]).map((item) => {
      const obj = item as Record<string, unknown>;
      return {
        category: String(obj['category'] ?? 'Unknown issue'),
        count: typeof obj['count'] === 'number' ? obj['count'] : 1,
      };
    });
    // Compute ground truth — never trust LLM-provided total_issues
    const totalIssues = issues.reduce((sum, i) => sum + i.count, 0);
    return { overall_score: score, issues, total_issues: totalIssues };
  } catch {
    console.error('[scan/prompts] Failed to parse analysis result JSON', {
      raw: raw.slice(0, 200),
    });
    return { overall_score: 0, issues: [{ category: 'Analysis unavailable', count: 1 }], total_issues: 1 };
  }
}

/**
 * query-mapper.ts — Generate dual-text tracked queries for a business.
 *
 * Board decision (2026-04-17):
 *   scan_text:   natural user language ("I need movers in tel aviv")
 *   target_text: optimisation target ("best commercial movers tel aviv for offices")
 * Max 50 queries per run.
 */

import { callLLM } from '@/lib/llm/router';
import type { BusinessProfile } from '@/lib/types/shared';

// ─── Output types ───────────────────────────────────────────────────────────

export interface TrackedQuery {
  /** Natural language, simulates real user search. Used for scanning. */
  scanText: string;
  /** Specific keyword phrase. Used by agents for optimisation. */
  targetText: string;
  cluster: string;
}

// ─── Prompt ─────────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are a GEO (Generative Engine Optimisation) analyst specialising in AI search visibility.
Your task is to generate search queries that real users ask AI assistants when looking for businesses like the one described.

RULES:
- Generate up to 50 queries total.
- Each query has two versions:
    scan_text: the natural conversational form a real user would type into ChatGPT or Perplexity
    target_text: the precise keyword phrase the business should optimise content for
- Organise queries into thematic clusters (e.g. "service discovery", "local search", "comparison", "problem-solving").
- Queries must reflect the business industry, location, and services.
- Do NOT include queries about prices, hours, or contact details.
- Do NOT add any AI disclosure markers or preamble. Output JSON only.

OUTPUT FORMAT (strict JSON array):
[
  {
    "scanText": "...",
    "targetText": "...",
    "cluster": "..."
  }
]`.trim();
}

function buildUserPrompt(business: BusinessProfile): string {
  const parts: string[] = [
    `Business name: ${business.name}`,
    `Website: ${business.url}`,
    `Industry: ${business.industry ?? 'Unknown'}`,
    `Location: ${business.location ?? 'Unknown'}`,
  ];

  if (business.services.length > 0) {
    parts.push(`Services: ${business.services.slice(0, 10).join(', ')}`);
  }

  if (business.competitors.length > 0) {
    parts.push(`Known competitors: ${business.competitors.slice(0, 5).join(', ')}`);
  }

  parts.push('Generate up to 50 search queries for this business. Return JSON array only.');

  return parts.join('\n');
}

// ─── Query generation ────────────────────────────────────────────────────────

/**
 * Generate tracked queries for a business profile.
 *
 * Falls back to template queries if LLM call fails or returns no results.
 */
export async function generateQueries(business: BusinessProfile): Promise<TrackedQuery[]> {
  const response = await callLLM({
    model: 'claude-sonnet-4-6',
    step: 'plan',
    cache: true,
    temperature: 0.4,
    messages: [
      { role: 'system', content: buildSystemPrompt(), cache: true },
      { role: 'user', content: buildUserPrompt(business) },
    ],
  });

  const queries = parseQueryResponse(response.content, business);
  return queries.slice(0, 50);
}

// ─── Response parser ─────────────────────────────────────────────────────────

interface RawQueryItem {
  scanText?: unknown;
  targetText?: unknown;
  cluster?: unknown;
  scan_text?: unknown;
  target_text?: unknown;
}

function parseQueryResponse(content: string, business: BusinessProfile): TrackedQuery[] {
  // Try to extract JSON from the response (LLM may add explanation text)
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return fallbackQueries(business);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(jsonMatch[0]);
  } catch {
    return fallbackQueries(business);
  }

  if (!Array.isArray(raw) || raw.length === 0) {
    return fallbackQueries(business);
  }

  const queries: TrackedQuery[] = [];
  for (const item of raw) {
    const q = item as RawQueryItem;
    const scanText = String(q.scanText ?? q.scan_text ?? '').trim();
    const targetText = String(q.targetText ?? q.target_text ?? '').trim();
    const cluster = String(q.cluster ?? 'general').trim();
    if (scanText && targetText) {
      queries.push({ scanText, targetText, cluster });
    }
  }

  return queries.length > 0 ? queries : fallbackQueries(business);
}

// ─── Fallback query templates ─────────────────────────────────────────────────

function fallbackQueries(business: BusinessProfile): TrackedQuery[] {
  const name = business.name;
  const location = business.location ?? '';
  const industry = business.industry ?? 'business';

  const locationSuffix = location ? ` in ${location}` : '';
  const locationPrefix = location ? `${location} ` : '';

  return [
    {
      scanText: `Who are the best ${industry} businesses${locationSuffix}?`,
      targetText: `best ${locationPrefix}${industry}`,
      cluster: 'service discovery',
    },
    {
      scanText: `I need a ${industry} service${locationSuffix}, who do you recommend?`,
      targetText: `${locationPrefix}${industry} service`,
      cluster: 'service discovery',
    },
    {
      scanText: `What is ${name} and what do they offer?`,
      targetText: `${name} services`,
      cluster: 'brand awareness',
    },
    {
      scanText: `Compare top ${industry} companies${locationSuffix}`,
      targetText: `top ${locationPrefix}${industry} companies`,
      cluster: 'comparison',
    },
    {
      scanText: `How to choose the right ${industry} provider${locationSuffix}?`,
      targetText: `how to choose ${industry}${locationSuffix}`,
      cluster: 'problem-solving',
    },
  ];
}

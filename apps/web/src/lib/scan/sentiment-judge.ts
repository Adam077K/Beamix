/**
 * Wave 5 — Sentiment judge: the ONE allowed LLM call in the scoring layer.
 *
 * DESIGN:
 *   The LLM's ONLY job here is to classify how a preserved mention_snippet
 *   portrays the business: positive | neutral | negative. It must also return
 *   a short verbatim quote from the snippet that justifies the verdict.
 *
 *   CODE then verifies the quote actually appears in the snippet (case-insensitive
 *   substring check). If the quote is absent or JSON parse fails, the sentiment
 *   is treated as 'unknown' — the LLM's word is NEVER trusted without evidence.
 *
 * HONESTY SPINE:
 *   - 'unknown' is the honest fallback — NEVER default to 'neutral'.
 *   - null/empty snippet → 'unknown' immediately, NO LLM call.
 *   - LLM/parse error → 'unknown', never rethrow.
 *
 * MODEL CHOICE:
 *   Default model: 'google/gemini-flash-1.5' — a cheap, fast judge on OpenRouter.
 *   (Mirrors the analysis model used elsewhere in the scan engine; chosen for cost
 *   efficiency: sentiment judgement is a single-classification task, not synthesis.)
 *   Callers may override via deps.model to use Sonnet/Haiku for paid tiers per
 *   SCAN-ORCHESTRATION.md §"Model routing" (Haiku free / Sonnet paid).
 *
 * INJECTABLE:
 *   deps.call allows tests to inject a stub that makes NO network calls.
 *   deps.model allows callers to override the judge model.
 */

import type { ClientIdentity } from './measurement-types';
import { callOpenRouter } from './openrouter-client';
import type { OpenRouterRequest, OpenRouterResponse } from './openrouter-client';
import { sanitizeForPrompt } from './prompts';

// ---------------------------------------------------------------------------
// Default judge model
// ---------------------------------------------------------------------------

/**
 * Default OpenRouter model for sentiment judgement.
 * Cheap + fast judge; override via deps.model for paid tiers (Sonnet).
 */
export const DEFAULT_JUDGE_MODEL = 'google/gemini-flash-1.5';

// ---------------------------------------------------------------------------
// Prompt builder (pure — no I/O)
// ---------------------------------------------------------------------------

/**
 * Build the system + user prompts for the sentiment judge.
 *
 * The model is asked to classify how the snippet portrays the named business
 * (positive / neutral / negative) and to return a short verbatim quote.
 *
 * Both snippet and identity tokens are sanitized against prompt injection.
 * The prompt instructs JSON-only output to make parsing deterministic.
 */
export function buildSentimentJudgePrompt(
  snippet: string,
  identity: ClientIdentity,
): { system: string; user: string } {
  const safeName = sanitizeForPrompt(identity.business_name);

  const system =
    'You are a sentiment classifier. Respond ONLY with a valid JSON object — ' +
    'no markdown, no explanation, no extra text.';

  const safeSnippet = sanitizeForPrompt(snippet);

  const user =
    `Classify the sentiment of the following snippet toward the business named "${safeName}".\n\n` +
    `Snippet:\n"""\n${safeSnippet}\n"""\n\n` +
    'Classify sentiment as one of: "positive", "neutral", or "negative".\n' +
    'Also return a short verbatim quote (≤ 80 chars) from the snippet that justifies your verdict.\n\n' +
    'Return EXACTLY this JSON:\n' +
    '{ "sentiment": "<positive|neutral|negative>", "quote": "<verbatim quote from snippet>" }';

  return { system, user };
}

// ---------------------------------------------------------------------------
// JSON fence-strip helper (mirrors prompts.ts pattern)
// ---------------------------------------------------------------------------

/**
 * Strip markdown code fences from a raw LLM string before JSON.parse.
 * Mirrors the pattern used in prompts.ts parseBusinessContext / parseEngineResult.
 */
function stripFences(raw: string): string {
  return raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Judge the sentiment of a mention_snippet using a cheap LLM call.
 *
 * Returns:
 *   { sentiment, quote, verified }
 *
 * Where:
 *   sentiment  — 'positive' | 'neutral' | 'negative' | 'unknown'
 *   quote      — The verbatim snippet quote the model cited, or null.
 *   verified   — true ONLY when sentiment is from the model AND quote is confirmed
 *                as a case-insensitive substring of the original snippet.
 *
 * NEVER throws — any error path returns { 'unknown', null, false }.
 *
 * INJECTABLE:
 *   deps.call  — inject a stub for tests (no network calls in tests).
 *   deps.model — override the judge model (e.g. 'anthropic/claude-haiku-4-5').
 */
export async function judgeSentiment(
  snippet: string | null,
  identity: ClientIdentity,
  deps?: {
    call?: (req: OpenRouterRequest) => Promise<OpenRouterResponse>;
    model?: string;
  },
): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
  quote: string | null;
  verified: boolean;
}> {
  const UNKNOWN = { sentiment: 'unknown' as const, quote: null, verified: false };

  // Guard: no snippet → unknown immediately, NO LLM call.
  if (!snippet || snippet.trim().length === 0) {
    return UNKNOWN;
  }

  const call = deps?.call ?? callOpenRouter;
  const model = deps?.model ?? DEFAULT_JUDGE_MODEL;

  const { system, user } = buildSentimentJudgePrompt(snippet, identity);

  let rawText: string;
  try {
    const response = await call({
      model,
      systemPrompt: system,
      userPrompt: user,
      maxTokens: 200,
      temperature: 0,
    });
    rawText = response.text;
  } catch (err) {
    console.error('[scan/sentiment-judge] LLM call failed', {
      model,
      error: err instanceof Error ? err.message : String(err),
    });
    return UNKNOWN;
  }

  // Parse JSON defensively
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(stripFences(rawText)) as Record<string, unknown>;
  } catch {
    console.error('[scan/sentiment-judge] JSON parse failed', {
      raw: rawText.slice(0, 200),
    });
    return UNKNOWN;
  }

  // Validate sentiment field
  const rawSentiment = parsed['sentiment'];
  if (
    rawSentiment !== 'positive' &&
    rawSentiment !== 'neutral' &&
    rawSentiment !== 'negative'
  ) {
    console.error('[scan/sentiment-judge] Invalid sentiment value', { rawSentiment });
    return UNKNOWN;
  }
  const sentiment = rawSentiment;

  // Extract quote
  const rawQuote = parsed['quote'];
  if (typeof rawQuote !== 'string' || rawQuote.trim().length === 0) {
    // Model returned a sentiment but no usable quote → treat as unknown
    // (we cannot verify sentiment without evidence)
    console.error('[scan/sentiment-judge] Missing or empty quote', { sentiment });
    return UNKNOWN;
  }
  const quote = rawQuote.trim();

  // CODE-CHECK: verify the quote is actually a substring of the snippet.
  // This is the "cheap code check" mandated by SCAN-ORCHESTRATION.md.
  // If the LLM fabricated a quote not present in the snippet, we cannot trust it.
  const verified = snippet.toLowerCase().includes(quote.toLowerCase());

  if (!verified) {
    console.error('[scan/sentiment-judge] Quote not found in snippet (LLM fabricated)', {
      quote: quote.slice(0, 80),
      snippetStart: snippet.slice(0, 80),
    });
    return UNKNOWN;
  }

  return { sentiment, quote, verified: true };
}

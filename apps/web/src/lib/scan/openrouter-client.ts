/**
 * Beamix Free Scan — minimal OpenRouter client.
 *
 * Thin wrapper around native fetch — no new npm dependencies.
 * Uses patterns from apps/web/src/lib/agents/llm/runner.ts:
 *   - requireEnv() for env var access
 *   - fetchWithTimeout() with AbortController
 *   - Structured error logging
 *
 * Key resolution: reads OPENROUTER_SCAN_KEY first; falls back to
 * OPENROUTER_API_KEY so it works today and auto-isolates once the dedicated
 * scan key is provisioned. Set DEBUG_OPENROUTER=1 to log full error bodies.
 */

import { NonRetriableError } from 'inngest';

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 60_000; // 60s — scan steps are time-bounded

/** Require an env var or throw a NonRetriableError (burns no Inngest retries). */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new NonRetriableError(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Resolve the OpenRouter API key.
 * Prefers OPENROUTER_SCAN_KEY (scan-dedicated, for cost isolation).
 * Falls back to OPENROUTER_API_KEY (shared with agent system).
 * Throws NonRetriableError if neither is set — config errors must not retry.
 */
export function resolveOpenRouterKey(): string {
  const scanKey = process.env['OPENROUTER_SCAN_KEY'];
  if (scanKey) return scanKey;
  const sharedKey = process.env['OPENROUTER_API_KEY'];
  if (sharedKey) return sharedKey;
  throw new NonRetriableError(
    'Missing OpenRouter API key: set OPENROUTER_SCAN_KEY (preferred) or OPENROUTER_API_KEY',
  );
}

/** fetch with an abort-based timeout. */
async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export interface OpenRouterRequest {
  /** OpenRouter model string, e.g. "openai/gpt-4o" */
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  /**
   * When true, activates the OpenRouter web_search plugin so the model
   * can retrieve live web results at query time. Uses the `plugins` array
   * (the deprecated `:online` model-suffix must NOT be used).
   * For non-natively-grounded models, retrieval is handled via Exa.
   * Only supported on models that accept the plugins field; callers are
   * responsible for choosing a compatible model (e.g. openai/gpt-4o-mini).
   */
  web?: boolean;
  /**
   * Maximum number of web search results to include when `web` is true.
   * Defaults to 5. Ignored when `web` is false or absent.
   */
  webMaxResults?: number;
}

export interface OpenRouterResponse {
  text: string;
  prompt_tokens: number;
  completion_tokens: number;
  /**
   * Source URLs extracted from citation annotations in the response.
   * Populated when the model returns grounding citations via either:
   *   (a) OpenRouter annotation objects on the message
   *       (shape: message.annotations[].url_citation.url)
   *   (b) A top-level `citations` array on the response
   *       (Perplexity Sonar native format)
   * Empty array when no citations are present. Wave 2 consumers use this;
   * Wave 1 only plumbs the field through.
   */
  sourceUrls: string[];
}

/**
 * Call an OpenRouter model and return the text response.
 * Throws on network error or non-2xx status.
 *
 * When req.web is true, the request body includes the web_search plugin:
 *   plugins: [{ id: 'web', max_results: <webMaxResults ?? 5> }]
 * The deprecated `:online` model suffix is NOT used — plugin array is the
 * current OpenRouter API contract.
 *
 * Callers that do NOT pass req.web receive byte-identical request bodies to
 * the previous implementation — no `plugins` key, no annotation parsing path.
 */
export async function callOpenRouter(req: OpenRouterRequest): Promise<OpenRouterResponse> {
  const apiKey = resolveOpenRouterKey();

  // Base body — identical to prior implementation when req.web is absent/false.
  const body: Record<string, unknown> = {
    model: req.model,
    max_tokens: req.maxTokens ?? 1_500,
    temperature: req.temperature ?? 0.2,
    messages: [
      { role: 'system', content: req.systemPrompt },
      { role: 'user', content: req.userPrompt },
    ],
  };

  // Add the web_search plugin only when explicitly requested.
  if (req.web === true) {
    body['plugins'] = [{ id: 'web', max_results: req.webMaxResults ?? 5 }];
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(OPENROUTER_API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
        'http-referer': 'https://beamixai.com',
        'x-title': 'Beamix Free Scan',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'network error';
    console.error('[scan/openrouter] Request failed', { model: req.model, error: message });
    throw new Error(`OpenRouter request failed (${req.model}): ${message}`);
  }

  if (!res.ok) {
    // Gate full body logging behind DEBUG_OPENROUTER to avoid leaking API error
    // bodies (which can contain partial key refs) in production logs.
    const statusClass = Math.floor(res.status / 100);
    if (process.env['DEBUG_OPENROUTER'] === '1') {
      const detail = await res.text().catch(() => res.statusText);
      console.error('[scan/openrouter] Non-2xx response', {
        model: req.model,
        status: res.status,
        detail: detail.slice(0, 300),
      });
      throw new Error(`OpenRouter error ${res.status} (${req.model}): ${detail.slice(0, 300)}`);
    }
    console.error('[scan/openrouter] Non-2xx response', {
      model: req.model,
      status_class: statusClass,
      status: res.status,
    });
    throw new Error(`OpenRouter ${statusClass}xx error (${req.model})`);
  }

  // Shape of the OpenRouter response including optional citation fields.
  // Annotation shape (verified): message.annotations[].url_citation.url
  // Perplexity native top-level citations: response.citations[] (string[])
  const json = (await res.json()) as {
    choices: Array<{
      message: {
        content: string | null;
        annotations?: Array<{
          type: string;
          url_citation?: { url: string; title?: string; content?: string; start_index?: number; end_index?: number };
        }>;
      };
    }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
    citations?: string[];
  };

  const text = json.choices[0]?.message?.content ?? '';
  const prompt_tokens = json.usage?.prompt_tokens ?? 0;
  const completion_tokens = json.usage?.completion_tokens ?? 0;

  // Extract source URLs from citation annotations (additive — empty when absent).
  // Primary: OpenRouter annotation objects attached to the message.
  // Fallback: Perplexity Sonar top-level citations array on the response root.
  let sourceUrls: string[] = [];
  const annotations = json.choices[0]?.message?.annotations;
  if (Array.isArray(annotations) && annotations.length > 0) {
    sourceUrls = annotations
      .filter((a) => a.type === 'url_citation' && typeof a.url_citation?.url === 'string')
      .map((a) => a.url_citation!.url);
  } else if (Array.isArray(json.citations) && json.citations.length > 0) {
    // Perplexity Sonar native citation format — top-level string array.
    sourceUrls = json.citations.filter((c): c is string => typeof c === 'string');
  }

  return { text, prompt_tokens, completion_tokens, sourceUrls };
}

/**
 * Beamix Agent System — LLM Runner
 *
 * The single LLM entry point for the agent pipeline. Routes each call to the correct
 * provider per `runtimeProvider()`:
 *
 *   Anthropic SDK  → all `claude-*` models (primary path, ~80% of calls).
 *                    Uses native prompt caching: the stable system prompt block is
 *                    marked `cache_control: { type: 'ephemeral' }` so repeated calls
 *                    bill cached input at 10% of the input rate.
 *   OpenRouter     → `google/*`, `openai/*`, `perplexity/*` (non-Anthropic providers).
 *   Perplexity API → bare `sonar` / `sonar-pro` (QA citation-verification probe).
 *
 * Every call returns a `LLMResult` carrying token usage + a computed `CostEntry`.
 * Errors surface as `LLMProviderError` with `retryable` set for 429 / 529 / 503.
 */

import { LLMProviderError } from '../errors';
import { runtimeProvider, computeCostUsd } from '../config/models';
import type { AgentType, PipelineStage, CostEntry } from '../types';

/** Prompt structured so the stable system block can be prompt-cached independently. */
export interface LLMRequest {
  agentType: AgentType;
  stage: PipelineStage;
  jobId: string;
  model: string;
  /** Stable system instructions — cached across calls. Place business-invariant text here. */
  systemPrompt: string;
  /** The per-request user message — business context + task. NOT cached. */
  userPrompt: string;
  /** Sampling temperature. Defaults per stage if omitted. */
  temperature?: number;
  /** Hard output ceiling. */
  maxTokens?: number;
}

export interface LLMResult {
  text: string;
  costEntry: CostEntry;
  /** True when Anthropic reported a non-zero `cache_read_input_tokens`. */
  cacheHit: boolean;
}

/** Default max output tokens per stage — DO needs the most headroom. */
const STAGE_MAX_TOKENS: Record<PipelineStage, number> = {
  plan: 2_000,
  research: 3_000,
  do: 8_000,
  qa: 1_500,
  summarize: 800,
};

/** Default temperature per stage — QA/SUMMARIZE deterministic, DO creative. */
const STAGE_TEMPERATURE: Record<PipelineStage, number> = {
  plan: 0.3,
  research: 0.2,
  do: 0.6,
  qa: 0,
  summarize: 0.2,
};

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';
const PERPLEXITY_API = 'https://api.perplexity.ai/chat/completions';
const ANTHROPIC_VERSION = '2023-06-01';
const REQUEST_TIMEOUT_MS = 120_000;

/** Require an env var or throw a clear configuration error. */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/** Structured cost log line — one per LLM call, consumed by observability. */
function logCost(req: LLMRequest, entry: CostEntry, cacheHit: boolean): void {
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      event: 'llm_call',
      agent: req.agentType,
      stage: req.stage,
      job_id: req.jobId,
      model: entry.model,
      provider: entry.provider,
      prompt_tokens: entry.promptTokens,
      completion_tokens: entry.completionTokens,
      cache_read_tokens: entry.cacheReadTokens,
      cache_write_tokens: entry.cacheWriteTokens,
      cache_hit: cacheHit,
      cost_usd: entry.costUsd,
    }),
  );
}

/** `fetch` with an abort-based timeout. */
async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Anthropic — direct SDK path with native prompt caching
// ---------------------------------------------------------------------------
async function callAnthropic(req: LLMRequest): Promise<LLMResult> {
  const apiKey = requireEnv('ANTHROPIC_API_KEY');
  const body = {
    model: req.model,
    max_tokens: req.maxTokens ?? STAGE_MAX_TOKENS[req.stage],
    temperature: req.temperature ?? STAGE_TEMPERATURE[req.stage],
    // System is an array so the stable block carries `cache_control` and is
    // cached independently of the per-request user message.
    system: [
      {
        type: 'text',
        text: req.systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: req.userPrompt }],
  };

  let res: Response;
  try {
    res = await fetchWithTimeout(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'network error';
    throw new LLMProviderError(req.agentType, req.stage, req.jobId, 'anthropic', message);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new LLMProviderError(
      req.agentType,
      req.stage,
      req.jobId,
      'anthropic',
      detail.slice(0, 500),
      res.status,
    );
  }

  const json = (await res.json()) as {
    content: Array<{ type: string; text?: string }>;
    usage: {
      input_tokens: number;
      output_tokens: number;
      cache_read_input_tokens?: number;
      cache_creation_input_tokens?: number;
    };
  };

  const text = json.content
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text as string)
    .join('');

  const cacheReadTokens = json.usage.cache_read_input_tokens ?? 0;
  const cacheWriteTokens = json.usage.cache_creation_input_tokens ?? 0;
  // Anthropic reports `input_tokens` as the fresh (uncached) input; total prompt
  // tokens for cost accounting is fresh + cache reads + cache writes.
  const promptTokens = json.usage.input_tokens + cacheReadTokens + cacheWriteTokens;
  const completionTokens = json.usage.output_tokens;

  const costEntry: CostEntry = {
    stage: req.stage,
    model: req.model,
    provider: 'anthropic',
    promptTokens,
    completionTokens,
    cacheReadTokens,
    cacheWriteTokens,
    costUsd: computeCostUsd(req.model, promptTokens, completionTokens, cacheReadTokens, cacheWriteTokens),
  };

  const cacheHit = cacheReadTokens > 0;
  logCost(req, costEntry, cacheHit);
  return { text, costEntry, cacheHit };
}

// ---------------------------------------------------------------------------
// OpenAI-compatible path — shared by OpenRouter + Perplexity native API
// ---------------------------------------------------------------------------
async function callOpenAICompatible(
  req: LLMRequest,
  endpoint: string,
  apiKey: string,
  provider: CostEntry['provider'],
  extraHeaders: Record<string, string> = {},
): Promise<LLMResult> {
  const body = {
    model: req.model.replace(/^perplexity\//, ''),
    max_tokens: req.maxTokens ?? STAGE_MAX_TOKENS[req.stage],
    temperature: req.temperature ?? STAGE_TEMPERATURE[req.stage],
    messages: [
      { role: 'system', content: req.systemPrompt },
      { role: 'user', content: req.userPrompt },
    ],
  };

  let res: Response;
  try {
    res = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'network error';
    throw new LLMProviderError(req.agentType, req.stage, req.jobId, provider, message);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new LLMProviderError(
      req.agentType,
      req.stage,
      req.jobId,
      provider,
      detail.slice(0, 500),
      res.status,
    );
  }

  const json = (await res.json()) as {
    choices: Array<{ message: { content: string | null } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const text = json.choices[0]?.message?.content ?? '';
  const promptTokens = json.usage?.prompt_tokens ?? 0;
  const completionTokens = json.usage?.completion_tokens ?? 0;

  const costEntry: CostEntry = {
    stage: req.stage,
    model: req.model,
    provider,
    promptTokens,
    completionTokens,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    costUsd: computeCostUsd(req.model, promptTokens, completionTokens),
  };

  logCost(req, costEntry, false);
  return { text, costEntry, cacheHit: false };
}

/**
 * Run a single LLM call. Routes by model prefix and returns the generated text plus a
 * fully-populated `CostEntry`. Throws `LLMProviderError` on any provider failure.
 */
export async function runLLM(req: LLMRequest): Promise<LLMResult> {
  const provider = runtimeProvider(req.model);
  switch (provider) {
    case 'anthropic':
      return callAnthropic(req);
    case 'openrouter':
      return callOpenAICompatible(req, OPENROUTER_API, requireEnv('OPENROUTER_API_KEY'), 'openrouter', {
        'http-referer': 'https://beamixai.com',
        'x-title': 'Beamix Agent System',
      });
    case 'perplexity':
      return callOpenAICompatible(
        req,
        PERPLEXITY_API,
        requireEnv('PERPLEXITY_API_KEY'),
        'perplexity',
      );
    default: {
      const exhaustive: never = provider;
      throw new Error(`Unhandled provider: ${String(exhaustive)}`);
    }
  }
}

/**
 * Run an LLM call with retry-with-backoff for transient (`retryable`) provider errors.
 * Rate limits (429) and overload (529 / 503) back off; non-retryable errors throw
 * immediately. The Inngest step layer also retries at a coarser grain.
 */
export async function runLLMWithRetry(req: LLMRequest, maxAttempts = 3): Promise<LLMResult> {
  let lastError: LLMProviderError | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await runLLM(req);
    } catch (err) {
      if (err instanceof LLMProviderError && err.retryable && attempt < maxAttempts) {
        lastError = err;
        const backoffMs = 2 ** attempt * 1_000;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }
      throw err;
    }
  }
  // Unreachable in practice — the loop either returns or throws — but keeps TS happy.
  throw lastError ?? new Error('runLLMWithRetry exhausted with no error');
}

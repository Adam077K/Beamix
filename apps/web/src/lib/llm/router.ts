/**
 * router.ts — Unified LLM call router.
 *
 * - Claude (Sonnet/Haiku/Opus) → direct @anthropic-ai/sdk (80% of traffic).
 *   Prompt caching ON by default for system messages.
 * - Gemini / GPT / Perplexity → OpenRouter HTTP call.
 *   If OPENROUTER_API_KEY is missing, returns a well-formed stub response
 *   (never throws). Worker 1 / DevOps wires the real key later.
 *
 * Token budgets (max_tokens defaults):
 *   - Claude Opus: 8000
 *   - Claude Sonnet: 4000
 *   - Claude Haiku (summarize step or qa): 1500 / 500
 *   - Other providers: 4000 unless overridden
 */

import Anthropic from '@anthropic-ai/sdk';

import type {
  CostEntry,
  LLMCallParams,
  LLMMessage,
  LLMResponse,
  ModelChoice,
  ModelProvider,
} from '@/lib/agents/types';

import { buildCostEntry } from './cost';

// ─── Model ID maps ─────────────────────────────────────────────────────────

const ANTHROPIC_MODEL_IDS: Partial<Record<ModelChoice, string>> = {
  'claude-sonnet-4-6': 'claude-sonnet-4-5',
  'claude-haiku-4-5': 'claude-haiku-4-5',
  'claude-opus-4-6': 'claude-opus-4-5',
};

const OPENROUTER_MODEL_IDS: Partial<Record<ModelChoice, string>> = {
  'gemini-2-0-flash': 'google/gemini-2.0-flash',
  'gemini-2-5-pro': 'google/gemini-2.5-pro',
  'gpt-4o': 'openai/gpt-4o',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'gpt-5-mini': 'openai/gpt-5-mini',
  sonar: 'perplexity/sonar',
  'sonar-pro': 'perplexity/sonar-pro',
  'sonar-online': 'perplexity/sonar-online',
};

// ─── Client singletons ────────────────────────────────────────────────────

let _anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    _anthropic = new Anthropic({ apiKey });
  }
  return _anthropic;
}

// ─── Default max_tokens ───────────────────────────────────────────────────

function defaultMaxTokens(model: ModelChoice, params: LLMCallParams): number {
  if (params.step === 'summarize') return 1500;
  if (params.step === 'qa' && model === 'claude-haiku-4-5') return 500;
  switch (model) {
    case 'claude-opus-4-6':
      return 8000;
    case 'claude-sonnet-4-6':
      return 4000;
    case 'claude-haiku-4-5':
      return 1500;
    default:
      return 4000;
  }
}

function providerFor(model: ModelChoice): ModelProvider {
  if (model.startsWith('claude-')) return 'anthropic';
  if (model === 'sonar' || model === 'sonar-pro' || model === 'sonar-online') {
    return 'perplexity';
  }
  return 'openrouter';
}

// ─── Main entrypoint ───────────────────────────────────────────────────────

export async function callLLM(params: LLMCallParams): Promise<LLMResponse> {
  const provider = providerFor(params.model);
  const maxTokens = params.maxTokens ?? defaultMaxTokens(params.model, params);

  if (provider === 'anthropic') {
    return callAnthropic({ ...params, maxTokens });
  }
  return callOpenRouter({ ...params, maxTokens, provider });
}

// ─── Anthropic direct ──────────────────────────────────────────────────────

interface AnthropicMessageBlock {
  type: 'text';
  text: string;
  cache_control?: { type: 'ephemeral' };
}

interface AnthropicTurn {
  role: 'user' | 'assistant';
  content: AnthropicMessageBlock[];
}

interface NormalizedAnthropicPayload {
  system?: string | AnthropicMessageBlock[];
  messages: AnthropicTurn[];
}

function normalizeAnthropicMessages(
  messages: LLMMessage[],
  enableCache: boolean,
): NormalizedAnthropicPayload {
  const systemBlocks: AnthropicMessageBlock[] = [];
  const turns: AnthropicTurn[] = [];

  for (const m of messages) {
    if (m.role === 'system') {
      const block: AnthropicMessageBlock = { type: 'text', text: m.content };
      if (enableCache && (m.cache ?? true)) {
        block.cache_control = { type: 'ephemeral' };
      }
      systemBlocks.push(block);
    } else {
      turns.push({
        role: m.role,
        content: [{ type: 'text', text: m.content }],
      });
    }
  }

  if (systemBlocks.length === 0) {
    return { messages: turns };
  }
  return { system: systemBlocks, messages: turns };
}

async function callAnthropic(
  params: LLMCallParams & { maxTokens: number },
): Promise<LLMResponse> {
  const anthropic = getAnthropic();
  const modelId = ANTHROPIC_MODEL_IDS[params.model];
  if (!modelId) {
    throw new Error(`No Anthropic model mapping for: ${params.model}`);
  }

  const enableCache = params.cache ?? true;
  const payload = normalizeAnthropicMessages(params.messages, enableCache);

  // Anthropic SDK typings are conservative; cast payload.system to satisfy the
  // union (string | TextBlockParam[]) expected by the client.
  const createArgs: Anthropic.Messages.MessageCreateParamsNonStreaming = {
    model: modelId,
    max_tokens: params.maxTokens,
    messages: payload.messages as unknown as Anthropic.Messages.MessageCreateParamsNonStreaming['messages'],
    ...(params.temperature !== undefined ? { temperature: params.temperature } : {}),
    ...(payload.system !== undefined
      ? {
          system: payload.system as unknown as Anthropic.Messages.MessageCreateParamsNonStreaming['system'],
        }
      : {}),
  };

  const response = await anthropic.messages.create(createArgs);

  // Extract text content from blocks.
  const text = response.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  const usage = response.usage;
  const promptTokens = usage.input_tokens ?? 0;
  const completionTokens = usage.output_tokens ?? 0;
  const cacheReadTokens = usage.cache_read_input_tokens ?? 0;
  const cacheCreationTokens = usage.cache_creation_input_tokens ?? 0;

  const costEntry = buildCostEntry({
    step: params.step ?? 'do',
    model: params.model,
    promptTokens: promptTokens + cacheReadTokens + cacheCreationTokens,
    completionTokens,
    cacheReadTokens,
    cacheCreationTokens,
  });

  return {
    content: text,
    model: params.model,
    provider: 'anthropic',
    stopReason: response.stop_reason,
    usage: {
      promptTokens,
      completionTokens,
      cacheReadTokens,
      cacheCreationTokens,
    },
    costUsd: costEntry.costUsd,
    costEntry,
    rawProviderResponse: response,
  };
}

// ─── OpenRouter (Gemini / GPT / Perplexity) ────────────────────────────────

async function callOpenRouter(
  params: LLMCallParams & { maxTokens: number; provider: ModelProvider },
): Promise<LLMResponse> {
  const apiKey = process.env['OPENROUTER_API_KEY'];
  const modelId = OPENROUTER_MODEL_IDS[params.model];

  if (!apiKey || !modelId) {
    // Graceful stub — returns empty completion with zero cost so consumers can
    // be authored + typechecked before infra wiring.
    return stubResponse(params, params.provider);
  }

  const body = {
    model: modelId,
    max_tokens: params.maxTokens,
    temperature: params.temperature ?? 0.7,
    messages: params.messages.map((m) => ({ role: m.role, content: m.content })),
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env['OPENROUTER_SITE_URL'] ?? 'https://beamix.tech',
      'X-Title': 'Beamix',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${errText}`);
  }

  interface OpenRouterResponse {
    choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  }

  const data = (await res.json()) as OpenRouterResponse;
  const choice = data.choices?.[0];
  const content = choice?.message?.content ?? '';
  const stopReason = choice?.finish_reason ?? null;
  const promptTokens = data.usage?.prompt_tokens ?? 0;
  const completionTokens = data.usage?.completion_tokens ?? 0;

  const costEntry = buildCostEntry({
    step: params.step ?? 'do',
    model: params.model,
    promptTokens,
    completionTokens,
  });

  return {
    content,
    model: params.model,
    provider: params.provider,
    stopReason,
    usage: { promptTokens, completionTokens },
    costUsd: costEntry.costUsd,
    costEntry,
    rawProviderResponse: data,
  };
}

function stubResponse(
  params: LLMCallParams,
  provider: ModelProvider,
): LLMResponse {
  const costEntry: CostEntry = {
    step: params.step ?? 'do',
    model: params.model,
    provider,
    promptTokens: 0,
    completionTokens: 0,
    costUsd: 0,
  };
  return {
    content: '',
    model: params.model,
    provider,
    stopReason: 'stub',
    usage: { promptTokens: 0, completionTokens: 0 },
    costUsd: 0,
    costEntry,
    rawProviderResponse: { stub: true, reason: 'OPENROUTER_API_KEY not set' },
  };
}

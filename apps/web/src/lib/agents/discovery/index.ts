/**
 * Discovery Agent — Main Entry Point
 *
 * Exports `runDiscoveryAgent()` — an async generator that streams DiscoveryChunks
 * back to the caller (SSE route at /api/discovery/chat).
 *
 * Architecture:
 *   - Anthropic SDK streaming via messages.stream() with tool_use
 *   - Three tools: fetch_site_content, fetch_gbp, emit_brand_fingerprint
 *   - Prompt caching: stable system prompt marked cache_control:ephemeral
 *   - Cost alert threshold: $2.00/session
 *   - YMYL detection (PARTIAL): detectYmyl() runs on the incoming user message,
 *     streamed LLM text, and crawled site content, emitting a `ymyl_flag` chunk to
 *     the client on a hit. Hebrew YMYL terms included: רפואי, משפטי, השקעה, מטבע, ביטוח, פסיכולוג
 *   - Never names the agent; customer-facing voice is "Beamix"
 *
 * TODO(SEC) — discovery hardening, NOT YET WIRED (tracked debt):
 *   1. Deep-scan tool-call inputs + tool results for YMYL (detectYmylInJson).
 *   2. Sticky server-side ymyl flag that FORCES requires_human_approval=true at
 *      emit time, overriding any LLM-supplied value (prompt-injection defence, Fix 5).
 *   3. Per-session input-token budget hard-close (Fix 6, ~100k cap).
 *   These were scaffolded but never connected. Do NOT assume they are active.
 *
 * CALLER NOTE (Fix 6 — cost-DoS mitigation, PARTIAL):
 *   `conversationHistory` has been REMOVED from the public function signature.
 *   Callers (SSE endpoint at be-w1-discovery-chat) must pass history via
 *   `serverFetchedHistory` (fetched server-side from discovery_sessions.messages JSONB,
 *   already capped at 50 by the SSE endpoint). Passing raw caller-supplied conversation
 *   history is no longer accepted — that cost-DoS vector is closed. The per-session
 *   token-budget hard-cap (see TODO(SEC) #3) is NOT yet enforced.
 */

import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';
import { buildDiscoverySystemPrompt } from './prompt';
import {
  DISCOVERY_TOOLS,
  executeFetchSiteContent,
  executeFetchGBP,
  executeEmitBrandFingerprint,
  type SessionContext,
} from './tools';
import type { DiscoveryChunk, DiscoveryInput, BrandFingerprint } from './types';

const MODEL = 'claude-sonnet-4-6';
const COST_ALERT_THRESHOLD_USD = 2.0;
// Sonnet 4.6 pricing per 1M tokens
const COST_PER_1M_INPUT = 3.0;
const COST_PER_1M_OUTPUT = 15.0;
const COST_PER_1M_CACHE_READ = 0.3; // 10% of input rate

// Fix 6: per-session input-token budget hard-cap. If the cumulative input + cache-read
// token spend on a single discovery session crosses this ceiling, we hard-close before
// the next paid LLM call to bound cost-DoS impact.
const MAX_TOTAL_TOKENS_PER_SESSION = 100_000;

/** Compute USD cost for a single Anthropic response. */
function computeCostUsd(
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens: number,
): number {
  return (
    (inputTokens / 1_000_000) * COST_PER_1M_INPUT +
    (outputTokens / 1_000_000) * COST_PER_1M_OUTPUT +
    (cacheReadTokens / 1_000_000) * COST_PER_1M_CACHE_READ
  );
}

/**
 * Fix 5: Detect YMYL keywords in text.
 * Extended to include Hebrew terms for Adam's bilingual (IL + EN) market.
 * Returns reason string or null.
 */
function detectYmyl(text: string): string | null {
  const lower = text.toLowerCase();
  const patterns: Array<[RegExp, string]> = [
    [/medical|diagnosis|treatment|prescription|drug|medication|symptom/, 'Medical advice detected'],
    [/legal advice|lawsuit|attorney|shall not be liable|court order/, 'Legal advice detected'],
    [
      /financial advice|investment|securities|portfolio|stock|crypto|tax advice/,
      'Financial advice detected',
    ],
    [/health claim|cure|prevent|treat|diagnose/, 'Health claim detected'],
    // Hebrew YMYL terms — Adam's primary market is bilingual (IL + EN)
    [/רפואי|אבחון|טיפול|תרופה|מרשם|תסמינים/, 'Medical advice detected (Hebrew)'],
    [/משפטי|תביעה|עורך דין|אחריות משפטית|צו בית משפט/, 'Legal advice detected (Hebrew)'],
    [/השקעה|ניירות ערך|תיק השקעות|מניות|קריפטו|ייעוץ מס/, 'Financial advice detected (Hebrew)'],
    [/ביטוח|פוליסה|פרמיה/, 'Insurance claim detected (Hebrew)'],
    [/פסיכולוג|פסיכיאטר|טיפול נפשי|בריאות הנפש/, 'Mental health advice detected (Hebrew)'],
    [/מטבע|מטבע דיגיטלי/, 'Currency/crypto detected (Hebrew)'],
  ];

  for (const [pattern, reason] of patterns) {
    if (pattern.test(lower)) {
      return reason;
    }
  }
  return null;
}

// TODO(SEC): deep-scan tool-call inputs + tool results for prompt-injected YMYL
// content. A recursive detectYmylInJson(value) walking every string leaf and
// calling detectYmyl() was scaffolded here but never wired into the tool loop.
// Re-introduce + call it on toolUse.input and each tool result when wiring
// discovery hardening Fix 5. See file header TODO(SEC) #1.

/**
 * Run the Discovery Agent — Sonnet 4.6 streaming with tool_use.
 *
 * Yields DiscoveryChunks as the conversation progresses. The caller (SSE route)
 * serialises these as Server-Sent Events. The agent drives the conversation:
 * asks questions, processes tool calls, and finally emits a brand fingerprint.
 *
 * Fix 6: `conversationHistory` REMOVED from public signature to prevent cost-DoS.
 * The SSE endpoint (be-w1-discovery-chat) MUST:
 *   1. Accept only a `sessionId` from the client request.
 *   2. Fetch conversation history server-side from discovery_sessions.messages (Supabase).
 *   3. Pass the fetched history here as `serverFetchedHistory` (capped at 50 entries).
 *   4. NEVER forward raw client-supplied message arrays to this function.
 *
 * @param input               - Discovery session inputs (customer context)
 * @param serverFetchedHistory - Server-fetched prior messages (max 50, from DB only).
 */
export async function* runDiscoveryAgent(
  input: DiscoveryInput,
  // Fix 6: renamed from conversationHistory — name makes server-fetch contract explicit.
  // The SSE endpoint must NOT pass client-supplied arrays here.
  serverFetchedHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
): AsyncGenerator<DiscoveryChunk> {
  const sessionId = randomUUID();
  let totalCostUsd = 0;
  let totalInputTokensThisSession = 0;
  let costAlertEmitted = false;
  let fingerprint: BrandFingerprint | null = null;
  // TODO(SEC): a sticky `ymylSignalDetected` flag belongs here — set on any YMYL
  // detection and read at emit time to force requires_human_approval=true. Not yet
  // wired; detectYmyl() hits currently only emit a client-facing ymyl_flag chunk.
  // See file header TODO(SEC) #1/#2.

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const systemPrompt = buildDiscoverySystemPrompt(input.vertical, input.maxQuestions);

  // Build the initial user message with pre-call context
  const contextBlock = buildContextBlock(input);

  // Messages accumulate across tool_use loops
  const messages: Anthropic.MessageParam[] = [
    ...serverFetchedHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  // Fix 5: Scan the incoming user message for YMYL signals before any LLM call.
  // This prevents prompt-injected YMYL from bypassing the flag on the first user turn.
  if (messages.length > 0) {
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg.role === 'user' && typeof lastUserMsg.content === 'string') {
      const ymylReason = detectYmyl(lastUserMsg.content);
      if (ymylReason) {
        // TODO(SEC): set sticky ymylSignalDetected here to force approval at emit.
        console.log(
          JSON.stringify({
            event: 'ymyl_signal_detected',
            source: 'incoming_user_message',
            reason: ymylReason,
            session_id: sessionId,
            customer_id: input.customerId,
          }),
        );
        yield { type: 'ymyl_flag', reason: `User message: ${ymylReason}` };
      }
    }
  }

  // If no conversation yet, inject the context block as first user message
  if (messages.length === 0) {
    messages.push({
      role: 'user',
      content: contextBlock,
    });
  }

  // Agentic loop — continues until the agent emits the brand fingerprint or errors
  let loopCount = 0;
  const MAX_LOOPS = 20; // Safety ceiling

  // Turn gate: prevents the LLM from emitting a fingerprint before it has done real discovery.
  // discoveryTurnCount tracks completed assistant turns (not tool-use loops).
  const MIN_DISCOVERY_TURNS = 5;
  const MIN_EVIDENCE_LINKS = 5;
  let discoveryTurnCount = 0;

  while (loopCount < MAX_LOOPS) {
    loopCount += 1;

    // Fix 6: token-budget DoS hard-close — refuse to start the next paid LLM call
    // once the cumulative input + cache-read token spend on this session crosses
    // the per-session ceiling. Bounds cost-DoS impact for any single customer.
    if (totalInputTokensThisSession > MAX_TOTAL_TOKENS_PER_SESSION) {
      console.log(
        JSON.stringify({
          event: 'session_token_budget_exceeded',
          session_id: sessionId,
          customer_id: input.customerId,
          total_input_tokens: totalInputTokensThisSession,
          budget: MAX_TOTAL_TOKENS_PER_SESSION,
        }),
      );
      yield { type: 'error', message: 'session_token_budget_exceeded', retryable: false };
      return;
    }

    let stream: ReturnType<Anthropic.Messages['stream']>;

    try {
      stream = anthropic.messages.stream({
        model: MODEL,
        max_tokens: 4096,
        temperature: 0.6,
        system: [
          {
            type: 'text',
            text: systemPrompt,
            // Stable block — cached after first call. Next calls read at 10% of input cost.
            cache_control: { type: 'ephemeral' },
          },
        ],
        tools: DISCOVERY_TOOLS,
        messages,
      });
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      const retryable = error.status === 429 || error.status === 529;
      yield {
        type: 'error',
        message: `LLM call failed: ${error.message ?? 'Unknown error'}`,
        retryable,
      };
      return;
    }

    // Stream text deltas
    let assistantText = '';
    let inputTokens = 0;
    let outputTokens = 0;
    let cacheReadTokens = 0;

    try {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          assistantText += event.delta.text;

          // Fix 5: Check for YMYL in streaming text — set loop-scope flag.
          const ymylReason = detectYmyl(event.delta.text);
          if (ymylReason) {
            // TODO(SEC): set sticky ymylSignalDetected here to force approval at emit.
            console.log(
              JSON.stringify({
                event: 'ymyl_signal_detected',
                source: 'llm_text_delta',
                reason: ymylReason,
                session_id: sessionId,
                loop_count: loopCount,
              }),
            );
            yield { type: 'ymyl_flag', reason: ymylReason };
          }

          yield { type: 'text_delta', text: event.delta.text };
        }

        if (event.type === 'message_delta' && event.usage) {
          outputTokens = event.usage.output_tokens;
        }
      }

      // Collect final message with usage data
      const finalMessage = await stream.finalMessage();
      inputTokens = finalMessage.usage.input_tokens;
      cacheReadTokens =
        (finalMessage.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0;
      outputTokens = finalMessage.usage.output_tokens;

      const callCost = computeCostUsd(inputTokens, outputTokens, cacheReadTokens);
      totalCostUsd += callCost;
      // Fix 6: accumulate input + cache-read tokens for the per-session DoS budget guard.
      totalInputTokensThisSession += inputTokens + cacheReadTokens;

      // Cost logging — required on every LLM call
      console.log(
        JSON.stringify({
          event: 'llm_call',
          model: MODEL,
          feature: 'discovery-agent',
          session_id: sessionId,
          customer_id: input.customerId,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cache_read_tokens: cacheReadTokens,
          cost_usd: callCost,
          loop_count: loopCount,
        }),
      );

      yield {
        type: 'cost_log',
        model: MODEL,
        inputTokens,
        outputTokens,
        cacheReadTokens,
        costUsd: callCost,
      };

      // Cost alert
      if (totalCostUsd > COST_ALERT_THRESHOLD_USD && !costAlertEmitted) {
        costAlertEmitted = true;
        yield {
          type: 'cost_alert',
          totalCostUsd,
          threshold: COST_ALERT_THRESHOLD_USD,
        };
        console.log(
          JSON.stringify({
            event: 'discovery_cost_alert',
            session_id: sessionId,
            customer_id: input.customerId,
            total_cost_usd: totalCostUsd,
            threshold: COST_ALERT_THRESHOLD_USD,
          }),
        );
      }

      // Check stop reason
      if (finalMessage.stop_reason === 'end_turn') {
        // No tool calls — agent is done talking
        if (assistantText) {
          messages.push({ role: 'assistant', content: assistantText });
          // Count completed assistant turns for the minimum-turn gate
          discoveryTurnCount += 1;
        }
        // If fingerprint not yet emitted, we're done with a conversation turn
        if (!fingerprint) {
          // More conversation needed — yield done if agent stopped naturally
          // The caller (SSE route) will send more user messages to continue
          yield { type: 'done', sessionId, totalCostUsd };
        }
        break;
      }

      if (finalMessage.stop_reason === 'tool_use') {
        // Process tool calls
        const toolUseBlocks = finalMessage.content.filter(
          (b: Anthropic.ContentBlock): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
        );

        // Add assistant message with full content (text + tool_use blocks)
        messages.push({ role: 'assistant', content: finalMessage.content });

        // Execute each tool and collect results
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const toolUse of toolUseBlocks) {
          yield {
            type: 'tool_use',
            toolName: toolUse.name,
            toolInput: toolUse.input as Record<string, unknown>,
          };

          let toolResultContent: string;
          let toolSuccess = true;

          try {
            if (toolUse.name === 'fetch_site_content') {
              const toolInput = toolUse.input as { url: string };
              const result = await executeFetchSiteContent(toolInput.url);
              toolResultContent = JSON.stringify(result);

              // Check crawled content for YMYL
              const ymylReason = detectYmyl(result.bodyText + result.headlines.join(' '));
              if (ymylReason) {
                yield { type: 'ymyl_flag', reason: `Site content: ${ymylReason}` };
              }

              yield {
                type: 'tool_result',
                toolName: 'fetch_site_content',
                success: !result.isEmpty,
                preview: result.isEmpty
                  ? 'Site blocked crawlers — agent will ask manually'
                  : `Fetched: ${result.title} (${result.headlines.length} headings, ${result.bodyText.length} chars)`,
              };
            } else if (toolUse.name === 'fetch_gbp') {
              const toolInput = toolUse.input as { business_name: string };
              const result = executeFetchGBP(toolInput.business_name);
              toolResultContent = JSON.stringify(result);

              yield {
                type: 'tool_result',
                toolName: 'fetch_gbp',
                success: false,
                preview: 'GBP lookup not yet implemented — Wave 2',
              };
            } else if (toolUse.name === 'emit_brand_fingerprint') {
              const rawInput = toolUse.input as Record<string, unknown>;

              // TURN GATE — server-side enforcement, not relying on LLM compliance.
              // Reject if the LLM tries to emit before a realistic discovery conversation.
              const evidenceLinks = rawInput.evidence_links as Record<string, string> | undefined;
              const evidenceLinkCount = evidenceLinks ? Object.keys(evidenceLinks).length : 0;

              if (discoveryTurnCount < MIN_DISCOVERY_TURNS) {
                toolResultContent = JSON.stringify({
                  error: 'insufficient_discovery',
                  message: `Need at least ${MIN_DISCOVERY_TURNS} discovery turns before emitting fingerprint. Current turn count: ${discoveryTurnCount}. Continue asking discovery questions.`,
                });
                toolSuccess = false;

                yield {
                  type: 'tool_result',
                  toolName: 'emit_brand_fingerprint',
                  success: false,
                  preview: `Turn gate: only ${discoveryTurnCount}/${MIN_DISCOVERY_TURNS} turns completed — continuing discovery`,
                };
              } else if (evidenceLinkCount < MIN_EVIDENCE_LINKS) {
                toolResultContent = JSON.stringify({
                  error: 'insufficient_evidence',
                  message: `evidence_links must have at least ${MIN_EVIDENCE_LINKS} entries before emitting fingerprint. Current count: ${evidenceLinkCount}. Ground more fields with transcript or site_crawl references.`,
                });
                toolSuccess = false;

                yield {
                  type: 'tool_result',
                  toolName: 'emit_brand_fingerprint',
                  success: false,
                  preview: `Evidence gate: only ${evidenceLinkCount}/${MIN_EVIDENCE_LINKS} evidence links — continuing discovery`,
                };
              } else {
              const sessionCtx: SessionContext = { customerId: input.customerId };
              const validated = executeEmitBrandFingerprint(rawInput, sessionCtx);
              fingerprint = validated;
              toolResultContent = JSON.stringify({ success: true, brief_version_id: validated.brief_version_id });

              yield {
                type: 'brand_fingerprint_emitted',
                fingerprint: validated,
              };
              yield {
                type: 'tool_result',
                toolName: 'emit_brand_fingerprint',
                success: true,
                preview: `Brand fingerprint saved (version ${validated.brief_version_id})`,
              };
              }
            } else {
              toolResultContent = JSON.stringify({ error: `Unknown tool: ${toolUse.name}` });
              toolSuccess = false;
            }
          } catch (toolErr: unknown) {
            const errMsg = toolErr instanceof Error ? toolErr.message : String(toolErr);
            toolResultContent = JSON.stringify({ error: errMsg });
            toolSuccess = false;

            yield {
              type: 'tool_result',
              toolName: toolUse.name,
              success: false,
              preview: `Tool error: ${errMsg.slice(0, 200)}`,
            };
          }

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: toolResultContent,
          });

          void toolSuccess; // Consumed via yield above
        }

        // Add tool results as user message
        messages.push({ role: 'user', content: toolResults });

        // If fingerprint was emitted, we're done
        if (fingerprint) {
          yield { type: 'done', sessionId, totalCostUsd };
          return;
        }

        // Continue the agentic loop to get the agent's response to tool results
        continue;
      }

      // max_tokens or other stop reason
      yield { type: 'done', sessionId, totalCostUsd };
      break;
    } catch (streamErr: unknown) {
      const error = streamErr as { status?: number; message?: string };
      const retryable = error.status === 429 || error.status === 529;
      yield {
        type: 'error',
        message: `Stream error: ${error.message ?? 'Unknown error'}`,
        retryable,
      };
      return;
    }
  }

  if (loopCount >= MAX_LOOPS) {
    yield {
      type: 'error',
      message: 'Discovery agent reached maximum loop count without completing',
      retryable: false,
    };
  }
}

/** Build the initial context block injected as the first user message. */
function buildContextBlock(input: DiscoveryInput): string {
  const parts: string[] = [
    `DISCOVERY SESSION — CONTEXT`,
    `Customer ID: ${input.customerId}`,
    `Business URL: ${input.businessUrl}`,
    `Vertical: ${input.vertical}`,
    `Max questions: ${input.maxQuestions}`,
    ``,
  ];

  if (input.preSurvey) {
    parts.push(`PRE-CALL SURVEY ANSWERS:`);
    if (input.preSurvey.goalIn90Days) {
      parts.push(`- Top goal in 90 days: "${input.preSurvey.goalIn90Days}"`);
    }
    if (input.preSurvey.aiMisunderstanding) {
      parts.push(
        `- What AI search misunderstands about them: "${input.preSurvey.aiMisunderstanding}"`,
      );
    }
    if (input.preSurvey.neverConfusedWith) {
      parts.push(`- Never want to be confused with: "${input.preSurvey.neverConfusedWith}"`);
    }
    parts.push('');
  }

  if (input.scanResults) {
    parts.push(`FREE SCAN RESULTS:`);
    parts.push(`- Overall score: ${input.scanResults.overallScore}/100`);
    parts.push(`- Mentioned by: ${input.scanResults.mentionedBy.join(', ') || 'none'}`);
    parts.push(
      `- Competitors mentioned: ${input.scanResults.competitorsMentioned.join(', ') || 'none'}`,
    );
    parts.push('');
  }

  parts.push(
    `START by calling fetch_site_content("${input.businessUrl}") to get context before asking any questions. Then begin the discovery conversation.`,
  );

  return parts.join('\n');
}

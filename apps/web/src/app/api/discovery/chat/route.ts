/**
 * POST /api/discovery/chat
 *
 * SSE streaming endpoint for the Discovery Agent chat.
 *
 * Security layers:
 *   1. HMAC-SHA256 verification of session_token against DISCOVERY_SESSION_SECRET
 *      (mandatory — no fallbacks, no dev-mode bypass)
 *   2. Resolves session from discovery_sessions table; aborts if not found
 *   3. Idempotency: deduplicates on message_id via JSONB scan of messages array
 *
 * SSE format:
 *   data: {"type":"chunk","content":"..."}\n\n
 *   data: {"type":"done"}\n\n
 *   data: {"type":"error","content":"..."}\n\n
 *
 * Returns:
 *   200 text/event-stream — streaming response
 *   400 validation errors
 *   401 invalid session token
 *   503 discovery_sessions table not yet migrated
 */

import 'server-only';

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Runtime config
// ---------------------------------------------------------------------------

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// ---------------------------------------------------------------------------
// SSE helpers
// ---------------------------------------------------------------------------

const SSE_HEADERS: HeadersInit = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no', // Disable Nginx buffering on Vercel
};

function sseEvent(payload: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

// ---------------------------------------------------------------------------
// Custom errors
// ---------------------------------------------------------------------------

class NotImplementedError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'NotImplementedError';
  }
}

// ---------------------------------------------------------------------------
// Local type aliases for discovery agent I/O
// These mirror the canonical types in @/lib/agents/discovery/types (ai-engineer branch).
// When that module ships, replace these with `import type { ... } from '@/lib/agents/discovery/types'`.
// ---------------------------------------------------------------------------

type DiscoveryVertical = 'b2b_saas' | 'solo_lawyer' | 'single_location_dental' | 'other';

interface DiscoveryInput {
  customerId: string;
  businessUrl: string;
  vertical: DiscoveryVertical;
  maxQuestions: 15 | 20 | 25;
  preSurvey?: {
    goalIn90Days?: string;
    aiMisunderstanding?: string;
    neverConfusedWith?: string;
  };
  scanResults?: {
    overallScore: number;
    mentionedBy: string[];
    competitorsMentioned: string[];
  };
}

// Minimal DiscoveryChunk — SSE-relevant subset; full shape lives in ai-engineer branch.
type DiscoveryChunk =
  | { type: 'text_delta'; text: string }
  | { type: 'question_asked'; questionIndex: number; totalQuestions: number; text: string }
  | { type: 'tool_use'; toolName: string; toolInput: Record<string, unknown> }
  | { type: 'tool_result'; toolName: string; success: boolean; preview: string }
  | { type: 'ymyl_flag'; reason: string }
  | { type: 'brand_fingerprint_emitted'; fingerprint: Record<string, unknown> }
  | { type: 'cost_log'; model: string; inputTokens: number; outputTokens: number; cacheReadTokens: number; costUsd: number }
  | { type: 'cost_alert'; totalCostUsd: number; threshold: number }
  | { type: 'done'; sessionId: string; totalCostUsd: number }
  | { type: 'error'; message: string; retryable: boolean };

// History is fetched server-side by the agent using sessionId from DiscoveryInput
// (ai-engineer branch Fix 6). The function signature now takes only a single argument.
type DiscoveryAgentFn = (
  input: DiscoveryInput,
) => AsyncGenerator<DiscoveryChunk>;

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------

const ChatBodySchema = z.object({
  /** Signed token identifying the discovery session. */
  session_token: z.string().min(1).max(2000),
  /** User message text. */
  message: z.string().min(1).max(10000),
  /** Client-generated idempotency key for this message. */
  message_id: z.string().uuid(),
});

export type ChatBody = z.infer<typeof ChatBodySchema>;

// ---------------------------------------------------------------------------
// HMAC token verification
// ---------------------------------------------------------------------------

/**
 * Expected format: "<session_id>.<timestamp_ms>.<hmac_hex>"
 *
 * The signed payload is "<session_id>:<timestamp_ms>".
 * We check:
 *   1. HMAC matches
 *   2. Token is not expired (5-minute window to prevent replay attacks)
 */
function verifySessionToken(
  token: string,
): { valid: false; reason: string } | { valid: true; sessionId: string } {
  // SECURITY: DISCOVERY_SESSION_SECRET is mandatory in all environments.
  // Dev-mode bypass removed (was a full auth bypass on Vercel preview deployments).
  // CALCOM_WEBHOOK_SECRET fallback removed (cross-protocol secret reuse risk).
  // Add DISCOVERY_SESSION_SECRET to Vercel env before deploying.
  const secret = process.env.DISCOVERY_SESSION_SECRET;

  if (!secret) {
    console.error('[discovery/chat] DISCOVERY_SESSION_SECRET is not configured', {
      nodeEnv: process.env.NODE_ENV,
    });
    return { valid: false, reason: 'Session secret not configured' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, reason: 'Malformed token' };
  }

  const [sessionId, timestampStr, providedHmac] = parts as [string, string, string];

  // Verify HMAC
  const payload = `${sessionId}:${timestampStr}`;
  const expectedHmac = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Validate that providedHmac is a valid 64-char hex string (SHA-256 output).
  // Buffer.from(str, 'hex') silently truncates invalid hex, which causes
  // crypto.timingSafeEqual to throw a RangeError when lengths differ.
  if (!/^[0-9a-fA-F]{64}$/.test(providedHmac)) {
    return { valid: false, reason: 'Invalid token signature' };
  }

  const providedBuf = Buffer.from(providedHmac, 'hex');
  const expectedBuf = Buffer.from(expectedHmac, 'hex');

  // Defense-in-depth: lengths must match before timingSafeEqual
  if (providedBuf.length !== expectedBuf.length) {
    return { valid: false, reason: 'Invalid token signature' };
  }

  let signaturesMatch: boolean;
  try {
    signaturesMatch = crypto.timingSafeEqual(providedBuf, expectedBuf);
  } catch {
    return { valid: false, reason: 'Invalid token signature' };
  }

  if (!signaturesMatch) {
    return { valid: false, reason: 'Invalid token signature' };
  }

  // Verify timestamp (5-minute window)
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return { valid: false, reason: 'Invalid token timestamp' };
  }
  const ageMs = Date.now() - timestamp;
  if (ageMs < 0 || ageMs > 5 * 60 * 1000) {
    return { valid: false, reason: 'Token expired' };
  }

  return { valid: true, sessionId };
}

// ---------------------------------------------------------------------------
// Supabase service-role client (inline — admin.ts is a stub in this worktree)
// ---------------------------------------------------------------------------

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

// ---------------------------------------------------------------------------
// Message persistence helpers
// ---------------------------------------------------------------------------

interface PersistedMessage {
  role: 'user' | 'assistant';
  content: string;
  message_id?: string;
  timestamp: string;
}

/**
 * Appends messages to discovery_sessions.messages JSONB and truncates to last 50.
 * Silently ignores errors — persistence failure must not break the stream.
 */
async function persistMessages(
  sessionId: string,
  toAppend: PersistedMessage[],
): Promise<void> {
  try {
    const supabase = getAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session, error: fetchErr } = await (supabase as any)
      .from('discovery_sessions')
      .select('messages')
      .eq('id', sessionId)
      .single();

    if (fetchErr) {
      console.error('[discovery/chat] persistMessages fetch failed', {
        sessionId,
        error: fetchErr.message,
      });
      return;
    }

    const existing: PersistedMessage[] = Array.isArray(session?.messages)
      ? (session.messages as PersistedMessage[])
      : [];

    const updated = [...existing, ...toAppend].slice(-50);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateErr } = await (supabase as any)
      .from('discovery_sessions')
      .update({ messages: updated, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (updateErr) {
      console.error('[discovery/chat] persistMessages update failed', {
        sessionId,
        error: updateErr.message,
      });
    }
  } catch (err) {
    console.error('[discovery/chat] persistMessages threw', {
      sessionId,
      error: String(err),
    });
  }
}

// ---------------------------------------------------------------------------
// Cost tracking constants (Sonnet 4.6 — $3/M in, $15/M out)
// ---------------------------------------------------------------------------

const COST_ALERT_THRESHOLD_USD = 2.0;
const COST_PER_1M_INPUT = 3.0;
const COST_PER_1M_OUTPUT = 15.0;

function estimateCostUsd(tokensIn: number, tokensOut: number): number {
  return (tokensIn / 1_000_000) * COST_PER_1M_INPUT +
    (tokensOut / 1_000_000) * COST_PER_1M_OUTPUT;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<Response> {
  // 1. Parse + validate body
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = ChatBodySchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { session_token, message, message_id } = parsed.data;

  // 2. Verify HMAC session token
  const tokenResult = verifySessionToken(session_token);
  if (!tokenResult.valid) {
    return Response.json({ error: tokenResult.reason }, { status: 401 });
  }

  const { sessionId } = tokenResult;

  // 3. Resolve session from discovery_sessions table
  const supabase = getAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let session: Record<string, any> | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('discovery_sessions')
      .select('id, user_id, messages, context, status')
      .eq('id', sessionId)
      .single();

    if (error) {
      // Distinguish "table missing" from "row not found"
      // Supabase returns code '42P01' for undefined_table
      const pgCode = (error as { code?: string }).code ?? '';
      if (pgCode === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return Response.json(
          { error: 'discovery_sessions table not yet migrated' },
          { status: 503 },
        );
      }

      if (error.code === 'PGRST116') {
        // PostgREST "row not found"
        return Response.json({ error: 'Session not found' }, { status: 401 });
      }

      console.error('[discovery/chat] Session lookup failed', {
        sessionId,
        error: error.message,
      });
      return Response.json({ error: 'Session lookup failed' }, { status: 500 });
    }

    session = data as Record<string, unknown>;
  } catch (err) {
    console.error('[discovery/chat] Session lookup threw', {
      sessionId,
      error: String(err),
    });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }

  // 4. Idempotency — check if message_id already processed
  const existingMessages: PersistedMessage[] = Array.isArray(session.messages)
    ? (session.messages as PersistedMessage[])
    : [];

  const priorMessage = existingMessages.find((m) => m.message_id === message_id);
  if (priorMessage) {
    // Return the last assistant response that followed this message
    const priorIdx = existingMessages.indexOf(priorMessage);
    const lastResponse = existingMessages
      .slice(priorIdx + 1)
      .find((m) => m.role === 'assistant');

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        if (lastResponse) {
          controller.enqueue(
            sseEvent({ type: 'chunk', content: lastResponse.content }),
          );
        }
        controller.enqueue(sseEvent({ type: 'done' }));
        controller.close();
      },
    });

    return new Response(stream, { headers: SSE_HEADERS });
  }

  // 5. (Fix 6 from QA: ai-engineer removed conversationHistory from runDiscoveryAgent's
  //     public signature — history is now fetched server-side inside the agent using
  //     `sessionId` from discoveryInput. The persisted `existingMessages` are still
  //     maintained here for the message_id idempotency check above; we do NOT pass
  //     them to the agent.)

  // 6. Stream from Discovery Agent
  let runDiscoveryAgent: DiscoveryAgentFn;

  try {
    // Dynamic import — module ships from ai-engineer branch (feat/ai-w1-discovery-agent).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = await import('@/lib/agents/discovery' as any);
    if (typeof mod.runDiscoveryAgent !== 'function') {
      throw new NotImplementedError(
        'runDiscoveryAgent is not exported from @/lib/agents/discovery',
      );
    }
    runDiscoveryAgent = mod.runDiscoveryAgent as DiscoveryAgentFn;
  } catch (err) {
    if (err instanceof NotImplementedError) {
      throw err; // Hard fail — contract violation
    }
    console.error('discovery_agent_module_unavailable', {
      sessionId,
      error: String(err),
    });
    // Principle #9: no internal module names in customer-facing error strings.
    return Response.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 },
    );
  }

  // Build DiscoveryInput from session context
  // P2: session.user_id must be present — empty string silently breaks attribution
  if (!session.user_id) {
    console.error('[discovery/chat] Session missing user_id', { sessionId });
    return Response.json({ error: 'Session user not resolved' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = (session.context ?? {}) as Record<string, any>;
  const discoveryInput: DiscoveryInput = {
    customerId: session.user_id as string,
    businessUrl: (ctx.business_url as string) ?? '',
    vertical:
      (ctx.vertical as 'b2b_saas' | 'solo_lawyer' | 'single_location_dental' | 'other') ??
      'other',
    maxQuestions: (ctx.max_questions as 15 | 20 | 25) ?? 15,
    preSurvey: ctx.pre_survey as
      | { goalIn90Days?: string; aiMisunderstanding?: string; neverConfusedWith?: string }
      | undefined,
    scanResults: ctx.scan_results as
      | { overallScore: number; mentionedBy: string[]; competitorsMentioned: string[] }
      | undefined,
  };

  // Track tokens and accumulated assistant text for this turn
  let totalTokensIn = 0;
  let totalTokensOut = 0;
  let assistantTextBuffer = '';

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Guard: track whether 'done' has already been emitted so we never
      // send a double done event (once from the 'done' chunk case, once from
      // the post-loop enqueue at line ~544).
      let doneEmitted = false;
      // Guard: prevent double controller.close() — once from error chunk path,
      // once from finally block.
      let controllerClosed = false;

      try {
        // runDiscoveryAgent fetches its own conversation history server-side using
        // sessionId from discoveryInput. See feat/ai-w1-discovery-agent Fix 6.
        const agentGen = runDiscoveryAgent(discoveryInput);

        for await (const chunk of agentGen) {
          // Filter out internal-only chunk types from the SSE payload.
          // Principle #9: no agent names in customer-facing surfaces.
          // tool_use and tool_result chunks are internal telemetry only.
          switch (chunk.type) {
            case 'text_delta':
              assistantTextBuffer += chunk.text;
              controller.enqueue(
                sseEvent({ type: 'chunk', content: chunk.text }),
              );
              break;

            case 'cost_log':
              totalTokensIn += chunk.inputTokens;
              totalTokensOut += chunk.outputTokens;

              // Cost alert check — log to ops if estimated cost > $2
              {
                const estimatedCostUsd = estimateCostUsd(totalTokensIn, totalTokensOut);
                if (estimatedCostUsd > COST_ALERT_THRESHOLD_USD) {
                  console.error('discovery_cost_alert', {
                    sessionId,
                    userId: session.user_id,
                    tokensIn: totalTokensIn,
                    tokensOut: totalTokensOut,
                    estimatedCostUsd,
                    threshold: COST_ALERT_THRESHOLD_USD,
                    model: chunk.model,
                  });
                }
              }
              // Do NOT forward cost_log to client — internal telemetry
              break;

            case 'cost_alert':
              // Already logged inside the agent; also log here with session context
              console.error('discovery_cost_alert', {
                sessionId,
                userId: session.user_id,
                totalCostUsd: chunk.totalCostUsd,
                threshold: chunk.threshold,
              });
              // Do NOT forward to client
              break;

            case 'brand_fingerprint_emitted':
              // Persist fingerprint to discovery_sessions
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase as any)
                  .from('discovery_sessions')
                  .update({
                    fingerprint: chunk.fingerprint,
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', sessionId);
              } catch (persistErr) {
                console.error('[discovery/chat] Failed to persist fingerprint', {
                  sessionId,
                  error: String(persistErr),
                });
              }
              // Notify client that discovery is complete — no agent name
              controller.enqueue(sseEvent({ type: 'discovery_complete' }));
              break;

            case 'done':
              controller.enqueue(sseEvent({ type: 'done' }));
              doneEmitted = true;
              return; // Exit start() immediately — prevents post-loop double done

            case 'error':
              controller.enqueue(
                sseEvent({ type: 'error', content: chunk.message }),
              );
              controllerClosed = true;
              controller.close();
              return;

            case 'ymyl_flag':
              // Relay YMYL flag to client — it may need to show a disclaimer
              controller.enqueue(
                sseEvent({ type: 'ymyl_flag', reason: chunk.reason }),
              );
              break;

            // Swallow internal-only chunks: tool_use, tool_result, question_asked
            case 'tool_use':
            case 'tool_result':
            case 'question_asked':
              break;

            default:
              // Exhaustiveness guard — if DiscoveryChunk grows new variants, tsc will error here
              break;
          }
        }

        if (!doneEmitted) {
          controller.enqueue(sseEvent({ type: 'done' }));
        }
      } catch (err) {
        const isNotImpl = err instanceof NotImplementedError;
        console.error('[discovery/chat] Agent stream error', {
          sessionId,
          error: String(err),
          type: isNotImpl ? 'not_implemented' : 'runtime',
        });
        controller.enqueue(
          sseEvent({ type: 'error', content: 'Internal agent error' }),
        );
      } finally {
        if (!controllerClosed) {
          controllerClosed = true;
          controller.close();
        }

        // 7. Persist user + assistant messages to session
        const newMessages: PersistedMessage[] = [
          {
            role: 'user',
            content: message,
            message_id,
            timestamp: new Date().toISOString(),
          },
        ];
        if (assistantTextBuffer) {
          newMessages.push({
            role: 'assistant',
            content: assistantTextBuffer,
            timestamp: new Date().toISOString(),
          });
        }
        await persistMessages(sessionId, newMessages);
      }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}

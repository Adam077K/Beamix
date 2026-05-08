/**
 * Beamix Bridge — Cloudflare Worker entry point.
 *
 * Routes:
 *   POST /linear        — Linear webhook ingestion + spec validation + Routine fire
 *   POST /idea-capture  — iOS Shortcut → Linear ticket creation
 *   POST /telegram      — Telegram bot update → CEO / C-suite routing
 *   GET  /health        — Liveness check (minimal for unauth; detailed requires Bearer)
 *
 * Security model (per ORCHESTRATION.md §2B + §2D):
 *   - HMAC verification on every inbound webhook (constant-time via Web Crypto)
 *   - Timestamp skew guard: |now - X-Beamix-Timestamp| <= 300s (R3)
 *   - HMAC input: timestamp + "\n" + body (R3)
 *   - Spec accepted ONLY from sentinel-bracketed comments, never from ticket bodies (R3.2)
 *   - Issuer verified against ALLOWED_ISSUERS allowlist (R3.1)
 *   - Nonce uniqueness via KV (24h TTL) — replay prevention (R3.4)
 *   - Durable Object lock per (routine_id, ticket_id) — race-condition fix (R2.1)
 *   - FireCountDO: atomic per-day fire cap (strongly consistent, replaces KV get/put)
 *   - Two-layer dedup: KV (fast, eventual) + Durable Object (strong, authoritative)
 *   - Bridge writes audit_log status:fired before every /fire call (R3.6)
 *   - No console.log of any secret values (R3.12)
 *   - Bridge soft-pause via bridge:paused KV key (anthropic-outage.md runbook)
 */

import { z } from "zod";
import { writeAuditLog } from "./audit";
import {
  BridgeEnv,
  LINEAR_LABEL_TO_ROUTINE,
  ROUTINE_TOKEN_ENV_KEY,
  TELEGRAM_MENTION_TO_LABEL,
  findRoutingLabel,
  parseTierLabel,
} from "./routing";
import { RoutineLock } from "./durable-object";

export { RoutineLock };

// ---------------------------------------------------------------------------
// FireCountDO — atomic per-day fire cap (R2: replaces non-atomic KV get/put)
// ---------------------------------------------------------------------------

export class FireCountDO {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const action = url.pathname.slice(1); // "increment" | "get"
    const maxPerDay = parseInt(url.searchParams.get("max") ?? "15", 10);

    if (action === "increment") {
      return Response.json(await this.increment(maxPerDay));
    }
    if (action === "get") {
      const today = new Date().toISOString().slice(0, 10);
      const count = (await this.state.storage.get<number>(today)) ?? 0;
      return Response.json({ count });
    }
    return Response.json({ error: "unknown action" }, { status: 400 });
  }

  /**
   * Atomically increment the daily fire count.
   * Uses state.storage.transaction() for strong consistency.
   */
  async increment(maxPerDay: number): Promise<{ allowed: boolean; currentCount: number }> {
    const today = new Date().toISOString().slice(0, 10);
    let result: { allowed: boolean; currentCount: number } = { allowed: false, currentCount: 0 };

    await this.state.storage.transaction(async (txn) => {
      const current = (await txn.get<number>(today)) ?? 0;
      if (current >= maxPerDay) {
        result = { allowed: false, currentCount: current };
        return;
      }
      const next = current + 1;
      await txn.put(today, next);
      result = { allowed: true, currentCount: next };
    });

    return result;
  }
}

// ---------------------------------------------------------------------------
// Trust-mode spec schema (per ORCHESTRATION.md §2D)
// ---------------------------------------------------------------------------

const BudgetSchema = z.object({
  max_cost_usd: z.number().positive(),
  max_runtime_minutes: z.number().positive(),
  max_tool_calls: z.number().int().positive(),
});

const EscalationSchema = z.object({
  channel: z.enum(["telegram", "linear-comment", "github-pr-comment"]),
  format: z.enum(["binary-ping", "freeform"]),
  blocker_threshold_minutes: z.number().int().positive(),
});

const ScopeSchema = z.object({
  intent: z.enum(["ship", "research", "design", "fix", "refactor", "review", "board"]),
  domain: z.enum(["backend", "frontend", "infra", "data", "ai", "growth", "brand", "research"]),
  constraints: z.array(z.string()).min(0),
  definition_of_done: z.string().min(1),
  out_of_scope: z.array(z.string()).min(1, "out_of_scope must have ≥1 entry (R3.5)"),
});

/**
 * R12: IssuedBy now carries telegram_chat_id alongside linear_user_id.
 * At least one of linear_user_id or telegram_chat_id must be non-null.
 * Telegram-sourced fires populate telegram_chat_id; linear_user_id stays null.
 */
const IssuedBySchema = z
  .object({
    kind: z.enum(["adam", "ceo", "c_suite", "standing_routine"]),
    linear_user_id: z.string().nullable(),
    telegram_chat_id: z.string().nullable(),
    agent_session_id: z.string().optional(),
    session_file: z.string().optional(),
  })
  .refine(
    (v) => v.linear_user_id !== null || v.telegram_chat_id !== null,
    { message: "issued_by must have at least one of linear_user_id or telegram_chat_id non-null" }
  );

/**
 * Full trust-mode spec schema.
 * skip_pre_flight is intentionally absent (per ORCHESTRATION.md R3.3).
 */
const TrustSpecSchema = z.object({
  spec_version: z.literal("1.0"),
  trust_mode: z.boolean(),
  nonce: z.string().uuid("nonce must be uuid-v4"),
  issued_at: z.string().datetime(),
  expires_at: z.string().datetime(),
  issued_by: IssuedBySchema,
  linear_ticket: z.string().optional(),
  parent_ticket: z.string().optional(),
  fan_in_key: z.string().uuid().optional(),
  scope: ScopeSchema,
  memory_pre_loads: z.array(z.string()).optional(),
  budget: BudgetSchema,
  escalation: EscalationSchema,
  audit: z.object({
    session_file_required: z.boolean(),
    decisions_md_entry_required: z.boolean(),
    audit_log_table: z.literal("audit_log"),
  }),
  _signature: z.string().min(1).optional(), // set by bridge before outbound fire
});

type TrustSpec = z.infer<typeof TrustSpecSchema>;

// ---------------------------------------------------------------------------
// Linear webhook payload types (minimal — only what we need)
// ---------------------------------------------------------------------------

const LinearIssueSchema = z.object({
  id: z.string(),
  identifier: z.string(), // e.g. "BMX-101"
  title: z.string(),
  labels: z.array(z.object({ name: z.string() })).optional(),
});

const LinearCommentSchema = z.object({
  id: z.string(),
  body: z.string(),
  user: z.object({ id: z.string() }),
  issue: LinearIssueSchema.optional(),
});

const LinearWebhookSchema = z.object({
  type: z.string(), // "Issue" | "Comment"
  action: z.string(), // "create" | "update" | etc.
  data: z.unknown(),
  organizationId: z.string().optional(),
});

// ---------------------------------------------------------------------------
// iOS Shortcut payload schema
// nonce field required for replay prevention (R3)
// ---------------------------------------------------------------------------

const IdeaCaptureSchema = z.object({
  title: z.string().min(1).max(500),
  body: z.string().optional(),
  labels: z.array(z.string()).optional(),
  timestamp: z.string().datetime().optional(),
  nonce: z.string().uuid("Shortcut must embed a UUID nonce for replay prevention (R3)"),
});

// ---------------------------------------------------------------------------
// Spec sentinel constants (per ORCHESTRATION.md §2D R3.2)
// ---------------------------------------------------------------------------

const SPEC_START = "---BEAMIX-SPEC-V1-START---";
const SPEC_END   = "---BEAMIX-SPEC-V1-END---";

// Max /fire calls per day on Max 5× plan (per ORCHESTRATION.md §2B)
const MAX_FIRES_PER_DAY_MAX5X = 15;

// Max timestamp skew (seconds) for HMAC-signed requests (R3)
const MAX_TIMESTAMP_SKEW_SECONDS = 300;

// ---------------------------------------------------------------------------
// HMAC helpers using Web Crypto API (Cloudflare Workers native)
// Constant-time comparison via crypto.subtle.verify — never manual ===
// ---------------------------------------------------------------------------

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signHmac(key: CryptoKey, data: string): Promise<string> {
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Constant-time HMAC verification via crypto.subtle.verify.
 * Never uses manual string comparison (timing-safe per R3.12 intent).
 */
async function verifyHmac(key: CryptoKey, data: string, receivedHex: string): Promise<boolean> {
  const enc = new TextEncoder();
  // Decode received hex signature back to bytes
  const receivedBytes = new Uint8Array(
    receivedHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []
  );
  return crypto.subtle.verify("HMAC", key, receivedBytes, enc.encode(data));
}

/**
 * Shared HMAC verifier for Shortcut and Telegram bot inbound requests (R3).
 *
 * HMAC input is: timestamp + "\n" + body
 * X-Beamix-Timestamp header must be within MAX_TIMESTAMP_SKEW_SECONDS of now.
 *
 * Returns false if:
 *   - signature header is missing
 *   - timestamp header is missing or out of skew window
 *   - HMAC does not match
 */
async function verifyHmacSignature(
  body: string,
  signatureHeader: string | null,
  timestampHeader: string | null,
  secret: string,
  maxSkewSeconds: number = MAX_TIMESTAMP_SKEW_SECONDS
): Promise<boolean> {
  if (!signatureHeader || !timestampHeader) return false;

  // Reject stale/future timestamps (R3 timestamp skew guard)
  const sentTs = parseInt(timestampHeader, 10);
  if (isNaN(sentTs)) return false;
  const nowTs = Math.floor(Date.now() / 1000);
  if (Math.abs(nowTs - sentTs) > maxSkewSeconds) return false;

  const sig = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice(7)
    : signatureHeader;

  const key = await importHmacKey(secret);
  // HMAC over: timestamp + "\n" + body (R3)
  return verifyHmac(key, `${timestampHeader}\n${body}`, sig);
}

/**
 * Verifies a Linear webhook signature.
 * Linear sends the HMAC-SHA-256 hex in the `X-Hub-Signature` header (with "sha256=" prefix).
 * Linear signatures cover only the body (no timestamp header on Linear's side).
 */
async function verifyLinearWebhook(
  body: string,
  signatureHeader: string | null,
  secret: string
): Promise<boolean> {
  if (!signatureHeader) return false;
  const sig = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice(7)
    : signatureHeader;
  const key = await importHmacKey(secret);
  return verifyHmac(key, body, sig);
}

// ---------------------------------------------------------------------------
// Canonical JSON serializer (R3: replaces JSON.stringify with replacer arg)
//
// Recursively walks obj, sorting keys at every depth.
// Two specs with the same logical content but different key insertion order
// produce identical output — making HMAC verification deterministic.
// ---------------------------------------------------------------------------

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalJson).join(",") + "]";
  }
  // Object — sort keys recursively
  const obj = value as Record<string, unknown>;
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map((k) => JSON.stringify(k) + ":" + canonicalJson(obj[k]));
  return "{" + pairs.join(",") + "}";
}

// ---------------------------------------------------------------------------
// Spec extraction from Linear comment body (R3.2)
// ---------------------------------------------------------------------------

function extractSpecFromComment(body: string): string | null {
  const startIdx = body.indexOf(SPEC_START);
  const endIdx   = body.indexOf(SPEC_END);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;
  return body.slice(startIdx + SPEC_START.length, endIdx).trim();
}

// ---------------------------------------------------------------------------
// Nonce dedup via KV
// ---------------------------------------------------------------------------

async function checkAndStoreNonce(
  kv: KVNamespace,
  nonce: string,
  ttlSeconds: number
): Promise<boolean> {
  const existing = await kv.get(`nonce:${nonce}`);
  if (existing !== null) return false; // replay detected
  await kv.put(`nonce:${nonce}`, "1", { expirationTtl: ttlSeconds });
  return true;
}

// ---------------------------------------------------------------------------
// Durable Object lock helpers
// ---------------------------------------------------------------------------

async function acquireLock(
  lockNamespace: DurableObjectNamespace,
  key: string
): Promise<boolean> {
  const id = lockNamespace.idFromName(key);
  const stub = lockNamespace.get(id);
  const resp = await stub.fetch(
    new Request(`https://do/acquire?key=${encodeURIComponent(key)}`)
  );
  const result = await resp.json() as { acquired: boolean };
  return result.acquired;
}

async function releaseLock(
  lockNamespace: DurableObjectNamespace,
  key: string
): Promise<void> {
  const id = lockNamespace.idFromName(key);
  const stub = lockNamespace.get(id);
  await stub.fetch(
    new Request(`https://do/release?key=${encodeURIComponent(key)}`)
  );
}

// ---------------------------------------------------------------------------
// Fire count guard (per-day cap) — uses FireCountDO for atomic increment (R2)
// ---------------------------------------------------------------------------

async function checkFireCountGuard(
  fireCountDO: DurableObjectNamespace,
  maxPerDay: number
): Promise<{ allowed: boolean; currentCount: number }> {
  // All daily counts go to the same DO instance keyed by date
  const today = new Date().toISOString().slice(0, 10);
  const id = fireCountDO.idFromName(`fire-count:${today}`);
  const stub = fireCountDO.get(id);
  const resp = await stub.fetch(
    new Request(`https://do/increment?max=${encodeURIComponent(maxPerDay)}`)
  );
  return await resp.json() as { allowed: boolean; currentCount: number };
}

// ---------------------------------------------------------------------------
// Haiku tier classifier (optional — called when tier label is absent)
// Only uses ANTHROPIC_API_KEY (Console-billed, per feedback_claude_code_oauth_ban_risk.md)
//
// R5 F7: AbortSignal.timeout(8000) — 8s ceiling.
// Classification call is placed AFTER acquireLock + writeAuditLog (R5 F7 ordering).
// On timeout/error: default to "lite".
// ---------------------------------------------------------------------------

async function classifyTierWithHaiku(
  ticketTitle: string,
  firstComment: string,
  anthropicApiKey: string
): Promise<"quick" | "lite" | "full"> {
  const prompt = `Classify this Linear ticket tier. Reply with exactly one word: quick, lite, or full.

Definitions:
- quick: typo fix, single-line change, log line, trivial correction
- lite: one-domain feature (~100 LOC), single C-suite owns it
- full: cross-domain (auth + billing), risky migration, board-grade, multiple C-suites needed

Ticket title: ${ticketTitle}
First comment: ${firstComment.slice(0, 500)}

Reply with only: quick, lite, or full`;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 10,
        messages: [{ role: "user", content: prompt }],
      }),
      // R5 F7: 8s abort ceiling — slow Haiku response must not pin dispatch pipeline
      signal: AbortSignal.timeout(8000),
    });

    if (!resp.ok) return "lite"; // safe fallback

    const data = await resp.json() as {
      content?: Array<{ type: string; text: string }>;
    };
    const text = data.content?.[0]?.text?.trim().toLowerCase() ?? "";
    if (text === "quick" || text === "lite" || text === "full") return text;
    return "lite";
  } catch {
    return "lite"; // safe fallback on any error (including AbortError)
  }
}

// ---------------------------------------------------------------------------
// HMAC-sign outbound trust spec (R3.1)
// Uses canonical JSON serializer for deterministic key order (R3 F9 fix)
// ---------------------------------------------------------------------------

async function signSpec(spec: TrustSpec, bridgeHmacSecret: string): Promise<string> {
  const key = await importHmacKey(bridgeHmacSecret);
  // R3: use canonicalJson (not JSON.stringify with replacer) for deterministic HMAC
  const body = canonicalJson(spec as unknown as Record<string, unknown>);
  return signHmac(key, body);
}

// ---------------------------------------------------------------------------
// Linear API — create ticket via GraphQL
// ---------------------------------------------------------------------------

async function createLinearTicket(
  linearApiKey: string,
  title: string,
  description: string,
  teamId?: string
): Promise<{ id: string; identifier: string } | null> {
  const query = `
    mutation CreateIssue($title: String!, $description: String, $teamId: String) {
      issueCreate(input: { title: $title, description: $description, teamId: $teamId }) {
        success
        issue {
          id
          identifier
        }
      }
    }
  `;

  try {
    const resp = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Authorization": linearApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { title, description, teamId: teamId ?? null },
      }),
    });

    if (!resp.ok) return null;

    const data = await resp.json() as {
      data?: {
        issueCreate?: { success: boolean; issue?: { id: string; identifier: string } };
      };
    };
    return data?.data?.issueCreate?.issue ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Telegram message sender
// ---------------------------------------------------------------------------

async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string
): Promise<void> {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

// ---------------------------------------------------------------------------
// Main Worker
// ---------------------------------------------------------------------------

export default {
  async fetch(request: Request, env: BridgeEnv): Promise<Response> {
    const url = new URL(request.url);

    // ---------- GET /health — minimal for unauth; detailed requires Bearer (R12) ----------
    if (request.method === "GET" && url.pathname === "/health") {
      return handleHealth(request, env);
    }

    // ---------- Bridge soft-pause guard (anthropic-outage.md runbook) ----------
    const paused = await env.BRIDGE_STATE_KV.get("bridge:paused");
    if (paused === "true") {
      return new Response(
        JSON.stringify({ error: "bridge paused", reason: "anthropic_outage" }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "600",
          },
        }
      );
    }

    // ---------- POST /linear ----------
    if (request.method === "POST" && url.pathname === "/linear") {
      return handleLinear(request, env);
    }

    // ---------- POST /idea-capture ----------
    if (request.method === "POST" && url.pathname === "/idea-capture") {
      return handleIdeaCapture(request, env);
    }

    // ---------- POST /telegram ----------
    if (request.method === "POST" && url.pathname === "/telegram") {
      return handleTelegram(request, env);
    }

    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },
};

// ---------------------------------------------------------------------------
// GET /health
// R12: minimal { ok: true } for unauthenticated. Detailed state requires Bearer.
// ---------------------------------------------------------------------------

async function handleHealth(request: Request, env: BridgeEnv): Promise<Response> {
  // Check for authorized detailed view
  const authHeader = request.headers.get("Authorization");
  const expectedBearer = `Bearer ${env.BRIDGE_HMAC_SECRET}`;
  const isAuthorized = authHeader === expectedBearer;

  if (!isAuthorized) {
    // Unauthenticated: return minimal liveness response only
    return Response.json({ ok: true });
  }

  // Authorized: return full diagnostic state
  let kvConnected = false;
  let doConnected = false;
  let bridgePaused = false;
  let linearPaused = false;

  try {
    const pausedVal = await env.BRIDGE_STATE_KV.get("bridge:paused");
    kvConnected = true;
    bridgePaused = pausedVal === "true";
    const linearPausedVal = await env.BRIDGE_STATE_KV.get("bridge:linear_paused");
    linearPaused = linearPausedVal === "true";
  } catch {
    kvConnected = false;
  }

  try {
    const id = env.ROUTINE_LOCK.idFromName("health-check");
    env.ROUTINE_LOCK.get(id);
    doConnected = true;
  } catch {
    doConnected = false;
  }

  return Response.json({
    ok: true,
    kv_connected: kvConnected,
    do_connected: doConnected,
    bridge_paused: bridgePaused,
    linear_paused: linearPaused,
  });
}

// ---------------------------------------------------------------------------
// POST /linear
// ---------------------------------------------------------------------------

async function handleLinear(request: Request, env: BridgeEnv): Promise<Response> {
  const rawBody = await request.text();

  // Step 1: HMAC verify Linear webhook signature
  const signature = request.headers.get("X-Hub-Signature");
  const isValid = await verifyLinearWebhook(rawBody, signature, env.LINEAR_WEBHOOK_SECRET);
  if (!isValid) {
    await writeAuditLog(
      { status: "rule_violation", agent: "cloudflare-bridge" },
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
    return Response.json({ error: "invalid signature" }, { status: 401 });
  }

  // Step 2: Parse webhook payload
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const parsed = LinearWebhookSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: "unexpected webhook shape" }, { status: 400 });
  }

  const webhook = parsed.data;

  // Only handle Issue:created and Comment:created
  const isIssueCreated   = webhook.type === "Issue"   && webhook.action === "create";
  const isCommentCreated = webhook.type === "Comment" && webhook.action === "create";

  if (!isIssueCreated && !isCommentCreated) {
    // Not a relevant event — acknowledge and drop
    return Response.json({ ok: true, ignored: true });
  }

  // Check linear_paused
  const linearPaused = await env.BRIDGE_STATE_KV.get("bridge:linear_paused");
  if (linearPaused === "true") {
    return new Response(
      JSON.stringify({ error: "linear bridge paused" }),
      { status: 503, headers: { "Content-Type": "application/json", "Retry-After": "300" } }
    );
  }

  if (isCommentCreated) {
    return handleCommentCreated(webhook.data, env);
  }

  if (isIssueCreated) {
    return handleIssueCreated(webhook.data, env);
  }

  return Response.json({ ok: true });
}

// ---------------------------------------------------------------------------
// Handles Comment:created — spec extraction path
// ---------------------------------------------------------------------------

async function handleCommentCreated(
  data: unknown,
  env: BridgeEnv
): Promise<Response> {
  const commentResult = LinearCommentSchema.safeParse(data);
  if (!commentResult.success) {
    return Response.json({ error: "invalid comment payload" }, { status: 400 });
  }

  const comment = commentResult.data;

  // Step 3 (R3.2): Extract spec ONLY from sentinel-bracketed comment body.
  // Ticket bodies are NEVER parsed as spec sources.
  const specJson = extractSpecFromComment(comment.body);
  if (!specJson) {
    // No sentinel block in this comment — not a spec trigger, ignore
    return Response.json({ ok: true, ignored: true });
  }

  // Step 4 (R3.1): Verify issuer is in ALLOWED_ISSUERS
  const allowedIssuers = env.ALLOWED_ISSUERS.split(",").map((s) => s.trim()).filter(Boolean);
  if (!allowedIssuers.includes(comment.user.id)) {
    await writeAuditLog(
      {
        status: "rule_violation",
        agent: "cloudflare-bridge",
        linear_ticket: comment.issue?.identifier,
      },
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
    return Response.json({ error: "issuer not in allowlist" }, { status: 403 });
  }

  // Step 4 continued: Parse and Zod-validate the spec
  let rawSpec: unknown;
  try {
    rawSpec = JSON.parse(specJson);
  } catch {
    return Response.json({ error: "spec JSON parse error" }, { status: 400 });
  }

  const specResult = TrustSpecSchema.safeParse(rawSpec);
  if (!specResult.success) {
    return Response.json(
      { error: "spec validation failed", issues: specResult.error.issues },
      { status: 422 }
    );
  }

  const spec = specResult.data;

  // Step 4 continued: Check expires_at
  if (new Date(spec.expires_at) < new Date()) {
    return Response.json({ error: "spec has expired" }, { status: 422 });
  }

  // Check issued_by.linear_user_id matches comment author (defense-in-depth)
  if (spec.issued_by.linear_user_id !== comment.user.id) {
    await writeAuditLog(
      { status: "rule_violation", agent: "cloudflare-bridge", linear_ticket: comment.issue?.identifier },
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
    return Response.json({ error: "issuer mismatch" }, { status: 403 });
  }

  // Step 4 continued (R3.4): Nonce uniqueness check via KV
  const nonceWindow = Math.floor(
    (new Date(spec.expires_at).getTime() - new Date(spec.issued_at).getTime()) / 1000
  );
  const nonceFresh = await checkAndStoreNonce(env.BRIDGE_STATE_KV, spec.nonce, nonceWindow);
  if (!nonceFresh) {
    return Response.json({ error: "nonce replay detected" }, { status: 409 });
  }

  // Determine the routing label and Routine ID
  const issueLabels = (comment.issue?.labels ?? []).map((l) => l.name);
  const routingLabel = findRoutingLabel(issueLabels);
  const routineId = routingLabel ? LINEAR_LABEL_TO_ROUTINE[routingLabel] : null;

  if (!routineId || routineId.startsWith("PLACEHOLDER")) {
    return Response.json(
      { error: "no Routine configured for this label", label: routingLabel },
      { status: 422 }
    );
  }

  // Step 5 (R2.1): Acquire Durable Object lock keyed (routine_id, ticket_id)
  const lockKey = `${routineId}:${comment.issue?.id ?? spec.linear_ticket ?? "unknown"}`;
  const acquired = await acquireLock(env.ROUTINE_LOCK, lockKey);
  if (!acquired) {
    // Already fired — idempotent drop
    return Response.json({ ok: true, deduplicated: true });
  }

  // Get bearer token for this Routine
  const tokenEnvKey = routingLabel ? ROUTINE_TOKEN_ENV_KEY[routingLabel] : null;
  const routineToken = tokenEnvKey ? env[tokenEnvKey] : null;
  if (!routineToken) {
    await releaseLock(env.ROUTINE_LOCK, lockKey);
    return Response.json({ error: "no bearer token for routine" }, { status: 500 });
  }

  // Step 7 (R3.6): Bridge writes audit_log status:fired BEFORE /fire
  // NOTE: sign spec BEFORE writeAuditLog so spec in audit row includes signature
  const signedSig = await signSpec(spec, env.BRIDGE_HMAC_SECRET);
  const signedSpec: TrustSpec = { ...spec, _signature: signedSig };

  await writeAuditLog(
    {
      status: "fired",
      agent: "cloudflare-bridge",
      linear_ticket: comment.issue?.identifier ?? spec.linear_ticket,
      fan_in_key: spec.fan_in_key,
      nonce: spec.nonce,
      spec: signedSpec as unknown as Record<string, unknown>,
    },
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  // R5 F7: classify tier AFTER acquireLock + writeAuditLog
  // If classification fails, write audit_log with tier:"lite" and proceed
  let tier = parseTierLabel(issueLabels);
  if (!tier) {
    tier = await classifyTierWithHaiku(
      comment.issue?.title ?? "Untitled",
      comment.body,
      env.ANTHROPIC_API_KEY
    );
  }

  // Per-day fire count guard — atomic via FireCountDO (R2)
  const { allowed, currentCount } = await checkFireCountGuard(
    env.FIRE_COUNT_DO,
    MAX_FIRES_PER_DAY_MAX5X
  );
  if (!allowed) {
    // Queue to Inngest delayed event instead of dropping
    await queueDelayedFire(spec, routingLabel ?? "agent:ceo", env);
    await releaseLock(env.ROUTINE_LOCK, lockKey);
    return Response.json({
      ok: true,
      queued: true,
      reason: "daily_fire_cap_reached",
      current_count: currentCount,
    });
  }

  // Step 8: POST to Anthropic /fire endpoint with HMAC-signed spec
  const fireResult = await fireRoutine(routineId, routineToken, signedSpec, env);

  if (!fireResult.ok) {
    await writeAuditLog(
      {
        status: "anthropic_error",
        agent: "cloudflare-bridge",
        linear_ticket: comment.issue?.identifier ?? spec.linear_ticket,
        nonce: spec.nonce,
      },
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
    // Release lock on fire failure so retry can re-acquire
    await releaseLock(env.ROUTINE_LOCK, lockKey);
    return Response.json(
      { error: "anthropic /fire failed", status: fireResult.status },
      { status: 502 }
    );
  }

  // Lock is held until Routine completion or 5-min TTL auto-release

  return Response.json({
    ok: true,
    fired: true,
    routine_id: routineId,
    tier,
    linear_ticket: comment.issue?.identifier,
  });
}

// ---------------------------------------------------------------------------
// Handles Issue:created — label-based routing (no spec required for some labels)
// R2: board-meeting fast path now goes through acquireLock + checkAndStoreNonce
//     mirroring handleCommentCreated — no more dedup bypass.
// ---------------------------------------------------------------------------

async function handleIssueCreated(
  data: unknown,
  env: BridgeEnv
): Promise<Response> {
  const issueResult = LinearIssueSchema.safeParse(data);
  if (!issueResult.success) {
    return Response.json({ ok: true, ignored: true }); // graceful
  }

  const issue = issueResult.data;
  const labels = (issue.labels ?? []).map((l) => l.name);
  const routingLabel = findRoutingLabel(labels);

  // Issue:created without a spec comment is only routed if it has a board-meeting label
  // All other routing goes through Comment:created (spec path above)
  if (routingLabel !== "board-meeting") {
    return Response.json({ ok: true, ignored: true });
  }

  // For board-meeting label: fire CEO with a minimal synth-only spec
  const routineId = LINEAR_LABEL_TO_ROUTINE["board-meeting"];
  if (!routineId || routineId.startsWith("PLACEHOLDER")) {
    return Response.json({ ok: true, ignored: true });
  }

  const token = env.ROUTINE_CEO_ENTRY_POINT_TOKEN;
  const boardSpec = buildBoardMeetingSpec(issue.identifier, issue.title);

  // R2: nonce dedup check — prevent Linear webhook retries from firing 3× board meetings
  const nonceWindow = Math.floor(
    (new Date(boardSpec.expires_at).getTime() - new Date(boardSpec.issued_at).getTime()) / 1000
  );
  const nonceFresh = await checkAndStoreNonce(env.BRIDGE_STATE_KV, boardSpec.nonce, nonceWindow);
  if (!nonceFresh) {
    return Response.json({ ok: true, deduplicated: true });
  }

  // R2: Acquire DO lock before firing — prevents concurrent webhook retries
  const lockKey = `${routineId}:${issue.id}`;
  const acquired = await acquireLock(env.ROUTINE_LOCK, lockKey);
  if (!acquired) {
    return Response.json({ ok: true, deduplicated: true });
  }

  await writeAuditLog(
    { status: "fired", agent: "cloudflare-bridge", linear_ticket: issue.identifier, spec: boardSpec as unknown as Record<string, unknown> },
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  const fireResult = await fireRoutine(routineId, token, boardSpec, env);
  if (!fireResult.ok) {
    await releaseLock(env.ROUTINE_LOCK, lockKey);
    return Response.json({ error: "anthropic /fire failed", status: fireResult.status }, { status: 502 });
  }

  return Response.json({ ok: true, fired: true, board_meeting: true });
}

// ---------------------------------------------------------------------------
// POST /idea-capture — iOS Shortcut
// R3: verifyHmacSignature (timestamp + body). Nonce dedup via KV.
// ---------------------------------------------------------------------------

async function handleIdeaCapture(request: Request, env: BridgeEnv): Promise<Response> {
  const rawBody = await request.text();

  // R3: verify HMAC with timestamp skew guard
  const signature = request.headers.get("X-Beamix-Signature");
  const timestamp = request.headers.get("X-Beamix-Timestamp");
  const isValid = await verifyHmacSignature(rawBody, signature, timestamp, env.SHORTCUT_SECRET);
  if (!isValid) {
    await writeAuditLog(
      { status: "rule_violation", agent: "cloudflare-bridge" },
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
    return Response.json({ error: "invalid signature or stale timestamp" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const ideaResult = IdeaCaptureSchema.safeParse(body);
  if (!ideaResult.success) {
    return Response.json(
      { error: "invalid payload", issues: ideaResult.error.issues },
      { status: 422 }
    );
  }

  const idea = ideaResult.data;

  // R3: nonce dedup for Shortcut requests (replay prevention within 24h window)
  const nonceFresh = await checkAndStoreNonce(env.BRIDGE_STATE_KV, idea.nonce, 24 * 3600);
  if (!nonceFresh) {
    return Response.json({ error: "nonce replay detected" }, { status: 409 });
  }

  // Create a Linear ticket via GraphQL API
  const ticket = await createLinearTicket(
    env.LINEAR_API_KEY,
    idea.title,
    idea.body ?? "",
  );

  if (!ticket) {
    await writeAuditLog(
      { status: "linear_api_error", agent: "cloudflare-bridge" },
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
    return Response.json({ error: "failed to create Linear ticket" }, { status: 502 });
  }

  return Response.json({ ok: true, ticket_id: ticket.id, identifier: ticket.identifier });
}

// ---------------------------------------------------------------------------
// POST /telegram — Telegram bot updates
// R3: verifyHmacSignature (timestamp + body) — same helper as /idea-capture
// ---------------------------------------------------------------------------

const TelegramUpdateSchema = z.object({
  update_id: z.number(),
  message: z.object({
    message_id: z.number(),
    from: z.object({ id: z.number() }),
    chat: z.object({ id: z.number() }),
    text: z.string().optional(),
  }).optional(),
});

async function handleTelegram(request: Request, env: BridgeEnv): Promise<Response> {
  const rawBody = await request.text();

  // R3: HMAC verification for Telegram bot → bridge path
  // Only the internal Telegram bot (infra/telegram-bot) calls this endpoint.
  // It sends X-Beamix-Signature + X-Beamix-Timestamp (matching Shortcut pattern).
  const signature = request.headers.get("X-Beamix-Signature");
  const timestamp = request.headers.get("X-Beamix-Timestamp");
  const isValid = await verifyHmacSignature(rawBody, signature, timestamp, env.BRIDGE_HMAC_SECRET);
  if (!isValid) {
    await writeAuditLog(
      { status: "rule_violation", agent: "cloudflare-bridge" },
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
    // Return 200 to Telegram to prevent infinite retry — auth failure is a configuration error
    return Response.json({ ok: true });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ ok: true }); // Telegram retries — always 200
  }

  const updateResult = TelegramUpdateSchema.safeParse(body);
  if (!updateResult.success) {
    return Response.json({ ok: true }); // Telegram retries — always 200
  }

  const update = updateResult.data;
  if (!update.message) return Response.json({ ok: true });

  const chatId   = String(update.message.chat.id);
  const fromId   = String(update.message.from.id);
  const text     = update.message.text ?? "";

  // Only accept messages from Adam's chat ID
  if (fromId !== env.ADAM_TELEGRAM_CHAT_ID && chatId !== env.ADAM_TELEGRAM_CHAT_ID) {
    // Not from Adam — silently drop
    return Response.json({ ok: true });
  }

  // R6: word-boundary regex to extract @mention from message start
  // Prevents "@cto-something" matching "@cto", etc.
  let routingLabel = "agent:ceo"; // default
  const mentionMatch = text.toLowerCase().match(/^(@[a-z-]+)\b/);
  if (mentionMatch) {
    const mention = mentionMatch[1];
    const mapped = TELEGRAM_MENTION_TO_LABEL[mention];
    if (mapped) {
      routingLabel = mapped;
    }
  }

  const routineId = LINEAR_LABEL_TO_ROUTINE[routingLabel];
  const tokenEnvKey = ROUTINE_TOKEN_ENV_KEY[routingLabel];
  const routineToken = tokenEnvKey ? env[tokenEnvKey] : null;

  if (!routineId || routineId.startsWith("PLACEHOLDER") || !routineToken) {
    await sendTelegramMessage(
      env.TELEGRAM_BOT_TOKEN,
      chatId,
      `[bridge] No Routine configured for ${routingLabel}. Check wrangler.toml.`
    );
    return Response.json({ ok: true });
  }

  // R12: Build spec with telegram_chat_id (not linear_user_id) for Telegram-sourced fires
  const telegramSpec = buildTelegramSpec(text, routingLabel, chatId);

  // Nonce + fire count guard (atomic FireCountDO — R2)
  const { allowed } = await checkFireCountGuard(env.FIRE_COUNT_DO, MAX_FIRES_PER_DAY_MAX5X);
  if (!allowed) {
    await sendTelegramMessage(
      env.TELEGRAM_BOT_TOKEN,
      chatId,
      `[bridge] Daily /fire cap reached. Message queued for next available window.`
    );
    await queueDelayedFire(telegramSpec, routingLabel, env);
    return Response.json({ ok: true });
  }

  await writeAuditLog(
    { status: "fired", agent: "cloudflare-bridge", spec: telegramSpec as unknown as Record<string, unknown> },
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  const fireResult = await fireRoutine(routineId, routineToken, telegramSpec, env);
  if (!fireResult.ok) {
    await writeAuditLog(
      { status: "anthropic_error", agent: "cloudflare-bridge" },
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
    await sendTelegramMessage(
      env.TELEGRAM_BOT_TOKEN,
      chatId,
      `[bridge] Routine fire failed (${fireResult.status}). Check /war-room.`
    );
  }

  return Response.json({ ok: true });
}

// ---------------------------------------------------------------------------
// Helper: fire a Routine via Anthropic /v1/claude_code/routines/{id}/fire
// ---------------------------------------------------------------------------

async function fireRoutine(
  routineId: string,
  bearerToken: string,
  spec: TrustSpec,
  _env: BridgeEnv
): Promise<{ ok: boolean; status: number }> {
  // NOTE: never log bearerToken — per R3.12
  try {
    const resp = await fetch(
      `https://api.anthropic.com/v1/claude_code/routines/${routineId}/fire`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({ spec }),
      }
    );
    return { ok: resp.ok, status: resp.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

// ---------------------------------------------------------------------------
// Helper: queue a delayed fire to Inngest when cap is hit
// Per ORCHESTRATION.md §2B fire-and-forget rule + failure modes table
// ---------------------------------------------------------------------------

async function queueDelayedFire(
  spec: TrustSpec,
  routingLabel: string,
  env: BridgeEnv
): Promise<void> {
  // R12 F12: check spec.expires_at before queueing — don't queue expired specs
  if (new Date(spec.expires_at) <= new Date()) {
    await writeAuditLog(
      { status: "expired_pre_dispatch", agent: "cloudflare-bridge", nonce: spec.nonce },
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
    return;
  }

  // Fire-and-forget to Inngest — if Inngest is unavailable, we log but don't throw
  try {
    await fetch(`${env.SUPABASE_URL}/functions/v1/inngest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        name: "bridge/delayed-fire",
        data: { spec, routing_label: routingLabel },
        delay: 86400, // 1 day delay in seconds
      }),
    });
  } catch {
    // Log the failure but don't crash — it's fire-and-forget
    console.error("[bridge] failed to queue delayed fire to Inngest");
  }
}

// ---------------------------------------------------------------------------
// Helpers: build minimal specs for non-spec-comment paths
// ---------------------------------------------------------------------------

function buildBoardMeetingSpec(ticketId: string, title: string): TrustSpec {
  const now = new Date();
  const exp = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return {
    spec_version: "1.0",
    trust_mode: true,
    nonce: crypto.randomUUID(),
    issued_at: now.toISOString(),
    expires_at: exp.toISOString(),
    issued_by: {
      kind: "standing_routine",
      linear_user_id: "bridge",
      telegram_chat_id: null,
    },
    linear_ticket: ticketId,
    scope: {
      intent: "board",
      domain: "research",
      constraints: [],
      definition_of_done: `Board meeting complete for: ${title}`,
      out_of_scope: ["auth", "billing"],
    },
    budget: { max_cost_usd: 3, max_runtime_minutes: 120, max_tool_calls: 200 },
    escalation: { channel: "telegram", format: "binary-ping", blocker_threshold_minutes: 10 },
    audit: { session_file_required: true, decisions_md_entry_required: false, audit_log_table: "audit_log" },
  };
}

/**
 * R12: buildTelegramSpec populates telegram_chat_id; linear_user_id is null.
 */
function buildTelegramSpec(messageText: string, routingLabel: string, chatId: string): TrustSpec {
  const now = new Date();
  const exp = new Date(now.getTime() + 30 * 60 * 1000); // 30 min for quick-tier
  return {
    spec_version: "1.0",
    trust_mode: true,
    nonce: crypto.randomUUID(),
    issued_at: now.toISOString(),
    expires_at: exp.toISOString(),
    issued_by: {
      kind: "adam",
      linear_user_id: null,
      telegram_chat_id: chatId,
    },
    scope: {
      intent: "fix",
      domain: "backend",
      constraints: [],
      definition_of_done: `Telegram request processed: ${messageText.slice(0, 100)}`,
      out_of_scope: ["billing"],
    },
    budget: { max_cost_usd: 1, max_runtime_minutes: 30, max_tool_calls: 100 },
    escalation: { channel: "telegram", format: "binary-ping", blocker_threshold_minutes: 5 },
    audit: { session_file_required: false, decisions_md_entry_required: false, audit_log_table: "audit_log" },
  };
}

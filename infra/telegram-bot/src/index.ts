/**
 * Beamix Telegram Bot Worker
 *
 * Receives Telegram webhook updates and forwards them to the bridge /telegram endpoint.
 * Maintains a KV holding queue as fallback when the bridge is unreachable (Linear outage,
 * bridge soft-paused, etc.).
 *
 * Per ORCHESTRATION.md §3A.3:
 *   - Telegram is the ad-hoc text/voice → CEO routing channel.
 *   - Fallback: queue message to KV key `telegram-queue:<message_id>` with 7d TTL.
 *
 * SECURITY: Verifies all messages come from Adam's ADAM_TELEGRAM_CHAT_ID.
 * Never logs TELEGRAM_BOT_TOKEN or BRIDGE_HMAC_SECRET.
 *
 * R3: When calling the bridge, include both X-Beamix-Timestamp + X-Beamix-Signature.
 * HMAC input is: timestamp + "\n" + body (matches bridge verifyHmacSignature contract).
 */

import { z } from "zod";

interface TelegramBotEnv {
  TELEGRAM_BOT_TOKEN: string;
  ADAM_TELEGRAM_CHAT_ID: string;
  BRIDGE_INTERNAL_URL: string;
  BRIDGE_HMAC_SECRET: string;
  TELEGRAM_QUEUE_KV: KVNamespace;
}

const QUEUE_TTL_SECONDS = 7 * 24 * 3600; // 7 days

const TelegramUpdateSchema = z.object({
  update_id: z.number(),
  message: z.object({
    message_id: z.number(),
    from: z.object({ id: z.number() }),
    chat: z.object({ id: z.number() }),
    text: z.string().optional(),
    voice: z.object({ file_id: z.string() }).optional(),
  }).optional(),
});

// ---------------------------------------------------------------------------
// HMAC signer for internal bridge auth
// R3: HMAC input = timestamp + "\n" + body (matches bridge verifyHmacSignature)
// ---------------------------------------------------------------------------

async function signForBridge(
  body: string,
  timestampSeconds: string,
  secret: string
): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  // R3: HMAC over timestamp + "\n" + body
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${timestampSeconds}\n${body}`));
  return "sha256=" + Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------------------------------------------------------------------------
// Queue a Telegram message to KV fallback (when bridge is unreachable)
// ---------------------------------------------------------------------------

async function queueMessage(
  kv: KVNamespace,
  messageId: number,
  payload: unknown
): Promise<void> {
  const key = `telegram-queue:${messageId}`;
  await kv.put(key, JSON.stringify(payload), { expirationTtl: QUEUE_TTL_SECONDS });
}

// ---------------------------------------------------------------------------
// Forward update to bridge /telegram
// R3: include X-Beamix-Timestamp header + HMAC over timestamp+body
// ---------------------------------------------------------------------------

async function forwardToBridge(
  update: unknown,
  env: TelegramBotEnv
): Promise<{ ok: boolean; status: number }> {
  const body = JSON.stringify(update);
  // R3: timestamp in seconds (Unix epoch)
  const timestampSeconds = String(Math.floor(Date.now() / 1000));
  const signature = await signForBridge(body, timestampSeconds, env.BRIDGE_HMAC_SECRET);

  try {
    const resp = await fetch(`${env.BRIDGE_INTERNAL_URL}/telegram`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Beamix-Signature": signature,
        "X-Beamix-Timestamp": timestampSeconds,
        // Internal bot-to-bridge header so bridge can distinguish Telegram-bot-forwarded
        "X-Beamix-Source": "telegram-bot",
      },
      body,
    });
    return { ok: resp.ok, status: resp.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

// ---------------------------------------------------------------------------
// Worker fetch handler
// ---------------------------------------------------------------------------

export default {
  async fetch(request: Request, env: TelegramBotEnv): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ status: "ok", service: "beamix-telegram-bot" });
    }

    // Only accept POST /webhook (Telegram sends all updates here)
    if (request.method !== "POST" || url.pathname !== "/webhook") {
      return new Response(null, { status: 404 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      // Telegram always retries on non-200; return 200 to prevent retry loop
      return new Response(null, { status: 200 });
    }

    const updateResult = TelegramUpdateSchema.safeParse(body);
    if (!updateResult.success || !updateResult.data.message) {
      return new Response(null, { status: 200 }); // Telegram retries on non-200
    }

    const update = updateResult.data;
    const msg = update.message!;
    const chatId = String(msg.chat.id);
    const fromId = String(msg.from.id);

    // Only accept from Adam's chat
    if (fromId !== env.ADAM_TELEGRAM_CHAT_ID && chatId !== env.ADAM_TELEGRAM_CHAT_ID) {
      return new Response(null, { status: 200 }); // Silently drop non-Adam messages
    }

    // Attempt to forward to bridge
    const result = await forwardToBridge(body, env);

    if (!result.ok) {
      // Bridge unreachable or returned error — queue to KV holding queue
      await queueMessage(env.TELEGRAM_QUEUE_KV, update.update_id, body);

      // If bridge returned 503 (paused), notify Adam
      if (result.status === 503) {
        await notifyAdam(
          env,
          chatId,
          "[bridge] Bridge is soft-paused (Anthropic outage). Message queued (7d TTL). Will retry when bridge resumes."
        );
      }
      // For other failures (network, etc.) — silently queue; no notification spam
    }

    // Always return 200 to Telegram to prevent retry
    return new Response(null, { status: 200 });
  },
};

async function notifyAdam(env: TelegramBotEnv, chatId: string, text: string): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch {
    // Fire-and-forget — do not throw
  }
}

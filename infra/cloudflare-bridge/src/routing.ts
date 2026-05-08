/**
 * Routing table for the Beamix bridge.
 *
 * LINEAR_LABEL_TO_ROUTINE maps agent: labels (and decision_type: labels) to
 * Anthropic Routine IDs. Adam fills in the actual Routine IDs at deploy time.
 *
 * Tier semantics (from ORCHESTRATION.md §2A):
 *   tier:quick  — CEO spawns a worker via Task in same session (1 fire)
 *   tier:lite   — CEO fires the relevant C-suite (2 fires)
 *   tier:full   — CEO fans out to N C-suite; Inngest fan-in; CEO re-fires for synth (3-5 fires)
 */

// Placeholder Routine ID constant — Adam replaces with real IDs from Anthropic Console
const PLACEHOLDER_ROUTINE_ID = "PLACEHOLDER_ROUTINE_ID";

/**
 * Maps Linear agent: labels to Anthropic Routine IDs.
 * Also handles board-meeting routing (decision_type: label).
 */
export const LINEAR_LABEL_TO_ROUTINE: Record<string, string> = {
  // Standing Routines (10 total — per ORCHESTRATION.md §2E)
  "agent:ceo":                  PLACEHOLDER_ROUTINE_ID, // CEO Entry-point
  "agent:morning-digest":       PLACEHOLDER_ROUTINE_ID, // Morning Digest (cron — use for manual fire)
  "agent:eod-sync":             PLACEHOLDER_ROUTINE_ID, // EOD Sync (cron)
  "agent:auto-unblock":         PLACEHOLDER_ROUTINE_ID, // Auto-Unblock
  "agent:monday-standup":       PLACEHOLDER_ROUTINE_ID, // Monday Standup (cron)
  "agent:friday-retro":         PLACEHOLDER_ROUTINE_ID, // Friday Retro (cron)
  "agent:competitor-signal":    PLACEHOLDER_ROUTINE_ID, // Competitor Signal (cron)
  "agent:customer-voice":       PLACEHOLDER_ROUTINE_ID, // Customer Voice Signal (cron)
  "agent:geo-algorithm":        PLACEHOLDER_ROUTINE_ID, // GEO Algorithm Signal (cron)
  "agent:synthesizer":          PLACEHOLDER_ROUTINE_ID, // Synthesizer (on-demand, board meetings)

  // C-suite Routines (individual agents; routes CEO sub-tickets)
  "agent:cto":                  PLACEHOLDER_ROUTINE_ID,
  "agent:cmo":                  PLACEHOLDER_ROUTINE_ID,
  "agent:cpo":                  PLACEHOLDER_ROUTINE_ID,
  "agent:cbo":                  PLACEHOLDER_ROUTINE_ID,
  "agent:cco":                  PLACEHOLDER_ROUTINE_ID,
  "agent:qa-lead":              PLACEHOLDER_ROUTINE_ID,

  // Board-meeting persona routing (per ORCHESTRATION.md §2F Q7)
  // decision_type:vendor → Aria persona (procurement-grade reviewer)
  "decision_type:vendor":       PLACEHOLDER_ROUTINE_ID,
  // decision_type:strategic → broad-Adversary persona (strongest critic)
  "decision_type:strategic":    PLACEHOLDER_ROUTINE_ID,

  // Board meeting trigger label
  "board-meeting":              PLACEHOLDER_ROUTINE_ID, // fires CEO with synth-only spec
};

/**
 * Maps the per-Routine env var name to look up in the Worker env.
 * Used by the bridge to select the correct bearer token for /fire.
 *
 * // FOLLOW-UP (WS6): split into per-Routine bearer tokens (ROUTINE_CTO_TOKEN,
 * // ROUTINE_CMO_TOKEN, etc.) when 10 Anthropic Routines are provisioned.
 * // Current shared-token model has revoke-blast-radius risk documented in
 * // WS4-CRITIQUE-AND-REVISIONS.md R5 Q4.
 */
export const ROUTINE_TOKEN_ENV_KEY: Record<string, keyof BridgeEnv> = {
  "agent:ceo":                  "ROUTINE_CEO_ENTRY_POINT_TOKEN",
  "agent:morning-digest":       "ROUTINE_MORNING_DIGEST_TOKEN",
  "agent:eod-sync":             "ROUTINE_EOD_SYNC_TOKEN",
  "agent:auto-unblock":         "ROUTINE_AUTO_UNBLOCK_TOKEN",
  "agent:monday-standup":       "ROUTINE_MONDAY_STANDUP_TOKEN",
  "agent:friday-retro":         "ROUTINE_FRIDAY_RETRO_TOKEN",
  "agent:competitor-signal":    "ROUTINE_COMPETITOR_SIGNAL_TOKEN",
  "agent:customer-voice":       "ROUTINE_CUSTOMER_VOICE_SIGNAL_TOKEN",
  "agent:geo-algorithm":        "ROUTINE_GEO_ALGORITHM_SIGNAL_TOKEN",
  "agent:synthesizer":          "ROUTINE_SYNTHESIZER_TOKEN",
  // C-suite agents share CEO token until WS6 per-Routine split (see FOLLOW-UP above)
  "agent:cto":                  "ROUTINE_CEO_ENTRY_POINT_TOKEN",
  "agent:cmo":                  "ROUTINE_CEO_ENTRY_POINT_TOKEN",
  "agent:cpo":                  "ROUTINE_CEO_ENTRY_POINT_TOKEN",
  "agent:cbo":                  "ROUTINE_CEO_ENTRY_POINT_TOKEN",
  "agent:cco":                  "ROUTINE_CEO_ENTRY_POINT_TOKEN",
  "agent:qa-lead":              "ROUTINE_CEO_ENTRY_POINT_TOKEN",
  "decision_type:vendor":       "ROUTINE_SYNTHESIZER_TOKEN",
  "decision_type:strategic":    "ROUTINE_SYNTHESIZER_TOKEN",
  "board-meeting":              "ROUTINE_CEO_ENTRY_POINT_TOKEN",
};

/**
 * Valid Anthropic Routine tiers.
 */
export type RoutineTier = "quick" | "lite" | "full";

/**
 * Parses tier label from a list of Linear issue labels.
 * Returns null if no tier label is present (caller must classify via Haiku).
 */
export function parseTierLabel(labels: string[]): RoutineTier | null {
  if (labels.includes("tier:quick")) return "quick";
  if (labels.includes("tier:lite")) return "lite";
  if (labels.includes("tier:full")) return "full";
  return null;
}

/**
 * Finds the first agent: or decision_type: routing label from a list of labels.
 * Returns null if none found.
 */
export function findRoutingLabel(labels: string[]): string | null {
  const routingPrefixes = ["agent:", "decision_type:", "board-meeting"];
  for (const label of labels) {
    if (routingPrefixes.some((p) => label.startsWith(p) || label === p)) {
      return label;
    }
  }
  return null;
}

/**
 * Bridge environment bindings type — mirrors wrangler.toml secrets + KV + DO.
 * Matches what Cloudflare injects into the Worker fetch handler.
 */
export interface BridgeEnv {
  // KV namespace
  BRIDGE_STATE_KV: KVNamespace;

  // Durable Object namespaces
  ROUTINE_LOCK: DurableObjectNamespace;
  // R2: FireCountDO for atomic per-day fire cap (replaces non-atomic KV get/put)
  FIRE_COUNT_DO: DurableObjectNamespace;

  // Secrets (injected via wrangler secret put)
  BRIDGE_HMAC_SECRET: string;
  LINEAR_WEBHOOK_SECRET: string;
  ANTHROPIC_API_KEY: string;
  LINEAR_API_KEY: string;

  // Per-Routine bearer tokens
  ROUTINE_CEO_ENTRY_POINT_TOKEN: string;
  ROUTINE_MORNING_DIGEST_TOKEN: string;
  ROUTINE_EOD_SYNC_TOKEN: string;
  ROUTINE_AUTO_UNBLOCK_TOKEN: string;
  ROUTINE_MONDAY_STANDUP_TOKEN: string;
  ROUTINE_FRIDAY_RETRO_TOKEN: string;
  ROUTINE_COMPETITOR_SIGNAL_TOKEN: string;
  ROUTINE_CUSTOMER_VOICE_SIGNAL_TOKEN: string;
  ROUTINE_GEO_ALGORITHM_SIGNAL_TOKEN: string;
  ROUTINE_SYNTHESIZER_TOKEN: string;

  // Allowlist
  ALLOWED_ISSUERS: string; // comma-separated Linear user IDs

  // Channel secrets
  SHORTCUT_SECRET: string;
  TELEGRAM_BOT_TOKEN: string;
  ADAM_TELEGRAM_CHAT_ID: string;

  // Supabase (service-role — server-side only, never exposed to client)
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

/**
 * Telegram @mention → agent label routing matrix.
 * Matches the WS2 §2A routing matrix for Telegram-sourced messages.
 *
 * R6: @board added → routes to agent:synthesizer (was missing from map, present in CONNECTIONS.md §C).
 *
 * Note: matching uses word-boundary regex (^(@[a-z-]+)\b) in index.ts handleTelegram,
 * not startsWith — prevents "@cto-something" matching "@cto".
 */
export const TELEGRAM_MENTION_TO_LABEL: Record<string, string> = {
  "@ceo":       "agent:ceo",
  "@cto":       "agent:cto",
  "@cmo":       "agent:cmo",
  "@cpo":       "agent:cpo",
  "@cbo":       "agent:cbo",
  "@cco":       "agent:cco",
  "@qa":        "agent:qa-lead",
  "@synth":     "agent:synthesizer",
  "@retro":     "agent:friday-retro",
  "@unblock":   "agent:auto-unblock",
  "@board":     "agent:synthesizer", // R6: board meeting via Telegram → Synthesizer Routine
};

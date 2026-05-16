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
 *
 * WS6 Phase 6C cleanup (2026-05-13):
 *   - Stripped Q8: agent:ceo, agent:cmo, agent:cpo, agent:cbo, agent:cco,
 *     agent:cto, agent:qa-lead, agent:customer-voice (all dropped per
 *     ROUTINE-ROSTER — Adam runs CEO interactively; C-suite never landed).
 *   - Renamed: agent:competitor-signal → agent:competitor-pulse (matches
 *     scaffold name; old env vars deprecated).
 *   - Added: agent:advisor, agent:cto-daily-plan, agent:content-idea,
 *     agent:security-watcher (Q11 NEW).
 *   - Personas (visionary/architect/strategist/aria) and workers
 *     (parallel-*) are NOT Routines (Q13) — no entries here.
 *   - board-meeting label + decision_type:* now fire SYNTHESIZER directly
 *     (Q14): the Synthesizer Routine owns the board-meeting protocol;
 *     CEO Routine is dropped from this path.
 *   - Per-Routine bearer tokens (Q4 follow-up resolved): every Routine
 *     has its own ROUTINE_<NAME>_TOKEN. No shared-CEO-token blast radius.
 */

// Placeholder Routine ID constant — Adam replaces with real IDs from Anthropic Console
const PLACEHOLDER_ROUTINE_ID = "PLACEHOLDER_ROUTINE_ID";

/**
 * Maps Linear agent: labels to Anthropic Routine IDs.
 * Also handles board-meeting routing (decision_type: label).
 *
 * NOTE: This map is documentation-only — the runtime reads from BridgeEnv
 * via ROUTINE_ID_ENV_KEY below. Keep this list in sync with the 12-Routine
 * roster in `.claude/agents/war-room/INDEX.md`.
 */
export const LINEAR_LABEL_TO_ROUTINE: Record<string, string> = {
  // 12 standing Routines (per `.claude/agents/war-room/INDEX.md`, locked 2026-05-12)
  "agent:advisor":              PLACEHOLDER_ROUTINE_ID, // Advisor Daily Thinking
  "agent:morning-digest":       PLACEHOLDER_ROUTINE_ID, // Morning Digest
  "agent:competitor-pulse":     PLACEHOLDER_ROUTINE_ID, // Competitor Pulse (renamed from competitor-signal)
  "agent:geo-algorithm":        PLACEHOLDER_ROUTINE_ID, // GEO Algorithm Signal
  "agent:cto-daily-plan":       PLACEHOLDER_ROUTINE_ID, // CTO Daily Plan
  "agent:content-idea":         PLACEHOLDER_ROUTINE_ID, // Content Idea Generator
  "agent:monday-standup":       PLACEHOLDER_ROUTINE_ID, // Monday Standup
  "agent:friday-retro":         PLACEHOLDER_ROUTINE_ID, // Friday Retro
  "agent:eod-sync":             PLACEHOLDER_ROUTINE_ID, // EOD Sync
  "agent:security-watcher":     PLACEHOLDER_ROUTINE_ID, // Security Watcher (Q11 NEW)
  "agent:auto-unblock":         PLACEHOLDER_ROUTINE_ID, // Auto-Unblock
  "agent:synthesizer":          PLACEHOLDER_ROUTINE_ID, // Synthesizer (event-triggered)

  // Board-meeting routing — all fire Synthesizer directly (Q14)
  "board-meeting":              PLACEHOLDER_ROUTINE_ID, // → Synthesizer
  "decision_type:vendor":       PLACEHOLDER_ROUTINE_ID, // → Synthesizer (Aria persona invoked by Synthesizer)
  "decision_type:strategic":    PLACEHOLDER_ROUTINE_ID, // → Synthesizer
};

/**
 * Maps a Linear routing label to the Worker-env var name holding the
 * Anthropic Routine ID (trig_<id>). Adam sets these via `wrangler secret put`
 * once the Routines are provisioned in claude.ai.
 *
 * Labels not in this map (or whose env var is unset) cause handleIssueCreated
 * to log a "[bridge] no routine ID configured for label=..." and return
 * ignored:true — never silently 200 with no audit_log.
 *
 * Per-Routine bearer tokens locked 2026-05-12 (Q4 follow-up resolved):
 * every Routine has its own ROUTINE_<NAME>_TOKEN — no shared-CEO-token.
 */
export const ROUTINE_ID_ENV_KEY: Record<string, keyof BridgeEnv> = {
  "agent:advisor":              "ROUTINE_ADVISOR_DAILY_THINKING_ID",
  "agent:morning-digest":       "ROUTINE_MORNING_DIGEST_ID",
  "agent:competitor-pulse":     "ROUTINE_COMPETITOR_PULSE_ID",
  "agent:geo-algorithm":        "ROUTINE_GEO_ALGORITHM_SIGNAL_ID",
  "agent:cto-daily-plan":       "ROUTINE_CTO_DAILY_PLAN_ID",
  "agent:content-idea":         "ROUTINE_CONTENT_IDEA_GENERATOR_ID",
  "agent:monday-standup":       "ROUTINE_MONDAY_STANDUP_ID",
  "agent:friday-retro":         "ROUTINE_FRIDAY_RETRO_ID",
  "agent:eod-sync":             "ROUTINE_EOD_SYNC_ID",
  "agent:security-watcher":     "ROUTINE_SECURITY_WATCHER_ID",
  "agent:auto-unblock":         "ROUTINE_AUTO_UNBLOCK_ID",
  "agent:synthesizer":          "ROUTINE_SYNTHESIZER_ID",

  // Board-meeting → Synthesizer (Q14: @board comment handler also fires this Routine)
  "board-meeting":              "ROUTINE_SYNTHESIZER_ID",
  "decision_type:vendor":       "ROUTINE_SYNTHESIZER_ID",
  "decision_type:strategic":    "ROUTINE_SYNTHESIZER_ID",
};

/**
 * Resolves the Anthropic Routine ID for a Linear routing label by reading
 * env at request time. Returns null if the label has no mapping or the
 * env var is unset/empty — caller logs and returns ignored:true.
 */
export function resolveRoutineId(label: string, env: BridgeEnv): string | null {
  const envKey = ROUTINE_ID_ENV_KEY[label];
  if (!envKey) return null;
  const value = env[envKey];
  if (typeof value !== "string" || value.length === 0) return null;
  return value;
}

/**
 * Maps the per-Routine env var name to look up in the Worker env.
 * Used by the bridge to select the correct bearer token for /fire.
 *
 * Q4 follow-up RESOLVED 2026-05-12 — every Routine has its own bearer token.
 * No shared-CEO-token. Revoking one Routine's token does not blast-radius
 * to any other Routine.
 */
export const ROUTINE_TOKEN_ENV_KEY: Record<string, keyof BridgeEnv> = {
  "agent:advisor":              "ROUTINE_ADVISOR_DAILY_THINKING_TOKEN",
  "agent:morning-digest":       "ROUTINE_MORNING_DIGEST_TOKEN",
  "agent:competitor-pulse":     "ROUTINE_COMPETITOR_PULSE_TOKEN",
  "agent:geo-algorithm":        "ROUTINE_GEO_ALGORITHM_SIGNAL_TOKEN",
  "agent:cto-daily-plan":       "ROUTINE_CTO_DAILY_PLAN_TOKEN",
  "agent:content-idea":         "ROUTINE_CONTENT_IDEA_GENERATOR_TOKEN",
  "agent:monday-standup":       "ROUTINE_MONDAY_STANDUP_TOKEN",
  "agent:friday-retro":         "ROUTINE_FRIDAY_RETRO_TOKEN",
  "agent:eod-sync":             "ROUTINE_EOD_SYNC_TOKEN",
  "agent:security-watcher":     "ROUTINE_SECURITY_WATCHER_TOKEN",
  "agent:auto-unblock":         "ROUTINE_AUTO_UNBLOCK_TOKEN",
  "agent:synthesizer":          "ROUTINE_SYNTHESIZER_TOKEN",

  // Board-meeting tokens reuse Synthesizer's token
  "board-meeting":              "ROUTINE_SYNTHESIZER_TOKEN",
  "decision_type:vendor":       "ROUTINE_SYNTHESIZER_TOKEN",
  "decision_type:strategic":    "ROUTINE_SYNTHESIZER_TOKEN",
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
 *
 * Linear label-group support: when a label is in a Group called "agent" with
 * leaf name "advisor", Linear's webhook returns the bare leaf ("advisor"),
 * not "agent:advisor". This function reconstructs the canonical routing label
 * by checking if a bare leaf matches a known "agent:<leaf>" route, and returns
 * the canonical form.
 */
export function findRoutingLabel(labels: string[]): string | null {
  const routingPrefixes = ["agent:", "decision_type:", "board-meeting"];
  for (const label of labels) {
    if (routingPrefixes.some((p) => label.startsWith(p) || label === p)) {
      return label;
    }
    // Linear label-group fallback: bare leaf name → "agent:<leaf>" if known.
    const canonical = `agent:${label}`;
    if (canonical in ROUTINE_ID_ENV_KEY) {
      return canonical;
    }
    // decision_type group fallback (e.g. "vendor" → "decision_type:vendor")
    const decisionCanonical = `decision_type:${label}`;
    if (decisionCanonical in ROUTINE_ID_ENV_KEY) {
      return decisionCanonical;
    }
  }
  return null;
}

/**
 * Detects `@board` mention in a Linear comment body (Q14).
 * Returns the routing label to fire if `@board` is present, null otherwise.
 *
 * Word-boundary match — prevents "@board-foo" or "boardgame" false-positives.
 */
export function detectBoardCommand(commentBody: string): string | null {
  if (!commentBody) return null;
  // Word-boundary regex: @board followed by whitespace, punctuation, or end of string
  if (/(^|\s)@board(\s|$|[.,!?;:])/i.test(commentBody)) {
    return "agent:synthesizer";
  }
  return null;
}

/**
 * Bridge environment bindings type — mirrors wrangler.toml secrets + KV + DO.
 * Matches what Cloudflare injects into the Worker fetch handler.
 *
 * WS6 6C: BridgeEnv updated to reflect the 12-Routine roster locked 2026-05-12.
 * Removed: ROUTINE_CEO_ENTRY_POINT_*, ROUTINE_CUSTOMER_VOICE_SIGNAL_*.
 * (Note: ROUTINE_CEO_ENTRY_POINT_* may still exist in wrangler secrets from
 * WS4 deploy. They are harmless — declared optional + the bridge never reads
 * them now that no routing entry points to them.)
 *
 * Added: ROUTINE_ADVISOR_DAILY_THINKING_*, ROUTINE_CTO_DAILY_PLAN_*,
 * ROUTINE_CONTENT_IDEA_GENERATOR_*, ROUTINE_SECURITY_WATCHER_*,
 * ROUTINE_COMPETITOR_PULSE_* (renamed from COMPETITOR_SIGNAL).
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

  // Per-Routine bearer tokens (12 standing Routines — Q4 split locked 2026-05-12)
  ROUTINE_ADVISOR_DAILY_THINKING_TOKEN: string;
  ROUTINE_MORNING_DIGEST_TOKEN: string;
  ROUTINE_COMPETITOR_PULSE_TOKEN: string;
  ROUTINE_GEO_ALGORITHM_SIGNAL_TOKEN: string;
  ROUTINE_CTO_DAILY_PLAN_TOKEN: string;
  ROUTINE_CONTENT_IDEA_GENERATOR_TOKEN: string;
  ROUTINE_MONDAY_STANDUP_TOKEN: string;
  ROUTINE_FRIDAY_RETRO_TOKEN: string;
  ROUTINE_EOD_SYNC_TOKEN: string;
  ROUTINE_SECURITY_WATCHER_TOKEN: string;
  ROUTINE_AUTO_UNBLOCK_TOKEN: string;
  ROUTINE_SYNTHESIZER_TOKEN: string;

  // Per-Routine Anthropic Routine IDs (trig_<id> values from claude.ai Routines page).
  // Set via `wrangler secret put ROUTINE_<NAME>_ID`. Empty/unset → label silently
  // ignored at handleIssueCreated / handleCommentCreated (with a [bridge] log line).
  ROUTINE_ADVISOR_DAILY_THINKING_ID?: string;
  ROUTINE_MORNING_DIGEST_ID?: string;
  ROUTINE_COMPETITOR_PULSE_ID?: string;
  ROUTINE_GEO_ALGORITHM_SIGNAL_ID?: string;
  ROUTINE_CTO_DAILY_PLAN_ID?: string;
  ROUTINE_CONTENT_IDEA_GENERATOR_ID?: string;
  ROUTINE_MONDAY_STANDUP_ID?: string;
  ROUTINE_FRIDAY_RETRO_ID?: string;
  ROUTINE_EOD_SYNC_ID?: string;
  ROUTINE_SECURITY_WATCHER_ID?: string;
  ROUTINE_AUTO_UNBLOCK_ID?: string;
  ROUTINE_SYNTHESIZER_ID?: string;

  // Legacy CEO Entry Point — provisioned during WS4, kept declared for backwards
  // compatibility. NOT mapped to any routing label after WS6 6C. Safe to leave
  // the wrangler secret set; it just won't be read.
  ROUTINE_CEO_ENTRY_POINT_ID?: string;
  ROUTINE_CEO_ENTRY_POINT_TOKEN?: string;

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
 *
 * WS6 6C cleanup: dropped @ceo / @cto / @cmo / @cpo / @cbo / @cco / @qa
 * (Routines were dropped per Q8). Adam routes those tickets interactively.
 *
 * Kept: @board (R6) and @retro / @unblock / @synth (still useful as Telegram
 * shortcuts for the matching Routines). Added @advisor and @plan as shortcuts
 * to Advisor + CTO Daily Plan respectively.
 */
export const TELEGRAM_MENTION_TO_LABEL: Record<string, string> = {
  "@advisor":   "agent:advisor",
  "@plan":      "agent:cto-daily-plan",
  "@synth":     "agent:synthesizer",
  "@retro":     "agent:friday-retro",
  "@unblock":   "agent:auto-unblock",
  "@board":     "agent:synthesizer", // R6: board meeting via Telegram → Synthesizer Routine
};

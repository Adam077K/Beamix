# WS2 — Critique Synthesis & Required Revisions

**Status:** PROPOSED — pending Adam review
**Date:** 2026-05-06
**Source:** 6 Sonnet critics in parallel, each owning a slice of WS2 with adversarial framing
**Effect on WS2:** Cannot ship as "locked" until revisions accepted. Several decisions need rework, one needs a smoke-test before lock.

---

## TL;DR — verdict in three sentences

**The architecture is directionally right, the contracts are not.** §2A spawning hierarchy and §2C "Inngest stays" survive intact. §2B (chaining), §2D (trust), §2E (Routines), §2F (board), §2G (observability) all have load-bearing flaws — most notably: an architectural error in observability (disler doesn't work for cloud Routines), security gaps in the trust contract (issuer authority is convention-only), and a circular cost model that rests on an unverified claim about cron exemption from the 15/day cap.

---

## How to read this doc

For each cluster, you'll see:
1. **Critics:** which of the 6 raised it
2. **Severity-stacked findings**
3. **Required revision** to ORCHESTRATION.md
4. **Whether revision needs Adam input or can be made unilaterally**

Then the **net new work** that has to happen before WS3/WS4 starts.

The full critique files are at `docs/08-agents_work/2026-05-06-agent-build/CRITIQUE-WS2-*.md` — read them if you want the deep evidence; this doc is the actionable synthesis.

---

## Cluster 1 — Verified-not-real assumptions (the biggest threat)

**Critics:** 1, 2, 6
**Severity:** All HIGH/HIGH

| Assumption (load-bearing) | Reality | Where it sits in ORCHESTRATION.md |
|---|---|---|
| **"Cron Routines exempt from 15/day cap"** | Sourced from a 9to5Mac news article, not Anthropic docs. WS2 §2E AND §Open Q6 both reference this — once as settled fact, once as open question. | §2E header note + §Open Q6 |
| **"Cloudflare bridge already exists"** | It does NOT. WS4 builds it. §2B's justification for Option ii is circular. | §2B "Why it won" section |
| **"Mem0 MCP available to all Routines"** | WS1A locked Mem0 but Phase 1 smoke-test was not run (was deferred to WS1B which Adam marked "consider it done"). MCP issue #3400 is a real production blocker. If Phase 1 fails, every `mem0` MCP grant in §2E table is wrong. | §2E MCP grants column |

**Required revision:**
- **R1.1** — Insert a Pre-Lock Smoke Tests section into ORCHESTRATION.md. Three tests, each ≤1hr, ≤$2 cost:
  - Test A: Fire 16 cron Routines in 24h on Adam's Max plan; observe whether the 16th is rejected with 429. Verifies cron exemption.
  - Test B: Fire 16 ad-hoc `/fire` calls in 24h; observe daily cap behavior. Verifies cap and `Retry-After` granularity.
  - Test C: Wire `mcp.mem0.ai/mcp` to one Claude Code subagent and exercise issue #3400 reproduction (40 round-trips with Mem0 calls). Verifies Phase 1 viability.
- **R1.2** — Mark §2B Option (ii) "winner pending Test A+B" — rewrite the justification to say "preferred, contingent on smoke-tests R1.1."
- **R1.3** — Add a "WS2 dependencies" subsection to §2E that explicitly lists: "All MCP grants listed assume WS1B Phase 1 (Mem0 cloud) succeeds. If Phase 1 fails, MCP grants must be revised to Anthropic Memory Tool fallback."

**Adam input needed?** No — these are unilateral revisions. But **R1.1 smoke-tests must happen before WS3/WS4.**

---

## Cluster 2 — Concurrency & race conditions (chaining + fan-in)

**Critics:** 1, 2, 3
**Severity:** Multiple HIGH

| Race | What breaks | Where |
|---|---|---|
| **KV eventual consistency × Linear 60s retry** | Cloudflare KV can serve stale cache for up to 60s across regions. Linear's first retry fires at T+60s — exactly within propagation. Two Workers in different regions both miss the dedup → two `/fire` calls → two parallel CTO sessions on the same ticket. | §2B "Idempotency story" |
| **Vercel 60s timeout × Inngest retry** | An Inngest `step.run` that calls Anthropic `/fire` and waits for HTTP response can exceed Vercel's 60s function limit. 504 → Inngest retries → second `/fire` (KV dedup misses because it's a new request, no Linear webhook to dedup against). | §2C primitives |
| **Fan-in barrier on reopen/delete/manual-close** | Inngest watcher counts `linear/issue.updated` with status=Done. If a sub-ticket is reopened, the count is now wrong. If Adam manually closes one as "no-op," synth fires prematurely with no completion data. If a sub-ticket is deleted, the watcher hangs forever. | §2C `fan-in-watcher` |
| **Fan-in trusts any Linear status change** | The watcher doesn't bind sub-ticket completion to the expected Routine session ID. Anyone (including Adam, including a poisoned comment) closing the sub-ticket triggers the synth fire. | §2B + §2C |
| **Sequential worker state passing** | code-reviewer needs backend-engineer's worktree path. Workers don't spawn anything (correct), but the parent (CTO) has to pass state. The mechanism is unspecified. Pushed to WS6 without flagging it as a constraint WS6 must satisfy. | §2A anti-bureaucracy |

**Required revision:**
- **R2.1** — §2B "Idempotency story" must lift dedup OUT of KV alone. Two-layer dedup: (a) KV ticket-scoped dedup (24h TTL) + (b) Cloudflare Durable Object lock per `routine_id:linear_ticket` keyed pair (strongly consistent). Acknowledge Durable Objects is paid (Workers Paid plan $5/mo — first time we exit free tier on Cloudflare; explicit BOM line).
- **R2.2** — §2C must spec the Vercel-Inngest interaction: every `step.run` that calls `/fire` is **fire-and-forget** (no inline await on Routine completion). Routine completion is detected via Linear webhook → Inngest event, NOT by polling inside the step. Add this rule explicitly.
- **R2.3** — §2C `fan-in-watcher` must bind sub-ticket completion to a `session_id` written into the sub-ticket's first comment by the CTO Routine on session start. Watcher checks: status==Done **AND** comment chain contains valid `session_id` matching KV-stored expected session. Reopen/delete/manual-close → watcher emits BLOCKED + escalates instead of synthesizing.
- **R2.4** — §2A must add a "State passing between sequential workers" subsection: parent main-thread Routine (CTO/etc.) is responsible for thread-state. Workers return JSON with `worktree_path`, `branch`, `files_changed`. Parent passes the previous worker's output as part of the next worker's brief. WS6 must enforce this in worker .md files.

**Adam input needed?** Cloudflare Workers Paid plan ($5/mo) is the only material change — adds $5/mo to BOM. This is your call, but technically the cheapest fix.

---

## Cluster 3 — Trust mechanism is convention, not enforcement (security)

**Critics:** 1, 3
**Severity:** 8 HIGH from security-engineer alone — and one of these is the QA-Lead bypass

| Vulnerability | Attack | Severity |
|---|---|---|
| **Issuer authority is plain JSON** | Attacker writes Linear comment with `"issued_by": {"kind": "adam"}` — agent trusts it. No HMAC, no Linear user-ID allowlist, no signature. | H/H |
| **Prompt injection via ticket body** | Customer email pasted into Linear contains a JSON spec block. 30-line parser extracts it as a valid trust spec. | H/H |
| **`skip_pre_flight: ["CLAUDE.md"]`** | CLAUDE.md is the *constraint document* (no secrets, Layer Contract, hard rules). Skipping it removes the safety wrapper. | H/H |
| **No nonce/expires_at = replay** | A valid spec from yesterday gets re-injected as a new comment. KV dedup is ticket-scoped, not spec-scoped. | H/H |
| **Empty `out_of_scope` is unbounded** | `out_of_scope: []` = anything goes. Sub-spec derivation by CEO (an LLM) doesn't technically narrow parent scope. | H/H |
| **Agent writes own audit row** | Crash mid-task = no audit row. Compromised agent = erased trail. | H/H |
| **`max_cost_usd` self-monitored** | A buggy agent ignoring its own cap burns up to the $1,500/mo Anthropic account hard cap before being stopped. | H/H |
| **QA-Lead BLOCK is prompt-only** | CTO Routine has GitHub MCP. One call to `mcp__github__merge_pull_request` bypasses QA-Lead entirely. The "CEO and CTO cannot override BLOCK" rule has no mechanical enforcement. | H/H |

**Required revision (rewrite §2D and add §2A enforcement subsection):**
- **R3.1** — Issuer verification at the **bridge** (Cloudflare Worker), not at the agent. Bridge looks up `comment.user.id` against an env-var allowlist (`ALLOWED_ISSUERS_ADAM`, `ALLOWED_ISSUERS_AGENTS`). Spec rejected at bridge if author not in allowlist. Bridge HMAC-signs the spec before injecting into `/fire` body. Receiving agent verifies HMAC.
- **R3.2** — Trust specs ONLY accepted from comments authored by allowlisted users (Adam personally + per-Routine bot accounts). Ticket bodies are NEVER parsed as spec sources. Add `---BEAMIX-SPEC-V1---` sentinel + JSON block as the only legal trust-spec format.
- **R3.3** — Block `CLAUDE.md` and `AGENTS.md` from `skip_pre_flight` in the Zod schema. (Probably remove the field entirely — pre-flight is short; the cost saving isn't worth the attack surface.)
- **R3.4** — Add `nonce: uuid-v4` (required) and `expires_at` (default 30m for Quick, 4h for Lite, 24h for Full). Bridge stores nonces in KV/Durable Object; second use rejected.
- **R3.5** — `out_of_scope` is `min(1)` — at least one constraint required. Bridge enforces (arithmetic, not LLM-judged) that child spec's `out_of_scope ⊇ parent's`. Same for `max_cost_usd ≤ remaining_parent_budget`.
- **R3.6** — Audit log written by **bridge at dispatch** (status=`fired`), updated by agent at start (status=`accepted`), updated by Inngest watcher on completion or timeout (status=`done | timeout | over_budget`). Three writers, no single point of erasure.
- **R3.7** — `max_cost_usd` enforced platform-side. Helicone proxy becomes **mandatory** for Routine sessions (not optional). Inngest watcher polls `claude_progress.cost_usd`; if accrued cost exceeds `max_cost_usd × 1.2`, watcher fires kill-session via Anthropic API (not yet documented — fallback: yank the per-Routine bearer token).
- **R3.8 — QA-Lead enforcement is structural, not prompt-based.** Two changes: (a) C-suite Routines do NOT have `mcp__github__merge_pull_request` in their MCP grants; only QA-Lead does. (b) Branch protection on `main` requires GitHub Action `qa-lead-pass` check. Even if a Routine could call merge, GitHub blocks it.

**Adam input needed?** None — these are all engineering enforcements. R3.7 (mandatory Helicone) means BOM line is non-optional ($0 free tier still, but no longer "deferred until Q2 gets noisy").

---

## Cluster 4 — Cost model is wrong in two directions

**Critics:** 2, 4, 5
**Severity:** HIGH

| Claim | Real cost | Source critic |
|---|---|---|
| **Routines: $5-15/mo total** | $40-96/mo at stated caps; $25-30/mo realistic | Critic 2 (math), Critic 5 (per-call reality) |
| **Board meetings: $10/meeting cap** | $0.45/meeting realistic — cap is 22x over | Critic 4 |
| **Helicone optional for cost tracking** | Helicone is **mandatory** — without it, `audit_log.cost_usd` is NULL and "cost by ticket" doesn't work | Critic 5 |
| **Total observability $0** | $0 today, but disler doesn't work for cloud Routines (see Cluster 5), so the real cost story is hidden | Critic 5 |
| **Total infrastructure $5-15/mo new spend** | $20-27/mo of $100 Max budget consumed by infra alone, leaving $73-80 for product Anthropic spend | Critic 5 |

**Required revision:**
- **R4.1** — Replace "$5-15/mo" claim in §2E with a derived budget table. Formula: `caps × realistic frequency × cache-warm vs cache-miss split`. Show the math in the doc. Honest number: $25-30/mo Routines + $1.80/mo board meetings + $0 Inngest (free tier, headroom verified) + $5/mo Cloudflare Workers Paid (if R2.1 accepted) = **$30-40/mo new infrastructure** in addition to existing $155/mo product stack.
- **R4.2** — §2F board-meeting cap dropped from $10 to $3/meeting. 4/mo × $3 = $12/mo board ceiling. Increase the 4/mo cap to **8/mo** (we're under-using the deliberation tool because we set the wrong ceiling).
- **R4.3** — §2G — Helicone is moved from "optional" to "required for cost tracking." Add the 1 env var change to §2G implementation order, top of the list.
- **R4.4** — Add a "Total monthly war-room spend" table at the end of ORCHESTRATION.md, summing all line items across §2C/§2E/§2F/§2G. Reconcile against V4 env map's "$0-11/mo new spend" claim. **Spoiler: V4's $0-11/mo is wrong — actual is $30-40/mo.** This needs Adam decision: accept the higher number, or cut something (drop a Routine, reduce `$-cap`s, etc.).

**Adam input needed?** YES on R4.4. The V4 cost ceiling was $0-11/mo. WS2 reveals real cost is $30-40/mo. **Accept the higher number, or cut scope?**

---

## Cluster 5 — Observability has an architectural error

**Critics:** 5
**Severity:** HIGH/HIGH

The doc says disler hooks dashboard captures Anthropic Routine activity. **It cannot.** Disler hooks fire against `localhost:4000`. Anthropic cloud Routine containers cannot reach `localhost:4000` on Adam's Bastion. Even with Tailscale, the Anthropic container isn't on the Tailnet.

This means: **disler only captures Bastion-local Claude Code dev sessions.** For the production war-room (the 9 Routines + cross-Routine flows triggered by Linear webhooks), the **only** observability is the `/war-room` Next.js page reading from Supabase `audit_log` + `claude_progress`.

**Required revision (rewrite §2G):**
- **R5.1** — Restructure §2G into two distinct surfaces:
  - **A. Production observability** (always-on, captures cloud Routines): `/war-room` Next.js page on Vercel + mandatory Helicone proxy + Supabase `audit_log` + `claude_progress`. This is the war room's live observability.
  - **B. Dev observability** (Bastion-local, captures Adam's interactive Claude Code sessions): disler dashboard. Useful for debugging local agent behavior, NOT for production runs.
- **R5.2** — Remove disler from the mandatory stack. Mark it "nice-to-have for local dev sessions."
- **R5.3** — Add an alerting layer:
  - Inngest scheduled function `cost-watchdog` runs hourly. Reads `audit_log` rolling 1-hour cost. If cost > $5/hr threshold (8x normal), Telegram alert to Adam.
  - Inngest function `runaway-watcher` fires on every `audit_log` insert with `cost_usd > $1`; triple-checks against the spec's `max_cost_usd`. Kill session if over.
- **R5.4** — Restructure the 318-Python-subprocess hook architecture (only relevant for B/dev): use a single long-lived Bun process listening on a Unix socket; hooks just write a single line. Drops 318 subprocess invocations to ~318 socket writes (microseconds each). This is post-WS2 work — flag it but don't fix in WS2.

**Adam input needed?** No — these are corrections to a factual error.

---

## Cluster 6 — Multi-agent reasoning is theater (board-meeting)

**Critics:** 4
**Severity:** 2 CRITICAL + 4 HIGH

The 3-round protocol claims to mitigate anchoring. It doesn't. Same topic prompt → all 5 personas converge on similar priors before producing a token. "Fresh-context Synthesizer" is incoherent — its inputs ARE its context. No mechanism prevents the Synthesizer from creating decisions Adam didn't see.

**Required revision (rewrite §2F):**
- **R6.1** — Add Round 0 — **5 different topic framings.** Each persona gets the topic phrased differently (one focuses on "what to ship," another on "what to kill," another on "what to defer," another on "what NOT to do," another on "the edge case"). De-anchors at the framing level, not just the spawn level. This costs ~5x topic prompts but each is small (~200 tokens).
- **R6.2** — Add a **Customer voice persona** (6th persona). For pricing/product/support board meetings, this lens is structurally required. Aria stays as procurement-grade Adversary; Customer Voice is separate.
- **R6.3** — Synthesizer constraint becomes structural: produces a **JSON locked_decisions array** where each item has `source_persona_round: "visionary-r1" | "strategist-r2" | ...`. If a decision has no source persona output, schema rejects. Mechanical anti-hallucination guard.
- **R6.4** — Add Adam-veto checkpoint: between Round 3 (Synthesizer output) and "locked_decisions propagate downstream," there is a **manual gate**. Adam reviews via a Linear comment, replies `accept | reject | revise`. No locked decision ships without his sign-off. (Today Synthesizer's output goes to file with no review gate.)
- **R6.5** — Drop "$10/meeting" and "4/month" — replace with "$3/meeting × 8/month max = $24/mo board budget." Reflects actual costs and unblocks more decision-making.
- **R6.6** — Acknowledge persona-distinction validation is owed: WS6A produces an eval baseline (1 board meeting on a synthetic topic; measure % of findings unique to each persona). Don't lock the persona roster until WS6A baseline runs.

**Adam input needed?** YES on R6.2 (add Customer Voice persona — confirm), R6.5 (revised cost ceiling), R6.6 (defer roster lock to WS6A).

---

## Cluster 7 — Tier classification has no path

**Critics:** 1
**Severity:** HIGH

Quick / Lite / Full tier shapes the entire fan-out story. WS2 doesn't say WHO classifies, on WHAT signal, at WHAT moment. If CEO classifies, the Quick path doesn't exist (CEO already burned a fire to read the ticket). If Cloudflare bridge classifies, on what?

**Required revision:**
- **R7.1** — Linear label vocabulary (already in §2B "What changes downstream") becomes the classification path. Adam OR a low-cost Haiku classifier (running on the bridge) sets `tier:quick | tier:lite | tier:full` BEFORE the bridge fires. Bridge dispatches to different routes:
  - `tier:quick` → fire CEO with `trust_mode: true, scope.short_circuit: "worker-direct"`. CEO spawns the worker via Task in the same session, no C-suite hop.
  - `tier:lite` → fire CEO normally; CEO fans out to ONE C-suite via 2B mechanism.
  - `tier:full` → fire CEO normally; CEO fans out to N C-suite via 2B mechanism.
- **R7.2** — Default classifier: a 50-line Haiku call at the bridge ($0.001/ticket), reading the ticket title + first comment. Outputs the label. Adam can override by pre-tagging.
- **R7.3** — Add the classifier as a new component in the §2B end-to-end flow diagram.

**Adam input needed?** Decision on R7.2: do you want auto-classification at the bridge (faster, ~$0.001/ticket, occasional miscategorization) or always-Adam-classified (more accurate, slower, requires explicit label)?

---

## Cluster 8 — Recovery / failure modes are gappy

**Critics:** 1, 2
**Severity:** mixed H/M

| Failure | What's wrong | Fix |
|---|---|---|
| **Cloudflare outage** | Recovery story (Morning Digest detects orphans) requires the bridge that's down to re-trigger. | Morning Digest, when bridge unhealthy, opens a Linear ticket for Adam to manually re-fire. Halt-fast on outage rather than silent corruption. |
| **Inngest outage** | CEO terminates, fan-in synth never fires. | Add a backstop: every parent ticket has an `expires_at = +24h`. If parent ticket still open at `expires_at` with no synth comment, EOD Sync detects + fires Auto-Unblock. |
| **"Queue to KV with 1-hour delay"** | KV has no execution trigger. The doc claims this works; it doesn't. | Replace with: Cloudflare Worker schedules an Inngest delayed event (`step.sleep("1h")` then re-fire). |
| **Routine cold-start LOW confidence** | "~2s" is internal estimate; Anthropic docs say cron Routines can take "a few minutes" to start. | Smoke-test in R1.1. If actual is >10s, Quick-tier short-circuit becomes mandatory for Adam-facing latency. |
| **Concurrent Routine cap behavior** | What happens when 5 Routines are running and a 6th fires? Anthropic docs unclear. | Smoke-test in R1.1. Document as a §2E concurrency-limit subsection. |

**Required revision:** Add a §Failure modes & recovery subsection to ORCHESTRATION.md after §2G. Already partly addressed in §2B "Failure modes" but doesn't cover Inngest outage or concurrent-Routine cap.

---

## Cluster 9 — Master plan deliverable misses

**Critics:** 6
**Severity:** MEDIUM

| Promised by master plan | Status |
|---|---|
| `.claude/commands/board-meeting.md` (slash command) | NOT created. WS2 designed the protocol but didn't write the slash command file. |
| Board-meeting smoke run | NOT done. §Verification table defers it. |
| Routine-chain smoke-test with stub Routine | NOT done. §Verification table defers to WS4. |
| Sample Inngest retry test | NOT done. §Verification table defers to WS4. |

**Required revision:** Either:
- **Option A (preferred):** Run the smoke tests INSIDE WS2 — costs ~$5-10 from remaining headroom; resolves Cluster 1 + Cluster 8 dependencies.
- **Option B:** Explicitly mark §Verification incomplete; pull WS4 forward to do them; flag risk that WS3 (parallel) starts on unverified WS2 assumptions.

**Adam input needed?** Pick Option A or B.

---

## Cluster 10 — "Reversible" claims that aren't

**Critics:** 6
**Severity:** MEDIUM

DECISIONS.md WS2 entry marks several decisions "Reversible? Mostly yes." Honest re-assessment:

| Decision | Stated reversibility | Honest |
|---|---|---|
| 2B Cloudflare bridge | Easy | **Medium** — once `audit_log` rows reference bridge-set fields, schema migration cost |
| 2C Inngest | Reversible | **Medium** — fan-in-watcher logic is non-trivial; Trigger.dev v3 swap = 2-3 days |
| 2D Trust-mode JSON schema | Config-only | **Hard at scale** — once 100s of `audit_log` rows reference a schema version, migrations are forever |
| Linear label vocabulary | n/a | **Hard** — refactor ripples through CEO prompts, bridge config, every C-suite, future hires |
| 2E `claude_progress` schema | n/a | **Medium** — once populated, table migrations needed |
| 2F board-meeting protocol | Config-only | **Easy** — agree |
| 2G observability | OSS replaceable | **Easy** — agree (the disler-correction adjustment helps) |

**Required revision:**
- **R10.1** — Add a §10 "What's actually reversible" subsection at the end of ORCHESTRATION.md. Use the table above.
- **R10.2** — DECISIONS.md WS2 entry's "Reversible?" line gets revised when the doc unlocks.

**Adam input needed?** No.

---

## What's NOT mentioned (gaps)

**Critics:** 6

| Gap | Why it matters | When to address |
|---|---|---|
| **Multi-tenancy** | When Adam hires (month 12+), can multiple humans issue trust specs? Allowlist vs role-based. | WS2 should add a "future-state" note; full design in WS6 alongside `talent` agent. |
| **Worker timeout inside Routine session** | A Task subagent that hangs — who kills it, when, with what cost-blast-radius? | Add to §2A. Default: 5 min hard kill, parent Routine returns BLOCKED. |
| **`audit_log` GDPR retention** | Real EU customers will demand DSARs. Forever-retention conflicts with right-to-erasure. | Add a §Data retention subsection. Default: 90 days hot retention + 1y cold archive. |
| **Synthesizer is an undocumented 10th Routine** | §2F implies "spawn Synthesizer with fresh context" via `/fire`. That makes it a 10th Routine but it's not in §2E table. | Add Synthesizer as Routine #10 in §2E. Cost-cap it ($1/meeting × 8/mo = $8/mo). |
| **Concurrent Routine cap** | Anthropic Routines may cap parallel sessions per account. Unverified. | Smoke-test in R1.1 (Test D). |

**Adam input needed?** No on most. **YES** on the GDPR retention default — your call (legal-driven decision).

---

## REVISED OPEN QUESTIONS for Adam

The original §Open Questions (7 items) needs a re-cut after critique. Here's the revised list — **only the ones that genuinely need your input.** Engineering unknowns (the other 5) move to smoke-tests inside R1.1.

**Q1.** **Cost ceiling change.** V4 said $0-11/mo new spend. Honest WS2 says $30-40/mo new. **Accept higher, or cut scope?** (R4.4)
**Q2.** **Cloudflare Workers Paid plan ($5/mo)** — required for Durable Objects (R2.1). Approve?
**Q3.** **Tier classifier at bridge** — auto-Haiku ($0.001/ticket, occasional miss) or always-Adam-tagged? (R7.3)
**Q4.** **Customer Voice persona added to board meetings** — confirm? (R6.2)
**Q5.** **Smoke-tests inside WS2 (Option A) or after (Option B)?** (Cluster 9)
**Q6.** **`audit_log` retention default** — 90d hot + 1y cold? Or stricter (30d/0y) for GDPR?
**Q7.** **Aria's role.** Critic 4 flags Aria's procurement lens mismatches non-vendor decisions. Keep Aria as Adversary always, OR Aria for vendor decisions + new "broad Adversary" for general? (R6.6)

The 7 items in the original ORCHESTRATION.md §Open Questions are SUPERSEDED by these 7.

---

## Net new work BEFORE WS3/WS4

The single hard requirement before WS3/WS4 begin:

1. **Run R1.1 smoke-tests** (4 tests, total ~$5-10, 2-4 hours wall-clock). These resolve 4 of the original 7 open questions.
2. **Adam answers Q1-Q7 above.**
3. **Apply revisions R1.x-R10.x** to ORCHESTRATION.md (this CEO does it once Adam approves).
4. **Update DECISIONS.md WS2 entry** with revised reversibility assessment.
5. **Create `.claude/commands/board-meeting.md`** (the missing slash command per Cluster 9).

Once those land, WS3 (tech stack BOM) and WS4 (connection layer) can start.

---

## What survives WS2 unchanged (~40% of the doc)

For your sanity — these decisions held up under critique:

- **§2A** spawning hierarchy (workers spawn nothing, main-thread routines spawn workers). Constraint is platform-enforced, decision is correct.
- **§2A** anti-bureaucracy hard rule (workers don't delegate).
- **§2A** QA-Lead independence as a *concept* (the *enforcement* needs R3.8).
- **§2B** rejection of Option (iii) Task-spawn — correct and well-sourced.
- **§2B** Linear-as-control-plane abstraction — right pattern.
- **§2C** Inngest stays as durable layer — correct, the alternatives are worse.
- **§2C** Routines = triggers, not durable state — correct.
- **§2C** the 4 primitives (step.run, waitForEvent, sleep, Promise.all) — correct.
- **§2D** schema *fields* (the structure) — correct shape, just needs hardening.
- **§2E** the Routine roster (9 Routines + Synthesizer = 10) — right scope.
- **§2F** 3-round structure — right shape, just needs anti-anchoring fixes.
- **§2G** custom `/war-room` page — right approach.

---

## Cost of this critique pass

| Item | Cost |
|---|---|
| 6 Sonnet critics, 25-30 min each | ~$8-12 |
| Opus synthesis (this doc) | ~$3-5 |
| **Total critique cost** | **~$11-17** |
| WS2 cumulative spend | ~$21-27 of $30 cap |

**Headroom remaining:** ~$3-9 inside WS2 cap. Enough for Option A smoke-tests (R1.1 — ~$5-10) if Adam picks that.

---

## Recommendation

**Take Option A on Cluster 9** (run smoke tests now). The R1.1 tests are the rate-limiting step on whether WS2's design survives contact with reality. Doing them inside WS2 keeps the workstream coherent; deferring to WS4 makes WS4 a smoke-test landmine that could re-open WS2.

If you approve smoke-tests + answer Q1-Q7, I unilaterally apply R1.x-R10.x revisions to ORCHESTRATION.md and DECISIONS.md, then WS2 actually locks. WS3 and WS4 start on solid ground.

**Halting here for your call.**

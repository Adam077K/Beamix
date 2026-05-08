# RESEARCH-WS2C — Durable Execution Layer
**Researcher:** Sonnet 4.6, 2026-05-06
**Time spent:** ~28 minutes
**Confidence:** MEDIUM-HIGH (official docs + credible comparison sources; Anthropic Routines durability specifics are LOW due to research-preview status and sparse documentation)

---

## Summary (TL;DR — 3 sentences)

Stick with Inngest. It is already in the stack, already paid for at $0 until ~5 customers, provides step-level memoization + fan-out via `Promise.all()` + per-step independent retries (default 5 total attempts with exponential backoff), and has a first-party AgentKit specifically designed for multi-agent Anthropic orchestration. Anthropic Routines have zero documented durable-execution semantics — a crashed Routine session is simply lost with no automatic resume or retry — making them suitable as trigger surfaces only, not as the orchestration layer.

---

## Comparison matrix

| Criterion | Inngest | Trigger.dev v3 | Anthropic Routines | Custom Postgres |
|-----------|---------|----------------|--------------------|-----------------|
| **Retry semantics** | Per-step: 5 total attempts (4 retries) by default; exponential backoff + jitter; configurable per function (`retries: N`); `NonRetriableError` to skip; `RetryAfterError` for custom timing | Per-task: default 3 attempts; configurable `maxAttempts`, `minTimeoutInMs`, backoff `factor`; `onFailure` hook after exhaustion | **None documented.** Routines run as Claude Code sessions; no retry API surface is exposed; a failed session is a failed run | Must build: exponential backoff logic in SQL/Edge Function, dead-letter table, worker polling loop — all custom |
| **Durable state** | Step results persisted server-side; replay skips completed steps on re-run; 15-min serverless cap per step (Vercel Hobby) but steps chain across invocations | Bun-based workers run for hours without serverless timeout; state persists between steps; survives deployments mid-run | **None documented.** Each Routine is a full Claude Code session; if session crashes, no resume mechanism is described | Possible via job status columns (`pending/running/done/failed`) in Supabase; no automatic replay |
| **Fan-out / fan-in** | `Promise.all([step.run(...), step.run(...)])` — parallel steps queue simultaneously; Inngest aggregates state, re-invokes function with all results (barrier pattern built-in); max 1,000 steps/function | `batchTriggerAndWait()` — triggers multiple tasks in parallel and blocks until all complete; `batch.triggerByTaskAndWait()` for mixed-type fan-out; do NOT use `Promise.all()` with single `triggerAndWait()` | **None.** Routines cannot spawn sub-Routines; Task tool spawns subagents but subagents cannot spawn further agents (Anthropic spec limitation confirmed in PLAN doc) | Possible but complex: insert N child rows, poll/subscribe for all N to reach terminal state; no native barrier primitive |
| **Step memoization** | Yes — completed step results stored on Inngest platform; re-run replays from last checkpoint, skipping succeeded steps entirely | Yes — task state persists; retried tasks resume from failure point, not from scratch | No — each Routine run is a fresh Claude Code session with no replay | No — would need custom `idempotency_key` column + upsert logic |
| **Observability** | Inngest Dev Server (local traces + I/O logs); cloud dashboard with run history, step-level status, retry counts, durations; AgentKit provides agent-specific network traces | Dashboard with run history, log retention (1 day free / 7 days Hobby / 30 days Pro); real-time streaming; step-level status visible | Visible at `claude.ai/code/routines` — per-run session URLs; session transcript visible but no retry-count or step-level failure metadata | Whatever you build; Supabase Studio shows job table rows; no built-in trace UI |
| **Cost (now — solo founder)** | **$0** — free tier: 50K function runs/mo; already in stack | **$0** — free tier: 20 concurrent runs, $5 monthly credit; cloud compute billed per-second | **$0 extra** — Routines included in Claude Code Pro/Max plan subscription; 5 daily routine runs on Pro | **$0 extra** — Supabase already in stack; only dev time cost |
| **Cost (5 paying customers)** | **$0** — 50K steps covers 9 Routines × 30 days × ~5 steps = ~1,350 steps/mo; headroom is massive; Pro tier ($75/mo) triggered around 50K limit breaches, likely not needed until 50+ customers | **$0–$10** — free tier ($0) or Hobby ($10/mo) depending on run volume; at 5 customers + 9 Routines still well under free | **$0 extra** — still on subscription; 5 daily routine cap may bite if agent fires are frequent | **$0 extra** — still Supabase free tier |
| **Cost (50 paying customers)** | Likely still **$0 on free** or first months of Pro ($75/mo, includes 1M executions); linear webhook volume at 10 ad-hoc/day = ~300/mo → tiny fraction of 50K | **$10–$50/mo** (Hobby→Pro) depending on volume and compute duration; billed per-second makes cost depend heavily on Claude session duration | Not designed for this scale; daily run caps become hard constraints; not a scalable orchestration layer | Engineering + ops cost high; Supabase pgmq or pg_cron can handle volume but monitoring is DIY |
| **Lock-in** | Medium — cloud-first; self-hosting exists (open source) but immature; API is proprietary; migration requires rewriting step functions | Low — open source, mature self-hosted path via Docker Compose (Postgres + Redis + S3); can migrate without vendor | N/A — Routines are an Anthropic product feature, not a separate orchestration layer | None — you own every byte |
| **Time to first integration** | **~1-2 hours** — already in stack (`inngest` package installed); add `step.run()` wrapping to existing functions; no new infra | **~3-5 hours** — new package, new worker process (`trigger.dev dev`), different invocation model, learn `batchTriggerAndWait` | **~0 hours additional** — Routines already exist as trigger surface; but no orchestration layer to wire into | **~8-16 hours** — design schema, write polling worker, implement retry/backoff, build dead-letter table, write monitoring query |
| **Native Routines integration** | **Best** — Inngest AgentKit has first-party Anthropic/Claude provider; `network` + `agent` + `state` primitives map directly to Beamix's CEO→worker model; Routines can call Inngest HTTP endpoints | No specific Routines integration; would need Cloudflare Worker to bridge Routine completion → Trigger.dev task trigger | Tautological — Routines ARE the platform; no external orchestration; built-in "retry" is just re-triggering the whole session | No specific integration; Routines would write job rows via Supabase MCP, worker polls |

---

## Per-option detail

### (a) Inngest

Inngest is the strongest fit for Beamix right now. The package is already installed and the free tier (50,000 function runs/month) is sized for the war-room load: 9 standing Routines firing daily at 5 steps each yields roughly 1,350 steps/month, leaving 97% of the free tier unused. Pro tier at $75/month is the scale trigger, and per the locked `project_inngest_tier_strategy` decision it migrates at ~5 paying customers — but at Beamix's war-room agent volume even 5 customers likely stays on free.

The durability model is exactly what the CEO→worker fan-out needs: `Promise.all([step.run('worker-1', ...), step.run('worker-2', ...), ...])` launches all five workers simultaneously; Inngest persists each step's result server-side; when all five complete, the platform re-invokes the CEO function with all state aggregated (the barrier). If the CEO function crashes after firing workers 1-3, replay skips steps 1-3 (already memoized) and continues from step 4. This is the specific crash scenario from the research brief, handled natively.

The key gotcha is the serverless execution cap: on Vercel Hobby, functions timeout at 10 seconds (60s on Pro); Inngest steps are designed to work around this via chaining, but any single step that runs Claude for minutes will hit the limit. The workaround is keeping each `step.run()` body thin (fire-and-poll or use Inngest's `step.waitForEvent()` for async Claude session completion). Inngest AgentKit (`agentkit.inngest.com`) provides Claude-native primitives (agent networks, shared state, routing) that would make this pattern cleaner if adopted. Max 1,000 steps per function and 4MB total step output are the other ceilings — neither is a concern at war-room scale.

### (b) Trigger.dev v3

Trigger.dev v3 is the strongest alternative if self-hosting or avoiding vendor lock-in becomes important. Its Bun-based worker architecture means jobs run for hours without serverless timeout concerns — if a Claude agent task genuinely needs 10+ minutes of compute (unlikely for Routines but plausible for build agents), Trigger handles it cleanly. `batchTriggerAndWait()` is the fan-out primitive; idempotency keys (`idempotencyKey` + 30-day TTL by default) prevent duplicates on retries; `onFailure` hook fires after all retry attempts are exhausted, enabling dead-letter behavior.

The switching cost from Inngest is non-trivial: different SDK, different invocation model (`task.trigger()` not `inngest.createFunction()`), different worker process to run locally, and the fan-out pattern is structurally different (Trigger warns against `Promise.all()` with single `triggerAndWait()` — use `batchTriggerAndWait()` instead). At Beamix's current scale, the benefits (better self-hosting, no serverless timeout) do not outweigh the cost of switching from something already working. File this as the migration target if Inngest pricing becomes painful at 50+ customers.

### (c) Anthropic Routines built-in

Anthropic Routines (research preview as of April 2026) are a scheduling + triggering surface, not a durable execution framework. The official docs (`code.claude.com/docs/en/routines`) describe schedule triggers, API triggers, and GitHub event triggers — but contain zero language about retry semantics, crash recovery, or durable state. A Routine run is a fresh Claude Code session every time; if it crashes partway through (e.g., the CEO fires 3 of 5 workers then errors), the session ends and no automatic re-run happens. Observability is limited to the per-run session URL visible in the UI — no step-level retry counts or structured failure metadata.

This means Routines should be treated as the **entry point** (the "trigger" in Inngest terminology) rather than as the execution layer. The correct architecture is: Routine fires → calls Inngest `createFunction` endpoint via HTTP → Inngest manages durability, retries, fan-out, memoization. Daily run caps (5 runs/day on Pro, 15 on Max) further constrain using Routines as a high-frequency orchestration bus. The research-preview stability warning on the `/fire` API endpoint adds additional risk for production reliance.

### (d) Custom Postgres

A custom Postgres job table on Supabase is theoretically viable — pgmq (Supabase Queues, built on the pgmq extension) provides guaranteed message delivery, visibility windows for at-least-once semantics, and message archival. Retry semantics can be bolted on with a `attempts` column, exponential backoff computed in an Edge Function, and a dead-letter table for exhausted jobs. Fan-out is possible by inserting N rows and polling/subscribing for completion.

The honest assessment: this is 8-16 hours of engineering to replicate what Inngest already provides for free, with worse observability (Supabase Studio table view vs Inngest dashboard with step traces), no memoization (every retry re-runs from scratch unless you build checkpoint tables), and permanent maintenance burden. The only scenario where this wins is if Inngest ceases to exist or pricing becomes catastrophic (neither credible at Beamix's scale). Custom Postgres is the correct backup DR plan (the job state *source of truth* can be Supabase rows, with Inngest as the execution layer), not the primary choice.

---

## Recommendation

**Winner:** Inngest (option a)

**Reasoning:** Inngest is already in the stack, free until volume dwarfs war-room needs, provides exactly the durability primitives required (step memoization, per-step retries, `Promise.all()` fan-out with barrier), and has a first-party AgentKit with Anthropic/Claude integration. The correct mental model is: Routines are triggers that call Inngest endpoints; Inngest manages all orchestration state.

**Fallback:** Trigger.dev v3 — if Inngest pricing becomes punishing at 50+ customers, Trigger.dev's open-source self-host path is the migration target; idempotency keys and `batchTriggerAndWait()` are drop-in conceptual equivalents to Inngest's step model.

**Migration trigger:** Re-evaluate when monthly Inngest bill exceeds $75 (Pro tier) AND Beamix has at least 25 paying customers. At that scale, self-hosting Trigger.dev v3 on a $5-10/mo VPS likely saves money.

---

## Open questions

1. **Vercel function timeout:** Beamix deploys on Vercel. What is the plan-level function timeout? Hobby = 10s, Pro = 60s. If any Inngest step body calls Claude synchronously and Claude takes >60s, the step will timeout. Design decision: does the war-room use async Claude (fire API call → poll) or sync? This affects step design significantly.

2. **Inngest step.invoke vs step.waitForEvent:** The fan-out pattern for CEO→5 workers could use `step.invoke()` (direct function call) or `step.waitForEvent()` (event-based coordination). `step.invoke()` is cleaner for the CEO-spawns-workers model but requires workers to be Inngest functions too. Are war-room workers Inngest functions or Routines? This architecture decision gates the fan-in implementation.

3. **Routines daily run cap:** Pro plan = 5 daily routine runs. The war-room plan has 9 standing Routines (5 heartbeat + 3 signal + 1 CEO entry). Some of these run daily. Does this exceed the 5/day Pro cap? If so, is Max plan ($100/mo) required (15 runs/day)? This needs validation against the actual Routines quota page before assuming $0 overhead.

4. **AgentKit adoption decision:** Inngest AgentKit (`agentkit.inngest.com`) provides a Claude-native agent network abstraction that maps naturally to the V4 org chart (CEO network → worker agents). Adopting it would formalize the orchestration model but adds a framework dependency. WS2 should evaluate whether to use raw Inngest functions or AgentKit's network/agent/state primitives.

5. **Dead-letter handling:** Inngest's behavior after all retries are exhausted is not fully documented in sources found. Is there a dead-letter queue, webhook, or dashboard flag? WS2 should confirm what Adam sees when a Routine's Inngest job exhausts retries silently.

---

## Sources

- [Inngest Pricing — Free 50K/mo, Pro $75/mo starting 1M executions](https://www.inngest.com/pricing) — fetched 2026-05-06
- [Inngest Retry Configuration — default 4 retries (5 total), per-step independent counters, `NonRetriableError`](https://www.inngest.com/docs/features/inngest-functions/error-retries/retries) — fetched 2026-05-06
- [Inngest Step Parallelism — `Promise.all([step.run(...)])` fan-out, barrier aggregation, max 1,000 steps, 4MB limit](https://www.inngest.com/docs/guides/step-parallelism) — fetched 2026-05-06
- [Inngest Fan-out Guide — event-driven multiple function triggers](https://www.inngest.com/docs/guides/fan-out-jobs) — fetched 2026-05-06
- [Inngest AgentKit Overview — Claude/Anthropic support, network/agent/state/router primitives](https://agentkit.inngest.com/) — fetched 2026-05-06
- [Trigger.dev Pricing — Free: 20 concurrent runs + $5 credit; Hobby $10/mo; Pro $50/mo](https://trigger.dev/pricing) — fetched 2026-05-06
- [Trigger.dev Tasks Overview — default 3 retries, exponential backoff, `onFailure` hook](https://trigger.dev/docs/tasks/overview) — fetched 2026-05-06
- [Trigger.dev Triggering — `batchTriggerAndWait()` fan-out, idempotency keys, 30-day TTL default](https://trigger.dev/docs/triggering) — fetched 2026-05-06
- [Anthropic Claude Code Routines — official docs; schedule/API/GitHub triggers, no retry/durability semantics documented; research preview](https://code.claude.com/docs/en/routines) — fetched 2026-05-06
- [Hatchet vs Trigger.dev v3 vs Inngest 2026 — step memoization, serverless cap (Inngest ~15 min), Trigger.dev hours-long runs, Inngest Pro $25/mo for 500K (note: conflicts with official $75/mo — use official price)](https://www.pkgpulse.com/blog/hatchet-vs-trigger-dev-v3-vs-inngest-durable-workflows-2026) — accessed 2026-05-06 — Confidence: MEDIUM (third-party blog, some pricing data conflicts with official source)
- [Supabase Queues (pgmq) — guaranteed delivery, visibility windows, Postgres-native](https://supabase.com/docs/guides/queues) — fetched 2026-05-06
- [9to5Mac: Anthropic adds Routines to Claude Code — Pro: 5 daily runs, Max: 15 daily runs](https://9to5mac.com/2026/04/14/anthropic-adds-repeatable-routines-feature-to-claude-code-heres-how-it-works/) — April 2026 — Confidence: MEDIUM (news article, not official docs)
- [Inngest vs Trigger.dev vs Temporal 2026 — architecture comparison, lock-in assessment](https://trybuildpilot.com/610-trigger-dev-vs-inngest-vs-temporal-2026) — accessed 2026-05-06 — Confidence: MEDIUM
- [Medium: TypeScript Orchestration Guide — Temporal vs Trigger.dev vs Inngest](https://medium.com/@matthieumordrel/the-ultimate-guide-to-typescript-orchestration-temporal-vs-trigger-dev-vs-inngest-and-beyond-29e1147c8f2d) — Confidence: MEDIUM

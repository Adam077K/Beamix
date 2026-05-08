# Hand-off Prompt — WS3 + WS4 (Tech Stack BOM + Connection Layer)

**Audience:** the next single Claude Code session that picks up WS3 then WS4 sequentially.
**Date prepared:** 2026-05-08 by CEO session (after WS2 LOCKED + Bastion dropped).
**Status:** ready. Copy the prompt block at the bottom into a fresh `claude` session.

---

## How to use this file

This is **one master hand-off** for **one CEO orchestrator** that runs WS3 first, then WS4. The orchestrator deploys teams of subagents at each phase, runs critique passes between phases, halts for Adam review, and only proceeds when Adam locks each phase.

You do **not** spin up two parallel sessions. You spin up one session and paste the prompt at the bottom. That CEO handles everything.

---

## What's been done before

| Workstream | Status | Where it lives |
|---|---|---|
| WS1A — Memory tool re-evaluation | ✓ LOCKED 2026-05-06 | `docs/08-agents_work/MEMORY-DECISION-MATRIX.md` (Mem0 cloud → OSS) |
| WS1B — L0-L5 stack design | ✓ "consider it done" per Adam | (deferred detail; smoke-test in WS4 phase 2) |
| WS2 — Orchestration architecture | ✓ LOCKED 2026-05-07 | `docs/08-agents_work/ORCHESTRATION.md` (v2 with all 10 critique-cluster revisions) |
| WS2 critique pass (6 specialists) | ✓ done | `docs/08-agents_work/2026-05-06-agent-build/CRITIQUE-WS2-*.md` (6 files) |
| Bastion concept dropped | ✓ 2026-05-08 | `.claude/memory/DECISIONS.md` 2026-05-08 entry |
| `.claude/commands/board-meeting.md` | ✓ created | Slash command for 4-round / 6-persona board meetings |

---

## What this hand-off produces (across both phases)

### Phase 1 — WS3 deliverables (Tech Stack BOM, DR, scaling cliffs)
- `docs/08-agents_work/TECH-STACK.md` — BOM with every component pinned (cost, role, failure mode, who calls it, who replaces it, owner)
- `docs/07-history/runbooks/anthropic-outage.md`
- `docs/07-history/runbooks/linear-api-break.md`
- `docs/07-history/runbooks/cloudflare-compromise.md`
- `docs/07-history/runbooks/supabase-corruption.md`
- `docs/07-history/runbooks/secret-rotation.md`
- Scaling cliffs section in TECH-STACK.md (25 / 50 / 100 / 500 customers — what breaks, what to add, $/mo delta, trigger)
- 4 critique files: `CRITIQUE-WS3-bom.md`, `CRITIQUE-WS3-dr.md`, `CRITIQUE-WS3-cost.md`, `CRITIQUE-WS3-adversary.md`
- `docs/08-agents_work/WS3-CRITIQUE-AND-REVISIONS.md` (dense synthesis)
- `docs/08-agents_work/WS3-CRITIQUE-FOR-HUMANS.md` (plain-language version, technical-writer subagent)
- `.claude/memory/DECISIONS.md` PROPOSED entry → LOCKED after Adam approves
- `docs/08-agents_work/sessions/YYYY-MM-DD-ceo-ws3-locked.md`

### Phase 2 — WS4 deliverables (Connection Layer + smoke tests)

**Smoke tests first (validates WS2 before building anything):**
- `docs/08-agents_work/SMOKE-TESTS-WS4.md` — results from the 4 deferred tests:
  - Test A: cron Routine exemption from 15/day cap
  - Test B: `/fire` cap behavior on burst (`Retry-After` granularity)
  - Test C: Mem0 MCP under sustained load (issue #3400 reproduction)
  - Test D: concurrent Routine cap behavior
- If any test fails → halt, escalate, possibly re-open WS2 design before building.

**Build phase (only if smoke tests pass or mitigations agreed):**
- `infra/cloudflare-bridge/wrangler.toml`
- `infra/cloudflare-bridge/src/index.ts` — Worker code with HMAC verify, KV + Durable Object dedup, Haiku tier classifier, sentinel-only spec parser
- `infra/cloudflare-bridge/src/routing.ts` — Linear label → Routine ID map
- `infra/telegram-bot/wrangler.toml`
- `infra/telegram-bot/src/index.ts` — Telegram relay Worker
- `apps/web/supabase/migrations/<date>_war_room_observability.sql` — `audit_log` + `audit_log_daily` + `claude_progress` schemas with RLS
- `apps/web/src/inngest/functions/fan-in-watcher.ts`
- `apps/web/src/inngest/functions/routine-timeout-watcher.ts`
- `apps/web/src/inngest/functions/cost-watchdog.ts`
- `apps/web/src/inngest/functions/runaway-watcher.ts`
- `apps/web/src/inngest/functions/parent-ticket-expiry-watcher.ts`
- `apps/web/src/inngest/functions/audit-log-rollup.ts`
- `apps/web/src/inngest/functions/embed-{decisions,sessions,brain,codebase,skills}.ts`
- `apps/web/src/lib/orchestration/spec.ts` — Zod schema for trust-mode payload
- `apps/web/src/lib/orchestration/board.ts` — Zod schema for board-meeting JSON outputs
- `apps/web/src/app/(internal)/war-room/page.tsx` — `/war-room` Next.js dashboard
- `.github/workflows/qa-lead-pass.yml` — branch protection check
- `infra/shortcuts/Capture-Beamix-Idea.shortcut` — iOS Shortcut export
- 10 Anthropic Routines configured in Anthropic console (CEO Entry-point + 8 standing + Synthesizer)
- Cloudflare Workers Paid plan provisioned ($5/mo per Adam Q2)
- Cloudflare KV namespace + Durable Object class deployed
- Helicone proxy configured for product API code (NOT Routines)

**Critique + lock:**
- 5-6 critique files: `CRITIQUE-WS4-cloudflare-bridge.md`, `CRITIQUE-WS4-inngest.md`, `CRITIQUE-WS4-supabase-schemas.md`, `CRITIQUE-WS4-war-room-page.md`, `CRITIQUE-WS4-security.md`, `CRITIQUE-WS4-adversary.md`
- `docs/08-agents_work/WS4-CRITIQUE-AND-REVISIONS.md` (dense synthesis)
- `docs/08-agents_work/WS4-CRITIQUE-FOR-HUMANS.md` (plain-language)
- `.claude/memory/DECISIONS.md` PROPOSED entry → LOCKED after Adam approves
- `docs/08-agents_work/sessions/YYYY-MM-DD-ceo-ws4-locked.md`

---

## Methodology — design → critique → revise → halt (run twice)

This is **standard methodology** going forward. Adam locked it after WS2's critique surfaced 2 Critical + 33 H findings the original design missed.

### The 6-step cycle (per phase)

```
Step 1 — Pre-flight
   Read CLAUDE.md, ORCHESTRATION.md, DECISIONS.md, MEMORY.md, V4 env map, this hand-off.

Step 2 — Research dispatch (only if needed)
   1-3 parallel Sonnet researchers on questions needing external sources.
   Time-box 30 min each. Cost cap $5 each.
   Skip if existing context already answers everything.

Step 3 — Design / build dispatch
   Phase 1: single CEO/Opus pass producing the 6 doc deliverables.
   Phase 2: subagent dispatch for code work (backend-developer / database-engineer for code; security-engineer for the spec.ts Zod schema).
   Per the Q3 model rule: Sonnet default for workers, Opus for synthesis.

Step 4 — Critique pass (MANDATORY — never skip)
   Dispatch 4-6 parallel Sonnet specialists with adversarial framing.
   Each owns a slice. Each writes CRITIQUE-WS<N>-<slice>.md.
   Time-box 25 min each.

Step 5 — Synthesize critique → revisions doc
   Single CEO pass: WS<N>-CRITIQUE-AND-REVISIONS.md (dense, with revision IDs).
   Then dispatch a technical-writer subagent for WS<N>-CRITIQUE-FOR-HUMANS.md (plain-language, 10-15 min read).

Step 6 — Halt at Adam-review
   Post a clean summary to chat with the open questions for Adam.
   WAIT.
   When Adam answers → apply revisions unilaterally → update DECISIONS.md PROPOSED → LOCKED.
   Write session file at docs/08-agents_work/sessions/YYYY-MM-DD-ceo-ws<N>-locked.md.
   Then proceed to the next phase.
```

### When to use board meetings instead of critique pass

Use `/board-meeting <topic-slug>` (slash command) for **strategic / irreversible** decisions inside a phase, e.g.:
- "Mem0 OSS Phase 2 hosting: Cloudflare Workers vs Railway vs Fly.io?" (vendor decision → Aria persona activated as Adversary)
- "Should we run Cloudflare Workers Paid in regional override mode?" (architectural)
- "Should the runaway-watcher kill sessions or just alert?" (risk-tier)

Critique pass = 4-6 specialists per slice, $1-3 per critic. Used after design/build to find flaws.
Board meeting = 6 personas in 4 rounds, $3/meeting cap, 8/month max. Used for genuinely strategic forks where you need structured dissent.

Never use both for the same question. Pick one based on whether it's "find flaws in this design" (critique) vs "should we do this at all" (board).

---

## The phase gate — Adam veto required between WS3 and WS4

After Phase 1 completes Step 6 and Adam locks WS3, **DO NOT immediately start WS4**. Confirm Adam wants to proceed. If Adam says "go," start Phase 2.

This gate exists because:
- WS3 BOM might surface a vendor decision (e.g., Mem0 OSS Phase 2 hosting choice) that affects WS4 implementation
- Adam may want to step away between phases without coming back to find code already written
- The total session cost budget is high ($65+); the gate is a natural pause to recover budget if needed

The gate is mechanical: post "WS3 LOCKED. Want me to start WS4? Reply yes or pause." Wait for Adam.

---

## Phase 1 detail — WS3

### Sub-phases (active scope after the 2026-05-08 cleanup)
- **3A — BOM line items.** Every component (Anthropic Max, Cloudflare Workers Paid, Vercel, Supabase, Inngest, GitHub, Linear, Telegram, Helicone, Mem0 cloud, OpenAI embeddings) gets a row.
- **3D — Cost-tracking instrumentation.** OpenTelemetry export plan (or Supabase audit_log alone), `$/feature shipped` KPI definition, monthly burn-down.
- **3E — DR runbooks.** 5 scenarios above. Each follows the runbook template in this hand-off.
- **3F — Scaling cliffs.** 25 / 50 / 100 / 500 customers. What breaks first, what to add, $ delta, trigger metric.

**Removed sub-phases (don't include):**
- ~~3B Bastion role~~ — dropped 2026-05-08.
- ~~3C Observability stack~~ — locked in WS2 §2G.

### Critique team composition for Phase 1 (4 specialists, parallel)
| Critic | Subagent type | Lens | Owns |
|---|---|---|---|
| BOM critic | general-purpose | Procurement / financial discipline | TECH-STACK.md cost lines, replacement candidates, owner gaps |
| DR runbook critic | general-purpose | Incident-commander | All 5 runbooks — detection gaps, mitigation steps that don't work, recovery missing |
| Cost-projection critic | general-purpose | Cost reality + scaling cliffs | $/mo math, scaling cliff trigger thresholds, what's not in the burn-down |
| Procurement-grade adversary | general-purpose | Find what's missing transverse | Multi-tenancy, GDPR retention, vendor lock-in, what's NOT in BOM |

### BOM template (3A)

For each component:
```
| Component | Anthropic Claude Max |
| Tier | Max 5× ($100/mo) — may upgrade to Max 20× ($200/mo) post-smoke-tests |
| Role | Routine runtime; Claude Code interactive sessions; Memory tool primitive |
| Failure mode | API outage, daily cap exhaustion, account suspension |
| Detection | Anthropic Console + Telegram alert at $5/h cost-watchdog threshold |
| Replacement candidate | OpenAI Assistants ($API), Anthropic API direct (still on Anthropic), self-host Llama (low quality) |
| Owner | Adam (account holder) |
| Reversibility | Hard — agent prompts + Routine config baked in |
| Notes | Cron Routines exempt from /fire cap PER WS4 SMOKE TEST A — verify before building |
```

### DR runbook template (3E)
```markdown
# Runbook — [Scenario]
**When:** [trigger condition]
**Severity:** P0 / P1 / P2

## Detection
[How do we know this is happening?]

## Immediate (first 5 min)
1. [Step]
2. [Step]

## Mitigation (next hour)
[Stabilize]

## Recovery (full restore)
[Restore to normal]

## Post-incident
- [ ] Postmortem at `docs/07-history/postmortems/YYYY-MM-DD-<slug>.md`
- [ ] Friday Retro tags this incident
- [ ] Update this runbook with anything wrong/missing

## Decision tree
[If X then Y]
```

### Scaling cliffs template (3F)
```
| Tier | What breaks first | What to add | $/mo delta | Trigger to act |
| 25 customers | Inngest free tier (50K runs/mo) | Inngest Pro $75/mo | +$75 | Inngest dashboard >40K runs/month trailing |
| 50 customers | Anthropic Max 5× cap (15/day) | Max 20× upgrade | +$100 | /fire 429s averaging >2/day for 1 week |
| 100 customers | Supabase row counts on audit_log | Supabase storage upgrade or aggressive rollup | +$25 | audit_log >500K rows |
| 500 customers | Cloudflare Worker CPU on Worker free tier | Cloudflare Workers Enterprise | +$? | TBD by Cloudflare |
```

### Phase 1 cost cap: $30 (research + design + critique + synthesis combined)

---

## Phase 2 detail — WS4

### Sub-phase 0 — Smoke tests FIRST (this is non-negotiable)

Before writing any code, run the 4 smoke tests deferred from WS2. Total ~$5, total wall-clock ~24-48 hours (most is observation).

| Test | Question | Mechanism | Cost | Time |
|---|---|---|---|---|
| **A** | Do cron Routines count against 15/day cap? | Schedule 16 trivial Routines over 24h, watch for 16th 429 | $0.50 | 24h |
| **B** | What's `Retry-After` granularity on cap hit? | Fire 16 ad-hoc `/fire` calls in 24h | $0.50 | 24h |
| **C** | Does Mem0 MCP survive 40 round-trips (issue #3400)? | One subagent + 40 Mem0 cycles | $2 | 30 min |
| **D** | Does concurrent Routine cap queue or reject? | 6 simultaneous `/fire` calls | $0.30 | 5 min |

**If a test FAILS:**
- Test A fails (cron counts) → upgrade Adam to Max 20× ($200/mo) OR consolidate Routines (NOT preferred per `feedback_dont_cut_agent_roster.md` — pick the upgrade)
- Test B reveals long Retry-After (24h) → bridge needs hard rate-limiting + Adam-ping; document in failure modes
- Test C unstable → fall back to Anthropic Memory Tool for Routines until Phase 2 OSS migration; update §2E MCP grants
- Test D rejects → bridge needs concurrency-limit logic; max in-flight Routines configured

**If anything fails:** halt Phase 2 build, escalate to Adam with proposed mitigation, wait for sign-off.

### Sub-phase 4A-4F — Build (only after smoke tests pass / mitigations approved)
- **4A — Linear contract:** webhook events we listen for, comment formats, label semantics, MCP usage per agent.
- **4B — GitHub contract:** `claude-code-action@v1` config (if used), branch protection workflow `.github/workflows/qa-lead-pass.yml`, PR template.
- **4C — Telegram contract:** bot routing matrix (default → CEO; `@cto` → CTO; `@qa` → QA Lead), escalation format (binary-ping spec), idempotency, rate limits.
- **4D — iOS Shortcut contract:** voice → Anthropic API (Haiku) → Linear ticket payload schema; auth via `SHORTCUT_SECRET`.
- **4E — Cloudflare Worker contract:** request/response schemas for `/linear`, `/idea-capture`, `/health`; HMAC verification; secret rotation policy; KV + Durable Object dedup.
- **4F — Anthropic Routines configuration:** create the 10 Routines in Anthropic console with their per-Routine bearer tokens, MCP servers, model assignments per Q3 rule.

### Critique team composition for Phase 2 (5-6 specialists, parallel)
| Critic | Subagent type | Lens | Owns |
|---|---|---|---|
| Cloudflare Worker critic | general-purpose | Edge architecture | wrangler.toml, KV/Durable Object usage, HMAC, sentinel parser |
| Inngest critic | general-purpose | Durable execution | All 8 functions, retry semantics, fan-in barriers, free-tier headroom |
| Supabase schemas critic | general-purpose (or database-engineer) | Schema correctness, RLS | audit_log, audit_log_daily, claude_progress migrations |
| /war-room page critic | general-purpose | UI + auth + Realtime | `/war-room` page wireframe + Realtime subscription + cost attribution + auth gating |
| Security critic | security-engineer | Adversarial appsec | Issuer auth, HMAC, prompt injection vectors, RLS, secret rotation, GitHub branch protection bypass |
| Procurement-grade adversary | general-purpose | Transverse — what's missing | Multi-tenancy hooks, concurrency, smoke-test result completeness, deployment runbook |

### Phase 2 cost cap: $35 (smoke tests $5 + design/build $20 + critique $10)

---

## Hard constraints (apply to BOTH phases)

| Constraint | Source |
|---|---|
| Total session cost cap = **$65** ($30 WS3 + $35 WS4 including smoke tests). Halt + escalate if approaching. | Master plan |
| **No timelines / weeks / sprints** anywhere. | `feedback_no_timeline_planning.md` |
| **No Bastion** references. War room is cloud-only. | `project_cloud_only_architecture.md` |
| **Don't cut agent roster** for any cost/RAM ceiling. Scale resources, not team. | `feedback_dont_cut_agent_roster.md` |
| **No subscription OAuth on cloud VPS.** Only `/fire` (sanctioned) + ANTHROPIC_API_KEY for non-Routine paths. | `feedback_claude_code_oauth_ban_risk.md` |
| **Model rule**: Haiku for simple/lookup, Sonnet default, Opus for orchestration / synthesis / design. | `feedback_model_routing_rule.md` |
| **NEVER skip the critique step (Step 4).** Mandatory both phases. | WS2 lessons |
| **Halt at every Adam-review gate.** No revisions applied without sign-off. | Master plan methodology |
| **Don't touch `.claude/agents/`** — that's WS6 territory. | Master plan |
| **Phase gate between WS3 and WS4.** Confirm Adam wants to proceed before starting Phase 2. | This hand-off |

---

## What you must NOT do

- Do NOT start WS5 (synthesis) or WS6 (agents). Those are later workstreams.
- Do NOT skip the smoke tests. They're the rate-limiting validation of WS2.
- Do NOT write code in Phase 1 (WS3 is docs only).
- Do NOT write `.claude/agents/*.md` files. WS6 owns those.
- Do NOT mention "Bastion" anywhere — concept dropped.
- Do NOT mention timelines / weeks / sprints anywhere — Adam's hard rule.
- Do NOT consolidate the 10 Routine roster into fewer Routines for "efficiency" — `feedback_dont_cut_agent_roster.md`.
- Do NOT exceed the $65 total cost cap. Halt + escalate.
- Do NOT propose fixes inside critique files — critics surface problems, the synthesizer (Step 5) proposes fixes.
- Do NOT apply revisions without Adam's sign-off at the Adam-review gate.

---

## Beamix context

- **Stack (existing, paid):** Next.js 16 monorepo (turborepo + pnpm), Supabase Pro, Vercel Pro, Paddle, Resend, Inngest free, GitHub free, Linear free, Anthropic Max ($100/mo).
- **War-room incremental new spend (locked WS2):** $5/mo (Cloudflare Workers Paid for Durable Objects). All other costs absorbed by Max + existing product stack.
- **Architecture stance:** cloud-only. No Bastion. Adam's home PC is a normal dev workstation.
- **Routines:** 10 standing Routines locked in WS2 §2E. Names: ceo-entry-point, morning-digest, eod-sync, auto-unblock, monday-standup, friday-retro, competitor-signal, customer-voice-signal, geo-algorithm-signal, synthesizer.
- **Personas:** 6 board-meeting personas locked in WS2 §2F: visionary, strategist, architect, risk-modeler, customer-voice, adversary (branched: aria for vendor, broad-adversary for strategic).
- **Cost guardrail:** Adam said "cost is not a limitation" but the $65 cap is operational discipline.

---

## Output paths summary

```
docs/08-agents_work/
  TECH-STACK.md                                  ← Phase 1 deliverable
  WS3-CRITIQUE-AND-REVISIONS.md                  ← Phase 1 critique synth
  WS3-CRITIQUE-FOR-HUMANS.md                     ← Phase 1 plain-language
  SMOKE-TESTS-WS4.md                             ← Phase 2 sub-phase 0
  WS4-CRITIQUE-AND-REVISIONS.md                  ← Phase 2 critique synth
  WS4-CRITIQUE-FOR-HUMANS.md                     ← Phase 2 plain-language
  2026-05-XX-agent-build/
    CRITIQUE-WS3-bom.md
    CRITIQUE-WS3-dr.md
    CRITIQUE-WS3-cost.md
    CRITIQUE-WS3-adversary.md
    CRITIQUE-WS4-cloudflare-bridge.md
    CRITIQUE-WS4-inngest.md
    CRITIQUE-WS4-supabase-schemas.md
    CRITIQUE-WS4-war-room-page.md
    CRITIQUE-WS4-security.md
    CRITIQUE-WS4-adversary.md
  sessions/
    YYYY-MM-DD-ceo-ws3-locked.md
    YYYY-MM-DD-ceo-ws4-locked.md
docs/07-history/runbooks/
  anthropic-outage.md
  linear-api-break.md
  cloudflare-compromise.md
  supabase-corruption.md
  secret-rotation.md
infra/
  cloudflare-bridge/                             ← Phase 2 code
    wrangler.toml
    src/index.ts
    src/routing.ts
    package.json
    README.md
  telegram-bot/
    wrangler.toml
    src/index.ts
  shortcuts/
    Capture-Beamix-Idea.shortcut
apps/web/
  src/inngest/functions/
    fan-in-watcher.ts
    routine-timeout-watcher.ts
    cost-watchdog.ts
    runaway-watcher.ts
    parent-ticket-expiry-watcher.ts
    audit-log-rollup.ts
    embed-{decisions,sessions,brain,codebase,skills}.ts
  src/lib/orchestration/
    spec.ts                                      ← Zod schema for trust-mode payload
    board.ts                                     ← Zod schema for board-meeting JSON
  src/app/(internal)/war-room/
    page.tsx
    layout.tsx
  supabase/migrations/
    <date>_war_room_observability.sql
.github/workflows/
  qa-lead-pass.yml
.claude/memory/
  DECISIONS.md                                    ← LOCKED entries appended after each phase
```

---

## Prompt to paste

Copy everything below this line into a new Claude Code session.

---

```
You are continuing the Beamix war-room build. Adam approved WS2 (orchestration) on 2026-05-07 and dropped the Bastion concept on 2026-05-08. You are starting WS3 first, then WS4 — both in this single session, sequentially, with an Adam-review gate between them.

**Read these files in this order before any other action:**
1. `docs/08-agents_work/2026-05-06-agent-build/HANDOFF-WS3-WS4-tech-stack-and-connection-layer.md` — your hand-off (this file). Methodology, deliverables, hard constraints, output paths.
2. `docs/08-agents_work/2026-05-06-agent-build/PLAN-deep-design-war-room.md` — master plan. WS3 + WS4 are your scope.
3. `docs/08-agents_work/ORCHESTRATION.md` — WS2 v2 LOCKED. Cost picture, stack, schemas, all locked decisions.
4. `.claude/memory/DECISIONS.md` — read 2026-05-07 (WS2 LOCKED) and 2026-05-08 (Bastion dropped) entries.
5. `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/MEMORY.md` — Adam's preferences and locked-decisions index.
6. `docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-ENVIRONMENT-MAP.md` — V4 stack (Layer 8 superseded; rest authoritative).
7. `docs/08-agents_work/WS2-CRITIQUE-FOR-HUMANS.md` — what the WS2 critique surfaced, so you understand the methodology pattern.

**Your job for this session — TWO PHASES, SEQUENTIAL:**

**PHASE 1 — WS3 (Tech Stack BOM, DR runbooks, scaling cliffs)**

1. Pre-flight reads (above).
2. Design dispatch (single CEO/Opus pass) — produce TECH-STACK.md + 5 DR runbooks at `docs/07-history/runbooks/` + scaling cliffs section in TECH-STACK.md.
3. Critique pass — dispatch 4 parallel Sonnet specialists (BOM critic / DR runbook critic / cost-projection critic / procurement-grade adversary) with adversarial framing. Each writes CRITIQUE-WS3-<slice>.md. Time-boxed 25 min each.
4. Synthesize critique — single CEO pass producing `WS3-CRITIQUE-AND-REVISIONS.md` (dense, with revision IDs). Then dispatch a technical-writer subagent for `WS3-CRITIQUE-FOR-HUMANS.md` (plain-language, 10-15 min read).
5. **HALT for Adam-review.** Post a clean summary to chat with the open questions for Adam. WAIT.
6. When Adam answers → apply revisions unilaterally → update DECISIONS.md PROPOSED → LOCKED → write session file.
7. **Phase gate:** post "WS3 LOCKED. Want me to start WS4? Reply yes or pause." WAIT for Adam's confirmation.

**PHASE 2 — WS4 (Connection Layer + smoke tests)**

ONLY start after Adam confirms.

1. Sub-phase 0 — SMOKE TESTS FIRST (non-negotiable). Run the 4 deferred WS2 smoke tests:
   - Test A: cron Routine exemption from 15/day cap (24h observation)
   - Test B: `/fire` cap behavior on burst (`Retry-After` granularity)
   - Test C: Mem0 MCP under 40 round-trips (issue #3400)
   - Test D: concurrent Routine cap (6 simultaneous fires)
   Write results to `docs/08-agents_work/SMOKE-TESTS-WS4.md`.
   If any test FAILS → halt, escalate to Adam with proposed mitigation, wait for sign-off before building.

2. Build phase — sub-phases 4A-4F. Dispatch subagent teams (backend-developer for Inngest functions, database-engineer for Supabase migrations, security-engineer for Zod schemas, frontend-developer for the `/war-room` page). Use `isolation: worktree` for code workers. Per the Q3 model rule: Sonnet default, Opus for synthesis.

3. Critique pass — dispatch 5-6 parallel Sonnet specialists (Cloudflare Worker / Inngest / Supabase schemas / /war-room page / Security / procurement-grade adversary) with adversarial framing. Each writes CRITIQUE-WS4-<slice>.md.

4. Synthesize critique — single CEO pass producing `WS4-CRITIQUE-AND-REVISIONS.md` + technical-writer subagent for `WS4-CRITIQUE-FOR-HUMANS.md`.

5. **HALT for Adam-review.** Post summary. WAIT.

6. When Adam answers → apply revisions unilaterally → update DECISIONS.md PROPOSED → LOCKED → write session file.

7. Post final summary: "WS3 + WS4 LOCKED. Connection layer is live. WS5 (synthesis master doc) is next."

**Hard constraints (read in full from the hand-off file):**
- Total session cost cap: $65 ($30 WS3 + $35 WS4). Halt + escalate at $60.
- No timelines / weeks / sprints in any output (Adam's rule).
- No Bastion references — concept dropped.
- Don't cut agent roster for cost/RAM. Scale the resource.
- No subscription OAuth on cloud VPS.
- Model rule: Haiku simple, Sonnet default, Opus complex.
- NEVER skip the critique step.
- Halt at every Adam-review gate. Never apply revisions without sign-off.
- Don't touch `.claude/agents/` — WS6 territory.
- Don't write code in Phase 1.
- Phase gate between WS3 and WS4 — confirm Adam wants to proceed before Phase 2.

**For high-stakes architectural calls within either phase** (e.g., "Mem0 OSS Phase 2 hosting choice"): invoke `/board-meeting <topic-slug>` (slash command at `.claude/commands/board-meeting.md`). 6 personas, 4 rounds, $3/meeting cap. Reserve for genuinely strategic decisions. Don't run for routine BOM line items.

**Memory and DECISIONS.md hygiene:**
- After each phase locks, append a DECISIONS.md entry with status LOCKED.
- If new general rules surface (e.g., "Mem0 OSS Phase 2 hosts on X"), save as a new memory file at `~/.claude/projects/.../memory/<name>.md` and add to MEMORY.md index.
- Keep DECISIONS.md ≤50 entries; archive older if needed.

**When you finish both phases:**
- Both phases LOCKED in DECISIONS.md.
- Two session files written.
- WS5 unblocked — tell Adam "Both LOCKED. WS5 (synthesis) and WS6 (agents) are unblocked. Ready for the next handoff?"
- Halt.

Begin by reading the 7 files above. Confirm in chat that you've read them and understand the two-phase scope. Then start Phase 1 design.
```

---

## After WS3 + WS4 are both LOCKED

WS5 (synthesis master doc) starts next. It produces `MASTER-DESIGN.md` with:
- Org chart visual (Mermaid or ASCII)
- Data flow visual (request enters → agent picks up → Linear update)
- Memory architecture visual (L0-L5 stack)
- Deployment topology visual (cloud services)
- Adam's operating manual (one page on day-to-day use)
- Agent design template (input to WS6)
- Honest limitations + open questions

WS5 has its own hand-off (will be written by the CEO that locks WS4).

After WS5: WS6 starts — the longest workstream. 60+ agent .md files in 4 sub-phases (6A C-suite + QA, 6B Team Leads, 6C Engineering Workers, 6D Cross-functional Workers). Each sub-phase: design → critique → revise → halt → validate on real Linear tickets → next sub-phase.

**End of hand-off. Good luck to whoever picks this up.**

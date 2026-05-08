# Beamix War Room — Tech Stack BOM, Cost Instrumentation, Scaling Cliffs (WS3)

**Status:** PROPOSED — pending Adam-review gate (post-critique pass)
**Workstream:** WS3 — Tech Stack & Hosting Pinning
**Sub-phases covered:** 3A (BOM line-item pin) · 3D (cost-tracking instrumentation) · 3E (DR runbooks — see `docs/07-history/runbooks/`) · 3F (scaling cliffs)
**Dropped sub-phases:** ~~3B Bastion role~~ (concept dropped 2026-05-08, see DECISIONS.md) · ~~3C Observability stack~~ (locked in WS2 §2G — `/war-room` Vercel page + Helicone for product API + Supabase Realtime; disler optional dev-only)
**Cost reality (delta to existing budget):** **+$5/mo** new spend (Cloudflare Workers Paid for Durable Objects). All other components either inside existing paid stack ($155/mo product) or absorbed by Anthropic Max subscription ($100/mo). Honest projection at 50 paying customers: +$100/mo Max-plan upgrade if smoke-test A fails. Honest projection at 100 paying customers: +$75/mo Inngest Pro.

---

## Table of contents

- [§ Executive summary (one screen)](#exec)
- [§ Locked decisions this BOM rests on](#locks)
- [§ 3A — BOM line items (every component pinned)](#3a)
  - [§ 3A.1 — Critical-path runtime (24/7 cloud)](#3a1)
  - [§ 3A.2 — Data + memory layer](#3a2)
  - [§ 3A.3 — Communication channels](#3a3)
  - [§ 3A.4 — Observability + cost guardrails](#3a4)
  - [§ 3A.5 — Product stack (Beamix app — referenced, not new)](#3a5)
  - [§ 3A.6 — Adam's dev workstation (no special role)](#3a6)
  - [§ 3A.7 — Out of scope / explicitly dropped](#3a7)
- [§ 3D — Cost-tracking instrumentation](#3d)
  - [§ 3D.1 — KPI: $/feature shipped](#3d1)
  - [§ 3D.2 — Burn-down report (monthly)](#3d2)
  - [§ 3D.3 — Live dashboards & alerts](#3d3)
  - [§ 3D.4 — What we do NOT instrument (intentionally)](#3d4)
- [§ 3E — DR runbook index](#3e)
- [§ 3F — Scaling cliffs (25 / 50 / 100 / 500 customers)](#3f)
- [§ Procurement / GDPR / multi-tenancy posture](#procurement)
- [§ Vendor lock-in summary (replacement matrix)](#lockin)
- [§ Owner accountability matrix](#owners)
- [§ Honest unknowns + smoke-test deferrals](#unknowns)
- [§ What changes downstream (WS4 / WS5 / WS6)](#downstream)

---

<a id="exec"></a>
## Executive summary

**The war room is Adam's internal AI agent army that BUILDS the Beamix product.** It has one user (Adam). It is NOT a customer-facing product. It does not need GDPR sub-processor lists, customer-facing IR SLAs, ZDR contractual claims, or cyber liability insurance — those concerns apply to Beamix-the-product and live in `docs/security/PRODUCT-COMPLIANCE-BACKLOG.md`.

The war room runs on **eight paid components and three free-tier components**, totalling **$160/mo today** and **$5/mo of war-room-incremental new spend** (Cloudflare Workers Paid). Every component is owned by Adam (single-operator stage). Every component has a documented failure mode, a detection mechanism, a stated replacement candidate, and a reversibility tier.

The single largest cost item is **Anthropic Claude Max ($100/mo)** which absorbs all war-room Routine token spend at current scale. The single largest concentration risk is **Anthropic** (account suspension or 12-hour outage halts every Routine simultaneously); mitigation is documented in `runbooks/anthropic-outage.md`.

The war room is **cloud-only** — Adam's home PC is a normal dev workstation with no production role. If the home PC is off, the war room continues. If Adam's laptop is off, the war room continues. The 24/7 critical path lives on Anthropic Routines (cloud), Cloudflare Workers (edge), Supabase (DB + memory), Vercel (product + `/war-room` page), and Inngest (durable execution).

**Cost discipline philosophy** (per Adam 2026-05-07/08): cost is not a hard limitation. The $5/mo Cloudflare Paid plan is approved. Mem0 stays on free Hobby tier; upgrade to $19/mo Starter on-demand only when Hobby errors begin (Adam Q1 2026-05-08). Cron Routine cap-hit (smoke-test A in WS4) → mitigation is Anthropic Max 20× upgrade (+$100/mo) per Adam's "cost not a limitation" rule. Roster cuts are explicitly NOT a mitigation lever (per `feedback_dont_cut_agent_roster.md`). Per Adam Q7 (2026-05-08): the war room does NOT push real-time cost alerts to Telegram. Cost is observed passively (`/war-room` page, monthly burn-down) and bounded silently (runaway-watcher kills sessions over budget without notification).

---

<a id="locks"></a>
## Locked decisions this BOM rests on

| Lock | Source | Why it matters here |
|---|---|---|
| L2 memory tool = Mem0 (cloud Phase 1 → OSS Phase 2) | DECISIONS.md 2026-05-06 (WS1A) | Mem0 cloud Hobby = $0 line item; Phase 2 hosting choice deferred to WS1F (board-meeting recommended) |
| Orchestration = Linear sub-ticket + Cloudflare bridge + Inngest durability | DECISIONS.md 2026-05-07 (WS2) | Cloudflare Workers Paid + Durable Objects required = $5/mo line item |
| Observability = `/war-room` Vercel page + Helicone for product API + Supabase Realtime | ORCHESTRATION.md §2G | No Langfuse / AgentOps — observability is in stack already |
| Bastion concept dropped (war room is cloud-only) | DECISIONS.md 2026-05-08 | No local Postgres mirror, no tmux farm, no `localhost:4000` hooks dashboard for production |
| No subscription OAuth on cloud VPS | `feedback_claude_code_oauth_ban_risk.md` | Routines fired via official `/fire` endpoint with per-Routine tokens; product code uses ANTHROPIC_API_KEY (Console billing) |
| Model rule (Q3 2026-05-07): Haiku simple, Sonnet default, Opus orchestration/synthesis/design | `feedback_model_routing_rule.md` | Affects Routine model assignments, classifier choice, embeddings model rationale |
| No timelines / weeks / sprints | `feedback_no_timeline_planning.md` | Scaling cliffs sized by *customer count*, not calendar |
| Don't cut agent roster for cost ceilings | `feedback_dont_cut_agent_roster.md` | Mitigation lever for cap-hit = plan upgrade, not roster reduction |
| Inngest free at MVP, Pro $75/mo at ~5 paying customers (corrected 2026-05-08 from $150/mo) | DECISIONS.md 2026-04-27 | Locks the Inngest scaling-cliff trigger |
| audit_log retention = 90d hot + 1y cold | DECISIONS.md 2026-05-07 (Q6) | Drives Supabase row count projections in scaling cliffs |
| Cloudflare Workers Paid plan = $5/mo APPROVED | DECISIONS.md 2026-05-07 (Q2) | New incremental line item |
| Mem0 free Hobby; upgrade to $19/mo Starter on-demand (NOT pre-paid) | Adam Q1 2026-05-08 | Mem0 stays $0/mo at MVP; trigger = Hobby errors or write-count >8K/mo |
| **No real-time cost alerts to Telegram** | Adam Q7 2026-05-08 | Cost observed passively; runaway-watcher silent kill; Console hard cap backstop |
| War room scope = internal infra, NOT customer product | Adam 2026-05-08 (course correction) | Procurement-grade compliance items (sub-processors, ZDR, IR SLA, cyber insurance, deputy) moved to `docs/security/PRODUCT-COMPLIANCE-BACKLOG.md` for the Beamix-product workstream |
| 7 DR runbooks (5 + github-compromise + mem0-outage); + 3 more (inngest/vercel/telegram) added in WS3 | Adam Q6 2026-05-08 | Coverage: anthropic, linear-api, cloudflare-compromise, supabase-corruption, secret-rotation, github-compromise, mem0-outage, inngest-outage, vercel-outage, telegram-failure |

---

<a id="3a"></a>
## 3A — BOM line items

Every component below is one of: critical-path runtime, data layer, channel, observability/guardrail, product stack, or dev workstation. Each gets the standard 9-field card.

<a id="3a1"></a>
### 3A.1 — Critical-path runtime (24/7 cloud)

#### Anthropic Claude Max 5×

- **Tier / cost:** $100/mo (already paid). May upgrade to Max 20× ($200/mo) post-smoke-test A.
- **Role:** Routine runtime (15 ad-hoc fires/day cap on Max 5×, ~60/day on Max 20×); Claude Code interactive sessions on Adam's dev machines; Memory Tool primitive; per-Routine bearer tokens for `/fire` endpoint.
- **Failure mode:** API outage; daily cap exhaustion; account suspension (per ban-risk research, OAuth-on-VPS pattern is the trigger — we are NOT doing this); rate-limit on burst.
- **Detection:** Anthropic Console (https://console.anthropic.com); cost-watchdog Inngest function (built WS4) alerts at >$5/h rolling cost; Telegram ping if `/fire` returns 429 twice in same day.
- **Replacement candidate:** Anthropic API direct billing on `ANTHROPIC_API_KEY` (still Anthropic, but Console-billed not subscription-billed) — already used for product code per ban-risk decision. NOT a real failover (still Anthropic). For true vendor-out: OpenAI Assistants API (different platform, cannot run Routines, 2-3 weeks of agent-prompt rework). Local Llama at our scale = quality cliff, not viable.
- **Owner:** Adam (account holder; single point of human approval).
- **Reversibility:** **HARD.** Routine config baked in; agent prompts assume Claude tone/tools; bearer tokens distributed across Cloudflare bridge + Adam's machines. Vendor swap = 2-3 weeks engineering.
- **Notes:** Cron Routines may or may not be exempt from the 15/day `/fire` cap — **DEFERRED to WS4 smoke-test A.** If exempt: $0 incremental beyond Max. If NOT exempt: upgrade to Max 20× ($200/mo) is the locked mitigation per Adam (NOT roster reduction).

#### Cloudflare Workers Paid plan

- **Tier / cost:** **$5/mo NEW spend (war-room incremental).** Approved Adam Q2 2026-05-07.
- **Role:** Webhook bridge (HMAC verify + Linear/Telegram/iOS routing); edge-side Haiku tier classifier (~$0.001/ticket); KV ticket-scoped dedup (Layer 1 idempotency); **Durable Objects** for strongly-consistent (routine_id, ticket_id) lock (Layer 2 idempotency — race-condition fix per WS2 R2.1); spec sentinel parser (R3.2 security); HMAC signing of trust-mode payloads (R3.1); cron triggers for the 8 standing Routines via `/fire`.
- **Failure mode:** Cloudflare account compromise; Worker code bug (deploys); KV regional propagation lag (mitigated by Durable Object Layer 2); CPU time per request limit (50ms on Paid, 1000ms on Unbound — well above current need); free-tier exhaustion (we're on Paid so n/a).
- **Detection:** Cloudflare dashboard request graph; failed-request alerts to Telegram via `runbooks/cloudflare-compromise.md`; weekly Inngest job inspects Worker error rate.
- **Replacement candidate:** Vercel Edge Functions (no Durable Objects equivalent — would need to move idempotency to Postgres advisory locks); AWS Lambda@Edge (heavier ops); Deno Deploy (no Durable Objects); self-host with WorkOS WEdges. **None are clean drop-ins.**
- **Owner:** Adam (Cloudflare account holder).
- **Reversibility:** **MEDIUM.** ~3-5 days to move bridge logic + idempotency primitives to Vercel + Postgres; bridge code is the "skinny" tier of the stack so this is tractable but not trivial.
- **Notes:** Workers Paid plan also includes 10M req/mo (we'll use ~50K), 1M Durable Object req/mo, 1M KV writes/mo. We are nowhere near these limits at solo scale; first cliff would appear post-100 customers.

#### Cloudflare R2

- **Tier / cost:** $0 (free tier: 10GB storage, 1M Class A ops, 10M Class B ops/mo).
- **Role:** Artifact storage (agent outputs >1MB, screenshots, PDF reports, log archives the audit_log doesn't hold).
- **Failure mode:** Free-tier overage charges if storage >10GB; account compromise (shared with Workers).
- **Detection:** Cloudflare R2 dashboard; monthly cost-watchdog reports R2 line item if non-zero.
- **Replacement candidate:** Supabase Storage (already in stack, easy fallback); AWS S3 ($0.023/GB).
- **Owner:** Adam.
- **Reversibility:** **EASY.** S3-compatible API; client config swap is one env var.
- **Notes:** Lifecycle rule: artifacts older than 90 days move to Glacier-equivalent OR delete (matches audit_log retention). Specified in WS4.

#### Cloudflare KV

- **Tier / cost:** $0 (free tier: 100K reads/day, 1K writes/day on free plan; on Workers Paid, included with much higher limits).
- **Role:** Layer 1 idempotency dedup (ticket-scoped 24h TTL); replay-prevention nonce store (per WS2 R3.4); rate-limit counters; ephemeral session state for the bridge.
- **Failure mode:** Eventual consistency lag (60s typical, mitigated by Durable Object Layer 2); regional unavailability.
- **Detection:** Bridge logs `kv_dedup_miss` events; Worker dashboard.
- **Replacement candidate:** Cloudflare Durable Objects (we already use them — could absorb KV's role at higher cost); Upstash Redis (free tier 10K req/day).
- **Owner:** Adam.
- **Reversibility:** **EASY.** Behind a thin Worker abstraction.
- **Notes:** KV is *intentionally* the cheap layer; Durable Objects are the precise layer. Both must exist for the WS2 R2.1 race-condition fix.

#### Cloudflare Durable Objects

- **Tier / cost:** Included in Workers Paid ($5/mo line item — same as the Workers Paid line above).
- **Role:** Strongly-consistent lock keyed `(routine_id, ticket_id)` — Layer 2 idempotency; prevents cross-region double-fires that KV's eventual consistency cannot.
- **Failure mode:** Single Durable Object instance per key — if it crashes, the lock is lost (Cloudflare auto-recovers within seconds); regional dependency (each DO has a home region).
- **Detection:** DO logs in Workers dashboard; bridge writes `audit_log` row `status: lock_lost` if DO unreachable.
- **Replacement candidate:** Postgres advisory locks (`pg_try_advisory_lock`) on Supabase — adds Supabase dependency to the bridge hot path (currently bridge is Supabase-independent).
- **Owner:** Adam.
- **Reversibility:** **MEDIUM.** Postgres advisory lock fallback is ~half a day of code; downside is bridge becomes Supabase-coupled.
- **Notes:** Race-condition fix for the WS2 critique R2.1 finding — without this, two Worker invocations in different regions can both miss the KV dedup and double-fire a Routine.

#### Anthropic Routines (cloud cron + on-demand)

- **Tier / cost:** $0 incremental (consumes Max subscription). Token costs in `audit_log.cost_usd` are budget caps, NOT new dollars.
- **Role:** 10 standing Routines per WS2 §2E (CEO Entry-point + 5 heartbeat + 3 signal + Synthesizer); the entire 24/7 brain of the war room.
- **Failure mode:** Same as Anthropic Claude Max line above (shared dependency); per-Routine bearer token leaked → abuse on that Routine only (90-day rotation per WS2 R3.12).
- **Detection:** `/war-room` Vercel page reads Supabase `claude_progress` for live Routine activity; cost-watchdog Inngest function; missing-heartbeat watcher (if Morning Digest doesn't write a `complete` audit_log row by 08:00 Israel, Auto-Unblock fires).
- **Replacement candidate:** Inngest cron + AnthropicAPI direct (still Anthropic; would migrate to ANTHROPIC_API_KEY billing for Console isolation); fully self-managed Trigger.dev v3 jobs calling Anthropic API. Both are 1-2 weeks of work.
- **Owner:** Adam.
- **Reversibility:** **MEDIUM-HARD.** Routine .md files (WS6) reference per-Routine config; bridge routes by Routine ID; replacement requires re-creating the cron schedule + token plumbing.
- **Notes:** The 10-Routine roster is sized for value, not for cost ceilings (per `feedback_dont_cut_agent_roster.md`). If smoke-test A reveals cron counts against cap, upgrade Max plan; do not cut roster.

#### GitHub Actions

- **Tier / cost:** $0 (private repo: 2,000 min/mo free; public: unlimited).
- **Role:** `qa-lead-pass` branch protection check (the structural enforcement of the QA gate per WS2 R3.8); future `claude-code-action@v1` for PR-level agent runs (config TBD in WS4 §4B); nightly QA cron; release tagging.
- **Failure mode:** Free-tier exhaustion (we use ~50 min/mo currently — well under); GitHub Actions outage (Status page); secrets leak via PR-from-fork (config: never run secret-using workflows on PR-from-fork — WS4 §4B).
- **Detection:** GitHub Actions dashboard; failed-check notification → Linear comment via webhook.
- **Replacement candidate:** GitLab CI (whole-platform move); Vercel CI (only PR previews, not merge gates).
- **Owner:** Adam.
- **Reversibility:** **MEDIUM.** Branch protection rules + workflow YAML are 1-2 days to recreate elsewhere.
- **Notes:** The `qa-lead-pass` check is the SECOND layer of QA gate enforcement (first layer = MCP grants, third layer = audit_log rule_violation row). All three layers per WS2 §2A "QA-Lead enforcement is structural."

<a id="3a2"></a>
### 3A.2 — Data + memory layer

#### Supabase Pro

- **Tier / cost:** ~$25/mo (already paid; Beamix product).
- **Role:** Customer data (users, scans, agent jobs); war-room `audit_log` + `audit_log_daily` + `claude_progress` tables (WS2 §2D §2G); pgvector for L3 (project facts) + L4 (skill embeddings) + L5 (codebase RAG); Mem0 OSS Phase 2 host (locked WS1A); product Auth (Supabase Auth); Realtime channel for `/war-room` page subscription.
- **Failure mode:** Database outage (Supabase Status page); regional unavailability; storage upgrade cliff (~100 customers per scaling cliffs §3F); accidental destructive migration (mitigated by PITR — included in Pro); RLS bypass via misconfigured service role key.
- **Detection:** Supabase Status page; Supabase advisor checks (run weekly via `mcp__supabase__get_advisors`); Vercel function errors on DB unreachable; cost-watchdog reports row count growth.
- **Replacement candidate:** Neon (Postgres-compatible, supports pgvector); RDS Postgres (heavier ops); self-host on Hetzner ($10-20/mo). All require Auth replatform (Clerk, Auth.js).
- **Owner:** Adam (project owner).
- **Reversibility:** **HARD.** Auth flows + RLS policies + PITR baseline + Mem0 OSS would all need to move. 1-2 weeks of work; risky.
- **Notes:** PITR is included in Pro and is the primary recovery for `runbooks/supabase-corruption.md`. Service role key is never exposed to the bridge or to client code — only server-side Vercel functions + Inngest jobs.

#### Mem0 cloud Hobby (Phase 1)

- **Tier / cost:** $0 (Hobby tier, no card; up to ~10K writes/mo).
- **Role:** L2 cross-session episodic memory (WS1A LOCKED 2026-05-06); MCP at `mcp.mem0.ai/mcp`; consumed by all 10 Routines + interactive Claude Code sessions.
- **Failure mode:** Hobby tier rate limits (unspecified); Mem0 GitHub issue #3400 (sustained-load blocker — DEFERRED to WS4 smoke-test C); vendor downtime; data export friction (mitigated by Phase 2 OSS migration).
- **Detection:** Mem0 dashboard; bridge logs `mem0_mcp_unavailable` if MCP unreachable; Auto-Unblock Routine pings Adam if memory writes fail >3 in 5 minutes.
- **Replacement candidate:** Anthropic Memory Tool (`memory_20250818` beta — ZDR-eligible, file-based, less retrieval power but acceptable fallback per WS2 §2C smoke-test C mitigation); custom MCP against pgvector (4-6 weeks build — rejected in WS1A).
- **Owner:** Adam.
- **Reversibility:** **EASY** (Phase 1 → fallback). **MEDIUM** (Phase 2 OSS migration is intentional, not failover).
- **Notes:** Phase 2 OSS migration locked to WS1F. Hosting choice for Phase 2 OSS is genuinely strategic (Cloudflare Workers vs Railway vs Fly.io vs in-cluster Supabase) — recommend `/board-meeting mem0-oss-hosting` when WS1F starts. Open question raised in `unknowns` section below.

#### OpenAI embeddings (text-embedding-3-large)

- **Tier / cost:** ~$0.10/mo at current corpus size ($0.13/M tokens; corpus ≈ 800K tokens, re-embedded incrementally).
- **Role:** L3-L5 vector embeddings (decisions, sessions, brain MOCs, codebase, skills); semantic search via pgvector; Mem0 cloud's internal embeddings (handled by Mem0 — this line item is for *our* RAG corpora not Mem0's).
- **Failure mode:** OpenAI API outage; rate limit; price change.
- **Detection:** Inngest embed job logs; weekly cost report.
- **Replacement candidate:** Self-hosted MiniLM (`all-MiniLM-L6-v2`, 23MB, runs on Vercel Edge or any modern machine, $0/run, lower quality); Voyage AI (cheaper, Anthropic-recommended); Cohere embed-v3.
- **Owner:** Adam.
- **Reversibility:** **EASY.** Re-embed entire corpus = one Inngest job, ~30 min, $5 max. Embedding model is a single line of config in `embed-*.ts` jobs.
- **Notes:** OpenAI as embedding vendor is intentional even though product runtime uses Anthropic — embeddings are a different concern with different price/perf curve. Voyage AI is the logical Phase 2 swap when Anthropic launches their own embedding model (rumored Q3 2026 — unverified).

#### git (GitHub repos as source of truth)

- **Tier / cost:** $0 (GitHub free, private repos unlimited).
- **Role:** All decisions, sessions, agent .md files, brain MOCs, runbooks, and code live in git. Hard rule from V4 env map: "anything written by an agent must end up in git OR Supabase. Never agent-only-knows state."
- **Failure mode:** Repo deletion (mitigated by branch protection + monthly local clone backup); GitHub outage.
- **Detection:** Standard git operations; weekly local clone freshness check.
- **Replacement candidate:** GitLab; self-host Gitea on Hetzner.
- **Owner:** Adam.
- **Reversibility:** **EASY.** git remotes are swap-able.
- **Notes:** Monthly local clone backup is the disaster recovery for "GitHub account compromise" — see `runbooks/cloudflare-compromise.md` template applies to GitHub equivalently (TBD: write `runbooks/github-compromise.md` if Adam wants — not in current 5-runbook scope).

<a id="3a3"></a>
### 3A.3 — Communication channels

#### Linear (Standard or Free)

- **Tier / cost:** $0 (free for solo) — may upgrade to Standard ($8/mo) for SSO/SAML or workflow Automations once paying customers exist.
- **Role:** **THE canonical work surface.** Every task lives here. Webhook source for the Cloudflare bridge. MCP target for every C-suite Routine. Issue labels (`agent:cto`, `tier:full`, `risk:irreversible`, etc.) drive routing.
- **Failure mode:** Linear API outage (rare, ~99.9% uptime per Status page); API breaking change (`runbooks/linear-api-break.md`); webhook delivery failure (Linear retries 3× over 7h).
- **Detection:** Linear Status page; Cloudflare Worker logs `linear_api_error`; missing webhooks detected by Morning Digest opening "manual re-fire" tickets for orphans.
- **Replacement candidate:** GitHub Issues + Projects (would lose Linear's polished mobile + label semantics); Plane.so (open-source, self-host); Height.app. **None are no-brainer swaps** — Linear's mobile UX is load-bearing for "Adam approves PRs from the car."
- **Owner:** Adam.
- **Reversibility:** **HARD.** Label vocabulary (`agent:*`, `tier:*`, `risk:*`, `decision_type:*`) ripples through bridge config + every Routine + every WS6 agent .md. Per WS2 §reversibility table — "ripples through CEO prompts, bridge config, every C-suite, future agents."
- **Notes:** Linear MCP is mature and ships in `linear-automation` skill. Free tier is generous for solo; upgrade trigger is "first paying customer requests SSO" — not before.

#### Telegram bot

- **Tier / cost:** $0 (Telegram Bot API is free; relay Worker on Cloudflare).
- **Role:** Ad-hoc text/voice → CEO routing; binary-ping escalation when an agent is BLOCKED (Auto-Unblock pings after 3 self-resolve attempts); cost-watchdog alerts; deploy notifications.
- **Failure mode:** Telegram Bot API rate limits (30 msg/sec per bot — well above need); bot token leaked (rotation via BotFather); Telegram outage.
- **Detection:** Cloudflare Worker logs `telegram_send_failed`; alternative escalation = Linear comment if Telegram unavailable.
- **Replacement candidate:** iMessage Channel (Anthropic-published, CarPlay-compatible — could replace Telegram for binary-ping use case); Pushover ($5 one-time); ntfy.sh (self-host or hosted).
- **Owner:** Adam (bot owner via BotFather).
- **Reversibility:** **EASY.** Bot routing is a Worker config + 50-line script.
- **Notes:** Telegram is preferred over iMessage Channel because it works on every device Adam has (phone + watch + Mac + web), while iMessage is Apple-only. iMessage Channel is the *acceleration* for CarPlay use case (TBD whether to add — out of scope this BOM).

#### iOS Shortcut (voice → Linear ticket)

- **Tier / cost:** $0 (built-in iOS).
- **Role:** Voice idea capture (Siri shortcut → Anthropic API Haiku → Linear ticket creation via API); the "in-the-car" workflow per V4 env map.
- **Failure mode:** Shortcut breaks on iOS update; SHORTCUT_SECRET leaked (rotate via Shortcut export); voice dictation accuracy on noisy backgrounds.
- **Detection:** Linear ticket creation count (if Adam normally captures 5 ideas/week and goes to 0, something broke); manual Adam check.
- **Replacement candidate:** Telegram voice messages + Whisper transcription → Linear (Worker-side, more code); Apple Watch dictation directly into Linear mobile app (no automation).
- **Owner:** Adam (Shortcut on his iCloud).
- **Reversibility:** **EASY.** Single Shortcut file, exportable.
- **Notes:** The Shortcut export will live in `infra/shortcuts/Capture-Beamix-Idea.shortcut` (created in WS4 §4D). SHORTCUT_SECRET is an HMAC bearer the Worker validates on `/idea-capture` endpoint.

<a id="3a4"></a>
### 3A.4 — Observability + cost guardrails

#### `/war-room` Next.js page (on Vercel)

- **Tier / cost:** $0 incremental (lives inside existing Vercel Pro project).
- **Role:** Production observability surface — live `claude_progress` Realtime feed + today's `audit_log` + cross-Routine trace view (`parent_audit_log_id` tree); auth-gated to Adam's email; cost attribution per Routine.
- **Failure mode:** Vercel outage (rare); Supabase Realtime channel dropped (auto-reconnect with 10s polling fallback per WS2 §2G); auth bypass (mitigated by middleware + RLS).
- **Detection:** Vercel function errors; user-side: page load failure visible to Adam.
- **Replacement candidate:** Langfuse Cloud free tier (mid-quality, would need integration code — not free of effort); AgentOps (burns out fast at Routine volume per WS2 critique findings).
- **Owner:** Adam.
- **Reversibility:** **EASY.** It's a Next.js page reading two Supabase tables — replaceable in any framework.
- **Notes:** Built in WS4 §4F equivalent. Cost attribution is computed from `audit_log.cost_usd` SUMs grouped by `agent`.

#### Helicone (proxy for product API code)

- **Tier / cost:** $0 (free tier: 10K req/mo — covers product code at MVP scale).
- **Role:** **MANDATORY** for product code Anthropic API calls (per WS2 R3.7 — was incorrectly "optional" pre-critique). Hard per-request token caps; cost dashboard; latency monitoring; request replay for debugging. **NOT in front of Anthropic Routines** (those run on Max subscription, Helicone doesn't sit in that path — observability for Routines is Supabase audit_log + `/war-room` page).
- **Failure mode:** Helicone outage → product API calls fail (mitigated by `HELICONE_FALLBACK_DIRECT=true` env var that bypasses to Anthropic API directly with a logged warning); free-tier exhaustion at scale.
- **Detection:** Helicone dashboard; Vercel function errors; weekly cost-watchdog reports if Helicone count diverges from Anthropic Console count.
- **Replacement candidate:** Portkey (similar product, similar tier); LangSmith (observability-focused, no proxy mode); custom OTel + Datadog (overkill).
- **Owner:** Adam.
- **Reversibility:** **EASY.** Helicone is a base URL change in the Anthropic SDK config — one env var.
- **Notes:** Helicone scaling cliff = 10K req/mo (~5-10 paying customers). Pro tier $20-50/mo at that point — within budget.

#### cost-watchdog Inngest function

- **Tier / cost:** $0 (Inngest free tier; ~720 runs/mo at hourly cron).
- **Role:** Hourly cron — sums `audit_log.cost_usd` rolling 1h window. If >$5/h (8× normal baseline), Telegram-pings Adam. Built in WS4 §4F equivalent.
- **Failure mode:** Inngest outage (cost-watchdog stops; runaway-watcher is the second layer); Supabase audit_log read failure (function errors visible in Inngest dashboard).
- **Detection:** Inngest dashboard; missing-heartbeat alarm if cost-watchdog hasn't run in >2h.
- **Replacement candidate:** Vercel cron (free tier exists, less observability); Cloudflare Worker cron (same cost as bridge).
- **Owner:** Adam.
- **Reversibility:** **EASY.** Self-contained Inngest function.
- **Notes:** Threshold is a config constant — tune after first month of real usage.

#### runaway-watcher Inngest function

- **Tier / cost:** $0 (Inngest free tier; ~300 runs/mo).
- **Role:** Fires on `audit_log` insert where `cost_usd > $1`. Triple-checks against the spec's `max_cost_usd`. Kills session via Anthropic API per-Routine token revocation if accrued > `max_cost_usd × 1.2`.
- **Failure mode:** Token revocation API unavailable → fall back to Telegram-ping; bug in cost arithmetic → over- or under-kill (mitigated by 1.2× headroom).
- **Detection:** Inngest dashboard; Telegram alert on every kill action (high-signal, low-volume).
- **Replacement candidate:** Custom Worker on Cloudflare cron (denser than Inngest for low-frequency event-driven).
- **Owner:** Adam.
- **Reversibility:** **EASY.**
- **Notes:** This is the second layer of cost cap (first layer = spec's `max_cost_usd`, third layer = Anthropic Console hard cap $1500/mo).

<a id="3a5"></a>
### 3A.5 — Product stack (Beamix app — referenced, not new spend)

These are existing line items in Adam's budget. Listed here so the BOM is complete and the war room knows what it shares dependencies with.

| Component | $/mo | Role | Shared with war room? |
|---|---|---|---|
| Vercel Pro | ~$20 | Beamix product hosting + `/war-room` page + Inngest hosting | Yes (`/war-room` page lives in same project) |
| Supabase Pro | ~$25 | Customer data + war-room tables + memory layer | Yes (heavily) |
| Inngest free tier | $0 | Product jobs (paid scans, content generation) + war-room durability layer | Yes (8 war-room functions per WS2 §2C) |
| Paddle | $0 fixed (revenue share) | Payments | No (war room doesn't bill) |
| Resend | ~$10 | Transactional email | No directly (war room may use it for digest emails to Adam — TBD) |
| OpenRouter (legacy product LLM gateway) | $0 + per-call | Per `OPENROUTER_SCAN_KEY` and `OPENROUTER_AGENT_KEY` | No (war room uses Anthropic direct + Mem0 + Helicone for product) |

**Subtotal product stack:** ~$55/mo. Paid pre-war-room.

<a id="3a6"></a>
### 3A.6 — Adam's dev workstation (no special role per Bastion drop)

The home PC and laptop are Adam's working machines. They have **no production role** in the war room post-2026-05-08. Listed for completeness.

| Item | $/mo | Role |
|---|---|---|
| Adam's iPhone (Linear / Telegram / GitHub mobile / claude.ai mobile) | $0 (owned) | Primary control surface |
| Adam's Mac (interactive Claude Code, browser, dev sessions) | $0 (owned) + ~$3 electricity if always on | Acceleration for interactive sessions; NOT critical path |
| Adam's home PC | $0 (owned) | Same as Mac. No special role. |
| Apple Watch (Telegram pings) | $0 (owned) | Binary-ping receipt |
| Tailscale | $0 (free, 3 devices) | Optional — secure SSH between Adam's machines. NOT used in war-room production path. |
| disler hooks dashboard (optional) | $0 (OSS) | Captures Adam's interactive Claude Code sessions on whichever machine he installs it on. Does NOT capture cloud Routine activity (they cannot reach `localhost:4000`). |

<a id="3a7"></a>
### 3A.7 — Out of scope / explicitly dropped

Listed so future agents don't re-propose them.

| Component | Why dropped |
|---|---|
| Bastion (home Mac as production node) | Dropped 2026-05-08 (DECISIONS.md). War room is cloud-only; Adam's home PC has no production role. |
| Local Postgres mirror | Bastion-only — same drop. |
| tmux farm of `claude -p --bare` | Subscription OAuth on home PC = OK (Anthropic ToS sanctioned), but it was V3 acceleration for the dropped Bastion. Adam can still run interactive `claude` sessions on his home PC; just not as a war-room critical-path node. |
| Letta / Mem0 OSS Phase 2 hosting on dedicated VPS | Adam's directive 2026-05-07 prefers in-stack solutions; Phase 2 OSS hosting decision deferred to WS1F + recommended `/board-meeting`. |
| Cursor Background Agents ($60-120/mo) | V2 plan; superseded by Anthropic Routines (V3+). |
| Inngest AgentKit + E2B sandboxes ($100/mo) | Premature at solo scale; Inngest free tier covers war-room load. |
| Devin / Manus / Bolt / Lovable / Replit Agent | V4 evaluation: overkill at solo scale, $100s/mo, lock-in. |
| Self-hosted Langfuse / Helicone | V3+ evaluation: 8GB Mac too small; Helicone Cloud + `/war-room` page covers 80% at $0. |
| Pushover / ntfy.sh / Pushcut | Telegram bot covers all use cases for free. |
| Local LLMs (Llama, Mistral) | 8GB can't run useful sizes; Haiku at $1/M is cheaper and higher quality. |
| Custom Vercel agent dashboard (separate from `/war-room`) | `/war-room` IS that dashboard. One surface, one auth gate. |

---

<a id="3d"></a>
## 3D — Cost-tracking instrumentation

Three layers of cost visibility, each owns a different question.

| Layer | Source | Question it answers | Cadence |
|---|---|---|---|
| **Live** | `claude_progress.cost_usd` per session | "What's burning right now?" | Realtime via `/war-room` page |
| **Today** | `audit_log.cost_usd` aggregated per day | "Is today on budget?" | Hourly via cost-watchdog |
| **This month** | `audit_log_daily` rollup | "Are we trending over?" | Daily via burn-down report |
| **$/feature shipped** | `audit_log` joined to Linear ticket → PR-merged event | "Is the war room economical?" | Weekly Friday Retro |

<a id="3d1"></a>
### 3D.1 — KPI: $/feature shipped

**Definition:**
```
$/feature_shipped = SUM(audit_log.cost_usd WHERE linear_ticket IN tickets_closed_done_this_week)
                  / COUNT(distinct linear_ticket WHERE status_changed_to_done_this_week AND has_pr_merged)
```

- **Numerator:** All Routine + Helicone product spend tied to tickets that closed `Done` this week. Includes parent + sub-tickets recursively (`parent_audit_log_id` traversal).
- **Denominator:** Distinct parent Linear tickets that closed `Done` AND had a PR merged into `main` (filters out admin-only tickets like "update copy" that don't ship code). For non-code tickets (research, design), the denominator is broader — see "Sub-KPI" below.

**Sub-KPI: $/decision finalized.** For non-code tickets, swap "PR merged" with "DECISIONS.md entry written + Adam approval comment." Tracks the cost of think-work separately from ship-work.

**Target:** Initially $5-15 per code feature; $1-3 per decision finalized. Refined after first month of telemetry.

**Anti-Goodhart:** This metric will tempt agents to declare features done prematurely. Counter-measure: QA Lead PASS is required for the ticket to count toward the denominator. A ticket marked `Done` without QA Lead PASS = `audit_log` row `status: rule_violation` and the ticket does NOT count.

<a id="3d2"></a>
### 3D.2 — Burn-down report (monthly)

Format: a single Markdown file at `docs/09-metrics/cost-burn-YYYY-MM.md`, generated nightly by `audit-log-rollup` Inngest function and updated to month-to-date.

**Sections:**
1. **Headline:** "$X spent / $Y budget" (budget = $5/mo Cloudflare + accumulated Mem0 if past free tier + accumulated Inngest if past free tier; Anthropic Max is fixed-cost subscription so it's a separate line).
2. **By component:** Cloudflare / Mem0 / Inngest / Helicone / OpenAI embeddings / (other).
3. **By Routine:** which of the 10 standing Routines burned what.
4. **By tier:** Quick / Lite / Full task burn (helps catch over-classification).
5. **By customer (post-MVP):** if multi-tenant launches, $/customer attribution.
6. **Anomalies:** any day >2× normal; any Routine >2× its 30-day moving average; any session that hit `runaway-watcher` kill threshold.
7. **Forecast vs cliff:** if any line item is trending toward a scaling-cliff trigger (§3F), flag it.

**Generated by:** `audit-log-rollup` Inngest function (built WS4). Posted to a dedicated Linear ticket each month. Friday Retro Routine reads it during weekly synthesis.

<a id="3d3"></a>
### 3D.3 — Live dashboards & alerts

**Cost-alert philosophy locked by Adam Q7 (2026-05-08):** the war room does NOT push real-time cost alerts to Telegram. Adam does not want to be paged about money rate. Instead, cost is observed passively (when Adam looks) and bounded automatically (silent kill actions inside the war room).

**Passive observability surfaces (Adam looks when he wants):**

| Surface | What it shows | Built where |
|---|---|---|
| `/war-room` Next.js page | Live `claude_progress`, today's `audit_log`, cross-Routine trace tree, cumulative cost today | `apps/web/src/app/(internal)/war-room/page.tsx` (WS4) |
| Helicone dashboard | Product API per-request cost + latency (NOT Routines) | helicone.ai/dashboard |
| Anthropic Console | Subscription cap consumption + per-day token graph | console.anthropic.com |
| Monthly burn-down report | Cost by component / Routine / tier | `docs/09-metrics/cost-burn-YYYY-MM.md` |

**Silent safety fences (no notifications, just enforcement):**

| Mechanism | Action | Notification |
|---|---|---|
| `runaway-watcher` Inngest function | If session `cost_usd > 1.2 × spec.max_cost_usd`, revoke per-Routine bearer token to kill the session | NO Telegram. Writes `audit_log` row `status: over_budget` for forensics. |
| Anthropic Console hard cap | $1500/mo absolute backstop set by Adam in Console | Anthropic emails Adam if hit (vendor-side) |

**System-status alerts (NOT cost alerts; these signal infrastructure problems):**

| Trigger | Channel | Severity |
|---|---|---|
| `audit_log.status = rule_violation` (QA Lead bypass attempt) | Telegram | P0 (security, not cost) |
| Anthropic Status page incident OR `/fire` 5xx ≥3 in 5min | Telegram | P0 |
| Linear Status page incident OR webhook silence >24h | Telegram | P1 |
| Cloudflare Worker errors clustering | Telegram | P0 (security risk) |
| Supabase advisor ERROR-level finding | Telegram (next-morning, weekly cron) | P1 |
| Auto-Unblock fires after 3 self-resolves fail | Telegram (binary-ping with A/B options) | P1 |

**REMOVED per Q7:**
- ❌ Rolling 1h cost watchdog Telegram ping (would false-positive on every Friday Retro and Full-tier fan-out)
- ❌ Webhook-storm cost alert
- ❌ Per-Routine cost-rate anomaly Telegram alert
- ❌ "Daily burn vs forecast" P3 next-morning ping
- ❌ Anthropic 429 cap-hit Telegram alert (visible passively in `/war-room` page; runaway-watcher kill action is the bound)

If Adam wants to see cost trajectory, he opens the `/war-room` page or reads the monthly burn-down. The war room never pages him about money.

<a id="3d4"></a>
### 3D.4 — What we do NOT instrument (intentionally)

- **Per-token-level Routine attribution** — Anthropic doesn't expose per-message tokens via the Routines API. We attribute at the session level (`audit_log.cost_usd` from session-end summary). Per-token breakdown would require Helicone-in-front-of-Routines, which is impossible (Routines don't proxy through Helicone).
- **Memory write counts to Mem0** — Hobby tier doesn't have per-call telemetry. Track via Mem0 dashboard manually until we hit the 10K/mo trigger.
- **Embedding cost per re-embed event** — Trivial (~$0.10/mo at current corpus). Roll into "OpenAI embeddings" line item.
- **GitHub Action minute usage** — GitHub UI shows it; not worth replicating.

---

<a id="3e"></a>
## 3E — DR runbook index

Five runbooks live at `docs/07-history/runbooks/`. Each follows the template in the WS3 hand-off (Detection / Immediate / Mitigation / Recovery / Post-incident / Decision tree).

| Runbook | Scenario | Severity | When it triggers |
|---|---|---|---|
| `anthropic-outage.md` | Anthropic API or Routine platform unavailable | P0 if >30 min, P1 if <30 min | Anthropic Status page + cost-watchdog detects zero Routine activity |
| `linear-api-break.md` | Linear API breaking change OR Linear outage | P1 (work continues but is invisible) | Cloudflare Worker logs `linear_api_4xx` spike OR webhooks stop arriving |
| `cloudflare-compromise.md` | Cloudflare account compromise (bridge token theft, Worker tampering) | P0 | Cloudflare audit log shows unrecognized API token use OR Worker route changed without Adam |
| `supabase-corruption.md` | Destructive migration applied; data loss; corruption | P0 | `audit_log` shows missing rows OR Supabase advisor flag OR application errors on schema mismatch |
| `secret-rotation.md` | 90-day routine rotation OR emergency rotation on suspected leak | P2 (routine), P0 (emergency) | Calendar (90d) OR detected leak |

---

<a id="3f"></a>
## 3F — Scaling cliffs

Sized by paying-customer count, not by calendar (per `feedback_no_timeline_planning.md`). Each cliff has a trigger metric the cost-watchdog can detect; mitigation locked.

### 5 paying customers — Inngest free tier

- **What breaks:** Inngest free tier limits at 50K function executions/month. War-room baseline is ~5,000-6,500 executions/mo (this is conservatively re-estimated post-WS3 critique — `step.run` calls multiply against the limit; cost critic confirmed the original 6,500 estimate was within order of magnitude for war-room only, but combined with product Inngest usage at scale, totals approach ceiling earlier than expected). Product use of Inngest (paid scans, content jobs, agent execution) pushes the total. At 5 paying customers each running ~5 scans/mo (each scan is a multi-step Inngest function with ~5-10 steps), we add ~125-250 product executions/mo. The cliff trigger is the locked decision, not a customer-count derivation: per DECISIONS.md 2026-04-27, migrate at 5 paying customers OR 75% of free-tier ceiling, whichever fires first.
- **What to add:** Inngest Pro tier ($75/mo, 1M executions, 100+ concurrent steps) — locked decision (DECISIONS.md 2026-04-27, corrected 2026-05-08 from $150/mo to verified $75/mo via inngest.com/pricing).
- **$/mo delta:** **+$75**.
- **Trigger metric:** Inngest dashboard rolling-30-day executions >40,000 OR paying customer count ≥5, whichever fires first.
- **Lead time:** 1-click upgrade; no engineering work.
- **Source of truth:** Inngest dashboard.

### 50 paying customers — Anthropic Max 5× cap

- **What breaks:** 15 ad-hoc `/fire` calls per day on Max 5×. At 50 customers each generating ~1 customer-driven Routine fire per week (support tickets, custom agent runs), we hit ~7-10 fires/week from customer load alone — plus ~5-8 daily war-room fires. Total: ~15-20/day, hitting cap on busy days.
- **Conditional trigger:** ONLY if smoke-test A reveals cron Routines also count against cap (currently assumed exempt). If exempt, the cap is consumed by Adam-driven + customer-driven fires only, and this cliff slides to ~150 customers.
- **What to add:** Upgrade to Anthropic Max 20× ($200/mo, ~60 fires/day cap).
- **$/mo delta:** **+$100** (relative to current $100/mo Max 5×).
- **Trigger metric:** `/fire` 429 responses average >2/day for 1 week (per WS3 hand-off template).
- **Lead time:** Self-serve upgrade in Anthropic Console; takes effect immediately.
- **Source of truth:** Anthropic Console + `audit_log.status = rate_limited`.

### 100 paying customers — Supabase row counts

- **What breaks:** `audit_log` row count grows ~20-30 rows per Routine fire (parent + workers + watcher writes). At 100 customers driving ~50 fires/day each on average + war-room baseline, we generate ~50K-100K rows/day. With 90-day retention, that's 4.5M-9M rows in `audit_log` alone — Supabase Pro starts to struggle on full-table scans without aggressive indexing.
- **What to add:** Either (a) Supabase compute upgrade ($25-100/mo depending on tier) OR (b) more aggressive `audit_log_daily` rollup (compress to daily summaries after 30d instead of 90d) OR (c) drop to 30d hot retention. Recommend (b) first — keeps cost flat.
- **$/mo delta:** **$0-100** depending on path. Path (b) = $0.
- **Trigger metric:** `audit_log` table row count > 500K OR query p95 latency > 500ms.
- **Lead time:** (b) is a SQL migration, ~2h. (a) is 1-click but re-evaluation expected.
- **Source of truth:** Supabase dashboard + `mcp__supabase__get_advisors`.

### 100 paying customers — Helicone free tier

- **What breaks:** Helicone free tier = 10K requests/mo. At 100 customers each driving ~50 product API calls/mo (scans, agent jobs), we hit ~5K-15K req/mo. Cliff trips around 100 customers.
- **What to add:** Helicone Pro ($20-50/mo).
- **$/mo delta:** **+$20-50**.
- **Trigger metric:** Helicone dashboard usage > 8K req/mo.
- **Lead time:** Self-serve.
- **Source of truth:** Helicone dashboard.

### Day-1 to ~10K writes/mo — Mem0 cloud Hobby → Starter (on-demand upgrade per Adam Q1)

- **What breaks:** Mem0 Hobby's actual write limit is publicly unspecified (the "~10K writes/mo" estimate cited in earlier drafts was unverified). The honest position: war-room baseline (10 Routines × ~30 memory writes/day) is ~9K writes/mo before any customer exists. We may hit Hobby's rate limit at any point, possibly Day 1.
- **Strategy locked by Adam Q1 (2026-05-08):** stay on free Hobby tier at MVP. Do NOT pre-pay for Starter. When write-count monitor or Mem0 MCP errors signal exhaustion, upgrade to Starter ($19/mo) on-demand via Mem0 dashboard (1-click, immediate effect).
- **$/mo delta when triggered:** **+$19/mo** (Mem0 Starter).
- **Trigger metric:** Two signals, either fires the upgrade: (a) Mem0 dashboard write count >8K/mo (visible in monthly burn-down §3D.2); (b) MCP errors during normal Routine operation — `audit_log.status = mem0_error` rows clustering. The `mem0-outage.md` runbook describes the upgrade path.
- **Lead time:** 1-click upgrade in Mem0 dashboard. <5 min to Starter tier.
- **Long-term ceiling:** Mem0 Starter holds until WS1F Phase 2 OSS migration (self-hosted on Supabase Postgres+pgvector, locked WS1A). Adam wanted to skip pre-paying.
- **Source of truth:** Mem0 dashboard write count + `audit_log.status` Mem0 error rows.

### 500 paying customers — Cloudflare Workers Paid limits

- **What breaks:** Workers Paid plan = 10M req/mo, 1M Durable Object req/mo, 50ms CPU per request (1000ms on Unbound). Webhook + bridge + classifier load per customer = ~50-100 Worker req/mo. At 500 customers + war-room baseline = ~50K-100K Worker req/mo — well under 10M. Durable Object usage = ~1-2 lock acquisitions per fan-out, ~10K-20K/mo. Also far under 1M. CPU is the only realistic cliff: classifier (Haiku call) might exceed 50ms p99 under contention.
- **What to add:** Cloudflare Workers Unbound ($5/mo same line, 1000ms CPU); OR move classifier to Anthropic API direct from Inngest (no edge classifier).
- **$/mo delta:** **$0** (Unbound is same Paid plan).
- **Trigger metric:** Worker dashboard CPU p99 > 40ms OR `cpu_exceeded` errors logged.
- **Lead time:** 1-config-line change.
- **Source of truth:** Cloudflare Workers dashboard.

### 500 paying customers — Vercel Pro bandwidth

- **What breaks:** Vercel Pro includes 1TB bandwidth/mo. Product traffic at 500 customers + `/war-room` page Realtime + Inngest function executions can approach this.
- **What to add:** Vercel additional bandwidth (~$40/100GB) OR move `/war-room` page off Vercel.
- **$/mo delta:** **+$40-100/mo**.
- **Trigger metric:** Vercel usage dashboard > 700GB/mo (70% of plan).
- **Lead time:** Self-serve overage purchase.
- **Source of truth:** Vercel dashboard.

### 500 paying customers — Supabase storage / compute

- **What breaks:** Supabase Pro = 8GB DB, 100GB storage. Customer scan history + audit_log + claude_progress accumulate. At 500 customers averaging 5MB DB row footprint = 2.5GB DB. With audit_log at this scale (post-rollup), expect 3-5GB. Within Pro for now; cliff is post-1000 customers most likely.
- **What to add:** Supabase compute add-on (~$60/mo for next tier) OR pgvector index optimization to reduce footprint.
- **$/mo delta:** **+$60-200/mo** depending.
- **Trigger metric:** Supabase dashboard DB size > 6GB OR query p95 > 1s on common indexes.
- **Lead time:** Self-serve.
- **Source of truth:** Supabase dashboard.

### Summary table

| Customers | Cliff | $/mo delta | Trigger | Mitigation lead time |
|---|---|---|---|---|
| **Day 1 → ~10K writes/mo** | Mem0 Hobby → Starter (on-demand) | +$19 | write-count >8K/mo OR mem0_error rows | 1-click |
| **5** | Inngest free tier (per locked DECISIONS.md 2026-04-27) | +$75 | rolling-30d runs >40K OR 5 paying customers | 1-click |
| **50** | Anthropic Max 5× cap (conditional on smoke-test A) | +$100 | `/fire` 429s >2/day for 1 week | 1-click |
| **100** | Supabase row count | $0-100 | audit_log >500K rows OR p95 >500ms | 2h SQL migration |
| **100** | Helicone free tier | +$20-50 | >8K req/mo | 1-click |
| **First contractor hire** | Vercel Pro per-member | +$20 | adding any non-Adam member to Vercel team | 1-click |
| **500** | Cloudflare Worker CPU | $0 | CPU p99 >40ms | 1-config (Unbound binding) |
| **500** | Vercel bandwidth | +$40-100 | >700GB/mo | 1-click |
| **500** | Supabase storage/compute | +$60-200 | DB >6GB OR p95 >1s | 1-click |

**Total cliff cost at 500 customers (corrected math, worst case):**
- Baseline: $160/mo
- Day-1 Mem0 Starter: +$19
- Customer-5 Inngest Pro: +$75
- Customer-50 Anthropic Max 20×: +$100 (conditional)
- Customer-100 Supabase compute: +$100
- Customer-100 Helicone Pro: +$50
- First contractor: +$20
- Customer-500 Vercel bandwidth: +$100
- Customer-500 Supabase storage: +$200
- **Subtotal upgrades:** ~$664/mo
- **Total at 500 customers (worst case):** $160 + $664 = **~$824/mo**

(Earlier draft said "$580-720/mo" — that was the *optimistic* scenario. Worst case is ~$824/mo.)

At Discover $79 / Build $189 / Scale $499 pricing, even a 50/40/10 customer mix at 500 customers = ~$130K MRR. Infrastructure stays well under 1% of revenue.

---

<a id="procurement"></a>
## Scope note — war room is internal infra, not a customer-facing product

**The war room is Adam's internal AI agent army that BUILDS Beamix.** It has one user: Adam. It does NOT have paying customers. It does NOT publish a `/security` page. It does NOT need GDPR sub-processor lists, ZDR contractual claims, customer-facing incident response SLAs, EU SCCs, cyber liability insurance backing customer DPAs, GDPR Article 30 ROPA, or pen-test cadence as SOC 2 evidence.

Those concerns ARE real — they apply to **Beamix-the-product** (the GEO platform with paying customers, board-meeting-locked Scale-tier $499/mo DPA with $25K/incident indemnification clause, etc.). They are **out of scope for WS3** and have been moved to a product-compliance backlog at `docs/security/PRODUCT-COMPLIANCE-BACKLOG.md` for handling in a separate product workstream when Beamix-the-product approaches Scale-tier sales.

What the war room itself DOES need (and is already covered in this BOM):
- HMAC-bridged trust spec contract (WS2 R3.1) — prevents arbitrary Linear comments from issuing trust specs that hijack Adam's war room.
- 90-day secret rotation cadence (`runbooks/secret-rotation.md`) — leaked tokens give attackers war-room control.
- DR runbooks for war-room dependencies (Anthropic, Cloudflare, Supabase, Inngest, Vercel, Linear, Telegram, Mem0, GitHub, secrets) — recovery procedures.
- Audit log of every agent action (`audit_log` schema in WS2 §2G) — forensics if war room is compromised.
- Cloudflare Workers Paid for Durable Object idempotency (WS2 R2.1) — prevents race-condition double-fires.

These are **operational hygiene for a single-operator's automation platform**, not enterprise-customer compliance artifacts.

---

<a id="lockin"></a>
## Vendor lock-in summary (replacement matrix)

| Component | Lock-in tier | Why | Replacement effort |
|---|---|---|---|
| Anthropic | **HARD** | Routine config + agent prompts + Memory Tool semantics + Claude tone | 2-3 weeks; OpenAI Assistants API closest equivalent |
| Linear | **HARD** | Label vocabulary baked into bridge + every Routine + every WS6 agent | 1-2 weeks; GitHub Issues closest equivalent (would lose mobile UX) |
| Supabase | **HARD** | Auth + RLS + PITR + pgvector + Mem0 OSS Phase 2 host | 1-2 weeks; Neon closest equivalent (Auth replatform required) |
| Vercel | **MEDIUM** | Next.js native + Inngest hosting | 3-5 days; Cloudflare Pages or Netlify viable |
| Cloudflare (Workers + R2 + KV + DO) | **MEDIUM** | Durable Objects has no clean equivalent; KV is generic | 3-5 days; Vercel Edge + Postgres advisory locks viable |
| Inngest | **MEDIUM** | Function definitions + waitForEvent + fan-in semantics | 2-3 days; Trigger.dev v3 closest equivalent |
| Mem0 cloud | **EASY** | MCP-abstracted; Phase 2 OSS migration is intentional | <1 day to swap to Anthropic Memory Tool fallback |
| OpenAI embeddings | **EASY** | Single config line; re-embed corpus is one job | <1 day |
| GitHub Actions | **MEDIUM** | Workflow YAML + branch protection rules | 1-2 days; GitLab CI viable |
| Helicone | **EASY** | Base URL change in Anthropic SDK | <1 day |
| Cloudflare R2 | **EASY** | S3-compatible API | <1 day |
| Cloudflare KV | **EASY** | Generic key-value | <1 day; Upstash Redis viable |
| Telegram Bot API | **EASY** | Replace with iMessage Channel or Pushover | 1-2 days |
| Paddle | **HARD** | Merchant of record relationships, VAT registration, customer subscriptions | Multi-week (out of WS3 scope) |
| Resend | **EASY** | Standard SMTP / transactional API | <1 day; SES viable |

**Concentration risk:** Anthropic is the single largest concentration. A 12h Anthropic outage halts every Routine. Mitigation = `runbooks/anthropic-outage.md` + Adam-acceptance that this is a calculated bet (alternatives at this quality tier don't exist).

---

<a id="owners"></a>
## Owner accountability matrix

Adam is owner of every line today (single operator). When the war room hires, ownership delegates per role:

| Component category | Today (Adam) | Future (delegated to) |
|---|---|---|
| Anthropic / Routines | Adam | CTO Routine recommends; Adam approves cap upgrades |
| Cloudflare (Workers / R2 / KV / DO) | Adam | DevOps Lead worker |
| Supabase / DB | Adam | Database Engineer worker (executes); CTO approves migrations |
| Linear / GitHub / Telegram / iOS Shortcut | Adam | CCO Routine maintains channel health |
| Mem0 / OpenAI embeddings / RAG corpora | Adam | AI Engineer worker |
| Vercel / Inngest / Helicone / Resend | Adam | DevOps Lead worker |
| Cost monitoring / budgets / forecasting | Adam | CFO Routine (CBO-side) — proposed in V3 vision |
| QA gate / branch protection | Adam | QA Lead Routine (already independent) |
| Secret rotation (90d cycle) | Adam | DevOps Lead worker; runbook auto-fires reminder |

---

<a id="unknowns"></a>
## Honest unknowns + smoke-test deferrals

**These are NOT hidden — they are the WS4 sub-phase 0 smoke tests, by Adam-locked design (WS2 Q5 deferral).**

| Unknown | Where it lives | Resolution path |
|---|---|---|
| Cron Routines exempt from 15/day `/fire` cap? | WS4 smoke-test A | If NOT exempt: upgrade Adam to Max 20× ($100/mo delta). Reflected in §3F 50-customer cliff conditional. |
| `/fire` Retry-After granularity on cap hit? | WS4 smoke-test B | If long (24h): bridge needs hard rate-limit + Adam-ping. Bridge architecture absorbs this. |
| Mem0 MCP stable under 40 round-trips? (issue #3400) | WS4 smoke-test C | If unstable: fall back to Anthropic Memory Tool until WS1F Phase 2 OSS migration. |
| Concurrent Routine cap (queue or reject)? | WS4 smoke-test D | If reject: bridge needs concurrency-limit logic. |
| Anthropic Max ZDR coverage on Routines? | Adam to confirm via Anthropic | Block first paying customer's first Routine-touched-PII workflow until verified. |
| Mem0 OSS Phase 2 hosting choice (CF Workers vs Railway vs Fly.io vs in-cluster Supabase)? | WS1F (deferred) | **Recommend `/board-meeting mem0-oss-hosting` when WS1F starts.** Genuinely strategic vendor pick. |
| Anthropic Console hard cap default ($1500/mo) vs explicit cap? | Adam to set | Confirm $1500/mo cap is set in Anthropic Console as backstop. |
| Cold-start latency for Routines? | WS4 measurement (smoke tests fold in) | If >10s: Quick-tier short-circuit becomes the only acceptable path for Adam-facing latency. |

---

<a id="downstream"></a>
## What changes downstream

### WS4 (connection layer + smoke tests)
- BOM line items pinned here are the components WS4 must wire.
- The 4 smoke tests in §unknowns must run inside WS4 sub-phase 0 BEFORE building.
- Helicone integration is mandatory (not optional — corrected per WS2 R3.7).
- Cloudflare Workers Paid plan is approved — provision before bridge code lands.

### WS5 (synthesis master doc)
- The procurement / GDPR / multi-tenancy section here is a partial input — WS5 should fold it into the master design's "Adam operating manual" + "Honest limitations + open questions" sections.
- The vendor lock-in matrix here feeds WS5's "deployment topology" visual.

### WS6 (agents, last)
- The owner accountability matrix here previews the WS6 agent role assignments.
- The DR runbooks reference agent triggers (Auto-Unblock, Friday Retro tagging incidents) — those runbook hooks must be wired into the agent .md files in WS6.
- The cost-watchdog + runaway-watcher Inngest functions referenced here need their alert payloads consumed by Auto-Unblock + Telegram bot — defined in WS4, but Auto-Unblock's prompt in WS6 must handle them.

---

**End of WS3 deliverable (Phase 1 design — pre-critique).** 5 DR runbooks follow at `docs/07-history/runbooks/`. Critique pass is next per methodology.

# CRITIQUE-WS3-bom — BOM line items, replacement candidates, owner gaps

**Critic role:** Procurement / financial discipline
**Reviewer:** general-purpose Sonnet, adversarial framing
**Date:** 2026-05-08
**Files reviewed:** docs/08-agents_work/TECH-STACK.md (§3A primary), docs/08-agents_work/ORCHESTRATION.md (context), .claude/memory/DECISIONS.md (locked decisions), MEMORY.md (Adam prefs), HANDOFF-WS3-WS4-tech-stack-and-connection-layer.md

## Summary

- Total findings: 14
- Critical: 0 · High: 7 · Medium: 5 · Low: 2

---

## Findings (ranked by severity)

### F1 [SEV:H] — Mem0 cloud Hobby rate limit is unspecified — "~10K writes/mo" is a fabricated number

**Location:** TECH-STACK.md §3A.2 "Mem0 cloud Hobby" — "up to ~10K writes/mo"
**Issue:** The 10K writes/mo figure for Mem0's Hobby tier is stated as fact in the BOM, in the §3F scaling cliff ("Mem0 Hobby = ~10K writes/mo"), and in ORCHESTRATION.md §cost summary ("Until 10K writes/mo") — but Mem0's public pricing page does not publish a numeric write limit for the Hobby tier. The number appears to have been estimated and then cited as a hard trigger across multiple documents.
**Evidence:** The BOM itself acknowledges "rate limits (unspecified)" as a failure mode in the same card, then uses the 10K figure as a cliff trigger in §3F. The two statements contradict each other in the same document.
**What breaks on a real Tuesday:** The cost-watchdog cliff monitor is wired to alert at 8K writes/mo based on a number that was never verified. The real free-tier limit could be 1K, 5K, or enforced per-minute rather than monthly. If Mem0 silently rate-limits the MCP before 8K writes are reached, Routines that call `mem0` MCP begin returning errors with no Telegram alert — memory writes fail silently. The runaway-watcher does not cover MCP unavailability from the Mem0 side, only from the bridge side (`mem0_mcp_unavailable` log).
**Source critic:** BOM critic

---

### F2 [SEV:H] — Cloudflare Workers Paid CPU-time claim has a material gap: Haiku classifier latency is unverified against the 50ms wall

**Location:** TECH-STACK.md §3A.1 "Cloudflare Workers Paid plan" — failure mode note "CPU time per request limit (50ms on Paid, 1000ms on Unbound — well above current need)"
**Issue:** The claim "well above current need" is asserted without measurement. A Haiku API call is a network round-trip to Anthropic's API from inside the Worker. Typical Haiku latency is 300-1500ms p50 under normal load — not 50ms. The CPU time limit is wall-clock CPU consumed by the Worker's JavaScript execution, not total request time. However, if the Haiku call is made synchronously inside a single Worker request (no streaming, waiting for the response inline), the subrequest wait time counts toward CPU time in some Cloudflare billing models, and more critically the overall request timeout on Workers Paid is 30 seconds but the CPU execution budget is separate. The BOM conflates these two limits.
**Evidence:** §3A.1 notes "CPU time per request limit (50ms on Paid, 1000ms on Unbound)" without distinguishing subrequest latency from CPU execution time. The Cloudflare Workers documentation distinguishes these: CPU time ≠ wall-clock time. The 500-customer cliff section (§3F) also surfaces this as "classifier (Haiku call) might exceed 50ms p99 under contention" — but treats it as a post-500-customer concern, not a day-1 risk.
**What breaks on a real Tuesday:** On a busy webhook burst (e.g., 30 Linear webhooks fire in 10 seconds from a board meeting fan-out), the Haiku classifier calls contend on Cloudflare's CPU scheduler. If CPU time genuinely hits 50ms limits, Workers throw `CPU time exceeded` errors. The dedup KV write and Durable Object lock that come BEFORE the classifier call survive — but the `/fire` call that comes AFTER does not. The Routine is never fired, the audit_log `fired` row is never written, and the 5-minute timeout watcher on Inngest triggers Auto-Unblock — consuming more Routine cap. The BOM's "well above current need" assertion is not sourced.
**Source critic:** BOM critic

---

### F3 [SEV:H] — Inngest Pro cliff price is wrong: $75/mo vs actual $150/mo

**Location:** TECH-STACK.md §3F "25 paying customers — Inngest free tier" and the summary table — "Inngest Pro tier ($75/mo)"
**Issue:** Inngest Pro is priced at $150/mo (200K steps/mo included), not $75/mo. The BOM consistently uses $75/mo throughout §3F. This is a 2× error in the cost model. The locked DECISIONS.md entry (2026-04-27) also says "$150/mo (200K runs/mo)."
**Evidence:** DECISIONS.md 2026-04-27 entry: "Migrate to Pro ($150/mo) when paying customers ≥ 5." TECH-STACK.md §3F uses "$75/mo" and the summary table shows "+$75." ORCHESTRATION.md §cost summary shows "Inngest | $0 | Free 50K runs/mo; war-room burns ~6.5K" without the Pro cliff cost, which is fine — but when the BOM states the cliff delta it contradicts the locked DECISIONS.md figure by exactly 2×.
**What breaks on a real Tuesday:** The monthly burn-down report and the cliff forecast in §3D.2 will show a $75 delta when the real invoice hits $150. Not a production breakage, but the CFO Routine (proposed future) will be working with wrong cost models, and Adam's own mental budget for the 25-customer milestone is off by $75/mo.
**Source critic:** BOM critic

---

### F4 [SEV:H] — Vercel Pro is listed as "~$20/mo" but the actual price is $20/mo per MEMBER, not per project

**Location:** TECH-STACK.md §3A.5 product stack table — "Vercel Pro | ~$20"
**Issue:** Vercel Pro is $20/month per team member on the Pro plan, not a flat $20/month project fee. A solo plan is indeed $20/mo. But this distinction matters because the BOM does not call out that adding any contractor or employee to the Vercel team doubles this line item immediately, with no cliff warning in §3F. The BOM treats Vercel Pro as a fixed cost when it is in fact a per-seat cost.
**Evidence:** Vercel pricing page (public): Pro plan = $20/month per member. Solo = 1 member = $20/mo is technically correct for Adam today. But there is no hiring cliff in §3F that captures the first non-Adam team member being added to Vercel, which would bump it to $40/mo.
**What breaks on a real Tuesday:** Adam onboards a contractor to review the `/war-room` page code. Contractor gets added to Vercel team. Next invoice is $40/mo, not $20/mo. Not in any cliff, not in any runbook, not in the burn-down forecast. Small dollar impact but the BOM's "referenced, not new spend" framing makes this invisible.
**Source critic:** BOM critic

---

### F5 [SEV:H] — Anthropic Routines replacement candidate is misleading: "OpenAI Assistants API" cannot run Routines

**Location:** TECH-STACK.md §3A.1 "Anthropic Routines" — "Replacement candidate: Inngest cron + AnthropicAPI direct (still Anthropic; would migrate to ANTHROPIC_API_KEY billing for Console isolation); fully self-managed Trigger.dev v3 jobs calling Anthropic API."
**Issue:** This is actually the more honest card — it correctly avoids claiming OpenAI Assistants as a drop-in. However, the parent Anthropic Claude Max card does list "OpenAI Assistants API (different platform, cannot run Routines, 2-3 weeks of agent-prompt rework)" as a replacement candidate. The framing is misleading: OpenAI Assistants API is a tool-calling / persistent-thread feature for customer-facing chatbots — it is not equivalent to Anthropic Routines (cloud-scheduled agent sessions with Linear MCP + Supabase MCP + tool grants). "2-3 weeks of agent-prompt rework" dramatically understates the migration: every trust-mode spec, HMAC bridge contract, audit_log 3-party write, and MCP grant would need to be rebuilt from scratch on a different paradigm. The Anthropic Routines card's own replacement candidates are honest; the parent Max plan card's replacement candidates are not.
**Evidence:** §3A.1 "Anthropic Claude Max" replacement section lists OpenAI Assistants as the "closest equivalent" with a "2-3 weeks" estimate. ORCHESTRATION.md §reversibility table itself says "Routine config baked in; agent prompts assume Claude tone/tools; bearer tokens distributed across Cloudflare bridge + Adam's machines. Vendor swap = 2-3 weeks engineering" — but this covers code rework only, not the paradigm gap.
**What breaks on a real Tuesday:** Nothing breaks from this being written wrong. The risk is in the Adam-mental-model: if an Anthropic outage triggers an emergency vendor-swap evaluation, Adam's reference document says "2-3 weeks to OpenAI Assistants" — giving false confidence that there IS a fallback at this fidelity. There is not. The honest replacement path (Inngest cron + ANTHROPIC_API_KEY direct) is on the Routines card but not prominently on the Max card.
**Source critic:** BOM critic

---

### F6 [SEV:H] — Resend is listed with no DPA mention; Mem0 cloud DPA is flagged as "TBD before first paying customer" but that date is now

**Location:** TECH-STACK.md §3A.5 product stack table — "Resend | ~$10 | Transactional email" and §procurement section "Mem0 cloud DPA: Adam to confirm before first paying customer"
**Issue:** Resend transacts customer PII (email addresses, names, subscription status in email bodies). The BOM §procurement section calls out that Vercel, Supabase, Cloudflare, and Anthropic "all have standard DPAs available" but omits Resend from this list entirely. Resend's DPA status is not mentioned. Separately, Mem0 cloud DPA is marked "Adam to confirm before first paying customer" — but the war-room build is occurring NOW, Mem0 is already in use in Phase 1, and there is no mechanism to pause Mem0 Phase 1 if a paying customer's data is processed through a Routine that reads Mem0 memory. The "TBD" carries no enforcement gate.
**Evidence:** §procurement "DPA: Vercel, Supabase, Cloudflare, Anthropic all have standard DPAs available. Mem0 cloud DPA: Adam to confirm before first paying customer." Resend is not mentioned in the DPA paragraph. Resend does have a DPA (available on their website) but the BOM gives no indication it has been reviewed or signed.
**What breaks on a real Tuesday:** An Israeli customer (subject to Israeli Privacy Protection Law + GDPR-equivalent obligations) whose email is in Resend and whose business data flows through a Routine that touches Mem0 — both sub-processors lack confirmed DPAs in this document. If a B2B procurement contact (an "Aria"-persona buyer) asks for the sub-processor list, the document at `docs/security/sub-processors.md` is marked "TBD — out of WS3 scope." The first enterprise sales call can die on this.
**Source critic:** BOM critic

---

### F7 [SEV:H] — The $5/mo "incremental new spend" headline is structurally misleading: it excludes the board-meeting budget ($24/mo)

**Location:** TECH-STACK.md Executive Summary — "totalling $160/mo today and $5/mo of war-room-incremental new spend" and ORCHESTRATION.md §cost summary
**Issue:** The $24/month board-meeting budget (locked in WS2 §2F: "$3/meeting cap × 8 meetings/month") is stated in ORCHESTRATION.md but does not appear in TECH-STACK.md BOM at all — not as a line item, not in the executive summary cost math, and not in the §3F scaling cliffs. Board meetings consume Anthropic Max subscription quota (same as Routines), so the token cost is "absorbed" — but the $24/mo ceiling in the WS2 document is a per-meeting COST CAP that runs against the Max subscription's token envelope, not a new dollar line. However: (a) if board meetings run 8×/month at $3 each, they consume a meaningful slice of the Max subscription's token budget alongside the 10 standing Routines, and (b) if smoke-test A reveals cron Routines count against the 15/day `/fire` cap, board meeting fires count toward the same cap. Neither impact is surfaced in the BOM.
**Evidence:** ORCHESTRATION.md §2F: "$-cap per persona per round: $0.30 (Sonnet) / $0.50 (Opus). Round 0 + 1 + 2 + Synth total cap: $3/meeting. Frequency cap: 8 meetings/month. Monthly board-meeting budget: $24/month." TECH-STACK.md executive summary: "$5/mo of war-room-incremental new spend." The $24/mo board-meeting budget does not appear anywhere in TECH-STACK.md.
**What breaks on a real Tuesday:** Nothing immediately — but the burn-down report in §3D.2 will show Anthropic Max consuming more than the "10 Routines only" baseline if board meetings fire. The "by Routine" breakdown will show unexplained cost spikes attributed to Synthesizer and persona Routines. The CFO Routine (post-MVP) analyzing monthly cost trends will see anomalies it cannot explain without the board-meeting line item.
**Source critic:** BOM critic

---

### F8 [SEV:M] — Cloudflare KV free-tier limits stated incorrectly for the Workers Paid context

**Location:** TECH-STACK.md §3A.1 "Cloudflare KV" — "free tier: 100K reads/day, 1K writes/day on free plan; on Workers Paid, included with much higher limits"
**Issue:** The KV card describes the Free plan limits (100K reads/day, 1K writes/day) but then says Workers Paid includes "much higher limits" without stating the actual numbers. The actual Workers Paid KV limits are: 1B reads/month, 1M writes/month — far above what we'll use. Saying "much higher limits" without the actual numbers means the BOM is not a real procurement document; it's a placeholder. A procurement reviewer cannot assess whether the limits are sufficient without the numbers.
**Evidence:** The card explicitly gives free-tier numbers but falls back to "much higher limits" for the plan we're actually on. No cite to Cloudflare KV pricing page.
**What breaks on a real Tuesday:** Nothing — the limits are genuinely far above our needs. The risk is BOM quality: if Adam uses this document as the reference for a future vendor negotiation or audit, the KV card fails to stand on its own.
**Source critic:** BOM critic

---

### F9 [SEV:M] — GitHub Actions replacement candidate is incomplete and the free-tier minute claim is under-estimated

**Location:** TECH-STACK.md §3A.1 "GitHub Actions" — "we use ~50 min/mo currently" and replacement candidates "GitLab CI (whole-platform move); Vercel CI (only PR previews, not merge gates)"
**Issue:** Two problems. First, the "~50 min/mo" estimate predates the war-room build. The BOM lists 8 Inngest embed jobs that trigger on git push. It lists a nightly QA cron. It lists `qa-lead-pass` branch protection checks running on every PR. At even 2 PRs/day × a 3-minute check, that's ~180 minutes/month from PRs alone — already past the "~50" estimate. Second, the replacement candidates miss the most relevant alternative for the `qa-lead-pass` check specifically: Cloudflare Pages deployment hooks or a Vercel deployment check, both of which can gate PRs without requiring a full GitLab migration. The "whole-platform move" framing for GitLab makes it sound like there's no middle path, which is inaccurate.
**Evidence:** §3A.1 GitHub Actions notes: "we use ~50 min/mo currently." The BOM adds nightly QA cron, `claude-code-action@v1` for PR-level agent runs (config TBD in WS4 §4B), `qa-lead-pass` check. These are new GitHub Actions usage, not accounted for in the 50-min estimate.
**What breaks on a real Tuesday:** Free-tier exhaustion at 2,000 min/mo is unlikely at solo scale, so this is not a P0. But if `claude-code-action@v1` fires on every PR (as suggested in §3A.1 "future claude-code-action@v1 for PR-level agent runs"), each run could consume 10-30 minutes. At 5 PRs/week with a 20-min agent run, that's 400 min/week = ~1,600 min/month — approaching the free-tier ceiling faster than the BOM acknowledges.
**Source critic:** BOM critic

---

### F10 [SEV:M] — Supabase Pro replacement candidate lists "Auth replatform required" as if it's the hard part — but Mem0 OSS Phase 2 co-location on Supabase is also affected

**Location:** TECH-STACK.md §3A.2 "Supabase Pro" — "Replacement candidate: Neon (Postgres-compatible, supports pgvector); RDS Postgres (heavier ops); self-host on Hetzner ($10-20/mo). All require Auth replatform (Clerk, Auth.js)."
**Issue:** The replacement difficulty analysis focuses on Auth replatform but omits that Mem0 OSS Phase 2 is specifically locked to run ON Supabase Postgres+pgvector (DECISIONS.md 2026-05-06 WS1A: "Phase 2 (WS1F): migrate to Mem0 OSS self-host on existing Supabase Postgres+pgvector"). If Supabase is replaced, Mem0 Phase 2 OSS needs a new host AND a new pgvector instance. This doubles the migration scope beyond what "Auth replatform" suggests.
**Evidence:** DECISIONS.md 2026-05-06 WS1A entry: "Phase 2 (WS1F): migrate to Mem0 OSS self-host on existing Supabase Postgres+pgvector." TECH-STACK.md §3A.2 Supabase replacement section does not mention Mem0 OSS co-location dependency.
**What breaks on a real Tuesday:** Nothing breaks from a documentation gap alone. The risk materializes when WS1F scopes the Mem0 Phase 2 migration and discovers the BOM understated Supabase lock-in. An agent writing the WS1F plan that reads §3A.2 will underestimate the Supabase coupling.
**Source critic:** BOM critic

---

### F11 [SEV:M] — iOS Shortcut is listed as "EASY" reversibility but the SHORTCUT_SECRET rotation path is not in the secret-rotation.md runbook scope

**Location:** TECH-STACK.md §3A.3 "iOS Shortcut" — "Reversibility: EASY. Single Shortcut file, exportable." and "Notes: SHORTCUT_SECRET is an HMAC bearer the Worker validates on /idea-capture endpoint."
**Issue:** The BOM says the Shortcut lives in `infra/shortcuts/Capture-Beamix-Idea.shortcut` and the HMAC secret rotates via "Shortcut export." But the secret-rotation runbook (one of the 5 DR runbooks in §3E) has a 90-day rotation cadence for "all per-Routine bearer tokens." The BOM does not include `SHORTCUT_SECRET` in the rotation runbook scope — the runbook title is `secret-rotation.md` and §3A.1 says "Lint rule blocks `console.log(env.ROUTINE_*)`" but the scope only explicitly covers Routine tokens. SHORTCUT_SECRET is a different secret class (Worker env var, not Routine bearer token) and is not listed in the rotation runbook's scope.
**Evidence:** §3A.1 Bearer token rotation (R3.12): "90-day rotation cadence for all per-Routine bearer tokens." §3A.3 iOS Shortcut notes: "SHORTCUT_SECRET is an HMAC bearer the Worker validates on /idea-capture endpoint." The rotation scope does not explicitly include `SHORTCUT_SECRET`, `BRIDGE_HMAC_SECRET`, Telegram bot token, or any of the Worker env vars — only Routine tokens.
**What breaks on a real Tuesday:** If SHORTCUT_SECRET leaks (e.g., iOS backup extraction, screen-share during troubleshooting), the `/idea-capture` endpoint accepts arbitrary tickets from anyone who has the secret. There is no rotation reminder for this secret in the 90-day cron. The runbook does not cover it.
**Source critic:** BOM critic

---

### F12 [SEV:M] — OpenRouter is still listed as a product stack component despite a conflicting "war room uses Anthropic direct" claim

**Location:** TECH-STACK.md §3A.5 product stack table — "OpenRouter (legacy product LLM gateway) | $0 + per-call | Per OPENROUTER_SCAN_KEY and OPENROUTER_AGENT_KEY | No (war room doesn't bill)"
**Issue:** The BOM marks OpenRouter as "No" for war-room dependency, then labels it "legacy product LLM gateway" — suggesting it is being phased out. However, DECISIONS.md 2026-03-06 locked OpenRouter as the LLM gateway for scan engines and agent execution. There is no DECISIONS.md entry locking OpenRouter's removal. If OpenRouter is still active in the product (which the label "legacy" ambiguously implies it may not be), then any product-side scan failure that rolls back through OpenRouter is outside the war-room's observability surface (not captured by Helicone, which is only in front of Anthropic API calls). If OpenRouter has been fully deprecated, it should not appear in the BOM at all.
**Evidence:** §3A.5: "OpenRouter (legacy product LLM gateway)" — the word "legacy" implies deprecated status but no DECISIONS.md entry confirms the deprecation. DECISIONS.md 2026-03-06: "All LLM calls route through OpenRouter." No later entry reverses this.
**What breaks on a real Tuesday:** If a product scan silently degrades because OpenRouter has a pricing change or API deprecation and nobody notices (because it's "legacy" in the BOM but still active in the code), the cost-watchdog Inngest function won't catch it (it monitors `audit_log.cost_usd` for war-room costs, not OpenRouter billing). The burn-down report will have a mystery line item.
**Source critic:** BOM critic

---

### F13 [SEV:L] — Cloudflare R2 reversibility is listed as "EASY" but the vendor lock-in summary lists it as "EASY (S3-compatible API; client config swap is one env var)" while S3-compatible ≠ zero migration cost

**Location:** TECH-STACK.md §lockin — "Cloudflare R2 | EASY | S3-compatible API" and §3A.1 R2 card — "Reversibility: EASY. S3-compatible API; client config swap is one env var."
**Issue:** S3-compatible means the SDK interface is compatible, not that migration is zero-effort. Lifecycle rules, CORS policies, presigned URL configurations, and bucket event notifications are all configured in Cloudflare-specific ways (via Wrangler or the Cloudflare dashboard) rather than through a portable IaC layer. If the war room uses R2 lifecycle rules to auto-delete artifacts >90 days (per §3A.1 Notes), those rules are not portable via the S3 API — they require Cloudflare-specific configuration. Also, the BOM does not mention whether R2 artifacts are being stored with public-read ACLs or private-with-presigned-URLs, which affects the migration complexity.
**Evidence:** §3A.1 R2 Notes: "Lifecycle rule: artifacts older than 90 days move to Glacier-equivalent OR delete (matches audit_log retention). Specified in WS4." The lifecycle rule mechanism for R2 uses Cloudflare's Object Lifecycle configuration, not the S3 Lifecycle XML API (which R2 does not fully support as of mid-2025).
**What breaks on a real Tuesday:** Nothing breaks — this is a documentation quality finding. But the BOM's "one env var" claim is too optimistic; a realistic migration also requires recreating lifecycle rules in the destination (S3, Supabase Storage, etc.).
**Source critic:** BOM critic

---

### F14 [SEV:L] — Adam-as-sole-owner of every component is acknowledged but the 24/7 secret-rotation requirement creates a human single-point-of-failure with no documented deputy or escalation path

**Location:** TECH-STACK.md §owners "Owner accountability matrix" — "Adam | Adam | Adam | Adam | Adam" across every row, and §3E "secret-rotation.md | P2 (routine), P0 (emergency)"
**Issue:** The BOM correctly acknowledges Adam is sole owner at single-operator stage. However, the secret-rotation runbook is classified as P0 on emergency rotation — meaning on a suspected bearer-token leak, the rotation must happen immediately, around the clock. If Adam is unavailable (flight, medical, sabbath if observant, family emergency), there is no deputy owner and no documented escalation path for emergency rotation. This is different from the Anthropic outage DR (where "do nothing until it comes back" is an acceptable response) — a leaked Routine token is an active attack surface requiring immediate response.
**Evidence:** §owners matrix shows Adam as owner of all secrets. §3E: "`secret-rotation.md` | P2 (routine), P0 (emergency)." §3A.1 Bearer token rotation notes "90-day rotation cadence" but does not state who performs it if Adam is unreachable. The Cloudflare Workers Paid plan also holds `BRIDGE_HMAC_SECRET` which, if leaked, allows arbitrary trust-mode specs to be injected with valid HMACs.
**What breaks on a real Tuesday:** A leaked `BRIDGE_HMAC_SECRET` on a Sunday night means the bridge will accept forged trust specs until Adam wakes up and rotates it. No deputy, no out-of-band escalation path, no time-bound SLA on how quickly this must be addressed. The BOM documents the risk exists but does not document the response path beyond "Adam handles it."
**Source critic:** BOM critic

# CRITIQUE-WS3-cost — Cost-tracking instrumentation, KPIs, scaling cliffs

**Critic role:** Cost reality + scaling cliffs
**Reviewer:** general-purpose Sonnet, adversarial framing
**Date:** 2026-05-08

---

## Summary

- Total findings: 13
- Critical: 0 · High: 7 · Medium: 5 · Low: 1

---

## Findings (ranked by severity)

---

### F1 [SEV:H] — Mem0 Hobby cliff fires Day 1, not at "100 customers"

**Location:** TECH-STACK.md §3F "100 paying customers — Mem0 cloud Hobby tier"

**Issue:** The cliff is placed at "100 paying customers." The text even notes "War-room baseline (10 Routines × ~30 memory writes/day) = ~9K writes/mo without customer load." That baseline already exceeds the stated Hobby-tier limit of ~10K writes/mo before a single customer exists. The 10K/mo ceiling is crossed at roughly 10 Routines × 30 writes/day × 30 days = 9,000 baseline writes plus normal day-to-day variance. There is no customer-load required to hit this.

**Evidence (arithmetic):**
- 10 Routines × 30 memory writes/day × 30 days = 9,000 writes/mo baseline
- Hobby tier = ~10,000 writes/mo (per 3A.2 card)
- Gap to ceiling: 1,000 writes/mo = ~3% buffer
- A single Active week with extra fires (Auto-Unblock events, board meetings each writing memory) easily consumes that slack
- Customer load cited as "+1-2K/mo" — relevant but the math already shows a Day-1 problem, not a 100-customer problem

**What breaks on a real Tuesday:** The Mem0 Hobby tier rate-limits or errors on write. Every Routine that depends on L2 episodic memory either silently fails to persist new memories (invisible degradation) or hard-errors (visible noise). The `mem0_mcp_unavailable` bridge log fires continuously. Auto-Unblock pings Adam. The memory layer for the war-room is degraded from week 1.

**Source critic:** Cost-projection critic

---

### F2 [SEV:H] — Inngest cliff trigger is the wrong metric; the real trigger is "Inngest Pro at ~5 paying customers" per locked decision

**Location:** TECH-STACK.md §3F "25 paying customers — Inngest free tier" and DECISIONS.md 2026-04-27

**Issue:** The scaling-cliff table sets the Inngest cliff at 25 customers with a 40K runs/mo alert trigger. But DECISIONS.md 2026-04-27 (and confirmed in ORCHESTRATION.md cost section) says: "Migrate to Pro ($150/mo) when paying customers ≥ 5 OR monthly steps usage hits 75-80% of free-tier ceiling." Two conflicts:

1. The cliff customer count is 25; the locked decision says 5. That is a 5× discrepancy in the number that triggers action.
2. The locked decision cites a Pro price of **$150/mo**. TECH-STACK.md §3F says **$75/mo** for Inngest Pro ("200K runs/mo"). The current Inngest Pro plan (as of 2026) is documented at $75/mo on Inngest's pricing page; however, the DECISIONS.md entry uses "$150/mo." One of these is wrong — and the cliff delta depends on which number is correct.

**Evidence:**
- DECISIONS.md 2026-04-27: "Migrate to Pro ($150/mo) when paying customers ≥ 5"
- TECH-STACK.md §3F: "+$75 … Inngest Pro tier ($75/mo, 200K runs/mo) … 25 paying customers"
- ORCHESTRATION.md cost table: "Inngest free 50K runs/mo; war-room burns ~6.5K … Comfortable through ~5 paying customers per locked Inngest tier strategy"

The ORCHESTRATION.md note "comfortable through ~5 paying customers" implies the Pro trigger is at 5 customers of product use, which aligns with DECISIONS.md but directly contradicts the §3F cliff at 25 customers.

**What breaks on a real Tuesday:** Adam has 7 paying customers, hasn't upgraded, and Inngest starts throttling or failing jobs. The 40K-run alert at 25 customers won't fire because the correct trigger is ~5 customers. Paid scans fail silently.

**Source critic:** Cost-projection critic

---

### F3 [SEV:H] — The Inngest baseline run count of ~6,500/mo is materially understated

**Location:** TECH-STACK.md §3F (references ORCHESTRATION.md §2C free-tier headroom table)

**Issue:** The ORCHESTRATION.md §2C table derives 6,500 runs/mo. The math as stated does not account for the actual Inngest execution model. An Inngest function with multiple `step.run` calls counts each step as a separate function run against the free tier — not one run per function invocation. Let me audit the table entries:

**Claimed breakdown (ORCHESTRATION.md §2C):**
- Standing Routine progress writes: ~2,160
- Embed jobs: ~1,500
- fan-in-watcher: ~1,500
- routine-timeout-watcher: ~270
- cost-watchdog: 720
- runaway-watcher: ~300
- audit-log-rollup: 30
- Total: ~6,500

**Problems with this arithmetic:**

1. "Standing Routine progress writes: ~2,160" — this is described as progress writes, implying one write per step per Routine fire. But 10 Routines each writing ~5 progress steps per fire, firing ~15-30 times per day = 10 × 20 fires/day × 5 steps × 30 days = 30,000 Inngest steps/mo from progress writes alone, not 2,160. The 2,160 figure implies roughly 10 Routines × 3 fires/day × 24 steps — implausible given the described Routine complexity.

2. "fan-in-watcher: ~1,500" — each fan-in event involves at minimum 3 steps (validate fan_in_key, check session_id binding, fire CEO synth). So 500 fan-in events × 3 steps = 1,500 runs. But how many fan-in events are there? Each Full-tier task generates 2+ sub-tickets → 2+ fan-in completions. If Adam runs 5 Full-tier tasks/day, that alone generates 300 fan-in events/mo × 3 steps = 900 — near the claimed total before any Lite/Full task volume.

3. "embed-jobs: ~1,500" — each embed job processes a batch with multiple `step.run` calls (one per file chunk or per embed call). A single `embed-codebase` run with 200 changed files / batches-of-10 = 20 step calls per invocation. Even 50 invocations/mo × 20 steps = 1,000 — plausible, but one large codebase push could spike this.

4. The Inngest function list in §2C has 11 functions total. "Standing Routine progress writes" alone, if modeled as 10 Routines × 2 fires/day average × 4 steps = 2,400/mo, that's close to the claim. But cron Routines fire every day: 7 Routines × 30 days = 210 cron fires/mo minimum, each with multiple steps.

**Conservative re-estimate (war-room only, no customers):**
- Cron Routines (7 daily-or-weekly × 30 days × 3 steps avg) = 630
- CEO Entry-point (10 fires/day × 30 days × 3 steps) = 900
- cost-watchdog (720 cron fires × 3 steps) = 2,160
- runaway-watcher (300 × 2 steps) = 600
- fan-in-watcher (100 events/mo × 3 steps) = 300
- routine-timeout-watcher (90 events/mo × 2 steps) = 180
- embed-jobs (30 invocations × 10 steps avg) = 300
- audit-log-rollup (30 × 2 steps) = 60
- parent-ticket-expiry-watcher (40 events × 2 steps) = 80
- **Conservative total: ~5,210 war-room steps**

This is in the same order of magnitude as the 6,500 claim for the war-room-only baseline. However, once **product Inngest functions** are included (paid scans, content jobs, agent execution per the §3A.5 shared Inngest table), the combined total scales quickly with customers. The §3F cliff calc doesn't add product Inngest usage to war-room Inngest usage before computing the cliff.

**What breaks on a real Tuesday:** The combined (war-room + product) Inngest free-tier burn is never presented in the cliff. At 10 paying customers each running 5 scans (each scan = multi-step Inngest function likely 5-10 steps) = 10 × 5 × 7 steps = 350 product runs/mo extra — modest. But at 25 customers × 10 agent jobs/mo × 5 steps = 1,250 additional product steps. The combined total starts materially approaching 40K before 25 customers.

**Source critic:** Cost-projection critic

---

### F4 [SEV:H] — "$5/h rolling cost" alert threshold false-positives on every Friday Retro run

**Location:** TECH-STACK.md §3D.3 alert threshold matrix, row 1

**Issue:** The cost-watchdog fires Telegram P2 alert at "rolling 1h cost >$5/h." Friday Retro is specified in ORCHESTRATION.md §2E as: Routine #6, model = **Opus**, $-cap = $1.50/run. If Retro runs for ~20 minutes and costs $1.50, that's $1.50/0.33h = ~$4.55/h effective rate. That is under the $5/h threshold. However:

1. The Synthesizer Routine (Routine #10) is called by board meetings and also uses Opus at $1.00/run. If Friday Retro triggers a board-meeting sub-task (plausible — it reads the week and might file "board meeting" items), Retro ($1.50) + Synthesizer ($1.00) running concurrently during the same 1h window = $2.50 in ~40 minutes = $3.75/h effective rate. Still under $5/h.

2. **The real false-positive scenario:** Multiple Opus Routines fire in the same hour on a busy Friday. CEO fires CTO (sonnet, $1.00) + CMO (sonnet, $0.50) + Synthesizer (opus, $1.00) in a fan-out = $2.50 accumulated in under 30 minutes = $5+/h. This is a **normal Full-tier workflow**, not a runaway, but it trips the alert every time it happens.

3. The Board Meeting running Round 1 (6 personas, some Opus) accumulates up to $3/meeting. If a board meeting fires during the same window as any other Routine, the rolling 1h sum easily exceeds $5.

**Evidence:** $3/meeting cap × board meeting running in 60 min = $3/h base. Add one CEO Entry-point fire ($1.00/run) during the same hour = $4/h. Add Auto-Unblock ($0.50) = $4.50/h. All normal operations but approaching $5/h threshold.

**What breaks on a real Tuesday:** Adam gets Telegram P2 alerts on every Friday evening, every board meeting, and every complex Full-tier task. After 2 weeks of false positives, Adam disables the alert or starts ignoring it. The watchdog becomes useless on the day a real runaway occurs.

**Source critic:** Cost-projection critic

---

### F5 [SEV:H] — Goodhart anti-guard (QA-Lead PASS) does NOT prevent research ticket inflation

**Location:** TECH-STACK.md §3D.1 KPI definition and Anti-Goodhart section

**Issue:** The anti-Goodhart guard is: "QA Lead PASS is required for the ticket to count toward the denominator." The denominator is "tickets that closed Done AND had a PR merged into main." But the document creates a sub-KPI for non-code tickets: "$/decision finalized — swap 'PR merged' with 'DECISIONS.md entry written + Adam approval comment.'"

The QA-Lead PASS gate only applies to the main KPI (code tickets with PR merged). For research and decision tickets under the sub-KPI, the denominator is "DECISIONS.md entry written + Adam approval." This means:

1. Agents can inflate the $/decision-finalized denominator by splitting one decision into 5 sub-decisions (each gets its own DECISIONS.md entry).
2. There is no structural counter-measure for this path — the "QA Lead PASS required" guard does not apply to decision tickets.
3. Even on code tickets: a ticket can have a PR merged with 0 LOC of product value (e.g., a PR that only adds a DECISIONS.md entry or a session log file). The "PR merged into main" criterion is trivially satisfied by a documentation PR with QA Lead PASS.

**Evidence:** The QA-Lead enforcement is structural for merges (GitHub branch protection checks). But a PR containing only docs/memory files will pass QA-Lead trivially — there is no code to review, no security audit surface, and QA Lead PASS is almost guaranteed. This PR counts toward $/feature_shipped denominator.

**What breaks on a real Tuesday:** Friday Retro reports $/feature_shipped = $2.00 (outstanding). In reality, 8 of the 12 "features" in the denominator were docs-only PRs or single-line DECISIONS.md entries. The metric looks healthy while real code features cost $12 each and the ratio is hidden.

**Source critic:** Cost-projection critic

---

### F6 [SEV:H] — "Total cliff cost at 500 customers" math conflates nominal and worst-case

**Location:** TECH-STACK.md §3F summary table and final paragraph

**Issue:** The summary claims "Total cliff cost at 500 customers (worst case): baseline $160/mo + ~$420-560/mo of upgrades = $580-720/mo."

**Arithmetic check:**

Summing the cliff deltas from the table:
- 25 customers: +$75 (Inngest Pro)
- 50 customers: +$100 (Anthropic Max 20×) — labeled "conditional"
- 100 customers: $0-100 (Supabase path b = $0, path a = $100)
- 100 customers: +$20-50 (Helicone Pro)
- 100 customers: $0-20 (Mem0 OSS migration = $0 or +$5-20)
- 500 customers: $0 (Cloudflare Unbound, same plan)
- 500 customers: +$40-100 (Vercel bandwidth)
- 500 customers: +$60-200 (Supabase storage/compute)

**Summing worst case:** $75 + $100 + $100 + $50 + $20 + $0 + $100 + $200 = **$645** in cliff upgrades.
**Baseline:** $160/mo (per exec summary).
**Total worst case:** $160 + $645 = **$805/mo**, not $580-720/mo.

The "worst case" range in the document ($420-560/mo of upgrades) appears to exclude the conditional $100 Anthropic upgrade and use the low end of Supabase (+$60) and low-end Vercel (+$40). That is the *optimistic* scenario, not the worst case. A genuine worst case includes all upgrades firing simultaneously.

**Additional missing cliff costs not in the table at all (see F10-F13):** These compound the understatement further.

**What breaks on a real Tuesday:** Adam's mental model is "infrastructure stays well under 1% of revenue at 500 customers." The actual worst-case infrastructure bill may be $800-900/mo once missing cliffs are included. At $130K MRR (the document's own estimate), that's still <1% — the conclusion may survive. But the math is wrong and the "worst case" label is misapplied.

**Source critic:** Cost-projection critic

---

### F7 [SEV:H] — Helicone cliff fires at 10-20 customers, not 100 customers

**Location:** TECH-STACK.md §3F "100 paying customers — Helicone free tier"

**Issue:** The cliff says "At 100 customers each driving ~50 product API calls/mo, we hit ~5K-15K req/mo. Cliff trips around 100 customers." But each customer API call through Helicone may count as multiple Helicone requests depending on how the product's LLM calls are structured.

More critically: the document itself states in §3A.4 that "Helicone free tier = 10K req/mo — covers product code at MVP scale." The trigger threshold is ">8K req/mo." At 50 API calls/mo per customer, the free tier runs out at 10,000 / 50 = **200 customer-calls-worth**. But those 200 customer-calls come from how many customers?

If a single scan run generates multiple Helicone-proxied LLM calls (e.g., 5 engine calls per scan, each going through Helicone), then:
- 1 scan = 5 Helicone requests
- 1 customer × 5 scans/mo = 25 Helicone requests
- Free tier (10K) / 25 req/customer = **400 customers** to fill free tier from scans alone

But agent jobs also hit Helicone:
- 1 agent job with 3 LLM calls = 3 Helicone requests
- 1 customer × 10 agent jobs/mo × 3 calls = 30 Helicone requests
- Combined with scans: 25 + 30 = 55 Helicone req/mo/customer
- Free tier: 10K / 55 = ~180 customers before cliff

Neither the 100-customer claim in the text nor any specific per-customer call count is supported by actual product architecture analysis. The actual cliff customer count could be anywhere from 100 to 400+ depending on how many Helicone-proxied calls each product flow generates. The document hasn't done this accounting.

**What breaks on a real Tuesday:** The Helicone cliff could be harmless (fires at 400 customers, upgrade is $20/mo) — but the document presents a false precision of "100 customers" without the underlying per-call audit.

**Source critic:** Cost-projection critic

---

### F8 [SEV:M] — Burn-down report blind spot: "one bad Routine burning $0.50/h continuously" is invisible in monthly cadence

**Location:** TECH-STACK.md §3D.2 burn-down report format

**Issue:** The burn-down report aggregates monthly data and is generated nightly. The "By Routine" section shows which Routine burned what in the month. However, a Routine that loops quietly at $0.50/h would accumulate $360/mo — which would appear in the monthly report as a large number, but by the time the report is reviewed, $360 is already spent.

The cost-watchdog fires at ">$5/h rolling 1h." A Routine burning $0.50/h falls completely below this threshold. The "By Routine: any Routine >2× 30-day moving average" check in §3D.2 anomaly section would catch it only after a full month of comparison data exists. A new Routine in its first month has no baseline, so no anomaly fires.

**Evidence:** $0.50/h × 24h × 30 days = $360/mo. A subtle infinite-loop in the CEO Entry-point Routine at $0.50/h (5× the $1.00/session cap is $0.033/minute, so a 15-minute hung loop = $0.50) would not trip the $5/h watchdog but would accumulate $360/mo unnoticed until the monthly report. The `runaway-watcher` fires on `audit_log` insert where `cost_usd > $1` — but if each loop iteration costs $0.50 and writes its own audit_log row, every row is under $1 and the watcher never fires.

**What breaks on a real Tuesday:** By month-end, the burn-down report shows CEO Entry-point at $380/mo (20× normal). Adam is furious. The Anthropic Console hard cap at $1,500/mo is the only backstop, and it's $1,500 not ~$360.

**Source critic:** Cost-projection critic

---

### F9 [SEV:M] — No alert for webhook storm (runaway INGRESS), only runaway EGRESS

**Location:** TECH-STACK.md §3D.3 alert threshold matrix

**Issue:** All five alert rows cover cost runaway (egress, token spend). There is no alert for a runaway inbound webhook event volume. A webhook storm scenario:
- Linear experiences a bug that fires webhooks on every issue state transition
- Or a malicious actor discovers the Cloudflare Worker endpoint and floods it with invalid payloads

The Cloudflare Worker performs HMAC verification, so invalid payloads are rejected cheaply (~$0.001 each at Paid plan pricing). But **valid-looking HMAC-passing traffic** from a Linear bug would cause the KV dedup to fill up, Durable Object locks to be acquired/released in tight loops, and `/fire` calls to hit the rate limit — effectively burning the 15/day Anthropic cap in minutes.

The current alert matrix has no row for "Cloudflare Worker request spike" or "Linear webhook volume >N/h."

**What breaks on a real Tuesday:** A Linear webhook bug fires 100 events/hour for 3 hours. The Cloudflare Worker processes them, KV dedup blocks 95% (ticket-scoped 24h TTL), but 5 new tickets slip through. That's 5 Anthropic `/fire` calls out of the 15/day cap burned in minutes. The remaining day's capacity is gone. No alert fires (the cost-watchdog only looks at cost_usd, and the 5 fires cost only ~$5 total, well under $5/h).

**Source critic:** Cost-projection critic

---

### F10 [SEV:M] — Missing cliff: Mem0 cloud Hobby to Starter at 5 customers (not 100)

**Location:** TECH-STACK.md §3F — cliff placement

**Issue:** The document places the Mem0 cliff at "100 paying customers." ORCHESTRATION.md cost table adds a parenthetical note: "Hobby until 10K writes/mo (likely hit at 5+ paying customers; bumps to $19 Starter then)." This is buried in a footnote in the cost table and not reflected in the §3F cliff table.

The $19/mo Mem0 Starter tier hit at 5 customers is an **unlisted cliff in §3F**. The table goes 25 → 50 → 100 → 500. There is no "5 customers" cliff for Mem0 Starter, even though ORCHESTRATION.md explicitly calls this out.

**$/mo delta:** +$19 (Mem0 Hobby → Starter). Minor in absolute terms but the cliff fires at 5 customers, not 100.

**What breaks on a real Tuesday:** At customer 6, Mem0 Hobby starts rate-limiting. No alert in the threshold matrix references Mem0 write count against the 10K ceiling. The §3D.4 "what we do NOT instrument" section explicitly says "track [Mem0 write counts] manually via Mem0 dashboard until we hit the 10K/mo trigger" — meaning there is no automated alert. Manual dashboard checks will be missed on a busy week.

**Source critic:** Cost-projection critic

---

### F11 [SEV:M] — Missing cliff: Cloudflare Durable Objects at high concurrent-user burst

**Location:** TECH-STACK.md §3F and §3A.1 Cloudflare Workers Paid notes

**Issue:** §3A.1 notes "Durable Object usage = ~1-2 lock acquisitions per fan-out, ~10K-20K/mo. Also far under 1M." This is correct for the war-room baseline. However, the document does not account for what happens when 50 paying customers simultaneously trigger webhook events that all flow through the same bridge simultaneously.

Each customer event that passes HMAC and hits a new `(routine_id, ticket_id)` pair creates a Durable Object instance. Durable Objects have a limit of 1M requests/mo on Workers Paid, but they also have a per-DO instance throughput limit (typically 1 RPS per DO instance under normal Cloudflare behavior). Under a burst scenario:

- 50 simultaneous webhook events × 2 DO operations (acquire lock + release lock) = 100 DO requests in <1 second
- Each DO instance handles 1 request at a time; new instances for new keys spin up
- Cloudflare charges $0.15/million DO requests beyond the 1M included
- 100 customers × 100 events/mo × 2 DO ops = 20,000 DO requests/mo (within free allocation)

The cliff here is not on the billing side (20K DO requests is trivial vs 1M included). The cliff is on the **response-time side**: if 50 events arrive in the same second and each needs a new DO instance, Cloudflare's cold-start latency for DO instances (typically 1-5ms) adds up. This is a latency cliff, not a billing cliff, and it's unlisted.

**Source critic:** Cost-projection critic

---

### F12 [SEV:M] — $24/mo board-meeting monthly budget does not match 8 meetings × $3/meeting = $24/mo, but individual meeting cost is understated

**Location:** ORCHESTRATION.md §2F "Cost reality (R6.5)" and TECH-STACK.md §exec

**Issue:** The document says: "$-cap per persona per round: $0.30 (Sonnet) / $0.50 (Opus). Round 0 + 1 + 2 + Synth total cap: $3/meeting. Frequency cap: 8 meetings/month. Monthly board-meeting budget: $24/month."

The arithmetic: $3/meeting × 8 meetings = $24/mo. Numerically consistent.

However, the $3/meeting cap arithmetic does not hold:

- 6 personas in Round 1: 3 Sonnet personas ($0.30 each) + 3 Opus personas ($0.50 each) = $0.90 + $1.50 = $2.40
- Round 0 (de-anchored framings): 6 × $0.005 = $0.03 (trivial, confirmed in doc)
- Round 2 (cross-critique): each persona reads 5 others + writes. Same model mix = another ~$2.40
- Round 3 (Synthesizer, Opus): $1.00/run

Total per meeting: $0.03 (R0) + $2.40 (R1) + $2.40 (R2) + $1.00 (Synth) = **$5.83 per meeting cap**, not $3.

The document appears to count only Round 1 ($2.40) + Synth ($1.00) ≈ $3.40 ≈ $3, omitting Round 2 entirely. Round 2 is where each persona reads and critiques 5 others — it's the most expensive round because every persona has more input tokens.

**Revised monthly budget:** $5.83/meeting × 8 meetings = **$46.64/mo**, not $24/mo.

**Note:** This is distinct from the 22× error found in WS2 critique (which corrected the "$10/meeting" claim to "$0.45-1.50 per meeting"). This finding identifies that the corrected $3/meeting figure is itself underestimated by ~2× due to omitting Round 2 cost.

**What breaks on a real Tuesday:** Adam approves 8 board meetings assuming $24/mo. Actual board-meeting cost is ~$47/mo. The Anthropic Max $100/mo subscription absorbs this as token spend (not API billing), so no real dollar alert fires — but the Max plan's available capacity for war-room operations is reduced by $23/mo more than projected.

**Source critic:** Cost-projection critic

---

### F13 [SEV:M] — Missing cliff: Vercel Pro Serverless Function execution limits at 50-100 customers

**Location:** TECH-STACK.md §3F — cliff list

**Issue:** The Vercel cliff listed is at "500 paying customers — Vercel bandwidth (1TB/mo)." There is a closer Vercel cliff: **serverless function execution hours**. Vercel Pro includes 1,000 GB-hours/mo of function execution. The `/war-room` page uses Supabase Realtime (websocket, not function execution) but the product's agent execution API routes and scan routes run as serverless functions.

At 50 paying customers each triggering 10 agent jobs/mo × average 2-minute execution (LLM streaming calls take time) = 50 × 10 × 2 min = 1,000 function-minutes = ~16.7 GB-hours/mo. That's well within the 1,000 GB-hour limit.

However: Helicone streaming calls, Inngest job callbacks, and webhook-triggered routes all add up. The cliff is not imminent but it is **unlisted**, meaning there is no monitoring trigger for it. The document's Vercel cliff entry only monitors bandwidth (700GB/mo), not function execution hours.

**What breaks on a real Tuesday:** Vercel function execution hits the 1,000 GB-hour limit (unlikely at <500 customers, but unmonitored). Vercel charges $0.60/GB-hour overage. The cost-watchdog does not monitor Vercel function execution costs — only `audit_log.cost_usd` which is Anthropic token spend. A Vercel overage can accumulate unnoticed until the monthly Vercel invoice.

**Source critic:** Cost-projection critic

---

## Out-of-scope (not addressed)

- §3A BOM line items (excluded per scope)
- DR runbook content (excluded per scope)
- Multi-tenancy / GDPR posture (excluded per scope)

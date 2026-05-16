# Audit Lens — Adversarial Red-Team

**Scope:** Build-prep artifacts (Day-1 flow, 15 rules, empty states, board decisions, agent roster, UX architecture).
**Lens:** What breaks in production on Day 1 / Week 1 / Month 1? Worst customer, worst world state.
**Auditor stance:** Hostile. Not friendly. No benefit of the doubt.

---

## Day-1 likely breaks (high-confidence)

### D1. Paddle webhook race vs Day-1 chain (the unsigned death-trap)
`03-DAY-1-FLOW.md` Step 1 says: webhook arrives → "Find user_id by paddle_customer_id" → UPSERT subscription → fire `day1.onboarding`. **Problem:** in the free-scan → paywall flow, the Paddle customer is created at checkout, but `paddle_customer_id` is not stamped on the `user_profiles` row until *after* the webhook arrives. Lookup fails. The spec hand-waves "find user_id" but never specifies how. Worst case: user pays, webhook fires, no user row found, webhook 200s back (or it 500s and Paddle retries with exponential backoff), user sits on `/onboarding/post-payment` polling forever. Recovery requires Adam to manually run a SQL match by email.

**Likely mitigation missing:** the spec needs `passthrough` (Paddle's custom data field) carrying the Supabase `user_id` at checkout creation. Brief 07-WAVE-0 doesn't mention it. Brief 09-WAVE-1 Backend Worker 2 doesn't either.

### D2. Webhook ordering is not guaranteed
Paddle does not guarantee delivery order. `subscription_created` and `transaction_completed` can arrive in either order, or twice (Paddle retries). The plan handles `subscription_created` as the Day-1 trigger but doesn't deduplicate. If both fire `day1.onboarding`, we run Query Mapper twice, double-bill credits, generate duplicate suggestions. **No idempotency key documented on the Inngest event.** Adam's checklist mentions "test card works end-to-end" — that test will not catch retry/dedup bugs.

### D3. Inngest free tier breaks Day-1 at the 10th customer
Memory says start on Inngest free (50K steps/mo). `05-BOARD-DECISIONS` §Infrastructure-Upgrades 2026-04-18 says "Inngest Pro ($75/mo) — free tier breaks at 10-15 users." The Adam-Checklist still says "start free tier." Wave 0 ships on free, customer #11 signs up, Day-1 chain queues but never runs because step limit hit. The user sees "Setting up your workspace…" forever. No alerting on Inngest quota in the spec. **Direct contradiction between Adam-Checklist and Board-Decisions; nobody resolved which one wins before Wave 0.**

### D4. Day-1 90s target collides with reality
Day-1 chain: Paddle webhook (sometimes 30s delayed) + Query Mapper (1 LLM call, but Sonnet 4.6 long-form ≈ 15-25s P50, 60s P95) + 7-engine scan (each engine 8-30s; Build runs them serially as "each engine a separate Inngest step" per memory) + rules + email = realistically 3–5 minutes P50, 8+ minutes P95. The UI promises "about 90 seconds" in empty state body copy. After 180s the spec shows "We'll finish in the background" escape hatch — that's the user's first impression of a $189/mo product. **Promised 90s is a lie on Build/Scale tiers.**

### D5. Polling endpoint at 2s × 180s = 90 hits per checkout
`/api/onboarding/day1-status` polls every 2s for up to 180s. At 100 concurrent post-payments that's 9000 requests/min just from polling. Each one needs a Supabase JWT verification + RLS-checked select on `user_profiles`. **Supavisor connection pool will exhaust** before the load test ever runs. No mention of SSE/Realtime upgrade path in 03-DAY-1-FLOW.md — only buried in 01-P0-RESOLUTIONS.md T2 as "Realtime is opt-in via env flag until 100+ concurrent users verified." So you find out at user 101.

### D6. Step F email assumes `day1_completed_at` is durable, but Inngest steps aren't transactional
The chain marks `day1_completed_at` in Step F after `send_welcome_email`. If Resend rate-limits or fails, the step retries, and the welcome email lands twice. Resend free tier = 100/day. Beyond that, Day-1 emails silently drop. Spec doesn't mention Resend tier or daily-limit handling. P1-15 confirms top-up email isn't there; nothing audits the welcome email either.

### D7. Step C waits for `scan.completed` with 120s max — but Wave 1 Backend Worker 2 owns scan-manual, which fans out engines as separate Inngest steps
The brief says "fire scan-manual Inngest job ... wait for scan.completed event (max 120s)." On Build (7 engines), Inngest free tier (no concurrency boost) processes steps serially per function. 7 × 15s = 105s. Add a single Perplexity slowdown (30s) and you blow the 120s wait. Spec says "longer = warn user" — but the chain doesn't continue past Step C, so suggestions never generate. **User lands on /home with no suggestions; sees "Day-1 ready" notification that lies.**

### D8. Free-scan deterministic fixture URL — that's a verification test, not a real Day-1 scan
Wave 2 E2E test uses a deterministic fixture URL. Real users upload random URLs. Worst real-world inputs: site is 502/down, site is behind Cloudflare bot challenge, site is a single-page app (no SSR — Perplexity Sonar gets nothing), site has `noindex`, site is geofenced and the scan engines hit from US IPs but the business is in Israel and serves Hebrew content only to IL IPs. None of these failure modes appear in the Day-1 flow. Each one results in a scan that "completes" with zero useful data → rules engine fires zero suggestions → empty Home with the optimistic "No immediate moves needed" message (which is a lie; the data is just garbage).

### D9. Hebrew business name mangling — first impression broken
A Hebrew-named business (e.g., בית קפה בתל אביב) is passed to LLMs as part of system prompts and template variables like `{{businessName}}`. Empty states use it: "Setting up your workspace…" → "Mapping how AI engines see {{businessName}}…". If the agent runs in English mode but the business name is Hebrew, RTL strings break inside an LTR sentence. Welcome email subject: "Welcome, בית קפה" — Resend may or may not encode this correctly via SMTP UTF-8 (depends on Resend's behavior with mixed-direction headers; not validated in spec). **No spec line about how Hebrew names appear inside LLM template strings, and the Hebrew prompt-variant work is deferred to Wave 2.** On Day 1 a Hebrew business sees broken English-template output with their name garbled in the middle.

### D10. `scan_id` linkage on `free_scans.converted_user_id` requires the user to come back to checkout *from the same browser*
Step A: "If user signed up from free scan: link `free_scans.converted_user_id`, copy business profile fields." How is the link established? Implicit assumption: `scan_id` is in URL or cookie when user clicks "Fix this now." If user emails the result link to themselves, opens on mobile, and pays there, the `scan_id` is lost. Day-1 chain falls through to "skip Day-1 chain, surface profile-completion prompt" — but pricing page entry has no scan_id either. **Result: anyone who pays from any path other than the result-page CTA gets a degraded onboarding.** The "most users come via free scan" assumption is a hope, not a guarantee, especially with Framer-driven traffic going to `/pricing`.

---

## Week-1 likely breaks

### W1. 14-day money-back + 25 Discover runs = trivial refund-bombing
Discover gets 25 AI Runs. Build gets 90. **A user can sign up for Build ($189), burn 90 runs in 13 days, refund. Net cost to Beamix: ~$15-25 in API costs, $5-8 Paddle fees. Net to user: $189 worth of agency-level deliverables for $0.** No mention of refund mitigation in `05-BOARD-DECISIONS-2026-04-15.md` beyond "Monitor refund rate. Tighten policy only if refund rate exceeds 5%." On a small base (5 paying users), one refund = 20% refund rate, way past the threshold, and you're already torched. No spec for: requiring used-runs to be deducted from refund value, blocking refunds after >50% credits consumed, or fraud detection on signup→refund patterns.

### W2. Annual plans = 10× refund exposure (acknowledged but not mitigated)
"Annual: refund exposure is 10x higher per incident on annual plans. Monitor closely." Mitigation: literally nothing. One Build annual customer ($1,812) refunding wipes a month of revenue at MVP scale. Adam-Checklist defers annual pricing rollout "60 days post-launch" — but 09-WAVE-1 Frontend Worker 3 says "Paywall modal ... monthly-only (annual deferred per B2)." Inconsistent with `05-BOARD-DECISIONS-2026-04-15.md` §Decisions-Added-2026-04-17 "Ship with annual pricing from day 1." **Adam needs to resolve this contradiction before launch.**

### W3. Sonar QA citation verification rate-limits at scale
P1-11 says Sonar verification runs on Content Optimizer, Authority Blog Strategist, FAQ Builder. Cost ~$0.02/run. **Perplexity Sonar API has rate limits** (current public docs: ~50 req/min on Sonar tier; Sonar Pro higher). Day-1 + a normal active hour with 50 paying users running parallel agents = burst spike. QA stage fails → entire pipeline fails → `releaseCredits` → user sees failure card → "Your credits were refunded" toast. Multiple of these per hour and Inbox is full of failure cards. No backoff/queue strategy in the spec.

### W4. Inbox Realtime not enabled, polling at 5s × number-of-tabs = death
T2: "useInboxPolling() at 5-second interval as default." Power user opens Inbox in two tabs. Notification bell in `DashboardShell` polls `GET /api/notifications`. Home polls `GET /api/onboarding/day1-status` (for late returners). Automation polls credit balance. Realistic concurrent connections per user: 3-5 active polls every 2-5s. 50 active users = ~500-1000 reqs/min steady state. Supabase Free tier limit is 60 connections; Pro is 500. Each request opens a connection to verify JWT + RLS read. **You don't hit polling-killed-the-DB until ~100 active users and you've already promoted to production.**

### W5. Suggestion `cooldownDays` enforcement reads `suggestions` table with no index hint
`evaluateRules()` filters by `(businessId, ruleId, keyContext)` within `cooldownDays`. Wave 0 Worker 1 doesn't appear to spec an index on `suggestions(business_id, rule_id, created_at)`. After a month of activity the table grows and rules eval slows per-scan. Daily Build scan × 50 users × 15 rules = up to 750 query-time joins/index seeks. Slow rules-eval blocks suggestion population for ~minutes per scan. Mitigation: add the right index. Spec gap.

### W6. Free preview accounts pile up
"Email required. Auto-creates a preview account." Anyone who enters an email in the free-scan flow gets a Supabase auth user. Email validation? Disposable email blocking? Captcha (mentioned in 8-expert audit "Cloudflare Turnstile" but not in 06-ADAM-CHECKLIST)? **Spam vector:** scraper hits `/scan` API with random URLs + temp emails, generates 1000 preview accounts/day, each consuming Sonar + LLM cost on the free scan engines. At $0.04/preview that's $40/day adversarial cost burn before anyone notices. The 8-expert audit calls out Turnstile but it's not in the wave briefs as a deliverable.

### W7. Day-1 Step E "ready_to_run" semantics not specified
"Mark the highest-impact suggestion as 'ready_to_run' (visible immediately). Mark the next 2 as 'delayed_60s' (visible after 60s)." What enforces the 60s delay? Client-side timer (broken on refresh), server-side `suggestion.visible_at`? If client-side, user refreshes, sees one suggestion, refreshes again 60s later expecting more — gets the same one — feels broken. If server-side, spec needs `visible_at` column not enumerated in 05-DB-MIGRATION-PLAN.md. Gap.

### W8. Credit hold/confirm/release on pipeline crash
`12-AGENT-BUILD-SPEC.md` says pipeline uses hold→confirm→release. If the Inngest worker crashes between `hold_credits` and either confirm/release, the hold sits forever. No TTL on holds documented. After 100 crashes, every user has phantom-held credits, balance shows wrong number, paying customers complain. Mitigation: hold TTL via scheduled cron sweeping holds older than N minutes. Not specced.

### W9. Schedule fires while kill switch toggles (race)
Automation cron + kill-switch toggle race: Inngest cron at 7:00:00 reads schedule snapshot; user toggles kill switch at 7:00:01; agents fire at 7:00:02. Kill switch was "instant" but the queued runs still complete. User sees Inbox fill up with drafts they didn't authorize. **No check inside the agent pipeline runner that re-reads kill switch state before each step.** Spec says "kill switch is sacred" — that's a marketing claim, not an implementation.

### W10. Off-Site daily-cap reset at midnight UTC = bad UX in IL
Daily caps reset at midnight UTC = 02:00 / 03:00 Israel time. Israeli SMB owner finishes work at 18:00 IL (15:00 UTC), hits Off-Site cap (3/day on Discover), tries again at 09:00 next morning (06:00 UTC) — still capped because reset hasn't fired. Confused user, support ticket. No mention of timezone-aware caps. Memory says Israeli is primary market.

---

## Month-1 likely breaks (latent risks)

### M1. OpenRouter cache hit rate goes downhill silently
Wave 0 Worker 2 instruments "cache-hit telemetry on day 1. If hit rate < 80% on long system prompts, fall back to direct Anthropic API." Question: where does that telemetry alert? Mentioned in 01-P0-RESOLUTIONS T1 but not in Wave 2 devops-lead brief. If OpenRouter quietly degrades cache to 50% over a month, costs 3-4× silently. End-of-month bill arrives at ~$2,500 instead of ~$800. No alert threshold spec'd.

### M2. `topic_ledger` and `page_locks` cleanup never specced
Both tables grow forever. After a year of 100 users × 90 runs/mo there are thousands of rows. Lookup degrades. No retention/cleanup policy.

### M3. Performance Tracker "directional language only" is correct policy but reads as evasive on Month 2
Users read score chart: score went 34 → 41 → 38 → 42. Performance Tracker says: "Trend observed." They cancel. **Retention hook #1 is "score moved from X → Y this week"** — but the spec also says "AI engines give different answers every run — causal attribution is impossible." Without causal language, the score is just noise. Retention hook is hollow. Real risk: Month 2 churn cliff because the product can't say "your action did this."

### M4. Discover-tier viability
25 AI Runs/month on Discover. Realistic workflow: Query Mapper (1) + 3 × Content Optimizer (6) + 2 × Reddit Planner (2) + a few Freshness Agent (3) + Authority Blog Strategist (not available) = ~12 runs/mo for any serious customer. The other 13 are "in case." But the Inbox throughput needs 1+ approval per run to demonstrate value. 25 runs = 25 approval events/mo = less than 1/day. **A user paying $79 expects more weekly activity than a sub-daily approval rate.** Discover users likely either churn at month 2 (not enough activity to feel value) or upgrade to Build (validating the funnel). Spec assumes upgrade; doesn't model churn cliff if 80% of Discover users hit the "not enough activity" wall.

### M5. Auth Blog Strategist `topic_ledger` race
Spec says Blog Strategist + FAQ Builder share `topic_ledger` to avoid duplication. If user schedules both agents weekly on the same cluster, the race is unhandled: both check ledger, see empty, both publish for same topic.

### M6. "User marks published" verification loop is unenforceable
Off-Site verification: user marks "published" → URL probe at +48h. If user lies about publishing (or publishes to a private listing), the probe fails, Archive item flags "unverified," but credits already burned. Spec is fine with this — but it directly contradicts the retention hook #3 "you shipped something confirmation loop." If 30% of marks-published probe-fail, the confirmation loop is broken.

### M7. Wave 1 ships before customer validation completes
P0-7 says validation runs in parallel with Wave 0/0.5 (~3 days), feeds Wave 1 copy. Wave 1 brief estimates 40-80 turns per worker. Validation finishes long before Wave 1 merges. **But:** if validation reveals "users don't understand AI search visibility," the change is buried in copy strings, not a positioning rethink. Wave 1 builds the wrong thing fast.

### M8. RLS smoke test only inserts two test users
`05-DB-MIGRATION-PLAN.md` smoke gate: "test by inserting two test users and attempting cross-account reads." This catches obvious owner-scoped failures. Misses: service-role policy bugs (admin policies that leak across orgs in future multi-tenant), JWT claim spoofing, `anon` role read paths on tables that should be authenticated-only. Insufficient for production launch.

---

## Customer perception bugs (won't crash, will hurt conversion / retention)

### CP1. "About 90 seconds" promise vs reality (D4)
Empty state body literally says "This takes about 90 seconds." On Build tier with 7 engines it will routinely be 2-3 min. **Best signal:** delete the 90s number from the copy. Show progress bar % only. The spec hardcodes a number that will be a lie.

### CP2. "25 AI Runs" sounds insulting at $79
$79 = ~NIS 285. Israeli SMB owner expects to be doing things daily. 25 actions/month = less than 1/day. Compared to a $1,500/mo agency that does daily output. Pricing page positions Beamix against agencies — but Discover gives sub-agency cadence. Build is the real product. Discover risks being perceived as "demo tier" priced at full SMB tier rates.

### CP3. Failure card refund toast = "we just charged you and refunded — what just happened?"
P1-10 empty state: "Run failed — N credits refunded." User sees: agent appeared to start → failed → credits returned → no output. Even though it's technically correct, the toast frames the failure as a charge-refund cycle. Better framing: "Run didn't complete. You weren't charged." Word "refund" implies money moved.

### CP4. Day-1 escape hatch ("we'll finish in the background") is acceptable on Stripe checkouts because it's recovery, but here it's the *first* experience
After paying $189, "We hit a snag — your data is safe. We'll finish in the background. [Continue to dashboard]" then landing on an empty home with "Setting up your workspace…" — first impression is "this is fragile." This is exactly the dead-dashboard problem P0-5 was supposed to fix. The escape hatch reintroduces it.

### CP5. Suggestion freshness boost feels random
Ranker formula: `score = baseImpact × creditFit × tierAvailability × freshnessBoost`. `freshnessBoost: 1.2 if rule has never fired for this business`. Result: each scan surfaces the never-fired rules first (R10 Wikidata, R11 Reddit, R15 Authority Blog), even if the actually-impactful Content Optimizer rule (R04 Competitor Gap) is ranked #2 because it's a repeat. Users see suggestions and think "this is a different thing again — I just want the competitor fix from last week." Re-prioritization needed.

### CP6. "No immediate moves needed" celebration state (`04-EMPTY-STATES.md` score <80 no rules fired)
"This scan didn't surface high-priority actions. We'll re-evaluate on your next scheduled scan." Customer paid $189 and the product says nothing to do for 7 days. Churn-prone. Better: a downsell to FAQ Builder + Schema Generator (free agents) — give them activity.

### CP7. Welcome email "topSuggestionTitle" — what if there are zero?
Step F: Resend template "welcome-onboarded" with `topSuggestionTitle` variable. If `evaluate_rules` fired zero suggestions, what does the email say? "Your top suggestion: undefined." Or template-side null check that drops the line and the email is awkwardly short. Not specced.

---

## Cost / abuse runaway scenarios

### A1. Adversarial Build user — 90 runs in 13 days
Sign up Build ($189) → run 90 expensive agents (Authority Blog × 30 = $11.40 LLM cost + Content Optimizer × 30 = $5.40 + ...) → request refund day 13. Net loss to Beamix per incident: ~$30-50 in LLM + Paddle fees, plus the operational cost. At 10 abuse attempts/month: $300-500 loss. No mention of run-count-aware refund logic in spec.

### A2. Free scan as Sonar-burning vector
`/api/scan/free` is unauthenticated (just an email gate). Each call runs 3 engines (ChatGPT, Gemini, Perplexity Sonar). Cost ~$0.04. Adversary loops with random URLs + temp emails: 1000 scans/day = $40/day = $1200/mo. No Cloudflare Turnstile in the Wave 0 deliverables despite 8-expert audit calling it out.

### A3. Reddit Presence Planner with no Reddit API = wasted LLM tokens, no value
Agent #11 outputs subreddit strategy. No actual Reddit signal — pure LLM-generated. Cost: $0.07/run. Output quality is unverifiable. Adversary or bored user runs it on every query cluster: 50 clusters × $0.07 = $3.50/user/mo with zero verified value to Beamix. Multiplied across users.

### A4. Top-up loophole (theoretical)
$19 = 10 runs. Per memory the top-up is for "mid-month exhaustion." If Build user is run-out, they top-up for $19 (10 runs of which Authority Blog at 3 runs = ~3 articles → $1.14 in LLM cost). 5-6× gross margin. **But** if any run fails and refunds, customer thinks they bought 10 articles and got 9. Top-up refund handling isn't specified.

### A5. Daily-cap reset gaming
Schema Generator: 20/day all tiers (free). User runs 20 schema gens on Day 1, 20 on Day 2 → 600/mo at zero credit cost. ~$0.03/run × 600 = $18/mo of free LLM cost per Discover user. Not a death-blow but eats Discover's margin (Discover gross: $79 - Paddle 5% - $18 = ~$57). Probably fine, but no telemetry on schema-gen abuse patterns.

### A6. OpenRouter outage = full app stops
OpenRouter is the SPOF for all agents and most scans. Adam-Checklist captures a single OpenRouter key. No fallback routing documented except "direct Anthropic if cache <80%." If OpenRouter has a 30-min outage (real precedent in 2024-2025), all agents fail, all scans fail, all Day-1 chains stuck. Spec mentions direct Anthropic but not Perplexity-direct or Gemini-direct fallback.

### A7. Cost circuit breaker mentioned but not delivered
8-expert audit §Security says "cost circuit breaker." Wave 0 Worker 2 brief doesn't list it as a deliverable. Wave 1 brief doesn't list it. **Missing critical safety net.**

---

## Onboarding cliff drops

### O1. Magic-link to spam
Preview account creation uses Supabase Auth email gate ("Email required. Auto-creates a preview account."). Supabase's transactional from-address by default lands in Gmail Spam for new domains. Adam-Checklist sets up `notify.beamixai.com` Resend DNS — but Supabase Auth emails use a different sender unless explicitly configured. Worker 1 doesn't appear to configure custom SMTP/Resend for Supabase Auth emails. **Day-1 magic-link → spam → user gone.**

### O2. Post-payment polling timeout = checkout abandonment metric pollution
After 180s the escape hatch fires. User clicks "Continue to dashboard" → lands on `/home` with WAITING / ENSURE_BUSINESS / etc. still pending in DB. Wave 1 Frontend Worker 1 builds Home Day-1 empty state for `day1_state ∈ {'query_mapper','scan_running','rules'}`. If state is still `waiting_webhook` (Paddle webhook hasn't arrived) the Day-1 empty state doesn't render because the rendering condition excludes `waiting_webhook`. **Logic gap:** user sees the *regular* Home page (empty score, empty inbox) with no setup state shown. Looks completely broken.

### O3. 4-engine scan on a slow URL
Free scan = 3 engines (ChatGPT, Gemini, Perplexity). If user's URL is slow (>10s TTFB), each engine takes longer to research → 90-180s for free scan. The 60-90s animation finishes; UI doesn't gracefully extend. Spec says "60–90 second dark animation" — that's hardcoded UI promise.

### O4. Free scan high-score state forces upsell on already-happy users
Score ≥80 empty state says "Set up weekly tracking" → enables Performance Tracker schedule. Performance Tracker requires a paid plan. The empty state CTA leads to a paywall — but the framing was "you're already visible," which means the user doesn't feel the wound. **Conversion-killing combo:** show celebration → ask for money.

### O5. Hebrew/RTL traps in the magic link email body
Resend templates are typically LTR HTML. Hebrew content in subject + body needs `dir="rtl"` blocks. Wave 1 Backend Worker 3 ships 6 templates — no mention of HE/EN dual-direction support. Hebrew users get LTR-rendered Hebrew = broken layout.

### O6. Onboarding step Query Review Gate added 2026-04-18 but not in 03-DAY-1-FLOW.md
Board decision added "User reviews top-10 queries before downstream agents fire." This is a *blocking user interaction* in the Day-1 chain. The Day-1 flow doc (03-DAY-1-FLOW.md) doesn't include this step. **Spec drift between board decisions and the Day-1 flow.** Either the Day-1 chain runs without it (board decision violated) or there's a hidden step that nobody is building. Big risk: ai-engineer ships agents that assume Query Mapper output is approved when in fact it's the raw Day-1 output.

---

## Concurrency / race conditions in product semantics

### R1. Multiple Inbox approvals on same item
User opens Inbox in two tabs, both showing draft. Tab A clicks Approve. Tab B (stale) clicks Approve. Two POSTs to `/api/inbox/[id]/approve`. Both succeed (idempotency not specced). Two `archive_items` rows. Spec doesn't specify the approve handler's idempotency strategy.

### R2. Suggestion dismissal during run
User dismisses a suggestion that's `running` (not `pending`). Spec doesn't define the dismiss state-machine — does it cancel the agent? Refund credits? Or just mark dismissed and let the agent finish into Inbox? Either choice is defensible; spec leaves it open. Wave 1 Backend Worker 1 will guess.

### R3. Schedule fires while kill switch toggles
Covered above (W9).

### R4. Scan completes while user uploading a tracked query
Tracked queries table mutated mid-scan. The scan reads the snapshot, the user adds a query, scan completes without including it. User sees their newly-added query missing from scan results, files support ticket. Read-isolation snapshots aren't specified for scans.

### R5. User upgrades during Day-1 chain
Discover user signs up; Day-1 chain fires with 3 engines. Step C is mid-scan when user upgrades to Build via Paddle portal. `subscription_updated` webhook fires; Day-1 doesn't re-trigger; user gets a Discover-tier first scan but a Build credit pool. Score shown is Discover-quality; first impression broken.

### R6. User cancels during Day-1 chain
User pays Build, Day-1 starts, user panics at "We hit a snag" message, requests refund. Paddle `subscription_cancelled` fires before `day1_completed_at`. Refund handler zeroes credit pool. Day-1 chain Step F tries to write `day1_completed_at` but the user has no plan. No spec for this; results in Inngest function error and Sentry noise.

### R7. Daily cap pre-run + during-run drift
12-AGENT-BUILD-SPEC.md says "read pre-run, increment post-DO step." Between read and increment, the user opens a second tab and triggers same agent type. Both pre-run checks pass; both increment; daily cap exceeded by 1. Not catastrophic but breaks the "20/day = 20/day" guarantee.

### R8. Free preview account auto-merge on real signup
User does free scan with email A. Later wants to "sign up" properly with email A. Supabase has a preview row; do we replace, merge, or block? Spec doesn't say. If merge, what happens to the scan history? If replace, the user "loses" their free scan record.

---

## "It works in isolation but not at scale"

### S1. Inngest free tier — see D3.

### S2. Supabase connections — see W4.

### S3. OpenRouter cache miss — see M1.

### S4. Sonar rate limits — see W3.

### S5. Resend daily send limits — see D6.

### S6. Sentry quota
8-expert audit mentions Sentry but Adam-Checklist captures DSN only. Free tier 5K events/mo. A pipeline that throws on every Sonar timeout (~5%) fills the quota in days at scale. No spec for sampling.

### S7. Vercel function timeout (60s default, 300s max on Pro)
Day-1 endpoint `/api/onboarding/day1-status` is just a poll-status read — fine. But `/api/scan/free` (anonymous, synchronous?) and `/api/agents/run` — if either is synchronous on a Vercel Pro plan it can hit 300s. Spec implies Inngest fire-and-poll, but the brief doesn't explicitly mandate it for every long-running endpoint. Risk: a worker implements `/api/agents/run` synchronously and runs into Vercel timeout when the agent pipeline takes >60s.

### S8. Single-region Supabase + global users
Israel-primary, US-expansion-month-2. Single Supabase project = single region (us-east-1 by default). Israeli users add ~120ms latency on every request. With 5 polls/page × 3 active tabs × 100 users = noticeable laggy feel. Not blocker but spec didn't mention region selection in Adam-Checklist.

---

## Refund-bombing

### RB1. The basic vector (A1 above)
Build user runs 90 valuable agents in 13 days, refunds. Net positive for user, net negative for Beamix.

### RB2. Annual refund (W2 above)
Single annual refund wipes 10× monthly revenue. No protection.

### RB3. Refund + re-signup loop
User refunds Build, signs up Discover ($79), runs 25 agents, refunds, signs up again with new email, repeats. Adam-Checklist doesn't capture an abuse-detection plan. Paddle doesn't deduplicate by card automatically across email accounts. Same card → new account → another refund.

### RB4. Top-up after running out, then refund subscription
User on Build runs out of credits day 20, buys $19 top-up, runs 10 more runs, refunds the $189 subscription on day 25 (within 14-day window). $19 top-up policy not stated. Does the top-up refund too? Paddle policy is "all transactions within window" — Beamix loses the top-up margin too.

### RB5. Refund triggers archived items still referencing paid features
User refunds → `subscriptions.status = cancelled`, credit pool zeroed. Archive items reference Authority Blog Strategist outputs (Build-only). User comes back later as Discover — they can still view their old Authority Blog output? Or is it locked behind a tier-paywall? Spec doesn't say. Cancellation flow may leak Build-tier content to Discover-tier users.

---

## What the spec covers well (sanity check)

Even hostile audit: not everything is broken.

- **DB hard-reset is correct.** Avoiding `ALTER TYPE` Postgres pain is the right call. Risk is bounded.
- **15 rules with explicit cooldowns** — better than most MVPs. Real engineering thinking.
- **No-AI-disclosure policy explicitly locked** — saves a class of QA work and avoids EU AI Act overreach.
- **Inngest step idempotency** explicitly called out — most MVPs forget this.
- **Worktree discipline + worker-isolated briefs** — sound. Won't merge-conflict at scale.
- **Empty states pre-spec'd before build** — most teams add these at the end.
- **Risk-tiered QA gate** — sensible compromise.
- **Sonar citation verification** built into QA (P1-11). This catches hallucinations early.
- **No autopilot** — validated by research. Right call.
- **Hard-reset + parallel waves** — Adam's army can absorb the risk; faster than a careful in-place migration.

---

## Summary (≤300 words)

**Top 5 things that will break in the first week:**

1. **Paddle webhook ↔ user_id race (D1/D2).** No `passthrough` user_id in checkout, no idempotency key on `day1.onboarding` Inngest event. New paying customers will hang on the post-payment screen until Adam manually SQL-fixes them; some will get billed twice for Query Mapper. This is the single most likely Day-1 incident.

2. **Inngest free tier breaks at customer #11 (D3).** Board decision said Pro is required from launch; Adam-Checklist still says start free. Wave 0 launches on free → step quota exhausted → Day-1 chains stuck → "Setting up your workspace…" forever. Unresolved contradiction must be fixed pre-Wave 0.

3. **90s Day-1 promise is a lie on Build tier (D4/D7).** Real P50 will be 2-3 min on 7 engines, P95 over 5 min. Empty-state copy hardcodes "about 90 seconds." First impression of a $189/mo product is a slow, opaque setup screen.

4. **Refund-bomb: 90 runs → refund on day 13 (W1/A1/RB1-5).** No run-aware refund logic, no abuse-detection, no top-up refund policy. One mid-skilled adversary extracts $189 of agency-level deliverables for ~$15-25 in API cost. Annual plans amplify by 10×.

5. **Polling-based Realtime fallback dies at ~100 users (W4/D5).** Inbox + Day-1 + credits + notifications all polling at 2-5s intervals. Supabase connection pool saturates. You discover this only after promotion to production. Spec defers Realtime to env-flag without a clear flip-the-switch threshold.

**Verdict:** The spec is high-quality strategically but operationally underspecified at the integration seams (Paddle ↔ Auth ↔ Inngest ↔ Inbox). **Not launch-ready as written.** Resolve D1, D3, D4, W1 and add a cost circuit breaker (A7) before Wave 0 spawns. Everything else is fixable in Wave 2 polish — these five are launch-blockers.

# MAP-B — Beamix User Flows / Journeys (Finished-Product Vision)

**Date:** 2026-06-06
**Purpose:** Flowchart-ready map of the Beamix product user journeys as envisioned in the docs (PRD v5.0 — agency pivot 2026-05-23). Each journey is an ordered step list with explicit `DECISION:` branch points so it converts cleanly into a Miro flowchart.

**Product framing:** Beamix is a done-for-you GEO (AI search visibility) agency delivered as software. Free scan (no signup) → agent-led discovery call → subscription → agent fleet delivers schema/citations/listings/content/outreach → tiered approval gates (auto-publish vs 1-click approve in weekly digest) → outcomes dashboard → 60-day money-back.

**Authoritative sources:**
- `docs/PRD.md` (v5.0 — funnel, approval gates, money-back) — PRIMARY for finished-product shape
- `docs/product-rethink-2026-04-09/build-prep-2026-05-13/03-DAY-1-FLOW.md` — Day-1 post-payment chain
- `docs/product-rethink-2026-04-09/14-SCAN-UX-SPEC.md` — free-scan funnel
- `docs/product-rethink-2026-04-09/build-prep-2026-05-13/02-AUTOMATION-RULES.md` — rules engine
- `docs/04-features/specs/agent-digest-writer.md`, `agent-approval-gate-writer.md`, `agent-customer-success.md`
- `docs/product-rethink-2026-04-09/19-SUPPORT-CHANNEL-SPEC.md` — support/refund triage

> **Vocabulary reconciliation note.** Two layers of docs coexist. The PRE-PIVOT build-prep specs (Day-1 flow, scan-UX, automation-rules) use tool-framed terms: `Discover/Build/Scale` tiers, "credits/AI Runs", `/home`, `Inbox`, "suggestions". The POST-PIVOT PRD v5.0 (the *finished product*) renames the funnel to: agency tiers `Starter $499 / Growth $999 / Scale $1,499 / Professional $2,499`, hides agents/credits entirely, and renames surfaces to `Outcomes (Home)`, `Approval Queue`, `Weekly Digest Archive`, `Traceability`. **This map follows the PRD v5.0 finished-product vision and flags where the build-prep mechanics still feed it.** Conflicts are listed at the end.

---

## Cast — Pages & Agents (referenced throughout)

**Customer-facing pages (PRD v5.0 nav):**
- Public landing (vertical: SaaS / Legal / Dental)
- `/scan` (free scan — single route, client-state driven)
- Discovery booking + agent-led discovery call surface
- Paddle checkout (hosted) → `/onboarding/post-payment` (Day-1 progress UI)
- `Outcomes (Home)` — visibility score per engine, weekly wins, top winning queries, trajectory chart
- `Approval Queue` — 1-click approve/reject cards
- `Weekly Digest Archive` (`/dashboard/digest-archive`)
- `Traceability ("How we got this")` drill-down
- `Settings` — Profile · Brand fingerprint · Billing · Approval preferences · Publishing integrations · Cancel (one-click)
- `/help` + in-app support widget (Plain/Crisp)

**Agents / pipelines (internal — NEVER shown to customer; "Beamix" is the singular voice):**
- Discovery agent · Brand-brief manager agent · Approval-gate writer agent · Digest writer agent · Customer success agent · Publisher agent · Strategy agent
- Repurposed: Content/FAQ · Schema · Citation · Visibility tracker · Competitor intelligence
- Pipelines/jobs (Inngest): `scan-free`, `scan-manual`, `day1.onboarding`, rules engine `evaluateRules()`, digest cron, agent run jobs

---

## JOURNEY 1 — FREE SCAN FLOW
**Pages:** Public landing → `/scan`
**Agents/pipelines:** `POST /api/scan/free` → Inngest `scan-free` job (Perplexity research + 6-engine query + Gemini Flash analysis) · `POST /api/scan/suggest-competitors` (Claude Haiku)

1. Visitor lands on a vertical-specific public landing page (SaaS / Legal / Dental).
2. Visitor clicks "Scan my visibility" → routes to `/scan` (public, no auth). Page state = `form`.
3. **Step 1 form:** enter Business URL. Validate as URL on blur.
   - DECISION: URL valid? → [No: inline field error, red border, stay] [Yes: reveal Step 2 (spring animation)]
4. **Step 2 form:** select Industry (from `industries.ts`) + Location → "Continue" reveals Step 3.
5. **Step 3 form:** optionally add up to 3 competitors. As user types, `POST /api/scan/suggest-competitors` returns Claude-Haiku competitor suggestions (the "gift" — product feels like it's already working).
6. Click "Start scan →". Validate all inputs client-side.
   - DECISION: `POST /api/scan/free` returns 202? → [No (5xx): "We couldn't start the scan — try again" + retry] [Yes: store `scanId` in state + sessionStorage → state `scanning`]
7. **Scanning animation** (same route, dark ritual screen): 6 engine pills (ChatGPT, Gemini, Perplexity, Claude, Google AI Overviews, Grok), query ticker, sonar pulse, time-based progress ring. Poll `GET /api/scan/free/[scanId]` every 3s; pills light up as each engine result arrives.
   - DECISION: poll status? → [`running`: keep polling, animate] [`complete`: stop → state `revealing`] [`failed`: state `error`] [90s timeout, no result: "taking longer than expected — we'll email you" + email capture]
   - DECISION (sub): engine partial failure (1–2 engines fail)? → [≥4 engines complete: show result, gray out missing] [<4 complete: treat as failure/error]
8. **Wound-reveal result** (state `revealing` → `revealed`): animated sequence — score counts up (0→actual, color by tier), engine bars slide in (you vs top competitor), competitor cards (loss-aversion framing), fix cards.
   - NOTE — PRD v5.0 vs scan-UX-spec CONFLICT on the reveal: PRD §"Key User Flows 1" says result shows **"3 named opportunities (no blur, no paywall)"**; the older `14-SCAN-UX-SPEC.md` shows **3 visible fix cards + 8 blurred cards behind a frosted paywall overlay + email soft-gate**. Finished-product (PRD) = no blur/no paywall on the free result. Flag for reconciliation.
9. **CTA section** (after reveal):
   - DECISION: which CTA? →
     - [**"Book your 20-minute discovery call"** (PRD primary CTA — the finished-product path): → JOURNEY 2]
     - [**"Fix this now"** (scan-UX-spec path): jump straight to Paddle paywall modal → JOURNEY 2 at checkout]
     - [**"Explore the product first"** (scan-UX-spec preview path): email capture → preview account → `/home?preview=true` with feature gates]
     - [No action: 20s after `revealed`, **email soft-gate** overlay appears once (dismissible once per session); "Save your results — enter email"]
10. DECISION: email captured (soft-gate or preview)? → [Yes: Supabase magic-link sent → on click lands `/onboarding/post-scan?scan_id=` → links free scan → `/home`] [No: visitor leaves; scan result retained 30 days]

**End state:** scan complete + result viewed; visitor either books discovery (Journey 2), enters preview, or leaves with a captured email.

---

## JOURNEY 2 — ACQUISITION → ACTIVATION (scan result → first deliverables in week 1)
**Pages:** scan result → Discovery booking → agent-led discovery call → Paddle checkout → `/onboarding/post-payment` → `Outcomes (Home)`
**Agents/pipelines:** Discovery agent · Brand-brief manager agent · Paddle webhook → Inngest `day1.onboarding` chain (ensure_business → Visibility-tracker/Query-Mapper → query review gate → first paid scan → rules engine → auto-run top agents → welcome email)

1. From scan result, customer clicks **"Book your 20-minute discovery call"**.
2. Customer books a slot (booking surface; scheduling async per support spec — Calendly-style, not phone hotline).
3. **Discovery agent runs the agent-led call** — maps brand, services, market, target queries, restricted topics, approval preferences, publishing integrations to connect.
4. **Brand-brief manager agent** generates the **brand fingerprint** (canonical, versioned). All downstream agents read from it.
   - DECISION: is this customer ≤ #50? → [Yes: **Adam reviews & approves the brand fingerprint** before it's locked] [No: agent auto-locks fingerprint]
5. Brand fingerprint locked → customer proceeds to **Paddle checkout** for chosen tier (Starter/Growth/Scale/Professional). Checkout created with `customData.supabase_user_id` passthrough.
   - DECISION: payment completed? → [No: abandon — remains lead] [Yes: Paddle fires `subscription_created` / `transaction_completed` webhook]
6. **Paddle webhook handler:** validate HMAC signature → idempotency insert on `paddle_webhook_events` (replay → 200 no-op) → read authoritative `user_id` from passthrough → UPSERT `subscriptions` → insert `credit_pools` (internal allocation) → mark `payment_completed_at` → Inngest send `day1.onboarding` (dedup 24h).
7. **Day-1 chain** runs on `/onboarding/post-payment` (UI polls `GET /api/onboarding/day1-status` every 2s; progress states render). Sequence:
   - Step A `ensure_business`: link `free_scans.converted_user_id`, copy profile fields.
     - DECISION: required profile fields present? → [No: skip chain, surface profile-completion prompt on Home, abort gracefully] [Yes: continue]
   - Step B `run_query_mapper` (Visibility-tracker/Query-Mapper agent): output → `query_clusters` → `tracked_queries`.
   - Step B.5 **query_review_gate** — UI shows top-10 queries; customer reviews/edits/removes. The ONE human checkpoint in the automated chain. Inngest `step.waitForEvent('day1.queries_confirmed')`.
     - DECISION: customer confirms queries? → [Yes (POST confirm-queries): replace tracked_queries with final list] [No action 30 min idle: auto-confirm with Query-Mapper top-10 unmodified]
   - Step C `run_first_paid_scan`: fire `scan-manual` with tier engine list (3/7/9). Wait for `scan.completed` (max 120s).
     - DECISION: scan completes ≤120s? → [Yes: continue] [No (timeout): allow entry to Home with "Scan in progress" banner + Day-1 empty state]
   - Step D `evaluate_rules`: `evaluateRules(scanId, businessId)` → bulk-insert suggestions (see Journey-context: 15 rules R01–R15; Haiku ranker if >5 fire).
     - DECISION: rules engine errors? → [Yes: surface single always-safe fallback suggestion (R02 schema), log error] [No: insert ranked suggestions]
   - Step E `auto_run_top_agents`: top suggestion visible immediately; next 2 unblock after 60s. Auto-run 2–3 highest-impact agents (Schema + FAQ free defaults + 1 paid). Outputs land as drafts ("Drafted for you" pill). Insert `day1_ready` notification.
     - DECISION: `credit_pool.available_runs < 6`? → [Yes: skip auto-run to preserve runway] [No: stagger-fire agent runs 5s apart]
   - Step F `send_welcome_email`: Resend `welcome-onboarded` template; mark `day1_completed_at`.
     - DECISION (UI escape hatch): Day-1 exceeds 180s? → [Yes: show "We'll finish in the background" + "Continue to dashboard" button] [No: redirect to Home at COMPLETE]
   - DECISION (mid-chain refresh): user refreshes? → [Resume from current `day1_state` enum — all steps idempotent]
8. Customer lands on **Outcomes (Home)** with: visibility score per engine, 3 suggestions/wins, 2–3 drafted items waiting, notification bell = 1.
9. **Activation = discovery call + property connect + first scan complete.** This starts the 60-day money-back clock and held-revenue accounting (Journey 5).
10. First deliverables scheduled/produced in week 1 → flow into Journey 3 (approval) and Journey 4 (digest).

**Existing-subscriber branch (D5):**
- DECISION: `day1_completed_at IS NULL` on this `subscription_created`? → [Yes (incl. preview→paid converts): full Day-1 chain fires] [No (existing paid upgrading tier, e.g. Discover→Build / Starter→Growth): `subscription_updated` only — rebalance `credit_pools` + welcome-to-tier notification + one-shot re-evaluate rules with new tier filter; NO fresh Day-1 chain]

---

## JOURNEY 3 — TIERED APPROVAL FLOW (agent-produced → published → dashboard)
**Pages:** (work is invisible) → `Approval Queue` + Weekly Digest cards → `Outcomes (Home)` + `Traceability`
**Agents/pipelines:** Content/FAQ · Schema · Citation agents (produce) → Approval-gate writer (cards) → Publisher agent (push) → Visibility tracker (re-scan) → Digest writer (narrates)
**QA note:** publishing actions are classified **Irreversible** QA tier internally.

1. An agent finishes a deliverable (schema markup, citation/listing, content draft, FAQ, outreach email, etc.).
2. **Approval-tier decision** (PRD §"Tiered Approval Gates"):
   - DECISION: what action class is this deliverable? →
     - [**Schema deployment** → AUTO]
     - [**Citation placement (low-effort directories)** → AUTO]
     - [**GBP / Yelp / Apple Maps listing updates** → AUTO]
     - [**Scan + visibility tracking** → AUTO]
     - [**Content publishing (blog / FAQ / landing page)** → 1-CLICK APPROVE in weekly digest]
     - [**Email-as-customer (outreach, review requests)** → 1-CLICK APPROVE in weekly digest]
     - [**External outreach to third parties** → 1-CLICK APPROVE in weekly digest]
     - [**Anything YMYL (legal / health / financial)** → MANDATORY HUMAN REVIEW before it even enters the queue → see Journey 6]
3. **AUTO branch:**
   a. Publisher agent pushes to the connected integration.
      - DECISION: integration type? → [Stable API (WordPress / Shopify / Webflow / GBP / Yelp / Apple Maps / SendGrid sub-account / schema-via-GTM): auto-push live] [Wix / Squarespace / custom CMS: generate paste-ready artifact + 1-click instructions → customer pastes → "shipped" on customer confirm]
   b. Outcome lands in dashboard. Skip to step 6.
4. **1-CLICK APPROVE branch:**
   a. **Approval-gate writer agent** packages the finished work into a 1-click approve/reject **card** (customer-voice headline, "why it's good for AI search", publish target + scheduled time, approve/reject actions, deadline + `auto_action_on_deadline`). For outreach work, it drafts the **full email body in the customer's voice**.
   b. Card lands in **Approval Queue** + is bundled into the weekly digest (Digest writer consumes). Inngest `approval.card_created`.
   c. DECISION: customer action on the card? →
      - [**Approve** (1 click): `POST /api/approvals/:id/approve` → Publisher agent pushes (back to step 3a integration logic)]
      - [**Reject / "Skip this one"**: `POST /api/approvals/:id/reject` → rejection-reason capture → work archived / regenerated]
      - [**Edit inline** (outreach email): customer edits → approve]
      - [**No action by deadline** (card >7d escalates to top of digest with deadline framing): → `auto_action_on_deadline` = `publish` OR `skip`]
   - DECISION (YMYL-flagged card): risk_flags contains `ymyl`? → [Yes: approve action requires extra confirmation step ("I confirm this content is accurate for my practice"); outreach emails NEVER auto-approve regardless of threshold]
   - NOTE: idempotent approve/reject — re-approving an already-`approved` item returns 200 with existing archive item (no duplicate). Two-tab safe.
5. Approved/auto work → **Publisher agent** pushes (per 3a integration matrix).
6. **Visibility tracker agent** re-scans → score recomputed → **Outcomes (Home)** score + weekly wins update.
7. Every outcome gets a **Traceability ("How we got this")** entry: which deliverable produced which score movement, when, citing what (evidence trail).
8. The week's approvals + wins roll into the next weekly digest → Journey 4.

---

## JOURNEY 4 — WEEKLY DIGEST / RETENTION LOOP
**Pages:** email inbox → `Approval Queue` → `Weekly Digest Archive` → `Outcomes (Home)`
**Agents/pipelines:** Digest writer agent (Sonnet) · Inngest per-customer cron · Resend (send + open/click telemetry) · Approval-gate writer (feeds cards)

1. Inngest per-customer cron fires on the customer's chosen digest day/time (default Monday 8am customer-local).
2. **Digest writer agent** reads last week's deliverables, scan deltas, open approval cards, billing/refund-clock state → composes the digest in 4 semantic blocks: **What changed · What needs you · How we got this · What's queued.** Picks subject line. Signed "— Beamix" (no agent names, no AI disclosure).
   - DECISION: were there wins/score-delta/approvals this week? → [Yes: full digest with highlight win(s) + approval cards (tier-scaled: Starter 1 win/top-3 cards, Growth 2/top-5, Scale 3/all, Professional + strategy memo)] [No (quiet week): write honest 4-sentence quiet-week digest — no fabrication, no padding]
   - DECISION (YMYL guard): any medical/legal/financial claim in digest? → [must match a published, customer-approved artifact — no new claims introduced]
3. **In-app digest preview**: 24h before send, render preview card on dashboard.
   - DECISION: customer requests changes? → [Yes ("less detail" / "skip this week"): handoff to Customer Success agent → adjust] [No: proceed to send]
4. Digest persists to `digest_archive` (always — readable later in Weekly Digest Archive).
5. Resend sends the email. Inngest `digest.sent`; telemetry `digest.opened`, `digest.clicked`.
6. Customer reads digest:
   - DECISION: customer engages? →
     - [Clicks an approval card → enters Journey 3 step 4c (approve/reject)]
     - [Clicks "view outcomes dashboard" → lands on Outcomes (Home)]
     - [Opens but no click → telemetry logged; if pattern of disengagement → churn-risk signal to Customer Success agent (Journey 5)]
     - [No open → churn-risk signal]
7. Approvals + dashboard activity feed the next week's deliverables → loop back to step 1.

**Retention KPI hooks (from digest-writer spec):** ≥30% of opens click an approval card; digest is the single biggest lever on surviving the 60-day refund window.

---

## JOURNEY 5 — MONEY-BACK / CHURN (60-day guarantee + cancellation)
**Pages:** in-app support chat → `Settings → Billing` / `Settings → Cancel (one-click)` → Paddle portal
**Agents/pipelines:** Customer success agent (de-escalation, read-only billing) · Paddle (refund/cancel + webhooks) · held-revenue accounting (`subscriptions.held_until` + `revenue_events` ledger) · Support triage (Plain/Crisp)

1. Activation event (Journey 2 step 9) starts the **60-day money-back clock** + held-revenue accounting. Refund eligibility requires activation = discovery call + property connect + first scan.
2. Churn/refund trigger arises:
   - DECISION: what is the trigger source? →
     - [Customer doubt in-app ("is this working?" / refund-intent): → Customer Success agent (step 3)]
     - [Inbound email/widget with "refund"/"chargeback"/"money back", or within 14d of checkout: → Support triage category `refund_dispute` → 2h escalate to Adam regardless of tier (step 7)]
     - [Customer goes straight to Settings → Cancel: → step 5]
     - [Payment failure (Paddle `transaction_payment_failed`): → Support `payment_failed` category + dunning]
3. **Customer Success agent** (the company's voice; cannot refund/change billing — read-only):
   - DECISION: intent classification? →
     - [`complaint_recoverable`: de-escalate + contextualize (show wins, score deltas, what's queued); writes `cs_commitment` if it promises an action. KPI: ≥60% resolve without refund post-#20]
     - [`complaint_irrecoverable` / refund-intent: acknowledge + surface refund mechanic transparently ("one-click cancel in dashboard; if <60 days, money back") → route to Settings/Paddle portal]
     - [`billing`: provide context only → Paddle portal link + escalate to Adam (≤ customer #50)]
     - [Chargeback threat: immediate critical escalation; never argue/stall; provide refund transparency]
4. DECISION: did de-escalation succeed? → [Yes: customer stays → return to Journey 4 loop] [No: customer proceeds to cancel]
5. **One-click cancel** in Settings → triggers Paddle cancellation.
   - DECISION: within 60-day window AND first-time (one-per-account rule)? →
     - [Yes: **refund processed** (no questions) → revenue never booked (held-revenue cash intact) → customer keeps all work product]
     - [No (past day 60): normal month-to-month cancellation, no refund; service ends at period end]
     - [Refund-then-resubscribe attempt: **no second money-back window** — the refund WAS the trial]
6. **Day 61:** if no refund fired → revenue booked from held state; customer continues month-to-month or churns normally.
7. **Refund-dispute escalation path** (Paddle merchant-standing protection): `refund_dispute` → Adam personally ≤2h → resolve before it becomes a chargeback.
8. **Cohort guardrail:** track `refund_rate` weekly in `audit_log`. DECISION: first-100 Founding-Member cohort refund rate ≥25%? → [Yes: tighten NEXT cohort to 30-day mechanic] [No: keep 60-day].

---

## JOURNEY 6 — YMYL / HUMAN-GATE EXCEPTIONS (cross-cutting)
**Where it fires:** legal / health (dental) / financial verticals — overrides the normal approval tiering.
**Agents/pipelines:** any producing agent flags `risk_flags: ['ymyl']` → Approval-gate writer + human review · Customer success agent (YMYL-input capture) · internal QA Irreversible tier

1. An agent produces work touching a YMYL domain (legal claim, medical/dental claim, financial claim).
2. DECISION: is the action class normally AUTO (schema/citation/listing)? → [Even AUTO classes, if the *content* carries a YMYL claim, are pulled into human review — YMYL overrides auto-publish.]
3. **Mandatory human review BEFORE the card enters the customer's approval queue** (per PRD §Tiered Approval Gates: "Anything YMYL → Mandatory human review before queue"). Ratified sub-decision (2026-05-24): **YMYL = always-human approval gate.**
4. Approval-gate writer marks the card: title flags "Medical claim — review carefully" (or legal/financial equivalent); approve action requires an **extra confirmation step** ("I confirm this content is accurate for my practice").
5. DECISION: is the deliverable an outreach email? → [Yes: **NEVER auto-approve**, even if the customer set a high auto-approve threshold — hard rule]
6. Digest writer YMYL guard: any medical/legal/financial claim in the digest must map to an already-published, customer-approved artifact — no new YMYL claims introduced in narrative.
7. Customer Success agent: when it captures YMYL input from a customer, routes to the appropriate workflow rather than answering directly.
8. Internal: publishing of YMYL-affected work is QA-tier **Irreversible** (2-of-3 multi-judge + Adam sign-off) before push.

---

## CONFLICTS & OPEN ITEMS (for reconciliation before flowcharting)

1. **Free-scan result: blur/paywall vs no-blur.** PRD v5.0 (finished product) says the free result shows 3 named opportunities **with no blur and no paywall** and the primary CTA is "Book your discovery call." The older `14-SCAN-UX-SPEC.md` still specifies 3 visible + 8 blurred fix cards behind a paywall, an "explore preview" path, and an email soft-gate. The two CTA models ("Book discovery call" vs "Fix this now → paywall") are not reconciled. **Treat PRD v5.0 as authoritative for the finished product; the scan-UX-spec mechanics are pre-pivot.**

2. **Tier names.** Build-prep chain uses Discover/Build/Scale ($79/$189/$499, engine lists 3/7/9, "credits/AI Runs"). PRD v5.0 uses Starter/Growth/Scale/Professional ($499/$999/$1,499/$2,499). The Day-1 chain mechanics (engine counts, credit pools) still reference old tiers — they are internal plumbing that must be re-mapped to the new agency tiers. Customer never sees credits/runs in finished product.

3. **Surface naming.** Build-prep: `/home`, `Inbox` (content drafts), Home "suggestions" tray. PRD v5.0: `Outcomes (Home)`, `Approval Queue`, `Weekly Digest Archive`, `Traceability`. The PRD explicitly **supersedes** the old 7-page tool dashboard and removes Agent Hub / Automation page / credit counters. Day-1 "drafted Inbox items" should map to Approval Queue cards in the finished product.

4. **`proactive-automation-model.md` is pre-pivot.** Its Content Hub / suggestion-queue / per-agent automation settings / credit caps model is the *assisted, tool-framed* version. In the agency model the customer does NOT operate automation; agents run continuously and the customer only sees approval cards + digest. Use it only for the internal rules-engine + trigger mechanics that still power deliverable generation, not as a customer journey.

5. **Discovery booking + voice-call surface** is referenced (PRD, session file infra-gap #1 "booking, voice chat") but no dedicated build spec was found — the discovery-call UX is specced at the agent level (`agent-discovery.md`) but the booking/scheduling page mechanics are an open infra gap (CTO async scope 2026-05-24).

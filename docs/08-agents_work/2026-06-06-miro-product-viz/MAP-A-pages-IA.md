# MAP-A — Pages / Screens & Information Architecture (Finished Product)

**Generated:** 2026-06-06 · For Miro product viz initiative
**Product:** Beamix — done-for-you GEO (AI search visibility) agency delivered as software. PRD v5.0 (agency pivot 2026-05-23).
**Customers:** $499–$2,499/mo. Agents do the work in the background; customers see **outcomes, not tools**.

**Source-of-truth precedence (per docs):**
- `08-UX-ARCHITECTURE.md` §0 (agency-pivot outcomes dashboard) — authoritative for nav + customer-facing pages.
- `08-UX-ARCHITECTURE.md` §1–§7 (old 7-page tool dashboard) — **SUPERSEDED**, engineering reference only.
- `PRD.md` §"Outcomes Dashboard" + §"Key User Flows" — confirms 5-page outcomes shape.
- `14-SCAN-UX-SPEC.md` — free-scan flow technical detail.
- `03-DAY-1-FLOW.md` / `04-EMPTY-STATES.md` — onboarding + states.
- `20-ADMIN-DASHBOARD-SPEC.md` — internal admin.

> **Funnel note (post-pivot vs pre-pivot):** The pivot replaced the *self-serve preview/paywall* funnel (free scan → blurred fixes → "explore in preview" → in-app paywall) with an *agency* funnel (free scan → **full unblurred** results → "book 20-min discovery call" → agent-led discovery → Paddle checkout). Detail below distinguishes the two; conflicts flagged inline with **[CONFLICT]**.

---

## 1. Marketing / Public (Framer — NOT in this repo)

Lives on Framer (`average-product-525803.framer.app`). Listed for completeness; this repo does not build these.

| Page | Route | Purpose | Key sections | States |
|------|-------|---------|--------------|--------|
| Home | `/` | Top-funnel positioning: "done-for-you GEO at SMB pricing" | Hero, agency-anchor copy ("$2K–$8K agency vs $499–$2,499"), free-scan entry, social proof | static |
| Pricing | `/pricing` | 4-tier comparison | Starter $499 / Growth $999 / Scale $1,499 / Professional $2,499; 60-day money-back badge; feature matrix | static |
| Features | `/features` | Outcome-led capability overview | per-capability sections (schema, citations, content, listings, outreach) | static |
| Vertical landing — SaaS | `/saas` | Vertical-specific hero + free-scan form (industry locked) | Hero, 60-day badge, free-scan form (URL · business name · industry locked) | static |
| Vertical landing — Legal | `/legal` | Same, legal vertical | as above | static |
| Vertical landing — Dental | `/dental` | Same, dental vertical | as above | static |
| About | `/about` | Company/story | static | static |
| Blog | `/blog`, `/blog/[slug]` | SEO/editorial; "State of AI Search" report (MVP+90) | list + article | static |
| Security | `/security` | Trust/security overview | static | static |
| Legal | `/legal-terms`, `/privacy` | ToS, privacy | static | static |

> Note: the three vertical landings (`/saas`, `/legal`, `/dental`) are the documented free-scan entry points (`08-UX-ARCHITECTURE.md` §0.7 step 1).

---

## 2. Free Scan (anonymous, no signup)

Source: `14-SCAN-UX-SPEC.md` (technical) + `08-UX-ARCHITECTURE.md` §0.7 (agency flow) + §4 (pre-pivot flow). The scan is a **single route with client-driven state** (`/scan`) — no intermediate URL during the animation.

**Implemented routes (cross-ref):** `(public)/scan/page.tsx`, plus legacy `scan/page.tsx` and `scan/[scan_id]/page.tsx`.

| Screen / State | Route | Purpose | Key UI | States |
|----------------|-------|---------|--------|--------|
| Pre-scan form | `/scan` (state `form`) | Capture business to scan | Dark bg `#0A0A0A`, centered card (max 560px), **progressive 3-step reveal**: Step 1 URL → Step 2 industry+location → Step 3 up to 3 competitors (Haiku autocomplete "gift") | default; inline field errors; **excluded-industry block** (legal/medical/financial → waitlist, no scan, no charge) |
| Scanning animation | `/scan` (state `scanning`) | Ritual wait 60–90s | Logo, URL being scanned, **6 engine pills** (ChatGPT/Gemini/Perplexity/Claude/Google AIO/Grok) lighting up on real poll arrival, query ticker, CSS sonar pulse, SVG progress ring (time-based) | running; engine "slow" (amber) at >60s; partial engine failure (gray "Data unavailable"); 90s timeout → email-capture |
| Wound-reveal result | `/scan` (state `revealing`→`revealed`) | Emotional peak; make problem real | Giant score (128px, NumberFlow, tier-colored), engine bars (you vs top competitor, CSS), competitor cards (loss-aversion), fix cards | **[CONFLICT]** see below | sequenced entrance animation |
| Email soft-gate | `/scan` (overlay, `email_gate`) | Save results / capture email | Overlay (bottom sheet on mobile), fires 20s after reveal, dismissible once/session | default; dismissed |
| Free-scan high-score state | `/scan` (variant, score ≥80) | Avoid celebration→paywall conversion kill | "You're already visible", 3 info chips, CTA "Get free FAQs + schema" | replaces wound-reveal |
| Excluded-industry / waitlist | `/scan` (variant) | Block regulated verticals pre-scan | Padlock illustration, "Beamix doesn't yet cover {industry}", inline email→`/api/waitlist` | replaces scan-running |
| Error / timeout | `/scan` (state `error`) | Recover failed scan | retry button or email-capture for 90s timeout | various per error table |

**[CONFLICT] — Result page CTA & paywall (pre-pivot vs agency pivot):**
- **`14-SCAN-UX-SPEC.md` (pre-pivot):** 3 visible fix cards + **8 blurred** behind frosted glass; CTAs "Fix this now →" (paywall) and "Explore the product first" (preview mode → `/home`).
- **`08-UX-ARCHITECTURE.md` §0.7 (agency pivot, AUTHORITATIVE):** **NO paywall, NO blurred fixes, NO preview mode.** Full results shown; 3 named opportunities; primary CTA = **"Book your 20-minute discovery call."**
- **Resolution:** Finished product follows the agency pivot — full unblurred results, discovery-call CTA. The blurred-fix / preview-mode / in-app-paywall machinery is superseded.

---

## 3. Auth

Source: cross-ref `(auth)/login`, `(auth)/signup`; magic-link path from `14-SCAN-UX-SPEC.md`.

| Page | Route | Purpose | Key UI | States |
|------|-------|---------|--------|--------|
| Signup | `/signup` | Create account | email/password or magic link | default; error |
| Login | `/login` | Authenticate | email/password or magic link | default; error |
| Magic-link / OTP capture | (email-driven) | Passwordless from scan email-gate | Supabase `signInWithOtp`; lands on post-scan/post-payment route | — |
| Forgot password | `/forgot-password` (implied, per legacy MEMORY) | Reset | form | — |

> In the agency funnel, **email is captured at the discovery booking step** (for the calendar invite), not before the scan (`08-UX-ARCHITECTURE.md` §0.7 step 4).

---

## 4. Discovery / Onboarding (agent-led → brand fingerprint)

Source: `08-UX-ARCHITECTURE.md` §0.7 + `PRD.md` §"Key User Flows" + `03-DAY-1-FLOW.md`. **Implemented:** `discovery/page.tsx`, `api/discovery/book`, `api/discovery/chat`, `(protected)/onboarding/post-payment/page.tsx`, `api/webhooks/calcom`.

| Screen | Route | Purpose | Key UI | States |
|--------|-------|---------|--------|--------|
| Discovery booking | `/discovery` (booking) | Book 20-min agent-led call; capture email | Calendar selector (Cal.com); email field | default |
| Discovery call (agent-led) | conversational (`/api/discovery/chat`) | Discovery agent captures **brand fingerprint** | services, tone, restricted topics, approval prefs, target queries, locations | live call; Adam reviews fingerprint through customer #50 then phases out |
| Tier selection + checkout | (paywall/checkout) | Choose tier, pay | 4 tiers (Starter $499 / Growth $999 / Scale $1,499 / Professional $2,499); money-back badge; → **Paddle** hosted overlay | default |
| Post-payment onboarding | `/onboarding/post-payment` | "Dead-dashboard cure" — set up workspace before first /home | Polls Day-1 chain; progress UI (state machine); **Query Review Gate** (top-10 queries, edit/remove, "Confirm queries" — the one human checkpoint) | `WAITING_WEBHOOK` → `ENSURE_BUSINESS` → `QUERY_MAPPER` → `query_review` → `SCAN_RUNNING` → `RULES` → `COMPLETE` → redirect; `ERROR` (escape hatch "Continue to dashboard") |
| Activation (Day 1, server) | (Inngest `day1.onboarding`) | Property connect, first scan, money-back clock starts | not a screen — backs the post-payment poll | per failure-modes table |
| Expectations timeline | (within post-payment / onboarding) | Set churn-prevention expectations | Week 1–2 activity only · Week 3–4 first citations · Week 4–8 ChatGPT shifts · Month 3+ score movement | static panel |

> **[CONFLICT]** `03-DAY-1-FLOW.md` describes the **pre-pivot post-payment** flow that lands on `/home` with the *tool* dashboard (score + 3 suggestions + Inbox drafts). Under the agency pivot, the customer lands on the **Outcomes** dashboard. Day-1 chain mechanics still apply; the destination/framing is outcomes, not the suggestions/Inbox tool surface.

---

## 5. Outcomes Dashboard (main product home)

Source: `08-UX-ARCHITECTURE.md` §0.2 (AUTHORITATIVE). **Implemented:** `(protected)/home/page.tsx` (legacy `dashboard/page.tsx` also present).

| Page | Route | Purpose | Key widgets/sections | States |
|------|-------|---------|----------------------|--------|
| Outcomes (Home) | `/home` | Single screen answering "Is Beamix working?" | **Score-per-engine grid** (4–7 cards by tier: current score, last-week delta, sparkline); **Top 3 winning queries this week**; **Weekly wins** narrative ("published 2 articles, placed 4 citations, deployed 6 schema; +6 pts"); **Approval Queue snippet** (N pending + Review CTA); **8-week score trajectory chart** with deliverable shipdate annotations | Day-1 setup state; scan-in-progress; score ≥80 ("already visible"); populated |

**Tier differences:** Starter 3 engines · Growth 5 · Scale 7 · Professional 7 + custom. Otherwise identical.
**Mobile:** score grid stacks vertically; charts stay readable.
**Forbidden (no-go):** agent names, credit counters, "Run agent" CTAs, scan-engine technical detail, pipeline/job-status telemetry.

> **[CONFLICT]** Old §3 "Home" (suggestions feed + Discover-tier paywall blur + preview banner + 0–100 GEO score) is superseded. Old pricing tiers (Discover/Build/Scale $79/$189/$499) RETIRED; replaced by Starter/Growth/Scale/Professional.

---

## 6. Approval Queue / Inbox (1-click approve deliverables)

Source: `08-UX-ARCHITECTURE.md` §0.3 (AUTHORITATIVE). **Implemented:** `(protected)/approvals/page.tsx` (legacy `inbox/page.tsx` also present).

| Page | Route | Purpose | Key UI per card | States |
|------|-------|---------|-----------------|--------|
| Approval Queue | `/approvals` | ~5 min/week to approve content / email-as-them / outreach | Title; rendered preview (content/email/DM); target queries (max 3); estimated impact ("expected to win 2 new queries on ChatGPT"); **1-click "Approve & publish"**; Reject + optional reason; **Edit** (lightweight inline text editor — no rich-text); **default-decline timer** "Auto-declines in 5 days" | pending; approved; rejected; expired/auto-declined; empty |

> Cards generated by the **Approval-gate writer agent** (`docs/04-features/specs/agent-approval-gate-writer.md`).
> **[CONFLICT]** Auto-decline window: §0.1 says **7 days**, §0.3 card copy says **5 days**. Flagged — needs reconciliation.
> **[CONFLICT]** Pre-pivot **Inbox** (3-pane Superhuman layout: list / preview / evidence panel; J/K/A/R shortcuts; Freshness-Agent inline chat; Supabase Realtime) is superseded by the simpler Approval Queue card model. Inbox's failure-card / tier-locked-item states (`04-EMPTY-STATES.md`) belong to the superseded model.

---

## 7. Weekly Digest Archive

Source: `08-UX-ARCHITECTURE.md` §0.4 (AUTHORITATIVE).

| Page | Route | Purpose | Key UI | States |
|------|-------|---------|--------|--------|
| Weekly Digest Archive | `/digests` (route TBD; not yet implemented) | Searchable, dated archive — the narrative record of the relationship | Date-stamped list; click row → full digest in panel. Each digest: score-per-engine snapshot (then & now); wins (queries won, citations placed, content published, schema deployed); approval cards from that week (approved/rejected/expired); customer-success note (monthly+ for Growth+, weekly for Professional) | empty (no digests yet); populated; per-entry panel |

> Generated by the **Digest writer agent** (`docs/04-features/specs/agent-digest-writer.md`). Each digest also emailed (Resend) — see weekly-digest template. Route name not yet fixed in docs; no route exists in `apps/web` yet.

---

## 8. Traceability ("How we got this") drill-down

Source: `08-UX-ARCHITECTURE.md` §0.5 (AUTHORITATIVE) + `PRD.md` §"Product Philosophy" ("Traceability is a feature").

| Page | Route | Purpose | Key UI | States |
|------|-------|---------|--------|--------|
| Traceability | `/traceability` (route TBD; not yet implemented) | Customer trust mechanism — every score movement → "exactly what Beamix did and where" | Per-outcome drill-down: Outcome ("Now ranked #2 on Perplexity for 'best dental clinic in Ramat Gan'"); deliverables tied to it (article@URL+date, schema deployed+date, citations+URLs); score delta attributable (directional, not causal); plain-language copy "Here's the work that produced this result" | empty; per-outcome populated |

> No technical jargon. Activity trail framed as directional attribution. No route exists in `apps/web` yet.

---

## 9. Settings (all tabs)

Source: `08-UX-ARCHITECTURE.md` §0.6 (AUTHORITATIVE). **Implemented:** `(protected)/settings/page.tsx`.

| Page | Route | Purpose | Tabs / sections | States |
|------|-------|---------|-----------------|--------|
| Settings | `/settings` | Account + workspace config | **Profile** · **Brand fingerprint** · **Billing** · **Approval preferences** · **Publishing integrations** · **Cancel** | per-tab empty/populated |

Tab detail:
- **Profile** — name, email, language (HE/EN).
- **Brand fingerprint** — services, tone, restricted topics, target queries, locations (captured in discovery; editable).
- **Billing** — see §10.
- **Approval preferences** — move classes between auto / 1-click within bounds (e.g., flip schema to require approval, or content to auto for low-risk) — **YMYL stays mandatory-human-approve regardless**.
- **Publishing integrations** — OAuth-style connections: WordPress, Shopify, Webflow, GBP, Yelp, Apple Maps, SendGrid sub-account, Google Tag Manager. Status badges: connected / disconnected / paste-ready-only.
- **Cancel** — **one-click**; customer keeps work product; refund auto-fires if inside 60-day window (held-revenue accounting, decision #8).

> **[CONFLICT]** Pre-pivot Settings (§3) had 7 tabs: Profile · Business · Billing · Preferences · Notifications · Integrations · Automation Defaults. Superseded by the 6-tab agency set above (Notifications/Automation Defaults dropped; Business → Brand fingerprint; Cancel added).

---

## 10. Billing

Source: `08-UX-ARCHITECTURE.md` §0.6 (Billing tab) + `PRD.md` §"Trial / Refund" + `03-DAY-1-FLOW.md` (Paddle).

| Surface | Route | Purpose | Key UI | States |
|---------|-------|---------|--------|--------|
| Billing tab | `/settings` → Billing | Plan + invoices + money-back status | Current plan/tier; 60-day money-back window status; **Paddle customer-portal link**; invoice history | active plan; (legacy: "No active plan / preview") |
| Paddle checkout | hosted overlay | Take payment | Paddle hosted overlay (no custom payment UI); `customData.supabase_user_id` passthrough | — |
| Paddle customer portal | external (Paddle) | Manage payment method / invoices | Paddle-hosted | — |
| Cancel (one-click) | `/settings` → Cancel | Cancel + auto-refund if in window | one-click; refund auto-fires | — |

> Money-back: 60-day no-questions; activation = discovery + connect + first scan. Held-revenue accounting day 1–60; revenue booked day 61.
> **[CONFLICT]** Pre-pivot copy referenced **14-day** money-back; agency pivot uses **60-day**. 60-day is authoritative.

---

## 11. Admin Dashboard (internal)

Source: `20-ADMIN-DASHBOARD-SPEC.md`. **Read-only, allowlist-gated, desktop-only, server-rendered.** No CRUD (Adam uses Supabase Studio + Paddle dashboard for mutations). Not yet implemented in `apps/web`.

| Page | Route | Purpose | Sections (6, all read-only) | States |
|------|-------|---------|-----------------------------|--------|
| Admin | `/(internal)/admin` | Adam's daily ops single screen | 1. **Revenue** (today MRR, 7d/30d new MRR, refunds 30d) · 2. **Users** (latest 50: email, tier, signup, lifetime spend, run counts, last seen) · 3. **Agent health** (per agent_type: runs, success%, failure%, common failure stage, p50/p95 duration; <80% success → red) · 4. **Cost** (LLM spend 24h/7d/30d, top-10 users by cost, cost-per-paying-user; circuit-breaker amber alert) · 5. **Refunds + disputes** (refund table + card/browser/email dedupe fraud alert; refund-rate amber@3% red@5%) · 6. **Inngest queue** (open jobs by event type, oldest pending, errored functions, 24h success rate) | read-only; alert highlights |

> Access gate: hardcoded allowlist `['adam419067@gmail.com']` in `(internal)/layout.tsx`; redirect non-admins to `/home`. Not linked from `DashboardShell` — Adam bookmarks `/admin`.

---

## Cross-cutting / shared surfaces

- **PreviewBanner** — pre-pivot only (preview mode); superseded by agency funnel (no preview mode).
- **PaywallModal / PaywallGate** — pre-pivot only; superseded (no in-app paywall; checkout is post-discovery via Paddle).
- **NotificationBell** — sidebar bell, Today/Earlier groups (pre-pivot spec; notification system §8 partly valid).
- **Kill-switch global banner** — amber, "All scheduled runs paused" (pre-pivot automation model; agents now manage cadence invisibly).
- **EmptyState** primitive — one shared component; illustrations line-art (`#0A0A0A` stroke, `#3370FF` accent).

---

## Implemented-vs-documented cross-reference (apps/web routes today)

| Implemented route | Maps to | Note |
|-------------------|---------|------|
| `(public)/scan`, `scan`, `scan/[scan_id]` | §2 Free Scan | multiple scan entry points present |
| `(auth)/login`, `(auth)/signup` | §3 Auth | present |
| `discovery`, `api/discovery/book`, `api/discovery/chat`, `api/webhooks/calcom` | §4 Discovery | agency-flow wiring present |
| `(protected)/onboarding/post-payment` | §4 Onboarding | present |
| `(protected)/home`, `(protected)/dashboard` | §5 Outcomes | `home` = outcomes; `dashboard` likely legacy |
| `(protected)/approvals`, `(protected)/inbox` | §6 Approval Queue | `approvals` = pivot; `inbox` = superseded |
| `(protected)/settings` | §9 Settings + §10 Billing | present |
| `(protected)/scans`, `automation`, `archive`, `competitors` | superseded pre-pivot pages | folded into Outcomes/Traceability/Digest per pivot — present in code but not in agency nav |
| (none) | §7 Digest Archive, §8 Traceability, §11 Admin | NOT YET BUILT |

---

## NAV HIERARCHY

Primary nav for the finished (agency-pivot) product = **5 items** (`08-UX-ARCHITECTURE.md` §0.1).

```
PUBLIC (Framer — separate project)
├─ Home (/)
├─ Pricing (/pricing)
├─ Features (/features)
├─ Vertical landings
│  ├─ SaaS (/saas)
│  ├─ Legal (/legal)
│  └─ Dental (/dental)
├─ About (/about)
├─ Blog (/blog → /blog/[slug])
├─ Security (/security)
└─ Legal (/legal-terms, /privacy)

FREE SCAN (anonymous, no signup)  [this repo]
└─ /scan  (single route, client-state machine)
   ├─ form (3-step progressive)
   ├─ scanning (engine pills animation)
   ├─ revealed (full results + "Book discovery call" CTA)
   │  ├─ variant: high-score (≥80)
   │  └─ variant: excluded-industry → waitlist
   ├─ email soft-gate (overlay)
   └─ error / timeout

AUTH
├─ /signup
├─ /login
└─ magic-link / OTP (email-driven)

DISCOVERY → SUBSCRIPTION (funnel, not nav)
├─ /discovery (booking + email capture)
├─ discovery call (agent-led → brand fingerprint)
├─ tier selection → Paddle checkout
└─ /onboarding/post-payment
   └─ Query Review Gate (single human checkpoint) → redirect to /home

PRODUCT — PRIMARY NAV (5 items)  [authenticated]
├─ 1. Outcomes (Home)            /home
├─ 2. Approval Queue             /approvals
├─ 3. Weekly Digest Archive      /digests        (not yet built)
│     └─ digest detail panel (per week)
├─ 4. Traceability               /traceability   (not yet built)
│     └─ per-outcome drill-down ("How we got this")
└─ 5. Settings                   /settings
      ├─ Profile
      ├─ Brand fingerprint
      ├─ Billing  ──────────────→ Paddle checkout / customer portal (external)
      ├─ Approval preferences
      ├─ Publishing integrations (WP, Shopify, Webflow, GBP, Yelp, Apple Maps, SendGrid, GTM)
      └─ Cancel (one-click + auto-refund in 60-day window)

INTERNAL (not in nav — bookmarked)
└─ /(internal)/admin  (allowlist: adam419067@gmail.com)
   └─ 6 read-only sections: Revenue · Users · Agent health · Cost · Refunds+disputes · Inngest queue

REMOVED FROM NAV (superseded pre-pivot pages — agents are infrastructure)
✗ Agents / Agent Hub (/dashboard/agents — never linked)
✗ Inbox (→ Approval Queue)
✗ Scans (→ folded into Outcomes)
✗ Automation (→ managed by agents, no customer config)
✗ Archive (→ split: approved → Traceability, digests → Digest Archive)
✗ Competitors (→ folded into Outcomes "queries you don't win")
```

---

## Summary of conflicts flagged

1. **Scan result CTA/paywall** — pre-pivot (blurred fixes + paywall + preview mode) vs agency pivot (full results + discovery-call CTA, no paywall). Pivot wins.
2. **Approval auto-decline timer** — §0.1 says 7 days, §0.3 card copy says 5 days. Unreconciled.
3. **Approval Queue vs Inbox** — simple card model (pivot) vs 3-pane Superhuman Inbox (pre-pivot). Pivot wins; Inbox failure/tier-locked states are superseded.
4. **Settings tabs** — 6 agency tabs vs 7 pre-pivot tabs. Pivot wins.
5. **Money-back window** — 60-day (pivot) vs 14-day (pre-pivot). 60-day authoritative.
6. **Pricing tiers** — Starter/Growth/Scale/Professional $499–$2,499 (pivot) vs Discover/Build/Scale $79/$189/$499 (pre-pivot, RETIRED).
7. **Post-payment landing** — `03-DAY-1-FLOW.md` lands on tool-dashboard `/home` (score+suggestions+Inbox drafts); agency pivot lands on Outcomes. Day-1 chain mechanics valid; framing differs.
8. **Unbuilt pages** — Weekly Digest Archive, Traceability, and Admin have no routes in `apps/web` yet; routes (`/digests`, `/traceability`) are inferred, not doc-specified.

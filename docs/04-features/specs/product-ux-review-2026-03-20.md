# Beamix Product UX Review — 2026-03-20

**Reviewer:** Product Lead
**Scope:** Full user journey audit — scan → signup → onboarding → dashboard → agents → recommendations
**Method:** Code review of 14 files spanning the complete user flow
**Prior rounds:** 2 bug-fix rounds completed. This is a product logic / UX review — separate from code quality.

---

## Executive Summary

The core flow works end-to-end. The scan is impressive, the dashboard is visually solid, and the free-scan → signup import is technically sound. However, there are **6 meaningful UX gaps** and **8 minor issues** that will cause real friction for new users, particularly in the first 30 minutes after signup.

The highest-risk problems are:
1. The dashboard has a "Run Scan" button that links to `/dashboard/scan` — a page that does not exist
2. The agent modal asks for a free-text "topic" with zero context, causing blank-screen confusion for first-time users
3. The recommendation → agent handoff doesn't pass the specific recommendation into the agent, losing all context

---

## Section 1: User Journey Gaps

### GAP-1 — "Run Scan" button points to a non-existent page [P1]

**Where:** `dashboard-overview.tsx` line 446
**What:** The hero CTA button says "Run Scan" and links to `/dashboard/scan`. There is no `/dashboard/scan` route. The `src/app/(protected)/dashboard/scan/` directory does not exist (confirmed with Glob).

**Who it affects:** Every user who has already completed onboarding and wants to re-scan. This is the primary action on the dashboard.

**Current behavior:** User clicks "Run Scan" → 404 or blank page.

**Fix:** Either create `/dashboard/scan` as a wrapper around the existing scan flow (pre-filling business data from the user's profile), or redirect to `/scan?url=[business_url]&prefilled=true`. Given the scan flow lives at `/scan/[id]`, the simplest fix is to redirect to `/scan` with `?url=` pre-filled from the user's business URL. The current public `/scan` page already reads `?url=` from searchParams and skips that step.

---

### GAP-2 — Agent modal asks for a generic "topic" for all agent types [P1]

**Where:** `agent-modal.tsx` — single `topic` textarea for all 7 agent types
**What:** The modal's placeholder text is `"Tell [AgentName] what to work on..."` — identical for all agents. The FAQ Agent, Schema Optimizer, Review Analyzer, and Content Writer all have fundamentally different inputs, but the modal treats them the same.

**Who it affects:** Every new user running their first agent.

**Specific problem per agent:**
- **FAQ Agent**: User doesn't know whether to write 1 question, a list, or a topic area
- **Schema Optimizer**: User doesn't know whether to paste their existing schema, or just describe their business
- **Review Analyzer**: User doesn't know whether to paste reviews or type a review URL
- **Competitor Intelligence**: User doesn't know whether to name competitors or describe their market

**Current behavior:** User stares at a blank textarea with no guidance, likely types something generic ("help me with my website"), gets low-quality output.

**Fix (two-tier):**
1. Short-term: Add an agent-specific `placeholder` and `hint` text per agent type. The modal already receives `agentSlug` as a prop — use it to switch placeholder content.
2. Medium-term: Pre-fill the topic from the user's business context (name, industry, location) so the agent has something to work with by default. This is the data that already exists in the `businesses` table.

---

### GAP-3 — "Run Agent" on recommendations page goes to `/dashboard/agents` (generic), not the specific agent [P1]

**Where:** `recommendations/page.tsx` line 129 and `dashboard-overview.tsx` line 841
**What:** Both "Run Agent" CTAs link to `/dashboard/agents` — the agent list page — not the specific agent suggested in `rec.suggested_agent`.

**Who it affects:** Users following the recommendations flow — the supposed primary value loop.

**User experience:** User reads recommendation "Write FAQ content to improve your Perplexity ranking" → clicks "Run Agent" → lands on the generic agent grid → has to find the FAQ Agent manually → opens modal → enters topic from scratch with no connection to the original recommendation.

**Fix:** The link should be `/dashboard/agents/[agentSlug]` where `agentSlug = agentTypeToSlug(rec.suggested_agent)`. Even better: pass the recommendation title and description as pre-filled modal params via query string, so the agent knows exactly what to work on.

The `recommended_agent` field is already populated in the DB. This is a routing fix plus pre-fill.

---

### GAP-4 — No "Run New Scan" flow for authenticated users [P1]

**Partially overlaps GAP-1 — but distinct product issue.**

**What:** The `/scan` public page is designed for anonymous pre-signup users. It collects email and has no concept of an authenticated session. If an authenticated user visits `/scan`, they go through the full anonymous flow including the email step — which is redundant and confusing.

**Who it affects:** Any user who has completed onboarding and wants to run a second scan (trial or paid).

**Current behavior:** No authenticated scan initiation path exists. The `POST /api/scan/start` route exists and handles unauthenticated requests, but there's no UI for authenticated users to trigger a scan from the dashboard with their business data pre-loaded.

**Fix:** `/dashboard/scan` page (which currently 404s) should:
1. Load the user's business from the DB (URL, name, industry, location)
2. Skip all wizard steps — just show a "Confirm and scan" button
3. POST to `/api/scan/start` (or a new `/api/scan/start-authenticated` that creates a `scans` record instead of a `free_scans` record)
4. Poll for completion and redirect to results

---

### GAP-5 — Engine name mismatch between scan results and dashboard [P2]

**Where:** Three different naming conventions in use:
- `scan-results-client.tsx`: Uses `ENGINE_LABELS` from `@/constants/engines` → displays "ChatGPT", "Gemini", "Perplexity"
- `dashboard-overview.tsx` line 392: Defines its own `ENGINE_LIST = ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Google AI', 'Grok', 'You.com']`
- `dashboard-overview.tsx` line 393: Maps engine results with `engineMap.get(engineName)` — but the DB stores engine as lowercase (`chatgpt`, `gemini`, `perplexity`)

**The bug:** `engineMap.get('ChatGPT')` will return `undefined` because the DB value is `'chatgpt'`. This means engine performance bars on the dashboard always show "not mentioned" even when the user was mentioned — the case mismatch causes a silent lookup failure.

**Fix:** Normalize to lowercase when building `engineMap`, OR normalize the `ENGINE_LIST` to use DB-format keys and apply display labels at render time.

---

### GAP-6 — Onboarding collects duplicate data [P2]

**What:** A user who completed the free scan already provided: URL, business name, location. The onboarding flow asks for: URL (step 0/1), business name (step 1), industry (step 2), location (step 3).

**What is actually carried over:** URL (from localStorage `beamix_pending_url`), business name (from localStorage `beamix_onboarding_name`). Location and industry are always re-asked.

**Industry specifically:** The scan engine already detects and stores industry in `free_scans.industry`. This data exists and is accurate — it was inferred by AI from their website. The onboarding step 2 asks the user to select from a dropdown — but the detected value is never pre-filled.

**Who it affects:** Every user who comes from the free scan → signup → onboarding path (the primary acquisition funnel).

**User experience impact:** User just told the system everything about their business via the scan. Then onboarding asks them again. Feels redundant. The "industry" dropdown asks them to categorize themselves after AI already did it.

**Fix:**
1. Read `free_scans.industry` from the scan that's being converted (the `scan_id` is available in onboarding flow via searchParams) and pre-fill the industry dropdown.
2. Read `free_scans.location` from the same record and pre-fill the location field.
3. If both are pre-filled, step 2 and 3 become confirmation steps ("Is this right?"), not data collection steps. This removes 2 friction points.

---

## Section 2: Data Continuity

### DATA-1 — Free scan score does carry over to dashboard correctly [VERIFIED OK]

The `convertFreeScanResults` function in `onboarding/complete/route.ts` correctly:
- Creates a `scans` record with `overall_score` from `free_scans.overall_score`
- Creates `scan_engine_results` rows for each engine
- Converts sentiment text to scores
- Inserts `quick_wins` as recommendations immediately

The score the user saw on `/scan/[id]` will match what appears in the dashboard. No issue here.

---

### DATA-2 — Quick wins from free scan do appear on recommendations page [VERIFIED OK]

`insertQuickWinsAsRecommendations` fires non-blocking during onboarding and creates recommendation rows tagged with `is_free_preview: true`. These appear on `/dashboard/recommendations`. The path works.

---

### DATA-3 — Dashboard shows industry ranking against hardcoded mock competitors [P2]

**Where:** `dashboard-overview.tsx` lines 54-59
```
const MOCK_COMPETITORS = [
  { name: 'Competitor A', score: 72, position: 1 },
  ...
]
```

**What:** Every single Beamix user sees the same 4 fake competitors ("Competitor A", "Competitor B") with hardcoded scores. The Industry Ranking card has a disclaimer "Based on estimated data. Add real competitors in Competitor Intelligence." — but there's no "Add competitors" button or link on that card. The card is decorative.

**Who it affects:** All users with data. The ranking looks real but is entirely fabricated.

**Fix (short-term):** Add a "Scan competitors" CTA button on the Industry Ranking card that launches the Competitor Intelligence agent. Remove the word "Estimated" — be clearer: "Example data — run Competitor Intelligence to see real scores."

**Fix (long-term):** Populate competitor data from the scan's `leaderboard` array (already generated and stored in `free_scans.results_data.leaderboard` and carried over to the `scans` JSONB).

---

### DATA-4 — Score delta ("from last scan") will always be null for first-time users [P3]

**Where:** `dashboard-overview.tsx` — `scoreDelta` prop
**What:** For a user who has only done one scan (which is every new user), `scoreDelta` will be null. The "from last scan" label appears with nothing next to it, which is slightly confusing.

**Fix:** If `scoreDelta` is null and there's only one scan, show "First scan" instead of leaving the space empty. This is purely copy.

---

## Section 3: Pricing / Credit Display Consistency

### CREDIT-1 — Credit cost display says "credits" in agent modal but "AI Runs" on agents page [P2]

**Where:**
- `agent-modal.tsx` line 191: `"This will use {creditCost} credits"`
- `agents-view.tsx` line 342: `section-eyebrow` label is "AI Runs Used"
- `agents-view.tsx` line 277: cost column shows "1 Run" (not "1 credit")

**Who it affects:** Every user who opens the agent modal after seeing "AI Runs" on the agents page.

**Fix:** Standardize on "AI Runs" throughout. Change the modal copy to: "This will use 1 AI Run". Change `creditCost` to `runCost` internally for clarity. The brand language for this feature is "AI Runs" — the modal is the exception and should be fixed.

---

### CREDIT-2 — Recommendations page upsell logic has a bug [P2]

**Where:** `recommendations/page.tsx` lines 36-39
```typescript
const hasAccess =
  subscription?.plan_tier != null &&
  subscription.status !== 'cancelled'
```

**Bug:** Users on a 7-day free trial have `plan_tier: null` (per DECISIONS.md: "free tier = null"). So `hasAccess` is `false` for all trialing users. They see the upgrade banner even though they should have full access during trial.

**Fix:** Also check `subscription.status === 'trialing'` as a valid access grant:
```typescript
const hasAccess =
  subscription?.status === 'trialing' ||
  (subscription?.plan_tier != null && subscription.status !== 'cancelled')
```

This is a significant user experience bug — new users completing onboarding land on recommendations, see an upgrade prompt immediately, and feel they didn't actually get a free trial.

---

### CREDIT-3 — "Social Strategy" and "Competitor Intelligence" agents require Pro plan but no gating exists in the UI [P2]

**Where:** `config.ts` — `social-strategy` and `competitor-intelligence` both have `minPlan: 'pro'`. But `agents-view.tsx` only checks `canAfford = agent.isUnlimited || totalCredits >= agent.credits`. It never checks `minPlan` vs the user's actual plan.

**Bug:** A Starter user can click "Run Agent" on Competitor Intelligence (1 AI Run), consume a credit, and trigger the agent — even though it's a Pro-only feature.

**Fix:** Pass the user's `planTier` to `AgentsView`, then check `isPlanSufficient(userPlan, agent.minPlan)` in the `canAfford` logic. Show a "Requires Pro" badge and lock the button for insufficient plan users.

---

## Section 4: Empty States and Dead Ends

### EMPTY-1 — Recommendations page empty state says "Run a scan" but there's no button to do so [P2]

**Where:** `recommendations/page.tsx` line 84
```
description="Run a scan to get personalized recommendations for your business."
```

**Problem:** The `EmptyState` component shows text but no CTA button. User reads "Run a scan" but has no way to do it from this page. After clicking away and returning, they're stuck.

**Fix:** Add a CTA button to the `EmptyState` that either links to `/dashboard/scan` (once that exists) or triggers a scan modal.

---

### EMPTY-2 — "Run your first agent" empty state on dashboard is the only guidance for new users [P3]

**Where:** `dashboard-overview.tsx` line 739 — Recent Activity empty state
**What:** New users see "Run your first agent to see results here." with no link. Combined with GAP-2 (unhelpful modal), a new user has no guided path to their first meaningful output.

**Fix (short-term):** Add a link to `/dashboard/agents` in the empty state.
**Fix (better):** A "Start Here" welcome card for users where `recentAgents.length === 0` and `score !== null` — showing the 1 recommended action from their scan with a direct "Run this agent" button. This is the aha-moment path: scan complete → here's what to fix → run this → see output.

---

### EMPTY-3 — Agent execution history "View" link goes to `/dashboard/agents/[agent_type]` [P3]

**Where:** `agents-view.tsx` line 308
```
href={`/dashboard/agents/${row.original.agent_type}`}
```

**Problem:** This links to e.g. `/dashboard/agents/content_writer` using the DB `agent_type` value (underscores). The actual agent pages are at kebab-case slugs (e.g. `/dashboard/agents/content-writer`). The `agentTypeToSlug` function exists in `config.ts` and is already imported — but isn't used here.

**Fix:** Replace with `agentTypeToSlug(row.original.agent_type)`:
```typescript
href={`/dashboard/agents/${agentTypeToSlug(row.original.agent_type) ?? row.original.agent_type}`}
```

---

## Section 5: Onboarding Friction

### ONBOARD-1 — Onboarding shows "Step 1 of 3" but has 4 logical steps (0, 1, 2, 3) [P3]

**Where:** `onboarding-flow.tsx` — `getDotIndex()` collapses steps 0 and 1 into dot 0. The label says "Step 1 of 3" for both step 0 (URL) and step 1 (business name).

**What a user sees:** They're on step 1 of 3, they enter URL → still says "Step 1 of 3" → they enter business name → now it says "Step 2 of 3". Two inputs feel like the same step even though they're separate screens.

**Fix:** Per the DECISIONS.md note "Onboarding dots: always show 3 dots (hide Step 0 from count even if shown)" — if step 0 is conditionally shown, it should be labeled "Almost ready..." or similar, not "Step 1 of 3". Or unify steps 0+1 into a single screen with URL + business name together.

---

### ONBOARD-2 — Onboarding calls `/api/onboarding/complete` but creates a NEW scan [ARCHITECTURAL NOTE, not a bug]

**What:** Step 3 ("Start My Scan") of onboarding submits to `/api/onboarding/complete` which does NOT run a new scan. Instead it converts the free_scan data into the `scans` table. The button label "Start My Scan" is misleading — no scan starts. The user lands on `/dashboard` with the existing data, not new scan results.

**Who it affects:** Any user who interprets "Start My Scan" as "run a fresh scan now."

**Fix:** Change the button label to "Go to Dashboard" or "See My Results". The step description already says "Where is your main market?" — the scan has already happened. The button is completing onboarding, not starting a scan.

---

## Section 6: Missing Features Users Would Expect

### MISSING-1 — No scan history page [P2]

**What:** Users can run multiple scans (rate-limited by plan), but there's no page showing their history of scans with scores over time. The `scans` table exists and collects data. The `/dashboard/rankings` page exists but only shows current engine performance — not historical comparisons.

**Who it affects:** Any user who has run more than one scan (power users, Starter+).
**Workaround today:** None — data exists but is invisible.
**Fix:** Add scan history to `/dashboard/rankings` or create `/dashboard/scans`. Even a simple table (date, score, engine count) with a trend line would answer "am I improving?"

---

### MISSING-2 — No way to view/export agent output from the execution history table [P2]

**Where:** `agents-view.tsx` execution table — "View" link goes to `/dashboard/agents/[type]` (the chat page), not to a specific execution's output.
**What:** A user who ran the Content Writer 3 days ago can't easily retrieve that content. They'd have to navigate to the Content Writer, find the output there, and hope it hasn't been overwritten by newer runs.

**Fix (short-term):** Link to `/dashboard/agents/[type]?execution=[execution_id]` (the URL format already written in `handleExecute` at line 201 in `agents-view.tsx` — it's just not used in the table link).
**Fix (long-term):** Content Library page (`/dashboard/content`) to view all agent outputs.

---

### MISSING-3 — No trial countdown indicator anywhere in the dashboard [P2]

**What:** Users are on a 7-day trial. The trial end date is in `subscriptions.trial_ends_at`. Nothing in the dashboard tells users how many days remain. There's no progress indicator, no countdown, no "3 days left" notification.

**Who it affects:** All trialing users — which is 100% of users in the first 7 days.
**Risk:** Users don't upgrade because they don't feel urgency. Or they feel blindsided when the trial ends.
**Fix:** A small banner or sidebar indicator: "5 days left in your trial — upgrade to keep access". This is a standard SaaS pattern and is critical for conversion.

---

### MISSING-4 — No way to see the original free scan from within the dashboard [P3]

**What:** After signup, the free scan is at `/scan/[scan_id]` (still accessible for 30 days). But there's no link to it from the dashboard. The user saw a detailed results page — competitor analysis, query breakdown, quick wins — and then that context disappears into the dashboard abstraction.

**Fix:** Add a "View original report" link in the dashboard somewhere (the visibility score card or recommendations page), pointing to the free scan results page. The `scan_id` is stored in `free_scans.converted_user_id` and can be looked up.

---

## Summary Table

| ID | Finding | Priority | Affected Users | Fix Complexity |
|----|---------|----------|---------------|----------------|
| GAP-1 | "Run Scan" button → 404 | P1 | All users | Low (add route or redirect) |
| GAP-2 | Agent modal generic for all agents | P1 | All users on first agent | Medium |
| GAP-3 | Recommendation → agent loses context | P1 | Users following rec flow | Low (routing fix) |
| GAP-4 | No authenticated scan flow | P1 | All post-onboarding users | Medium |
| GAP-5 | Engine name case mismatch (silent bug) | P2 | All users with scan data | Low (1 line fix) |
| GAP-6 | Onboarding re-collects scan data | P2 | All free-scan → signup users | Medium |
| DATA-3 | Mock competitor data presented as real | P2 | All users with score data | Low |
| CREDIT-1 | "Credits" vs "AI Runs" terminology | P2 | All users | Low (copy change) |
| CREDIT-2 | Trial users see upgrade banner | P2 | All trialing users | Low (1 condition) |
| CREDIT-3 | No plan gating on Pro agents | P2 | Starter users | Low |
| EMPTY-1 | Empty state has no actionable CTA | P2 | New users | Low |
| EMPTY-3 | History "View" link uses wrong URL format | P3 | Users with history | Low (1 line fix) |
| ONBOARD-1 | Step count display inconsistency | P3 | All onboarding users | Low (copy) |
| ONBOARD-2 | "Start My Scan" misleading label | P3 | All onboarding users | Low (copy) |
| MISSING-1 | No scan history | P2 | Repeat users | Medium |
| MISSING-2 | Can't retrieve past agent output | P2 | Users with history | Low |
| MISSING-3 | No trial countdown | P2 | All trial users | Low |
| MISSING-4 | No link to original free scan | P3 | Post-signup users | Low |

---

## Recommended Fix Order

### Sprint 1 — Unblock core loops (P1 fixes, ~3 days)
1. GAP-1: Create `/dashboard/scan` route that pre-fills from business data and initiates a scan
2. CREDIT-2: Fix trial access check on recommendations page (1 line)
3. GAP-3: Update recommendation "Run Agent" links to point to specific agent with pre-filled context
4. EMPTY-3: Fix "View" link in execution history (1 line)

### Sprint 2 — Remove friction (P2 fixes, ~5 days)
5. GAP-2: Agent-specific placeholder text + pre-fill from business context
6. GAP-5: Fix engine name case mismatch (1 line normalization)
7. CREDIT-1: Standardize "AI Runs" terminology across modal and settings
8. CREDIT-3: Add plan gating check to agent cards
9. MISSING-3: Add trial countdown indicator in sidebar or top bar
10. DATA-3: Update competitor card to reflect that data is illustrative, add CTA to run Competitor Intelligence

### Sprint 3 — Polish and completeness (P3 + missing features, ~1 week)
11. GAP-6: Pre-fill industry and location in onboarding from scan data
12. ONBOARD-2: Change "Start My Scan" to "Go to Dashboard"
13. MISSING-1: Scan history on rankings page
14. MISSING-2: Deep-link execution history rows to specific execution
15. MISSING-4: Link back to original free scan results from dashboard

---

## Notes for Build Lead

The most important fix is GAP-1 — the "Run Scan" button pointing to a 404. This is the primary CTA on the dashboard hero card. Every user who has completed their first scan will hit this immediately.

The second most important is CREDIT-2 — trialing users seeing an "upgrade" banner is a trust/clarity problem that could directly hurt trial-to-paid conversion.

All P1 fixes can be shipped without design work. CREDIT-3 is a security/billing issue (users consuming credits they shouldn't). GAP-5 is a silent data bug that makes the dashboard's engine performance section misleading.

No spec is required for GAP-1, CREDIT-2, CREDIT-3, GAP-5, EMPTY-3, ONBOARD-2, CREDIT-1 — these are all single-function fixes. GAP-2, GAP-3, GAP-4, and MISSING-3 each warrant a brief spec.

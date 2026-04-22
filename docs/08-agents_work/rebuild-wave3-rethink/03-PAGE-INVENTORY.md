# Wave 3 — Page Inventory & IA Rethink
*Author: Product Lead · 2026-04-20*
*Basis: UX-ARCHITECTURE.md (board-approved) + Wave 2 handoff + live codebase audit*

---

## 0. Context Flags (Read First)

**USER-INSIGHTS.md is empty.** Every JTBD marked `[HYPOTHESIS]` below is unvalidated. Before finalizing copy for Wave 3, run 5 SMB interviews. Every headline and CTA is assumption-based until then.

**Wave 2 branches NOT yet on main** (built but unmerged): `feat/rebuild-home-v2`, `feat/rebuild-inbox-workspace-v2`, `feat/rebuild-scans-v2`, `feat/rebuild-competitors-v2`, `feat/rebuild-automation-v2`, `feat/rebuild-wave2-backend`. This inventory reflects what the live `main` branch shows, with Wave 2 state noted per row.

---

## 1. Current Route Inventory

### Protected Routes (authenticated, `apps/web/src/app/(protected)/`)

| Route | JTBD | Tier Visibility | Data Currently Shown | Data That SHOULD Be Shown | Status |
|-------|------|-----------------|----------------------|---------------------------|--------|
| `/home` | [HYPOTHESIS] "I need to know what to do next to improve my AI visibility" | All tiers (gated per item) | Mock: score 62, delta +5, 8-week sparkline, 3 suggestion cards, 3 inbox preview items, credits used 28/90, next run time | GEO score (scans.overall_score), 8-week sparkline (scans by business_id ORDER BY scanned_at DESC LIMIT 8), engine breakdown (scan_engine_results GROUP BY engine), suggestions queue (suggestions table, top 3 by impact_score), inbox preview (content_items WHERE status='awaiting_review' LIMIT 3), credits (credit_pools.used_amount / base_allocation), next scheduled run (automation_schedules.next_run_at), competitor delta widget for Scale | **REWRITE** — mock data only; no Supabase queries; consequence copy missing |
| `/inbox` | [HYPOTHESIS] "I need to review and approve what the agents drafted, fast" | Discover: 1 locked item. Build: full. Scale: full + bulk approve | Mock: 3 hardcoded items (content_optimizer, faq_builder, offsite_presence_builder), no filter state, no 3-pane, PreviewPane shows markdown only | 3-pane layout (item list / content preview / evidence panel); items from content_items WHERE status IN ('draft','awaiting_review') ORDER BY created_at DESC; evidence panel: evidence JSONB field; keyboard shortcuts J/K/A/R; Realtime subscription on content_items inserts; unread badge count | **REWRITE** — 3-pane not implemented on main; Wave 2 branch has InboxClient improvements + `/workspace/[jobId]` link not wired into PreviewPane |
| `/inbox` → `/workspace/[jobId]` | [HYPOTHESIS] "I need to edit this draft properly before approving it" — the Workspace Adam referenced | Build + Scale only (Discover: locked) | NOT ON MAIN. Wave 2 branch has WorkspaceClient + WorkspaceEditor + streaming edit API at `/api/inbox/[itemId]/edit` | Full-page editor: content_items (id, title, content_body, user_edited_content, evidence, target_queries, status) + agent_jobs (agent_type, qa_score, trigger_source) + agent_job_steps for pipeline progress; streaming Haiku rewrite on text selection; GEO signal sidebar (stat count, citation count, query coverage); version history from content_versions | **NEW ROUTE — ship as part of Wave 3.** Currently on `feat/rebuild-inbox-workspace-v2`, not on main. The "Workspace" Adam remembers. |
| `/scans` | [HYPOTHESIS] "I want to see how my AI visibility has changed over time and drill into what each engine said" | Discover: view-only (no re-scan). Build: 1 manual/day + comparison. Scale: unlimited + full comparison | Mock: 6 scan rows, no drilldown implemented, no comparison view, no per-engine breakdown on drilldown | scans table (id, overall_score, score_delta, engines_queried, scanned_at, status); drill-down: scan_engine_results WHERE scan_id = X (engine, is_mentioned, rank_position, sentiment_score, mention_context, competitors_mentioned); comparison diff view: two scans side-by-side; PDF export (React-pdf); manual re-scan CTA (tier-gated) | **REWRITE** — drilldown exists as interim on Wave 2 branch but missing EngineBreakdownTable, QueryByQueryTable, SentimentHistogram |
| `/scans/[scanId]` | "Show me what each engine said about my business in this specific scan" | Same as /scans parent | NOT ON MAIN as complete page. Interim stub exists on Wave 2 branch | scan_engine_results for scanId; mention_context per engine; competitor_mentions array; sentiment_score per engine; prompt_text that triggered each result; diff vs previous scan if comparison requested | **NEW ROUTE (sub-page of Scans)** — needed to complete the scans drilldown |
| `/automation` | [HYPOTHESIS] "I want to configure which agents run on schedule and make sure I don't blow my credit budget" | Discover: locked page (upgrade CTA). Build: up to 3 schedules. Scale: unlimited | Mock: 4 schedule rows (content_optimizer, performance_tracker, freshness_agent, faq_builder), global kill switch toggle (UI only, not wired), credits bar (28/90 hardcoded) | automation_schedules table (agent_type, cadence, next_run_at, last_run_at, is_paused); credit_pools (used_amount, base_allocation + rollover_amount + topup_amount); run-history sparklines per agent from agent_jobs GROUP BY agent_type; AddScheduleModal POST to /api/automation/schedules | **REWRITE** — toggle and credit bar UI exist but not wired to DB; run-history sparklines static; AddScheduleModal not verified |
| `/archive` | [HYPOTHESIS] "I want to see everything I've approved and track what I've actually published to my site" | All tiers see their archive. Scale: CSV/JSON export | Mock: 5 archive items with varied verification states | content_items WHERE status IN ('approved','published') ORDER BY updated_at DESC; verification_status per item; published_url; copy-to-clipboard action; "Mark as published" → triggers URL probe via Inngest; Scale: CSV export endpoint | **REWRITE** — no DB queries, all mock data, no publish-mark flow |
| `/competitors` | [HYPOTHESIS] "I want to see where my competitors appear that I don't, so I can close those gaps" | Discover: full page with 3 tracked competitors. Build: up to 3 competitors, weekly. Scale: unlimited, daily, loss-aversion alerts | Mock: 3 competitors (RivalCo, Challenger.io, NewcomerLabs), appearance rates, 4-week trend arrays, missed queries list | competitors table (name, url); competitor_appearances (appearance_rate by engine); queries where competitor appears but user doesn't; get_competitors_summary RPC (Wave 2 backend — needs migration applied); SovTrendChart (12-week share-of-voice); EngineHeatmap; Win/Loss grid | **REWRITE** — Wave 2 branch has 6 components wired but will render mock until migration applied; hover tooltips missing on SovTrendChart + EngineHeatmap |
| `/settings` | "I need to manage my account, business profile, billing, and notification preferences" | All tiers (Billing tab reflects plan; Automation Defaults: Build+ full features) | Mock: hardcoded user object (email, timezone, language, plan, business object, notification toggles) | 7 tabs: Profile (user_profiles: full_name, avatar_url, locale, timezone), Business (businesses: name, website_url, industry, location, services, description), Billing (subscriptions + plans + credit_pools; Paddle portal link), Preferences (user_profiles: locale, timezone), Notifications (notification_preferences table), Integrations (integrations table — GA4/GSC connect), Automation Defaults (automation_defaults table) | **REWRITE** — all mock; no Supabase reads; Billing tab hardcoded; Integrations is "Coming Soon" placeholder |

### Auth Routes (`apps/web/src/app/(auth)/`)

| Route | JTBD | Tier Visibility | Data Currently Shown | Data That SHOULD Be Shown | Status |
|-------|------|-----------------|----------------------|---------------------------|--------|
| `/login` | "I need to sign back in to my account" | Public | Email + password form, Supabase auth wired | No change needed | **KEEP** — Wave 1 auth rebuild = professional quality |
| `/signup` | "I want to create an account from the free scan result page" | Public | Email + password form, Supabase auth wired | No change needed | **KEEP** |
| `/forgot-password` | "I forgot my password" | Public | Email form, Supabase password reset wired | No change needed | **KEEP** |

### Public Routes (`apps/web/src/app/`)

| Route | JTBD | Tier Visibility | Data Currently Shown | Data That SHOULD Be Shown | Status |
|-------|------|-----------------|----------------------|---------------------------|--------|
| `/scan` | "I want to see how visible my business is in AI search before paying" | Public (pre-auth) | Form → scanning animation (4s mock) → WoundRevealResult (mock score 6.7, 3 competitors, 3 visible + 8 locked fixes) | Real Inngest event fire on submit; real free_scans insert; Supabase Realtime polling for scan status; real score from scan results; real competitor names from scan_engine_results.competitors_mentioned | **REWRITE** — mock scan, no real Inngest fire, 4s hardcoded timer |
| `/` (root) | Redirect to `/home` if authenticated, to `/scan` or marketing if not | N/A | Redirects | Should redirect authenticated users to `/home`, unauthenticated to `/scan` | **KEEP** (minimal) |

### Missing Routes (exist in legacy archive, needed in Wave 3)

See Section 2.

---

## 2. New Routes Proposed

### 2a. `/workspace/[jobId]` — The Content Workspace

**What it is:** The page Adam referenced when he said "we have the Workspace where we get all the agent work and can do things to it." This is the full-screen editing environment for a single agent output, reached from Inbox.

**JTBD:** "I need to review, edit, and finalize an agent draft before I approve and publish it — in a proper editor, not a pane."

**Primary user:** Any paying user reviewing an agent draft. Build/Scale primary — Discover sees locked CTA.

**Exists on:** `feat/rebuild-inbox-workspace-v2` worktree. `WorkspaceClient.tsx`, `WorkspaceEditor.tsx`, `WorkspaceSkeleton.tsx` all exist. The route is built — it just isn't on main, and the Inbox PreviewPane "Open in Workspace →" button is not wired.

**Data dependencies:**
- `agent_jobs` — id, agent_type, status, created_at, completed_at, qa_score, trigger_source
- `content_items` — id, title, content_body, user_edited_content, evidence (JSONB), target_queries (array), status
- `content_versions` — for version history sidebar
- `agent_job_steps` — for pipeline progress display
- API: `POST /api/inbox/[itemId]/edit` (streaming Haiku rewrite, Wave 2 backend branch)
- Realtime: subscribe to agent_jobs.status updates for in-progress jobs

**CTAs:** Approve → moves content_items.status to 'approved'; Reject; Copy content; Save draft edits (writes user_edited_content column)

**Tier:** Discover: locked with upgrade modal. Build + Scale: full.

**Status: SHIP IN WAVE 3.** Merge from Wave 2 branch + wire Inbox "Open in Workspace →" button.

---

### 2b. `/scans/[scanId]` — Scan Drilldown

**JTBD:** "I want to see the raw data from a specific scan — which queries were asked, what each engine said, how my sentiment compared to competitors."

**Primary user:** Business owner doing a post-scan review.

**Data dependencies:**
- `scans` — id, overall_score, scanned_at, engines_queried, results_summary
- `scan_engine_results` — engine, prompt_text, is_mentioned, rank_position, sentiment_score, mention_context, competitors_mentioned, citations
- Compare against previous scan (previous `scans` row for same business_id)
- PDF export: `GET /api/scans/[scanId]/pdf` (placeholder — returns 404 currently)

**CTAs:** Trigger comparison vs prior scan; Download PDF report; Run manual re-scan (tier-gated)

**Tier:** All tiers view their own scan drilldowns. Build/Scale get comparison view. Scale gets PDF export.

**Status: SHIP IN WAVE 3.** Interim stub on Wave 2 scans branch — needs EngineBreakdownTable, QueryByQueryTable, SentimentHistogram components.

---

### 2c. `/onboarding` — Post-Payment Onboarding (2-step)

**Note:** This existed in the legacy `saas-platform/` codebase but is absent from `apps/web/src/app/(protected)/`. It must exist for the Day-1 auto-trigger pipeline to work.

**JTBD:** "I just paid — help me verify my business profile and connect GA4/GSC so the agents have the right context."

**Primary user:** New paying user, post-Paddle payment.

**Data dependencies:**
- `businesses` — pre-filled from free_scans data via onboarding API
- `user_profiles.onboarding_completed_at` — set on completion
- Inngest: `onboarding.complete` event triggers Query Mapper → Paid Scan → Rules Engine chain
- Step 2: GA4/GSC connect tokens (integrations table)

**CTAs:** Save business profile → Connect GA4/GSC (optional, skippable) → "Go to dashboard" (fires Inngest chain)

**Tier:** All paying tiers go through onboarding. Preview accounts skip (they go direct to /home with banner).

**Status: SHIP IN WAVE 3.** Critical for Day-1 value. Currently missing from apps/web entirely.

---

## 3. IA Tree (Left Nav — Max 7 Top-Level Items)

Hick's Law: 7 ± 2 items at top level. Current implementation has exactly 7 — correct. The board-approved nav is the right structure. No changes to top-level items.

```
DASHBOARD SHELL
│
├── 1. Home          ← Score + Suggestions + Inbox preview (daily driver for passive users)
├── 2. Inbox         ← Agent drafts awaiting review (daily driver for active users)
│         └── /workspace/[jobId]  ← Full-screen editor (reached from Inbox item, not in nav)
├── 3. Scans         ← Scan history + manual trigger
│         └── /scans/[scanId]    ← Drill-down (reached from scan row, not in nav)
├── 4. Automation    ← Schedules + credit budget + kill switch
├── 5. Archive       ← Approved + published content history
├── 6. Competitors   ← Head-to-head engine comparison
└── 7. Settings      ← Profile / Business / Billing / Preferences / Notifications / Integrations / Automation Defaults
```

**Nav badges:**
- Inbox: unread count (content_items WHERE status='awaiting_review', Realtime-updated)
- Home: no badge (it's always the entry point)
- All others: no badge

**Kill switch:** Global automation pause accessible from sidebar footer (below Settings), not behind a nav item. It needs to be one click from anywhere per product philosophy.

**No `/agents` route.** Board decision: agents are invisible infrastructure, not a nav destination.

---

## 4. Per-Surface Data Contract

### Home (`/home`)

| Data | Source | Query/RPC | Notes |
|------|--------|-----------|-------|
| GEO score (current) | `scans` | `SELECT overall_score FROM scans WHERE business_id = $bid ORDER BY scanned_at DESC LIMIT 1` | Null state: show empty score ring with "Run your first scan" |
| 8-week sparkline | `scans` | `SELECT overall_score, scanned_at FROM scans WHERE business_id = $bid ORDER BY scanned_at DESC LIMIT 8` | Render in reverse for chronological display |
| Score delta | `scans` | last 2 rows: delta = current - previous | Show +/- with color |
| Engine breakdown | `scan_engine_results` | `SELECT engine, COUNT(*) FILTER (WHERE is_mentioned) / COUNT(*)::float AS mention_rate FROM scan_engine_results WHERE scan_id = $latest_scan_id GROUP BY engine` | 4 engines on Discover, 7 on Build, 9+ on Scale |
| Suggestions queue | `suggestions` table | `SELECT * FROM suggestions WHERE business_id = $bid AND status = 'pending' ORDER BY impact_score DESC LIMIT 3` | NOTE: `suggestions` table existence not confirmed in DATABASE_SCHEMA.md — see PRD gaps §6 |
| Inbox preview | `content_items` | `SELECT id, title, agent_type, status, created_at FROM content_items WHERE user_id = $uid AND status IN ('draft','awaiting_review') ORDER BY created_at DESC LIMIT 3` | Used for "3 drafts ready" widget |
| Credits usage | `credit_pools` | `SELECT used_amount, base_allocation + rollover_amount + topup_amount AS total FROM credit_pools WHERE user_id = $uid AND pool_type = 'monthly'` | |
| Next scheduled run | `automation_schedules` | `SELECT MIN(next_run_at) FROM automation_schedules WHERE user_id = $uid AND is_paused = false` | |
| Competitor delta (Scale only) | `get_competitors_summary` RPC | RPC in Wave 2 backend migration | Requires migration applied |
| Props from parent | `DashboardShell` layout | user plan_tier, business_id, user_id | Passed down from server layout |
| Realtime subscriptions | `content_items` | Subscribe on inserts WHERE user_id = $uid | Updates inbox preview count in real-time |

---

### Inbox (`/inbox`)

| Data | Source | Query/RPC | Notes |
|------|--------|-----------|-------|
| Item list | `content_items` | `SELECT id, title, agent_type, status, created_at, preview_markdown FROM content_items WHERE user_id = $uid AND status IN ('draft','awaiting_review','approved','rejected') ORDER BY created_at DESC` | Filtered by status tab (All / Awaiting / Approved / Rejected) |
| Full content (preview pane) | `content_items` | `SELECT content_body, user_edited_content FROM content_items WHERE id = $itemId` | Show user_edited_content if not null, else content_body |
| Evidence panel | `content_items.evidence` | JSONB column: `{trigger_source, target_queries, impact_estimate, citations[]}` | Wave 2 InboxClient already has this |
| Unread badge | `content_items` | `COUNT(*) WHERE user_id=$uid AND status='awaiting_review'` | Realtime subscription keeps badge live |
| Approve mutation | `content_items` | `UPDATE SET status='approved', updated_at=NOW()` WHERE id = $itemId | Also triggers Archive insert via Inngest |
| Reject mutation | `content_items` | `UPDATE SET status='rejected', updated_at=NOW()` | |
| "Open in Workspace" | n/a — route link | `/workspace/[content_item.agent_job_id]` | jobId is the agent_jobs.id, not content_items.id |
| Realtime subscription | `content_items` | INSERT events WHERE user_id = $uid | New drafts pop into list without refresh |
| Tier gate | `subscriptions.plan_tier` | From layout session | Discover: first item visible, rest behind overlay; Build+Scale: full |

---

### Workspace (`/workspace/[jobId]`)

| Data | Source | Query/RPC | Notes |
|------|--------|-----------|-------|
| Job metadata | `agent_jobs` | `SELECT id, agent_type, status, created_at, completed_at, qa_score, trigger_source FROM agent_jobs WHERE id = $jobId AND user_id = $uid` | RLS ensures user owns the job |
| Content body | `content_items` | `SELECT id, title, content_body, user_edited_content, evidence, target_queries, status FROM content_items WHERE agent_job_id = $jobId` | One content item per job (1:1 for content agents) |
| Version history | `content_versions` | `SELECT version_number, content_body, edited_by, change_summary, created_at FROM content_versions WHERE content_item_id = $itemId ORDER BY version_number DESC` | |
| Pipeline steps | `agent_job_steps` | `SELECT step_name, step_order, status, output_summary FROM agent_job_steps WHERE agent_job_id = $jobId ORDER BY step_order` | For "How was this made" sidebar |
| Inline rewrite | API | `POST /api/inbox/[itemId]/edit` — streaming Haiku rewrite on selected text | Route exists in Wave 2 backend branch |
| Save edits | `content_items` | `UPDATE SET user_edited_content = $text, updated_at = NOW()` | Writes to user_edited_content column (100k CHECK in Wave 2 migration) |
| Approve | `content_items` | `UPDATE SET status='approved'` + Inngest event | |
| Realtime | `agent_jobs` | Subscribe to status updates for in-progress jobs | Shows skeleton while job runs, switches to editor on completion |

---

### Scans (`/scans`)

| Data | Source | Query/RPC | Notes |
|------|--------|-----------|-------|
| Scan history list | `scans` | `SELECT id, overall_score, score_delta_vs_prev, scanned_at, status, engines_queried, engines_succeeded FROM scans WHERE business_id = $bid ORDER BY scanned_at DESC` | Group by date client-side |
| Manual re-scan CTA | API | `POST /api/scans/start` — emits Inngest event | Tier-gated: Discover = no re-scan; Build = 1/day; Scale = unlimited |
| Props from parent | `DashboardShell` layout | business_id, user plan_tier | |
| Tier gate | `subscriptions` | plan_tier from session | |

### Scan Drilldown (`/scans/[scanId]`)

| Data | Source | Query/RPC | Notes |
|------|--------|-----------|-------|
| Scan header | `scans` | `SELECT overall_score, scanned_at, engines_queried, results_summary FROM scans WHERE id = $scanId AND user_id = $uid` | RLS via user_id |
| Engine breakdown | `scan_engine_results` | `SELECT engine, is_mentioned, rank_position, sentiment_score, mention_context, competitors_mentioned FROM scan_engine_results WHERE scan_id = $scanId` | One row per engine per prompt |
| Previous scan (for diff) | `scans` | `SELECT id FROM scans WHERE business_id = $bid AND scanned_at < $currentScannedAt ORDER BY scanned_at DESC LIMIT 1` | Build/Scale only |
| Citation sources | `citation_sources` | `SELECT source_domain, mention_count, engines FROM citation_sources WHERE business_id = $bid ORDER BY mention_count DESC LIMIT 10` | "What sources are AI engines citing about you" |
| PDF export | API | `GET /api/scans/[scanId]/pdf` | Currently 404 — needs implementation |

---

### Automation (`/automation`)

| Data | Source | Query/RPC | Notes |
|------|--------|-----------|-------|
| Schedule list | `automation_schedules` | `SELECT id, agent_type, cadence, next_run_at, last_run_at, is_paused FROM automation_schedules WHERE user_id = $uid` | NOTE: table name `automation_schedules` not in DATABASE_SCHEMA.md — see PRD gaps §6 |
| Global kill switch | `user_profiles` or `automation_settings` | Boolean flag | Architecture unclear — see PRD gaps |
| Credit usage | `credit_pools` | Same as Home credit query | |
| Run-history sparklines | `agent_jobs` | `SELECT agent_type, created_at, status FROM agent_jobs WHERE user_id=$uid AND status='completed' AND created_at > NOW()-INTERVAL '30 days' GROUP BY agent_type, DATE(created_at)` | Per-agent 30-day sparkline |
| Add schedule | API | `POST /api/automation/schedules` body: `{agent_type, trigger, frequency}` | May not support all fields — needs verification |
| Tier gate | `subscriptions` | Discover = locked page; Build = 3 max schedules; Scale = unlimited | |

---

### Archive (`/archive`)

| Data | Source | Query/RPC | Notes |
|------|--------|-----------|-------|
| Approved items | `content_items` | `SELECT id, title, agent_type, status, published_url, published_at, updated_at FROM content_items WHERE user_id=$uid AND status IN ('approved','published') ORDER BY updated_at DESC` | |
| Verification status | `content_performance` or inline in `content_items` | After user marks published → Inngest URL probe | |
| Mark as published | API | `POST /api/archive/[itemId]/publish` body: `{url}` | Triggers URL probe Inngest event |
| Copy content | `content_items.content_body` | Client-side clipboard API | |
| Re-run agent | API | `POST /api/agents/run` with original item context | Spawns new agent_job |
| CSV export (Scale) | API | `GET /api/archive/export.csv` | Scale tier only |

---

### Competitors (`/competitors`)

| Data | Source | Query/RPC | Notes |
|------|--------|-----------|-------|
| Competitor list | `competitors` table | `SELECT id, name, url FROM competitors WHERE business_id = $bid` | NOTE: `competitors` table not in DATABASE_SCHEMA.md — see PRD gaps |
| Appearance rate | `get_competitors_summary` RPC | Wave 2 migration required | Returns per-competitor, per-engine appearance rates |
| Missed queries | Computed from `scan_engine_results` | Queries where competitors appear but user doesn't | |
| SoV trend (12-week) | `scan_engine_results` | `SELECT ... GROUP BY week` | SovTrendChart in Wave 2 branch — static mock currently |
| Engine heatmap | `scan_engine_results` | Per-engine × per-competitor grid | Wave 2 EngineHeatmap component |
| Win/loss grid | `scan_engine_results` | Per-query × per-competitor | Wave 2 component |
| Add competitor | API | `POST /api/competitors` | Tier-gated |
| Tier gate | Discover: 3 competitors; Build: 3, weekly; Scale: unlimited, daily | |

---

### Settings (`/settings`)

| Data | Tab | Source | Notes |
|------|-----|--------|-------|
| full_name, avatar_url, locale, timezone | Profile | `user_profiles` | UPSERT pattern |
| business name/url/industry/location/services | Business | `businesses WHERE is_primary = true` | |
| plan name, period, Paddle portal URL | Billing | `subscriptions JOIN plans` | Paddle portal via client-side Paddle.js |
| Invoice history | Billing | Paddle API or `credit_transactions` | |
| locale, timezone, date_format | Preferences | `user_profiles` | |
| Per-event toggles, digest_hour | Notifications | `notification_preferences` | Table exists per schema |
| GA4/GSC tokens | Integrations | `integrations` table | Stub "Coming Soon" for MVP is acceptable |
| Default cadences, credit cap, kill switch | Automation Defaults | `automation_settings` or `user_profiles.settings` JSONB | Architecture unclear — see PRD gaps |

---

## 5. RICE-Scored Cut/Merge/Replace List

*Reach = estimated % of active users affected per quarter. Impact scores: 0.25/0.5/1/2/3. Confidence % based on how well we know the problem. Effort in eng-weeks.*

| # | Change | Reach | Impact | Confidence | Effort | RICE Score | Rationale |
|---|--------|-------|--------|------------|--------|------------|-----------|
| 1 | **Wire `/home` to Supabase (replace all mock data)** | 100% (every user) | 3 (massive — currently shows fake data, product feels broken) | 90% | 1.5w | 180 | Every session starts here. Mock data = zero trust. Schema exists. |
| 2 | **Merge Workspace route + wire Inbox "Open in Workspace" button** | 80% (paying users who review drafts) | 3 (the Workspace is Adam's explicit "remember?" feature) | 85% | 1w | 204 | Adam specifically called this out. Route is built, just unmerged and unwired. |
| 3 | **Wire `/inbox` to Supabase + implement 3-pane layout properly** | 80% | 3 | 85% | 2w | 102 | Primary daily-driver screen. Currently mock. 3-pane is the board-approved design. |
| 4 | **Replace consequence copy across all 7 pages** | 100% | 2 ("The strings don't mean anything" — Adam's exact words) | 75% | 0.5w | 300 | Zero effort for massive perception change. "Good" → "3 competitors rank above you." |
| 5 | **Ship `/scans/[scanId]` drilldown with EngineBreakdownTable** | 70% | 2 (scan data is the product's proof of value) | 80% | 1.5w | 74.7 | Users need drill-down to trust the score. Currently clicking a scan row does nothing. |
| 6 | **Wire Automation schedules + credit bar to DB** | 60% | 2 | 80% | 1w | 96 | Build/Scale users controlling cadences and budget need real data or the page is theater. |
| 7 | **Add Onboarding route (`/onboarding`)** | 100% (new users only — ~100% of growth) | 3 (required for Day-1 auto-trigger pipeline — dead dashboard on payment = churn) | 90% | 1.5w | 180 | Missing entirely from apps/web. Every new paying user hits a dead dashboard without it. |
| 8 | **Wire `/competitors` to DB (apply Wave 2 migration + RPC)** | 50% | 2 | 75% | 0.5w | 150 | The migration is written. Competitors page is entirely mock until applied. |
| 9 | **Wire `/archive` to DB** | 60% | 1 | 80% | 1w | 48 | Archive is the proof of work — "look at everything you've approved." Currently mock. |
| 10 | **Wire `/settings` tabs to DB (Profile + Business + Billing)** | 100% | 1 | 90% | 1.5w | 60 | Every user who visits settings sees wrong data. Billing tab = hardcoded = looks broken. |
| 11 | **Cut dead empty states with generic placeholder text** | 100% | 1 ("AI slop" critique — generic "Your inbox is empty" copy) | 90% | 0.25w | 360 | Replace with consequence-framed states. "No drafts yet — accept a suggestion to run your first agent." Effort near zero. |
| 12 | **Wire `/scan` (public) to real Inngest fire** | 100% (pre-auth, acquisition funnel) | 3 | 80% | 1.5w | 160 | Acquisition funnel uses mock 4s timer. Real scan = real trust signal. |

**Sorted by RICE score (desc):**

| Priority | Change | RICE |
|----------|--------|------|
| 1 | Cut dead empty states / consequence copy replacement | 360 |
| 2 | Merge Workspace + wire Inbox button | 204 |
| 3 | Wire /home to Supabase | 180 |
| 4 | Add /onboarding route | 180 |
| 5 | Wire /scan (public) to real Inngest | 160 |
| 6 | Wire /competitors (apply migration) | 150 |
| 7 | Wire Automation to DB | 96 |
| 8 | Wire /inbox to Supabase + 3-pane | 102 |
| 9 | Wire /settings (Profile + Business + Billing) | 60 |
| 10 | Ship /scans/[scanId] drilldown | 74.7 |
| 11 | Wire /archive to DB | 48 |

---

## 6. PRD Gaps — Decisions Needed From Adam

These questions are blocking correct implementation. They are not design preferences — they are data architecture decisions or scoping choices the PRD hasn't answered.

### G1 — Suggestions Table: Does It Exist?

**Gap:** The PRD describes a "suggestions queue" populated by a 15-rule engine evaluating scan results. The DATABASE_SCHEMA.md has no `suggestions` table. Home page and Automation logic both depend on it.

**Decision needed:** Is the suggestions queue:
- (A) A separate `suggestions` table with columns (id, business_id, rule_id, impact_score, agent_type, status, created_at)?
- (B) A derived view from `scan_engine_results` computed at query time?
- (C) Something else?

**Blocking:** Home `/suggestions queue` widget, Automation trigger display, Day-1 pipeline.

---

### G2 — Automation Schedules Table: Schema?

**Gap:** `automation_schedules` table is referenced throughout the PRD but absent from DATABASE_SCHEMA.md. The Automation page depends on it entirely.

**Decision needed:** Confirm schema: `(id, user_id, business_id, agent_type, cadence, next_run_at, last_run_at, is_paused, created_at)` — or provide the correct columns.

**Blocking:** Automation page real data wiring.

---

### G3 — Competitors Table: Schema?

**Gap:** `competitors` table referenced in Competitors page spec but not in DATABASE_SCHEMA.md (which only has `competitor_mentions` in scan_engine_results as a text array, not a separate entity table).

**Decision needed:** Confirm whether a standalone `competitors` table exists with (id, business_id, name, url, created_at) — or are competitors tracked only as strings in scan results?

**Blocking:** Competitors page "Add competitor" flow, tier-gated competitor count.

---

### G4 — Global Kill Switch Storage

**Gap:** "Global pause toggle" that stops all automation is mentioned as a first-class feature. No column or table in DATABASE_SCHEMA.md stores this state.

**Decision needed:** Where does the kill switch state live?
- (A) `user_profiles.automation_paused boolean`
- (B) `automation_settings` table (separate)
- (C) All `automation_schedules.is_paused` set to true (no global flag)

**Blocking:** Kill switch toggle in Automation page, sidebar footer kill switch.

---

### G5 — Workspace: Build-Only or All Paid Tiers?

**Gap:** The board-approved doc says "Workspace = tier-gated Build+Scale for retention" (Data Lead memo in Wave 2 handoff). But the UX Architecture doc says Inbox is available to Build with full access. Workspace is the Inbox detail pane, done properly — should Discover users see a limited workspace view or a hard paywall?

**Decision needed:** Discover → Workspace = full paywall modal, or read-only view (can read draft, cannot edit, cannot approve)?

**Blocking:** Workspace tier gate implementation.

---

### G6 — `/scans` Manual Re-Scan: Rate Limit Enforcement

**Gap:** PRD says Build = 1 manual re-scan/day, Scale = unlimited. No DB column tracks "manual rescans today" — is this enforced via `scans` table query (COUNT WHERE scan_type='manual' AND scanned_at > today) or a separate counter?

**Decision needed:** Confirm rate limit check logic for re-scan CTA button.

**Blocking:** Scans page re-scan button tier-gating.

---

### G7 — Archive Verification: URL Probe Mechanism

**Gap:** "System probes URL after 48h" after user marks published. This requires an Inngest scheduled job per published item. No Inngest function for URL probe exists in the codebase audit.

**Decision needed:** Is URL probe in scope for Wave 3, or is it deferred? If deferred, Archive shows "Pending verification" forever which is misleading.

**Blocking:** Archive "Mark as published" flow completeness.

---

### G8 — Onboarding Route: Preview Account Path

**Gap:** Board decision says preview accounts (from "Explore first" free scan path) skip onboarding and land directly on `/home` with a persistent banner. But the current codebase has NO middleware logic to detect preview-account status vs paid-account status for routing.

**Decision needed:** How is preview account state stored? Options:
- (A) `user_profiles.is_preview = true` column (cleared on payment)
- (B) `subscriptions.status = 'preview'` enum value (not in current CHECK constraint)
- (C) Absence of `subscriptions` row = preview

**Blocking:** Middleware routing + onboarding route existence gate.

---

### G9 — Content Item "inbox vs archive" Split

**Gap:** `content_items` has a single `status` column with values `('draft', 'in_review', 'approved', 'published', 'archived')`. The PRD has Inbox showing draft/in_review/approved and Archive showing approved/published. There is overlap — "approved" items appear in both?

**Decision needed:** Clarify the routing rule:
- Inbox: status IN ('draft', 'awaiting_review')
- Archive: status IN ('approved', 'published')
- Or does "approved" stay in Inbox until user explicitly archives it?

**Note:** The `InboxItem` type in shared types uses `'awaiting_review'` as a status value but the DB schema has `'in_review'` — these need to be reconciled.

---

### G10 — Scan Page: `score` Display Scale

**Gap:** Current mock shows `score: 6.7` (0-10 scale). Board-approved PRD says score is 0-100. UX Architecture says "Giant visibility score (0-100)." DATABASE_SCHEMA.md says `overall_score integer CHECK (0-100)`.

**Decision needed:** Confirm the free scan wound-reveal result page shows 0-100 (not 0-10). The `WoundRevealResult` component currently renders `6.7` and the mock type has `score: number` — needs to be `score: 6` on the 0-100 scale (not `6.7`).

**Blocking:** Free scan results page accuracy and trust.

---

## Summary

**Current state:** 7 protected pages + 3 auth pages + 2 public pages. All 7 protected pages are 100% mock data. No Supabase queries execute on any page. The product cannot be trusted as a real product until Waves 3 DB wiring lands.

**Wave 3 must ship:**
1. All 7 protected pages wired to real Supabase data
2. Workspace route merged from Wave 2 + wired into Inbox
3. Scan drilldown (`/scans/[scanId]`) completed with 3 missing components
4. Onboarding route created (`/onboarding`) — critical for Day-1 pipeline
5. Consequence copy replacing all generic labels across every page
6. Wave 2 migration applied (get_competitors_summary RPC) — prerequisite for Competitors page

**10 PRD gaps** (G1–G10) need Adam's decisions before full implementation begins. G1 (suggestions table), G3 (competitors table), and G8 (preview account routing) are the three hardest blockers.

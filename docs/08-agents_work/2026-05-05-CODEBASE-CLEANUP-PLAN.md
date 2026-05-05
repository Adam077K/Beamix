# Codebase Cleanup + Rebuild Plan

**Date:** 2026-05-05
**Author:** CEO synthesis pass
**Status:** CANONICAL — executable by Build Lead without follow-up questions
**Scope:** `apps/web/` only. `_archive/saas-platform-2026-04-legacy/` is untouched unless Adam confirms deletion (§10).
**References:** PRD v5.1 (`2026-05-04-PRD-wedge-launch-v5.1.md`) · Build Plan v3.1 (`2026-05-04-BUILD-PLAN-v3.1.md`) · Option E Spec (`2026-05-04-OPTION-E-START-FLOW-SPEC.md`) · Infra State (`2026-05-05-INFRA-STATE-COMPLETE.md`)

---

## §1 — Current Codebase State Audit

### Total LOC

`apps/web/src/` contains **32,225 lines** across all `.ts` and `.tsx` files.

### Routes — Pages

| Route | File | Notes |
|---|---|---|
| `/` (root redirect) | `src/app/page.tsx` | Redirects to `/home` |
| `/login` | `src/app/(auth)/login/page.tsx` | Email+password only. No Google OAuth. |
| `/signup` | `src/app/(auth)/signup/page.tsx` | Email+password only. No Google OAuth. |
| `/forgot-password` | `src/app/(auth)/forgot-password/page.tsx` | Password reset |
| `/scan` | `src/app/scan/page.tsx` | Public scan — still uses mock PRNG result, hardcoded `mockScanResult` object. Not wired to real engine. |
| `/home` | `src/app/(protected)/home/page.tsx` | Protected. Live Supabase data. No Two-Tier state (Free vs Paid). |
| `/inbox` | `src/app/(protected)/inbox/page.tsx` | Protected. Live content_items query. |
| `/workspace/[jobId]` | `src/app/(protected)/workspace/[jobId]/page.tsx` | Protected. Live agent_jobs query. |
| `/scans` | `src/app/(protected)/scans/page.tsx` | Protected. Live scan rows. |
| `/scans/[scanId]` | `src/app/(protected)/scans/[scanId]/page.tsx` | Protected. Scan drilldown. |
| `/competitors` | `src/app/(protected)/competitors/page.tsx` | Protected. |
| `/automation` | `src/app/(protected)/automation/page.tsx` | Protected. |
| `/archive` | `src/app/(protected)/archive/page.tsx` | Protected. |
| `/settings` | `src/app/(protected)/settings/page.tsx` | Protected. Live Supabase. |
| `/onboarding` | `src/app/(protected)/onboarding/page.tsx` | Protected. 2-step form (name + description). NOT the 9-phase Option E flow. |
| `/error` | `src/app/error.tsx` | Generic Next.js error boundary. |
| `/global-error` | `src/app/global-error.tsx` | Global error boundary. |
| `/not-found` | `src/app/not-found.tsx` | 404 page. |

**Missing entirely (PRD v5.1 requires):** `/start`, `/scan/[scanId]` permalink, `/reports`, `/crew`, `/trust`, `/changelog`, `/security`, `/status`.

### Routes — API

| Route | File | Notes |
|---|---|---|
| `POST /api/scan/start` | `src/app/api/scan/start/route.ts` | Fires Inngest `scan/start.requested`. |
| `GET /api/scan/[scanId]` | `src/app/api/scan/[scanId]/route.ts` | Poll for scan result. |
| `GET /api/scans` | `src/app/api/scans/route.ts` | List user scans. |
| `POST /api/agents/run` | `src/app/api/agents/run/route.ts` | Trigger agent job. |
| `POST /api/agents/[jobId]/cancel` | `src/app/api/agents/[jobId]/cancel/route.ts` | Cancel agent job. |
| `GET /api/billing/checkout` | `src/app/api/billing/checkout/route.ts` | Returns Paddle priceId + metadata. |
| `POST /api/billing/portal` | `src/app/api/billing/portal/route.ts` | Paddle customer portal URL. |
| `POST /api/webhooks/paddle` | `src/app/api/webhooks/paddle/route.ts` | Paddle webhook handler. References `app.beamix.tech` in hardcoded fallback. |
| `POST /api/onboarding/complete` | `src/app/api/onboarding/complete/route.ts` | Marks onboarding done. Routes to old flow, not /start. |
| `GET /api/notifications` | `src/app/api/notifications/route.ts` | Fetch user notifications. |
| `POST /api/notifications/read` | `src/app/api/notifications/read/route.ts` | Mark read. |
| `GET /api/suggestions` | `src/app/api/suggestions/route.ts` | Fetch suggestions. |
| `POST /api/suggestions/[id]/dismiss` | `src/app/api/suggestions/[id]/dismiss/route.ts` | Dismiss suggestion. |
| `GET/PUT /api/settings` | `src/app/api/settings/route.ts` | Settings CRUD. |
| `GET /api/credits/balance` | `src/app/api/credits/balance/route.ts` | Credit balance. |
| `GET /api/plan/features` | `src/app/api/plan/features/route.ts` | Plan gating. |
| `POST /api/automation/schedules` | `src/app/api/automation/schedules/route.ts` | Create schedule. |
| `PUT/DELETE /api/automation/schedules/[id]` | `src/app/api/automation/schedules/[id]/route.ts` | Manage schedule. |
| `POST /api/automation/kill-switch` | `src/app/api/automation/kill-switch/route.ts` | Pause all automation. |
| `POST /api/archive/[itemId]/publish` | `src/app/api/archive/[itemId]/publish/route.ts` | Publish content. |
| `PUT /api/inbox/[itemId]/edit` | `src/app/api/inbox/[itemId]/edit/route.ts` | Edit inbox item. |
| `POST /api/internal/revalidate` | `src/app/api/internal/revalidate/route.ts` | Cache revalidation. |
| `GET /api/health` | `src/app/api/health/route.ts` | Health check. |
| `POST /api/auth/tester-login` | `src/app/api/auth/tester-login/route.ts` | Dev tester shortcut. References `tester@beamix.tech`. |
| `POST/GET /api/inngest` | `src/app/api/inngest/route.ts` | Inngest serve endpoint. |

### Components

**Shell:**
- `src/components/shell/DashboardShell.tsx` — main layout shell with sidebar
- `src/components/shell/DashboardShellClient.tsx` — client wrapper
- `src/components/shell/Sidebar.tsx` — nav sidebar
- `src/components/shell/NotificationBell.tsx` — notification dropdown
- `src/components/shell/PlanBadge.tsx` — tier badge
- `src/components/shell/PreviewModeBanner.tsx` — tester preview banner

**Home:**
- `src/components/home/HomeClientV2.tsx` — v2 home dashboard (current active)
- `src/components/home/HomeClient.tsx` — v1 home (superseded, not deleted)
- `src/components/home/KpiStripNew.tsx`, `KpiCardRow.tsx` — KPI metrics strip
- `src/components/home/EngineBreakdownGrid.tsx`, `EngineBreakdown.tsx` — engine grid
- `src/components/home/ActivityFeedNew.tsx`, `ActivityFeed.tsx` — activity feed (v1+v2 coexist)
- `src/components/home/NextStepsSection.tsx`, `NextStepsCard.tsx` — next actions
- `src/components/home/SuggestionsFeed.tsx` — suggestions queue
- `src/components/home/ScoreHero.tsx`, `ProgressRing.tsx` — score display
- `src/components/home/TrendChart.tsx`, `RoadmapTab.tsx` — trend + roadmap

**Inbox:**
- `src/components/inbox/InboxClient.tsx`, `ItemList.tsx`, `PreviewPane.tsx`, `FilterRail.tsx` — inbox 3-panel layout

**Workspace:**
- `src/components/workspace/WorkspaceClient.tsx`, `WorkspaceEditor.tsx`, `WorkspaceSkeleton.tsx` — agent output editor

**Scans:**
- `src/components/scans/ScansClient.tsx`, `ScanDrilldown.tsx`, `EngineBreakdownTable.tsx`, `QueryByQueryTable.tsx`, `SentimentHistogram.tsx`

**Scan (public):**
- `src/components/scan/PreScanForm.tsx` — domain entry form
- `src/components/scan/ScanningAnimation.tsx` — loading state (references 149 in percentage label)
- `src/components/scan/WoundRevealResult.tsx` — results reveal
- `src/components/scan/ExploreFirstModal.tsx` — explore without signup modal

**Competitors:**
- `src/components/competitors/CompetitorsClient.tsx`, `CompetitorTable.tsx`, `CompetitorDrawer.tsx`, `AddCompetitorModal.tsx`, `EngineHeatmap.tsx`, `ShareOfVoiceCard.tsx`, `SovTrendChart.tsx`, `MissedQueriesList.tsx`, `QueryWinLossTable.tsx`, `StrategyDeltaAside.tsx`, `types.ts`

**Onboarding (OLD):**
- `src/components/onboarding/OnboardingClient.tsx` — 2-step business form, no scan integration

**Paywall:**
- `src/components/paywall/PaywallGate.tsx`, `PaywallModal.tsx`, `TierCard.tsx` — TierCard has correct $79/$189/$499 pricing

**Automation:**
- `src/components/automation/AutomationClient.tsx`, `AddScheduleModal.tsx`, `KillSwitchConfirm.tsx`

**Archive:**
- `src/components/archive/ArchiveClient.tsx`, `BulkExportButton.tsx`, `ExportMenu.tsx`, `PublishToggle.tsx`, `VerificationChip.tsx`

**Settings:**
- `src/components/settings/SettingsClient.tsx`, `SettingsField.tsx`

**Layout:**
- `src/components/layout/TrialBanner.tsx` — trial countdown banner

**UI primitives (Radix-based):**
- `src/components/ui/` — 22 primitive files (alert, badge, button, card, dialog, dropdown-menu, empty-state, input, label, language-toggle, loading-skeleton, page-header, progress, score-badge, score-ring, select, separator, skeleton, stat-card, status-dot, switch, tabs, textarea, trend-badge)

### Database Migrations (present)

| File | Content |
|---|---|
| `20260301_blog_posts.sql` | Blog posts table |
| `20260302_signup_trigger.sql` | handle_new_user trigger |
| `20260308_001–008_*.sql` | Core rethink schema (identity, billing, scan, agents, intelligence, workflows, platform, seed) |
| `20260318_reconciliation.sql` | Schema drift fixes |
| `20260319_fix_rls_policies.sql` | RLS fixes |
| `20260319_scan_email.sql` | Scan email |
| `20260323_scan_schema_fix.sql` | Scan schema fix |
| `20260418_01_rethink_enums.sql` | Product rethink enums |
| `20260418_02_rethink_schema.sql` | Product rethink tables |
| `20260419_01_rebuild_wave2_rpcs.sql` | Wave 2 RPCs |
| `20260420_wave3_foundation.sql` | automation_settings, content_versions, citation_sources |
| `20260422_01_drop_engine_check.sql` | Constraint removal |
| `cleanup/0001–0004_*.sql` | Legacy table drops (not yet applied — in cleanup/ folder) |

### Inngest Functions (defined)

| Function ID | File | Notes |
|---|---|---|
| `scan-run` | `src/inngest/functions/scan-run.ts` | Real LLM calls via OpenRouter. Tier-aware engine selection. References `app.beamix.tech` in fallback URL. |
| `agent-pipeline` | `src/inngest/functions/agent-pipeline.ts` | Full agent job lifecycle. Uses correct pricing ($79/$189/$499). |
| `automation-dispatcher` | `src/inngest/functions/automation-dispatcher.ts` | Scheduled automation trigger. |
| `budget-guard` | `src/inngest/functions/budget-guard.ts` | Cost circuit breaker. References `app.beamix.tech`. |
| `daily-digest` | `src/inngest/functions/daily-digest.ts` | Daily digest email. References `app.beamix.tech`. |
| `scan-completed` | `src/inngest/functions/scan-completed.ts` | Post-scan hook. |
| `url-probe` | `src/inngest/functions/url-probe.ts` | URL health probe. |

### Tests

Zero test files. No `*.test.*` or `*.spec.*` files in `apps/web/src/`. Test infrastructure is planned but not built (T63 CI gate, T97 smoke test, T137 Playwright).

### Key Dependencies

| Package | Version | Status |
|---|---|---|
| `next` | ^16.2.3 | Current |
| `react` / `react-dom` | ^19.2.3 | Current |
| `@supabase/ssr` + `@supabase/supabase-js` | ^0.6.1 / ^2.98.0 | Current |
| `@paddle/paddle-node-sdk` + `@paddle/paddle-js` | ^3.6.0 / ^1.5.0 | Current. No Stripe anywhere. |
| `inngest` | ^3.52.6 | Current |
| `resend` + `react-email` | ^4.0.0 / ^3.0.0 | Current |
| `@anthropic-ai/sdk` | ^0.78.0 | Current |
| `framer-motion` | ^12.34.3 | Current |
| `next-intl` | ^4.9.1 | RTL/i18n present |
| `geist` | ^1.7.0 | Font package — does NOT include Heebo (T93 needed) |
| `zod` | ^4.0.0 | Current |
| `@upstash/ratelimit` + `@upstash/redis` | ^2.0.5 / ^1.34.3 | Rate limiting infrastructure |
| `@sentry/nextjs` | ^9.0.0 | Error monitoring installed but T135 config incomplete |
| **Missing:** `zustand` | — | Required by T100 (`/start` state machine). Not in package.json. |
| **Missing:** `nanoid` | — | Required for `beamixai.com/r/{nanoid21}` report permalinks. |

No Stripe, no n8n references found anywhere in `apps/web/`.

---

## §2 — Mapping Current Code to PRD v5.1

### Routes

| File | Status | Reason |
|---|---|---|
| `src/app/page.tsx` | 🟡 REWORK | Redirects to `/home` — should redirect to `/start` for unauthenticated users, `/home` for authed |
| `src/app/(auth)/login/page.tsx` | 🟡 REWORK | Email+password only. T95 requires Google OAuth as primary CTA above email form. Layout needs Google "G" button. |
| `src/app/(auth)/signup/page.tsx` | ❌ DELETE | Signup is absorbed into `/start` Phase 3 (`signup-overlay`). A standalone `/signup` route contradicts Option E. Users who land here should be redirected to `/start`. |
| `src/app/(auth)/forgot-password/page.tsx` | ✅ KEEP | Password reset is still needed for email+password fallback users. |
| `src/app/(auth)/layout.tsx` | 🟡 REWORK | Contains `beamix.tech` links (3 occurrences). Replace with `beamixai.com`. |
| `src/app/scan/page.tsx` | 🟡 REWORK | Public scan page — concept is correct per Option E (peer-public `/scan`). But current implementation uses `mockScanResult` hardcoded object. Must wire to real engine via `POST /api/scan/start` + result polling. Also needs "Claim this scan" CTA that routes to `/start?phase=results&scan_id=[id]`. Currently no `/scan/[scanId]` permalink — that route group is missing entirely. |
| `src/app/(protected)/onboarding/page.tsx` | ❌ DELETE | Pre-rethink 2-step business form. Replaced entirely by `/start` 9-phase state machine. |
| `src/app/(protected)/home/page.tsx` | 🟡 REWORK | Live data + correct tier names. Missing: Two-Tier state (Free Account vs Paid Customer). T112 requires account state detection and different render paths for free vs paid. Missing "Activate agents" CTA + sample data population (T113 F52). |
| `src/app/(protected)/inbox/page.tsx` | 🟡 REWORK | Live data. Needs: sample /inbox data seeder for Free Account state (T113). Otherwise architecture is sound. |
| `src/app/(protected)/workspace/[jobId]/page.tsx` | ✅ KEEP | Architecture correct. Minor: Brief grounding inline citation component (T85/F30) will need to be wired in when built. |
| `src/app/(protected)/scans/page.tsx` | ✅ KEEP | Architecture correct. |
| `src/app/(protected)/scans/[scanId]/page.tsx` | ✅ KEEP | Drilldown. Fine. |
| `src/app/(protected)/competitors/page.tsx` | ✅ KEEP | Competitors architecture is correct. |
| `src/app/(protected)/automation/page.tsx` | ✅ KEEP | Automation architecture is correct. |
| `src/app/(protected)/archive/page.tsx` | ✅ KEEP | Archive architecture is correct. |
| `src/app/(protected)/settings/page.tsx` | 🟡 REWORK | Lives. Needs: printable A4 ops card (F29), subscription pause (F38), competitor false-positive management (F39), data export (F34). These are build tasks, not cleanup. |
| `src/app/error.tsx` | 🟡 REWORK | Generic Next.js. T68 requires editorial error pages (cream paper register, specific copy). |
| `src/app/global-error.tsx` | 🟡 REWORK | Same as above. |
| `src/app/not-found.tsx` | 🟡 REWORK | Same as above. |
| `src/app/layout.tsx` | 🟡 REWORK | Only loads Inter. T60 adds variable Inter + subset Fraunces. T93 adds conditional Heebo on `[lang="he"]`. |

**New routes required (not yet created):**

| Route | Ticket | Purpose |
|---|---|---|
| `src/app/start/page.tsx` | T100 | Option E unified `/start` route — 9-phase state machine |
| `src/app/scan/[scanId]/page.tsx` | T111 | Public scan permalink with "Claim this scan" CTA |
| `src/app/(protected)/crew/page.tsx` | T1.6 | Agent crew page (F11) |
| `src/app/(protected)/reports/page.tsx` | T76 | Monthly Update archive (F37) |
| `src/app/trust/page.tsx` | T66 | Trust Center (F42) |
| `src/app/security/page.tsx` | T66 | Security page (F20) |
| `src/app/changelog/page.tsx` | T67 | Changelog (F44) |
| `src/app/status/route.ts` | T99 | Redirect to Better Stack |
| `src/app/(protected)/multi-client/page.tsx` | T139 | Agency cockpit (F48 MVP+30) |

### Components

| File | Status | Reason |
|---|---|---|
| `src/components/onboarding/OnboardingClient.tsx` | ❌ DELETE | 2-step pre-rethink form. Replaced by 9 phase components under `src/app/start/components/`. |
| `src/components/home/HomeClient.tsx` | ❌ DELETE | v1 home client superseded by HomeClientV2. Dead code. |
| `src/components/home/ActivityFeed.tsx` | ❌ DELETE | v1 activity feed superseded by ActivityFeedNew. Dead code. |
| `src/components/home/EngineBreakdown.tsx` | ❌ DELETE | Superseded by EngineBreakdownGrid. Dead code. |
| `src/components/home/KpiCardRow.tsx` | ❌ DELETE | Superseded by KpiStripNew. Dead code. |
| `src/components/home/NextStepsCard.tsx` | ❌ DELETE | Superseded by NextStepsSection. Dead code. |
| `src/components/home/HomeClientV2.tsx` | 🟡 REWORK | Good architecture. Needs: Two-Tier account state branch (F51/F52), Brief grounding citation wire-in (F30). |
| `src/components/home/KpiStripNew.tsx` | ✅ KEEP | |
| `src/components/home/EngineBreakdownGrid.tsx` | ✅ KEEP | |
| `src/components/home/ActivityFeedNew.tsx` | ✅ KEEP | |
| `src/components/home/NextStepsSection.tsx` | ✅ KEEP | |
| `src/components/home/SuggestionsFeed.tsx` | ✅ KEEP | |
| `src/components/home/ScoreHero.tsx` | ✅ KEEP | |
| `src/components/home/ProgressRing.tsx` | ✅ KEEP | |
| `src/components/home/TrendChart.tsx` | ✅ KEEP | |
| `src/components/home/RoadmapTab.tsx` | ✅ KEEP | |
| `src/components/scan/PreScanForm.tsx` | 🟡 REWORK | Reuse for `/start` Phase 0. Needs: globe icon left, 56px height per spec, auto-https prefix, mobile RTL rules. |
| `src/components/scan/ScanningAnimation.tsx` | 🟡 REWORK | References old percentage label containing `149`. Reuse concept, rebuild to Phase 1 spec (dots progress, agent monogram preview, cream paper). |
| `src/components/scan/WoundRevealResult.tsx` | 🟡 REWORK | Reuse concept for Phase 2. Must add: AI Visibility Cartogram (F22), 14-day guarantee footer, signup overlay dwell trigger. Currently no cartogram. |
| `src/components/scan/ExploreFirstModal.tsx` | ❌ DELETE | Pre-rethink "explore first" exit path. Option E eliminates this concept — `skip` sends scan PDF + enters nurture. |
| `src/components/inbox/InboxClient.tsx` | ✅ KEEP | |
| `src/components/inbox/ItemList.tsx` | ✅ KEEP | |
| `src/components/inbox/PreviewPane.tsx` | 🟡 REWORK | Needs Brief grounding inline citation (F30/T85) wired into preview. |
| `src/components/inbox/FilterRail.tsx` | ✅ KEEP | |
| `src/components/workspace/WorkspaceClient.tsx` | ✅ KEEP | |
| `src/components/workspace/WorkspaceEditor.tsx` | ✅ KEEP | |
| `src/components/workspace/WorkspaceSkeleton.tsx` | ✅ KEEP | |
| `src/components/paywall/TierCard.tsx` | 🟡 REWORK | Pricing is correct ($79/$189/$499). Scale has wrong engine count (old 9 vs current 11). Remove separate `/signup` links — upgrade path is now Paddle inline modal on `/home`. |
| `src/components/paywall/PaywallGate.tsx` | 🟡 REWORK | Concept kept. Must be rewired to new account state model (Free Account ≠ no subscription; it's brief-signed-but-no-paddle). |
| `src/components/paywall/PaywallModal.tsx` | 🟡 REWORK | Same as PaywallGate. |
| `src/components/layout/TrialBanner.tsx` | 🟡 REWORK | Two-tier banner split required (T96): Free Account amber banner vs Paid Customer blue indicator. Current single trial banner does not model this. |
| `src/components/shell/Sidebar.tsx` | 🟡 REWORK | Needs `/crew` and `/reports` nav items added when those routes exist. Needs account state context for free/paid visual distinction. |
| `src/components/shell/DashboardShell.tsx` | ✅ KEEP | |
| `src/components/shell/NotificationBell.tsx` | ✅ KEEP | |
| `src/components/shell/PlanBadge.tsx` | ✅ KEEP | |
| `src/components/competitors/` (all) | ✅ KEEP | Architecture matches PRD v5.1 F10. |
| `src/components/automation/` (all) | ✅ KEEP | Architecture matches PRD v5.1 F19 scope. |
| `src/components/archive/` (all) | ✅ KEEP | Architecture matches PRD v5.1 F6/inbox. |
| `src/components/settings/` (all) | ✅ KEEP | |
| `src/components/scans/` (all) | ✅ KEEP | |
| `src/components/ui/` (all 22 primitives) | ✅ KEEP | Radix-based. T62 will add Block primitive interfaces on top of these, not replacing them. |

### Constants + Lib

| File | Status | Reason |
|---|---|---|
| `src/constants/agents.ts` | 🟡 REWORK | Currently defines 11 primary agent types + aliases. PRD v5.1 F7 specifies 6 MVP agents: `query_mapper`, `content_optimizer`, `faq_builder`, `schema_generator`, `entity_builder`, `offsite_presence_builder`. `freshness_agent`, `review_presence_planner`, `authority_blog_strategist`, `performance_tracker`, `reddit_presence_planner` are not in the MVP-1 roster. Do not delete — legacy aliases may exist in DB rows. Mark non-MVP agents clearly in the type union as MVP-2 or deferred. |
| `src/constants/engines.ts` | 🟡 REWORK | Update to match F15: 11 engines total. Verify tier assignments: Discover (3), Build (7), Scale (11). |
| `src/lib/plan/features.ts` | 🟡 REWORK | Tier names are correct. Feature flags need alignment with PRD v5.1 feature matrix (e.g., `automation` is Build+, `competitors_page` is Build+). Add new flag: `multi_domain` for Scale tier (F40). |
| `src/lib/agents/security.ts` | ✅ KEEP | Pricing correct. Good defense layer. |
| `src/lib/agents/pipeline.ts` | ✅ KEEP | |
| `src/lib/agents/config.ts` | 🟡 REWORK | Agent registry must be trimmed to 6 MVP agents per PRD v5.1 F7. |
| `src/lib/agents/credit-guard.ts` | ✅ KEEP | |
| `src/lib/agents/daily-cap.ts` | ✅ KEEP | |
| `src/lib/agents/coordination.ts` | ✅ KEEP | |
| `src/lib/agents/types.ts` | ✅ KEEP | |
| `src/lib/agents/prompts/` (all 11 files) | 🟡 REWORK | Only keep 6 MVP prompts: `query_mapper`, `content_optimizer`, `faq_builder`, `schema_generator`, `entity_builder`, `offsite_presence_builder`. Archive non-MVP prompts to `src/lib/agents/prompts/_deferred/` — do not delete (they are reused at MVP-2). |
| `src/lib/llm/router.ts` | 🟡 REWORK | References `beamix.tech` in `HTTP-Referer` header. Update to `beamixai.com`. |
| `src/lib/llm/cost.ts` | ✅ KEEP | |
| `src/lib/resend/client.ts` | 🟡 REWORK | Default `FROM` email references `notify.beamix.tech`. Update to `notify.beamixai.com`. |
| `src/lib/resend/send.ts` | ✅ KEEP | |
| `src/lib/resend/templates/` (6 templates) | 🟡 REWORK | 6 of 18 required Resend templates exist (T146 requires all 18). Existing 6 need domain references updated: `beamix.tech` → `beamixai.com`. |
| `src/lib/supabase/client.ts` | ✅ KEEP | |
| `src/lib/supabase/server.ts` | ✅ KEEP | |
| `src/lib/supabase/middleware.ts` | ✅ KEEP | |
| `src/lib/supabase/service.ts` | ✅ KEEP | |
| `src/lib/scan/engines.ts` | 🟡 REWORK | See engines.ts note above. |
| `src/lib/scan/brand-extractor.ts` | ✅ KEEP | |
| `src/lib/scan/query-mapper.ts` | ✅ KEEP | |
| `src/lib/security/rate-limit.ts` | ✅ KEEP | |
| `src/lib/security/ssrf.ts` | ✅ KEEP | |
| `src/lib/seed/tester-demo.ts` | 🟡 REWORK | Extensive `beamix.tech` references (40+ occurrences). Replace all with `beamixai.com`. Also: this file is used by the tester-login API route. It represents Free Account sample data — good concept, but must align to Two-Tier model (T113 F52 sample data for Free Account /home). |
| `src/lib/notifications/insert.ts` | ✅ KEEP | |
| `src/lib/suggestions/rules.ts` | ✅ KEEP | |
| `src/lib/suggestions/write.ts` | ✅ KEEP | |
| `src/lib/types/database.types.ts` | 🟡 REWORK | Auto-generated from Supabase. Must be regenerated after each new migration. See §7 for new tables needed. |
| `src/lib/types/shared.ts` | 🟡 REWORK | Add `AccountState` type once `src/lib/account-state.ts` (T96) is built. |
| `src/lib/types/api.ts` | ✅ KEEP | |
| `src/lib/types/index.ts` | ✅ KEEP | |
| `src/lib/types/db-stubs.ts` | 🟡 REWORK | Review against current migrations; remove stubs that now exist in database.types.ts. |
| `src/lib/motion.ts` | 🟡 REWORK | T94 adds `--duration-phase-transition` and `--duration-seal-ceremony`. T58 adds 10 named easing curves. |
| `src/lib/utils.ts` | ✅ KEEP | |
| `src/lib/dates.ts` | ✅ KEEP | |

### Middleware

| File | Status | Reason |
|---|---|---|
| `src/middleware.ts` | 🟡 REWORK | Current logic gates protected routes and redirects to `/onboarding` if not completed. After Option E: (1) replace `/onboarding` redirect with `/start`; (2) add logic for `account_state`: unauthenticated → `/start`; authed Free Account → allow `/home` + `/inbox` but gate agent-run routes; authed Paid Customer → full access. Current matcher only covers `/(protected)/:path*` — needs to also protect `/start` partial-auth states. |

### Inngest Functions

| File | Status | Reason |
|---|---|---|
| `src/inngest/client.ts` | ✅ KEEP | |
| `src/inngest/events.ts` | 🟡 REWORK | Add new events for Option E flow: `start/phase.advanced`, `start/abandoned`, `brief/signed`, `brief/undo.requested`. |
| `src/inngest/functions/scan-run.ts` | 🟡 REWORK | Fix hardcoded `app.beamix.tech` fallback URL. Scale tier engine list is empty — extend to 11. |
| `src/inngest/functions/agent-pipeline.ts` | ✅ KEEP | Pricing correct. Trim to 6 MVP agents in config. |
| `src/inngest/functions/automation-dispatcher.ts` | ✅ KEEP | |
| `src/inngest/functions/budget-guard.ts` | 🟡 REWORK | Fix hardcoded `app.beamix.tech` URL. |
| `src/inngest/functions/daily-digest.ts` | 🟡 REWORK | Fix hardcoded `app.beamix.tech` URL. |
| `src/inngest/functions/scan-completed.ts` | ✅ KEEP | |
| `src/inngest/functions/url-probe.ts` | ✅ KEEP | |

**New Inngest functions required:**
- `src/inngest/functions/start-abandoned.ts` — Day-1/3/7/14 recovery email sequence (F53/T141)
- `src/inngest/functions/brief-undo.ts` — 10-minute undo window after Seal (F32)
- `src/inngest/functions/free-account-recovery.ts` — Day-N free account recovery (F53)

### Config Files

| File | Status | Reason |
|---|---|---|
| `apps/web/package.json` | 🟡 REWORK | Add `zustand`, `nanoid`. Possibly `@vercel/analytics` or Plausible client for T133 transparency page. |
| `apps/web/next.config.ts` | 🟡 REWORK | T60: add variable Inter, subset Fraunces. T93: add Heebo conditional load. |
| `apps/web/tailwind.config.ts` | 🟡 REWORK | T58: add 10 named easing curves. T96: add free/paid account token groups. T98: update focus ring to solid 2px. |
| `apps/web/tsconfig.json` | ✅ KEEP | Strict mode on. Fine. |
| `apps/web/eslint.config.mjs` | 🟡 REWORK | T59: add 3 custom ESLint rules. |
| `apps/web/.env.example` | 🟡 REWORK | T95: add `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`. Remove any `beamix.tech` defaults. Verify all 25 Vercel env vars from INFRA-STATE-COMPLETE.md are documented. |
| `apps/web/src/app/layout.tsx` | 🟡 REWORK | T60/T93 font additions. |

---

## §3 — The Clean-Slate Question

**Recommendation: Interpretation B — Surgical Reset.**

Reasons in priority order:

1. **Production is live.** `app.beamixai.com` is serving real users. A hard delete of `src/` would tear down the login page, `/home`, and the Inngest endpoint simultaneously. The Inngest registered functions would dereference. Paddle webhook at `/api/webhooks/paddle` would stop responding — any subscription creation during the blackout window would be lost silently.

2. **Infrastructure is correct and deep.** The Supabase client setup (`src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`, `service.ts`), Paddle webhook handler structure, Inngest client and serve endpoint, Resend client, Upstash rate limiter, SSRF guard, and cost circuit breaker are all properly wired. These took significant effort and are correct. Preserving them saves the build team from re-deriving non-trivial configuration.

3. **The `apps/web/` scaffold itself is valuable.** `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs` are all wired together with the correct versions (Next.js 16, React 19, TypeScript strict, Tailwind 4). Re-scaffolding risks dependency drift.

4. **The migrations are irreversible on production.** The Supabase DB has 14+ migrations applied. You cannot "delete src/" and undo the DB state. The codebase must be forward-compatible with the existing schema.

5. **The rethink was about features, not about infrastructure.** The 2026-04-15 product rethink changed the UX model (Option E), the Brief concept, Two-Tier activation, and the agent roster. It did not change the infrastructure decisions (Supabase, Paddle, Inngest, Resend, Vercel). Surgical reset targets exactly what changed.

**What "surgical" means in practice:**
- Delete 6 specific obsolete feature files (onboarding, old home variants, old scan components)
- Rework 30 files with targeted edits (mostly domain strings, feature flags, missing OAuth button)
- Build 40+ new files for features that do not exist yet (mostly Tier 0 and Tier 1 from Build Plan v3.1)
- The production deployment stays live throughout

---

## §4 — The Deletion List

These files must be deleted. Each deletion is safe — nothing else imports these files for active functionality.

### Pre-rethink onboarding flow (replaced by `/start`)

| File | Reason |
|---|---|
| `apps/web/src/app/(protected)/onboarding/page.tsx` | Pre-rethink 2-step business form. Option E replaces entirely. No imports to update — middleware currently redirects here but §5 covers that. |
| `apps/web/src/components/onboarding/OnboardingClient.tsx` | Component for the above. Only imported by onboarding/page.tsx. |
| `apps/web/src/app/api/onboarding/complete/route.ts` | Posts to `user_profiles.onboarding_completed_at` for old flow. Replaced by Phase 8 completion logic in `/start`. |

### Standalone `/signup` route (absorbed into `/start` Phase 3)

| File | Reason |
|---|---|
| `apps/web/src/app/(auth)/signup/page.tsx` | Standalone signup is replaced by `/start` Phase 3 `signup-overlay`. External links to `/signup` should be updated to `/start`. After Option E ships, redirect `/signup` → `/start` via `next.config.ts` permanent redirect rather than 404. |

### Dead v1 home components (superseded by v2 variants)

| File | Reason |
|---|---|
| `apps/web/src/components/home/HomeClient.tsx` | v1. Superseded by HomeClientV2. Not imported by any active route. |
| `apps/web/src/components/home/ActivityFeed.tsx` | v1. Superseded by ActivityFeedNew. |
| `apps/web/src/components/home/EngineBreakdown.tsx` | Superseded by EngineBreakdownGrid. |
| `apps/web/src/components/home/KpiCardRow.tsx` | Superseded by KpiStripNew. |
| `apps/web/src/components/home/NextStepsCard.tsx` | Superseded by NextStepsSection. |

### Removed scan component

| File | Reason |
|---|---|
| `apps/web/src/components/scan/ExploreFirstModal.tsx` | "Explore first without signing up" exit path. Option E eliminates this — the exit is "Skip, email me my scan" which enters a Resend nurture sequence, not a modal gate. |

**Verify before each deletion:** `grep -r "FileName" apps/web/src --include="*.ts" --include="*.tsx"` to confirm zero active imports.

---

## §5 — The "Keep with Edits" List

### Domain string replacement (mechanical — all in one PR)

These files contain `beamix.tech` that must become `beamixai.com`. This is safe string replacement with no logic change.

| File | Occurrences |
|---|---|
| `apps/web/src/app/api/webhooks/paddle/route.ts` | 1 (fallback APP_BASE_URL) |
| `apps/web/src/app/api/auth/tester-login/route.ts` | 1 (tester email default) |
| `apps/web/src/app/(auth)/layout.tsx` | 3 (href + "Back to beamix.tech" copy) |
| `apps/web/src/app/(auth)/signup/page.tsx` | 2 (terms + privacy links) — moot if file is deleted |
| `apps/web/src/inngest/functions/scan-run.ts` | 1 (baseUrl fallback) |
| `apps/web/src/inngest/functions/daily-digest.ts` | 1 (APP_BASE_URL fallback) |
| `apps/web/src/inngest/functions/budget-guard.ts` | 1 (baseUrl fallback) |
| `apps/web/src/lib/llm/router.ts` | 1 (HTTP-Referer) |
| `apps/web/src/lib/resend/client.ts` | 1 (FROM email fallback) |
| `apps/web/src/lib/seed/tester-demo.ts` | 40+ (all demo URLs — update to `beamixai.com`) |

**Correct pattern for all fallbacks:** `process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://app.beamixai.com'`

### Infrastructure files to keep + edit

| File | Edit required |
|---|---|
| `apps/web/src/middleware.ts` | Replace `/onboarding` redirect target with `/start`. Add account-state logic for Two-Tier model (T112). Update matcher to also cover `/start` partial-auth states. |
| `apps/web/src/app/(auth)/login/page.tsx` | Add Google OAuth primary CTA per T95. Reposition email+password as secondary ("Or use email"). Wire `supabase.auth.signInWithOAuth({ provider: 'google' })`. |
| `apps/web/src/app/(auth)/layout.tsx` | Update 3 `beamix.tech` links to `beamixai.com`. |
| `apps/web/src/app/page.tsx` | Update root redirect logic: unauthenticated → `/start`; authed → `/home`. |
| `apps/web/src/lib/supabase/client.ts` | Keep as-is. |
| `apps/web/src/lib/supabase/server.ts` | Keep as-is. |
| `apps/web/src/lib/supabase/middleware.ts` | Keep as-is. |
| `apps/web/src/lib/supabase/service.ts` | Keep as-is. |
| `apps/web/src/app/api/webhooks/paddle/route.ts` | Fix `beamix.tech` fallback. No other logic change. |
| `apps/web/src/app/layout.tsx` | Add variable Inter (T60) + conditional Heebo (T93) + subset Fraunces (T60). |
| `apps/web/tailwind.config.ts` | T58: 10 named easing curves. T96: account state tokens. T98: focus ring. |
| `apps/web/next.config.ts` | T60/T93 font strategy. Add `/signup` → `/start` permanent redirect. |
| `apps/web/package.json` | Add `zustand`, `nanoid`. |
| `apps/web/.env.example` | Add Google OAuth vars. Update domain references. |
| `apps/web/src/constants/engines.ts` | Match F15: 11 engines, correct tier assignments. |
| `apps/web/src/lib/plan/features.ts` | Add `multi_domain` flag, align feature matrix to v5.1. |
| `apps/web/src/inngest/events.ts` | Add Option E events. |
| `apps/web/src/lib/agents/config.ts` | Trim to 6 MVP agents. |
| `apps/web/src/lib/agents/prompts/` | Move 5 non-MVP prompts to `_deferred/` subdirectory. |
| `apps/web/src/lib/resend/client.ts` | Fix domain fallback. |
| `apps/web/src/lib/resend/templates/*.ts` | Fix domain references in all 6 existing templates. |
| `apps/web/src/lib/seed/tester-demo.ts` | Replace all 40+ `beamix.tech` URLs with `beamixai.com`. |
| `apps/web/src/lib/llm/router.ts` | Fix HTTP-Referer header. |

### Database migrations to keep

All existing migrations in `apps/web/supabase/migrations/` are kept. The cleanup scripts in `apps/web/supabase/cleanup/` (`0001–0004_*.sql`) have not been applied to production — review each before applying.

---

## §6 — The "Build From Scratch" List

Ordered by Build Plan v3.1 tier. All paths are relative to `apps/web/`.

### Tier 0 — Foundation (prerequisites for everything)

| Ticket | What to build | Key files |
|---|---|---|
| T58 | 10 named easing curves | `src/styles/motion.css` (or `tailwind.config.ts`) |
| T59 | 3 ESLint custom rules | `eslint.config.mjs`, `src/lib/eslint/` |
| T60 | Variable Inter + subset Fraunces | `next.config.ts`, `src/app/layout.tsx`, `src/styles/typography.css` |
| T61 | Status vocabulary lock | `src/lib/types/status.ts` |
| T62 | Block primitive TypeScript interfaces | `src/lib/types/block.ts` |
| T63 | Speed CI gate (Lighthouse) | `.github/workflows/perf-ci.yml` |
| T64 | security.txt | `src/app/.well-known/security.txt/route.ts` |
| T65 | Dark mode tokens | `src/styles/tokens.css` |
| T93 | Heebo 300 italic conditional | `next.config.ts`, `src/app/layout.tsx`, `src/styles/typography.css` |
| T94 | Phase-transition motion canon | `src/styles/motion.css` |
| T95 | Google OAuth primary signup | `src/app/auth/callback/route.ts`, login + start signup overlay |
| T96 | Two-tier UI state tokens | `src/styles/tokens.css`, `src/lib/account-state.ts` |
| T97 | handle_new_user smoke test | `scripts/smoke-test-signup-trigger.ts`, `.github/workflows/deploy-smoke-test.yml` |
| T98 | WCAG 2.1 AA contrast fixes | `src/styles/tokens.css`, `src/styles/global.css` |
| T99 | Status page redirect | `src/app/status/route.ts` |
| T135 | Sentry config | `sentry.client.config.ts`, `sentry.server.config.ts`, `instrumentation.ts` |
| T136 | Structured logging | `src/lib/logger.ts` |
| T137 | Playwright + Lighthouse CI | `playwright.config.ts`, `tests/`, `.github/workflows/` |
| T140 | State of AI Search instrumentation | `src/lib/analytics/state-of-search.ts` |

### Tier 1 — Critical-Path Acquisition + Activation

| Ticket | What to build | Key files |
|---|---|---|
| T100 | `/start` route + Zustand state machine | `src/app/start/page.tsx`, `src/lib/start/store.ts` |
| T101 | Phase 0 `enter-url` component | `src/app/start/components/PhaseEnterUrl.tsx` |
| T102 | Phase 1 `scanning` component | `src/app/start/components/PhaseScanning.tsx` |
| T103 | Phase 2 `results` component | `src/app/start/components/PhaseResults.tsx` |
| T104 | Phase 3 `signup-overlay` component | `src/app/start/components/PhaseSignupOverlay.tsx` |
| T105 | Phase 4 `vertical-confirm` component | `src/app/start/components/PhaseVerticalConfirm.tsx` |
| T106 | Phase 5 `brief-co-author` component | `src/app/start/components/PhaseBriefCoAuthor.tsx` |
| T107 | Phase 6 `brief-signing` + Seal ceremony | `src/app/start/components/PhaseBriefSigning.tsx`, `src/components/brief/SealStamp.tsx` |
| T108 | Phase 7 `truth-file` component | `src/app/start/components/PhaseTruthFile.tsx` |
| T109 | Phase 8 `complete` component | `src/app/start/components/PhaseComplete.tsx` |
| T110 | Cross-phase animation orchestration | `src/app/start/components/PhaseTransitionWrapper.tsx` |
| T111 | `/scan/[scanId]` permalink + "Claim this scan" CTA | `src/app/scan/[scanId]/page.tsx` |
| T1.1 | Auth callback route (Google OAuth) | `src/app/auth/callback/route.ts` |
| T1.2 | Brief co-author API (Claude pre-fill) | `src/app/api/brief/prefill/route.ts` |
| T1.3 | Truth File API | `src/app/api/truth-file/route.ts` |
| T66 | Trust Center route group | `src/app/trust/page.tsx`, `src/app/trust/layout.tsx` |
| T67 | `/changelog` route | `src/app/changelog/page.tsx` |
| T68 | Editorial error pages (404/500/maintenance) | `src/app/not-found.tsx` (rework), `src/app/error.tsx` (rework), `src/app/maintenance/page.tsx` |
| T69 | Cmd-K command bar | `src/components/shell/CommandBar.tsx` |
| T70 | Slash command palette | `src/components/shell/SlashPalette.tsx` |
| T119 | Pre-fill claims API (vertical-aware) | `src/app/api/start/prefill/route.ts` |
| T120 | Vertical-conditional hours/service-area field hide | Part of T108 PhaseTruthFile |

### Tier 2 — Conversion + Billing Activation

| Ticket | What to build | Key files |
|---|---|---|
| T112 | Two-tier activation states on `/home` | `src/components/home/FreeAccountBanner.tsx`, `src/components/home/PaidActivationBanner.tsx` |
| T113 | Free Account sample /inbox populator | `src/app/api/start/sample-data/route.ts`, update `src/lib/seed/tester-demo.ts` |
| T114 | Paddle inline modal on `/home` | `src/components/billing/PaddleInlineModal.tsx` |
| T115 | Agent-run cap for Free Account (F54) | `src/lib/agents/free-account-cap.ts` |
| T116 | Money-back guarantee copy split (14d/30d) | Part of PaywallModal + /start Phase 2 footer |
| T117 | Activation event definition (Paddle checkout = Day 0) | `src/lib/billing/activation.ts` |
| T118 | Trial clock update (starts at Paddle, not signup) | Update billing webhook handler |

### Tier 3 — Onboarding Audit Fixes

| Ticket | What to build |
|---|---|
| T121 | Skip cinema (Phase 1 skip link) — part of T102 |
| T122 | "Coming soon" engine reframe for unavailable engines |
| T123 | Guarantee surfacing in Phase 2 footer |
| T124 | Dual-tab lock (prevent opening /start in two tabs) |
| T125 | Pre-Seal consistency check (Brief clauses must be non-empty) |
| T126 | Orphan Twilio number cleanup job |
| T127 | Mobile typography fix (16px minimum tap targets) |
| T128 | Reduced-motion coverage for all phases |

### Tier 3 — Core Product Features

| Ticket | What to build | Key files |
|---|---|---|
| T71 | F3 Truth File page on `/settings` | `src/components/settings/TruthFileTab.tsx` |
| T72 | F7 Agent cards on `/crew` | `src/app/(protected)/crew/page.tsx`, `src/components/crew/` |
| T73 | F8 Workspace Brief citation wire-in | Update `src/components/workspace/PreviewPane.tsx` |
| T74 | F9 Manual scan trigger on `/scans` | Update scan page |
| T75 | F12 Lead Attribution Loop (Twilio + UTM) | `src/lib/attribution/`, multiple API routes |
| T76 | F37 `/reports` Monthly Update archive | `src/app/(protected)/reports/page.tsx` |
| T85 | F30 Brief grounding inline citation component | `src/components/brief/BriefCitation.tsx` |
| T86 | F31 Brief binding line (footer every page) | `src/components/brief/BriefBindingLine.tsx` |

### Tier 4 — Intelligence + Email Infrastructure

| Ticket | What to build |
|---|---|
| T141 | F55 Pre-Brief recovery email sequence (Day 1/3/7/14) — Inngest functions + Resend templates |
| T142 | F14 18 Resend email templates (12 remaining after existing 6) |
| T143 | F15 11-engine scan architecture (extend scan-run.ts for Scale) |
| T144 | F16 Vertical knowledge graph data model |
| T145 | F22 AI Visibility Cartogram (CSS Grid 14×12px cells) — `src/components/scan/VisibilityCartogram.tsx` |
| T146 | All 18 Resend templates complete |
| T147 | F47 State of AI Search data instrumentation complete |

---

## §7 — Database Migration Plan

### Tables verified present (from migrations + Supabase MCP confirmation)

- `users` (via Supabase auth.users)
- `user_profiles`
- `businesses`
- `subscriptions`
- `plans`
- `scans`
- `scan_engine_results`
- `tracked_queries`
- `query_runs`
- `agent_jobs`
- `content_items`
- `content_versions`
- `credit_pools`
- `credit_transactions`
- `suggestions`
- `competitors`
- `automation_configs`
- `automation_settings`
- `url_probes`
- `daily_cap_usage`
- `notifications`
- `notification_preferences`
- `citation_sources`

### Tables required by PRD v5.1 — create if missing

Run `mcp__supabase__list_tables` before applying each migration to verify absence.

**Migration 1 — Brief architecture (F3/F6/F24/F30)**

```sql
-- briefs: The founding Brief document per account
CREATE TABLE IF NOT EXISTS public.briefs (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id      uuid        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  clauses          jsonb       NOT NULL DEFAULT '[]',  -- array of {id, text, source}
  signed_at        timestamptz,
  undo_window_ends timestamptz,
  version          integer     NOT NULL DEFAULT 1,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own briefs" ON public.briefs FOR ALL USING (user_id = auth.uid());

-- brief_versions: Immutable history of every signed Brief
CREATE TABLE IF NOT EXISTS public.brief_versions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id   uuid        NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  version    integer     NOT NULL,
  clauses    jsonb       NOT NULL,
  signed_at  timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.brief_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own brief versions" ON public.brief_versions
  FOR SELECT USING (
    brief_id IN (SELECT id FROM public.briefs WHERE user_id = auth.uid())
  );

-- brief_quarterly_reviews: F24 quarterly re-reading trigger
CREATE TABLE IF NOT EXISTS public.brief_quarterly_reviews (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id      uuid        NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_at   timestamptz,
  due_at        timestamptz NOT NULL,
  status        text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'snoozed')),
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE public.brief_quarterly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own reviews" ON public.brief_quarterly_reviews FOR ALL USING (user_id = auth.uid());
```

**Migration 2 — Truth File (F3)**

```sql
CREATE TABLE IF NOT EXISTS public.truth_files (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id  uuid        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  brief_id     uuid        REFERENCES public.briefs(id) ON DELETE SET NULL,
  fields       jsonb       NOT NULL DEFAULT '{}',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);
ALTER TABLE public.truth_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own truth files" ON public.truth_files FOR ALL USING (user_id = auth.uid());
```

**Migration 3 — Lead Attribution (F12)**

```sql
-- attribution_urls: UTM-tracked landing pages
CREATE TABLE IF NOT EXISTS public.attribution_urls (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid        REFERENCES public.businesses(id) ON DELETE SET NULL,
  url         text        NOT NULL,
  utm_source  text,
  utm_medium  text,
  utm_campaign text,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.attribution_urls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own attribution URLs" ON public.attribution_urls FOR ALL USING (user_id = auth.uid());

-- attribution_events: Click/call events linked to a URL
CREATE TABLE IF NOT EXISTS public.attribution_events (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  attribution_url_id  uuid        REFERENCES public.attribution_urls(id) ON DELETE SET NULL,
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type          text        NOT NULL CHECK (event_type IN ('page_view', 'phone_call', 'form_submit')),
  metadata            jsonb       DEFAULT '{}',
  occurred_at         timestamptz DEFAULT now()
);
ALTER TABLE public.attribution_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own events" ON public.attribution_events FOR ALL USING (user_id = auth.uid());

-- twilio_numbers: Tracked call-forwarding numbers per user
CREATE TABLE IF NOT EXISTS public.twilio_numbers (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id  uuid        REFERENCES public.businesses(id) ON DELETE SET NULL,
  phone_number text        NOT NULL,
  forward_to   text        NOT NULL,
  status       text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'orphaned')),
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE public.twilio_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own numbers" ON public.twilio_numbers FOR ALL USING (user_id = auth.uid());
```

**Migration 4 — Team Seats (F33)**

```sql
CREATE TABLE IF NOT EXISTS public.account_members (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- owner
  member_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text        NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  invited_at  timestamptz DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(account_id, member_id)
);
ALTER TABLE public.account_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Account owners manage members" ON public.account_members FOR ALL
  USING (account_id = auth.uid() OR member_id = auth.uid());
```

**Migration 5 — F47 State of AI Search data**

```sql
CREATE TABLE IF NOT EXISTS public.engine_consistency_metrics (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id     uuid        REFERENCES public.scans(id) ON DELETE CASCADE,
  engine      text        NOT NULL,
  consistency_score numeric(5,2),
  measured_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vertical_citation_patterns (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical    text        NOT NULL,
  engine      text        NOT NULL,
  pattern     jsonb       NOT NULL DEFAULT '{}',
  sample_size integer,
  measured_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cohort_visibility_decay (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_month date        NOT NULL,
  vertical     text,
  score_p50    numeric(5,2),
  score_p25    numeric(5,2),
  score_p75    numeric(5,2),
  sample_size  integer,
  measured_at  timestamptz DEFAULT now()
);
```

**Migration 6 — account_state column on user_profiles**

```sql
-- Verify column doesn't already exist before running
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS account_state text NOT NULL DEFAULT 'free'
    CHECK (account_state IN ('free', 'paid', 'paused', 'cancelled'));

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS start_phase text DEFAULT NULL;  -- last completed /start phase

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS state_of_search_eligible boolean DEFAULT false;
```

**Regenerate database.types.ts after each migration:**

```bash
pnpm supabase gen types typescript --project-id [your-project-id] > apps/web/src/lib/types/database.types.ts
```

---

## §8 — The Cleanup Execution Sequence

All steps are atomic. Each step is a separate commit or PR. Smoke test between each.

### Step 1 — Snapshot

```bash
git tag mvp-cleanup-snapshot-2026-05-05
git push origin mvp-cleanup-snapshot-2026-05-05
```

**Purpose:** Safe rollback point before any deletion. Tag is permanent; deletion of the worktree or branch cannot lose this.

### Step 2 — Smoke test production before touching anything

Verify live:
- `https://app.beamixai.com/api/health` → HTTP 200 JSON
- `https://app.beamixai.com/api/inngest` → HTTP 200 JSON (Inngest functions registered)
- `https://app.beamixai.com/login` → renders login form
- `https://app.beamixai.com/home` → redirects to login if unauthenticated

If any fail: stop and investigate before proceeding.

### Step 3 — Domain string replacement (PR: `fix/retire-beamix-tech-domain`)

One PR. Mechanically replace all `beamix.tech` occurrences in the 10 files listed in §5. No logic changes.

Files touched: `paddle/route.ts`, `tester-login/route.ts`, `(auth)/layout.tsx`, `scan-run.ts`, `daily-digest.ts`, `budget-guard.ts`, `llm/router.ts`, `resend/client.ts`, `tester-demo.ts`.

Smoke test after merge.

### Step 4 — Delete pre-rethink onboarding (PR: `cleanup/delete-pre-rethink-onboarding`)

Delete 3 files:
- `apps/web/src/app/(protected)/onboarding/page.tsx`
- `apps/web/src/components/onboarding/OnboardingClient.tsx`
- `apps/web/src/app/api/onboarding/complete/route.ts`

Simultaneously update `apps/web/src/middleware.ts` to remove the `/onboarding` redirect target (for now, remove the redirect entirely — the `/start` route does not exist yet so the middleware should not redirect to a non-existent route).

Smoke test: login → `/home` should work. No 404 on `/home`.

### Step 5 — Delete standalone `/signup` route (PR: `cleanup/delete-standalone-signup`)

Delete `apps/web/src/app/(auth)/signup/page.tsx`.

Add permanent redirect in `apps/web/next.config.ts`:
```js
redirects: async () => [
  { source: '/signup', destination: '/start', permanent: true },
  { source: '/onboarding', destination: '/start', permanent: true },
]
```

Smoke test: `/signup` → 301 → `/start` (which 404s until T100 — that is acceptable).

### Step 6 — Delete dead home component variants (PR: `cleanup/delete-v1-home-components`)

Delete 5 files:
- `apps/web/src/components/home/HomeClient.tsx`
- `apps/web/src/components/home/ActivityFeed.tsx`
- `apps/web/src/components/home/EngineBreakdown.tsx`
- `apps/web/src/components/home/KpiCardRow.tsx`
- `apps/web/src/components/home/NextStepsCard.tsx`

Run `pnpm typecheck` before and after to confirm zero import errors.

Smoke test: `/home` renders correctly.

### Step 7 — Delete ExploreFirstModal (PR: `cleanup/delete-explore-first-modal`)

Delete `apps/web/src/components/scan/ExploreFirstModal.tsx`.

Run `pnpm typecheck`. Confirm no imports.

### Step 8 — Agent prompts: move non-MVP to deferred (PR: `cleanup/defer-non-mvp-agent-prompts`)

Create `apps/web/src/lib/agents/prompts/_deferred/` directory.

Move to `_deferred/`:
- `freshness_agent.ts`
- `review_presence_planner.ts`
- `authority_blog_strategist.ts`
- `performance_tracker.ts`
- `reddit_presence_planner.ts`

Update `apps/web/src/lib/agents/config.ts` to only register 6 MVP agents.

Run `pnpm typecheck`.

### Step 9 — Database migrations for new tables

Apply in order to staging first via Supabase SQL Editor:
1. Migration 1 (briefs, brief_versions, brief_quarterly_reviews)
2. Migration 2 (truth_files)
3. Migration 3 (attribution_urls, attribution_events, twilio_numbers)
4. Migration 4 (account_members)
5. Migration 5 (engine_consistency_metrics, vertical_citation_patterns, cohort_visibility_decay)
6. Migration 6 (account_state column on user_profiles)

After each: run `pnpm supabase gen types` and commit updated `database.types.ts`.

Apply cleanup scripts in `apps/web/supabase/cleanup/` only after confirming the tables they drop are not referenced in any active code.

### Step 10 — Tier 0 build dispatch (T58–T99)

Begin dispatching Build Lead for Tier 0 tickets. Each ticket is a separate worker + worktree + PR. No dependencies on cleanup being complete, except:
- T95 (Google OAuth) requires cleanup Steps 4+5 complete first (no redirect to old onboarding)
- T97 (smoke test) requires GitHub Actions configured

### Step 11 — Tier 1 build dispatch (T100–T120)

After all Tier 0 gates pass:
- T100 (state machine) + T101–T109 (phases) can be dispatched in parallel to separate workers
- T111 (`/scan/[scanId]`) depends on T100
- T66–T70 (Trust Center, changelog, Cmd-K) can run in parallel with T100–T109

### Step 12 — Tier 2 build dispatch (T112–T118)

After T100–T109 complete and `/start` flow is functional end-to-end.

---

## §9 — Risk Register

### Risk 1 — Live Paddle webhook stops responding during cleanup

**Severity:** Critical  
**Trigger:** Any change to `apps/web/src/app/api/webhooks/paddle/route.ts` that introduces a runtime error during cleanup.  
**Mitigation:** The domain string change in this file (Step 3) is a single-line constant change. Run `pnpm typecheck` before pushing. Deploy to a Preview branch first and verify the Inngest + Paddle webhook endpoints return 200 on the Preview URL before merging to main. Paddle will retry failed webhook events for 72 hours — short disruptions are recoverable.

### Risk 2 — Middleware regression locks users out of `/home`

**Severity:** High  
**Trigger:** Step 4 (deleting onboarding redirect from middleware) could cause authenticated users with `onboarding_completed_at = null` (users who skipped old onboarding) to enter an unexpected state.  
**Mitigation:** After removing the `/onboarding` redirect, the middleware should simply allow all authenticated users through to their destination. The `/start` route redirect replaces the gate — but `/start` does not exist yet in Steps 4–9. The safe interim state is: authenticated users reach `/home` regardless of `onboarding_completed_at`. This is correct — the old field is being retired in favor of `account_state`. Update middleware in Step 4 to remove all `onboarding_completed_at` checks and replace with passthrough until T100 ships.

### Risk 3 — TypeScript errors after deletions break the build

**Severity:** Medium  
**Trigger:** A component or API route silently imports a deleted file.  
**Mitigation:** Before each deletion PR: run `grep -r "ComponentName\|fileName" apps/web/src --include="*.ts" --include="*.tsx"` to confirm zero active imports. Run `pnpm typecheck` in the PR's CI check. The `pnpm build` CI gate (T63) must be in place by Step 10 — consider adding a simple `pnpm typecheck` CI gate even in the cleanup phase.

### Risk 4 — Database migration ordering causes schema drift in production

**Severity:** High  
**Trigger:** Applying migrations out of order, or applying cleanup/ drop scripts before confirming no active code references those tables.  
**Mitigation:** Always apply to staging first and run `pnpm typecheck` against the newly generated `database.types.ts`. Use `IF NOT EXISTS` in all CREATE TABLE statements. Never drop a table without first searching for its name in `src/`. Apply cleanup/ scripts last, not first.

### Risk 5 — `zustand` not added before T100 dispatch

**Severity:** Medium  
**Trigger:** Build Lead dispatches T100 worker without `zustand` in `package.json`. Worker adds it; Turborepo lock file diverges; deployment fails on Vercel.  
**Mitigation:** `package.json` update (adding `zustand` and `nanoid`) must be part of Step 3 or an explicit PR before T100 is dispatched. Add to the Step 3 PR as a single additional change.

---

## §10 — Adam-Decision Needed

The following four decisions must be confirmed before cleanup begins. Build Lead cannot proceed without them.

**Decision 1: Hard reset vs surgical?**

This plan recommends Interpretation B (surgical). Confirm: "Proceed with surgical reset per §3 recommendation." If Adam wants hard reset instead, this entire plan is superseded — Build Lead would delete `apps/web/src/` entirely, re-scaffold with `create-next-app`, and begin from Tier 0 with zero existing code. Hard reset means the login page goes down until it is rebuilt — estimated 2-3 worker cycles.

**Decision 2: Tag the snapshot?**

Confirm: "Tag `mvp-cleanup-snapshot-2026-05-05` on the current HEAD before any deletion." This is reversible cost-free insurance. Recommended.

**Decision 3: Should `_archive/saas-platform-2026-04-legacy/` be deleted from the repo?**

It is currently 100% reference-only. It does not affect builds or deploys (not included in Turborepo workspace). Options:
- A: Keep it in the repo (no action needed)
- B: Delete it in a single PR (`git rm -r _archive/saas-platform-2026-04-legacy/`) — removes it from repo history on future clones but preserves in git history

The legacy folder is ~large and increases clone time. Recommended: delete. But Adam decides.

**Decision 4: Block main branch deploys during active cleanup PRs?**

During Steps 3–9, multiple PRs are merging to main in quick succession. Each merge triggers a Vercel deploy. Options:
- A: Accept the risk — each PR is independently smoke-tested before merge, so incremental deploys are safe
- B: Temporarily disable auto-deploy on Vercel and batch the cleanup PRs into one deploy

Recommended: Option A (accept risk with per-PR smoke testing). Option B delays getting to Tier 0 build faster.

---

*Plan expires when Build Plan v4 is issued (if any). Until then: this is the executable contract.*

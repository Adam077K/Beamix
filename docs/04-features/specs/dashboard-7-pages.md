# Dashboard — 7 Pages Deep Spec
Date: 2026-04-14 · Owner: Product Lead · Status: SPEC — ready for design-lead + build-lead
Pricing: Discover $79 · Build $199 · Scale $499. Soft page caps: 4/10/20. Blog Strategist gated off Discover.

---

## Global Conventions (apply to all 7 pages)

- **Layout:** left sidebar (collapsible) + top bar (org switcher, search, bell, avatar) + main. Sidebar order: Home · Inbox (badge) · Scans · Automation · Archive · Competitors · Settings.
- **Preview mode:** `preview = user.has_active_subscription === false`. Real scan data visible on Home, Scans, Competitors (top 3 only). All actions (Accept suggestion, Approve, Schedule, Run scan, Export) trigger `<PaywallModal reason="...">`. Blurred cards: Inbox items past item #1, Automation schedule editor, Archive (empty), Settings billing.
- **Keyboard shortcuts:** `g h/i/s/a/r/c/,` jump to page. `?` opens shortcut sheet. `j/k` list nav. `e` approve. `x` reject. `/` search.
- **Toast system:** success (green), warn (amber — used for cap approaches), error (red), info (blue).
- **Notification taxonomy:** `suggestion.new`, `draft.ready`, `item.approved`, `scan.complete`, `score.moved`, `cap.warning_80pct`, `cap.hit`, `competitor.moved`, `billing.failed`. Emitted to `notifications` table + optional email per prefs.
- **Tier gating component:** `<TierGate require="build">` — locks UI with inline upgrade CTA. Preserves discoverability.

---

## 1. HOME — Suggestions Feed + Score + Automation Status

**Purpose:** 90-second Monday check-in. User sees the trajectory, what the agents propose, and that automation is alive.

### Data Model
| Element | Source | Refresh |
|---|---|---|
| Hero Visibility Score (0–100) | `scan_engine_results` aggregated across last scan | On scan complete |
| Score sparkline (8 weeks) | `scans` history | Cache 5 min |
| Suggestions feed (max 6 cards) | `suggestions` table (new — `id, user_id, agent_type, title, evidence_ref, impact_score, status [new/accepted/dismissed/expired], expires_at, created_at`) | Real-time via SWR 60s |
| Automation status pill | `automation_config.enabled` + `scheduled_runs.next_run_at` | Cache 60s |
| Recent activity (last 5) | `agent_jobs` + `inbox_items` events | Cache 60s |

**Stale/expiry:** Suggestions auto-expire 14 days after creation (status=expired, hidden from feed). Max 6 shown; overflow accessed via "See all suggestions" linking to Inbox filter.

### Primary Actions
- **Accept suggestion** → creates `agent_job` in queued, moves card to "Running" state on same page, generates Inbox item when complete.
- **Dismiss suggestion** (with optional reason: not relevant / already done / later) → suggestion.status=dismissed, informs ranking.
- **Open evidence** → side drawer with the scan query + engine citation that triggered the suggestion.
- **Quick-run** keyboard: `a` accept focused card, `x` dismiss.

### Secondary Actions
- Filter suggestions by agent-type chips (Content Optimizer, FAQ, Schema, etc.).
- Toggle score chart: 8w / 13w / all.
- "What moved?" link on score card → Scans page drilldown on the last diff.

### Suggestion Card Anatomy
`[Agent icon] [Title e.g. "Refresh homepage with 2025 stats"] [Engine impact badges: GPT, Gemini] [Impact: +3 score est.] [Effort: ~2 min review] [Evidence link] [Accept] [Dismiss]`

### States
- **Loading:** skeleton rows.
- **Empty (post-scan, no suggestions yet):** "Scan complete — agents drafting suggestions. Check back in ~3 min." with live spinner.
- **Cold start week 1–2 (score unchanged):** Score card shows "Baseline week" badge, copy: "First lift appears in 3–4 weeks on Perplexity/Gemini, 4–8 weeks on ChatGPT." Replaces delta with expected-lift timeline.
- **Over cap:** cap banner (see Automation).
- **Error:** "Couldn't load — retry" non-destructive.

### Tier Differences
| | Discover | Build | Scale |
|---|---|---|---|
| Suggestions/day | up to 3 | up to 6 | up to 6 + priority |
| Score history | 4 weeks | 13 weeks | unlimited |
| Engine breakdown on hero | 3 engines | 5 | 9+ |
| Blog Strategist cards | hidden | shown | shown |

### Preview Mode
Real score + real top 3 suggestions visible. Accept button → paywall with "Unlock agents to run this suggestion." 4th+ suggestion cards blurred with lock icon.

### Mobile
Score hero collapses to single row. Suggestions become full-width cards, swipe-left to dismiss, swipe-right to accept (confirmation bottom sheet).

### Key Journeys
1. **Avi Monday 9am:** opens Home, score 42→44, accepts 2 suggestions (`a a`), jumps to Inbox (`g i`), approves 1 draft. 78 seconds.
2. **Yael first-time post-payment:** sees baseline-week card, reads expected-lift copy, accepts all 3 suggestions to "kickstart". Sets expectation correctly.
3. **Avi seeing stalled score:** clicks "What moved?" → routed to Scans diff → sees competitor moved up on 2 queries → clicks through to Competitors.

### Success Metrics
- Suggestion accept rate ≥ 35%
- Weekly active visit rate ≥ 3 sessions/week
- Median time on Home ≤ 90s (efficiency signal, not engagement)

### Paywall Moments
Accept, See-all-suggestions (>6), extend history beyond tier.

### Notifications Generated
`suggestion.new` (batched daily digest email), `score.moved` (only on ±3 move).

---

## 2. INBOX — Central Content Hub (Review Queue)

**Purpose:** The only place approved/rejected decisions happen. Feels like Gmail + Linear.

### Data Model
| Element | Source | Refresh |
|---|---|---|
| Inbox items | `inbox_items` (new — `id, agent_job_id, agent_type, title, body_md, output_format, status [draft/in_review/approved/rejected/needs_revision], evidence, created_at, updated_at, approved_at`) | SWR 30s + realtime channel |
| Evidence panel | join `scan_engine_results` + `suggestions` | Per-item lazy load |
| Edit history | `inbox_item_revisions` | On-demand |

### Layout — 3-Pane
Left: filter rail (All · Needs Review · Approved Today · Rejected · By Agent). Middle: list (subject, agent icon, age, status). Right: detail pane with tabs [Draft · Evidence · History].

### Primary Actions
- **Approve** (`e`) → moves item to Archive, status=approved, emits `item.approved`. If item came from one-off suggestion → credits confirmed now. If scheduled run → credits already confirmed at draft.
- **Reject** (`x`) with reason dropdown (off-brand / wrong facts / low quality / other + text) → feedback logged to `agent_feedback` for prompt tuning. Status=rejected.
- **Request revision** → opens agent chat with user note, new draft replaces previous (revision count tracked).
- **Edit inline** — two editors based on agent type:
  - **Markdown editor (default, all agents):** textarea with live preview, save draft.
  - **Inline chat editor (Content Refresher only):** user selects text → floating toolbar "Rewrite with chat" → side chat prompts Claude to rewrite just the selection. Select→rewrite→preserve surrounding markdown.
- **Bulk actions** (checkboxes): approve all · reject all · move to folder.

### Secondary Actions
- Filter by agent-type, date, status.
- Search across title + body (`/`).
- View toggles: list / card / split.
- Sort: newest, impact-score, agent.

### States
- **Empty:** "No drafts yet. Accept a suggestion or wait for your next scheduled run at [next_run]."
- **Loading:** shimmer rows.
- **Revision in progress:** item shows "Agent is rewriting…" with cancel.
- **Error on approve:** toast + item stays in_review.

### Tier Differences
| | Discover | Build | Scale |
|---|---|---|---|
| Inbox retention | 30 days | 90 days | unlimited |
| Bulk approve | 5 max/action | unlimited | unlimited |
| Inline chat editor | view only | full | full |
| Revision requests per item | 1 | 3 | unlimited |

### Preview Mode
First inbox item viewable (sample). Approve button → paywall "Unlock to approve and archive." Other items blurred with lock.

### Mobile
Collapses to list → tap opens fullscreen detail. Evidence becomes bottom sheet. Edit mode limited to markdown textarea (no inline chat editor on mobile v1).

### Key Journeys
1. **Yael Tuesday evening:** 4 drafts waiting, skims each (30s), approves 3, rejects 1 with "off brand tone". Total 3 min.
2. **Avi with Content Refresher:** selects weak intro paragraph → inline chat "make it more data-driven" → new version replaces → approves.
3. **Avi bulk clear:** checkboxes all scheduled FAQ drafts → Approve all (5).

### Success Metrics
- Approval rate ≥ 60%
- Median time-to-decision per item ≤ 90s
- Revision-request rate 10–25% (too low = rubber-stamping, too high = prompts broken)

### Paywall
Approve, bulk, revision request, inline chat editor.

### Notifications
`draft.ready` (scheduled run complete — real-time + daily digest), `item.approved` (internal analytics only, no email).

---

## 3. SCANS — History + Latest Results (renamed from Rankings)

**Purpose:** The evidence layer. Every claim Beamix makes comes back here.

### Data Model
| Element | Source | Refresh |
|---|---|---|
| Scan timeline | `scans` (list with created_at, engines_count, avg_score) | Cache 5 min |
| Per-scan detail | `scan_engine_results` joined by scan_id | On-demand |
| Queries matrix | normalized per (query × engine) | Per scan |
| Diff view | last scan vs prior scan | Computed on open |
| Scan pool balance | `scan_pool.remaining` | Real-time |

### Layout
Top: timeline chart (x=date, y=avg visibility, dot per scan). Below: scan-history table. Click row → drilldown.

### Primary Actions
- **Run scan now** → uses scan pool credit, fires Inngest event, row appears with status=running. Disabled if pool empty → upsell.
- **Schedule scans** → modal: cadence (weekly/daily per tier), day/time, query set (default / custom).
- **Open drilldown** → per-scan page: engines × queries heatmap, citation snippets, sentiment chips.
- **View diff** → side-by-side this-scan vs prior: queries improved, queries declined, new citations, lost citations.

### Secondary Actions
- Filter history by engine, date range, query.
- Export scan (CSV / JSON) — Build+.
- Re-ask engine (Scale) — rerun single query.

### States
- **Empty (pre-first-scan):** big CTA "Run your first scan".
- **Running:** progress bar per engine "Querying ChatGPT… 2/3 queries".
- **Partial (some engines failed):** yellow banner "Gemini timed out — retry free" (retry doesn't cost pool).
- **Pool empty:** run button disabled + "Top up scans" link.
- **Diff with no changes:** "No meaningful change — typical in weeks 1–2."

### Tier Differences
| | Discover | Build | Scale |
|---|---|---|---|
| Engines | 3 | 5 | 9+ |
| Auto-scan cadence | weekly | weekly (daily manual) | daily auto |
| History depth | 3 months | 12 months | unlimited |
| Queries per scan | 10 | 25 | 50 |
| On-demand re-scans | 2/mo | 10/mo | unlimited |
| Export | — | CSV | CSV + API |

### Preview Mode
Most recent scan fully visible (this is the hook). Timeline of prior scans visible but blurred past the most recent. Run-scan button → paywall.

### Mobile
Timeline stacks. Drilldown heatmap becomes per-engine accordion. Diff view = swipeable before/after cards.

### Key Journeys
1. **Yael verifies claim:** Home says score +3 → Scans → latest diff → sees 2 new Perplexity citations. Trust built.
2. **Avi adds query:** drilldown → "Queries" tab → "+ add tracked query" → becomes part of next scan set.
3. **Debug stalled score:** filters by ChatGPT, sees no movement, reads "ChatGPT week 4–8" info tooltip.

### Success Metrics
- % users viewing ≥1 scan detail per week: ≥ 40%
- Export usage on Build+: leading indicator for Scale upgrade
- Scheduled-scan enablement: ≥ 70% within week 1

### Paywall
Additional engines, on-demand rescans over cap, export, deeper history.

### Notifications
`scan.complete`, `scan.failed` (engine-level), `score.moved` (cross-scan delta ≥ 3).

---

## 4. AUTOMATION — Schedule, Budget, Kill Switch

**Purpose:** The control room. User decides what runs without asking.

### Data Model
| Element | Source | Refresh |
|---|---|---|
| Per-agent schedule | `automation_config` (new — `user_id, agent_type, enabled, cadence [off/weekly/biweekly/monthly], day_of_week, max_runs_per_month`) | Real-time |
| Page-cap counter | count of approved+published items from `inbox_items` this billing cycle | Real-time |
| Budget projection | computed: schedule × avg credits-per-run | Client-compute |
| Kill-switch state | `automation_config.global_enabled` | Real-time; mirrored in Settings |

### Layout
Top: BIG red Kill Switch toggle with state copy ("Automation ON — next run: Thu 9am" / "Automation PAUSED — no drafts will be generated"). Below: per-agent cards (toggle, cadence picker, next-run, monthly budget projection). Sidebar: monthly budget summary + page-cap progress bar.

### Primary Actions
- **Kill switch toggle** → confirmation modal ("Pausing will stop 4 scheduled runs this week. You can re-enable anytime. Approved drafts already in Inbox remain.") → sets global_enabled=false.
- **Per-agent toggle** + cadence selector.
- **Save schedule** (batched commit, shows diff of what changes).
- **Simulate next 30 days** button → preview calendar of scheduled runs and credit spend.

### Secondary Actions
- Collapse/expand per-agent.
- Reset to tier defaults.
- View last-run log per agent.

### Page-Cap UX (soft warning)
- Progress bar: approved pages this month / cap. Colors: <60% green, 60–90% amber, ≥90% red.
- At 80%: yellow banner "You're at 8/10 pages this month. New scheduled runs will still draft, but approving more may dilute topical authority per GEO research."
- At 100%: orange banner + checkbox "I understand — allow more anyway." Does NOT block approval; Beamix is advisor, not gatekeeper.

### States
- **Loading**, **Saving (pending commit)**, **Paused global** (all per-agent cards dim with lock overlay), **Budget exceed** (projected credits > monthly allocation → warn).

### Tier Differences
| | Discover | Build | Scale |
|---|---|---|---|
| Max agents enabled | 3 | 7 | 10 |
| Cadence options | weekly / monthly | +biweekly | +custom cron |
| Page cap (soft) | 4 | 10 | 20 |
| Blog Strategist | locked | unlocked | unlocked |
| Per-agent run logs | 30 days | 90 days | unlimited |

### Preview Mode
Entire page locked with single paywall overlay "Pick a plan to set your automation schedule." Kill switch visible but disabled.

### Mobile
Kill switch sticky at top. Agent cards collapse to accordion. Cadence picker = bottom sheet wheel.

### Key Journeys
1. **Yael first setup (post-onboarding):** walks down agent list, enables 4 agents weekly, sees projection "≈ 40 credits/mo", saves. 2 min.
2. **Avi going on vacation:** hits Kill Switch, confirms. Returns 10 days later, re-enables.
3. **Approaching cap:** banner at 8/10 → Avi decides to skip 2 drafts, rejects them, cap resets pressure.

### Success Metrics
- % users with ≥3 agents scheduled by end of week 1: ≥ 65%
- Kill-switch activation rate: <10% monthly (higher = trust issue)
- Re-enable rate after kill: ≥ 80% within 14 days

### Paywall
More agents, custom cadence, more page-cap headroom.

### Notifications
`cap.warning_80pct`, `cap.hit`, `automation.paused_by_user`, `automation.resumed`.

---

## 5. ARCHIVE — Approved / Posted History

**Purpose:** Library of what agents have produced and what's live. Proof of work.

### Data Model
| Element | Source | Refresh |
|---|---|---|
| Archive items | `inbox_items WHERE status IN ('approved','posted','needs_revision_post')` | SWR 60s |
| Posted status | `inbox_items.posted_at, posted_url` (user self-reports) | On user toggle |
| Export | client-side from item body | — |

### Layout
Top: two tabs — **Approved** (user confirmed, not yet marked posted) · **Posted** (user has confirmed it's live on their site). Search + filter bar. Grid/list toggle.

### Primary Actions
- **Mark as posted** → prompt for URL (optional) → moves to Posted tab. Starts "tracking" — next scan checks if that page now cites/ranks.
- **Copy as Markdown / HTML / Plain text** buttons (one-click).
- **Download .md file**.
- **Re-approve workflow** — if scan shows the posted page has gone stale or was never picked up after 8 weeks, item moves to "Needs refresh" section; user can click "Send to Refresher" → creates new agent_job, new draft returns to Inbox; Archive item status=superseded with link to new version.
- **Revert to Inbox** (undo approve within 24h).

### Secondary Actions
- Filter: agent type, posted/not-posted, date.
- Sort: newest, oldest, engine-impact (post-scan correlation).
- Search full text.
- Bulk export (zip of markdown files) — Build+.

### States
- **Empty:** "Nothing archived yet. Approved drafts land here."
- **Needs-refresh section:** amber chip "3 items may need refresh".
- **Export running:** spinner.

### Tier Differences
| | Discover | Build | Scale |
|---|---|---|---|
| Archive depth | 90 days | 12 months | unlimited |
| Bulk export | — | zip | zip + API |
| Auto-refresh detection | — | yes | yes + proactive Refresher suggestion |

### Preview Mode
Page blurred. Paywall overlay "Your approved work lives here."

### Mobile
Tabs stay. Card list only; long-press for actions. Copy buttons visible inline.

### Key Journeys
1. **Avi publishes:** Archive → item → Copy HTML → pastes into WordPress → returns → Mark as posted + URL.
2. **Stale detection:** 8 weeks post-publish, scan hasn't picked up → amber chip → "Send to Refresher" → new draft in Inbox next day.
3. **Year-end export:** Scale user bulk-exports 12mo for auditor.

### Success Metrics
- % approved items marked posted within 14 days: ≥ 55% (key activation proxy — are they actually using the content?)
- Copy-button click rate per approved item: ≥ 80%
- Refresh-workflow trigger rate: leading indicator of retention

### Paywall
Bulk export, depth beyond retention, auto-refresh detection.

### Notifications
`archive.needs_refresh`, `archive.posted_detected` (when scan finds the new page cited).

---

## 6. COMPETITORS — Tracking + Share of Voice

**Purpose:** Competitive context for every scan. "Who's winning for my queries?"

### Data Model
| Element | Source | Refresh |
|---|---|---|
| Tracked competitors | `competitors` (new — `user_id, name, url, added_from [free_scan/manual], added_at, status`) | Real-time |
| Share of voice | computed from `scan_engine_results` where competitor mentioned on tracked queries | Per scan |
| Movement deltas | diff this-scan vs prior per competitor × engine | Per scan |

**Onboarding seed:** free scan captures top 3 competitors automatically → pre-populated on first visit.

### Layout
Top: Share-of-Voice stacked bar (You vs Comp1/2/3… per engine) with period selector. Below: competitor table — name, URL, SoV%, Δ vs last scan per engine, top-winning-queries count. Right rail: "Movement alerts" (last 7 days).

### Primary Actions
- **Add competitor** — URL → validation → added to tracking. Next scan includes them.
- **Remove competitor** — soft delete (historical data kept).
- **Open competitor drilldown** — page showing: queries they rank for that you don't, sample citation snippets, content-types they lean on (blog/FAQ/schema).
- **"Beat them here" button on a query row** → pre-fills a suggestion, sends to Inbox pipeline (Blog Strategist or Content Optimizer).

### Secondary Actions
- Filter by engine.
- Sort by SoV, Δ, #queries-winning.
- Export CSV (Build+).

### States
- **Empty (no competitors tracked):** "Add up to N competitors to see how you stack up." with suggest-from-scan button.
- **Fresh-add (scan hasn't run yet):** "Tracking enabled — data appears after next scan ([date])."
- **Movement alert:** if competitor gained >10% SoV since last scan → red chip "[Competitor] jumped on Gemini".

### Tier Differences
| | Discover | Build | Scale |
|---|---|---|---|
| Tracked competitors | 3 | 10 | 25 |
| Drilldown depth | top 5 queries | full | full + export |
| Movement alerts | weekly digest | real-time push | real-time + Slack |
| "Beat them here" action | locked | unlocked | unlocked |

### Preview Mode
3 competitors from free scan visible, SoV bar visible (this is a huge hook). Add-competitor + Beat-them actions paywalled. Drilldown beyond top 3 queries blurred.

### Mobile
SoV bar becomes horizontal scroll. Table → card list. Drilldown full-screen modal.

### Key Journeys
1. **Avi monthly review:** SoV shows Comp2 gaining on Perplexity → drilldown → 5 queries lost → clicks "Beat them here" on top 2 → suggestions land on Home.
2. **Yael adds new rival:** sees a competitor on LinkedIn → Add URL → waits for next scan.
3. **Alert response:** red movement alert → clicks through → investigates.

### Success Metrics
- % users with >3 competitors tracked by day 30: ≥ 45% (Build+)
- "Beat them here" → approve rate: ≥ 40% (proves competitive data drives action)
- Drilldown views/week: ≥ 1 per active user

### Paywall
Adding beyond 3, real-time alerts, Beat-them-here, export.

### Notifications
`competitor.moved` (threshold ±10% SoV), `competitor.new_citation` (when competitor shows up for one of your tracked queries first time).

---

## 7. SETTINGS — Profile · Business · Billing · Preferences · Notifications · Integrations · Automation Defaults · API Keys

**Purpose:** Control panel. Nothing discovery, only configuration.

### Sub-Tabs
| Tab | Content | Tier |
|---|---|---|
| Profile | name, avatar, email, password, language toggle (HE/EN), timezone | all |
| Business | name, URL, industry, services, locations, target queries seed | all |
| Billing | current plan, next invoice, payment method (Paddle), invoices history, upgrade/downgrade, cancel | all |
| Preferences | theme (light/dark/system), date format, default views | all |
| Notifications | per-event × channel matrix (email/in-app/Slack): suggestion.new, draft.ready, scan.complete, score.moved, cap.warning, competitor.moved, billing.failed | all (Slack = Build+) |
| Integrations | Slack, Zapier, Google Search Console (Build+), CMS connectors (Scale) | gated |
| Automation Defaults | default cadence for new agents, default page-cap threshold, kill-switch mirror | all |
| API Keys | generate/revoke API tokens, usage logs | Scale only |

### Data Model
All settings persisted to `user_profiles`, `businesses`, `notification_preferences`, `api_keys`, `integrations`.

### Primary Actions
- Save (per-tab, with dirty-form warning on navigation).
- Cancel subscription (two-step: reason → confirm; retention offer inserted for Build/Scale).
- Toggle language (immediate UI reload, RTL for HE).
- **Kill-switch mirror** in Automation Defaults tab — same toggle as Automation page, synced.
- Generate API key (Scale) — shown once, then masked.
- Connect Slack (OAuth), test notification.

### Secondary Actions
- Download data (GDPR export) — all tiers.
- Delete account — two-step confirm with typed confirmation.
- View login history (Scale).

### States
- **Loading tab**, **Saving**, **Save success** (inline toast), **Validation error** (inline field), **Billing failure banner** (persistent across all pages until resolved).

### Tier Differences
Covered in sub-tab table above.

### Preview Mode
Only Profile + Business tabs accessible (user must fill business to get a scan). Billing visible as plan selector (IS the paywall destination). Others locked.

### Mobile
Sub-tabs become top scroll chips. Forms stack. Confirmation modals = bottom sheets.

### Key Journeys
1. **Yael switches to Hebrew:** Profile → language HE → UI flips to RTL.
2. **Avi connects Slack:** Integrations → Connect Slack → OAuth → Notifications tab → enable `competitor.moved` on Slack.
3. **Downgrade:** Billing → change plan → Build → Discover → retention modal "you'll lose 4 agents + 7 engines" → confirm or dismiss.

### Success Metrics
- Notification-prefs customization rate: ≥ 50% (indicates engagement)
- Slack connect rate on Build+: ≥ 30%
- Language switch to HE (Israeli cohort): ≥ 60%

### Paywall
Upgrade CTAs inline on locked tabs; most aren't paywalled since user is already paying — the exception is Preview users hitting Integrations/API Keys.

### Notifications Generated
`billing.failed`, `billing.succeeded`, `plan.changed`, `integration.connected`, `account.deleted`.

---

## Cross-Page Dependencies

| Event | Triggers |
|---|---|
| Suggestion accepted (Home) | Creates agent_job → on complete creates Inbox item → notification `draft.ready` |
| Scheduled run fires (Automation cron) | Creates agent_job pre-authorized → drafts directly to Inbox |
| Inbox approve | Creates Archive item → increments page-cap counter on Automation |
| Archive item marked posted | Next scan tags it for citation-detection |
| Scan complete | Updates Home score, triggers new suggestions, updates Competitors SoV |
| Kill switch ON | Pauses all Automation cron jobs; Home banner shows paused state |
| Cap hit | Soft warning on Home + Automation; does NOT block approvals |

## Acceptance Criteria (cross-cutting)

- [ ] All 7 pages render in <1.5s on broadband with cached data
- [ ] Preview mode behavior verified per page — paywall triggers correct on gated actions
- [ ] Kill switch state reflects within 2s across Home banner, Automation page, Settings mirror
- [ ] Page-cap counter updates within 5s of Inbox approve
- [ ] Scheduled runs auto-draft without user action and appear in Inbox with `draft.ready` notification
- [ ] One-off suggestions require explicit accept before credits hold
- [ ] Content Refresher inline chat editor only available on that agent's Inbox items
- [ ] Blog Strategist card/option hidden entirely on Discover tier
- [ ] Soft page cap warns but never blocks
- [ ] All 11 notification event types wired to `notifications` table + email per prefs

## Out of Scope (v1 of these 7 pages)

- Automation workflow chains (if X then Y)
- Custom agent creation
- Team/multi-seat (single-user accounts only)
- Real-time collaboration on Inbox items
- In-app publishing to CMS (manual copy-paste only — "Publish" = user does it)
- A/B testing of drafts
- Voice/tone profile editor (future)

## Handoff

- **design-lead:** wireframe 7 pages, focus on Home suggestion card + Inbox 3-pane + Automation kill switch prominence. Brand blue #3370FF for primary actions.
- **build-lead:** schema additions needed (`suggestions`, `inbox_items`, `inbox_item_revisions`, `automation_config`, `competitors`, `agent_feedback`). Existing `scan_engine_results`, `agent_jobs`, `credit_pools` reused. Real-time via Supabase channels for Inbox + Automation state.

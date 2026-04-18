# Proactive Automation Model — PRD

**Status:** Draft · **Owner:** Product Lead · **Date:** 2026-04-14
**Replaces:** Manual "Agent Hub" where users browse & click Run

---

## Problem

Beamix today treats agents as a buffet: user visits `/dashboard/agents/*`, picks one, fills a form, clicks Run. That model fails for three reasons:

1. **SMBs don't know which agent to pick.** They see a 34/100 score and 10 agent cards — paralysis, not action.
2. **GEO is continuous, not one-shot.** Research shows 76% of ChatGPT's top-cited pages are <30 days old; ranking improves with sustained cadence, not single runs.
3. **Competitors already show dashboards.** Beamix's moat is that the agents *do the work* — that only shows up if the system is proactive.

**Pain in customer language:** *"Tell me what to fix. Fix it. Show me it worked."*

## Solution

Shift from "agent picker" to **proactive automation**: scans surface issues, the system proposes agent actions, user approves, agents run (once or on a schedule), outputs land in a **Content Hub** where the user reviews/edits/approves before posting. Assisted, not autopilot.

## Success Metrics (30 days post-launch)

- ≥60% of paying users have ≥1 active scheduled agent
- ≥70% of suggestion cards receive a user action (accept/decline/snooze) within 72h
- ≥40% of agent outputs approved in Content Hub within 7 days of generation
- Median time-to-first-action after scan ≤ 5 minutes (vs ~never today)
- Churn in month 2 drops by ≥20% (value-loop closes: scan → fix → remeasure)

## Out of Scope (v1)

- Fully autonomous publishing to customer's website
- Multi-agent chain workflows (Workflow Builder UI)
- API/webhook integrations for external triggers
- Hebrew brand voice tuning (uses default voice)
- Agent-to-agent negotiation

---

## Part 1 — The Trigger Model

### Event sources

| Source | Emitted when | Priority |
|--------|--------------|----------|
| `scan.completed` | Scheduled or manual scan finishes | High |
| `scan.score_drop` | Visibility score drops ≥5 pts vs last scan | Critical |
| `scan.query_gap` | User not mentioned in ≥3 target queries | High |
| `scan.competitor_overtake` | Competitor now cited where user was | High |
| `scan.freshness_decay` | Content flagged as stale (>90d since edit, ranking dropped) | Medium |
| `schedule.tick` | Cron fires per workflow's `trigger_config.cron` | Medium |
| `user.manual` | User clicks "Run now" on a suggestion/agent | N/A |
| `content.approved` | User approves a piece in Content Hub (may trigger downstream agent, e.g. Schema Generator after Blog Strategist) | Low |

### Rule engine vs LLM classifier — **Hybrid**

- **Deterministic rule layer** maps signals → candidate agents (fast, auditable, cheap). Lives in `src/lib/automation/trigger-rules.ts`.
- **LLM prioritizer (Haiku)** ranks the candidates against the user's current state + open queue + budget → picks top 3 suggestions. Cheap, ~$0.001/call, runs once per scan.

Rules are the source of truth; LLM only picks *which to surface* and writes the human-readable "why". No rule = no suggestion.

### User control — per-agent default

| Agent class | Default mode | User can change? |
|---|---|---|
| On-site content (Optimizer, Refresher, Blog, FAQ) | **Propose → approve** | Yes → "Auto-draft" (runs → lands in hub as draft) |
| Schema Generator | **Auto-draft** | Yes → Propose |
| Off-site (Citation, Directory, Review, Entity) | **Propose only** (user must execute on external platform) | No |
| Query Mapper, Performance Tracker | **Auto-run silent** (internal intelligence, no content output) | No |

Nothing writes to the customer's live site without explicit approval in the Content Hub. "Auto-draft" means: agent runs, output appears in hub as `draft` — user still approves before it's "ready to post".

### Trigger taxonomy (examples)

| Trigger | → Agent | Why |
|---|---|---|
| `scan.query_gap: "best [x] in [city]"` not mentioned | FAQ Builder + Blog Strategist | Query-targeted content |
| `scan.score_drop` on ChatGPT specifically | Citation Builder | ChatGPT weights third-party sources (48.7%) |
| `scan.freshness_decay` on page X | Content Refresher | Freshness drives 76% of top citations |
| `scan.completed` finds missing JSON-LD | Schema Generator | Auto-draft |
| `schedule.tick` (every 2 days, Blog Strategist) | Blog Strategist | Continuous authority building |
| `scan.competitor_overtake` on query Y | Content Optimizer (page targeting Y) | Rewrite with stats/citations |
| Missing Wikidata entity | Entity Builder | Propose-only |

---

## Part 2 — Suggestion Queue Architecture

### New table: `agent_suggestions`

```sql
CREATE TABLE agent_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  scan_id uuid REFERENCES scans(id),
  trigger_type text NOT NULL,       -- matches event sources above
  trigger_payload jsonb NOT NULL,   -- {query, engine, score_delta, page_url, ...}
  suggested_agent text NOT NULL,    -- agent_type
  suggested_input jsonb NOT NULL,   -- pre-filled agent input
  reason_text text NOT NULL,        -- LLM-written "why" (1-2 sentences)
  expected_impact text,             -- "+5-8 pts on ChatGPT" (LLM estimate)
  credit_cost integer NOT NULL,
  estimated_minutes integer,
  priority smallint NOT NULL DEFAULT 50,  -- 0-100
  state text NOT NULL DEFAULT 'new'
    CHECK (state IN ('new','accepted','declined','snoozed','in_progress','completed','expired')),
  snooze_until timestamptz,
  agent_job_id uuid REFERENCES agent_jobs(id),   -- set when accepted
  created_at timestamptz NOT NULL DEFAULT NOW(),
  acted_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT NOW() + interval '14 days'
);
CREATE INDEX idx_suggestions_user_state ON agent_suggestions(user_id, state, priority DESC);
```

### Card fields (UI)

- Reason (e.g. *"You're not mentioned for 'best dentist Tel Aviv' on ChatGPT"*)
- Suggested action (*"Build a FAQ page targeting this query"*)
- Agent badge + credit cost + est. time
- Expected impact (*"+5-8 pts on ChatGPT visibility"*)
- Primary: **Accept** · Secondary: Decline · Tertiary menu: Snooze 7d / Always auto this type

### Accept behavior (per agent default mode)

- **Propose mode** → creates `agent_jobs` row, state → `in_progress`, output lands in hub as `in_review`
- **Auto-draft mode** → same, output lands as `draft`
- **Propose-only (off-site)** → state → `in_progress`, agent generates a "submission package" (description, link, screenshot), user marks done manually

### Bulk accept

- Filter by agent type or priority, Accept All → enqueues all into agent runner with rate-limit (max 5/hr to protect credits).

### Suggestion lifecycle

`new` → (accept) `in_progress` → `completed` (content in hub)
`new` → (decline) `declined` (never resurface same trigger for 30d)
`new` → (snooze 7d) `snoozed` → auto back to `new`
`new` → 14d no action → `expired`

---

## Part 3 — Scheduled Automation per Tier

**Frequency caps enforced at the `agent_workflows.max_runs_per_month` level (already exists).**

| Agent | Discover $79 | Build $199 | Scale $499 |
|---|---|---|---|
| Query Mapper | Auto monthly | Auto weekly | Auto weekly |
| Performance Tracker | Auto weekly (with scan) | Auto with every scan | Auto with every scan |
| Schema Generator | Manual only | Weekly check | Weekly check |
| Content Optimizer | Manual only | Every 14d (1 page) | Every 7d (up to 3 pages) |
| Content Refresher | Manual only | Every 30d | Every 14d |
| FAQ Builder | Manual only | Every 14d | Every 7d |
| Blog Strategist | **Not available** | Every 7d | Every 2-3d (user picks) |
| Citation Builder | Propose quarterly | Propose monthly | Propose weekly |
| Directory / Entity Builder | Propose quarterly | Propose monthly | Propose monthly |
| Review Presence Planner | Manual only | Propose monthly | Propose monthly |

### Schedule options per agent (user-controlled, Settings → Automation)

Preset options: `off`, `every 2 days`, `weekly`, `every 14 days`, `monthly`. Plus: weekday restriction (e.g. weekdays only), intensity (`1 output per run` / `up to N per run`).

### UX location

`/dashboard/automation` — single page with:
- Master "Automation: ON/OFF" toggle (kill switch)
- Per-agent row: schedule dropdown, intensity slider, "paused" toggle, next run time
- Projected monthly cost panel (live)
- Recent automated runs feed

---

## Part 4 — Credit Consumption Under Automation

### Settings

- **Monthly credit cap** — hard limit. At 100%, automation pauses; user is notified; manual runs still allowed (they reduce next month's cap warning only).
- **Warning thresholds** — notify at 50%, 80%, 100%.
- **Per-agent budget** — optional sliders (`max 30% of monthly budget on Blog Strategist`).
- **Per-week rate cap** — prevents weekend-burn scenarios.
- **Kill switch** — "Pause all automation" toggle; all scheduled workflows set `is_active=false`, pending suggestions auto-snooze 7d.

### Projected monthly cost

Computed from: `sum(schedule_frequency × credit_cost_per_run)` across all active workflows. Shown in Automation settings + Billing tab.

### Schema additions

```sql
ALTER TABLE user_profiles ADD COLUMN automation_enabled boolean DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN monthly_automation_cap integer; -- credits; null = plan default
ALTER TABLE credit_pools ADD COLUMN automation_used_this_month integer DEFAULT 0;

CREATE TABLE automation_budgets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  per_agent_caps jsonb DEFAULT '{}',   -- {blog_strategist: 40, content_optimizer: 30, ...} (percentages)
  weekly_cap integer,
  warn_thresholds smallint[] DEFAULT '{50,80,100}'
);
```

Scheduled-run credit hold must check cap before running. If exceeded → skip run, emit notification, don't retry until next cycle.

---

## Part 5 — Central Content Hub (`/dashboard/hub`)

### Layout

- **Default: Inbox list** (sorted by: state=`in_review` first, then `draft`, then newest)
- **Toggle views:** Kanban (columns = states), Calendar (by `updated_at`)
- Left rail: filters (agent type, content type, state, tag, date range, search)

### States

| State | Meaning | User action |
|---|---|---|
| `draft` | Auto-drafted by agent, not yet reviewed | Review → move to `in_review` (or edit first) |
| `in_review` | Under human review | Approve / Reject / Edit |
| `approved` | Ready to post (user copies to their site manually) | Mark Posted / Archive |
| `posted` | User confirmed they published it externally | (read-only) |
| `archived` | Kept for reference | Unarchive |
| `rejected` | Sent back to agent with feedback | Regenerate |

`content_items.status` CHECK list expanded to include `posted`, `rejected`.

### Edit model

- **Default:** inline markdown editor (monospace, live-preview tab). Ships v1.
- **v2:** rich-text (Tiptap) for non-technical users.
- **Diff view:** shows "agent original vs your edits" — green/red diff. Stored as `content_versions` rows (table exists).

### Approval flow

- **Approve** → state `approved`. CTA: *"Copy to clipboard"* or *"Download .md"*. Checklist: "I've published this to [url]" → marks `posted`, stores `published_url`.
- **Reject** → modal: required feedback textarea ("what's wrong?"). Creates new `agent_jobs` row with prior output + feedback as input → regenerates. Old version archived.
- **Archive** → out of queue, searchable only.

### Bulk actions

- Multi-select checkboxes. Approve all FAQs, archive all older than 60d, reject with shared feedback. Rate-limited server-side to 25/action.

### Filters/search/tags

- Full-text search on `title` + `content_body` (Postgres `to_tsvector`)
- Tags editable inline (free-form, autocomplete from existing)
- Saved filters (e.g. "All Blog drafts from last 7 days")

---

## Part 6 — Off-Site Agents Under Automation

Citation Builder, Directory Optimizer, Review Presence Planner, Entity Builder can't auto-publish. Their "run" produces a **submission package** stored in `content_items` with `content_type='outreach_template'` and a new field `external_action_required=true`.

### Flow

1. Scan finds: "you're listed on 3/12 relevant directories"
2. Suggestion card: *"Get listed on 4 high-impact directories (Yelp, BBB, Clutch, [industry])"*
3. Accept → agent generates package per directory:
   - Pre-written business description (matching voice)
   - Direct submission link
   - Category recommendation
   - Required fields checklist
   - Screenshot of where to paste
4. Hub item with checkbox list: user ticks each one as completed
5. On next scan (`scan.completed` event), system checks for new citations → auto-marks verified ones → emits `notification: "Verified! You're now on Yelp"`

### Schema

```sql
ALTER TABLE content_items ADD COLUMN external_action_required boolean DEFAULT false;
ALTER TABLE content_items ADD COLUMN external_action_checklist jsonb; -- [{label, url, done, verified_at}]
ALTER TABLE content_items ADD COLUMN verified_at timestamptz;
```

---

## Part 7 — Agent Coordination

**Shared state = `content_items` + new `page_locks` + `topic_ledger`.**

### Rules

1. **Page lock** — When Content Optimizer starts on URL `X`, insert a `page_locks` row with `released_at=now()+14d`. Content Refresher skips any URL with an active lock. Blog Strategist avoids same-topic unless `force=true`.
2. **Topic ledger** — `topic_ledger(topic_slug, last_used_at, used_by_agent_type)`. Blog Strategist queries this before picking a topic; won't repeat within 60d.
3. **"Handled by another agent" check** — Every scheduled run's first step: query active `agent_suggestions` + in-progress `agent_jobs` for same `business_id + target`. If overlap, skip and log.
4. **Rate limits** — Max 8 content pieces published per site per month (from research: >50 = ranking crash). Enforced in suggestion generator.

### New tables

```sql
CREATE TABLE page_locks (
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  page_url text NOT NULL,
  locked_by_agent text NOT NULL,
  locked_by_job_id uuid REFERENCES agent_jobs(id),
  locked_at timestamptz NOT NULL DEFAULT NOW(),
  released_at timestamptz NOT NULL,
  PRIMARY KEY(business_id, page_url)
);

CREATE TABLE topic_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  topic_slug text NOT NULL,
  topic_text text NOT NULL,
  used_by_agent text NOT NULL,
  content_item_id uuid REFERENCES content_items(id),
  used_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_topic_ledger_biz_slug ON topic_ledger(business_id, topic_slug, used_at DESC);
```

---

## Part 8 — New Agent Types?

**Keep the 10-agent roster as user-facing.** The automation model is *internal infrastructure*, not new agents. Specifically:

- **Orchestrator** = internal system (`src/lib/automation/orchestrator.ts`), not shown to user. Runs after every scan.
- **Scheduler** = Inngest cron functions driving `agent_workflows` — already exists.
- **Content Hub Curator** = internal dedup/prioritize logic on suggestion insert. Not an agent.

**Rationale:** More user-facing agents = more decision paralysis, directly contradicts the vision.

---

## Part 9 — Evidence Trail

Every agent output carries a `trace` panel. Schema addition:

```sql
ALTER TABLE agent_jobs ADD COLUMN trigger_source jsonb;
-- {type: 'schedule'|'scan'|'manual'|'suggestion',
--  scan_id, suggestion_id, workflow_id, trigger_event, target_queries,
--  research_sources: [{url, title, cited_for}],
--  brand_sources: [{content_item_id, excerpt_used}],
--  estimated_impact: {engines:[...], score_delta_est}}
```

### Panel UI (collapsible in hub item detail)

- **Why this ran** — "Scheduled (every 2 days) · Previous run 2026-04-12"
- **Queries targeted** — chips: "best X in Tel Aviv", "top-rated X near me"
- **Research sources** — list of URLs read, each with which claim it sourced
- **Brand context used** — which of user's past articles informed voice/facts
- **Expected impact** — "Estimated +5-8 pts on ChatGPT; remeasured on next scan"
- **Actual impact** — populated after next `scan.completed` via `content_performance` table (exists)

---

## Part 10 — MVP Scope (2-week ship)

### MVP-1 (Weeks 1-2) — Minimum proactive loop

Must-have to ship the model:

1. `agent_suggestions` table + suggestion generator triggered on `scan.completed` (rules-based only, no LLM prioritizer yet — pick top 5 by rule priority)
2. Suggestion queue UI on `/dashboard` home (replaces current agent cards as primary surface)
3. Accept/Decline/Snooze actions wired to existing `agent_jobs` creation
4. Content Hub at `/dashboard/hub` — inbox list view only (no kanban/calendar), states: `draft`, `in_review`, `approved`, `archived`, `rejected`
5. Markdown editor + Approve/Reject/Edit flow
6. Scheduled Blog Strategist + Content Optimizer via existing `agent_workflows` + Inngest cron (one schedule preset per tier, no custom config)
7. `/dashboard/automation` minimal page: master kill switch + per-agent on/off + projected cost
8. Monthly credit cap enforcement
9. Trigger taxonomy covering 4 triggers: `scan.completed`, `scan.score_drop`, `scan.query_gap`, `schedule.tick`
10. Evidence trail: basic "why this ran" text (no research source list yet)

### MVP-2 (Weeks 3-4)

- Off-site agents with submission packages + verification via next scan
- LLM prioritizer layer
- Bulk actions in hub
- `page_locks` + `topic_ledger` coordination
- Per-agent budget sliders
- Full evidence trail (sources, brand context, impact)
- Suggestion snooze + expiry

### V1 (Month 2-3)

- Kanban + calendar views in hub
- Diff view on content versions
- Rich-text editor
- Custom schedule configs (user-picked cron)
- Multi-step workflows (chain agents)
- Real-time `content.approved` → downstream agent triggers (e.g. Schema after Blog)
- Rejection feedback → regenerate loop

---

## Acceptance Criteria (MVP-1)

- [ ] Given a completed scan with ≥1 query gap, when the user opens `/dashboard`, then ≥1 suggestion card is visible within 30 seconds.
- [ ] Given a suggestion card, when the user clicks Accept, then an `agent_jobs` row is created and the suggestion state moves to `in_progress`.
- [ ] Given an agent job completes, when the user opens `/dashboard/hub`, then the output appears with state `draft` or `in_review` (per agent class).
- [ ] Given a hub item in `in_review`, when the user clicks Approve, then state becomes `approved` and published-link capture is offered.
- [ ] Given automation is enabled and Blog Strategist schedule = weekly, when the cron fires, then a new `agent_jobs` row runs within 5 min and its output lands in hub as `draft`.
- [ ] Given monthly automation cap is reached, when a scheduled cron fires, then the run is skipped and a notification is emitted.
- [ ] Given user toggles master kill switch OFF, when scheduled crons fire, then no runs execute.
- [ ] Given a scheduled run completes, when the user opens the hub item, then the evidence panel shows "why this ran" with trigger type and timestamp.

## RICE

| Factor | Value | Rationale |
|---|---|---|
| Reach | 100% of paying users | Changes primary dashboard surface |
| Impact | 3 (massive) | Redefines the product; unlocks retention |
| Confidence | 70% | Vision is clear; execution risk in 2 weeks is real |
| Effort | 8 engineer-weeks (2 engineers × 4 weeks for full MVP-1+MVP-2) | — |
| **Score** | **26.25** | — |

---

## Schema Summary (new tables/columns)

**New:** `agent_suggestions`, `automation_budgets`, `page_locks`, `topic_ledger`
**Altered:** `agent_jobs.trigger_source`, `content_items` (+3 cols: status extended, external_action_required, external_action_checklist, verified_at), `user_profiles` (+2 cols), `credit_pools` (+1 col)
**Reused:** `agent_workflows`, `workflow_runs`, `content_versions`, `content_performance`, `notifications`, `alert_rules`

## Open questions for CEO/Build Lead

1. Does "Auto-draft" mode count as a user decision, or is it too close to autopilot? (legal/brand risk)
2. Hard cap vs soft cap on monthly credits — user confusion risk on hard cap.
3. Should off-site agent verification (scan detecting new citation) auto-close the hub item, or require user confirmation?
4. MVP-1 at 2 weeks is tight — acceptable to defer the Automation settings page to MVP-2 and ship with plan-default schedules only?

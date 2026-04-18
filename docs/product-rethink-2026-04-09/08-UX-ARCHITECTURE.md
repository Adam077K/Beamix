# Beamix UX Architecture — Board-Approved (2026-04-15)

**STATUS: APPROVED**
**Supersedes:** Agent Hub design, Recommendations page, legacy onboarding flow
**Brand tokens:** Primary accent `#3370FF` · Body `Inter` · Headings `InterDisplay-Medium` · Code `Geist Mono`

---

## 1. Product Philosophy

Beamix operates on an **assisted, not autopilot** model. Every piece of content an agent produces lands in the user's Inbox for review before it goes anywhere. Nothing publishes without an explicit human approval.

Four principles govern every UX decision:

1. **Agents are invisible infrastructure.** Users see actions, suggestions, and results — not agent cards or execution pipelines.
2. **Proactive loop.** The system drives: scan → suggest → approve → run → review → approve → post. Users respond; they don't initiate.
3. **Scheduled runs auto-draft.** Pre-authorized cadences (e.g., weekly FAQ refresh) produce drafts that land in Inbox automatically. No surprise runs, no silent publishing.
4. **Continuous improvement.** Score movement is the product. Every approval feeds back into the next scan cycle.

---

## 2. Dashboard Navigation

The sidebar replaces the previous structure. "Agents" is removed as a top-level destination. "Recommendations" is absorbed into Home (Suggestions section).

| # | Nav Item | Icon family | Badge |
|---|----------|-------------|-------|
| 1 | Home | House | — |
| 2 | Inbox | Tray | Unread count |
| 3 | Scans | Radar | — |
| 4 | Automation | Zap | — |
| 5 | Archive | Archive | — |
| 6 | Competitors | Users | — |
| 7 | Settings | Gear | — |

Agents surface only through Inbox items and Automation schedules. There is no `/dashboard/agents` route in the approved navigation.

---

## 3. Per-Page Spec Summary

### Home

**Purpose:** Single-screen status view — score, trend, and the next 3 suggested actions.

**Primary actions:** Approve a suggestion · Run an action · Dismiss a suggestion

**Key data:** GEO score (0–100) on a 8-week sparkline · Engine breakdown (ChatGPT / Gemini / Perplexity / Claude) · Suggestions queue (top 3, ranked by estimated impact) · Recent Inbox items (last 3 drafts)

**Tier differences:** Discover (free preview) sees score + 1 suggestion, rest blurred with paywall prompt. Build sees full suggestions. Scale sees suggestions + Competitor delta widget.

**Preview mode:** Score visible, competitor comparison blurred, all suggestion CTAs trigger paywall modal. Top banner persists: "You're in preview — upgrade to fix these issues."

**Mobile:** Score and engine grid stack vertically. Suggestions list becomes full-width cards with tap-to-expand.

---

### Inbox

**Purpose:** Central review queue for all agent-produced content. The primary daily-driver screen.

**Primary actions:** Approve · Reject · Edit (inline chat for Freshness Agent) · Archive

**Key data:** Item title · Agent type · Trigger reason · Target queries · Estimated impact · Status badge (draft / awaiting review / approved / archived)

**Layout:** 3-pane Superhuman layout — list (left) · content preview (center) · evidence panel (right). Evidence panel shows: trigger source, target queries, research citations, brand voice references, impact estimate.

**Inline chat editor (Freshness Agent only):** Select text → floating capsule appears → Haiku rewrites on demand → accept or reject diff. All other agents: read-only preview + approve/reject.

**Tier differences:** Discover sees 1 locked item with blurred content. Build gets full Inbox. Scale gets Inbox + bulk-approve action.

**Item states:** `draft → review → approved → archived` or `rejected`.

**Preview mode:** First item visible, subsequent items behind paywall gate.

**Mobile:** Single-column. Tap item → full-screen preview → swipe left to reject, swipe right to approve.

---

### Scans

**Purpose:** Historical scan record and manual re-scan trigger.

**Primary actions:** Run manual scan · View scan detail · Compare two scans

**Key data:** Scan history table (date, engines queried, score at time, delta vs previous) · Per-scan drill-down: engine results, mention snippets, query coverage map

**Tier differences:** Discover — 3 engines, view-only. Build — 7 engines, 1 manual re-scan/day, comparison view. Scale — all engines, unlimited re-scans, full comparison.

**Preview mode:** Last scan result visible (from free scan), re-scan button triggers paywall.

**Mobile:** Table collapses to cards. Drill-down opens as bottom sheet.

---

### Automation

**Purpose:** Configure scheduled agent runs and credit budget rules.

**Primary actions:** Enable/disable a schedule · Set cadence · Set monthly credit cap · Pause all

**Key data:** Schedule table (agent, cadence, last run, next run, status) · Monthly credit usage bar · 75% and 100% alert thresholds

**Trigger rules engine:** 15 hardcoded rules fire on scan completion (e.g., "FAQ content stale > 30 days → queue FAQ Builder"). When >5 rules fire simultaneously, Haiku ranker ($0.002/scan) prioritises the queue.

**Scheduled dispatch:** Inngest cron dispatcher. Cadences stored per agent per user in DB. Every scheduled run produces a draft in Inbox — never auto-publishes.

**Kill switch:** Global pause toggle (top of page) + per-agent pause toggle.

**Tier differences:** Discover — no automation access, page shows locked state with upgrade CTA. Build — up to 3 active schedules. Scale — unlimited schedules.

**Preview mode:** Full page locked.

**Mobile:** Schedule list stacks. Toggle controls remain accessible.

---

### Archive

**Purpose:** Approved and completed items. Source of truth for published content.

**Primary actions:** Copy content · View original draft · Link to published URL · Re-run agent on same target

**Key data:** Approved items (date approved, agent, target page, estimated impact) · Self-reported publish status · Verification status (URL probe +48h after self-report, next-scan confirm)

**Off-site verification loop:** User marks item "published" → system probes URL after 48h → confirms at next scan cycle.

**Tier differences:** All tiers see their own archive. Scale gets export (CSV/JSON).

**Preview mode:** No archive access.

**Mobile:** Single-column list, copy-to-clipboard on tap.

---

### Competitors

**Purpose:** Track how named competitors appear across AI engine queries.

**Primary actions:** Add competitor · Run competitor scan · View per-query comparison

**Key data:** Competitor appearance rate by engine · Queries where competitor appears but you don't · Score delta vs your score · Mention trend (4-week)

**Tier differences:** Discover — full Competitors page with 3 tracked competitors. Build — up to 3 competitors, weekly refresh. Scale — unlimited, daily refresh, loss-aversion alerts.

**Preview mode:** Page locked with upgrade CTA.

**Mobile:** Comparison table scrolls horizontally; charts stack.

---

### Settings

**Purpose:** Account, billing, notification preferences, and business profile.

**Tabs:** Profile · Business · Billing · Preferences · Notifications · Integrations · Automation Defaults

**Key data per tab:**
- Profile: user name, email, password, language preference
- Business: business name, industry, location, services array, scan URL
- Billing: current plan, 14-day money-back guarantee status, Paddle portal link, invoice history
- Preferences: UI preferences, default language (HE/EN), date format
- Notifications: per-event toggles (see §8), daily digest time, push opt-in
- Integrations: GA4 / GSC connect (optional, shown during post-payment onboarding)
- Automation Defaults: default cadences, credit cap per agent, global kill switch

**Tier differences:** Billing tab reflects active plan. Notification options expand on Build/Scale.

**Preview mode:** All tabs accessible. Billing tab shows "No active plan" + upgrade CTA.

**Mobile:** Tabs collapse to select dropdown. Form fields full-width.

---

## 4. Free Scan → Preview → Paywall Flow

```
1  /scan landing
   └─ Capture: URL · industry · location · 3 competitors (optional)

2  Scanning animation (60–90s)
   └─ Dark screen · engine logos light up sequentially as results arrive
   └─ Real Inngest job fires — not mocked

3  Wound-reveal result page
   └─ Giant score (0–100) · competitor comparison table
   └─ 3 visible fixes (title + description)
   └─ 8 blurred fixes behind frosted overlay
   └─ "Fix this now →" CTA (primary, #3370FF) · "Explore the product first" (text link)

4  "Explore first" path → Preview mode
   └─ Auto-create Supabase account (email capture or magic link)
   └─ scan_id linked to new user_id in free_scans table
   └─ Redirect to /dashboard with scan data pre-loaded
   └─ Persistent top banner: "Preview mode — upgrade to unlock agents"

5  Paywall triggers (feature-gated)
   └─ Primary: "Run Agent" button on any suggestion
   └─ Secondary: Competitors page · Automation page · re-scan button
   └─ Tertiary: blurred Inbox items · blurred suggestions beyond first

6  One free FAQ run
   └─ Every preview account gets 1 FAQ Builder run
   └─ Result lands in Inbox · approve button triggers paywall
   └─ Goal: demonstrate value before asking for payment

7  Paywall modal (880px centered)
   └─ Build plan highlighted (Most popular badge)
   └─ All 3 tiers shown: Discover $79/mo · Build $189/mo · Scale $499/mo
   └─ Annual toggle (saves ~20%)
   └─ "Get started" on Build → Paddle checkout
   └─ All paid plans include 14-day money-back guarantee

8  Paddle checkout
   └─ Hosted Paddle overlay · no custom payment UI

9  Post-payment onboarding (2 steps)
   └─ Step 1: Verify business profile (name, location, services — pre-filled from scan)
   └─ Step 2: Optional — connect GA4 / GSC
   └─ Redirect to /dashboard · 14-day money-back guarantee window starts on first dashboard visit
```

---

## 5. Interaction Models by Agent Type

| Agent class | Run model | User touchpoint |
|-------------|-----------|-----------------|
| **Content agents** (Blog Strategist, FAQ Builder, Content Optimizer) | Background Inngest job | Draft lands in Inbox → review → approve → copy to site |
| **Freshness Agent** | Background job | Draft in Inbox with inline chat editor (select text → Haiku rewrite → accept/reject) |
| **Off-site agents** (Citation Builder, Directory Optimizer, Entity Builder) | Produces submission package | User receives checklist in Inbox → executes manually → marks done → scan verifies |
| **Intelligence agents** (Query Mapper, Competitor Tracker) | Ambient, runs on scan | Populates Signals feed on Home; Query Mapper has dedicated route `/dashboard/queries` |
| **Lightweight agents** (Schema Generator) | 45-second one-shot | Result in Inbox immediately; no streaming needed |
| **Scheduled auto-draft** | Inngest cron | Draft in Inbox automatically; no user initiation required |

**AI disclosure policy:** Agent-generated content contains no AI disclosure markers. Content reads as human-written. Users are responsible for any disclosure obligations on their own site.

---

## 6. Central Content Hub (Inbox)

**Layout:** 3-pane (Superhuman pattern)

```
┌─────────────────┬──────────────────────────┬───────────────────┐
│  Item list      │  Content preview         │  Evidence panel   │
│  (scrollable)   │  (markdown rendered)     │                   │
│                 │                          │  Trigger source   │
│  ● Draft  2     │  [Agent output here]     │  Target queries   │
│  ✓ Approved 5   │                          │  Research sources │
│  ✗ Rejected 1   │  [Approve] [Reject]      │  Brand voice refs │
│                 │  [Edit via chat]         │  Impact estimate  │
└─────────────────┴──────────────────────────┴───────────────────┘
```

**State machine:** `draft → review → approved → archived` / `rejected`

Approved items move to Archive. Rejected items stay in Inbox for 14 days then auto-archive.

**Markdown rendering:** `textarea` + `react-markdown`. No TipTap or Lexical. Freshness Agent inline edits are the only in-place edit surface.

**Keyboard shortcuts:** `J` / `K` navigate list · `A` approve · `R` reject · `⌘K` command palette

**Supabase Realtime:** Inbox subscribes to new item inserts — no polling.

---

## 7. Automation Model

**Trigger rules engine**

15 hardcoded rules evaluate on every scan completion:

| Rule example | Fires when |
|-------------|-----------|
| FAQ stale | Last FAQ content >30 days old |
| Schema missing | No JSON-LD detected on homepage |
| Competitor gap | Competitor appears in >3 queries where user doesn't |
| Score drop | Score drops >5 points vs prior scan |

When >5 rules fire: Haiku ranker scores each by estimated impact and credits available. Cost: ~$0.002/scan.

**Scheduled cadences**

Stored in DB per agent per user. Inngest cron dispatcher reads active schedules each morning and enqueues jobs. Every job produces a draft — never auto-publishes.

**Kill switches**

- Global pause: stops all scheduled runs immediately
- Per-agent pause: disables one agent's schedule while others continue

**Credit budget caps**

- Monthly allocation set by plan tier
- 75% consumed → email alert (instant)
- 100% consumed → auto-pause all scheduled runs · in-app notification

**Off-site verification loop**

1. User marks item "published" in Archive
2. System queues URL probe (+48h)
3. Next scan cycle confirms citation appearance
4. Archive item updated with verification status

---

## 8. Notification System

| Channel | Default | Control |
|---------|---------|---------|
| In-app bell | Always on | Batched: Today / Earlier groups |
| Email | Daily digest (7am) | Per-event toggles in Settings |
| Push | Off | Opt-in only |

**Email rule:** Maximum 1 email per day per user. Digest batches non-urgent events; instant events (budget alert) break the daily cap.

**Event types and delivery:**

| Event | Channel | Timing |
|-------|---------|--------|
| Item ready for review | In-app + email | Instant (in-app) / daily digest (email) |
| Scan complete | In-app | Weekly digest |
| Budget at 75% | In-app + email | Instant |
| Budget at 100% / paused | In-app + email | Instant |
| New suggestion generated | In-app | Daily batch |
| Competitor appeared in new queries | In-app + email | Weekly |

---

## 9. Retention Hooks (3 Must-Haves)

**1. Score timeline**
Home page shows 8-week sparkline. Weekly email includes: "Your score moved from 34 → 41 this week." Score movement is the primary retention signal — without it, users cancel.

**2. Competitor loss-aversion alert**
"MovingTLV appeared in 3 new queries this week where you don't appear." Framed as threat, not neutral data. Delivered as weekly email on Scale; in-app notification on Build.

**3. "You shipped something" confirmation loop**
After user approves → copies content → marks published: system sends confirmation ("Content published — we'll track the impact in your next scan"). Closes the loop between effort and outcome.

---

## 10. Expectations Timeline

Shown explicitly on post-payment onboarding screen (not buried in help docs).

| Timeframe | What users see |
|-----------|---------------|
| Week 1–2 | Activity indicators only: tasks completed, content published. No score movement yet. |
| Week 3–4 | First citations on Perplexity + Gemini (fastest-crawling engines). |
| Week 4–8 | ChatGPT Search citation shifts begin. Compounding effect from multiple content pieces. |
| Month 3+ | Visible score-level movement across all tracked engines. |

Setting this expectation in onboarding is a churn-prevention requirement, not a nice-to-have.

---

## 11. Technical Foundation

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Markdown editing | `textarea` + `react-markdown` | No TipTap/Lexical — scope is review, not authoring |
| Charts | Recharts (standard) · Nivo (heatmap only) | Recharts handles 95% of cases with less bundle weight |
| Server state | Server Components + RLS default | Reduces client-side data fetching complexity |
| Live data | TanStack Query | Inbox polling fallback, mutation invalidation |
| UI state | Zustand | Modal state, sidebar collapse, inline edit sessions |
| Real-time | Supabase Realtime on Inbox table | New draft inserts trigger unread badge + notification |
| Layout | Extend existing `DashboardShell` | No new shell — sidebar items change, structure stays |
| RTL (Hebrew) | Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`) · Heebo font for Hebrew text | Avoids direction-specific overrides |
| Keyboard | `J/K` Inbox navigation · `⌘K` command palette | Superhuman pattern; power-user retention |

---

## 12. Build Complexity Estimates

| Page / Area | Complexity | Est. Hours | MVP-1 Scope |
|-------------|------------|------------|-------------|
| Home | M | 28 | Score + suggestions + recent inbox items |
| Inbox | XL | 56 | Full 3-pane + inline chat (Freshness only) |
| Scans | L | 36 | History table + drill-down + comparison |
| Automation | M | 26 | Schedule table + credit cap + kill switch |
| Archive | S | 14 | Approved items + publish status + copy |
| Competitors | M | 22 | Comparison table + per-query view |
| Settings | S–M | 20 | 7 tabs (profile, business, billing, preferences, notifications, integrations stub, automation defaults) |
| Shared (layout, real-time, command palette) | — | 12 | DashboardShell extension + Supabase Realtime wiring |
| **Total** | | **~214h** | |

---

*Authored by Technical Writer agent · 2026-04-14*
*Source: Board meeting decisions compiled from product-rethink-2026-04-09 series*

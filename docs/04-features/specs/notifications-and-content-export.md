# Notifications System + Content Export Flow --- PRD

**Status:** SPEC COMPLETE | **Date:** 2026-04-14 | **Author:** Product Lead
**Depends on:** UX Architecture (08-UX-ARCHITECTURE.md), Board Decisions (05-BOARD-DECISIONS-2026-04-15.md)

---

## Problem

Beamix agents run proactively in the background, but users have no way to know when output is ready. The weekly-digest cron is a stub (`sent: 0`). Email sending is disabled. Users must manually check the Inbox. Without timely notification, approved content sits unacted-on, reducing the scan-improve-verify loop speed that drives retention.

Additionally, after approving content in Inbox, users have no structured way to export it to their website. Copy-paste is the only path, with no format options, no JSON-LD handling, and no "published" tracking.

## Success Metrics

- 70% of users with email enabled open at least 1 daily digest within their first 14 days
- Median time from agent-complete to user-review drops below 4 hours (from current unmeasured/infinite)
- 50% of approved content items are marked "published" within 7 days of approval

---

# TASK A --- NOTIFICATIONS SYSTEM

## Part 1: Event Catalog

| # | Event | Source | In-App | Email | Timing | Priority |
|---|-------|--------|--------|-------|--------|----------|
| 1 | Agent run complete (output ready) | `agent_jobs.status = completed` | Instant | Daily digest | On completion | High |
| 2 | Scan complete (new results) | `scans.status = completed` | Instant | Daily digest | On completion | Medium |
| 3 | Score change (weekly movement) | Performance Tracker comparison | Instant | Weekly digest | Sunday 7am | Medium |
| 4 | Competitor movement | Competitor scan delta > 0 | Instant | Weekly digest (Build) / Instant (Scale) | On detection | Medium |
| 5 | New suggestions generated | Rules engine post-scan | Instant | Daily digest | Post-scan | Medium |
| 6 | Budget at 75% | `credit_pools.used_amount >= 0.75 * base_allocation` | Instant | **Instant** (breaks daily cap) | On threshold | High |
| 7 | Budget at 100% / auto-paused | `credit_pools.used_amount >= base_allocation` | Instant | **Instant** (breaks daily cap) | On threshold | Critical |
| 8 | Credit pool low (5 runs left) | Credit deduction check | Instant | Daily digest | On deduction | Low |
| 9 | Subscription renewed | Paddle webhook `subscription.activated` | Instant | Instant | On event | Low |
| 10 | Payment failed | Paddle webhook `transaction.payment_failed` | Instant | **Instant** | On event | Critical |
| 11 | Plan changed | Paddle webhook `subscription.updated` | Instant | Instant | On event | Medium |
| 12 | Off-site submission verified | URL probe + scan confirm | Instant | Daily digest | +48h after self-report | Medium |
| 13 | Content published (user confirmed) | User marks "published" in Archive | Instant | -- | On action | Low |
| 14 | New reviews detected | Review Presence Planner scan | Instant | Daily digest | On detection | Medium |
| 15 | Performance Tracker weekly report | Scheduled weekly run | Instant | Weekly digest | Sunday 7am | Medium |
| 16 | Scheduled maintenance | Admin manual | Instant | **Instant** | As needed | Low |
| 17 | New feature announcement | Admin manual | Instant | **Instant** | As needed | Low |
| 18 | Money-back guarantee expiring (day 12) | Subscription created_at + 12d | -- | **Instant** | Day 12 | Medium |

## Part 2: Channel Routing Logic

**Rules:**

1. **In-app**: ALL events except maintenance/announcements get an in-app notification (bell dropdown, grouped Today / Earlier)
2. **Email --- Daily digest (default 7am local)**: Events #1, 2, 5, 8, 12, 14 batch into the morning digest. If user was absent >30min after an agent completes (#1), that item is also included as a highlighted row.
3. **Email --- Weekly digest (Sunday 7am)**: Events #3, 4, 15. Aggregated score movement + competitor summary + performance report.
4. **Email --- Instant (breaks daily cap)**: Events #6, 7, 10, 16, 17, 18. These bypass the 1-email/day rule. Max 3 instant emails/day hard cap.
5. **Email --- Transactional instant**: Events #9, 11 (subscription lifecycle). Always sent regardless of digest preferences.
6. **Push (browser)**: Opt-in only. Eligible events: #1, 6, 7, 10. User toggles in Settings.
7. **Quiet hours**: No emails between `quiet_hours_start` and `quiet_hours_end` (user-configurable). Instant budget/payment alerts override quiet hours.

## Part 3: Daily Digest Spec

**Send time:** 7am in user's local timezone (stored in `notification_preferences.email_digest` as timezone string).

**Template structure (Resend + React Email):**

```
Subject: "Your Beamix morning brief --- [date]"

[Logo]

SCORE: [current] ([+/-delta] this week) --- sparkline image (pre-rendered SVG)

ITEMS AWAITING REVIEW: [count]
  1. [title] --- [agent_type] --- [created_at relative]
  2. [title] --- [agent_type]
  3. [title] --- [agent_type]
  [+ N more] (if count > 3)

  [Review in Inbox ->] button

NEW SUGGESTIONS: [count] actions recommended
  [View suggestions ->] button

AUTOMATION STATUS:
  [N] agents active --- next scheduled run: [time]
  Credits used: [used]/[total] this month

COMPETITOR ALERTS (if any this week):
  "[Competitor]" appeared in [N] new queries where you don't.

[Manage notifications] footer link
```

**Data fetched at send time (Inngest cron, runs 6:50am per timezone bucket):**
- `content_items` WHERE `status = 'draft' OR status = 'in_review'` AND `user_id = ?` --- count + top 3
- `scans` latest --- score delta vs 7 days ago
- `recommendations` WHERE `status = 'pending'` --- suggestion count
- `agent_schedules` WHERE `is_active = true` --- next run time
- `credit_pools` --- used vs allocation
- `competitors` movement from last scan

## Part 4: Notification Settings Page

**Location:** Settings > Notifications tab

**Controls:**

| Category | Event | In-App | Email | Push |
|----------|-------|--------|-------|------|
| **Agent Output** | Run complete (draft ready) | Always on | Toggle (default: ON) | Toggle (default: OFF) |
| **Scans** | Scan complete | Always on | Toggle (default: ON) | -- |
| **Scans** | Score change | Always on | Weekly digest | -- |
| **Competitors** | Competitor movement | Always on | Toggle (default: ON) | -- |
| **Suggestions** | New suggestions | Always on | Toggle (default: ON) | -- |
| **Budget** | 75% budget alert | Always on | Always on | Toggle (default: OFF) |
| **Budget** | 100% / auto-paused | Always on | Always on | Toggle (default: ON) |
| **Subscription** | Payment failed | Always on | Always on | Always on |
| **Subscription** | Plan changes / renewal | Always on | Always on | -- |
| **Content** | Off-site verified | Always on | Toggle (default: ON) | -- |
| **Content** | New reviews detected | Always on | Toggle (default: ON) | -- |
| **System** | New features | Always on | Toggle (default: ON) | -- |

**Global controls (top of page):**
- Pause all emails (toggle) --- stops everything except payment-failed
- Daily digest time (dropdown: 6am--10am in 30min increments, default 7am)
- Quiet hours: start time + end time (or "No quiet hours")
- Timezone (auto-detected, editable)

## Part 5: Existing Templates Mapping

**Current state:** 15 Resend templates referenced in codebase. Both cron endpoints (`weekly-digest`, `trial-nudges`) are stubs --- sending is disabled.

| Old Template | Status | New Mapping |
|-------------|--------|-------------|
| Welcome email | KEEP | Unchanged --- sent on signup |
| Trial started | KILL | No trial. Replace with "Money-back guarantee" confirmation |
| Trial day 3 nudge | KILL | No trial |
| Trial day 5 nudge | KILL | No trial |
| Trial expiring (day 6) | KILL | Replace with guarantee-expiring (day 12, event #18) |
| Trial expired | KILL | No trial |
| Scan complete | ABSORB | Folded into daily digest |
| Agent complete | ABSORB | Folded into daily digest |
| Weekly digest | REWRITE | New daily digest template (Part 3) + separate weekly score digest |
| Payment success | KEEP | Paddle transactional |
| Payment failed | KEEP | Instant alert (event #10) |
| Subscription cancelled | KEEP | Unchanged |
| Password reset | KEEP | Auth flow |
| Magic link | KEEP | Auth flow |
| Feature announcement | KEEP | System instant (event #17) |

**New templates needed:**
1. Daily digest (Part 3 above)
2. Weekly score + competitor digest
3. Budget 75% alert
4. Budget 100% / paused alert
5. Money-back guarantee confirmation (replaces trial-started)
6. Guarantee expiring (day 12)

**MVP-1 day-14 priority (6 must-send):**
1. Welcome email (existing)
2. Daily digest (new)
3. Payment failed (existing)
4. Budget 75% alert (new)
5. Budget 100% alert (new)
6. Guarantee expiring day 12 (new)

## Part 6: DB Schema

**`notifications` table --- EXISTS. Changes needed:**

| Column | Current | Change |
|--------|---------|--------|
| `type` | `string` | Change to enum: `agent_complete`, `scan_complete`, `score_change`, `competitor_movement`, `suggestion_new`, `budget_75`, `budget_100`, `credit_low`, `subscription_renewed`, `payment_failed`, `plan_changed`, `offsite_verified`, `content_published`, `reviews_detected`, `performance_report`, `maintenance`, `feature_announcement`, `guarantee_expiring` |
| `channel` | MISSING | Add: `in_app` / `email` / `push` |
| `delivered_at` | MISSING | Add: `timestamptz null` |
| `email_batch_id` | MISSING | Add: `uuid null` --- links to digest batch |
| `severity` | EXISTS (`string`) | Keep --- map: `info`, `warning`, `critical` |
| `reference_id` | MISSING | Add: `uuid null` --- FK to source record (agent_job_id, scan_id, etc.) |
| `reference_type` | MISSING | Add: `string null` --- `agent_job`, `scan`, `content_item`, `subscription` |

**`notification_preferences` table --- EXISTS. Changes needed:**

| Column | Current | Change |
|--------|---------|--------|
| `email_digest` | `string null` | Repurpose as timezone string (e.g., `Asia/Jerusalem`) |
| `digest_send_time` | MISSING | Add: `time` default `07:00` |
| `push_enabled` | MISSING | Add: `boolean` default `false` |
| `push_agent_complete` | MISSING | Add: `boolean` default `false` |
| `push_budget_critical` | MISSING | Add: `boolean` default `true` |
| `pause_all_emails` | MISSING | Add: `boolean` default `false` |
| `timezone` | MISSING | Add: `text` default `UTC` |

Existing columns (`agent_completion`, `competitor_alerts`, `scan_complete_emails`, `daily_digest`, `weekly_digest`, `quiet_hours_start/end`, `ranking_change_alerts`) map cleanly to the new event catalog. No drops needed.

**New table: `digest_queue`**

```sql
CREATE TABLE digest_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  notification_id uuid REFERENCES notifications NOT NULL,
  digest_type text NOT NULL CHECK (digest_type IN ('daily', 'weekly')),
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_digest_queue_pending ON digest_queue (scheduled_for) WHERE sent_at IS NULL;
```

---

# TASK B --- CONTENT EXPORT FLOW

## Part 7: Post-Approve Flow

**Step-by-step after user clicks "Approve" in Inbox:**

1. `content_items.status` updates from `in_review` to `approved`
2. Item moves from Inbox list to Archive automatically
3. In-app notification: "Content approved --- ready to export"
4. Archive item shows export toolbar:

| Action | Available for | Behavior |
|--------|--------------|----------|
| Copy as Markdown | All content agents | Clipboard copy, toast confirmation |
| Copy as HTML | Content Optimizer, Blog Strategist, FAQ Builder, Freshness Agent | Renders markdown to HTML, clipboard copy |
| Download as .md | All content agents | Browser download, filename: `[title]-[date].md` |
| Copy JSON-LD | Schema Generator only | Raw JSON-LD to clipboard |
| Copy `<script>` block | Schema Generator only | Wraps in `<script type="application/ld+json">` |
| Mark as "Published" | All | Checkbox --- user self-reports after posting to their site |
| Enter published URL | All | Text input, appears after marking published |

5. **"Published" state trigger:** User self-report only (MVP). User checks "Published" checkbox and optionally enters the URL. System then:
   - Records `published_at` timestamp and `published_url`
   - Queues URL probe for +48h (if URL provided)
   - Next scan cycle checks if content appears in AI engine results
   - Archive item updates with verification badge (verified / unverified / failed)

## Part 8: CMS Integration Roadmap (Post-MVP)

| Integration | Value | Feasibility | Timeline | Notes |
|-------------|-------|-------------|----------|-------|
| **WordPress** | HIGH | HIGH | MVP-2 (month 2) | REST API well-documented, 43% of web. Ship first. |
| **Shopify** | MEDIUM | MEDIUM | Month 3 | Blog API exists but limited. High-value for e-commerce SMBs. |
| **Webflow** | MEDIUM | MEDIUM | Month 3 | CMS API. Design-forward SMBs. |
| **Framer** | LOW | HIGH | Month 4 | CMS API available (we have MCP). Small user base. |
| **Wix** | MEDIUM | LOW | Month 5+ | API is restrictive, developer experience poor. |
| **Custom webhook** | HIGH | HIGH | MVP-2 | POST to user-defined URL with JSON payload. Covers edge cases. |

**Ship first: WordPress + Custom Webhook** (month 2). WordPress covers the largest segment. Webhook covers everyone else with a developer.

## Part 9: Schema Generator Special Case

Schema JSON-LD has a unique export because users paste it into their site's `<head>`:

| Export Option | Behavior |
|--------------|----------|
| Copy raw JSON-LD | Clipboard: the JSON object only |
| Copy as `<script>` block | Clipboard: `<script type="application/ld+json">[json]</script>` --- ready to paste into HTML `<head>` |
| Test on Google | Opens `https://search.google.com/test/rich-results?url=[encoded_published_url]` in new tab. Only enabled after user enters published URL. |
| Auto-install | Post-MVP. If WordPress/CMS integration is connected, one-click inject into site `<head>`. |

The Inbox preview for Schema Generator renders the JSON with syntax highlighting (Geist Mono font, dark code block). Evidence panel shows: which schema types were generated, target page URL, and which engines value this schema type.

## Part 10: Off-Site Submission Package Export

Off-Site Presence Builder, Review Presence Planner, and Entity Builder produce submission packages (not publishable content). Export differs:

| Element | Behavior |
|---------|----------|
| Pre-filled fields | Each platform submission displays as a card with labeled fields (Business Name, Description, Category, etc.). Individual "Copy" button per field. |
| "Open [Platform]" button | Deep-links to the platform's submission/claim URL (e.g., `https://www.yelp.com/biz_info`, `https://business.google.com/create`). Opens in new tab. |
| Checklist state | Each platform row has a checkbox: "Submitted" / "Not yet". User marks as they go. Persisted in `content_items.metadata` JSONB. |
| Verification | After user marks all platforms submitted, system queues URL probes (+48h). Next scan confirms citations. Archive item shows per-platform verification status. |
| PDF export (MVP-2) | Full submission package as downloadable PDF for printing or offline use. Not in MVP-1. |

---

## Out of Scope (MVP-1)

- Push notifications (browser) --- infrastructure only, no UI in MVP-1
- CMS direct-publish integrations (WordPress, Shopify, etc.)
- PDF export of submission packages
- Slack/webhook notification channels (columns exist in DB but not wired)
- SMS notifications
- Notification grouping/threading beyond Today/Earlier

## User Stories

- As a Build-tier user, I want a morning email summarizing what my agents produced overnight, so that I can review and approve content during my morning routine without logging in first.
- As a Scale-tier user, I want instant alerts when my credit budget hits 75%, so that I can adjust automation before runs get paused.
- As any paying user, I want to copy agent output as formatted HTML or Markdown from Archive, so that I can paste it directly into my website CMS.
- As a user who approved a Schema Generator output, I want a ready-to-paste `<script>` block, so that I can add structured data to my site without manual JSON editing.

## Acceptance Criteria

- [ ] Given an agent job completes, when the user has email enabled, then the output appears in the next daily digest email (sent via Resend)
- [ ] Given credit usage hits 75%, when the user is on any paid tier, then an instant email is sent within 60 seconds (bypassing daily cap)
- [ ] Given a user clicks "Approve" on an Inbox item, then the item status changes to `approved`, moves to Archive, and shows the export toolbar with Copy Markdown + Copy HTML + Download .md options
- [ ] Given a Schema Generator output is approved, then the export toolbar shows "Copy JSON-LD" and "Copy `<script>` block" buttons
- [ ] Given a user marks content as "Published" and enters a URL, then the system queues a verification probe for +48h and updates the Archive item with verification status after the next scan
- [ ] Given a user visits Settings > Notifications, then they can toggle email on/off per event category, set digest time, and set quiet hours
- [ ] Given the daily digest cron runs, then it batches only events from the past 24h that the user has not yet seen in-app, and sends a single email per user

## RICE Score

| Factor | Value | Rationale |
|--------|-------|-----------|
| Reach | 100% of paid users | Every user needs notifications; every user exports content |
| Impact | 2 (High) | Directly drives the scan-improve-verify loop speed |
| Confidence | 80% | Architecture is approved; DB schema exists; email provider (Resend) is integrated |
| Effort | 3 weeks | 1.5w notifications + digest + settings; 1.5w export flow + archive toolbar |
| **RICE** | **(100 x 2 x 0.8) / 3 = 53.3** | |

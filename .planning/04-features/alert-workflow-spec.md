# Beamix — Alert System & Agent Workflow Chains Spec

> **Version:** 1.0
> **Date:** 2026-03-08
> **Author:** Atlas (CTO)
> **Status:** Ready for implementation
> **Audience:** Engineers building the alert and workflow subsystems. Assumes no prior reading of system design docs.

---

## 1. Feature Overview

### What This Document Covers

Two interconnected subsystems form Beamix's "autonomous" layer:

1. **Alert System** — monitors business data in real-time and notifies users via in-app, email, or Slack when significant events occur. 9 alert types, 3 delivery channels, fully user-configurable.

2. **Agent Workflow Chains** — event-triggered multi-agent pipelines that automatically chain agents together in response to scan results, onboarding events, or alert triggers. 4 built-in workflows.

### Why They Belong Together

Alerts and workflows are co-triggers. An alert fires when a threshold is crossed. A workflow fires in response to the same threshold crossing — but instead of notifying the user, it takes action (runs agents). Both are evaluated in the same Inngest step (`alert.evaluate`) immediately after every scan completes.

The competitive distinction is important: every GEO platform shows dashboards and sends notifications. Beamix is different because when visibility drops, the platform automatically queues the agents to fix it — not just inform the user. Alerts tell you what happened. Workflows fix it.

### Where This Fits in the System

```
Scan completes
    |
    v
alert.evaluate (Inngest function)
    |
    |--- evaluate alert_rules → create notifications → route to channels
    |
    `--- evaluate workflow triggers → send workflow/trigger event
                                            |
                                            v
                                    workflow.execute (Inngest function)
                                            |
                                            `--- chain agents sequentially
```

---

## 2. Alert Types (9 Types)

All alert types are stored in `alert_rules.alert_type` as text. The CHECK constraint is:

```sql
CHECK IN (
  'visibility_drop',
  'visibility_improvement',
  'new_competitor',
  'competitor_overtake',
  'sentiment_shift',
  'credit_low',
  'content_performance',
  'scan_complete',
  'agent_complete',
  'trial_ending'
)
```

> Note: The architecture spec lists `visibility_improvement` and `sentiment_shift` rather than `visibility_rise` and `sentiment_change`. Use the exact enum values from the CHECK constraint above. Do not invent alternate names.

### 2.1 `visibility_drop`

**What triggers it:** Overall visibility score for the business drops by more than the configured threshold percentage compared to the previous scan.

**Threshold config (`alert_rules.threshold` JSONB):**
```json
{ "drop_percent": 15 }
```
Default threshold: 15%. User can configure 5% to 50% in the Settings UI.

**Evaluation logic:**
```
previous_scan.overall_score - current_scan.overall_score >= threshold.drop_percent
```

**Example notification title:** "Your AI visibility dropped 18 points"
**Example body:** "Your visibility score fell from 74 to 56 since your last scan. This may indicate a competitor moved ahead or your content is losing relevance."
**Action URL:** `/dashboard` (with visibility trend widget highlighted)
**Default channels:** in-app + email
**Severity:** `high`
**Cooldown:** 24 hours
**Default:** enabled

**Workflow trigger:** This alert type also triggers the "Visibility Drop Response" workflow chain automatically.

---

### 2.2 `visibility_improvement`

**What triggers it:** Overall visibility score improves by more than the configured threshold since the previous scan.

**Threshold config:**
```json
{ "rise_percent": 10 }
```
Default: 10%.

**Evaluation logic:**
```
current_scan.overall_score - previous_scan.overall_score >= threshold.rise_percent
```

**Example notification title:** "Your AI visibility improved"
**Example body:** "Your visibility score rose from 52 to 67 since your last scan. Check your rankings to see which engines improved."
**Action URL:** `/dashboard/rankings`
**Default channels:** in-app
**Severity:** `low`
**Cooldown:** 24 hours
**Default:** enabled

---

### 2.3 `competitor_overtake`

**What triggers it:** A tracked competitor's visibility score rises above the user's business's score during the current scan.

**Threshold config:**
```json
{ "competitor_id": "uuid" }
```
One rule per competitor. The UI creates rules automatically for each tracked competitor.

**Evaluation logic:**
```
competitor_scan.rank_position < user_scan.rank_position on any engine
```
More precisely: a competitor is "overtaking" if they now appear in a higher position (lower number) than the user on at least one engine, when they were not previously.

**Example notification title:** "Harel Insurance is now outranking you on Gemini"
**Example body:** "Harel Insurance moved to position #2 on Gemini while you are at #4. Consider running a Competitor Intelligence analysis."
**Action URL:** `/dashboard/competitors`
**Default channels:** in-app + email
**Severity:** `high`
**Cooldown:** 48 hours (prevents alert spam if a competitor fluctuates)
**Default:** enabled

**Workflow trigger:** Also triggers the "Competitor Alert Response" workflow chain.

---

### 2.4 `new_competitor`

**What triggers it:** An AI engine response mentions a business that is not in the user's tracked competitors list and has not been mentioned before.

**Threshold config:**
```json
{ "min_engines_mentioned": 2 }
```
Requires the new competitor to appear on at least 2 engines before alerting (reduces false positives).

**Evaluation logic:** After parsing `scan_engine_results.competitors_mentioned`, identify domains/names not present in `competitors` table for this business and meeting the engine count threshold.

**Example notification title:** "A new competitor appeared in your scans"
**Example body:** "OptimalInsurance.co.il was mentioned by 3 AI engines when asked about insurance in Tel Aviv. Want to add them to your tracked competitors?"
**Action URL:** `/dashboard/competitors`
**Default channels:** in-app
**Severity:** `medium`
**Cooldown:** 7 days per competitor name (prevents repeated alerts for the same new entrant)
**Default:** enabled

---

### 2.5 `sentiment_shift`

**What triggers it:** The average sentiment score across engines changes significantly between scans.

**Threshold config:**
```json
{ "drop_points": 15 }
```
The sentiment score is a 0-100 integer (not an enum — see Architecture Layer §2.3 for rationale). A drop of 15+ points is significant.

**Evaluation logic:**
```
previous_avg_sentiment - current_avg_sentiment >= threshold.drop_points
```
Where `avg_sentiment` is computed across all `scan_engine_results.sentiment_score` values for the latest scan.

**Example notification title:** "AI engines are talking about you less positively"
**Example body:** "Your average sentiment score dropped from 78 to 59 since your last scan. This may indicate negative content is influencing AI responses about your business."
**Action URL:** `/dashboard` (brand narrative section)
**Default channels:** in-app + email
**Severity:** `medium`
**Cooldown:** 48 hours
**Default:** enabled

---

### 2.6 `credit_low`

**What triggers it:** The user's available credits fall below the configured threshold.

**Available credits formula:** `base_allocation + rollover_amount + topup_amount - used_amount - held_amount`

**Threshold config:**
```json
{ "credits_remaining": 3 }
```
Default: alert when 3 or fewer credits remain.

**Evaluation logic:** Compute available credits from `credit_pools` after each agent execution. If result <= threshold, and no credit_low alert was sent within cooldown, fire.

**Note:** This alert is NOT evaluated in the post-scan `alert.evaluate` function. It is evaluated immediately after each agent execution completes in the `agent.execute` Inngest function.

**Example notification title:** "You have 2 agent credits remaining"
**Example body:** "You've used 13 of 15 agent credits this month. Your credits reset on March 28. To run more agents now, add credits in Settings."
**Action URL:** `/dashboard/settings?tab=billing`
**Default channels:** in-app + email
**Severity:** `medium`
**Cooldown:** 24 hours
**Default:** enabled

---

### 2.7 `agent_complete`

**What triggers it:** An agent job finishes (successfully or with failure).

**Threshold config:**
```json
{ "agent_types": ["content_writer", "blog_writer"] }
```
Optional filter. If empty array, fires for all agent types.

**Evaluation logic:** Evaluated in `agent.execute` Inngest function on job status transition to `completed` or `failed`.

**Example notification title (success):** "Your blog post is ready to review"
**Example body:** "Content Writer finished: 'How Tel Aviv Businesses Can Improve AI Search Visibility'. Review and publish from your content library."
**Action URL:** `/dashboard/content/[content_item_id]`
**Example title (failure):** "Content Writer couldn't complete your request"
**Default channels:** in-app + email
**Severity:** `low` (success), `medium` (failure)
**Cooldown:** 0 (always notify on completion)
**Default:** enabled

---

### 2.8 `content_performance`

**What triggers it:** A published content piece crosses a significant performance threshold compared to its baseline visibility score at publication time.

**Threshold config:**
```json
{ "score_delta": 10 }
```
Fires when a published content piece is correlated with a 10+ point improvement in overall visibility.

**Evaluation logic:** Computed during the post-scan `content_performance` pipeline step. If `content_performance.score_delta >= threshold.score_delta`, fire this alert.

**Example notification title:** "Your blog post improved your visibility by 12 points"
**Example body:** "'How to Choose an Insurance Agent in Israel' has improved your AI visibility score by 12 points since publication. See the full impact."
**Action URL:** `/dashboard/content/[content_item_id]`
**Default channels:** in-app + email
**Severity:** `low`
**Cooldown:** 7 days per content item
**Default:** enabled

---

### 2.9 `scan_complete`

**What triggers it:** Any scan (scheduled or manual) finishes for the user's business.

**Threshold config:**
```json
{}
```
No threshold — always fires when scan completes (if enabled).

**Evaluation logic:** Fires as the final step of every scan pipeline.

**Note:** This alert is opt-in. It is OFF by default. Most users do not want a notification after every scan — they only want alerts for meaningful changes. The email system's `scan_complete` email template handles this separately (via `notification_preferences.scan_complete_emails`).

**Example notification title:** "Scan complete — your latest results are ready"
**Example body:** "Your weekly AI visibility scan is done. Your current score is 71/100. View your updated rankings."
**Action URL:** `/dashboard`
**Default channels:** in-app (not email — email is handled by `sendScanComplete()` function)
**Severity:** `low`
**Cooldown:** 0 (fires every scan if enabled)
**Default:** disabled (opt-in)

---

## 3. Alert Data Model

### 3.1 `alert_rules` Table

Full schema:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| id | uuid | gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL | Owner (FK → auth.users(id) ON DELETE CASCADE) |
| business_id | uuid | NOT NULL | Business to monitor (FK → businesses(id) ON DELETE CASCADE) |
| alert_type | text | NOT NULL | One of the 9 types in §2 |
| threshold | jsonb | NOT NULL | Type-specific config (see §2 per-type) |
| channels | text[] | '{inapp}' | Array of: 'inapp', 'email', 'slack' |
| is_active | boolean | true | Soft-disable without deleting |
| cooldown_hours | integer | 24 | Hours before same alert type can fire again for this rule |
| last_triggered_at | timestamptz | NULL | Updated on each trigger, used for deduplication |
| created_at | timestamptz | NOW() | |

**Index:** `idx_alert_rules_biz` on `(business_id)` WHERE `is_active = true`
**RLS:** Full CRUD for own businesses

**Critical constraint:** `UNIQUE(user_id, business_id, alert_type)` is NOT enforced at DB level. A user can have multiple rules of the same type with different thresholds (e.g., two `visibility_drop` rules: one at 10%, one at 25%). The UI should show all rules per type in the Settings Notifications tab.

### 3.2 `notifications` Table

Every fired alert creates one `notifications` row:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| id | uuid | gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL | Recipient (FK → auth.users(id) ON DELETE CASCADE) |
| type | text | NOT NULL | Alert type that generated this (matches alert_rules.alert_type) |
| severity | text | NOT NULL | `'high'`, `'medium'`, or `'low'` |
| title | text | NOT NULL | Short notification title (displayed in bell dropdown) |
| body | text | NOT NULL | Full notification body |
| action_url | text | NULL | Deep link into dashboard |
| is_read | boolean | false | Read/unread state |
| read_at | timestamptz | NULL | Set when marked read |
| created_at | timestamptz | NOW() | |

**Index:** `idx_notifications_user_unread` on `(user_id, is_read)` WHERE `is_read = FALSE`
**RLS:** Users can SELECT own, UPDATE `is_read` and `read_at` only. Service role inserts.
**Retention:** 90 days. `cron.cleanup` deletes notifications older than 90 days daily at 4AM UTC.

### 3.3 `notification_preferences` Table

Controls which channels are available for each user:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| id | uuid | gen_random_uuid() | Primary key |
| user_id | uuid | UNIQUE, NOT NULL | One row per user |
| email_enabled | boolean | true | Receive email notifications |
| email_digest | text | 'daily' | `'realtime'`, `'daily'`, `'weekly'`, `'off'` |
| inapp_enabled | boolean | true | In-app notifications |
| slack_webhook_url | text | NULL | Slack incoming webhook URL |
| slack_enabled | boolean | false | Slack notifications active |
| quiet_hours_start | time | NULL | Do-not-disturb start (user's timezone) |
| quiet_hours_end | time | NULL | Do-not-disturb end |
| created_at | timestamptz | NOW() | |
| updated_at | timestamptz | NOW() | |

**Created by:** `on_user_created_prefs` trigger after `user_profiles` INSERT
**RLS:** Users can SELECT and UPDATE own row. Service role inserts (trigger).

> Note: The `notification_preferences` table also stores the per-category opt-out booleans for the email system (`scan_complete_emails`, `agent_complete_emails`, `weekly_digest`, `ranking_alerts`, `competitor_alerts`) as documented in the email-system-spec. Both schemas live in the same table.

### 3.4 Cooldown Deduplication

The cooldown mechanism prevents alert spam. Before firing any alert:

```
1. Load alert_rule.last_triggered_at
2. If last_triggered_at IS NULL → proceed (first trigger)
3. If NOW() - last_triggered_at < cooldown_hours → SKIP (deduplication)
4. If NOW() - last_triggered_at >= cooldown_hours → proceed
5. After firing: SET last_triggered_at = NOW()
```

Cooldown is per `alert_rules` row, not per alert type globally. If a user has two `visibility_drop` rules (10% threshold and 25% threshold), each has independent cooldown tracking.

---

## 4. Alert Evaluation Pipeline

### 4.1 Trigger

The `alert.evaluate` Inngest function is triggered by the `alert/evaluate` event. This event is emitted from two places:

1. **After every scan completes** — in the final steps of `scan.free.run`, `scan.scheduled.run`, and `scan.manual.run`
2. **After each agent execution completes** — in `agent.execute` (for `credit_low` and `agent_complete` alerts)

The event payload:
```json
{
  "name": "alert/evaluate",
  "data": {
    "businessId": "uuid",
    "userId": "uuid",
    "context": {
      "scanId": "uuid",
      "currentScore": 56,
      "previousScore": 74,
      "scoreDelta": -18,
      "engineResults": [...],
      "competitorResults": [...],
      "contentPerformance": [...],
      "creditBalance": 3,
      "agentJobId": "uuid | null"
    }
  }
}
```

All context data needed for rule evaluation is passed in the event payload. The `alert.evaluate` function does NOT re-query the database for scan results — this data is passed from the scan pipeline that already has it in memory.

### 4.2 `alert.evaluate` Inngest Function

**Function ID:** `alert.evaluate`
**Trigger:** Event `alert/evaluate`
**Concurrency:** 50 system-wide
**Timeout:** 30 seconds
**Retries:** 2 (alert delivery should retry on transient failures)

**Step 1: `fetch-rules`**

Load all active alert rules for the business:
```
SELECT * FROM alert_rules
WHERE business_id = event.data.businessId
AND is_active = true
```

**Step 2: `evaluate-rules`**

For each rule, evaluate the condition against `event.data.context`. Logic per alert type:

| Alert Type | Condition Check |
|------------|----------------|
| `visibility_drop` | `context.scoreDelta <= -(threshold.drop_percent)` |
| `visibility_improvement` | `context.scoreDelta >= threshold.rise_percent` |
| `competitor_overtake` | Iterate `context.competitorResults`, check if any competitor moved above user on any engine |
| `new_competitor` | Identify business names in engine results not in user's competitors table |
| `sentiment_shift` | Compute avg sentiment delta from `context.engineResults` |
| `scan_complete` | Always true if triggered by scan event |
| `credit_low` | `context.creditBalance <= threshold.credits_remaining` |
| `agent_complete` | `context.agentJobId IS NOT NULL` and job status is terminal |
| `content_performance` | Iterate `context.contentPerformance`, check for delta >= threshold |

For each rule that evaluates to true:

1. Check cooldown: if `NOW() - rule.last_triggered_at < rule.cooldown_hours` → skip this rule
2. Mark triggered: build notification payload (title, body, action_url, severity)
3. Collect triggered rules for routing

**Step 3: `route-notifications`**

For each triggered rule, check `notification_preferences` for the user and route accordingly:

```
For each triggered_rule:
  channels = rule.channels (e.g., ['inapp', 'email'])

  if 'inapp' in channels AND preferences.inapp_enabled:
    INSERT INTO notifications (user_id, type, severity, title, body, action_url)
    Push via Supabase Realtime (postgres_changes on notifications table)

  if 'email' in channels AND preferences.email_enabled:
    Select correct email template (see §5.3)
    Call sendEmail() via Resend
    Respect email_digest setting (realtime=send now, daily/weekly=queue)

  if 'slack' in channels AND preferences.slack_enabled AND preferences.slack_webhook_url:
    POST to slack_webhook_url with Block Kit payload (see §5.4)

  UPDATE alert_rules SET last_triggered_at = NOW() WHERE id = rule.id
```

---

## 5. Notification Delivery

### 5.1 In-App Notifications

In-app notifications appear in a bell icon dropdown in the dashboard navigation bar (top-right of the sidebar header area).

**Bell badge:** Shows count of unread notifications. Badge is red for any `severity = 'high'` unread. Grey otherwise.

**Notification list (dropdown):**
```
┌──────────────────────────────────────────────────────┐
│  Notifications                          [Mark all read] │
├──────────────────────────────────────────────────────┤
│  [HIGH] Your AI visibility dropped 18 points          │
│  Your score fell from 74 to 56 since last scan        │
│  2 minutes ago                          [View →]      │
├──────────────────────────────────────────────────────┤
│  [MED] Harel Insurance is outranking you on Gemini    │
│  They moved to #2, you are at #4                      │
│  5 minutes ago                          [View →]      │
├──────────────────────────────────────────────────────┤
│  [LOW] Your blog post improved visibility by 12pts    │
│  'How to Choose Insurance in Israel'                  │
│  Yesterday                              [View →]      │
└──────────────────────────────────────────────────────┘
```

Unread notifications have a distinct background. Clicking any notification marks it read and navigates to `action_url`.

**Full notification list page:** `/dashboard/notifications` — lists all notifications (paginated, 20 per page) with filter by type and read status.

### 5.2 Supabase Realtime Push

After a `notifications` row is inserted by the service role, Supabase Realtime broadcasts the change to connected clients subscribed to the `notifications` table for their `user_id`.

**Client subscription (in dashboard layout):**
```typescript
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      // Increment bell badge count
      // Optionally show toast notification
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  )
  .subscribe()
```

This ensures users see new notifications immediately without polling, even if the dashboard tab is already open during a scan.

### 5.3 Email Delivery

Email notifications use the Resend + React Email system (see `email-system-spec.md`). The mapping between alert types and email templates:

| Alert Type | Email Template | `sendEmail` Function |
|------------|---------------|---------------------|
| `visibility_drop` | `ranking-drop.tsx` | `sendRankingDrop()` |
| `competitor_overtake` | `competitor-moved.tsx` | `sendCompetitorMoved()` |
| `agent_complete` | `agent-complete.tsx` | `sendAgentComplete()` |
| `scan_complete` | `scan-complete.tsx` | `sendScanComplete()` |
| All others | No dedicated template | Inline via `sendEmail()` with generic template |

For alert types without a dedicated template (`visibility_improvement`, `sentiment_shift`, `new_competitor`, `credit_low`, `content_performance`), use the generic `sendEmail()` wrapper directly with a constructed title and body.

**Email throttling:** The `alert_rules.cooldown_hours` mechanism prevents duplicate emails for the same alert type within the cooldown window. For `ranking_alerts`, an additional throttle of max 1 per business per 24h is enforced (matching email-system-spec §14). For `competitor_alerts`, max 1 per competitor per 48h.

**Digest mode:** If `notification_preferences.email_digest = 'daily'` or `'weekly'`, alerts should be queued and bundled. Implementation detail: store alert payloads in a queue table or use Inngest delayed events. The daily digest cron (`cron.trial-nudges` already exists; a separate `cron.alert-digest` may be needed for digest batching). Mark as a Growth Phase feature — initially ship as `realtime` only.

### 5.4 Slack Delivery

When `notification_preferences.slack_enabled = true` and `slack_webhook_url` is set:

**Request format:** POST to `slack_webhook_url` with content-type `application/json`

**Block Kit payload:**
```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Beamix Alert: Your AI visibility dropped 18 points"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Your visibility score fell from *74* to *56* since your last scan.\n\n<https://app.beamix.io/dashboard|View Dashboard>"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "Beamix GEO Platform | Acme Insurance"
        }
      ]
    }
  ]
}
```

**Failure handling:** If the Slack webhook POST returns a non-200 response (e.g., 404 = webhook deleted):
1. Log the error
2. Update `notification_preferences.slack_enabled = false`
3. Update integration record status to `'error'`
4. Send in-app notification: "Your Slack integration stopped working. Reconnect in Settings."

### 5.5 Mark as Read API Routes

**Mark single notification read:**
```
PATCH /api/alerts/notifications/[id]/read
Auth: Required (user must own the notification)
Body: none
Response: { data: { id, is_read: true, read_at: "timestamp" } }
```

Implementation:
```sql
UPDATE notifications
SET is_read = true, read_at = NOW()
WHERE id = $1 AND user_id = auth.uid()
RETURNING *
```

**Bulk mark all read:**
```
POST /api/alerts/notifications/bulk-read
Auth: Required
Body: { ids?: string[] }  -- if ids omitted, marks ALL unread as read
Response: { data: { updated_count: N } }
```

---

## 6. Alert Rule Configuration (User-Facing)

### 6.1 Location in the App

Alert rules are configured in **Settings → Preferences tab** (not the Integrations tab). The Preferences tab has two sections:
1. Interface preferences (language, timezone)
2. Notification preferences (email opt-outs, per-alert-type configuration)

For each of the 9 alert types, the user sees a collapsible row:

```
┌────────────────────────────────────────────────────────────────┐
│  Notifications                                                   │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  VISIBILITY ALERTS                                               │
│                                                                  │
│  [✓] Visibility drop        Notify when score drops by [15]%    │
│      via: [✓ In-app]  [✓ Email]  [ Slack]                       │
│                                                                  │
│  [✓] Visibility improvement  Notify when score rises by [10]%   │
│      via: [✓ In-app]  [ Email]   [ Slack]                       │
│                                                                  │
│  COMPETITOR ALERTS                                               │
│                                                                  │
│  [✓] Competitor overtakes you                                    │
│      via: [✓ In-app]  [✓ Email]  [ Slack]                       │
│                                                                  │
│  [✓] New competitor detected                                     │
│      via: [✓ In-app]  [ Email]   [ Slack]                       │
│                                                                  │
│  CONTENT & AGENTS                                                │
│                                                                  │
│  [✓] Agent job complete                                          │
│      via: [✓ In-app]  [✓ Email]  [ Slack]                       │
│                                                                  │
│  [✓] Content improves your score   Threshold: [10] points       │
│      via: [✓ In-app]  [✓ Email]  [ Slack]                       │
│                                                                  │
│  SYSTEM ALERTS                                                   │
│                                                                  │
│  [✓] Low credits     Alert when [3] credits remain              │
│      via: [✓ In-app]  [✓ Email]  [ Slack]                       │
│                                                                  │
│  [ ] Scan complete   (off by default)                            │
│      via: [✓ In-app]  [ Email]   [ Slack]                       │
│                                                                  │
│  Slack is not connected.  [Connect Slack →]                      │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

Slack channel selection is greyed out until Slack is connected in the Integrations tab.

### 6.2 Default Alert Rules Created on Onboarding

During `POST /api/onboarding/complete`, the following default `alert_rules` rows are created for the new business:

| Alert Type | Default Enabled | Default Channels | Default Threshold |
|------------|----------------|-----------------|-------------------|
| `visibility_drop` | Yes | `['inapp', 'email']` | `{ "drop_percent": 15 }` |
| `visibility_improvement` | Yes | `['inapp']` | `{ "rise_percent": 10 }` |
| `competitor_overtake` | Yes | `['inapp', 'email']` | `{}` (one rule per competitor, created when competitors are added) |
| `new_competitor` | Yes | `['inapp']` | `{ "min_engines_mentioned": 2 }` |
| `sentiment_shift` | Yes | `['inapp', 'email']` | `{ "drop_points": 15 }` |
| `credit_low` | Yes | `['inapp', 'email']` | `{ "credits_remaining": 3 }` |
| `agent_complete` | Yes | `['inapp', 'email']` | `{ "agent_types": [] }` |
| `content_performance` | Yes | `['inapp', 'email']` | `{ "score_delta": 10 }` |
| `scan_complete` | No | `['inapp']` | `{}` |

The competitor_overtake rules are created dynamically: one `alert_rules` row per competitor added to `competitors` table (in `POST /api/competitors`).

---

## 7. Agent Workflow Chains (4 Built-in Workflows)

Workflows are pre-defined chains stored in `agent_workflows`. The 4 built-in workflows are seeded into every new business's `agent_workflows` table on onboarding. Users can enable/disable and configure them from the Agent Hub (`/dashboard/agents`).

### 7.1 Workflow 1: Visibility Drop Response

**Name:** "Auto-fix visibility drops"
**Trigger type:** `visibility_drop`
**Trigger config:** `{ "threshold_percent": 15 }`
**Is active:** true (default on)
**Max runs per month:** 4

**Chain:**
```
A4 (Recommendations) — free, 0 credits
    |
    v (always)
A8 (Competitor Intelligence) — 1 credit
    |
    v (always)
A1 (Content Writer) — 1 credit
    |
    v
Notify user: "Workflow complete — we've analyzed and created content to recover your visibility"
```

**Total credits consumed:** 2 per run

**When does this fire automatically vs. require approval?**

This workflow fires automatically when:
- `scan/complete` event fires AND
- The scan shows a visibility drop >= 15% vs. previous scan AND
- `agent_workflows.is_active = true` AND
- `workflow_runs.runs_this_month < max_runs_per_month` AND
- User has >= 2 credits available

The workflow does NOT require user approval before running. The A4 (Recommendations) agent step runs at 0 credits (system-initiated) and always executes first. A8 and A1 consume credits. Users can disable this workflow in settings if they want to review recommendations before agents auto-run.

**`agent_workflows.steps` JSONB for this workflow:**
```json
[
  {
    "step_order": 1,
    "agent_type": "recommendations",
    "input_config": { "source": "latest_scan" },
    "condition": null,
    "depends_on": [],
    "on_failure": "abort"
  },
  {
    "step_order": 2,
    "agent_type": "competitor_intelligence",
    "input_config": {},
    "condition": null,
    "depends_on": [1],
    "on_failure": "skip"
  },
  {
    "step_order": 3,
    "agent_type": "content_writer",
    "input_config": { "content_type": "article", "context_from_step": 1 },
    "condition": null,
    "depends_on": [1, 2],
    "on_failure": "skip"
  }
]
```

---

### 7.2 Workflow 2: New Business Onboarding

**Name:** "Setup my workspace"
**Trigger type:** `manual` (fires automatically via event, not via user action)
**Trigger:** `onboarding/complete` Inngest event
**Is active:** true (always, cannot be disabled — it's a one-time setup)
**Max runs per month:** 1 (enforced by `onboarding_completed_at` timestamp check)

**Chain (parallel execution):**
```
A13 (Content Voice Trainer) — 1 credit*
A14 (Content Pattern Analyzer) — 1 credit*        -- run in PARALLEL
A11 (AI Readiness Auditor) — 1 credit*
    |
    | (all three complete)
    v
A4 (Recommendations) — free (0 credits)
    |
    v
Notify user: "Your workspace is set up. Here's what we found."
```

*These 3 agents use `transaction_type = 'system_grant'` — they are system-initiated and do NOT consume credits. See Architecture Layer §2.2 on system-initiated agents.

**Total user credits consumed:** 0 (system grant covers all 4)

**Parallel execution in Inngest:**

Parallel steps in `workflow.execute` use Inngest's `step.run()` with `Promise.allSettled()`:

```typescript
// Inside workflow.execute Inngest function
const [voiceResult, patternResult, readinessResult] = await Promise.allSettled([
  step.run('voice-trainer', () => triggerAgent('content_voice_trainer', businessId)),
  step.run('pattern-analyzer', () => triggerAgent('content_pattern_analyzer', businessId)),
  step.run('ai-readiness', () => triggerAgent('ai_readiness', businessId)),
])
// Then proceed regardless of individual failures
await step.run('recommendations', () => triggerAgent('recommendations', businessId))
```

**`agent_workflows.steps` JSONB:**
```json
[
  {
    "step_order": 1,
    "agent_type": "content_voice_trainer",
    "input_config": { "system_grant": true },
    "condition": null,
    "depends_on": [],
    "on_failure": "skip"
  },
  {
    "step_order": 2,
    "agent_type": "content_pattern_analyzer",
    "input_config": { "system_grant": true },
    "condition": null,
    "depends_on": [],
    "on_failure": "skip"
  },
  {
    "step_order": 3,
    "agent_type": "ai_readiness",
    "input_config": { "system_grant": true },
    "condition": null,
    "depends_on": [],
    "on_failure": "skip"
  },
  {
    "step_order": 4,
    "agent_type": "recommendations",
    "input_config": { "source": "onboarding" },
    "condition": null,
    "depends_on": [1, 2, 3],
    "on_failure": "abort"
  }
]
```

Steps 1, 2, and 3 all have `depends_on: []`, meaning the `workflow.execute` function executes them in parallel (all have no dependencies). Step 4 has `depends_on: [1, 2, 3]` — waits for all three to complete before proceeding.

---

### 7.3 Workflow 3: Content Lifecycle

**Name:** "30-day content refresh"
**Trigger type:** `content_published`
**Trigger config:** `{}`
**Is active:** false (default off — Growth Phase feature)
**Max runs per month:** 10

> **Phase note:** This workflow is a Growth Phase feature. The data model supports it at launch, but the UI for enabling/configuring it is built in Growth Phase. The `cron.content-refresh-check` daily cron handles the simpler version (checking stale content) at launch.

**Chain:**
```
Wait 30 days (Inngest step.sleep)
    |
    v
A15 (Content Refresh Agent) — 1 credit
    |
    v (on A15 complete)
Check scan data: correlate content performance delta
    |
    v
Notify user of content impact
```

**Total credits consumed:** 1 per run (after 30 days)

**The 30-day delay mechanism in Inngest:**

```typescript
// Inside workflow.execute Inngest function
const triggerEvent = event.data  // { contentId, businessId }

// Step 1: Record the trigger
await step.run('record-trigger', async () => {
  await db.workflow_runs.update({ status: 'waiting' })
})

// Step 2: Sleep for 30 days
// Inngest pauses the function and resumes it after the duration
// No compute cost during sleep — the function is suspended
await step.sleep('wait-30-days', '30d')

// Step 3: Run after the sleep completes
await step.run('refresh-content', async () => {
  // Check content still exists and is still published
  const content = await db.content_items.findById(triggerEvent.contentId)
  if (!content || content.status !== 'published') return // graceful skip

  // Trigger the refresh agent
  await triggerAgent('content_refresh', { contentId: triggerEvent.contentId })
})
```

Inngest's `step.sleep()` is the correct mechanism. The function is paused for exactly 30 days and resumes from the next step. No polling, no cron workarounds, no database scheduler needed.

---

### 7.4 Workflow 4: Competitor Alert Response

**Name:** "Auto-analyze competitor threats"
**Trigger type:** `competitor_overtake`
**Trigger config:** `{}`
**Is active:** true (default on)
**Max runs per month:** 5

**Chain:**
```
A8 (Competitor Intelligence) — 1 credit
    |
    v
A4 (Recommendations) — free (0 credits)
    |
    v
Notify user: "We've analyzed the threat and have recommendations"
```

**Total credits consumed:** 1 per run

**Trigger relationship with alerts:**

The `alert.evaluate` function evaluates `competitor_overtake` alert rules AND also checks `agent_workflows` with `trigger_type = 'competitor_overtake'`. Both can fire from the same scan. The user sees:
1. An in-app/email alert: "Harel Insurance is now outranking you on Gemini"
2. Minutes later, a second notification: "Competitor analysis complete — see 3 new recommendations"

---

## 8. Workflow Data Model

### 8.1 `agent_workflows` Table

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| id | uuid | gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL | Owner |
| business_id | uuid | NOT NULL | Business this applies to |
| name | text | NOT NULL | Display name |
| description | text | NULL | What this workflow does |
| trigger_type | text | NOT NULL | CHECK IN ('visibility_drop', 'scan_complete', 'competitor_overtake', 'schedule', 'manual', 'content_published', 'sentiment_shift') |
| trigger_config | jsonb | '{}' | Trigger parameters |
| steps | jsonb | NOT NULL | Ordered step definitions (see Zod schema below) |
| is_active | boolean | true | Can be disabled without deleting |
| max_runs_per_month | integer | 10 | Safety cap |
| runs_this_month | integer | 0 | Counter reset by `cron.monthly-credits` |
| last_run_at | timestamptz | NULL | |
| created_at | timestamptz | NOW() | |
| updated_at | timestamptz | NOW() | |

**Zod schema for `steps` (validated on every API write):**
```typescript
const WorkflowStepSchema = z.object({
  step_order: z.number().int().min(1),
  agent_type: z.enum([
    'content_writer', 'blog_writer', 'schema_optimizer', 'recommendations',
    'faq_agent', 'review_analyzer', 'social_strategy', 'competitor_intelligence',
    'citation_builder', 'llms_txt', 'ai_readiness', 'content_voice_trainer',
    'content_pattern_analyzer', 'content_refresh', 'brand_narrative_analyst'
  ]),
  input_config: z.record(z.unknown()).default({}),
  condition: z.string().nullable().default(null),
  depends_on: z.array(z.number().int()).default([]),
  on_failure: z.enum(['skip', 'abort']).default('skip'),
})

const WorkflowStepsSchema = z.array(WorkflowStepSchema).min(1).max(10)
```

Maximum 10 steps per workflow. `condition` supports simple expressions like `"previous_step.qa_score >= 0.7"` evaluated against the previous step's output — this is validated and sandboxed before evaluation.

**Index:** `idx_workflows_biz` on `(business_id)` WHERE `is_active = true`
**RLS:** Full CRUD for own businesses

### 8.2 `workflow_runs` Table

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| id | uuid | gen_random_uuid() | Primary key |
| workflow_id | uuid | NOT NULL | FK → agent_workflows(id) ON DELETE CASCADE |
| user_id | uuid | NOT NULL | Owner |
| trigger_event | jsonb | NOT NULL | The event that triggered this run |
| status | text | 'running' | CHECK IN ('running', 'completed', 'failed', 'cancelled') |
| steps_completed | integer | 0 | Progress counter |
| steps_total | integer | NOT NULL | Total steps in workflow |
| agent_job_ids | uuid[] | '{}' | Array of agent_job IDs created during this run |
| results_summary | jsonb | NULL | Aggregated results from all steps |
| credits_used | integer | 0 | Total credits consumed |
| started_at | timestamptz | NOW() | |
| completed_at | timestamptz | NULL | |

**Index:** `idx_workflow_runs_workflow` on `(workflow_id, started_at DESC)`
**RLS:** Users can SELECT own runs. Service role inserts/updates.

---

## 9. `workflow.execute` Inngest Function

**Function ID:** `workflow.execute`
**Trigger:** Event `workflow/trigger`
**Concurrency:** 5 per user (key: `event.data.userId`), no system cap specified
**Timeout:** 1800 seconds (30 minutes — workflows chain multiple agents, each can take up to 5 minutes)
**Retries:** 0 (individual agent steps have their own retry logic)

**Event payload:**
```json
{
  "name": "workflow/trigger",
  "data": {
    "workflowId": "uuid",
    "businessId": "uuid",
    "userId": "uuid",
    "triggerContext": {
      "trigger_type": "visibility_drop",
      "scan_id": "uuid",
      "score_delta": -18
    }
  }
}
```

**Execution steps:**

**Step 1: `validate-workflow`**
```
- Load agent_workflows row by workflowId
- Check is_active = true
- Check runs_this_month < max_runs_per_month
- Check user has sufficient credits for paid steps
- If any check fails: mark workflow_runs as 'failed', emit alert, return
```

**Step 2: `create-run`**
```
- INSERT workflow_runs row with status='running', steps_total from workflow.steps
- Return run_id for subsequent steps
```

**Steps 3-N: Agent execution (per step in workflow.steps, respecting depends_on)**

For sequential steps (a step with `depends_on: [previous_step_order]`):
```typescript
// Wait for previous step's agent to complete
const agentResult = await step.waitForEvent(`agent-complete-${stepOrder}`, {
  event: 'agent/execute.complete',
  match: 'data.jobId',  // matches the job_id we emitted
  timeout: '10m',       // max wait per agent
})
```

For parallel steps (multiple steps with `depends_on: []`):
```typescript
const parallelResults = await Promise.allSettled(
  parallelSteps.map(s =>
    step.run(`execute-step-${s.step_order}`, () => executeWorkflowStep(s, businessId))
  )
)
```

For each step execution:
1. If `step.condition` is non-null: evaluate expression against previous step output. If false, skip step (mark as skipped in `workflow_runs.results_summary`).
2. Place credit hold if agent is not free (use `hold_credits` RPC)
3. Insert `agent_jobs` row
4. Send `agent/execute` event to Inngest
5. Wait for `agent/execute.complete` event with matching jobId (up to 10 minutes)
6. On success: `confirm_credits`, increment `workflow_runs.steps_completed`
7. On failure: if `step.on_failure = 'abort'`: cancel remaining steps, mark workflow run as 'failed'. If `'skip'`: log failure in `results_summary`, continue to next step.

**Step final: `finalize-run`**
```
- UPDATE workflow_runs: status='completed', completed_at=NOW(), credits_used=total
- UPDATE agent_workflows: last_run_at=NOW(), runs_this_month+=1
- INSERT notifications: "Workflow complete" with summary of what agents produced
```

**Partial failure handling:**

If step 2 of 3 fails and `on_failure = 'skip'`:
- Steps 1 and 3 still execute (if step 3 doesn't `depends_on` step 2)
- `workflow_runs.results_summary` records which steps succeeded and which were skipped
- `workflow_runs.status = 'completed'` (partial success, not failure — user gets value from completed steps)
- Notification includes: "2 of 3 steps completed — Competitor Intelligence ran successfully, Content Writer was skipped."

If step 2 fails and `on_failure = 'abort'`:
- All subsequent steps are cancelled
- `workflow_runs.status = 'failed'`
- Credits for unstarted steps are not charged

---

## 10. API Routes

All alert and workflow routes require authentication. Auth is established via Supabase session cookie. Zod validation on all inputs.

### Alert Rules

**`GET /api/alerts/rules`**
```
Query: { business_id: uuid }
Response: { data: AlertRule[] }
```

**`POST /api/alerts/rules`**
```
Body: {
  business_id: uuid,
  alert_type: AlertType,
  threshold: object,  // Zod-validated per alert_type
  channels: ('inapp' | 'email' | 'slack')[],
  cooldown_hours?: number  // default: type-specific default
}
Response: { data: AlertRule }
```

**`PATCH /api/alerts/rules/[id]`**
```
Body: Partial<{
  threshold: object,
  channels: string[],
  is_active: boolean,
  cooldown_hours: number
}>
Response: { data: AlertRule }
```
Ownership check: verify `user_id = auth.uid()` before update.

**`DELETE /api/alerts/rules/[id]`**
```
Response: { data: { deleted: true } }
```

### Notifications

**`GET /api/alerts/notifications`**
```
Query: {
  page?: number (default: 1),
  per_page?: number (default: 20, max: 100),
  is_read?: boolean,
  type?: AlertType
}
Response: {
  data: Notification[],
  meta: { total: number, page: number, per_page: number, unread_count: number }
}
```

**`PATCH /api/alerts/notifications/[id]/read`**
```
Body: none
Response: { data: { id, is_read: true, read_at: timestamp } }
```

**`POST /api/alerts/notifications/bulk-read`**
```
Body: { ids?: uuid[] }  // if omitted: marks ALL unread as read
Response: { data: { updated_count: number } }
```

### Notification Preferences

**`GET /api/alerts/preferences`**
```
Response: { data: NotificationPreferences }
```

**`PATCH /api/alerts/preferences`**
```
Body: Partial<NotificationPreferences>
Response: { data: NotificationPreferences }
```

### Workflows

**`GET /api/workflows`**
```
Query: { business_id: uuid }
Response: { data: AgentWorkflow[] }
```

**`POST /api/workflows`**
```
Body: {
  business_id: uuid,
  name: string,
  trigger_type: TriggerType,
  trigger_config: object,
  steps: WorkflowStep[],  // Zod-validated
  is_active?: boolean,
  max_runs_per_month?: number
}
Response: { data: AgentWorkflow }
Auth: Pro+ tier required (workflow creation is a Pro+ feature)
```

**`PATCH /api/workflows/[id]`**
```
Body: Partial<{ name, trigger_config, steps, is_active, max_runs_per_month }>
Response: { data: AgentWorkflow }
```

**`DELETE /api/workflows/[id]`**
```
Response: { data: { deleted: true } }
```

**`GET /api/workflows/[id]/runs`**
```
Query: { page?: number, per_page?: number }
Response: { data: WorkflowRun[] }
```

**`POST /api/workflows/[id]/trigger`**
```
Body: { business_id: uuid }
Process:
  1. Validate ownership and business_id
  2. Emit workflow/trigger event to Inngest
  3. Return job ID for tracking
Response: { data: { run_id: uuid, status: 'started' } }
Rate limit: 5 per user per hour
```

---

## Appendix A: Alert Type Quick Reference

| Alert Type | Evaluator | Default On | Severity | Cooldown | Workflow Trigger |
|------------|-----------|-----------|----------|----------|-----------------|
| `visibility_drop` | Post-scan | Yes | high | 24h | Visibility Drop Response |
| `visibility_improvement` | Post-scan | Yes | low | 24h | — |
| `competitor_overtake` | Post-scan | Yes | high | 48h | Competitor Alert Response |
| `new_competitor` | Post-scan | Yes | medium | 7d/competitor | — |
| `sentiment_shift` | Post-scan | Yes | medium | 48h | — |
| `credit_low` | Post-agent | Yes | medium | 24h | — |
| `agent_complete` | Post-agent | Yes | low/medium | 0 | — |
| `content_performance` | Post-scan | Yes | low | 7d/content | — |
| `scan_complete` | Post-scan | No | low | 0 | — |

## Appendix B: Inngest Event Names

All events use `/` separators (canonical registry):

| Event | Emitted By | Consumed By |
|-------|-----------|-------------|
| `alert/evaluate` | scan functions, agent.execute | alert.evaluate |
| `workflow/trigger` | alert.evaluate, manual API | workflow.execute |
| `agent/execute.complete` | agent.execute | workflow.execute (waitForEvent) |
| `onboarding/complete` | /api/onboarding/complete | New Business Onboarding workflow |
| `content/published` | /api/content/[id]/publish | Content Lifecycle workflow |

---

*Document version: 1.0 | Created: 2026-03-08 | Author: Atlas (CTO)*
*Source: BEAMIX_SYSTEM_DESIGN.md, _SYSTEM_DESIGN_ARCHITECTURE_LAYER.md §2.7, §2.9, §3.8, §3.9, §4.2*

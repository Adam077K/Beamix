# Empty States — Per-Page Spec

Resolves **P1-8 / P1-9 / P1-10** in `../10-PRE-BUILD-AUDIT.md`. Every page renders intentional copy + CTA when its primary content is absent. No blank screens. No spinners-as-content.

**Visual baseline:** Vercel's design system per `../13-DESIGN-SYSTEM-SPEC.md`. Illustrations are line-art (single stroke `#0A0A0A`, accent strokes `#3370FF`) — no full-color illustrations. Reuse Shadcn `<EmptyState>` component pattern.

---

## Canonical naming (Fix Agent 5 / I7)

**"AI Runs" is the canonical user-facing label** for what the codebase calls `credits`. Board-locked per `05-BOARD-DECISIONS-2026-04-15.md` line 468. Every UI surface in this spec and Wave 1 briefs uses "AI Runs". Do not ship "credits", "actions", "uses", or any other variant in user-facing copy.

- Internal data model: `credit_pools`, `credit_cost`, `hold_credits()`, etc. — unchanged.
- User-facing copy: "N AI Runs left this month", "Run all — N AI Runs", "10 AI Runs for $19", etc.
- Settings → Billing displays the count as "AI Runs", not "Credits".

## Shared component contract

`apps/web/src/components/empty-state.tsx`

```typescript
interface EmptyStateProps {
  illustration: 'workspace' | 'inbox' | 'scans' | 'automation' | 'archive' | 'competitors' | 'celebration' | 'failure' | 'tier-locked';
  title: string;
  body: string;
  primaryCta?: { label: string; href?: string; onClick?: () => void };
  secondaryCta?: { label: string; href?: string };
  variant?: 'default' | 'compact' | 'inline';
}
```

Three variants:
- `default` — full-page state with illustration (200px), title (h2), body (1 paragraph), CTAs
- `compact` — used inside cards (no illustration, title h3, 1-line body, CTA)
- `inline` — text-only, for list-empty states inside a populated page

---

## Home `/home`

### Day-1 state (scan in progress + auto-run drafting)
Renders when `user_profiles.day1_completed_at IS NULL` AND `day1_state ∈ {'query_mapper','query_review','scan_running','rules'}`.
- **Illustration:** `workspace` (line art of an empty desk with a soft glow on the chair)
- **Title:** Setting up your workspace
- **Body:** We're mapping the queries that matter for {{businessName}}, running your first deep scan across {{engineCount}} AI engines, and drafting your first 2–3 actions in the background. This usually takes 1–3 minutes.
- **Primary CTA:** (none — UI auto-redirects when ready)
- **Inline progress bar** from `03-DAY-1-FLOW.md` state machine — shows progress percentage only (no time estimate / countdown). The "1–3 minutes" line above is the only timing reference; the progress bar itself does not display seconds remaining.
- **When `day1_state = 'query_review'`:** the page renders the Query Review Gate UI (top-10 queries from Query Mapper with edit/remove controls + "Confirm queries" CTA) — see `03-DAY-1-FLOW.md` Step B.5. This is the only manual step in the Day-1 chain.
- **Auto-run drafts surface live** (board April-17 — dead-dashboard cure). As the auto-run agents from Step E (2–3 highest-impact agents) complete, the panel surfaces actual drafted-content cards with the headline of each draft as it lands, NOT a generic spinner. Each card shows the action label (from `USER_FACING_AGENT_LABELS`), status indicator (`drafting…` → `drafted ✓`), and a "View in Inbox" link. When all auto-runs complete, the page auto-redirects to `/home` where the same drafts appear in the Inbox preview strip and the leading-indicator panel reflects the new activity.
- Replaces the regular Home content until day1_completed_at is set.

### Scan exists but no suggestions yet
- **Illustration:** `celebration` if score ≥80, else `workspace`
- **If score ≥80:**
  - **Title:** You're already visible
  - **Body:** Your score is {{score}}. You appear on {{engineWinCount}} of {{engineCount}} engines. Most users start lower — focus on staying ahead. (Free FAQs + schema are still worth claiming.)
  - **Primary CTA:** "Get free FAQs + schema" → FAQ Builder + Schema Generator (free agents — no paywall)
  - **Secondary CTA:** "Set up weekly tracking" → Performance Tracker schedule (gated by paid plan; paywall on click for Discover-free users)
- **If score <80 but no rules fired:**
  - **Title:** No immediate moves needed
  - **Body:** This scan didn't surface high-priority actions. We'll re-evaluate on your next scheduled scan ({{nextRunDate}}).
  - **Primary CTA:** "Run a fresh scan" → triggers manual scan

### Discover tier — paywall blur
- Score and 1 suggestion visible
- Suggestions 2–3 rendered behind frosted `<PaywallGate>` with "Upgrade to see all suggestions"
- Inline empty-state caption under blurred section: "Build and Scale plans see all 3 suggestions ranked by impact."

---

## Inbox `/inbox`

### No items at all
- **Illustration:** `inbox` (line art of an empty tray with a soft horizon)
- **Title:** Nothing to review yet
- **Body:** When agents finish a run, drafts land here for your review. Run a suggestion from Home, or set up a schedule in Automation.
- **Primary CTA:** "Browse Home suggestions" → /home
- **Secondary CTA:** "Set a schedule" → /automation

### No items in current filter (e.g., user filters to "Approved" with none yet)
- **Variant:** `inline` (no illustration)
- **Body:** No {{filterLabel}} items. Try a different filter or wait for a new draft.

### Item failed mid-pipeline (P1-10)
Renders as a special card in the list (not a draft).
- **Card status:** `failure` (red-tinted left border, AlertTriangle icon)
- **Card title:** {{agentDisplayName}} — Run failed at {{stage}}
- **Body (in card):** This run didn't complete. You weren't charged. We'll keep the attempt in your Inbox for 7 days for you to retry, then it auto-archives.
- **Actions:** "Retry" (single retry, replaces card with new attempt) · "Dismiss" (immediate archive) · "View details" (opens evidence panel with error message + cost log)
- **Toast on first appearance:** "Run didn't complete. You weren't charged."
- **Persistent banner** on Inbox until the item is dismissed: "1 run failed this week — [view]"

### Tier-locked Inbox items
- Discover: First item visible, rest blurred. Empty-state caption between: "Upgrade to Build to review every draft."
- Scale-only bulk-approve: not an empty state — but the bulk-approve button is hidden on lower tiers with tooltip "Available on Scale".

---

## Scans `/scans`

### No scans yet (rare — Day-1 chain runs the first scan)
- **Illustration:** `scans` (line art of a radar sweep)
- **Title:** No scans on record yet
- **Body:** A scan checks how AI engines respond to queries about your business. Your first one runs automatically — this should not normally appear.
- **Primary CTA:** "Run a scan now" → triggers manual scan
- This is essentially a safety net; in practice Day-1 chain guarantees a scan exists.

### Score dropped on latest scan (P1-12)
Renders as a panel above the scans timeline.
- **Variant:** inline alert panel (amber)
- **Title:** Your score moved from {{prev}} → {{curr}} (-{{delta}} points)
- **Body:** Likely drivers:
  - {{driver1Query}} — lost mention on {{driver1Engine}}
  - {{driver2Query}} — competitor {{driver2Competitor}} now ranks
  - {{driver3Query}} — engine result format shifted
- Wording uses directional language only (B5).
- **Primary CTA:** "See suggested fixes" → /home (scrolls to suggestions tied to score drop)

---

## Automation `/automation`

### No schedules yet
- **Illustration:** `automation` (line art of a clock with an arrow)
- **Title:** Nothing scheduled yet
- **Body:** Set a schedule to keep your content fresh, your FAQs current, and your visibility tracked — all without you starting each run.
- **Primary CTA:** "Add your first schedule" → opens schedule modal pre-filled with Performance Tracker (weekly)

### Tier-locked (Discover)
- **Illustration:** `tier-locked` (line art of a padlock with a soft glow)
- **Title:** Automation unlocks on Build
- **Body:** Schedule any agent to run weekly or daily. Drafts land in your Inbox — never published without you.
- **Primary CTA:** "See plans" → opens paywall modal

### Kill switch active (P1-14)
- Persistent banner above schedules: "All schedules paused — kill switch is ON. [Resume]"
- Banner uses amber, not red — it's intentional state, not an error.

---

## Archive `/archive`

### No approved items yet
- **Illustration:** `archive` (line art of a stacked shelf)
- **Title:** No approved items yet
- **Body:** Approved drafts land here after you publish them. Each item carries through to your next scan — we verify it shows up where it should.
- **Primary CTA:** "Review your Inbox" → /inbox

### No items in current filter
- **Variant:** `inline`
- **Body:** No items match this filter. Try a different agent or time range.

---

## Competitors `/competitors`

### No competitors tracked yet
- **Illustration:** `competitors` (line art of two silhouettes facing each other)
- **Title:** Add the businesses you compete with
- **Body:** We'll track when {{tierLimit}} competitors appear in AI engine results — including queries where they win and you don't.
- **Primary CTA:** "Add your first competitor" → opens add-competitor modal

### Competitors added, no movement yet
- **Variant:** `inline` below the competitor table
- **Body:** We're collecting data. Movement alerts start after 2 scans (typically {{date}}).

---

## Settings `/settings`

Per-tab empty states (all are `inline` variant):

| Tab | When | Body |
|-----|------|------|
| Profile | New account | Add your name and choose a language so we tune content to {{he/en}}. |
| Business | Missing fields | Complete your business profile so agents know what context to use. {{missingFieldsList}} |
| Billing | No plan (preview mode) | You're in preview. Choose a plan to unlock agents. [See plans] |
| Preferences | (always populated) | — |
| Notifications | (always populated) | — |
| Integrations | None connected | Connect GA4 or Google Search Console to give Performance Tracker more signal. [Optional] |
| Automation Defaults | First visit | Defaults apply when you add a new schedule. You can override them per agent. |

---

## Global / cross-cutting states

### Tier-locked page wrapper
Applied to `/automation` (Discover) and any future Scale-only routes. Renders a centered card with:
- Lock icon
- Headline: "{{Feature}} unlocks on {{tier}}"
- 2-bullet value summary
- "See plans" CTA → paywall modal
- Greyed-out preview of the underlying page UI behind a 50% opacity overlay

### Kill switch active global banner (P1-14)
- Renders in `DashboardShell` above all pages
- Amber bg, single-line: "All scheduled runs paused (kill switch ON). [Resume]"
- Resume button triggers a confirmation modal

### Excluded industry (Fix Agent 5 / I1)

Replaces the standard scan-running and result layouts on `/scan` when `industry ∈ EXCLUDED_INDUSTRIES` (legal, medical, financial). The industry-select on the pre-scan form blocks the scan from firing — no LLM cost spent, no paywall offered.

- **Renders:** in place of the scan-running animation, immediately after form submission.
- **Illustration:** `tier-locked` (line art of a padlock with a soft glow) — reuse.
- **Title:** Beamix doesn't yet cover {{industry}} businesses
- **Body:** We're focused on services, e-commerce, and SaaS for MVP. {{industry}} businesses (and other regulated verticals) require careful safety review before we can give useful recommendations. Join the waitlist — we'll notify you when we expand.
- **Primary CTA:** "Join waitlist" → opens email-capture inline form. POSTs to `/api/waitlist` with `{email, industry}`. Server inserts to `waitlist` table + sends Resend confirmation. No account is created, no scan is run, no charge happens.
- **Secondary CTA:** none — no upsell, no upgrade-tease.
- **Form-level message** on the pre-scan form (shown the moment an excluded industry is selected, BEFORE submit): "We're focused on services, e-commerce, and SaaS for MVP."

Excluded list (locked, hardcoded):
- legal / law-advisory
- medical / clinical / diagnostic
- financial-advisory / investment

Closes the funnel leak in audit synthesis CJ-1 — a Tel Aviv lawyer no longer pays $189 and then refunds after hitting YMYL hard-refuses on every content agent.

### Free-scan high-score state (P1-9 + I4)
Replaces the wound-reveal layout on `/scan` when result score ≥80.
- **Headline:** You're already visible
- **Sub-headline:** Score: {{score}} — top {{percentile}}% in {{industry}}
- **Body:** {{businessName}} appears on {{n}} of {{m}} engines, including {{engineList}}. Even at this score, there's free value you can claim before deciding to track over time.
- **Hero card:** "What now?" with 3 chips (informational, not the conversion path):
  - "Keep watching" — set up weekly scan
  - "Stay ahead of {{topCompetitor}}" — add competitor tracking
  - "Refine top queries" — Freshness Agent schedule
- **CTAs (I4 — fixes paywall-after-celebration):**
  - **Primary:** "Get free FAQs + schema" — free signup → Discover-free path (FAQ Builder + Schema Generator are free agents). NO paywall. User gets immediate value before any payment decision.
  - **Secondary:** "Keep watching" — full paid plan paywall (Performance Tracker weekly scan + competitor tracking).
- **Rationale:** A celebration screen leading directly to a paywall is conversion-killing. The free-tier FAQ + schema path gives the already-happy user a tangible deliverable; the upgrade conversation happens after they've experienced agent output.

### Skeleton vs empty state — usage rule
- **Skeleton:** when data is loading and will probably be non-empty (poll in progress)
- **Empty state:** when load completed and result is empty
- Never show a spinner for >2s — switch to skeleton or empty state.

---

## Implementation owner

Frontend Worker 1 ships the `<EmptyState>` primitive in Wave 1 (Home + Inbox). Other Wave 1 frontend workers reuse it on their pages. Wave 2 Worker 4 does an audit pass — every page gets verified against this doc and a Playwright screenshot test captures each state.

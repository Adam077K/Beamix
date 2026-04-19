# Config Surface Research Notes
*Generated: 2026-04-19 | Agent: frontend-developer | Phase: Research*

Playwright MCP not connected — notes synthesized from expert knowledge of reference apps.

---

## Settings (Linear, Vercel, Stripe Dashboard)

**Linear settings patterns:**
- Left sidebar navigation: icon + label, ~200px wide, sticky
- Active tab: left border-l-2 with accent color + subtle bg tint
- Section content: single-column form, max ~600px wide
- Save button: per-section (not global). States: idle → saving (spinner) → Saved ✓ (3s) → idle
- Destructive zone: visually separated at bottom with red outline button
- Horizontal rule between form groups — no card boxes

**Vercel settings patterns:**
- Similar left nav, but labels-only (no icons in some sections)
- Save states are per-field row with inline feedback (not page-level)
- Billing tab: shows plan name, renewal date, usage bar, "Manage subscription" → external portal
- Danger zone: red-tinted section at bottom, confirmation text input

**Stripe Dashboard:**
- Tab navigation is horizontal at top on some pages
- High information density — data tables, not forms
- Status pills on every row: Active / Paused / Error

**Key patterns for Beamix settings:**
- Left sidebar nav (desktop), scrollable tabs (mobile < md)
- Save button: inline per-section, idle/saving/saved/error cycle
- Billing tab: plan card + "Manage subscription" → POST /api/billing/portal
- Danger zone: separated section, red outline destructive button

---

## Automation (Zapier, n8n, Retool)

**Zapier patterns:**
- Rules table: Name | Trigger | Action | Last ran | Status (On/Off toggle)
- Status is a prominent pill: "On" (green), "Off" (gray), "Error" (red)
- Global pause is top-of-page banner, highly visible
- Each row has inline toggle — no confirmation for individual pauses
- Destructive (delete Zap): trash icon, no inline confirm (separate modal)

**n8n patterns:**
- Table with: Workflow name | Trigger type | Executions | Active toggle
- Frequency shown as human label not cron: "Every Monday at 9am"
- Activity log below main table

**Retool:**
- More data-dense: execution history, logs inline

**Key patterns for Beamix automation:**
- Table layout (not cards): Agent | Trigger | Frequency | Last run | Status | Actions
- Kill switch: prominent red banner at top, "type PAUSE to confirm" modal
- Frequency shown as human labels (Daily, Weekly, Every 2 weeks, Monthly)
- Status pills: Running / Paused / Error
- Credit usage bar: integrated into page header area

---

## Competitors (Ahrefs, SEMrush, SparkToro)

**Ahrefs patterns:**
- Competitors listed as rows with domain + favicon + authority metrics
- SoV (Share of Voice) bar chart: horizontal bars per competitor, brand blue fill
- Each row expandable to show keyword overlap
- Trend shown as sparkline mini chart

**SEMrush patterns:**
- More card-like for competitors, with logo/avatar prominent
- Pie/donut chart for SoV breakdown
- "Add competitor" button prominent top-right

**SparkToro:**
- Focus on audience overlap, not keyword rank
- Clean table with percentages

**Key patterns for Beamix competitors:**
- Row-based table: avatar/logo + name + domain + SoV% + trend sparkline + actions
- SoV bar chart above table: horizontal stacked bars, brand blue (#3370FF) for "you", muted gray for competitors
- Add competitor: top-right CTA, opens modal with URL input
- Per-competitor detail panel: slide-over or expanded row with query list

---

## Paywall / Pricing Modal (Linear Upgrade, Vercel, Notion)

**Linear upgrade modal patterns:**
- Clean 3-column layout, center column highlighted ("Most popular")
- Annual toggle at top: "Save X% annually" with badge
- Price displayed large, /mo label small
- Feature list with check icons
- Trust row: "Cancel anytime · No contracts"
- CTA per card: "Start with [plan]"

**Vercel pricing patterns:**
- Highlighted tier has blue border + slightly elevated appearance
- "Most popular" badge floats above highlighted card
- Annual toggle shows savings as badge

**Notion:**
- Trust logos row below tier cards
- Very clean white cards, minimal shadows

**Key patterns for Beamix paywall:**
- 3 cards, Build highlighted with "Most popular" pill (blue bg)
- Annual toggle: prominent, shows "Save 20%" badge
- Prices: Discover $79 / Build $189 / Scale $499 monthly, $63 / $151 / $399 annual — LOCKED
- Trust row: "14-day money-back · Cancel anytime · No setup fees"
- CTA: "Start with [Plan] →" — primary blue on highlighted, outline on others
- Dialog: role=dialog, aria-modal, focus trap, ESC closes

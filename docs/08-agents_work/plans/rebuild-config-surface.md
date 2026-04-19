# Plan: Config Surface Rebuild
*Created: 2026-04-19 | Agent: frontend-developer*

## Scope
Full ground-up rebuild of: Automation, Competitors, Settings (all tabs), Paywall (PaywallModal + TierCard).

---

## 1. Automation

### Table columns
| Column | Detail |
|--------|--------|
| Agent | Icon + label (e.g. "Content Optimizer") |
| Trigger | Human label: "Inbox approved" or "Scheduled" |
| Frequency | Select dropdown: Daily / Weekly / Every 2 weeks / Monthly |
| Last run | Relative date ("Apr 19") or "Never" |
| Next run | Relative date |
| Status | Pill: Running (green) / Paused (amber) / Error (red) |
| Actions | Pause toggle + delete icon |

### Kill switch
- Prominent red destructive banner at top when active
- Toggle labeled "Pause ALL automation" — triggers confirmation modal
- Modal: "Type PAUSE to confirm" text input + "Pause all automation" button
- Re-enable: simple "Resume all" button, no confirmation

### Credit usage
- Horizontal progress bar in page header
- Color: blue < 75%, amber 75–90%, red > 90%
- Labels: "28 / 90 AI runs used" + "62 remaining"

### Acceptance criteria
- [ ] Table renders with all columns
- [ ] Kill switch shows confirmation modal with text input "PAUSE"
- [ ] Individual row pause toggle works
- [ ] Frequency dropdown changes state
- [ ] Credit bar animates on mount
- [ ] Empty state when schedules = []
- [ ] Loading skeleton (3 rows)
- [ ] Error state shown

---

## 2. Competitors

### Layout
- Page header: title + "Add competitor" button (top-right)
- SoV chart: horizontal bar chart — "you" vs each competitor, brand blue (#3370FF) fill for you, gray-200 for competitors
- Competitors table: avatar/initials + name + domain + appearance % bar + 4-week sparkline + actions
- Missed queries: below table, tag-list of queries you missed but competitors hit

### Per-competitor detail
- Clicking a row expands an inline detail panel (not slide-over)
- Shows: query list where competitor appears, trend over 4 weeks, appearance % over time

### Add-competitor modal
- URL input, parse to hostname, submit adds to list
- Success: "rivalco.com added" inline success state

### Acceptance criteria
- [ ] SoV bar chart renders with brand blue for "you"
- [ ] Table shows avatar initials, name, domain, bar, sparkline
- [ ] Row click expands detail with query list
- [ ] Add competitor modal validates URL
- [ ] Missed queries tag list
- [ ] Empty state with CTA
- [ ] Loading skeleton

---

## 3. Settings

### Tab nav strategy
- Desktop (md+): left sidebar nav, 220px, sticky top-24, icon + label
- Mobile (<md): horizontal scrollable tabs (overflow-x-auto, no wrap)
- Active indicator: left border-l-2 border-[#3370FF] + bg-blue-50/50 (desktop), bottom-border (mobile)

### Save state pattern
```
idle → saving (spinner inline) → saved (green check + "Saved" text, 3s) → idle
error → "Could not save. Try again." (red inline)
```
- Per-section save button (not global page save)
- Save button shows state inline — no toast

### Billing tab wiring
- "Manage subscription" button → POST /api/billing/portal → redirect to Paddle portal
- Loading state: spinner + "Opening billing portal..."
- Plan card: shows tier name + monthly price + renewal date (mocked)
- "Change plan" → opens PaywallModal

### Danger zone
- Visually separated section at bottom of Profile tab
- Red outline button: "Delete account"
- Confirmation modal: type email address to confirm

### Acceptance criteria
- [ ] Left nav desktop, horizontal tabs mobile
- [ ] Save button cycles idle/saving/saved/error
- [ ] Billing tab shows plan card + working portal redirect skeleton
- [ ] Danger zone at bottom of Profile tab with delete-account modal
- [ ] All 7 tabs render with correct content
- [ ] Focus trap in modals, ESC closes

---

## 4. Paywall (PaywallModal + TierCard)

### Tier card hierarchy
- Discover: neutral card, outline CTA
- Build: highlighted — ring-2 ring-[#3370FF], shadow-[0_4px_20px_rgba(51,112,255,0.12)], "Most popular" pill
- Scale: neutral card, outline CTA

### Annual toggle
- Prominent toggle above cards
- "Save 20% with annual billing" label
- Badge: "2 months free" in blue-tinted pill
- Prices update instantly on toggle

### Prices (LOCKED)
- Discover: $79/mo | $63/mo annual
- Build: $189/mo | $151/mo annual
- Scale: $499/mo | $399/mo annual

### Trust row
- "14-day money-back · Cancel anytime · No setup fees"
- Below cards, centered, muted text

### Accessibility
- role=dialog, aria-modal=true, aria-labelledby pointing to title
- Focus trap inside modal
- ESC closes
- Focus moves to first interactive element on open

### Acceptance criteria
- [ ] 3 tier cards with correct prices (LOCKED)
- [ ] Build card highlighted with "Most popular" badge
- [ ] Annual toggle updates all prices
- [ ] Trust row present
- [ ] Modal fully accessible
- [ ] Checkout loading state

---

## New Features Proposed (Escalate to CEO)

1. **Competitor alerts** — Email notification when a competitor's appearance rate jumps >5 points in a week. Needs: alert_rules table, notification service.
2. **Custom rule builder** — Let users create automation rules (if-then logic) rather than just preset schedules. Needs: new schema, rule engine backend.
3. **Team seats** — Multiple users per account for Scale tier. Needs: team_members table, invite flow, RLS updates.
4. **Competitor SoV over time** — Line chart showing SoV trend over 30/90 days. Needs: historical SoV snapshots in DB.
5. **Invoice history** — Real invoice display from Paddle webhooks. Needs: invoices table, webhook handler.

---

## Commit plan
1. `feat(automation): rebuild rules table + prominent kill switch + credit bar`
2. `feat(competitors): rebuild SoV chart + per-competitor detail panel`
3. `feat(settings): rebuild tab nav + save-state pattern + billing tab + danger zone`
4. `feat(paywall): rebuild PaywallModal + TierCard to premium spec`

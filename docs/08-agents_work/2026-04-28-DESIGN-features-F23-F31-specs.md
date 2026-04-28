# Beamix — Feature Design Specs F23–F31

**Date:** 2026-04-28
**Status:** Implementation-ready. Pixel-precise. References DESIGN-SYSTEM-v1 tokens throughout.
**Source authority:** PRD-wedge-launch-v3.md, DESIGN-BOARD2-CEO-SYNTHESIS.md, DESIGN-SYSTEM-v1.md, HOME-design-v1.md, EDITORIAL-surfaces-design-v1.md, ONBOARDING-design-v1.md.

All color tokens, spacing values, type scale sizes, motion tokens, and radius values reference DESIGN-SYSTEM-v1.md §1 directly. No new tokens introduced here unless explicitly noted with rationale.

---

## F23 — Cycle-Close Bell

### Trigger

Fires once per weekly cycle when: (a) the weekly scan job is marked `status = 'complete'` in the scan engine, AND (b) every auto-fix agent job for that cycle has `status = 'shipped'` OR `status = 'approved'` (no pending items remain). Evaluated server-side on each `/home` page load via a `cycleBellPending` flag in the session context. Non-replay: once the bell fires in a given `sessionStorage` session, the flag is cleared client-side and the sequence does not replay even on `/home` re-navigation. Does not fire on the first cycle ever (no "{N} changes shipped" data yet).

### Visual spec

The Cycle-Close Bell is a **choreographed sequence on `/home` above-fold only**. All elements are already on the page — nothing new is added. The sequence is:

**Sequence (total duration: 1,600ms from trigger):**

| Time offset | Element | Action | Curve | Duration |
|---|---|---|---|---|
| 0ms | Activity Ring gap | `stroke-dashoffset` closes the 30° gap — arc draws to full 360° | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | 800ms |
| 0ms (simultaneous) | KPI sparklines | Settle to final positions — any in-progress easing resolves | `ease-out` | 200ms |
| 0ms (simultaneous) | Status sentence | Cross-fade from current copy to "Cycle closed. {N} changes shipped this week." | 150ms opacity cross-fade on both the old and new string (75ms out, 75ms in) | 150ms |
| 800ms | Full state | Ring at full circle, sparklines settled, new sentence visible | Hold | 600ms |
| 1,400ms | Activity Ring | Re-opens to fresh 252° baseline — the gap re-appears | Reverse of close: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` reversed, 200ms | 200ms |
| 1,600ms | Sequence complete | Page returns to static state with updated status sentence | — | — |

**Status sentence rewrite typography:** Same spec as status sentence in HOME-design-v1 §2.2.4 — 18px Inter 400, `--color-ink-3`, token `text-lg`, preceded by the `────` separator glyph. The rewritten copy is: `"Cycle closed. {N} changes shipped this week."` where `{N}` is the integer count of shipped auto-fixes for the cycle (Inter 500 for the number itself per DESIGN-SYSTEM-v1 §1.2 weight-for-emphasis rule).

**One-time Trace (NEW addition per DESIGN-BOARD2):** Immediately after the status sentence rewrites (at t=150ms), a single Trace behavior appears under the rewritten sentence. Uses standard Trace spec from DESIGN-SYSTEM-v1 §2.2: Rough.js, roughness 0.6, strokeWidth 1.5, `rgba(51, 112, 255, 0.28)`, seed from `hash(sentence_text + cycle_id)`. This Trace is one-time and displays for 24h then fades per standard Trace behavior. This is one of the 4 permitted Trace surfaces (`/home` recent-activity).

**Easing rationale:** The ring-close uses `cubic-bezier(0.25, 0.46, 0.45, 0.94)` — a smooth deceleration distinct from all other system curves. The ring is **settling**, not bouncing (no overshoot). This is a new assignment for this moment, per Ive's "distinct curves per moment" mandate. It is NOT the shared `cubic-bezier(0.4, 0, 0.2, 1)`.

### Behavior

- Fires once per `sessionStorage` session. `sessionStorage.setItem('cycleBellFired', '1')` on trigger; checked before firing.
- Does not interrupt if the user is mid-interaction (a Decision Card is open, a form is focused). Queues and fires on the next idle moment (300ms after last user interaction).
- If the user navigates away from `/home` during the sequence, the sequence aborts silently. On return, the bell does not replay.
- The "Cycle closed." status sentence persists until the next regular status sentence update (server-side, next page load). It does not revert mid-session.
- The Ring re-opening is **not animated** with a slow trace — it re-draws at the 252° fresh baseline over 200ms with the same settling curve. This is the start of the new cycle, not a dramatic moment.

### Implementation notes

- **Component path:** `apps/web/app/(product)/home/_components/ActivityRing.tsx` — add `onCycleClose` prop. The parent `/home` server component resolves `cycleBellPending: boolean` from the session context (Inngest event or Supabase realtime).
- **State management:** `cycleBellPending` from server component. Client-side session flag in `sessionStorage`. The flag key is `beamix:cycleBellFired:{cycleId}` to prevent cross-cycle collisions.
- **Motion library:** Framer Motion `useAnimation` controlling `stroke-dashoffset` on the Ring SVG. KPI sparkline settle is a CSS `transition: all 200ms ease-out` already present.
- **Status sentence rewrite:** `AnimatePresence` with `mode="wait"` on the sentence string. Both exit and enter use opacity 0→1 / 1→0, 75ms linear each.
- **Inngest event:** `cycle.close` event triggers from the scan completion function when all agent jobs for the cycle are confirmed shipped.

### Accessibility

- `aria-live="polite"` region wrapping the status sentence. The rewritten copy is announced to screen readers as: `"Cycle closed. {N} changes shipped this week."`.
- `prefers-reduced-motion: reduce` — Ring does not animate. Status sentence rewrites instantly (0ms cross-fade, no opacity transition). Sparklines do not animate. The Trace appears at final opacity immediately.
- Ring SVG `aria-label` updates to: `"Visibility score {score}. This week's cycle is complete. {N} changes shipped."` after the bell sequence.

### Mobile + dark mode

- All elements present on mobile at same behavior. Ring is 160px on mobile (scaled from 200px desktop). The sequence timing is identical.
- Dark mode: all tokens resolve to dark variants per DESIGN-SYSTEM-v1 §1.1. No special handling.

### Edge cases

1. **{N} = 0 shipped changes:** Bell does not fire. The cycle-close condition requires at least one shipped auto-fix.
2. **Multiple cycles missed** (customer was offline for 3 weeks, 3 cycles completed): Bell fires only for the most recent complete cycle. Older cycles are silent. The `{N}` count is for the single most recent cycle.
3. **Scan complete but one fix still in /inbox pending approval:** Bell does not fire. Condition requires all fixes to be shipped OR explicitly approved — "pending approval" is not "approved."
4. **User on mobile with low bandwidth — sequence fires mid-load:** If the page hasn't fully rendered (Activity Ring not yet in DOM), the bell is deferred until the Ring mounts. A 500ms timeout after mount fires the sequence.
5. **First cycle ever:** `cycleBellFired` flag is set by server. Bell is suppressed. No "{N} changes shipped" is meaningful on cycle 1.

---

## F24 — Brief Re-Reading

### Trigger

Server-side middleware check on `/home` navigation. Conditions (all must be true): (a) current date is a Monday (evaluated in the customer's local timezone from `user_profiles.timezone` or browser-detected fallback), (b) current calendar quarter differs from the `quarter_key` of the customer's most recent `brief_quarterly_reviews` record, (c) the customer has been on the platform for at least one full quarter (created_at is in a prior quarter), (d) the customer has an approved Brief. If all four conditions are true, middleware sets `briefReReadingPending: true` in the page props.

### Visual spec

On `/home` load when `briefReReadingPending: true`, the brief re-reading intercept renders **full-viewport** over `/home` before `/home` content is visible. It is NOT a modal — it is a full-page surface that `/home` loads beneath.

**Layout (max-width 720px, centered, `--color-paper-cream` full-bleed background):**

```
[ 120px top breath ]

[ Four Fraunces 300 italic clause paragraphs ]
  Each clause: text-serif-lg (28px Fraunces 300 italic, --color-ink, line-height 40px)
  Clause separator: 24px vertical gap between clauses
  Max-width: 600px, centered

[ 72px gap ]

  Editorial line:
  "It's been three months. Anything to update?"
  Font: 13px Inter 400, --color-ink-3, token text-sm
  Centered

[ 48px gap ]

  [ Edit Brief → ]              [ Looks good → ]
    ghost, 13px Inter ink-3       primary PillButton md (40px),
    --radius-pill                 --color-brand background, white text
                                  right-aligned in the CTA row

[ 24px gap ]

  3-second countdown line:
  1px --color-ink-4, full-width 600px, fades left-to-right over 3000ms
  Represents the auto-redirect timer

[ 72px below CTAs ]

  Skip-to-home keyboard affordance:
  sr-only only — no visual element
```

**Fraunces clause rendering:** Each clause is rendered exactly as stored in `briefs.clauses[]` (array of strings). No truncation. If a clause is longer than 3 lines at 28px/600px width, it wraps naturally. Maximum 4 clauses; if brief has fewer, remaining space is left empty.

**Countdown line animation:** Uses `motion/path-draw` curve applied to a `width` transition on a 1px `--color-ink-4` line: starts at 0% width (left edge), expands to 100% width over 3,000ms `linear`. Reaches 100% at exactly 3 seconds, then auto-redirect fires.

**Surface register:** This is the **Artifact register** — cream paper (`--color-paper-cream`), Fraunces. Does NOT carry the standard product chrome (topbar, sidebar). The Beamix wordmark appears top-left at 24px, `--color-ink`, static.

### Behavior

- Auto-redirect to `/home` after 3 seconds if no CTA clicked. Redirect is a `router.replace('/home')` (not push — no back-nav to the intercept).
- "Looks good →" click: calls `POST /api/brief/quarterly-review` with `{action: 'looks_good', quarter_key: currentQuarterKey}` → upserts `brief_quarterly_reviews` record → redirects to `/home` within 200ms.
- "Edit Brief →" click: navigates to `/settings?tab=brief&edit=true`. The quarterly review is NOT stamped — the customer is editing, not confirming. The review is stamped only when they save the brief in /settings (the save handler checks for an open quarterly review record).
- Dismiss by clicking outside the 720px content well: same behavior as "Looks good →".
- Session storage guard: `sessionStorage.setItem('briefReReadingShown', currentQuarterKey)`. Middleware checks this client-side before showing again in the same session, preventing double-trigger on SSR + client hydration.
- Does NOT fire if the customer is mid-session (an `/inbox` approval is open). Middleware detects active route context; intercept only fires on clean `/home` direct navigation.
- `brief_quarterly_reviews` table: `(customer_id, quarter_key)` unique constraint. Quarter key format: `YYYY-QN` (e.g., `2026-Q2`). This table is a **new Tier 0 requirement** — add to Supabase migration.

### Implementation notes

- **Component path:** `apps/web/app/(product)/home/page.tsx` — check `briefReReadingPending` prop, render `<BriefReReadingIntercept>` before the standard home layout.
- **Component:** `apps/web/components/brief/BriefReReadingIntercept.tsx`
- **Server check:** `/app/(product)/layout.tsx` middleware or home page `generateMetadata` / `page.tsx` server component. Check `brief_quarterly_reviews` with `supabase.from('brief_quarterly_reviews').select('*').eq('customer_id', userId).eq('quarter_key', currentQuarterKey).maybeSingle()`.
- **PDF context note:** Brief re-reading page does NOT need to render a PDF. It is a product-chrome surface using the cream register — static HTML only.

### Accessibility

- Keyboard nav: `Tab` moves focus between "Edit Brief →" and "Looks good →". `Enter` or `Space` activates the focused CTA.
- `aria-label` on "Looks good →": `"Confirm Brief is current for this quarter and return to home"`.
- Skip-to-home: `<a href="/home" class="sr-only focus:not-sr-only">Skip to home dashboard</a>` as first focusable element on page. Keyboard users can bypass the intercept immediately.
- `prefers-reduced-motion: reduce` — countdown line appears fully drawn from t=0. No width animation. Auto-redirect still fires at 3 seconds.

### Mobile + dark mode

- **Mobile (≤768px):** Max-width is full viewport minus 32px gutters. Top breath reduces to 48px. Fraunces clauses use `text-h3` size (22px) instead of `text-serif-lg` (28px) — still Fraunces 300 italic. CTAs stack vertically (full-width). Countdown line is full-width.
- **Dark mode:** This surface uses the Artifact register (cream paper). Dark mode is out of scope. The intercept always renders on cream background regardless of system dark mode preference. This is intentional — the cream register is the constitutional register and is warm by definition.

### Edge cases

1. **Customer's Brief is in draft state** (never approved): Intercept does not fire. Condition (d) in trigger requires an approved Brief.
2. **Customer has no `timezone` in profile:** Fall back to UTC for Monday detection. If Monday in UTC but not customer's local timezone, the intercept fires "slightly wrong" — acceptable; edge frequency is low. Add timezone prompt to `/settings → Profile` as a low-priority improvement.
3. **Customer clicks "Edit Brief →" but never saves:** The quarterly review is not stamped. Next Monday login in the same quarter: intercept fires again. This is correct behavior — the Brief was not confirmed current.
4. **Brief was edited since last quarter:** The re-reading shows current Brief clauses. If clauses changed, the customer sees the updated document. This is the right behavior — re-reading means reading what's current.
5. **Customer account is in their first quarter on platform:** `created_at` is in the same calendar quarter as today. Condition (c) fails. Intercept does not fire. Customer does not see the re-reading until their second quarter.

---

## F25 — Receipt-That-Prints Card

### Trigger

Fires on `/home` when: (a) the current customer has a Monthly Update PDF with `status = 'generated'` for the current month (first of month), AND (b) `report_receipt_shown_{report_id}` is not set in `localStorage`, AND (c) the card has not been dismissed (customer opened `/reports/[report_id]`). A Supabase realtime subscription or polling at 10-minute intervals checks `monthly_updates.status` for the current month's report. When status flips to `'generated'`, the card renders.

### Visual spec

**Card dimensions:** 720px wide × 96px tall (desktop). Full content-area width on mobile. Fixed height 96px on all viewports.

**Position on `/home`:** Inserted **above the Evidence Strip** and below the KPI cards row. Uses standard `--spacing-24` (24px) gap above and below. The Evidence Strip shifts down to accommodate the card on entrance.

**Card visual anatomy:**

```
Background: --color-paper-cream (#F7F2E8)
Border: 1px --color-border (rgba(10,10,10,0.06))
Border-radius: --radius-card (12px)
Shadow: --shadow-sm
Padding: 24px horizontal, 0 vertical (vertically centered content)
Width: 720px desktop, 100% mobile

Left side:
  Date stamp: "APR · 2026" — Geist Mono 12px, --color-ink-3, uppercase, letter-spacing 0.10em
  Below date: Fraunces 300 italic "Your Monthly Update is ready." — 18px, --color-ink, line-height 28px
  Gap between date and body: 4px (micro-grid)

Right side (right-aligned):
  "Read it →" — 13px Inter 500, --color-brand-text (#2558E5), cursor pointer

Center (absolute, vertical center of card):
  Rough.js fold mark: a single vertical line at x=360px (card center), full card height (96px)
  Rough.js config: roughness 1.2, strokeWidth 1, stroke rgba(10,10,10,0.08) (paper-shadow at 8% opacity)
  Seed: deterministic — seed(YYYY + MM) so same month always generates same fold
```

**Rough.js fold mark detail:** The fold mark is a single Rough.js `line(360, 0, 360, 96)` rendered as a subtle crease. It is purely decorative — it does not divide content. Its seed is `parseInt('YYYYMM')` where YYYY and MM are the report's year and month (e.g., `202604` for April 2026). This determinism ensures the fold looks identical across re-renders in the same month.

**Entrance animation (fires once on first render within the 24h window):**
- Property: `clip-path: inset(0 100% 0 0 round 12px)` → `clip-path: inset(0 0% 0 0 round 12px)`
- Duration: 600ms
- Curve: `cubic-bezier(0.34, 0.0, 0.0, 1.0)` — the same stamping curve used by `motion/seal-draw` Phase 1. A hard, material entrance — the card lands, it does not float in.
- The Evidence Strip below performs a corresponding `translateY` from +96px (card height) to 0 over 600ms `ease-out` so the layout shift feels choreographed, not jarring.
- Does NOT re-animate on page reload within the 24h window. `localStorage.getItem('beamix:receiptAnimated:{report_id}')` gates the animation.

**Dismissal and lifetime:**
- Stays visible for 24 hours from the time `monthly_updates.generated_at` is set.
- After 24 hours: `opacity` 1 → 0 over 600ms `ease-out`, then `height` 96px → 0 over 300ms (card collapses), DOM removed.
- If customer opens `/reports/[report_id]`: `localStorage.setItem('beamix:receiptRead:{report_id}', '1')` is set. On next `/home` load (within 10 minutes), card fades out.
- If PDF generation failed: `monthly_updates.status` never becomes `'generated'`. Card does not appear.

### Implementation notes

- **Component path:** `apps/web/app/(product)/home/_components/ReceiptCard.tsx`
- **Props:** `reportId: string`, `reportUrl: string`, `reportMonth: string` (ISO `YYYY-MM`), `generatedAt: Date`
- **Rough.js integration:** Use `roughjs/bundled/rough.esm` in a `useEffect` on a `<canvas>` element sized 720×96 (or full width on mobile). The canvas is positioned absolutely behind the card content, `z-index: 0`.
- **State:** `useLocalStorage` hook for `beamix:receiptAnimated:{report_id}` and `beamix:receiptRead:{report_id}`. The 24-hour timer is computed server-side (`generatedAt + 24h < now`) — the server passes `isExpired: boolean` to the component so the card never renders if already past its 24h window.
- **Supabase realtime:** Subscribe to `monthly_updates` table for changes where `customer_id = currentCustomerId AND status = 'generated'`. On change event, trigger card render.

### Accessibility

- Card container: `role="status"` with `aria-label="Your {Month} Monthly Update is ready."`.
- "Read it →" link: `aria-label="Read your {Month Year} Monthly Update"`.
- `prefers-reduced-motion: reduce` — card appears instantly at full opacity, no clip-path animation, no height animation on dismissal (immediate removal).

### Mobile + dark mode

- **Mobile (≤768px):** Card is full-width (100% minus 32px gutters). Height remains 96px. Font sizes remain identical. Fold mark re-calculated to `x = viewportWidth/2`. "Read it →" remains right-aligned.
- **Dark mode:** Card uses cream register (`--color-paper-cream`). Cream register is out of scope for dark mode. Card always renders on cream background regardless of system preference. The `rgba(10,10,10,0.08)` fold mark remains on cream regardless.

### Edge cases

1. **Monthly Update generated on a weekend (edge scheduling):** Card appears on the date generated, regardless of day of week. The "morning of" description is aspirational — it appears whenever `status = 'generated'` fires.
2. **Customer has never had a Monthly Update generated (new customer, month 1):** No trigger. Card never appears until the first `status = 'generated'` event.
3. **Two reports generated in the same month** (resend/re-render): `localStorage` key is per `report_id`. If report_id changes, a new receipt card appears. Prevent by ensuring only one Monthly Update per customer per month (enforced at Reporter agent level).
4. **Customer opens /reports then immediately returns to /home:** The "opened" flag (`beamix:receiptRead:{report_id}`) is set client-side on the /reports route. On `/home` return, the next realtime or polling check triggers dismissal. There is a ≤10-minute window where the card is still visible after opening. This is acceptable.
5. **Report on a free/Discover tier customer** (no Monthly Update in their tier): No Monthly Update is ever generated. Card never appears. Ensure Reporter agent is tier-gated before this component is even evaluated.

---

## F26 — Print-Once-As-Gift

### Trigger

Inngest scheduled function: runs daily. For each customer where `floor((now - created_at) / 86400000) >= 180` AND `customer_profiles.print_gift_sent = false` AND `customer_profiles.office_address IS NOT NULL` AND subscription tier is `'build'` or `'scale'` (not `'discover'`): trigger the gift print workflow. Idempotent: `print_gift_sent` boolean is set to `true` atomically in the same transaction as the print API call.

### Visual spec

**Customer-facing:** Zero. This is a surprise. No UI element announces it, no opt-out is shown, no countdown is displayed. The customer experience is: one day, a package arrives.

**Admin-internal "Print Gift Trigger" UI (in Beamix admin panel `/admin/customers/[id]`):**
- A single button in the customer detail page, right column: `"Send Print Gift"`, 13px Inter 500, `--color-brand-text`, ghost variant, `--radius-chip` (8px).
- Tooltip on hover: `"Manually trigger the month-6 print gift for this customer. Only works if address is on file and gift not yet sent."`
- Disabled state with tooltip `"Gift already sent"` if `print_gift_sent = true`.
- Disabled state with tooltip `"No office address on file"` if `office_address` is null.
- Click: calls `POST /api/admin/customers/[id]/print-gift` → same Inngest function as the automated trigger. Returns 202. Button shows a spinner for 2 seconds then `"Queued"` in `--color-score-good`.

**Onboarding address field (F2 Step 1 addition):**
- Position: below the primary_location field in Step 1. New field.
- Label: `"OFFICE ADDRESS FOR REPORTS"` (11px Inter caps, tracking 0.10em, `--color-ink-4`)
- Sub-label below the main label: `"Optional. Used to mail your anniversary report."` (11px Inter 400, `--color-ink-4`)
- Input: standard 56px field, same spec as other Step 1 fields. Placeholder: `"123 Rothschild Blvd, Tel Aviv"` (freeform text, no structured address parsing at input — Beamix passes freeform to the print vendor).
- No validation required. Field can be empty. Empty = `null` stored.

**Bookmark insert design:**
- Dimensions: 60mm × 200mm (bookmark format)
- Paper: cream stock matching the monthly update (60# cream or equivalent)
- Content (single side): Beamix Seal mark (static, 32×32, `--color-ink` at 100% opacity) centered at top. Below: one Fraunces 300 italic line, centered: `"Cited in 100,000 conversations starting with yours."` — font size 14px equivalent in print (10pt). Below: `"— Beamix · [Month Year]"` in Geist Mono 9pt, `--color-ink-3`.

### Behavior

- Gift fires exactly once per customer lifetime. `print_gift_sent` boolean enforces idempotency.
- Tracking notification email fires within 24 hours of print order placed. Plain text email, signed `"— Beamix"`. Subject: `"Something's on its way to you."` Body: the tracking URL and estimated arrival. No mention of what it is beyond `"a report"`.
- If the print vendor's API returns a shipping error for the customer's country: skip gracefully. Log to internal error tracking. No customer-facing error. Set `print_gift_attempted = true` but do NOT set `print_gift_sent = true`.
- International shipping: only dispatch if the vendor's coverage API returns `covered: true` for the customer's country (derived from freeform address parsing at dispatch time — a best-effort geocode).

### Implementation notes

- **Inngest function:** `apps/web/inngest/functions/print-gift-trigger.ts`. Trigger: Inngest cron `"0 9 * * *"` (runs at 9am UTC daily). Query customers eligible; dispatch one `print.gift.send` event per eligible customer.
- **Print vendor integration:** Abstracted behind `apps/web/lib/print/vendor.ts`. Interface: `sendPrintJob({ customerId, address, pdfUrl, bookmarkCopy })`. Initially implemented against Lulu or Blurb API; swap vendor by changing the implementation file only.
- **Address capture:** Stored in `customer_profiles.office_address TEXT` — add to Tier 0 Supabase migration.
- **PDF passed to vendor:** The customer's most recent `monthly_updates.pdf_url` at the time of dispatch. Use the stored PDF; do NOT re-render.

### Accessibility

No customer-facing UI to spec (this is a physical artifact). Admin UI button follows standard PillButton accessibility (keyboard focusable, focus ring `--shadow-focus`).

### Mobile + dark mode

No product UI surface. Physical artifact only.

### Edge cases

1. **Customer cancels at month 5, resubscribes at month 7:** `print_gift_sent` was never set to `true`. The 180-day check now fires. Gift dispatches. This is correct — the customer was a paying customer for ≥180 total days (cumulative days-as-subscriber, not calendar days from `created_at`). Note: PRD v3 uses `created_at` (calendar days), not cumulative paid days. Accept the PRD definition for MVP.
2. **Customer is on Discover tier at month 6:** Gift does not dispatch. Tier check is at dispatch time, not at signup.
3. **No Monthly Update PDF on file:** Skip. Log internally. This should not happen if the Reporter agent is working correctly, but defensive check required.
4. **Print vendor API down at dispatch time:** Inngest retries up to 3 times with exponential backoff. If all retries fail: log to internal alerts, `print_gift_attempted` flag set, manual follow-up via admin trigger.
5. **Customer's freeform address is unparseable or lacks country:** Attempt geocode via a lightweight geocoding API. If geocoding fails, skip gracefully (do not dispatch to an unknown destination). Log for manual review.

---

## F27 — Print-the-Brief Button

### Trigger

**Onboarding context:** Appears below the signature area in Step 3 of `/onboarding` immediately after `motion/seal-draw` completes (at t=540ms after the "Approve Brief" click). Visible for 8 seconds. Dismissal: "Continue" button click OR 8-second timer expiry → 300ms opacity fade → DOM removal.

**Reprint context:** Available at any time from `/settings → Brief` tab. Located in a 3-dot menu (overflow menu) adjacent to the Brief heading. Menu item: `"Print Brief as PDF"`. No timer, no expiry — always available.

### Visual spec

**Onboarding placement:**

```
[ Seal mark 24×24 — stamped ]
[ "— Beamix"  (Fraunces 300 italic, 22px, --color-ink, 300ms opacity fade after seal) ]
[ 16px gap ]
[ "Print this Brief →"  ← THIS IS F27's ELEMENT ]
  Font: 14px Inter 400
  Color: --color-ink-3
  Cursor: pointer
  No underline at rest; 1px underline on hover (color: --color-ink-3)
  No border, no background, no padding — pure text link
  Centered beneath the signature block
[ 8px gap ]
[ Continue button ]
```

The "Print this Brief →" element is positioned **between** the "— Beamix" signature and the "Continue" button. It does not displace the Continue button downward — there is sufficient space in the Step 3 layout (the Seal ceremony area has 96px of vertical padding below the signature).

**3-dot menu on /settings → Brief tab:**
- Standard overflow menu trigger: 3-dot icon button, 32px × 32px, `--color-ink-4` icon color, `--radius-chip` border-radius.
- Menu item: `"Print Brief as PDF"` — 14px Inter 400, `--color-ink-2`. Icon: download glyph (16px, `--color-ink-3`), left-aligned in menu row.
- Menu item height: 36px. Horizontal padding: 12px.

**PDF output spec:**
- Format: A4 portrait (210mm × 297mm)
- Background: `--color-paper-cream` (#F7F2E8)
- Page margin: 48px all sides (print units converted to ~17mm)
- Content top: Beamix Seal mark (static, 24×24, `--color-ink`) centered
- Gap: 32px
- Brief clauses: each clause in `text-serif-lg` (28px Fraunces 300 italic in product; in PDF: 20pt Fraunces 300 italic). Each clause separated by 24px vertical gap.
- Chip-selected values listed below clauses: Inter 400, 12pt, `--color-ink-3`
- Signature block: `"— Beamix"` in Fraunces 300 italic 16pt, centered
- Date stamp: `"Approved [YYYY-MM-DD]"` in Geist Mono 9pt, `--color-ink-3`, centered below signature
- Page 1 only. Single page. If the Brief text overflows a single A4 page (very unlikely with 4 short clauses), allow natural overflow to Page 2 (React-PDF handles this automatically).
- **Filename:** `your-beamix-brief-[YYYY-MM-DD].pdf` where the date is today's date at generation time.

**React-PDF component:** `apps/web/components/pdf/BriefDocument.tsx`. This reuses the React-PDF infrastructure from the Monthly Update PDF. Zero new PDF rendering infrastructure required.

### Behavior

- **Onboarding 8-second timer:** `setTimeout(8000, () => setVisible(false))`. On `setVisible(false)`, apply 300ms opacity fade via `motion/seal-fade-signature` curve (`linear`). After 300ms, DOM removal.
- **Timer does NOT pause** if the customer hovers over the link. The 8 seconds runs regardless of cursor position.
- **Clicking "Print this Brief →":** (a) calls the PDF generation API — `POST /api/brief/print` → returns a signed S3/Supabase Storage URL for the PDF; (b) triggers browser download via `window.open(url, '_blank')` or an `<a href={url} download>` programmatic click; (c) the timer continues running; (d) the customer stays on Step 3 — they are NOT advanced. They click Continue when ready.
- **"Continue" button:** dismisses the "Print this Brief →" link immediately (before 8s) and advances onboarding. The PDF generation call does NOT need to complete before Continue navigates — it is fire-and-forget.
- PDF generation is async and non-blocking. If it fails (edge case), the customer is not notified — the download simply doesn't begin. Add retry to the API route (1 retry, 500ms delay).
- **One-time show in onboarding:** `localStorage.setItem('beamix:briefPrintOffered', '1')` set when the link first appears. Never shown again in onboarding. The `/settings` reprint path is always available regardless of this flag.

### Implementation notes

- **API route:** `apps/web/app/api/brief/print/route.ts` — fetches Brief from DB, renders `<BriefDocument>` via React-PDF `renderToBuffer`, uploads to Supabase Storage at `briefs/[customerId]/brief-[date].pdf`, returns signed URL (60-second TTL).
- **Component:** `apps/web/components/pdf/BriefDocument.tsx` — React-PDF Document with styles matching above spec.
- **Onboarding integration:** `apps/web/app/(onboarding)/onboarding/3/page.tsx` — after `motion/seal-draw` completes, render `<PrintBriefOffer>` component.
- **Settings integration:** `apps/web/app/(product)/settings/_components/BriefTab.tsx` — add 3-dot overflow menu with "Print Brief as PDF" item.

### Accessibility

- **Onboarding link:** `aria-label="Download your Brief as a PDF"`. `role="link"` (it IS a link, not a button — it triggers a download navigation).
- **Settings menu item:** `aria-label="Download your Brief as a PDF"`.
- **Keyboard (onboarding):** Link is focusable via `Tab`. `Enter` or `Space` triggers the download. The link appears in the natural tab order: Seal → "Print this Brief →" → Continue.
- `prefers-reduced-motion: reduce` — the link appears instantly at full opacity. 8-second timer still runs. Dismissal is instant (no fade).

### Mobile + dark mode

- **Mobile (onboarding):** Link renders at same typography. The Step 3 layout on mobile has 48px vertical padding below the signature area — sufficient for the link to appear without crowding the Continue button.
- **Dark mode:** This feature appears in two contexts: (1) onboarding Step 3, which is always cream register (dark mode out of scope per DESIGN-SYSTEM); (2) /settings → Brief tab, which is standard product chrome (dark mode: `--color-ink-3` resolves to `#9CA3AF`, `--color-ink-2` to `#D4D4D8` per DESIGN-SYSTEM dark tokens).

### Edge cases

1. **Customer clicks "Print this Brief →" before the Brief is fully saved** (rare race condition where autosave is in-flight): The `/api/brief/print` route fetches the Brief from DB. Add a 500ms delay before the fetch to let any pending saves complete. If Brief data is stale, the PDF renders with whatever is saved — the onboarding Brief is saved step-by-step; by the time the Seal lands, all chip selections have been autosaved.
2. **PDF generation takes longer than 3 seconds (rare, cold starts):** The download begins whenever the signed URL returns. Customer may have already clicked Continue. The download still completes in their browser download queue. This is acceptable.
3. **Customer is on a slow connection and the signed URL expires (60s TTL) before the browser follows the redirect:** Extend TTL to 120 seconds for this endpoint only (brief PDFs are small — no security concern with 2-minute TTL).
4. **Customer's Brief has no clauses yet** (incomplete Brief edge case): The `/api/brief/print` route returns 400. The link silently fails to produce a download. No error shown to customer. This should not occur in the standard flow (Brief is written by Beamix before Step 3), but defensive check required.
5. **Customer uses the /settings reprint after editing their Brief:** The PDF regenerates with current clause text. The filename uses today's date — customer can print multiple versions over time. No version history in the filename beyond date — acceptable for MVP.

---

## F28 — "What Beamix Did NOT Do" Line on Monthly Update Page 6

### Trigger

Rendered at Monthly Update PDF generation time (first of month). The Reporter agent queries `agent_jobs` for `customer_id` in the report period, counts total evaluated (`N`) and rejected (`M`). Passes `{N, M}` to the Page 6 template. Conditional rendering based on values (see behavior).

### Visual spec

**Position on Page 6:**
- PDF coordinate: below the action timeline (the list of what Beamix DID do), above the closing Seal.
- Vertical gap above: 24px (matches the inter-section rhythm of the PDF).
- Vertical gap below (before the Seal): 32px.

**Standard treatment (M > 0):**
```
Line:    "Beamix considered {N} changes this month and rejected {M}. Rejection log: [link]"

Before "Rejection log: [link]":
  Separator: "  →  " — Geist Mono 11px, --color-ink-3

"Beamix considered {N} changes this month and rejected {M}." portion:
  Font: 13px Inter 400, --color-ink-3
  N and M rendered in Inter 500 (one weight up for the numbers — weight-for-emphasis rule)

"Rejection log:" portion:
  Font: 13px Inter 400, --color-ink-3

"[link text: → See rejection log]" portion:
  Font: 13px Inter 400, --color-brand-text (#2558E5), underline
  Links to: /inbox?filter=rejected&period=[YYYY-MM] (in-product URL, not a PDF annotation)
  In PDF context: rendered as a clickable hyperlink via React-PDF `<Link>` component
```

**Link typography hint (the arrow + text treatment per spec):**
- The `→` glyph: Geist Mono 11px, `--color-ink-3`
- "See rejection log" text: 13px Inter 400, `--color-brand-text`, underline on hover (PDF links do not hover — underline is always visible in PDF)
- Combined: `→ See rejection log` — space-separated, same line as the main sentence

**Copy variants:**

| Condition | Copy |
|---|---|
| M = 0, N > 0 | `"Beamix evaluated {N} changes this month and published all {N}."` — no link, no arrow |
| M = 1 | `"Beamix considered {N} changes this month and rejected 1. → See rejection log"` |
| M = 2–5 | `"Beamix considered {N} changes this month and rejected {M}. → See rejection log"` |
| M = 6+ | `"Beamix considered {N} changes this month and rejected {M} — including {top_reason}. → See rejection log"` where `top_reason` is the most frequent rejection reason in plain English (e.g., "3 were flagged by your Brief grounding rules") |
| N = 0 | Line omitted entirely |

**What counts as "rejected":** Agent jobs where `agent_jobs.status = 'rejected'`. Rejection causes tracked in `rejection_reason` field (enum): `'brief_grounding_fail'`, `'aria_flag'`, `'customer_block'`, `'agent_self_block'`. All four map to the M count.

### Behavior

- The line is present ONLY on Page 6 of the Monthly Update PDF. Not on other pages, not in the Monday Digest, not on any product chrome surface.
- The `/inbox?filter=rejected&period=[YYYY-MM]` link: this is the existing `/inbox` page filtered by URL parameters. The `/inbox` route must support `?filter=rejected` (status filter) and `?period=YYYY-MM` (date range filter). If not already implemented, add to F6 (/inbox) acceptance criteria as a pre-requisite for F28.
- The `{top_reason}` in the M=6+ variant is a server-side string generation: count rejection reasons, take the highest count, generate a human-readable phrase. Map: `brief_grounding_fail` → `"conflicted with your Brief"`, `aria_flag` → `"were flagged for review"`, `customer_block` → `"were blocked by your settings"`, `agent_self_block` → `"were self-blocked by the agent"`.

### Implementation notes

- **Component:** `apps/web/components/pdf/pages/MonthlyUpdatePage6.tsx` — add a `RejectionLine` sub-component after the action timeline block.
- **Data fetch:** In the Reporter agent function, add a query: `supabase.from('agent_jobs').select('status, rejection_reason').eq('customer_id', customerId).gte('created_at', periodStart).lt('created_at', periodEnd)`. Aggregate N and M before passing to PDF render.
- **React-PDF Link:** `import { Link } from '@react-pdf/renderer'`. The URL must be the absolute product URL (`https://app.beamix.tech/inbox?...`), not a relative path — PDF hyperlinks require absolute URLs.

### Accessibility

- This is a PDF surface. Screen reader accessibility for PDFs is handled by React-PDF's standard document structure (`<Document>`, `<Page>`). The Link element renders as a standard PDF hyperlink.
- For the in-product `/inbox` link target: standard product accessibility applies. The filtered inbox page must have an `<h1>` or `aria-label` that announces the active filter: `"Inbox — showing rejected actions for [Month Year]"`.

### Mobile + dark mode

- PDF-only surface. No mobile or dark mode considerations.

### Edge cases

1. **Reporter agent is paused for a customer mid-month:** N may be lower than actual total considered. Accept — the count is from `agent_jobs`, which reflects what Beamix processed. If the agent was paused, N is the actual number processed before the pause.
2. **M count is very high (>50):** The M=6+ variant handles this. The `{top_reason}` string prevents the line from reading as panic-inducing — it contextualizes the rejections.
3. **agent_jobs table has no `rejection_reason` field yet:** This field must be added to Tier 0 schema migration. It is required for the M=6+ variant and for the rejection log filter. If not present at MVP, M=6+ variant falls back to the M=2-5 copy (no `top_reason`).
4. **Customer's `/inbox` has never had a rejection filter used:** The URL `?filter=rejected&period=YYYY-MM` is constructed at PDF render time. If the inbox does not yet support these parameters, the link renders but the page does not filter. Log as a dependency issue in F6 ticket.
5. **PDF is generated for a Discover-tier customer who has very limited agent activity:** N may be very small (1-2). The line still renders with correct counts. No minimum threshold.

---

## F29 — Printable A4 Ops Card in /settings

### Trigger

Available on demand. Accessible from `/settings` navigation as a sub-page or tab titled `"Operations summary"`. No automatic trigger. Customer clicks "Print" button to open browser print dialog. Available at any time.

### Visual spec

**On-screen (pre-print) layout:**

```
/settings navigation item: "Operations summary"
  Same nav chrome as other /settings tabs.
  Located as the last item in the /settings nav group.

Content area (max-width 760px, centered):

  Page title: "Operations Summary"
    Font: 22px InterDisplay 500, --color-ink (text-h3)
    Below: "As of [date] at [time]" in Geist Mono 13px, --color-ink-4

  [ 48px gap ]

  Section 1 — "TRUTH FILE ESSENTIALS"
    Label: 11px Inter caps, tracking 0.10em, --color-ink-4
    Content rows (each 36px tall, 15px Inter 400 --color-ink-2):
      Business name: [value]
      Voice words: [up to 5, comma-separated]
      Never say: [up to 5, comma-separated, --color-score-critical at 70% opacity]
      Content tone: [enum value]

  [ 48px gap ]

  Section 2 — "ACTIVE WORKFLOWS"
    Same label style.
    Row per workflow: workflow name (Inter 500) · trigger type (Inter 400 ink-3) · last run (Geist Mono 13px ink-4)
    If no workflows: "No active workflows." in ink-3.

  [ 48px gap ]

  Section 3 — "ACTIVE AGENTS"
    Row per agent: agent name (Inter 500) · autonomy level (Inter 400 ink-3) · last action date (Geist Mono 13px ink-4)

  [ 48px gap ]

  Section 4 — "UPCOMING"
    Row per item (max 3): date (Geist Mono 13px ink-2) · workflow/agent name (Inter 400 ink-2)

  [ 72px gap ]

  Footer: "Generated by Beamix · [date] · beamix.tech"
    Geist Mono 9pt equivalent (11px in screen context), --color-ink-4

  [ 24px gap ]

  "Print" button: PillButton secondary md (40px, --radius-chip in product context)
    Label: "Print operations summary"
    On click: window.print()

  "Email me this card" link: 13px Inter 400, --color-brand-text, below the Print button, 16px gap
```

**Print stylesheet (`@media print { ... }`):**
- Hide all product chrome (sidebar, topbar, nav, Print button, "Email me this card" link, /settings tab navigation).
- `body { background: #F7F2E8; }` — cream paper register for the print output. Note: this is the only exception to the "Ops card = not cream" rule; on-screen it renders on white (product chrome), but the printed artifact is cream to match Beamix artifact register.
- Page size: A4 portrait. `@page { size: A4 portrait; margin: 17mm; }`.
- The content well renders at A4 width. All font sizes preserved (Inter/Geist Mono — standard system fonts for print fallback, or use `@font-face` with embedded font data).
- Hide the footer "Generated by Beamix" line from on-screen view but show in `@media print` (it is the print colophon, not screen UI). Use `class="sr-only print:block"` pattern (Tailwind print variant).

**Multi-domain handling (Scale tier):**
- If the customer has multiple domains (Scale tier white-label), the ops card shows a domain selector above Section 1: `"Domain: [dropdown]"` that is hidden in `@media print`. The selected domain's data populates the card. The customer switches domains, then prints — one card per domain. In print output, the selected domain name appears in the footer: `"Generated by Beamix for [domain] · [date] · beamix.tech"`.

**"Email me this card" behavior:**
- Click: opens a modal with the customer's email pre-filled (editable). Single "Send" button. Calls `POST /api/settings/ops-card/email` → generates the PDF server-side via React-PDF, sends via Resend as an attachment. Subject: `"Your Beamix Operations Summary — [date]"`. Plain-text email body: `"Your operations summary is attached."`. Signed: `"— Beamix"`.
- The email PDF uses the same cream-paper print register as the print output.

### Implementation notes

- **Route:** `apps/web/app/(product)/settings/operations/page.tsx`
- **Data fetching:** All data is available via existing Supabase queries — Truth File, workflows, agent_jobs. Fetch in a single server component with parallel queries. Data is current at page load time (SSR), not cached.
- **Print CSS:** Add `globals.css` print media query section, or use Tailwind's `print:` variant consistently. The layout must not break at A4 width — test at 793px (A4 at 96dpi).
- **React-PDF for email:** `apps/web/components/pdf/OpsCardDocument.tsx` — a React-PDF Document matching the print layout. Used only for the "Email me this card" path.

### Accessibility

- `role="region"` with `aria-label="Operations summary"` on the content well.
- Print button: `aria-label="Print operations summary"`.
- "Email me this card": `aria-label="Email a PDF of this operations summary to yourself"`.
- `prefers-reduced-motion: reduce` — no motion on this surface. Static page.

### Mobile + dark mode

- **Mobile (≤768px):** The ops card on-screen renders in a single column. The Print button is visible but the print output is always A4 portrait regardless of mobile viewport. On mobile, tapping "Print" opens the system print/share dialog.
- **Dark mode:** On-screen: standard product chrome dark mode tokens apply. The `@media print` CSS overrides to cream paper regardless of dark mode — print output is always cream.

### Edge cases

1. **Customer has zero active workflows (new account):** Section 2 renders `"No active workflows."` in `--color-ink-3`. Section 4 (Upcoming) may also be empty — render `"No scheduled runs."`.
2. **Scale-tier customer with 12 domains (Yossi):** Domain selector renders above Section 1. Yossi can print 12 cards by selecting each domain and clicking Print. Performance target: page re-render on domain switch within 500ms (data is already fetched server-side for the selected domain; client-side switch queries the already-loaded data map).
3. **Brief binding line on the ops card:** Per PRD v3 F29 acceptance criteria, the Brief binding line (F31) does NOT appear on the ops card print output. The `@media print` CSS must also hide the F31 `BriefBindingLine` component. Add `print:hidden` class to `BriefBindingLine`.
4. **Customer's Truth File has many `never_say` terms (>20):** The card shows up to 5. Truncate with `"+{N} more"` in `--color-ink-4` after the 5th term. The printed card does not show all terms — it is an ops summary, not a full audit.
5. **"Email me this card" PDF generation fails (React-PDF server error):** Return a 500 with user-facing error: `"Couldn't generate your card right now. Try the Print button instead."` in `--color-score-fair` color, inline below the Email button.

---

## F30 — Brief Grounding Inline Citation Everywhere

### Trigger

Renders wherever an agent action is displayed, if the action's `provenance_envelope.brief_clause_ref` is non-null. Rendered server-side as part of each action's display component. If `brief_clause_ref` is null (actions created before F30 ships): renders the fallback variant.

### Visual spec

**Standard treatment (all surfaces except Workflow Builder Inspector):**

```
┌ (1px left rule, --color-brand, full height of the citation block) 
│ 
│  AUTHORIZED BY YOUR BRIEF:           ← 11px Inter 500, --color-ink-4, caps, tracking 0.10em (text-xs)
│  "[clause text as approved]"         ← 12px Inter 400 italic, --color-ink-2, line-height 20px
│  — clause N of M · Edit Brief →      ← 11px Inter 400, --color-ink-3; "Edit Brief →" is --color-brand-text underline
└
```

**Dimensions:**
- Left rule: 1px, `--color-brand`, `border-left` style, height = total height of citation block
- Left padding from rule to content: 12px
- Top/bottom padding within citation block: 8px
- Total width: inherits from parent container (full column width minus rule + padding)
- Gap above citation block (from action summary): 12px
- Gap below citation block (to next element): 8px

**Italic rule override:** The DESIGN-SYSTEM states "Inter italic: never. Inter's italic is a slanted roman. Use font-weight: 500 for emphasis instead." However, F30 uses Inter 400 italic for the quoted clause text. This is a deliberate exception for quoted content — quoting convention requires italic to signify "this is a citation, not Beamix's voice." This exception is scoped to the cited clause text only, nowhere else. Document as an approved exception in DESIGN-SYSTEM-v1.

**Fallback variant (actions before F30 ships):**

```
│  AUTHORIZED BY YOUR BRIEF:
│  (Clause text unavailable for this action.)    ← 12px Inter 400 italic, --color-ink-4 (lighter — signifies missing data)
│  — clause reference not recorded               ← 11px Inter 400, --color-ink-4, no Edit Brief link
```

**Workflow Builder Inspector treatment (Design Lock B — cream + Fraunces):**

```
Background: --color-paper-cream, border-radius: --radius-card (12px)
Padding: 16px all sides
Width: 100% of Inspector panel minus 24px padding

  AUTHORIZED BY YOUR BRIEF:              ← same 11px caps, --color-ink-4
  "[clause text]"                        ← Fraunces 300 italic, 13px, --color-ink, line-height 20px
  — clause N of M · Edit Brief →         ← 11px Inter 400, --color-ink-3; "Edit Brief →" --color-brand-text
```

First-per-session selection: 400ms opacity fade-in (0 → 1) on the cream cell, plus one Trace behavior under the clause text (DESIGN-SYSTEM §2.2 Trace spec). Subsequent selections in same session: 120ms fade only.

**Placement on each surface:**

| Surface | Position of citation block |
|---|---|
| `/inbox` row right panel | Between the before/after diff and the Approve/Reject buttons |
| `/workspace` step output | Immediately below the step output text, before the next step |
| `/scans` Done lens row expansion | Below the action summary text, before the metadata row (timestamps, scan ID) |
| `/home` Evidence Strip cards | Below the action headline, above the "See in Workspace →" link |
| Workflow Builder node Inspector | Below the node configuration fields, full-width cream cell |

### Behavior

- Non-interactive except for the "Edit Brief →" link. No expand/collapse. No tooltip on the clause text. The citation is always visible — it is not hidden behind an interaction.
- "Edit Brief →" navigates to `/settings?tab=brief&edit=true`. New tab recommended (`target="_blank"`) on surfaces where mid-flow navigation would lose state (e.g., mid-workflow in Workflow Builder, mid-inbox review).
- Clause text is the `brief_clause_snapshot` field from the provenance envelope — the exact text as it read when the action was authorized. If the customer later edits their Brief, the citation shows the historical clause, not the current one. This is correct by design.
- "N of M" values: `N` is the 1-based index of the clause in the Brief's clause array; `M` is the total number of clauses (always 4 for MVP briefs).

### Implementation notes

- **Shared component:** `apps/web/components/brief/InlineCitation.tsx`. Props: `clauseRef: string | null`, `clauseSnapshot: string | null`, `totalClauses: number`, `variant: 'standard' | 'workflow-inspector'`.
- **Workflow Builder Inspector variant:** Same component with `variant='workflow-inspector'`. The parent Inspector panel is responsible for the first-per-session fade-in logic (store session flag in `useRef` or `sessionStorage` keyed to node ID).
- **Data requirements:** `brief_clause_ref` and `brief_clause_snapshot` in the `provenance_envelope` JSONB field on `agent_jobs`. These are Tier 0 schema requirements (items 11 and 12 in Tier 0 list). Ensure all agent execution paths write these fields.

### Accessibility

- `role="complementary"` with `aria-label="This action was authorized by Brief clause {N}: {clause text}"` on the citation block container. Screen readers announce the citation inline with the action.
- For fallback variant: `aria-label="This action was taken before Brief citation tracking was enabled."`.
- "Edit Brief →" link: `aria-label="Edit your Brief (opens in new tab)"` (if `target="_blank"`).
- The 1px left rule is decorative — `aria-hidden="true"` on the rule element.
- `prefers-reduced-motion: reduce` — Workflow Builder Inspector cream cell: no fade-in animation (appears instantly at full opacity). Trace under clause does not appear.

### Mobile + dark mode

- **Mobile (≤768px):** Citation block renders in a single column. The left rule is preserved. Font sizes are identical (they are already small — no downscaling needed). Text wraps naturally. The "— clause N of M · Edit Brief →" line may wrap to a second line — this is acceptable.
- **Dark mode:** Standard variant: `--color-ink-4`, `--color-ink-2`, `--color-brand-text`, `--color-brand` all resolve to dark mode equivalents per DESIGN-SYSTEM §1.1. The 1px `--color-brand` rule becomes `--color-brand` dark (`#5A8FFF`). Workflow Builder Inspector cream cell: the cream register is out of scope for dark mode — the cream cell always renders on cream background inside dark-mode product chrome. This creates a light island on a dark canvas — this is intentional (per Design Lock B rationale: "cream does emotional work; white does factual").

### Edge cases

1. **Brief has not been approved yet (early onboarding state):** Any agent jobs created before Brief approval will have `brief_clause_ref = null`. Fallback variant renders. Once Brief is approved, new jobs get clause refs. Historical jobs remain with fallback.
2. **Brief was deleted and re-created (customer re-did onboarding):** The `brief_clause_snapshot` on old jobs still holds the historical clause text. The citation renders correctly even though the old Brief no longer exists. The snapshot is the source of truth, not a foreign key lookup.
3. **Customer has only 2 Brief clauses** (non-standard brief — edge case for custom verticals): "N of M" renders as "clause 2 of 2". The component handles `totalClauses` dynamically from the Brief record.
4. **Clause text is very long (>200 characters):** The citation block has no max-height. It expands to show the full clause text. This may be jarring at extremes. Add a soft recommendation to Brief authoring: keep each clause under 120 characters (not enforced, advisory).
5. **Workflow Builder Inspector: customer selects a node with no agent action yet assigned (empty trigger node):** No `brief_clause_ref` exists. The citation block does not render. The Inspector shows configuration fields only.

---

## F31 — Brief Binding Line at Every Product Page Bottom

### Trigger

Rendered as part of the shared `PageChrome` layout component on all product pages. Always present once the Brief is approved. Rotates daily by deterministic computation at render time (server-side in `app/(product)/layout.tsx` server component).

### Visual spec

**Typography:**
- Font: Fraunces 300 italic, 13px
- Line-height: 0.5 (per spec) — this produces a very tight single-line block. In practice, `line-height: 1` (13px) is more typographically correct for readability. Use `line-height: 20px` (closest permitted spacing value above the 13px size) to ensure descenders don't clip. The "0.5" in the spec is likely shorthand for "minimal" — implement as the smallest readable value.
- Color: `--color-ink-3`
- Alignment: centered
- Display: `block`

**Content pattern:**
```
"{clause text}" — clause N · Edit Brief →
```

- The clause text is wrapped in typographic quotation marks: `"` (U+201C) and `"` (U+201D). Not straight quotes.
- `"— clause N"` is 12px Inter 400, `--color-ink-4` (lighter than clause text — attribution is subordinate to the content).
- `"· Edit Brief →"` is 12px Inter 400, `--color-brand-text` (#2558E5), no underline at rest, underline on hover.
- Separator between clause text and attribution: ` — ` (em dash with spaces)

**Position:**
- Anchored to the **bottom of the main content area**, NOT to the browser viewport or the footer chrome.
- Sits ABOVE the `<footer>` or `<nav>` bottom chrome element.
- `margin-top: auto` within the main content flexbox so it pushes to the bottom of available content space.
- Gap above (between last content element and binding line): 72px (standard major section gap).
- Gap below (between binding line and footer chrome): 24px.

**Background:** Inherits the page's background (`--color-paper` on product pages). No distinct background. No card border. The line is furniture, not a component.

**Rotation logic:**
```typescript
function getBindingClause(customerId: string, briefs: Brief, date: Date): string {
  const dateString = date.toISOString().slice(0, 10); // YYYY-MM-DD
  const hash = simpleHash(dateString + customerId);   // e.g., djb2 or fnv1a
  const index = Math.abs(hash) % briefs.clauses.length;
  return briefs.clauses[index];
}
```

`simpleHash` is any stable non-cryptographic string hash (djb2 or FNV-1a). The implementation must be consistent server-side across all pages. `date` uses the customer's local midnight (derive from `user_profiles.timezone`; fallback to UTC if null). "Updates at local midnight" means the component re-renders at midnight — SSR pages naturally re-render on next request.

**"N" in attribution:** `clauseIndex + 1` (1-indexed, not 0-indexed). "clause 3" not "clause 2."

**Pages where binding line appears:**
`/home`, `/inbox`, `/workspace`, `/scans`, `/competitors`, `/crew`, `/schedules`, `/settings` (all tabs).

**Pages where binding line is absent:**
`/scan` (public acquisition — not a product page), `/reports/[id]` (artifact surface — has its own Seal treatment), `/security` (disclosure surface), any public permalink route.

**Placeholder state (Brief not yet approved):**
```
"Your Brief is being prepared."   ← Fraunces 300 italic, 13px, --color-ink-3, centered
                                     No "— clause N" attribution. No "Edit Brief →" link.
```

### Behavior

- No animation on page load. Appears at full opacity at `t=0`. Not an entrance animation.
- No hover state on the clause text itself.
- "Edit Brief →" link hover: standard link hover (`--color-brand` color, underline).
- "Edit Brief →" link click: navigates to `/settings?tab=brief&edit=true`.
- The binding line updates its clause at local midnight. The new clause appears on the first page load after midnight. No transition — it simply changes.

### Implementation notes

- **Shared component:** `apps/web/components/brief/BriefBindingLine.tsx`. No client-side state. Server-rendered.
- **Layout integration:** `apps/web/app/(product)/layout.tsx` — render `<BriefBindingLine>` at the bottom of the `<main>` element, after the page slot content. The layout server component fetches `briefs.clauses[]` for the current customer once and passes it down.
- **Hash function:** Implement `apps/web/lib/utils/deterministicHash.ts` — a single shared djb2 or FNV-1a implementation used by both this component and any other deterministic hash needs. Never use `Math.random()` here.
- **Timezone:** Use `user_profiles.timezone` (a TZ string like `"Asia/Jerusalem"`). Parse via `Intl.DateTimeFormat` on the server to get the customer's local date string.
- **Ops card exclusion:** In `@media print` on the `/settings/operations` page, add `print:hidden` class to the `BriefBindingLine` component. The binding line should not appear on the printed ops card.

### Accessibility

- `role="contentinfo"` is reserved for footer. This component should use `role="note"` or simply no ARIA role — it is ambient body text.
- `aria-label` on the container: `"Brief clause in use today"` — screen readers can identify what this region is without it being announced on every page load.
- The "Edit Brief →" link has standard `aria-label="Edit your Brief"`.
- Hidden below 768px — add `aria-hidden="true"` when `hidden` (so screen readers on mobile also skip it).

### Mobile + dark mode

- **Mobile (≤768px):** Component is `hidden` (CSS `display: none`). Not rendered. The brief binding line is desktop-only ambient brand per the spec ("hidden below 768px to avoid mobile crowding"). On mobile, the Brief citation in F30 handles in-context Brief references.
- **Dark mode:** `--color-ink-3` resolves to `#9CA3AF` in dark mode. `--color-ink-4` resolves to `#6B7280`. `--color-brand-text` resolves to `#7AAEFF`. The line is readable in dark mode with these tokens. No special dark mode handling needed.

### Edge cases

1. **Customer has more than 4 Brief clauses** (future Brief schema expansion): `clauses.length` in the hash computation reflects the actual count. The rotation works for any clause count.
2. **Two customers on the same product page (Yossi's multi-client switcher):** Each client account has its own Brief. When Yossi switches clients, the layout re-renders with the new client's Brief. The binding line shows the new client's clause immediately. This is correct — the binding line is contextual to the selected client.
3. **Brief is empty (clauses array length 0):** Show placeholder state: `"Your Brief is being prepared."`. No hash computation needed.
4. **Customer views a page at 23:59 then stays on the page past midnight:** The binding line does not update dynamically — it renders at page load time. The clause only changes on the next page navigation or refresh. This is acceptable (ambient furniture should not flash-update mid-session).
5. **Hash collision: two different date+customerId combos produce the same clause index:** Expected and intentional. The hash does not need to be collision-free — it needs to be deterministic per (date, customerId) pair. Hash collision just means the same clause appears on two different days, which is fine.

---

*End of F23–F31 specs.*
*This document is implementation-ready. Cross-references: DESIGN-SYSTEM-v1.md for all tokens, PRD-wedge-launch-v3.md for acceptance criteria, HOME-design-v1.md for /home placement context, ONBOARDING-design-v1.md for F27 Step 3 context, EDITORIAL-surfaces-design-v1.md for F28 PDF context.*

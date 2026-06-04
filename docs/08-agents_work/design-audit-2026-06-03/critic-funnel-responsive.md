# Design Critique — Conversion Funnel & Mobile Responsiveness
**Auditor:** design-critic · **Date:** 2026-06-03 · **Quality bar:** Stripe / Superhuman / Linear
**Scope:** Free scan, login, signup, discovery, post-payment onboarding (desktop) + 5 mobile responsive surfaces
**Verdict:** **CRITICAL_ISSUES** — the company's #1 acquisition surface does not exist, and the mobile app shell is structurally broken.

---

## Observed reality (objective, before judgment)

From the visual evidence:

| Surface | What is actually on screen |
|---|---|
| `scan-desktop` | Centered magnifier glyph, "Free scan" heading, gray sub-copy "Coming Wave 1 — enter your business name and we'll scan…". **No input. No button. No scan.** A pure stub. |
| `login-desktop` | A single white card with a lock glyph, "Sign in to Beamix", "Coming Wave 1 — Supabase Auth will be wired here." No email field, no Google button, no password field. Stub. |
| `signup-desktop` | Identical card to login, titled "Sign up", same "Coming Wave 1" copy. The two are visually indistinguishable. Stub. |
| `discovery-desktop` | Vertically-centered "Book a Discovery Call" + "Our calendar link is being set up. Please email hello@beamixai.com". No Cal.com embed. Dead end → mailto. Stub. |
| `onboarding-post-payment-desktop` | Full app shell (sidebar + search bar) with a centered empty state "Almost there — Coming Wave 1 — finishing your setup and activating your subscription." A paying customer lands on a placeholder. |
| `dashboard-mobile` (375px) | Sidebar is **fixed and visible**, consuming ~210px. "Overview" content is crushed into a ~165px column on the right. Headline "Overview" wraps; "FOUNDING MEMBERS" eyebrow wraps to two lines; the score card text wraps to 4+ lines. A red "1 Issue" error pill floats bottom-left over the nav. |
| `home-mobile` | Same broken split. Sidebar fixed; "Your workspace" empty state squeezed into the right ~165px, body wraps to 6 lines. |
| `approvals-mobile` | Same broken split. Right column shows an error state "Could not load approvals" inside a card crushed to ~150px wide. |
| `scan-mobile` | Renders **correctly** — full-width centered stub, no sidebar. (Funnel pages are outside the app shell.) |
| `login-mobile` | Renders **correctly** — full-width centered card. (Also outside the app shell.) |

**The pattern:** every surface inside the authenticated app shell (`home`, `dashboard`, `approvals`, `scans`, `automation`) is broken on mobile because the sidebar never collapses. Every standalone funnel page (`scan`, `login`, `signup`, `discovery`) is responsive but is a non-functional placeholder.

---

## 1. The Free Scan — the most important screen in the company, and it's a stub

This is the acquisition hook. It is the single screen that converts a curious SMB owner into a lead. Right now it is a magnifier icon and a sentence promising a feature that doesn't exist. This would not survive thirty seconds at a YC demo. Below is the spec for what world-class looks like — opinionated, with exact values.

### 1A. The entry state (`/scan`)

**Layout.** Single column, centered, max-width 560px, vertically centered with `min-h-[100dvh]`. White `#FFFFFF` background — not `#F7F7F7`. This screen earns full white because it's a focused moment, like a Stripe Checkout or a Typeform first step.

**Above the input — the promise.**
- Eyebrow (12px, Inter 600, uppercase, `#6B7280`, letter-spacing 0.08em): `FREE AI-SEARCH SCAN`
- H1 (InterDisplay-Medium, 40px desktop / 30px mobile, tracking -0.02em, `#0A0A0A`, line-height 1.1):
  **"See where AI search hides you"**
  (6 words, outcome-first, present tense — voice-canon compliant.)
- Sub-copy (Inter 400, 17px, `#6B7280`, max-width 460px, line-height 1.6):
  "Enter your business and site. We scan ChatGPT, Gemini, and Perplexity to show exactly where you're invisible — in under 60 seconds."

**The input — make it the hero.** A single, large, confident field. Reference: **Stripe's payment element** and **Vercel's domain-input** field.
- Input height: 56px. Border `1px #E5E7EB`, radius `12px`, padding-x 16px, font 16px (never <16px — iOS zoom guard).
- Placeholder: `yourbusiness.com`
- Focus state: `ring-2 ring-[#3370FF] ring-offset-2`, border transitions to `#3370FF` over 150ms.
- A second field below (or a stacked two-field group, 12px gap): "Business name" (e.g., placeholder `Cohen & Levi Accounting`).
- Primary CTA, full width, 56px tall, `#3370FF`, white text, radius `12px`, Inter 600 16px: **"Run my free scan →"** (verb-first, voice-canon). `active:scale-[0.98]`, `hover:bg-[#2960DB]`.
- Micro-trust line under the button (13px, `#6B7280`): "No credit card. No signup to see your score." Reference: **Linear's "no credit card required"** restraint.

**Trust band (below the fold or inline, small).** Three engine logos in grayscale (ChatGPT, Gemini, Perplexity) with a one-line label "Scanned across the engines your customers actually ask." Keep it 13px and muted — this is reassurance, not decoration.

### 1B. The scanning moment — the emotional hook

This is the screen people screenshot and share. It must feel like work is happening on their behalf. Reference patterns: **Vercel deploy logs**, **Ahrefs/Semrush crawl progress**, **Superhuman's "getting things ready"**, and the cinematic restraint of an **Apple setup spinner**.

**Do NOT use a generic spinner.** Build a live, sequential checklist that reveals engines being queried one at a time:

```
Scanning Cohen & Levi Accounting…

 ✓  ChatGPT       — checked 5 queries        (row fades in, check lands with a 300ms spring)
 ◐  Gemini        — querying "accountant Tel Aviv"   (active row, pulsing #3370FF dot)
 ○  Perplexity    — queued                   (muted #6B7280)
```

Specifics:
- Each row: 48px tall, mono numerals (`Geist Mono`) for the query counts — this is exactly what the brand reserves Geist Mono for ("scan result data").
- A thin progress bar at top, `#3370FF` fill on `#E5E7EB` track, height 3px, radius full. Animate via a transform-safe technique (scaleX on a child, not the bar's width).
- Stagger reveal: 120ms/row (matches brand hero stagger token).
- Honest copy that cycles the actual query being run ("querying 'bookkeeping near me'…") — this builds the perception that real searches are happening. Voice: instructive, zero marketing language.
- Total dwell ~8–15s feels premium; if the real scan is faster, hold the reveal so the user *sees* the work. If slower, keep streaming query lines so it never feels stalled.
- `prefers-reduced-motion`: rows still appear sequentially but without the spring/pulse; the dot becomes a static state.

### 1C. The reveal — where they're invisible

The payoff. This is the dopamine. Reference: **a credit-score reveal (Credit Karma)** crossed with **Linear's clean data cards**.

**The score, front and center.**
- A large animated score ring (160px), `stroke-dashoffset` count-up over 1200ms `cubic-bezier(0.22,1,0.36,1)`, number counting up in sync (per design system §10).
- Score color is data-viz only: Critical `#EF4444` / Fair `#F59E0B` / Good `#10B981` / Excellent `#06B6D4`. **The ring is the ONE place cyan is allowed** — never on a CTA.
- A blunt, honest headline keyed to the score band:
  - Critical: "You're invisible in AI search."
  - Fair: "AI search barely knows you exist."
  - Good: "You show up — but you're losing ground."
  Voice: direct, no blame, no exclamation point.

**The per-engine breakdown — the "where you're invisible" gut-punch.** Three rows, one per engine, each stating the verdict in plain language (mono for the data):

```
ChatGPT      Not mentioned for "accountant in Tel Aviv"        ✗ red dot
Gemini       Rank 7 for "tax help Tel Aviv"                    ◑ amber dot
Perplexity   Not indexed                                        ✗ red dot
```

- Use the score colors as 8px status dots only — text stays `#0A0A0A`.
- This is the emotional core: the user sees their competitors' world and their own absence in it. Keep it factual; the facts do the persuading.

**The hook → CTA.** One sentence that reframes the problem as solvable, then the conversion action:
- "Three gaps are costing you customers who ask AI for an accountant. Beamix's agents fix them — you approve, they ship."
- Primary CTA pill (this is a marketing-grade moment, so pill is correct here per brand): `#3370FF`, "See how we fix this →" → routes to discovery/signup.
- Secondary, ghost: "Email me this report" (lead capture; also the natural place to gate the full breakdown behind an email).

**Empty/failure states (mandatory, currently absent):**
- Site can't be reached: honest message "We couldn't reach yourbusiness.com — check the URL?" with the field re-focused. No blame.
- Zero gaps found (rare, high score): celebrate, then upsell monitoring — "You're ahead. Stay there." → CTA to track weekly.

**Bottom line on the scan:** today it scores 0/10 because it does not exist. The spec above is the difference between a landing page and a product. This is the single highest-leverage build in the company.

---

## 2. Login / Signup / Onboarding / Discovery

### Login & Signup (`login-desktop`, `signup-desktop`) — stubs, and identical

**Findings:**
1. **No form exists.** Both are "Coming Wave 1" cards. No email, no password, no Google/Microsoft SSO button. Critical funnel gap.
2. **Login and signup are visually identical** except the title. A returning user and a new user get the exact same screen — no differentiation, no cross-link ("Don't have an account? Start free scan").
3. **The card is too tall and hollow.** ~280px tall with a tiny lock glyph floating in dead space — the empty-state proportions feel like a 404, not an auth screen.

**Upgrade spec:**
- Two-column on desktop ≥1024px: left = the form (max 400px), right = a calm brand panel (a muted `#F7F7F7` or `#0A0A0A` editorial panel with one line of social proof or the product promise). Reference: **Linear's split auth**, **Stripe Dashboard login**.
- Form card: 400px wide, white, radius 20px (brand card radius), shadow `0 2px 8px rgba(0,0,0,0.08)`, padding 32px.
- Order: logo mark (top, 28px) → H2 "Sign in" / "Create your account" (Inter 600, 24px, sentence case) → SSO button(s) first (Google, full-width, 44px, `#E5E7EB` border, radius 8px) → "or" divider → email field → password field → primary button (`#3370FF`, rounded-lg 8px — **product utility, NOT pill** per brand §4) → footer link to the opposite action.
- **Voice fix:** drop "Sign in to Beamix" (literal). Use "Welcome back" (login) / "Create your account" (signup). The CTA: "Sign in" / "Create account" — verb-first.
- Touch targets ≥ 44px; inputs ≥ 48px tall, 16px font (iOS zoom guard).
- Focus rings on every field (`ring-[#3370FF]`), aria-labels, visible `<label>` above each input (design system §6 mandates this — placeholder-only is a WCAG fail).

### Discovery (`discovery-desktop`) — a dead end disguised as a page

**Findings:**
1. **The conversion step is a `mailto:`.** "Our calendar link is being set up. Please email hello@beamixai.com." Asking a warm, ready-to-buy lead to *open their email client and compose a message* is the highest-friction possible path. This will leak the majority of qualified leads.
2. **Vertically centered with vast empty space** above and below — feels unfinished.
3. The mail link is `#3370FF` underlined — correct accent use, but it's the wrong action entirely.

**Upgrade spec:**
- Embed the **Cal.com inline widget** (the brand brief literally specifies Cal.com). Left column: the value framing — "Book a 15-minute discovery call" H2, three bullets on what they'll get ("We review your scan", "We map the fixes", "You decide if it's a fit"). Right column: the live calendar.
- If the calendar genuinely isn't ready, the interim must still be a **form** (name + email + "best time"), not a mailto. Capture the lead in-product; never bounce them out.
- Add the scan context: pull the user's score into this page ("Your scan found 3 gaps. Let's walk through them.") so the call feels personalized, not generic.

### Post-payment onboarding (`onboarding-post-payment-desktop`) — a paying customer hits a placeholder

**Findings:**
1. **A customer who just paid $79–$499 lands on "Almost there — Coming Wave 1".** This is the worst possible moment for a stub: the buyer's-remorse window. The first post-purchase second must reassure and create momentum. Reference the gold standard: **Superhuman's white-glove onboarding**.
2. The empty-state illustration is a generic doc glyph — no Beamix character, no agents, no sense of "work is starting for you."
3. The sidebar is present but every nav item leads to more placeholders — the customer can wander into dead ends.

**Upgrade spec:**
- A genuine onboarding sequence: a warm seal ("Welcome — Beamix" per voice canon Model B), then a visible first-run task list: "1. Confirm your business · 2. We run your baseline scan · 3. Meet your agents." Each step completes with a satisfying check.
- Kick off the baseline scan automatically and show the same live scanning moment from §1B — the customer should *watch their agents start working* in the first 30 seconds. This is the single best retention lever.
- Animation budget: Tier 1 (one signature moment) — onboarding completion is explicitly listed as a sanctioned signature animation in the brand quality bar.

---

## 3. Mobile responsiveness — the app shell is structurally broken (P1)

**Confirmed across `dashboard-mobile`, `home-mobile`, `approvals-mobile`:** at 375px the sidebar does **not** collapse to a drawer. It stays fixed at roughly 210px, leaving the entire app content crushed into a ~165px column. The design system (§4) explicitly specifies: *"Mobile sidebar — Overlay (`fixed inset-0 z-50`), full-width drawer."* The implementation ignores this. Every authenticated mobile view is unusable.

### Enumerated breakages + fixes

| # | Surface | Broken behavior | Fix |
|---|---|---|---|
| M1 | All app-shell pages | Sidebar fixed at ~210px on a 375px viewport; content lives in ~165px | Hide the persistent sidebar below `md` (`768px`). Replace with a hamburger in a top app-bar that opens a `fixed inset-0 z-50` overlay drawer (240px wide, scrim behind). Per design system §4. **This is the single fix that unblocks all of mobile.** |
| M2 | `dashboard-mobile` "Overview" | H1 wraps; "FOUNDING MEMBERS" eyebrow wraps to 2 lines; score card text wraps to 4–5 lines; "0/100 — 100 slots remaining" is barely parseable | Once M1 frees the width, content gets full 375px − 32px padding = 343px. Re-check: H1 to ~28px on mobile, eyebrow stays one line, card padding 16px. |
| M3 | `dashboard-mobile` | Red **"1 Issue" error pill floats bottom-left**, overlapping the nav, clipped by the viewport edge | This looks like a dev/error toast leaking into the UI. It must not ship. If it's a real toast, position bottom-right per design system §10, with safe-area inset. If it's a Next.js dev indicator, confirm it's disabled in the captured build. |
| M4 | `home-mobile` empty state | "Your workspace" body wraps to 6 lines in the crushed column; the copy is a "Coming Wave 1" stub | Fix width via M1. Replace stub copy with a real first-run empty state + CTA (design system §5 requires illustration + heading + body + primary CTA — the CTA is missing entirely). |
| M5 | `approvals-mobile` | Error card ("Could not load approvals") crushed to ~150px; the error icon + 4-line message barely fit | Width via M1. Also: this is an error state on a primary flow appearing by default — confirm it's a genuine fetch failure and not a missing empty state being rendered as an error. |
| M6 | All app-shell | The collapse-sidebar chevron (top-right of the nav) is present but the nav is already mis-sized — the control is meaningless at this breakpoint | Below `md`, the chevron should be replaced by the drawer-close affordance inside the overlay; the app-bar gets the hamburger. |
| M7 | Touch targets | Sidebar nav rows and the search bar are fine in size, but once they live in a drawer, ensure each row is ≥ 44px tall with ≥ 8px vertical rhythm | Standard: 44px min tap target (brand a11y + Apple HIG). |
| M8 | Type scaling | Desktop H1 sizes carry to mobile and overflow | Add a mobile step to the type scale: Hero 40→30px, H1 40→28px, H2 28→22px. Body stays 16px (never below — iOS zoom). |
| M9 | Search bar | The `⌘K` search persists on mobile where there's no command key | Below `md`, collapse the search to an icon-only tap target that opens a full-screen search sheet; drop the `⌘K` hint. |

**Funnel pages on mobile are fine structurally** (`scan-mobile`, `login-mobile` are full-width centered, no sidebar) — but they inherit the same content problem: they're stubs. Once §1–2 build out, verify the scan input is 16px font and 56px tall on mobile, the CTA is full-width, and the card padding doesn't crowd the 375px edge (min 16px gutters).

**Breakpoint contract to enforce:**
- `< 768px`: no persistent sidebar; app-bar + hamburger + overlay drawer; single-column content, `px-4`, `max-w-full`.
- `768–1024px`: collapsed icon-rail sidebar (64px) acceptable, or drawer.
- `≥ 1024px`: full 240px sidebar.

---

## 4. Top 7 highest-leverage moves (ranked by conversion × perceived quality)

1. **Build the free scan end-to-end (entry → live scanning moment → reveal).** §1. It is the company's only acquisition hook and it currently does not exist. Nothing else in the funnel matters if the front door is a placeholder. Highest impact on conversion, full stop.

2. **Fix the mobile app shell — collapse the sidebar to an overlay drawer below 768px.** §3 M1. One architectural fix unblocks every authenticated mobile screen. Half of SMB owners are on mobile; today they get a 165px-wide unusable app. Highest impact on perceived quality and retention.

3. **Replace the discovery `mailto:` with an embedded Cal.com booking (or at minimum an in-product lead form).** §2. This is a direct, measurable leak of warm, bottom-of-funnel, ready-to-buy leads — the most expensive leads to lose.

4. **Build real login/signup with SSO-first, differentiated screens, labeled fields, and rounded-lg product buttons.** §2. Auth is the gate between every visitor and the product; "Coming Wave 1" here means the product is inaccessible.

5. **Turn post-payment onboarding into a Superhuman-grade first run that auto-starts the baseline scan.** §2. The buyer's-remorse window is the highest-stakes retention moment; a stub here risks day-one churn on a customer who just paid up to $499.

6. **Kill the floating red "1 Issue" pill and audit for dev/error artifacts leaking into the UI.** §3 M3. A stray error overlay on the flagship dashboard screenshot signals "unfinished" louder than any copy — it must never reach a customer's screen.

7. **Add a mobile type scale + 16px-minimum inputs + 44px touch targets across the funnel.** §3 M7–M9. The polish layer that separates "works on mobile" from "feels native on mobile" — and the 16px input rule prevents the jarring iOS auto-zoom on every form field.

---

## What's working well (preserve these)

1. **The voice in the placeholder copy is on-brand** — "enter your business name and we'll scan your AI search visibility across ChatGPT, Gemini, and Perplexity" is direct, concrete, and names the three engines. Carry this exact tone into the real screens.
2. **Color discipline is clean** — the one blue `#3370FF` is used correctly (the mail link, the active "Home" nav state, the score "0/100" accent). No retired navy/orange/cyan-as-CTA violations spotted.
3. **The sidebar's information architecture is sound** — Home / Inbox / Scans / Automation / Archive / Competitors / Settings is a coherent, calm nav. The problem is purely its responsive behavior, not its structure or labeling. The active-state treatment (blue text + tint on "Home" in `home-mobile`) matches the design system.

---

## Severity summary

| Severity | Count | Items |
|---|---|---|
| CRITICAL | 6 | Free scan stub (§1) · mobile sidebar broken (M1) · discovery mailto dead-end (§2) · login/signup non-functional (§2) · post-payment stub (§2) · floating error pill (M3) |
| SHOULD_FIX | 5 | Mobile type scale (M8) · 16px input guard · 44px touch targets (M7) · labeled auth fields (a11y) · mobile search sheet (M9) |
| NICE_TO_HAVE | 2 | Two-column auth brand panel · trust band engine logos on scan |

**Final verdict: CRITICAL_ISSUES.** The funnel cannot convert and mobile cannot be used. These are not polish items — they are the existence of the product's front door and the usability of its app on half its devices.

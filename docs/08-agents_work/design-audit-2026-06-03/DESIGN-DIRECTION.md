# Beamix Product — Design Direction

**For:** Adam (founder) · **From:** Design-Lead · **Date:** 2026-06-03
**Scope:** The product app only (Next.js dashboard + funnel). Marketing (Framer) is out of scope.
**Source:** Synthesis of three audits — console craft, conversion funnel + responsive, and three customer-persona walkthroughs — against the brand canon and the billion-dollar quality bar.

> **Read this first.** The product is structurally fine and emotionally flat. The bones are right (sidebar, nav, color tokens, voice). The *finish* is at roughly 40% of the bar, and 90% of screens are empty "Coming Wave 1" stubs. Nothing here requires re-platforming. It requires a focused finish pass plus building the front door (the free scan) that doesn't exist yet. This document is the plan to get from "competent Tailwind starter" to "Stripe/Linear/Anthropic-grade product."

---

## 1. The Design North Star

Beamix's product should feel like a **calm, confident expert who already did the work and is handing you the result.** Not a dashboard you operate — a workspace where the work is visibly happening *for* you. White space you can breathe in, one decisive blue used where it matters, sharp editorial headings that state instead of whisper, and real numbers in clean mono type that make you feel the scan is true. Every empty screen should *sell* the next moment, never apologize for being unfinished. When an SMB owner lands here, the gut reaction must be "this thing is already on it" — not "what am I supposed to do?"

**The feel in one line:** *A quiet, expensive console that does the work for you — outcome first, one blue, zero apology.*

---

## 2. Reference Board

Six products, one specific thing we take from each. Concrete, not vibes.

| Product | The one thing we take |
|---|---|
| **Linear** | The *heading register* — page titles that have presence at 30–32px with tight tracking, not 24px plain bold. And the near-invisible command bar (search is a quiet utility, not a hero). |
| **Stripe** | The *card finish* — white cards on a light canvas with a tight, two-layer tinted shadow so they sit on the page instead of dissolving. Plus big mono numbers for metrics. |
| **Anthropic Console** | The *calm white canvas* — white background, crisp hairlines, one accent. The opposite of grey-on-grey-on-grey. And "preview-then-populate" empty states. |
| **Vercel** | The *deploy-log scanning moment* — a live, sequential, honest progress feed (engine-by-engine) that makes work feel like it's happening. The single confident input field (domain entry). |
| **Superhuman** | The *post-payment first run* — a white-glove onboarding that auto-starts work in the first 30 seconds so the buyer watches their agents begin, killing buyer's remorse. |
| **Credit Karma** | The *score reveal* — a large animated ring counting up to a blunt, honest verdict. The dopamine payoff of the free scan. |

---

## 3. Why it's not there yet

The shared P1 failures across all three reports:

- **The front door doesn't exist.** `/scan` — the company's only acquisition hook — is a magnifier icon and a sentence. No input, no scan, no result. All three personas die here: Dani bounces in 4 seconds, Yossi closes the tab, Marcus never starts the trial.
- **"Coming Wave 1" leaks internal roadmap language onto 6+ customer-facing surfaces.** Paying SMB owners read this as "the product isn't finished" — and as *their own* unfinished homework. It is the most-repeated trust-eroding pattern in the product.
- **Grey-on-grey-on-grey wash with no focal point.** Three near-identical greys stacked (#F7F7F7 / #FFFFFF / #E5E7EB), and the one distinctive asset — #3370FF — is barely deployed. No screen has a point of focus.
- **Headings whisper.** Page H1s render as ~24px plain Inter — a `text-2xl font-bold` default — when the entire brand thesis is "sharp InterDisplay typography." This single tell makes the whole product read as a template.
- **The mobile app shell is structurally broken.** The 240px sidebar never collapses; at 375px it crushes content into a ~165px column. Half of SMB owners are on mobile and the app is currently unusable for them.
- **Empty/error states are defaulted, not designed.** Errors float in vast empty cards with no recovery button ("refresh the page" instead of a Try-again CTA). Empty states are stock Lucide line-art in a void instead of selling the shape of what's coming. The Approvals *error* (not empty — error) is the "trust singularity" that collapses the agents-do-the-work thesis.

---

## 4. Foundational system fixes (P0 — lift every screen at once)

These are cross-cutting. Each one multiplies across all 9 surfaces. **Build these first** — they are prerequisites and the highest ROI in the audit. Most are pure-design + reusable-component work, independent of any backend pipeline.

### 4.1 The heading / typography system (highest ROI single move)

Switch every page H1 from timid Inter to the brand's display voice. Exact specs:

| Element | Spec |
|---|---|
| **Page H1** | InterDisplay-Medium · **30–32px** (console register, NOT 40px marketing-hero) · `letter-spacing -0.02em` (−2px optical) · `leading-[1.1]` · `#0A0A0A` |
| **Subtitle** | Inter 400 · **15px** · `#6B7280` · `leading-[1.5]` · `max-w-[480px]` — reads as a calm caption, not a competing line |
| **Eyebrow** | Inter 600 · **12px** · uppercase · `tracking-[0.08em]` · `#9CA3AF` (one notch lighter than body-muted so it recedes as a label) |
| **Gaps** | H1 → subtitle: **8px** · subtitle → first content block: **32px** |
| **Mobile step** | Hero 40→30 · H1 32→28 · H2 28→22 · **Body stays 16px (never below — iOS zoom guard)** |

One heading system across funnel and console — today there are two (24px left-aligned on built pages, 18px centered on stubs).

### 4.2 How and where to deploy the blue

"One blue, used with restraint" does **not** mean "one blue, used almost never." Deploy #3370FF on **the one primary action or metric per surface**, never more:

- Primary CTA button per screen → `#3370FF` fill, white text, `rounded-lg` (8px) in product / pill only for marketing-grade moments (scan reveal CTA).
- The hero metric per screen → founding-cohort bar fill, score-ring stroke, primary progress.
- Active nav pill (already correct — `bg-[#EFF4FF] text-[#3370FF]`). Preserve.
- Focus rings everywhere → `ring-2 ring-[#3370FF] ring-offset-2`.
- **Never** on data viz — score colors (cyan/green/amber/red) own that lane. Cyan #06B6D4 is *data-only*, never a CTA or link.

**Canvas flip (recommended):** move to a **white #FFFFFF page background** with #F7F7F7 reserved for inset/secondary panels. A white console with crisp hairlines + tight tinted shadows reads more premium (Anthropic, Vercel) than an all-grey wash. Grey-on-grey is the #1 reason this looks washed out.

**Card finish:** white card · `border #E5E7EB` · **`shadow-[0_1px_2px_rgba(10,10,10,0.04),0_1px_3px_rgba(10,10,10,0.06)]`** (Stripe's tight two-layer tinted shadow) · radius **16px** for the console (20px is the marketing register — too soft for dense product surfaces). Hover: `-translate-y-0.5 hover:shadow-md` 200ms. Press: `active:scale-[0.98]`.

### 4.3 The reusable "selling" empty-state template (build once, use everywhere)

Every empty stub must preview the *shape* of the real feature behind a subtle scrim, plus one action. This converts stubs from an apology into a sales surface.

```
<EmptyState
  glyph={<BrandGlyph />}              // on-brand mark, never raw Lucide-in-void
  preview={<GhostedFeaturePreview/>}  // 40% opacity skeleton of the real UI
  heading="<outcome, sentence case>"  // 16px Inter 600 #0A0A0A
  body="<one warm, direct line>"      // 14px #6B7280, max-w-[360px]
  action={<Button>…→</Button>}        // blue, rounded-lg, when an action exists
  align="top-38"                      // ~38% from top, NOT dead-center (dead-center reads "lost/failed")
/>
```

**Hard rule:** delete every "Coming Wave 1" string. Replace with outcome-first copy + a real action. Per surface in §5.

### 4.4 The error / state templates (reusable)

- **Error:** contained block, `max-w-[400px]`, ~40% from top — never floating in a vast empty card. Icon: `#EF4444` in a `bg-red-50` rounded-full 40px chip (solid, not a faint halo). Heading 16px Inter 600. Body 14px `#6B7280` max-w-[360px]. **Always add a real `Try again` button** that re-fetches — never tell the user to use the browser refresh.
- **Loading:** skeletal loaders matching layout dimensions — never a lone spinner for content-heavy layouts.
- **Success:** `#10B981` checkmark + toast bottom-right, 3s auto-dismiss.
- All states respect `prefers-reduced-motion` (opacity fades OK; disable translate/scale/rotate).
- **Kill the floating red "1 Issue" pill** leaking on the dashboard — confirm it's not a Next.js dev indicator in the shipped build. A stray error overlay screams "unfinished" louder than any copy.

### 4.5 The mobile drawer + responsive scale (functional blocker)

Below `md` (768px): hide the persistent sidebar → hamburger in a top app-bar opens a `fixed inset-0 z-50` overlay drawer (240px, scrim behind). Content goes full-width `px-4`. This one fix unblocks **every** authenticated mobile screen.

**Breakpoint contract to enforce:**
- `< 768px` — no persistent sidebar; app-bar + hamburger + overlay drawer; single-column `px-4 max-w-full`.
- `768–1024px` — collapsed 64px icon-rail acceptable.
- `≥ 1024px` — full 240px sidebar.

Plus: 44px min touch targets · 16px-min input fonts · search collapses to an icon → full-screen sheet on mobile (drop the `⌘K` hint where there's no command key).

### 4.6 Quiet the search bar + give the top bar a floor

Mute the search field to `bg-transparent` or `bg-[#F2F2F2]`, `border-transparent`, `text-[#9CA3AF]`, 13px, `max-w-[280px]`. Add `border-b border-border` under the whole top bar so it reads as a real toolbar with a floor, not a floating island. Today search is the loudest element on every screen — a hierarchy inversion.

---

## 5. Surface plan — leverage-ranked

Ranked by impact on perceived quality + conversion. **The free scan is #1 because it is the only acquisition hook and it does not exist.**

| # | Surface | Current state | Target design intent | The killer move |
|---|---|---|---|---|
| **1** | **Free scan** (`/scan`) | Stub — magnifier icon + sentence. No input, no scan, no result. | Three acts on white #FFFFFF, max-w-560px: **(a) entry** — one confident 56px input (`yourbusiness.com`) + business name + full-width blue "Run my free scan →" + "No credit card. No signup to see your score." **(b) scanning moment** — live sequential engine checklist (✓ ChatGPT / ◐ Gemini querying / ○ Perplexity queued), Geist Mono query counts, 3px blue progress bar, 120ms/row stagger, ~8–15s dwell. **(c) reveal** — 160px animated score ring counting up to a blunt verdict ("You're invisible in AI search."), three per-engine gap rows, then "Beamix's agents fix them — you approve, they ship" → CTA. | The **scanning moment** — the screen people screenshot. Make work *visibly happen* engine-by-engine. This is the single highest-leverage build in the company. |
| **2** | **Dashboard / Overview** | Most-built screen. Grey wash, empty broken-looking rings, cohort 0/100 above the fold (inverted social proof), mobile-crushed. | Lead with **value, not cohort.** Header band (InterDisplay 32px) + right-aligned "Run first scan →" blue CTA. AI-Visibility cards become proper empty score rings (even #E5E7EB track + Geist Mono "—" + real engine logos), captioned "Runs after your first scan." Move/remove cohort below the fold until ≥10/100. | Kill the **broken-looking grey rings** (they read as a failed fetch) → replace with the signature score-ring component in its empty state. This is the dashboard's hero component. |
| **3** | **Home** ("Your workspace") | Single centered "Coming Wave 1" stub — the post-login landing shows nothing the product does. | First-run empty state at ~38% from top, max-w-360px: "Nothing to review yet / Your agents are standing by. Run a scan and Beamix starts finding where you're invisible." + "Start a scan →" + a ghosted agent-activity feed preview. | Preview a **populated workspace feed** (skeletoned) so the user sees the shape of value, not a doc-icon void. |
| **4** | **Post-payment onboarding** | A paying $79–$499 customer lands on "Almost there — Coming Wave 1" in the buyer's-remorse window. | Superhuman-grade first run: warm "Welcome — Beamix" seal → visible first-run task list (1. Confirm business · 2. Baseline scan · 3. Meet your agents) → **auto-kick the baseline scan** and show the §1B scanning moment. Tier-1 signature animation on completion. | **Auto-start the scan** so the customer watches their agents begin working in the first 30 seconds. Best retention lever in the product. |
| **5** | **Approvals** | Errors with "Could not load approvals" — the "trust singularity." This is the screen that proves agents exist; it must never error. | Replace error with a designed **empty** state that explains cadence ("Your first agent drafts arrive after your first scan. Expected: Tuesday."). When real errors occur, use the §4.4 template with a Try-again button. | Make it **render cleanly even when empty.** A "no items yet" state is infinitely better than a 500-class error here. Highest single-screen trust fix. |
| **6** | **Login / Signup** | Stubs, and visually identical to each other. No form, no SSO. | Two-column ≥1024px: form (max-400px) + calm brand panel. SSO-first (Google full-width 44px) → "or" → labeled email/password fields → blue `rounded-lg` (product, NOT pill) button. Differentiate: "Welcome back" vs "Create your account." Cross-link to free scan. | **SSO-first + labeled fields + differentiated copy.** Auth is the gate between every visitor and the product. |
| **7** | **Discovery** | A `mailto:hello@beamixai.com` dead-end — highest-friction path for a warm, ready-to-buy lead. | Embed **Cal.com inline** (brand brief specifies it). Left: value framing + 3 bullets. Right: live calendar. Pull the user's scan score in for context. If calendar genuinely not ready: an in-product **lead form**, never a mailto. | Replace the **mailto with a real booking** — a direct, measurable leak of the most expensive leads to lose. |
| **8** | **Secondary stubs** (Inbox, Scans, Automation, Competitors, Archive, Settings) | Six identical "Coming Wave 1" + stock Lucide icon in a void. | Each previews the real feature behind a 40% scrim + one action via the §4.3 template. **Scans:** ghosted result row + "Run a scan →". **Competitors:** ghosted comparison bar + "Add a competitor →". **Automation:** ghosted rule row + "Create a rule →". **Inbox:** ghosted agent-card stack (passive, no CTA). **Archive:** lightest "Nothing archived." **Settings is never an empty state** — show disabled section skeleton (Business · Billing · Preferences · Team). | Turn stubs into a **sales surface** — 80% of what a clicking-around buyer/investor sees. Each one shows the shape of what's coming. |

---

## 6. Recommended sequencing

Grouped by scope and dependency — not time. Ship by quality bar, not calendar.

### Wave A — Foundation (pure design + reusable components, no backend dependency)
The cross-cutting P0 system from §4. Lifts every screen at once before any per-surface work.
- Heading/typography system · canvas flip + card finish + blue deployment · reusable EmptyState/Error/Loading templates · mobile drawer + responsive scale + breakpoint contract · search-bar mute + toolbar floor · kill the floating error pill.
- **Type:** pure-design + design+build (component layer). **No dependency** on scan engine. Highest ROI; do first.

### Wave B — Trust patches (design+build, low backend lift, unblocks acquisition holds)
The persona "5-day patch" set — removes the trust-killers that block any paid traffic.
- **Approvals:** error → designed empty state (§5 #5). · **Discovery:** mailto → Cal.com embed or lead form (§5 #7). · **Overview hero:** lead with value, move cohort below fold (§5 #2). · Apply Wave-A templates to all six secondary stubs (§5 #8).
- **Type:** design+build. Approvals empty + Overview rewrite are near-pure-design; Discovery needs Cal.com wiring; secondary stubs are template application.

### Wave C — The front door (design+build, depends on scan pipeline)
The free scan end-to-end (§5 #1) — entry → scanning moment → reveal — plus post-payment onboarding auto-start (§5 #4).
- **Type:** design+build, **depends on another session's scan-engine pipeline work.** The *entry* and *scanning-moment* UI can be designed and built against mocked data in parallel with the engine; the *reveal* needs real scan output to wire. Onboarding auto-start depends on the scan trigger existing.

### Wave D — Auth + polish (design+build)
- Real login/signup with SSO (§5 #6) · mobile type-scale + 16px input + 44px target verification across funnel · two-column auth brand panel · trust-band engine logos.
- **Type:** design+build, independent. Can run alongside Wave C.

**Dependency note:** Waves A and B have **no pipeline dependency** and should not wait. Wave C's reveal step is the only piece gated on the scan engine — design and build its entry + scanning UI against mocks now so it's ready the moment the engine lands.

---

## 7. Open decisions for the founder

1. **Free-scan UI before the engine is wired — build against mocks now, or wait for the pipeline?** Recommendation: build entry + scanning-moment UI against mocked data immediately (it's the #1 acquisition surface and the reveal can be wired last). Decide if you want a parallel session on the UI while the engine session proceeds.

2. **Canvas: flip to white now, or stay on the grey #F7F7F7 wash?** Recommendation: flip to white #FFFFFF page bg with #F7F7F7 reserved for inset panels — it's the single biggest "premium vs washed-out" lever. Confirm so the whole token pass aligns.

3. **Dark mode — this pass or later?** Tokens exist in the design system. Recommendation: defer to a later pass; nail light mode to the bar first. Confirm so we don't split effort.

4. **Mobile-first or desktop-first this pass?** Both must work, but where does the *finish* energy go first? Recommendation: desktop-first for the console screens (where buyers/investors evaluate), but the mobile drawer is a non-negotiable functional fix in Wave A regardless.

5. **Founding cohort 0/100 — remove entirely until ≥10, or keep below the fold at 0?** All personas read 0/100 as inverted social proof. Recommendation: remove from the customer surface until ≥10/100, then reintroduce below the fold. Confirm.

---

## Executive summary

Beamix's product is structurally sound and emotionally flat — competent Tailwind, not a Beamix product, at ~40% of the bar. The fix is finish, not re-platforming, plus building the front door that doesn't exist. **North star:** a quiet, expensive console that does the work for you — outcome first, one blue, zero apology (Linear headings · Stripe cards · Anthropic calm · Vercel scanning · Superhuman onboarding · Credit Karma reveal). The highest-ROI move is the **foundation pass (Wave A)** — a real heading system (InterDisplay 30–32px/−2px), a white canvas with tight tinted-shadow cards, the blue deployed on one action per screen, a reusable "selling" empty-state template, and the mobile overlay drawer — because each multiplies across all nine surfaces. Then **Wave B trust patches** kill every "Coming Wave 1" string, replace the Approvals *error* (the trust singularity) with a designed empty state, swap the discovery mailto for Cal.com, and make the dashboard lead with value not cohort. Then **Wave C builds the free scan** end-to-end — the company's only acquisition hook, today a 0/10 stub — with a Vercel-style live scanning moment and a Credit-Karma score reveal. Waves A and B have no pipeline dependency and should start now; only the scan *reveal* is gated on the engine.

**Open decisions:** (1) build free-scan UI on mocks now vs wait for engine, (2) flip canvas to white now vs keep grey, (3) dark mode this pass vs later, (4) desktop-first vs mobile-first finish energy, (5) remove cohort 0/100 until ≥10 vs keep below fold. Recommendations: build on mocks, flip white, defer dark mode, desktop-first finish (mobile drawer non-negotiable regardless), remove cohort until ≥10.

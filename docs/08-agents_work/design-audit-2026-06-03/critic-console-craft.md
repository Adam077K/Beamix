# Design Critic — Beamix Console Craft Audit
**Date:** 2026-06-03
**Reviewer:** design-critic
**Scope:** Authenticated product (Next.js dashboard) — desktop + mobile spot-checks
**Quality bar:** Linear precision · Stripe polish · Anthropic Console calm · Vercel restraint
**Vision under test:** "A calm, confident, editorial console — white space, one blue (#3370FF), sharp InterDisplay typography — that does the work for you. Outcome-first."

> This is not a defect list. It is a definition of what world-class looks like for each surface, with concrete moves. Most screens are intentional stubs; the job is to make the *skeleton itself* feel like a billion-dollar product, because right now the skeleton is what every early user, investor, and design-conscious buyer sees first.

---

## The one-sentence verdict

The console is **structurally sound but emotionally flat** — it reads as a competent Tailwind starter, not a Beamix product. The shell (sidebar, search, grid) is correct. The *finish* (typography weight, blue usage, contrast, empty-state intent, density) is at roughly 40% of the bar. The gap to world-class is almost entirely **finish, not architecture** — which is the good news: it is recoverable with a focused typography + token + empty-state pass, no re-platforming.

---

## Cross-cutting findings (apply to every surface)

These show up on every screen and are the highest-leverage fixes because each one multiplies across all 9 surfaces.

### C1 — Headings are timid Inter, not the brand's sharp display voice — **P1**
**Now:** Page H1s ("Overview", "Approvals", "Scans") render as ~24px plain-bold Inter. They look like a `<h2 className="text-2xl font-bold">` default. No tracking, no display face, no editorial confidence.
**Why it breaks the bar:** The entire brand thesis is "sharp InterDisplay typography." Linear, Stripe, and Anthropic Console all open a page with a heading that has *presence*. Beamix's heading has none — it whispers where it should state.
**The upgrade:**
- Page H1: **InterDisplay-Medium, 30–32px, letter-spacing -0.02em (-2px optical), leading-[1.1], #0A0A0A.** Not 40px (that's marketing hero scale) — for a console, 30–32px is the Linear/Anthropic register: confident but not shouting.
- Subtitle drops to **15px Inter 400, #6B7280, leading-[1.5], max-w-[480px]** so it reads as a calm caption, not a competing line.
- Eyebrows ("FOUNDING MEMBERS", "AI VISIBILITY") → **12px Inter 600, uppercase, tracking-[0.08em], #9CA3AF** (one notch lighter than body-muted so they recede as labels, not shout as headings).
- Title → subtitle gap: **8px.** Subtitle → first content block: **32px.** Right now it's an undifferentiated mush.

### C2 — Palette is grey-on-grey; the one blue is barely deployed — **P1**
**Now:** The page reads as #F7F7F7 background, #FFFFFF cards, #E5E7EB borders — three near-identical greys stacked. Blue appears only in the active nav pill and one link. The product's single most distinctive asset (#3370FF) is invisible.
**Why it breaks the bar:** "One blue, used with restraint" does not mean "one blue, used almost never." Stripe and Linear use their accent with *intent* — on the one thing that matters per view. Beamix currently has no focal point on any screen.
**The upgrade:**
- Give cards a real edge: cards on a #F7F7F7 canvas should be **#FFFFFF with border #E5E7EB AND `shadow-[0_1px_2px_rgba(10,10,10,0.04),0_1px_3px_rgba(10,10,10,0.06)]`** — a tight, tinted, two-layer shadow (Stripe's signature) so cards *sit* on the canvas instead of dissolving into it. The current cards have near-zero separation from background.
- Deploy blue on the **one primary action or metric per surface** — the founding-cohort progress bar should fill **#3370FF** (not the washed grey it is now), the score rings should animate in blue, the primary CTA button is blue.
- Consider flipping the canvas: **#FFFFFF page bg with #F7F7F7 used only for inset/secondary panels.** A white console with crisp hairlines reads more premium (Anthropic Console, Vercel) than an all-grey wash. Grey-on-grey-on-grey is the #1 reason this looks washed out.

### C3 — Cards are low-contrast and structurally generic — **P2**
**Now:** Rounded-[20px] white cards with a faint hairline. No internal hierarchy, no header treatment, no density logic. Every card is the same flat rectangle.
**The upgrade:**
- Tighten card radius to **16px** for the console. 20px is the marketing-card radius; on dense product surfaces 20px reads soft/consumer. Linear/Stripe consoles sit at 8–12px; 16px is the calm middle that keeps Beamix warmth without losing precision.
- Card header zone: **label in 13px Inter 600 #0A0A0A**, a 1px `border-border` divider, then content with **20px padding** (currently inconsistent). Apply the divide-y / border-t grouping pattern (per design-taste-frontend Rule 4) instead of boxing everything — let some content breathe without a box.

### C4 — Search bar is the loudest element on every screen — **P2**
**Now:** The top "Search… ⌘K" pill is high-contrast and sits alone in a vast empty top bar, pulling the eye away from the actual page H1 below it.
**Why it matters:** On every surface the first thing the eye lands on is a search box, not the page's purpose. That's a hierarchy inversion.
**The upgrade:** Mute the search field to **bg-transparent or bg-[#F2F2F2], border-transparent, text-#9CA3AF, 13px**, left-aligned, max-w-[280px]. It should be a quiet utility (Linear's command bar is nearly invisible until focused), not a hero. Add a faint `border-b border-border` under the whole top bar so it reads as a real toolbar with a floor, not a floating island.

### C5 — Empty-state icons are generic line-art; empty states don't sell — **P1**
**Now:** Each stub shows a thin Lucide line icon (envelope, magnifier, gear), a bold heading, and "Coming Wave 1 — …" copy centered in a void. This is the *single biggest missed opportunity* in the whole product. Great empty states sell the product; these announce that it's not built.
**The upgrade — see per-surface sections below.** Principle: an empty state should **show the shape of what's coming** (a ghosted preview of the real UI), give the user **one thing to do now**, and never say "Coming Wave 1" to a paying customer — that's internal roadmap language leaking to the user (voice-canon violation: marketing language / process talk in dashboard UI). Replace every "Coming Wave 1 —" with outcome-first copy + a real action.

### C6 — Mobile sidebar does not collapse — content crushed to ~150px — **P1 / BLOCKER**
**Now (dashboard-mobile.png, 375px):** The 240px sidebar stays pinned as a fixed rail at 375px viewport. The main content is jammed into the remaining ~135–150px, wrapping "Overview" subtitle to 4 lines, "100 slots remaining" to 3 lines, breaking the cohort card. The design system explicitly specifies **mobile sidebar = overlay drawer (`fixed inset-0 z-50`)**, not a persistent rail.
**Why it breaks the bar:** Half of SMB owners are on mobile. This is unusable on a phone — not a polish issue, a functional break.
**The upgrade:** Below `md` (768px): sidebar becomes an off-canvas drawer behind a hamburger in the top bar; main content goes full-width `px-4`. This is non-negotiable for ship.

### C7 — No tactile / interactive states visible — **P2**
**Now:** Cards and nav items show no hover lift, no focus ring evidence, no pressed state in the static captures. The design system mandates hover lift, blue focus ring, and `active:scale-[0.98]`.
**The upgrade:** Verify and implement: card `hover:-translate-y-0.5 hover:shadow-md transition 200ms`; every interactive element `focus-visible:ring-2 ring-[#3370FF] ring-offset-2`; nav items hover bg. A console that doesn't respond to the cursor feels dead — Linear's responsiveness is a core part of its perceived quality.

---

## Per-surface review

### 1. Dashboard / Overview (the most-built screen)
**What's there now:** H1 + subtitle, a full-width founding-cohort progress card, a "This week we got you…" setup-in-progress card, a "Pending Approvals" card, and three "AI Visibility" engine cards (ChatGPT / Gemini / Perplexity) with empty grey rings.

**P1**
- **C1 (heading), C2 (grey wash), C6 (mobile crush) all hit here.**
- The three AI-engine cards have **empty grey circle rings** that read as broken/loading-failed, not "awaiting first scan." A washed grey donut with a faint center dot looks like a render error. Each card also has a faint blue left-edge accent that's so subtle it looks like a 1px rendering artifact rather than an intentional status stripe.
- "Pending Approvals" card is isolated top-right with "Nothing waiting for your review right now." — orphaned, no visual relationship to the rest of the grid, floating in white space.

**P2**
- "This week we got you…" card is a tall near-empty box with a tiny centered blue dot and 2 lines of copy — ~70% of the card is dead space. Density Rule violated.
- The founding-cohort progress bar is grey-on-grey — the fill is invisible. The "0/100" appears twice (top-right and in body). Redundant.

**The upgrade — make Overview the proof-of-craft screen:**
- **Header band:** "Overview" in InterDisplay 32px/-2px. Subtitle 15px muted. Add a right-aligned primary action button **"Run first scan →" in #3370FF (rounded-lg, 8px)** — give the screen a clear next step, outcome-first.
- **Founding cohort:** make this a real hero stat. Big number **"0 / 100" in Geist Mono 28px #0A0A0A**, progress track #F0F0F0 with a **#3370FF fill** and a subtle inner shadow. Label "Founding members" 13px muted. One instance of the number, not two.
- **AI Visibility cards:** kill the broken-looking grey rings. Replace with a **score ring component in its "empty" state**: a thin #E5E7EB track ring (full circle, even weight) with a centered **"—" in Geist Mono 20px #9CA3AF** and the engine name as a **13px Inter 600 row with the engine's wordmark/logo** (ChatGPT, Gemini, Perplexity each get a real monochrome logo, not a blank). Copy: "Runs after your first scan." This previews the real UI (a score ring) instead of showing a void — that's how you sell.
- **This week card:** if there's no data, don't show a 400px-tall empty box. Either (a) shrink it to a compact "Your first weekly digest lands after scan #1" row, or (b) fill it with a **ghosted preview** of what a real weekly-win card looks like (blurred/skeletoned), captioned "Here's what you'll see." Anthropic Console and Linear both preview-then-populate.
- **Reference patterns:** Linear's project overview (stat band + activity), Vercel's project dashboard (white canvas, hairline cards, one accent), Stripe's home (big mono numbers, restrained blue).

---

### 2. Home ("Your workspace")
**What's there now:** A single centered empty state — line-art document icon, "Your workspace", "Coming Wave 1 — agent activity, scan summaries, and recent suggestions will appear here."

**P1**
- "Coming Wave 1 —" is **internal roadmap language shown to the user.** A paying SMB owner does not know or care what "Wave 1" is. Voice-canon + trust violation.
- This is the post-login landing for a "does the work for you" product, and it shows… nothing the product does. Wasted first impression.

**The upgrade:**
- Copy → outcome-first: **"Nothing to review yet"** / "Your agents are standing by. Run a scan and Beamix starts finding where you're invisible in AI search." + primary CTA **"Start a scan →"**.
- Replace the generic doc icon with an **on-brand mark** — a small composition using the Beamix blue star/cross, or a ghosted 2-row preview of what a populated workspace feed looks like (an agent-activity card skeleton). Never blank-icon-in-void.
- Tighten vertical position: a centered empty state should sit at **~38% from top**, not dead-center of a 900px viewport (dead-center reads as "lost"). Constrain copy to **max-w-[360px]**.

---

### 3. Approvals (error state)
**What's there now:** "Approvals" H1, then a full-width card with a red-ring error icon, "Could not load approvals", "There was a problem fetching your pending items. Refresh the page to try again." *(Data error is a placeholder DB key — judging layout/state only.)*

**P1**
- The error lives **inside a giant ~280px-tall card** that's 80% empty — the error message floats in the middle of a near-empty white box. The error treatment isn't *designed*, it's defaulted.

**P2**
- **No recovery action** — the copy says "Refresh the page" but there's no button. A world-class error state gives the user the button, it doesn't tell them to use the browser.
- Error icon is a thin red Lucide circle-alert — fine, but the surrounding pink halo is faint and the whole thing reads weak.

**The upgrade — this is the template for ALL error states:**
- Don't wrap the error in a vast empty card. Use a **contained, vertically-centered block, max-w-[400px]**, sitting at ~40% from top.
- Icon: **#EF4444 in a `bg-red-50` rounded-full 40px chip** — solid, intentional, not a faint halo.
- Heading 16px Inter 600 #0A0A0A. Body 14px #6B7280, max-w-[360px].
- **Add the button:** `<Button variant="outline">Try again</Button>` (rounded-lg, with a refresh icon) that re-fetches — never make the user reach for the browser refresh. Stripe and Linear always own the retry.

---

### 4. Inbox / 5. Scans / 6. Automation / 7. Archive / 8. Competitors / 9. Settings (empty stubs)
**What's there now:** All six are the identical pattern — a thin Lucide line icon, a bold ~18px heading, and a "Coming Wave 1 — …" sentence, centered in a void.

**P1 (applies to all six)**
- **Every one says "Coming Wave 1."** Six surfaces leaking internal roadmap language to the user. This is the most repeated trust-eroding pattern in the product. Each one reads "this product isn't finished" to anyone clicking around — including buyers and investors.
- The icons are **stock-weight Lucide line art** centered in emptiness — generic empty states the skill explicitly bans ("Illustration or icon — on-brand, not stock").

**P2**
- All six are **vertically dead-centered** in a 900px void with no anchor, which is the universal "page failed to load" signal. Centered empty states should sit higher (~38%) and be narrower.
- Heading scale is inconsistent with the page H1s on built screens (these are ~18px centered; built pages use ~24px left-aligned). The product has two different heading systems.

**The upgrade — turn stubs into a sales surface:**
Each empty stub should **preview the shape of the real feature** behind a subtle scrim, plus one action. Concretely, per surface:

- **Scans:** Show a **ghosted/skeleton scan-result row** (engine logo · score ring placeholder · "diagnosing…" pill) at 40% opacity, captioned **"Your first scan shows where ChatGPT, Gemini, and Perplexity rank you."** + primary CTA **"Run a scan →"**. This is the product's core loop — its empty state should make the user *want* to scan, not tell them to wait.
- **Inbox:** Ghosted preview of an agent-result card stack. Copy: **"No items yet"** / "When agents finish work or need your sign-off, it lands here." No CTA needed (passive surface), but show the *shape* of an inbox row.
- **Competitors:** Ghosted comparison-bar preview (you vs 2 competitors across engines). Copy: **"Track your competitors"** / "See who AI search recommends instead of you." + CTA **"Add a competitor →"**.
- **Automation:** Ghosted rule-row preview ("When score drops below X → run fix agent"). Copy: **"Put it on autopilot"** / "Set rules and Beamix fixes things without you asking." + CTA **"Create a rule →"**.
- **Archive:** Genuinely-empty is fine here. Copy: **"Nothing archived"** / "Completed and dismissed items collect here." Lightest treatment — no CTA.
- **Settings:** Settings should **never be an empty state** — it's a form surface. Even pre-build, show the section skeleton (Business profile · Billing · Preferences · Team) as disabled rows so the user sees the structure. "Coming Wave 1" on Settings is the weakest of all because settings are never "coming" — they're navigation.

**Shared empty-state component spec (build once, use everywhere):**
```
<EmptyState
  icon={<BrandGlyph />}              // on-brand, not raw Lucide
  preview={<GhostedFeaturePreview/>} // 40% opacity skeleton of the real UI
  heading="<outcome, sentence case>" // 16px Inter 600 #0A0A0A
  body="<one warm, direct line>"     // 14px #6B7280, max-w-[360px]
  action={<Button>…→</Button>}       // blue, rounded-lg, when an action exists
  align="top-38"                     // not dead-center
/>
```

---

## TOP 7 HIGHEST-LEVERAGE MOVES (ranked by impact on perceived quality)

1. **Fix the heading system (C1).** Switch all page H1s to InterDisplay-Medium 30–32px, -2px tracking, with an 8px-gap muted 15px subtitle. This single change moves the product from "Tailwind default" to "designed console" across all 9 surfaces at once. Highest ROI in the audit.

2. **Kill "Coming Wave 1" everywhere and rebuild empty states to sell (C5).** Six+ surfaces show internal roadmap language and generic line icons in a void. Replace with outcome-first copy + ghosted previews of the real UI + one action. Empty states are 80% of what a clicking-around buyer sees — make them the sales pitch, not the apology.

3. **Break the grey-on-grey wash; deploy the one blue with intent (C2).** Flip to a white canvas with crisp hairline + tight tinted shadow cards, and put #3370FF on the one primary action/metric per screen (cohort bar fill, primary CTA, score rings). The product currently has no focal point and no brand color presence — this gives it both.

4. **Fix the mobile sidebar collapse (C6).** It's a functional break — the rail crushes content to ~150px at 375px. Drawer + hamburger below 768px. Blocks ship for half the user base.

5. **Redesign the AI Visibility cards on Overview.** The empty grey rings read as broken. Replace with proper empty-state score rings (even #E5E7EB track + Geist Mono "—") and real engine logos. This is the dashboard's signature component — it currently looks like a failed fetch.

6. **Design the error + retry pattern (Approvals).** Contain the error to max-w-[400px], add a real "Try again" button, solid red chip icon. Build it as the reusable error template so every future fetch failure inherits a world-class state instead of a defaulted one.

7. **Quiet the search bar and give the top bar a floor (C4).** Mute the search pill to a transparent utility, add `border-b border-border` under the toolbar. Stops the search box from being the loudest thing on every screen and fixes the hierarchy inversion.

---

## What's working well (preserve these)

1. **Sidebar architecture is correct** — 240px rail, clean Lucide nav, the blue active-pill (`bg-[#EFF4FF] text-[#3370FF]`) is on-brand and exactly right. Don't touch the nav pattern; it's the strongest existing element.
2. **The empty-state *copy instinct* is warm and direct** ("This week we got you…", "Nothing waiting for your review right now") — voice is on-canon. The problem is the "Coming Wave 1" leak and the lack of previews/actions, not the tone.
3. **Restraint is there in spirit** — no clutter, no gradient soup, no decorative noise. The bones are calm. The job is to add *intentional* contrast and focal points, not to strip back — the foundation to build a calm editorial console on already exists.

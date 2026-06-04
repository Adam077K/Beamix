# Beamix Free Scan — Visual Direction

**For:** Adam (founder) · **From:** Design-Lead · **Date:** 2026-06-03
**Scope:** The free scan funnel only — three acts (ENTRY → SCANNING MOMENT → REVEAL). Product app surface. No production code in this document.
**Status:** RETHINK / direction. Runs on mock/simulated data for now; real-engine seams flagged inline.
**Reference tooling:** Refero MCP **unreachable** (subscription expired — `NO_SUBSCRIPTION`). Stitch MCP **reachable but did not return confirmed screens** in the polling window (2 jobs accepted: scanning-moment + reveal, project `1434474219201207481`). Reference board below is therefore grounded in precisely-named canonical screens — the disciplined fallback. Every reference names the exact product + screen so a builder can pull it directly.

> **Read this first.** The free scan is the only acquisition hook Beamix has, and today it is a magnifier icon and a sentence. This is not a "style the page" task. This is the single screen the entire company is judged on in the first 8 seconds. It must do one thing the competitors structurally cannot: make the *work* visibly happen, then deliver a verdict blunt enough to screenshot. The thesis below is engineered so a builder cannot quietly water it into generic Tailwind — every act has a non-negotiable signature move, exact tokens, and a kill-list.

---

## 1. The named aesthetic thesis

### "Instrument-grade verdict."

Beamix's free scan looks and behaves like a **precision diagnostic instrument that has already finished its measurement and is now reading you the result, plainly, to your face.** Not a marketing page with a form. Not a dashboard. An instrument: white as a lab bench, one electric-blue needle of intent, raw numbers in mono type that feel *measured* rather than designed, and total absence of decoration. The personality is the calm of an expert who has seen your X-ray, isn't going to soften it, and already knows the fix. Where every competitor performs *effort* ("Analyzing your SEO… 🚀"), Beamix performs *evidence* — it shows the actual queries it ran, engine by engine, and then states the verdict in six blunt words.

**The differentiation anchor — the one thing that makes this unmistakably Beamix and not a template:** the **honest engine-by-engine scanning ledger** — three AI engines resolving one at a time on hairline rows with live monospace query counts and the *real prompts* streaming underneath ("best family dentist near Tel Aviv"). No competitor shows the work this literally. If you screenshot any single frame of the scanning moment, you can tell it's Beamix because you can read the machine *thinking in your customer's words*. Logo removed, you'd still know it: white bench, one blue needle, mono evidence, no card boxes — the verdict reads like an instrument printout, not a SaaS hero.

**DFII score: 13/15** (Impact 5 · Fit 5 · Feasibility 4 · Performance 4 − Consistency-Risk 5→logged). Excellent — execute fully. Feasibility is 4 not 5 because the streaming-query ledger needs careful client isolation; Consistency risk is the rotating mono prompts (must be curated per-vertical, never lorem).

---

## 2. Reference board

Ten best-in-class references, each with the **one specific thing we steal** — a type treatment, a spacing rhythm, a motion, or a layout move. (Refero down; these are named canonical screens.)

| # | Source (product · screen) | What it looks like | The ONE thing we steal |
|---|---|---|---|
| 1 | **Vercel — deploy log / build output** (vercel.com dashboard, a running deployment) | Black-on-white sequential log, monospace, each build step resolves with a check, timestamps right-aligned. | The **honest sequential resolve**: steps complete one at a time in mono, not a fake aggregate spinner. This is the spine of the SCANNING MOMENT — engines resolve like deploy steps. |
| 2 | **Credit Karma — score reveal** (mobile credit score screen) | Large arc gauge counting up, a single blunt number, a one-line verdict beneath. | The **count-up ring + blunt verdict** payoff. We invert it: low score is the *point*, rendered in red, stated without euphemism. |
| 3 | **Stripe — Dashboard home / Radar metric cards** (dashboard.stripe.com) | White cards on near-white, big tabular-mono numbers, a tight two-layer tinted shadow so cards sit on the page. | The **tight tinted two-layer shadow** (`0 1px 2px / 0 1px 3px` rgba tinted to bg) and **tabular mono numbers** — used on the reveal's per-engine ledger and any elevated chip. |
| 4 | **Linear — page header register** (linear.app any view title) | Page titles at ~30–32px with tight tracking, present but not shouting; near-invisible utility chrome. | The **heading register**: InterDisplay 30–32px, −0.02em, `leading-[1.1]`. The ENTRY headline states, it doesn't market-shout at 64px. |
| 5 | **Anthropic Console — empty/first-run canvas** (console.anthropic.com) | True white, crisp hairlines, exactly one accent, generous air, "preview then populate." | The **calm white bench** and **one-accent discipline**. The whole free scan lives on `#FFFFFF`, not grey-on-grey. |
| 6 | **Superhuman — onboarding first run** | White-glove, auto-starts work in the first seconds, motion that feels personal not promotional. | The **auto-start instinct**: ENTRY's "Run my free scan" transitions *immediately* into visible work — zero dead "loading" gap between submit and the first engine resolving. |
| 7 | **Raycast — root command bar** (raycast.com) | A single confident input, mono accents, keyboard-grade precision, dark-on-light restraint. | The **single confident input field** treatment for the ENTRY domain box — 56–60px tall, one field, mono placeholder `yourbusiness.com`, no clutter around it. |
| 8 | **Plausible Analytics — public dashboard** (plausible.io/plausible.io) | Honest, un-gamified data, hairline dividers instead of card-boxing every metric, muted palette. | The **hairline-row data pattern** (`border-b` dividers, no card boxes per row) — used for both the scanning ledger and the reveal's engine gaps. This is the anti-"3-cards" move. |
| 9 | **Apple — Activity rings / Fitness summary** (iOS Fitness) | A ring that *animates as a measurement*, weighty easing, the arc is the hero. | The **ring as instrument, not chart**: the reveal arc draws with `cubic-bezier(0.22,1,0.36,1)` over ~900ms and the number counts in lockstep with the stroke — it reads as a gauge settling, not a CSS spinner. |
| 10 | **Mercury — banking dashboard / transaction list** (mercury.com) | Editorial-calm fintech, restrained type, one accent, expensive whitespace, trustworthy density. | The **trust-through-restraint density**: enough information to feel substantive, never busy. Governs the reveal's information rhythm so it feels like a real audit, not a teaser. |

**Synthesis (don't copy any one wholesale):** Vercel's honest log is the *spine* (scanning). Credit Karma's count-up is the *payoff* (reveal). Anthropic's white bench + Linear's heading register + Plausible's hairline rows are the *substrate* across all three acts. Apple's ring easing is the *signature motion*. Stripe's mono numbers + tinted shadow are the *finish*. Raycast's single input is the *entry*. Superhuman's auto-start is the *seam* between acts.

---

## 3. The signature moment

### The scanning-to-reveal hand-off — "the needle settles."

The single beat people screenshot. It is **not** a loading spinner and **not** a confetti reveal. It is the moment the last engine row (Perplexity) flips from `queued` → `querying` → resolved, the progress needle hits 100%, and in **one continuous, choreographed motion** the three-row ledger lifts and recomposes into the score ring drawing itself in red while the number counts up to a verdict. The ledger doesn't disappear and reload a new screen — it *becomes* the result. The evidence you just watched being gathered visibly condenses into the judgment.

**Why it works:** the user watched the machine do real work (engine by engine, in their customer's actual words), so when the verdict lands it feels *earned and true*, not asserted. That is the emotional core of the whole product — "they did the work, here's the honest result" — compressed into 1.2 seconds. It is screenshot-bait because the frame mid-transition (rows half-dissolved, ring half-drawn, "23" mid-count) is unlike anything in the category.

**Exact choreography of the hand-off (total ~1300ms):**

1. **t=0** — Perplexity row resolves (last engine). Its hollow grey ring fills blue, count lands (`"Not indexed"` already known from mock). Progress needle reaches 100%, blue bar at full width.
2. **t=+150ms** — A 250ms hold. The whole ledger is still, fully resolved. (Deliberate beat — let the user register "it's done.")
3. **t=+400ms** — The three ledger rows fade to `opacity-0` and `translateY(-12px)` with a 60ms stagger top-to-bottom (`cubic-bezier(0.22,1,0.36,1)`, blur-bridge 4px → 0 per emilkowal `polish-blur-bridge`). The mono progress line and query stream fade with them.
4. **t=+550ms** — As the rows clear, the score ring scales in from `scale(0.92)` + `opacity-0` (never from `scale(0)` — emilkowal `transform-never-scale-zero`) at the same vertical center the active row occupied. Shared spatial anchor = the eye never jumps.
5. **t=+650ms → +1550ms** — The ring **arc draws** (stroke-dashoffset, ~900ms, `cubic-bezier(0.22,1,0.36,1)`) in red `#EF4444`, and the center number **counts up** `0 → 23` in exact lockstep (same duration, same easing, Geist Mono, tabular). The arc and the number are one mechanism — they finish on the same frame.
6. **t=+1200ms** — As the count nears its end, the verdict headline ("You're nearly invisible in AI search.") fades up `translateY(8px) → 0` over 400ms, then the three engine-gap rows stagger in (80ms each), then the CTA.

**Reduced-motion fallback (mandatory):** no translate/scale/draw. Rows cross-fade to the result via opacity only; ring renders at final arc; number renders final value (no count-up); verdict + rows + CTA fade in together at 200ms. The verdict must be just as blunt — accessibility never softens the message.

**Real-engine seam:** with mocks, the resolve timings are scripted (ChatGPT ~3.5s, Gemini ~4s, Perplexity ~3s → ~10–12s total). With the real engine, each row is event-driven (resolves when its API returns); the hold-then-settle choreography in steps 2–6 is identical and triggers on the *last* engine's completion event, whenever it lands. Build the transition against a mock event emitter so the wiring is zero-change when the pipeline ships.

---

## 4. Per-act design spec

Global frame for all three acts: page background `#FFFFFF`, single centered column `max-w-[560px]`, `min-h-[100dvh]` (never `h-screen`), horizontal `px-6` (mobile `px-4`). One accent: `#3370FF`. Score colors (`#EF4444 / #F59E0B / #10B981 / #06B6D4`) are **data-only** and appear *only* in the reveal. Display type = InterDisplay-Medium (tight tracking). Body/UI = Inter. All numbers/counts/query strings = Geist Mono. No card boxes for rows — hairline `border-b border-[#E5E7EB]` dividers (Plausible move). The funnel is a vertical column the entire way — never a 2-column marketing split.

---

### ACT 1 — ENTRY

**Purpose:** one confident action — enter a domain, start the scan. Persuasion through restraint, not copy volume. The screen should feel like the instrument is *ready and waiting*, not selling.

**Layout + grid:** centered column, content vertically centered in `min-h-[100dvh]` but biased to ~42% from top (not dead-center — dead-center reads "empty"). Stack, top to bottom:
- Eyebrow (optional, recedes)
- Headline (1–2 lines, `max-w-[480px]`)
- Subline (1 line, `max-w-[420px]`)
- The input field (the hero element — Raycast single-input treatment)
- Optional business-name field (revealed inline, secondary)
- Primary CTA (full column width)
- Trust microcaption

**Type:**
| Element | Family | Size | Weight | Tracking | Leading | Color |
|---|---|---|---|---|---|---|
| Eyebrow | Inter | 12px | 600 | `0.08em` upper | — | `#9CA3AF` |
| Headline | InterDisplay-Medium | 32px (mobile 28px) | 500 | `-0.02em` | `1.1` | `#0A0A0A` |
| Subline | Inter | 15px | 400 | — | `1.5` | `#6B7280` |
| Input text/value | Geist Mono | 17px | 400 | — | — | `#0A0A0A` (placeholder `#9CA3AF`) |
| Input affix `https://` | Geist Mono | 15px | 400 | — | — | `#9CA3AF` |
| CTA label | Inter | 15px | 600 | — | — | `#FFFFFF` |
| Trust caption | Inter | 13px | 400 | — | `1.5` | `#9CA3AF` |

**Color usage:** entire screen is white + ink + muted. The *only* blue is the CTA fill `#3370FF` and the input's focus ring. Nothing else competes.

**Spacing (8pt):** eyebrow → headline 16px · headline → subline 8px · subline → input 32px · input → CTA 16px · CTA → trust caption 24px. Input height 56px (desktop) / 52px (mobile). CTA height 52px.

**The input (signature of this act):** one field, not a form. Full column width, height 56px, `rounded-lg` (8px), `border border-[#E5E7EB]`, `bg-white`. A muted mono `https://` affix sits flush-left inside, then placeholder `yourbusiness.com` in mono `#9CA3AF`. Focus: `border-[#3370FF]` + `ring-2 ring-[#3370FF]/15 ring-offset-0`, 150ms ease-out. No floating label; a tiny `13px #6B7280` label "Your website" sits 8px above the field, left-aligned. Business name is a *second* field that slides in (`translateY(-4px)`+fade, 200ms) only after a valid domain is entered — progressive disclosure, never two empty fields at once.

**CTA:** full-width, `#3370FF` fill, white text, `rounded-lg` (8px — product register, NOT marketing pill), label **"Run my free scan →"**. Press: `active:scale-[0.98]` + 100ms. Hover: `-translate-y-[1px]` + slightly deeper tinted shadow. The arrow is the only ornament.

**Microcopy (Beamix voice — authoritative, direct, warm; no banned buzzwords):**
- Eyebrow: `FREE AI-SEARCH SCAN`
- Headline: **"See where AI search can't find you."**
- Subline: "We check ChatGPT, Gemini, and Perplexity for your business — in about 15 seconds."
- Input label: "Your website"
- CTA: **"Run my free scan →"**
- Trust caption: "No credit card. No signup to see your score."
- (HE parity — RTL: headline "גלו איפה חיפוש ה-AI לא מוצא אתכם." · CTA "הריצו סריקה חינם →" · same meaning, not literal.)

**States:**
- *Empty/idle:* placeholder mono domain, CTA enabled but submit inline-validates on click until a plausible domain pattern is present.
- *Invalid domain:* inline error below field, `13px #EF4444` "That doesn't look like a website — try `yourbusiness.com`", red `#EF4444` border on field, no layout shift (error space reserved). Never block with a modal.
- *Submitting:* CTA label swaps to a 3-dot mono pulse for <500ms, then hands off to Act 2 — there is **no separate loading screen**; the transition into the scanning ledger IS the feedback (Superhuman auto-start).
- *Error (scan can't start):* §error template — contained block, Try-again button, never "refresh the page."

**Responsive / mobile:** single column always (it already is). `px-4`, input 52px, CTA 52px, headline 28px. Input font stays ≥16px (mono 17px is fine — iOS zoom guard). Touch targets ≥44px. Trust caption wraps gracefully. Vertical bias shifts to ~36% from top on short viewports.

---

### ACT 2 — SCANNING MOMENT (the company's highest-leverage build)

**Purpose:** make the work *visibly, honestly happen*. This is the differentiation anchor. ~10–15s dwell on mocks. The user must believe a real machine is querying real AI engines in their customer's words.

**Layout + grid:** same centered `max-w-[560px]` column, content vertically centered. Stack:
- Mono status line (what's being scanned)
- Thin progress needle
- The three-engine ledger (hairline rows — the hero)
- The live query stream (one mono line beneath)
- Quiet reassurance caption

**Type:**
| Element | Family | Size | Weight | Tracking | Color |
|---|---|---|---|---|---|
| Status line | Geist Mono | 13px | 400 | `0.08em` upper | `#6B7280` |
| Engine label | Inter | 15px | 500 | — | `#0A0A0A` (active/done) / `#9CA3AF` (queued) |
| Engine count | Geist Mono | 13px | 400 | — | `#6B7280` (tabular-nums) |
| Engine status word | Geist Mono | 12px | 400 | `0.04em` | per state |
| Query stream | Geist Mono | 13px | 400 | — | `#6B7280` |
| Reassurance | Inter | 13px | 400 | — | `#9CA3AF` |

**Color usage:** white bench. Blue `#3370FF` appears in exactly three places: the progress-needle fill, the active engine's spinning ring, and the done-engine's filled check. Queued rows are pure grey `#9CA3AF` + `#E5E7EB`. **No score colors yet** — the verdict palette is withheld until the reveal, so red landing in Act 3 has maximum impact.

**Status line:** `SCANNING fortucci-dental.com` (the user's real domain), mono, uppercase, `0.08em`, `#6B7280`. Left-aligned at column top.

**Progress needle:** full column width, **3px** tall, track `#E5E7EB`, fill `#3370FF`, `rounded-full`. Width animates with overall completion (33% per engine resolved + intra-engine creep). Animate `transform: scaleX` from a left origin (`transform-origin: left`), never `width` (perf). 8px below status line.

**The ledger (signature element):** three rows, each a single line separated by `border-b border-[#E5E7EB]` (the last row no border), `py-5` (20px) per row, NO card boxes. Each row is a flex line: `[state-glyph] [engine label] ......... [count] [status word]`.

- **DONE (ChatGPT):** 18px filled blue circle `#3370FF` with a white check (Lucide `Check`, 12px, strokeWidth 2.5). Label `#0A0A0A`. Right: `412 queries` mono `#6B7280` + status word `done` (or just the count). Row at `opacity-100`.
- **ACTIVE (Gemini):** 18px thin spinning ring, `#3370FF`, 1.5px stroke, continuous rotation (CSS `@keyframes spin`, isolated client component, `will-change: transform`). Label `#0A0A0A`. Right: live count incrementing in mono `querying… 218` with a 1.5s shimmer on the number only. This is the single "alive" element — perpetual motion isolated per emilkowal/skill perf rules.
- **QUEUED (Perplexity):** 18px hollow ring `border-[#E5E7EB]`. Label muted `#9CA3AF`. Right: `queued` `#9CA3AF`. Row at `opacity-100` but visibly dimmer.

Real engine logos (ChatGPT/OpenAI, Gemini, Perplexity marks) sit 8px left of each label at 16px, greyscale `#6B7280` for queued, full-tone for active/done — adds credibility that it's really querying *those* engines.

**The live query stream (the screenshot detail):** one mono line beneath the ledger, `> "best family dentist near Tel Aviv"`, that **swaps every ~1.8s** to a new realistic, vertical-specific query the engine is "running" (`> "emergency dentist open now Tel Aviv"`, `> "Invisalign cost Tel Aviv"`). Type-in is not required; a clean cross-fade (opacity, 250ms) per swap is enough. These prompts are **curated per vertical**, never lorem, never generic — they are the proof. `#6B7280`, `max-w-[440px]`, truncate with ellipsis if long. (Real-engine seam: these strings come from the actual query set the engine runs; with mocks they're a hand-written per-vertical array.)

**Spacing (8pt):** status → needle 8px · needle → ledger 32px · ledger rows `py-5` each · ledger → query stream 24px · query stream → reassurance 32px.

**Motion choreography:** rows resolve sequentially (mock-scripted or event-driven). On each resolve: the active ring "completes" into a filled check with a 200ms `scale(0.9)→1` settle; the next queued row promotes to active (its ring starts spinning, label `#9CA3AF → #0A0A0A` over 200ms); progress needle advances. New rows never *mount* mid-scan (all three present from t=0) — only their *state* animates, so there's zero layout shift. Stagger between any simultaneous changes: 120ms. Then the §3 hand-off fires on the last resolve.

**Microcopy:**
- Status: `SCANNING fortucci-dental.com`
- Reassurance: "Checking how AI answers questions about you. About 15 seconds."
- Status words: `done` · `querying…` · `queued` (lowercase mono — instrument register).

**States:**
- *Loading (is the state)* — this act IS the loading state for the whole funnel; build it as the content, not a spinner-over-blank.
- *Slow engine (real pipeline):* if one engine exceeds ~12s, its row shows `still querying…` (no error yet) so the ledger never looks stuck; progress needle creeps slowly rather than freezing.
- *Engine error (real pipeline):* that single row resolves to a muted `couldn't reach Gemini` in `#9CA3AF` (NOT red — red is reserved for the verdict), the scan continues with remaining engines, and the reveal notes "2 of 3 engines" honestly. Never block the whole reveal on one engine.
- *Total failure:* §error template with Try-again.

**Responsive / mobile:** identical single column, `px-4`. Engine rows stay full-width hairline rows (they already collapse perfectly — no card math to break). Query stream truncates earlier. Spinning ring + shimmer respect `prefers-reduced-motion` (static ring + static count). The ledger is the *reason* the mobile experience is as strong as desktop — no multi-column anything to reflow.

---

### ACT 3 — REVEAL

**Purpose:** the blunt, honest, screenshot-worthy verdict → one clear path to the discovery call. Dopamine payoff = the truth delivered with weight, not a teaser.

**Layout + grid:** same centered `max-w-[560px]` column, content vertically centered. Stack:
- Score ring (hero — Credit Karma × Apple)
- Verdict headline + subline
- Three per-engine gap rows (hairline — Plausible)
- Primary CTA
- Secondary quiet link

**Type:**
| Element | Family | Size | Weight | Tracking | Leading | Color |
|---|---|---|---|---|---|---|
| Score number | InterDisplay-Medium | 72px | 500 | `-0.03em` | `1` | tier color (`#EF4444` here) |
| Score `/100` | Geist Mono | 18px | 400 | — | — | `#6B7280` |
| Verdict headline | InterDisplay-Medium | 28px (mobile 24px) | 500 | `-0.02em` | `1.15` | `#0A0A0A` |
| Verdict subline | Inter | 15px | 400 | — | `1.5` | `#6B7280` |
| Engine name | Inter | 15px | 500 | — | — | `#0A0A0A` |
| Engine verdict | Geist Mono | 13px | 400 | — | — | `#6B7280` |
| CTA label | Inter | 15px | 600 | — | — | `#FFFFFF` |
| Secondary link | Inter | 14px | 500 | — | — | `#6B7280` |

**Score ring (hero):** 180px diameter (mobile 160px). Track `#E5E7EB`, 8px stroke. Arc stroke = **tier color by score** (`0–24 #EF4444` · `25–49 #F59E0B` · `50–74 #10B981` · `75–100 #06B6D4`) — here red `#EF4444` for 23. Arc length = score/100. Center: number in tier color (72px display) + `/100` mono `#6B7280` baseline-aligned beside it. The ring is the instrument needle settling (§3 motion). **Blue `#3370FF` never touches the ring** — the ring is data; blue is action.

**Verdict (the blunt line):** stated, not hedged. Headline `#0A0A0A`, 28px display, `max-w-[440px]`, centered. One subline that grounds it in the user's world (their city/vertical pulled from the scan). No exclamation point (brand rule). No "could", "might", "may" (voice rule — be direct).

**Per-engine gap rows:** three hairline rows (`border-b border-[#E5E7EB]`, last none), `py-4` each, NO card boxes. Each: `[engine logo 16px] [engine name] ........ [status dot] [verdict mono]`.
- ChatGPT — red dot `#EF4444` — `Not mentioned`
- Gemini — amber dot `#F59E0B` — `Rank 7 of 9`
- Perplexity — red dot `#EF4444` — `Not indexed`

Status dot = 8px filled circle in the score color. Verdict text in Geist Mono `#6B7280`, right-aligned, tabular. These rows are the *evidence* — they make the single score number believable.

**Primary CTA:** full-width, `#3370FF` fill, white, `rounded-lg` (8px), 52px tall, label **"See how Beamix fixes this →"**. The bridge sentence above it (12px, `#6B7280`, centered, 16px gap): "Beamix's agents fix these gaps — you approve, they ship." Press `active:scale-[0.98]`, hover `-translate-y-[1px]`.

**Secondary link:** quiet, below CTA, 24px gap, centered, `#6B7280` 14px, underline-on-hover: "Or book a 15-minute walkthrough". This is the discovery-call path for warm leads who want a human.

**Spacing (8pt):** ring → verdict headline 32px · headline → subline 8px · subline → engine rows 32px · rows `py-4` · last row → bridge sentence 32px · bridge → CTA 16px · CTA → secondary link 24px.

**Color usage:** white bench. Score colors (red/amber) appear *only* in the ring arc, the score number, and the engine dots — strictly data. The *only* blue is the CTA. This separation is load-bearing: the user's eye reads "red = my problem" / "blue = the fix" with zero ambiguity.

**Microcopy:**
- Verdict headline (score 0–24): **"You're nearly invisible in AI search."**
- Verdict subline: "When people ask AI for a dentist in Tel Aviv, you almost never come up."
- (Tiered headlines — builder picks by score band: 25–49 "AI search barely sees you." · 50–74 "You show up sometimes — not enough." · 75–100 "You're visible — let's defend the lead.")
- Bridge: "Beamix's agents fix these gaps — you approve, they ship."
- CTA: **"See how Beamix fixes this →"**
- Secondary: "Or book a 15-minute walkthrough"
- (HE parity: "אתם כמעט בלתי-נראים בחיפוש ה-AI." · CTA "ראו איך Beamix מתקן את זה →")

**States:**
- *Standard (bad score):* as above — the default and most common case.
- *Partial scan (one engine failed):* ring still renders from the engines that returned; an honest mono note under the rows: `Scanned 2 of 3 engines — Gemini didn't respond.` No fake data.
- *Edge — good score (rare):* tier flips to green/cyan, headline flips to the defend-the-lead variant, CTA becomes "See how Beamix keeps you ahead →". The instrument never lies to manufacture urgency.
- *Empty/no-data impossible here* — by Act 3 there is always a result; if truly nothing resolved, fall to §error template with Try-again, never a blank ring.

**Responsive / mobile:** single column, `px-4`. Ring 160px, score number 56px, verdict headline 24px. Engine rows stay full-width hairline rows. CTA full-width 52px (≥44px target). Ring draw + count-up respect `prefers-reduced-motion` (final state, no animation). The reveal is fully legible and screenshot-worthy at 375px — that's the point, since half the audience screenshots on a phone.

---

## 5. Anti-generic checklist — "this screen FAILS if…"

Tailored to the free scan, derived from `design-taste-frontend`, `high-end-visual-design`, `beamix-brand-quality-bar`. A design-critic should BLOCK on any of these.

1. **…the headline screams at 56–64px marketing-hero scale.** The ENTRY headline is a 32px instrument label (Linear register), not a landing-page hero. Oversized H1 = template tell.
2. **…the scanning moment is a single spinner or an aggregate "Analyzing… 73%" bar with no engine-by-engine evidence.** The honest three-engine ledger with live mono query counts IS the product. A generic spinner deletes the entire differentiation anchor.
3. **…the live query stream shows lorem, placeholder, or generic queries** ("search query 1", "example keyword"). The prompts must be real, vertical-specific, in the customer's words — that's the proof. Generic prompts = instant fraud read.
4. **…engine rows are wrapped in card boxes with shadows.** Rows are hairline `border-b` dividers (Plausible). Boxing each row is the #1 "3-cards" AI tell and kills the instrument-printout feel.
5. **…blue `#3370FF` appears on the score ring, score number, or engine dots.** Blue = action only (the CTAs). Score colors = data only. Mixing them collapses the "red = problem, blue = fix" reading the whole reveal depends on.
6. **…the reveal verdict hedges** ("Your visibility could be improved", "You may want to consider…"). The verdict is blunt and stated ("You're nearly invisible in AI search."). Hedging violates the voice canon and guts the screenshot value.
7. **…the page uses grey-on-grey** (`#F7F7F7` page bg with grey cards). The bench is pure `#FFFFFF`. Grey wash = the exact "washed-out / vibe-coded" tell the founder called out.
8. **…there's a separate blank "loading" screen between submit and the first engine resolving.** ENTRY hands off directly into the live ledger (Superhuman auto-start). A dead loading gap breaks the "work is already happening" illusion.
9. **…the scanning→reveal transition is a hard cut or a full page reload.** It must be the continuous "needle settles" choreography (§3) — the ledger *becomes* the ring. A cut throws away the single most screenshot-worthy beat.
10. **…numbers are rendered in Inter/proportional instead of Geist Mono tabular.** Every count, query count, score, and "Rank 7 of 9" is mono tabular. Proportional numbers read as marketing, not measurement.
11. **…it uses Lucide line-art in a void for any empty/error state, or says "refresh the page".** Errors use the contained template with a real Try-again button; states are designed, not defaulted.
12. **…there's any purple, neon glow, gradient text, or emoji.** Banned by every taste skill. One accent (blue), no glows, no gradient headlines, Lucide/clean SVG only — never emoji.
13. **…the CTA is a marketing pill in the product funnel.** Free-scan CTAs are `rounded-lg` (8px) product buttons. Pills are marketing-only (brand rule). Wrong radius = wrong register.
14. **…motion ignores `prefers-reduced-motion`** — the spinning ring, count-up, or ring-draw run regardless. Every signature animation needs the static fallback, and the verdict stays equally blunt in it.
15. **…the mobile reveal reflows, clips the ring, or drops the engine rows.** The whole funnel is a vertical column that is identically strong at 375px — because half the audience screenshots on a phone. Any horizontal scroll or clipped ring = fail.

---

## Appendix — open seams for the build + critic gate

- **Mock data contract:** ENTRY captures `{domain, businessName?}`. SCANNING consumes a per-vertical mock event emitter `{engine, status, queryCount, queries[]}` resolving on a script. REVEAL consumes `{score, tier, engines: [{name, status, verdict}]}`. Build all three against this contract so the real engine is a drop-in.
- **Per-vertical query sets** (dental shown; needs Legal + B2B SaaS sets curated by CMO/CPO before launch) — these are the screenshot detail and must never ship generic.
- **Tiered verdict copy** — four score-band headlines drafted above; CMO sign-off on final wording + HE parity before build-freeze.
- **Critic gate:** PASS requires all 15 anti-generic rules clear + the §3 hand-off implemented as one continuous motion (not a cut) + reduced-motion fallback present + mobile 375px screenshot-clean.

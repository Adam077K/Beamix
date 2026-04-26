# Board Seat 4 — The Advocate Critique

**Reviewer persona:** Senior UX Researcher (WCAG 2.2 specialist + SMB qualitative research lead, ~300 interviews with plumbers, dentists, solo lawyers, boutique retailers, local agency owners across US + IL)

---

## 1. The SMB customer reality

Your real customer is Ronit — 52-year-old dentist in Ramat Gan. Paid NIS 700/mo for a "SEO guru" last year, got ghosted, now suspicious of any SaaS promising "AI visibility." Works 10-hour days on her feet, checks her phone between patients, runs her practice on a 2019 MacBook Air with 16 Chrome tabs permanently open. Eyesight going — bumped Chrome zoom to 110% two years ago. Reads Hebrew primarily but half her UI is in English because Hebrew SaaS translations are always broken.

She does not want to watch a 30-second animation of a courier visiting ChatGPT. She wants: "Am I being mentioned by AI? If no, why. If no, fix it. How much. Can I trust you. Can I stop paying if it doesn't work." Her twin fears: (1) "I don't understand what I'm paying $189/mo for" and (2) "I don't have time to learn another tool."

David the plumber opens the dashboard on his phone, in a van, direct sunlight, 3G. 30-second Stage = hostile. Sarah the solo lawyer uses keyboard-only (essential tremor). Yael the retailer has dyslexia and relies on system font-size overrides that Tailwind `text-[72px]` arbitrary values break.

**These are the users. Not the Linear-loving design-Twitter audience v2 was written for.**

---

## 2. V2's accessibility failures

### Failure 1 — Brand `#3370FF` fails WCAG 2.2 1.4.3 AA for text
v2 locks `#3370FF` as the blue for links, active states, sidebar active text. Contrast: `#3370FF` on `#FAFAFA` ≈ **4.14:1**. AA threshold for body text: **4.5:1**. Sidebar active (`#3370FF` on `#EFF4FF`) ≈ **3.9:1** — fails AA. **Enforceable under EU Accessibility Act (June 2025).**
**Fix:** Darken for text use to `#2558E5` or `#1E4FD9`. Keep `#3370FF` for 3px+ borders, filled buttons with white text, large hero numerals only. Run a full foreground/background contrast matrix in the design system.

### Failure 2 — Beamie state changes silent to screen readers (WCAG 4.1.3)
Rule 6 says Beamie silent by default. But Beamie changes state (idle→thinking→succeeded→error). SR users get zero information. 4.1.3 Status Messages (AA) requires status changes announced via `aria-live="polite"`. v2 has no aria-live story.
**Fix:** Every state transition emits `aria-live="polite"` in `sr-only` region. Configurable toggle in Settings.

### Failure 3 — Draggable Beamie fails WCAG 2.2 2.5.7 Dragging Movements (new AA)
Rule 7 makes Beamie whole-body draggable with 8px threshold. 2.5.7 requires a non-drag alternative. Users with Parkinson's, tremor, motor disability cannot reliably drag. Keyboard/switch access impossible.
**Fix:** Right-click menu → "Move to corner" submenu (TL/TR/BL/BR). `tabindex="0"` + Enter → arrow keys → Enter. Settings toggle "Pin to bottom-right."

### Failure 4 — Rule 9 onboarding tour risks WCAG 2.2.1 Timing Adjustable
If tour auto-advances on any timer, fails 2.2.1 (A). Rule 11's 10-second nudge silence is also a timing.
**Fix:** Tour user-advanced only (Next/Skip, keyboard access, Escape to exit). Rule 11 user-configurable (10s / 30s / until dismissed).

### Failure 5 — Inline text field fails 1.4.13 + 2.4.11 Focus Not Obscured (new 2.2)
Absolutely positioned floating field with no semantic relationship to trigger. If Beamie near top of viewport, field clips. No focus return to Beamie after close.
**Fix:** Radix Popover or React-Aria. Collision detection (flips below). Focus management: → first interactive on open, → Beamie on close. `aria-expanded` on trigger.

### Failure 6 — `text-[72px]` breaks 1.4.4 Resize Text
Tailwind arbitrary `text-[72px]` = fixed `font-size: 72px`, ignores user browser font-size + OS scaling. Users at 200% get the score still at 72px while body grows — visual hierarchy destroyed.
**Fix:** All typography in `rem` units. Score hero = `text-[4.5rem]`. 2-hour find-and-replace.

### Failure 7 — Color-only state communication fails 1.4.1 Use of Color
Rule 10 states differentiated primarily by color tint. Deuteranopia/protanopia (~8% of male users) cannot distinguish green/amber. 1.4.1 (A) requires color never be sole means.
**Fix:** Each state has distinct face expression AND icon/glyph AND text label (via `aria-label`). Thinking = waveform glyph. Succeeded = checkmark. Error = X.

### Failure 8 — 30-second Stage with "cannot scroll away" fails WCAG 2.2.2 Pause/Stop/Hide (A)
Stage Pattern: "user should not be able to scroll away during the 30-second flow. This is intentional." **Hard WCAG A failure.** 2.2.2 requires auto-updating content >5s be pausable.
**Fix:** "Show me results immediately" skip button visible from Frame 1. Auto-plays first-time only. Default for repeats: "show score + results directly, replay on demand." `prefers-reduced-motion` users get skip by default.

---

## 3. V2's SMB-user failures

**Failure A** — "Watchable agent work" is designed for designers to admire, not SMBs to use. Every SMB interview for three years: "I don't care how it works, I care that it works and what it costs." v2 invests 2 of 4 major sections in watchability. Zero SMB benefits from "Beamie visited ChatGPT, then Perplexity." They benefit from: "We checked 7 AI places. You're missing from 4. Here's the #1 fix. 20 minutes, or we can do it for you."

**Failure B** — Run scan → watch 30s show → read report optimizes for novelty, not repeat use. v2 claims "frequency-aware animation" as principle (Rule 2) then builds a 30-second show as primary value delivery — show the user will see 2-4 times/month. By scan #3 the Stage is a friction tax. SMBs don't watch scans; they check scores.

**Failure C** — Beamie's onboarding tour assumes SMBs finish onboarding. "First hour of use" — Ronit signs up between patients, clicks around 4 minutes, closes tab, returns 3 days later. System thinks "first hour" is done. "First hour" should be "first 3 meaningful sessions" measured by actions-taken, not wall-clock.

**Failure D** — "Free scan without signup" is great; bottom bar "Save your results and let our agents fix this" is weak. SMB research: email signup isn't the problem. The problem is "what does this cost me next month and how do I cancel." Bottom bar: "Save results + fix these issues — $79/mo, 14-day money-back guarantee, cancel from Settings in 2 clicks."

**Failure E** — "Crew" is a metaphor no SMB asks for. Nobody runs a "crew" of AI agents. They want "Tasks that run automatically" or "Scheduled fixes." v2's naming bias toward cute words (Crew, Beamie, Auto-pilot, Stage) is the same novelty bias that killed Clippy's successors. Plain English first, metaphor second.

**Failure F** — The score is the hero, but v2 never defines what it means. "72" is cool visual design. Ronit will ask: "Is 72 good? Better than last month? Better than my competitors? What does 1 point change mean for my business?" v2 specifies visual treatment in extraordinary detail and zero explanation scaffolding. **The score without context is astrology.**

---

## 4. The 30-second Stage problem

Steelman first: Research cited "Do > Show > Tell." Pre-signup First Scan Reveal has value — delivers proof before commitment. Accept this **for the first scan only** (unauthenticated visitor).

For every scan after the first — 99% of scans over a 12-month subscription — the Stage is friction:

- **Time is scarcest SMB resource.** 30s × 24 scans × 12 months = 2.4 hours/year of animation per user. They didn't pay $189/mo for animation.
- **Full-page modal prevents triage.** User cannot check Inbox, multitask. v2 explicitly: "cannot scroll away." Hostage-taking UI for a background task.
- **Real work takes 60-120s of API calls.** Stage "feels faster" by starting animations as engines return. But the honest version: "theatrical overlay on async backend job. Users don't need the theater; they need the backend."
- **For ADHD / executive-function users, mandatory 30s animation is distressing.** They want to move. They can't. Lose the tab. Lose the scan.

### Proposal: two-mode scan UX

**Mode 1 — First Scan Reveal (pre-signup, first-ever only).** 12-15s max. Compact Stage: horizontal row of 7 engine pills lighting up. Progress bar. Live-counting score center. No courier character, no flight paths, no magnifying glass, no side panel. 8s visible motion budget, remaining is "waiting" with clear textual progress.

**Mode 2 — Recurring Scan (auth'd, scan #2+).** 2-3s confirmation: "Scan started — estimated 90 seconds. We'll ping you when done. Keep using Beamix." User lands on /home. Persistent pill in top-right: "Scan in progress… 3 of 7 engines done" (clickable → Stage-lite for curious users). On complete: toast "Scan complete. Score: 72 (+3). View report →"

Stage becomes opt-in novelty ("Watch my scan"), not mandatory. Re-watch is Settings preference: "Show Stage on every scan? Default off."

**What an SMB owner WANTS during a scan:** Nothing. They want to be *done* with the scan. They want to know when done. They want to know what to fix. Info pushed to them (email, notification) so they can close tab and return to running their business.

---

## 5. Beamie as cognitive load

**ADHD lens (~10-15% of adults):** 4-second breathing in corner = low-grade attention theft. 1.2s-pulsing, eyebrow-waving, blue-tinting entity during agent activity = literal distraction. v2 Rule 2 gets frequency-awareness right for entrance but misses it for presence — idle breathing is always happening.
*Proposal:* Idle breathing period extends to 12s (barely noticeable) after 48 hours. Settings toggle "Minimal companion motion."

**Non-technical lens (majority of SMBs):** Beamie teaches a metaphor the user didn't ask to learn. "Face in the corner that tilts" is a feature to explain, not a feature that explains. Onboarding tour becomes a tour *of Beamie*. Ronit wants a tour of "where do I click to fix my problem." Beamie inverts info architecture — companion becomes a router for UI instead of UI routing itself. **This is exactly why Clippy failed** — he was a layer between user and task. v2's gaze-not-glow is a better Clippy, but it's still Clippy's architecture.

**Busy-owner lens:** Beamie competes with 16 Chrome tabs, 3 WhatsApp conversations, a patient walking in. Cumulative cognitive cost of *deciding to ignore Beamie* is itself a cost. 5 nudges/day × 30 days = 150 micro-interrupts/month. Worse than email.

### Proposal: make Beamie's persistence a user choice, default OFF after day 7

First-week Beamie = helpful onboarding ambassador. After day 7, Beamie retires unless user opts in. Settings → "Keep Beamie in the corner." **Default: off.**

Real test: do paying SMB subscribers (30+ days in) still want Beamie? If retention data says "most turn it off," kill Beamie in v3.

---

## 6. RTL / Hebrew audit (v2 mentions Hebrew/RTL zero times in 651 lines)

**Beamie home position.** Rule 1: bottom-right. In RTL, primary action corner is bottom-*left*. Eye scan terminates bottom-left. Bottom-right = dead zone for RTL users.
*Fix:* Default corner locale-aware. Drag position stored as percentage-from-nearest-edge.

**Beamie gaze direction (Rule 4).** Rotation is relative to Beamie's position. In RTL, sidebar is on right, content flows right-to-left. Rive state machine needs `isRTL` boolean input mirroring gaze direction. Otherwise Beamie looks at empty space on Hebrew screens.

**Stage site card → engine pill arc.** v2: site card on left, engine pills on right arc. In RTL reversed — SMB reading flow is right-to-left, so journey starts right travels left. If you keep LTR direction in Hebrew, it narrates "backwards" — character appears to return to site, not leave it. **Entire Stage storyboard must mirror for RTL. Budget 1-2 sprints. Not a CSS flip.**

**Inline text field above Beamie.** RTL text alignment right-to-left. Send button on **left** in RTL, not right. v2 doesn't specify.

**Drag-to-corner snap.** RTL safe-corner prioritization reversed. Snapping to bottom-right in RTL = awkward landing.

**Stage side panel.** v2: "right 280px." In RTL: left 280px. Progress strip at bottom reversed order (leftmost = last, rightmost = first).

**Micro-copy length.** "Done. Your FAQ schema is ready to review." in Hebrew = "הפעולה הסתיימה. סכמת השאלות הנפוצות מוכנה לסקירה" — **twice as long**. Hebrew expansion 1.3-1.8x English. Every v2 micro-copy needs Hebrew translation audit at 14px Inter.

**Critical typography blocker: InterDisplay doesn't support Hebrew.** Inter does; InterDisplay doesn't. Headings in v2 use InterDisplay-Medium. For Hebrew headings, need a Hebrew-display pairing (e.g., Rubik Display, Assistant, Heebo). **This is a typography blocker v2 missed.**

**Rive character file.** v2 Phase 2 specifies 4-state Rive MVP, Phase 3 expands to 8. None accounts for RTL variant. Either build mirrored Rive file or parameterize orientation in state machine. Budget now.

**Score number in RTL.** "72" stays Western numerals, label translates to Hebrew "ציון נוכחות ב-AI". Requires explicit bidi handling.

**One-line verdict:** v2 monolingual. Before Phase 2, produce v2 RTL addendum: Beamie position, gaze, drag snap, Stage mirror, side panel flip, micro-copy length budget, Hebrew font stack, isRTL boolean propagated into Rive. Without this, Israeli customers get second-class experience in their own country.

---

## 7. Micro-copy audit — 10 v2 phrases, all fail

| v2 phrase | Why it fails | Replacement EN | Replacement HE |
|---|---|---|---|
| "Your GEO score" | v2 Part 2 Rule 1 bans GEO — then /home leads with it. Plumber thinks GEO=geography. | "AI visibility score" or "How AI sees your business" | "ציון נוכחות ב-AI" |
| "Run a new scan" | "Run" is developer-speak. SMBs "check" or "update." | "Check my AI presence now" | "בדוק את הנוכחות שלי עכשיו" |
| "Inbox zero" (Fraunces italic) | Productivity-nerd phrase from 2007. Designer-precious Fraunces. | "Nothing to review right now. We'll notify you when there's something." | "אין מה לבדוק כרגע. נודיע לך." |
| "The FAQ agent is working on your homepage" | "FAQ agent" unfamiliar noun. "Working on homepage" sounds threatening. | "We're drafting FAQ suggestions for your homepage. You'll review before anything publishes." | "אנחנו מכינים הצעות לשאלות נפוצות. תוכל לראות לפני שמתפרסם." |
| "3 recommendations are ready in your Inbox" | "Inbox" conflicts with email. "Recommendations" vague. | "We found 3 fixes for your site. Tap to review." | "מצאנו 3 שיפורים לאתר שלך. לחץ כדי לראות." |
| "Auto-pilot" / "Crew" / "Automation" | Implies not driving, scares SMBs. Cute jargon. | "Scheduled fixes" | "תיקונים מתוזמנים" |
| "Agent started" (2200ms toast) | "Agent" abstract. 2200ms too fast for dyslexia. | "We're working on it. You'll get a notification when done." (4-5s dismissible) | "אנחנו עובדים על זה. נשלח התראה." |
| "Done. Your FAQ schema is ready to review." | "FAQ schema" jargon. "Ready to review" passive. | "Your FAQ draft is ready. Take a look." | "הטיוטה של השאלות מוכנה. תסתכל." |
| "Upgrade to Build plan to run manual scans" | Plan name awkward in sentence. "Manual" insider. | "To check your site on demand, upgrade to Build ($189/mo)." | "כדי לבדוק מתי שתרצה, שדרג ל-Build (189$/חודש)." |
| "You're all caught up" (Fraunces italic) | Meditation-app voice. SMBs aren't "caught up"; they're "done for now." | "Nothing to do right now." Plain. No Fraunces. | "אין מה לעשות כרגע." |

---

## 8. Three moments that ACTUALLY need visualization (everything else = progress bar + plain text)

### Moment 1 — First-ever scan, pre-signup ("Do > Show > Tell")
Only moment where full Stage is justified. Unauthenticated visitor, no context, needs proof. **Cap 15s visible motion, skip button from second 1.** Duration budget: ~12s motion over 60-90s real API call, with textual live progress.

### Moment 2 — Score change (delta from last scan)
When /home loads with moved score, animate old → new (800ms). Show delta prominently: "+5 since last week" green, or "-3" amber. **The ONLY motion SMBs consistently request** in interviews: "Am I getting better or worse?" Score-in-motion tells a story; score-in-isolation is astrology.

### Moment 3 — Agent completion ("the ding")
Agent finishes → toast + Inbox badge increment. v2 Completion Settle (motion #5) is correct: 200ms bounce + blue border flash. Product's "your oil change is done" moment — short, professional, actionable.

**Everything else becomes plain text + progress bars:**
- Agent Pulse radiating from avatar → small "Working…" label + dots
- Recommendation Cascade 40ms stagger → instant render. Staggered entries waste attention.
- Beamie breathing, eyebrow wave, gaze tilt → static face + aria-live text updates
- Full Stage for recurring scans → header pill "Scan running · 3 of 7 done"

---

## 9. V2-Lite counter-proposal

**Keep from v2:**
- Color system (with contrast fixes — darken accent to `#2558E5` for text)
- Typography scale (with `rem` units, not `px`)
- 5 easing curves
- Ban on tinted-square icons
- Per-agent distinct icons
- Completion Settle (motion #5)
- Score Gauge Fill (motion #3) with rem scaling
- Fixed InterDisplay loading, sidebar active state — all Phase 0
- First Scan Reveal — rebuilt to 12-15s with skip-to-results

**Cut from v2:**
- Persistent Beamie → Beamie first 3 sessions, retires, Settings toggle to keep
- Full Stage on every scan → Stage on scan #1, header pill on scans #2+
- Drag mechanics (WCAG 2.5.7 via right-click "Move to corner")
- "Inbox" naming → "Review" or "To review"
- "Crew" / "Auto-pilot" → "Scheduled fixes"
- Fraunces in "Inbox zero" → plain Inter
- Agent Pulse (motion #2) → text + dots
- Recommendation Cascade (motion #4) → instant render

**Add to v2:**
- `aria-live` region for every state change + agent event
- WCAG contrast matrix document
- RTL / Hebrew addendum (15+ specific decisions)
- `prefers-reduced-motion` audited for every animation — make it an actual test checklist
- User-configurable: companion visibility, animation intensity, nudge timing, Stage replay default
- Score explanation scaffolding — every score renders with plain-English "what does this mean?" link
- Email + push notifications for agent completion so users can close tab and run their business

**Mental model:** Motion and companion serve SMB's top job ("is my business visible, what's broken, how do I fix"). Any motion or character not directly advancing that job is cut or made opt-in.

---

## 10. Concessions — where v2 is right

- **Phase 0 quick-wins list is excellent.** Ship immediately — pure win, zero of these concerns.
- **Ban on tinted-square-with-icon is correct** — genuine AI-SaaS fingerprint.
- **Typography pairing (Inter + InterDisplay, retire Excalifont) correct** — with rem units.
- **5 easing curves correct** and Rauno/Emil-sourced. Variablize them.
- **`prefers-reduced-motion` mandated** — audit for it.
- **Banning gradient-in-motion, parallax, looping sparkles, `transition: all`, animating `width/height/padding`, scaling from `scale(0)`** — all correct senior motion discipline.
- **"Absorb complexity" PMF rule** (scan 7 engines by default, no selection) — exactly what SMBs want.
- **Beamie's Rule 12 (anti-Clippy 5 hard nevers)** — decent guardrails IF you commit. Problem is Beamie's presence itself; rules constraining presence are well-thought-out.
- **Score Gauge Fill on first display** justified — score is hero number, earns reveal.
- **Stage as opt-in pre-signup** is a real insight. Stage as default for every scan is not.
- **Completion Settle** useful, brief, purposeful.
- **Open Questions list** shows v2 knows what it doesn't know. Healthy.
- **Retiring PostHog-dashboard aesthetic + Shadcn-card-grid boilerplate** right strategic call.

---

## 11. The single hardest question for Adam

**If we shipped Beamix without Beamie, without the Stage, without Rive, without the 30-second scan animation — just Phase 0 quick wins + Score Gauge Fill + Completion Settle + plain English micro-copy + excellent RTL + WCAG AA compliance — would we lose a single paying customer?**

If answer is "no" — and I strongly suspect for Ronit, David, Sarah, Yael it is "no" — then v2's Parts 1 (Beamie + Stage) are designer-justified novelty, not customer-justified features. Motion-as-identity thesis may be defensible as competitive moat, but *only* if (a) it doesn't ship at expense of accessibility/RTL, and (b) competitors are genuinely about to copy GEO scoring itself — in which case differentiation via motion is only lever left.

Before Phase 1 starts, Adam needs evidence Stage and Beamie *convert paying customers* or *reduce churn*. Not beautiful. Not that competitors lack them. That paying SMB owners at month 3 like them or wouldn't leave without them. If evidence doesn't exist: reduce v2 to Phase 0 + three justified motion moments, ship clean WCAG AA + RTL product, reinvest Beamie/Stage budget in (a) score-explanation scaffolding, (b) Hebrew translation quality, (c) email/push notification layer so customers can leave the tab.

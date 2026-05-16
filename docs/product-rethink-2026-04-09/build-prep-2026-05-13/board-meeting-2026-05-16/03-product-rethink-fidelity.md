# Board Member 3 — Product-Rethink Fidelity

## Verdict: PARTIALLY FAITHFUL

The April-09→18 rethink (15 docs in `product-rethink-2026-04-09/`) made it through to the wave briefs with high fidelity on **structure** (11 agents, 7 pages, pricing v2, P0 list, security, automation rules, board-April-18 patches via prior audit). The April-25 vision layer (`docs/08-agents_work/2026-04-25-BEAMIX-VISION.md`, `HOME-DESIGN-SPEC.md`, `DESIGN-DIRECTION` v1/v2) DID NOT make it through. Wave briefs treat Beamix as a polished Shadcn dashboard, not the hand-drawn, Excalidraw-aesthetic, Perplexity-flow, Stripe-drill-down product the April-25 board locked.

## Top 5 fidelity gaps (in rethink → lost in waves)

1. **April-25 BEAMIX-VISION fully absent.** Zero references to `2026-04-25-BEAMIX-VISION.md`, `HOME-DESIGN-SPEC.md` (1271 lines), `DESIGN-DIRECTION-v2.md`, the 7 anchor products (Claude.ai / Excalidraw+Rough.js / Linear / Perplexity / Notion / Stripe / Wix), the 12 design rules, the 5 signature motions (First Scan Reveal, Agent Step List, Score Gauge Fill, Skeleton Cascade, Path-Draw Entry), or Rough.js/Excalifont. Wave 0 FE-3 brief points only at `13-DESIGN-SYSTEM-SPEC.md` (2026-04-17, pre-vision) and Vercel `design.md`. The "hand-drawn living UI" thesis is invisible in the build.
2. **Personas (Sarah dentist / Yossi consultant / Marcus / Aria / Yael) reduced to copy ammo.** Only Yael survives (as a pricing justification "$189 < NIS 700 limit") and a single "Tel Aviv lawyer" appears once in empty-states. The dual-mode product bet (Sarah-simple + Yossi-power-via-Cmd+K) — the architectural moat per April-25 — is not specced anywhere in the waves.
3. **GEO research stats decorate the agent roster but never reach UI/prompts.** 76% freshness, 46.7% Reddit/Perplexity, 16.3% Wikipedia, 23.3% YouTube/AIO, 85% off-site, 48.7% Yelp — present in `07-AGENT-ROSTER-V2.md` as one-line promises, but no wave brief instructs FE workers to surface these in evidence panels, suggestion impact copy, or agent prompts. The research is justification, not product surface.
4. **Voice canon (Model B) + no-AI-disclosure policy partially enforced.** The no-AI-disclosure rule survives (Wave 0 Worker 2 brief), but "Model B voice" (agents named in product, Beamix on emails/PDFs) is nowhere — Resend template names in BE-3 are generic (`welcome-onboarded`, `daily-digest`), with no voice guidance. The "company not tool" framing collapses to "tool."
5. **Beamie deferred is tracked; hand-drawn animation register that REPLACES Beamie is NOT tracked.** Wave briefs mention spring-tuning (`useSpring`) and Framer Motion generically. The locked-in Rough.js + asterisk-family (`· ✻ ✽ ✶ ✳ ✢`) + breathing-pulse + 15-17s First Scan Reveal — the explicit non-Beamie animation strategy from April-25 — isn't a deliverable.

## What got through cleanly

- 11-agent roster v2 with model routing, GEO levers, YMYL policy
- Pricing v2 ($79/$189/$499), 14-day money-back, annual day-1, $19 top-up
- 7-page sidebar (Home, Inbox, Scans, Automation, Archive, Competitors, Settings)
- All 7 P0 + 10 P1 from `10-PRE-BUILD-AUDIT.md` — explicitly resolved in `01-P0-RESOLUTIONS.md` with named target files
- April-18 board patches (Guided Step-by-Step, Query Review Gate, PDF Report, action-language renaming, Cloudflare Turnstile, direct Anthropic SDK, Inngest Pro)
- Day-1 flow, scan UX spec, 15 automation rules
- 8-expert audit findings: 9/10 (CTO, Security, DevOps, AI/ML, VP Product, Growth, Yael, Startup Advisor) — language renaming, security 10-pack, Inngest Pro, agent priority Deep-6/Lighter-5

## What's been silently de-prioritized

- Hand-drawn aesthetic / Rough.js / Excalifont (vision-locked April-25)
- Score-as-clickable-number drill-through (aggregate → engine → query → raw)
- Cmd+K as "the universal escape hatch" — only mentioned for command palette routes, not as power-user navigation model
- Stripe-style "every number clickable, no urgency badges, summary→detail→raw" pattern
- Perplexity-style narrative agent flow (gerund verbs, breathing-pulse, status-copy rotation)
- Persona-driven UX (Sarah vs Yossi same screen, depth via clicking not toggling)
- White-label per-client (mentioned in MEMORY.md, absent from waves)
- Authority Blog format library (mentioned nowhere as deferred)

## What's listed but won't actually be done in the waves (lying-by-omission risk)

- **"Hebrew UI polished, content in English"** — Wave 2 Worker 1 gets `next-intl` + 5 screens RTL + Heebo. The April-25 spec says Rubik+Heebo, full RTL sidebar flip, transcreation not translation, `₪` before number, `he-IL` dates. Wave 2 brief does NOT require any of these specifics; just "Adam reviews Hebrew." High risk of shipping a `dir="rtl"` flag without first-class Hebrew.
- **Agent eval criteria** says 5 golden cases per agent; April-18 board upgraded Deep-6 to 20+ cases. Wave 2 Stream B still reads "5 golden test cases per agent" — the Deep-6 upgrade was dropped.
- **PDF Report (April-18 board)** — present in FE-3 brief with `@react-pdf/renderer`. Good, but no template-design pass scheduled — risk it ships looking like a default react-pdf page, not the "professional one-pager Yael emails her boss."
- **Pipeline progress indicator (T5)** — Worker 4 Wave 2 polish, not Wave 1 Inbox owner. Means Inbox ships in Wave 1 without it; users will see a spinner for 15-60s on every run.

## Three things the next CEO should re-read before Wave 0

1. `docs/08-agents_work/2026-04-25-BEAMIX-VISION.md` — the thesis, 7 anchor products, 12 rules, 5 motions, typography stack. None of this is in the wave briefs.
2. `docs/08-agents_work/2026-04-25-HOME-DESIGN-SPEC.md` (1271 lines) — Home is FE-1's Wave 1 deliverable; the wave brief points at `08-UX-ARCHITECTURE.md` §3 (40-line summary) instead of this 1271-line spec.
3. `docs/08-agents_work/2026-04-24-DESIGN-DIRECTION-v2.md` + `2026-04-25-PER-PAGE-ANIMATION-STRATEGY.md` — the per-page animation contract that Wave 1 FE workers will silently default to "generic Framer Motion" without.

---

**Is the vision actually getting shipped?** Half of it. The board-approved STRUCTURE (agents, pricing, pages, security, P0 fixes) will ship faithfully. The board-approved AESTHETIC + EXPERIENCE LAYER (hand-drawn, persona-dual, narrative agent flow, drill-through score, Hebrew-first) will not — the wave briefs never reference the April-25 vision docs, so workers will build a competent Shadcn dashboard instead of the category-defining product the April-25 board locked.

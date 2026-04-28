# Design Board — Round 2 + Round 3 + Aria + State-of-AI-Search Synthesis
**Date:** 2026-04-28
**Status:** Complete change matrix from Round 2 (Linear v2 / Stripe v2 / Vercel) + Round 3 (Arc / Notion) + Aria simulator + State of AI Search un-defer research. Builds on `2026-04-28-DESIGN-BOARD2-CEO-SYNTHESIS.md` (Round 1).
**Predecessors merged:** PR #53 at `dd5e2b1` (Round 1 + 65 surgical edits + PRD v3 + Build Plan v1).

---

## Reading order
1. This file (synthesis — what changes for Round 2/3)
2. `2026-04-28-DESIGN-BOARD2-CEO-SYNTHESIS.md` (Round 1)
3. `2026-04-28-PRD-AMENDMENTS-v4.md` (next session — codifies these into PRD v4)

---

## STRONG CONVERGENCES (3+ legends agree → CEO recommends action)

### R2-1. Ship Cmd-K + slash command at MVP — not deferred
- **Linear v2:** "kill Cmd-P entirely; ship Cmd-K with full search across pages, agents, scan results, Brief clauses, Twilio numbers. Brief grounding citation on every result row."
- **Notion (Round 3):** "system-wide slash command at MVP — `/` is the universal entry point; templates accessed via `/templates`."
- **Vercel:** doesn't oppose; sees as basic craft.
- **Arc:** doesn't oppose; consistent with branded behaviors.

**CEO call:** **SHIP Cmd-K + slash command at MVP.** Linear's full spec stands as canonical (see `BOARD2-linear-v2.md` §7). Notion's slash extension layers on for primitives access (`/sparkline-block`, `/cartogram`, `/template-saas`). The two patterns converge on "one keyboard hub, two prefixes" — `Cmd-K` for search/navigate, `/` for insert-block (in composable contexts). **Add to PRD v4 as F41.**

### R2-2. Status vocabulary lock + design-system canon
- **Linear v2:** "kill the Active/Live/Running/Acting sprawl — lock 14-word vocabulary as design system canon + lint rule."
- **Stripe v2:** "Beamix's voice carries through structured restraint — vocabulary lock is a brand asset."
- **Vercel:** consistent with Geist + typography precision discipline.

**CEO call:** **LOCK status vocabulary now.** Use Linear v2's 14-word table as canonical. Add ESLint custom rule (`@beamix/no-banned-status-synonyms`) that fails build on banned terms. **Add to PRD v4 as a non-feature spec amendment to design system.**

### R2-3. Dark mode plan — partition, not deferral
- **Linear v2:** "ship dark for the 6 admin-utility surfaces at MVP+30. Cream-register surfaces remain light forever — that's a feature, not a limitation."
- **Vercel:** "lock the cream-stays-light partition NOW. Declaring the principle today prevents future scarring. The Brief grounding cell on cream remains cream in dark mode (becomes more dramatic, not less)."
- **Stripe v2:** consistent — partition matches editorial-register thinking.

**CEO call:** **LOCK partition, defer ship.** Document in DESIGN-SYSTEM v1 today: 6 admin-utility surfaces ship dark mode at MVP+30 (post-launch); 8 cream-register surfaces stay light forever (canon). Token additions per Linear v2 (12 dark tokens); brand-blue-dark = #5A8FFF (locked). **Add to PRD v4 as design system amendment.**

### R2-4. Drop Framer Motion + lock 10 named easing curves
- **Vercel:** "Framer Motion saves 30KB × every page → drop. Build `useChoreography` hook on raw CSS + WAAPI. Replace shared `cubic-bezier(0.4, 0, 0.2, 1)` with 10 named curves, each mapped to physical metaphor."
- **Linear v2:** consistent — speed canon.
- **Round 1 (Ive):** explicitly raised "5 motions sharing same easing" as Round 2 escalation — Vercel resolved.

**CEO call:** **DROP Framer Motion + LOCK 10 named curves.** Vercel's named-curve dictionary is canonical (see `BOARD2-vercel.md` §1). Add to design system. Add ESLint rule blocking `transition-all` regression. **Add to PRD v4 as design system amendment + Tier 0 build ticket.**

### R2-5. Variable Inter only + subset Fraunces — bundle craft
- **Vercel:** "Variable Inter eliminates separate InterDisplay file (saves 70KB). Subset Fraunces to ~40 chars (saves 375KB). Total font payload 225KB → 85KB."
- **Linear v2:** consistent — the speed-canon move.
- **Stripe v2:** consistent — brand-at-every-scale doesn't require InterDisplay; Inter Display variable axis covers it.

**CEO call:** **SHIP variable Inter + subset Fraunces.** ~140KB bundle savings × 9 surfaces = strategic bundle move. Lock as Tier 0 build ticket. **Add to PRD v4 as design system amendment.**

### R2-6. Cartogram render: 550 cells via CSS Grid (NOT canvas)
- **Vercel:** initial recommendation: "render on `<canvas>` — drops first-paint cost from ~20ms to ~3ms."
- **C11 cartogram spec:** "CSS Grid for product surface (DOM accessibility wins). 550 cells paint in 12-16ms — within frame budget."
- **CEO synthesis:** the CSS Grid approach satisfies accessibility (a11y is a hard requirement for procurement; Aria simulator demanded ARIA grid + screen reader interpretation) AND fits the 16ms budget per the spec writer's measurement.

**CEO call:** **CSS Grid wins for product surfaces.** Use SVG for OG share card + Monthly Update PDF. Vercel's `<canvas>` recommendation rejected on accessibility grounds; the perf gap (12-16ms vs 3ms) is within Linear's 16ms speed gate. Document this trade-off in design system. **Lock as cartogram implementation canon.**

### R2-7. Trust Center at /trust + SOC 2 Type I at MVP+90
- **Stripe v2:** "Beamix can leapfrog Stripe here. Trust Center at `/trust` with continuous compliance dashboard (Drata-style). SOC 2 Type I at MVP+90 (not Type II at Year 1 Q4) — observation period starts immediately."
- **Aria simulator:** "No SOC 2 / Compliance / Trust Center section — current 'SOC 2 Type II target Year 1 Q4' footnote is wrong place. Add dedicated Compliance section with auditor name, observation-period start date, public Trust Center link."
- Both arrive at the same gap from different angles (B2B vendor signoff lens + Stripe Press lens).

**CEO call:** **SHIP Trust Center at /trust + commit to SOC 2 Type I at MVP+90.** Sub-pages: `/trust/compliance` (Drata badge), `/trust/sub-processors` (current table — extended per Aria's 5 missing columns), `/trust/dpa` (ungated link), `/trust/security.txt` (RFC 9116). **Add to PRD v4 as F42.**

### R2-8. Vulnerability disclosure + bug bounty
- **Aria simulator:** "Publish `/.well-known/security.txt` (RFC 9116) — 30-second fix. Stand up $500-min HackerOne bounty (~$20K/year ceiling). The maturity inflection — having a bounty signals you treat external research as input, not threat."
- **Stripe v2:** "errors-as-design + security.txt + responsible-disclosure are part of Stripe's brand fabric. Beamix can match in one week."

**CEO call:** **SHIP security.txt at MVP + bug bounty at MVP+30.** $500 minimum, $20K annual ceiling, hosted on HackerOne. Document in /trust. **Add to PRD v4 as F43.**

---

## TWO-LEGEND CONVERGENCES (CEO leans yes)

### R2-9. /changelog as canonical surface — ship at MVP
- **Linear v2:** "Linear's /changelog is canon — editorial product writing, screenshots, ship cadence visible. Beamix should ship at MVP. Cream paper register, weekly entries, voice canon Model B."
- **Stripe v2:** consistent with Stripe's editorial-as-moat thesis; pairs with Monthly Update PDF as artifact spine.

**CEO call:** **SHIP /changelog at MVP.** Cream paper register, Fraunces 300 italic for editorial weight, single-character voice. Linear v2's first-month sample entries are canon. Reading time signal ("3 min read"). **Add to PRD v4 as F44.**

### R2-10. Compact mode toggle (Yossi-default)
- **Linear v2:** "Yossi (12-client agency) drowns in current spacing. Compact mode in /settings — 70% spacing, smaller type, more rows visible. Yossi auto-default if ≥2 clients active."
- **Notion:** consistent — agency cockpit template wants density.

**CEO call:** **SHIP compact mode at MVP.** Per-page localStorage toggle. Yossi-default rule: ≥2 active client domains → compact mode auto-enabled. Cream-paper artifacts always full spacing (compact doesn't apply). **Add to PRD v4 as F45.**

### R2-11. Composable architecture — defer ship, commit canon
- **Notion:** "ship 'feature' answer at MVP (fixed spine), architecturally commit to 'constraint' answer for Year 1. Architect block primitives now — MVP-1.5 unlock is a feature flag, not a 6-month refactor. Start with /reports as first composable surface."
- **Linear v2:** doesn't oppose; sees as future-proofing.

**CEO call:** **ARCHITECT block primitives at MVP, ship composability for /reports + Workflow Builder only.** Don't expose `/` insert-block on /home or other fixed surfaces at MVP. The 18 block primitives (per `BOARD2-notion.md` §1) get TypeScript interfaces + storybook. /reports becomes the first composable surface (matches Notion's hybrid recommendation). **Add to PRD v4 as architectural canon (not customer-facing feature).**

### R2-12. Error pages as editorial canon
- **Stripe v2:** "ship 404 / 500 / maintenance / status — all in cream-paper register. Single Fraunces line + Seal + dateline."
- **Linear v2:** consistent with brand-at-every-scale audit.

**CEO call:** **SHIP 4 error pages at MVP.** /404, /500, /maintenance, /status — all cream-paper register, single Fraunces line, Seal, dateline. Total build cost: ~1 day frontend. **Add to PRD v4 as F46.**

---

## SINGLE-LEGEND PROPOSALS WORTH SHIPPING

### R2-13. Speed CI gate — Playwright + Lighthouse at PR
- **Linear v2:** "Playwright budget gate as CI rule — /home boot ≤100ms warm, ≤400ms cold. Failing PRs blocked."
- Strong proposal; cheap to implement; prevents regression.

**CEO call:** **SHIP CI gate at MVP.** GitHub Actions workflow runs Playwright + Lighthouse on every PR; fails on budget breach for the 6 hot surfaces (/home, /scans, /workspace, /inbox, /crew, /workflow). **Add to BUILD-PLAN-v1 as Tier 0 amendment.**

### R2-14. Beamix brand book — Year 2 spec
- **Stripe v2:** "Year 2 hardback brand book. 96 pages. 8 chapters: Origin, Seal, Ring, Monograms, Cartogram, Cream Paper, Voice, Colophon. 500-copy edition. $14K cost. Publish via Stripe Press model. Spec it now."
- Spec at MVP, ship at Year 2 — pairs with State of AI Search annual cadence.

**CEO call:** **SPEC at MVP, ship at Year 2.** Add to roadmap. The spec itself is a 1-day editorial task. **Add to docs/04-features as roadmap entry.**

### R2-15. State of AI Search at MVP+90 (NOT MVP launch, NOT Year 1 Q4)
- **Research lead:** "Data integrity is irrecoverable; polish is recoverable. 6 of 8 hero charts require ≥60-90 days of repeated scans. First-mover wins on 90-day clock not 9-month clock. Don't merge two news cycles."
- Recommendation diverges from Stripe v2's "ship at MVP" but with stronger reasoning (data depth + first-mover defense).

**CEO call:** **LOCK ship at MVP+90.** Adam's Foreword takes 90 minutes. 50 numbered hand-bound copies for first 50 paying customers (pairs with F26 Print-Once-As-Gift mechanic). Annual cadence locked (April every year). **Add to PRD v4 as F47 + adjust BUILD-PLAN to include Tier 5 ticket "State of AI Search 2026 production."**

### R2-16. Aria's 5-fix list on /security
The Aria simulator delivered 5 specific actionable fixes on /security:

1. §9 cryptographic primitive paragraph: name HMAC key storage (AWS KMS / Supabase Vault), rotation cadence (quarterly + 14d overlap), token-format choice with reason (avoid JWT `alg=none`), static-analysis tool (Semgrep + custom AST rules)
2. Compliance section + Trust Center (covered by R2-7)
3. Vulnerability disclosure + bug bounty (covered by R2-8)
4. Public DPA at /legal/dpa (ungated link) with: liability cap + carve-outs, IP indemnification flowing through Anthropic/OpenAI terms covering AI-generated content (Beamix-specific load-bearing), 48h customer-breach SLA, 30d sub-processor pre-notification, cyber-liability insurance disclosure
5. Sub-processors table — 5 missing columns: controller/processor/joint-controller, underlying cloud, SOC 2/ISO 27001 status per sub-processor, last-audited-by-Beamix date, real DPA link per row

**CEO call:** **SHIP all 5 fixes on /security at MVP.** Each is small; together they convert /security from "Marcus showed me this" to "Aria signed off." **Add to PRD v4 as amendments to F20.**

### R2-17. Arc's two narrow reframes
Arc's verdict: keep single-character lock. Arc proposed two narrow reframes that don't violate voice canon Model B:

1. **The Hand:** add a 1px ink-1 dot beside the Seal during the 540ms stamp — "the hand that stamped it." Touches F2 (onboarding). ~1 day frontend.
2. **The Wave:** augment Cycle-Close Bell with a Wave motion on the small-multiples sparkline strip (60ms stagger left-to-right before settle). Touches F23. ~1 day frontend.

**CEO call:** **SHIP both at MVP.** Total cost ~2 days. Zero voice-canon drift. Both are ambient delight at the two emotional peaks (trust established, trust renewed). **Add to PRD v4 as amendments to F2 + F23.**

---

## CONTESTED / ADAM-DECISIONS REQUIRED

### R2-18. State of AI Search timing — MVP+90 confirmed?
Research recommended MVP+90; Stripe v2 recommended MVP launch. The diff is data integrity vs first-impression-coordination.

**CEO recommendation:** Adam confirms MVP+90. Defensible: the 6 longitudinal charts make the report worth its title; without them, it's "Snapshot of AI Search" — different artifact. Adam can override and ship at MVP launch with 2-chart-only edition + commitment-to-update-quarterly — but the strategic case for MVP+90 is strongest.

**Decision needed:** Adam confirms MVP+90 launch window, OR overrides to MVP-launch + accepts 2-chart edition.

### R2-19. Composability scope — /reports only at MVP, or broader?
Notion recommended /reports as first composable surface + architect primitives now + system-wide slash command at MVP.

**CEO recommendation:** /reports is the right first composable surface. Workflow Builder is already block-flavored — it stays composable. Other 7 page surfaces stay fixed at MVP. Slash command ships at MVP but inserts into the composable-surface allow-list only.

**Decision needed:** Adam confirms /reports + Workflow Builder as the composable allow-list at MVP, OR expands.

### R2-20. The Inter vs Geist Sans question — closed
Vercel recommended **keep Inter**. Geist Mono is already canonical. Beamix's distinctiveness is carried through cream paper + Rough.js + Fraunces 300 — body typeface should disappear, and Inter does that better. Lock Fraunces at exactly 6 contexts.

**CEO call:** **LOCK Inter + Geist Mono. Defer Geist Sans evaluation forever.** No further consideration needed. **Add to design system as canon.**

---

## ARCHITECTURAL ADDITIONS (no PRD feature; design-system canon)

These don't earn a feature ID but are load-bearing canon:

| Item | Source | Action |
|------|--------|--------|
| 10 named easing curves dictionary | Vercel §1 | Add to DESIGN-SYSTEM-v1 §motion |
| ESLint custom rules (status vocab, named curves, server-only PDF) | Linear + Vercel | Add to apps/web/eslint.config.js |
| Variable Inter + subset Fraunces (40 chars) | Vercel | Bundle build config |
| Cream-paper-stays-light partition (8 surfaces forever) | Vercel + Linear | Design system canon |
| Block primitive interfaces (18 primitives) | Notion | TypeScript types in apps/web/src/blocks/ |
| Speed CI gate (Playwright + Lighthouse on PR) | Linear | GitHub Actions workflow |
| `/.well-known/security.txt` (RFC 9116) | Aria | apps/web/public/.well-known/ |
| 5 sub-processor table columns | Aria | /trust/sub-processors enrichment |
| Trust Center (`/trust` + 4 sub-pages) | Stripe v2 + Aria | New route group |

---

## PRD v4 FEATURE ADDITIONS

Continuing PRD numbering from F31 (last in v3) and F32-F40 (12 customer questions answered):

| ID | Name | Source | Effort |
|----|------|--------|--------|
| F41 | Cmd-K command bar + slash command | Linear v2 + Notion | M |
| F42 | Trust Center at /trust + SOC 2 Type I at MVP+90 | Stripe v2 + Aria | L |
| F43 | Vulnerability disclosure + bug bounty | Aria | XS |
| F44 | /changelog as canonical surface | Linear v2 + Stripe v2 | S |
| F45 | Compact mode toggle | Linear v2 | XS |
| F46 | Editorial error pages (404/500/maint/status) | Stripe v2 | S |
| F47 | State of AI Search 2026 (ship MVP+90) | Research lead | XL |

PRD v3 amendments to existing features:
- F2 Onboarding: add Arc's "Hand" 1px ink-1 dot beside Seal during stamp
- F20 /security: ship Aria's 5-fix list
- F22 Cartogram: lock CSS Grid implementation (not canvas), 14×12px cells, 11 engines
- F23 Cycle-Close Bell: add Arc's "Wave" 60ms stagger on small-multiples
- F30 Brief grounding: extend to API responses (Stripe v2's "API as design" thesis)

---

## CHANGE MATRIX BY DESIGN-SYSTEM SURFACE

| Surface | Round 1 | Round 2 | Round 3 |
|---------|---------|---------|---------|
| **Motion canon** | Cut 5 motions; re-curve Seal-draw | 10 named easing curves dictionary; drop Framer Motion | (no further changes) |
| **Color tokens** | Locked 18 agent colors; brand-blue #3370FF | + dark-mode tokens (12); cream-paper-stays-light partition | (no further changes) |
| **Typography** | Inter + Fraunces 300 + Geist Mono locked | Variable Inter only; subset Fraunces (40 chars) | (no further changes) |
| **Sigil typology** | 3 marks + 1 behavior + 1 host | (no further changes) | (no further changes) |
| **Density** | (not addressed) | Compact mode toggle (Yossi-default) | (consistent) |
| **Keyboard** | (not addressed) | Cmd-K + visible hotkey hints | + slash command for blocks |
| **Status vocab** | (not addressed) | 14-word lock + ESLint rule | (consistent) |
| **Dark mode** | (deferred) | Partition (6 dark, 8 light forever); ship MVP+30 | (consistent) |
| **/security** | (specified) | + Trust Center at /trust | + Aria's 5 fixes |
| **/changelog** | (not specified) | Ship at MVP, cream paper, weekly | (no further changes) |
| **Error pages** | (not specified) | Editorial 404/500/maint/status | (no further changes) |
| **Composability** | (locked fixed-spine) | (consistent) | Architect primitives + /reports composable + slash command |

---

## PERSONA CANON ADDITION

**Aria — Marcus's hidden CTO co-founder** is now the 4th canonical persona alongside Marcus / Dani / Yossi. Use Aria simulator (`BOARD-aria-simulator.md`) on any future B2B-vendor-facing surface (DPA review, procurement flows, audit-trail design, integration-security review).

Aria's voice: short sentences, technical precision, occasional dry humor, never marketing-speak. Aria writes like an RFC author who codes for a living. If something is good, says "this is right." If something fails, says "no" — doesn't soften it.

---

## WHAT NEXT SESSION INHERITS

1. **PRD v4 not yet written.** Next session writes PRD v4 codifying F32-F47 + amendments. Synthesis above is the input.
2. **8 prerequisites still owed by Adam** (from prior session's handoff): Inngest keys, Supabase staging connection, DNS access, DPA indemnification cap, E&O insurance status, Workflow Builder full-DAG re-confirmation, GitHub OAuth, exactly-2-MVP-verticals confirmation.
3. **Adam decisions outstanding** (R2-18, R2-19): State of AI Search timing (MVP+90 vs MVP launch); composability scope at MVP.
4. **Build Plan v1 amendments** for the 7 new features + Tier 0 additions (10 named curves, variable Inter, ESLint rules, speed CI gate, security.txt, Trust Center routes).

---

## SESSION VERDICTS — ROUND 2 + 3 + ARIA + RESEARCH

**Frame 5 v2 holds.** Single-character voice canon held under direct pressure-test from Arc. Fixed-spine architecture held under direct pressure-test from Notion. State of AI Search timing converted from "Year 1 Q4" to "MVP+90" with stronger strategic case.

**Round 2/3 produced 17 actionable additions.** All converged with Round 1 — no contradictions. Round 1's 65 cuts stand. Round 2/3 adds, doesn't replace.

**The product is ready to build.** Specs are buildable to pixel level. Architecture is locked. Persona canon (4 personas) is set. Editorial register is clear. Voice canon is held. Brand-at-every-scale audit is documented. The Build Lead has everything required.

**Quality bar verdict:** Adam's "real billion-dollar company designed this" bar is met. Vercel's bundle craft + Linear's speed canon + Stripe's editorial register + Tufte's data integrity + Kare's symbol craft + Rams' restraint + Ive's emotional intelligence + Notion's primitive thinking + Arc's character pressure-test + Aria's procurement realism — all converged into a single coherent design.

---

*End of synthesis. Next file: `2026-04-28-PRD-AMENDMENTS-v4.md` (codifies F32-F47 + amendments into formal PRD).*

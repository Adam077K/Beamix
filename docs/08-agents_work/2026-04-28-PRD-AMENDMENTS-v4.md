# PRD v4 — Amendments to v3
**Date:** 2026-04-28
**Status:** Amendment doc. Folds F32-F40 (from `2026-04-28-PRD-12-unanswered-questions.md`) + F41-F47 (from Round 2/3 synthesis) + design-system canon additions into the canonical PRD. Next session writes the consolidated PRD v4 that supersedes v3.
**Predecessors:** `2026-04-28-PRD-wedge-launch-v3.md` (F1-F31) + `2026-04-28-PRD-12-unanswered-questions.md` (F32-F40 detailed) + `2026-04-28-DESIGN-BOARD-ROUND2-3-SYNTHESIS.md` (Round 2/3 synthesis).

---

## Feature ID summary — full v4 set

| ID | Name | Source | Status |
|----|------|--------|--------|
| F1-F31 | (PRD v3 — locked) | Prior sessions | LOCKED |
| F32 | Brief undo + re-author | Audit 3 Q1 | SHIP-MVP |
| F33 | Team seats (Owner + Editor) | Audit 3 Q2 | SHIP-MVP |
| F34 | Self-service data export | Audit 3 Q4 | SHIP-MVP |
| F35 | Graceful cancellation | Audit 3 Q5 | SHIP-MVP |
| F36 | Domain migration wizard | Audit 3 Q7 | SHIP-MVP |
| F37 | /reports route | Audit 3 Q9 | SHIP-MVP |
| F38 | Subscription pause | Audit 3 Q10 | SHIP-MVP |
| F39 | Competitor removal | Audit 3 Q11 | SHIP-MVP |
| F40 | Scale multi-domain pricing | Audit 3 Q12 | SHIP-MVP |
| F41 | Cmd-K command bar + slash command | R2/R3 convergence | SHIP-MVP |
| F42 | Trust Center at /trust + SOC 2 Type I | R2 convergence (Stripe + Aria) | SHIP-MVP |
| F43 | Vulnerability disclosure + bug bounty | Aria simulator | SHIP-MVP |
| F44 | /changelog as canonical surface | Linear v2 + Stripe v2 | SHIP-MVP |
| F45 | Compact mode toggle | Linear v2 | SHIP-MVP |
| F46 | Editorial error pages (404/500/maint/status) | Stripe v2 | SHIP-MVP |
| F47 | State of AI Search 2026 | Research lead | SHIP-MVP+90 |

**Total v4 features: F1-F47 (47 features at MVP scope).**

---

## F41 — Cmd-K command bar + slash command

**Surface:** Global keyboard shortcut overlay (every page).

**User story:** As any persona, I want one keyboard shortcut to find anything, jump anywhere, run any agent action — so I don't have to navigate the product visually for common tasks.

**Acceptance criteria:**
- `Cmd-K` (Mac) / `Ctrl-K` (Win/Linux) opens command bar from any page
- Search across: pages (9 fixed surfaces + customer-created /reports surfaces), agents (6 MVP agents), scan results (last 30 days), Brief clauses (4 + custom), Twilio numbers, sub-processors, /changelog entries, Help Center
- Each result row shows: result type icon (16×16), result title (Inter 14px), Brief grounding citation (Geist Mono 11px ink-3) — every result authorized by a Brief clause shows it
- Recently used commands surfaced first (top 5)
- Sacred shortcuts: `Cmd-K then i` → /inbox, `Cmd-K then s` → /scans, `Cmd-K then a` → /workspace, `Cmd-K then b` → Brief, `Cmd-K then c` → /crew, `Cmd-K then ?` → help
- Slash command (`/`) opens block-insert palette (composable surfaces only — /reports + Workflow Builder Inspector at MVP)
- Visible hotkey hints in UI: `<kbd>` style next to button labels (e.g., "Approve `enter ↵`")
- Mobile fallback: tap global search icon (top-right of every page); same search results
- Close: Esc

**Build effort:** M (~5 person-days). Touches: new component `CommandBar.tsx`, search index (Postgres FTS or in-memory at MVP scale), keyboard handler hook, mobile sheet variant.

**Edge cases:**
- Zero-result query: shows "Nothing matches. Try [3 suggested searches]"
- Offline (PWA): shows cached results from last sync
- Brief grounding: results from sources without a Brief clause (e.g., "Help Center" entries) show no citation row — citation is per-result, not forced

**Voice + microcopy:**
- Placeholder: "What are you looking for?"
- Empty state: "Type to search across your account, agents, and Brief."
- Brief grounding line on results: `Authorized by your Brief: "[clause N]"`

---

## F42 — Trust Center at /trust + SOC 2 Type I

**Surface:** New route group `/trust` with sub-pages.

**User story:** As Aria (CTO co-founder of Marcus's company), I need a procurement-ready trust artifact that surfaces compliance status, sub-processors, DPA, and ongoing security posture — so I can sign off Marcus's vendor onboarding without a 6-week security review.

**Acceptance criteria:**
- `/trust` — landing page (cream paper register, Fraunces 300 italic editorial line, Beamix Seal); 4 cards linking to sub-pages
- `/trust/compliance` — SOC 2 Type I status (live observation period start date), HackerOne bounty live status, ISO 27001 roadmap commitment, GDPR DPA link
- `/trust/sub-processors` — extended table with 5 columns Aria flagged: controller/processor/joint-controller, underlying cloud, SOC 2/ISO 27001 status per sub-processor, last-audited-by-Beamix date, real DPA link per row
- `/trust/dpa` — ungated public DPA link (PDF + HTML version); covers liability cap + carve-outs, IP indemnification flowing through Anthropic/OpenAI terms covering AI-generated content (Beamix-specific load-bearing), 48h customer-breach SLA, 30d sub-processor pre-notification, cyber-liability insurance disclosure
- `/.well-known/security.txt` — RFC 9116 compliant (`Contact:`, `Encryption:`, `Acknowledgments:`, `Preferred-Languages:`, `Canonical:`, `Policy:`, `Hiring:`)
- SOC 2 Type I observation period START at MVP launch; report DELIVERED at MVP+90 (audit firm name + observation dates published on /trust/compliance)
- Each page has Brief binding line at bottom (F31 — rotating Brief clause)

**Build effort:** L (~10 person-days backend/frontend; auditor engagement is parallel — Drata + Prescient Assurance or equivalent ~$8K-15K Type I)

**Edge cases:**
- Customer in Israel: DPA includes hebrew-language-supplement note
- Customer is Yossi (multi-client agency): DPA addendum for sub-vendor pass-through
- Sub-processor mid-audit: "audit in progress" status row instead of date

**Voice + microcopy:** "We publish what we know, when we know it. The dates here are real." (single-character canon)

---

## F43 — Vulnerability disclosure + bug bounty

**Surface:** `/.well-known/security.txt` + HackerOne program + `/trust/disclosure` page.

**User story:** As Aria, I trust vendors who treat external security research as input, not threat — so a public bounty signals operational maturity.

**Acceptance criteria:**
- `/.well-known/security.txt` published at MVP launch (zero-cost configuration)
- HackerOne program live at MVP+30: $500 minimum bounty, $20K annual ceiling, scope = beamix.tech + api.beamix.tech + customer dashboards
- Public disclosure page at `/trust/disclosure` — explains scope, payouts, response SLA (5 business days for triage, 30 for fix-or-mitigation)
- Acknowledgments page: monthly-updated list of researchers who reported valid issues (name + handle + month; opt-out available)

**Build effort:** XS (security.txt = 1 hour; HackerOne setup = 1 day; budget commit ~$20K/year ceiling).

**Edge cases:**
- Researcher reports issue in customer's site (out of scope): redirect with respectful note
- Critical Sev-1: emergency direct line to security-lead phone (paired with §10 of /security spec)

---

## F44 — /changelog as canonical surface

**Surface:** New route `/changelog` (public, indexed by Google + AI engines).

**User story:** As Marcus, I want to see what Beamix shipped this week so I know my vendor is alive — and as the press / AI engines, I want a citable artifact about Beamix's shipping cadence.

**Acceptance criteria:**
- `/changelog` route (public, no auth required)
- Cream paper editorial register (matches Monthly Update aesthetic)
- Weekly entries (Fridays) — every customer-impacting ship
- Each entry: dateline (Geist Mono 11px ALL CAPS), Fraunces 300 italic editorial title, ≤200 words body (Inter), 1 hero image or animated GIF (motion respects prefers-reduced-motion)
- Reading time signal at top of each entry: "3 min read"
- Brief grounding citation at bottom of each entry (rotating; F31 pattern)
- "Subscribe via email" CTA (Resend + RSS feed)
- Voice canon Model B (single-character "Beamix"; no agent names externally)
- /changelog gets its own OG share card (cream paper, dateline, Seal)

**Build effort:** S (~3 person-days; relies on existing CMS or markdown-files-in-repo pattern)

**Edge cases:**
- Quiet week: no entry; previous entry stays at top
- Major release week: multiple entries (still date-stamped per ship)
- /changelog/[slug] permalinks (each entry has stable URL)

**Voice + microcopy:** "Friday, April 24 — We taught the FAQ Agent how Marcus's customers actually phrase questions. (3 min read)"

---

## F45 — Compact mode toggle

**Surface:** Per-page toggle on /inbox, /scans, /crew (and other dense list views).

**User story:** As Yossi (12-client agency), I drown in current spacing. I need denser views to scan multiple clients without scrolling.

**Acceptance criteria:**
- Toggle in page header: 2-state segmented control (`Comfortable | Compact`); default `Comfortable`
- Yossi auto-default rule: if user has ≥2 active client domains → `Compact` auto-set on first /home visit (one-time, then sticky)
- Compact /inbox: 40px row height (down from 56px); 13px Inter; tighter visible action buttons
- Compact /scans: 32px row height (down from 56px); engine column micro-strip preserved; per-row hover detail still works
- Compact /crew: 48px row height (down from 72px); monogram size table per Round 1 (16px monogram in compact; 32px in comfortable)
- localStorage persistence per page (key: `beamix-density-{page}`)
- Cream-paper-register surfaces (Brief, Monthly Update, /changelog, /trust) NEVER compact — toggle hidden on those pages
- Compact does NOT change typography hierarchy (still readable; no smaller-than-13px body)

**Build effort:** XS (~2 person-days — simple state toggle + CSS class swap)

**Edge cases:**
- Yossi removes 2nd client (drops to 1 client): compact stays sticky (don't downgrade automatically)
- Print stylesheet: always full-spacing (compact does not apply to print)

---

## F46 — Editorial error pages

**Surface:** /404, /500, /maintenance, /status.

**User story:** As any user, when something breaks, I want the page to feel like Beamix — not a generic Next.js framework error.

**Acceptance criteria:**
- All 4 pages cream paper register, single Fraunces 300 italic line, Seal at top, dateline (Geist Mono "April 28, 2026 — 14:23 GMT")
- /404: "We couldn't find that page. The URL may have moved." + "[Take me home →]" CTA
- /500: "Something broke. Beamix is logging it now. Try again, or check our status." + status link
- /maintenance: "Beamix is performing scheduled maintenance. Returning at 03:00 GMT." + status link
- /status: external page (status.beamix.tech via Better Stack or equivalent) with current incident + 90-day uptime
- All pages have F31 Brief binding line at bottom
- All pages logged to Sentry / observability (404 vs 500 vs maintenance distinguished)

**Build effort:** S (~2 person-days for all 4 pages + status page setup)

**Edge cases:**
- /500 during database outage: page must serve from edge (no DB dependency)
- /maintenance: scheduled in advance; banner appears 24h before; redirects to /maintenance during window

**Voice + microcopy:** Single-character; calm; no apologies-as-disclaimers ("Sorry!" banned).

---

## F47 — State of AI Search 2026

**Surface:** `/state-of-ai-search` route + downloadable PDF + 50 hand-bound print copies.

**User story:** As Adam, I want a category-defining artifact that earns Beamix permanent citation as the authority on AI search visibility for SMBs.

**Acceptance criteria:**
- Ship at MVP+90 (data integrity + first-mover defense)
- 8 hero charts:
  1. Citation share by AI engine for SMBs (11 engines × 4 verticals)
  2. Schema.org markup citation lift (8× findings — confidence-tested)
  3. AI search loneliness cohort decay (≥60-day data required)
  4. Engine reliability ranking (consistency scoring)
  5. Engine divergence — where engines disagree about who matters
  6. Fastest-growing AI search citations of Q1 2026 (delta tracking)
  7. Verticals AI search engines cite most reliably (heatmap)
  8. The 30-day-after-launch invisibility curve (cohort data)
- 11-section editorial spine: Foreword (Adam's voice + Seal), Executive Summary, Methodology, Per-engine deep-dives (×4), Cross-engine cartogram view, Action chapter, Vertical chapter, Longitudinal chapter, Look-ahead, Colophon
- Voice canon Model B (single-character "Beamix Editorial" byline; no agent names)
- Cream paper register; Fraunces 300 italic for Section heads; Inter for body; Geist Mono for stats; cartogram on Page 2
- 50 hand-bound numbered print copies for first 50 paying customers (pairs with F26 Print-Once-As-Gift)
- 10 press-seeding copies, 10 archive copies
- Digital download: gated by email (list-building flywheel)
- OG share card: cream paper + cartogram preview + Seal
- Annual cadence locked (April every year — repeat with deeper data each year)
- Embargoed pre-brief to TechCrunch, Search Engine Land, MarketingProfs, Forbes Small-Business, Increment magazine
- Founder Twitter / podcast coordination (Adam writes 3 short-form pitches in advance)

**Build effort:** XL (~25 person-days: editorial 12, design 8, data 5; ~$45.5K total — editorial contractor $10-15K, designer $10-12K, print $3-5K, PR $10-15K)

**Edge cases:**
- Insufficient data at MVP+90 (paying customers <50): publish 4-chart edition with explicit "more depth in 2027" footnote
- Competitor (Profound / Goodie AI) ships first: Beamix's lead is the data depth (50K+ scans vs competitor's likely thinner sample); the report's defensibility is the data lake, not the moment

**Voice + microcopy:** "Beamix scanned 50,000 small businesses across 11 AI engines. Here's what we found."

---

## AMENDMENTS TO V3 FEATURES

### F2 Onboarding — Add Arc's "Hand"
- Add: 1px ink-1 dot beside the Seal during the 540ms stamp animation. The dot fades in at t=120ms (during the path-draw phase), holds during the hold phase, fades out with the seal-fade. Reads as "the hand that stamped it."
- Effort: ~1 day frontend

### F20 /security — Aria's 5 fixes
1. §9 cryptographic primitive paragraph rewrite: name primitives (AES-256-GCM, Argon2id, libsodium, BoringSSL), name modes, name HMAC key storage (AWS KMS / Supabase Vault), rotation cadence (quarterly + 14d overlap), failure mode ("fails closed"), token format choice with reason (avoid JWT `alg=none`), static-analysis tool (Semgrep + custom AST rules)
2. Compliance section + Trust Center link (covered by F42)
3. Bug bounty + security.txt (covered by F43)
4. Public DPA link at /trust/dpa (ungated; covered by F42)
5. Sub-processor table 5 missing columns (covered by F42)

### F22 Cartogram — Implementation lock
- CSS Grid implementation (NOT canvas) for product surfaces (a11y + procurement-grade requirement per Aria)
- 14×12px cells (locked from cartogram pixel spec)
- 11 engines × 50 queries = 550 cells; total artifact 468×697px
- SVG for OG share card + Monthly Update PDF
- Two new design tokens: `--color-cartogram-grid-bg`, `--color-score-critical-soft` (#FCE3E3)

### F23 Cycle-Close Bell — Add Arc's "Wave"
- Add: 60ms stagger left-to-right wave on the small-multiples sparkline strip BEFORE the settle animation. 11 cells × 60ms = 660ms total wave, then 200ms settle.
- Effort: ~1 day frontend

### F30 Brief grounding — Extend to API
- Every Beamix API response includes `authorized_by_brief_clause` field with the Brief clause UUID + truncated text (≤120 chars)
- API documentation (when shipped at month 6-9 post-MVP per Stripe v2 roadmap) shows the Brief grounding field as a structural commitment
- Effort: ~2 days backend (every API route + response schema)

---

## DESIGN-SYSTEM CANON ADDITIONS (no PRD feature; build-canon)

### Motion taxonomy — 10 named easing curves
Add to `apps/web/src/styles/motion.css` and `tailwind.config.js`:

```css
:root {
  --ease-stamp: cubic-bezier(0.55, 0.07, 0.6, 1.05);     /* Seal-stamping */
  --ease-ring-close: cubic-bezier(0.65, 0, 0.35, 1);      /* Cycle-Close Bell */
  --ease-paper-fold: cubic-bezier(0.34, 1.56, 0.64, 1);   /* Receipt card */
  --ease-narration-in: cubic-bezier(0.16, 1, 0.3, 1);     /* Narration column */
  --ease-pill-spring: cubic-bezier(0.34, 1.56, 0.64, 1);  /* WB elastic edges */
  --ease-status-rewrite: cubic-bezier(0.4, 0, 0.2, 1);    /* F23 status sentence */
  --ease-card-enter: cubic-bezier(0.16, 1, 0.3, 1);       /* Drawer/modal */
  --ease-trace-fade: cubic-bezier(0.4, 0, 0.6, 1);        /* Trace behavior */
  --ease-skeleton-pulse: cubic-bezier(0.4, 0, 0.6, 1);    /* Loading states */
  --ease-wave-stagger: cubic-bezier(0.65, 0, 0.35, 1);    /* Arc's Wave on F23 */
}
```

ESLint rule: `@beamix/no-shared-easing` blocks `transition-all` and `cubic-bezier(0.4, 0, 0.2, 1)` outside the named-curve dictionary.

### Typography — Variable Inter + subset Fraunces
- Drop separate InterDisplay font file; use Inter Variable axis `opsz` with values 14, 18, 24, 32, 48, 96 (saves ~70KB)
- Subset Fraunces to ~40 chars (uppercase + lowercase + punctuation used in Brief clauses + Monthly Update headlines + /changelog editorial titles + binding lines): saves ~375KB
- Total font payload: 225KB → 85KB (140KB saved per cold load)
- Build config in `apps/web/next.config.js` font subset + `next/font` variable axis

### Status vocabulary lock — 14 canonical terms
Add to `apps/web/src/lib/status-vocab.ts` + ESLint rule `@beamix/no-banned-status-synonyms`:

| Canonical | Banned synonyms |
|-----------|-----------------|
| Acting | Active, Live, Running |
| Idle | Resting, Waiting |
| Pending | Queued, In progress |
| Blocked | Stuck, Stopped |
| Done | Complete, Finished |
| Failed | Error, Broken |
| (8 more) | (...) |

(Full table in `BOARD2-linear-v2.md` §6)

### Block primitive interfaces — TypeScript
Per Notion's hybrid recommendation (architect now, ship at MVP-1.5+):

```typescript
// apps/web/src/blocks/types.ts
export interface BeamixBlock<TData> {
  id: string;
  type: BlockType;
  data: TData;
  layout: { col: number; row: number; w: number; h: number; };
}

export type BlockType =
  | 'activity-ring' | 'sparkline' | 'cartogram' | 'brief-clause'
  | 'agent-row' | 'inbox-row' | 'receipt' | 'competitor-row'
  | 'twilio-number' | 'status' | 'small-multiples' | 'workflow-canvas'
  | 'monthly-update' | 'evidence-strip' | 'rivalry-strip' | 'cycle-bell'
  | 'narration-column' | 'crew-grid';
```

18 primitives spec'd in `BOARD2-notion.md` §1.

### Speed CI gate
GitHub Actions workflow runs Playwright + Lighthouse on every PR. Fails on:
- /home boot >100ms warm OR >400ms cold
- /scans paint >150ms warm
- /workspace step expand >80ms perceived
- Bundle size per surface (/home ≤95KB, /scans ≤110KB, Workflow Builder ≤220KB)

Workflow file: `.github/workflows/speed-gate.yml`

### Cream-paper-stays-light partition
Document in design system: 8 surfaces stay cream/light forever (Brief, Monthly Update, /changelog, /trust/*, Onboarding, /reports, OG share cards, /state-of-ai-search). 6 admin-utility surfaces ship dark mode at MVP+30 (/home, /inbox, /scans, /workspace, /crew, /competitors, /settings, Workflow Builder).

Dark token additions per `BOARD2-linear-v2.md` §4: 12 dark tokens including `--color-paper-elev-dark`, `--color-ink-1-dark`, `--color-brand-blue-dark` (#5A8FFF).

---

## OUTSTANDING ADAM-DECISIONS

1. **R2-18:** Confirm State of AI Search timing — MVP+90 (research recommendation) OR MVP launch (Stripe v2 alternative).
2. **R2-19:** Confirm composability scope at MVP — /reports + Workflow Builder Inspector only (Notion hybrid recommendation) OR broader.
3. **8 prerequisites still owed** (from prior session): Inngest keys, Supabase staging connection, DNS access, DPA indemnification cap, E&O insurance status, Workflow Builder full-DAG re-confirmation, GitHub OAuth credentials, exactly-2-MVP-verticals confirmation.

---

## NEXT SESSION INHERITANCE

The next session should:
1. **Write consolidated PRD v4** that folds v3 + this amendments doc + the 12-unanswered-questions doc into a single canonical PRD v4 file (~150K — will need careful structuring)
2. **Update Build Plan v1 → v2** with the 7 new features (F41-F47) + Tier 0 design-system canon additions
3. **Get Adam's confirmations** on R2-18 + R2-19 + the 8 prerequisites
4. **Begin build** — Tier 0 starts with the design-system canon additions (named curves, ESLint rules, variable Inter, speed CI gate)

---

*End of PRD v4 amendments. Read-along with `2026-04-28-DESIGN-BOARD-ROUND2-3-SYNTHESIS.md`.*

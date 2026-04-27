# Audit 1 — Cross-Spec Consistency

**Date:** 2026-04-27
**Auditor:** CEO consistency pass over the 9 Frame 5 v2 specs
**Inputs:** PRD, Design System, /home, /onboarding, /crew, Editorial, /inbox+/workspace, Marketplace, /scans+/competitors, Frame 5 v2 LOCKED
**Total spec volume audited:** ~83,000 words across 10 documents

This is a build-readiness audit, not a critique. The 9 senior agents produced strong, internally-coherent specs. The contradictions below exist because the specs were drafted in parallel with overlapping but non-identical inputs (some agents read Master Designer's seat-2 as canonical "11 colors / 18 agents", some read PRD as canonical "6 MVP agents", some read Editorial as canonical "default-public"). They must be resolved before the build-lead estimates engineering tickets, or the build will encode the wrong defaults.

---

## 1. Contradictions found

### 1.1 — BLOCKER — Default-public vs default-private Monthly Update permalinks

| Spec | What it says |
|---|---|
| Frame 5 v2 LOCKED §"LOCKED" | "Default-private permalinks (Customer Voice's deal-breaker; Adam locked)" — applies to all customer-specific permalinks |
| Editorial spec §3.2 | "By default it is **public** — Monthly Updates are designed to be forwarded. (Sarah can flip a per-report privacy switch in /reports settings if she wants this one private; the default is public to preserve the forwarding mechanic.)" |
| /scans spec §A2.8 | "Default-private permalinks — the lock... explicit-share is a deliberate act, not a default." |
| PRD Story 5.1 | "the public permalink is available (but **private by default** — the customer must explicitly share)" |

**Impact:** The Editorial Designer overrode Adam's Frame 5 v2 lock. Three other docs preserved the lock. Without resolution, the Monthly Update will ship public-by-default while /scans, the PRD, and the locked Frame all assume private-by-default. The Build Index already flags this as Conflict 1.

**Recommended resolution:** Honor Adam's lock — default-private with an explicit "Generate share link" gesture. The forwarding mechanic survives because (a) the email itself contains the artifact (the customer can forward the email), (b) the PDF attachment is shareable file-system-style, and (c) the share flow takes one click. Update Editorial §3.2 and the PDF generation job to flip the default. Severity: **BLOCKER** — affects auth middleware, the report URL generator, the Inngest job, and email copy.

### 1.2 — BLOCKER — Agent count: 6 / 11 / 18 across specs

| Spec | Stated agent count |
|---|---|
| PRD Feature 7 | "6 agents ship at launch" — the canonical MVP roster |
| PRD §"Out of Scope" | "6 of the 6 MVP agents ship; 5 additional agents are Year 1" |
| Design System §2.4 + §8.5 | Color table specifies 7 named agents + "remaining cycle through palette" — implies more than 6 but doesn't say how many |
| /crew spec §1, §2.1, §2.5 | "**18 agent monograms as a typographic grid**", "18 agents · 11 active · 4 paused · 3 locked" — and lists 18 agents by name |
| /home spec §2.3 + §3.5 | "Build plan · 6 engines · 8 agents" / "Scale plan · 11 engines · 18 agents" / Crew at Work strip = 18 monograms |
| /onboarding §2.5 | Step 3 Brief mentions **3 / 8 / 18** agents per tier (Discover/Build/Scale) |
| /inbox §A2 | "Per-agent (a roster of the **11 agents** with monogram + name)" — and §"From /home": "the 11 agent monogram circles" |
| /scans spec §A3 | "anchored to current **11 MVP-1 roster**" |
| Marketplace §0 + §2.1 | "the **5 first-party agents**" + "internal Beamix agents (the **11 first-party**)" — internally contradicts itself |

**Impact:** Five distinct numbers in play (5 / 6 / 8 / 11 / 18). The PRD says **6 ship at MVP**. Design System / /crew / /onboarding / /home use **18** as the visible count. /inbox + /scans assume **11**. Marketplace alternates between 5 and 11. This is the single most disruptive inconsistency in the bundle — every monogram count, every "X agents" tier-badge string, every Crew at Work strip, every onboarding step, every Brief-template render needs one canonical source.

**Recommended resolution:** Adopt a strict three-tier numbering, write it once, link from every spec:
- **MVP roster (ship at launch):** 6 agents per PRD Feature 7. Set in stone.
- **Visible-on-/crew at MVP:** 6 active rows + locked rows for the rest of the 18 (the "yearbook" remains 18 monograms, but only 6 are unlocked). This preserves /crew's visual signature without contradicting the PRD.
- **Full vision:** 18. Only referenced in marketing/strategy copy, never in product UI strings.
The /home tier badges become "Discover · 3 engines · 4 agents / Build · 6 engines · 6 agents / Scale · 11 engines · 6 agents (+ 12 locked)" or a cleaner "Scale · 11 engines · full crew." Update /onboarding Step 3 Brief tier mapping (currently 3/8/18) to match. Update /inbox's "11 agents" to match. Update Marketplace §2.1 ("11 first-party") to match. Update Build Index. Severity: **BLOCKER**.

### 1.3 — BLOCKER — /crew layout: card-grid vs table-grammar

| Spec | What it says |
|---|---|
| Master Designer (per Frame 5 v2 reference) + Design System §6.3 implication | Yearbook of 18 agent monograms in a "typographic grid" |
| /crew spec §2.5 | "Single column of rows, not a grid. The previous board's '3-column card grid' idea is **explicitly rejected here** — Yossi needs to scan 18 rows quickly" |
| /crew spec §1 | Calls /crew "a roster of named operators reporting to you" — payroll metaphor, not yearbook |

**Impact:** Senior Designer C explicitly rejected the Master Designer's grid metaphor mid-spec. The /crew header still says "the roster page itself, when you squint, reads like a yearbook" (§1, internal contradiction with §2.5). Build can't ship both.

**Recommended resolution:** Lock to the table grammar (§2.5). The yearbook moment becomes a ceremonial first-impression on the empty/first-load state and the per-agent profile-page header (§3) — not the default rendering. Update §1 prose to remove "yearbook." Severity: **BLOCKER** for /crew.

### 1.4 — SHOULD-FIX — Cream-paper register (`#F7F2E8`) usage scope

| Spec | What it says |
|---|---|
| Design System §1.1 + §6 | "**Reserved strictly for**: Brief background, Monthly Update PDF, /scan public hero section, email digest header strip (32px), OG share card. Never used on product UI chrome." |
| Design System §6.1 (Editorial Artifact register) | Adds /scan public + Brief (onboarding step 3) + Monthly Update + email digest header + OG share card |
| /onboarding §2.0 + §2.3 | Step 3 background changes to `paper-cream` for the entire Brief approval ceremony — matches Design System |
| Editorial spec §1 + §2 + §3 | Cream applies to all of /scan, the Monday Digest header strip, and the entire Monthly Update PDF + permalink — matches |
| Editorial §3.2 web permalink | "Same cream-paper background" — the Monthly Update web permalink is fully cream. This is consistent with §6.1 listing "Monthly Update PDF" but the web permalink is product chrome territory; the spec extends cream to a permalink page that lives at app.beamix.tech |
| /scans spec §A2.6 + §A4 | The /scans table is white (Data Intelligence register) — but per-scan detail page hero strip and share permalink page use cream. Spec is internally consistent but the "Monthly Update permalink is on app.beamix.tech" plus "scan permalink is on beamix.tech/s/" creates an unstated rule: cream is allowed on customer-shareable artifact pages even when those pages live in the product app domain. |

**Impact:** The Design System's "never on product UI chrome" rule has a hole the size of "shareable permalink pages." Build needs to know whether a permalink page that lives at `app.beamix.tech/reports/[id]` counts as product chrome (white) or artifact (cream). Editorial says cream. Design System §1.1 doesn't list permalink web pages explicitly.

**Recommended resolution:** Add a rule to Design System §1.1: "Cream applies to artifact surfaces regardless of host: Monthly Update permalink web page, /scan public permalink, Brief permalink (if shared) all render cream. Product chrome (sidebar, topbar, dashboard tables) remain white. The host is irrelevant; the *register* of the page is what determines paper color." Severity: **SHOULD-FIX** — affects ~3 routes' background tokens.

### 1.5 — SHOULD-FIX — 4-mark sigil placement contradictions

The Ring, Trace, Seal, Margin are each spec'd in Design System §2 and referenced in 6+ docs. Several mismatches:

**The Ring:**
- Design System §2.1: "/home above-fold (primary, live, pulsing). /scan public hero. Monthly Update PDF header (static). OG share card. Marketing site hero." Plus "Never... in /inbox items."
- /crew §1.3 (visual register): "The Activity Ring does *not* appear on /crew" — consistent.
- Editorial §3.1 Page 1 cover + §3.2 web permalink: Ring at 96px on Monthly Update, drawn over 1500ms on web permalink. Consistent.
- /home §2.2.1: 200px Ring with full pulse + cycle-close logic — consistent.
- ✓ No contradiction here, but verify: /onboarding's Step 5 magic moment includes a Ring draw on /home boot (§"5500ms" entry). Consistent with §2.1's "/home first load" trigger.

**The Trace:**
- Design System §2.2: appears under text Beamix touched ≤24h on /home, /competitors Rivalry Strip editorial summary, /inbox filter label, /workspace step output. **NEVER on /scans table data, /settings, /schedules.**
- /scans §A2.7: explicitly says no traces on closed table rows; only inside the row expansion. Consistent.
- /home §2.1, §2.2.4, §3.1: traces under nouns. Consistent.
- /inbox §A2: not described as appearing on the inbox item list rows. Per Design System §2.2, it should appear on "filter label when an agent just acted" — `/inbox` spec doesn't implement this. **Minor drift.**
- ✓ Mostly consistent.

**The Seal:**
- Design System §2.3: contexts include Brief approval, Inbox approve hover, Monthly Update PDF (top + bottom), OG share card, /scan public footer, Monthly Update email header. **Never on buttons as state indicator.**
- /home spec §2.4: "A tiny Rough.js seal mark (16×16) appears 8px to the left of the button text on hover, drawing itself in 200ms." — This IS a Decision Card "Review" button. **Contradicts §2.3 "never on buttons as state indicator"** unless we read it as "foreshadowing the artifact about to be authored." The /home spec admits this is "the §2.2 /inbox Approve-button move pulled forward to /home." So there are TWO buttons getting Seal hover treatment (Decision Card on /home; Approve in /inbox), neither of which is listed in Design System §2.3's contexts table. **SHOULD-FIX.**
- Editorial §3.1 Page 6: Seal is 48×48 — but Design System §2.3 sizes table caps at 32px. **Drift.**

**The Margin:**
- Design System §2.4: 24px wide, agent-fingerprint marks accumulate over time. Listed contexts: /scans rows, /workspace step list, Monthly Update PDF, Monday Digest email, /home "Receipts" section, /competitors rows. **Minor:** /inbox is not listed in §2.4 but appears in Editorial as cream-header strip uses Margin (16px on email).
- /home spec §2.5 Evidence Strip: "Margin column on the left edge of each card: 4px-wide vertical strip in the agent's color (subtle — agent identity without naming the agent externally; Master Designer §2.4 Margin treatment compressed)." — This is **4px**, not 24px. /home spec acknowledges this is a "compressed" Margin. **Design System §2.4 doesn't authorize a compressed variant.**
- /crew spec §2.5 column 1: Margin = 24px — consistent.
- /scans §A2.4 Margin = 24px — consistent.

**Impact:** Three real drifts (Trace not on /inbox filter labels; Seal on /home and /inbox buttons; Margin compressed to 4px on /home Evidence Strip; Seal at 48px on Monthly Update closing page). None are catastrophic but they break the "the system enforces itself" promise of the Design System.

**Recommended resolution:** Add to Design System §2: (a) explicit Seal-on-button-hover variant (16×16 on Decision Card and /inbox Approve hover, foreshadowing-only animation); (b) explicit Margin variant table — 4px compressed (Evidence Cards), 16px (email), 24px (canonical); (c) update Seal max-size to 48px (Monthly Update bottom). Update §2.2 to add /inbox filter label trace as one of the listed contexts. Severity: **SHOULD-FIX**.

### 1.6 — SHOULD-FIX — Page max-widths

| Spec | Width |
|---|---|
| Design System §1.3 | /home 1180 / /scans, /competitors, /crew table 1340 / /inbox 880 / Brief 720 / Monthly Update permalink 720 / /workspace 1300 |
| /home §2 | content max 1180 ✓ |
| /crew §2.1 | "Page max-width: **1340px**" ✓ |
| /scans §A2 | "Page max-width: **1340px**" ✓ |
| /inbox §A2 | Total "1280 plus 80px outer margins" — content lock at 1280, **not 880**. Design System says /inbox = 880. **CONTRADICTION.** The /inbox spec's 1280 makes sense (3-pane Linear-pattern needs the width); the Design System's 880 looks like a transcription error. |
| /onboarding §2.0 | "max-width 640px... 720px on Step 3" ✓ — onboarding isn't in the Design System table |

**Impact:** /inbox built to 880 vs 1280 is the difference between a usable consent surface and a cramped one.

**Recommended resolution:** Update Design System §1.3 to read /inbox = 1280 (matching the /inbox spec). Severity: **SHOULD-FIX**.

### 1.7 — SHOULD-FIX — Marketplace install caps and tier-gating wording

| Spec | Discover access |
|---|---|
| PRD Feature 17 | Marketplace appears at MVP "(constrained form)... a browsable catalog of Beamix-authored additional agent workflows." Tier mention absent. |
| Marketplace §1.4 | "Free / Discover: Read-only, blurred install CTA. No install. Build: up to 3. Scale: unlimited." |
| /crew §1.3 | "the in-app upgrade modal opens (handled by /settings/billing), pre-scoped to the Scale tier with that specific agent highlighted" — but Marketplace §1.4 says install requires Build, not Scale. |

**Impact:** /crew assumes locked agents = Scale. Marketplace says install starts at Build. Customer click on locked /crew row → upgrade modal shows wrong tier.

**Recommended resolution:** Marketplace spec is canonical (§1.4). Update /crew §1.3 (and §2.8) to say Build for marketplace agents and Scale for the 12 locked first-party agents (Voice/Visual/Atlas/etc.). Severity: **SHOULD-FIX**.

### 1.8 — SHOULD-FIX — Monogram color contradiction with anti-pattern rule

| Spec | What it says |
|---|---|
| Design System §2.4 | "Schema Doctor: #6366F1, Trend Spotter: #8B5CF6" — assigns purple hexes to specific agents |
| Design System §7 (Anti-patterns) | "**AI-purple.** No `#6366F1`, no `#8B5CF6` as a brand accent. These were retired in BRAND_GUIDELINES v4.0. The only accent is `#3370FF`." |

**Impact:** The Design System contradicts itself within one document. Schema Doctor is officially #6366F1 in §2.4 and officially banned in §7. Build will pick one and ship it; we should pick on purpose.

**Recommended resolution:** §7's "no AI-purple as a brand accent" is the right rule for chrome. The Margin marks are *data surfaces* (per §1.1's brand-rule), not chrome. Add a clarification in §7: "The AI-purple ban applies to chrome only. Data-surface usage on the Margin agent-color palette is permitted because it's contained, never appears on buttons, and signals data not action." Severity: **SHOULD-FIX**.

### 1.9 — SHOULD-FIX — Onboarding step labeling: 4 steps vs 4 steps + 4.5 attribution wizard

| Spec | What it says |
|---|---|
| /onboarding spec | 4 steps: Confirm / Attribution / Brief / Truth File |
| PRD Feature 12 | "Attribution setup wizard in onboarding (**optional step 4.5** — customer can skip but is nudged)" |

**Impact:** Step numbering disagrees. /onboarding has attribution at Step 2; PRD has it at "Step 4.5". This is a contradiction in flow ordering, not just naming.

**Recommended resolution:** /onboarding's design (Step 2 = attribution) is correct because it puts the renewal-mechanic hardware in the customer's hand *before* the Brief — which is the design intent. Update PRD Feature 12 to say Step 2. Severity: **SHOULD-FIX**.

### 1.10 — NICE-TO-HAVE — "Brief replaces Standing Order" language inconsistency

Frame 5 v2 §"Structural improvements (from Board 2, kept)": "**Brief** (Beamix-authored, customer-approved) replaces Standing Order." All 9 specs use "Brief." None use "Standing Order." ✓ Already resolved.

### 1.11 — NICE-TO-HAVE — Voice rule violation watch (single-character "Beamix")

Frame 5 v2 lock: "Single-character externally; 11+ agents only in /crew for power users." Search across specs:
- Editorial §3.1 Page 4: "signed at the entity level as 'Beamix' — 'Beamix added,' 'Beamix fixed' — Never 'Schema Doctor added.'" ✓
- Monday Digest §2.3: rules verbatim ✓
- /inbox §A2 row anatomy: "the row never says 'Schema Doctor said'; it says '*Citation Fixer worked on this*' — attribution, not voice. Voice is always Beamix." ✓ — clever distinction, build must respect it.
- /workspace strings (§"Cross-referencing with Truth File…"): voice is Beamix-direct ✓
- /crew is the only surface where agent names appear externally — by design ✓
- ✓ No drift, but Build needs an external-voice linter or the rule will erode.

---

## 2. Gaps found

### 2.1 — BLOCKER — Brief schema is not canonically defined

The Brief is referenced in 7 specs as a structured object with chips:
- /onboarding §2.3 lists 6 chip types (vertical_focus, engines, geography, query_pattern, competitors, voice_constraint).
- PRD Feature 2: "Brief editing uses chip menus (no free-form text in v1), covers: primary location, service/product category, target customer, top 3 competitors, content tone."
- /inbox §A2 references Brief clauses (e.g., 'show up for emergency-plumbing queries').
- /home §3.6 Goal Track shows progress against Brief clauses.
- /settings has a Brief tab (Design System §6.4) with version history.

**Gap:** Nowhere is the Brief's JSON schema written. Onboarding's 6 chip types ≠ PRD's 5 fields. The /inbox quote-form ("show up for emergency-plumbing queries") is a derived sentence, not a chip value. Without a canonical schema, three engineers will write three different DB tables.

**Recommended action:** Architect (build-lead) writes `briefs` table schema + Zod schema before any Brief UI is built. Reference it from PRD, /onboarding, /inbox, /home Goal Track, /settings Brief tab. Severity: **BLOCKER**.

### 2.2 — BLOCKER — House Memory is referenced but not defined

- /inbox §A2: "the agent's House Memory records the rejection..."
- /inbox §A6 Margin Note: "Notes enter House Memory; agents read them on subsequent runs."
- Frame 5 v2 §L1: "Customer Knowledge Layer (Truth File, Brief, House Memory, Brand Voice Fingerprint)"
- /workspace §"Reference steps": "consulting House Memory, citing the Brief"

**Gap:** No spec defines House Memory's schema, what's in it, who writes to it, what "agents read it" means in retrieval terms (vector? structured query? RAG?), or how it interacts with the Truth File. The PRD doesn't list House Memory as an MVP feature explicitly.

**Recommended action:** Define before MVP — even if it's "v0 = a simple per-agent note table." Severity: **BLOCKER** because /inbox spec's interactions assume reads/writes that don't have a backend.

### 2.3 — SHOULD-FIX — Email infrastructure beyond Monday Digest + Monthly Update

PRD Feature 14 lists 3 email types (Monday Digest, event-triggered, Monthly Update). Editorial spec covers Monday Digest + Monthly Update fully. Event-triggered emails are listed in PRD but not designed:
- "scan completed"
- "new /inbox item requiring review"
- "Lead Attribution first call received"

**Gap:** No template, no copy register, no send-conditions for event emails. Frame 5 v2 §"Hybrid email cadence" mentions "Monday Digest + event-triggered + Monthly Update + Quarterly + Annual." Quarterly + Annual are not specified anywhere.

**Recommended action:** Editorial Designer ships v1.1 covering event-triggered emails (5–7 templates) + a placeholder for Quarterly/Annual. Severity: **SHOULD-FIX**.

### 2.4 — SHOULD-FIX — Lead Attribution Loop end-to-end thread

Numbers issued in /onboarding Step 2 → appear on /home above-fold lead-attribution headline → headline drives renewal in Monthly Update → Monday Digest tier-gates lead-attribution block (Build+) → /settings has a "Phone numbers tab" (Design System §6.4) → /home empty state has "Connect a number →" link.

**Gap:** The /settings → Phone numbers tab is mentioned but not specified. The "what happens if customer has no Twilio numbers" empty states differ across surfaces:
- /home §2.1 empty: "Lead attribution: starts collecting data 24 hours after you connect a tracked phone number. Connect a number →"
- Monday Digest tier variations §2.5: Discover gets no attribution block at all (different from "empty number" — it's "tier-gated")
- Monthly Update Editorial §3.1 Page 2: Discover gets a *different page* ("WHAT YOU SHIPPED")

So three states exist: (a) attribution disabled (Discover), (b) attribution enabled but no calls yet, (c) attribution enabled with data. No spec lays them out as a clean state machine.

**Recommended action:** Build-lead writes the 3-state matrix into Architecture doc; references from /home, Monday Digest, Monthly Update sections. Severity: **SHOULD-FIX**.

### 2.5 — SHOULD-FIX — Trust Architecture review-debt thresholds

PRD §"Open Q5": "amber at 5 pending items, red at 10. Confirm before design implementation."
/inbox spec §A2 implements: "yellow/notice state (3–4 items un-reviewed for 1–4 days)... red/active state (5+ items, >5 days)."

**Gap:** PRD Q5 says amber=5, red=10 (single-axis: count). /inbox implements amber=3 (count) AND 1–4 days (time), red=5 (count) AND 5+ days (time). The /inbox version is two-axis; the PRD's open question assumes one-axis. They are not the same proposal.

**Recommended action:** Adam picks. /inbox's two-axis is more nuanced; PRD's single-axis is simpler. Either is fine; build needs ONE. Severity: **SHOULD-FIX**.

### 2.6 — NICE-TO-HAVE — `/test-harness` (AI Engine Test Harness) not in any v1 spec

Frame 5 v2 §"Tier 4" lists `/test-harness` as a free public surface. PRD doesn't include it (deferred to Tier 4 / Year 1). All 9 detailed specs ignore it. ✓ Consistent with Tier 4 deferral, but the build-lead should confirm it's not in MVP.

---

## 3. Missing connections (specs that should reference each other but don't)

### 3.1 — Crew at Work strip on /home references 18 agents; PRD only ships 6

/home §3.5: "Crew at Work strip — 18 agent monogram circles." Crosswalk: PRD Feature 7 says 6 agents at MVP. So /home ships an 18-monogram strip with 12 grayed/locked monograms? /home spec doesn't say. **Connect /home §3.5 → PRD Feature 7 + /crew tier-locked agents §2.8.**

### 3.2 — Marketplace Truth File enforcement references Architect spec sections that aren't visible to agents

Marketplace §2.5 + §2.6 cite "Architect §239–240, §220–240, §277–284." These are sections of the Board 3 Architect document, not the Marketplace spec. Build engineers reading Marketplace need to read the Architect board file to understand the provenance envelope. **Connect Marketplace §2.5 → an inlined provenance-envelope schema, OR a canonical "provenance.ts" type doc.** Otherwise Architect's pre-MVP "Trust Architecture spec" (Frame 5 v2 Tier 0) becomes a single-source document that everyone implicitly depends on.

### 3.3 — Monthly Update PDF generation in Inngest job is not cross-linked from PRD

Editorial §3.3 specifies React-PDF + Inngest job for the Monthly Update. PRD Feature 14 mentions Monthly Update but doesn't pin the technology. Build risk: backend developer reads PRD only and uses Puppeteer; the Inngest job is the canonical implementation per Editorial. **Connect PRD Feature 14 → Editorial §3.3.**

### 3.4 — Onboarding's "first agent run is queued automatically" doesn't say which agent

PRD Feature 2 acceptance: "After approval: first agent run is queued automatically." /onboarding §"5500ms — Crew at Work strip" shows monograms appearing but doesn't name which agent runs first. /home §"Empty state (rare — first-day user)" shows an empty Evidence Strip with copy "First evidence appears within 6 hours." The 3 specs imply an agent runs but no spec says which (Schema Doctor by default? Reporter for first scan? Citation Fixer for first finding?). **Connect /onboarding § → PRD Feature 7 → /home empty state.** Recommended default: Schema Doctor (lowest-risk, highest visibility).

### 3.5 — Brief changes are referenced as triggering re-validation in /inbox but not in /onboarding or /settings

/inbox toast text: "Beamix won't propose this again unless your Brief changes." — implies Brief is mutable post-onboarding. /settings spec mentions "Brief tab (full Brief with version history)" (Design System §6.4). /onboarding doesn't say what happens to the Brief after onboarding. **Connect /inbox → /settings Brief tab → Brief schema (gap 2.1).** Versioning needs to be in the Brief schema.

### 3.6 — Tier-gating engine names: "3 engines" on Discover not specified anywhere

PRD Q4: "Discover ($79) is specified as '3 engines' but it is not defined which 3. The highest-signal choice is ChatGPT, Perplexity, and Google AI Overviews — the three with the highest reach." No spec locks this. Onboarding Brief generation, /home per-engine strip, and /scans engine filter all need to know.

**Recommended:** Lock the 3. Severity: **SHOULD-FIX**.

---

## 4. Severity summary

| ID | Issue | Severity |
|---|---|---|
| 1.1 | Default-public Monthly Update | **BLOCKER** |
| 1.2 | Agent count 6/11/18 | **BLOCKER** |
| 1.3 | /crew card-grid vs table | **BLOCKER** |
| 2.1 | Brief schema undefined | **BLOCKER** |
| 2.2 | House Memory undefined | **BLOCKER** |
| 1.4 | Cream-paper scope | SHOULD-FIX |
| 1.5 | Sigil placement drift | SHOULD-FIX |
| 1.6 | /inbox max-width 880 vs 1280 | SHOULD-FIX |
| 1.7 | Marketplace tier wording | SHOULD-FIX |
| 1.8 | Monogram purple hexes | SHOULD-FIX |
| 1.9 | Onboarding step ordering | SHOULD-FIX |
| 2.3 | Event-triggered emails | SHOULD-FIX |
| 2.4 | Lead Attribution states | SHOULD-FIX |
| 2.5 | Review-debt thresholds | SHOULD-FIX |
| 3.1, 3.2, 3.3, 3.4, 3.5, 3.6 | Cross-spec connections | SHOULD-FIX |
| 1.10, 1.11, 2.6 | Voice/test-harness | NICE-TO-HAVE |

**5 blockers, 13 should-fix, 3 nice-to-have.**

---

## 5. Top 5 action items for the next CEO

1. **Lock the agent-count canon (5 minutes of decision, ~2 hours to propagate).** Adam decides: 6 MVP / 18 visible / 18 full vision — or some variant. Then sweep all 9 specs to use the canonical numbers in product UI strings (tier badges, Crew at Work strip count, Brief tier mapping, /inbox per-agent filter, Marketplace "first-party" count). This is the single highest-leverage fix because it touches every visible-to-customer count.

2. **Confirm Adam's default-private permalink lock — no Editorial Designer override.** Update Editorial §3.2 + Build Index Conflict 1 to honor Frame 5 v2's "default-private" lock. The forwarding mechanic survives via PDF attachment + email-borne artifact. If Adam wants to reverse the lock, that's a Frame 5 v2 amendment, not a spec-level decision.

3. **Brief schema + House Memory schema written before any UI build starts.** These are the two missing canonical data structures. Hand to build-lead → architect (or directly to backend-developer) for v0 schemas + Zod types. Without them, /onboarding Step 3, /settings Brief tab, /inbox Brief-clause references, /workspace "consulting House Memory," and /inbox Margin Notes are all building on sand.

4. **/crew layout: Adam picks card-grid (Master Designer's yearbook) or table (Senior Designer C's payroll).** Both can't ship. Recommend: table grammar wins (it serves Yossi's daily volume better; it's what 80% of /crew sessions actually need); the yearbook becomes ceremonial (empty state + per-agent profile-page header). Update /crew §1 prose to remove "yearbook" framing.

5. **Add a "Cross-spec contracts" section to the Build Index.** A single canonical reference for: agent count by tier, default permalink privacy, page max-widths, sigil sizes by context, cream-paper allowed surfaces, tier-gating thresholds (Discover engine list, Marketplace install caps, Monday Digest blocks, /inbox filters, /scans engine columns). Today these contracts live scattered across 9 docs; build will encode whatever the engineer happened to read first. One canonical contracts page closes that gap.

---

## Closing note

These specs are good. They are detailed, opinionated, and largely internally coherent. The contradictions above are a normal consequence of running 9 senior agents in parallel against overlapping inputs — a single-author monolith would have fewer contradictions and far less depth. The right next move is a 1-hour synthesis pass by the CEO + 1 designer + 1 architect, locking the 5 blockers above. Then build can start with confidence.

The one warning: the agent-count contradiction (1.2) and the Brief/House Memory schema gaps (2.1, 2.2) are not "polish later" issues. They are the central nervous system of the product — every page connects to them. They have to be locked first.

*End of Audit 1.*

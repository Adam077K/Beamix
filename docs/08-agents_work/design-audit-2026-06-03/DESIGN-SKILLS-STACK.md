# Design-Craft Skills Stack — Anti-AI-Generic Audit

**Date:** 2026-06-03
**Author:** design-skills audit (CEO-dispatched)
**Problem statement:** Founder says product UI/UX reads "AI-generated / vibe-coded." Root cause: frontend builders write competent but *generic* code — no taste heuristics, no reference-gathering, no anti-slop discipline. This audit finds every skill that encodes real design taste, craft, and anti-generic enforcement, and prescribes exactly which to load, when, and by whom.

**Skill location note:** MANIFEST.json lists paths as `.agent/skills/...` but the live files are at `.claude/skills/<name>/SKILL.md`. All skills below were read from the live `.claude/skills/` directory.

---

## 1. The "Anti-AI-Generic" Core (ranked, 7 skills)

These are the highest-leverage skills that DIRECTLY counter the vibe-coded look. Load these first; everything else is supporting cast.

| Rank | Skill | Why it counters generic output (one sentence) |
|------|-------|------------------------------------------------|
| **1** | **`design-taste-frontend`** | The single most complete anti-slop engine — it names the exact LLM design biases (Inter, "AI purple", centered heroes, 3-equal-card rows, neon glows, "John Doe", `99.99%`, "Elevate/Seamless") and bans each with a concrete replacement, plus tunable Variance/Motion/Density dials and React/RSC architecture rules. This is the spine. |
| **2** | **`high-end-visual-design`** | Encodes the *physical-craft* layer LLMs skip entirely — Double-Bezel nested cards, button-in-button CTAs, custom cubic-bezier motion, macro-whitespace (`py-24`+), staggered mask reveals — the details that make UI read "$150k agency" instead of "template with nice fonts." |
| **3** | **`beamix-brand-quality-bar`** | The taste skills above are generic; THIS one binds them to Beamix's locked palette (#3370FF), type system (InterDisplay/Inter/Fraunces/Geist Mono), 8pt grid, and animation budget — and it's enforced by design-critic as a hard BLOCK on retired colors. Prevents "distinctive but off-brand." (Note: it permits Inter as the brand font, which the generic taste skills ban — Beamix bar wins on conflict.) |
| **4** | **`redesign-existing-projects`** | The audit-and-fix playbook for *existing* code — a 100+ item diagnostic checklist of generic AI fingerprints with targeted upgrades and a risk-ordered fix priority. This is the skill that fixes the product we already shipped, not a greenfield build. |
| **5** | **`frontend-design`** | Forces an explicit, named aesthetic *thesis* before any code ("editorial brutalism", "luxury minimal") via the DFII scoring gate and a "differentiation anchor" requirement — counters the rootless, opinion-free output that reads as AI default. |
| **6** | **`emilkowal-animations`** | 43 prioritized motion rules (ease-out default, <300ms, scale-0.97 press, spring physics, never scale-from-0, reduced-motion) from Sonner/Vaul's author — motion is where vibe-coded UIs most obviously betray themselves, and this is the deepest motion-craft reference available. |
| **7** | **`humanizer`** | Strips the *verbal* AI tells from every string of UI/marketing copy (em-dash spam, rule-of-three, "Elevate/Seamless", title-case headers, emojis, sycophancy) — a polished UI with slop microcopy still reads AI-generated, so this closes the loop. |

**The insight:** taste is not one skill. It's a stack — *direction* (frontend-design) → *craft heuristics* (design-taste-frontend + high-end-visual-design) → *brand binding* (beamix-brand-quality-bar) → *motion* (emilkowal-animations) → *copy* (humanizer) → *audit* (redesign-existing-projects). Load the layer the task needs; never just one.

---

## 2. Full Categorized Table (by phase)

### Phase A — RETHINK / TASTE (set direction, override LLM defaults)

| Skill | What it contains | Load for |
|-------|------------------|----------|
| `frontend-design` | Named-aesthetic mandate, DFII feasibility/impact scoring, "differentiation anchor", anti-template restart rule. | design-lead, product-designer |
| `design-taste-frontend` | Master anti-slop engine: AI-bias correction rules, Variance/Motion/Density dials, RSC architecture, AI-tells blacklist, high-end "creative arsenal." | design-lead, frontend-engineer, product-designer |
| `high-end-visual-design` | Awwwards-tier craft: Double-Bezel cards, button-in-button CTAs, variance archetypes, motion choreography, pre-output checklist. | design-lead, frontend-engineer |
| `minimalist-ui` | Editorial/Notion-style direction: warm monochrome, muted pastels, flat bento, crisp 8–12px radii, no gradients/heavy shadows. | design-lead (when the chosen direction is editorial-minimal) |
| `beamix-brand-quality-bar` | Locked Beamix palette/type/spacing/animation budget + empty-state spec; enforced by design-critic. | ALL design + frontend roles (mandatory pre-flight) |
| `stitch-design-taste` | Generates a `DESIGN.md` that encodes the anti-slop taste rules in Stitch's semantic language for AI screen-gen. | design-lead (when using Stitch MCP) |

### Phase B — REFERENCE-GATHERING (steal taste from proven UIs)

| Skill | What it contains | Load for |
|-------|------------------|----------|
| `redesign-existing-projects` | Doubles as a reference lens: names the generic pattern and the premium alternative for every category (the "what good looks like" map). | design-lead, code-reviewer/design-critic |
| *(no dedicated reference-fetching skill — see Gaps)* | Reference imagery comes from **MCP tools**, not skills: Refero (UI reference patterns), Stitch (AI screen gen), Pencil (design files). | — |

### Phase C — BUILD / CODE-CRAFT (execute without going generic)

| Skill | What it contains | Load for |
|-------|------------------|----------|
| `design-taste-frontend` | (also a build skill) Concrete Tailwind/React rules: typography scale, color calibration, grid-over-flex-math, `min-h-[100dvh]`, interactive-state requirements. | frontend-engineer |
| `high-end-visual-design` | (also a build skill) Exact class recipes for bezels, CTAs, spacing, Bento 2.0 motion-engine cards. | frontend-engineer |
| `core-components` | Design-token discipline: never hard-code spacing/color/type; use semantic tokens + Box/Stack/Text/Button/Card primitives. | frontend-engineer |
| `react-ui-patterns` | Loading/empty/error/optimistic state patterns ("never show stale UI", "always surface errors", skeletons over spinners). | frontend-engineer |
| `react-patterns` | Modern React composition, hooks, perf, TS best practices. | frontend-engineer |
| `tailwind-design-system` | Design tokens + scalable component-library patterns in Tailwind. | frontend-engineer |
| `tailwind-patterns` | Tailwind v4 CSS-first config, container queries, token architecture. | frontend-engineer (v4 work) |
| `radix-ui-design-system` | Accessible headless primitives, compound-component + theming patterns for production UI libraries. | frontend-engineer |
| `nextjs-app-router-patterns` | Server Components, streaming, parallel routes, advanced data fetching. | frontend-engineer |
| `vercel-react-best-practices` | Vercel-eng React/Next perf + bundle optimization. | frontend-engineer |
| `vercel-composition-patterns` | Component composition patterns that scale (avoid prop-drilling/god-components). | frontend-engineer (refactors) |
| `full-output-enforcement` | Bans `// ...`, TODO stubs, skeleton-instead-of-implementation; enforces complete, runnable deliverables. | ALL workers (zero-stub guarantee) |

### Phase D — MOTION / POLISH

| Skill | What it contains | Load for |
|-------|------------------|----------|
| `emilkowal-animations` | 43 prioritized motion rules: easing, <300ms timing, transform/opacity-only, transform-scale-0.97, momentum dismiss, reduced-motion, toast stacking. | frontend-engineer, design-critic |
| `vercel-react-view-transitions` | Native View Transition API: shared-element, Suspense-reveal, list-identity, enter/exit, route transitions with graceful fallback. | frontend-engineer (page/route transitions) |
| `high-end-visual-design` §5 | (cross-listed) Choreography: staggered reveals, magnetic hover physics, scroll interpolation. | frontend-engineer |

### Phase E — UX-COPY

| Skill | What it contains | Load for |
|-------|------------------|----------|
| `humanizer` | Removes 25 categories of AI writing tells; adds voice/personality; final anti-AI audit pass. | frontend-engineer (UI strings), technical-writer, CMO |
| `copywriting` | Conversion-copy discipline: context-gathering gate, outcomes-over-features, one-CTA, no fabricated claims, testable copy. | CMO, product-designer (microcopy, empty states, CTAs) |
| `beamix-voice-canon` | Beamix Model B voice: when to name agents vs say "Beamix", no-AI-disclosure rule, banned buzzwords, HE+EN parity. | ALL roles writing user-facing text |

### Phase F — VALIDATION / QA (catch generic before merge)

| Skill | What it contains | Load for |
|-------|------------------|----------|
| `ui-visual-validator` | Skeptical screenshot-analysis gate: "goal NOT achieved until proven by visual evidence", design-token compliance, WCAG contrast, responsive-breakpoint verification, mandatory checklist. | design-critic, test-engineer |
| `web-design-guidelines` | Fetches Vercel's live Web Interface Guidelines and reviews UI code for compliance, `file:line` output. | design-critic, code-reviewer |
| `wcag-audit-patterns` | WCAG 2.2 audit: automated + manual checks, remediation guidance. | design-critic, test-engineer |
| `redesign-existing-projects` | (also a validation skill) Its diagnostic checklist is a ready-made "find the generic patterns" audit. | design-critic |
| `beamix-brand-quality-bar` | (also a validation skill) The BLOCK criteria design-critic enforces on color/type/spacing. | design-critic |

### Phase G — CONVERSION

| Skill | What it contains | Load for |
|-------|------------------|----------|
| `page-cro` | Page-level conversion diagnosis, prioritization, testable recommendations (not blind optimization). | CMO, product-designer |
| `onboarding-cro` | Post-signup activation, first-run experience, time-to-value optimization. | product-designer, CPO |
| `form-cro` | Friction reduction for lead/contact/checkout forms (non-signup). | product-designer, frontend-engineer |
| `marketing-psychology` | Behavioral-science mental models scored by leverage × feasibility for persuasive layout/copy. | CMO |

### Phase H — PROCESS / ORCHESTRATION (sequence the above correctly)

| Skill | What it contains | Load for |
|-------|------------------|----------|
| `design-orchestration` | Meta-skill: routes work brainstorm → risk-assess → multi-agent review → execution-readiness; blocks premature implementation. | design-lead, CEO |
| `multi-agent-brainstorming` | Structured sequential design review with hard role scopes (Designer/Skeptic/Constraint-Guardian/User-Advocate/Arbiter) + mandatory Decision Log; returns APPROVED/REVISE/REJECT. | design-lead (high-risk redesigns) |
| `brainstorming` | Single-agent disciplined design generation: Understanding Lock → Initial Design → Decision Log. | design-lead, product-designer |

---

## 3. The Recommended Workflow (concrete sequence)

The vibe-coded look comes from skipping RETHINK and VALIDATION. Reinsert both. Map skills to the agents that own each phase and to the MCP tools that pair with them.

### Step 1 — design-lead RETHINKS direction (before any code)
**Loads:** `frontend-design` + `design-taste-frontend` + `beamix-brand-quality-bar` + `minimalist-ui` (if direction is editorial)
**Process skill:** `design-orchestration` to gate the flow; `brainstorming` (or `multi-agent-brainstorming` for a full redesign) to lock an Understanding Lock + Decision Log.
**MCP pairing:**
- **Refero** (`refero_search_screens`, `refero_get_style`) — pull 5–10 reference screens of best-in-class GEO/analytics dashboards; extract their type/spacing/color stories.
- **Stitch** (`create_design_system_from_design_md` ← generated by `stitch-design-taste`, then `generate_screen_from_text`) — generate 2–3 premium screen directions to react to.
- **Pencil** (`get_guidelines`, `batch_design`) — if a `.pen` file exists, work the direction there first.
**Output:** a named aesthetic thesis + DFII ≥ 8 + a `DESIGN.md`/spec the builder cannot misread.

### Step 2 — product-designer / frontend-engineer BUILD
**product-designer loads:** `frontend-design` + `beamix-brand-quality-bar` + `copywriting`/`beamix-voice-canon` (for empty states, CTAs, microcopy).
**frontend-engineer loads (2–3 per task, per context budget):**
- Always: `beamix-brand-quality-bar` + `full-output-enforcement`.
- Visual build: `design-taste-frontend` + `high-end-visual-design` + `core-components`.
- State/data UI: `react-ui-patterns` + `nextjs-app-router-patterns`.
- Motion: `emilkowal-animations` (+ `vercel-react-view-transitions` for route transitions).
- Copy in components: `humanizer` pass on every user-visible string.
**MCP pairing:** **IDE** (`getDiagnostics`) before commit; **Refero** to confirm a built component matches the reference; **Pencil** `export_nodes` if building from a design file.

### Step 3 — design-critic VALIDATES (the gate that was missing)
**Loads:** `ui-visual-validator` + `beamix-brand-quality-bar` + `redesign-existing-projects` (as audit checklist) + `web-design-guidelines` + `wcag-audit-patterns`.
**MCP pairing:** **Playwright** (`browser_navigate` → `browser_take_screenshot` at desktop + mobile breakpoints → `browser_snapshot`) to produce the visual evidence `ui-visual-validator` demands. Critic returns PASS/BLOCK with `file:line` findings; BLOCK on any retired color, banned font, generic-card overuse, missing empty/loading/error state, or motion that violates the animation budget.

### Step 4 — CONVERSION pass (marketing-adjacent surfaces only)
**CMO/product-designer load:** `page-cro` / `onboarding-cro` / `form-cro` + `marketing-psychology`. Run after craft is locked, not before — conversion optimizes a beautiful page, it doesn't make an ugly one beautiful.

---

## 4. Gaps (craft areas NOT covered by an existing skill)

1. **No reference-fetching skill.** There is no skill that *teaches an agent how to gather and apply visual references*. Reference comes only from MCP tools (Refero/Stitch/Pencil). **Compensate:** make Refero search a mandatory Step-1 action in the design-lead brief, or author a short `ui-reference-gathering` skill that codifies "pull 5 screens, extract 3 reusable patterns, cite them in the spec."
2. **No icon-system / illustration skill.** Generic Lucide icons and stock illustrations are a top AI tell (flagged by `redesign-existing-projects` and `design-taste-frontend` but not *solved*). Beamix has no skill defining its icon set (Phosphor? custom?) or illustration style for empty states. **Compensate:** add an icon/illustration section to `beamix-brand-quality-bar`.
3. **No data-visualization craft skill.** Beamix is a scan/score product — charts are core UI — yet no skill covers premium chart design (axis treatment, color ramps beyond the score palette, sparkline/gauge craft). `beamix-brand-quality-bar` only fixes 4 score colors. **Compensate:** new `data-viz-craft` skill, or reference Linear/Vercel analytics in Refero.
4. **No design-token / theming source-of-truth skill for THIS repo.** `core-components` and `tailwind-design-system` are generic; neither maps to Beamix's actual token file. **Compensate:** document the real token location in CODEBASE-MAP and reference it from `beamix-brand-quality-bar`.
5. **Brand-bar vs generic-taste font conflict.** `design-taste-frontend`, `high-end-visual-design`, and `frontend-design` all *ban Inter*; `beamix-brand-quality-bar` *mandates* Inter/InterDisplay. Workers loading both will get contradictory rules. **Compensate:** add an explicit "Beamix brand bar overrides generic font bans" note (already flagged in Core rank #3) — make it a one-line precedence rule in the brand bar.

---

## 5. Bottom Line (for the founder)

To go pro-grade, the fix is a *process*, not a single skill: the product looks vibe-coded because builders skip the RETHINK and VALIDATION phases and code straight from LLM defaults. **Load, in this order: (1) `frontend-design` + `design-taste-frontend` + `high-end-visual-design` to set an opinionated, anti-slop direction; (2) `beamix-brand-quality-bar` to bind that taste to our locked palette and type; (3) `emilkowal-animations` + `humanizer` to make motion and copy stop betraying AI; (4) `ui-visual-validator` + `redesign-existing-projects` as a hard screenshot-driven critic gate before merge.** Drive it with `design-orchestration` so direction is locked before code, pair it with Refero (steal reference taste) → Stitch/Pencil (generate directions) → Playwright (capture proof for the critic), and the generic look dies at the gate. The single biggest unlock is reinstating the design-critic VALIDATION step with `ui-visual-validator` — right now nothing fails a build for *looking* generic.

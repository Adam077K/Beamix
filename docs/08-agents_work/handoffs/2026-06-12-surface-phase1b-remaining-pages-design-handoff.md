# Build Handoff — Phase 1B: design the remaining parity pages (design-only, mock data)

**From:** ceo-surface-full-product
**To:** the team that shipped Phase 1 (PR #181, Console Spine) — continue the design initiative
**Predecessor:** PR #181 `feat/surface-design-phase1` — designed the 8 core tool pages + Console Spine, mock-data, awaiting Adam's sign-off
**Direction (LOCKED, inherit it):** `docs/design/CONSOLE-SPINE-DIRECTION.md` + `docs/design/CONSOLE-SPINE-CONTRACT.md`
**Parity source:** `docs/02-competitive/teardown-2026-06/{FEATURE-INVENTORY-MATRIX,GAP-TO-BUILD}.md`

Paste-ready prompt below the line.

---

You are the CEO and Orchestrator of the Beamix C-suite agent system. Set `/color gold` and `/name ceo-surface-phase1b`. You orchestrate only — never write source code yourself.

PRE-FLIGHT (read as one block):
- CLAUDE.md + `.claude/agents/ceo.md` + `.claude/memory/DECISIONS.md` (newest first)
- What Phase 1 shipped — read PR #181 (`feat/surface-design-phase1`): the **Console Spine** is now the locked design language. `docs/design/CONSOLE-SPINE-DIRECTION.md` + `docs/design/CONSOLE-SPINE-CONTRACT.md`, and the components under `apps/web/src/components/console/` (ModeToggle, RunControl, PipelineLedger, StageRow, SerifVerdict, ToolPage, ContextStat, InputSummaryBar). Every new page INHERITS this spine — it is not a fresh design language.
- The craft bar: `docs/design/CRAFT-SYSTEM.md` (de-AI rubric — 8 tells, 12 moves), `docs/design/DESIGN-VISION.md` (warm-minimal, blue=you / violet=agents). The #173 dashboard and the #181 tool pages are the craft EXEMPLARS — new pages must sit beside them as one product.
- Brand authority: `docs/BRAND_GUIDELINES.md` (v4.0) + the `beamix-brand-quality-bar` skill — authoritative over any reference's own fonts/colors.
- Parity map: `docs/02-competitive/teardown-2026-06/FEATURE-INVENTORY-MATRIX.md` + `GAP-TO-BUILD.md` (Group 2 / "defer" rows are exactly the pages this phase designs).
- Mock-data convention: `apps/web/src/lib/demo/surfaces/` (extend it — `types.ts`, `index.ts`, one file per surface).

GOAL: design ALL the remaining pages so the product reaches full competitor-parity and feels like a complete, billion-dollar product — DESIGN ONLY, full mock data, ZERO backend wiring. These are the surfaces Phase 1 did NOT cover. Each must inherit the Console Spine so the whole product reads as one hand.

THE REMAINING PAGES (design every one; group into batches of ~2 per workflow):

Batch 1 — Intelligence / Analytics (data-viz heavy):
- **Analytics / Answer-Engine Insights** deep-dive — rich per-engine visibility, share-of-voice, position, rankings-by-topic, trend (beyond the current dashboard). Covers Profound AEI, Athena Olympus, Otterly Brand KPIs.
- **Sentiment & Brand Integrity** — sentiment themes with verbatim model quotes, hallucination / claim-accuracy detection, before/after recovery tracking. Covers Athena Brand Integrity.

Batch 2 — Traffic + Market data:
- **AI Traffic / Crawler Analytics** — AI-crawler hits (GPTBot/ClaudeBot/PerplexityBot), AI-referral attribution, submit-to-AI-search. Covers Profound Agent Analytics, Athena LLM-traffic.
- **Market Intelligence / Prompt Volume** — real-user query volume + demographics + trending prompts. Covers Profound Prompt Volumes, Athena prompt-volume.

Batch 3 — Conversational + power tools:
- **Ask Beamix** — conversational copilot over the customer's own visibility data, with cited answers; surface the MCP affordance. Covers Profound Ask Profound, Athena Ask Athena, Otterly MCP.
- **Workflow / Agent Builder** — visual builder (the customer composes/sequences agents) + bulk runs. Covers Profound Agents DAG + Sheets. (Aligns with the existing Workflow Builder MVP scope — full DAG editor + dry-run day 1.)

Batch 4 — Reporting + account:
- **Reports & Exports** — custom/shareable dashboards, CSV/PDF export, BI/Looker connector affordance. Covers all three.
- **Team & Roles** — multi-seat, RBAC, invitations (likely a Settings expansion + a Members surface). Covers all three.

Batch 5 — Agency + (optional) commerce:
- **Agency / Pitch Workspace** — prospect audit-report generator + white-label (white-label is per-CLIENT, per locked decision) + lead routing. Covers Athena Pitch Workspace, Otterly agency.
- **Shopping / Ecommerce** (ICP-EDGE — design only if Adam confirms he wants ecommerce in-product) — SKU visibility, attribute accuracy, revenue attribution. Covers Profound Shopping, Athena Ecommerce.

METHOD — run ONE T5 design workflow per batch (`.claude/workflows/design.js`), and inside each:
1. Use a COUPLE OF DESIGNERS per page (judge-panel: 2-3 independent design directions for the page, scored against CRAFT-SYSTEM.md + the Console Spine contract, then converge — do NOT ship the first attempt).
2. Then design both pages in the batch to full craft in the chosen direction, inheriting the Console Spine 5-zone skeleton where the page is a tool, and adapting it honestly where the page is an analytics/reporting/conversational surface (an analytics page is not a tool-run page — keep the spine's type/depth/voice, not a forced ledger).
3. LOAD THE REFERENCES before any code: the global soul set in `docs/design/references/_product-feel/` (feel-linear, feel-attio-whitespace, feel-anthropic-editorial, feel-posthog-product, feel-dia-blue-hero, feel-raycast-quality) on EVERY page, PLUS each page's own `docs/design/references/[screen]/` folder. Create a `[screen]/` folder per new page and use the reference images Adam drops there (and anything he puts in `docs/design/references/_INBOX/`). Steal the SOUL, never the palette — `beamix-brand-quality-bar` always wins.
4. Load the skills each batch needs (on demand, per MANIFEST): `frontend-design`, `beamix-brand-quality-bar`, `high-end-visual-design`, `tailwind-design-system`, `emilkowal-animations`, `data-storytelling` (for the analytics batches), `core-components`.
5. QUALITY CHECKS ARE BINDING — run the `design-critic` (Playwright visual pass) on every page and loop design → critic → polish until it PASSES the CRAFT-SYSTEM de-AI rubric. The explicit bar: it must NOT read as AI slop — intentional hierarchy, asymmetry where earned, depth-staging, a real type contract, signature moments, motion restraint. A page that the critic flags as generic does not ship.
6. MOCK DATA = FULL AND REAL-FEELING. Extend `apps/web/src/lib/demo/surfaces/`. Every page ships all four states (empty / loading / populated / error). NO `/api/agents/run`, NO DB reads, NO migrations.

VISUAL-CHECK NOTE: local Playwright screenshots are blocked (turbopack-dev font + demo-account issue). Run visual critique against the Vercel preview deployment (or the documented local-preview recipe with placeholder keys + LOCAL_PREVIEW bypass). Use demo@beamixai.com fixtures for populated states.

HARD STOP: when all batches pass design-critic, `next build` is green, and screenshots are attached, STOP. Open a PR (stacked on `feat/surface-design-phase1` so it inherits the spine, or on main if #181 has merged). Present to Adam for design sign-off. Do NOT wire anything — Phase 2 (backend) is a separate, post-approval effort.

GUARDRAILS: branch worktrees from `feat/surface-design-phase1` (or `origin/main` if #181 merged — verify via `gh api`, never stale local refs); chiefs return dispatch packets and YOU spawn the workers (nested Task is blocked); atomic commits; zero placeholder UI; design-lead → product-designer → design-critic loop; write a session file at close. If Adam hasn't dropped reference images for a given page yet, ask him before designing that page rather than guessing its north-star.

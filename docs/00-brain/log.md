# Activity Log

> Append-only chronological record. Agents append here after significant actions.
> Format: `## [YYYY-MM-DD] action | subject`

---

## [2026-05-16] agent-rethink-board-review | 4-round board meeting; SHIP verdict with 5-day cap; Broad-Adversary KILL preserved
- 6 personas ran R0 framings + R1 independent + R2 cross-critique + R3 synthesizer. All 13 fires complete.
- R1 verdict: 5 SHIP + 1 KILL (Broad-Adversary, 70% abandonment probability). R2 convergence: all 5 SHIP voters narrowed materially toward Adversary's position.
- 10 locked decisions including: Phase 0 immediate (already done), 5-day hard cap, scope reduction to Phases 0+1+6-subset (~4 person-days), deterministic file-path tier-floor map (replaces Haiku classifier), FM-12 plan-abandonment as #1 risk, Mem0 lock-in formally accepted with 6-month review trigger, Full-tier QA threshold raised to 300 LOC pre-revenue, product work begins Day 6 regardless.
- 4 vindication triggers active until 2026-06-15: if any fires, the Adversary was right.
- Adam accepted the synthesis. DECISIONS.md updated. Board-review artifacts at docs/08-agents_work/2026-05-16-agent-rethink/board-review/.

## [2026-05-16] agent-rethink | C-suite org locked, 40 interview decisions, Phase 0 hygiene executing
- 4 research streams completed: agent inventory (36 files, 22 active, 12 GSD orphans, 11 missing Routines, 4 missing C-suite); skills audit (430 → 110 keep, 305 archive, 14 new to author); external research (10 GitHub repos: anthropic-cookbook, disler hooks, wshobson agents, ComposioHQ, claude-code-spec-workflow); QA patterns (4-tier matrix, evaluator-optimizer XML verdict, cross-family judge, multi-judge 2-of-3 majority).
- Master plan written: `docs/08-agents_work/2026-05-16-agent-rethink/05-MASTER-PLAN.md` (1138 lines).
- 10-batch interview with Adam locked 40 decisions: C-suite (CEO Opus-4.7 → CTO/CPO/CMO/CBO/QA-Lead/Research-Lead), 13 workers with `-engineer` naming, 4-tier QA + Codex CLI second-opinion on Full+, Mem0 primary + Anthropic Memory Tool auto-fallback, .agent/agents/ deleted, Promptfoo Phase 7, subscription-bound cost model.
- Decisions log: `docs/08-agents_work/2026-05-16-agent-rethink/06-DECISIONS-LOG.md`.
- Phase 0 (hygiene) executing in this session: archive 305 orphan skills + 10 GSD agents (background agent), rename workers to `-engineer`, rewrite CLAUDE.md, harden settings.json+qa-lead-pass.yml, log decisions.

## [2026-05-06] agent-build | V4 spine agents (CEO + CTO + QA Lead) + setup guide
- 3 researchers in parallel: R1 mined wshobson/agents + claude-flow for source .md files (5 patterns lifted: Workflow Position, "Use PROACTIVELY for X", model tier in frontmatter, Key Distinctions, Orchestrator-as-Ledger); R2 inventoried existing 423 local skills (muratcankoylan + obra grade-A; 4 stubs to replace) + recommended CEO/CTO skill stack (multi-agent-patterns + context-compression + dispatching-parallel-agents); R3 produced 750-line authoritative agent .md best-practices spec sourced to Anthropic docs
- Critical finding from R3: subagents CANNOT spawn subagents — V4 architecture adapted: each C-suite (CEO, CTO, QA Lead) runs as its own main-thread Routine, not nested
- Wrote V4 spine: .claude/agents/ceo.md (orchestrator-as-ledger), .claude/agents/cto.md (engineering chief, parallel worktree dispatcher), .claude/agents/qa-lead.md (independent gate, risk-tiered, only path to merge)
- All 3 agents follow R3 best practices: Workflow Position + Key Distinctions + minimalist tools + isolation:worktree + inline mcpServers + JSON returns + cache-stable system prompts
- Wrote SETUP-GUIDE-step-by-step.md tailored to existing repo state: gh CLI already authed; .github/workflows missing; .claude/agents/ exists; wrangler not installed
- Output: docs/08-agents_work/2026-05-06-agent-build/ (R1+R2+R3 + SETUP guide)

## [2026-05-06] env-map + linear-build | V4 Environment Map + Wave D Build Plan
- Wrote `00-V4-ENVIRONMENT-MAP.md` — single "you are here" doc, 8 layers (Adam devices → channels → 24/7 cloud → data → agent org → skills/memory → Routines → Bastion). Cost picture, info flow, failure modes. The complete planned environment in one map.
- Wrote `WAVE-D-LINEAR-SYSTEM-BUILD.md` — concrete 11-step Linear build plan. Adam-only steps clearly marked (~60-90 min total). Agent-doable steps ready to start.
- Awaiting Adam greenlight to begin Step 1 (he creates Linear workspace) → I write Cloudflare Worker code → end-to-end test loop

## [2026-05-06] rethink-v4 | Corporate OS — Linear is the company
- Adam corrections after V3: drop Adam-OS, drop dates, role-based names not personas, Linear IS the canonical interface, workers use tools (not workers), runs 24/7 outside laptop, vendor from OSS
- Org chart: Adam (board) → CEO → 5 C-suite (CTO/CPO/CMO/CBO/CCO) + independent QA Lead → ~20 team leads → ~35 workers
- 24/7 architecture: Cloudflare Workers (free) + Anthropic Routines (paid in Max) + GitHub Actions (free) = critical path. Mac is dev acceleration only.
- New spend: $0-8/mo (down from V3's $33, V2's $295)
- 5 work patterns documented: file Linear ticket / DM CTO / worker proposes / routine fires / cross-functional feature build
- Vendoring strategy from 6 OSS projects: wshobson/agents, spec-kit, BMAD, agent-os, SuperClaude, claude-flow
- Autonomy mechanisms: 5 Routines + 3 signal Routines + Friday Retro that PR-edits agent .md files + worker "I noticed" reflections
- Output: docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-CORPORATE-OS.md. New decisions D23-D30.

## [2026-05-06] rethink-v3 | The Bigger Vision board meeting
- 6 specialized personas in parallel: Visionary, Chief of Staff, Strategist, Architect, Personal Systems, Risk Modeler
- HARD CONSTRAINT RESET: $0 new software (Claude Max $100/mo only), 8GB home Mac, $20-50/mo cloud max
- Architect: $33/mo new spend (89% cut from V2's $295) — Bastion = 8GB Mac + tmux farm of `claude -p --bare` = poor man's Devin
- Visionary: Current army is "throughput infrastructure not flywheel" — reframe to "Bloomberg Terminal of AI Search funded by SMB subscription"
- Visionary's bets: spawn 7 complete-company agents Day 30 (CS, Sales, Brand Voice, CFO, CoS, Talent, Investor); lock Day-1 data layer (8 tables, permanent retention)
- Chief of Staff: 5-Routine heartbeat at $5-15/mo gives the fleet its missing operating rhythm
- Strategist: stop-loss conditions + ANTI-ROADMAP fleet enforcement + 3 signal Routines + 4-board-meetings/mo cap
- Personal Systems: Adam-OS missing entirely. iOS Shortcut idea capture + Energy-Adaptive Army (HealthKit Green/Yellow/Red) + Voice-Erosion Guardrail
- Risk Modeler: 3 risks BLOCK Wave 3 ship — Memory poisoning (~6h), prompt injection (~8h), cost runaway+irreversible actions (~16h). Total ~42h
- Output: 7 reports docs/08-agents_work/2026-05-05-war-room-rethink/14-19 + 00-V3-VISION.md
- New decisions D15-D22

## [2026-05-05] rethink-v2 | Autonomous-army blueprint (Wave 2)
- 6 parallel agents: 1 architecture critic + 5 external researchers (hosted platforms, autonomous-org frameworks, remote control, AI-native company practices, memory + tokens)
- Headline shift: Anthropic shipped the stack Oct 2025-Apr 2026 (Remote Control, Channels, Routines, Memory Tool, isolation:worktree, plugins, GitHub Action). Beamix's job is wire-in, not build.
- Remote control: 4 official surfaces, $0/mo delta. Solo-founder canonical 2026 stack.
- Hosted overflow: 3 picks at $295/mo (Routines + Cursor Background + Inngest+E2B)
- Memory: Anthropic Memory Tool + Supabase pgvector — don't rent Letta/Mem0/Zep
- Token-reduction: 55-75% input savings, $200-500/mo via 5 wins
- Architecture: dissolve leads for Medium tasks, add async-spec-trust mode, keep CEO + QA-Lead independent
- AI-native benchmarks to aim for: Block 69% AI-authored, Cursor Bugbot 80% resolution, Vercel removed-80%-tools = 3.5× faster
- Output: 7 reports in docs/08-agents_work/2026-05-05-war-room-rethink/ (00-V2-SYNTHESIS + 08-13). New decisions D8-D14.

## [2026-05-05] rethink | War room critical audit + ecosystem research
- 7 parallel agents (3 internal auditors + 4 external researchers) dispatched
- Internal: 7 P0 bugs in agents/skills/memory/worktrees (dead lineage, archived paths, zero QA gate, 32 GB worktree sprawl, $0.14/session skill discovery overhead)
- External: Anthropic May-2026 stack (Plugins, Agent Teams, Routines, OTEL, headless `claude -p`) — Beamix uses 4 of 13 primitives
- Linear MVP: ~$50/mo, same-day shippable via claude-code-action + single Routine + Vercel Edge bridge
- QA upgrade: Cloudflare risk-tiered model ($0.98/median review across 48K MRs)
- Output: 8 reports in docs/08-agents_work/2026-05-05-war-room-rethink/ (synthesis + 7 detail files)
- Awaiting D1-D7 sign-off

## [2026-04-10] setup | Beamix Brain vault created
- Created ~/BeamixBrain with symlinks to docs/, memory/, agents/, commands/
- Installed plugins: 3D Graph, Obsidian Git, Dataview, Code Files, Claude Code MCP
- Created _INDEX.md hub + 8 MOC notes (192 wikilinks)
- MOCs: Product, Architecture, Business, Marketing, Codebase, History, Metrics, Agents

## [2026-04-19] design | Framer features page — BenefitTabV2 content planning
- Audited all components on /features page via Framer MCP — full map of covered vs uncovered features
- Read product rethink docs (PRODUCT-VISION, AGENT-ROSTER-V2, UX-ARCHITECTURE) to identify lifecycle gaps
- Defined 4 GEO-optimized feature tabs: Your Agent Workspace · Measure Every Fix · Automation That Runs for You · Your Competitor Gap Map
- Icons: NotePencil · TrendUp · Lightning · Crosshair (Phosphor). Screen designs scoped per tab.
- Copy not yet pushed to Framer — waiting on product screenshot designs for DashboardImage01–04

## [2026-04-17] docs | Documentation cleanup after April 14-15 board decisions
- Full docs cleanup after April 14-15 board meeting decisions
- PRD, VISION, PRODUCT_SPEC, ARCHITECTURE, AI_AGENTS rewritten
- 4+ superseded specs archived to docs/_archive/2026-04-pre-rethink/
- MOCs updated with new pricing (Discover/Build/Scale $79/$199/$499), agents (11+1), UX model (Inbox-based, no Agent Hub)
- Source of truth: docs/product-rethink-2026-04-09/ (9 files)

## 2026-04-17 — Board Meeting Day 3: Final Decisions + Audit
- Pre-build audit: 5 agents found 7 P0 blockers, 5 contradictions — all resolved
- Locked: no AI labels in content, day-1 auto-trigger pipeline, $19 top-up, annual pricing, Sonar QA, notify.beamixai.com
- Assisted vs autopilot validated (97% prefer review — Ahrefs/HubSpot research)
- Documentation cleanup complete: 30+ docs updated, 14+ archived, 10 rethink docs finalized
- All contradictions in 05/06/07/08 resolved (naming, pricing, tier access, settings tabs)
- Ready for Round 5: 2-week execution plan

## [2026-04-19] docs cleanup | PRD + BACKLOG + specs aligned to April rethink
- PRD.md rewritten v3.1→v4.0: 11 new GEO agents, 7 dashboard pages, Discover/Build/Scale tiers, 14-day money-back
- BACKLOG.md rewritten: Wave 2 items (10 items), 3 current blockers, old A1-A16 roster removed
- ENGINEERING_PRINCIPLES.md updated: monorepo file structure (apps/web/src/), approved LLM list, testing tools filled in
- 14 pre-rethink feature specs archived to docs/_archive/2026-04-pre-rethink/specs/ (originals tombstoned)
- MOC-Product.md: 14 dead links removed, dashboard-7-pages.md + proactive-automation-model.md added

## 2026-04-18 — 8-Expert Pre-Build Audit
- 8 agents reviewed complete build plan from different expert perspectives
- Key changes: Build tier $189, agent priority (Deep 6 / Lighter 5), FAQ+Optimizer aha moment
- Security: 3 Critical + 4 High findings → 10 requirements added to all worker briefs
- Infrastructure: Inngest Pro required ($75/mo), direct Anthropic SDK (bypass OpenRouter for 80% of calls)
- Customer Yael: 11 confusing terms identified → user-facing language policy (action labels, no agent names)
- Full audit saved to 15-EXPERT-AUDIT.md

## 2026-04-24 design-rethink | product
- Launched 3 parallel Phase-1 agents (2 Opus researchers + 1 design-critic)
- Both Opus researchers independently converged on PostHog as primary design anchor
- Design Lead produced 425-line DESIGN-DIRECTION.md with 10 aesthetic rules + page-by-page rethink
- Awaiting Adam's answers on 5 open decisions before Phase 0 implementation

## 2026-04-24 design-rethink-v2 | product
- Round-2: 4 targeted researchers (companion character, flow visualization, competitor audit, motion+PMF)
- Design Lead synthesized 651-line DESIGN-DIRECTION-v2.md with motion-first structure (inverse of v1)
- All 3 category gaps confirmed 100% unclaimed (animated agent execution, character companion, proactive Inbox)
- Phase 0 ready to ship: 10 fixes, 3-4 days engineering
- 5 open questions to Adam (Rive creator, character name, First Scan gate, Crew rename, Rive licensing)

## 2026-04-25 board-meeting-v2-critique | product
- 7-seat board pressure-tested DESIGN-DIRECTION-v2 (Reductionist, Storyteller, Executor, Advocate, Motion Craftsman, Futurist, Moat Strategist)
- All 7 returned 200-756 line critiques, ~3,500 total lines
- Verdict: v2 thesis correct (7-0), execution broken (7 different fractures)
- 5 ship-stoppers identified (WCAG, Hebrew typography, streaming API missing, internal contradictions, May launch impossible)
- 4 of 7 seats independently invented "Shareable Scan Card" — biggest v2 omission
- BOARD-MEETING-MINUTES.md produced with 15-decision matrix awaiting Adam

## 2026-04-25 vision-framework-synthesis | product
- 5 reference researchers + master list synthesizer + vision framework synthesizer
- BEAMIX-VISION.md v1 delivered (423 lines, 7 anchors, 5 signature motions, 10 pages in dependency order)
- 5 opinionated calls locked, 2 open questions for Adam
- Page-by-page deep dive begins next (start with /scan — acquisition wedge)

## 2026-04-25 page-architecture-audit | product
- Two agents (Customer Journey + IA Critic) independently audited 10-page proposal
- Both agree: kill /archive, add /crew + /reports, rename /automation→/schedules, add multi-domain switcher, resolve notification naming
- Disagree on 3 splits: /home keep-or-kill, /workspace separate-or-merge, /competitors separate-or-merge
- Synthesizer recommends Hybrid path: 7-8 sidebar pages (kill /home, keep /workspace + /competitors)
- Awaiting Adam's call on 7 prioritized questions

## 2026-04-25 overview-vs-inbox-debate | product
- Two product designers (Maximalist + Minimalist) argued opposite sides on /home structure
- Synthesizer produced OVERVIEW-DECISION.md with 3 paths (A/B/C) and recommended Path C (Hybrid)
- Path C: /home rich (8 sections, no tabs), /inbox sibling page, /scans absorbs /archive as "Completed Items" tab
- Awaiting Adam's call on path + 4 follow-up questions

## 2026-04-25 home-design-spec | product
- Page list locked (8 sidebar + 2 flow + Scale-tier /reports + 4 chrome elements)
- Quality bar memory written (billion-dollar feel)
- Premium /home references hunt (900 lines): 5 anchors, 12 expensive patterns, 8 anti-patterns
- HOME-DESIGN-SPEC.md delivered (1271 lines): 3-act structure, 8 sections fully specced, signature pill primitive ("Run all — N credits")
- 5 open questions for Adam to answer before section-by-section conversation begins

## 2026-04-26 pages-design-moves | product
- 2 designers debated all 10 remaining pages (Distinctive vs Discipline)
- Synthesizer produced PAGES-DESIGN-MOVES.md (804 lines)
- 3 D1 wins: /competitors, /scan, /reports. 3 D2 wins: /schedules, /settings, /workspace completion. 4 blends.
- 7 open questions for Adam to lock per-page

## 2026-04-26 design-foundation-handoff | product
- Committing entire design + product architecture body of work to GitHub
- Handoff prompt produced for next design/planning/UX team
- ~50 documents totaling ~25,000 lines of synthesized design direction
## [2026-04-28] board-meeting | 23 decisions locked + PRD v2 cascade
- 9-seat board (Customer Voice + Designer + Product Lead + Brand Lead + AI Engineer + Architect + T&S + Yossi sim + Marcus sim) ran across 3 rounds
- Adam confirmed all 23 decisions: permalink private / table /crew / tier-gated white-label / Model B voice canon / Workflow Builder hybrid scope at MVP / publishing deferred MVP-1.5 / Inngest free → Pro at 5 customers / 4-email Day 1-6 cadence / per-client white-label / bulk-approve in /inbox / vertical-aware onboarding / Truth File hybrid schema / /security page / agency indemnification clause + 9 more
- PRD v2 filed at docs/08-agents_work/2026-04-28-PRD-wedge-launch-v2.md (~12K words; supersedes v1)
- Cross-session memory: 4 new entries (Inngest tier, voice canon Model B, white-label per-client, Workflow Builder scope)
- Build is unblocked for Tier 0 sprint (~19 person-days plumbing)


## [2026-05-16] ceo-rethink-phase1 | Phase 0 hygiene + Phase 1 schema/QA infra shipped
- Phase 0: 308 orphan skills archived (MANIFEST 167KB→47KB); 13 GSD agents archived; .agent/agents/ deleted; workers renamed to -engineer; CLAUDE.md rewritten to C-suite
- Phase 1: file-path tier-floor YAML + PostToolUse per-file typecheck hook + qa-lead-pass.yml extended for tier:irreversible + all 22 .claude/agents/*.md standardized to 07b template
- Models corrected: ceo/research-lead/ai-engineer/security-engineer/researcher → opus-4-7
- Vindication triggers: 5-day cap respected (1 day); FM-12 not triggered
- Next: Day 6 pivot to product per board decision #9 — use canonical handoff at docs/product-rethink-2026-04-09/build-prep-2026-05-13/13-CEO-HANDOFF-PROMPT.md
- Session: docs/08-agents_work/sessions/2026-05-16-ceo-phase1-rethink-execution.md

## [2026-05-16] ceo-rethink-phases-0-through-6 | Adam overrode Day-6 pivot — full agent system completion
- Phase 0 hygiene (308 orphans + 13 GSD + leads archived, CLAUDE.md C-suite, manifest 423→145)
- Phase 1 schema + QA infra (tier-floor YAML + post-edit hook + 22 agents standardized + workflow paginate fix)
- Phase 2 (4 new C-suite cpo/cmo/cbo/cco + 5 new/restructured workers qa-/adversary-/product-designer + data-/devops-engineer)
- Phase 3 (14 Beamix-specific skills authored: war-room-orchestration, mem0-patterns, beamix-brand-quality-bar, etc.)
- Phase 5 (3 missing personas: broad-adversary, customer-voice, risk-modeler)
- Phase 6 (pre-tool-use.sh + stop.sh + schema-lint.js authored; hooks awaiting fresh-session wiring)
- Wave 3 cleanups (legacy leads archived, war-room 26 skill refs + 6 cross-cutting bugs fixed)
- DEFERRED: Phase 7 (Promptfoo) · war-room 10-file full 07b restructure · hook wiring · skill ref updates for new Phase 3 skills
- Session: docs/08-agents_work/sessions/2026-05-16-ceo-phase1-rethink-execution.md

## [2026-05-20] wave0-foundation | Wave 0 merged to main — db + app-shell + agent-system + integration
- PRs #80 (db-foundation, irreversible/3-judge), #79 (app-shell, full), #81 (agent-system, irreversible/adversary+3-judge), #82 (integration, lite) — all QA PASS, merged.
- 15 migrations applied to staging zhjxdwcqxhwletkpuwyl (legacy schema Adam-authorized wiped). 11-agent system + 5-step pipeline. Next.js 16 shell.
- QA forced fixes: RCE (next 15.3.9), insecure auth gate, credit-drain RPC exposure, prompt-injection bypass, types.ts corruption ×2, non-idempotent seed.
- Wave 0.5 tech-debt logged in BACKLOG.md.
- Session: docs/08-agents_work/sessions/2026-05-20-ceo-wave0-foundation.md

- [2026-05-23] CEO grill session: agency pivot. 15 decisions locked. Pivot from $79/$189/$499 tool to $499/$999/$1,499/$2,499 done-for-you agency. 60-day money-back, 3-vertical launch ICP, 7 new + 4 repurposed customer-facing agents. Research: tasks a98bc6df7d83e15e2 + a4684aa23fdeb01f7.
- Session: docs/08-agents_work/sessions/2026-05-23-ceo-agency-pivot-grill.md
- Next dispatch: CPO + CMO + CBO + CTO parallel

- [2026-05-23 evening] All 4 C-suite leads completed agency-pivot dispatch. 38 planning files edited + 18 new files created (7 agent PRDs, 3 vertical landing pages, DM templates, Wave 3 brief, ToS draft v1, insurance plan, unit econ tier model). 5 session files written. North star changed to month-3 retention. CTO sequencing decision A10: Wave 3 after Wave 2 ships to customer #1. Adam-blockers: insurance + lawyer ToS review.

- [2026-05-24] QA-Lead PASS — PR #84 agency-pivot doc update, Lite tier. 2 P2 arithmetic errors filed as tech-debt in UNIT_ECONOMICS_TIER_MODEL.md.

- [2026-05-24] CEO closeout: PR #84 opened, QA-Lead PASS (Lite), 2 P2 arithmetic fixes applied inline. 5 sub-decisions ratified (north star, Wave 3 sequencing, Opus on Strategy, YMYL human-gate, Publishing Irreversible). CTO dispatched for 6-gap infra scoping. Adam-blockers: merge approval + insurance + lawyer + landing-page approval.

- [2026-05-24] CTO infra-gap scoping completed. 6 vendor/sequencing sub-decisions ratified into Wave 1+3 briefs. Surprises: Resend DNS NOT live (false-positive in prior checklist); Paddle greenfield (8 new products needed). 6 Adam-blockers AB-1..6 added to checklist.
- 2026-05-30 — ceo-wave2-merge-train: landed remaining 5 Wave 2 branches (#113 deliverables, #114 approvals-api, #115 approvals-ui, #116 founding-100, #117 new-agents). Main = 6c50e9f. QA caught 7 P1s across the run (atomic-consume race, RLS-blocked approvals UPDATE +3, founding cohort_number) — all fixed. Merged main verified green: tsc 0, build 0, vitest 176/176. Pending: apply migration 20260529000007; set APPROVAL_SIGNING_SECRET in Vercel; YMYL Hebrew + dedup follow-ups. See docs/08-agents_work/handoff/2026-05-30-handoff-wave2-complete.md
- 2026-05-30 (close) — Release blockers cleared by Adam: migration 20260529000007 applied + APPROVAL_SIGNING_SECRET set in Vercel. Approvals + deliverables flows now live. Next phase scoped: Agent Execution Wiring (content-agent ignition `/api/agents/run` + wire customer-success & approval-gate-writer to Inngest) — dispatch prompt handed to Adam. Remaining non-blocker: regenerate database.types.ts.

- [2026-06-03] CEO prove-engine: PRs #125 (engine e2e chain test, Lite) + #126 (approval_queue idempotency migration, Irreversible — Adam signed off) merged to main @ 49f335b. Engine proven end-to-end (41/41) + idempotency hardened. QA gate caught a P1: partial unique index is NOT a valid Postgres ON CONFLICT arbiter (42P10 every call) → fixed to plain unique index. Open Adam-run: supabase db push + types regen. Next: staging deploy → Wave 3 gate. Session: docs/08-agents_work/sessions/2026-06-03-ceo-prove-engine.md

## [2026-06-06] ceo-miro-product-viz | Full product visualized in Miro
- Mapped the finished-product vision (PRD v5.0 agency) into a 15-frame Miro board: IA/sitemap, 5 user-flow flowcharts, agent roster + 3 pipeline diagrams, feature inventory, pricing, verticals, ERD. Nodes tagged by build status (Built/Scaffolded/Spec-only).
- 4 parallel doc-researchers produced backing maps in docs/08-agents_work/2026-06-06-miro-product-viz/ (MAP-A..D + README index).
- Built on Miro board https://miro.com/app/board/uXjVG1iySzI=/ ; Playwright-verified all frames; fixed F14 ERD frame-overflow.
- Session: docs/08-agents_work/sessions/2026-06-06-ceo-miro-product-viz.md

## [2026-06-07] ceo-navigable-product | Whole product made navigable — no more "Coming Wave 1"
- T5 design pass on `feat/navigable-product`: sidebar → 3-page outcomes nav (Outcomes/Approval Queue/Settings), 6 retired tool-framed routes now redirect; built auth (login/signup/forgot-password), six-tab Settings, and polished /scan/[scan_id] + /discovery to the warm-minimal bar. Design-first (auth/Settings wiring is a fast-follow).
- 4 `design` workflows → 4 worker builds (conflict-free merge) → design-critic → binding `qa.js`: gate #1 BLOCK (open-redirect on `next`, squared reduced-motion ring offset) → fixed w/ regression tests → gate #2 PASS. tsc 0, vitest 232/232, build 0, zero placeholder hits.
- Merge human-gated; awaiting Adam. Session: docs/08-agents_work/sessions/2026-06-07-ceo-navigable-product.md
- [2026-06-08] Scan/diagnosis rebuild: measurement model v2 LOCKED. Wave 1 (#159 live retrieval) + Wave 2 (#160 evidence capture + SSRF site audit) merged. Specs: docs/04-features/SCAN-MEASUREMENT-MODEL.md (authoritative) + SCAN-ORCHESTRATION + DIAGNOSIS-REDESIGN. Build handoff: docs/08-agents_work/handoffs/2026-06-08-scan-build-handoff.md. BINDING: SCAN_LIVE_RETRIEVAL stays OFF in prod until Wave 2b (budget guard).
- [2026-06-10] Wave 5 — L2 probe v2 + code scoring (measurement core) landed on `feat/w5-probe-scoring` (681250b). Pure additive library (apps/web/src/lib/scan/), 13 files/+3991 LOC/322 tests, NO migration, live scan flow untouched. Neutral no-leak probe (firewall as type boundary + fail-closed leak-gate; branded bypass by design), code extraction, 12-shape classifier (annotation-only), the one allowed sentiment-judge call (code-verified quote), 6 dimensions, Wilson-CI Band (presence/position-only headline), per-engine subscores never merged. Binding qa.js Full gate PASS ×2 (cleared 16 advisories between runs; sequencing-lock invariant tested). Merge human-gated; awaiting Adam. Session: docs/08-agents_work/sessions/2026-06-10-ceo-w5-probe-scoring.md
- [2026-06-11] Wave 6 — contrastive gap-list ordering + agent playbook mapping + evidence-bound narration v2 landed on `feat/w6-gap-narration` (0d62b38). Pure additive library (apps/web/src/lib/scan/), 9 files/+2927 LOC/406 tests, NO migration, live scan flow untouched. Gap-list ranked by contrastive observed fact (competitors-have-it) not impact-alone; Tier-3 hygiene tail; honest impact_fallback; narration = one evidence-bound LLM call + deterministic grounding code-check (strips ungrounded quotes/competitors/numbers). Binding qa.js Full gate: run#1 BLOCK on judge-dropout (spend limit, raised) → same-tip re-gate PASS. 4 narration-hardening items GATE the narration-wiring wave (empty-competitor grounding bypass, number substring false-pass, PII log, dead opts.now). Merge human-gated; awaiting Adam. Session: docs/08-agents_work/sessions/2026-06-11-ceo-w6-gap-narration.md
- [2026-06-11] Wave 7 — free-scan v2 WIRING landed on `feat/w7-scan-wiring` (96432d0), flag-gated SCAN_MEASUREMENT_V2 default OFF in prod (v1 byte-identical). First behavioral wave: assembles W4/W5/W6 into the live free scan — leak-gated neutral probe → code scoring → client+competitor factor audit → contrastive gap-checklist → narration → richer free_scans blob (stays anonymous JSONB) → honest v2 results UI. Probes/sentiment parallelized (leak-fail-closed + ≥2/3 degraded preserved). Binding qa.js Full: gate#1 BLOCK (flag=ON Inngest branch untested — confirmed P1) → fixed (6-assert coverage a-e + flag-OFF regression guard) → gate#2 PASS. 13 non-blocking advisories = flag-flip readiness checklist (ProbeLeakError→NonRetriable, scan_v2 type, SCAN_LIVE_RETRIEVAL test, parallel I/O, competitor-domain resolver). Merge human-gated; awaiting Adam. Session: docs/08-agents_work/sessions/2026-06-11-ceo-w7-scan-wiring.md
- [2026-06-11] Craft-elevation ("de-AI") initiative kicked off + first screen shipped. Foundational design workflow `wf_57c0d5b6-c6a` produced the durable rubric `docs/design/CRAFT-SYSTEM.md` (8 AI-generated tells, 12 craft moves M1-M12, design-critic checklist, dashboard exemplar). Dashboard (anchor/exemplar) elevated: `.card-inset` depth tiers, 4-step type contract, weighted-2-up engines, new EngineMicroSparkline, single Fraunces verdict beat, violet structure on the agent panel, staggered entrance, all 4 states. PR #173 squash-merged (main db81c5f); docs PR #174. Binding qa Full gate: gate#1 BLOCK was a STALE-LOCAL-MAIN diff artifact (false 202-file/Irreversible) + 1 real P1 (3 dead /agents links → /approvals, fixed 463f646) → same-agent re-gate PASS. Visual-critic pass deferred until demo@beamixai.com exists (prod, populated). Cascade handoff: docs/08-agents_work/handoffs/2026-06-11-design-craft-elevation-handoff.md
- [2026-06-11] "Show The Work" design initiative — Wave 0 + Wave 1 shipped (differentiator-first, demo-fixtures, craft bar = dashboard exemplar #173). Three screens that make "we do the work, not just dashboards" visible, all merged to main 1a93c21: #176 Wave 0 (getOutcomeById/getDigestById/DEMO_DAY1 + types/day1.ts, traceability+digests REFERENCE contracts, .timeline-node util); #177 traceability drill-down /traceability/[outcomeId] (outcome → dated linked deliverable trail + score delta); #179 weekly digest detail /digests/[digestId] (engines then→now, wins, that week's approval cards, customer note) + folded-in Principle #9 cleanup (digest list no longer renders agentName/agentProposer); #178 post-payment live-work /onboarding/post-payment (Day-1 ritual + auto-run drafts surfacing live, replaces the mock). Lite QA gate: code-reviewer per PR (no P1), all genuine P2s fixed (double-nav, delta sign, Shift+E prod guard, a11y), builds re-verified exit 0 inline. design-critic Playwright visual pass = prod fast-follow once demo@beamixai.com is live. Session: docs/08-agents_work/sessions/2026-06-11-ceo-show-the-work.md
- [2026-06-11] "Surface the Full Product" initiative kicked off (research + strategy, no code). Positioning amended: Beamix is now a FULL self-serve product with an agents + done-for-you CORE — softens (not reverses) the 2026-05-23 "NOT a tool / tooling hidden / no agent names" lock. Three operating modes defined: Manual / Autonomous-seat / Done-for-you. Pricing explicitly OUT of scope (Adam). Competitor teardown launched (Profound + AthenaHQ + Otterly → docs/02-competitive/teardown-2026-06/). Manual-tool surface specs → docs/04-features/specs/. Git: worktree synced to origin/main (679656d); local MCP --read-only-drop commit 850cb85 preserved on branch ceo-2-1781190242 for Adam's separate decision. Positioning: docs/01-foundation/POSITIONING-AMENDMENT-2026-06-11.md. Session: docs/08-agents_work/sessions/2026-06-11-ceo-surface-full-product.md
- [2026-08-09] Agent-system rebuild — the three un-grilled design branches closed (handoff action #2), planning-only, nothing built. Decisions 15-17 added to `docs/08-agents_work/2026-08-09-AGENT-SYSTEM-ARCHITECTURE.md`: (15) model routing becomes a compiled tier map — frontmatter declares `tier:`, a generator writes `model:`, schema-lint fails on disagreement; universal tier→ID map + project-owned overrides; `adversary: codex` puts cross-family routing into data. (16) a worker's BLOCKED auto-invokes the thinking layer, bounded at two panel runs per `task_id` then Adam; panel advises but never authorizes at irreversible tier; run log gains `task_id` + `status: BLOCKED`. (17) work arrival = universal contract (`task_id`/goal/acceptance-criteria/record) + project-owned rail binding; Beamix binds Linear pull-only (one `.mcp.json` entry, no bridge); autonomous inbound deferred per stop condition 4. Three findings, all the same declared-never-wired pattern: `.mcp.json` has only `supabase` while 23 files call `mcp__linear__*` and ceo.md step 7 mandates a Linear comment; BLOCKED is executable only in `coding.js`, which is being deleted, and the "max 3 retries" limits count nothing; 51 agent files pin model IDs the Opus-4.8 bump never updated. Handoff action #1 (re-run the skills cut list) still open. Session: docs/08-agents_work/sessions/2026-08-09-ceo-agent-system-rebuild.md
- [2026-08-09] Agent-system rebuild, round 2 — decisions 18-21 + 24 reference systems cloned, still planning-only. (18) capability envelope = machine-readable `envelope.json`, `pre-tool-use.sh` logs reaches, never blocks — it had no definition anywhere until now, leaving decision 4 enforced by prose. (19) acceptance criteria = `{id, text, check, verified_by}`; command-unmet BLOCKs deterministically, judge-unmet enters findings and must survive adversarial verification — needs plumbing that doesn't exist, since qa.js has zero `args.` and all 5 dimensions are generic. (20) propagation target = 9 live sibling repos + Beamix; `gsa-sync --check` inserted as step 3.5 (read-only, produces the cross-repo inventory the cut test needs), `--apply` unmoved at step 9. (21) a reader agent consumes the run log and acts/escalates — open hole flagged, not closed: who checks the reader ran. MEASURED, closing the plan's cross-project-fit question: 11 repos carry the system; the 3 without a tier-floor are exactly the 3 with zero commits in 90d (out of scope by data); adamos has 11 hooks to our 7; etsyc (689/90d) and evalove (385, committed today) both out-commit Beamix — the ROI thesis was understated. CLONED to ~/VibeCoding/_reference/: 24 repos, 406M, 1,150 SKILL.md vs our 146. Headline — hooks are where we're furthest behind on the one axis our doctrine calls load-bearing (Beamix 7, gsd-core 78, get-shit-done 54, cloudflare/agents 41); we archived GSD's agents in May and never took its hooks. QM has zero agents/hooks (skill-format innovation only). Inventory: docs/08-agents_work/2026-08-09-reference-systems-local.md. Session: docs/08-agents_work/sessions/2026-08-09-ceo-agent-system-rebuild.md
- [2026-08-11] Agent-system rebuild — last three open branches closed as decisions 24-26; the build handoff is now unblocked and nothing in it waits on an answer. (24) the capability envelope ships ADVISORY with its default-deny path built and left OFF behind one flag — advisory wins on ordering not merit, since a blocked reach is a reach nobody sees and deny-first destroys decision 4's highest-value signal; resolves the head-on conflict between decision 18 and 2026-08-08 gap-map rec 6. (25) inbound guards enter the build, recs 4 and 7 only (PostToolUse injection/invisible-unicode scan — port already selected, present in both external hook libraries; plus secret redaction, which the hook audit searched for and found NO prior art) — this closes the one whole category the 14 steps had zero coverage for, since every other guard in the design is outbound while the scan pipeline ingests third-party pages and four LLM providers' output straight into agent context. Rec 5 stays out (half-covered by locked decision 4); rec 3 stays CUT and an earlier handoff recommendation to fold it in is corrected in place as wrong — commitlint broke 50+ worktrees and the hook audit refused the port. (26) the net-zero cut-pairing policy is retired; stripe-integration and clerk-auth stay agreed, nothing else is forced onto step 13, the only cut nobody could prove is quality-neutral. FOUND, and it changes the build order: open PR #189 (gsa-core-sync v6.3.0, 2026-07-27, MERGEABLE) was read to answer the handoff's own "read that diff before steps 2/4/5" — the build is NOT already written there (its hook/workflow edits are version stamps, 1-6 lines each), but it does carry gsa-project.json (the file step 12a says no project has) and a DUPLICATE-GATE hazard: it adds a new 343-line gsa-qa-lead-pass.yml alongside the existing qa-lead-pass.yml, so landing it leaves two QA gates live and step 5 would harden only one. Also restored the build handoff on disk, which had been reverted to its pre-2026-08-10 state, dropping 109 lines including three verified numeric corrections. Still planning-only; nothing built. Handoff: docs/08-agents_work/2026-08-10-BUILD-HANDOFF.md

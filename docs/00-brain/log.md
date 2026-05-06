# Activity Log

> Append-only chronological record. Agents append here after significant actions.
> Format: `## [YYYY-MM-DD] action | subject`

---

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
- Locked: no AI labels in content, day-1 auto-trigger pipeline, $19 top-up, annual pricing, Sonar QA, notify.beamix.tech
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


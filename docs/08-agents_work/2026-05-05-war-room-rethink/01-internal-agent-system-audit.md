# Internal Audit: Agent System
*Audited: 2026-05-05 | Scope: Layer 1 (CEO) + 9 Leads + 9 Workers + 12 GSD execution agents*
*Evidence base: all 32 agent files + AGENTS.md + CLAUDE.md + 3 session files in .claude/memory + 29 session files in docs/08-agents_work/sessions/*

---

## Top 10 Findings (ordered by severity P0→P3)

---

### F1 — P0 | HARD SPLIT BETWEEN TWO INCOMPATIBLE AGENT LINEAGES

**Finding:** The system contains two structurally incompatible agent designs that cannot interoperate cleanly. The 9 core workers/leads (build-lead, backend-developer, etc.) follow the "Beamix 3-layer" model with YAML frontmatter (`model`, `maxTurns`, `color`, `tools`). The 12 GSD execution agents (planner, executor, verifier, debugger, codebase-mapper, roadmapper, integration-checker, plan-checker, phase-researcher, project-researcher, research-synthesizer, nyquist-auditor) are from a different upstream lineage (GSA Startup Kit / Get-Shit-Done toolkit) and have **no `model`, `maxTurns`, or `color` frontmatter** — only a `skills:` field and hook comments.

**Evidence:**
- `planner.md` line 1-14: frontmatter has `tools`, `color`, `skills` — no `model`, no `maxTurns`
- `executor.md` line 1-8: same — `tools`, `color`, `skills` — no `model`, no `maxTurns`
- `verifier.md`, `debugger.md`, `codebase-mapper.md`, `roadmapper.md`, `integration-checker.md`, `plan-checker.md`, `phase-researcher.md`, `project-researcher.md`, `research-synthesizer.md`, `nyquist-auditor.md` — all missing `model` and `maxTurns`
- These agents reference `.planning/`, `gsd-tools.cjs`, `STATE.md`, `ROADMAP.md`, `PLAN.md` — none of which exist in the Beamix repo structure
- The Beamix repo uses `docs/` not `.planning/`, and has no `gsd-tools.cjs` binary
- GSD executor references `node "./.claude/get-shit-done/bin/gsd-tools.cjs"` — this binary does not exist in the repo

**Impact:** If anyone dispatches executor, planner, verifier, or debugger, they will immediately fail — the toolchain they depend on (`gsd-tools.cjs`) is absent. The 12 GSD agents are dead weight that consume documentation space, confuse routing, and produce false confidence that a structured execution backbone exists when it does not.

**Recommendation:** KILL all 12 GSD execution agents (executor, planner, verifier, debugger, codebase-mapper, roadmapper, integration-checker, plan-checker, phase-researcher, project-researcher, research-synthesizer, nyquist-auditor). Replace with 2-3 lean purpose-built Beamix agents if structured execution is actually needed.

---

### F2 — P0 | WRONG PATH HARDCODED IN FRONTEND-DEVELOPER AND DESIGN-LEAD

**Finding:** `frontend-developer.md` hardcodes `saas-platform/` as the component path at multiple points. The Beamix repo completed a monorepo migration on 2026-04-18 — `saas-platform/` was archived to `_archive/saas-platform-2026-04-legacy/`. The actual path is now `apps/web/src/`. Any frontend worker dispatched will explore a directory that does not exist, then either fail silently or produce commits in the wrong location.

**Evidence:**
- `frontend-developer.md` line 81: `Glob saas-platform/src/components/**`
- `frontend-developer.md` line 82: `Glob saas-platform/src/components/ui/**`
- `frontend-developer.md` line 102: `Shadcn/UI components from 'saas-platform/src/components/ui/'`
- `frontend-developer.md` line 145-146: `git add saas-platform/src/components/[ComponentName]/...`
- `frontend-developer.md` line 285: `DO NOT duplicate existing components. Always check 'saas-platform/src/components/'`
- `design-lead.md` line 665: `DO NOT create components that already exist. Check 'saas-platform/src/components/'`
- Confirmed in `2026-04-19-ceo-wave0-wave1-complete.md`: "Archived `saas-platform/` → `_archive/saas-platform-2026-04-legacy/`... New product lives at `apps/web/`"
- `ls /apps/web/src/` confirms the actual path

**Impact:** Every frontend worker and design lead will search a dead path. Code could be committed to an archived directory. This is a silent P0 — it won't crash the agent, it will just produce work in the wrong place.

**Recommendation:** Globally replace `saas-platform/src/` → `apps/web/src/` in `frontend-developer.md`, `design-lead.md`, `design-critic.md`, and any other agent files that reference the old path.

---

### F3 — P0 | QA GATE IS STRUCTURALLY UNENFORCEABLE

**Finding:** The QA gate is declared as "mandatory" and "sacred" in CLAUDE.md, ceo.md (line 186), and build-lead.md (line 121, 253-254). However, there is no mechanism that actually enforces it. The CEO validates `qa_verdict` by checking the lead's return JSON, but that JSON is written by the lead itself — there is no independent enforcement. Critically, examining all 29 session files in `docs/08-agents_work/sessions/`: zero of them contain a `qa_verdict` field, a QA Lead invocation record, or any security/test check result. The gate exists only in documentation.

**Evidence:**
- CEO `validate_lead_return` step (ceo.md line 173-191): checks `qa_verdict` field in the lead's JSON return — but this field is self-reported
- Session file `2026-04-19-auth-rebuild-exec.md`: Complete auth rebuild with 4 commits, 4 pages modified — no QA Lead mentioned, no `qa_verdict`, no security review
- Session file `2026-04-19-ceo-wave0-wave1-complete.md`: 17 API routes, 8 frontend pages, 7 Inngest functions shipped — quality gates listed are `pnpm typecheck` + `pnpm build`. No QA Lead, no security audit, no test coverage check
- `qa-lead.md` line 79: PASS requires `>60%` test coverage for new code — the session record shows the test suite was explicitly deferred to Wave 2
- No `AUDIT_LOG.md` file exists in `.claude/memory/` (required by ceo.md line 401 and build-lead.md line 261) — confirms the audit gate has never been triggered

**Impact:** Security vulnerabilities and untested code shipping to main without any formal gate. The Wave 1 build (17 API routes, payments, Paddle webhooks) merged without any OWASP check. This is a Stripe/payments-adjacent codebase — missing auth checks on a single route could be catastrophic.

**Recommendation:** Two changes required. (1) QA Lead must be invoked as a separate agent pass — not a field in the build lead's self-reported JSON. (2) Add a real `AUDIT_LOG.md` append as a build-lead post-commit hook that's visible and reviewable, or move QA to a mandatory pre-merge step the user confirms.

---

### F4 — P1 | COLOR COLLISION — MULTIPLE AGENTS SHARE THE SAME COLOR

**Finding:** The color system as defined in CLAUDE.md creates visual disambiguation. But several agents share colors, making parallel session identification impossible in practice.

**Evidence:**
- `frontend-developer.md` frontmatter: `color: pink`
- `design-lead.md` frontmatter: `color: pink`
- Both are spawned by Build Lead and Design Lead respectively — running them in parallel would be indistinguishable

- `test-engineer.md` frontmatter: `color: green` (but CLAUDE.md routing table says `yellow`)
- `product-lead.md` frontmatter: `color: green`
- Both green — different roles, same color badge

- `backend-developer.md` frontmatter: `color: blue`
- `build-lead.md` frontmatter: `color: blue`
- Lead and its primary worker are the same color — impossible to distinguish a build-lead session from a backend-developer session

- `security-engineer.md`: `color: red` — same as `qa-lead.md`: `color: red`
- `researcher.md`: `color: purple` — same as `research-lead.md`: `color: purple`
- `code-reviewer.md` frontmatter says `color: orange`, body says `Set session identity: /color gray`
- `design-critic.md` frontmatter: no `color` in the identity_setup step — it says `/color gray` in the body

**Impact:** Visual identity system fails its purpose. When running 3+ parallel agents (common in Complex-tier tasks), the user cannot distinguish which session is which at a glance.

**Recommendation:** Deduplicate all colors. Lead and its workers must never share a color. Create a canonical color-to-agent mapping and enforce it in frontmatter.

---

### F5 — P1 | DEVIATION RULES EXIST IN WORKERS BUT NOT IN LEADS OR CEO

**Finding:** `backend-developer.md` (lines 103-111) and `frontend-developer.md` (lines 169-176) have explicit `<deviation_rules>` blocks (Rules 1-4: auto-fix bugs, auto-add missing functionality, auto-fix blocking issues, stop for architectural changes). The `executor.md` has a similar set (lines 111-181). However, no lead agent has deviation rules. This means if a lead encounters an unexpected blocker while exploring the codebase (before workers are dispatched), there is no protocol for whether to auto-fix, escalate, or stop.

**Evidence:**
- `build-lead.md`: no `<deviation_rules>` block anywhere — 263 lines read completely
- `design-lead.md`: no deviation rules — 671 lines read completely
- `qa-lead.md`: no deviation rules
- `ceo.md`: has a `FAILURE BUDGET: Max 3 retries` rule (line 400) but no behavioral deviation taxonomy

**Impact:** Leads either stop unnecessarily on trivial blockers (wasting turns), or make ad-hoc decisions that should have been escalated. The deviation taxonomy in workers is one of the better-documented patterns in the system — its absence at the lead layer is an inconsistency.

**Recommendation:** Add `<deviation_rules>` to all lead agents. Leads should have Rule 4 equivalents: "If codebase exploration reveals architectural assumptions in the brief are wrong, return BLOCKED immediately — do not attempt to re-plan alone."

---

### F6 — P1 | LEAD OVERLAP IS REAL AND UNRESOLVED

**Finding:** Three pairs of agents have significant domain overlap with no documented boundary:

**Pair A — qa-lead vs code-reviewer:**
- `qa-lead.md` dispatches `code-reviewer` as a sub-worker (implied in build-lead.md line 163)
- `code-reviewer.md` has an independent spawn path: "Called by Build Lead before merge, or directly via /review command"
- Both check security issues: qa-lead checks OWASP; code-reviewer checks P1 security issues
- No document defines which to call first or when to use one vs both

**Pair B — research-lead vs product-lead:**
- `research-lead.md` reads `USER-INSIGHTS.md` and updates it
- `product-lead.md` also reads `USER-INSIGHTS.md` and bases specs on it
- Research Lead can dispatch `researcher` for "user research"
- Product Lead can dispatch `researcher` for "specific user research question when USER-INSIGHTS.md is insufficient"
- The boundary ("when is user research a Research Lead task vs a Product Lead task") is undefined

**Pair C — build-lead vs devops-lead:**
- `build-lead.md` handles deployments in `merge_and_cleanup` (merges to main)
- `devops-lead.md` handles "path from merged code to production"
- Both have Vercel in scope; the exact handoff point is implicit (after merge to main) but not documented as a hard rule

**Evidence:**
- `build-lead.md` line 163: lists `qa-lead` as "MANDATORY security + test gate" — but also lists `code-reviewer` as a worker it dispatches
- `code-reviewer.md` line 14: "Called by Build Lead before merge, or directly via /review command"
- `research-lead.md` line 34: "Read `.claude/memory/USER-INSIGHTS.md` before dispatching. Don't duplicate existing research"
- `product-lead.md` line 31: "Read `.claude/memory/USER-INSIGHTS.md` — MANDATORY before writing any spec"

**Impact:** In practice, the overlap causes either agent being skipped (assuming the other covered it) or redundant work. The Wave 1 build did both without either explicitly being called.

**Recommendation:** Document explicit handoff points: code-reviewer runs first (diff quality), qa-lead runs second (security + test gates). For research vs product: research-lead owns discovery of new insights; product-lead consumes them. Write the boundary in AGENTS.md.

---

### F7 — P1 | BRIEF QUALITY: ZERO STRUCTURED BRIEFS IN SESSION RECORD

**Finding:** The CEO agent file (ceo.md lines 147-165) defines a 12-field structured brief format with explicit fields: Agent, Agent file, Session identity, Worktree context, Goal, Context, Constraints, Success Criteria, Skills to load, MCPs available, Return format, Documentation. Examining actual session outputs and the handoff document: no session file contains evidence that this brief structure was passed to workers. Workers appear to be dispatched with narrative instructions or implicit context.

**Evidence:**
- `2026-04-19-auth-rebuild-exec.md`: No brief header, no structured fields — the session record shows the worker's output directly with no incoming brief documented
- `2026-04-06-marketing-showcase-handoff.md`: This IS a CEO-written handoff, but uses free-form narrative prose (not the 12-field brief format). Fields like "Skills to load" and "MCPs available" are absent. The "What to Do Next" section is conversational, not structured.
- `2026-04-19-ceo-wave0-wave1-complete.md`: References wave batches of workers but no individual worker briefs are visible — workers appear dispatched inline without the structured brief template
- The design-lead session (`2026-03-17`) contains no reference to receiving a structured CEO brief

**Brief Quality Scores (scored 1-5 on structure + specificity):**

| Session | Brief Evidence | Score | Deficiency |
|---------|---------------|-------|------------|
| `2026-04-19-auth-rebuild-exec.md` | Worker output only — no brief visible | 1/5 | Missing all 12 brief fields; no success criteria, no MCPs listed, no skills |
| `2026-04-06-marketing-showcase-handoff.md` | CEO handoff present but free-form narrative | 2/5 | No structured fields; "Skills to load" absent; success criteria implicit |
| `2026-03-17-design-lead-dashboard-redesign.md` | Session output — no incoming brief | 1/5 | Minimal YAML (date, agent, task, status) — no CEO brief evidence |

**Impact:** Workers operating on vague briefs produce inconsistent outputs. The brief structure in ceo.md is well-designed — but if it's never actually used, it provides no value. The entire quality guarantee of the system rests on structured briefs.

**Recommendation:** Enforce structured brief logging. Add a rule: the CEO's session file MUST include the full brief sent to each lead as a quoted block. This creates an audit trail and forces the CEO to actually fill in all fields before dispatching.

---

### F8 — P2 | SKILLS DISCOVERY SYSTEM HAS TWO INCOMPATIBLE PATHS

**Finding:** CLAUDE.md (project instructions) says: "Read `.agent/skills/MANIFEST.json`". The CEO agent file says: "Read `.agent/skills/MANIFEST.json`". But the frontend-developer and design-lead say "Skills live in TWO directories: New skills: `.claude/skills/[name]/SKILL.md` — Original skills: `.agent/skills/[name]/SKILL.md`". This two-path system is not reflected in any MANIFEST, not documented in AGENTS.md, and creates real runtime confusion.

**Evidence:**
- `frontend-developer.md` lines 232-238: explicitly documents two skill directories — `.claude/skills/` for new skills, `.agent/skills/` for original 400+ library
- `frontend-developer.md` lines 236-237: "If a `.claude/skills/` path fails from a worktree, try: `cat '$(git worktree list | head -1 | awk '{print $1}')/.claude/skills/[name]/SKILL.md'`"
- `design-lead.md` lines 541-548: same two-directory warning with the same worktree path fix
- No other agent file mentions `.claude/skills/` — backend-developer, build-lead, qa-lead all reference only `.agent/skills/`
- CLAUDE.md skill discovery step references only `MANIFEST.json` — does not mention `.claude/skills/`

**Impact:** Backend developer, qa-lead, build-lead will never find the new design skills (emilkowal-animations, design-taste-frontend, high-end-visual-design, etc.) even when they need them. The `.claude/skills/` directory is functionally invisible to 70% of agents.

**Recommendation:** Consolidate all skills into one directory or update MANIFEST.json to index both. Add a note to every agent's `<recommended_skills>` section about the two-path system where relevant.

---

### F9 — P2 | RESEARCHER IS OPUS BUT HAS NO JUSTIFICATION IN MOST USE CASES

**Finding:** `researcher.md` is assigned `model: claude-opus-4-6`. The Research Lead (`research-lead.md`) is also Opus. This means a typical competitive research task runs two Opus agents (lead + 2-4 parallel researchers) — potentially 5x Opus instances. For most research tasks in early-stage SaaS (competitive pricing, feature comparison, market sizing), Sonnet 4.6 is sufficient. The Opus assignment follows a template decision from the GSA Startup Kit that hasn't been re-evaluated for Beamix's actual research needs.

**Evidence:**
- `researcher.md` frontmatter line 6: `model: claude-opus-4-6`
- `research-lead.md` frontmatter line 6: `model: claude-opus-4-6`
- CLAUDE.md model routing table: "Opus 4.6 — Depth work: sage (AI), guardian (security), rex (research)"
- AGENTS.md: "Research Lead | Opus 4.6" — "Researcher | Opus 4.6"
- The researcher's actual job (web search, official docs, structured output) does not require Opus-grade reasoning
- Cost delta: Opus ($5/M in, $25/M out) vs Sonnet ($3/M in, $15/M out) — research tasks that output structured findings tables are ~3x more expensive than they need to be

**Impact:** Unnecessary cost. Research Lead + 3 parallel Researchers on a typical competitive analysis = 4 Opus instances. At 50K tokens in/20K tokens out each, that's ~$12 per research session vs ~$4 with Sonnet.

**Recommendation:** Default researcher to Sonnet 4.6. Escalate to Opus only for deep synthesis tasks requiring genuine multi-step reasoning (market sizing with complex assumptions, technical architecture evaluation). Document the escalation trigger.

---

### F10 — P3 | SESSION FILE FORMAT IS INCONSISTENT ACROSS LAYERS

**Finding:** CEO session files (in `docs/08-agents_work/sessions/`) use a mix of formats. Some use the prescribed YAML frontmatter + structured body (as defined in ceo.md). Others are plain markdown narratives. The `.claude/memory/sessions/` directory uses a third format (minimal YAML with custom fields). This means session files cannot be reliably parsed by any agent reading them for context.

**Evidence:**
- `.claude/memory/sessions/2026-03-17-design-lead-dashboard-redesign.md`: custom YAML (date, agent, task, status, output, decisions, key_components, wcag, rtl, phase_1_files) — not the CEO-prescribed YAML schema
- `docs/08-agents_work/sessions/2026-04-19-ceo-wave0-wave1-complete.md`: free-form markdown with H2 headers — no YAML frontmatter at all
- `docs/08-agents_work/sessions/2026-04-19-auth-rebuild-exec.md`: YAML frontmatter with `date, agent, task, branch, status` then free-form H2 sections — partially correct
- CEO session schema (ceo.md lines 237-248): requires `date, lead, task, outcome, agents_used, decisions, context_for_next_session` — only one of the 29 actual sessions matches this schema

**Impact:** CEO reads session files in pre-flight to understand prior work. Inconsistent formats mean the CEO either reads stale context incorrectly or skips session files entirely. The `context_for_next_session` field (the most critical field for continuity) is missing from most actual sessions.

**Recommendation:** Enforce the YAML schema defined in ceo.md. Add a linting step or template file that workers must use. Consider retiring `.claude/memory/sessions/` (3 files) and consolidating all sessions into `docs/08-agents_work/sessions/` with the canonical format.

---

## Coverage Map

| Agent | Actual Usage (session evidence) | Spawns Others? | Overlaps With |
|-------|--------------------------------|----------------|---------------|
| **CEO** | 10+ sessions — primary orchestrator, heavily used | All leads | — |
| **build-lead** | Used — wave 0/1/2 builds visible in sessions | backend-dev, frontend-dev, db-eng, code-reviewer, qa-lead | devops-lead (merge boundary) |
| **research-lead** | 2 session records — `2026-03-24-war-room-research.md`, `2026-04-14-research-lead-geo-content.md` | researcher x2-4 | product-lead (USER-INSIGHTS.md) |
| **design-lead** | Used — `2026-03-13-design-homepage.md`, `2026-04-06` — design sessions | frontend-developer, design-critic, qa-lead | build-lead (code authority exception) |
| **qa-lead** | **NOT VISIBLE in any session** — zero invocations despite "mandatory" status | security-engineer, test-engineer | code-reviewer (security overlap) |
| **devops-lead** | `2026-04-07-ceo-scan-production.md` — 1 session | executor (GSD — unused) | build-lead |
| **data-lead** | `2026-03-18-data-supabase-reconciliation.md` — 1 session | database-engineer | research-lead |
| **product-lead** | `2026-03-20-product-ux-review.md`, `2026-04-14-product-notifications-export.md` | technical-writer, researcher | research-lead |
| **growth-lead** | `2026-04-14-growth-lead-content-plan.md` — 1 session | — | research-lead |
| **business-lead** | 0 sessions visible | — | research-lead, product-lead |
| **backend-developer** | Frequently used — Wave 0/1/2 API routes | — | — |
| **frontend-developer** | Frequently used — auth rebuild, Wave 1 UI | — | design-lead |
| **database-engineer** | Used in rethink migration session | — | data-lead |
| **ai-engineer** | 0 sessions visible | — | backend-developer |
| **security-engineer** | 0 sessions visible (qa-lead never called) | — | qa-lead, code-reviewer |
| **test-engineer** | 0 sessions visible — test suite deferred to Wave 2 | — | qa-lead |
| **code-reviewer** | 0 sessions visible | — | qa-lead |
| **researcher** | Used via research-lead | — | — |
| **technical-writer** | 0 sessions visible | — | — |
| **design-critic** | `2026-04-06-marketing-showcase-audit.md` — 1 session (operated autonomously, not as formal agent) | — | design-lead |
| **executor** | 0 sessions — GSD toolchain absent | — | build-lead |
| **planner** | 0 sessions — GSD toolchain absent | — | build-lead, product-lead |
| **debugger** | 0 sessions — GSD toolchain absent | — | build-lead |
| **verifier** | 0 sessions — GSD toolchain absent | — | qa-lead |
| **codebase-mapper** | 0 sessions — GSD toolchain absent | — | code-reviewer |
| **roadmapper** | 0 sessions — GSD toolchain absent | — | product-lead |
| **integration-checker** | 0 sessions — GSD toolchain absent | — | qa-lead |
| **plan-checker** | 0 sessions — GSD toolchain absent | — | — |
| **phase-researcher** | 0 sessions — GSD toolchain absent | — | researcher |
| **project-researcher** | 0 sessions — GSD toolchain absent | — | researcher |
| **research-synthesizer** | 0 sessions — GSD toolchain absent | — | research-lead |
| **nyquist-auditor** | 0 sessions — GSD toolchain absent | — | verifier |

**Observation:** 13 of 32 agents have zero usage evidence. All 12 GSD agents have zero usage — they are structurally broken. The qa-lead, security-engineer, test-engineer, and code-reviewer — all critical quality gates — have zero invocations.

---

## Brief Quality Sample

### Sample 1 — `2026-04-19-auth-rebuild-exec.md` (frontend-developer session)
**Score: 1/5**

The session file contains only the worker's output. No incoming brief is visible. We can infer the goal from the output ("rebuilt all four auth pages") but there is no documented: Skills to load, MCPs available, Constraints, Success Criteria, Worktree context, Return format. The worker did good output work — but there is no verifiable brief that produced it.

> *"Rebuilt all four (auth)/ pages from Wave 1 stubs to professional SaaS quality."*

Missing: explicit success criteria, skill loading confirmation, QA checkpoint, security review, return format compliance.

---

### Sample 2 — `2026-04-06-marketing-showcase-handoff.md` (CEO-written handoff)
**Score: 2/5**

This handoff is the most structured document in the session corpus — it has sections for Current State, Files You Own, Design Rules, Known Issues, What to Do Next. However, it reads as a human-authored handoff memo, not the 12-field CEO brief format. Missing: Agent file path, Session identity instruction, explicit Skills to load list, MCPs available list, formal Return format, Documentation target.

> *"Your workflow: 1. Always take screenshots... 2. Use the inspiration images... 3. Deploy specialist teams..."*

Positive: specific enough to be actionable. Negative: not parseable as a structured brief — no field labels, just prose.

---

### Sample 3 — `2026-04-19-ceo-wave0-wave1-complete.md` (CEO session record)
**Score: 2/5**

The CEO session record documents what was accomplished in excellent detail — wave structure, commits, blockers. But it documents outcomes, not briefs. There is no record of what brief was passed to each worker before they started. The session file serves as a good handoff memo but fails as a brief quality record.

> *"Wave 1 — Full build (merged in 3 batches; all to main): Frontend pages... Backend — 17 API routes..."*

Positive: completeness of outcome documentation. Negative: no brief audit trail, no qa_verdict anywhere, AUDIT_LOG absent.

---

## Comparison to Industry Standards

**Anthropic's official multi-agent guidance (CLAUDE.md reference, multi-agent-patterns skill):**
- Recommends: explicit tool grants per agent, orchestrator-vs-subagent separation, structured return schemas
- This system: ✓ structured returns exist in all 9 core agents; ✗ GSD agents have incompatible schemas; ✗ tool grants are too broad (CEO has Bash + Write — enables direct code modification, which Layer Contract says it shouldn't do)

**BMAD-METHOD (Build, Model, Analyze, Deploy):**
- Recommends: agent roles tied to SDLC phases, clear handoffs with artifact contracts
- This system: ✓ phase coverage is good (product → build → qa → devops); ✗ artifact contracts are informal (session files are inconsistent)

**Spec-Kit patterns:**
- Recommends: machine-readable specs as input to workers (not prose briefs)
- This system: ✗ briefs are prose-dominant; product-lead writes PRDs but they are not consistently consumed as machine-readable input to build-lead

**What this system does better than most:**
- Deviation rules in workers (F5 — documented auto-fix vs escalate taxonomy)
- Worktree isolation protocol (well-specified, used in practice)
- MOC-based knowledge navigation (docs/00-brain/ — unique and useful)
- Layered memory files (DECISIONS.md, LONG-TERM.md, USER-INSIGHTS.md)

**What industry benchmarks have that this doesn't:**
- Independent QA enforcement (not self-reported)
- Automated brief validation (no schema enforcement at dispatch time)
- Cost tracking per agent per session (zero cost attribution in any session file)

---

## Bottom Line (5 bullets)

**KILL — 12 GSD execution agents** (executor, planner, verifier, debugger, codebase-mapper, roadmapper, integration-checker, plan-checker, phase-researcher, project-researcher, research-synthesizer, nyquist-auditor): All are broken (depend on `gsd-tools.cjs` binary that doesn't exist), have never been used, and create false confidence in a structured execution backbone that is absent. Remove from AGENTS.md and delete the files.

**KEEP — Core 3-layer structure** (CEO + 9 Leads + 9 Workers): The fundamental hierarchy is sound and in active use. CEO orchestration, wave-based build execution, build-lead/backend-developer/frontend-developer workflow — all are battle-tested in 29 sessions. Do not rebuild; fix the 10 specific issues found.

**MERGE — qa-lead + code-reviewer into a single "quality gate" agent**: Two agents with overlapping scope (both do security checks, both run on changed files, both produce PASS/BLOCK verdicts) creates routing ambiguity and causes both to be skipped in practice. A single `quality-lead` that runs security (OWASP) + code review (P1/P2/P3) + test coverage in sequence would be cleaner and more likely to actually be invoked.

**REWRITE — frontend-developer.md, design-lead.md** (F2 — wrong paths) and **ceo.md brief dispatch section** (F7 — briefs are not being logged): These two rewrites have the highest immediate impact. The path bug (saas-platform → apps/web) is a silent P0. The brief logging requirement is the systemic fix for the quality audit trail problem.

**ADD — Independent QA enforcement checkpoint**: The QA gate must not be self-reported. Add a mandatory step: after Build Lead returns, CEO must independently call QA Lead and verify `qa_verdict: PASS` appears in the QA Lead's own session file (not the Build Lead's JSON). Add `AUDIT_LOG.md` enforcement — no merge session file is valid without a corresponding AUDIT_LOG entry.

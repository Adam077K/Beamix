# WS6 Research — Skills Proposal Matrix

## Method

Queried `.agent/skills/MANIFEST.json` (423 entries) via `jq .skills[].name`, then grep-filtered the full name list in 6 keyword passes (competitive, orchestration, seo/geo, deploy/test/security, content/planning, memory/parallel). No full SKILL.md reads required — name matching was sufficient. ~40 candidate names surfaced; trimmed to best-fit per agent.

---

## 11 Routines

**1. Advisor Daily Thinking** — `deep-research`, `multi-agent-brainstorming`, `prompt-engineering`

**2. Morning Digest** — `team-collaboration-standup-notes`, `agent-memory-mcp`, `concise-planning`

**3. Competitor Pulse** — `competitive-landscape`, `search-specialist`, `deep-research`

**4. GEO Algorithm Signal** — `geo-fundamentals`, `seo-fundamentals`, `deep-research`

**5. CTO Daily Plan** — `dispatching-parallel-agents`, `agent-orchestration-multi-agent-optimize`, `concise-planning`

**6. Content Idea Generator** — `seo-content-planner`, `copywriting`, `competitive-landscape`

**7. Monday Standup** — `team-collaboration-standup-notes`, `concise-planning`, `product-manager-toolkit`

**8. Friday Retro** — `team-collaboration-standup-notes`, `startup-metrics-framework`

**9. EOD Sync** — `team-collaboration-standup-notes`, `agent-memory-mcp`, `concise-planning`

**10. Auto-Unblock** — `agent-orchestration-improve-agent`, `error-handling-patterns`, `workflow-orchestration-patterns`

**11. Synthesizer** — `multi-agent-brainstorming`, `architecture-decision-records`, `prompt-engineering`

---

## 6 Worker Types

**parallel-builder** — `nextjs-app-router-patterns`, `backend-development-feature-development`, `error-handling-patterns`

**parallel-researcher** — `deep-research`, `search-specialist`, `competitive-landscape`

**parallel-critic** — `code-review-excellence`, `architect-review`, `multi-agent-brainstorming`

**parallel-tester** — `playwright-skill`, `e2e-testing-patterns`, `testing-qa`

**parallel-deployer** — `vercel-deployment`, `deployment-procedures`, `error-handling-patterns`

**parallel-watcher** — `agent-orchestration-improve-agent`, `api-testing-observability-api-mock`, `workflow-orchestration-patterns`

---

## 4 Personas

**Visionary** — `startup-business-analyst-market-opportunity`, `multi-agent-brainstorming`

**Strategist** — `startup-metrics-framework`, `competitive-landscape`

**Architect** — `architecture-decision-records`, `software-architecture`

**Aria** — `security-audit`, `api-security-best-practices`

---

## Ambiguity Flags

- **Advisor Daily Thinking** — `multi-agent-brainstorming` vs. `agent-orchestration-multi-agent-optimize`: Pick brainstorming if Advisor is pure synthesis; pick optimize if Advisor also coordinates downstream Routine fires.
- **Competitor Pulse** — `deep-research` vs. `search-specialist`: At $0.40/fire, prefer `search-specialist` (fast, targeted). Use `deep-research` only if synthesis depth matters more than cost.
- **GEO Algorithm Signal** — `geo-fundamentals` + `seo-fundamentals` together vs. `geo-fundamentals` alone: Loading both burns weekly tokens. Use `geo-fundamentals` alone unless GEO-only framing proves too narrow.
- **parallel-critic** — `architect-review` vs. `code-review-excellence`: `code-review-excellence` for PR review; `architect-review` for system design / ADR critique.
- **Visionary persona** — `startup-business-analyst-market-opportunity` vs. `market-sizing-analysis`: Narrative-first horizon thinking → market-opportunity. TAM/SAM/SOM numbers for board decks → market-sizing-analysis.

---

## Skills Inventory Check

MANIFEST.json contains 423 entries; queried ~40 by name-grep across 6 keyword passes. All skill names cited verified present in MANIFEST.json. No `(unverified)` prefixes needed.

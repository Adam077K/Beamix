# WS6 Research — MCP Grant Matrix (Least-Privilege)

## Method

Baseline: ORCHESTRATION.md §2E per-Routine grants table. Each grant evaluated against the agent's `Reads` / `Outputs` in ROUTINE-ROSTER.md and the §2A spawning matrix. Rule: grant only what is required for documented reads/writes. Persona agents (board-meeting only, all data in-context) receive zero or one MCP each.

## Grant matrix

| Agent | Linear | Supabase | Mem0 | GitHub | Context7 | Playwright | Web | Notes |
|---|---|---|---|---|---|---|---|---|
| 1. Advisor Daily Thinking | ✓ | ✓ | ✓ | × | × | × | ✓ | Supabase: audit_log read |
| 2. Morning Digest | ✓ | × | ✓ | × | × | × | × | — |
| 3. Competitor Pulse | ✓ | × | ✓ | × | × | × | ✓ | — |
| 4. GEO Algorithm Signal | ✓ | ✓ | ✓ | × | × | × | ✓ | Supabase: read scan_results |
| 5. CTO Daily Plan | ✓ | ✓ | ✓ | × | × | × | × | Supabase: audit_log + pgvector RAG |
| 6. Content Idea Generator | ✓ | × | ✓ | × | × | × | ✓ | Output: Linear tickets |
| 7. Monday Standup | ✓ | × | ✓ | × | × | × | × | — |
| 8. Friday Retro | ✓ | ✓ | ✓ | ✓ | × | × | × | Supabase: WS2 Errata 3; GitHub: read-only commits |
| 9. EOD Sync | ✓ | ✓ | × | ✓ | × | × | × | GitHub: today's commits (read-only) |
| 10. Auto-Unblock | ✓ | ✓ | ✓ | × | × | × | × | Supabase: audit_log trail |
| 11. Synthesizer | ✓ | ✓ | ✓ | × | × | × | × | Supabase: pgvector + DECISIONS.md write |
| parallel-builder | ✓ | ✓ | × | ✓ | ✓ | × | × | GitHub: PR creation; no merge_pull_request |
| parallel-researcher | × | × | ✓ | × | ✓ | × | ✓ | No operational writes |
| parallel-critic | ✓ | × | × | ✓ | × | × | × | GitHub: diff read only |
| parallel-tester | × | ✓ | × | ✓ | × | ✓ | × | Playwright: E2E; Supabase: test fixtures |
| parallel-deployer | × | ✓ | × | ✓ | × | × | × | No merge_pull_request — QA gate structural |
| parallel-watcher | × | ✓ | × | × | × | × | × | Read-only: audit_log + claude_progress |
| Visionary (persona) | × | × | × | × | × | × | × | Board meeting only; all data in-context |
| Strategist (persona) | × | × | × | × | × | × | × | — |
| Architect (persona) | × | × | × | × | ✓ | × | × | Context7 for BOM estimates |
| Aria (persona) | × | × | × | × | × | × | ✓ | WebFetch vendor pricing/SLA |

## Per-agent rationale

**R1 Advisor:** needs Supabase for first-party audit_log signals not in Linear. **R2 Morning Digest + R7 Monday Standup:** Linear + Mem0 sufficient; all inputs already structured there. **R3 Competitor Pulse + R6 Content Ideas:** WebFetch for external data; no DB writes. **R4 GEO Signal:** Supabase needed to read Beamix's own scan_results (first-party SERP data). **R5 CTO Plan:** pgvector RAG rides the Supabase grant; no GitHub needed (no commit reads in spec). **R8 Friday Retro:** Supabase added per WS2 Errata 3 (audit_log incident query); GitHub read-only commits. **R9 EOD Sync:** same GitHub pattern; Mem0 not in spec. **R10 Auto-Unblock:** Supabase audit_log trail to diagnose stuck Routine; no web. **R11 Synthesizer:** pgvector write to DECISIONS.md; no GitHub or web.

**Workers:** parallel-builder gets Context7 for library lookups during impl. parallel-tester is the only worker with Playwright. parallel-deployer never gets `merge_pull_request` — QA gate is structural (§2A). parallel-watcher: read-only Supabase only.

**Personas:** Three of four have zero grants (in-context data). Architect: Context7 to ground BOM against real library docs. Aria: WebFetch for live vendor pricing/SLA checks during procurement review.

## Cross-cutting concerns

**Telegram:** Routines 1, 2, 3, 5, 9, 10, 11 deliver to Telegram via HTTP to `notify.beamix.tech` (Cloudflare Worker) — not an MCP. `TELEGRAM_BOT_TOKEN` in Cloudflare secret store only.

**pgvector RAG:** R5 and R11 use pgvector — rides the Supabase grant. WS6 .md files annotate: "Supabase: includes pgvector RAG."

**Mem0 fallback:** All 9 agents with Mem0 must fall back to Anthropic Memory Tool on `mcp__mem0__*` failure. Log and continue (per mem0-outage runbook).

## Ambiguity flags

- **parallel-researcher — Linear read:** A: grant Linear read (reduces parent verbosity). B: deny; parent passes ticket context. Trade-off: isolation vs. convenience.
- **parallel-builder — Supabase scope:** A: service-role (full DDL). B: read-only; migrations to parallel-deployer only. Trade-off: simplicity vs. blast-radius separation.
- **EOD Sync — Mem0 write:** A: grant Mem0 for clean episodic chain to Morning Digest. B: deny; Morning Digest reads the Linear ticket. Trade-off: tighter memory vs. avoid dual-write.
- **Competitor Pulse — Playwright:** A: grant for JS-rendered pages. B: WebFetch only; accept coverage gap. Trade-off: coverage vs. capability scope.
- **Architect persona — Supabase read:** A: read-only for live schema grounding. B: deny; parent passes schema snippets. Trade-off: accuracy vs. zero persona MCP footprint.

## Verification

Matrix contains 21 rows: 11 Routines + 6 worker types + 4 personas — count confirmed.

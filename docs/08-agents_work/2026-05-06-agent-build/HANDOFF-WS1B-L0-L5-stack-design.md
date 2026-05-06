# Hand-off Prompt — Workstream 1B (L0-L5 Memory Stack Design)

**Audience:** the next team / next Claude Code session that picks up the Beamix war-room build.
**Date prepared:** 2026-05-06 by CEO session (post WS1A Adam-review).
**Status:** approved by Adam — ready to copy-paste into a fresh `/agent ceo` or `claude` session.
**Predecessor:** WS1A (memory tool re-evaluation) — recommendation locked: **Mem0, 2-phase (cloud → OSS self-host on Supabase)**.

---

## How to use this file

Copy the **prompt block at the bottom of this file** (`## Prompt to paste`) and paste it as your first message to a new Claude Code session. The session will load the right context, follow the right discipline, and produce the WS1B deliverables.

The prompt assumes the next session has access to the same Beamix repo. Run it from the repo root or any worktree.

---

## What's been done before WS1B

| File | What it is |
|------|-----------|
| `docs/08-agents_work/MEMORY-DECISION-MATRIX.md` | WS1A output — locked L2 = Mem0, 2-phase plan |
| `docs/08-agents_work/sessions/2026-05-06-ceo-ws1a-memory-tools.md` | WS1A session file with cost log + open Qs |
| `.claude/memory/DECISIONS.md` (latest entry) | WS1A decision PROPOSED → review → APPROVED |
| `docs/08-agents_work/2026-05-06-agent-build/RESEARCH-WS1A-memory-tools-A.md` | Letta/Mem0/Zep findings |
| `docs/08-agents_work/2026-05-06-agent-build/RESEARCH-WS1A-memory-tools-B.md` | Cognee/OpenAI/Anthropic/Custom findings |
| `docs/08-agents_work/2026-05-06-agent-build/PLAN-deep-design-war-room.md` | The master plan. WS1B = §Workstream 1, sub-phase 1B |
| `docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-CORPORATE-OS.md` | The strategic frame |
| `docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-ENVIRONMENT-MAP.md` | 8-layer environment map (memory is L0-L5 within it) |
| `docs/08-agents_work/2026-05-06-agent-build/RESEARCH-03-agent-md-best-practices-2026.md` | Agent .md spec (memory access pattern feeds into every agent) |

## What WS1B produces (your deliverables this phase)

Per `PLAN-deep-design-war-room.md` §Workstream 1, sub-phase 1B — **design the L0-L5 memory stack with concrete tool per layer.**

### The 6-layer stack (locked taxonomy from V4 + WS1A)

| Layer | What it is | Tool (locked or to-decide) |
|-------|-----------|---------------------------|
| **L0** | Boot context — project conventions every agent loads | `CLAUDE.md` ≤ 200 lines (no tool — pure discipline) |
| **L1** | Session memory — within one Claude Code session | Claude Code session + auto-`/compact` at 70% (no new tool) |
| **L2** | Cross-session episodic — "what happened last time" | **Mem0 (locked WS1A) — Phase 1 cloud → Phase 2 OSS** |
| **L3** | Project facts — PRD, ENGINEERING_PRINCIPLES, brain MOCs, decisions | **pgvector RAG corpus on Supabase** (your job to design) |
| **L4** | Skills — 423 SKILL.md files with embeddings | **pgvector embedding-search via `tool_search` MCP** (your job to design — replaces 42K-token MANIFEST.json discovery) |
| **L5** | Codebase — code-symbol search, "where is X defined" | **pgvector index of `apps/web/src/**`** (your job to design) |

### What WS1B must produce

**A. Per-layer contracts (the actual deliverable).** For each of L0-L5, write:
- **Write contract:** who writes, what schema, when, with what provenance/confidence metadata
- **Read contract:** who reads, when (pre-flight vs on-demand), with what query, with what top-K + recall@5 target
- **Tool wiring:** concrete MCP server config or library binding for the layer
- **Eviction / lifecycle:** TTL, when entries expire or compact, supersession behavior

**B. The integration-shape proof for L2 (Phase 1).** Wire `https://mcp.mem0.ai/mcp` into Claude Code via `npx mcp-add` (single command), pilot ONE subagent (suggest: a stub WS6 agent or the existing CEO draft) writing + reading. Capture:
- Whether the issue #3400 stability problem reproduces in our setup
- Whether the smart-dedup behavior actually solves "DECISIONS.md is write-only theater"
- Whether mid-session retrieval latency (claimed p95 1.44s by Mem0) is acceptable for solo-founder UX

**C. The migration plan to Phase 2 OSS (specification only — execution happens in WS1F).** Spec the Mem0 OSS Docker bootstrap, the Supabase Postgres+pgvector connection, hosting target (Vercel container vs Cloudflare container vs Railway vs Bastion), and the row-migration approach.

**D. The WS1B output document (`docs/08-agents_work/MEMORY-ARCHITECTURE.md`).** One single coherent design doc that an agent can read in 10 minutes and know exactly:
- which layer to query for what
- what to write where
- what schema to use
- what NOT to put in memory

**E. Updated `.mcp.json` (proposed only; do not commit until Adam approves).** Mem0 cloud MCP entry. Worktree-only until reviewed.

**F. Session file** at `docs/08-agents_work/sessions/<today>-[lead]-ws1b-l0-l5-stack-design.md`.

**G. DECISIONS.md entry** noting the per-layer tool choices + rationale + reversibility, status PROPOSED — pending Adam review.

## What you must NOT do in WS1B

- Do NOT touch `.claude/agents/` (WS6's territory)
- Do NOT start WS1C-1F (sub-phases that come after Adam approves 1B)
- Do NOT execute the Phase 2 OSS migration — that's WS1F, after WS6A validates real Mem0 usage
- Do NOT skip the per-workstream methodology (research → design → Adam review → halt)
- Do NOT exceed the $30 cost cap for this workstream
- Do NOT write more files than the deliverables above
- Do NOT relitigate the L2 = Mem0 decision; it's locked. If you find a fatal flaw, escalate to Adam — do not silently swap tools
- Do NOT touch the existing 95-line CLAUDE.md project file or the 270-line MEMORY.md until WS1F migration phase

## Hard constraints

- **Cost cap:** $30 of API spend for WS1B. Halt + escalate if approaching.
- **Time-box:** designing L3/L4/L5 ingestion pipelines — hard-stop at 30 min per layer; if a layer can't fit a clean read/write contract in that window, mark "DEFERRED to WS1C" and move on
- **Decision before opinion:** the per-layer tool choice for L3/L4/L5 must score on objective criteria (existing pgvector vs Pinecone vs Qdrant vs custom) before committing
- **Halt at Adam-review:** after producing the architecture spec + Phase 1 smoke-test results, post a brief summary to chat: "WS1B done, here's the architecture, awaiting your call to proceed to WS1C/WS1D."
- **No agent .md edits.** WS1B writes specs and config only.

## Beamix context the next session needs to know

- **Stack:** Next.js 16 monorepo (turborepo + pnpm), Supabase (paid, has pgvector available), Vercel, Paddle, Resend, Inngest, OpenRouter (legacy), Anthropic Claude Max ($100/mo)
- **Bastion:** Adam's 8GB home Mac. Per V4: acceleration only, NOT critical path. Don't put L3/L4/L5 retrieval on it.
- **Cost ceiling:** $20-50/mo new spend allowed total across WS1-5. Existing $155/mo (Vercel/Supabase/Paddle/Resend/Inngest) doesn't count.
- **Existing skills inventory:** ~423 skills in `.agent/skills/` — many high-quality (muratcankoylan + obra clusters are A-grade). MANIFEST.json is 42K tokens — every session re-reads it before any productive work, which is exactly the problem L4 solves.
- **Existing memory state (Audit B):** memory is "partially write-only theater." DECISIONS.md is read by 6 agents. LONG-TERM.md, CODEBASE-MAP.md, brain MOCs are orphaned. ZERO functional retrieval infrastructure. WS1B is the layer where that changes.
- **Existing brain folder:** `docs/00-brain/` has MOC files (`MOC-Product.md`, `MOC-Architecture.md`, etc.) plus `_INDEX.md` and `log.md`. Currently unread by agents — L3 should fix that.

## Decision criteria (per-layer)

For each of L3, L4, L5 (the new pgvector layers), score the design on:

1. **Embedding model choice** — `text-embedding-3-small` ($0.02/M tokens, fast, dim 1536) vs `text-embedding-3-large` ($0.13/M, dim 3072) vs Voyage AI vs all-MiniLM-L6-v2 local. Pick once and use across all 3 layers unless there's a specific reason to differ. Cite expected $/mo cost.
2. **Chunking strategy** — per-corpus. Code (per-function or per-file), markdown (per-section or per-document), skills (per-skill, MANIFEST.json metadata + body). Cite recall trade-off.
3. **Re-embedding triggers** — Inngest job on git commit (which paths trigger which layer's re-embed)
4. **Retrieval API shape** — MCP tool name, input schema, output schema, top-K default, recall@5 target
5. **Where the index lives** — Supabase pgvector tables (preferred per V4 — already paid). Specify table names, columns, index types (HNSW vs IVFFlat).
6. **Pre-flight read budget** — agents must NOT read all 6 layers in pre-flight. Specify per-layer "default" pre-flight reads vs on-demand reads. Most agents should pre-load only L0 + L2 (last-N most recent episodic) and call L3/L4/L5 on-demand via MCP.

For L0 + L1: the design is mostly about discipline (max line counts, when to compact). For L2: Phase 1 cloud bring-up is mostly an integration-test exercise.

## Output format

```markdown
# WS1B — L0-L5 Memory Architecture

## Methodology
[1 paragraph]

## Stack at a glance
| Layer | Tool | Where it lives | Read cadence | Write cadence |
|-------|------|----------------|--------------|---------------|
| L0 | CLAUDE.md | git | Pre-flight all agents | Adam + CEO only |
| L1 | Claude Code session | runtime | Continuous | Continuous |
| L2 | Mem0 (Phase 1 cloud) | mcp.mem0.ai | On-demand via MCP | After every session |
| L3 | pgvector RAG corpus | Supabase | On-demand via MCP | Inngest on git commit |
| L4 | Skills embeddings | Supabase | On-demand via tool_search MCP | Inngest on SKILL.md change |
| L5 | Codebase index | Supabase | On-demand via code_search MCP | Inngest on PR merge |

## Per-layer design
### L0 — Boot context
**Write contract:** [...]
**Read contract:** [...]
**Eviction:** [...]
[repeat for L1-L5]

## Phase 1 Mem0 cloud bring-up — smoke test results
**Stability of issue #3400:** [reproduces / does not reproduce]
**Smart-dedup behavior:** [observation]
**p95 latency:** [measurement]
**Verdict:** [proceed to WS1D / fall back to alternative]

## Phase 2 Mem0 OSS migration — specification (execution in WS1F)
**Hosting target:** [Vercel container / Cloudflare container / Railway / Bastion — pick one with $/mo]
**Supabase connection:** [schema name, table prefix, pgvector index type]
**Migration plan:** [Postgres dump/restore steps, MCP endpoint swap]

## Embedding model choice (locked for L3/L4/L5)
**Model:** [name]
**Cost projection:** [$/mo at solo-founder volume]
**Sources:** [URL + date]

## Open questions for Adam
[Things that didn't resolve in design and need his input before WS1C/WS1D start]

## Sources
[URL + date for every numerical claim]
```

Write that to `docs/08-agents_work/MEMORY-ARCHITECTURE.md` (this is the WS1B artifact — WS1C/WS1D/WS1E/WS1F build on it).

---

## Prompt to paste

Copy everything below this line into a new Claude Code session.

---

```
You are continuing the Beamix war-room build. Adam approved WS1A (L2 memory tool = Mem0, 2-phase plan: cloud first, OSS self-host migration later). You are starting **WS1B — design the L0-L5 memory stack with concrete tool per layer**.

**Read these files in this order before any other action:**
1. `docs/08-agents_work/2026-05-06-agent-build/HANDOFF-WS1B-L0-L5-stack-design.md` — your hand-off (this file). Constraints, deliverables, decision criteria.
2. `docs/08-agents_work/MEMORY-DECISION-MATRIX.md` — WS1A output. L2 is locked to Mem0 (2-phase). Do NOT relitigate.
3. `docs/08-agents_work/2026-05-06-agent-build/PLAN-deep-design-war-room.md` — the master plan. You are at WS1B in §Workstream 1.
4. `docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-ENVIRONMENT-MAP.md` — the 8-layer environment map. Memory layers L0-L5 sit inside this map's Layer 6 (Skills/Memory/Knowledge).
5. `.claude/memory/DECISIONS.md` (most recent WS1A entry) — the locked decision you build on.
6. The Audit B context: memory is "partially write-only theater"; DECISIONS.md is the only file 6 agents read; LONG-TERM.md and CODEBASE-MAP.md are orphaned; zero retrieval infrastructure exists; every session re-reads the 42K-token MANIFEST.json. WS1B is the workstream that fixes this.

**Your one job for this session:** produce `docs/08-agents_work/MEMORY-ARCHITECTURE.md` per the format in the hand-off file. Define the L0-L5 stack with per-layer write contracts, read contracts, tool wiring, and eviction rules. Smoke-test Mem0 cloud (Phase 1) on one Claude Code subagent end-to-end. Spec the Phase 2 OSS migration (do NOT execute it). Halt at Adam-review.

**Hard constraints:**
- $30 cost cap on this session.
- Hard 30-minute time-box per layer; if a clean contract for L3/L4/L5 can't be designed in that window, mark "DEFERRED to WS1C" and move on.
- Do NOT touch `.claude/agents/` (WS6's territory).
- Do NOT start WS1C-1F. Halt at Adam-review.
- Do NOT relitigate L2 = Mem0; it's locked. If you find a fatal flaw, escalate — don't silently swap.
- Do NOT execute the Phase 2 OSS migration — spec only. Migration happens in WS1F after WS6A validates real Mem0 usage.
- Do NOT touch CLAUDE.md or MEMORY.md until WS1F.
- Do NOT exceed the deliverables in the hand-off file.

**Methodology (per the plan):**
1. Research dispatch (only if needed) — 1-2 parallel Sonnet researchers to mine pgvector best practices, embedding-model cost projections, and `tool_search` MCP patterns. Time-box each researcher to 30 min.
2. Design dispatch — 1 design pass per layer. Use the format from the hand-off.
3. Phase 1 Mem0 smoke test — actually wire `mcp.mem0.ai/mcp` to Claude Code on one subagent and exercise it. Capture latency, dedup behavior, issue #3400 status.
4. Phase 2 OSS migration spec — write the recipe, do not execute.
5. Halt at Adam-review — write the architecture file, write a session file, append a DECISIONS.md entry status PROPOSED — pending Adam review, post a brief summary to chat.

**When you finish:** stop. Do NOT proceed to WS1C/WS1D. Just deliver:
- `docs/08-agents_work/MEMORY-ARCHITECTURE.md`
- Phase 1 smoke-test results inside that doc
- Phase 2 OSS migration spec inside that doc
- A session file
- A DECISIONS.md entry status PROPOSED
- A summary in chat: "WS1B complete. Architecture = X. Phase 1 smoke result = Y. Awaiting your call to proceed to WS1C/WS1D."

**Anti-bias notes:**
- Don't over-engineer L3/L4/L5. Beamix has ~95 docs files, 423 skills, and ~30K LOC in apps/web/src — a single shared embedding model + 3 well-named pgvector tables on the existing Supabase is enough. Resist adding Pinecone/Qdrant/Weaviate when pgvector is already paid for.
- Don't make agents pre-flight all 6 layers. Pre-flight should be tiny (L0 + last-N L2). L3/L4/L5 are MCP-callable on-demand. Per R3 best practice, "front-load only what you need."
- Don't design for hypothetical scale. If a decision matters at 10K customers but not at 10, defer it. Inngest re-embed jobs can stay simple (one job per corpus, fires on git commit) — this is not a search company, just a startup that needs better memory.

Begin by reading the 6 files listed above. Confirm in chat that you've read them and that you understand WS1B's scope. Then proceed to design — research only if a specific layer's tool choice requires external sourcing.
```

---

## After WS1B completes

When the next session returns the architecture spec + Phase 1 smoke results:

1. Adam reviews the architecture.
2. If approved → **WS1C** starts (RAG corpora & ingestion design — chunking, embedding, re-embedding triggers per corpus). **WS1D** can run in parallel (write contracts: schema, provenance, confidence, expiry, supersession).
3. If rejected → next session iterates with Adam's pushback (max 3 cycles per the plan's methodology).

**The remaining WS1 sub-phases:**
- WS1C — RAG corpora & ingestion (chunking strategy, re-embedding triggers, embedding model choice — this might be partially done in WS1B if you have time)
- WS1D — Memory write contracts (provenance, confidence, expiry, supersession schema)
- WS1E — Memory read contracts (per-agent mental model — input to WS6)
- WS1F — Migration plan from current state (compact CLAUDE.md, migrate DECISIONS.md to Supabase, archive orphan files, **execute Phase 2 OSS Mem0 migration**)

After WS1 is fully approved, WS2 (orchestration) starts. WS3 (tech stack) can run parallel to all of WS1.

**The whole sequence (per the master plan):**
WS1 (memory) → WS2 (orchestration) → [WS3 tech stack runs in parallel] → WS4 (connections) → WS5 (synthesis) → WS6 (agents tier-by-tier).

WS6 is the LAST workstream. Agents are designed against a stable platform.

---

**End of hand-off. Good luck to whoever picks this up.**

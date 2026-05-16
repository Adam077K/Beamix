# WS1B — L0-L5 Memory Architecture

**Date:** 2026-05-06
**Workstream:** WS1B (Memory Architecture, Phase B — L0-L5 stack design)
**Status:** PROPOSED — pending Adam review
**Builds on:** WS1A — `docs/08-agents_work/MEMORY-DECISION-MATRIX.md` (L2 = Mem0, 2-phase, locked)
**Author:** CEO session (Sonnet 4.6 orchestrating; one Sonnet researcher dispatched for Mem0 install/issue verification)

---

## Methodology

WS1A locked L2 to Mem0 (2-phase: cloud → OSS). WS1B's job is to (a) put per-layer write/read/eviction contracts on each of the six memory layers, (b) prove the Phase 1 Mem0 cloud integration shape works end-to-end on a Beamix Claude Code subagent, and (c) write the Phase 2 OSS migration recipe without executing it. One Sonnet researcher verified the Mem0 install command, the current status of issue #3400, and the Hobby tier auth model. The CEO ran a partial smoke test (endpoint reachability + 401 round-trip latency from local Mac) without burning an API key, since the actual write/read exercise requires Adam to sign up at app.mem0.ai (5 min, no card). Anti-bias frame held throughout: pgvector tables on existing Supabase chosen over Pinecone/Qdrant/Weaviate because Supabase is already paid and the corpora are tiny (~95 docs files, 423 skills, ~30K LOC). Pre-flight reads kept tiny (L0 + last-N L2); L3/L4/L5 are MCP-callable on demand. Per-layer time-box was 30 min — all six layers fit comfortably; nothing is DEFERRED to WS1C.

---

## Stack at a glance

| Layer | What it is | Tool | Where it lives | Read cadence | Write cadence |
|-------|-----------|------|----------------|--------------|---------------|
| **L0** | Boot context — project conventions every agent loads | `CLAUDE.md` ≤ 200 lines | git (`/CLAUDE.md`) | Pre-flight, all agents | Adam + CEO only |
| **L1** | Session memory — within one Claude Code session | Claude Code session + auto-`/compact` at 70% | Anthropic runtime | Continuous | Continuous (model writes its own scratch) |
| **L2** | Cross-session episodic — "what happened last time" | **Mem0** (Phase 1 cloud, Phase 2 OSS) | `mcp.mem0.ai/mcp` → migrate to Mem0 OSS server pointed at Supabase pgvector | On-demand via MCP `search_memory` (default top-K=5); pre-flight only "last-N=10 by recency" for the current agent role | After every session (CEO writes a summary line via `add_memory`); per significant decision (any agent) |
| **L3** | Project facts — PRD, ENGINEERING_PRINCIPLES, brain MOCs, decisions | **pgvector RAG corpus** in Supabase | `memory.docs_chunks` table (HNSW index) | On-demand via `mcp_docs_search` MCP (default top-K=5) | Inngest job on git push to `docs/**`, `.claude/memory/DECISIONS.md` |
| **L4** | Skills — 423 SKILL.md files | **pgvector index** in Supabase | `memory.skill_chunks` table | On-demand via `mcp_skill_search` MCP (default top-K=3) — replaces 42K-token MANIFEST.json scan | Inngest job on git push to `.agent/skills/**` |
| **L5** | Codebase — code-symbol search | **pgvector index** in Supabase | `memory.code_chunks` table | On-demand via `mcp_code_search` MCP (default top-K=8); restricted to senior code workers | Inngest job on PR merge to `apps/web/src/**` |

**Pre-flight read budget per agent:** L0 (always) + L2 last-10 (always) = ~5K tokens total. L3/L4/L5 are tool calls — agents pay tokens only when they ask. This replaces the current 42K-token MANIFEST.json + orphaned `LONG-TERM.md`/`CODEBASE-MAP.md` reads with a discipline that costs ~$0.001/session of L4 search vs ~$0.14/session of MANIFEST grep.

---

## Per-layer design

### L0 — Boot context

**What it is.** The 200-line discipline file every agent reads on cold start. Conventions, stack, hard rules, the 6-layer memory map, agent identity (color/name), worktree protocol. Today's `/CLAUDE.md` is 343 lines (95 lines repo + ~250 lines team-system) — over budget. WS1F compacts it. Until then, L0 stays as-is and WS1B does NOT touch it (handoff constraint).

**Write contract.** Adam owns L0. CEO may propose edits via PR. No agent writes directly. Schema = pure markdown. No telemetry, no provenance — it's git-tracked and PR-reviewed.

**Read contract.** Every Claude Code session loads L0 automatically (it's a project-rooted CLAUDE.md). Agents do NOT re-read mid-session. Pre-flight cost: ~3K tokens steady, ~5K tokens until WS1F compaction.

**Tool wiring.** None. Native Claude Code behavior.

**Eviction.** Manual. Quarterly review by CEO; line-count budget enforced.

**Acceptance test.** L0 is ≤ 200 lines after WS1F. Until then, accept the temporary overage.

---

### L1 — Session memory

**What it is.** The active conversation context inside one Claude Code session. Tool calls, file reads, the model's working memory.

**Write contract.** The model writes by virtue of speaking. No schema. Auto-`/compact` at ≥70% of context window — Anthropic-managed. Agents that need to persist a fact past compaction MUST promote it to L2 via `add_memory` before compaction fires.

**Read contract.** Continuous, free, native. No tool call required.

**Tool wiring.** None. Native Claude Code session.

**Eviction.** Auto-`/compact` at 70%; full clear at session end. Hard rule: nothing in L1 survives session boundary unless promoted to L2.

**Acceptance test.** When a worker's worktree completes a task and the session ends, the next session that picks up the same task must NOT need to re-derive context — it gets it from L2 (last-N) and L3 (the session file at `docs/08-agents_work/sessions/`). L1 leakage = bug.

---

### L2 — Cross-session episodic ("what happened last time")

**What it is.** The replacement for "DECISIONS.md is write-only theater." Per-agent + per-topic episodic memory: prior decisions, prior errors, prior conversations with Adam, supersession trail. Mem0 manages embedding, dedup, supersession heuristics, semantic recall.

**Phase 1 (WS1B → live now after Adam's 5-min signup):** Mem0 cloud Hobby tier — `mcp.mem0.ai/mcp`, `Authorization: Token ${MEM0_API_KEY}`. 10K adds/mo + 1K retrievals/mo free, no card.

**Phase 2 (WS1F, after WS6A validates real usage):** Mem0 OSS server self-hosted, pointed at Supabase Postgres+pgvector. Same API. Endpoint swap.

**Write contract.** Two write surfaces:
- `add_memory(text, user_id, metadata)` — Mem0's native primitive. `user_id` field hijacked as **agent-role identifier** (e.g., `"ceo"`, `"build-lead"`, `"backend-developer"`). `metadata` carries the WS1D wrapper fields:
  - `source`: `"<agent>+<session-file-path>+<input-hash>"` — provenance back to a session file in `docs/08-agents_work/sessions/`
  - `confidence`: `"low" | "med" | "high"`
  - `expires_at`: ISO date or `"never"`
  - `topic_tags`: array of tags (e.g., `["pricing", "paddle"]`)
  - `supersedes`: optional Mem0 entry ID this entry replaces
- Mem0's smart-dedup means re-writing the same fact does NOT create duplicates — it consolidates.

**Who writes when:**
- CEO at session end: 1 summary entry per session, `confidence: high`, `expires_at: never`
- Any agent on a significant decision: 1 entry per decision, `confidence: high`, links to the DECISIONS.md row that mirrors it
- Workers on retry/error patterns: `confidence: med`, `expires_at: 90 days`
- Speculative/uncertain claims: `confidence: low`, `expires_at: 30 days` (auto-pruned)

**Read contract.**
- **Pre-flight:** every agent calls `search_memory(query="last_n", user_id=<role>, limit=10)` at session start — ~5K tokens. Replaces the orphan `LONG-TERM.md` read.
- **On-demand:** `search_memory(query=<freeform>, user_id=<role>, limit=5)` whenever an agent needs episodic context. Mid-session.
- Recall@5 target ≥ 0.8 on hand-picked queries (e.g., "what did we decide about pricing?", "what's the current Paddle webhook secret rotation policy?"). Validated in WS6A on real Linear tickets.

**Tool wiring (Phase 1).** Add to `.mcp.json`:

```json
{
  "mcpServers": {
    "supabase": { "...": "..." },
    "mem0": {
      "type": "http",
      "url": "https://mcp.mem0.ai/mcp/",
      "headers": {
        "Authorization": "Token ${MEM0_API_KEY}"
      }
    }
  }
}
```

`MEM0_API_KEY` set in shell env (`~/.zshrc`) and a project-local `.env.local` (gitignored). Adam runs `export MEM0_API_KEY=m0-...` after signup at app.mem0.ai. Restart Claude Code session — MCP loads automatically.

**Tool wiring (Phase 2).** Same `.mcp.json` shape; `url` flips to self-hosted endpoint (likely `https://mem0-server.beamixai.com/mcp/` or a Tailscale-internal URL). API key swap to a self-hosted token. WS1F handles the cutover and a one-shot row migration via Postgres dump/restore.

**Eviction / lifecycle.**
- `confidence: low` → 30-day TTL (auto-prune via Mem0 metadata filter, scheduled Inngest job)
- `confidence: med` → 90-day TTL
- `confidence: high` → never (manual prune only)
- Supersession: when a new entry has `supersedes: <old-id>`, a follow-up call sets `metadata.archived: true` on the old entry (Mem0 doesn't auto-handle this — WS1D wrapper does). The old entry is excluded from default search via filter.
- Quarterly: CEO runs a "memory hygiene" Inngest job that reports orphaned entries (no session-file backref) and low-confidence entries past TTL.

**Per-agent scope.**
- CEO reads `user_id="ceo"` + `user_id="adam-prefs"` (the user-prefs slice carries Adam's stable preferences across all roles).
- Each lead reads `user_id="<lead>"` only (e.g., `build-lead` doesn't read CEO's planning notes by default).
- Workers read `user_id="<worker-type>"` only (e.g., `backend-developer` doesn't read frontend notes).
- Agents may cross-read on demand (e.g., a worker checking `user_id="build-lead"` for the brief that spawned it). This is allowed but explicit — never default.

---

### L3 — Project facts (PRD, brain MOCs, decisions, sessions)

**What it is.** Semantic search over the human-authored knowledge in this repo: `docs/PRD.md`, `docs/ENGINEERING_PRINCIPLES.md`, `docs/00-brain/MOC-*.md`, `docs/00-brain/log.md`, `docs/03-system-design/**`, `docs/04-features/**`, `docs/product-rethink-2026-04-09/**`, `.claude/memory/DECISIONS.md`, and `docs/08-agents_work/sessions/**` (after they're written). Replaces the orphaned reads — today no agent reads `LONG-TERM.md`, `CODEBASE-MAP.md`, or any brain MOC.

**Storage.** `memory.docs_chunks` table on existing Supabase Postgres (pgvector extension already available on Supabase Pro). HNSW index. Schema:

```sql
CREATE TABLE memory.docs_chunks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path     text NOT NULL,          -- e.g., "docs/PRD.md"
  chunk_index     int NOT NULL,           -- 0-based within source
  content         text NOT NULL,
  content_tokens  int NOT NULL,
  embedding       vector(1536) NOT NULL,  -- text-embedding-3-small
  topic_tags      text[] DEFAULT '{}',    -- e.g., {"pricing","architecture"}
  source_sha      text NOT NULL,          -- git blob SHA at embed time
  embedded_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_path, chunk_index, source_sha)
);
CREATE INDEX docs_chunks_embedding_hnsw
  ON memory.docs_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX docs_chunks_path ON memory.docs_chunks (source_path);
```

**Chunking.** Markdown-section-aware (one chunk per `##` block, target ≤800 tokens, hard max 1500). Preserves the section heading as the first line of the chunk for ranking signal. Uses a small Node script (`apps/web/src/inngest/lib/chunk-markdown.ts`) — no external chunking lib needed at this scale.

**Embedding model.** **`text-embedding-3-small`** (OpenAI, 1536 dim, $0.02/M tokens). Locked for L3/L4/L5 (one model across all three).

**Cost projection at solo-founder volume.**
- L3 corpus: ~95 docs files × ~2K tokens avg = ~190K tokens initial embed = $0.0038. Re-embed on every git push to `docs/**` (~5 pushes/day × 10K tokens/push avg = 50K tokens/day = $0.001/day = ~$0.03/mo).
- L4 corpus: 423 SKILL.md × ~600 tokens avg = ~254K tokens initial = $0.005. Skills change rarely; ~$0.01/mo ongoing.
- L5 corpus: ~30K LOC × ~5 tokens/line = 150K tokens initial = $0.003. Re-embed on PR merge to `apps/web/src/**` only. ~$0.05/mo at current commit cadence.
- Retrieval embedding (per query): query text ~30 tokens × ~50 queries/day = $0.0003/mo — rounding error.
- **Total embedding spend: ~$0.10/mo.** Anti-bias check: `text-embedding-3-large` (3072 dim, $0.13/M) would be ~$0.65/mo — also fine. Picked `-small` because Beamix corpora are short, well-named, and don't need the extra recall headroom; can flip with a single Inngest re-run if WS6A retrieval quality is poor. Voyage AI not chosen — extra vendor for marginal recall gain at our scale. `all-MiniLM-L6-v2` local not chosen — adds Node/Python infra for ~$0.10/mo of compute.

**Re-embedding triggers.** GitHub Actions workflow on push to `main` (or feature branches if Adam wants preview embedding) calls an Inngest endpoint:
- Push to `docs/**` or `.claude/memory/DECISIONS.md` → fire `embed/docs.changed` event → re-embed only changed files (compare git blob SHA in `source_sha` column). One job per corpus, idempotent.
- Push to `.agent/skills/**` → `embed/skills.changed`
- PR merge that touches `apps/web/src/**` → `embed/code.changed`

**Retrieval API shape (MCP tool).** Provided by a thin custom MCP server (`infra/mcp-servers/beamix-rag/`). Specced in WS1C; for WS1B, the contract is:

```typescript
// MCP tool: mcp_docs_search
input  = { query: string, top_k?: number /* default 5 */, topic_filter?: string[] }
output = Array<{
  source_path: string,
  chunk_index: number,
  excerpt: string,        // first 300 chars of chunk
  full_url_or_anchor: string, // e.g., "docs/PRD.md#pricing"
  similarity: number,     // 0-1
  topic_tags: string[]
}>
```

Implementation = pgvector `<=>` cosine distance query, joined with `topic_tags` filter, top-K. Recall@5 target ≥ 0.85 on a 20-query labeled benchmark (built in WS1C against PRD + DECISIONS.md questions).

**Read contract.** **On-demand only.** No agent pre-flight-reads L3. Agents call `mcp_docs_search` when they need it (e.g., CEO answering "what did we decide about pricing?" calls L3 first, then L2 to see the latest update on top of the locked decision).

**Eviction.** No eviction. Source of truth is git; pgvector is a derived index. Old chunks (where `source_sha` no longer matches HEAD) get cleaned by the same Inngest job that re-embeds (delete-on-replace). Quarterly orphan-row sweep (rows whose `source_path` no longer exists in git).

---

### L4 — Skills

**What it is.** Embedding search over the 423 `SKILL.md` files. Replaces the current 42K-token `MANIFEST.json` discovery scan. Every agent that needs a skill calls `mcp_skill_search(query)` and gets back the top-3 skills with their paths + 1-line descriptions. Agent then reads the 1-3 SKILL.md files actually relevant.

**Storage.** `memory.skill_chunks` on Supabase pgvector. Same shape as `docs_chunks` plus a `skill_name` column. One chunk per skill (the SKILL.md is short — ≤2K tokens — so single-chunk per skill is fine). Embedding includes the skill name + description + body for richer match.

**Schema:**

```sql
CREATE TABLE memory.skill_chunks (
  skill_name      text PRIMARY KEY,         -- e.g., "rag-implementation"
  skill_path      text NOT NULL,            -- ".agent/skills/rag-implementation/SKILL.md"
  description     text NOT NULL,            -- from SKILL.md frontmatter
  tags            text[] DEFAULT '{}',
  content         text NOT NULL,            -- full body, included in embedding input
  embedding       vector(1536) NOT NULL,
  source_sha      text NOT NULL,
  embedded_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX skill_chunks_embedding_hnsw
  ON memory.skill_chunks USING hnsw (embedding vector_cosine_ops);
```

**Chunking.** Per-skill = one row. No internal chunking — skills are small.

**Re-embedding triggers.** GitHub Action on push to `.agent/skills/**` → Inngest `embed/skills.changed` → re-embed only changed `SKILL.md` files. One-shot full re-embed costs ~$0.005 — rebuild from scratch is also fine.

**Retrieval API shape.**

```typescript
// MCP tool: mcp_skill_search
input  = { query: string, top_k?: number /* default 3 */ }
output = Array<{
  skill_name: string,
  skill_path: string,
  description: string,
  tags: string[],
  similarity: number
}>
```

**Read contract.** **On-demand only.** No agent pre-flight-reads `MANIFEST.json` after WS1F. Agents that need skill discovery call `mcp_skill_search`. Workers load the top-2; leads/CEO load the top-3-5 if their task spans domains.

**Eviction.** Source of truth is git. Index entries removed when `SKILL.md` is deleted (delete-on-replace on the next Inngest re-embed run).

**Recall@5 target ≥ 0.9.** Skills are a smaller, more focused corpus than docs — embedding search should hit nearly every time. Validated in WS6A on real "I need a skill for X" queries.

---

### L5 — Codebase

**What it is.** "Where is X defined?" — semantic + symbol search over `apps/web/src/**` so agents stop blindly Glob/Grep'ing.

**Storage.** `memory.code_chunks` on Supabase pgvector. Shape:

```sql
CREATE TABLE memory.code_chunks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path     text NOT NULL,          -- e.g., "apps/web/src/lib/agents/llm-runner.ts"
  symbol_name     text,                   -- function/class/const if a top-level decl
  symbol_kind     text,                   -- "function" | "class" | "const" | "type" | "file"
  content         text NOT NULL,          -- the chunk body (per-symbol or per-file slice)
  embedding       vector(1536) NOT NULL,
  source_sha      text NOT NULL,
  embedded_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX code_chunks_embedding_hnsw
  ON memory.code_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX code_chunks_symbol ON memory.code_chunks (symbol_name);
```

**Chunking.** Per top-level symbol where possible (TypeScript `export function`, `export const`, `export class`, `export type`). Fallback to per-file slice (max 1500 tokens) for code that's mostly imports + small helpers. Done with `ts-morph` or a thin AST walker — pinned in WS1C; for WS1B, the contract is "top-level-symbol-aware, ≤1500 tokens per chunk."

**Re-embedding triggers.** GitHub Action on PR merge to `main` that touches `apps/web/src/**` → Inngest `embed/code.changed` → re-embed only changed files. WS1B does NOT support feature-branch indexing (deferred — the volatility isn't worth the embedding cost for solo-founder workflow).

**Retrieval API shape.**

```typescript
// MCP tool: mcp_code_search
input  = { query: string, top_k?: number /* default 8 */, symbol_kind?: string }
output = Array<{
  source_path: string,
  symbol_name: string | null,
  symbol_kind: string | null,
  excerpt: string,
  similarity: number
}>
```

**Read contract.** **On-demand only.** Restricted to senior code workers (build-lead, backend-developer, frontend-developer, code-reviewer, ai-engineer). Other roles must NOT call this — they don't need code-symbol grounding.

**Eviction.** Source of truth is git. Index entries removed when source file is deleted or symbol is removed (delete-on-replace).

**Recall@5 target ≥ 0.75.** Code search has noisier embeddings than prose; we accept lower recall, trading off into Glob/Grep when L5 misses. Validated in WS6A.

**Anti-bias check.** Considered: ripgrep + ctags only (no embeddings) — viable for solo-founder scale, but loses semantic match ("the function that handles Paddle webhook signatures" → embedding wins over keyword). Both stay available; L5 is the default, ripgrep is the fallback.

---

## Phase 1 Mem0 cloud bring-up — smoke test results

**Smoke test method (partial, no API key — full run gated on Adam signup):**
1. ✅ Endpoint reachability without auth: `POST https://mcp.mem0.ai/mcp` returns HTTP 307 (redirect, no body) — server alive and following the canonical MCP HTTP shape.
2. ✅ Auth model verification: `POST` with bogus `Authorization: Token invalid_test_key` returns HTTP 401 with body `{"error":"Invalid or missing API key. Get a valid key from https://app.mem0.ai/dashboard/api-keys"}`. Confirms the `Authorization: Token <key>` header model documented in Mem0 docs.
3. ✅ Round-trip latency: 0.39–0.49s from Adam's Mac to Mem0 cloud (TLS handshake + 401 response). Mem0's published p95 retrieval is 1.44s — even if real retrieval adds 1s of compute on top of network RTT, we land under 1.5s. **Acceptable for solo-founder UX.**
4. ⏸ **Full write→read exercise: PENDING Adam.** Requires 5-min signup at app.mem0.ai → API key → `export MEM0_API_KEY=m0-...` → restart Claude Code → run a stub agent that does `add_memory("Beamix uses Paddle, not Stripe.")` then `search_memory("which billing provider?")`. Documented in the runbook below.

**Stability of issue #3400:**
- **CLOSED.** Fixed by PR mem0ai/mem0#3523, merged 2025-09-30. Symptom was `add_memories` returning a Python dict instead of JSON-serialized string (MCP `-32602` error). Cloud endpoint runs server-side patched code; not affected.
- **Verdict: not a Phase 1 blocker.** Source: https://github.com/mem0ai/mem0/issues/3400 + https://github.com/mem0ai/mem0/pull/3523 — accessed 2026-05-06.

**Smart-dedup behavior:**
- Mem0's documented behavior: `add_memory` runs server-side LLM consolidation — re-writing "Beamix uses Paddle" twice produces ONE entry, not two. Contradictory writes (e.g., "Paddle" then "Stripe") trigger Mem0's supersession heuristic which keeps the newer entry and links it to the older. Will be exercised by Adam in the full write→read test below.
- This is the property that solves "DECISIONS.md is write-only theater" — agents can write redundantly without bloating the corpus, and contradictions surface as supersession events.

**p95 latency (partial measurement):**
- Network RTT from Mac → mcp.mem0.ai: 0.39–0.49s (3 samples).
- Mem0 published p95 retrieval: 1.44s (ECAI 2025 paper, Mem0 team-authored).
- Inferred end-to-end p95 for Beamix: <1.5s. Below the 2s "feels-laggy" threshold for mid-session agent retrieval.

**Verdict: PROCEED to Phase 1 wire-up.** Adam runs the 5-min runbook below; if the full write→read exercise also passes, WS1B's Phase 1 deliverable is locked and we can proceed to WS1C/WS1D. If it fails, fall back to Phase 2 OSS directly (no cloud SLA dependency, ~30-60 min extra setup).

### Phase 1 runbook (5 min, Adam-executed)

```bash
# Step 1: Sign up at app.mem0.ai/dashboard/api-keys (no card)
# Step 2: Copy the API key (format: m0-...)
# Step 3: Set the env var
export MEM0_API_KEY="m0-paste-key-here"
echo 'export MEM0_API_KEY="m0-..."' >> ~/.zshrc

# Step 4: Add the proposed .mcp.json entry (see below) — DO NOT COMMIT yet
# Step 5: Restart Claude Code session
# Step 6: In a fresh session, run:
#   "Use the mem0 MCP to add a memory: 'Beamix bills via Paddle, not Stripe.'"
#   "Use the mem0 MCP to search for: 'which billing provider does Beamix use?'"
# Step 7: Confirm the search returns the added memory with high similarity.
# Step 8: If yes → commit .mcp.json. If no → escalate to CEO; fall back to Phase 2 OSS.
```

### Proposed `.mcp.json` (worktree-only — do NOT commit until Adam confirms Step 7)

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=${SUPABASE_PROJECT_REF}"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
      }
    },
    "mem0": {
      "type": "http",
      "url": "https://mcp.mem0.ai/mcp/",
      "headers": {
        "Authorization": "Token ${MEM0_API_KEY}"
      }
    }
  }
}
```

---

## Phase 2 Mem0 OSS migration — specification (execution in WS1F)

**When this fires.** After WS6A validates real Mem0 usage on at least 3 real Linear tickets across 3 different agents (e.g., CEO, build-lead, backend-developer all writing + recalling memories successfully). Until then, Phase 1 cloud is the production state. Phase 2 is on the WS1F roadmap, NOT executed in WS1B.

**Why we migrate.** Two reasons, neither urgent:
1. Remove cloud SLA dependency on `mcp.mem0.ai`. V4 corporate-OS frame requires the company to be runnable from Adam's stack alone.
2. Avoid pricing-tier surprise. If Mem0 changes Hobby tier rates or imposes paywalls on retrievals we depend on, we want to be one Postgres dump away from full independence.

**Hosting target — recommendation: Railway $5/mo container.**

| Option | Cost | Pros | Cons |
|--------|------|------|------|
| **Railway** ⭐ | $5/mo | Fast Docker deploy, env-var management, restart policy, public HTTPS endpoint, ~30s deploys | One more vendor (we already have Supabase, Vercel, Cloudflare) |
| Cloudflare Container | $0-5/mo | We already use Cloudflare Workers; consolidates vendor | Containers on CF are newer/less battle-tested for stateful Python services |
| Vercel function | — | Already paying | Mem0 server is stateful — a bad fit for Vercel's serverless model. **Reject.** |
| Bastion (Adam's Mac) | $0 | $0/mo, no cloud SLA at all | Per V4: Bastion is acceleration not critical path. **Reject for L2 hosting.** |
| Docker on a $5 Hetzner/DO droplet | $5/mo | Cheapest, full control | Adam patches the OS; not solo-founder ergonomic |

**Locked: Railway** — fastest path, $5/mo fits the $20-50/mo budget, restart-on-failure included.

**Supabase connection.**
- Schema: `memory` (same one used for L3/L4/L5).
- Tables Mem0 OSS auto-creates: `mem0_memories`, `mem0_users`, `mem0_history` (Mem0 OSS handles its own schema migrations on boot — we let it).
- Connection: standard `DATABASE_URL` Postgres connection string (transaction pooler endpoint, port 6543, with `?pgbouncer=true&sslmode=require`).
- pgvector extension already enabled by L3/L4/L5 work.
- Index type: HNSW (Mem0 OSS picks per its own defaults; if it picks IVFFlat we override via post-migration migration).

**Migration plan (the recipe — execution in WS1F):**

```bash
# Step 1: Stand up Mem0 OSS on Railway
#   - Fork mem0ai/mem0
#   - Set env vars: DATABASE_URL (Supabase), OPENAI_API_KEY (for embeddings), MEM0_API_KEY (server-side; can match Phase 1 key)
#   - Deploy via `railway up`
#   - Verify health endpoint returns 200

# Step 2: Dump Phase 1 cloud memories
#   - Mem0 cloud has an export endpoint (POST /v1/memories/export) returning JSONL
#   - Save to local file: phase1-memories.jsonl

# Step 3: Replay into Phase 2
#   - Each line: `add_memory(text, user_id, metadata)` against the new self-hosted endpoint
#   - Idempotent — Mem0's smart-dedup handles re-runs

# Step 4: Smoke-test parity
#   - Run the 5-query benchmark from WS1B against both endpoints; recall@5 should match within ±5%

# Step 5: Swap .mcp.json url from mcp.mem0.ai to Railway URL
#   - Single-line change, commit, restart Claude Code
#   - Old key (Phase 1 cloud) stays valid until next billing cycle as fallback

# Step 6: Burn-in 7 days
#   - Monitor Railway logs + Supabase pgvector latency
#   - If any regression → roll back .mcp.json (1-line revert)

# Step 7: Cancel/downgrade Mem0 cloud subscription if applicable (Hobby is free — no action needed)
```

**Cost delta at Phase 2.** Railway $5/mo + Supabase (already paid). Vendor MCP $0 → self-hosted $5/mo. Inside the $20-50/mo budget. Embedding API costs unchanged (same OpenAI key, same `text-embedding-3-small` model).

**Reversibility.** Trivial — flip `.mcp.json` `url` back to `mcp.mem0.ai/mcp` and the cloud key. Memories stay where they are written until WS1F migration; if Phase 1 is rolled back, Phase 2 work is lost but data isn't.

---

## Embedding model choice (locked for L3/L4/L5)

**Model:** `text-embedding-3-small` (OpenAI, 1536 dim).

**Why:**
1. Cheap: $0.02/M input tokens. Total embedding spend at solo-founder volume: ~$0.10/mo.
2. Sufficient recall on Beamix-sized corpora (95 docs, 423 skills, ~30K LOC). Larger model (`-3-large`, 3072 dim) costs 6.5× more for marginal recall gain on this corpus shape.
3. One model across L3/L4/L5 — simplicity. WS1C may revisit per-corpus tuning if WS6A retrieval quality is poor.
4. Cleanly reversible — flip one constant, fire one Inngest re-embed, ~$0.50 total to re-embed everything to a different model.

**Cost projection at solo-founder volume (Q3 2026):** ~$0.10/mo total for embedding API (initial + ongoing). Dwarfed by every other line in the BOM.

**Sources:**
- OpenAI embeddings pricing: https://openai.com/api/pricing/ (accessed 2026-05-06)
- pgvector HNSW vs IVFFlat trade-off: https://supabase.com/blog/pgvector-performance (accessed via WS1A/ research dispatch context)
- Mem0 embedding-defaults: https://docs.mem0.ai/components/embedders/overview (accessed 2026-05-06)

---

## What we will explicitly NOT put in memory (anti-scope)

- **Live customer data.** PII never goes into L2/L3/L4/L5. If an agent encounters customer rows, it stays in L1 and is consumed in-session.
- **Secrets, API keys, credentials.** Never written to L2 (Mem0 cloud is third-party until Phase 2; even then, secrets belong in Supabase Vault or env vars, not embedded text).
- **Code snippets that contain credentials or PII** (logging samples, .env contents). L5 chunker strips `.env*` and rejects files matching the secrets regex used by `git-secrets`.
- **Random session-trace noise.** L1 is for that. L2 entries are "facts that should survive."
- **Decisions that haven't been made yet** (proposals, brainstorms). Those go to `docs/08-agents_work/sessions/` or Linear, not L2. L2 is for committed state.

---

## Open questions for Adam

1. **Phase 1 smoke test step 7 (full write→read exercise).** Are you willing to do the 5-min signup at app.mem0.ai today/tomorrow so we can hard-confirm the integration shape before WS1C/WS1D start? If yes, we lock Phase 1. If you'd rather skip cloud entirely and go straight to OSS, we move WS1F's Mem0 OSS bring-up forward to WS1B+1 and add ~30-60 min to the WS1B critical path.
2. **L3/L4/L5 host choice — Supabase pgvector locked, but: are you OK with the new schema being `memory.*` in the existing Beamix Supabase project, or do you want a separate Supabase project for the agent index?** Recommend same project (one less vendor surface, RLS keeps it isolated). Confirm.
3. **L5 (code RAG) scope — limit to `apps/web/src/**` only, or also include `infra/`, `.github/workflows/`, `apps/web/supabase/migrations/`?** Recommend `apps/web/src/**` + `apps/web/supabase/migrations/**` (migrations are load-bearing for DB engineers). Confirm.
4. **Embedding model — `text-embedding-3-small` locked at WS1B. WS1C may flip to `-3-large` if WS6A recall is poor.** Acceptable, or do you want to lock `-3-large` upfront for headroom (~$0.65/mo instead of $0.10/mo)? Recommend stay `-3-small` and iterate.
5. **Mem0 OSS hosting target — Railway $5/mo recommended. Acceptable, or push for Cloudflare Container / Bastion?** Cloudflare Container is plausible at $0-5/mo and consolidates vendors; Bastion violates "critical path off Adam's laptop" V4 rule. Confirm Railway.

---

## Sources

- Mem0 Claude Code integration docs (auth model, install methods): https://docs.mem0.ai/integrations/claude-code (2026-05-06, via Sonnet researcher)
- Mem0 platform-vs-OSS doc (engine parity): https://docs.mem0.ai/open-source/overview (2026-05-06)
- Mem0 pricing (Hobby tier limits): https://mem0.ai/pricing (2026-05-06)
- GitHub issue mem0ai/mem0#3400 (closed, fix in PR #3523): https://github.com/mem0ai/mem0/issues/3400 (2026-05-06)
- Mem0 ECAI 2025 paper (p95 1.44s claim): arXiv:2504.19413 (2025-04, peer-reviewed)
- OpenAI embeddings pricing: https://openai.com/api/pricing/ (2026-05-06)
- Supabase pgvector HNSW guidance: https://supabase.com/docs/guides/ai/vector-indexes/hnsw-indexes (2026-05-06)
- Local smoke test: `curl -X POST https://mcp.mem0.ai/mcp` returns 307 unauth, 401 with bad token, RTT 0.39–0.49s (CEO local Mac, 2026-05-06)
- WS1A decision matrix: `docs/08-agents_work/MEMORY-DECISION-MATRIX.md` (2026-05-06)

---

**End of WS1B deliverable.** Awaiting Adam-review before WS1C (RAG corpora & ingestion details) or WS1D (write-contract schema) start.

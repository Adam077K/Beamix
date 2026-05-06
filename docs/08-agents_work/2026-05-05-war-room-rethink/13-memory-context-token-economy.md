# Memory, Context & Token Economy for an Agent Fleet (May 2026)

**Author:** researcher (war-room rethink Wave 2)
**Date:** 2026-05-05
**Scope:** Beamix solo-founder agent fleet — ~200 conversations/month, 5+ concurrent agents, 18-month horizon
**Confidence:** HIGH on Anthropic-native primitives; MEDIUM-HIGH on third-party benchmarks (vendor-published numbers)

---

## TL;DR — The Recommendation

Stop bolting a third-party memory framework onto a Claude Code fleet that already has a memory system. Anthropic shipped a real one (memory tool + context editing + compaction + skills + tool-search-via-embeddings) between Aug-2025 and early-2026. The right move is **native-first, with a thin pgvector layer for skill/doc semantic search**. Adding Letta/Mem0/Zep on top of Claude Code is a $50–$500/mo rental of capabilities you already have.

The single highest-ROI fix is not buying memory — it's **fixing prompt-cache hit rate** on the system prompt (CLAUDE.md + skills) and **replacing the 42K-token MANIFEST.json read with embedding search**. Together those two fixes alone project ≥ 70% input-token reduction.

---

## 1. Recommended Memory Architecture for Beamix

### Layer-by-layer stack (native-first)

| Layer | What it stores | Mechanism | Why this and not X |
|---|---|---|---|
| **L0 — Boot context** | Stack defaults, agent roster, MCP table, layer contract | `CLAUDE.md` (≤ 300 lines, hard cap) | Anthropic-recommended; hits the prompt cache on every turn. Current MEMORY.md (266 lines) overflows the 200-line cap and fragments cache hits. |
| **L1 — Session state** | Active task, decisions made *this session*, open blockers | Claude Code session context + `/compact` when > 70% | Free, native, no infra |
| **L2 — Cross-session episodic** | "What I learned doing task X", file paths, patterns | **Anthropic Memory Tool** (`memory_20250818`) writing to `/memories/*.md` files (client-side, you control storage) | Native, ZDR-eligible, designed for "context window might reset at any moment". Replaces hand-rolled `LONG-TERM.md` updates. |
| **L3 — Project facts (semantic)** | Decisions, code-map, user-insights, competitor profiles, brand rules | Markdown files in `docs/00-brain/` indexed into **pgvector** on Supabase (already in your stack) | One vector store, no new vendor. MOC navigation stays human-readable. |
| **L4 — Skills & tools (semantic)** | 426+ SKILL.md files | pgvector + `tool_search` cookbook pattern (Anthropic, 2025-11 beta) | Replaces 42K-token MANIFEST.json scan with sub-ms cosine query. Anthropic's own cookbook claims **90%+ context savings**. |
| **L5 — Temporal facts** *(only if needed at >$500 MRR)* | Customer state, time-bounded competitor data | Defer to **Graphiti** (OSS, self-host) if/when temporal supersession becomes a measured pain | Don't pay for Zep Cloud as a solo founder; Graphiti is the OSS core anyway |

**What gets cut:**
- `CODEBASE-MAP.md` (ghost file — currently doesn't exist) — let `mcp__supabase__list_tables` + `grep`/`glob` regenerate on demand
- `MEMORY.md` 266-line dump → split into L0 (CLAUDE.md, ≤200 lines) + L2 (memory tool) + L3 (vectorized in pgvector)

### Anthropic-native primitives we are leaning on (confirmed Aug-2025 → Jan-2026)

1. **Memory tool** (`memory_20250818`) — beta, file-based `/memories` directory, client-side storage, built for "context window might reset at any moment" (Anthropic memory-tool docs).
2. **Context editing** (`clear_tool_uses_20250919`) — server-side, automatically clears stale tool results before they hit Claude. Pairs with memory tool: warning fires before clear so Claude can write to memory first.
3. **Compaction** (`compact_20260112`) — server-side conversation summarization at threshold.
4. **Prompt caching** with `cache_control: ephemeral`, 5-min default TTL or 1h opt-in. Cache reads = 0.1× input price (90% off). 5m writes = 1.25× input. 1h writes = 2× input.
5. **Tool search with embeddings** (cookbook, beta header `advanced-tool-use-2025-11-20`) — claim: 90%+ context savings vs upfront tool definitions.
6. **Skills** — official Anthropic primitive, dynamic invocation by `/skill-name`, `< 300 lines` consensus, no preload.
7. **Batch API** — 50% off, ≤ 24h SLA, stacks with prompt caching for ~95% combined savings.

---

## 2. Memory Framework Comparison Matrix

| Framework | Memory model | Claude Code / MCP fit | Lock-in | Pricing entry → mid | Fit for Beamix |
|---|---|---|---|---|---|
| **Anthropic Memory Tool + pgvector** *(recommended)* | Files + vectors, you own storage | Native (it IS Claude) | None — your filesystem & Supabase | $0 (Supabase free tier covers it) | **YES — start here** |
| **Letta (MemGPT)** | Core / archival / recall blocks; agent edits its own memory | OpenAI-compatible API; usable from Claude via API but not MCP-native | Medium — own the agent runtime | Free OSS / $20/mo cloud / paid plans up to ~$200/mo | Skip. Letta wants to *be* the agent harness; you already have Claude Code. |
| **Mem0** | "Selective" semantic memory; LLM-judge writes facts | Has MCP server; OpenAI/Anthropic compatible | Low (Apache 2.0 OSS) | Free 10K adds / $19 Starter / **$249/mo Pro** / Enterprise custom | Skip cloud — overpriced for solo. Self-host is fine but duplicates pgvector. |
| **Zep Cloud** | Temporal knowledge graph (Graphiti core) | REST API, no first-class MCP | Medium | Free → Enterprise (no public mid-tier price) | Skip. Real value is Graphiti. |
| **Graphiti (OSS)** | Temporal KG with validity windows; supersedes vs deletes | Self-host; needs Neo4j | Low (OSS) | Free + Neo4j infra (~$0–50/mo) | **Defer.** Adopt when contradiction/supersession becomes measured pain (probably post-50 customers). |
| **Cognee** | ECL pipeline (Extract/Cognify/Load); graph + vector hybrid | OSS + MCP server | Low (open core) | Free OSS / up to €1,970/mo cloud | Skip. Beautiful tech, wrong scale. |
| **CrewAI memory** | Short-term (RAG) + long-term (SQLite) + entity | CrewAI-only | High (framework lock-in) | Free OSS | N/A — we don't use CrewAI |
| **LangGraph checkpointer** | Thread-level state in Postgres/Redis | LangGraph-only | High | Free OSS + Postgres | N/A — we don't use LangGraph |
| **OpenAI Memory** | ChatGPT-only; **not exposed via API** | None | Total | N/A | N/A — not available to API users |
| **MCP Memory Servers** (`@modelcontextprotocol/server-memory`, claude-mem, mcp-memory-service) | Knowledge-graph or journal MCP | Native MCP | Low | Free OSS | Optional. Useful as a *thin* wrapper around L2 if you want graph queries; otherwise the memory tool already does the job. |

**Bottom line:** the only third-party framework that adds something Anthropic doesn't natively give you is **Graphiti's temporal supersession** (validity windows on facts). Adopt it later, not now.

---

## 3. Token-Reduction Playbook — Ranked by ROI

ROI = (estimated $ saved per month at 200 sessions/mo, ~30K tokens avg system prompt) ÷ (engineering hours to ship). All % figures cite source.

### S-tier (ship this week)

#### 1. **Fix prompt caching on the system prompt**
- **Source claim:** Cache reads cost 0.1× input price (Anthropic prompt caching docs). Real-world reports of ~90% cost cut on system prompts (DigitalOcean, Medium case studies).
- **Mechanism:** Stable CLAUDE.md (≤ 200 lines) + skills loaded as separate cached blocks with `cache_control: ephemeral`. Use 1h TTL for long agent runs, 5m for chatty work.
- **Beamix delta:** MEMORY.md is 266 lines and changes often → cache misses every session. After fix: ~90% off the system-prompt portion of every input.
- **Projected savings:** at ~30K-token system prompt × 200 sessions × Sonnet $3/MTok input = $1.80/mo system → after caching ~$0.18/mo on system. Sounds small until you multiply by 5 concurrent agents × deeper system prompts (50–100K with skills). Realistic monthly save: **$50–$200/mo**.
- **Effort:** 1–2 hours. Just position `cache_control` correctly and stop changing the cached blocks.

#### 2. **MANIFEST.json → pgvector tool/skill search**
- **Source claim:** Anthropic cookbook "Tool search with embeddings" — **90%+ context savings**. Uses `sentence-transformers/all-MiniLM-L6-v2` (384-dim, local, free).
- **Mechanism:** Embed each SKILL.md description once → store in Supabase pgvector → expose `skill_search(task_description)` tool. Drop the 42K-token manifest read entirely.
- **Beamix delta:** 426 skills × ~100 tokens of metadata each = ~42K tokens loaded today *per agent that wants to discover skills*. After: ~200-token tool definition + on-demand return of 3–5 matched SKILL.md pointers.
- **Projected savings:** ~40K tokens per skill-loading agent × 5 agents/session × 200 sessions × $3/MTok Sonnet input = **~$120/mo recovered**.
- **Effort:** ~1 day. Embed once (cron), search on demand. pgvector is already in your Supabase.

#### 3. **Use the Batch API for non-urgent agent work**
- **Source claim:** Anthropic Message Batches API — **50% off both input and output**, results within 24h (most batches finish in < 1h). Stacks with caching → up to ~95% combined savings (Anthropic docs + Finout pricing 2026).
- **Beamix candidates:** weekly competitive scans, audit synthesis, blog generation, email digests, overnight QA verification, embeddings re-indexing.
- **Projected savings:** if 30% of monthly LLM spend qualifies as batch-able and current spend is $200/mo → **$30/mo recurring**, scales with usage.
- **Effort:** ~2 hours per workflow to switch.

### A-tier (ship this sprint)

#### 4. **Adopt the Memory Tool for cross-session state**
- **Source:** Anthropic memory-tool docs (`memory_20250818`).
- **Mechanism:** Replace ad-hoc `LONG-TERM.md` writes with the official memory tool. Claude auto-views `/memories` at session start, writes during work, survives compaction.
- **Savings:** indirect — prevents re-context-loading in new sessions (each save ~5K tokens × hundreds of "what was I doing" reloads). Estimated **$20–$60/mo** on context bloat avoidance.
- **Effort:** half a day. SDK has helpers (`BetaAbstractMemoryTool`).

#### 5. **Enable context editing + compaction on long runs**
- **Source:** Anthropic context-editing docs (`clear_tool_uses_20250919`) and compaction (`compact_20260112`).
- **Mechanism:** server-side trims stale tool results once they're processed. Pairs with memory tool — Claude saves anything it needs to keep before clear fires.
- **Savings:** for long agent runs (debugging, multi-file refactors), tool-result accumulation is often 60%+ of context. Trimming = real money on Sonnet/Opus runs. Estimated **$40–$150/mo**.
- **Effort:** add request flag. ~1 hour.

#### 6. **Model gradient discipline (Haiku → Sonnet → Opus)**
- **Source claim:** Anthropic API pricing (Sonnet 4.6 $3/$15, Opus 4.7 $5/$25, Haiku 4.5 $1/$5).
- **Mechanism:** route triage/classification/log parsing/lint to Haiku 4.5 ($1/$5 per MTok — **3× cheaper than Sonnet, 5× cheaper than Opus**). Keep Sonnet as default. Reserve Opus for real depth (research synthesis, security audits).
- **Beamix delta:** CLAUDE.md already has the rule but several agents are over-modeled (e.g., test runners on Sonnet should be Haiku).
- **Savings:** if 30% of calls move to Haiku → **15–25% of monthly LLM bill**. At $200/mo → **$30–$50/mo**.
- **Effort:** audit each agent's model frontmatter. ~2 hours.

### B-tier (ship this quarter)

#### 7. **Tool-result compression (return paths, not bodies)**
- **Source:** Anthropic effective-context-engineering blog ("smallest set of high-signal tokens" principle).
- **Mechanism:** workers return `{branch, files_changed, summary}` not raw diffs. Already in your structured-returns spec — enforce it.
- **Savings:** session-dependent, ~10–20% on multi-worker tasks. **$20–$60/mo**.

#### 8. **Diff-only re-reads**
- **Mechanism:** if a file was already read in this session, only re-read the diff vs cached version. Claude Code already does some of this; reinforce in agent prompts: "do not re-read files already in context."
- **Savings:** ~5–15% on long sessions.

#### 9. **MAX_THINKING_TOKENS budget**
- **Source:** Anthropic extended-thinking docs.
- **Mechanism:** cap thinking tokens per task; only enable extended thinking on Opus depth-tasks (research synthesis, audits).
- **Savings:** thinking tokens are output-billed. Capping a wandering Sonnet from 8K to 2K thinking saves $0.09/run. ×200 sessions = **$18/mo**.

#### 10. **Cheap structural validators as gates**
- Run `tsc --noEmit`, `eslint`, `semgrep`, `ruff` before any expensive LLM verification step. Failed type-check = no QA call.
- **Savings:** prevents redundant Sonnet/Opus runs on broken code. Hard to quantify; easily **$30+/mo** at current velocity.

### Total realistic projection

At today's footprint (~200 sessions/mo, mostly Sonnet, ~$200–$400/mo LLM spend), shipping S-tier + A-tier in one sprint should land **55–75% input-token reduction** and **$200–$500/mo recurring savings**, scaling with usage.

---

## 4. The "MANIFEST.json → embedding search" Upgrade — Concrete Recipe

**Goal:** replace the 42K-token whole-manifest scan with a sub-millisecond cosine-similarity search over pre-computed embeddings.

### Stack choice: **pgvector on Supabase** (already in stack, no new vendor)

Alternative: local FAISS index. Faster but adds deploy complexity and no multi-agent sharing. Pgvector wins on operational simplicity.

### Recipe

```sql
-- Supabase migration
create extension if not exists vector;

create table skill_index (
  skill_name text primary key,
  description text not null,
  tags text[] not null,
  path text not null,
  embedding vector(384) not null,  -- all-MiniLM-L6-v2 dim
  updated_at timestamptz default now()
);

create index on skill_index using hnsw (embedding vector_cosine_ops);
```

**Embed-once script** (`scripts/embed-skills.ts`):
```ts
import { pipeline } from '@xenova/transformers'; // local ONNX inference, no API cost
const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

for (const skill of readManifestJson()) {
  const text = `${skill.name}\n${skill.description}\n${skill.tags.join(' ')}`;
  const vec = await embedder(text, { pooling: 'mean', normalize: true });
  await supabase.from('skill_index').upsert({
    skill_name: skill.name, description: skill.description,
    tags: skill.tags, path: skill.path, embedding: Array.from(vec.data)
  });
}
```
Run once, plus on every skills/MANIFEST.json commit (CI hook).

**Tool definition** exposed to agents:
```ts
{
  name: "skill_search",
  description: "Find 3-5 most relevant skills for the current task. Returns paths, not contents.",
  input_schema: { type: "object", properties: { task_description: { type: "string" }, k: { type: "number", default: 5 } } }
}
```
Server: embed `task_description` with the same MiniLM model, run `<-> embedding` query, return top-k paths.

### Cost & latency

- **Embed model:** `all-MiniLM-L6-v2`, 384-dim, runs locally via Transformers.js or `sentence-transformers`. **$0 inference cost.**
- **Storage:** 426 skills × 384 floats × 4 bytes = ~650 KB. Trivial.
- **Per-search cost:** ~5–20ms (HNSW index, 426 vectors), one local embedding pass (~10ms).
- **Token cost per session:** ~200 tokens for the `skill_search` tool def vs ~42,000 tokens loading the full manifest. **99.5% reduction on that surface.**

### Migration order

1. Build the index (1 hour).
2. Add `skill_search` MCP tool (2 hours).
3. Update agent prompts: "Use `skill_search('task description')` to discover skills. Never read MANIFEST.json directly."
4. Keep MANIFEST.json as source-of-truth for the embed job.

---

## 5. Memory Rot, Supersession & Contradiction

The visible symptoms in your current setup:
- MEMORY.md says pricing is `$49/$149/$349` *and* `$79/$189/$499` (one is current, one is stale — both presented as "current").
- "ALL 12 PHASES COMPLETE" from 2026-03-02 contradicts the April rethink.
- "AUDITED BY SCOUT" — Scout is from the old 12-agent roster, no longer exists.

These are classic **memory rot** failure modes. Here's how production systems handle them, ranked by Beamix-fit.

| Strategy | How it works | Beamix fit |
|---|---|---|
| **Time-bounded facts (Graphiti pattern)** | Every fact has `valid_from` and `valid_to`; new contradicting fact closes the old one's window. Query "what's true now?" or "what was true on date X?". | Good long-term, overkill now. |
| **Supersession via dated DECISIONS.md entries** | New decision links to and explicitly supersedes old one. Old entries flagged `[SUPERSEDED 2026-04-15 by D-042]`. | **Best near-term.** Cheap, human-readable, no infra. |
| **TTL on memory files** | Memory tool docs explicitly recommend "clearing out memory files periodically that haven't been accessed". | Easy: cron job that flags stale entries for review. |
| **LLM-judge writes (Mem0 pattern)** | LLM evaluates each potential write — "is this still true given existing memory?" — and merges/deletes/keeps. | Adds an LLM call per write. Worth it once write volume > ~50/day. |
| **Hard caps + forced compression** | Your CLAUDE.md already enforces: `DECISIONS.md max 50 entries, LONG-TERM.md max 100 lines, sessions max 10 lines`. | **Already specified — just enforce it.** Add a pre-commit hook. |
| **Single source of truth folders** | One folder is canonical (`docs/product-rethink-2026-04-09/`); MEMORY.md must defer to it. | Already established in CLAUDE.md ("AUTHORITATIVE"). Enforce by deletion. |

### Concrete cleanup actions for the 266-line MEMORY.md
1. Move all "as of YYYY-MM-DD" facts older than the April 2026 rethink to `docs/07-history/CHANGELOG.md`.
2. Delete the obsolete 12-phase Scout audit block.
3. Keep MEMORY.md as a one-line index pointing at `docs/00-brain/_INDEX.md`.
4. Move "current pricing" / "current state" into a single `STATE.md` that gets git-blamed and reviewed monthly.

---

## 6. The Reflection Pattern — When It Earns Its Keep

### The evidence

- **Reflexion paper:** verbal self-critique stored in memory boosts coding accuracy +11pts and reasoning +20% (cited in Hugging Face / Stackviv 2026 reviews).
- **Vendor / industry claims (lower confidence):** "up to 20% accuracy uplift" (Tungsten); "25–50% higher success rate on multi-step tasks" (vendor-published, treat as upper bound).
- **arXiv 2509.18847** "Failure Makes the Agent Stronger": structured reflection improves multi-turn tool-call success on BFCL v3 and Tool-Reflection-Bench, reduces redundant calls.

### When to use it (worth the tokens)

- **Multi-step tool-using tasks** (codegen, refactors, multi-file edits): reflection catches half-finished work.
- **High-stakes outputs** (security audits, customer-facing copy, billing logic).
- **Iterative loops** where the agent can actually fix its own bug after seeing the error (debug, test-fix cycles).

### When it's wasteful (skip it)

- **Single-shot classification or extraction** — reflection burns 2× tokens for ≤1% accuracy gain.
- **Already-validated outputs** (passed `tsc` + tests + lint) — structural validators caught what reflection would.
- **Information retrieval** — reflection on "did I find the right doc?" rarely improves recall.

### Practical pattern for Beamix

Already partially in place: QA Lead is the reflection layer for code workers. **Extend it** to:
- After a worker returns BLOCKED, run a Haiku-grade "did I miss an obvious fix?" pass before re-spawning.
- After audit-class outputs (research, design, security), one mandatory reflection pass on Sonnet *before* presenting to the user.
- Cap reflection depth at **1** (one self-critique). Multi-round reflection has diminishing returns and 2–3× cost.

**Don't confuse reflection with QA.** QA is independent verification. Reflection is the same agent re-reading its own output. Both have a place; reflection is cheaper but can rubber-stamp its own bias.

---

## 7. Anthropic-Native Long-Running Pattern (the official one)

Per Anthropic's "effective context engineering" blog and memory-tool docs, the canonical pattern for long-running multi-session agents:

1. **Initializer session** writes a memory bootstrap: progress log, feature checklist, references to startup scripts.
2. **Each new session** starts by reading `/memories` (the memory tool docs literally inject this instruction automatically).
3. **End-of-session** updates the progress log.
4. **One feature at a time**, marked complete only after end-to-end verification.
5. **Compaction + memory tool together:** compaction handles the conversation, memory persists across compaction boundaries.

This is exactly what `docs/08-agents_work/sessions/` is for. The pattern is right; enforcement is weak. Add a pre-end-session checklist that fails the session close until the session file exists.

---

## Sources

All claims sourced. URLs + dates inline.

### Anthropic primary docs

- Memory tool — https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool (model: `memory_20250818`, beta)
- Prompt caching — https://platform.claude.com/docs/en/build-with-claude/prompt-caching (cache reads 0.1×, 5m write 1.25×, 1h write 2×; min 4096 tokens for current models; 20-block lookback)
- Context editing — https://platform.claude.com/docs/en/build-with-claude/context-editing (`clear_tool_uses_20250919`)
- Compaction — https://platform.claude.com/docs/en/build-with-claude/compaction (`compact_20260112`)
- Batch processing — https://platform.claude.com/docs/en/build-with-claude/batch-processing (50% off, ≤24h)
- Tool search with embeddings — https://platform.claude.com/cookbook/tool-use-tool-search-with-embeddings (90%+ savings, beta `advanced-tool-use-2025-11-20`, MiniLM-L6-v2)
- Effective context engineering — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic Skills repo — https://github.com/anthropics/skills

### Claude Code memory ecosystem

- "Writing a good CLAUDE.md" — https://www.humanlayer.dev/blog/writing-a-good-claude-md (consensus: < 300 lines)
- claude-mem plugin — https://github.com/thedotmack/claude-mem
- Official MCP memory server (knowledge graph) — https://claudemarketplaces.com/mcp/modelcontextprotocol/servers/memory
- Auto-compact threshold ~83.5% (early 2026) — https://www.morphllm.com/claude-code-auto-compact

### Memory frameworks

- Letta docs — https://docs.letta.com/concepts/memgpt/ ; pricing — Letta blog and tooldirectory.ai
- Mem0 pricing — https://mem0.ai/pricing (Free 10K adds, Starter $19, Pro $249, Enterprise custom)
- Mem0 State of AI Agent Memory 2026 — https://mem0.ai/blog/state-of-ai-agent-memory-2026 (90% token reduction vs full-context, 1,800 vs 26,000 tokens/conversation; 91% lower p95 latency)
- Zep paper — https://arxiv.org/abs/2501.13956 (94.8% DMR vs MemGPT 93.4%)
- Graphiti — https://github.com/getzep/graphiti
- Cognee — https://github.com/topoteretes/cognee ; ECL pipeline & 70+ companies, 500× pipeline growth in 2025
- CrewAI memory docs — https://docs.crewai.com/en/concepts/memory
- LangGraph checkpointers — https://docs.langchain.com/oss/python/langgraph/add-memory ; Postgres/Redis backends
- Vectorize.io memory framework comparison 2026 — https://vectorize.io/articles/best-ai-agent-memory-systems

### Voyager / skill libraries

- Voyager paper — https://arxiv.org/abs/2305.16291 (3.3× more items, 15.3× faster tech-tree milestones via skill library)

### Reflection

- Reflexion (+11 coding, +20% reasoning) — referenced in https://stackviv.ai/blog/reflection-ai-agents-self-improvement
- "Failure Makes the Agent Stronger" — https://arxiv.org/abs/2509.18847

### Pricing & cost references

- Anthropic API pricing 2026 — https://platform.claude.com/docs/en/about-claude/pricing
- Finout pricing breakdown — https://www.finout.io/blog/anthropic-api-pricing
- "Prompt caching cut my bill from $720 to $72" case study — https://medium.com/@labeveryday/prompt-caching-is-a-must-how-i-went-from-spending-720-to-72-monthly-on-api-costs-3086f3635d63

---

## Confidence Summary

| Claim type | Confidence | Notes |
|---|---|---|
| Anthropic prompt-caching prices and TTL behavior | HIGH | Direct from current Anthropic docs |
| Memory tool API surface & semantics | HIGH | Direct from `memory_20250818` docs |
| Tool-search-with-embeddings 90%+ savings | HIGH | Anthropic's own cookbook |
| Mem0 / Letta / Zep pricing | MEDIUM-HIGH | Vendor pricing pages, May 2026 |
| Reflection accuracy gains | MEDIUM | Mix of peer-reviewed (Reflexion, arXiv 2509.18847) and vendor blog claims |
| $/mo savings projections for Beamix | MEDIUM | Modeled on stated session volume; will vary ±50% with actual mix |
| Auto-compact threshold (~83.5%) | MEDIUM | Recent change, multiple community confirmations |

**Overall confidence: HIGH** on architecture recommendation. **MEDIUM-HIGH** on dollar projections (volume-dependent).

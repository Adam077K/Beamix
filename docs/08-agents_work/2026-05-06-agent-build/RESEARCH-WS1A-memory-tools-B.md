# Memory Tools Research — WS1A Researcher B
**Date:** 2026-05-06
**Covers:** Cognee · OpenAI Assistants API (memory) · Anthropic Memory Tool (memory_20250818) · Custom MCP on Supabase pgvector
**Context:** ~60 Claude Code agents, ~50-200 sessions/mo, solo founder, $20-50/mo ceiling, <30 min setup constraint, Supabase paid + Anthropic Max already paid

---

## Cognee

### Pricing (cited)
- Free tier: Open-source, local development, community support, unlimited docs (self-hosted)
- Developer ($35/mo): 1,000 docs / 1 GB, fully hosted, 10,000 API calls/mo. Top-ups: $35 for 1,000 docs, $100 for 3,000 docs
- Cloud/Team ($200/mo): 2,500 docs / 2 GB, 10 users, dedicated Slack, 10,000 API calls/mo
- At Beamix scale (~50-200 sessions, 10-50K memories): Developer $35/mo plan fits if memories are small documents; heavy usage may exhaust 1,000-doc / 10,000 call limits quickly
- Source URL + date: https://www.cognee.ai/pricing (accessed 2026-05-06)

### Lock-in profile
- Data export: No explicit export UI documented; open-source codebase means you can query the underlying graph/vector store directly
- Self-host option: YES — Apache-2.0 license, pip install cognee, runs locally with configurable backends (Neo4j/FalkorDB/Kuzu for graph, LanceDB/Qdrant/pgvector for vectors). Zero hosted dependency required
- Open source: Apache-2.0. GitHub: https://github.com/topoteretes/cognee (17.1k stars, v1.0.8 released 2026-05-06, 31 open issues)
- Migration story: Moderate. Data is in your own graph + vector DB if self-hosted. Cloud plan: no documented export API, but the open-source route eliminates lock-in entirely

### Claude Code integration path
- Native MCP server: YES — first-party `cognee-mcp` module in main repo. Claude Code listed as explicitly supported integration. Source: https://docs.cognee.ai/cognee-mcp/integrations/claude-code (accessed 2026-05-06)
- Setup: `claude mcp add --transport http cognee http://localhost:8000/mcp -s project` (Docker) or uv-based local stdio mode. Stored in `.mcp.json`
- Setup time for solo founder: ~15-20 min (Docker pull + API key config + claude mcp add). Requires OpenAI API key for embeddings by default (adds ~$0.002/1K tokens embedding cost)
- Verdict: Native MCP — but requires Docker or Python/uv environment. Not truly zero-config

### Retrieval architecture
- Vector + graph hybrid (ECL pipeline: Extract-Cognify-Load). Vectors handle semantic recall, graph handles relationship traversal and provenance
- Recall benchmarks (cited): #1 on LoCoMo, #1 on ConvoMem, 85.4% on LongMemEval-S. Sub-300ms recall at 100B+ tokens/month scale. Graph-enhanced accuracy ~90% vs ~60% for plain RAG
- Source: https://www.cognee.ai/ and https://medium.com/@cognee/cognee-june-2025-updates (accessed 2026-05-06)
- Confidence: MEDIUM (vendor-cited benchmarks, not independent)

### Write semantics
- Provenance tracking: YES — graph structure links entities to source documents with relationship metadata
- Confidence scoring: Not documented in public API
- Expiry / TTL: Not documented as built-in
- Topic tagging: YES — entities and relationships auto-extracted during Cognify step

### Supersession / contradiction handling
- Auto-detect contradictions: No explicit contradiction detection documented. "Improve" operation enriches the graph, and "Memify" enables refinement of existing graphs, but no automated conflict resolution
- Manual override: YES via Update operation and entity editing
- Docs: https://docs.cognee.ai/llms.txt (accessed 2026-05-06)

### Setup complexity
- Install: `pip install cognee` (open source) or Docker pull for cloud MCP. Requires configuring LLM provider + graph DB + vector store — 3 separate config choices before first write
- "Hello world" memory write + read: ~20-30 min including DB selection and API key wiring. Not trivial for solo founder

### Risk flags / gotchas
- Developer plan 10,000 API calls/mo cap could be hit fast at 60 agents × multiple sessions
- Benchmark numbers are vendor-published, no independent audit found
- Graph DB dependency (Neo4j/FalkorDB) adds infrastructure surface area if self-hosting
- Embedding cost not included in plan price — requires separate OpenAI/Anthropic API key and usage
- v1.0.8 is very recent; production stability at agent scale is unproven

### Score draft
- Cost (1=$50+/mo, 5=$0): 3 — $35/mo fits ceiling but embedding costs add ~$5-15/mo extra; self-host = 5
- Lock-in (1=severe, 5=none): 4 — Apache-2.0, self-host eliminates lock-in; cloud plan = 3
- Claude Code compat (1=custom build, 5=native): 4 — first-party MCP server, Claude Code explicitly listed
- Retrieval quality (1=unproven, 5=best-in-class): 4 — strong benchmarks (vendor-cited), graph+vector hybrid is architecturally sound
- Write semantics (1=none, 5=full provenance/confidence/expiry): 3 — graph provenance YES, confidence/TTL not documented
- Supersession (1=manual, 5=automatic): 2 — no automated contradiction detection documented
- Setup complexity (1=SRE-level, 5=trivial): 3 — Docker + config choices, ~20-30 min, not <30 min for non-technical path
- **Total / 35: 23**

### Sources
- Pricing: https://www.cognee.ai/pricing (2026-05-06)
- GitHub: https://github.com/topoteretes/cognee (2026-05-06)
- MCP integration: https://docs.cognee.ai/cognee-mcp/integrations/claude-code (2026-05-06)
- Benchmarks: https://www.cognee.ai/ (2026-05-06); https://memgraph.com/blog/from-rag-to-graphs-cognee-ai-memory

---

## OpenAI Memory in Assistants API

### Pricing (cited)
- Free tier: No separate memory pricing — you pay model tokens only
- Assistants API: No additional charge for threads/persistent state. Pay underlying model tokens per run. Thread re-processes full history on each run, causing token costs to scale unboundedly
- CRITICAL: OpenAI Assistants API is **deprecated and shuts down August 26, 2026** — 3.5 months from today
- Replacement (Responses API): Uses `previous_response_id` chaining or Conversations API for persistence; developer manages state manually
- Source URL + date: https://www.eesel.ai/blog/openai-assistants-api (accessed 2026-05-06); https://developers.openai.com/api/docs/guides/migrate-to-responses

### Lock-in profile
- Data export: Threads and messages accessible via API while service runs. No guaranteed export after shutdown
- Self-host option: NO — OpenAI-hosted only
- Open source: NO
- Migration story: SEVERE — August 2026 shutdown means any investment now is immediately stranded. Migration to Responses API requires rebuilding state management

### Claude Code integration path
- Native MCP server: NO — OpenAI Assistants API has no MCP server
- REST/SDK approach: Would require custom Next.js wrapper to call OpenAI API from Claude Code agents. Non-trivial wiring
- Setup time for solo founder: NOT VIABLE — no MCP path, active deprecation makes this a dead end
- Verdict: NOT VIABLE — deprecated August 2026, no MCP, not Anthropic-native, wrong vendor for a Claude Code workflow

### Retrieval architecture
- Thread-based: stores full message history, truncates at context limit. No semantic retrieval — linear append-only
- Recall benchmarks: None — not a retrieval system, just conversation history persistence
- Latency: Full thread re-processed on every run — O(n) cost scaling with conversation length

### Write semantics
- Provenance tracking: NO — messages stored as-is with timestamps
- Confidence scoring: NO
- Expiry / TTL: NO built-in TTL
- Topic tagging: NO

### Supersession / contradiction handling
- Auto-detect contradictions: NO
- Manual override: NO
- No documentation on contradiction handling exists — linear append model

### Setup complexity
- OpenAI account + API key, create Assistant, create Thread, add messages, create Run
- "Hello world": ~10 min but immediately limited by deprecation risk

### Risk flags / gotchas
- SHUTDOWN: Service terminates August 26, 2026 — any build on this is stranded within months
- Token cost explosion: Full thread re-read on every run; 50-session workflow with 10K token threads = $50+/mo minimum
- No MCP: Cannot integrate with Claude Code agents without custom build
- Vendor lock-in: OpenAI only, no self-host, no export guarantee post-shutdown
- Wrong stack: Beamix runs on Anthropic Claude — cross-vendor memory adds latency and complexity

### Score draft
- Cost (1=$50+/mo, 5=$0): 2 — token costs scale unboundedly; no ceiling
- Lock-in (1=severe, 5=none): 1 — shutdown Aug 2026, no self-host, no export
- Claude Code compat (1=custom build, 5=native): 1 — no MCP, custom build required
- Retrieval quality (1=unproven, 5=best-in-class): 1 — linear append, no semantic retrieval
- Write semantics (1=none, 5=full provenance/confidence/expiry): 1 — none
- Supersession (1=manual, 5=automatic): 1 — none
- Setup complexity (1=SRE-level, 5=trivial): 3 — easy to start, immediately deprecated
- **Total / 35: 10**

### Sources
- Deprecation: https://www.eesel.ai/blog/openai-assistants-api (2026-05-06)
- Migration guide: https://developers.openai.com/api/docs/guides/migrate-to-responses (2026-05-06)
- Pricing model: https://community.openai.com/t/pricing-for-assistant-instructions-and-threads-runs/804796
- Responses API: https://www.pkgpulse.com/blog/openai-chat-completions-vs-responses-api-vs-assistants-2026

---

## Anthropic Memory Tool (memory_20250818)

### Pricing (cited)
- Free tier: N/A — this is an API-level tool, not a standalone service
- Max plan ($100/mo): Max plan includes Claude.ai memory features ("Long-term Project Memory") for the chat UI. However, memory_20250818 is a **Messages API tool** — it requires API tokens and a client-side implementation. It is NOT a hosted service included in Max plan
- The memory_20250818 tool is client-side: zero additional per-call service charge beyond standard Claude API token costs. You provide the `/memories` directory storage (local filesystem, S3, DB — your choice)
- At Beamix scale: ~50-200 sessions/mo × average 500 tokens memory overhead = ~25K-100K tokens/mo = $0.08-$0.30/mo marginal cost (at Sonnet 4.6 input rates)
- Adam already has Max plan ($100/mo) which includes API credits — tool adds near-zero marginal cost
- Source URL + date: https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool (accessed 2026-05-06); https://support.claude.com/en/articles/11049741-what-is-the-max-plan (accessed 2026-05-06)

### Lock-in profile
- Data export: YES — memories are plain markdown/XML files in `/memories` directory. You own the storage. Zero lock-in
- Self-host option: N/A — this IS self-hosted by design (client-side tool, you control storage)
- Open source: SDK helpers are in open-source Anthropic SDKs (Python: `BetaAbstractMemoryTool`, TypeScript: `betaMemoryTool`). Not a separate product
- Migration story: TRIVIAL — files are plaintext, no vendor migration needed. Change storage backend anytime

### Claude Code integration path
- Native MCP server: NO — memory_20250818 is a Messages API tool, not an MCP server. Claude Code's auto memory (MEMORY.md system) is separate and already built-in
- Integration for subagent .md workflow: MEDIUM complexity — tool must be enabled per API call with `tools: [{"type": "memory_20250818"}]`. Requires client-side handler implementation. Claude Code's built-in auto memory (MEMORY.md) is the simpler path for the `.md files` use case
- Setup time: For API agents — ~60-90 min to implement client-side handlers (view/create/str_replace/insert/delete/rename commands). For CLAUDE.md / auto-memory use — already works in Claude Code v2.1.59+, zero setup
- Verdict: For Claude Code subagent .md workflow: already solved by Claude Code's built-in auto memory. For programmatic API agents needing richer memory: MCP/Custom build required to wire it

### Retrieval architecture
- Flat file system — NOT semantic vector search. Memory is stored as organized markdown/XML files in `/memories`. Retrieval is file listing + file read, not similarity search
- Recall benchmarks: None published — this is a file I/O primitive, not a retrieval system
- Latency: Filesystem read latency (~1-5ms local). No embedding compute required

### Write semantics
- Provenance tracking: Manual only — Claude writes whatever structure you prompt it to use. No built-in schema
- Confidence scoring: NO built-in
- Expiry / TTL: NO built-in — you implement in your handler if needed
- Topic tagging: NO built-in — Claude can organize by filename/folder but requires prompting

### Supersession / contradiction handling
- Auto-detect contradictions: NO — Claude may or may not notice contradictions based on context window. No systematic detection
- Manual override: YES — str_replace command allows targeted updates
- System prompt instructs Claude to "always view memory directory before doing anything" but contradiction resolution is implicit, not guaranteed
- Docs: https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool (Prompting guidance section, accessed 2026-05-06)

### Setup complexity
- For API agents: Add `tools: [{"type": "memory_20250818", "name": "memory"}]` to API call + implement 6 command handlers (~100-200 lines) + provide `/memories` directory
- For Claude Code auto memory: Zero setup — already works, MEMORY.md at `~/.claude/projects/<project>/memory/MEMORY.md`
- "Hello world" memory write + read: ~30 min for API implementation; ~0 min for Claude Code auto memory

### Risk flags / gotchas
- Beta status: Tool identifier `memory_20250818` suggests August 2025 beta release. "Reach out through feedback form" in docs implies not GA — behavior may change
- ZDR implication: When ZDR is active, API data isn't retained server-side, but your client-side `/memories` files persist normally. ZDR applies to API payloads, not your storage
- No semantic retrieval: For 50K+ memories, flat-file browsing becomes unwieldy. Claude must read directory listing + choose files — scales poorly past ~50-100 memory files without additional structure
- Not an L2 memory system: This is a primitive tool that Claude uses to read/write files. The intelligence of organizing, superseding, and retrieving relevant memories is entirely on Claude's reasoning, not a dedicated system
- Conflation risk: Claude Max plan's "Long-term Project Memory" UI feature is DIFFERENT from the memory_20250818 API tool. Max plan memory is a chat UI feature; the API tool is for programmatic agents

### Score draft
- Cost (1=$50+/mo, 5=$0): 5 — near-zero marginal cost; storage is free local files or existing Supabase
- Lock-in (1=severe, 5=none): 5 — plaintext files, you own storage, no vendor
- Claude Code compat (1=custom build, 5=native): 3 — native for Claude Code auto memory; requires implementation for API agents; no MCP
- Retrieval quality (1=unproven, 5=best-in-class): 2 — flat file I/O, no semantic search, scales poorly past ~100 files
- Write semantics (1=none, 5=full provenance/confidence/expiry): 2 — manual schema only, no built-in provenance/confidence/TTL
- Supersession (1=manual, 5=automatic): 2 — implicit via Claude reasoning, no guaranteed detection
- Setup complexity (1=SRE-level, 5=trivial): 4 — Claude Code auto memory = trivial; API agents = moderate
- **Total / 35: 23**

### Sources
- Memory tool docs: https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool (2026-05-06)
- Claude Code memory docs: https://code.claude.com/docs/en/memory (2026-05-06)
- Max plan: https://support.claude.com/en/articles/11049741-what-is-the-max-plan (2026-05-06)
- API pricing: https://platform.claude.com/docs/en/about-claude/pricing
- orchestrator.dev context: https://orchestrator.dev/blog/2026-04-06--claude-code-agent-memory-2026/ (2026-05-06)

---

## Custom MCP Memory Server on Supabase pgvector

### Pricing (cited)
- Supabase: Adam already pays for Supabase; pgvector extension is FREE on all paid plans
- Embedding model cost: OpenAI text-embedding-3-small ~$0.02/1M tokens; at 50-200 sessions × ~500 tokens/session = ~$0.001-0.01/mo — effectively free
- Engineering cost: Adam builds it himself — $0 labor cost by assumption. BUT this is weeks of solo-founder time, not hours (see risk flags)
- Ongoing MCP server hosting: Can run as Supabase Edge Function (~$0 at low volume on paid plan) or as a lightweight Next.js API route on existing Vercel (free tier)
- Monthly new spend: $0-5 (embedding API only)
- Source URL: https://supabase.com/docs/guides/database/extensions/pgvector (accessed 2026-05-06); https://github.com/sdimitrov/mcp-memory (accessed 2026-05-06)

### Lock-in profile
- Data export: YES — data lives in your own Supabase Postgres. Full SQL dump anytime
- Self-host option: YES by definition — you own the entire stack
- Open source: YES — you write it; reference implementations exist (Apache-2.0, MIT)
- Migration story: TRIVIAL — standard Postgres rows, dump and restore anywhere

### Claude Code integration path
- Native MCP server: You build it — can expose as stdio or HTTP MCP server. Claude Code reads `.mcp.json` for local MCP servers
- Community reference implementations exist: https://github.com/sdimitrov/mcp-memory (pgvector + Postgres MCP, 62 stars), https://github.com/tommysee/open-brain-mcp (Cloudflare Workers + Supabase pgvector)
- Setup time: NOT VIABLE in <30 min. Building from scratch: 2-4 weeks of focused solo-founder work for production-grade system (see risk flags). Using a reference implementation and adapting: 4-8 hours minimum
- Verdict: NOT VIABLE in <30 min for production use. Viable if Adam allocates 1-2 sprint weeks to build and maintain

### Retrieval architecture
- Semantic vector search via pgvector cosine similarity on stored embeddings
- Reference implementations use BERT (384-dim) or OpenAI text-embedding-3-small (1536-dim)
- Graph-style relationship traversal: NOT included without additional schema design
- Recall benchmarks: None for custom builds — depends entirely on embedding model quality and chunking strategy

### Write semantics
- Provenance tracking: Must be designed — add `source_agent`, `session_id`, `timestamp`, `context_tags` columns. Not automatic
- Confidence scoring: Must be designed — add `confidence` float column, populated by calling model
- Expiry / TTL: Must be designed — add `expires_at` timestamp + cron cleanup job
- Topic tagging: Must be designed — embed tags as searchable columns or separate tag table

### Supersession / contradiction handling
- Auto-detect contradictions: NOT BUILT — zero implementations include this. Must custom-build: embed incoming memory, run similarity search for conflicts (cosine > 0.9), prompt Claude to evaluate and resolve
- Manual override: Must build update/delete endpoints
- Engineering estimate for supersession alone: 2-3 days of design + implementation + testing

### Setup complexity
- Phase 1 (basic read/write): ~4-8 hours — Supabase table, pgvector index, embedding endpoint, MCP server with 3-4 tools, `.mcp.json`
- Phase 2 (chunking, ranking, filtering): ~1-2 weeks — chunking strategy, hybrid BM25 + vector search, context-aware ranking
- Phase 3 (supersession, provenance, confidence, TTL): ~1-2 weeks — contradiction detection pipeline, confidence scoring, expiry logic
- Phase 4 (maintenance): Ongoing — embedding model upgrades, schema migrations, performance tuning
- Total realistic estimate: 4-6 weeks to reach feature parity with Cognee or Mem0

### Risk flags / gotchas
- Massive scope underestimate risk: V2/V3 listed this as "build a thin MCP server." It is not thin. A production memory system with provenance, supersession, chunking, and semantic retrieval is a significant engineering project — likely 4-6 weeks solo
- Maintenance burden: Adam must maintain embedding pipeline, pgvector indexes, MCP server, and retrieval logic indefinitely. Every Claude API update could require schema changes
- No supersession: All existing reference implementations are append-only. Contradiction detection requires a dedicated search-then-evaluate pipeline that doesn't exist off-the-shelf
- Chunking strategy is non-trivial: How to chunk agent memories (which aren't documents) requires bespoke design. Too small = lost context; too large = poor recall
- Reference implementations are immature: `sdimitrov/mcp-memory` has 2 commits and 62 stars — not production-validated
- Opportunity cost: 4-6 weeks of build time vs. 15 minutes to configure Cognee. Solo-founder time is the scarcest resource

### Score draft
- Cost (1=$50+/mo, 5=$0): 5 — near-zero ongoing cost; Supabase already paid
- Lock-in (1=severe, 5=none): 5 — you own everything
- Claude Code compat (1=custom build, 5=native): 2 — you must build the MCP server; community references exist but none are production-ready
- Retrieval quality (1=unproven, 5=best-in-class): 3 — pgvector semantic search is solid IF chunking/embedding pipeline is well-built; unproven until built
- Write semantics (1=none, 5=full provenance/confidence/expiry): 3 — can build anything, but must build it all; none comes for free
- Supersession (1=manual, 5=automatic): 2 — must build; no existing reference implementation
- Setup complexity (1=SRE-level, 5=trivial): 1 — 4-6 weeks for production-grade; NOT VIABLE in <30 min
- **Total / 35: 21**

### Sources
- Supabase pgvector: https://supabase.com/docs/guides/database/extensions/pgvector (2026-05-06)
- Reference MCP server: https://github.com/sdimitrov/mcp-memory (2026-05-06)
- Supabase MCP memory service: https://lobehub.com/mcp/forkit369-supabase-memory-service (2026-05-06)
- Real build story: https://medium.com/@danielschwartzer/why-i-built-my-own-ai-memory-infrastructure-a7fe6bb962e9 (2026-05-06)
- Community open-brain MCP: https://github.com/tommysee/open-brain-mcp (2026-05-06)

---

## Comparative Summary

| Criterion (max 5 each) | Cognee | OpenAI Assistants | Anthropic Memory Tool | Custom MCP/pgvector |
|------------------------|--------|-------------------|-----------------------|---------------------|
| Cost | 3 | 2 | 5 | 5 |
| Lock-in | 4 | 1 | 5 | 5 |
| Claude Code compat | 4 | 1 | 3 | 2 |
| Retrieval quality | 4 | 1 | 2 | 3 |
| Write semantics | 3 | 1 | 2 | 3 |
| Supersession | 2 | 1 | 2 | 2 |
| Setup complexity | 3 | 3 | 4 | 1 |
| **Total / 35** | **23** | **10** | **23** | **21** |

**Recommendation from Researcher B:**
1. **Cognee** (tie with Anthropic Memory Tool at 23/35, but wins on retrieval quality and Claude Code MCP integration) — if setup time budget allows 20-30 min and $35/mo fits
2. **Anthropic Memory Tool** (tie at 23/35) — wins on cost ($0 marginal), lock-in (zero), and setup simplicity for Claude Code auto memory; loses on retrieval quality at scale
3. **Custom MCP/pgvector** (21/35) — zero cost and zero lock-in, but honest engineering estimate is 4-6 weeks, not hours; NOT VIABLE at <30 min constraint
4. **OpenAI Assistants** (10/35) — DO NOT USE: shutting down August 2026, no MCP, wrong vendor

**Key unresolved question for CEO synthesis:** Cognee's 10K API calls/mo cap on Developer plan — needs validation against actual agent call volume at 60 agents × 50-200 sessions/mo. May require Cloud plan ($200/mo), which exceeds Beamix's $50/mo ceiling.


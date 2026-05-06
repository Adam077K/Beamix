# RESEARCH-WS1A: Memory Tools Evaluation — Researcher A
**Candidates:** Letta, Mem0, Zep + Graphiti
**Context:** Beamix solo-founder, ~50-200 sessions/mo, cost ceiling $20-50/mo new spend, stack Next.js 16 + Supabase + Anthropic Claude Max
**Date:** 2026-05-06
**Researcher:** Researcher A (WS1A)

---

## Letta (formerly MemGPT)

### Pricing (cited)
- Free tier: Exists (agent count and memory limits not publicly documented on pricing page)
- API Plan — $20/mo: Unlimited agents, $0.10/active agent/mo + $0.00015/sec tool execution + pay-as-you-go LLM usage — this is the relevant tier for Beamix's 60-agent workload
- Pro — $20/mo flat: Up to 20 stateful agents + usage quota for open-weight models; insufficient for 60 agents
- Max Lite — $100/mo: Up to 50 stateful agents (still insufficient for 60-agent target)
- Source: https://www.letta.com/pricing — accessed 2026-05-06

**Solo-founder estimate:** API Plan at $20/mo base + per-agent/per-execution charges. At 60 active agents: +$6/mo agent fees minimum. At 50-200 sessions/mo with light tool use: likely $25-45/mo total. Fits the cost ceiling. Confidence: MEDIUM (execution cost depends on tool call frequency which is unknown).

### Lock-in profile
- Data export: Letta is open source (Apache 2.0); self-hosted instances give full DB access. Cloud version export: NOT FOUND in docs — no explicit export UI documented.
- Self-host option: Yes — Docker + PostgreSQL + pgvector required. Officially described as "not an officially supported product" — community Discord support only. Significant operational burden.
- Open source: Apache 2.0 — https://github.com/letta-ai/letta — 6,565 GitHub stars (as of 2025 search)
- Migration story: Self-hosted = full control. Cloud = low confidence on export path. Migrating away means re-implementing MemGPT memory block architecture locally. Medium-hard migration.
- Source: https://docs.letta.com/guides/selfhosting/ — accessed 2026-05-06

### Claude Code integration path
- Native MCP server: Letta is an MCP *consumer*, not an MCP server. Letta connects to external MCP servers as a client. It does NOT expose itself as an MCP server that Claude Code can connect to.
- Alternative — Claude Subconscious: Letta published an official plugin (github.com/letta-ai/claude-subconscious) that uses Claude Code lifecycle hooks (SessionStart, UserPromptSubmit, PreToolUse, Stop) to inject memory via stdout. Background Letta agent watches transcripts, explores codebase, injects context before each prompt. Requires LETTA_API_KEY env var + plugin marketplace install.
- Claude Code Memory Proxy: Docs mention a proxy approach but the page returned 404 (https://docs.letta.com/guides/integrations/claude-code-proxy) — [NOT FOUND]
- Setup time: Claude Subconscious install appears to be marketplace + API key = ~10-15 min. Confidence: MEDIUM.
- Verdict: **Custom-plugin (lifecycle hooks)** — not Native MCP, not REST, but a first-party Claude Code plugin. Functional but non-standard.
- Sources: https://github.com/letta-ai/claude-subconscious — accessed 2026-05-06; https://github.com/letta-ai/skills — accessed 2026-05-06

### Retrieval architecture
- Vector / graph / hybrid: Hybrid — core memory (in-context structured blocks), archival memory (vector DB, pgvector), recall memory (conversation history with date/text search). Agent self-manages what to retrieve via tool calls.
- Recall@K benchmarks: NOT FOUND in official docs. DMR benchmark cited in Mem0's comparison blog puts MemGPT at 93.4% vs Zep's 94.8% — but this is a third-party benchmark, not Letta's own claim. Confidence: LOW.
- Latency claims: NOT FOUND in official docs. Confidence: UNKNOWN.
- Source: https://docs.letta.com/advanced/memory-management/ (page loaded, content sparse) — 2026-05-06; benchmark ref: https://mem0.ai/blog/benchmarked-openai-memory-vs-langmem-vs-memgpt-vs-mem0-for-long-term-memory-here-s-how-they-stacked-up

### Write semantics
- Provenance tracking: NOT documented in official docs accessed. The agent manages its own memory via tool calls — provenance is implicit in the agent's reasoning, not a structured schema field. Confidence: LOW.
- Confidence scoring: NOT FOUND. Confidence: UNKNOWN.
- Expiry / TTL: NOT FOUND. No documented TTL mechanism. Confidence: UNKNOWN.
- Topic tagging: Core memory blocks are named (e.g., "human", "persona") — effectively manual topic grouping. Archival memory has no documented tagging schema. Confidence: LOW.

### Supersession / contradiction handling
- Auto-detect contradictions: The agent is designed to self-manage memory — it can in principle detect contradictions via tool calls and overwrite blocks, but this is LLM-reasoning-based, not a schema-enforced mechanism. No structured contradiction detection documented.
- Manual override: Yes — core memory blocks are directly editable via API.
- Docs section: https://docs.letta.com/advanced/memory-management/ — page existed but returned minimal content. Architecture paper MemGPT (arXiv) describes the design; production docs sparse on this. Confidence: LOW.

### Setup complexity
- Install / signup: Sign up for letta.com cloud OR self-host Docker + Postgres + pgvector. For Claude Code memory: install claude-subconscious plugin via marketplace + set LETTA_API_KEY.
- "Hello world" memory write + read: Quickstart shows npm install @letta-ai/letta-client + 3-step SDK usage. Estimated 15-20 min for cloud path, 45+ min for self-hosted.
- Source: https://docs.letta.com/quickstart — accessed 2026-05-06

### Risk flags / gotchas
- Self-hosting explicitly flagged as "not an officially supported product" — Docker debugging burden is real for a solo founder.
- The primary Claude Code integration (claude-subconscious) is lifecycle-hook based, meaning memory injection adds latency to every Claude Code prompt — performance impact unclear.
- Letta is an MCP *consumer*, not provider — if you want Claude Code to call Letta as an MCP server, that's custom build territory.
- Memory architecture (core/archival/recall) is powerful but opinionated — requires understanding MemGPT paper to tune effectively. Steep learning curve for non-research users.
- Vendor risk: 6.5K GitHub stars, VC-backed, active. Not a concern short-term, but the "memory-first coding agent" pivot (Letta Code) may pull focus away from general agent memory use cases.

### Score draft
- Cost (1=$50+/mo, 5=$0): **4** — API plan likely $25-45/mo for Beamix scale. Within ceiling.
- Lock-in (1=severe, 5=none): **3** — Apache 2.0 OSS exists; cloud export path unclear; self-host migration is medium complexity.
- Claude Code compat (1=custom build, 5=native): **3** — First-party claude-subconscious plugin exists but uses lifecycle hooks, not native MCP. Functional but non-standard.
- Retrieval quality (1=unproven, 5=best-in-class): **3** — MemGPT architecture well-researched (USENIX '24 paper); DMR benchmark shows 93.4%. Not the top performer.
- Write semantics (1=none, 5=full provenance/confidence/expiry): **2** — Block-based memory is agent-managed, not schema-enforced. No documented provenance/confidence/TTL.
- Supersession (1=manual, 5=automatic): **2** — LLM-reasoning based, not structured auto-detection.
- Setup complexity (1=SRE-level, 5=trivial): **3** — Cloud path + claude-subconscious plugin is ~15-20 min. Self-host is SRE-level.
- **Total / 35: 20**

### Sources
- Pricing: https://www.letta.com/pricing (accessed 2026-05-06)
- Self-hosting: https://docs.letta.com/guides/selfhosting/ (accessed 2026-05-06)
- Claude integration: https://github.com/letta-ai/claude-subconscious (accessed 2026-05-06)
- Quickstart: https://docs.letta.com/quickstart (accessed 2026-05-06)
- GitHub (license + stars): https://github.com/letta-ai/letta (accessed 2026-05-06)
- Memory management: https://docs.letta.com/advanced/memory-management/ (accessed 2026-05-06)
- DMR benchmark (third-party): https://mem0.ai/blog/benchmarked-openai-memory-vs-langmem-vs-memgpt-vs-mem0-for-long-term-memory-here-s-how-they-stacked-up (accessed 2026-05-06)

---

## Mem0

### Pricing (cited)
- Hobby (Free): 10,000 add requests/mo + 1,000 retrieval requests/mo. Unlimited end users. Community support.
- Starter — $19/mo: 50,000 add requests/mo + 5,000 retrieval requests/mo. Still community support.
- Pro — $249/mo: 500,000 add requests/mo + 50,000 retrieval requests/mo. Private Slack, analytics, multi-project.
- Enterprise: Custom.
- Startup program: 3 months free Pro for companies under $5M funding (priority support included).
- Source: https://mem0.ai/pricing — accessed 2026-05-06

**Solo-founder estimate:** At 50-200 sessions/mo, Beamix's 60 agents would consume roughly 200-1,000 memory writes and ~500-2,000 retrievals per month. Hobby free tier likely sufficient at current scale; Starter $19/mo gives headroom. Well within the $20-50/mo ceiling. Confidence: HIGH.

### Lock-in profile
- Data export: Self-hosted version gives direct DB access (vector + graph + KV). Cloud version export: NOT explicitly documented. Apache 2.0 OSS means you can migrate to self-hosted.
- Self-host option: Yes — Docker Compose deployment guide available. Blog post at https://mem0.ai/blog/self-host-mem0-docker. Community supported.
- Open source: Apache 2.0 — https://github.com/mem0ai/mem0 — 37,000+ GitHub stars (HIGH confidence, cited by multiple sources, accessed 2026-05-06).
- Migration story: Strong — 37K stars means active ecosystem; Apache 2.0 means fork-friendly. Cloud-to-self-host migration feasible given same OSS codebase.
- Sources: https://github.com/mem0ai/mem0; https://docs.mem0.ai/open-source/overview — accessed 2026-05-06

### Claude Code integration path
- Native MCP server: YES — Official. Mem0 ships a managed cloud MCP server at https://mcp.mem0.ai/mcp. 9 memory tools (add, search, update, delete, list entities, etc.). Maintained by Mem0 team. Also: https://github.com/mem0ai/mem0-mcp (official repo).
- Setup: Three options — (A) Plugin marketplace: 2 commands; (B) MCP-only: `npx mcp-add --name mem0-mcp --type http --url "https://mcp.mem0.ai/mcp" --clients "claude code"` — single command; (C) Manual .mcp.json config.
- Setup time: Option B is estimated <5 minutes. Option A ~5-10 min including account creation.
- Verdict: **Native MCP** — official, vendor-maintained, single-command install for Claude Code.
- Known issue: GitHub issue #3400 (mem0ai/mem0) — "OpenMemory MCP not working with Claude Desktop or Claude Code" — indicates some production stability issues. Confidence: MEDIUM (issue exists, unclear if resolved).
- Sources: https://docs.mem0.ai/integrations/claude-code — accessed 2026-05-06; https://github.com/mem0ai/mem0-mcp — accessed 2026-05-06; https://github.com/mem0ai/mem0/issues/3400 — accessed 2026-05-06

### Retrieval architecture
- Vector / graph / hybrid: Hybrid — vector store + graph services + rerankers. All hosted and managed by Mem0. Graph variant (Mem0ᵍ) available.
- Recall@K benchmarks (cited): LOCOMO benchmark — Mem0: 66.9% overall accuracy vs OpenAI Memory 52.9% (26% relative uplift). Graph variant Mem0ᵍ: 68.5%. Published at ECAI 2025 (arXiv:2504.19413). Methodology: 10 multi-session conversations ~26K tokens each, 200 questions per conversation, GPT-4o-mini judge at temp 0.
- Latency claims (cited): p95 latency 1.44s (Mem0) vs 0.9s (OpenAI Memory) vs 60s (LangMem). Token consumption: ~1.8K tokens vs 26K for full-context. Sources: https://mem0.ai/blog/benchmarked-openai-memory-vs-langmem-vs-memgpt-vs-mem0-for-long-term-memory-here-s-how-they-stacked-up; https://mem0.ai/research-3 — accessed 2026-05-06. Confidence: MEDIUM — Mem0 ran their own benchmark; independent replication not confirmed.

### Write semantics
- Provenance tracking: NOT explicitly documented in official docs reviewed. System extracts facts and stores across vector + graph + KV. Source attribution unclear at the API level. Confidence: LOW.
- Confidence scoring: NOT FOUND. Confidence: UNKNOWN.
- Expiry / TTL: NOT FOUND in docs reviewed. Confidence: UNKNOWN.
- Topic tagging: User / agent / session memory types act as logical namespaces. No freeform tagging documented at write time. Confidence: LOW.

### Supersession / contradiction handling
- Auto-detect contradictions: Mem0's extraction pipeline is designed to deduplicate and update memories — "automatically extracts, learns, and retrieves" implies some deduplication logic. However, no explicit contradiction-detection mechanism documented in pages reviewed.
- Manual override: Via API (update/delete memory endpoints).
- Docs section: NOT FOUND — no specific docs page on contradiction handling reviewed. Confidence: LOW.

### Setup complexity
- Install / signup: Create Mem0 account (free) → get API key (starts with `m0-`) → run single npx command to add MCP to Claude Code.
- "Hello world" memory write + read: MCP tool invocation: "List my mem0 entities" — works immediately post-install. <5 min for Option B path.
- Source: https://docs.mem0.ai/integrations/claude-code — accessed 2026-05-06

### Risk flags / gotchas
- Known MCP integration bug (GitHub #3400): OpenMemory MCP reportedly not working with Claude Code in some configurations. Check resolution status before relying on it.
- Benchmark is self-published and Mem0-funded (ECAI 2025 paper authored by Mem0 team members). The +26% accuracy claim is plausible but should be treated as MEDIUM confidence until independent replication.
- 1.44s p95 retrieval latency is *slower* than OpenAI Memory (0.9s) and significantly slower than Zep's claimed 300ms — despite Mem0's accuracy advantage.
- Free/Starter tiers exclude graph memory and advanced analytics — you may need Pro ($249/mo) to get the full Mem0ᵍ stack. This blows the cost ceiling.
- No documented TTL/expiry or confidence scoring — write semantics are minimal for a "production memory layer."

### Score draft
- Cost (1=$50+/mo, 5=$0): **5** — Hobby free tier likely sufficient for Beamix's current volume. Starter $19/mo gives comfortable headroom.
- Lock-in (1=severe, 5=none): **4** — Apache 2.0 OSS with 37K stars; self-host viable; cloud export path undocumented but migration feasible.
- Claude Code compat (1=custom build, 5=native): **5** — Official MCP server, single-command install, 9 tools, vendor-maintained.
- Retrieval quality (1=unproven, 5=best-in-class): **4** — Published ECAI 2025 paper; 66.9% LOCOMO accuracy; industry-leading benchmark vs alternatives. Self-published caveat.
- Write semantics (1=none, 5=full provenance/confidence/expiry): **2** — User/agent/session namespacing only. No provenance, confidence, TTL documented.
- Supersession (1=manual, 5=automatic): **2** — Extraction pipeline implies some deduplication; no structured contradiction-detection documented.
- Setup complexity (1=SRE-level, 5=trivial): **5** — Single npx command. <5 minutes.
- **Total / 35: 27**

### Sources
- Pricing: https://mem0.ai/pricing (accessed 2026-05-06)
- Open source / GitHub: https://github.com/mem0ai/mem0 (accessed 2026-05-06)
- Self-host: https://mem0.ai/blog/self-host-mem0-docker (accessed 2026-05-06); https://docs.mem0.ai/open-source/overview (accessed 2026-05-06)
- Claude Code MCP integration: https://docs.mem0.ai/integrations/claude-code (accessed 2026-05-06)
- MCP server repo: https://github.com/mem0ai/mem0-mcp (accessed 2026-05-06)
- MCP stability issue: https://github.com/mem0ai/mem0/issues/3400 (accessed 2026-05-06)
- LOCOMO benchmark: https://mem0.ai/blog/benchmarked-openai-memory-vs-langmem-vs-memgpt-vs-mem0-for-long-term-memory-here-s-how-they-stacked-up (accessed 2026-05-06)
- ECAI 2025 paper: arXiv:2504.19413 (referenced via MindStudio blog and Mem0 research page)
- Benchmark page: https://mem0.ai/research-3 (accessed 2026-05-06)

---

## Zep + Graphiti

### Pricing (cited)
- Free: 1,000 credits/mo, no rollover, 2 projects, 5 custom entity/edge types. Variable (lower-priority) rate limits. No credit card required. Full API access.
- Flex — $125/mo: 50,000 credits + $25/10K overage. 600 req/min, 5 projects, 10 custom entity types, 1-day API logs.
- Flex Plus — $375/mo: 200,000 credits + $75/40K overage. 1,000 req/min, 10 projects, 20 custom entity types, 7-day logs, analytics, webhooks.
- Enterprise: Custom — BYOK, BYOM, BYOC options. No traditional self-hosting listed.
- Source: https://www.getzep.com/pricing — accessed 2026-05-06

**Solo-founder estimate:** Free tier at 1,000 credits/mo is extremely tight — unclear what 1 credit maps to (episode ingest? retrieval?). Flex at $125/mo significantly exceeds the $20-50/mo cost ceiling. DOES NOT FIT unless free tier is sufficient, which is uncertain. Confidence: MEDIUM (credit definition unclear).

### Lock-in profile
- Data export: Zep provides a CRUD API for data management. Community Edition (self-hosted Zep OSS) was sunset in April 2025 — Zep stopped maintaining it, though the repo remains under Apache 2.0. BYOC at Enterprise tier is the only cloud-egress option.
- Self-host option: Graphiti (the OSS temporal graph engine underneath Zep) is fully self-hostable under Apache 2.0. Running raw Graphiti (not Zep) bypasses vendor lock-in entirely. Zep managed cloud = limited self-host for non-Enterprise.
- Open source: Graphiti — Apache 2.0 — https://github.com/getzep/graphiti — 20,000+ GitHub stars (cited by Zep blog post: "Graphiti Hits 20K Stars"). Zep CE (Community Edition) is deprecated.
- Migration story: Good — if on Graphiti OSS, you own everything. If on Zep cloud, migration means moving to raw Graphiti which requires operational work (FalkorDB or Neo4j). CRUD API helps export. Confidence: MEDIUM.
- Sources: https://blog.getzep.com/announcing-a-new-direction-for-zeps-open-source-strategy/ (accessed 2026-05-06); https://github.com/getzep/graphiti (accessed 2026-05-06)

### Claude Code integration path
- Native MCP server: YES — Graphiti MCP Server 1.0 (official, by Zep). Published at https://help.getzep.com/graphiti/getting-started/mcp-server and https://github.com/getzep/graphiti/blob/main/mcp_server/README.md. "Hundreds of thousands of weekly users" claimed in Zep blog post. Six core tools: add_episode, search_facts, search_nodes, get_episodes, delete_episode, clear_graph.
- BUT: Marked "experimental" in the README. Not a hosted HTTP MCP — requires local setup (Python + Docker + FalkorDB or Neo4j). This is stdio transport, not cloud MCP.
- Setup: Clone repo → configure .env → `docker compose up` from mcp_server directory → configure Claude Desktop/Code settings file with stdio transport reference.
- Setup time: Prerequisites (Docker, Python 3.10+, Neo4j or FalkorDB) + `docker compose up` → estimated 30-45 min for someone unfamiliar with graph databases. Tight against the <30 min constraint.
- Verdict: **MCP (local/self-hosted, experimental)** — exists and functional, but requires Docker + graph DB locally. Not a single-command cloud install. Borderline VIABLE for a solo founder comfortable with Docker.
- Sources: https://help.getzep.com/graphiti/getting-started/mcp-server (accessed 2026-05-06); https://blog.getzep.com/graphiti-hits-20k-stars-mcp-server-1-0/ (accessed 2026-05-06); https://github.com/getzep/graphiti/blob/main/mcp_server/README.md (accessed 2026-05-06)

### Retrieval architecture
- Vector / graph / hybrid: Temporal knowledge graph — facts stored as nodes/edges with timestamps and provenance. Hybrid graph + vector retrieval (semantic search over graph). This is the most architecturally sophisticated option reviewed.
- Recall@K benchmarks (cited):
  - DMR (Deep Memory Retrieval) benchmark: Zep 94.8% accuracy vs MemGPT 93.4%. Source: Zep research paper arXiv:2501.13956, published January 2025.
  - LongMemEval: Up to 18.5% aggregate accuracy improvement vs full chat transcript baseline. Source: same paper.
- Latency claims (cited): P95 retrieval latency 300ms (from Zep blog "State of the Art" post: https://blog.getzep.com/state-of-the-art-agent-memory/). Zep also claims "90% latency reduction" in LongMemEval vs full-context baseline. Confidence: MEDIUM — self-published but accompanied by an arXiv paper.
- Sources: arXiv:2501.13956 (accessed via search 2026-05-06); https://blog.getzep.com/state-of-the-art-agent-memory/ (accessed 2026-05-06)

### Write semantics
- Provenance tracking: YES — Built into Graphiti's temporal graph design. Each fact (edge) includes timestamps (created_at, valid_at, invalid_at), source episode reference, and entity node provenance. This is the strongest provenance model of the three candidates.
- Confidence scoring: NOT FOUND as a named field in docs reviewed. Graph edges have temporal validity metadata which implies confidence-like semantics. Confidence: LOW for explicit scoring field.
- Expiry / TTL: YES — Temporal edges have `invalid_at` timestamps. Facts can be automatically marked stale when superseded. This is a core architectural feature.
- Topic tagging: YES — 9 preconfigured entity types in MCP Server 1.0 (Preference, Requirement, Procedure, Location, Event, Organization, Document, Topic, Object). Custom entity types supported (5 on free tier, 10 on Flex).
- Source: https://blog.getzep.com/graphiti-hits-20k-stars-mcp-server-1-0/ (accessed 2026-05-06); arXiv:2501.13956

### Supersession / contradiction handling
- Auto-detect contradictions: YES — Graphiti's core design. Temporal graph stores facts with validity windows. When new information contradicts an existing fact, the old edge is marked invalid (`invalid_at`) and a new edge is created. This is schema-enforced, not LLM-reasoning-based.
- Manual override: Yes — via CRUD API (delete_episode, clear_graph tools).
- Cite docs: arXiv:2501.13956 (Section on temporal knowledge graph architecture). Blog: https://blog.getzep.com/state-of-the-art-agent-memory/. Confidence: HIGH for the architectural claim; MEDIUM for production behavior.

### Setup complexity
- Install / signup: Graphiti MCP path: Clone repo → configure .env (LLM API key + DB credentials) → `docker compose up`. Requires Docker and comfort with graph DB config.
- "Hello world" memory write + read: Once running, Claude Code calls add_episode tool → then search_facts → working in ~5 min after Docker is up. Getting Docker up is the bottleneck.
- Estimated total: 35-60 min for a developer unfamiliar with graph databases. Exceeds the <30 min threshold for most solo founders.

### Risk flags / gotchas
- MCP server is explicitly "experimental" — production stability at scale is unproven despite "hundreds of thousands of weekly users" claim (MCP usage != production agent memory at scale).
- Zep Cloud pricing ($125/mo minimum paid tier) blows the cost ceiling. Free tier at 1,000 credits/mo is probably too limited. The only affordable path is self-hosted Graphiti, which adds operational burden.
- Requires persistent infrastructure (FalkorDB or Neo4j) — not serverless-friendly on Vercel. Needs a separate always-on service.
- Zep CE (self-hosted Zep, not raw Graphiti) was deprecated in April 2025 — community support for managed Zep-without-cloud is now fragmented.
- Most powerful write semantics of the three, but that complexity is real operational overhead. Over-engineered for 50-200 sessions/mo solo-founder scale.
- OpenAI API key required by default for entity extraction (Graphiti uses LLMs to parse facts) — adds $5-20/mo in OpenAI costs on top of infrastructure.

### Score draft
- Cost (1=$50+/mo, 5=$0): **2** — Zep Cloud $125/mo min paid tier exceeds ceiling. Graphiti self-hosted is ~$0 software but requires persistent infra (Neo4j/FalkorDB hosting ~$20-50/mo on Railway). Barely fits ceiling, with significant setup.
- Lock-in (1=severe, 5=none): **5** — Graphiti Apache 2.0 with 20K stars. Own your data entirely. Best lock-in profile of the three.
- Claude Code compat (1=custom build, 5=native): **3** — MCP server exists and is official, but requires local Docker + graph DB. Not a hosted MCP. More setup than Mem0.
- Retrieval quality (1=unproven, 5=best-in-class): **5** — arXiv paper, 94.8% DMR accuracy (highest of candidates), 300ms P95 latency, temporal graph architecture is state-of-the-art.
- Write semantics (1=none, 5=full provenance/confidence/expiry): **5** — Full temporal provenance (created_at, valid_at, invalid_at), source episode references, entity type taxonomy. Best-in-class.
- Supersession (1=manual, 5=automatic): **5** — Schema-enforced automatic invalidation of contradicted facts. Core architectural feature, not a bolt-on.
- Setup complexity (1=SRE-level, 5=trivial): **2** — Docker + graph DB + .env config. 35-60 min estimated. Fails the <30 min solo-founder test.
- **Total / 35: 27**

### Sources
- Pricing: https://www.getzep.com/pricing (accessed 2026-05-06)
- Open source direction: https://blog.getzep.com/announcing-a-new-direction-for-zeps-open-source-strategy/ (accessed 2026-05-06)
- Graphiti GitHub: https://github.com/getzep/graphiti (accessed 2026-05-06)
- MCP server docs: https://help.getzep.com/graphiti/getting-started/mcp-server (accessed 2026-05-06)
- MCP server README: https://github.com/getzep/graphiti/blob/main/mcp_server/README.md (accessed 2026-05-06)
- MCP 1.0 release: https://blog.getzep.com/graphiti-hits-20k-stars-mcp-server-1-0/ (accessed 2026-05-06)
- arXiv paper: https://arxiv.org/abs/2501.13956 (January 2025)
- Performance claims: https://blog.getzep.com/state-of-the-art-agent-memory/ (accessed 2026-05-06)

---

## Score Summary Table

| Dimension | Letta | Mem0 | Zep+Graphiti |
|-----------|-------|------|--------------|
| Cost (5=free) | 4 | 5 | 2 |
| Lock-in (5=none) | 3 | 4 | 5 |
| Claude Code compat (5=native) | 3 | 5 | 3 |
| Retrieval quality (5=best) | 3 | 4 | 5 |
| Write semantics (5=full) | 2 | 2 | 5 |
| Supersession (5=auto) | 2 | 2 | 5 |
| Setup complexity (5=trivial) | 3 | 5 | 2 |
| **Total / 35** | **20** | **27** | **27** |

**Mem0 and Zep+Graphiti tie at 27/35 but for opposite reasons.** Mem0 wins on cost, Claude Code ease, and setup speed. Zep+Graphiti wins on retrieval quality, write semantics, supersession, and lock-in. Letta trails both.

---

## Gaps and Unknown Items

- Letta: Cloud data export path not documented. Memory write latency not benchmarked. TTL, confidence scoring, provenance — all UNKNOWN from official docs.
- Mem0: Credit-to-session mapping not documented for free tier. Graph memory tier unclear (may require Pro $249/mo). Contradiction handling mechanics not documented. MCP bug #3400 resolution status unknown.
- Zep: Free tier credit definition (credits per operation) not clarified in docs. OpenAI extraction cost add-on not quantified. Experimental MCP server production ceiling unknown.

## Overall Confidence: MEDIUM
Pricing and Claude Code integration paths verified from official sources. Retrieval benchmarks are self-published by vendors (except Mem0 ECAI 2025 paper which adds credibility). Write semantics for Letta and Mem0 are incompletely documented — LOW confidence on those dimensions specifically.

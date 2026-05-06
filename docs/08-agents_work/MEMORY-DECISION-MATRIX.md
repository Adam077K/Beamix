# WS1A — Memory Tool Decision Matrix

**Date:** 2026-05-06
**Workstream:** WS1A (Memory Architecture, Phase A — Tool Re-evaluation)
**Status:** PROPOSED — pending Adam review
**Output of:** 2 parallel Sonnet researchers (RESEARCH-WS1A-memory-tools-A.md, -B.md)

---

## Methodology

Each of 7 candidates was scored 1-5 on the 7 criteria locked in `HANDOFF-WS1A-memory-architecture.md`: cost, lock-in, Claude Code compatibility, retrieval quality, write semantics, supersession handling, setup complexity. Researchers WebFetched official docs, pricing pages, and GitHub repos (sources cited inline in their findings files). Anthropic Memory Tool and Custom MCP/pgvector were scored against an explicit anti-bias frame — V2/V3 had pre-favored them. Vendor-published benchmarks are flagged MEDIUM confidence; only Mem0 has a peer-reviewed paper (ECAI 2025) and Zep has an arXiv paper (2501.13956).

---

## Matrix

| Tool | Cost | Lock-in | Claude Code | Retrieval | Write semantics | Supersession | Setup | **Total / 35** |
|------|:----:|:-------:|:-----------:|:---------:|:---------------:|:------------:|:-----:|:------------:|
| Letta (MemGPT) | 4 | 3 | 3 | 3 | 2 | 2 | 3 | **20** |
| **Mem0** | 5 | 4 | 5 | 4 | 2 | 2 | 5 | **27** |
| Zep + Graphiti | 2 | 5 | 3 | 5 | 5 | 5 | 2 | **27** |
| Cognee | 3 | 4 | 4 | 4 | 3 | 2 | 3 | **23** |
| Anthropic Memory Tool | 5 | 5 | 3 | 2 | 2 | 2 | 4 | **23** |
| Custom MCP (pgvector) | 5 | 5 | 2 | 3 | 3 | 2 | 1 | **21** |
| OpenAI Assistants Memory | 2 | 1 | 1 | 1 | 1 | 1 | 3 | **10** ← DO NOT USE |

**Scoring legend:** 5 = best fit for solo-founder Beamix; 1 = worst. Cost: 5 = $0/mo, 1 = >$50/mo. Lock-in: 5 = none/plaintext-portable, 1 = severe. Setup: 5 = trivial (<5 min), 1 = SRE-level (>1 week).

---

## Per-tool notes

**Letta (20/35).** Open-source MemGPT architecture (Apache 2.0, 22.5K stars). API plan ~$25-45/mo for 60 agents fits the ceiling. Claude Code integration is via `claude-subconscious` plugin (lifecycle hooks → stdout injection), not native MCP — functional but non-standard, and adds latency to every Claude Code prompt. Memory model (core/archival/recall blocks) is research-grade but opinionated; provenance, confidence, and TTL are not schema-enforced. Self-host explicitly flagged "not officially supported." Score-wise weakest in the lead pack because it's neither the easiest (Mem0) nor the highest-fidelity (Zep), and the integration shape is custom.

**Mem0 (27/35).** Hosted cloud MCP server at `https://mcp.mem0.ai/mcp` — single `npx` install for Claude Code (<5 min). Hobby tier (free, 10K writes + 1K retrievals/mo) likely sufficient at Beamix's current scale; Starter $19/mo gives headroom. Apache 2.0 OSS at 37K+ GitHub stars with self-host fallback. Vector + graph hybrid retrieval. ECAI 2025 paper claims +26% accuracy over OpenAI Memory on LOCOMO (66.9% accuracy, p95 1.44s) — peer-reviewed, though authored by Mem0 team. Weakness: write semantics minimal (no structured provenance, confidence, or TTL out of the box) and supersession is implicit deduplication, not schema-enforced. Open issue #3400 reports MCP stability problems with Claude Code in some configs — needs verification before commit. Plugin marketplace also offers automatic lifecycle-hook capture for Claude Code, going beyond bare MCP.

**Zep + Graphiti (27/35).** Most architecturally sophisticated of the seven. Graphiti (Apache 2.0, 25.8K stars) is a temporal knowledge graph with built-in provenance (`created_at`, `valid_at`, `invalid_at`), schema-enforced supersession (auto-invalidates contradicted edges), and 9 preconfigured entity types. arXiv:2501.13956 reports 94.8% DMR accuracy, 300ms p95 latency. **But** — Zep Cloud starts at $125/mo (blows the ceiling), Zep CE (self-hosted Zep) was sunset April 2025, leaving raw Graphiti as the only affordable path. Graphiti requires Docker + FalkorDB or Neo4j running locally or on a separate always-on host; setup time 35-60 min exceeds the <30 min constraint and infra adds $20-50/mo (Neo4j on Railway) plus ~$5-20/mo OpenAI cost for entity extraction. MCP server is marked "experimental." Right answer for Series-A Beamix; over-engineered for solo-founder Beamix today.

**Cognee (23/35).** First-party MCP integration explicitly listed for Claude Code (`docs.cognee.ai/cognee-mcp/integrations/claude-code`). Apache 2.0, 17.1K stars, v1.0.8 released 2026-05-06 (very recent). Vendor-cited benchmarks (#1 LoCoMo, 85.4% LongMemEval-S) — MEDIUM confidence, no independent audit. Hosted Developer plan $35/mo with hard 10K API calls/mo cap which 60 agents at 50-200 sessions/mo could exhaust; Cloud plan $200/mo blows the ceiling. Self-host eliminates lock-in but adds Docker + graph DB + vector store config (3 backend choices before first write). No automated supersession. Strong contender if Mem0 stability concerns prove out, but the API call cap is a real risk at our agent count.

**Anthropic Memory Tool (`memory_20250818`) (23/35).** Beta tool exposed via the Messages API. Files stored client-side in `/memories` (plaintext markdown/XML), zero lock-in, near-zero marginal cost (~$0.08-0.30/mo at Beamix scale on top of existing $100/mo Max). **But — it is not a retrieval system.** It's a 6-command file primitive (view/create/str_replace/insert/delete/rename) where Claude reasons over a directory listing. No semantic search, no embeddings, no provenance schema; everything is convention enforced by prompting. Scales poorly past ~50-100 memory files. Conflated in V2/V3 with Max plan's "Long-term Project Memory" (which is a chat-UI feature, not the API tool). For L0 (CLAUDE.md-style boot context) and small structured memory it's perfect; for L2 (cross-session episodic memory with semantic recall) it's the wrong primitive.

**Custom MCP on Supabase pgvector (21/35).** Zero ongoing cost (Supabase paid + pgvector free). Zero vendor lock-in. **But** — V2/V3 wrote this off as a "thin MCP server" and that's the bias the handoff explicitly flagged. Honest engineering estimate from Researcher B: Phase 1 basic read/write 4-8 hours; chunking/ranking 1-2 weeks; supersession + provenance + confidence + TTL 1-2 weeks; total 4-6 weeks of solo-founder time to reach feature parity with Cognee/Mem0, plus indefinite maintenance burden. Reference implementations (`sdimitrov/mcp-memory`, 62 stars, 2 commits) are not production-grade. **Fails the <30 min viability test by orders of magnitude.** Right call only if every managed option fails — not as a default.

**OpenAI Assistants Memory (10/35).** **DEPRECATED.** Service shuts down 2026-08-26 — 3.5 months from today. Replacement (Responses API) removes managed state. No MCP. Wrong vendor for an Anthropic-native stack. Any investment is stranded. Rejected on sight.

---

## Recommendation (locked) — 2-phase Mem0 plan

**L2 cross-session episodic memory tool: Mem0** — start with cloud Hobby tier for fast validation, migrate to OSS self-host on existing Supabase Postgres+pgvector once integration shape is proven.

### Why not just pick one of the two flavors?

The cloud-vs-OSS question turns out to be **operational, not strategic**. Per Mem0's official `platform-vs-oss` docs (verified 2026-05-06):

| | OSS self-host | Cloud (paid) |
|---|---|---|
| Memory engine | **Same** as cloud | Same |
| Semantic search, smart dedup, multimodal, advanced retrieval | ✅ | ✅ |
| Graph memory | ✅ self-configured (you wire Neo4j) | ✅ managed |
| User/agent/session memories, SDKs, integrations | ✅ | ✅ |
| Webhooks, web dashboard, built-in analytics | ❌ DIY | ✅ |
| SOC2 / GDPR / audit logs | ❌ | ✅ |
| Memory export tooling | ❌ DIY (own DB) | ✅ |
| Setup time | 30-60 min (Docker + env + MCP wire-up) | <5 min (single `npx`) |
| Ongoing ops | You patch it | Mem0 patches it |
| Cloud SLA dependency | None | Yes — `mcp.mem0.ai` uptime |
| MCP server | `elvismdev/mem0-mcp-selfhosted` (community, 84⭐, March 2026 active) | `mcp.mem0.ai/mcp` (vendor-maintained) |

**OSS provides "the same adaptive memory engine as the platform"** (Mem0 docs, https://docs.mem0.ai/open-source/overview, accessed 2026-05-06). The paid platform's only meaningful differentiators at our scale are time-to-first-byte and ongoing ops burden — both of which front-load to setup, not to long-term capability.

### The 2-phase plan

**Phase 1 — Cloud bring-up (WS1B, ~30-60 min).** Wire `https://mcp.mem0.ai/mcp` into one Claude Code subagent via single `npx mcp-add`. Use Hobby free tier (10K writes / 1K retrievals/mo — sufficient at current volume). Smoke-test the issue #3400 stability concern on real Beamix agents. Validate that the *integration shape* (subagent → MCP → memory recall mid-session) actually solves the "DECISIONS.md is write-only theater" problem this whole workstream exists to solve. If shape works, lock the contract; if shape fails, fall back to Anthropic Memory Tool before doing more work.

**Phase 2 — Migrate to OSS self-host (WS1F migration phase, after WS6A validates real Mem0 usage).** Stand up Mem0 OSS server pointed at **existing Supabase Postgres+pgvector** (no new always-on infra — Supabase is already paid). Host the Mem0 server on a small Vercel/Cloudflare/Railway container ($0-5/mo) or as part of the Bastion stack. Swap MCP endpoint from `mcp.mem0.ai` to self-hosted URL. Migrate rows via standard Postgres dump/restore. Same engine, zero cloud SLA dependency, zero pricing-change risk, zero new monthly spend.

### Reasoning for the 2-phase shape (not "pick one")

1. **Phase 1 derisks the integration shape cheaply.** We don't yet know if Mem0's MCP works the way we want with Claude Code subagents at scale. Cloud Hobby is free and 5 min to set up — perfect to find out. If the shape is wrong, we found out without burning 60 min on Docker + Postgres + env config.
2. **Phase 2 derisks vendor lock-in operationally.** Once we know the shape works, Mem0 cloud's only remaining advantage at our scale is convenience. We're already paying for Supabase Postgres+pgvector — moving there costs $0/mo new spend and removes a cloud SLA dependency that the V4 corporate-OS frame would otherwise have to factor into its DR plan.
3. **Same engine = no rewrite at migration.** Both flavors expose the same Mem0 API/MCP. Migration is a connection-string swap and a Postgres dump — not a re-embed, not a re-wire of WS1D's write-contract layer, not a touch on agent .md files.

### What remains the same as the original recommendation

- **Tied at 27/35 with Zep+Graphiti, wins the operational tiebreaker.** Zep would have locked us into Docker + Neo4j/FalkorDB always-on infra from day 1. Mem0 (either flavor) is lighter.
- **Anti-bias note honored.** Custom MCP/pgvector still rejected — even with the OSS Mem0 path, "we'll build our own thin MCP" remains 4-6 weeks vs Mem0 OSS's 30-60 min, and Mem0's engine includes smart dedup, semantic search, and supersession heuristics we'd otherwise have to write ourselves.
- **Write-semantics gap (provenance, confidence, TTL) still gets filled in WS1D** with a thin Beamix-side wrapper. Independent of cloud-vs-OSS choice.

### Fallbacks

- **If Phase 1 cloud fails (issue #3400 reproduces):** skip cloud, go straight to Phase 2 OSS self-host on Supabase. Costs ~30-60 min instead of ~5 min.
- **If both Mem0 flavors fail:** Anthropic Memory Tool + structured `/memories` (zero retrieval, but $0 and zero lock-in). Plan B: Cognee at $35/mo.

**Reversibility:** Easy. Apache 2.0 OSS, JSON-over-MCP contract, your data lives in Postgres rows after Phase 2. WS1D's thin Beamix wrapper means swapping for Cognee/Zep/Anthropic Memory Tool later is a single-adapter change.

**Cost impact (monthly):** $0 in Phase 1 (Hobby cloud free). $0-5/mo in Phase 2 (Mem0 OSS server hosting; Supabase Postgres+pgvector already paid). Inside the $50/mo ceiling under both phases.

**Setup time estimate:**
- Phase 1 (WS1B): ~30-60 min total — 5 min cloud install + 15 min issue #3400 smoke test + 15 min Beamix wrapper API + 15-30 min pilot agent
- Phase 2 (WS1F): ~60-120 min — Mem0 OSS Docker bootstrap on Supabase + MCP endpoint swap + row migration + smoke retest

---

## Open questions for Adam

1. **Stability of Mem0 MCP under Claude Code subagents.** Issue #3400 is the one real production-blocker we found. Acceptable to spend 30 min smoke-testing before locking? If unstable in our setup, recommendation falls back to Anthropic Memory Tool with structured `/memories`.
2. **Volume forecast.** 60 agents × 50-200 sessions/mo is the published assumption. Does Adam expect step-function growth (e.g., 500 sessions/mo by end of Q3 2026)? If yes, the Mem0 Pro tier ($249/mo) blows the ceiling; we'd want to revisit with a different tool (likely Zep+Graphiti on Series A spend).
3. **Provenance/confidence/TTL — fill gap in WS1D, or push back on the recommendation?** Mem0 doesn't ship these; we'd write a thin Beamix wrapper. Acceptable, or do we want a tool with these as primary features (only Zep+Graphiti has them, with the operational cost noted)?
4. **Self-host pre-commitment.** Do we want to set up self-hosted Mem0 from day 1 (heavier setup, full lock-in immunity) or stay on cloud and migrate later if needed? Recommendation is "cloud now, self-host later if metrics warrant." Adam can override.

---

## Sources

All sources cited inline in:
- `docs/08-agents_work/2026-05-06-agent-build/RESEARCH-WS1A-memory-tools-A.md` (Letta, Mem0, Zep+Graphiti)
- `docs/08-agents_work/2026-05-06-agent-build/RESEARCH-WS1A-memory-tools-B.md` (Cognee, OpenAI Memory, Anthropic Memory Tool, Custom MCP)

Highest-load citations:
- Mem0 Claude Code docs: https://docs.mem0.ai/integrations/claude-code (2026-05-06)
- Mem0 ECAI 2025 paper: arXiv:2504.19413
- Mem0 MCP stability issue: https://github.com/mem0ai/mem0/issues/3400 (2026-05-06)
- Mem0 pricing: https://mem0.ai/pricing (2026-05-06)
- Zep+Graphiti arXiv: https://arxiv.org/abs/2501.13956 (Jan 2025)
- Anthropic Memory Tool: https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool (2026-05-06)
- OpenAI Assistants deprecation: https://www.eesel.ai/blog/openai-assistants-api (2026-05-06)
- Cognee Claude Code docs: https://docs.cognee.ai/cognee-mcp/integrations/claude-code (2026-05-06)
- Letta Claude integration: https://github.com/letta-ai/claude-subconscious (2026-05-06)

---

**End of WS1A deliverable.** Awaiting Adam-review before WS1B starts.

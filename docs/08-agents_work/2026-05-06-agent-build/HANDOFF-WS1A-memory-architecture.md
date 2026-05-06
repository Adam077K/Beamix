# Hand-off Prompt — Start of Workstream 1A (Memory Tool Re-evaluation)

**Audience:** the next team / next Claude Code session that picks up the Beamix war-room build.
**Date prepared:** 2026-05-06 by CEO session.
**Status:** approved by Adam. Ready to copy-paste into a fresh `/agent ceo` or `claude` session.

---

## How to use this file

Copy the **prompt block at the bottom of this file** (`## Prompt to paste`) and paste it as your first message to a new Claude Code session. The session will load the right context, follow the right discipline, and produce the WS1A deliverables.

The prompt assumes the next session has access to this same Beamix repo. Run it from the repo root or any worktree that has the repo on disk.

---

## What's been done before WS1A

Six prior sessions across 2026-05-05 and 2026-05-06 produced:

| File | What it is |
|------|-----------|
| `docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-CORPORATE-OS.md` | The strategic vision: Linear-as-the-company, role-based agents, $0-8/mo new spend, foundations-first |
| `docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-ENVIRONMENT-MAP.md` | The 8-layer environment map: devices → channels → cloud critical path → data → agent org → skills/memory → routines → bastion |
| `docs/08-agents_work/2026-05-06-agent-build/RESEARCH-01-source-agent-mds.md` | Verbatim agent .md excerpts from wshobson, BMAD, claude-flow (5 patterns to lift) |
| `docs/08-agents_work/2026-05-06-agent-build/RESEARCH-02-orchestrator-skills.md` | Inventory of 423 local skills + recommended CEO/CTO skill stack |
| `docs/08-agents_work/2026-05-06-agent-build/RESEARCH-03-agent-md-best-practices-2026.md` | The authoritative spec for writing agent .md files in 2026 (Anthropic-sourced) |
| `docs/08-agents_work/2026-05-06-agent-build/PLAN-deep-design-war-room.md` | **THE PLAN.** 6 workstreams, foundations-first, agents-last. WS1A is your starting point. |
| `docs/08-agents_work/2026-05-05-war-room-rethink/SETUP-GUIDE-step-by-step.md` | Step-by-step Linear/Cloudflare/GitHub setup — for WS4 build phase later, not now |
| `.claude/agents/{ceo,cto,qa-lead}.md` | **THROWAWAY DRAFTS.** Read only as examples of what NOT to do. WS6A redesigns from scratch. |

## What WS1A produces (your deliverables this phase)

Per the plan (`PLAN-deep-design-war-room.md` § Workstream 1):

- **Decision matrix** comparing 7 memory tools (Letta, Mem0, Zep+Graphiti, Cognee, OpenAI Memory, Anthropic Memory Tool, custom MCP) on: cost, lock-in, Claude Code compatibility, retrieval quality, write semantics, provenance support, supersession handling
- **Locked recommendation** for L2 (cross-session episodic memory) tool
- **Session file** at `docs/08-agents_work/sessions/2026-05-07-[lead]-ws1a-memory-tools.md` (use today's date when you actually run)
- **DECISIONS.md entry** noting the tool choice + rationale + reversibility

## What you must NOT do in WS1A

- Do NOT touch `.claude/agents/` (those are WS6's territory)
- Do NOT start WS1B-1F (sub-phases that come after Adam approves 1A's tool choice)
- Do NOT skip the per-workstream methodology (research → design → Adam review → halt)
- Do NOT exceed the $30 cost cap for this workstream
- Do NOT write more files than the deliverables above

## Hard constraints

- **Cost cap:** $30 of API spend for WS1A. Halt + escalate if approaching.
- **Time-box:** vendor evaluation hard-stops after 30 min per vendor. If a vendor doesn't have a working Claude Code integration in <30 min, mark "NOT VIABLE" and move on.
- **Decision before opinion:** the matrix must score on objective criteria first, then commit a recommendation.
- **Halt at Adam-review:** after producing the matrix + recommendation, post a Linear comment OR Telegram OR (since Linear isn't wired yet) just tell Adam in chat: "WS1A done, recommendation = X, awaiting your call."

## Beamix context the next session needs to know

- **Stack:** Next.js 16 monorepo (turborepo + pnpm), Supabase (already paid, has pgvector available), Vercel, Paddle, Resend, Inngest, OpenRouter (legacy — moving to direct Anthropic SDK)
- **Adam's Anthropic plan:** Claude Max ($100/mo, includes Routines, Memory Tool beta access)
- **Bastion:** Adam has an 8GB RAM home Mac that can run light services (Postgres, Redis, MCP servers, Bun-SQLite dashboards) — but NOT local LLMs of useful size
- **Cost ceiling:** $20-50/mo new cloud spend allowed. Existing $155/mo (Vercel/Supabase/Paddle/Resend/Inngest) doesn't count toward the cap.
- **Existing skills inventory:** ~423 skills in `.agent/skills/` — many high-quality (muratcankoylan + obra clusters are A-grade); R2 has the inventory.
- **Existing memory state (Audit B today):** memory is "partially write-only theater." DECISIONS.md is read by 6 agents. LONG-TERM.md, CODEBASE-MAP.md, brain MOCs are orphaned. ZERO functional retrieval infrastructure (no pgvector, no Memory Tool wired, no MCP memory server). Each session re-reads the 42K-token MANIFEST.json before any productive work begins.

## Decision criteria for the matrix

For each of the 7 candidates, score 1-5 on:

1. **Cost** ($/mo at solo-founder scale, ~50-200 sessions/mo) — 5 = $0, 1 = >$50/mo
2. **Lock-in risk** (how hard to migrate out) — 5 = none, 1 = severe
3. **Claude Code compatibility** (native, MCP, custom integration?) — 5 = native, 1 = custom build required
4. **Retrieval quality** (vector? graph? both? recall@5 reported?) — 5 = best-in-class, 1 = unproven
5. **Write semantics** (provenance, confidence, expiry built in?) — 5 = full, 1 = none
6. **Supersession handling** (when new entry contradicts old) — 5 = automatic, 1 = manual only
7. **Setup complexity** (does it work in <30 min for a solo founder?) — 5 = trivial, 1 = SRE-level

Total each candidate. Highest wins for L2. Note runners-up for fallback.

**Pre-bias to be aware of:** V2/V3 reflexively dismissed third-party tools in favor of Anthropic Memory Tool + custom pgvector. WS1A reopens this. Be honest — if Letta or Mem0 actually score higher, recommend them.

## Output format

```markdown
# WS1A — Memory Tool Decision Matrix
## Methodology
[1 paragraph — what you scored on, sources used]

## Matrix
| Tool | Cost | Lock-in | Claude Code | Retrieval | Write semantics | Supersession | Setup | Total |
|------|------|---------|-------------|-----------|-----------------|--------------|-------|-------|
| Letta (MemGPT) | … | … | … | … | … | … | … | … |
| Mem0 | … | … | … | … | … | … | … | … |
| Zep + Graphiti | … | … | … | … | … | … | … | … |
| Cognee | … | … | … | … | … | … | … | … |
| OpenAI Memory | … | … | … | … | … | … | … | … |
| Anthropic Memory Tool | … | … | … | … | … | … | … | … |
| Custom MCP (pgvector on Supabase) | … | … | … | … | … | … | … | … |

## Per-tool notes
[1 paragraph each — the specific gotchas or wins not captured by the score]

## Recommendation (locked)
**L2 cross-session episodic memory tool: [TOOL]**
**Reasoning:** [3 sentences]
**Fallback if recommendation fails:** [TOOL]
**Reversibility:** [easy / medium / hard]
**Cost impact (monthly):** [$X]
**Setup time estimate:** [hours]

## Open questions for Adam
[Anything that didn't resolve in the matrix and needs his input before WS1B starts]

## Sources
[URL + date for every numerical claim]
```

Write that to `docs/08-agents_work/MEMORY-DECISION-MATRIX.md` (this is the WS1A artifact — the rest of WS1B-1F builds on it).

---

## Prompt to paste

Copy everything below this line into a new Claude Code session.

---

```
You are continuing the Beamix war-room build. Adam has approved a deep-design plan; you are starting the FIRST workstream (WS1A — memory tool re-evaluation).

**Read these files in this order before any other action:**
1. `docs/08-agents_work/2026-05-06-agent-build/PLAN-deep-design-war-room.md` — the master plan. You are starting WS1A only. Do NOT touch other workstreams.
2. `docs/08-agents_work/2026-05-06-agent-build/HANDOFF-WS1A-memory-architecture.md` — the hand-off prompt with constraints, deliverables, and decision criteria for what you're about to do.
3. `docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-CORPORATE-OS.md` — the strategic frame.
4. `docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-ENVIRONMENT-MAP.md` — the 8-layer environment map (memory is layers L0-L5).
5. `docs/08-agents_work/2026-05-06-agent-build/RESEARCH-03-agent-md-best-practices-2026.md` — the agent .md spec (relevant because memory access pattern feeds into every agent design later).
6. The Audit B output in your conversation context: memory is "partially write-only theater"; DECISIONS.md is read by 6 agents; LONG-TERM.md and CODEBASE-MAP.md are orphaned; zero retrieval infrastructure exists.

**Your one job for this session:** produce `docs/08-agents_work/MEMORY-DECISION-MATRIX.md` per the format in the hand-off file. Score 7 candidates (Letta, Mem0, Zep+Graphiti, Cognee, OpenAI Memory, Anthropic Memory Tool, custom MCP on Supabase pgvector) on 7 criteria, recommend a winner for L2 (cross-session episodic memory), and stop.

**Hard constraints:**
- $30 cost cap on this session.
- Hard 30-minute time-box per vendor evaluation; mark "NOT VIABLE" and move on if a vendor can't be Claude-Code-integrated in that window.
- Do NOT touch `.claude/agents/` (those are WS6's territory, not yours).
- Do NOT start WS1B-1F. Halt at Adam-review.
- Do NOT exceed the deliverables in the hand-off file.

**Methodology (per the plan):**
1. Research dispatch — send 2 parallel researchers (Sonnet, NOT Opus) to mine the official docs of each candidate. Each returns a structured findings file.
2. Design dispatch — synthesize the 7 candidates into the decision matrix using the format in the hand-off file.
3. Halt at Adam-review — write the matrix file, write a session file at `docs/08-agents_work/sessions/<today>-ceo-ws1a-memory-tools.md`, append a DECISIONS.md entry with status "PROPOSED — pending Adam review", and post a brief summary to chat.

**When you finish:** stop. Do NOT proceed to WS1B. Do NOT touch other parts of the system. Just deliver the matrix + recommendation + session file + DECISIONS proposal, and tell Adam: "WS1A complete. Recommendation = X. Awaiting your call to proceed to WS1B."

**Anti-bias note:** prior sessions (V2, V3) reflexively dismissed third-party tools in favor of Anthropic Memory Tool + custom pgvector. WS1A explicitly reopens this. Be honest: if Letta or Mem0 actually score higher, recommend them. Adam wants the right answer, not the consistent answer.

Begin by reading the 6 files listed above. Confirm in chat that you've read them and that you understand WS1A's scope. Then dispatch the 2 researchers in parallel and wait.
```

---

## After WS1A completes

When the next session returns the matrix + recommendation:

1. Adam reviews the matrix.
2. If approved → next session starts WS1B (the L0-L5 stack design using the locked tool from 1A).
3. If rejected → next session iterates the matrix with Adam's pushback (max 3 cycles per the plan's methodology).

Each subsequent workstream gets its own hand-off file at `docs/08-agents_work/2026-05-XX-[workstream]/HANDOFF-WS[N]-*.md`. The pattern repeats.

**The whole sequence is:**
WS1 (memory) → WS2 (orchestration) → [WS3 tech stack runs in parallel] → WS4 (connections) → WS5 (synthesis) → WS6 (agents tier-by-tier).

WS6 is the LAST workstream. Agents are designed against a stable platform, not the other way around.

---

**End of hand-off. Good luck to whoever picks this up.**

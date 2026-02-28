# DECISIONS.md — Architecture & Strategy Log

*Updated by any agent making a decision that affects other agents or future work.*

---

## Format

```
### [YYYY-MM-DD] — [Title]
**Decision:** [What was decided]
**Rationale:** [Why — alternatives considered]
**Decided by:** [Agent]
**Affects:** [Which agents / files]
**Reversible?** [Yes / No / Hard]
```

---

## Log

### [DATE] — System Initialized
**Decision:** 12-agent autonomous startup team configured with 938+ skills from antigravity-awesome-skills
**Rationale:** Solo founder needs agents covering every startup role. Skills sourced from proven open-source repo.
**Decided by:** Iris
**Affects:** All agents
**Reversible?** Yes

---

### [2026-02-27] — GSD → GSA Rebrand
**Decision:** Renamed all identifiers from GSD to GSA across the codebase (commands, paths, file names, /gsa: slash commands, gsa-tools.cjs, ~/.gsa config dir, gsa/ branch templates).
**Rationale:** Align naming with GSA (Green Startup Academy) project identity. Exception: `subagent_type` in mcp_task calls remains `gsa-*` (e.g. gsa-planner, gsa-executor) because Cursor's mcp_task tool requires these exact enum values—changing them would break agent spawning.
**Decided by:** Atlas
**Affects:** .claude/commands/gsa/, gsa-tools.cjs, hooks, workflows, config defaults
**Reversible?** Yes (search/replace + file renames)

---

*Add new entries chronologically — newest at the bottom*

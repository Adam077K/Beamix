# Migration Map: Agent/Rules/Workflow Unification

## Scope

This migration unifies AI-operational assets inside this project under a canonical Claude-compatible root while preserving backward compatibility:

- Canonical root: `.claude/`
- Compatibility layer: `.agent/`
- Archived legacy: `.claude/archive/agent_old/`

## Sources Scanned

- `.agent/` (active legacy structure)
- `.agents/` (additional skills/rules bundle)
- `.agent_old/` (archived legacy)
- `n8n/n8n - skills/` (n8n-domain skill assets)

## Classification Rules

- `canonical`: primary runtime content in `.claude/*`
- `duplicate`: overlapping content, kept once in canonical and retained in source for compatibility
- `project-specific`: content kept but namespaced under canonical structure
- `archive`: non-runtime historical content

## Source -> Destination Mapping

| Source | Destination | Class | Notes |
| --- | --- | --- | --- |
| `.agent/agents/*` | `.claude/agents/*` | canonical | Primary specialist agents copied to canonical root |
| `.agent/skills/*` | `.claude/skills/*` | canonical | Primary skill library copied to canonical root |
| `.agent/workflows/*` | `.claude/commands/*` | canonical | Workflows mapped to Claude command docs |
| `.agent/rules/*` | `.claude/rules/*` | canonical | Global project rules copied to canonical root |
| `.agents/skills/*` | `.claude/skills/<normalized-name>*` | duplicate/project-specific | Added with normalization and collision-safe suffixes |
| `n8n/n8n - skills/*` | `.claude/skills/n8n-domain/*` | project-specific | Kept as namespaced n8n domain assets |
| `.agent_old/*` | `.claude/archive/agent_old/*` | archive | Marked non-runtime historical source |

## Normalization Applied

- Directory names from `.agents/skills` normalized to lowercase kebab-case.
- In case of collision with existing canonical skill names, suffix `-from-dot-agents` is used.

## Implementation Status

- [x] Canonical `.claude/{agents,skills,commands,rules,archive}` created.
- [x] Content copied from `.agent/` into canonical `.claude/`.
- [x] Content imported from `.agents/skills/` into canonical `.claude/skills/`.
- [x] `n8n` skill set imported into `.claude/skills/n8n-domain/`.
- [x] `.agent_old/` mirrored into `.claude/archive/agent_old/`.
- [x] Compatibility updates applied to runtime scripts to prefer `.claude` and fallback to `.agent`.

## Inventory Snapshot (file counts at migration time)

- `.agent`: 199 files
- `.agents`: 86 files
- `.agent_old`: 2 files
- `n8n/n8n - skills`: 22 files
- `.claude` (after merge): 279 files


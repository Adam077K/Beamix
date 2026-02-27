# Claude AI Assets Index

This directory is the canonical source of truth for AI agent assets in this repository.

## Canonical Structure

- `.claude/agents/` - specialist agent definitions
- `.claude/skills/` - reusable skills (`SKILL.md` pattern)
- `.claude/commands/` - workflow/command documentation
- `.claude/rules/` - project AI behavior rules
- `.claude/archive/` - archived non-runtime assets

## Compatibility Model

Legacy paths under `.agent/` are still present for backward compatibility.

Runtime resolution policy (implemented in key scripts):

1. Prefer `.claude/*`
2. Fallback to `.agent/*` when needed

## Namespaced Imports

- `n8n` assets imported under `.claude/skills/n8n-domain/`
- Secondary skill bundle imported from `.agents/skills/` with normalized names

## Migration Reference

See `MIGRATION_MAP.md` at repository root for complete source->destination mapping and classification.


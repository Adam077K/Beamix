# Compatibility Layer Notice

`.agent/` remains available as a backward-compatibility layer.

## Canonical Source

The canonical AI asset root is now `.claude/`.

## Resolution Order

For updated runtime scripts:

1. `.claude` paths are tried first
2. `.agent` paths are used as fallback

## Why This Exists

Many project docs and historical commands still reference `.agent/*`.
Keeping this layer avoids breaking existing workflows while enabling migration to Claude-standard structure.

## Next-Step Guidance

Prefer creating new assets under:

- `.claude/agents/`
- `.claude/skills/`
- `.claude/commands/`
- `.claude/rules/`


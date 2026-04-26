---
name: Claude Code paste collapse is not configurable
description: The `[Pasted text #N +X lines]` placeholder in Claude Code's input prompt is hardcoded UI behavior — not fixable via settings, env, or war-room scripts
type: project
originSessionId: 287dcad6-bcc4-4aa2-8c9c-edb62292ad2d
---
Claude Code CLI collapses large pastes in the input prompt as `[Pasted text #1 +15 lines]`. This is purely a display transform in the terminal — the full content IS sent to the model.

**Why:** Investigated 2026-04-14 after user asked to "fix war room scripts" to render pastes as one inline chunk. Confirmed via claude-code-guide agent: no `settings.json`, `settings.local.json`, `keybindings.json`, env var (`CLAUDE_CODE_*`), or `/config` option controls this. Not a war-room bug.

**How to apply:** If user complains about pasted-text placeholders, don't dig into war-room collectors or settings — it's a Claude Code product limitation. Suggest: (1) paste into `/tmp/paste.txt` and reference the path, (2) keep pastes under ~10 lines, or (3) file via `/feedback`.

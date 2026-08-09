# MCP set — target spec

Surface: **MCP configuration** — which MCP servers exist, which agents may call them, and what makes a declared grant actually true. Scope is Beamix's own `.claude/` agent system (this repo), not the shared `~/CLAUDE.md` GSA kit that other projects also fork from.

---

## Current state (measured, with the commands you ran)

### There are FOUR real config layers, not one

```bash
# 1. Project layer — git-tracked, identical across every worktree
find . -maxdepth 2 -name ".mcp.json"
cat .mcp.json
git ls-files .mcp.json                    # confirms it's tracked
diff /Users/adamks/VibeCoding/Beamix/.mcp.json .mcp.json   # IDENTICAL — same commit

# 2. User layer — global, ALL of Adam's projects, not git-tracked
python3 -c "import json; d=json.load(open('/Users/adamks/.claude.json')); print(list(d['mcpServers'].keys()))"

# 3. Project-scoped override inside the user-level file
python3 -c "import json; d=json.load(open('/Users/adamks/.claude.json')); \
p=d['projects']['/Users/adamks/VibeCoding/Beamix']; \
print(list(p['mcpServers'].keys())); print(p['enabledMcpServers']); print(p['disabledMcpServers'])"

# 4. Agent frontmatter — 26 core agent files, aspirational only
grep -rl "mcpServers:" .claude/agents/*.md | wc -l
```

**Layer 1 — `.mcp.json`** (project root, git-tracked, same for every worktree): one server, `supabase` (stdio, `npx @supabase/mcp-server-supabase@latest`, env-var substituted token — the only entry in the whole system that does credential injection correctly).

**Layer 2 — `~/.claude.json` → `mcpServers`** (user-level, global across ~10 of Adam's projects, not in this repo's git): `stitch`, `refero`, `miro`, `runpod`, `playwright`, `higgsfield`, `mem0`, `pencil`. Several store raw secrets in plaintext (Stitch's `X-Goog-Api-Key`, Refero's `Authorization: Bearer`, Runpod's API key — all inline in JSON).

**Layer 3 — `~/.claude.json` → `projects["/Users/adamks/VibeCoding/Beamix"].mcpServers`** (Beamix-specific but still outside this repo's git, lives only on Adam's machine): `framer-mcp`, `refero` (duplicate of layer 2), `playwright` (duplicate of layer 2). The `framer-mcp` URL embeds its secret **as a query-string parameter** — the worst place to put a credential (it leaks into logs, history, referrer headers).

Same project entry also carries `enabledMcpServers: ['computer-use']` (unrelated native capability, not a declared server) and `disabledMcpServers: ['claude.ai n8n', 'claude.ai Figma', 'claude.ai Gmail', 'claude.ai Google Calendar', 'stitch', 'higgsfield']` — **`stitch` and `higgsfield` are configured at user level but explicitly turned off for this project**, silently. Nothing documents that this is deliberate.

**Layer 4 — `.claude/agents/*.md` frontmatter `mcpServers:`** (26 core agents + 26 files under `war-room/`): a YAML list per agent, e.g.

```yaml
mcpServers:
  - linear
  - github
  - supabase
  - mem0
  - pgvector
```

Full per-agent breakdown, 26 core agents:

| Agent | Declared `mcpServers` |
|---|---|
| ceo | linear, github, supabase, mem0, pgvector |
| cto | github, supabase, linear, context7 |
| cpo | linear, github |
| cmo | linear, framer-mcp, mem0 |
| cbo | linear, supabase |
| cco | linear, supabase, mem0 |
| qa-lead | github, linear |
| research-lead | linear, context7 |
| design-lead | refero, stitch, pencil, playwright, linear |
| backend-engineer | supabase, ide, context7 |
| database-engineer | supabase, ide |
| frontend-engineer | ide, framer-mcp, refero |
| ai-engineer | context7, ide |
| data-engineer | supabase, segment-cdp |
| devops-engineer | github, supabase |
| security-engineer | *(empty — `mcpServers: []`)* |
| test-engineer | playwright, ide |
| code-reviewer | github |
| researcher | context7 |
| technical-writer | github |
| product-designer | pencil, stitch, refero, playwright |
| design-critic | playwright, refero |
| design-polisher | playwright, refero, pencil |
| qa-engineer | playwright |
| adversary-engineer | github |
| supabase-cleaner | supabase |

13 distinct names declared: `linear`(9), `supabase`(9), `github`(8), `playwright`(6), `context7`(5), `ide`(5), `refero`(5), `mem0`(3), `pencil`(3), `framer-mcp`(2), `stitch`(2), `pgvector`(1), `segment-cdp`(1). (War-room adds 26 more files: `linear` climbs to 25 refs total there, `github` to 15/16 — consistent with the brief's ballpark.)

### Cross-referencing the four layers: what's real vs fiction

| Declared name | In *any* config layer? | Real status today |
|---|---|---|
| `supabase` | Layer 1 | **Live** |
| `playwright` | Layer 2 + Layer 3 (dup) | **Live**, declared twice |
| `refero` | Layer 2 + Layer 3 (dup) | **Live**, declared twice, key leaks in plaintext |
| `pencil` | Layer 2 | **Live** |
| `framer-mcp` | Layer 3 | **Live**, secret leaks in URL |
| `stitch` | Layer 2 | Configured, then **explicitly disabled** for this project |
| `mem0` | Layer 2 | Configured (`https://mcp.mem0.ai/mcp`, matches the deliberate `DECISIONS.md` Mem0-Phase-1 call), but **OAuth was never completed** — the only tools this session exposes for it are `authenticate` / `complete_authentication`, no `search`/`add`. Functionally inert. |
| `linear` | **Nowhere** | Pure fiction — most-declared name in the whole system (9/26 core agents, CEO's entire job description depends on it) and zero config anywhere |
| `github` | **Nowhere** | Pure fiction. `gh` CLI is already Bash-allow-listed and does everything these 8 declarations wanted |
| `context7` | **Nowhere** | Pure fiction, but a real, low-risk, genuinely useful product (Upstash Context7 — library-doc lookups) |
| `ide` | **Nowhere as a server config** | Not a config-file MCP at all — it's Claude Code's native VS Code/Cursor bridge, resolves only when attached to a connected IDE session |
| `pgvector` | **Nowhere** | Not an MCP server — a Postgres extension, queried through `supabase`'s own tools |
| `segment-cdp` | **Nowhere** | Not an MCP server, and Segment isn't in Beamix's stack at all |

**5 of 13 names resolve to a live, callable server today** (`supabase`, `playwright`, `refero`, `pencil`, `framer-mcp`); **1 resolves but is disabled** (`stitch`); **1 resolves but is unauthenticated / functionally inert** (`mem0`); **1 is a native contextual capability, never a config server** (`ide`); **5 exist in no config layer whatsoever** (`linear`, `github`, `context7`, `pgvector`, `segment-cdp`). Counting everything short of "fully live and callable" as non-functional gives **8 of 13 — corroborates the brief's headline number**, with the extra granularity above showing it's not one failure mode but four different ones stacked together.

### The deeper bug: even the 5 live servers can't be called, because a second field gates tool access and nothing ever populates it

```bash
grep -n "^tools:.*mcp__" .claude/agents/*.md | wc -l   # → 0
```

Claude Code subagents are granted tool access through the `tools:` frontmatter array, not `mcpServers:`. Zero of the 26 core agents' `tools:` arrays contain a single `mcp__`-prefixed name — they list only built-ins (`Read, Write, Edit, Bash, Glob, Grep, SendMessage, TaskCreate, TaskUpdate, TaskList`, plus `WebSearch`/`WebFetch` for `researcher`). So even `backend-engineer`'s `mcpServers: [supabase, ide, context7]` — where `supabase` genuinely works — grants it **nothing**, because `mcp__supabase__*` never appears in its `tools:` list.

This isn't an oversight the team forgot to fix — it's documented as deliberately deferred, in the system's own template:

```bash
grep -n -B3 -A2 "mcpServers.*Declarative" docs/08-agents_work/2026-05-16-agent-rethink/07b-AGENT-TEMPLATE.md
```
> `mcpServers` | Declarative grants. **The bridge can enforce in WS6+.** | Listing in body prose only (current drift) makes grants un-auditable.

The "bridge" (`WS6+`) was never built. `mcpServers:` has been decorative since the field was invented.

### The linter that exists checks the wrong thing, and runs nowhere

```bash
node .claude/hooks/schema-lint.js          # runs standalone — 10/26 FAIL (all on maxTurns range)
grep -n "mcpServers" .claude/hooks/schema-lint.js
#   48:  'mcpServers',                                    (required-field name only)
#   207:  // mcpServers must be a list (possibly empty)
#   208:  if (fm.mcpServers !== undefined && !Array.isArray(fm.mcpServers)) {
#   209:    issues.push(`frontmatter: mcpServers must be a YAML list`);
grep -rln "schema-lint" .github/ .claude/settings.json package.json   # → nothing, wired into nothing
```

`schema-lint.js` already has the *right pattern* for `skills:` — it loads `.claude/skills/MANIFEST.json` into a `Set` (`loadSkills()`, line 141-150) and flags any declared skill name not in that set (line 212-226). It does **not** do this for `mcpServers:` — the only check is "is it a YAML list." A server name can be complete fiction (`linear`, `pgvector`) and the linter says nothing. And the whole script isn't invoked by any CI workflow or `settings.json` hook — it only runs when someone remembers to type the command by hand.

### `mcp__linear__*` vs `mcp__linear-server__*` — confirmed, real split

```bash
grep -rl "mcp__linear__" .claude/ | wc -l          # → 23
grep -rl "mcp__linear-server__" .claude/ | wc -l   # → 4  (eod-sync, morning-digest, friday-retro, monday-standup — all war-room Routines)
```
Both prefixes reference the same intended integration, which — per the cross-reference above — doesn't exist in any config layer under *either* name.

### Related, adjacent findings that bear on the target design

- `security-engineer.md` declares `mcpServers: []` — literally the only agent whose job is explicitly DB/security auditing, and it has zero MCP access, including to `supabase.get_advisors` (which surfaces RLS/security lint findings directly).
- `cmo.md` and `frontend-engineer.md` are granted `framer-mcp`, but `CLAUDE.md`'s own **Architecture Split** section says the Framer marketing site is a *separate project* and "All marketing pages... are built and maintained in Framer — NOT in this codebase." The grant and the stated scope boundary contradict each other.
- `cco.md` still declares grants (`linear, supabase, mem0`) even though `CLAUDE.md`'s org chart states "CCO folded into CPO (premature org)." Whether `cco.md` should exist at all is an org-chart-surface question (see Open Questions) — this spec treats its grants as contingent on that decision.
- `.claude/skills/MANIFEST.json`'s own `totalSkills` field (145) disagrees with `len(skills)` (149) — the resolver this spec's mechanism is modeled on is itself slightly inconsistent; worth a one-line fix when the MCP manifest is built, so the new file doesn't inherit the same drift.
- No agent's `mcpServers:` currently references `miro`, even though `miro-diagram` / `miro-doc` skills exist and Adam has used a live Miro board for real planning work (`project_road_to_july7` memory entry) — a real capability gap in the *other* direction, not just fiction to delete.

---

## Target state (the complete enumeration)

### Design rule

A server earns a place in the target set if **(a)** it maps to something in Beamix's actual stack or a demonstrated cross-cutting need (planning, design, QA), **and** **(b)** at least one agent has a concrete, nameable task that needs it. Everything else is cut. Every server that survives gets: a canonical name, a home config layer, an `enabled` default, and — for the two highest-blast-radius servers — capability tiers instead of blanket access.

### The manifest — `.claude/mcp/MCP_MANIFEST.json`

This is the new single source of truth, structurally the sibling of `.claude/skills/MANIFEST.json`. Full target content:

```json
{
  "version": 1,
  "last_updated": "2026-08-09",
  "servers": [
    {
      "name": "supabase",
      "layer": "project",
      "config_path": ".mcp.json",
      "transport": "stdio",
      "enabled": true,
      "mandatory": true,
      "owners": ["database-engineer", "backend-engineer", "data-engineer", "devops-engineer", "security-engineer", "ai-engineer", "cbo", "ceo", "qa-lead", "supabase-cleaner"],
      "capabilities": {
        "read": ["list_tables", "list_extensions", "list_migrations", "list_branches", "list_edge_functions", "get_edge_function", "get_logs", "get_advisors", "get_project_url", "get_publishable_keys", "search_docs", "generate_typescript_types"],
        "write": ["execute_sql", "deploy_edge_function"],
        "migrate": ["apply_migration", "create_branch", "delete_branch", "merge_branch", "rebase_branch", "reset_branch"]
      },
      "notes": "migrate tier is database-engineer only. apply_migration executes directly against the DB — the Irreversible QA gate blocks the PR merge, it does not (and cannot, at the tool-call layer) block the call itself. See depends_on: qa-gate."
    },
    {
      "name": "linear",
      "layer": "project",
      "config_path": ".mcp.json",
      "transport": "http",
      "url": "https://mcp.linear.app/mcp",
      "auth": "oauth",
      "enabled": true,
      "mandatory": false,
      "owners": ["ceo", "cto", "cpo", "cmo", "cbo", "cco", "qa-lead", "research-lead", "design-lead"],
      "capabilities": {
        "read": ["list_issues", "get_issue", "list_comments", "list_projects", "list_teams"],
        "write": ["create_comment", "update_issue", "create_issue"]
      },
      "notes": "Canonical key is 'linear' — tool prefix mcp__linear__*. The 4 war-room files using mcp__linear-server__* rename to match. Verify exact remote endpoint against Linear's current MCP docs at build time; this URL is the documented one as of this spec's writing, not independently re-verified live."
    },
    {
      "name": "context7",
      "layer": "project",
      "config_path": ".mcp.json",
      "transport": "http",
      "url": "https://mcp.context7.com/mcp",
      "auth": "none (free tier) — CONTEXT7_API_KEY env var raises rate limit",
      "enabled": true,
      "mandatory": false,
      "owners": ["researcher", "backend-engineer", "ai-engineer", "cto", "research-lead"],
      "capabilities": { "standard": ["resolve-library-id", "get-library-docs"] }
    },
    {
      "name": "playwright",
      "layer": "project",
      "config_path": ".mcp.json",
      "transport": "stdio",
      "command": "npx @playwright/mcp@latest",
      "enabled": true,
      "mandatory": false,
      "owners": ["test-engineer", "qa-engineer", "design-critic", "design-polisher", "product-designer", "design-lead"],
      "capabilities": {
        "standard": ["browser_click", "browser_close", "browser_console_messages", "browser_drag", "browser_drop", "browser_evaluate", "browser_file_upload", "browser_fill_form", "browser_find", "browser_handle_dialog", "browser_hover", "browser_navigate", "browser_navigate_back", "browser_network_request", "browser_network_requests", "browser_press_key", "browser_resize", "browser_select_option", "browser_snapshot", "browser_tabs", "browser_take_screenshot", "browser_type", "browser_wait_for"],
        "unsafe": ["browser_run_code_unsafe"]
      },
      "notes": "unsafe tier (arbitrary JS exec in page context) is test-engineer only; every other owner gets standard."
    },
    {
      "name": "refero",
      "layer": "user",
      "config_path": "~/.claude.json (user mcpServers)",
      "transport": "http",
      "auth": "bearer token via REFERO_API_KEY env var — NOT the hardcoded key currently in the file",
      "enabled": true,
      "mandatory": false,
      "owners": ["design-lead", "frontend-engineer", "design-critic", "design-polisher", "product-designer"],
      "capabilities": { "standard": ["refero_search_flows", "refero_search_screens", "refero_search_styles", "refero_get_flow", "refero_get_screen", "refero_get_screen_image", "refero_get_similar_screens", "refero_get_style"] },
      "notes": "Personal paid account — stays user-level, shared across projects. Remove the duplicate declaration in the project-scoped block."
    },
    {
      "name": "pencil",
      "layer": "user",
      "config_path": "~/.claude.json (user mcpServers)",
      "transport": "stdio",
      "enabled": true,
      "mandatory": false,
      "owners": ["design-lead", "product-designer", "design-polisher"],
      "capabilities": { "standard": ["*"] },
      "notes": "Local binary path, inherently machine-scoped — cannot live in project .mcp.json."
    },
    {
      "name": "mem0",
      "layer": "user",
      "config_path": "~/.claude.json (user mcpServers)",
      "transport": "http",
      "url": "https://mcp.mem0.ai/mcp",
      "auth": "oauth — NOT YET COMPLETED",
      "enabled": true,
      "mandatory": false,
      "status": "unauthenticated",
      "owners": ["ceo", "cmo", "cco"],
      "capabilities": { "standard": ["*"] },
      "notes": "Matches DECISIONS.md's deliberate Mem0-Phase-1 call. enabled:true because the intent is real, but status:unauthenticated must be surfaced (see mechanism section) until Adam completes the OAuth flow once."
    },
    {
      "name": "stitch",
      "layer": "user",
      "config_path": "~/.claude.json (user mcpServers)",
      "transport": "http",
      "enabled": false,
      "mandatory": false,
      "owners": ["design-lead", "product-designer"],
      "capabilities": { "standard": ["*"] },
      "notes": "QM disabled-by-default pattern. Pencil is the proven primary design tool; Stitch is a documented fallback with no evidence of real use. Currently disabled anyway (Layer 4 disabledMcpServers) — this makes that state explicit and intentional instead of silent. Flip enabled:true only if Adam wants the second design-gen path."
    },
    {
      "name": "miro",
      "layer": "user",
      "config_path": "~/.claude.json (user mcpServers)",
      "transport": "http",
      "enabled": false,
      "mandatory": false,
      "owners": ["ceo", "cto", "cpo", "cbo", "research-lead"],
      "capabilities": { "standard": ["*"] },
      "notes": "New grant, not a cut. Real prior use (Road-to-July7 planning board) with zero agent ever wired to it. Opt-in — flip enabled:true for a specific planning session, not always-on."
    }
  ],
  "deleted": [
    { "name": "github", "reason": "gh CLI already Bash-allow-listed and covers every demonstrated need (PR comments, checks, issues). No agent needs a second GitHub surface." },
    { "name": "ide", "reason": "Not a config-file MCP server — Claude Code's native IDE-extension bridge. Never belongs in mcpServers:; document as a contextual capability in agent body prose instead." },
    { "name": "pgvector", "reason": "Not an MCP server. It's a Postgres extension, queried through supabase's own tools (list_extensions, execute_sql)." },
    { "name": "segment-cdp", "reason": "Not an MCP server, and Segment isn't in Beamix's stack at all (wrong-stack drift, same family as the stripe-integration/clerk-auth skill findings)." },
    { "name": "framer-mcp", "reason": "Contradicts CLAUDE.md's own Architecture Split: the Framer marketing site is explicitly a separate project, out of this repo's scope. Belongs to that project's agent system, if one exists — not Beamix's." }
  ],
  "out_of_scope": [
    { "name": "runpod", "reason": "GPU cloud infra, unrelated to Beamix's Vercel/Next.js/Supabase stack. Present in ~/.claude.json only because it's global across Adam's other projects. Zero current agent references it — nothing to cut, just confirming it stays out." },
    { "name": "higgsfield", "reason": "Creative image/video generation, no product surface in this repo (marketing lives in Framer, separately). Already disabled for this project at Layer 4. Zero current agent references it." }
  ]
}
```

### Target `.mcp.json` (project root, git-tracked — the file this spec can hand you verbatim)

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=${SUPABASE_PROJECT_REF}"],
      "env": { "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}" }
    },
    "linear": {
      "type": "http",
      "url": "https://mcp.linear.app/mcp"
    },
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp",
      "headers": { "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}" }
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "env": {}
    }
  }
}
```

Moving `playwright` here (out of the two duplicated user-level spots) means every clone/worktree of this repo gets a working Playwright MCP with zero machine-specific setup — consistent with why `supabase` already lives here and nowhere else.

### Target per-agent `mcpServers:` frontmatter (26 core agents)

New shape — object form instead of bare strings, so capability tier is explicit and lint-checkable:

```yaml
mcpServers:
  - server: supabase
    capability: write
  - server: context7
    capability: standard
```

Full target table:

| Agent | Target `mcpServers` | Change from current |
|---|---|---|
| ceo | linear:write, mem0:standard, supabase:read, miro:standard(opt-in) | cut github, supabase downgraded to read, pgvector cut (folds into supabase), miro added |
| cto | linear:read, context7:standard | cut github (gh CLI), cut supabase (CTO doesn't touch DB directly — routes to database-engineer) |
| cpo | linear:read | cut github |
| cmo | linear:read, mem0:standard | cut framer-mcp (see Architecture Split contradiction above) |
| cbo | linear:read, supabase:read | unchanged in shape, now real |
| cco | *(contingent — see Open Questions)* linear:read, supabase:read, mem0:standard | unchanged in shape, contingent on org-chart resolution |
| qa-lead | linear:write, supabase:write | cut github (gh CLI); supabase added for `audit_log` writes on Codex-degradation rows |
| research-lead | linear:read, context7:standard | unchanged in shape, now real |
| design-lead | linear:read, refero:standard, pencil:standard, playwright:standard, stitch:standard(disabled) | unchanged in shape, stitch now explicitly opt-in |
| backend-engineer | supabase:write, context7:standard | cut ide (native, not a grant) |
| database-engineer | supabase:migrate | cut ide; the only agent with migrate tier |
| frontend-engineer | refero:standard | cut ide, cut framer-mcp |
| ai-engineer | context7:standard, supabase:read | cut ide; supabase:read added (RAG/pgvector schema work needs introspection) |
| data-engineer | supabase:write | cut segment-cdp |
| devops-engineer | supabase:read | cut github (gh CLI already covers Vercel/CI/Actions inspection) |
| security-engineer | supabase:read | **added** — was empty; needed for `get_advisors` (surfaces RLS/security findings directly) |
| test-engineer | playwright:standard+unsafe | cut ide; only owner of the `unsafe` (arbitrary JS exec) tier |
| code-reviewer | *(none)* | cut github (gh CLI covers PR comments) |
| researcher | context7:standard | unchanged in shape, now real |
| technical-writer | *(none)* | cut github |
| product-designer | pencil:standard, refero:standard, playwright:standard, stitch:standard(disabled) | stitch now explicitly opt-in |
| design-critic | playwright:standard, refero:standard | unchanged in shape, now real |
| design-polisher | pencil:standard, refero:standard, playwright:standard | unchanged in shape, now real |
| qa-engineer | playwright:standard | unchanged in shape, now real |
| adversary-engineer | *(none)* | cut github |
| supabase-cleaner | supabase:write | unchanged in shape, now real |

War-room layer (26 files under `.claude/agents/war-room/`): inherits the identical `MCP_MANIFEST.json` and resolver. The 7 persona files keep `mcpServers: []` (correct per template — Layer 5 personas get no tools/no MCPs). The Routine files get the same cut list applied (`github`→gone, `pgvector`/`segment-cdp`/`framer-mcp`/`ide`→gone) and the 4 `mcp__linear-server__*` files (`eod-sync.md`, `morning-digest.md`, `friday-retro.md`, `monday-standup.md`) rename their tool references to `mcp__linear__*` to match the canonical key.

### Corresponding `tools:` frontmatter change — the actual enforcement point

Every agent above must also gain the matching `mcp__<server>__<tool>` entries in its `tools:` array, generated from the manifest's capability-tier tool lists rather than hand-typed (hand-typing is exactly how the current drift happened). Example, `backend-engineer.md`:

```yaml
tools: [Read, Write, Edit, Bash, Glob, Grep, SendMessage, TaskCreate, TaskUpdate, TaskList,
        mcp__supabase__list_tables, mcp__supabase__list_extensions, mcp__supabase__list_migrations,
        mcp__supabase__get_logs, mcp__supabase__get_advisors, mcp__supabase__search_docs,
        mcp__supabase__generate_typescript_types, mcp__supabase__execute_sql, mcp__supabase__deploy_edge_function,
        mcp__context7__resolve-library-id, mcp__context7__get-library-docs]
mcpServers:
  - server: supabase
    capability: write
  - server: context7
    capability: standard
```

This is the fix for the root-cause bug: `mcpServers:` becomes a declaration that a codegen step expands into the real grant (`tools:`), instead of a field nothing reads.

---

## Changes: kept / cut / merged / added

| Server | Disposition | One-line rationale |
|---|---|---|
| supabase | **kept** | Already real, already correctly placed (project `.mcp.json`, env-var creds). Add capability tiers. |
| linear | **added (for real)** | Most-declared name in the system (9/26 agents, CEO's core loop), zero config anywhere today. Highest-value single fix. |
| context7 | **added (for real)** | Real product, low risk, 5 agents already assume it, free tier needs no secret. |
| playwright | **kept, deduped, relocated** | Currently declared twice at user-level; moves to project `.mcp.json` so every worktree gets it with no machine setup. |
| refero | **kept, secret fixed** | Real paid tool, real usage (design-lead/frontend-engineer/critic/polisher/product-designer); stop hardcoding the bearer token, use env var. |
| pencil | **kept as-is** | Real, working, inherently machine-scoped (local binary path) — stays user-level. |
| mem0 | **kept, flagged unauthenticated** | Deliberate architecture decision (DECISIONS.md), configured endpoint is correct — just never finished OAuth. Surface that state instead of pretending it works. |
| stitch | **kept, disabled by default** | QM pattern: ship it, don't turn it on. Already de-facto disabled; this makes it documented and intentional. |
| miro | **added, disabled by default** | Real prior use (planning board), zero current agent wiring — a gap in the other direction. Opt-in for CEO/leads planning sessions. |
| github | **cut** | `gh` CLI is already Bash-allow-listed and covers every demonstrated need. 8 agents declared it; zero session files show it ever resolving. |
| ide | **cut from `mcpServers:` vocabulary** | Not a config-file server — Claude Code's native IDE-extension bridge. Document in body prose, not as a grant. |
| pgvector | **cut** | Not an MCP server; folds into `supabase`'s own tool surface. |
| segment-cdp | **cut** | Not an MCP server; wrong-stack (Beamix has no Segment CDP integration anywhere). |
| framer-mcp | **cut** | Contradicts CLAUDE.md's own Architecture Split (marketing site is out of this repo's scope). |
| runpod, higgsfield | **out of scope, untouched** | Global to other projects, zero current Beamix agent references — confirmed correctly absent, not added. |

Net for the core-26 agent grant surface: **5 servers added or newly-real** (linear, context7, plus playwright/refero/mem0 going from fictional-in-practice to actually callable), **5 deleted** (github, ide, pgvector, segment-cdp, framer-mcp), **1 downgraded to opt-in** (stitch), **1 new opt-in** (miro). 13 declared names in → 9 in the manifest (supabase, linear, context7, playwright, refero, pencil, mem0, stitch, miro) + `ide` demoted to documented-native-capability + 4 deleted outright.

---

## Format & schema

**`.claude/mcp/MCP_MANIFEST.json`** — top-level object:
- `version` (int), `last_updated` (ISO date)
- `servers[]`: `{ name, layer: "project"|"user", config_path, transport: "stdio"|"http", command/args/env or url/auth, enabled (bool), mandatory (bool), owners[] (agent names), capabilities: { tierName: [toolName, ...] }, status? (e.g. "unauthenticated"), notes? }`
- `deleted[]`: `{ name, reason }` — names that must fail lint if any agent still declares them
- `out_of_scope[]`: `{ name, reason }` — names correctly absent everywhere, documented so nobody re-adds them by habit

**Agent frontmatter `mcpServers:`** — list of `{ server: <name>, capability: <tierName> }`. `capability` must be a key that exists under that server's `capabilities` object in the manifest. A server with only a `"standard"` tier still requires the field (`capability: standard`) — no bare strings, so the shape is uniform and mechanically greppable.

**`tools:`** — every `mcp__<server>__<tool>` name in the agent's `tools:` array must (a) belong to a server the agent's `mcpServers:` list declares, and (b) belong to the specific capability tier declared for that server. No agent may hold a tool from a higher tier than it declared.

---

## The mechanism that keeps this honest

Mirrors the exact pattern `schema-lint.js` already uses for `skills:` (`loadSkills()` / `Set` lookup, lines 141-150 and 212-226) — extended to a new `loadMcpManifest()`:

1. **`loadMcpManifest()`** in `schema-lint.js` reads `.claude/mcp/MCP_MANIFEST.json` into a `Map<name, serverEntry>` (parallel to `LIVE_SKILLS`).
2. **New frontmatter check, replacing the current "must be a list" no-op**: for each `{server, capability}` in `fm.mcpServers`,
   - `server` must exist in the manifest's `servers[]` (else: `frontmatter: mcp server "X" not in MCP_MANIFEST.json` — catches the next `linear`/`pgvector`-style fiction before merge).
   - if `enabled:false` on that server, the grant is a lint **warning**, not a hard fail (an agent may pre-declare a future opt-in) — but it must not appear in `tools:` while disabled.
   - `capability` must be a key of that server's `capabilities` object (else: `frontmatter: capability "X" not valid for server "Y"`).
3. **New `tools:`↔`mcpServers:` cross-check** (the fix for the root-cause bug found above): every `mcp__<server>__<tool>` entry in `tools:` must trace to a `{server, capability}` pair declared in `mcpServers:`, and `tool` must be listed under that exact capability tier in the manifest. Any `mcp__` tool name in `tools:` with no matching `mcpServers:` declaration is a hard fail (`frontmatter: tools grants mcp__X__Y but mcpServers does not declare server X`) — this is what makes the "declared but never wired into `tools:`" bug structurally impossible to reintroduce.
4. **CI wiring** (currently missing entirely): a GitHub Actions workflow runs `node .claude/hooks/schema-lint.js --json` on any PR touching `.claude/agents/**` or `.claude/mcp/MCP_MANIFEST.json` or `.mcp.json`, and blocks merge on nonzero exit. This isn't a new invention — `.mcp.json` and "agent definition" are **already** named triggers for the Irreversible QA tier in the locked 4-tier gate (`.claude/qa-tier-floor.yml` / `qa-lead-pass.yml`); this just makes the existing tier actually enforce something on this file class instead of nothing.
5. **`deleted[]` and `out_of_scope[]` enforcement**: schema-lint additionally rejects any `mcpServers:` entry whose `server` name matches a `deleted[]` entry, with the `reason` string surfaced in the failure message (`frontmatter: mcp server "github" was deleted — gh CLI covers this, see MCP_MANIFEST.json`) — so a future re-add doesn't require re-deriving the rationale from scratch.
6. **Project-layer vs user-layer split, because CI cannot see `~/.claude.json`**: schema-lint (CI, hard-blocking) can only verify the `layer: "project"` servers end-to-end, because `.mcp.json` is the only config file actually in this repo's git. For `layer: "user"` servers (pencil, refero, mem0, stitch, miro), a separate, non-blocking script — `.claude/hooks/mcp-doctor.js`, run from the existing `SessionStart` hook chain alongside `gsa-check-update.js` — diffs Adam's actual `~/.claude.json` against the manifest's expected user-level entries and prints a one-line WARN banner for drift (missing server, wrong enabled state, stale key name). This mirrors the already-decided "Cost is ADVISORY, visible in a run log, never a hard stop" precedent: user-machine state can't be hard-gated without being obnoxious, so it's surfaced, not blocked.
7. **Runtime-unavailable fallback becomes mechanical instead of prose-only** — closing the "never appeared in 142 session files" gap: a new `PostToolUse` hook, `.claude/hooks/mcp-availability-log.js`, pattern-matches any tool-call result where the tool name starts with `mcp__` and the result is an error, and appends one structured line to `.claude/memory/mcp-availability.log` (`{timestamp, agent, server, tool, error}`) — non-blocking for every server except `supabase`, where it additionally writes a stderr banner into the transcript (still advisory, not a hard stop, but now impossible to miss) matching CLAUDE.md's own documented exception ("Supabase MCP failure for DB work → flag to user before proceeding"). This is what makes "log MCP unavailable and continue" true by construction instead of true by agents remembering to type it — the exact class of rule this whole redesign disqualifies when enforcement is prose.
8. **Capability-scoped grants (Gatekeeper-lite) — the concrete answer to the Cloudflare cloudflare-os question**: adopt the *principle* (an agent's default access is nothing; every capability is explicit and scoped), reject the *infrastructure* (a standalone broker Worker with OAuth/ApprovalQueue/observer-verification, cloudflare-os's actual `write-gatekeeper` implementation) as unjustified for a pre-revenue, single-operator system. The scoping is achieved with primitives already in the stack — manifest `capabilities` tiers + the `tools:`↔`mcpServers:` cross-check above — which gets ~80% of the blast-radius reduction (no worker ever holds `apply_migration` unless it's `database-engineer`; no worker ever holds Linear `write` unless it's `ceo`/`qa-lead`) with zero new services to run or credentials to rotate. Full token-level brokering (short-lived scoped Supabase JWTs minted per task) is flagged as a stretch item, not built — see Open Questions.
9. **QM's disabled-by-default pattern**: adopted explicitly, not partially — `enabled:false` is now the manifest's own field (not an undocumented side effect of Layer 4's `disabledMcpServers`), applied to the two servers with no proven default-path usage (`stitch`, `miro`). Every other server defaults `enabled:true` because it has at least one agent with a demonstrated, concrete task that needs it today.

---

## Open questions

- **`cco.md`'s fate is not this surface's call.** CLAUDE.md states "CCO folded into CPO (premature org)" while `cco.md` still exists with live grants. This spec gives it a contingent target (`linear:read, supabase:read, mem0:standard`) but the real answer — delete the file, or keep the role — belongs to whichever surface owns the agent roster/org chart. `depends_on` that surface's outcome.
- **Exact Linear MCP endpoint** (`https://mcp.linear.app/mcp`) is documented as of this spec's writing but not independently re-verified live in this session (read-only scope, no external fetch performed) — confirm against Linear's current MCP docs at build time before wiring `.mcp.json`.
- **Should `supabase:write` (not just `:migrate`) also require a session-local proof of prior QA sign-off before `execute_sql` can run destructive statements?** This spec deliberately stops at "migrate tier is database-engineer-only" and defers the deeper "was there already a QA PASS this session" enforcement question to the QA-gate surface — a PreToolUse hook could inspect for a marker file, but designing that marker/handshake is QA-gate scope, not MCP-set scope.
- **Full credential brokering** (rotating scoped tokens instead of long-lived keys in `~/.claude.json`) was explicitly declined as unjustified infrastructure for now (see mechanism §8) — worth a revisit if/when a second human operator or a hosted (non-Adam's-laptop) agent runtime enters the picture, since the current design's security model implicitly assumes single-operator, single-machine trust.
- **`MCP_MANIFEST.json`'s own `totalSkills`-style drift risk**: this spec doesn't add a computed total field (unlike the skills manifest, which disagreed with its own array length) specifically to avoid reintroducing that failure mode — worth confirming this omission is intentional when the file is actually built, not an oversight.

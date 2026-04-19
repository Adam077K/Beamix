# Supabase MCP — activation (one-time)

The Beamix repo has a `supabase-cleaner` agent pre-wired to Supabase MCP. To let that agent actually talk to your Supabase project, you do two things, once:

## 1. Create a Supabase Personal Access Token

1. Go to https://supabase.com/dashboard/account/tokens
2. Click **Generate new token**
3. Name it `beamix-mcp-cleaner` (or similar — descriptive)
4. Scope: **full access** (required — MCP uses the management API)
5. Copy the token. You see it once.

## 2. Set two env vars in your shell profile

Open `~/.zshrc` (or `~/.bashrc`) and add:

```bash
export SUPABASE_ACCESS_TOKEN="sbp_xxxxxxxxxxxxx..."   # the PAT from step 1
export SUPABASE_PROJECT_REF="abcdefghijklmn"          # the project-ref from your Supabase dashboard URL
```

**Finding project-ref:** Look at your Supabase dashboard URL. The path segment after `/project/` is the ref. Example: `https://supabase.com/dashboard/project/abcdefghijklmn` → ref is `abcdefghijklmn`. It's also in `NEXT_PUBLIC_SUPABASE_URL` as the subdomain: `https://abcdefghijklmn.supabase.co`.

Reload the shell:

```bash
source ~/.zshrc
```

Verify:

```bash
echo $SUPABASE_PROJECT_REF && echo ${SUPABASE_ACCESS_TOKEN:0:8}...
```

(You should see your ref, and the first 8 chars of the token.)

## 3. Restart Claude Code

The MCP server starts when Claude Code launches. After setting env vars, quit and re-open Claude Code (or run `/mcp list` to see it initialize).

On next start you'll have access to `mcp__supabase__*` tools: `list_tables`, `execute_sql`, `list_migrations`, `apply_migration`, `generate_typescript_types`, etc. The config is in `.mcp.json` at the project root. It starts the server in `--read-only` mode — so the cleaner agent can never mutate by itself.

## 4. Try it out

In a Claude Code session:

> "Iris, ask the Supabase cleaner agent to audit staging and list the top 10 cleanup candidates."

The `supabase-cleaner` agent will:
- Read `.claude/memory/supabase-cleanup-plan.md` (the runbook)
- Read every `.sql` in `apps/web/supabase/migrations/`
- Run read-only queries via `mcp__supabase__*`
- Cross-reference declared vs live schema
- Ask you yes/no per candidate
- Write reviewable SQL files to `apps/web/supabase/cleanup/NNNN-slug.sql` for items you approve
- Update the runbook

## 5. What the cleaner will NOT do

The `supabase-cleaner` agent is configured with these hard rules (see `.claude/agents/supabase-cleaner.md`):

- Never executes `DROP`, `DELETE`, `TRUNCATE` directly. Writes SQL files for you to review and apply manually in the Supabase SQL Editor.
- Never touches production without a separate explicit confirmation.
- Always archives before drop: `_archive.<table>_YYYY_MM_DD` tables hold backups for 90 days.
- Every SQL file it writes has four sections: pre-flight SELECT, archive, destructive step, rollback note.

## Troubleshooting

**MCP doesn't show up in `/mcp list` after restart:**
- Verify env vars are set: `echo $SUPABASE_PROJECT_REF`
- Check Claude Code logs for the server start error
- `.mcp.json` must be at the project root (it is — at `/Users/adamks/VibeCoding/Beamix/.mcp.json`)

**Token has 401 errors:**
- Regenerate the PAT. Supabase tokens don't expire but can be revoked.

**Want write mode for applying migrations directly:**
- Edit `.mcp.json` — remove `"--read-only"` from the args. But think twice. The cleaner agent's safety model assumes read-only. If you remove that flag, keep a second safe hand on the wheel.

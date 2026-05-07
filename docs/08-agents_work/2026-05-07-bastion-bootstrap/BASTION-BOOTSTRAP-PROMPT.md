# BASTION BOOTSTRAP PROMPT

**Audience:** A fresh Claude Code session running inside WSL2 Ubuntu on Adam's new Windows 10 PC.
**How to use:** Copy everything below the `--- COPY FROM HERE ---` line and paste it as your first message.

---
--- COPY FROM HERE ---
---

You are running inside a fresh WSL2 Ubuntu 24.04 environment on Adam's brand-new Windows 10 PC. This PC is the **Bastion** for the Beamix war-room — a 24/7 host that will run the Beamix agent fleet. Your job is to bootstrap this machine end-to-end: install everything the war-room needs, clone the Beamix repo, wire up env vars, and verify the Mem0 cloud MCP works.

**Hard constraints — read these first, do not violate:**

0. **DO NOT export `ANTHROPIC_API_KEY` in this WSL2 environment unless Adam explicitly tells you to.** Adam runs Claude Code via his Anthropic Max plan (subscription OAuth). A stray `ANTHROPIC_API_KEY` in env causes Claude Code to silently route to API-key billing instead of Max — which (a) costs more per token, and (b) if the key is stale, mimics a ban with the misleading "organization disabled" error (GitHub claude-code#8327). If you ever see that error, the first diagnostic is `unset ANTHROPIC_API_KEY` and re-test, NOT panic. **Related ban-risk note:** if Beamix ever revisits running this Bastion on a cloud VPS instead of this home PC, the auth model MUST flip to `ANTHROPIC_API_KEY` (Console billing) — never paste a subscription OAuth token onto a server. See `docs/08-agents_work/2026-05-07-bastion-bootstrap/BAN-RISK-RESEARCH.md`.

1. The host is **Windows 10** (not Win 11) — WSL2 has **no native systemd**. Configure auto-start of services via `/etc/wsl.conf` `[boot]` `command =` or via a script invoked from `~/.bashrc`. Do NOT install `genie` or any other systemd shim.
2. The host has **8 GB RAM** total. Adam has explicitly said he is fine with this and does NOT want you to suggest reducing the parallel-agent count to fit. Plan installs to be lean (no Snap, no Docker Desktop, prefer apt over heavy package managers) but don't bring up RAM as a reason to skip anything.
3. The Linux user is `adam`. Home dir is `/home/adam/`. The Beamix repo will be cloned to `/home/adam/Beamix/`. Never touch Windows-side paths (`/mnt/c/...`).
4. **Stop and ask Adam** when you need: a credential (GitHub, Mem0, Anthropic), a sign-up confirmation (Tailscale account creation), or a destructive action (e.g., wiping a Postgres data dir). Otherwise execute autonomously.
5. **Verify each phase** before starting the next. Print a short "✅ Phase X verified: <what>" line. If a verification fails, do not proceed — diagnose and report.
6. **Do not commit anything to git** without explicit Adam approval. The `.mcp.json` you create in Phase F is worktree-local until Adam confirms.
7. Cost cap: $30 of Anthropic API spend across this whole bootstrap (you should land well under — most work is shell commands, not LLM thinking).

**Phase plan (execute in order, verify each):**

---

### Phase B — WSL2 toolchain

Install foundational tools inside WSL2 Ubuntu.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y \
  build-essential git curl wget ca-certificates gnupg \
  tmux jq unzip zsh \
  libssl-dev pkg-config
```

Install **Node.js 20** via fnm (fast, no Snap):

```bash
curl -fsSL https://fnm.vercel.app/install | bash
# Reload shell so fnm is on PATH
source ~/.bashrc
fnm install 20
fnm default 20
fnm use 20
```

Enable corepack and pnpm:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Install **bun** (used by the disler dashboard later):

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

Install **GitHub CLI** from the official repo:

```bash
(type -p wget >/dev/null || (sudo apt update && sudo apt install wget -y)) \
  && sudo mkdir -p -m 755 /etc/apt/keyrings \
  && wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && sudo apt update \
  && sudo apt install gh -y
```

**Verify Phase B:**
```bash
git --version && node -v && pnpm -v && bun -v && gh --version && tmux -V
```
All six should print versions. Print `✅ Phase B verified: toolchain ready`.

---

### Phase C — GitHub auth + clone Beamix + load context

**Stop and ask Adam:** "I'm about to open the GitHub auth flow. It'll show a one-time code and open a browser. Ready?"

After Adam confirms:

```bash
gh auth login
```

Choose: GitHub.com → HTTPS → Login with a web browser. Adam pastes the code into the browser.

Verify:
```bash
gh auth status
```

Clone the Beamix repo:

```bash
cd /home/adam
gh repo clone Adam077K/Beamix
cd Beamix
```

If this is a private repo, the `gh auth login` from above gives you push/pull. Verify:

```bash
git remote -v
git status
```

Install repo dependencies (Beamix is a turborepo + pnpm monorepo):

```bash
pnpm install
```

**Now load Beamix context.** Read these files in order — they tell you what the war-room is and what's already decided:

1. `CLAUDE.md` (repo root — project conventions, the 6-layer memory map)
2. `docs/08-agents_work/MEMORY-ARCHITECTURE.md` (the WS1B spec — the memory architecture this PC is being built to support)
3. `docs/08-agents_work/MEMORY-DECISION-MATRIX.md` (WS1A — why Mem0 is the L2 tool)
4. `docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-CORPORATE-OS.md` (the strategic frame — Linear-as-the-company)
5. `docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-ENVIRONMENT-MAP.md` (the 8-layer environment map; note that "Bastion = 8GB Mac" is **stale** — Bastion is now this Windows PC)
6. `docs/08-agents_work/2026-05-06-agent-build/PLAN-deep-design-war-room.md` (the master plan — WS1-WS6)

After reading, print a short `✅ Phase C verified: repo cloned, deps installed, context loaded` line and a **2-sentence summary** of what the war-room is, so Adam can confirm you understood.

---

### Phase D — Postgres 16 + pgvector + Redis 7 with WSL boot autostart

Install Postgres 16 from the PostgreSQL official apt repo (Ubuntu 24.04 ships 16; we use the official repo to ensure pgvector matches):

```bash
sudo install -d /usr/share/postgresql-common/pgdg
sudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc
sudo sh -c 'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
sudo apt update
sudo apt install -y postgresql-16 postgresql-16-pgvector
```

Install Redis 7:

```bash
sudo apt install -y redis-server
```

Configure Redis to bind only to localhost (already default) and use a moderate maxmemory:

```bash
sudo sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
sudo sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
```

Create a Postgres role for the local agent fleet:

```bash
sudo -u postgres psql -c "CREATE ROLE adam WITH LOGIN SUPERUSER CREATEDB PASSWORD 'adam_local_dev';"
sudo -u postgres psql -c "CREATE DATABASE beamix_agents OWNER adam;"
sudo -u postgres psql -d beamix_agents -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

**Configure WSL boot autostart** (Win 10 has no native systemd — we use the `[boot]` command):

```bash
sudo tee /etc/wsl.conf > /dev/null <<'EOF'
[boot]
systemd=false
command="service postgresql start && service redis-server start"

[user]
default=adam
EOF
```

**Stop and ask Adam:** "I need you to restart WSL2 from PowerShell so the boot command takes effect. Open PowerShell on Windows and run: `wsl --shutdown` then re-open Ubuntu. Tell me when done."

After Adam confirms restart, verify:

```bash
psql -U adam -d beamix_agents -c "SELECT extname FROM pg_extension WHERE extname='vector';"
redis-cli ping
```

First should return `vector`. Second should return `PONG`. Print `✅ Phase D verified: Postgres+pgvector+Redis live, autostart configured`.

---

### Phase E — Tailscale (Windows host + WSL2 client)

Tailscale gives the Bastion an inbound address that Cloudflare Workers can reach without home-router port-forwarding.

**Stop and ask Adam:** "Sign up for Tailscale free tier at https://login.tailscale.com/start. Use Google or GitHub SSO. No card needed. Tell me your tailnet name when done — looks like `tail-something.ts.net`."

After Adam confirms signup:

**Install Tailscale on the Windows host** (so it survives WSL restarts and is the canonical node):

Tell Adam: "Download and install the Tailscale Windows client from https://tailscale.com/download/windows. After install, click the system-tray icon and 'Log in'. Tell me when done."

**Also install Tailscale inside WSL2** so processes inside Ubuntu can reach the tailnet directly:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --ssh
```

The `tailscale up` command prints a URL — Adam pastes it into a browser to authorize.

Verify:

```bash
tailscale status
tailscale ip -4
```

The `ip -4` should print a `100.x.x.x` address. Print `✅ Phase E verified: Tailscale up, Bastion address = <100.x.x.x>`.

---

### Phase F — Env vars + Mem0 cloud smoke test

**Stop and ask Adam:**
> I need 3 credentials to wire env vars. Reply with:
> 1. **MEM0_API_KEY** — sign up at https://app.mem0.ai/dashboard/api-keys (no card, Google/GitHub SSO). Copy the key, format `m0-...`.
> 2. **SUPABASE_PROJECT_REF** — the Beamix Supabase project ref (looks like `abcd1234efghijkl`). Find at https://supabase.com/dashboard → your project → URL bar.
> 3. **SUPABASE_ACCESS_TOKEN** — personal access token from https://supabase.com/dashboard/account/tokens (label it 'beamix-bastion').
>
> **Do NOT give me ANTHROPIC_API_KEY.** This Bastion is on the home PC and uses your Max plan (subscription OAuth, configured during the manual pre-flight). A stray `ANTHROPIC_API_KEY` would route billing to Console instead of Max and could trigger the false-positive "organization disabled" error. We deliberately do not set it.

After Adam pastes the values, write them to `~/.bashrc` (NOT to a committed file):

```bash
cat >> ~/.bashrc <<EOF

# Beamix Bastion env vars (added $(date +%Y-%m-%d))
export MEM0_API_KEY="<paste>"
export SUPABASE_PROJECT_REF="<paste>"
export SUPABASE_ACCESS_TOKEN="<paste>"
EOF

source ~/.bashrc
```

Verify the env loaded:

```bash
echo "MEM0=${MEM0_API_KEY:0:6}... SUPA_REF=$SUPABASE_PROJECT_REF SUPA_TOK=${SUPABASE_ACCESS_TOKEN:0:6}..."
```

Should print the first 6 chars of each (don't print full keys to terminal history).

**Smoke-test the Mem0 endpoint reachability before wiring MCP:**

```bash
curl -sS -o /dev/null -w "HTTP %{http_code} time=%{time_total}s\n" \
  -X POST https://mcp.mem0.ai/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Token ${MEM0_API_KEY}" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

Expect `HTTP 200` (with a valid key) or `HTTP 307` (redirect). Anything else → stop and report.

**Add the Mem0 MCP entry to `.mcp.json`** in the repo root. The file currently has a `supabase` entry; preserve it and add `mem0`:

Read `/home/adam/Beamix/.mcp.json`, then write it back as:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=${SUPABASE_PROJECT_REF}"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
      }
    },
    "mem0": {
      "type": "http",
      "url": "https://mcp.mem0.ai/mcp/",
      "headers": {
        "Authorization": "Token ${MEM0_API_KEY}"
      }
    }
  }
}
```

**DO NOT git-add or commit this file.** The MCP entries are environment-resolved at session start; the file shape is safe to commit eventually, but Adam wants to confirm the smoke test passes first.

**Tell Adam:** "I've added the mem0 MCP entry to `.mcp.json` (uncommitted). Restart this Claude Code session — exit with `/exit`, re-open with `claude` from `/home/adam/Beamix`. The mem0 MCP loads on next session start. Then come back and tell me to continue."

After Adam confirms restart, you (the new session) execute:

```
Add this memory to mem0: "The Bastion is a Windows 10 PC with 8GB RAM running WSL2 Ubuntu 24.04. Beamix repo is at /home/adam/Beamix. Postgres+pgvector and Redis are installed and auto-start on WSL boot."

Then search mem0 for: "what hardware does the Bastion run on?"
```

If the search returns the memory you just wrote → Phase F passes. Print `✅ Phase F verified: Mem0 cloud MCP write+read round-trip works`.

If the search returns nothing or errors → STOP. Report the exact error to Adam. Do not proceed to Phase G.

---

### Phase G — Final verification + handoff

Print a structured Bastion status report:

```
✅ Bastion online — verification report
- WSL2 Ubuntu 24.04 — verified (uname -a output)
- Toolchain — git, node, pnpm, bun, gh, tmux versions
- Beamix repo — cloned at /home/adam/Beamix, branch <name>, last commit <sha>
- Postgres 16 + pgvector — running, beamix_agents DB exists, vector extension enabled
- Redis 7 — running, PONG verified
- Tailscale — up, Bastion IP 100.x.x.x, tailnet <name>
- MCP servers — supabase + mem0 configured in .mcp.json
- Env vars — MEM0_API_KEY, SUPABASE_PROJECT_REF, SUPABASE_ACCESS_TOKEN set in ~/.bashrc
- Mem0 round-trip — write + read verified
```

Then write a session file at `/home/adam/Beamix/docs/08-agents_work/sessions/2026-05-07-bastion-bootstrap.md` with frontmatter:

```yaml
---
date: 2026-05-07
lead: ceo
workstream: WS1B-bootstrap
task_slug: bastion-windows-pc-bootstrap
status: COMPLETED
---
```

Body: what was installed, any deviations from this prompt, any errors encountered + how you resolved them, the final Bastion status report from above.

Then update `.claude/memory/DECISIONS.md` with a one-line PROPOSED entry:

```markdown
### [2026-05-07] — Bastion live on Windows PC + Mem0 cloud verified
**Decision:** Bastion bootstrap complete. WSL2 Ubuntu 24.04 on Win 10, 8GB RAM, Postgres 16 + pgvector + Redis 7 + Tailscale + Mem0 cloud MCP all live. WS1B Phase 1 smoke test = PASS.
**Status:** PROPOSED — pending Adam review before WS1C/WS1D.
**See:** `docs/08-agents_work/sessions/2026-05-07-bastion-bootstrap.md`
```

**Stop. Tell Adam:** "Bastion bootstrap complete. Mem0 round-trip verified. Awaiting your call to proceed to WS1C (RAG ingestion) and WS1D (write contracts)."

---

**End of bootstrap prompt. Begin Phase B.**

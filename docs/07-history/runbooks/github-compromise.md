# Runbook — GitHub account / repo compromise

**When:** Suspected unauthorized GitHub access — leaked PAT, force-push to `main`, branch protection bypass, new GitHub App install, or repo deletion attempt.
**Severity:** **P0.** GitHub holds the source of truth for code, decisions, sessions, brain MOCs, agent .md files, and runbooks. Compromise = ability to inject malicious code into agents, exfiltrate IP, or damage the codebase irrecoverably without a local clone.
**Owner today:** Adam.
**Last reviewed:** 2026-05-08 (WS3 lock).

---

## Detection

| Signal | Where | Threshold |
|---|---|---|
| GitHub audit log shows unrecognized push | Settings → Audit log | Any |
| Force-push to `main` (always blocked by branch protection — alert if attempted) | GitHub → repo → Settings → Branches → Branch protection rules → block-force-push log | Any |
| Branch protection rule changed without Adam | Audit log | Any |
| New GitHub App installed without Adam | Audit log | Any |
| New PAT created without Adam | Audit log | Any |
| GitHub Actions workflow modified without Adam | Audit log + commit history | Any |
| `gitleaks` / `trufflehog` GitHub Action detects committed secret | CI logs | Any |
| Adam-facing email "new sign-in from device" | Adam's email | Investigate every one |
| Repo visibility changed (private→public) | Audit log | Any (this is a 1-click data-leak path) |
| QA Lead `qa-lead-pass` check disabled or modified | Audit log | Any |

---

## Immediate (first 5 minutes — race the attacker)

1. **Telegram-ping Adam P0:**
   ```
   [P0 github-compromise]
   Suspected GitHub compromise. Repos locked read-only. ACK and stand by for token rotation.
   ```
2. **Lock all repos to read-only.** GitHub → Organization Settings → Member privileges → temporarily disable repo creation + restrict pushes. For each affected repo: Settings → General → Archive (reversible).
3. **Create a minimal-scope recovery PAT BEFORE revoking others.** GitHub → Settings → Developer settings → PATs → Generate new token → name it `recovery-YYYY-MM-DD` → select `repo` scope only → generate → save to a temp location (NOT in any repo). This is the only PAT you'll have for the rest of recovery. Then: **Revoke ALL other Personal Access Tokens.** GitHub → Settings → Developer settings → PATs → revoke every token except `recovery-YYYY-MM-DD`. Note: this breaks Adam's local `git push` with old tokens; use `recovery-YYYY-MM-DD` instead.
4. **Force logout all GitHub sessions.** Settings → Sessions → Log out of all sessions.
5. **Disable all GitHub Apps** (especially `claude-code-action` if installed). Reinstall after recovery from a clean state.
6. **Disable GitHub Actions globally.** Org/repo Settings → Actions → Disable Actions. Prevents an attacker who modified workflows from triggering them.
7. **If 2FA was not enabled, enable it now.** This should already be in place; if disabled by attacker, that confirms compromise depth.

---

## Mitigation (next hour)

### Identify scope

Run audit log queries:
- All push events in the last 7 days, filter for non-Adam authors.
- All branch protection changes.
- All Actions workflow file changes.
- All secret modifications (GitHub Actions secrets, deploy keys).

### Assess damage

- **Code committed by attacker?** Check `git log` on each branch. Compare `main` SHA to Adam's last-pushed local SHA (Adam's monthly local clone is the gold copy).
- **Secrets committed?** Run `gitleaks detect --source .` on a fresh local clone. Any hits = rotate per `secret-rotation.md` emergency path.
- **CI poisoned?** Check `.github/workflows/*.yml` for unrecognized jobs that might exfiltrate secrets or run unauthorized agents.
- **Repo visibility changed?** If private→public, treat as full IP leak. Notify Adam to evaluate (may require legal/compliance steps post-MVP).

### Restore from clean state

1. **Identify the last-known-good `main` SHA.** Adam's monthly local clone OR a forked-and-known-clean repo.
2. **Force-reset `main` to the clean SHA.** This requires lifting branch protection temporarily. Use the `recovery-YYYY-MM-DD` PAT (created in Immediate step 3) to authenticate the force-push or GitHub REST API call. Document the action with a postmortem hook.
3. **Re-create branch protection rules** with `qa-lead-pass` required check restored.
4. **Re-issue new PATs** for Adam's local development machines.
5. **Re-install `claude-code-action` GitHub App** with fresh credentials.
6. **Rotate ALL GitHub Actions secrets** per `secret-rotation.md` (since attacker had read access to them).

---

## Recovery (full restore)

1. **Re-enable repos** (un-archive).
2. **Re-enable GitHub Actions** with the new secrets in place.
3. **Run the `qa-lead-pass` workflow on a test PR** to confirm it works.
4. **Replay queued Cloudflare bridge events** that may have failed during repo lock.
5. **Smoke-test:** file one Linear ticket with `agent:ceo, tier:quick` that requires a code change. Verify pipe end-to-end.
6. **Telegram-ping Adam** `[github-compromise resolved]`.

---

## Post-incident

- [ ] Postmortem REQUIRED. `docs/07-history/postmortems/YYYY-MM-DD-github-compromise.md`.
- [ ] Identify entry vector (leaked PAT? phished? compromised laptop?). 5-whys.
- [ ] If a PAT leak: scan all repos for additional leaked secrets via `gitleaks --rules-path` covering past commits.
- [ ] Add detection signals: enable GitHub Advanced Security secret scanning (free for public repos, paid for private — ~$49/active user/mo). May be worth it.
- [ ] Friday Retro tags this incident.
- [ ] Update this runbook.

---

## Decision tree

```
Suspected GitHub compromise?
├─ Lock repos read-only IMMEDIATELY
├─ Revoke all PATs
├─ Disable all GitHub Apps + Actions
├─ Telegram-ping Adam P0
│
├─ Was a PAT leaked publicly (commit, screenshot)?
│   ├─ YES → automated abuse risk. Rotate everything. Audit for any pushes during leak window.
│   └─ NO → targeted attack. Lock down Cloudflare too (`cloudflare-compromise.md` runbook fires in parallel).
│
├─ Was main force-pushed?
│   ├─ YES → restore from local clone gold copy. Force-reset main.
│   │       Audit ALL commits since last-known-good for hidden backdoors.
│   └─ NO → main intact. Focus on Actions + secrets rotation.
│
├─ Was repo visibility changed (private→public)?
│   ├─ YES → IP leak. Document leaked content. Evaluate legal/compliance (post-MVP).
│   └─ NO → continue.
│
└─ Were Actions workflows modified?
    ├─ YES → CI POISONED. Restore workflows from clean SHA. Audit all workflow runs since modification.
    └─ NO → workflow files clean.
```

---

## Related runbooks

- `secret-rotation.md` — rotate GitHub Actions secrets in emergency path
- `cloudflare-compromise.md` — frequently co-attacked
- `supabase-corruption.md` — if attacker had Supabase keys via GitHub Actions secrets

## Related signals

- GitHub audit log entries
- `gitleaks` / `trufflehog` CI hits
- "New sign-in" emails to Adam
- Force-push attempts (always blocked, but logged)

## Telemetry to verify is wired

- [ ] GitHub audit log webhooks → Cloudflare Worker → Telegram alert
- [ ] `gitleaks` runs as GitHub Action on every push (not just main)
- [ ] `qa-lead-pass` workflow has its own integrity check (signed commits OR matrix that detects modification)
- [ ] Adam keeps a monthly local clone of all repos to a non-GitHub location (external drive or alternate host)
- [ ] 2FA enforced for all org members (currently just Adam)

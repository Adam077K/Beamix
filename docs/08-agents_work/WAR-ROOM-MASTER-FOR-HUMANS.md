---
title: Beamix War Room — Plain English Version
date: 2026-05-11
audience: Future Adam (6 months from now), new contributor coming in cold
read_time: 13 minutes
source_doc: WAR-ROOM-MASTER.md
---

# Beamix War Room — Plain English Version

---

## The one-paragraph version

The war room is the autonomous backbone that runs Beamix-the-company while Adam builds Beamix-the-product. It is not a customer-facing feature. It is a pipeline: a Linear ticket (or a scheduled cron job) arrives at a Cloudflare Worker (the "bridge"), the bridge validates the request and signs a trust contract, fires that contract to an Anthropic AI agent called a "Routine," the Routine does the work, and the results land in Supabase where a private internal page (`/war-room`) shows Adam a live trace. There are 11 Routines covering tasks like daily planning, competitor monitoring, weekly retros, and emergency self-recovery. Today (2026-05-11), 1 of those 11 is live end-to-end. The other 10 get provisioned in the next workstream (WS6). The whole thing costs $105/month today and scales gracefully to $824/month at 500 paying customers, still under 0.5% of revenue.

---

## What it IS and what it ISN'T

**It IS:**
- The infrastructure Adam uses internally to run autonomous scheduled AI work
- A pipeline that makes sure every agent action is recorded, auditable, and capped on cost
- A self-healing system — if an agent gets stuck, another agent tries to unblock it automatically
- Cloud-only — nothing special runs on Adam's home machine

**It ISN'T:**
- A customer-facing product (customers never see or interact with this)
- A replacement for Adam's own Claude Code sessions — Adam still runs the CEO agent interactively for ad-hoc decisions
- A chatbot or general assistant — every Routine has a specific, narrow job
- Complete yet — 10 of 11 Routines are pending provisioning, and both the Telegram bot and the iOS voice-capture Shortcut are deferred

---

## What we built

The pipeline has four layers, top to bottom:

```
TRIGGER (Linear ticket / cron schedule)
    ↓
CLOUDFLARE BRIDGE (validates, signs, deduplicates, fires)
    ↓
ANTHROPIC ROUTINE (does the work, writes results to Linear/Telegram)
    ↓
SUPABASE AUDIT LOG (records what happened, feeds the /war-room page)
```

The bridge is the most complex piece. It is a small Cloudflare Worker (~1300 lines of TypeScript) that sits between the outside world and the AI agents. Its jobs are: verify that a request is legitimate, prevent the same ticket from triggering two simultaneous agent fires, attach a signed "trust contract" (called a spec) that tells the agent what it's allowed to do and how much it can spend, then hand off to Anthropic. The bridge never passes through raw instructions — everything is wrapped in a machine-readable signed envelope.

Anthropic Routines are standing AI agent configurations that live in Adam's claude.ai account. Think of them as scheduled workers: each one has a cron schedule or event trigger, a system prompt, a model assignment (Opus for heavy thinking, Sonnet for lighter work), and a budget. They read from Linear, Mem0 (memory), and the codebase, and write results back to Linear tickets and Telegram.

Supabase holds three tables: the detailed 90-day audit log (every agent action), a daily roll-up archive kept for one year, and a live progress table that the `/war-room` page listens to in real-time to show "is anything running right now?"

The `/war-room` page is an Adam-only Next.js page — gated to his email address — with three sections: what's running now, what ran today, and a trace view that lets him drill into any agent's full execution history.

---

## The 11 Routines in plain English

These are the 11 standing agents. Think of them as employees who show up at the same time each day without being asked.

### Window 1 — 05:30 AM (Adam wakes, reads on the commute)

| Routine | What it does | Cost/fire | Frequency |
|---|---|---|---|
| **Advisor Daily Thinking** | Reads HackerNews, AI/SEO news, Twitter, and Beamix's own memory — then writes a ~500-word brief covering "what's interesting today, what's worth questioning, one new idea, news that matters." Adam reads this on the train. | $2.00 | Daily |
| **Morning Digest** | Scans open Linear tickets and last night's EOD summary — writes a 3-5 bullet "here's what needs attention today" message to Telegram. | $0.30 | Daily |
| **Competitor Pulse** | Checks competitor pricing pages, blog posts, and AI search rankings for material changes vs. yesterday. Only sends a Telegram message if something actually changed. Silent on quiet days. | $0.40 | Daily |
| **GEO Algorithm Signal** | Deep weekly scan of AI search algorithm shifts — analyzes Beamix's own scan results across customer and competitor sites to spot what changed in how AI search engines rank content. | $1.50 | Sundays only |

### Window 2 — 10:30 AM (morning work block)

| Routine | What it does | Cost/fire | Frequency |
|---|---|---|---|
| **CTO Daily Plan** | Reviews open tickets, yesterday's progress, cost reports, and the codebase — then produces a Linear ticket breaking down today's parallelizable work across the agent fleet. "What ships today, what parallelizes, what needs Adam's judgment vs. what an agent can handle." | $1.50 | Daily |
| **Content Idea Generator** | Reads competitor content, AI search trends, and recent customer questions — proposes 3 ranked blog/social ideas with hooks. Creates Linear tickets in the Content project. | $0.50 | Daily |
| **Monday Standup** | Reads last week's EOD syncs and Friday retro, produces a week-ahead plan as a Linear ticket. | $0.50 | Mondays only |

### Window 3 — 3:30 PM (afternoon work block, mostly spare capacity)

| Routine | What it does | Cost/fire | Frequency |
|---|---|---|---|
| **Friday Retro** | Reads the week's commits, audit logs, and cost reports — writes a retro summary with what shipped, what slipped, and action items. | $0.75 | Fridays only |

Window 3 is also the reserve for ad-hoc Linear ticket fires — unexpected work, board meetings, emergencies.

### Window 4 — 8:30 PM (Adam winds down)

| Routine | What it does | Cost/fire | Frequency |
|---|---|---|---|
| **EOD Sync** | Reads today's commits, audit log, and sprint state — writes a day recap and tomorrow's priorities. Both a Linear ticket and a Telegram message. | $0.30 | Daily |

### Event-triggered (fire any time)

| Routine | What it does | Cost/fire | Notes |
|---|---|---|---|
| **Auto-Unblock** | When another Routine is stuck for more than 5 minutes with no sign of progress, Auto-Unblock fires automatically. It reads the stuck agent's spec and audit trail, tries to self-resolve, and either unblocks or escalates. After 3 failed attempts to auto-unblock the same thing, it sends a Telegram ping to Adam. | $0.50 | Triggered by Inngest watcher |
| **Synthesizer** | When Adam runs a board meeting (`@board` command), multiple AI personas each provide input. The Synthesizer reads all their outputs and produces a final set of locked decisions in a structured format. | $1.00 | Adam-invoked |

**Fire budget:** About 7.4 scheduled fires per day. The hard cap is 15 fires per rolling 24-hour window. That leaves ~7 fires of headroom for ad-hoc work.

**Why the 4 windows?** Anthropic's Max subscription gives a 5-hour rolling quota window per session. Spacing fires 5 hours apart (05:30 / 10:30 / 15:30 / 20:30) gives each cluster of Routines a fresh quota window, maximizing total AI work per day without overage billing.

---

## Adam's daily routine with the war room

You mostly don't have to do anything. Here's what fires automatically and when to expect it:

**05:30** — Three Routines fire: Advisor Brief, Morning Digest, Competitor Pulse. (GEO Signal on Sundays.) By the time Adam is on the train at 06:30, Telegram has a morning brief and an advisor note.

**08:00** — Adam opens Claude Code, runs CEO interactively for ad-hoc decisions. This is not a Routine — it's manual.

**10:30** — CTO Daily Plan + Content Idea Generator fire. Telegram gets a 3-5 bullet summary of what the agent fleet is working on today. New Linear tickets appear in the Content project.

**10:40 on Mondays** — Monday Standup fires. A week-plan appears in Linear.

**15:30 on Fridays** — Friday Retro fires. Retro summary in Linear.

**20:30** — EOD Sync fires. Telegram gets a recap of the day. Adam reads before sleep.

**Overnight (20:30 → 05:30)** — Nothing fires. The Inngest cost-watchdog and audit-log rollup jobs run silently in the background (these are not AI Routines — they're lightweight server functions that just aggregate data).

**If something gets stuck** — Auto-Unblock fires within 5 minutes. Up to 3 attempts. If all 3 fail, Telegram pings Adam.

**What you won't receive:** cost alert messages to Telegram when spending looks high. That was an explicit decision — it leads to alert fatigue. Instead, check the `/war-room` page or the daily rollup table in Supabase to see spending. The Anthropic Console has a hard billing cap as the backstop.

---

## What's protected, what's not

### What works now (deployed 2026-05-11)

The core safety layer is the bridge. Before any AI agent runs, the bridge enforces:

- **Legitimate source only.** The bridge maintains a list of allowed issuers (Adam's Linear user ID, his Telegram chat ID). Requests from unknown sources are rejected and logged.
- **No replay attacks.** Every request carries a unique ID (nonce). The bridge uses a Cloudflare KV store and a Durable Object (a strongly-consistent mini-database) to make sure the same request can't trigger two simultaneous agent fires, even if two webhooks arrive within milliseconds of each other.
- **Specs only from comments, not ticket bodies.** A trust spec (the signed instruction envelope passed to an agent) is accepted only when it comes from a specially-marked comment block in Linear, never from a ticket title or description. This prevents someone gaming the system by editing a ticket body.
- **Non-empty out-of-scope list.** Every spec must explicitly state what the agent is NOT allowed to do. Empty out-of-scope arrays are rejected. This forces whoever writes the spec to be deliberate.
- **Three-party audit trail.** The bridge writes a "fired" record before calling Anthropic. The Routine writes an "accepted" record when it starts. An Inngest function writes the final outcome (complete, over-budget, timeout, error). No single component can erase the record — you'd need to compromise all three independently.
- **Session-relative budget enforcement.** If a Routine starts spending more than 120% of its stated budget, an Inngest watcher sums the session's total cost and kills it. The Routine itself is not trusted to self-enforce — the kill comes from outside.
- **Signed request packages.** Every trust spec is signed using HMAC-SHA256 (a standard cryptographic signature scheme). The Routine validates the signature before acting. A spec that has been tampered with — even one character changed — fails validation.
- **Timestamp validation on external calls.** Requests from Telegram or the iOS Shortcut must arrive within 5 minutes of being sent. Stale requests are rejected.

### What's still a gap

**Shared CEO token (known risk, deferred to WS6).** Right now, all C-suite Routine routes share the same Anthropic bearer token (the credential that authorizes firing a Routine). If one Routine goes rogue and its token gets revoked, that would kill all C-suite Routines simultaneously, including the CEO path. The fix — giving each Routine its own unique token — is ready to implement in WS6. It's documented as a known gap, not an unknown one. In the meantime we're in build phase, not production with real customers, so an accidental fleet-kill is recoverable.

**Telegram bot incomplete.** The worker code exists, but 3 of its 4 required secrets are unset and a KV namespace placeholder is unfilled. Deferred by Adam on 2026-05-11.

**iOS Shortcut not imported.** The Shortcut JSON is structurally validated and in the repo, but it hasn't been imported to Adam's iPhone. Deferred by Adam on 2026-05-11.

---

## What it costs

### Today: $105/month

| Component | Cost |
|---|---|
| Cloudflare Workers Paid (includes Durable Objects for dedup/locking) | $5/mo |
| Mem0 Hobby (persistent AI memory across Routine sessions) | Free |
| Helicone (LLM observability, first 10K events) | Free |
| Inngest (background job runner, first 50K steps) | Free |
| Supabase (database + auth, first 500MB) | Free |
| Vercel Hobby (Next.js hosting for the product dashboard) | Free |
| Anthropic Max 5x subscription | $100/mo |
| **Total** | **$105/mo** |

The $100 Anthropic subscription covers both Adam's interactive Claude Code use AND the Routine fires. The ~$170/month of Routine token spending comes out of the Max quota — it's not separately billed unless Adam exceeds the quota ceiling.

If the Max 5x quota becomes too tight: upgrade to Max 20x ($200/mo), which also raises the fire cap from 15/day to 60/day.

### When customers arrive: scaling cliffs

These are one-time cost bumps triggered by customer count, not by calendar:

| When | What upgrades | Additional cost |
|---|---|---|
| 5 paying customers | Inngest Free → Pro | +$75/mo |
| 10 paying customers | Vercel Hobby → Pro | +$20/mo |
| 25 paying customers | Supabase Free → Pro | +$25/mo + storage |
| 50 paying customers | Mem0 Hobby → Starter | +$19/mo |
| 100 paying customers | Helicone Free → Pro | +$25/mo |
| 200 paying customers | Sentry Free → Team | +$26/mo |
| **500 paying customers** | **All tiers upgraded** | **~$824/mo total** |

At 500 customers on the $79/month Discover plan, war room costs are under 0.5% of revenue. The math works.

---

## What we still need to do

### WS6 (the immediate next workstream)

WS6 is where the war room actually comes alive. The big to-do list:

- **Write 11 Routine system prompts.** Each Routine needs a `.md` file with its cron schedule, model, budget, memory grants, and full system prompt. None of these exist yet.
- **Provision 10 Routines in the Anthropic Console.** Right now only `ceo-entry-point` is provisioned. The other 10 (Morning Digest, EOD Sync, Advisor, CTO Daily Plan, Competitor Pulse, Content Idea Generator, Monday Standup, Friday Retro, GEO Signal, Auto-Unblock, Synthesizer) need to be created in the claude.ai UI and their IDs + tokens need to be configured as bridge secrets.
- **Wire the 4-window cron schedules** for each standing Routine.
- **Write 6 worker agent `.md` files** and **4 persona `.md` files** (Visionary, Strategist, Architect, Aria — used in board meetings).
- **Split per-Routine bearer tokens.** Kill the shared-CEO-token blast radius by giving each Routine its own credential.

### Deferred (Adam decided these can wait)

- **Telegram bot** — code is done, secrets need filling. Adam's call, whenever.
- **iOS Shortcut** — JSON is validated, just needs an iPhone import. Adam's call, whenever.

### Future: Mem0 OSS migration (WS1F)

When Mem0 cloud Hobby hits its limits OR when Adam wants to stop depending on a vendor for memory, there's a plan to self-host Mem0 OSS on Cloudflare Workers or Railway for roughly $0-5/month. This is not urgent — it's documented so future Adam knows the path exists.

---

## What went well, what was hard

### What went well

**The architecture survived critique.** Four AI critics reviewed the design across WS3 and WS4, generating 112 total findings. The core approach — cloud-only, Anthropic Routines + Cloudflare + Inngest + Supabase — held up. No redesign required. The reversibility framework (Easy / Medium / Hard / Not Reversible) was called out as particularly well-structured.

**The ADA-20 verification worked.** The end-to-end test on 2026-05-11 was clean: Linear ticket with a `board-meeting` label → bridge fires → Anthropic accepts → Supabase audit row written. The Anthropic Console "Runs" page confirmed a new run. One Routine working end-to-end is worth more than 10 provisioned but untested.

**The QA gate is now structural.** The `qa-lead-pass.yml` GitHub workflow is live and enforces session file quality on every PR. No merge without a QA PASS verdict in the session file. Irreversible PRs require a `tier: full` review.

**The 4-window schedule insight was earned, not assumed.** The discovery that each Routine fire opens a fresh 5-hour Max-quota window came from actually running the system, not from speculation. The schedule was designed around this fact.

### What was hard

**13 bugs surfaced during the production deploy.** Not all of them were obvious. The ones that stung most:

- The bridge was sending the wrong request body format to Anthropic — `{spec:{...}}` instead of `{text:"..."}`. Everything looked fine in local testing because there was nothing to test against; only a live Anthropic call revealed the mismatch.
- Linear's webhook signature header is `linear-signature`. The bridge was looking for `X-Hub-Signature` (the GitHub convention). Webhooks were being received but HMAC verification was failing silently.
- The `/fire` body includes a required beta header (`anthropic-beta: experimental-cc-routine-2026-04-01`). Omitting it causes Anthropic to return 404 — easy to misread as a bad Routine ID.
- The bridge listened at `/linear` only. Linear's UI defaults to suggesting `/linear-webhook`. Linear was sending webhooks and getting 200 OK responses to a fallback handler that silently dropped them.

**The fan-in barrier was broken.** The code that detects "have all sub-tickets in a fan-out completed?" was checking the wrong column in the audit log. It was looking at dispatch-time states (`fired`, `accepted`) instead of asking Linear directly whether child tickets are still open. If left unfixed, every fan-out would have hung forever.

**The pgvector RAG pipeline had a typo that made it do nothing.** Every embedding function was reading `event.data.changed_paths` but the event was named `changed_files`. Five embed functions silently returned `{ skipped: true }` on every git push. The pgvector index would have been empty in production.

**Honest assessment:** these weren't architectural failures — they were integration mismatches between documentation and live API behavior. The critique-and-fix process (WS3, WS4) caught most of them before the first real deploy, and the deploy itself found the rest. Everything is now fixed in code.

---

## Where to look when something breaks

Here are the 5 most common failure patterns and where to start:

### 1. "A Routine fired but I can't see an audit row"

Check the bridge logs first. In Cloudflare: go to Workers & Pages → `beamix-bridge` → Logs (or run `wrangler tail` from the `infra/cloudflare-bridge/` directory). Look for:

- `webhook ignored` — the routing label (`board-meeting`, `agent:*`) wasn't found on the ticket
- `HMAC verification failed` — the Linear webhook secret in the bridge doesn't match what Linear has configured
- `issuer not in allowlist` — the Linear user ID who triggered the event isn't in the bridge's allowed list

If none of those: the bridge received the webhook, but it hit an unhandled code path. The log will say what.

### 2. "The bridge fired, Supabase has a `fired` row, but Anthropic didn't run"

Look for an `anthropic_error` row in the audit log, joined by nonce:

```sql
SELECT * FROM audit_log WHERE nonce = '<nonce from the fired row>' ORDER BY ts;
```

If you see `anthropic_error` with an `event_kind` of `anthropic_fire_401` → bad token. The Routine bearer token in wrangler secrets needs rotating.

If `anthropic_fire_404` → bad Routine ID. The `ROUTINE_<NAME>_ID` secret doesn't match what's in the Anthropic Console.

If `anthropic_fire_429` → daily cap exceeded. The bridge's `FireCountDO` should have prevented this, but check whether the cap constant was recently changed.

### 3. "A Routine is showing as `running` in /war-room but it's been 10+ minutes"

The `routine-timeout-watcher` Inngest function sleeps for the spec's `max_runtime_minutes` (usually 45). After that, it looks for an `accepted` row. If no `accepted` row exists, it fires Auto-Unblock.

If it's been longer than the Routine's budget window with no update: Auto-Unblock will fire (or already has). Check `audit_log` for rows with `status = 'over_budget'` or `status = 'timeout'` near that nonce chain.

If Auto-Unblock cascaded 3 times: a Telegram ping fired to Adam. If that didn't arrive, check whether the Telegram bot is configured (3 of 4 secrets may be unset — it was deferred).

### 4. "Daily costs look wrong"

Query the daily rollup directly:

```sql
SELECT date, agent, total_cost_usd, total_fires, failures
FROM audit_log_daily
WHERE date >= NOW() - INTERVAL '7 days'
ORDER BY date DESC, total_cost_usd DESC;
```

If a specific agent's cost is high: check whether the runaway-watcher killed any sessions for it (`status = 'over_budget'` in `audit_log`). If it isn't killing them, check whether the `spec.budget.max_cost_usd` in the spec is set too high.

The Anthropic Console hard cap is the final backstop — if that's been hit, Console will show it.

### 5. "A PR is failing the QA gate even though there's a session file"

Check the session file's frontmatter. The workflow looks for `qa_verdict: PASS` (case-insensitive, handles quoted YAML). Common causes of failure:

- The session file is in a subdirectory of `sessions/` that doesn't match the branch slug pattern
- The PR has a `risk:irreversible` label but the session file says `tier: lite` instead of `tier: full`
- The bypass mechanism (for PRs that genuinely don't need a session file) requires an Adam-authored comment containing `BYPASS REASON:` in the PR — not in the commit, in the PR comment thread

---

## One more thing worth knowing

**The reversibility picture is healthy.** Most decisions made in this workstream are easy to undo: change a cron schedule in the Anthropic Console UI, swap a model from Opus to Sonnet in a Routine config, add or remove a Routine from the roster. The things that are hard to reverse are narrow: the `row_kind` discriminator column in the audit log (schema migration on a live table is painful), and the Cloudflare Workers Paid tier (if you downgrade to free, you lose the Durable Objects that enforce deduplication and rate limiting — the whole idempotency story breaks).

The one thing that is genuinely NOT reversible: if Anthropic kills the Routines product entirely. That would require migrating the 11 Routines to Inngest cron jobs firing the Claude API directly — estimated 2 weeks of rework. That's a platform risk, not a design risk. It's documented, accepted, and roughly equivalent to the risk any product takes on any cloud platform.

---

*Source: `WAR-ROOM-MASTER.md` (WS5 synthesis lock, 2026-05-11). If this doc and the master doc conflict, the master doc wins.*

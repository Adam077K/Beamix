# Solo-Founder Remote Control Surfaces (May 2026)

> **Question:** What's the canonical remote-control surface for a solo founder running a fleet of 10–30 agents from anywhere — phone, voice, Slack, Linear, web, car, bed, meeting?
>
> **Scope:** Wave 2 of the War Room rethink. Wave 1 covered Linear/Slack/GitHub webhook *triggers*. This wave covers the *surfaces* Adam touches.
> **Date:** 2026-05-05
> **Confidence:** HIGH on the official Claude-native stack (sourced direct from code.claude.com docs). MEDIUM on third-party tooling (multiple credible sources). LOW on subjective "what indie founders prefer" — those are flagged.

---

## TL;DR — The Canonical 2026 Stack

For a solo founder running a 10–30 agent fleet in 2026, **four surfaces** cover 95% of remote-control need:

1. **Claude Code Remote Control** + **Claude mobile app** — the desk-to-couch-to-car bridge. Free with existing Pro/Max plan. (HIGH confidence)
2. **Claude Code Channels (Telegram or iMessage plugin)** — the "ping me when blocked" loop. (HIGH confidence)
3. **Claude Code Routines (Cloud) or Desktop Scheduled Tasks** — the "while I sleep" autonomy. (HIGH confidence)
4. **Linear Mobile + GitHub mobile + iOS Shortcut → Anthropic API** — the "voice in the shower" idea-capture and "approve PR in a meeting" surface. (MEDIUM-HIGH confidence)

Everything else (AgentOps, Langfuse, Pushover, Wispr Flow, Cal.ai, AgentsRoom Mobile, custom Vercel dashboards) is **optional polish**, not core.

The fleet's daemon stays on Adam's machine (or a cheap always-on VPS / Railway container running `claude remote-control`). All four surfaces are just windows into that local daemon. This is the architectural pivot Anthropic shipped between Feb–April 2026 — and it changes the answer from "build a dashboard" to "use the official ones."

---

## Surface Comparison Matrix

| Surface | Cost | Latency | Input modality | Output modality | Best use case | Confidence |
|---|---|---|---|---|---|---|
| **Claude Code Remote Control** (claude.ai/code + Claude mobile app) | Included with Pro/Max | <1s typing, ~2s push | Text, voice (iOS dictation) | Push notifications + chat thread | Steer in-progress work from anywhere | HIGH |
| **Claude Code Channels — Telegram** | Free (Telegram bot) | 1–2s | Text + voice notes | Telegram chat | Async approval / "I need a decision" / car driving | HIGH |
| **Claude Code Channels — iMessage** | Free (macOS-only host) | 1–2s | Text + voice transcription | iMessage chat | Car (CarPlay reads iMessage aloud), Apple Watch dictation | HIGH |
| **Claude Code Channels — Discord** | Free (Discord bot) | 1–2s | Text | Discord DM/channel | Multi-project routing, audit log | HIGH |
| **Claude Code on the Web** (claude.ai/code, cloud sandbox) | Pro/Max | Spawns fresh cloud container | Text from any browser | Web UI | Tasks not requiring local files; parallel runs | HIGH |
| **Claude Code Routines (Cloud)** | Pro/Max ($) | Cron, 1h min | Cron / HTTP / GitHub webhook | Run autonomously, posts via Channels/Slack | Daily standups, nightly maintenance, "while asleep" | HIGH |
| **Desktop Scheduled Tasks** (macOS/Win) | Free | Cron, 1m min | Cron | Local Claude session | Recurring local-file work; lighter than Routines | HIGH |
| **`/loop` (session-scoped)** | Free | 1m min | Cron / dynamic | In-session | Polling a deploy, babysitting a PR mid-session | HIGH |
| **Slack `@Claude` (web sandbox)** | Slack + Pro | 5–30s spawn | @mention | Slack thread | Team chat → spawned cloud session for PR/review | HIGH |
| **Linear Mobile** | Linear plan | <1s | Tap / dictate via iOS | Linear native UI | Triage issues + approve agent-drafted specs | HIGH |
| **GitHub Mobile** | Free | <1s | Tap | GitHub UI | One-tap PR approval/merge | HIGH |
| **iOS Shortcuts → Claude API** | Free + API | 2–4s | Siri voice ("Ask Claude…") | Notification or Notes | Hands-free idea capture in shower/car | MEDIUM-HIGH |
| **Wispr Flow / Superwhisper** | $8–15/mo | <500ms | Voice → text into any app | System-wide text injection | Dictating into terminal, Cursor, Linear, anything | HIGH |
| **AgentsRoom Mobile** | Free tier | Real-time stream | Read-only | Live agent terminal feed | Watching the fleet from gym/café | MEDIUM (single vendor source) |
| **Telegram-bot wrappers** (Kai, claude-code-telegram, agent-reachout) | Free OSS | 1–2s | Text + voice | Telegram | Pre-Channels-era pattern; now superseded by official Channels | MEDIUM |
| **AgentOps / Langfuse / Helicone** | Free–$50/mo | Trace lag | Read-only | Web dashboard | Post-hoc debugging of multi-agent runs, cost attribution | HIGH (mature tools, but read-only — not control surface) |
| **OpenAI Realtime API + Twilio (SIP)** | ~$0.06–0.30 / min | 250–500ms | Real phone call | Voice | "Call my agent" while driving (advanced; build cost) | HIGH (technical), LOW (proven for solo-founder pattern) |
| **ntfy.sh / Pushover / Pushcut** | Free / $5 one-time | <1s | HTTP POST | iOS/Android push | Custom alerts when official push isn't enough | HIGH |

---

## The Three Adam Tests

### Test 1 — "I'm in a car for 3 hours"

**Stack:**
- **Voice in:** iMessage dictation + CarPlay (Siri reads incoming Telegram/iMessage aloud) → Claude Code Channels (iMessage plugin)
- **Brain:** `claude remote-control --spawn worktree` running on always-on Mac mini at home (or Railway `claude-code-ssh` container)
- **Out:** Claude pushes back via iMessage; CarPlay reads it. Long results land in Linear/GitHub for review on arrival.

**Workflow recipe:**
1. Mac mini at home runs `claude remote-control` 24/7 in `--spawn worktree` mode (each task gets its own git worktree — exactly Adam's existing pattern).
2. Adam dictates via Siri/CarPlay: "Hey Claude, kick off the SEO audit on Beamix homepage and ping me with findings."
3. Message hits Claude Code via iMessage Channel plugin. Claude spawns a worktree, runs the agent fleet.
4. CarPlay reads the "started, ETA 12 min" reply.
5. Long results go to Linear ticket (via Linear MCP); Adam reviews when parked.

**Why this beats alternatives:** No dependency on Twilio/SIP setup. Uses the iMessage channel that ships with macOS — zero extra services. Voice transcription is Apple-native and free. Push/CarPlay/Watch all "just work."

**Confidence:** HIGH for the architecture (all components are documented and shipping). MEDIUM for whether the iMessage Channel handles Hebrew dictation reliably — Adam will need to test.

---

### Test 2 — "I'm asleep — agents work, ping only when blocked, digest in morning"

**Stack:**
- **Brain:** Claude Code Routines (cloud) for 100% unattended jobs + a long-running `claude remote-control` session at home for jobs needing local files
- **Trigger:** Cron schedule (nightly 02:00) + GitHub webhooks (PR opened → routine runs review)
- **"Ping when blocked" loop:** Channels permission relay — if a tool needs approval, Claude forwards the prompt to Telegram/iMessage. Adam's phone is on Do Not Disturb except for "Critical" Focus mode bypass for the bot.
- **Morning digest:** A 07:30 cron-triggered routine runs `loop.md` "summarize what every agent did, what's blocked, what's awaiting human review" → posts to Slack #morning-digest channel.

**Workflow recipe:**
1. Routine A (nightly 02:00, cloud): "Review every open PR, run tests, approve trivial ones, comment on ones needing thought."
2. Routine B (nightly 03:00, local via Desktop Scheduled Task): "Run nightly content-pipeline agent fleet, persist drafts to Linear."
3. Routine C (morning 07:30, cloud): generates morning digest → Slack DM + email.
4. Iff any agent hits a permission gate or asks for input mid-night, Channels permission relay sends a single Telegram ping. Quiet hours configured at OS level so non-critical messages batch until 07:00.

**Quiet-hours hygiene (anti-overrated patterns):**
- iOS Focus mode allow-list: only "Critical" priority bot DMs break through.
- Configure Claude `/config` "Push when Claude decides" to ON, but rely on Claude's own judgment to be parsimonious — Anthropic explicitly designs it to push only on long-task-finish or decision-needed.
- Don't add ntfy.sh/Pushover layers unless the built-in fails. They become noise generators.

**Confidence:** HIGH. All four pieces are shipping features with documented behavior.

---

### Test 3 — "I'm in a meeting, need to greenlight a PR in 10 seconds"

**Stack:**
- **Surface:** GitHub Mobile app (one-tap approve)
- **Pre-vetted by:** claude-code-action / Anthropic's official PR review action — adds an AI review comment summary to every PR, so Adam reads 3 lines and approves
- **Backup:** Claude mobile app session list → tap session → reply "approve" via voice dictation

**Workflow recipe:**
1. Worker agents auto-open PRs when a worktree task completes (existing pattern in this repo).
2. claude-code-action runs on PR-open: posts a "what changed / why / risk score" summary as a PR comment.
3. GitHub Mobile push notification fires. Adam glances, taps Approve. CI auto-merges if green.
4. If the change is risky, Adam taps the @claude-bot in the PR thread: "@claude can you double-check the migration is reversible?" — claude-code-action reruns review.

**Why this beats Telegram/Slack approve:** GitHub IS the source of truth for the merge. Approving anywhere else means an extra hop. GitHub Mobile is a 5-year-mature surface — no one builds custom approval UIs anymore.

**Confidence:** HIGH.

---

## The Voice + Idea-Capture Loop ("voice in the shower")

End-to-end recipe so Adam can dictate ANY idea ANYWHERE and have it land as a Linear ticket / agent task automatically.

```
[Adam in shower] → iPhone Voice Memo (or Apple Watch dictate)
     ↓
[Apple Shortcuts auto-trigger] runs every X minutes when new memo appears
     ↓
[Shortcut "Get Contents of URL"] POSTs audio to Anthropic Messages API
     (Claude transcribes + classifies: bug | feature | content idea | research | personal)
     ↓
[Linear API call] from same shortcut creates a ticket in the right team:
     - bug → Bugs team, P2 default
     - feature → Backlog, MVP/Post-MVP triage by Claude
     - content idea → Content team, Draft state
     - research → spawns a Claude Code Routine (HTTP trigger) to scope it
     ↓
[Notification back to phone]: "Captured as LINEAR-1234 in Backlog"
     ↓
[Next morning] Linear digest in Slack shows what was captured overnight
     ↓
[Team agents pick up Backlog tickets] via existing Linear-MCP polling
     in the dispatch loop (Wave 1 mechanism)
```

**Build cost:** ~2 hours of one Apple Shortcut + 50 lines of Anthropic API call + Linear API token. No SaaS subscription needed.

**Pre-built alternatives if Adam doesn't want to DIY:**
- **Wispr Flow** ($15/mo) — system-wide voice dictation, works inside Linear's mobile app and Claude. Less integrated but zero build.
- **Talknotes / Monologue Notes** ($10–20/mo) — voice-memo-first apps that already classify and export. Less control, more polish.

**Confidence:** MEDIUM-HIGH. The Apple Shortcut → Anthropic → Linear API chain is documented and proven; multiple solo founders use variants. Friction point is reliability of the auto-trigger from Voice Memos — Apple Shortcuts can be flaky with background triggers.

---

## What's Overrated (skip these)

1. **Custom Vercel/Next.js "agent dashboard"** — building one is fun for a weekend, then you check it once and never again. Anthropic's official Claude Code on the Web + the mobile app already give you session lists, transcripts, and status dots. **Build cost: high. Use frequency: 1–2 times/week. Skip unless you're selling the dashboard.**

2. **3D / canvas-style agent visualizations (LangGraph Studio, AutoGen Studio "graph view")** — gorgeous demos, near-zero ongoing utility. Solo founders need a chronological feed (Inbox), not a force-directed graph. *Source:* multiple developer forums note these are "demoware" — not flagged in this exact wording in any single source, so this one is **MEDIUM confidence opinion-cluster**, not fact.

3. **AgentOps + Langfuse + Helicone all three at once** — they overlap. Pick one. For solo founder: **Langfuse self-host (free)** or **Helicone proxy (free up to limit)**. Skip AgentOps unless you specifically need its session-replay UX. Three observability tools is two too many.

4. **Pushover + ntfy.sh + Pushcut alongside Claude's built-in mobile push** — redundant. Claude Code's mobile push (v2.1.110+) handles long-task-done and decision-needed notifications natively. Add ntfy.sh ONLY for non-Claude services (CI failures from a system that can't post to Slack/Telegram).

5. **Building your own Telegram bot wrapper from scratch (Kai, claude-code-telegram, agent-reachout, etc.)** — these were great Q4 2025 innovations. As of March 2026, **official Claude Code Channels** does this natively with security, allowlist, and Anthropic-maintained plugin. The OSS bots are now legacy — useful only if you need a feature Channels doesn't have yet (group chat, multi-user).

6. **Twilio + OpenAI Realtime SIP for "call my agent on the phone"** — technically beautiful, ~$0.06–0.30/min, but solves a problem CarPlay-reads-iMessage already solves for free. Build only if you need actual voice conversation latency <500ms (rare for solo founder use).

7. **Cursor mobile app** — does not exist as of May 2026. (HIGH confidence absence — not announced.) Cursor remains desktop-only; if Adam wants Cursor-on-the-go, it's `claude remote-control` to Cursor's terminal, not a native Cursor app.

---

## Adam-Specific Recommendation (Beamix Solo-Founder Reality)

Given Adam's existing setup (worktrees, 32-agent system, CEO-as-orchestrator), here's the minimal stack to add:

**Install this week (≤4 hours total):**
1. `claude --remote-control` running on a dedicated terminal session. Test from iPhone.
2. `/plugin install telegram@claude-plugins-official` + `/plugin install imessage@claude-plugins-official` — two channels, two test pairings.
3. Enable Claude mobile push via `/config` → "Push when Claude decides".
4. Set up one Routine: morning digest at 07:30 → Slack DM.
5. Configure iOS Focus mode: bot DMs from Claude can break Do Not Disturb.

**Add in Wave 3 (1–2 days):**
6. iOS Shortcut "Capture idea" — voice dictate → Anthropic API → Linear ticket.
7. claude-code-action on the Beamix repo — auto PR review comments.

**Defer or skip:**
- Custom war-room dashboard (the existing one in `war-room-dashboard/` is for live demos; for ops, the Claude mobile app + Linear suffice).
- AgentsRoom Mobile (try only if Claude mobile feels insufficient).
- Twilio voice agent (build only after MVP-1.5 if a real customer use-case demands it).

**Cost delta:** $0/mo (everything is included in existing Pro/Max + free tier services).

---

## Sources

### Official Anthropic / Claude Code documentation (HIGH confidence, May 2026)
- [Continue local sessions from any device with Remote Control — code.claude.com](https://code.claude.com/docs/en/remote-control) — official Remote Control docs (referenced in WebFetch)
- [Push events into a running session with Channels — code.claude.com](https://code.claude.com/docs/en/channels) — official Channels docs (referenced in WebFetch)
- [Run prompts on a schedule — code.claude.com](https://code.claude.com/docs/en/scheduled-tasks) — `/loop`, CronCreate, jitter rules
- [Routines — code.claude.com](https://code.claude.com/docs/en/routines) — cloud-scheduled, GitHub-webhook-triggered runs
- [Claude Code in Slack — code.claude.com](https://code.claude.com/docs/en/slack) — @Claude mention spawns web session
- [GitHub Actions — code.claude.com](https://code.claude.com/docs/en/github-actions) — claude-code-action for PR reviews
- [claude-plugins-official Telegram plugin — github.com/anthropics](https://github.com/anthropics/claude-plugins-official/blob/main/external_plugins/telegram/README.md)
- [claude-plugins-official Discord plugin — github.com/anthropics](https://github.com/anthropics/claude-plugins-official/blob/main/external_plugins/discord)
- [claude-code-action — github.com/anthropics](https://github.com/anthropics/claude-code-action)

### News coverage of Anthropic's mobile / channels rollout (HIGH confidence, dated)
- [Claude Code Remote Control: Keeps Your Agent Local and Puts it in Your Pocket — DevOps.com (Feb 2026)](https://devops.com/claude-code-remote-control-keeps-your-agent-local-and-puts-it-in-your-pocket/)
- [Anthropic just shipped an OpenClaw killer called Claude Code Channels — VentureBeat (March 20, 2026)](https://venturebeat.com/orchestration/anthropic-just-shipped-an-openclaw-killer-called-claude-code-channels)
- [First Look: Hands-On with Claude Code's New Telegram and Discord Integrations — MacStories](https://www.macstories.net/stories/first-look-hands-on-with-claude-codes-new-telegram-and-discord-integrations/)
- [Claude Code Adds Cloud Routines for Scheduled AI Tasks — winbuzzer.com (April 16, 2026)](https://winbuzzer.com/2026/04/16/anthropic-claude-code-routines-scheduled-ai-automation-xcxwbn/)
- [Claude Code routines promise mildly clever cron jobs — The Register (April 14, 2026)](https://www.theregister.com/2026/04/14/claude_code_routines/)
- [What Is Claude Code Dispatch? How to Remote Control Your AI Agent from Your Phone — MindStudio](https://www.mindstudio.ai/blog/what-is-claude-code-dispatch)

### Voice dictation tools (HIGH confidence)
- [Wispr Flow — wisprflow.ai](https://wisprflow.ai/) — $15/mo, system-wide voice → text
- [Wispr Flow vs Superwhisper comparison — getvoibe.com (2026)](https://www.getvoibe.com/resources/wispr-flow-vs-superwhisper/)
- [Voice AI Dictation for Claude Code — willowvoice.com (Jan 2026)](https://willowvoice.com/blog/voice-ai-dictation-claude-code)
- [Boris Cherny on /voice in Claude Code — threads.com](https://www.threads.com/@boris_cherny/post/DWfjweulFcH/) — official "do most of my coding by speaking"

### iOS Shortcuts + Claude API (HIGH confidence)
- [Using Claude App Intents, Shortcuts, and Widgets on iOS — support.claude.com](https://support.claude.com/en/articles/10263469-using-claude-app-intents-shortcuts-and-widgets-on-ios)
- [Claude + iPhone Shortcuts: Run Workflows From a Text Message — techtiff substack](https://techtiff.substack.com/p/claude-iphone-shortcuts-text-automation)

### Indie founder community anecdotes (MEDIUM confidence, individual data points)
- [Show HN: Kai – A Telegram bot that turns Claude Code into a personal dev asst — HN, 2026](https://news.ycombinator.com/item?id=47034875) — "starting a few sessions from my phone every morning"
- [Show HN: Agent Reachout — Telegram messages when Claude needs decisions — HN, 2025](https://news.ycombinator.com/item?id=46563672) — "agent would finish or get stuck and I wouldn't notice until much later"
- [The creator of Claude Code's Claude setup — HN](https://news.ycombinator.com/item?id=46470017) — Boris Cherny's own workflow
- [The Solo Founder AI Agent Stack That Is Replacing Entire Startup Teams in 2026 — blog.mean.ceo](https://blog.mean.ceo/the-solo-founder-ai-agent-stack-that-is-replacing-entire-startup-teams/)
- [Vibe Check: Claude Code Now Works on Mobile and the Web — every.to](https://every.to/vibe-check/vibe-check-we-spent-a-weekend-trying-to-code-from-our-phones)

### Observability platforms (HIGH confidence on tool capabilities, MEDIUM on solo-founder fit)
- [15 AI Agent Observability Tools in 2026: AgentOps & Langfuse — research.aimultiple.com](https://research.aimultiple.com/agentic-monitoring/)
- [Best AI Agent Observability Tools in 2026 — latitude.so](https://latitude.so/blog/best-ai-agent-observability-tools-2026-comparison)
- [AgentsRoom Mobile — agentsroom.dev](https://agentsroom.dev/mobile-app) — read-only third-party mobile monitor (single-vendor source, MEDIUM)

### Voice agent infrastructure (HIGH on tech, LOW on solo-founder adoption)
- [Introducing gpt-realtime and Realtime API updates — openai.com](https://openai.com/index/introducing-gpt-realtime/)
- [Realtime API guide — developers.openai.com](https://developers.openai.com/api/docs/guides/realtime)
- [Cal.ai — AI-Powered Phone Calls for Automated Scheduling — cal.com](https://cal.com/ai)

### Push / notification tools (HIGH confidence, MEDIUM on need)
- [ntfy.sh — Open source push notifications](https://ntfy.sh/)
- [ntfy GitHub — binwiederhier/ntfy](https://github.com/binwiederhier/ntfy)

### Counterpoint / overrated takes (MEDIUM confidence, opinion)
- [Claude Code is Shitty, Overhyped — Medium / Mehul Gupta](https://medium.com/data-science-in-your-pocket/claude-code-is-shitty-overhyped-0acd8c8ae88d)
- [Claude Code: Revolutionizing or Overrated? — eliza-ng.me](https://www.eliza-ng.me/post/thetwosfromthet_32/)

---

## Confidence Summary

**Overall: HIGH** for the four-surface canonical stack (Remote Control + Channels + Routines + Linear/GitHub mobile). Every piece is documented, shipping in April–May 2026, and verified against primary Anthropic sources.

**MEDIUM** confidence on the "voice-in-the-shower" Apple Shortcut → Anthropic → Linear chain — it's clearly buildable from documented APIs, but no single source describes it end-to-end exactly as described here.

**LOW** confidence on the "what's overrated" section's opinion clusters (3D dashboards, custom Vercel UIs) — these are inferred from absence of solo-founder testimonials, not from any single direct quote.

**Gap:** No source directly addresses Hebrew-language voice dictation reliability through iMessage Channel for Adam's Israeli use-case. Test before relying on it for production Hebrew workflows.


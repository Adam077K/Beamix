# Anthropic Ban Risk Research — 2025-2026

**Date:** 2026-05-07
**Why this exists:** Adam asked whether running Claude Code 24/7 on a cloud VPS for an autonomous agent fleet risks an Anthropic ban. Researcher dispatched. Findings below. Used to inform the home-PC vs cloud-VPS Bastion decision (locked: home PC).

---

## TL;DR

- **~1.45M accounts banned across Anthropic surfaces in 2025.** Appeal success rate **3.3%** (1,700 of 52,000 appeals overturned).
- **The Jan 2026 crackdown** specifically targeted subscription OAuth tokens used outside the official Claude Code CLI. Third-party harnesses (OpenCode, Roo Code, Cline, Kilo) were the primary trigger, but "subscription OAuth on a server running autonomous loops" is the broader pattern Anthropic's abuse detector is calibrated for.
- **Hetzner IPs have clean reputation** — Hetzner-specific bans aren't documented. The trigger is the OAuth-on-VPS-running-autonomous-loops pattern itself, not the datacenter IP.
- **The TOS-explicit safe path:** `ANTHROPIC_API_KEY` (Console billing) on the VPS. Subscription OAuth is licensed only for: Claude Code CLI, claude.ai, Claude Desktop, Claude Cowork.

---

## Documented ban stories (2025-2026 sample)

| Date | What they were doing | Outcome |
|------|---------------------|---------|
| Aug 2025 | Renewed Claude Code Max 5x subscription | Account disabled post-payment, no appeal response |
| Jan 27, 2026 | OpenCode + subscription OAuth | Suspended; later partially reversed for some |
| Jan 9, 2026 (enforcement date) | OpenCode/Roo/Cline/Kilo via subscription OAuth | Subscription tokens stopped working outside Claude Code CLI |
| Apr 2026 | Normal user, content classifier false positive | Suspended; classifier-based, no human review |
| Mid-2025 | 110-person agritech company on Claude Team + API | Account locked; "high volume of signals" — no specifics |
| Jul-Dec 2025 (aggregate) | All surfaces | 1.45M bans, 3.3% appeal reversal rate |
| Nov 2025 onward | Chinese IPs / Chinese VPNs | Mass bans (region policy) |
| Mar 11, 2026 | False-positive: stale `ANTHROPIC_API_KEY` env var | "Organization disabled" error mimics a ban |

## Anthropic TOS — relevant clauses (verbatim)

**Automated use:**
> "Except when you are accessing our Services via an Anthropic API Key or where we otherwise explicitly permit it, to access the Services through automated or non-human means, whether through a bot, script, or otherwise" — prohibited.

Source: https://www.anthropic.com/legal/consumer-terms (accessed 2026-05-07).
**Implication: API keys ARE permitted for automation. Consumer subscription OAuth is NOT.**

**Account/token sharing:**
> "share your Account login information, Anthropic API key, or Account credentials with anyone else."

**Third-party tool OAuth — explicitly prohibited (added 2026):**
> "Using OAuth tokens obtained through Claude Free, Pro, or Max accounts in any other product, tool, or service — including the Agent SDK — is not permitted."

Source: The Register, Feb 2026, citing Anthropic's updated legal compliance docs.

## Max 5x plan limits (2026)

- ~50–200 prompts per 5-hour rolling window (varies by model + context size)
- ~88,000 tokens per 5-hour window (rough equivalent)
- Weekly Sonnet hours: ~140–280; weekly Opus hours: ~15–35
- Concurrent sessions: not officially documented (community testing: ~3 concurrent on a 4 GB box before memory pressure)

## Abuse-detection signals (sourced)

- Third-party OAuth spoofing (PRIMARY trigger of Jan 2026 crackdown)
- Geographic/IP inconsistency (~60% of payment-triggered bans)
- High-risk IP score (datacenter IPs flagged by Scamalytics/IPQS/MaxMind class — but Hetzner-specific working setups documented)
- "High volume of signals" (Anthropic's own non-specific notice — composite score, not single trigger)
- Content classifier false positives (age-detection, etc.)
- Payment anomalies (virtual cards, prepaid, crypto-funded)
- Unsupported region (Chinese IPs since Nov 10, 2025)
- Stale `ANTHROPIC_API_KEY` env var → false-positive "organization disabled" error (GitHub claude-code#8327)

**NOT confirmed as a trigger:** Hetzner specifically, tmux session count, session duration, native Task-tool subagent fan-out within Claude Code.

## The safe pattern for cloud-VPS (if revisited later)

1. **`ANTHROPIC_API_KEY` (Console billing) on the VPS** — never paste a subscription OAuth token onto a server. This puts autonomous fleet traffic on per-token billing — the explicitly permitted automation path.
2. **Dual billing architecture:** Max subscription on the developer's local machine for interactive sessions; API key on the VPS for autonomous fleet.
3. **Official Claude Code CLI only** — no third-party harnesses (OpenCode, Roo Code, Cline, Kilo, custom Agent SDK against subscription OAuth).
4. **Stable IP geography** — register account, add card, log in always from one or two consistent IPs. No VPN-jumping.
5. **Don't set a stale `ANTHROPIC_API_KEY`** — if present, expired keys cause the false-positive "organization disabled" error.

**Working public reference:** @0xmega's Hetzner CX22 + tmux + Claude Code CLI + Tailscale setup, documented on Medium March-April 2026.

## Decision impact (locked 2026-05-07)

Bastion stays on Adam's home Windows 10 PC. Cloud VPS deferred until either:
- A documented reliability event makes the home PC untenable, OR
- Beamix shifts from "agent fleet helps Adam build" to "agent fleet serves paying customers" — at which point API-key billing is appropriate anyway.

## Sources (highest-load citations)

- [The Register — Anthropic clarifies ban on third-party tool access (Feb 2026)](https://www.theregister.com/2026/02/20/anthropic_clarifies_ban_third_party_claude_access/)
- [Paddo.dev — Anthropic's Walled Garden: The Claude Code Crackdown](https://paddo.dev/blog/anthropic-walled-garden-crackdown/)
- [Anthropic Consumer Terms](https://www.anthropic.com/legal/consumer-terms)
- [Anthropic AUP](https://www.anthropic.com/legal/aup)
- [GitHub Issue #5088 — Account Disabled After Payment](https://github.com/anthropics/claude-code/issues/5088)
- [Portkey.ai — Claude Code Limits](https://portkey.ai/blog/claude-code-limits/)
- [aifreeapi.com — Ban + refund analysis](https://www.aifreeapi.com/en/posts/claude-code-ban-refund)
- [Medium @0xmega — Hetzner Claude Code 24/7 setup guide](https://medium.com/@0xmega/how-to-run-claude-code-24-7-for-under-10-month-vps-setup-guide-6d8c8fd7f09e)
- [shareuhack.com — OpenClaw OAuth cost analysis](https://www.shareuhack.com/en/posts/openclaw-claude-code-oauth-cost)
- [VentureBeat — Anthropic cracks down on unauthorized Claude usage](https://venturebeat.com/technology/anthropic-cracks-down-on-unauthorized-claude-usage-by-third-party-harnesses)

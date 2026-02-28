# GSA Startup Kit — Green Startup Academy

קיט לבניית סטארטאפים עם AI Agents. מתאים ל-Claude Code, Cursor, Antigravity.

A production-ready AI agent kit for building startups. Built for [Green Startup Academy](https://www.kfar-hayarok.org.il/) (כפר הירוק) — Israel's youth startup school.

## Quick Start (5 minutes)

1. **Clone**
   ```bash
   git clone https://github.com/Adam077K/GSA-Vibe-Startup-Kit.git
   cd GSA-Vibe-Startup-Kit
   ```

2. **Optional:** Run `./scripts/setup.sh` to verify structure and create memory files

3. **Open** in Claude Code, Cursor, or Antigravity

4. **Start** with: "Iris, אני רוצה לבנות [X]" or "Iris, I want to build [X]"

## For Green Startup Academy (כפר הירוק)

- [Getting Started](docs/GETTING_STARTED.md) — Full onboarding
- [Quick Reference](docs/QUICK_REFERENCE.md) — One-pager cheat sheet
- [Slash commands](/daily, /plan, /ship)
- [Agent team](AGENTS.md)

## Tool Support

| Tool | Setup |
|------|-------|
| **Claude Code** | Auto-loads CLAUDE.md, agents, and hooks |
| **Cursor** | Rules in `.cursor/rules/`; skills at `.agent/skills/` |
| **Antigravity** | Open folder; skills load from `.agent/skills/` |

**Cursor users:** Ensure your skills path includes `.agent/skills` or add it in Cursor settings.

## What's Inside

- **12 startup agents** — Iris (orchestrator), Morgan, Atlas, Sage, Nova, Axiom, Rex, Lyra, Scout, Guardian, Nexus, Spark
- **938+ skills** — Expert knowledge for planning, coding, security, SEO, and more
- **Get-Shit-Done** workflows — Phase planning, execution, verification

## Skills (938+)

- Browse: [.agent/skills/README.md](.agent/skills/README.md)
- Bundles: [.agent/skills/docs/BUNDLES.md](.agent/skills/docs/BUNDLES.md)
- Workflows: [docs/workflow-bundles.md](docs/workflow-bundles.md)

## Requirements

- **Node.js 18+** (for Get-Shit-Done hooks)

## License & Contributing

- [LICENSE](LICENSE) — MIT
- [CONTRIBUTING.md](CONTRIBUTING.md) — How to contribute

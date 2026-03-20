# Roadmap

> **Redirected** — The prioritized roadmap lives in [docs/BACKLOG.md](../BACKLOG.md).
>
> That file contains: Launch Critical items (18), Growth Phase items (15), Moat Builders (20), Intentionally Skipped items, and 7 unresolved founder decisions (D1-D7).

See: [`docs/BACKLOG.md`](../BACKLOG.md)

---

## Automated Scheduled Scanning (Planned — not yet built)

Paid users get recurring automated scans according to plan tier. Scans run without user action to keep data fresh.

- **Status:** Planned — not yet implemented
- **Plan:** Create `src/inngest/functions/scan-scheduled.ts` with Inngest cron trigger
- **Scan frequency by plan:**
  - Starter: Weekly automated scan
  - Pro: Daily automated scan
  - Business: On-demand + daily automated
- **Current state:** Only event-based scans exist (`scan-free`, `scan-manual`)
- **Blocker:** Requires scan engine to be stable in production first

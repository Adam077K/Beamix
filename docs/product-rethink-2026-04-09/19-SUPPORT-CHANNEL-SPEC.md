# Support Channel Spec — Inbound Triage

**Status:** Authoritative. Pre-launch blocker.
**Owner:** Wave 2 Worker 5 (or Worker 4 stretch — Adam decides during Wave 2 spawn).
**Resolves:** Missing-perspectives audit C3 + Adam-checklist amendment.
**Date:** 2026-05-13.

Refund disputes + Hebrew bug reports + payment failures need a channel on Day 1. Without one, refunds escalate to chargebacks — and chargebacks kill Paddle merchant standing. This spec routes every error CTA, every failure card, every onboarding-stuck state to a single inbound path.

---

## Tool decision — Plain (recommended) or Crisp

| Tool | Strengths | Weaknesses | Pricing |
|------|-----------|------------|---------|
| **Plain (recommended)** | Linear-grade UX, native Slack threading per ticket, clean API, great for one-person team, customer-tier metadata first-class | No native widget — uses email + an embedded JS snippet for chat-like in-app, slightly less polished than Crisp for first-impression chat | Free for <50 contacts then $39/mo per seat |
| **Crisp** | Polished in-app widget, multi-language Hebrew/English out of the box, mobile apps, free tier sufficient for MVP | Slightly noisier UI, more marketing-leaning, less engineering-team-feel | Free tier ample for MVP |

**Default recommendation: Plain.** Reasoning: Adam runs one-person ops with an agent army; Linear-style threading + clean API + tight Slack integration matches the workflow. Crisp is a worthwhile fallback if Adam wants the polished in-app widget chat experience over email-first.

Adam can override during Wave 2 spawn. The implementation differs but the surfaces below stay identical.

---

## Channels

### Primary: `support@beamixai.com`
- Email alias managed in Adam's domain registrar (forwarding to Plain's inbound address OR Adam's Gmail with auto-forward to Plain).
- Listed publicly in: T&Cs, Privacy Policy, Cookie Policy, Settings → Help, every error boundary, every Inbox failure card.
- Auto-acknowledge within 30 seconds on receipt (Plain template — "We got your message. Adam typically responds within {{tier SLA}}.")

### Secondary: in-app widget on every error boundary
- Floating "Contact support" CTA at the bottom-right of every error-state UI:
  - `<ErrorBoundary>` global fallback
  - Inbox failure card retry-exhausted state
  - Onboarding-stuck state (Day-1 chain exceeded 180s escape hatch)
  - Settings → Help section (always visible)
- Click → opens Plain widget OR mailto:`support@beamixai.com?subject=Support%20request` (graceful fallback if widget fails to load).
- Pre-fills the message with: `user_id`, `tier`, current page URL, sentry trace ID if available.

### Tertiary: in-app feedback widget (lower-priority bug reports)
- Settings → Help → "Send feedback" — same Plain widget but tagged `feedback` not `support`.

---

## Triage SLA per tier

Mirror `06-PRICING-V2.md` line 34:

| Tier | First response SLA | Notes |
|------|--------------------|-------|
| Discover ($79/mo) | 48 hours (business hours, Israel) | Email-only |
| Build ($189/mo) | 24 hours (business hours, Israel) | Email + in-app widget priority queue |
| Scale ($499/mo) | 4 hours (business hours, Israel) | Email + in-app widget priority queue + onboarding call invitation in welcome email |

**Refund disputes:** dedicated category in Plain, escalates to Adam personally within 2 hours regardless of tier. Refund disputes lost to chargebacks = Paddle merchant standing risk.

---

## Hebrew triage

- Israeli SMBs are the primary market. Hebrew inbound is plausibly 30–50% of volume.
- For the first 90 days, **Adam personally handles every Hebrew ticket.** Volume permits.
- Plain widget UI: ships English first; Hebrew RTL widget UI is Wave 2 Worker 1's localization scope (or deferred if Wave 2 ships English-only).
- Auto-acknowledge template: bilingual EN + HE (Plain supports multiple templates routed by detected language).
- Post-90-days: review volume. If Hebrew >30% of tickets, hire Hebrew-fluent VA OR add a Hebrew-fluent agent in the team roster.

### Hebrew support SLA (P0-E, 2026-05-16)

**Hebrew support SLA:** Israeli customers (detected by `business.locale = 'he'` or IL phone country code) get Hebrew-fluent support replies within tier SLA (Discover 48h, Build 24h, Scale 12h). Initial implementation: Adam fluent. Scale-up plan: Hebrew-fluent contractor at 10+ IL paid customers.

Note: the Scale-tier Hebrew SLA above (12h) is tightened from the 4h table value specifically for Hebrew Scale-tier tickets, reflecting the constraint that Adam personally handles HE volume for the first 90 days. Once a Hebrew-fluent contractor is onboarded, Scale Hebrew SLA returns to 4h to match the standard table.

---

## Routing categories

Plain categories (or Crisp tags) — Adam configures during Wave 2:

| Category | Trigger | SLA override |
|----------|---------|--------------|
| `refund_dispute` | Subject contains "refund", "chargeback", "money back" OR sent within 14d of last `checkout_completed` | 2h escalate to Adam |
| `payment_failed` | Sent within 7d of Paddle `transaction_payment_failed` webhook | 4h |
| `agent_failure` | Subject contains "agent", "draft", "didn't work" OR includes a sentry trace ID | tier SLA |
| `onboarding_stuck` | Sent within 24h of `signup_completed` AND no `agent_run_started` event | tier SLA + priority queue |
| `bug_report` | All other in-app widget submissions | tier SLA |
| `feature_request` | Tagged `feedback` by sender | best-effort |
| `hebrew` | Detected RTL characters in body | Adam-only handler |

---

## Error-state CTA wiring

Every error state in `04-EMPTY-STATES.md` gets a "Contact support" CTA wired into Plain.

| Surface | CTA copy | Plain category |
|---------|----------|----------------|
| `<ErrorBoundary>` fallback | "Something's broken on our end. Contact support →" | `bug_report` |
| Inbox failure card (after retry exhausted) | "Still not working? Contact support →" | `agent_failure` |
| Day-1 escape hatch (180s timeout) | "Setup taking longer than expected? Let us know →" | `onboarding_stuck` |
| Settings → Billing → invoice issue | "Need help with billing? Contact support →" | `payment_failed` |
| Paywall modal foot | "Questions about pricing? `support@beamixai.com`" | best-effort |

All "Contact support" CTAs use a shared component: `<SupportLink category="..."/>` from `apps/web/src/components/support-link.tsx`. Renders either the Plain widget trigger OR a styled mailto fallback if the widget hasn't loaded yet.

---

## Implementation owner — Wave 2

**Brief (paste-ready):**

> Read `19-SUPPORT-CHANNEL-SPEC.md`. Deliverables:
> 1. Choose Plain or Crisp per Adam's decision. Install SDK + env var setup.
> 2. `apps/web/src/lib/support/client.ts` — initialize the chosen widget with user metadata (user_id, tier, current URL) on load.
> 3. `apps/web/src/components/support-link.tsx` — shared CTA component with `category` prop.
> 4. Wire `<SupportLink>` into: `<ErrorBoundary>` fallback (already exists from Wave 0 Worker 3), Inbox failure card, Day-1 escape hatch, Settings → Help section, paywall modal foot.
> 5. Configure Plain (or Crisp) routing rules per the table above. Adam reviews + ratifies.
> 6. Add a `/help` route at `apps/web/src/app/(public)/help/page.tsx` — basic FAQ + support CTA.
>
> Return JSON: branch, worktree, files_created, support_tool_chosen.

---

## Adam manual checklist

- [ ] **Create `support@beamixai.com` email alias** in domain registrar → forward to Plain inbound (or Crisp / Adam's Gmail with auto-forward to Plain). See `06-ADAM-CHECKLIST.md`.
- [ ] Sign up for Plain (free tier OK for MVP) OR Crisp (free tier OK).
- [ ] Configure auto-acknowledge template — bilingual EN + HE.
- [ ] Configure routing categories per the table above.
- [ ] Capture API keys → env vars (Wave 2 worker uses them).
- [ ] Decide whether to handle Hebrew personally for first 90 days (default: yes).

---

## Out of scope (P2)

- Phone support (Build/Scale onboarding calls are scheduled async via Calendly, not phone hotline).
- Knowledge base / help center articles — defer to month 2 post-launch unless ticket volume signals.
- WhatsApp / Israeli rail support — defer until Hebrew payment rail (ADQ-4) is decided.
- 24/7 support — not feasible for one-person ops; SLAs are business-hours Israel.

---

## Status

- [x] Tool choice locked (Plain default; Crisp fallback)
- [x] Support email channel specced
- [x] Tier SLAs specced
- [x] Hebrew triage policy locked (Adam personal for 90 days)
- [x] Routing categories defined
- [x] Error-state CTA wiring specced
- [x] Wave 2 worker brief ready
- [ ] Adam: create support@beamixai.com alias
- [ ] Adam: choose Plain vs Crisp; sign up

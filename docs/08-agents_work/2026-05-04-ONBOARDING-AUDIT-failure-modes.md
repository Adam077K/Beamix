# Onboarding Failure-Mode Audit
**Date:** 2026-05-04
**Scope:** `/onboarding/[1..4]` + post-activation `/home` first visit
**Source docs:** ONBOARDING-design-v1, DESIGN-onboarding-vertical-aware-v1.1, PRD-wedge-launch-v4, LEAD-ATTRIBUTION-tech-spec-v1, DESIGN-BOARD-ROUND2-3-SYNTHESIS
**Method:** Happy-path spine read → systematic failure-surface enumeration → recovery design per mode → recommendations matrix

---

## §1 — The Onboarding Spine and Failure Surfaces

The onboarding flow is a 4-step, post-Paddle, one-time ceremony: Step 1 (business profile confirm) → Step 2 (lead attribution setup, vertical-aware) → Step 3 (Brief co-authoring + Seal signing) → Step 4 (Truth File) → /home magic moment. The flow is gated: authenticated only, no re-entry after completion, no top-level skip. Autosave on every field. Background scan deepens during Steps 1–2.

### Step 0 — Free scan (pre-onboarding, acquisition surface)

The public scan at `/scan` is the product demo and the primary inbound channel. Failure surfaces here bleed into onboarding because the `?scan_id=` param is how pre-fill works.

| # | Failure surface |
|---|---|
| 0-A | Scan times out — customer gets no result, no CTA to sign up |
| 0-B | Domain entered doesn't resolve — scan engine has nothing to work with |
| 0-C | Domain resolves but returns no usable signal (no schema, no FAQ, no mentions) |
| 0-D | Vertical classifier assigns wrong industry with high confidence — wrong Brief, wrong Step 1 pre-fill |
| 0-E | Customer converts (clicks "Fix this") but `scan_id` is expired or revoked — onboarding gets no pre-fill |

### Step 1 — Vertical selection (vertical-aware, ≤30s)

| # | Failure surface |
|---|---|
| 1-A | Domain entered here differs from domain in `scan_id` — mismatch between scan context and onboarding context |
| 1-B | Customer's domain has changed since the scan (redirect, rebrand) — pre-fill is stale |
| 1-C | Vertical classifier returns `<0.65` confidence — UI shows hollow ring, customer unsure what to pick |
| 1-D | Customer selects "Coming soon" vertical — falls through to "Other" with minimal downstream support |
| 1-E | Customer changes domain in Step 1 — should re-trigger scan, but does it? Backend unclear |

### Step 2 — Brief co-authoring (attribution setup, ≤30s)

| # | Failure surface |
|---|---|
| 2-A | Twilio provisioning fails (regional shortage, account issue) — customer on e-commerce path gets no numbers |
| 2-B | SaaS customer's domain firewall blocks UTM verification ping — verification stays ⌛ indefinitely |
| 2-C | Customer closes tab mid-step — attribution_status row is ambiguous (neither skipped nor complete) |
| 2-D | Customer opens two tabs — parallel autosave POSTs race on the same draft row |
| 2-E | Customer on Discover tier expects Twilio numbers — they're not provisioned at this tier |
| 2-F | "Send to your developer" email fails to deliver (bounce, spam folder) |

### Step 3 — Seal signing + activation (≤90s)

| # | Failure surface |
|---|---|
| 3-A | Brief commit POST fails mid-ceremony — Seal draws, customer approves, DB write fails silently |
| 3-B | Customer edits Brief to contradictory or nonsensical text — Beamix signs it anyway |
| 3-C | Customer hits "↻ This doesn't describe my business" after 2+ re-routes — experience degrades |
| 3-D | Customer is idle 30+ min during chip editing — session expires mid-ceremony |
| 3-E | Background deep scan hasn't completed — Brief is authored from partial data |
| 3-F | PDF generation for "Print this Brief →" fails or is slow — one-time offer window expires |

### Step 4 — Truth File (≤60s)

| # | Failure surface |
|---|---|
| 4-A | Customer submits Truth File with `prohibited_claims` that contradict future agent output — agents silently blocked with no explanation |
| 4-B | Customer enters Hebrew text in English-expected fields (voice words, claims) — downstream agent prompts break |
| 4-C | Required vertical fields fail validation — customer can't advance without understanding why |
| 4-D | Autosave fails silently — customer thinks they've filed but DB row is empty |
| 4-E | Customer navigates Back from Step 4 to re-edit Brief — can they? Is Brief now re-opened? |

### Post-activation — First /home visit

| # | Failure surface |
|---|---|
| P-A | First scan hasn't completed — /home lands with no score, no Evidence Card, no Fraunces line |
| P-B | First scan completed but all agents are blocked (insufficient signal, all preconditions fail) |
| P-C | Trial clock semantics ambiguous — did it start at Paddle checkout? Onboarding completion? /home visit? |
| P-D | Resend Day 0 T+10min welcome email fails — customer has no confirmation the product is working |

---

## §2 — Failure-Mode Catalog

### FM-01: Customer's internet drops mid-Brief (mid-typing in clause 2)

**Trigger:** Customer is editing a chip or free-typing a sentence in Step 3 when their network drops.

**What the user sees (current — undefined):** Browser shows a generic network error on the next autosave attempt. The 13px "Couldn't save — we'll keep trying" autosave indicator fires if the connection drop is detected before tab close. If the tab is already disconnected, nothing fires.

**Recommended UX:** The autosave indicator already handles intermittent drops per v1 spec ("Couldn't save — we'll keep trying"). On reconnect, the pending mutation should replay automatically. Brief draft state is server-side (keyed by user_id), so a reconnect + page reload restores the last successful save. Add a visible "You're offline" banner (13px, needs-you color) after 3 failed autosave retries, with copy: "Your edits are safe in this tab — we'll sync when you're back online." This prevents the customer from closing the tab thinking their work is gone.

**Backend behavior:** Draft row in `briefs` table remains at last successful commit. No orphan rows are created. On reconnect, the client re-POSTs the pending diff; server applies idempotently. The draft version counter increments only on successful DB write — not on client-side state.

**Inngest job impact:** No Inngest jobs are active during Brief co-authoring (the brief-draft write is synchronous via server action). No retries needed. The deep-scan Inngest job (running in background during Steps 1–2) is unaffected by client connectivity.

---

### FM-02: Customer's tab refreshes accidentally during Step 2

**Trigger:** Customer hits F5, or browser auto-refreshes (some enterprise proxies force this). They were mid-Brief progress.

**Recommended UX:** Step 3 draft state is server-side, so a refresh restores the Brief to its last autosaved state. The page re-renders with the last saved Brief draft, chips in their saved state. A single-line re-entry banner at the top of the content well: "Welcome back — your Brief draft is right where you left it." (13px Inter, ink-3, fades after 4s). Step 2 attribution status is also server-persisted, so the Step 2 dot reflects the correct state (completed/skipped).

**Backend behavior:** Draft row is untouched. `attribution_status` column preserves whatever value it had before the refresh. No data loss.

**Inngest job impact:** If customer refreshes during the 30s Twilio provisioning window, the Inngest job continues in the background. The UI re-polls `twilio_numbers.status` on Step 2 re-render and shows the current provisioning state.

---

### FM-03: Session token expires (idle 30+ min) — Brief progress preserved?

**Trigger:** Customer starts Brief editing, leaves for lunch, returns to find Supabase Auth session expired (default JWT expiry: 1 hour, but idle clients may lose the refresh token window on certain network configurations).

**What the user sees (current — undefined):** Next autosave POST returns 401. The customer gets a generic error or a silent failure. In the worst case, they click "Approve and start" and get redirected to `/login` with no explanation, losing the Brief context.

**Recommended UX:** On 401 from any onboarding API call, show a centered modal (not a redirect): "Your session timed out — sign in again to pick up where you left off." Ghost button: "Re-authenticate". On re-auth success, the page restores the last server-saved Brief draft without a full reload (SPA navigation back to Step 3, draft re-fetched). Session expiry during the signing ceremony itself (the 2.5s window) is vanishingly unlikely, but if the Seal-commit POST returns 401, the ceremony should revert (Seal does not draw, button restores to "Approve and start"), and the timeout modal fires.

**Backend behavior:** Brief draft row survives session expiry — it's keyed by `user_id`, not session. Re-authentication restores the same user context. No data loss.

**Inngest job impact:** Deep-scan and Twilio provisioning jobs are keyed by `customer_id` — they continue regardless of session state.

---

### FM-04: Customer opens onboarding in 2 tabs simultaneously

**Trigger:** Customer inadvertently duplicates the tab, or opens the email link while already in onboarding.

**What the user sees (current — undefined):** Two tabs both autosave to the same `briefs` draft row. The last-write-wins at the DB level. Chips edited in Tab A may be silently overwritten by Tab B's next autosave. The customer sees inconsistent state if they switch between tabs.

**Recommended UX:** On page load, write a `onboarding_lock` field to the session or a Redis key with a 60s TTL and a tab-unique token. On the second tab load, detect the active lock and show: "Beamix is open in another tab. Close this one to avoid conflicts." Block autosave from the second tab until the first tab's lock is released (tab close or explicit dismiss). This is a lightweight optimistic lock — no hard block, just a warning that prevents silent data corruption.

**Backend behavior:** Without the lock, last-write-wins on the `briefs` draft row. With it, the second tab's writes are suppressed. Migration: add `draft_lock_token` and `draft_locked_at` columns to `briefs`; lock expires after 90s of no autosave activity.

**Inngest job impact:** None — no jobs run during Brief authoring.

---

### FM-05: Customer's network is so slow the free scan times out

**Trigger:** Customer on a slow mobile connection or behind a corporate firewall hits `/scan`. The scan engine calls to 11 AI engines have a per-engine timeout budget. If the customer's connection is slow enough that the SSE stream drops, they may see a stuck spinner.

**Recommended UX:** The scan should have a client-side 25s timeout with a graceful degradation: "We scanned 7 of 11 engines — here's what we found so far." Show partial results rather than nothing. CTA still fires. If the customer converts with a partial `scan_id`, onboarding pre-fills from the partial data and the deep-scan completes in the background during Steps 1–2.

**Backend behavior:** `free_scans` row stores partial JSONB results as they arrive. `scan_status = 'partial'` flag. Onboarding imports whatever is in the JSONB at the time of claim. The background deep-scan fills the gaps before Step 3 needs the Brief data.

**Inngest job impact:** If the free scan was triggered via Inngest, partial completion is already handled via step-level retries. The scan result is written to `free_scans` at each step — no all-or-nothing commit.

---

### FM-06: Customer enters invalid email at signup

**Trigger:** Typo in email (gmail.cmo), fake domain (test@thisdomaindoesnotexist.xyz), or disposable email (guerrillamail, mailinator).

**Recommended UX:** Zod validation on the client catches syntactic errors immediately. For domain validation (is the MX record real?), run an async check on blur — DNS MX lookup via a backend route. If MX lookup fails, show: "We can't reach that email address — Beamix will send your weekly digest and first-win alerts there. Double-check it?" This is a warning, not a hard block. The customer can proceed; they'll just miss the onboarding email sequence.

For disposable emails: block at submission with a clear explanation. "This email address won't receive Beamix digests reliably. Use your real work email." Block is hard here because the Day 14 evangelism trigger (the renewal moment) depends on email delivery.

**Backend behavior:** Log the MX check result on the `customers` row as `email_mx_valid: boolean`. Email infrastructure (Resend) will bounce-classify the first send and set `email_bounced: true`. Run a nightly job that flags accounts with no email opens in 7 days + bounced flag for manual review.

**Inngest job impact:** If welcome email bounces hard, Inngest's Day 2–6 cadence should check `email_bounced` before sending subsequent emails. Dead-letter the sequence, not just the individual email.

---

### FM-07: Customer enters a domain they don't own (e.g., apple.com to test)

**Trigger:** Customer types a famous domain to test the scan, signs up with their own email, and completes onboarding referencing someone else's domain.

**Recommended UX:** Domain ownership verification is deferred post-onboarding to the 72h verification check (F12). During onboarding, we don't block on ownership proof — the Brief is about *their* business, not ownership of the domain. However, if the domain entered in Step 1 doesn't match the email domain and isn't in a known SMB size range (i.e., it's apple.com or google.com), surface a gentle advisory: "This looks like a well-known domain — are you sure this is your business?" Ghost dismiss. No hard block.

**Backend behavior:** The `businesses.domain` field stores whatever they entered. The 72h verification check (whether Beamix's UTM tags or Twilio numbers appear on the domain) will fail for a domain they don't own. Inngest fires the "attribution not detected" reminder. At 30 days, if no verification has passed, flag the account for human review.

**Inngest job impact:** `attribution.verify-setup` job fires at 72h. If customer doesn't own the domain, this job always fails. After 3 failures, emit a `DOMAIN_UNVERIFIABLE` event and suppress further re-checks. Add to an internal review queue — not an automated customer-facing alert.

---

### FM-08: Customer enters a domain that's offline / DNS-unresolvable / 5xx

**Trigger:** Customer's domain is temporarily down during the scan or Step 1.

**Recommended UX:** The public scan already handles this — it should return a partial result with a clear error: "We couldn't reach your site right now, but we scanned what AI engines have already indexed about you." In Step 1, if the customer manually edits the domain to a new value that returns a 5xx, show an inline warning: "We're having trouble reaching this domain — Beamix will retry when it's back up." Never block continuation on a 5xx domain.

**Backend behavior:** The deep-scan Inngest job records `scan_status = 'unreachable'` and schedules a retry at +2h and +24h. The Brief in Step 3 is generated from cached AI engine data (what engines already know about the domain) rather than a fresh crawl. This is less precise but ensures onboarding can complete.

**Inngest job impact:** The `scan.deep` Inngest function uses exponential backoff (2h, 24h, 72h). After 3 failures, it marks the scan as `stale` and sends an internal alert. The customer's Brief is generated from available cached signal; agents will be gated on the precondition "domain reachable" before publishing.

---

### FM-09: Customer's domain has no schema, no JSON-LD, no FAQ — minimal signal

**Trigger:** A new business with a basic Squarespace or Wix site. No structured data. No AI engine citations. The IKG Curator returns a vertical match but with minimal evidence.

**Recommended UX:** This is Schema Doctor's core use case — the more broken the domain, the more leverage Beamix has. The Brief in Step 3 should be honest: "Your site has no FAQ schema yet — that's where we'll start. Schema Doctor will add it within 24 hours of your approval." The Evidence Card #1 on /home should show: "Schema Doctor found 7 schema gaps on /home — fixing now." This is a positive framing of a negative signal.

**Backend behavior:** The Brief template for low-signal domains uses a "blank slate" variant with more agent-work-forward language. The `briefs.confidence_signal` field records `low` — downstream, the Trust File Auditor uses this flag to run more conservative first-run checks.

**Inngest job impact:** The Schema Doctor agent is pre-queued after onboarding completes, regardless of signal level. On low-signal domains it runs first (per vertical-by-default agent priority). No additional failure handling needed.

---

### FM-10: Customer's vertical doesn't fit the 2 MVP verticals

**Trigger:** A restaurant, an architect, a law firm signs up. The vertical classifier assigns one of the 12 KGs — but only SaaS and e-commerce are active. Every other vertical falls through to "Other."

**Recommended UX:** Step 1 v1.1 handles this with the "Coming soon" rows in the combobox. Tapping a Coming Soon vertical pre-fills "Other" with the vertical label and shows: "We don't have a specialist crew for this vertical yet — Beamix will use its generic playbook for now and graduate you when the [vertical] crew lands. We'll email you." This is the correct framing. The Brief in Step 3 will be the "Other" template — less precise, but honest.

**Backend behavior:** `vertical_id = 'other'` with `vertical_descriptor = 'restaurants'` stored in `truth_files`. The generic agent playbook runs; vertical-specific KG is not loaded. An internal tracking record is created for "Other" signups to inform future vertical prioritization.

**Inngest job impact:** No special handling. "Other" is a valid vertical_id at the schema level. Agents run the same pipeline but skip vertical-specific steps.

---

### FM-11: Customer edits Brief clauses to contradictory or nonsensical text

**Trigger:** Customer uses "Edit whole sentence" to replace a chip-structured sentence with free text that contradicts the rest of the Brief (e.g., claims they're in both Tel Aviv and New York simultaneously, or deletes all specificity and writes "we do everything").

**What the user sees (current — undefined):** Beamix signs the Brief as authored. Agents downstream will produce outputs based on contradictory guidance. The Trust File Auditor catches some contradictions during weekly checks, but the founding Brief governs everything — a bad Brief is a permanent anchor.

**Recommended UX:** Add a lightweight semantic consistency check on "Approve and start" click, before the signing ceremony begins. The check runs a fast LLM call (Haiku, not Sonnet — cost-conscious) against a rubric: are there geographic contradictions? Is the vertical implicit in the Brief consistent with the selected vertical? Does the Brief contain any claims that are in `prohibited_claims` from the Truth File (which is filled in Step 4, so this check must run after Step 4 or run prospectively)?

On inconsistency detection: do not block. Show a soft advisory above the Approve button: "We noticed a few things that might conflict — [list specific issues]. You can still sign as-is, or adjust the Brief." This respects the customer's authority (they can override) while surfacing the problem before it's constitutional.

**Backend behavior:** The consistency check result is stored as `briefs.consistency_warnings: string[]`. If the customer signs with known warnings, they're logged for Trust File Auditor to monitor on week 1.

**Inngest job impact:** No retry logic needed. The consistency check is synchronous (< 2s on Haiku), gating the Seal ceremony. If the Haiku call fails, skip the check and proceed — don't block signing on an LLM service disruption.

---

### FM-12: Customer enters Hebrew text in fields that expect English

**Trigger:** Marcus or Dani types voice words, claims, or Brief edits in Hebrew.

**What the user sees (current — undefined):** Hebrew text passes Zod validation (it's valid UTF-8 string). Agents receive Hebrew text in their prompts. Some LLM calls will handle it fine; others will produce mixed-language output. Agent prompts are written in English and assume English Truth File fields.

**Recommended UX:** Allow Hebrew in all free-text fields — don't block. Add an agent-prompt-level instruction: "If Truth File fields contain non-English text, respond in that language for customer-facing outputs; use English for internal reasoning steps." Store the `customer_language` preference (detected from browser `Accept-Language` or user selection in Step 1) and pass it to every agent context.

**Backend behavior:** Add `customer_language: string` to `truth_files` base schema. Default to `'en'`. If the domain's `hreflang` includes `he`, set to `'he'`. Agents read this field and adjust output language accordingly.

**Inngest job impact:** No change to retry logic. Language handling is a prompt-level concern, not a job-level one.

---

### FM-13: Welcome email bounces (mailbox full / domain rejects mail)

**Trigger:** Customer's corporate mailbox is full, or their domain's MX records reject mail from `notify.beamixai.com`.

**Recommended UX:** The customer has no signal that the product is running on their behalf. The Day 0 T+10min welcome email is the first trust confirmation. If it bounces, Beamix must surface an in-product alternative. On first login to `/home` after onboarding completion, check `email_delivered_day0: boolean`. If false, show a persistent /home banner: "We couldn't reach your email — check your spam folder or update your email in Settings." Do not silently swallow the bounce.

**Backend behavior:** Resend's webhook broadcasts `email.bounced` or `email.delivery_failed` events. An Inngest listener catches this and sets `email_bounced_day0: true` on the `customers` row. The Day 2–6 cadence skips until the email is updated or the bounce is resolved.

**Inngest job impact:** Email cadence Inngest function gates on `email_bounced` flag before each send. If bounced, emit `EMAIL_BOUNCED_UNRESOLVED` after 7 days and suppress the sequence. Do not dead-letter silently — add to an internal review queue.

---

### FM-14: Welcome email lands in spam

**Trigger:** Gmail or Outlook's spam filter classifies the Beamix welcome email as promotional. Customer never sees the verification link or the first-win setup instructions.

**Recommended UX:** The onboarding /home magic moment should not depend on the welcome email. The customer has already signed the Brief and filed the Truth File. /home should show a "Beamix is working" state immediately, independent of email delivery. The email is a secondary confirmation channel, not the primary product surface. For the email-delivery problem: DKIM/SPF/DMARC on `notify.beamixai.com` is a Tier 0 requirement. Warm the domain before launch. Consider a "Check your email" prompt on /home that links to Gmail and Outlook spam folder guides.

**Backend behavior:** No change to backend behavior. Email deliverability is a DNS and domain-warming problem, not a code problem at this stage.

**Inngest job impact:** None for the immediate failure. Email warm-up (gradual volume increase) is an ops process, not an Inngest concern.

---

### FM-15: Customer's email provider strips the magic link token

**Trigger:** Apple Mail Privacy Protection pre-fetches the magic link, consuming it. Or Bitdefender/Barracuda link-rewriting changes the URL structure, breaking the token.

**Recommended UX:** Supabase Auth's magic link mechanism is the auth foundation. If magic links fail for a subset of customers, the signup flow must offer an alternative: OTP (one-time password via email, not a click) or password-based signup. Post-MVP: add Google OAuth as a backup. At MVP, show on the "Check your email" screen: "If the link doesn't work, request a new one." Make it one click, not a support form.

**Backend behavior:** Supabase Auth handles token expiry (default 1h). The magic link token is single-use; pre-fetching consumes it. The fallback is: customer requests a new link, Supabase issues a fresh token. No backend change needed beyond ensuring the "Resend magic link" CTA is present on the waiting screen.

**Inngest job impact:** None.

---

### FM-16: Resend has an outage — verification email never sends

**Trigger:** Resend infrastructure fails during a customer's signup window.

**Recommended UX:** The onboarding flow must not block on Resend. Auth (Supabase) and email (Resend) are separate systems. Auth success should advance the customer immediately; email delivery is best-effort. Show on the /home banner: "We're sending your welcome email — if you don't see it in 10 minutes, check spam or contact support."

**Backend behavior:** Email sends are wrapped in `try/catch` with graceful failure. Failed sends are enqueued in Inngest with exponential backoff (5m, 30m, 2h, 6h). After 4 failures, write to an internal `email_failures` table for manual re-send and alert the on-call.

**Inngest job impact:** `email.send` Inngest step retries on Resend 5xx with backoff. After max retries, the job moves to dead-letter. Human escalation: review dead-letter queue daily during launch period. This is not customer-blocking — the product works without the email.

---

### FM-17: Twilio number provisioning fails (regional shortage in IL/EU/US)

**Trigger:** The Twilio number pool for Israel is exhausted. The fallback to US also fails. E-commerce customer in Step 2 sees the provisioning skeleton never resolve.

**What the user sees (current — spec'd):** v1 spec defines the error state: "We couldn't issue numbers right now. We'll keep trying in the background. Continue without — we'll surface them in Settings when ready." This is the correct behavior. The gap is in the "keep trying in the background" mechanic — it's not fully spec'd.

**Backend behavior:** `twilio_numbers` row is created with `status = 'error'` and `error_code = 'TWILIO_POOL_EXHAUSTED:IL'`. The Inngest retry schedule: +30m, +2h, +24h, then weekly. If provisioning succeeds on retry, set `status = 'active'` and fire a push notification + email: "Your Beamix tracking number is ready — [number] is now live in your Settings."

**Inngest job impact:** `attribution.provision-twilio` Inngest function has the `provisionTrackingNumber` fallback cascade (IL → US → GB) already in the spec. If all regions are exhausted, the function exits with a `TWILIO_POOL_EXHAUSTED` error, retries at +30m. After 5 retries, emit a `TWILIO_PROVISION_FAILED` event that alerts the on-call. The customer's account is not blocked — they're on UTM-only attribution until a number is provisioned.

---

### FM-18: Twilio webhook config fails on the new number

**Trigger:** The number is provisioned successfully but `voiceUrl` configuration fails (Twilio API returns 201 for the purchase but 4xx on the `incomingPhoneNumbers.update` call to set the webhook URL).

**Backend behavior:** The `provisionTrackingNumber` function (per tech spec) sets `voiceUrl` in the same `incomingPhoneNumbers.create` call. If the create call succeeds but the webhook URL is invalid (malformed `NEXT_PUBLIC_APP_URL`), Twilio will provision the number but calls will be misrouted. Detection: the 72h `attribution.verify-setup` Inngest job should include a synthetic call test — make a test call to each provisioned number and verify the TwiML webhook response. Alert if the webhook returns anything other than TwiML.

**Inngest job impact:** Add a `verify-twilio-webhook` step inside `attribution.verify-setup`. On failure, emit `TWILIO_WEBHOOK_MISCONFIGURED` and flag the number for re-provisioning. Customer-facing: no impact visible until they receive a real call that isn't attributed.

---

### FM-19: Customer cancels onboarding mid-Twilio-provision — orphan number?

**Trigger:** Customer clicks "Issue & Continue" in Step 2, then closes the tab or navigates away before Step 4 completion. The Inngest job continues and provisions a real Twilio number that the customer's account now "owns" but may never use.

**Backend behavior:** The `twilio_numbers` row exists with `status = 'active'` but the `onboarding_completed_at` field on `customers` is `null`. These are orphan numbers. At the 30-day abandoned account cleanup (see §3), the number must be released back to Twilio (via `client.incomingPhoneNumbers(sid).remove()`) to avoid ongoing per-number billing. The cleanup job should: (1) identify accounts with `onboarding_completed_at = null` and `created_at < now() - 30 days`, (2) for each, call Twilio to release provisioned numbers, (3) delete the `twilio_numbers` rows, (4) schedule GDPR data deletion.

**Inngest job impact:** The abandoned account cleanup Inngest cron runs nightly. It must include a Twilio number release step. This is a billing concern — each un-released number costs $1.00–$1.25/mo indefinitely.

---

### FM-20: Twilio account suspended / billing issue — entire feature down

**Trigger:** Beamix's Twilio account is suspended (billing lapse, policy violation, or a Twilio platform outage).

**Recommended UX:** All call tracking stops. Customers' tracked numbers stop forwarding calls. The attributions stop flowing. This is a Sev-1 event. The correct customer-facing response: /settings → Lead Attribution shows "Call tracking is temporarily unavailable — calls are forwarding to your line unattributed." The call itself should not fail — Twilio numbers continue to ring through even when webhooks are suspended; attribution logging fails silently. Confirm this behavior with Twilio support pre-launch and document in the incident runbook (F18).

**Backend behavior:** A Twilio health check Inngest cron runs every 10 minutes. It calls the Twilio API health endpoint. On 3 consecutive failures, emit `TWILIO_ACCOUNT_SUSPENDED` and alert on-call. Set a `attribution_paused: true` flag on all `customers` rows. When resolved, flip back and fire a "Call tracking restored" email to all affected customers.

**Inngest job impact:** The `attribution.provision-twilio` function gates on the health flag and fails fast if Twilio is suspended, rather than consuming retries.

---

### FM-21: `handle_new_user` trigger fails silently (historical bug)

**Trigger:** The Supabase DB trigger that creates `user_profiles` + `subscriptions` + `notification_preferences` rows on new user signup fails (migration not applied, RLS blocking the trigger's insert, or a schema mismatch).

**What the user sees:** Customer signs up, completes Paddle checkout, lands on `/onboarding/1`. Every onboarding step that reads from `user_profiles` returns no row. Step 4 Truth File `INSERT` fails because there's no FK parent row. The onboarding completion `UPDATE` hits 0 rows → returns success → but the dashboard reads `onboarding_completed_at = null` → redirects to onboarding → infinite loop. This is the historical bug documented in MEMORY.md (2026-03-02).

**Recovery design:** The `handle_new_user` trigger must be verified as part of Tier 0 infrastructure before any feature build begins. Add a migration smoke test: on every deploy, insert a test user in a test schema and verify all 3 rows are created within 500ms. Separately, add a guard in the onboarding completion route: if `user_profiles` row doesn't exist at Step 4 submission, run an UPSERT (not UPDATE) — same fix as the 2026-03-02 patch. This is a belt-and-suspenders fix, not a replacement for the trigger.

**Inngest job impact:** If the trigger fails at signup, the `attribution.provision-twilio` Inngest job (which fires at onboarding completion) may receive a `customer_id` that has no corresponding `user_profiles` row. The job should gate on `SELECT 1 FROM user_profiles WHERE id = customer_id` before proceeding and return `CUSTOMER_NOT_FOUND` if the row is missing, alerting on-call.

---

### FM-22: RLS policy mismatch — customer reads another customer's Brief draft

**Trigger:** An incorrectly scoped RLS policy on the `briefs` table (e.g., `USING (true)` during development left in prod, or a missing `WHERE user_id = auth.uid()` clause).

**Impact:** Customer A can read or overwrite Customer B's Brief draft. This is a Sev-1 data security incident.

**Recovery design:** RLS policies on `briefs`, `truth_files`, `twilio_numbers`, and `attribution_events` must be verified by the security audit (F42) before launch. The policy pattern is: `USING (user_id = auth.uid())` on SELECT, INSERT, UPDATE, DELETE. Run `mcp__supabase__get_advisors` before launch to catch RLS gaps. Add an integration test: create two test accounts, verify Account A cannot read Account B's rows on any of the onboarding tables.

**Inngest job impact:** Inngest functions use the service role key (bypasses RLS by design). This is correct for background jobs — but means the functions must explicitly scope queries to `customer_id` rather than relying on RLS. Every Inngest DB query must include `WHERE customer_id = event.data.customerId` as an explicit filter, not as a security boundary.

---

### FM-23: Migration not applied to production — onboarding completes but dashboard 500s

**Trigger:** A new table (e.g., `twilio_numbers`, `attribution_urls`) is in the codebase but the migration hasn't been applied to the Supabase production project. The app runs, onboarding completes, but any route that queries the missing table throws a 500.

**Recovery design:** Migrations must be applied and verified before any feature is available to customers. The Tier 0 infrastructure checklist (PRD §"Tier 0 Infrastructure") must include: run `mcp__supabase__list_migrations` and compare against `supabase/migrations/` in the codebase. Any mismatch blocks the deploy. Add this check to the CI pipeline as a pre-deploy step.

**Inngest job impact:** Inngest functions that INSERT into missing tables will fail with a Postgres error, Inngest retries the function 4 times, then moves to dead-letter. The customer sees a stuck state (e.g., provisioning spinner that never resolves). Add a dead-letter alert so ops is notified before the customer emails support.

---

### FM-24: Database deadlock on concurrent Brief writes

**Trigger:** The customer and the background deep-scan job both try to update the `briefs` row simultaneously — the deep-scan is populating initial Brief data, and the customer is autosaving a chip edit.

**Recommended UX:** Brief autosaves should use `SELECT ... FOR UPDATE SKIP LOCKED` to avoid deadlocks. The deep-scan job populates the Brief draft only once (on initial creation); subsequent writes are customer-only. Partition the write ownership: deep-scan writes to `briefs.agent_draft`, customer writes to `briefs.customer_draft`. The final committed Brief is the customer's version. This eliminates the contention.

**Backend behavior:** Add `agent_draft: JSONB` and `customer_draft: JSONB` to `briefs`. The Brief renderer uses `customer_draft ?? agent_draft` as the display value. Autosave only touches `customer_draft`. No locking needed.

**Inngest job impact:** The `scan.deep` Inngest function populates `agent_draft` once. If it retries, it overwrites `agent_draft` (safe — the customer's `customer_draft` is untouched).

---

### FM-25: Customer signs up with Google OAuth, then signs in with email-password

**Trigger:** Customer creates account via Google OAuth. Later they try to sign in with email + password using the same email address. Supabase creates a second identity linked to the same email, or throws a conflict error.

**Recommended UX:** Supabase Auth handles OAuth-email collision via linked identities (if configured). Ensure `SUPABASE_AUTH_MERGE_IDENTITIES` is enabled. Surface to the customer: "You signed up with Google — sign in with Google to access your account." One clear message, not a generic auth error.

**Backend behavior:** The Supabase Auth identity merge setting handles this at the auth layer. The `user_profiles` row is keyed by `auth.uid()` — if two separate UIDs are created for the same email (due to misconfigured identity merge), the customer loses access to their Brief and Truth File. Verify identity merge behavior in the staging environment before launch.

**Inngest job impact:** If a duplicate UID is created, Inngest jobs keyed by the original `customer_id` will not be accessible from the new auth session. The customer won't see their attribution data or scan history. Detection: compare `email` across `user_profiles` rows nightly; alert on duplicates.

---

### FM-26: Customer's workspace has no Brief (incomplete onboarding state)

**Trigger:** Customer's `onboarding_completed_at` is set (perhaps from a legacy data issue or a mis-fired event) but `briefs` has no signed row for their account.

**What the user sees:** /home loads but the Brief binding line (F31) has no content, the Evidence Card has no Brief clause citation, and agents may refuse to run (they require a signed Brief as the authorization document).

**Recovery design:** Add a `has_signed_brief` computed column or a guard in the middleware: if the customer is past onboarding but has no signed Brief, redirect to `/onboarding/3` with a re-entry banner: "Your Brief wasn't filed — let's finish that now." This is a recovery path, not the happy path. It must be tested explicitly.

**Backend behavior:** The `briefs` table has a `signed_at: timestamp` column. The dashboard layout query checks for a row WHERE `user_id = auth.uid() AND signed_at IS NOT NULL`. If none, redirect.

**Inngest job impact:** Agents gate on `brief_signed: true` before any job can publish. If `briefs` has no signed row, the agent job returns `BRIEF_NOT_SIGNED` and pauses. This is correct — it prevents agents from running without authorization.

---

### FM-27: Customer abandons at Step 2, returns 30 days later

**Trigger:** Customer signs up, completes Paddle checkout, gets to Step 2 (Brief co-authoring), leaves. Returns a month later having forgotten the context.

**What the user sees (current — undefined):** They land at whatever step they abandoned. The autosaved Brief draft from 30 days ago is their current state. The deep-scan data from 30 days ago may be stale (competitor set has changed, their domain has been updated).

**Recommended UX:** On re-entry to an incomplete onboarding (checked via `onboarding_completed_at = null`), show a re-entry banner at the top of the content well: "Welcome back — you paused here on [date]. Your progress is saved. Your scan data is [N days] old — [Refresh scan / Use saved data]." Two CTAs. "Refresh scan" re-runs the deep scan (adds 15-20s before Step 3 but ensures the Brief is based on current site state). "Use saved data" advances with the 30-day-old draft.

**Backend behavior:** Trial clock: the 14-day money-back guarantee clock starts at Paddle checkout (payment processed), not at onboarding completion. A customer who abandons at Step 2 for 30 days has already consumed their trial window. They're on a paying subscription without having completed setup. This is an edge case that requires a customer support policy: likely, trial clock resets on onboarding completion as a one-time accommodation. Document this policy in the internal runbook.

**Inngest job impact:** The Day 1-6 email cadence should check `onboarding_completed_at` before sending each email. If onboarding is incomplete, suppress the product emails and instead send onboarding recovery emails (Day 2: "We saved your Brief draft — finish setup in 3 minutes").

---

### FM-28: Customer's domain ownership verification fails (DNS TXT not propagated)

**Trigger:** Domain ownership verification is attempted (if implemented — not explicitly in MVP scope, but mentioned in the context of F36 domain migration). DNS TXT record added by customer hasn't propagated globally (typical propagation: 24–48h).

**Recommended UX:** Never block onboarding on DNS propagation. Domain ownership is a nice-to-have signal, not a gate. If implemented: check on a background basis, not as part of the onboarding flow. Show verification status in /settings → Profile as a passive indicator. If verification fails after 72h, show a nudge in /home: "Domain ownership not yet verified — this is optional but helps agents operate more confidently."

**Backend behavior:** DNS TXT check Inngest job runs at T+1h, T+24h, T+48h. On success, sets `domain_verified: true`. On 3 failures, marks `domain_verification_status = 'expired'` and stops checking.

---

### FM-29: Customer is Yossi adding his 12th client — re-onboarding at scale

**Trigger:** Yossi (agency persona, Scale tier) is adding his 12th client domain. The full 4-step onboarding ceremony must run for each client per F40 ("every client account gets full Brief ceremony, full Truth File, full Lead Attribution setup — no shortcut flow"). This runs 12 times.

**Pain point:** The ceremony is intentionally cinematic and thoughtful. For a domain-knowledge expert running it for the 12th time, it's friction. The chip-editing in Step 3 requires careful attention; doing it for a client you know well takes more time than it would for your own business.

**Recommended UX:** Yossi-specific optimizations that don't break the ceremony: (1) In Step 1, if the account has ≥2 existing clients, show a "Copy from existing client" ghost option that pre-fills the form from a selected client (editable before Continue). (2) In Step 4, Truth File fields can be pre-populated from a previously filed client if "Same agency, different brand" is selected. (3) The Seal ceremony remains full — it's constitutionally non-negotiable per F40. (4) The "Send to developer" Step 2 mechanic is particularly valuable here (per Yossi's critical requirements — clients' CTOs place UTM tags, not Yossi).

**Backend behavior:** Add `template_from_client_id: uuid | null` to the onboarding session. If set, pre-fill Step 1 and Step 4 fields from the referenced client's `truth_files` row, excluding brand-specific fields (business name, domain, voice words). This is a copy-on-create, not a live link.

**Inngest job impact:** No change. Each client's onboarding triggers its own Twilio provisioning and deep-scan jobs independently.

---

### FM-30: Customer on Discover tier tries to add a second domain

**Trigger:** A Discover ($79) customer attempts to add a second domain. Per pricing: Discover = 1 domain, Build = 1 domain, Scale = 5 included + $49/domain/month add-on.

**Recommended UX:** In /settings → Profile or any domain-adding surface, gate on tier. Show: "Your Discover plan includes one domain. Upgrade to Scale to manage up to 5 domains — or add more at $49/domain/month." Direct link to Paddle upgrade flow. No silent failure — the attempt to add a second domain must surface a clear tier upgrade prompt, not a generic error.

**Backend behavior:** The `businesses` table should enforce a unique constraint on `user_id + is_primary = true`. For multi-domain Scale accounts, enforce a domain count <= tier limit at the API route level before any DB write.

**Inngest job impact:** None. Tier enforcement is a synchronous API concern, not an async job concern.

---

## §3 — The Abandoned Cart Problem

Onboarding takes 4–7 minutes. The highest-friction moment is Step 3 (Brief co-authoring) — the customer must read a paragraph Beamix authored, make judgment calls about which chips to edit, and decide to sign a constitutional document. This is where abandonment peaks.

### Recovery email sequence

The Day 1-6 email cadence (F14) must include an "abandoned onboarding" branch. This is separate from the product email sequence.

**Email 1 — Day 1 (T+24h, if onboarding not complete):**
Subject: "Beamix · your Brief is waiting"
Body (cream-paper register, Voice Canon Model B, no AI label):

"Your account is set up. Your Brief is drafted. You haven't signed it yet — that's the part where Beamix gets its instructions.

It takes 90 seconds. When you sign, the crew starts.

— Beamix"

CTA: "Finish your Brief →" (links directly to `/onboarding/3` with draft pre-loaded)

**Email 2 — Day 3 (if still incomplete after Day 1 email):**
Subject: "Beamix · [business name]: one step left"
Body references their specific domain and the Brief's first sentence (personalised from the saved draft) to show Beamix has been waiting with their specific work, not a generic prompt.

**Email 3 — Day 7 (final):**
Subject: "Beamix · your account expires in 7 days"
Body: honest. "We've held your account and your Brief draft for a week. If you don't complete setup, we'll close the account and process a full refund. No penalty. — Beamix"

**Why Day 7 is the final, not Day 14:** The 14-day money-back guarantee is for *active* accounts. An account that never completed onboarding is a different category. Seven days of outreach is reasonable before invoking the closure-and-refund process.

### Partial account cleanup — 30-day rule

After 30 days of no onboarding completion (and no response to the 3-email sequence):
1. The Inngest cleanup cron identifies accounts: `onboarding_completed_at = null AND created_at < now() - 30 days AND last_email_outreach < now() - 23 days`.
2. For each, release Twilio numbers (Twilio REST DELETE), delete `twilio_numbers` rows.
3. Schedule GDPR deletion: mark `customers.deletion_scheduled_at = now() + 30 days`.
4. At `deletion_scheduled_at`: delete all PII from `user_profiles`, `free_scans`, `attribution_events`. Anonymize `customers` row (zero-out email, name, domain — retain tier and created_at for aggregate analytics).
5. Cancel Paddle subscription via Paddle API.
6. Send one final email: "Your Beamix account has been closed. We've processed a full refund."

### Return from email — landing on Step 2 with Brief draft preserved

The "Finish your Brief →" CTA links to `/onboarding/3`. The URL contains no draft identifier — the draft is server-side, keyed by `auth.uid()`. On page load, the `/onboarding/3` route checks for an existing `briefs` draft row and renders it. The customer lands directly on their saved draft with a re-entry banner: "Welcome back — this is your saved Brief. You can edit before signing." Brief is exactly where they left it. No restart required.

---

## §4 — The Wrong Domain Problem

### Pre-activation domain edit (during onboarding)

The current spec doesn't explicitly address the case where a customer changes their domain in Step 1 after they've already passed through the public scan with a different domain. This is a first-session occurrence: they scanned `old-brand.com` during acquisition but their actual product lives at `newbrand.com`.

**Domain edit flow during Step 1:**

When the customer changes the website field in Step 1 (vs the pre-filled value from the scan), the system must:

1. Detect the change (compare against `free_scans.domain` from the `?scan_id=` param).
2. Show a confirmation prompt: "You're changing from [old-domain] to [new-domain]. Beamix will re-scan the new domain for your Brief. This takes about 15 seconds." [Cancel / Confirm]
3. On confirm: fire a lightweight re-scan of the new domain (just the brief-relevant signals — schema, FAQ, competitor citations — not the full 11-engine scan). Show a "Scanning [new-domain]…" spinner in place of the Step 1 content well.
4. On scan completion (15-20s): re-fill all Step 1 fields from the new domain's signals. Re-classify vertical. Show the results as pre-filled but editable.

**Backend cleanup if customer changes domain mid-Brief:**

If the domain change happens after Step 1 Continue (i.e., the customer is on Step 2 or Step 3 and goes Back to change the domain):

1. The existing `briefs.agent_draft` is invalidated — it was written for the old domain.
2. The existing `twilio_numbers` rows (if provisioned for Step 2) reference the old domain in their `friendly_name`. They should be updated to reference the new domain. No Twilio number needs to be re-provisioned — the number itself doesn't encode the domain.
3. The `businesses.domain` field is updated.
4. The deep-scan Inngest job (`scan.deep`) is cancelled (if still running) and re-queued for the new domain.
5. A new `briefs.agent_draft` is generated from the new domain's scan results.

**The customer sees:** On returning to Step 3 after a domain change, the Brief is re-generated (15-30s wait, shown as a loading state) with a note: "We re-drafted your Brief for [new-domain]."

**Key invariant:** The Brief must always be authored from the correct domain's signal. Signing a Brief for domain A when the product runs on domain B is worse than no Brief.

---

## §5 — The Post-Onboarding Gap

### Skeleton state at /home before first scan completes

The magic moment cinematic (7-second sequence per v1.1 §8.1) runs immediately after Step 4 completion. It assumes scan data is available. The deep scan was triggered at onboarding start (during Steps 1–2) and should complete before the customer reaches Step 4. Typical deep-scan duration: 60-90 seconds. Step 4 alone takes 60 seconds for a fast operator. The timing is tight.

**If scan is still running when customer lands on /home:**

The Score renders at 0 with a pulsing "Scanning…" ring (not the Activity Ring at full state — the Board 2 lock on "renders at full state at t=0" applies to *returning* sessions, not the first-ever landing before scan completion). The Fraunces rotating line reads: "We're still reading your site — the first findings are coming." No Evidence Card #1 until the scan completes. The "Crew at Work" strip pulses on normally — agents are queued even if scan isn't finished.

Scan completion triggers a Supabase Realtime event on `agent:runs:{customer_id}`. The /home page listens for this and updates the Score + Evidence Card #1 when the event fires — no page reload required.

**If first scan completes but returns 0 useful data:**

This is the "Foundation phase" for low-signal domains. /home shows the Score (will be low — 0-15 for a domain with no citations) alongside a specific framing:

"Foundation phase — Beamix is building your presence from scratch. Expect your first citations in 3–5 agent cycles."

Schema Doctor runs first (per the vertical-by-default priority). Evidence Card #1 shows the Schema Doctor's first output — even if it's just "Identified 7 schema gaps on /home — drafting fixes now." This is actionable even when citation data is zero.

**If all 6 agents are blocked by a non-passing precondition:**

This is the critical edge case. Agent preconditions include: domain reachable, Truth File filed, Brief signed, no active incident. If all 6 are blocked simultaneously (e.g., domain unreachable + Truth File validation failure):

/home shows: "Beamix is paused — [N] things need your attention." The Inbox pointer line becomes a prominent banner with a count of blocker items. Each blocker is surfaced in /inbox as an actionable item (e.g., "Domain unreachable — verify your domain is live").

Do not show a "Beamix is working" animation when agents are actually blocked. This is a trust issue: showing activity when nothing is happening erodes the "delivered work, not promise" philosophy.

### Trial clock semantics

The 14-day money-back guarantee clock starts at **Paddle checkout** (payment processed timestamp). This is the correct anchor — it's when the customer committed financially. Onboarding completion and first /home visit are downstream events, not trial start events.

Implication: a customer who completes onboarding on Day 3 of their subscription has 11 days of productive trial, not 14. This is acceptable — it's the same model as most SaaS tools (charging starts at signup, not at first use).

The trial clock is surfaced in /settings → Billing as: "14-day money-back guarantee — [N] days remaining." After Day 14, this line disappears. No countdown anxiety in the product before Day 14.

---

## §6 — Recommendations Matrix

| # | Description | Failure modes addressed | Impact | Effort | Visibility |
|---|---|---|---|---|---|
| **R-01** | Brief draft tab-lock (optimistic, 90s TTL) — prevents dual-tab race conditions on Brief writes | FM-04 | 4 | XS | Internal |
| **R-02** | Session timeout modal (reauth without redirect) — preserves Brief draft on 401 | FM-03 | 5 | S | Customer-visible |
| **R-03** | Soft Brief consistency check (Haiku, pre-Seal) — warns on geographic contradictions and Truth File conflicts | FM-11 | 4 | S | Customer-visible |
| **R-04** | Abandoned onboarding email sequence (3 emails: Day 1 / Day 3 / Day 7) — recovers the lost-at-Step-2 cohort | FM-27, §3 | 5 | M | Customer-visible |
| **R-05** | 30-day cleanup cron with Twilio number release — prevents orphan billing and GDPR exposure | FM-19, §3 | 5 | M | Internal |
| **R-06** | `handle_new_user` trigger smoke test on every deploy + UPSERT guard in onboarding completion route | FM-21 | 5 | XS | Internal |
| **R-07** | Domain change flow in Step 1 with lightweight re-scan and Brief invalidation — prevents signing a Brief for the wrong domain | §4 | 5 | M | Customer-visible |
| **R-08** | "Domain unreachable" pre-scan fallback — brief generated from cached AI engine data, not blocked | FM-08 | 4 | S | Customer-visible |
| **R-09** | Twilio provisioning retry schedule with Twilio number release on account cleanup — prevents billing leakage | FM-17, FM-18, FM-19 | 4 | S | Internal |
| **R-10** | First /home skeleton state when scan is still running — renders "Scanning…" ring + Fraunces holding line, no false "Beamix is working" animation when agents are blocked | §5 | 4 | S | Customer-visible |

**Priority order:** R-06 (historical bug, pre-MVP gate) → R-02 (conversion impact) → R-04 (abandoned cart, directly tied to activation rate) → R-07 (data integrity, Brief must match domain) → R-05 (billing leak + GDPR) → R-03 (trust, Brief quality) → R-01 (concurrency edge case) → R-08 (signal gap) → R-09 (ops) → R-10 (first impression).

---

*— Beamix*

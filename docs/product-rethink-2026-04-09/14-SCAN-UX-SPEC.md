# Free Scan UX Technical Spec — Worker Reference (2026-04-17)

> **This is the CONVERSION FUNNEL. Every pixel matters. Reference `08-UX-ARCHITECTURE.md` §4 for the full flow.**

---

## Scope

This spec covers the complete technical implementation of the free scan experience: the public `/scan` page, the scanning animation, the wound-reveal result page, the email soft-gate, and the preview mode transition.

This is the primary growth surface for Beamix. A user who completes this flow and reaches the dashboard converts at a much higher rate than a user who goes direct to signup. Build it accordingly.

Assigned to: **Wave 1, Frontend Worker 2.**

---

## Route Structure

The free scan uses an overlay approach — no intermediate route between `/scan` and the scan result. The URL does not change during the scanning animation. The result is revealed on the same page after polling completes.

```
/scan                    ← public, no auth required
  State 1: Pre-scan form
  State 2: Scanning animation (same route, form unmounts, animation mounts)
  State 3: Wound-reveal result (same route, animation unmounts, result mounts)
  State 4: Email gate (overlay on result, 20s delay)

/api/scan/free           ← POST — starts Inngest free scan job, returns { scanId }
/api/scan/free/[scanId]  ← GET — poll status + partial results

After signup/email capture:
/onboarding/post-scan    ← auth required, scan_id passed as query param
                           detects scan_id → skips onboarding → links scan → /home
```

No separate `/scan/[scanId]/result` route. The result lives at `/scan` with client state driving the view. `scanId` is stored in component state and sessionStorage (survives page refresh during polling).

---

## State Machine

```typescript
type ScanPageState =
  | 'form'           // Initial form display
  | 'scanning'       // Inngest job running, polling active
  | 'revealing'      // Results ready, wound-reveal animation playing
  | 'revealed'       // Animation complete, full result visible
  | 'email_gate'     // Email capture overlay (20s after 'revealed')
  | 'signed_up'      // Email captured, redirecting
  | 'error';         // Job failed or timeout
```

State transitions:
- `form` → `scanning`: on form submit, `POST /api/scan/free` succeeds
- `scanning` → `revealing`: poll returns `status: 'complete'`
- `scanning` → `error`: poll returns `status: 'failed'` or 90s timeout
- `revealing` → `revealed`: entrance animation sequence completes
- `revealed` → `email_gate`: 20-second timer fires
- `email_gate` → `signed_up`: user submits email → Supabase magic link sent → redirect

---

## Pre-Scan Form

### Layout

Dark background (`#0A0A0A`). Single centered card (max-width 560px). Logo mark at top.

### Fields

Progressive reveal — not all fields visible at once.

**Step 1 (always visible):**
- Business URL (text input, validated as URL on blur)
- "Scan my visibility" button → validates then reveals Step 2

**Step 2 (revealed after URL entered, spring animation):**
- Industry selector (dropdown, uses `src/constants/industries.ts`)
- Location (text input, placeholder: "Tel Aviv, Israel")
- "Continue" button → reveals Step 3

**Step 3 (revealed after location entered):**
- "Add up to 3 competitors (optional)" label
- 3 competitor URL inputs (each with autocomplete — see below)
- "Start scan →" primary CTA

### Competitor Autocomplete

As user types in a competitor field, call `POST /api/scan/suggest-competitors` with the user's business URL and industry. This endpoint calls Claude Haiku to generate 3–5 competitor suggestions based on business category + location. Suggestions appear as a dropdown. Selecting one fills the input.

The autocomplete is the "gift" — users feel the product is already doing work for them before the scan starts.

API endpoint owned by **Backend Worker 2**.

```typescript
// POST /api/scan/suggest-competitors
// Body: { businessUrl: string, industry: string, location: string }
// Response: { suggestions: string[] }  // 3-5 competitor URLs/names
```

### Form Submission

On "Start scan →":
1. Validate all inputs client-side (URL format, required fields)
2. `POST /api/scan/free` with form data
3. On 202 response: store `scanId` in state + `sessionStorage`
4. Transition to `scanning` state

---

## Scanning Animation

### Design

Full dark screen (`#0A0A0A`). No header, no nav. The scan is a ritual — the user is focused entirely on the result approaching.

### Layout

```
[Logo mark — small, centered, top 20%]

[Business URL being scanned — Inter, muted, 14px]

[Engine pills row — 6 pills in a horizontal cluster]

[Query ticker — cycling text, 14px, muted]

[Progress ring — 80px, centered, bottom 35%]
```

### Engine Pills

6 pills for the 6 engines being scanned (ChatGPT, Gemini, Perplexity, Claude, Google AI Overviews, Grok). Each pill starts in a "waiting" state (dark background, muted text, subtle border).

As scan results arrive via polling, pills light up one by one:
- Transition: pill background fades from dark → engine brand color → settles to `#3370FF` with checkmark
- Timing: not random — each pill lights up when its result actually arrives in the poll response
- If an engine result takes longer than 60s: show engine pill with amber "slow" indicator, don't fail the whole scan

```typescript
interface EnginePillState {
  engine: string;
  status: 'waiting' | 'scanning' | 'complete' | 'slow';
}
```

### Query Ticker

Below the engine pills, a text line cycles through queries being checked:
```
"Checking: best accountant in Tel Aviv..."
"Checking: bookkeeping services for SMBs..."
"Checking: local accounting firms near me..."
```

Queries come from the first poll response (returns a sample of queries being checked). If no queries yet: use placeholder strings from the business category template.

Animation: each query fades out → next query fades in, 2.5s per query, loop.

### CSS Sonar Pulse

Behind the engine pills cluster: a CSS-only radial pulse animation emanating from the center.

```css
.sonar-pulse {
  position: absolute;
  border-radius: 50%;
  animation: sonar 2s ease-out infinite;
}

@keyframes sonar {
  0%   { transform: scale(0.8); opacity: 0.6; }
  100% { transform: scale(2.4); opacity: 0;   }
}
```

Three rings with staggered `animation-delay` (0s, 0.66s, 1.33s). Color: `#3370FF` at 20% opacity.

### Progress Ring

80px SVG circle with stroke-dashoffset animation. Progress is time-based (not tied to actual completion):
- 0–15s: 0% → 40% (fast initial progress)
- 15–45s: 40% → 70% (slows down)
- 45–75s: 70% → 90% (very slow — holding suspense)
- On complete: 90% → 100% (instant snap)

Do not use a library for this — pure SVG `strokeDashoffset` CSS animation.

```typescript
// Progress percentage based on elapsed time (not real completion)
function getTimeBasedProgress(elapsedMs: number): number {
  if (elapsedMs < 15000) return (elapsedMs / 15000) * 40;
  if (elapsedMs < 45000) return 40 + ((elapsedMs - 15000) / 30000) * 30;
  if (elapsedMs < 75000) return 70 + ((elapsedMs - 45000) / 30000) * 20;
  return 90; // hold at 90% until result arrives
}
```

### Polling

```typescript
// Poll every 3s after job start
// Endpoint: GET /api/scan/free/[scanId]
// Response shape:
interface FreeScanPollResponse {
  status: 'running' | 'complete' | 'failed';
  enginesComplete: string[];     // engines that have results
  queryCount?: number;           // queries checked so far
  result?: FreeScanResult;       // only present when status === 'complete'
}
```

On `status === 'complete'`: stop polling, trigger reveal animation. On `status === 'failed'`: stop polling, transition to error state. On 90s elapsed with no completion: stop polling, show timeout error with retry option.

---

## Wound-Reveal Result Page

The reveal is the emotional peak of the funnel. The goal is to make the problem viscerally real so the CTA feels inevitable.

### Entrance Animation Sequence

All elements are hidden on `revealing` state entry. They appear in sequence:

```
0ms    Score number counts up from 0 → actual score (spring, ~1.2s)
1400ms Engine bars slide in from left, one by one (stagger 100ms)
2200ms Competitor section fades up
2800ms Fix cards appear (stagger 150ms per card)
3600ms CTA buttons fade in
3800ms State transitions to 'revealed'
```

### Score Display

Giant score. No ambiguity about what this number means.

```
[Score: 23]     ← 128px, font-display, color from score tier
                   < 40 = #EF4444 (Critical)
                   40–59 = #F59E0B (Fair)
                   60–79 = #10B981 (Good)
                   80+ = #06B6D4 (Excellent)

[2 of 30 queries mention your business]   ← 18px, muted
[Your competitors appear in 14 of these queries]  ← 14px, loss-aversion red
```

Use `@number-flow/react` for the counter animation. This library handles the digit-roll effect cleanly without custom code.

```tsx
import NumberFlow from '@number-flow/react';

<NumberFlow
  value={score}
  format={{ minimumIntegerDigits: 2 }}
  className="text-[128px] font-display font-medium leading-none"
  style={{ color: scoreColor }}
/>
```

### Engine Bars

Horizontal bar chart. Pure CSS `width` transition — no chart library.

```typescript
interface EngineBarData {
  engine: string;
  logo: string;         // SVG path or URL
  mentionRate: number;  // 0–100
  yourScore: number;    // 0–100
  topCompetitorScore: number | null;
}
```

Each bar:
- Engine logo (16px) + name left-aligned
- Two bars: yours (blue `#3370FF`) and top competitor (muted gray) on same row for comparison
- Bar fills via CSS `transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)` (slight overshoot)
- Percentage label at bar end

### Competitor Cards

Top 3 competitors from the scan, showing their score vs yours.

```typescript
interface CompetitorCardData {
  domain: string;
  score: number;
  mentionCount: number;      // how many queries they appear in
  yourMentionCount: number;
}
```

Card design: minimal, monochrome except the score number. Loss-aversion framing:
- "MovingTLV appears in 14 queries you're invisible in"
- Competitor score displayed larger than your score, intentionally

### Fix Cards

3 visible fix cards + 8 blurred cards behind frosted glass overlay.

**Visible cards:**
```typescript
interface FixCard {
  agentType: AgentType;
  title: string;             // e.g., "Add FAQ schema to your homepage"
  description: string;       // 1-sentence explanation
  estimatedImpact: 'low' | 'medium' | 'high';
  estimatedTimeToEffect: string;  // e.g., "2–4 weeks"
}
```

**Blurred cards:**
8 cards with the same structure but `filter: blur(4px)` and a glass overlay:
```css
.blurred-cards-overlay {
  background: linear-gradient(180deg, transparent 0%, rgba(10,10,10,0.95) 60%);
}
```

Glass overlay contains: lock icon + "8 more issues found" + CTA button.

### CTA Section

Two options, both below the fix cards:

```
[Fix this now →]                ← Primary, #3370FF, full-width on mobile
[Explore the product first]     ← Text link, muted, below primary
```

"Fix this now" → jumps directly to paywall modal (no intermediate step).
"Explore first" → triggers preview mode (email capture → redirect to `/home`).

---

## Email Soft-Gate

20 seconds after state reaches `'revealed'`, an email capture overlay appears.

This is non-blocking on first appearance — user can dismiss it once. If dismissed, it does not reappear during the same session.

```typescript
interface EmailGateOverlayProps {
  onSubmit: (email: string) => Promise<void>;
  onDismiss: () => void;
  scanScore: number;
}
```

Copy: "Save your results — we found [N] issues with your AI visibility. Enter your email to access the full report."

On submit: create Supabase user with magic link → user gets email → clicking link lands on `/onboarding/post-scan?scan_id=[id]`.

On that route: detect `scan_id` param → skip onboarding → link free scan to user → redirect to `/home` with scan data pre-loaded.

---

## Preview Mode Transition

When user clicks "Explore the product first":

1. Email capture modal appears (if email not yet captured)
2. On email submit: `POST /api/auth/preview-signup` — creates Supabase account with magic link
3. Email sent to user with subject "Explore Beamix" + magic link
4. On this device (no magic link needed): session created immediately via `supabase.auth.signInWithOtp()` with auto-confirm for preview accounts
5. Redirect to `/home?preview=true&scan_id=[id]`
6. Dashboard layout detects `preview=true` → renders `PreviewBanner`
7. `canAccess()` checks return feature-gated responses for preview users

```typescript
// POST /api/auth/preview-signup
// Body: { email: string, scanId: string }
// Response: { userId: string, sessionToken: string }
// Side effects:
//   - Creates Supabase auth user (email, magic link)
//   - Creates user_profiles row (onboarding_completed_at = now(), is_preview = true)
//   - Links free_scans.converted_user_id = userId
//   - Creates businesses record from scan data
//   - Queues 1 free FAQ Builder run (fires after 5 minutes via Inngest)
```

API route owned by **Backend Worker 2**.

---

## Mobile Considerations

The scan funnel is the primary mobile experience. Many SMB owners will scan from their phone.

- Pre-scan form: single column, full-width inputs, large tap targets (min 48px height)
- Scanning animation: engine pills wrap to 3×2 grid on small screens
- Result page: score full width, engine bars full width, competitor cards stack vertically
- Fix cards: 1 visible + frosted overlay showing 8 more (same as desktop)
- CTA buttons: stacked vertically, full width
- Email gate: bottom sheet (slides up from bottom on mobile, centered overlay on desktop)

Test on iPhone SE (375px) and standard mobile (390px). The funnel must work at 375px width without horizontal scroll.

---

## Technical Dependencies

| Dependency | Purpose | Already installed? |
|-----------|---------|-------------------|
| `@number-flow/react` | Digit-roll score counter | No — add to `package.json` |
| `framer-motion` | Entrance animations, state transitions | Yes |
| `react-markdown` | Not needed on scan page | — |
| Tailwind CSS | All layout + styling | Yes |
| Supabase JS client | Magic link auth for preview signup | Yes |

CSS-only: sonar pulse (no library), engine bar transitions (no library), progress ring (SVG + CSS).

Do NOT use a chart library on the scan result page. Engine bars are pure CSS. The wound-reveal aesthetic requires precise control over animation timing that generic chart libraries cannot provide cleanly.

---

## Error States

| Error | Display |
|-------|---------|
| Form validation fail | Inline field error, red border, message below field |
| `POST /api/scan/free` fails (5xx) | "We couldn't start the scan — try again" with retry button |
| Polling returns `failed` | Full-screen error: "Something went wrong — your scan data was not saved. Try scanning again." with retry |
| 90-second timeout (no result) | "The scan is taking longer than expected. We'll email you when it's ready." — email capture form |
| Engine partial failure (1–2 engines fail) | Complete scan with available results, show affected engines in gray with "Data unavailable" label |

Partial engine failure is not a fatal error. If 4+ engines complete successfully, show the result. Acknowledge missing engines in the UI but do not block the reveal.

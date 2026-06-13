---
page: /settings
states_audited:
  - populated-desktop.png (Profile tab only)
  - populated-mobile.png (Profile tab only)
states_missing:
  - empty / first-run (no avatar, no values) — NOT captured
  - other 5 tabs (Brand fingerprint, Billing, Approval preferences, Publishing integrations, Cancel) — NOT captured
  - loading skeleton — NOT captured
  - error / save-bar dirty states — NOT captured
  - desktop hover / focus — NOT captured
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.39.14 AM.png (citation-share panel: mono figures, restrained sparkline, single accent line)
  - Profound-Screenshot 2026-06-12 at 10.36.25 AM.png (loading state: confident centered mark + status copy on textured ground)
verdict: NEEDS_WORK
---

# settings — UI Excellence Audit

## Screenshots
- [populated-desktop.png](./screenshots/settings/populated-desktop.png) — Profile tab, 1440px
- [populated-mobile.png](./screenshots/settings/populated-mobile.png) — Profile tab, 375px

## Verdict
**NEEDS_WORK.** This is a genuinely competent, professional settings shell — the 200px rail + 760px content column, label/control field rows, per-section save-bar, divide-y hairlines and the warm tab-active treatment are all clean and would not embarrass next to Linear/Stripe settings. It is NOT broken and NOT a clone. But it does not yet hit the Beamix craft bar: the page is a stack of two **identically-weighted cards** with the same depth, the same heading register, and a layout that reads dead-center symmetric in the content column. It is missing every Beamix soul signal — there is no felt depth hierarchy (M1), no Fraunces beat (M5/tell 6), no mono-for-truth treatment (M11), no entrance choreography evidence (M9/tell 7), and the blue/violet promise is invisible (M6/tell 8). It looks like a well-built generic SaaS settings page, not a Beamix surface that sits beside the #173 dashboard "as one hand." Two real bugs also exist (subtitle wraps awkwardly, disabled Save button uses a washed-out blue that reads broken). Closeable with polish, not a redesign.

> Audit caveat: only the **Profile tab, populated, two breakpoints** was captured. The other 5 tabs, the empty/first-run state, the loading skeleton, and all save-bar/error/hover states were NOT screenshotted. Findings below are scoped to what is visible plus what the source confirms. The empty-state and per-tab audits remain open.

## P1 — must fix (looks AI / broken)

**1. Two identically-weighted cards = uniform depth (tell #1, violates M1/M10).**
The content column is "Personal information" card stacked on "Password" card, both `card-console`, both same shadow, same `15px font-semibold` heading, same eyebrow, same internal rhythm. Nothing on the screen commands; nothing recedes. There is no TIER-1 focal and no TIER-3 recede — the canonical AI tell of "every surface is the same card." A settings page legitimately has no hero metric, but it still needs felt hierarchy: the primary identity card (Profile/avatar/name/email) should sit at TIER-2 standard `--shadow-card`, and secondary/utility groupings (Password, and on other tabs things like connected-integration rows) should drop to the new `.card-inset` recede (transparent/surface-warm ground, 1px border, NO shadow). One register for "this is your core identity," a quieter register for "supporting settings."
Fix: **M1 depth-staging** — assign tiers; do not paint both cards at the same elevation. `ProfileTab.tsx:38` (`SectionCard` always renders `card-console` — add a `tier`/`inset` variant), used at `:416` (Profile, keep standard) and `:568` (Password → inset).

**2. Disabled Save button renders as a washed pale-blue that reads as a rendering bug.**
In both desktop and mobile, the idle/clean "Save changes" button is a low-opacity `#3370FF` (looks ~40% alpha) sitting on white with white text. It does not read as "disabled" — it reads as a half-loaded/broken primary button, and it weakens the one place blue is supposed to be confident. The brand law is "one confident blue per surface"; a ghosted blue fill is the opposite.
Why it reads broken vs the bar: Stripe/Linear disable a primary by going to a neutral grey fill or a bordered ghost, never a translucent accent. The competitor Profound panels keep the single accent fully saturated and reserve it for the live element.
Fix: disabled save = neutral (`bg-[#F3F4F6] text-[#9CA3AF]`) or a quiet bordered ghost, and only light up to full `#3370FF` when `isDirty`. `ProfileTab.tsx:159–166` (the `<Button>` with `disabled={... !isDirty ...}` — the disabled style is inheriting a translucent accent from the Button primitive; give it an explicit disabled treatment).

**3. PageHeader subtitle wraps to an orphaned line and is the same muted grey as helper text (no type contract, tell #3).**
Desktop: "...how much the crew does on / its own." breaks with "its own." orphaned on line two at ~40% width, leaving a big dead gap to the right. Mobile: "...how much the / crew does on its own." The subtitle is also the same `text-muted` weight/size as every field helper below it, so the page opens on a flat, evenly-weighted note — the H1 "Settings" and its subtitle don't establish a confident STEP-2/STEP-4 contrast.
Fix: constrain the subtitle to a clean measure (`max-w-[480px]`) so it wraps as a deliberate two-line block, not an orphan; and let the H1 carry more authority (InterDisplay-Medium, -0.02em) so the eye steps down. This is **M2** (4-step type contract) at the page level. `page.tsx:79–82` (PageHeader) + the `PageHeader` component's subtitle class.

**4. Blue/violet spatial promise is completely absent (tell #8, violates M6).**
On this page blue appears only as: the active rail tab tint, the avatar-initials chip, and the (broken) save button. Violet appears nowhere — yet the subtitle literally promises "how much the crew does on its own," and tabs 2 (Brand fingerprint glyph) and 4 (Approval preferences = agent autonomy) are agent-domain surfaces. At arm's length this page says nothing about you-vs-agents. The source comment at `page.tsx:30–32` claims violet is used on "Tab 4 identity + Tab 2 glyph," but in the captured Profile view there is zero violet, and the rail icons for those tabs render in plain muted grey (`page.tsx:202` — inactive icons are `text-current opacity-70`, no violet).
Fix: **M6** — give the agent-domain tabs (Approval preferences, Brand fingerprint) a glanceable violet signal in the rail (e.g. a 1px `rgba(110,86,240,0.12)` accent or `--color-agent-tint` ground on the agent group), and ensure the agent-facing tab content (Approval preferences) reads in the violet register. Keep violet off every button. Verify on the actual tab captures (not yet taken).

## P2 — substantive

**5. No Fraunces beat anywhere (tell #6, M5 unaddressed).**
Settings is chrome-heavy, and M5 says Fraunces is for a verdict word, never chrome — so a forced serif here would be wrong. BUT the page has zero editorial warmth to distinguish it from any Bootstrap settings screen. The one legitimate opening: the Profile/identity moment or a confirmation micro-copy could carry a single Fraunces italic word in a sans sentence (e.g. an account-status verdict). Flagging as a deliberate decision to make, not a blind "add serif." If no honest verdict word exists on this page, document that M5 is intentionally N/A for settings — don't leave it ambiguous.
Fix: either place one Fraunces italic beat on a genuine verdict word (account standing / plan name on the Billing tab is the strongest candidate), or record M5-N/A for /settings.

**6. Numbers are not mono (M11). Visible candidates: timezone/region values, and downstream the password-strength % , billing amounts, seat counts.**
Every real value/number must be Geist Mono tabular-nums. The password strength label ("Weak/Fair/Good/Strong") and meter are prose-styled (`ProfileTab.tsx:617–622` uses default font). On the unseen Billing tab, dollar amounts and renewal dates are almost certainly Inter. This is the most consistent thing that separates the build from the dashboard exemplar.
Fix: **M11** — route every figure (strength %, billing $, dates, seat counts, plan limits) through `font-mono tabular-nums`. Audit all 6 tabs.

**7. The save-bar's idle state shows the word "Saved" permanently on a clean form (confusing).**
`ProfileTab.tsx:141–143` renders a quiet "Saved" whenever `state === 'idle' && !isDirty`. On a freshly-loaded form the user has saved nothing — yet the footer asserts "Saved." It reads as a stale/false status. The visible desktop shot shows "Saved" sitting under an empty form.
Fix: idle/clean with no prior save should show either nothing or a neutral "No changes" — reserve "Saved" for the post-save confirmation only (which already auto-fades at `:363`).

**8. Avatar empty state is a bare "?" in a tinted circle (M8 / tell #5 in miniature).**
The `?` glyph (`ProfileTab.tsx:461`) on the blue-tint circle is a placeholder, not a designed empty. It is the bare-centered-icon empty the rubric warns against, just scaled down. For first-run (name empty → "?"), this is the user's first impression of the identity card.
Fix: when no name AND no avatar, show a warm-neutral initials-ready state with a clearer affordance ("Add a photo") rather than a lone question mark; or seed initials from the auth name. **M8** warmth.

**9. One global rhythm — `space-y-6` between the two cards, flat (M12).**
`ProfileTab.tsx:414` wraps both sections in a single `space-y-6`. The rubric calls for varied whitespace by relationship (tight within a cluster, wider between unrelated groups). Profile-identity and Password are different concern-classes and should have a slightly more generous, intentional gap (and a hairline or eyebrow rhythm) rather than one uniform 24px.
Fix: **M12** — vary the inter-section gap; let the eyebrow labels sit on hairlines so the page has editorial cadence.

**10. No visible entrance choreography (tell #7 / M9).**
The content column has `transition-smooth` on tab-switch (`page.tsx:139`) which is good, but there is no evidence of a first-paint fade-up stagger of the cards in priority order. Static screenshots can't prove motion, but the source shows no `[animation:fade-up]` on the SectionCards.
Fix: **M9** — add the priority-ordered ~40ms-stagger fade-up to the section cards on first paint, behind `prefers-reduced-motion`. (Confirm against the dashboard exemplar's keyframe.)

## P3 — nice-to-have

**11. Field-label column is fixed `200px` and the value column then floats far left in a 760px container, leaving a wide dead gutter on the right of inputs.**
Inputs stop at ~760px while the card is full content-width; on desktop the right third of the input row is empty. Reads slightly unbalanced. Consider letting inputs breathe to a more natural max or adding a right-side affordance (e.g. inline validation) so the row isn't lopsided. `ProfileTab.tsx:80` (`sm:grid-cols-[200px_1fr]`).

**12. Tab rail icons are uniform muted grey at one weight — no signature detail (tell #4, M4).**
The rail is correct and clean but generic. The Beamix signature detail (engine micro-sparkline) doesn't belong here, but a small piece of craft — e.g. the active-tab left-border already exists (good); consider a subtle agent-vs-you color cue (ties to finding #4) as the rail's signature rather than all-grey icons.

**13. "Upload" / "Remove" avatar buttons and the per-section save-bar share `size="sm"` outline/ghost styling — fine, but verify hover/focus states render the brand focus ring.** Not captured. `ProfileTab.tsx:465–486`.

## Per-state notes

**Populated desktop (Profile tab):** Clean, professional, correctly structured. Main gaps: uniform card depth (P1-1), broken-looking disabled save button (P1-2), orphaned subtitle with dead right-space (P1-3), permanent "Saved" on a clean form (P2-7), bare "?" avatar (P2-8). The 200px/1fr field grid leaves a wide right gutter (P3-11).

**Populated mobile (Profile tab):** Tab rail collapses to a horizontal icon strip — labels drop to icon-only (`page.tsx:206` hides labels below `sm`), which is acceptable but the strip of 6 unlabeled grey icons + a logout glyph is cryptic for a first-time user; consider showing the active tab's label. The disabled-blue save button bug is more pronounced on the narrow footer. Subtitle wraps three-ish lines. No horizontal scroll observed — layout holds. The bottom-left dark circle is the workspace switcher (real UI), not a dev artifact, and it overlaps the content edge slightly — verify it doesn't occlude the rail's Cancel tab on short viewports.

**Empty / first-run:** NOT captured. The `?` avatar and empty placeholder inputs (`Jane Smith`, `jane@example.com`) suggest first-run will look unfinished without an M8 warm treatment. Open.

**Other 5 tabs (Brand fingerprint / Billing / Approval preferences / Publishing integrations / Cancel):** NOT captured. The violet-promise (P1-4) and mono-numbers (P2-6) verdicts especially need the Billing and Approval-preferences captures to confirm. Open.

**Loading skeleton / save states / hover / focus:** NOT captured. Skeleton exists in source (`page.tsx:220`, `ProfileTab.tsx:198`) and looks reasonable; save-bar states are coded but unverified visually. Open.

# Multi-client switcher — Design v1
Date: 2026-04-28
Designer: Senior Product Designer (cross-surface navigation)
Status: v1 — Yossi-archetype daily-use spec
Register: Admin Utility (clinical, scannable, no Rough.js on chrome)
Tier-gate: Scale tier only (≥2 client workspaces detected)

---

## 1. The page job + Yossi's 5x/day interaction model

This is not a team switcher. Linear's switcher gets opened maybe twice a week. Vercel's gets opened when a developer changes orgs. Beamix's switcher is the **second-most-used interaction in the entire product, after the Approve button in /inbox**. At 12 clients, Yossi opens this thing 30+ times a day and it's the surface where his agency-operator value story collapses or compounds.

The job-to-be-done is fourfold, and the priority order matters:

1. **Re-orient fast** (60% of opens). 9:02am, 12:14pm, 4:30pm — Yossi is mid-routine, sweeping /inbox across all clients. Open switcher → fuzzy-type 4 letters → land in next client's /inbox in <1.5 seconds. The switcher is a keyboard interaction; the dropdown is a fallback.
2. **Triage at-a-glance** (20% of opens). Yossi opens the switcher specifically to *see* which clients have Action-required state without committing to switching. The switcher itself surfaces a tiny dashboard.
3. **Configure per-client state** (15% of opens). Edit Brief, swap white-label color, upload client logo, paste new Twilio number, change agent autonomy preset. This happens once per client per quarter, but it lives nowhere else — the switcher is the per-client config home.
4. **Add a new client** (5% of opens, but constitutional). Yossi signs TechCorp on a Tuesday and onboards them inside the switcher, never leaving the page he was on.

The design implication: this is a **command-driven surface**, not a navigation surface. The closed state is a static identity badge. The open state is a Cmd+K palette by default. The dropdown is a discoverability fallback for the first 3 days, after which Yossi never clicks it again.

I'm designing for the 30-times-a-day Yossi, not the once-a-week Sarah-on-her-own-domain. Sarah never sees this. The switcher only renders when `subscription.tier === 'scale' && active_clients.count >= 2`.

---

## 2. Placement decision

### The candidates

**A. Topbar-only.** Linear's pattern. The switcher lives in the top-left of the topbar, pinned, always visible. Click opens dropdown. Cmd+K opens command palette (separate surface).

**B. Sidebar-only.** Notion's pattern. Workspace switcher sits at the top of a left sidebar, with current client always visible alongside the nav.

**C. Cmd+K-only.** Linear-grade command palette as primary. No persistent UI affordance.

**D. Hybrid: topbar identity + Cmd+K command palette + sidebar context strip.** What Stripe does for sub-accounts.

### The Beamix context

Beamix has **no left sidebar at MVP.** Per HOME design v1 §1, the entire product chrome is a single 56px topbar. Nav lives in the topbar — `Home · Inbox · Scans · Crew · Competitors · Reports · Settings` as horizontal links. Adding a sidebar just to host the switcher would be a regression — the whole point of the Beamix chrome is that the canvas is the page, not a peer of the page.

So sidebar is out. That leaves topbar + Cmd+K.

### My pick: **Topbar identity badge + Cmd+K command palette as primary interaction.**

The topbar gets a new region in the **far left**, sitting where the Beamix sigil currently lives. The sigil moves to the right of the badge, becoming the home/scroll-to-top affordance. The badge is the workspace identity. Click on the badge opens a dropdown (the discoverability fallback). Cmd+K opens the command palette (the muscle-memory primary).

Why this and not Linear's exact pattern: Linear's switcher dropdown has 6 workspaces and never grows. Yossi has 12 today, 25 by Year 2. A dropdown that scrolls is bad UX; a command palette that searches is the right primitive at scale. The dropdown becomes **tutorial UI** — visible for the first week, then displaced by Cmd+K muscle memory.

Keyboard primary: **Cmd+K** (workspace command palette).
Keyboard secondary: **Cmd+1 through Cmd+9** (quick-switch to first 9 pinned clients — Notion convention, Yossi will pin his top 9 most-active).
Keyboard tertiary: **Cmd+Shift+K** (jumps to "All clients" cross-client dashboard view — see §8).

Topbar layout (final):

```
[Workspace badge] · [Beamix sigil] · [Home Inbox Scans Crew Competitors Reports] [Status dot] [Search] [Account avatar]
   ←── 240px ──→     16px           ←── horizontal nav ──→            right cluster
```

Total topbar height stays at 56px. Workspace badge is 240px wide (max). Beamix sigil drops from 24×24 to 20×20 to give the badge primacy — the workspace is the context, not the brand.

---

## 3. Closed state spec

The closed state is the **default chrome** — what Yossi sees 95% of the time when not interacting with the switcher. It must be informative, scannable, and never busy.

**Dimensions:** 240px wide, 40px tall, vertically centered in the 56px topbar.

**Background:** `--color-paper-elev` (#FAFAF7 — the warm-tinted topbar surface).

**Border:** 1px `--color-border` (rgba(10,10,10,0.06)) on the right edge only — separates badge from the Beamix sigil. No left or top/bottom border.

**Border-radius:** none (full-bleed against topbar edges; vertical line on right is the only visual edge).

**Inner padding:** 12px left, 16px right.

**Content (left to right):**

1. **Client mark** (28×28). Either a Rough.js monogram (default) or the client's uploaded logo (when white-label is enabled for that client). Monogram = first 2 letters of client domain in InterDisplay 500, white text on a deterministic-color circle (the `CrewMonogram` primitive from Design System §4.11, but seeded by `client_id`, not `agent_id`). When the client has white-label uploaded, the monogram is replaced by their logo at 28×28, `--radius-sm` (6px).

2. **Two-line stack** (vertical, 4px gap). Top line: client name in 14px Inter 500 `--color-ink`, truncated with ellipsis at 140px. Bottom line: domain in 11px Geist Mono `--color-ink-3`, truncated. Example:

```
TechCorp                       
techcorp.io                    
```

3. **Status indicator** (right-aligned). A 6px dot. Color from the StatusToken palette (Design System §4.1):
   - Green dot (`--color-healthy`) — no /inbox items, no agents Acting
   - Blue dot (`--color-acting`) — 1+ agents currently Acting on this client
   - Amber dot (`--color-needs-you`) — 1+ /inbox items pending review

   Above the dot, in 11px Inter 500 `tnum`: the unread /inbox count (only shown when > 0). Example: `7 ●` in amber.

4. **Chevron** (12×12, `--color-ink-4`). Down-pointing chevron-right rotated 90deg. Indicates click-to-open.

**Typography spec for the badge:**

| Element | Font | Size | Color |
|---|---|---|---|
| Client name | InterDisplay 500 | 14px | `--color-ink` |
| Domain | Geist Mono 400 | 11px | `--color-ink-3` |
| Inbox count | Inter 500 `tnum` | 11px | matches dot color |

**Hover state:** Background shifts to `rgba(10,10,10,0.03)` (`motion/row-hover`, 100ms linear). Chevron darkens to `--color-ink-3`. No border change.

**Active/focused state:** Background `rgba(10,10,10,0.05)`. 1px `--color-border-strong` outline at 2px offset (focus ring, never the brand-blue glow — Admin Utility register).

**Cmd+K hint (first 7 days only):** A 11px Geist Mono `⌘K` chip floats just below the badge, `--color-ink-4`, `rgba(10,10,10,0.04)` background, `--radius-sm`, 4px padding. Disappears after 10 successful Cmd+K opens (tracked in localStorage). This is the only piece of tutorial chrome we ship — Yossi learns Cmd+K once, then it's invisible.

**Reduced motion:** Hover background changes are skipped (instant); focus ring stays.

**RTL behavior:** For Hebrew-locale Yossi, the badge mirrors — mark on right, status dot on left, chevron rotated. Domain stays LTR (URLs are always LTR). Tested at 240px max-width; Hebrew client names trim cleanly.

---

## 4. Open state spec — the command palette

The primary open state is a **command palette**, opened via Cmd+K or by clicking the closed badge. Cursor's, GitHub's, and Linear's command palettes are the references — the difference is Beamix's palette is **workspace-scoped**, not action-scoped. Cmd+P (action-scoped global palette) is a separate surface, deferred to MVP-1.5.

### Layout

**Pattern:** Centered modal, not anchored dropdown. Anchored dropdowns are fine at 6 workspaces; at 25 clients with search + recents + dashboard tabs, the palette needs canvas. The modal pattern also makes the surface focusable on mobile (see §10).

**Dimensions:** 640px wide, max-height 540px (60% viewport on standard laptop). Centered horizontally at viewport-x 50%. Vertically positioned at viewport-y 18% (top-anchored, not center — so the search field sits in Yossi's natural eye-level zone, not lower-third).

**Background:** `--color-paper` (#FFFFFF). NOT cream — this is Admin Utility register, the cream is reserved for editorial artifacts.

**Border:** 1px `--color-border-strong` (rgba(10,10,10,0.12)).

**Border-radius:** `--radius-card` (12px).

**Shadow:** `--shadow-lg` (the Stripe-style elevated dialog shadow).

**Backdrop:** 60% opacity black scrim, blur 4px (subtle, not Apple-overdone).

**Open animation:** Backdrop fades in 120ms ease-out. Modal scales from 0.96 → 1.0 over 180ms with `cubic-bezier(0.32, 0.72, 0, 1)` (the `motion/modal-enter` curve). No bounce, no slide. Reduced-motion: instant.

**Close behaviors:** Esc key, click backdrop, click any client row (commits switch). On commit, modal closes 120ms before the route change starts so Yossi sees the chrome stabilize, then the page swaps.

### Sections (top to bottom)

```
┌─────────────────────────────────────────────────────────────┐
│  [🔍] Switch client or search...                       ⌘K   │  ← Search bar (56px)
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PINNED                                            ⌘1 – ⌘9  │  ← Section heading
│  ●  TechCorp        techcorp.io           Healthy       7 → │
│  ●  Vinotek         vinotek.co.il         Acting       12 → │
│  ●  Halevi Plumbing halevi.co.il          Needs you    14 → │
│                                                              │
│  RECENT                                                      │
│  ●  Acme Co         acmeco.com            Healthy       0 → │
│  ●  ...                                                      │
│                                                              │
│  ALL CLIENTS (12)                                            │
│  ●  ...                                                      │
│  ●  ...                                                      │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  [+ Add client]              [⊞ All clients view ⌘⇧K]       │  ← Footer (52px)
└─────────────────────────────────────────────────────────────┘
```

### Search bar

- Height: 56px.
- Inner padding: 20px left/right.
- Icon: 16px magnifying glass, `--color-ink-3`, 12px gap to input.
- Input: 16px Inter 400 `--color-ink`, no border, no background. Placeholder: `--color-ink-4` "Switch client or search..."
- Right side: 11px Geist Mono `⌘K` chip in `--color-ink-4` on `rgba(10,10,10,0.04)` background, dismissed on focus.
- Search matches against: client name (fuzzy), domain (substring), vertical tag (exact), Brief headline (substring). Match scoring: name × 4, domain × 2, vertical × 1, Brief × 1.
- Highlighted match characters render in `--color-ink` (vs ink-3 for non-match) — same pattern as Linear.

### Section headings

- 11px Inter 500 uppercase, 0.06em letter-spacing, `--color-ink-4`.
- 12px top padding, 4px bottom padding.
- Right-aligned hint chips for keyboard shortcuts in matching Geist Mono 11px (e.g., `⌘1 – ⌘9` next to PINNED).

### Section logic

- **PINNED** appears only if Yossi has manually pinned clients (right-click row → Pin). Max 9 pins (Cmd+1–9). If no pins, section is hidden.
- **RECENT** shows last 5 switched-to clients (rolling 7-day window, persisted in user_profiles.recent_clients jsonb). Excludes the currently-active client. Hidden if empty.
- **ALL CLIENTS (n)** shows full sorted list (alphabetical by client name, locale-aware).
- When a search query is entered, sections collapse to a single ranked list.

### Scroll behavior

The modal body is the only scrolling region. Search bar and footer are sticky. Scrollbar: 4px wide, `--color-ink-4` thumb on `--color-paper-elev` track, only visible on hover (overlay style). Inertia scroll on macOS, smooth-scroll on other platforms.

### Footer

- Height: 52px.
- Background: `--color-paper-elev` (subtly darker than modal body — same trick Stripe uses to delineate footer actions).
- Border-top: 1px `--color-border`.
- Left action: `+ Add client` — 14px Inter 500 `--color-brand-text`, 16px left padding. Plus icon 14px before text. Click = "add new client" flow (§6).
- Right action: `⊞ All clients view` with `⌘⇧K` chip — 14px Inter 400 `--color-ink-2`. Click = open cross-client dashboard (§8).

---

## 5. Per-client row spec

The single most important pixel-precise spec in this document. Yossi looks at this row 30 times a day. If it carries one extra glance per row, that's 30 lost seconds per day, 3 hours per quarter.

**Dimensions:** 56px height, 12px vertical padding, 16px horizontal padding. Full modal width minus scrollbar (~624px usable).

**Layout (left to right):**

```
●   [Logo]  Client name                    Status pill         12  →
6px  28×28  14px Inter 500                 11px text           tnum chevron
            domain · vertical 11px Geist
            mono ink-3
```

### Components per row

1. **Status dot** (6px, leftmost). Same color logic as the closed badge — `healthy` / `acting` / `needs-you`. 16px right gap.

2. **Client mark** (28×28). Logo when white-label enabled, monogram otherwise. 12px right gap.

3. **Two-line identity stack** (max-width 280px, truncated):
   - Top: client name. 14px Inter 500 `--color-ink`. `cv11, ss03` features.
   - Bottom: `domain.com · vertical` (e.g., `techcorp.io · b2b-saas`). 11px Geist Mono `--color-ink-3`. The vertical tag uses the deterministic vertical taxonomy from PRD F8 (saas, ecomm, local-services, prosumer, enterprise, content).

4. **Activity hint** (right-of-stack, 12px gap, optional). One of:
   - Acting: `2 agents working` in 11px Inter 400 `--color-brand-text`. Shows when status === 'acting'.
   - Last activity: `3h ago` in 11px Geist Mono `--color-ink-4`. Shows when status === 'healthy' (and last activity exists within 48h; otherwise omitted).
   - Score delta: `↑ 4 today` in 11px `tnum`, color from semantic score palette. Shows when status === 'healthy' AND a delta moved >2 today.
   - Override priority: needs-you > acting > delta > last-activity. Only one shows.

5. **Inbox count badge** (right cluster, before chevron). When count > 0: text in 11px Inter 500 `tnum`, color matches status dot. 8px right gap. When count === 0: hidden.

6. **Chevron** (12×12, `--color-ink-4`, rightmost). Right-pointing chevron. Constant — the row is always actionable. Not an indicator of "has children."

### Hover state

- Background: `rgba(10,10,10,0.03)` (the `motion/row-hover` token).
- Mark scales 1.0 → 1.04 over 100ms (`motion/mark-hover`). Subtle, only on the logo/monogram.
- Status pill brightens (background opacity 0.08 → 0.12).
- Chevron darkens to `--color-ink-3`.
- Reveals **right-edge action cluster** (visible only on hover, 80ms fade): `Pin` / `Configure` / `Open in new tab` icons, each 14px, `--color-ink-3`, 12px gaps. Right-click also surfaces these as a context menu (so keyboard-driven Yossi never needs to mouse-hover).

### Selected state (current active client)

A current-client row appears in the list with:
- Left edge: 2px `--color-brand` inset border (matching the TableRow primitive, Design System §4.5).
- Background: `--color-brand-soft`.
- Trailing badge: `Current` in 11px Inter 500 `--color-brand-text`, replacing the chevron.
- The current client appears **at the top of the list** when the palette opens (not in PINNED, not in RECENT — its own one-row "CURRENT" section above PINNED, hidden visually with no section header but with a 12px bottom padding that creates the same separation).

### Keyboard navigation

- J / K (or ↓ / ↑) move row selection. Selection is rendered as `rgba(10,10,10,0.05)` background + 2px `--color-brand` left border, identical to selected state.
- Return / Enter commits the switch.
- Cmd+Enter opens the client in a new tab (browser tab — not a Beamix-internal tab system).
- Right arrow (when row selected) opens the per-client config panel in-modal (slides in from right, see §7).
- Cmd+P (when row selected) toggles pin/unpin.

### Mobile row treatment

See §10. Truncation pattern shifts; activity hint drops; status dot enlarges to 8px.

---

## 6. Add new client flow

This is where I resolve the **constitutional tension** the audit surfaced.

### The tension

- **Onboarding spec §4.4:** Subsequent clients onboard with abbreviated 2-step flow (Step 1 + Step 4 only — domain + Truth File). Skips Brief and Lead Attribution.
- **BOARD-customer-voice + Yossi simulator:** "The Brief is constitutional. Every client must get a Brief. It's how I document what each client is paying me to do."
- **Audit:** Marks this as a "load-bearing contradiction."

### My resolution

**Every client gets the full 4-step onboarding ceremony.** The "abbreviated 2-step" model is wrong for Yossi and will be cut from the spec. Yossi explicitly endorses this in his simulator round: *"DO NOT shortcut my onboarding. Each client = full Brief, full Truth File, full Lead Attribution."* The 4-minute-per-client cost is acceptable; the Brief-as-constitutional-act is non-negotiable.

The compromise: **Brief generation is faster on subsequent clients.** Beamix has Yossi's voice fingerprint from client 1. The Brief proposed for client 7 inherits Yossi's voice patterns (he tends to push for X, avoid Y, sign with Z) so the propose-and-edit cycle is faster. The ceremony stays; the friction drops.

### The flow

When Yossi clicks `+ Add client` in the palette footer:

1. **Modal transitions** (240ms). The command palette modal slides up and fades to 0 (translate-y -16px, opacity 1 → 0). A new modal slides in from below (translate-y +16px → 0). Total: 240ms in/out crossfade. Reduced-motion: instant swap.

2. **Onboarding mini-flow**. A 720px-wide modal (slightly wider than the palette) appears with the standard 4-step onboarding:
   - Step 1: Domain (28-second median).
   - Step 2: Lead Attribution (30s — vertical-aware per BOARD synthesis §2.3).
   - Step 3: Brief (90s — voice-fingerprint-accelerated for subsequent clients).
   - Step 4: Truth File (90s — with "Clone from [other client]" affordance for clients in the same vertical).

   This modal uses the **Editorial Artifact** register on Step 3 (cream paper, Fraunces) — the Brief ceremony is preserved even inside the switcher context. Steps 1, 2, 4 use Admin Utility register.

3. **Post-completion**. On approval of Step 3 (Brief signed), the modal triggers the same Seal-draws animation from primary onboarding. After Step 4 saves, the new client becomes the active workspace, the onboarding modal closes, and the user lands on `/home` with the brand-new score in `acting` state. The switcher's closed badge updates to reflect the new client.

4. **Cancel mid-flow**. Esc or click-backdrop saves draft state. The next time Yossi opens the switcher, a "Continue setting up [client]" row appears at the top of the list with a yellow-amber dot and `Resume →` action.

**One affordance for clones**: in Step 4 (Truth File), a 13px Inter 400 link in the form header: `Clone from another client →`. Opens an inline picker showing Yossi's existing clients of the same vertical. Picking one pre-fills the Truth File fields; Yossi edits and approves. This is the answer to Yossi's "12 Truth Files = 108 minutes" complaint, without compromising the per-client Truth File requirement.

### Add-via-CSV (deferred)

Bulk CSV import is **MVP-1.5**. Yossi explicitly endorsed the per-client onboarding ceremony, and CSV import would tempt him to skip the Brief-signing moment. We ship a "Migrate from competitor X" assisted-import flow in MVP-1.5 once we know which competitors customers come from.

---

## 7. Per-client config (the deep state)

This is the white-label home. Per BOARD synthesis §2.1: white-label is per-client, not per-account. The config lives **inside the switcher**, not in /settings.

### How the user gets here

Three paths:

1. **Hover row → Configure icon click** in the palette.
2. **Right arrow on selected row** in the palette.
3. **From the per-client active state**, top-right of the closed badge gets a `⚙` icon when hovered, click opens config for current client.

In all three paths, the destination is the same: the **per-client config slide-over**.

### Layout

The config is **not a separate route**. It's a slide-over panel that overlays the switcher modal. 480px wide, full-modal-height, slides in from the right edge of the palette modal (translate-x +480px → 0, 240ms `motion/drawer-enter`). Backdrop dims by 8% additional opacity (so the search/list is still partially visible — keeps Yossi grounded in "I'm configuring this specific client").

**Structure:**

```
┌───────────────────────────────────────────────────────────┐
│  ← Back   TechCorp                                    ✕  │  ← Header (56px)
│           techcorp.io · b2b-saas                          │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  TABS: Brief · Truth File · White-label · Lead Attr.      │
│        Scheduling · Agent Autonomy                        │
│                                                           │
│  [Active tab content]                                     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Header** (56px): Back button (12px chevron-left + "Back" 13px Inter 400 `--color-ink-3`) on left. Centered: client name (16px Inter 500) and metadata (11px Geist Mono `--color-ink-3`). Right: close X (14px, `--color-ink-3`).

**Tab bar** (44px, sticky below header): Six tabs as horizontal text-only nav. 13px Inter 500. Active tab: `--color-ink` + 2px `--color-brand` bottom border. Inactive: `--color-ink-3`. Tab order matters — Brief first because it's the constitutional artifact.

**Tab content area:** Scrollable, 24px padding all sides.

### Tab 1 — Brief

Renders the per-client Brief in the Editorial Artifact register: cream paper background (`--color-paper-cream`), Fraunces 300 for body, Inter 500 for chip labels. Inline-editable. Version history sidebar collapsed by default (chevron expands to show last 10 versions, each linkable). This is the only tab that breaks the Admin Utility register — because the Brief itself is constitutional.

Why this matters for Yossi: Brief edits are how he tunes per-client voice when an agent's output drifts. He'll edit Briefs more often than he expects (Yossi sim: "I edit two chips because TechCorp's positioning is observability-specific"). Editing in-place inside the switcher means he never breaks his /inbox sweep flow.

Build cost: medium. Reuses the Brief component from onboarding Step 3.

### Tab 2 — Truth File

Field-by-field editor. Standard form grammar (Stripe-replica per Design System Register 4). Each field has a Margin mark showing which agent last consulted it (Design System §2.4 — the Margin travels here). The mark is small Rough.js (12px circle) in the agent's color, tooltipped with timestamp.

Section: vertical-specific extensions. If client.vertical === 'b2b-saas', show ICP, integrations, ARR-bracket fields. If 'ecomm', show product categories, AOV, return policy, etc.

Footer action: `Clone Truth File from another client →` opens the same picker as in onboarding §6.

Build cost: low. Reuses Truth File form from onboarding Step 4.

### Tab 3 — White-label

The keystone tab. Three sub-sections:

**3.1 — Agency identity** (the section that's the same across all of Yossi's clients):
- Agency name field (32px input, Inter 500).
- Agency wordmark upload (PNG/SVG, 200KB max). Drop zone with cream paper preview.
- Agency primary color (color picker, defaults to client's brand color).
- Agency signature line (single line input, Fraunces preview, e.g., `— Yossi @ Refresh Studio`).

**3.2 — Per-client overrides:**
- Client logo upload (overrides agency wordmark on this client's artifacts only — for Vinotek where the client wants their own brand front-and-center).
- Client primary color override (e.g., Halevi orange #F97316 even though Yossi's agency color is blue).
- "Powered by Beamix" footer toggle (on/off). When off, an info chip appears: `Disabling the Beamix footer is a Scale-tier exclusive. Tier-gate copy.`

**3.3 — Voice override:**
- Per-client signature override field (optional). When filled, this signature replaces the agency-default signature on this client's outputs only.
- Per-client tone presets (dropdown): "Inherit from agency" (default) / "Custom for this client" (opens textarea).

**Live preview pane** (right column, 40% of tab width): renders a mini-thumbnail of the white-labeled Monthly Update PDF (160×220px, cream paper, the actual artifact). Updates in real-time as Yossi edits. The thumbnail uses **the actual Monthly Update component at 0.2× scale** — not a mock. Per the §14 white-label preview treatment.

Build cost: high. This is the most-engineered tab. Per-client asset storage (Supabase storage), per-client renderer overrides in the artifact pipeline, real-time preview rendering. ~10 days of build.

### Tab 4 — Lead Attribution

For the client's vertical:
- B2B SaaS: UTM tag config + GA/Plausible integration. Show the existing UTM tags as a Geist Mono table.
- E-commerce / local: Twilio number assignment, call routing, transcript settings.
- Hybrid clients: both.

Critical: Yossi's developer-friendly affordance per Yossi sim §1: **"Send setup instructions to your developer"** button per client. Generates a one-time email template with the UTM tag (or Twilio config) and a plain-language explanation, copies to clipboard, ready to paste.

Build cost: medium.

### Tab 5 — Scheduling

Per-client schedule overrides:
- Scan frequency: inherited from tier (e.g., daily on Scale) but client-overridable (Yossi might want TechCorp scanned hourly during a launch week).
- Monthly Update send day: 1st of month default; per-client override.
- Daily digest send time: 9am default; per-client override (Vinotek's owner is in different timezone).
- Weekly digest day: Monday default; per-client override.

UI: timeline view (Stripe-replica per Design System Register 4 §6.4). Inline schedule-timeline showing next 5 runs, brand-blue dot for today, Geist Mono dates.

Build cost: low. Existing scheduling primitives already support overrides.

### Tab 6 — Agent Autonomy

The 18 agents listed. Each has a 3-state autonomy slider per CREW §3.5:
- **Always ask** (every output goes to /inbox)
- **Ask if low confidence** (default; only flagged outputs go to /inbox)
- **Auto-approve** (Yossi's "I trust auto-output for Halevi Plumbing")

Plus: **Apply preset** dropdown at top of tab. Presets per CREW §7.4: "Conservative startup," "Aggressive e-commerce," "White-glove hand-holding." Apply preset = bulk-update all 18 agents on this client. Diff modal confirms before save.

Build cost: medium. Per-client agent-config table already exists; this is the UI.

---

## 8. Cross-client view

Yossi simulator's hardest-stated gap: *"GIVE ME A MULTI-CLIENT CREW DASHBOARD. One row per client × 18 columns of agent state. Color-coded. I scan it in 10 seconds. Right now I'm clicking 12 times to do that work."*

This is **MVP**, not MVP-1.5. The whole Scale value story collapses without it.

### Surface

A new route: `/all-clients`. Reachable via:
- `Cmd+Shift+K` (the keyboard primary)
- Footer button in the command palette: `⊞ All clients view`
- Direct URL

Tier-gated to Scale + has ≥2 clients.

### Layout

Full-bleed under the standard 56px topbar. The topbar's workspace badge changes state when on this route — instead of a single client, the badge displays:

```
[grid-icon]  All clients         12 active     ▾
```

The grid-icon is a 4-square `⊞` mark. Counter shows total active clients. Click still opens the palette.

### The grid

A dense table:
- Rows: clients (sorted by status priority — needs-you first, then acting, then alpha).
- Columns: client name + 18 agent-state cells + 4 summary columns (score, delta, /inbox count, last activity).

Each agent-state cell is a 28×28 square. Color-coded:
- White (`--color-paper`) — agent idle, no work this week.
- Brand soft (`--color-brand-soft`) — agent acting.
- Healthy (`#10B981` at 20% opacity) — agent ran successfully this week.
- Amber (`--color-needs-you` at 20% opacity) — output pending review in /inbox.
- Red (`--color-score-critical` at 20% opacity) — agent in error state.

Cell hover: shows `[agent-name] · [last-action] · [time]` tooltip.

Cell click: deep-link to `/[client]/crew/[agent]`.

Row click: switches workspace to that client and lands on /home.

### Filter bar (sticky top of /all-clients)

- Vertical filter (chip group): All · B2B SaaS · E-commerce · Local services · Other
- Status filter: All · Needs you · Acting · Healthy · Idle
- Search field (matches client name/domain).
- Pinned-only toggle.
- Sort: Status · Score · Delta · Last activity · Name.

### Use cases this serves

1. **Morning triage at a glance.** Yossi's daily 9am question: "which of my 12 clients have unread /inbox items?" — answered in 1 second by scanning the inbox-count column.
2. **Cross-client ERROR state detection.** "Which agents are red across my whole portfolio?" — scan red cells, click to debug.
3. **Quarterly reporting prep.** "Which clients had score drops this week?" — sort by delta, screenshot for an internal review.
4. **Bulk operations target list.** Cross-client bulk actions (MVP-1.5) launch from this view (see §9).

Build cost: medium-high. Most of the data already aggregates server-side; the dense table + cell-level tooltips + state-change subscriptions cost ~7 days.

---

## 9. Bulk operations + cross-client deferral

### Single-client bulk-approve (MVP)

Per BOARD synthesis §2.2 lock: shift-click multi-select + Cmd+A in single-client /inbox. This lives in the /inbox surface, not the switcher. The switcher's job is to **signal the existence of bulk-approve** so Yossi knows it's there.

How the switcher signals: client rows with /inbox count > 5 show a small `Cmd+A` chip next to the count. 11px Geist Mono `--color-ink-4`, `rgba(10,10,10,0.04)` background. Tooltip on hover: `Open /inbox to bulk-approve all 14 items`.

### Cross-client bulk-approve (MVP-1.5)

The deferred capability: Yossi selects 5 clients in /all-clients, clicks `Bulk-approve safe items`, and validator-passing items across all 5 clients commit at once.

**How we communicate this in MVP UI:**

In `/all-clients`, after row selection (Cmd-click multi-select), an action bar appears at the bottom of the viewport:

```
3 clients selected   |   Cross-client bulk-approve coming MVP-1.5  |  [Switch to first selected →]
```

The disabled action is **visible** so Yossi sees the future is committed. The footer text is in `--color-ink-3` 13px Inter 400. The "Switch to first selected" link is the immediate workaround — go through the clients sequentially using the existing single-client bulk-approve.

This is honest UI. We don't hide deferred features — we show them as roadmapped, and we provide the workaround inline.

---

## 10. Mobile (375px) treatment

Yossi mobile use case (per Yossi sim): **morning triage from his phone over coffee, before opening laptop.** Glance at status, approve safe items, switch contexts. Not configure white-label — that's laptop-only.

### Mobile closed state

The topbar shrinks to 48px. The workspace badge takes the full width minus 48px on each side (for hamburger left + account avatar right):

```
[≡]  TechCorp                 ●  [user]
       techcorp.io   7 amber
```

The two-line stack collapses to single-line + secondary line below. Status dot enlarges to 8px (touch-friendly visual weight). Tap target = entire badge area.

### Mobile open state

**Full-screen takeover**, not modal. The palette becomes the entire screen:

```
┌───────────────────────────────────────┐
│  ← Search clients...               ✕ │  ← Top bar 56px
├───────────────────────────────────────┤
│                                       │
│  PINNED                               │
│  ●  TechCorp · 7 amber                │
│  ●  Vinotek · 12 acting               │
│                                       │
│  RECENT                               │
│  ●  ...                               │
│                                       │
│  ALL (12)                             │
│  ●  ...                               │
│                                       │
├───────────────────────────────────────┤
│  [+ Add]              [⊞ All view]    │
└───────────────────────────────────────┘
```

Per-row layout simplifies: status dot + mark + single-line client name + status text. Domain drops below into 11px ink-3 second line. Activity hint drops entirely (mobile triage is binary — needs-you or doesn't).

Touch target per row: 64px (Apple/Google guideline 44pt + breathing room).

### Mobile per-client config

Tabs scroll horizontally (snap-to-card). Each tab content area scrolls vertically. White-label tab on mobile has degraded fidelity — the live-preview pane drops below the form (vertical stack instead of side-by-side). Editing logo on mobile feels wrong; we surface a one-line nudge: `Logo upload best on desktop →`. We don't block it, just inform.

### Mobile cross-client view

`/all-clients` on mobile is **list-grid hybrid**. Default to a vertical list (one client per row, with score + inbox count + status pill). Toggle to grid view (each cell = client mark + status dot + score, 3 columns) for visual scanning. The 18-agent column dimension doesn't exist on mobile — desktop-only.

---

## 11. Switching latency budget + lazy-load strategy

Architect spec: switching client should re-render /home, /inbox, /scans within 1 second. The switcher must feel instant — sub-300ms perceived response.

### Latency targets (perceived)

| Phase | Target | Tolerance |
|---|---|---|
| Cmd+K → palette visible | <80ms | 120ms |
| Search input → filtered results | <40ms | 80ms |
| Row click → modal close + route start | <120ms | 200ms |
| Route start → new page TTFB | <300ms | 500ms |
| TTFB → first meaningful paint of new client's data | <600ms | 1000ms |
| **Total: Cmd+K → seeing new client's /home** | **<1100ms** | **1800ms** |

### What's loaded eagerly (kept in memory)

- All client metadata (id, name, domain, vertical, score, last activity, inbox count, status). One row per client × ~80 bytes = 12 clients × 80 bytes = 960 bytes. Trivial.
- Pinned client real-time subscriptions (Supabase realtime channels on `clients.score_changes` + `inbox_items.count` + `agent_jobs.status` for pinned clients only).
- Currently-active client's full data (already loaded).

### What's lazy-loaded

- **Non-pinned clients' real-time data.** When palette opens, fire a single batch query for all non-pinned clients. Cached for 60s.
- **Per-client config tab data.** Loaded on tab activation only (not when palette opens, not when row hovered).
- **White-label preview thumbnail.** Deferred until White-label tab activates. Renders client-side from cached artifact data.

### What's pre-warmed on switch

- The target client's core data (score, ring data, decision card, top 5 inbox items) is pre-fetched in the **80ms between row hover and click**. This is the trick that makes switches feel instant. Hover triggers a low-priority prefetch on `/api/client/[id]/preload`. The endpoint returns the SSR-shape data needed for /home's first paint. By the time the click commits, the data is in the cache.

  Risk: Yossi hovers 12 rows scanning the list. We'd prefetch 12 clients × 50KB = 600KB of waste. Mitigation: prefetch fires on **300ms hover dwell time**, not immediately. Yossi scanning at <300ms/row pays no prefetch cost. Yossi pausing on a row pays the prefetch.

### The ring redraws

When the page swaps post-switch, the new client's ring redraws using the same `motion/ring-draw` animation as initial /home load (1.6s orchestration per HOME design v1 §3.2). Yossi sees the score number tick in, ring draw fill in, decision card slide in. Reduced motion: instant render of final state.

Some ambient motion (topbar status dot pulse) keeps running through the switch — never stops. This is the visual rhyme: the brand stays present, the data swaps.

---

## 12. Empty state design

Yossi just bought Scale. Onboarded his own agency domain. Has 1 active client (himself), no others.

### What the switcher shows in the 1-client state

The switcher **does not render** when `active_clients.count < 2`. The topbar at 1 client looks identical to Sarah's topbar — workspace badge shows the single client name, no chevron, no Cmd+K hint. This is intentional. We don't surface multi-client UI to a single-client user.

### What the switcher shows when Yossi adds his second client

The first time `active_clients.count` transitions from 1 to 2, a one-time **discoverability moment** fires:

1. The switcher chevron + the Cmd+K hint chip appear with a 240ms slide-in.
2. A small toast (top-right of viewport, below topbar) reads: `You can switch between your 2 workspaces with ⌘K or by clicking your workspace name.` 13px Inter 400, `--color-paper-elev` background, `--color-border-strong` 1px border, `--shadow-md`. Auto-dismisses in 6s. Geist Mono `⌘K` chip inline.

That's the entire empty-state design. We don't do a tutorial overlay. We don't do an empty-list "Add your first client →" at 0 clients (impossible state — Yossi has at minimum his own onboarded domain).

### The 2-client palette state

When the palette opens with only 2 clients, sections collapse:
- No PINNED section (can't pin only one besides current).
- No RECENT (only one option).
- ALL CLIENTS shows the one non-active client.
- Footer's `+ Add client` is still present and prominent.

A 13px Inter 400 line above the list reads: `You'll see pinned and recent clients here as you switch.` `--color-ink-4`. This is the only non-data instructional copy in the entire switcher surface.

---

## 13. Search + keyboard navigation

### Search behavior

Fuzzy match against four fields, weighted in this order:
1. Client name (weight 4) — `tech` matches `TechCorp`, `Tech Industries`.
2. Domain (weight 2) — `corp.io` matches `techcorp.io`.
3. Vertical tag (weight 1) — `saas` shows all B2B SaaS clients.
4. Brief headline (weight 1) — `developer tooling` matches TechCorp's Brief.

Implementation: Fuse.js or a hand-rolled Levenshtein-with-substring fallback. 12 clients × ~200 chars indexed = sub-1ms search. No backend round-trip needed.

Highlight match characters in the rendered row using `<mark>` semantics — match chars in `--color-ink`, non-match chars in `--color-ink-3`. No yellow highlight; that's a Google search artifact, not a Beamix move.

Empty-result state: shows `No clients match "[query]"` in 13px Inter 400 `--color-ink-3`. Below it, two suggested actions: `+ Create a new client` and `Search across all your scans for "[query]"` (the second action is a Cmd+P stub for future global search).

### Keyboard nav full table

| Key | Action |
|---|---|
| `Cmd+K` | Open palette |
| `Cmd+Shift+K` | Open `/all-clients` view |
| `Cmd+1` – `Cmd+9` | Quick-switch to pinned client at position 1–9 |
| `Esc` | Close palette (or close per-client config panel) |
| `↑` / `↓` (or `k` / `j`) | Navigate rows |
| `Return` / `Enter` | Switch to selected client |
| `Cmd+Return` | Open selected client in new browser tab |
| `→` (right arrow on selected row) | Open per-client config panel |
| `←` (in config panel) | Back to client list |
| `Cmd+P` (when row selected) | Toggle pin/unpin |
| `Tab` | Move focus to footer actions (Add client, All view) |

The J/K convention is borrowed from Vim and matches Linear's keyboard model — Yossi will already know it.

### Screen reader treatment

Palette is `role="dialog"` with `aria-modal="true"` and `aria-label="Client switcher"`. Search input is `role="searchbox"` with `aria-controls="client-results"`. Each row is `role="option"` inside `role="listbox"`. Active row gets `aria-selected="true"`. Row content reads as `<mark>Tech</mark>Corp, b2b-saas, healthy, 7 inbox items` — the SR user gets the same status info as the visual user.

---

## 14. White-label preview treatment

When a client has white-label enabled (logo + agency name configured), the switcher shows that client's white-label artifact in three places:

### 14.1 — In the closed badge

The 28×28 mark slot displays the client's uploaded logo, NOT the deterministic monogram. `--radius-sm` (6px). Above the logo, in the agency primary color, a 2px dot. Tooltip on hover: `White-label: agency-branded`.

This is the constant visual reminder that this client has its own branding pipeline. Yossi looks at the topbar and knows he's "in" a white-labeled context.

### 14.2 — In the palette row

Same logo treatment for the row's mark slot. Plus, a 11px Inter 500 chip on the right side of the row (between activity hint and chevron): `Branded` in `--color-brand-text`, `--color-brand-soft` background, `--radius-sm`. Indicates "this client's outputs render with custom branding."

### 14.3 — In the per-client config White-label tab

Live preview pane at 0.2× scale of the actual Monthly Update PDF. As Yossi edits color/logo/signature, the preview updates within 100ms. The preview renders the **real** Monthly Update component with mock data for the current client (last month's actual numbers, but no PII), so what Yossi sees is what the client receives.

Implementation: the Monthly Update React component takes a `whiteLabel` prop. For preview, we pass a draft `whiteLabel` config. For production sends, we pass the saved config. Same component, two render contexts. No second renderer to maintain.

### 14.4 — In `/all-clients` view

The mark column shows white-labeled logos for white-label-enabled clients. A small `B` chip (11px, monospace) overlays the bottom-right corner of the mark for white-label clients — visual signal Yossi can scan to "which clients are white-labeled at all" without opening config.

---

## 15. Implementation notes

### React state shape

```typescript
type ClientSummary = {
  id: string;
  name: string;
  domain: string;
  vertical: 'b2b-saas' | 'ecomm' | 'local-services' | 'prosumer' | 'enterprise' | 'content';
  score: number;
  delta_24h: number;
  status: 'healthy' | 'acting' | 'needs-you';
  inbox_count: number;
  last_activity_at: string;  // ISO
  pinned: boolean;
  pin_position: number | null;  // 1-9
  white_label_enabled: boolean;
  white_label_logo_url: string | null;
};

type SwitcherState = {
  active_client_id: string;
  clients: ClientSummary[];        // all clients, sorted alphabetically
  recent_client_ids: string[];     // last 5 switched-to, persisted
  palette_open: boolean;
  config_panel_open: boolean;
  config_panel_client_id: string | null;
  config_active_tab: 'brief' | 'truth-file' | 'white-label' | 'lead-attr' | 'scheduling' | 'autonomy';
  search_query: string;
  selected_row_index: number;
};
```

### Route structure

The active client lives in URL: `/[clientSlug]/home`, `/[clientSlug]/inbox`, etc. Currently /home is `/home` — this becomes `/[clientSlug]/home` for Scale users with ≥2 clients, redirecting `/home` to `/[active]/home`. For Sarah (single-client users), `/home` stays the canonical route — no slug.

The `/all-clients` route is unscoped (no client slug).

### Real-time channels

- One global subscription per palette-open session: `inbox_counts:user_id={userId}` (lightweight aggregate).
- Pinned clients have persistent subscriptions: `client:{id}:status_change`.
- Currently-active client has full subscription stack (already loaded by /home, /inbox, etc.).
- Non-pinned non-active clients: lazy-loaded on palette open, cached 60s.

### Performance measurements (instrumented)

Every Cmd+K open emits a metric: `switcher.open.latency_ms`. p95 target: <100ms. Every row commit emits: `switcher.switch.total_latency_ms`. p95 target: <1100ms. Below target = degraded perception, kicks an alert.

### Build dependencies

- Fuse.js (search) — 6KB.
- Headless UI dialog/menu primitives (already in stack).
- Supabase realtime (already in stack).
- React Hotkeys library or a hand-rolled `useHotkeys` hook (probably hand-rolled — only ~7 hotkeys, no need for a lib).

### Testing plan

- Unit: search ranking, keyboard nav, pin/unpin, recent rotation.
- Integration: palette → row click → route swap → /home renders.
- E2E (Playwright): full Yossi 9am routine with 12 mock clients — sweep /inbox across all 12 in one test, assert <30s total time.
- A11y: screen reader pass on palette + config panel.
- Performance: Lighthouse run on cold-cache palette open with 25 clients (the high-end Yossi state).

---

## Reference exemplars analyzed

### Linear's workspace switcher

What I took:
- Cmd+K command palette as primary muscle-memory interaction.
- Section grouping (Pinned / Recent / All).
- Search ranking by name+domain weighted.
- J/K keyboard nav inside the palette.
- Highlighted match characters (text color, not background highlight).

What I didn't take:
- Linear's switcher is anchored dropdown, not modal. At Beamix's 25-client scale + per-client config in-modal, an anchored dropdown clips and feels cramped. Centered modal scales better.
- Linear has no per-workspace config-in-switcher. They send users to /settings. Beamix's per-client config is the killer move and lives inline.

### Vercel's team switcher

What I took:
- Logo-as-mark for branded clients (Vercel uses team avatars; we use white-label logos).
- "Recent" rolling window concept.
- Tier-gated affordances rendered as chips.

What I didn't take:
- Vercel's switcher is account-level only — there's no "config in switcher" pattern. Beamix's white-label-per-client demands inline config.
- Vercel's hover state is too visually heavy (full background change + scale). Beamix's Admin Utility register stays calmer.

### Stripe's account switcher (sub-account hierarchy)

What I took:
- The mental model: parent account, child accounts, switching context. Yossi (parent) → 12 clients (children). Each child has its own config that Stripe surfaces via account-context tabs.
- Per-child rendering of preview artifacts (Stripe shows account-level logos in invoice previews; Beamix shows white-label logos in Monthly Update previews).
- The "live preview" pattern in config — Stripe's invoice template editor renders the actual invoice as you edit. Same pattern for our Monthly Update preview.

What I didn't take:
- Stripe's account switcher is a heavy modal with 8 tabs of account-level settings. Yossi doesn't want to be in the switcher for 8 tabs of his agency config — he wants 6 tabs of *this client's* config. Different scope.

### Cmd+K patterns (Linear, Cursor, GitHub)

What I took:
- Modal-anchored at 18% top-of-viewport (not centered), so the search bar is in eye-level zone.
- Backdrop blur (subtle) + scrim (60% opacity).
- Esc to dismiss, click backdrop to dismiss.
- Open animation: 180ms scale + fade. No bounce.

What I didn't take:
- GitHub's Cmd+K is action-scoped (every action in the product). Beamix's Cmd+K is workspace-scoped. We separate the two surfaces — global action palette is Cmd+P, deferred to MVP-1.5.
- Cursor's Cmd+K is heavy on keyboard hints rendered everywhere. We surface keyboard hints in section headers (e.g., `⌘1 – ⌘9` next to PINNED) but not on every row — Yossi will find them through the section headers and Discovery toast.

### Notion's workspace switcher

What I took:
- Cmd+1 through Cmd+9 quick-switch convention.
- Two-line stack (workspace name + URL) in the closed state.
- Pinning with right-click context menu.

What I didn't take:
- Notion's switcher lives in a left sidebar. Beamix has no sidebar. Topbar placement is forced and right.
- Notion's "create a new workspace" link is a one-step modal (just enter a name). Beamix's add-client flow is a full 4-step ceremony. Different product, different ceremony.

---

## End notes

This switcher is the operational core of the $499/mo tier's value story. Without it, Yossi cancels in month 2. With it — and especially with /all-clients for cross-client triage — Yossi's 12-client portfolio scales linearly with Beamix instead of bottlenecking. The single biggest design risk is **the per-client config tab depth**. Six tabs is at the edge of what's defensible; if any tab grows to need more than the 480px slide-over width, we've lost the in-context-config promise. We watch for this in the first 4 weeks of telemetry. If Yossi opens the config panel and clicks back-to-list more than 30% of the time (signaling "I needed something not in this view"), we revisit.

The decision I'm most committed to: the Brief is constitutional, every client gets the full ceremony. The 4 minutes per client is non-negotiable. We compensate with the voice-fingerprint acceleration on subsequent Briefs and the Truth File clone-from affordance — but we don't shortcut the constitutional act.

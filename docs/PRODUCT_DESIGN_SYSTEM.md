# Beamix — Product Design System
*Product dashboard only. Marketing (Framer) is covered in `docs/BRAND_GUIDELINES.md`.*
*Last updated: 2026-03-17. Read before any product design or implementation task.*

---

## 1. Design Tokens — CSS Variables

### Light Mode (`:root`)
```css
--background: #F7F7F7;
--foreground: #0A0A0A;
--card: #FFFFFF;
--card-foreground: #0A0A0A;
--popover: #FFFFFF;
--popover-foreground: #0A0A0A;
--primary: #3370FF;           /* blue — was #141310 */
--primary-foreground: #FFFFFF;
--secondary: #0A0A0A;
--secondary-foreground: #FFFFFF;
--muted: #F5F5F4;
--muted-foreground: #6B7280;
--accent: #3370FF;            /* was cyan #06B6D4 */
--accent-foreground: #FFFFFF;
--border: #E5E7EB;
--input: #E5E7EB;
--ring: #3370FF;
--destructive: #EF4444;
--sidebar-primary: #3370FF;
--sidebar-border: #F3F4F6;

--chart-1: #3370FF;
--chart-2: #10B981;
--chart-3: #06B6D4;
--chart-4: #F59E0B;
--chart-5: #8B5CF6;

--score-critical: #EF4444;
--score-fair: #F59E0B;
--score-good: #10B981;
--score-excellent: #06B6D4;   /* cyan stays for score-excellent only */

--card-radius: 20px;
--shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
```

### Dark Mode (`.dark`)
```css
--background: #0A0A0A;
--foreground: #F7F7F7;
--card: #171717;
--card-foreground: #F7F7F7;
--primary: #3370FF;           /* blue persists in dark */
--muted: #262626;
--muted-foreground: #A3A3A3;
--border: rgba(255,255,255,0.1);
--input: rgba(255,255,255,0.15);
--ring: #3370FF;
--sidebar-primary: #3370FF;
```

### Tailwind Aliases (use in className)
| Token | Tailwind class |
|-------|---------------|
| `--primary` (#3370FF) | `bg-primary`, `text-primary`, `border-primary` |
| `--background` | `bg-background` |
| `--muted` | `bg-muted`, `text-muted-foreground` |
| `--card` | `bg-card` |
| `--border` | `border-border` |
| `--ring` | `ring-ring` (focus) |

---

## 2. Typography

### Fonts in `layout.tsx` — KEEP / REMOVE
- **KEEP:** `Inter` (body + headings), `Fraunces` (serif accent), `Geist Mono` (code/data)
- **REMOVE:** `Outfit`, `Source_Serif_4`, `DM_Serif_Display`, `PT_Sans`, `Plus_Jakarta_Sans`, `Figtree`

### Usage
| Role | Font | Weight | Class |
|------|------|--------|-------|
| Body | Inter | 400 | `font-sans` |
| UI labels, buttons | Inter | 500 | `font-sans font-medium` |
| Headings (h1–h4) | Inter | 500 | `font-sans font-medium` |
| Serif accent (pull quotes, hero) | Fraunces | 300–500 | `font-[var(--font-fraunces)]` |
| Code / data values | Geist Mono | 400 | `font-mono` |

**Breaking change:** Headings switch from Outfit (`font-display`) to Inter (`font-sans`).
Update `globals.css`: change `h1–h6` rule from `var(--font-outfit)` to `var(--font-inter)`.
Update `@theme inline`: change `--font-display: var(--font-inter)`.

---

## 3. Component Patterns

### Buttons
```tsx
// Primary — product utility (dashboard CTAs)
<Button variant="default">  // bg-primary text-primary-foreground → #3370FF
  → rounded-lg (default), px-4 py-2

// Primary pill — marketing-style CTAs inside product (upgrade banners, onboarding)
className="bg-[#3370FF] text-white rounded-full px-6 py-3 font-medium hover:bg-[#e63600]"

// Secondary — dark pill
className="bg-[#0A0A0A] text-white rounded-full px-6 py-3 font-medium"

// Ghost — nav actions, icon triggers
<Button variant="ghost">  // hover:bg-muted hover:text-foreground

// Destructive
<Button variant="destructive">  // bg-destructive text-white

// Focus state (all buttons)
focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2
```

### Cards
```tsx
// Standard card
className="bg-card rounded-[20px] border border-border shadow-sm"

// Interactive card
className="bg-card rounded-[20px] border border-border shadow-sm
           hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"

// Pro plan highlight card
className="bg-gradient-to-br from-[#FFE5DB] to-[#FFF0EB] rounded-[20px] border border-[#FFCFC4]"
```

### Sidebar
```tsx
// Container
className="flex h-screen flex-col border-r border-border bg-white"
// Expanded: w-60 / Collapsed: w-16

// Active nav item
className="bg-[#FFF5F2] text-[#3370FF] font-semibold border-l-2 border-[#3370FF]"
// Was: cyan-50 bg + cyan border

// Inactive nav item
className="text-muted-foreground hover:bg-muted hover:text-foreground"

// Active icon
className="h-4 w-4 shrink-0 text-[#3370FF]"

// Trial banner (sidebar)
className="mx-3 mt-3 rounded-xl bg-gradient-to-r from-[#FFF5F2] to-[#FFF0EB] p-3"
// Was: from-cyan-50 to-blue-50

// Logo accent
<span className="text-[#3370FF]">ix</span>
// Was: text-[var(--color-accent)] (was cyan)
```

### Score Badges (unchanged)
```tsx
const scoreColor = {
  critical:  'bg-red-50   text-[#EF4444]',  // < 40
  fair:      'bg-amber-50 text-[#F59E0B]',  // 40–69
  good:      'bg-green-50 text-[#10B981]',  // 70–89
  excellent: 'bg-cyan-50  text-[#06B6D4]',  // 90–100
}
```

### Charts & Data Viz
- Primary line/bar/progress: `stroke="#3370FF"` / `fill="#3370FF"` (was cyan)
- Progress rings: `stroke="#3370FF"`
- Active calendar date: `bg-[#3370FF] text-white`
- Excellent score ring only: `#06B6D4` (score-excellent exception)

---

## 4. Layout

| Zone | Spec |
|------|------|
| Sidebar expanded | 240px (`w-60`) |
| Sidebar collapsed | 64px (`w-16`) |
| Main content max-width | 1280px (`max-w-7xl mx-auto`) |
| Dashboard section padding | 24px (`p-6`) |
| Card grid gap | 32px (`gap-8`) |
| Mobile sidebar | Overlay (`fixed inset-0 z-50`), full-width drawer |

---

## 5. States

| State | Pattern |
|-------|---------|
| Loading | `animate-pulse bg-muted rounded` skeleton elements |
| Empty | Centered: illustration + `text-lg font-medium` heading + `text-muted-foreground` body + primary CTA |
| Error | Red border `border-destructive`, error message `text-destructive text-sm`, destructive button |
| Success | `text-[#10B981]` checkmark + toast (bottom-right, 3s auto-dismiss) |
| Focus | `focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2` — all interactive elements |
| Disabled | `opacity-50 pointer-events-none` |

---

## 6. Accessibility

- `#3370FF` on white `#FFFFFF`: **4.6:1** — passes AA for large text and UI components (buttons, badges)
- Body text `#0A0A0A` on `#F7F7F7`: **19.6:1** — AAA
- Dark mode body `#F7F7F7` on `#0A0A0A`: **19.6:1** — AAA
- Icon-only buttons: always add `aria-label`
- All inputs: visible `<label>` or `aria-label`
- Sidebar links: `title` attr when collapsed (icon-only state)
- Focus rings: `ring-[#3370FF]` on every interactive element — never remove `outline`

---

## 7. Dark Mode

- Toggle in `/dashboard/settings` → preferences tab
- Implementation: `.dark` class on `<html>` via `next-themes`
- Orange `#3370FF` accent persists unchanged in dark mode
- Borders darken to `rgba(255,255,255,0.1)` — use `border-border` (resolves via CSS var)
- Cards: `#171717` background — never use hardcoded `bg-white` inside dashboard

---

## 8. Migration Checklist

Files requiring token updates (cyan → blue, old primary → new):

- [ ] `saas-platform/src/app/globals.css` — replace all CSS variable values (see Section 1)
- [ ] `saas-platform/src/app/layout.tsx` — remove: `Outfit, Source_Serif_4, DM_Serif_Display, PT_Sans, Plus_Jakarta_Sans, Figtree`; update `<body>` className and `@theme --font-display`
- [ ] `saas-platform/src/components/dashboard/sidebar.tsx` — `from-cyan-50` → `from-[#FFF5F2]`; `text-[var(--color-accent)]` → `text-[#3370FF]`; `border-[var(--color-accent)]` → `border-[#3370FF]`
- [ ] `saas-platform/src/app/dashboard/overview/` — cyan gradient → blue gradient
- [ ] `saas-platform/src/app/dashboard/rankings/` — `cyan-50` → `blue-50` / `[#FFF5F2]`
- [ ] `saas-platform/src/app/dashboard/agents/` — cyan badges → `bg-[#FFF5F2] text-[#3370FF]`
- [ ] `saas-platform/src/app/dashboard/agent/[id]/` — cyan refs → blue
- [ ] `saas-platform/src/app/dashboard/content/` — cyan refs → blue
- [ ] `saas-platform/src/app/pricing/` — accent colors → `#3370FF`
- [ ] Email templates — follow-up task (6 files in `src/emails/`)

**Search pattern to find all remaining cyan refs:**
```bash
grep -r "06B6D4\|cyan-\|color-accent\b\|sidebar-ring.*cyan" saas-platform/src --include="*.tsx" --include="*.css" -l
```

---

## 9. References

- Shared brand identity, voice, image system: `docs/BRAND_GUIDELINES.md`
- DB schema, API contracts: `docs/03-system-design/`
- Component library: Shadcn/UI + Radix UI + Tailwind CSS v4

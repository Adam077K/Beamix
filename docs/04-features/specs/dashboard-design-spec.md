# Dashboard Design Spec — Beamix Product

*Source of truth for dashboard-specific design patterns. For brand tokens, colors, typography, see `docs/BRAND_GUIDELINES.md` and `docs/PRODUCT_DESIGN_SYSTEM.md`.*

*Last updated: 2026-04-06. Read those two documents before this one.*

---

## 1. Layout

| Zone | Spec |
|------|------|
| Sidebar (expanded) | 240px, `bg-white border-r border-border` |
| Sidebar (collapsed) | 64px, icon-only, `title` attr on links |
| Main content | `max-w-7xl mx-auto px-6 py-6` |
| Card grid gap | `gap-6` (24px) |
| Section stack gap | `space-y-6` (24px) |

---

## 2. Sidebar

### Active nav item
```tsx
className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#EFF4FF] text-[#3370FF] font-semibold border-l-2 border-[#3370FF]"
```

### Inactive nav item
```tsx
className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150"
```

### Trial banner (sidebar)
```tsx
className="mx-3 mt-auto mb-3 rounded-xl bg-gradient-to-r from-[#EFF4FF] to-[#DBEAFE] p-3 border border-[#BFDBFE]"
```
Shows days remaining in trial + "Upgrade" CTA button.

### Logo
Blue mark (#3370FF) + "Beamix" wordmark black. File: `public/logo/beamix_logo_blue_Primary.png`.

---

## 3. Score Ring (Visibility Score Card)

- SVG circle, `stroke-width: 8`, `r: 54`, circumference: `339.3px`
- Score fill: `stroke-dashoffset` animated from 0 to `(1 - score/100) * 339.3` over 1200ms `cubic-bezier(0.22, 1, 0.36, 1)`
- Color by score (see score badges in PRODUCT_DESIGN_SYSTEM.md §3)
- Score number: Geist Mono, bold, counts up in sync with ring animation
- Label below: Inter 13px muted-foreground

---

## 4. Recommendation Cards

### Hero recommendation (first, auto-triggered after scan)
```tsx
className="bg-card rounded-[20px] border-l-4 border-[#3370FF] border border-border shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6"
```
- Left accent border: `#3370FF`
- Blue glow on hover: `hover:shadow-[0_8px_24px_rgba(51,112,255,0.12)]`

### High-priority badge
```tsx
className="bg-[#EFF4FF] text-[#3370FF] text-xs font-semibold px-2 py-0.5 rounded-full"
```

### Priority dot (inline)
```tsx
className="h-2 w-2 rounded-full bg-[#3370FF]"
```

---

## 5. Charts & Data Visualization

| Chart element | Color |
|---------------|-------|
| Primary line / bar / area | `#3370FF` |
| Secondary series | `#10B981` |
| Tertiary series | `#F59E0B` |
| Progress ring (score) | Per score level (see §3 above) |
| Score excellent (90–100) | `#06B6D4` (exception — score data only) |
| Recharts Area stroke | `stroke="#3370FF"` |
| Recharts activeDot | `fill: '#3370FF'` |
| Calendar active date | `bg-[#3370FF] text-white` |

Recharts example:
```tsx
<Area
  type="monotone"
  dataKey="score"
  stroke="#3370FF"
  fill="url(#blueGradient)"
  strokeWidth={2}
  dot={false}
  activeDot={{ r: 5, fill: '#3370FF' }}
/>
<defs>
  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="#3370FF" stopOpacity={0.15} />
    <stop offset="95%" stopColor="#3370FF" stopOpacity={0} />
  </linearGradient>
</defs>
```

---

## 6. Empty States

Structure for every empty state:
1. Monochrome icon (Lucide) in `text-muted-foreground`, 48px
2. Heading: `text-lg font-medium text-foreground`
3. Body: `text-sm text-muted-foreground` max 2 lines
4. Single CTA: primary button `bg-primary text-white rounded-lg`

No illustration required for v1. No orange/colored icons.

---

## 7. Dashboard Background

Light subtle blue wash:
```css
.dashboard-bg {
  background-image: radial-gradient(
    ellipse at 50% 0%,
    rgba(51, 112, 255, 0.025) 0%,
    transparent 70%
  );
}
```
Apply to the main content area wrapper, not the sidebar.

---

## 8. Glow Utilities (blue system)

```css
.glow-primary {
  box-shadow: 0 0 20px rgba(51, 112, 255, 0.12);
}
.glow-primary-strong {
  box-shadow: 0 0 32px rgba(51, 112, 255, 0.20);
}
.glow-score-excellent {
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.12);  /* cyan — score only */
}
```

---

## 9. References

- Brand tokens, colors, typography: `docs/BRAND_GUIDELINES.md`
- CSS variables, component patterns, interaction patterns: `docs/PRODUCT_DESIGN_SYSTEM.md`
- DB schema, API contracts: `docs/03-system-design/ARCHITECTURE.md`

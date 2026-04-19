---
date: 2026-04-19
lead: frontend-developer
task: polish-paywall
branch: feat/polish-paywall
worktree: .worktrees/polish-paywall
status: COMPLETE
---

## Task
Polish PaywallModal + TierCard components to match brand spec and product-rethink v2 pricing.

## Files Changed
- `apps/web/src/components/paywall/TierCard.tsx`
- `apps/web/src/components/paywall/PaywallModal.tsx`

## What Was Done

### TierCard
- Badge changed from "Recommended" to "Most popular" (brand-blue pill, centered above highlighted card)
- Differentiated CTAs: "Start Discover" (secondary style) / "Start Build" (primary blue) / "Talk to sales" (dark/black)
- Check icons: blue for highlighted Build card, green (#10B981) for Discover + Scale
- Per-tier loading spinner on CTA button — disabled + Loader2 icon + "Redirecting to checkout..." text
- Feature lists trimmed to 5 items per tier with benefit-oriented copy (not feature-list style)
- Usage chips row (agent runs/mo + AI engines count) with muted chip style
- border-2 ring on highlighted card (was border + ring-2 overlap)
- Card padding accounts for badge offset on highlighted (pt-10)

### PaywallModal
- Enlarged pill switch: h-6 w-11 with proper thumb translation (was tiny h-4 w-8)
- Animated "Save 20%" badge: fades in/out based on annual toggle state
- Trust row replaces single-line footer: three items with inline icons (ShieldCheck, RefreshCw, Ban)
  "14-day money-back guarantee · Cancel anytime · No setup fees"
- Loading state: per-tier (not global banner) — each TierCard receives loading={loadingTier === tier}
- Modal shadow upgraded to brand spec: 0 24px 60px rgba(0,0,0,0.15)
- max-h uses 100dvh for iOS Safari stability
- Explicit role=dialog aria-modal=true (Radix adds these, explicit for belt-and-suspenders)
- Close button aria-label improved to "Close pricing modal"
- Default description when triggerContext is absent

## Pricing (locked — not changed)
Discover $79 / Build $189 / Scale $499 (annual: $63 / $151 / $399)

## Commits
- `polish(paywall): redesign TierCard + PaywallModal to spec`

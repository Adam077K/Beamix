# Build Lead Session — Wave 3 Rebuild Plan
date: 2026-04-20
lead: build-lead
task: wave3-rebuild-plan
status: COMPLETE

## Deliverable
`docs/08-agents_work/rebuild-wave3-rethink/04-REBUILD-PLAN.md`

## Summary
- 5 batches, 11 workers (W0–W10)
- Wave 2 branch disposition: merge-as-is (backend, home-v2, competitors-v2), merge+wire (inbox-workspace-v2), rebase+fix (scans-v2), cherry-pick+resolve-shared.ts (automation-v2)
- Top risks: worker death (mitigated by ≤35 turn budgets), Wave 2 shared.ts conflict (resolve on merge), foundation migration gate before Batch 2, onboarding infinite redirect loop

## Key decisions
- Suggestions table: Option A (separate table), Adam confirm before W0 fires
- Kill switch: automation_settings table (Option B)
- Workspace tier gate: full paywall for Discover (not read-only)
- Preview account: Option C (absence of subscriptions row)
- Merge order: backend → home → inbox-workspace → competitors → scans → automation

---
date: 2026-05-27
agent: backend-engineer-w15
session_slug: w15-domain-verify
status: COMPLETE
qa_verdict: pending (Full tier)
tier: full
branch: feat/w15-domain-verify
parent_session: 2026-05-27-ceo-wave1-closeout.md
---

# Backend Engineer — Wave 1.5 Domain + Business Verification

## Mission
Descoped Wave 1 item 17 from the email worker — build the signup-time verification module (WHOIS + LinkedIn-stub + Supabase email confirm).

## Commits on `feat/w15-domain-verify`
1. `569e961` feat(security): extract isDomainTooNew into shared `apps/web/src/lib/security/whois.ts`
2. `6dce3d8` feat(auth): add LinkedIn business-domain match stub (MVP+90 TODO) at `apps/web/src/lib/auth/linkedin-stub.ts`
3. `6d72f80` feat(auth): add `verifyBusinessDomain` at `apps/web/src/lib/auth/domain-verify.ts` — combines WHOIS + LinkedIn-stub + audit_log entry

## Files shipped
- `apps/web/src/lib/security/whois.ts` — extracted shared WHOIS helper (was inline in scan/free/route.ts; re-used now)
- `apps/web/src/lib/auth/linkedin-stub.ts` — `verifyBusinessLinkedIn()` returns `{verified:true, confidence:'low', source:'stub'}` with `console.warn('LinkedIn verification stub — real impl post-MVP')`
- `apps/web/src/lib/auth/domain-verify.ts` — `verifyBusinessDomain({email, domain})` orchestrates the two checks + writes `audit_log` event

## Engineering notes
- WHOIS provider failure → fail-open with `console.warn` (consistent with Wave 1 free-scan pattern)
- LinkedIn stub returns `confidence: 'low'` so downstream consumers can branch on it; real impl deferred to MVP+90 once first 50 customers exist
- Email confirmation: Supabase Auth handles this natively; no change needed unless current project config has it disabled (verify in Supabase dashboard → Auth → Email Auth → "Confirm email" toggle)
- Signup route: caller integration is a `// TODO: wire to signup route when it ships in Wave 2` marker in the module (Wave 1 doesn't ship a signup route — that's Wave 2 onboarding flow)

## Cross-branch coordination
None — extracted code preserves the original scan/free/route.ts behavior (now imports from the shared module).

## Adam-action
None for this PR.

## QA-Lead requirement
Full tier — touches auth-layer logic and integrates with audit_log. Standard code-reviewer + security-engineer review pattern.

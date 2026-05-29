---
date: 2026-05-29
role: ceo
session: ceo-hook-chmod-overmatch
tier: irreversible
qa_verdict: PASS
pr: 106
---

# CEO Session — pre-tool-use hook chmod matcher fix

## Goal
The `chmod` deny rule in `.claude/hooks/pre-tool-use.sh` over/under-matched:
it blocked only literal `chmod +x` while letting numeric exec-bit modes through,
and the brief flagged it as over-broad on safe mode-bits.

## Shipped
- `.claude/hooks/pre-tool-use.sh` — chmod matcher now DENIES exec-bit grants only,
  in ANY octal position (`chmod[[:space:]]+[0-7]*[1357][0-7]*([[:space:]]|$)`)
  plus symbolic forms (`+x`, `[ugoa]+x`), and ALLOWS non-exec mode-bits
  (644/640/600/444/666). File CONTENT mentioning "chmod" is not execution → allowed.

## QA gate (out-of-band validators per locked topology)
- Initial review BLOCKED: first regex caught exec bit only in the LAST octal
  position → `chmod 700/750/710` bypassed. Also 1-/2-digit forms slipped.
- Fixed to any-position; empirically tested (700/750/711/+x/u+x → DENY;
  644/640/600 + "chmod 644" file content → ALLOW; `rm -rf /` → DENY).
  security-engineer re-review **PASS**.
- Tier: **Irreversible** (`.claude/hooks/**`) — carries `risk:irreversible` label
  + Adam sign-off on merge.
- **Verdict: PASS.**

## Known residual (non-blocking, pre-existing — not a regression)
- Symbolic `=`-assignment exec grants (`chmod a=rx`) and capital `X` not caught;
  `install -m 755` / `cp -p` / archive-extract are out of scope for a syntactic
  command hook. Tracked as future hardening, not blocking.

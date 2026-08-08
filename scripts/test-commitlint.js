#!/usr/bin/env node
// Smoke test for commitlint.config.js — exercises known-good and known-bad messages.
// Run via: pnpm run commitlint:smoke
// Exits non-zero if any assertion fails.

const { spawnSync } = require('child_process');

const PASS = [];
const FAIL = [];

const COMMITLINT = './node_modules/.bin/commitlint';

// Feed message via stdin so multi-line messages (header + blank + body) work correctly.
// The previous echo-based approach couldn't carry newlines safely.
function check(label, message, expectPass) {
  const result = spawnSync(COMMITLINT, [], {
    input: message,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const passed = result.status === 0;
  if (expectPass && passed) {
    PASS.push(`  PASS  [accept] ${label}`);
  } else if (!expectPass && !passed) {
    PASS.push(`  PASS  [reject] ${label}`);
  } else if (expectPass && !passed) {
    FAIL.push(`  FAIL  [reject] expected ACCEPT but commitlint rejected: ${label}`);
  } else {
    FAIL.push(`  FAIL  [accept] expected REJECT but commitlint accepted: ${label}`);
  }
}

// ── Known-good messages (must pass) ─────────────────────────────────────────

// All widened types
check('feat type',     'feat(scope): add new feature', true);
check('fix type',      'fix(scope): patch a bug', true);
check('chore type',    'chore: update deps', true);
check('docs type',     'docs(sessions): update session notes', true);
check('refactor type', 'refactor(auth): simplify token handling', true);
check('test type',     'test(auth): add coverage for token expiry', true);
check('style type',    'style: apply prettier formatting', true);
check('ci type',       'ci: update workflow triggers', true);
check('perf type',     'perf(db): add index on scans table', true);
check('build type',    'build: bump turbo to v3', true);
check('revert type',   'revert: revert feat(scan): add rate limit', true);
check('design type',   'design(dashboard): update color palette', true);

// Header at new 140-char boundary (must pass)
const at140 = 'feat(dashboard): ' + 'x'.repeat(140 - 'feat(dashboard): '.length);
check('header at 140 chars', at140, true);

// Real Beamix headers that previously failed (must now pass)
check(
  'real header — craft elevation (>100 chars)',
  'design(dashboard): craft elevation — depth staging, type contract, signature sparkline, violet structure [FULL]',
  true,
);
check(
  'real header — CEO uppercase token',
  'docs(sessions): CEO show-the-work Wave 0+1 session + log',
  true,
);

// Multi-line body coverage — body-max-line-length: [0] means bodies of any
// line length must be accepted. These assertions guard that override is effective.
check(
  'multi-line: long body line accepted (body-max-line-length disabled)',
  'feat(scan): implement rate limiting\n\n' +
    'This is a very long body line that deliberately exceeds one hundred characters in total length — it must be accepted because body-max-line-length is set to [0] (disabled) in commitlint.config.js.',
  true,
);
check(
  'multi-line: multi-paragraph body accepted',
  'docs(sessions): update session notes\n\n' +
    'First paragraph explaining what changed and why it was necessary.\n\n' +
    'Second paragraph with additional context. This body also exceeds 100 characters per line and must be accepted because the body-max-line-length override is active in our commitlint config.',
  true,
);

// ── Known-bad messages (must be rejected) ───────────────────────────────────

check('unknown type wip',      'wip: work in progress', false);
check('unknown type hotfix',   'hotfix: emergency patch', false);
check('missing colon',         'feat add feature without colon', false);
check('empty description',     'feat: ', false);
check('header over 140 chars', 'feat(scope): ' + 'x'.repeat(130), false);

// ── Report ───────────────────────────────────────────────────────────────────

console.log('\nCommitlint smoke test results:\n');
[...PASS, ...FAIL].forEach(l => console.log(l));
console.log(`\n${PASS.length} passed, ${FAIL.length} failed\n`);

if (FAIL.length > 0) {
  process.exit(1);
}

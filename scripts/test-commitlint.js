#!/usr/bin/env node
// Smoke test for commitlint.config.js — exercises known-good and known-bad messages.
// Run via: pnpm run commitlint:smoke
// Exits non-zero if any assertion fails.

const { execSync } = require('child_process');

const PASS = [];
const FAIL = [];

function check(label, message, expectPass) {
  const cmd = `echo "${message.replace(/"/g, '\\"')}" | ./node_modules/.bin/commitlint`;
  try {
    execSync(cmd, { stdio: 'pipe' });
    if (expectPass) {
      PASS.push(`  PASS  [accept] ${label}`);
    } else {
      FAIL.push(`  FAIL  [accept] expected REJECT but commitlint accepted: ${label}`);
    }
  } catch {
    if (!expectPass) {
      PASS.push(`  PASS  [reject] ${label}`);
    } else {
      FAIL.push(`  FAIL  [reject] expected ACCEPT but commitlint rejected: ${label}`);
    }
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
check('test(auth) pattern', 'test(auth): add token expiry coverage', true);
check('refactor(auth) pattern', 'refactor(auth): simplify session logic', true);

// ── Known-bad messages (must be rejected) ───────────────────────────────────

check('unknown type wip',           'wip: work in progress', false);
check('unknown type hotfix',        'hotfix: emergency patch', false);
check('missing colon',              'feat add feature without colon', false);
check('empty description',          'feat: ', false);
check('header over 140 chars',      'feat(scope): ' + 'x'.repeat(130), false);

// ── Report ───────────────────────────────────────────────────────────────────

console.log('\nCommitlint smoke test results:\n');
[...PASS, ...FAIL].forEach(l => console.log(l));
console.log(`\n${PASS.length} passed, ${FAIL.length} failed\n`);

if (FAIL.length > 0) {
  process.exit(1);
}

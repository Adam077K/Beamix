'use strict';

/**
 * Smoke test for commitlint.config.js — proves the rules documented in that
 * file's comments actually behave as claimed, using the exact same binary
 * CI and the local commit-msg hook both invoke (`@commitlint/cli`'s cli.js),
 * fed via stdin exactly like `commitlint --edit <file>` does.
 *
 * Run with: node --test scripts/commitlint-config.test.js
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const REPO_ROOT = path.join(__dirname, '..');
const CLI_PATH = require.resolve('@commitlint/cli/cli.js');

function lint(message) {
  const result = spawnSync(process.execPath, [CLI_PATH, '--config', path.join(REPO_ROOT, 'commitlint.config.js')], {
    cwd: REPO_ROOT,
    input: message,
    encoding: 'utf8',
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

const KNOWN_GOOD = [
  'feat(scan): add rate limit to free scan endpoint',
  'fix(billing): correct Paddle webhook signature check',
  'chore(deps): bump turbo to 2.9.6',
  'docs(readme): clarify pnpm workspace commands',
  'refactor(dashboard): extract score card into shared component',
  'test(auth): add RLS policy coverage for scans table',
  'style(lint): apply prettier to touched files',
  'ci(workflows): add explicit permissions block',
  'perf(api): batch N+1 competitor queries',
  'build(deps): pin turbo to exact version',
  'revert: revert "feat(scan): add rate limit"',
  'design(dashboard): warm-minimal score hero redesign',
  'polish(ui/schema): value-signal hero + context rail kills dead band',
  'audit: consolidated synthesis — 19 BLOCKERS + 27 SHOULD-FIX + 12 customer Qs',
  'merge(uix): Batch F capture-gated (approvals, discovery)',
  // Real merged header, 206 chars — must fit under the 220-char ceiling.
  'fix(approvals): extract isHighRisk+sortApprovals to _logic.ts, fix color law (violet→blue on toggle), conditional render panel (a11y+perf), /g flag on kind replace, char-length clamp, wire LoadingSkeleton',
  // Uppercase-leading subject (subject-case disabled) — real merged style.
  'fix(scan): QA pass — drop business_name PII from progress, turnstile prod guard, TOCTOU seed',
];

const KNOWN_GOOD_WITH_BODY = [
  {
    header: 'feat(agents): add publishing audit trail',
    body:
      'Every publishing action now writes an audit_log row and a publishing_actions ' +
      'row in the same transaction as the external API call, so a failed write never ' +
      'leaves an untracked side effect on a customer-facing platform. '.repeat(2),
  },
  {
    header: 'fix(scan): resolve race condition in progress polling',
    body:
      'First paragraph explains the bug.\n\n' +
      'Second paragraph explains the fix, in enough detail that a reviewer six ' +
      'months from now understands why this approach was chosen over the obvious ' +
      'alternative of just adding a mutex.\n\n' +
      'Third paragraph: testing notes.',
  },
];

const KNOWN_BAD = [
  'random commit message with no type prefix',
  'feature: add rate limit (wrong type — not in type-enum)',
  'Feat(scan): capital F in type is invalid',
  'feat:', // missing subject entirely
  'feat(scan) missing colon after scope',
];

test('commitlint accepts every known-good conventional-commit header', () => {
  for (const message of KNOWN_GOOD) {
    const result = lint(message);
    assert.equal(result.status, 0, `expected PASS for "${message}"\n${result.stdout}`);
  }
});

test('commitlint accepts multi-line / long-line bodies (body-max-line-length disabled)', () => {
  for (const { header, body } of KNOWN_GOOD_WITH_BODY) {
    const message = `${header}\n\n${body}`;
    const result = lint(message);
    assert.equal(result.status, 0, `expected PASS for "${header}"\n${result.stdout}`);
  }
});

test('commitlint rejects every known-bad message', () => {
  for (const message of KNOWN_BAD) {
    const result = lint(message);
    assert.notEqual(result.status, 0, `expected FAIL for "${message}"\n${result.stdout}`);
  }
});

test('commitlint rejects a header at 221 chars (one over the 220 ceiling)', () => {
  const overLength = 'feat(x): ' + 'a'.repeat(221 - 'feat(x): '.length);
  assert.equal(overLength.length, 221);
  const result = lint(overLength);
  assert.notEqual(result.status, 0);
});

test('commitlint accepts a header at exactly 220 chars', () => {
  const atLimit = 'feat(x): ' + 'a'.repeat(220 - 'feat(x): '.length);
  assert.equal(atLimit.length, 220);
  const result = lint(atLimit);
  assert.equal(result.status, 0, result.stdout);
});

'use strict';

/**
 * Tests for scripts/setup-git-hooks.js.
 *
 * Run with: node --test scripts/setup-git-hooks.test.js
 * (wired as `pnpm run test:git-hooks`, and as a step in
 * .github/workflows/commit-lint.yml)
 *
 * The integration tests below create real, throwaway git repositories under
 * the OS temp directory (never inside this repo) and exercise the actual
 * `git config` / `git worktree` machinery — the CI-detection and
 * self-establish/shared-scope-fallback logic can only be trusted if it is
 * proven against real git behavior, not mocked.
 *
 * IMPORTANT: when this suite runs inside real CI (GitHub Actions sets
 * CI=true and GITHUB_ACTIONS=true globally for every step), the "must NOT
 * be treated as CI" test cases explicitly strip those vars from the child
 * process env before asserting — otherwise they'd spuriously pass for the
 * wrong reason in the one environment that matters most.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  isTruthyEnvValue,
  isCIEnvironment,
  establishWorktreeConfigExtension,
  applyAndVerifyWorktreeScopedHooksPath,
  getWorktreeConfigExtensionValue,
  writeHookFiles,
  HOOKS_DIR_NAME,
} = require('./setup-git-hooks.js');

const SCRIPT_PATH = path.join(__dirname, 'setup-git-hooks.js');
const CI_ENV_VARS = ['CI', 'VERCEL', 'GITHUB_ACTIONS', 'CONTINUOUS_INTEGRATION', 'HUSKY'];

// ── Test helpers ─────────────────────────────────────────────────────────

const scratchDirs = [];

function makeScratchRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'beamix-hooks-test-'));
  scratchDirs.push(dir);
  run('git', ['init', '-q', dir]);
  run('git', ['-C', dir, 'config', 'user.email', 'test@example.com']);
  run('git', ['-C', dir, 'config', 'user.name', 'Test']);
  run('git', ['-C', dir, 'commit', '--allow-empty', '-q', '-m', 'init']);
  return dir;
}

function addLinkedWorktree(repoDir, branch) {
  const worktreeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'beamix-hooks-test-wt-'));
  fs.rmdirSync(worktreeDir); // git worktree add requires the path not exist yet
  scratchDirs.push(worktreeDir);
  const result = run('git', ['-C', repoDir, 'worktree', 'add', worktreeDir, '-b', branch, '-q']);
  assert.equal(result.status, 0, `worktree add failed: ${result.stderr}`);
  return worktreeDir;
}

function run(cmd, args, options) {
  const result = spawnSync(cmd, args, Object.assign({ encoding: 'utf8' }, options || {}));
  return {
    status: result.status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
}

function runInstaller(cwd, envOverrides) {
  const env = Object.assign({}, process.env);
  for (const key of CI_ENV_VARS) delete env[key];
  Object.assign(env, envOverrides || {});
  return spawnSync(process.execPath, [SCRIPT_PATH], { cwd, env, encoding: 'utf8' });
}

test.after(() => {
  for (const dir of scratchDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ── isTruthyEnvValue ─────────────────────────────────────────────────────

test('isTruthyEnvValue: undefined/null/empty are not truthy', () => {
  assert.equal(isTruthyEnvValue(undefined), false);
  assert.equal(isTruthyEnvValue(null), false);
  assert.equal(isTruthyEnvValue(''), false);
});

test('isTruthyEnvValue: "0" and "false" (any case) are not truthy', () => {
  assert.equal(isTruthyEnvValue('0'), false);
  assert.equal(isTruthyEnvValue('false'), false);
  assert.equal(isTruthyEnvValue('FALSE'), false);
  assert.equal(isTruthyEnvValue(' False '), false);
});

test('isTruthyEnvValue: "1" and "true" are truthy', () => {
  assert.equal(isTruthyEnvValue('1'), true);
  assert.equal(isTruthyEnvValue('true'), true);
  assert.equal(isTruthyEnvValue('TRUE'), true);
});

// ── isCIEnvironment — defect (1): CI detection must catch Vercel's CI=1 ────

test('isCIEnvironment: empty env is not CI', () => {
  assert.equal(isCIEnvironment({}), false);
});

test('isCIEnvironment: CI=1 (Vercel convention) is detected — the prior bug missed this', () => {
  assert.equal(isCIEnvironment({ CI: '1' }), true);
});

test('isCIEnvironment: CI=true (GitHub Actions / generic convention) is detected', () => {
  assert.equal(isCIEnvironment({ CI: 'true' }), true);
});

test('isCIEnvironment: CI=false is explicitly honored as NOT CI', () => {
  assert.equal(isCIEnvironment({ CI: 'false', VERCEL: '0', GITHUB_ACTIONS: '0' }), false);
});

test('isCIEnvironment: VERCEL=1 alone is detected even if CI is unset', () => {
  assert.equal(isCIEnvironment({ VERCEL: '1' }), true);
});

test('isCIEnvironment: GITHUB_ACTIONS=true alone is detected even if CI is unset', () => {
  assert.equal(isCIEnvironment({ GITHUB_ACTIONS: 'true' }), true);
});

test('isCIEnvironment: CONTINUOUS_INTEGRATION=true alone is detected even if CI is unset', () => {
  assert.equal(isCIEnvironment({ CONTINUOUS_INTEGRATION: 'true' }), true);
});

// ── establishWorktreeConfigExtension — defect (2): self-establish prerequisite ──

test('establishWorktreeConfigExtension: sets extensions.worktreeConfig=true on a fresh repo', () => {
  const repo = makeScratchRepo();
  assert.equal(getWorktreeConfigExtensionValue(repo), null, 'precondition: not set yet');

  const result = establishWorktreeConfigExtension(repo);
  assert.equal(result.ok, true);
  assert.equal(result.alreadySet, false);
  assert.equal(getWorktreeConfigExtensionValue(repo), 'true');
});

test('establishWorktreeConfigExtension: is idempotent (already-set is reported, not re-forced)', () => {
  const repo = makeScratchRepo();
  establishWorktreeConfigExtension(repo);

  const second = establishWorktreeConfigExtension(repo);
  assert.equal(second.ok, true);
  assert.equal(second.alreadySet, true);
});

test('establishWorktreeConfigExtension: run from a linked worktree still lands in the SHARED config', () => {
  const repo = makeScratchRepo();
  const worktree = addLinkedWorktree(repo, 'establish-from-worktree');

  const result = establishWorktreeConfigExtension(worktree);
  assert.equal(result.ok, true);

  // Must be visible from the ORIGINAL repo checkout too — proves it's a
  // repo-wide (shared) setting, which is the only place this key can live.
  assert.equal(getWorktreeConfigExtensionValue(repo), 'true');
});

// ── applyAndVerifyWorktreeScopedHooksPath — defect (3): no silent fallback ──

test('shared-scope fallback IS detected when extensions.worktreeConfig was never established', () => {
  // Reproduces the exact incident-equivalent condition, measured manually:
  // on a single-worktree repo with extensions.worktreeConfig unset,
  // `git config --worktree core.hooksPath X` exits 0 and silently writes
  // directly into the shared .git/config. `--worktree --get` alone cannot
  // tell the difference — this test proves the --local cross-check can.
  const repo = makeScratchRepo();
  assert.equal(getWorktreeConfigExtensionValue(repo), null, 'precondition: extension not established');

  const hooksDir = path.join(repo, '.git', HOOKS_DIR_NAME);
  const verify = applyAndVerifyWorktreeScopedHooksPath(repo, hooksDir);

  assert.equal(verify.ok, false);
  assert.match(verify.reason, /SHARED-SCOPE FALLBACK DETECTED/);

  // Prove it at the filesystem level too, not just via the function's own
  // verdict: the value really did land in the shared config file.
  const sharedConfig = fs.readFileSync(path.join(repo, '.git', 'config'), 'utf8');
  assert.match(sharedConfig, /hooksPath\s*=\s*.*hooks-beamix/);
});

test('worktree-scoped write is correctly isolated when the extension IS established first', () => {
  const repo = makeScratchRepo();
  establishWorktreeConfigExtension(repo);
  const worktree = addLinkedWorktree(repo, 'scoped-write-worktree');

  const hooksDir = path.join(repo, '.git', 'worktrees', path.basename(worktree), HOOKS_DIR_NAME);
  const verify = applyAndVerifyWorktreeScopedHooksPath(worktree, hooksDir);

  assert.equal(verify.ok, true, verify.reason);

  // Filesystem-level proof: the shared config must NOT contain hooksPath...
  const sharedConfig = fs.readFileSync(path.join(repo, '.git', 'config'), 'utf8');
  assert.doesNotMatch(sharedConfig, /hooksPath/);

  // ...and the per-worktree config.worktree file must.
  const worktreeConfigPath = path.join(
    repo,
    '.git',
    'worktrees',
    path.basename(worktree),
    'config.worktree',
  );
  const worktreeConfig = fs.readFileSync(worktreeConfigPath, 'utf8');
  assert.match(worktreeConfig, /hooksPath\s*=\s*.*hooks-beamix/);
});

// ── main() end-to-end via subprocess — full CLI behavior ───────────────────

test('main(): CI=1 (Vercel) short-circuits to a clean no-op, exit 0, zero side effects', () => {
  const repo = makeScratchRepo();
  const result = runInstaller(repo, { CI: '1' });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /CI environment detected/);
  assert.equal(
    getWorktreeConfigExtensionValue(repo),
    null,
    'no git config should have been touched in CI mode',
  );
});

test('main(): GITHUB_ACTIONS=true alone short-circuits to a clean no-op', () => {
  const repo = makeScratchRepo();
  const result = runInstaller(repo, { GITHUB_ACTIONS: 'true' });

  assert.equal(result.status, 0);
  assert.equal(getWorktreeConfigExtensionValue(repo), null);
});

test('main(): CONTINUOUS_INTEGRATION=true alone short-circuits to a clean no-op', () => {
  const repo = makeScratchRepo();
  const result = runInstaller(repo, { CONTINUOUS_INTEGRATION: 'true' });

  assert.equal(result.status, 0);
  assert.equal(getWorktreeConfigExtensionValue(repo), null);
});

test('main(): CI=false does NOT skip — installer proceeds and succeeds normally', () => {
  const repo = makeScratchRepo();
  const result = runInstaller(repo, { CI: 'false' });

  assert.equal(result.status, 0);
  assert.doesNotMatch(result.stdout, /CI environment detected/);
  assert.equal(getWorktreeConfigExtensionValue(repo), 'true');
});

test('main(): HUSKY=0 skips independently of CI detection', () => {
  const repo = makeScratchRepo();
  const result = runInstaller(repo, { HUSKY: '0' });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /HUSKY=0/);
  assert.equal(getWorktreeConfigExtensionValue(repo), null);
});

test('main(): full success path installs a worktree-scoped, executable commit-msg hook', () => {
  const repo = makeScratchRepo();
  const result = runInstaller(repo, {});

  assert.equal(result.status, 0, result.stderr);
  assert.equal(getWorktreeConfigExtensionValue(repo), 'true');

  const hooksDir = path.join(repo, '.git', HOOKS_DIR_NAME);
  const commitMsgPath = path.join(hooksDir, 'commit-msg');
  assert.equal(fs.existsSync(commitMsgPath), true);

  const mode = fs.statSync(commitMsgPath).mode;
  assert.equal(mode & 0o111, 0o111, 'commit-msg hook must be executable');

  const configured = run('git', ['-C', repo, 'config', '--worktree', '--get', 'core.hooksPath']);
  assert.equal(configured.stdout, hooksDir);

  const sharedConfig = fs.readFileSync(path.join(repo, '.git', 'config'), 'utf8');
  assert.doesNotMatch(sharedConfig, /hooksPath/);
});

test('main(): two linked worktrees resolve independent, non-interfering hooksPaths', () => {
  const repo = makeScratchRepo();
  const worktreeA = addLinkedWorktree(repo, 'wt-a');
  const worktreeB = addLinkedWorktree(repo, 'wt-b');

  const resultA = runInstaller(worktreeA, {});
  const resultB = runInstaller(worktreeB, {});

  assert.equal(resultA.status, 0, resultA.stderr);
  assert.equal(resultB.status, 0, resultB.stderr);

  const hooksPathA = run('git', ['-C', worktreeA, 'config', '--worktree', '--get', 'core.hooksPath']).stdout;
  const hooksPathB = run('git', ['-C', worktreeB, 'config', '--worktree', '--get', 'core.hooksPath']).stdout;

  assert.notEqual(hooksPathA, hooksPathB, 'each worktree must get its own hooksPath');
  assert.equal(fs.existsSync(path.join(hooksPathA, 'commit-msg')), true);
  assert.equal(fs.existsSync(path.join(hooksPathB, 'commit-msg')), true);

  // Shared config still must never have gained core.hooksPath.
  const sharedConfig = fs.readFileSync(path.join(repo, '.git', 'config'), 'utf8');
  assert.doesNotMatch(sharedConfig, /hooksPath/);

  // extensions.worktreeConfig converges to true exactly once, shared.
  assert.equal(getWorktreeConfigExtensionValue(repo), 'true');
});

test('writeHookFiles: regenerates the commit-msg hook with the executable bit even if it pre-exists', () => {
  const repo = makeScratchRepo();
  const hooksDir = path.join(repo, '.git', HOOKS_DIR_NAME);
  const commitMsgPath = writeHookFiles(hooksDir);

  fs.chmodSync(commitMsgPath, 0o644); // simulate perms getting stripped
  writeHookFiles(hooksDir);

  const mode = fs.statSync(commitMsgPath).mode;
  assert.equal(mode & 0o111, 0o111);
});

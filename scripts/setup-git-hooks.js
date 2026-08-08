#!/usr/bin/env node
/**
 * setup-git-hooks.js — worktree-scoped git hooks installation
 *
 * Beamix runs 50+ concurrent git worktrees that share one .git directory.
 * husky's default `install` runs `git config core.hooksPath .husky/_` with no
 * scope flag, which writes to the SHARED .git/config and silently redirects
 * every other worktree's hook resolution to a path that only exists on this
 * branch. This script avoids that by never calling `git config` without
 * --worktree, so the setting lands in .git/worktrees/<name>/config only.
 *
 * Prerequisite (done once by the repo owner): extensions.worktreeConfig = true
 * must be set in the shared .git/config. Without it, --worktree has no effect.
 *
 * In CI (CI=true) or when HUSKY=0, hook setup is skipped — CI uses direct
 * `pnpm exec commitlint`, not git hooks.
 */

'use strict';

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Skip in CI or when explicitly disabled.
if (process.env.CI === 'true' || process.env.HUSKY === '0') {
  process.stdout.write('setup-git-hooks: skipping (CI or HUSKY=0)\n');
  process.exit(0);
}

// Resolve worktree root. When run as a pnpm prepare script, CWD is the worktree root.
// git rev-parse --show-toplevel returns the worktree root (not the shared repo root).
const revParseResult = spawnSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
  stdio: ['inherit', 'pipe', 'inherit'],
});
if (revParseResult.status !== 0) {
  process.stderr.write('setup-git-hooks: git rev-parse --show-toplevel failed\n');
  process.exit(1);
}
const worktreeRoot = revParseResult.stdout.trim();

// Paths.
const huskyDir        = path.join(worktreeRoot, '.husky', '_');
const huskyHookRunner = path.join(worktreeRoot, 'node_modules', 'husky', 'husky');

if (!fs.existsSync(huskyHookRunner)) {
  process.stderr.write(`setup-git-hooks: husky hook runner not found at ${huskyHookRunner}\n`);
  process.exit(1);
}

// ── 1. Generate .husky/_ shim directory ─────────────────────────────────────
// Replicates what `husky install` does for file creation, but skips the
// `git config core.hooksPath` write entirely — we handle that in step 2
// with --worktree scope.

fs.rmSync(path.join(huskyDir, 'husky.sh'), { force: true });
fs.mkdirSync(huskyDir, { recursive: true });
fs.writeFileSync(path.join(huskyDir, '.gitignore'), '*');
fs.copyFileSync(huskyHookRunner, path.join(huskyDir, 'h'));

const hooks = [
  'pre-commit', 'pre-merge-commit', 'prepare-commit-msg', 'commit-msg',
  'post-commit', 'applypatch-msg', 'pre-applypatch', 'post-applypatch',
  'pre-rebase', 'post-rewrite', 'post-checkout', 'post-merge',
  'pre-push', 'pre-auto-gc',
];
const shim = '#!/usr/bin/env sh\n. "$(dirname "$0")/h"';
for (const hook of hooks) {
  fs.writeFileSync(path.join(huskyDir, hook), shim, { mode: 0o755 });
}
// Deprecation shim for old-style hooks that source husky.sh.
const deprecationMsg =
  'echo "husky - DEPRECATED\\n\\n' +
  'Please remove the following two lines from $0:\\n\\n' +
  '#!/usr/bin/env sh\\n' +
  '. \\"\\$(dirname -- \\"\\$0\\")/_/husky.sh\\"\\n\\n' +
  'They WILL FAIL in v10.0.0\\n"';
fs.writeFileSync(path.join(huskyDir, 'husky.sh'), deprecationMsg);

// ── 2. Set core.hooksPath in THIS WORKTREE's config only ────────────────────
// --worktree is mandatory: writes to .git/worktrees/<name>/config, not to
// the shared .git/config. This requires extensions.worktreeConfig = true.

const configResult = spawnSync(
  'git', ['config', '--worktree', 'core.hooksPath', huskyDir],
  { cwd: worktreeRoot, stdio: 'inherit' },
);
if (configResult.status !== 0) {
  process.stderr.write(
    `setup-git-hooks: FAIL — git config --worktree failed (exit ${configResult.status})\n`,
  );
  process.exit(configResult.status || 1);
}

// ── 3. Verify config was actually set (guard against lock-file races) ────────
// husky's own install can fail with a lock error while still exiting 0,
// leaving hooks silently uninstalled. We read the value back and fail hard.

const verifyResult = spawnSync(
  'git', ['config', '--worktree', '--get', 'core.hooksPath'],
  { cwd: worktreeRoot, encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit'] },
);
const gotPath = verifyResult.stdout.trim();
if (verifyResult.status !== 0 || gotPath !== huskyDir) {
  process.stderr.write('setup-git-hooks: FAIL — core.hooksPath was not persisted in worktree config.\n');
  process.stderr.write(`  Expected: ${huskyDir}\n`);
  process.stderr.write(`  Got:      ${gotPath || '(empty)'}\n`);
  process.exit(1);
}

process.stdout.write(`setup-git-hooks: hooks installed for this worktree only.\n`);
process.stdout.write(`  hooksPath: ${huskyDir}\n`);

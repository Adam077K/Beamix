#!/usr/bin/env python3
"""
actions_pin_check.py -- verify every third-party GitHub Actions reference
in a workflows directory is pinned to a 40-char commit SHA and accompanied
by a version comment of the form # vX.Y.Z.

Usage:
    python3 actions_pin_check.py [workflows_dir]

Default workflows_dir: .github/workflows

Exit codes: 0 = all OK, 1 = one or more violations (or no files found).
"""
import sys
import re
import glob
import yaml
import yaml.nodes


# @<40-hex-SHA> case-insensitive; end-of-value or before whitespace.
PIN_SHA = re.compile(r'@[0-9a-fA-F]{40}(?:\s|$)')

# Version comment: must be # v<digit>... and must be the trailing content on
# the line (anchored at end, allowing only trailing whitespace). This rejects
# # verified working, # vendor-approved, # TODO check version, etc.
VERSION_COMMENT = re.compile(r'#\s*v\d[\w.\-+]*\s*$')

# Local reusable-workflow refs (uses: ./...) are exempt.
LOCAL_PREFIX = re.compile(r'^\.\/')


def find_uses_nodes(node):
    """Yield (ref_string, lineno) tuples from a composed YAML node tree.

    Uses source-position data from yaml.compose() so each `uses:` occurrence
    resolves to its own actual line number in the source file. This prevents
    the duplicate-ref bypass where substring search always finds the first
    occurrence and silently inherits its comment status for all subsequent
    occurrences of the same SHA.
    """
    if isinstance(node, yaml.nodes.MappingNode):
        for key_node, value_node in node.value:
            if (isinstance(key_node, yaml.nodes.ScalarNode) and
                    key_node.value == 'uses' and
                    isinstance(value_node, yaml.nodes.ScalarNode)):
                # value_node.start_mark.line is 0-indexed; +1 for 1-indexed line number.
                yield (value_node.value, value_node.start_mark.line + 1)
            else:
                yield from find_uses_nodes(value_node)
    elif isinstance(node, yaml.nodes.SequenceNode):
        for item in node.value:
            yield from find_uses_nodes(item)


def check_workflows(workflows_dir='.github/workflows'):
    """Check all workflow files in workflows_dir. Returns 0 (pass) or 1 (fail)."""
    fail = 0
    files_checked = 0

    filepaths = sorted(
        glob.glob(f'{workflows_dir}/*.yml') +
        glob.glob(f'{workflows_dir}/*.yaml')
    )

    for filepath in filepaths:
        files_checked += 1
        print(f"Checking {filepath}")

        with open(filepath) as fh:
            raw = fh.read()

        raw_lines = raw.splitlines()

        try:
            # Use yaml.compose() instead of yaml.safe_load() to get a node tree
            # with real source positions -- this is the fix for the duplicate-ref bypass.
            root_node = yaml.compose(raw)
        except yaml.YAMLError as e:
            print(f"  YAML parse error: {e}")
            fail = 1
            continue

        if root_node is None:
            continue

        for ref, lineno in find_uses_nodes(root_node):
            if LOCAL_PREFIX.match(ref):
                print(f"  local reusable workflow -- OK: {ref}")
                continue

            raw_line = raw_lines[lineno - 1] if 0 < lineno <= len(raw_lines) else ""

            if not PIN_SHA.search(ref):
                print(f"  [{filepath}:{lineno}] NOT PINNED (no 40-char SHA): uses: {ref}")
                fail = 1
                continue

            if not VERSION_COMMENT.search(raw_line):
                print(f"  [{filepath}:{lineno}] MISSING version comment (# vX.Y.Z): uses: {ref}")
                fail = 1
                continue

            print(f"  [{filepath}:{lineno}] pinned -- OK: uses: {ref}")

    print(f"\nChecked {files_checked} workflow file(s).")

    if files_checked == 0:
        print("No workflow files found -- pin check did not run. Failing closed.")
        return 1

    if fail:
        print("")
        print("One or more Actions references are not pinned to a full 40-character commit SHA.")
        print("Pin third-party/GitHub-owned actions like:")
        print("  uses: owner/repo@<40-hex-char-commit-sha> # vX.Y.Z")
        print("")
        print("Resolve the SHA with:")
        print("  gh api repos/<owner>/<repo>/commits/<tag> --jq '.sha'")
        return 1

    print("\nAll Actions references are SHA-pinned.")
    return 0


if __name__ == '__main__':
    workflows_dir = sys.argv[1] if len(sys.argv) > 1 else '.github/workflows'
    sys.exit(check_workflows(workflows_dir))

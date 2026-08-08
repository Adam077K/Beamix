#!/usr/bin/env python3
"""
actions_pin_check.py -- verify every third-party GitHub Actions reference
in a workflows directory is pinned to a 40-char commit SHA and accompanied
by a version comment of the form # vX.Y.Z.

Usage:
    python3 actions_pin_check.py [workflows_dir]

Default workflows_dir: .github/workflows

Exit codes: 0 = all OK, 1 = one or more violations (or no files found).

Runtime dependency: PyYAML. The CI job that runs this script (see
.github/workflows/actions-pin-check.yml) installs a pinned PyYAML version
via `pip install pyyaml==<version>` before invoking this script or its
test module -- both `import yaml`. Do not run this script in an
environment without that dependency installed.

Anchor/alias policy: this script deliberately does NOT attempt to resolve
or line-attribute YAML anchors (&name) or aliases (*name). PyYAML's public
compose() API returns the exact same Node object for every alias site as
for the anchor's own definition (verified against PyYAML 6.0.3 --
Composer.compose_node() does `return self.anchors[anchor]` unchanged for
an AliasEvent), so the alias's real source line cannot be recovered, and a
self-referential anchor would recurse forever if we tried to walk through
it. Any workflow file containing an anchor or alias FAILS CLOSED --
see CycleOrAliasError below.
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

# Defense-in-depth ceiling on node-graph walk depth. Real workflow files
# never nest anywhere close to this deep; this exists purely so a
# pathologically deep (but non-cyclic) document fails closed with a clear
# error instead of exhausting the Python call stack. Kept comfortably below
# the point where PyYAML's own recursive Composer would raise a bare
# RecursionError while building the node tree (empirically ~250 levels for
# deeply nested flow mappings on CPython's default recursion limit) so this
# guard is the one that fires, not an uncaught stack overflow.
MAX_NODE_DEPTH = 100


class CycleOrAliasError(Exception):
    """Raised when the composed YAML node graph revisits a node object it
    has already walked in the current document, or exceeds MAX_NODE_DEPTH.

    A revisited node is the structural signature of a YAML anchor/alias:
    PyYAML never constructs two Python Node objects for the same anchor --
    every `*alias` site literally IS the same object as its `&anchor`
    definition (see module docstring). Detecting "have I seen this exact
    object before" is therefore a reliable, version-independent way to
    detect alias usage without relying on a `.anchor` attribute (which
    plain Node objects don't even carry in current PyYAML).

    This same check doubles as the cycle guard: a self-referential anchor
    (e.g. `a: &x {b: *x}`) can only loop back to an ancestor via that same
    already-visited object, so the walk stops the instant it would recurse
    into the cycle -- no unbounded recursion is possible.
    """


def _visit(node, seen_ids):
    """Register `node` as visited; raise if it was already visited."""
    node_id = id(node)
    if node_id in seen_ids:
        raise CycleOrAliasError(
            "a YAML node was encountered twice while walking this document. "
            "In PyYAML's composed tree that only happens via an anchor/alias "
            "(&name / *name) -- refusing to validate this file rather than "
            "risk misattributing a pin/comment check to the wrong line "
            "(or, for a cyclic anchor, recursing forever)."
        )
    seen_ids.add(node_id)


def find_uses_nodes(node, seen_ids=None, depth=0):
    """Yield (ref_string, lineno) tuples from a composed YAML node tree.

    Uses source-position data from yaml.compose() so each `uses:` occurrence
    resolves to its own actual line number in the source file. This avoids
    the duplicate-ref bypass where a substring search always finds the first
    occurrence and silently inherits its comment status for all subsequent
    occurrences of the same SHA.

    Raises CycleOrAliasError (caller should catch it and fail that file
    closed) if the document contains any anchor/alias or exceeds
    MAX_NODE_DEPTH.
    """
    if seen_ids is None:
        seen_ids = set()

    if depth > MAX_NODE_DEPTH:
        raise CycleOrAliasError(
            f"YAML node nesting exceeded {MAX_NODE_DEPTH} levels -- "
            "cycle guard tripped."
        )

    _visit(node, seen_ids)

    if isinstance(node, yaml.nodes.MappingNode):
        for key_node, value_node in node.value:
            # Defensively register the key node too (catches the rare case
            # of an anchor/alias placed on a mapping key rather than a
            # value).
            _visit(key_node, seen_ids)

            if (isinstance(key_node, yaml.nodes.ScalarNode) and
                    key_node.value == 'uses' and
                    isinstance(value_node, yaml.nodes.ScalarNode)):
                _visit(value_node, seen_ids)
                yield (value_node.value, value_node.start_mark.line + 1)
            else:
                yield from find_uses_nodes(value_node, seen_ids, depth + 1)
    elif isinstance(node, yaml.nodes.SequenceNode):
        for item in node.value:
            yield from find_uses_nodes(item, seen_ids, depth + 1)
    elif isinstance(node, yaml.nodes.ScalarNode):
        pass  # leaf -- nothing further to walk
    else:
        # Unknown node type (a future PyYAML version might add one). Fail
        # closed rather than silently skip whatever it contains.
        raise CycleOrAliasError(f"unrecognized YAML node type: {type(node).__name__}")


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
            # with real source positions for each `uses:` occurrence.
            root_node = yaml.compose(raw)
        except yaml.YAMLError as e:
            print(f"  YAML parse error: {e}")
            fail = 1
            continue
        except RecursionError:
            # PyYAML's own Composer is recursive; a pathologically deep (but
            # otherwise valid) document can exhaust the Python call stack
            # before our own MAX_NODE_DEPTH guard ever gets a chance to run.
            # Fail this file closed instead of letting the whole job crash
            # with an uninformative traceback.
            print(f"  [{filepath}] REFUSING TO VALIDATE (fail closed): YAML "
                  f"nesting is too deep to parse safely (PyYAML composer "
                  f"hit Python's recursion limit).")
            fail = 1
            continue

        if root_node is None:
            continue

        try:
            uses_nodes = list(find_uses_nodes(root_node))
        except CycleOrAliasError as e:
            print(f"  [{filepath}] REFUSING TO VALIDATE (fail closed): {e}")
            print(f"  [{filepath}] This is either a YAML anchor/alias "
                  f"(&name / *name) or nesting deeper than {MAX_NODE_DEPTH} "
                  f"levels. Rewrite the file without anchors/aliases and/or "
                  f"flatten the nesting so every 'uses:' pin can be verified "
                  f"on its own line.")
            fail = 1
            continue

        for ref, lineno in uses_nodes:
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
        print("One or more Actions references are not pinned to a full 40-character commit SHA")
        print("(or the file contains a YAML anchor/alias and was refused).")
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

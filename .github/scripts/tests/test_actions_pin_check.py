"""
Regression tests for actions_pin_check.py.

Each test uses a small standalone fixture directory under tests/fixtures/
(never the real .github/workflows/) so the test suite is hermetic and
independent of real workflow file changes.
"""
import io
import os
import sys
import tempfile
import time
import unittest
from contextlib import redirect_stdout

import yaml
import yaml.error
import yaml.nodes

# Add the parent directory (.github/scripts) to the path.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from actions_pin_check import (
    check_workflows,
    find_uses_nodes,
    CycleOrAliasError,
    MAX_NODE_DEPTH,
)

FIXTURES = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fixtures')


def run_check(fixture_name):
    """Run check_workflows against a named fixture directory. Returns (exit_code, stdout)."""
    fixture_path = os.path.join(FIXTURES, fixture_name)
    buf = io.StringIO()
    with redirect_stdout(buf):
        exit_code = check_workflows(fixture_path)
    return exit_code, buf.getvalue()


def _mark():
    """A throwaway PyYAML source-position Mark for hand-built node fixtures."""
    return yaml.error.Mark('<test>', 0, 0, 0, None, None)


def _scalar(value):
    return yaml.nodes.ScalarNode(tag='tag:yaml.org,2002:str', value=value,
                                  start_mark=_mark(), end_mark=_mark())


def _mapping(items):
    return yaml.nodes.MappingNode(tag='tag:yaml.org,2002:map', value=items,
                                   start_mark=_mark(), end_mark=_mark())


class TestActionsPinCheck(unittest.TestCase):

    def test_unpinned_block_style(self):
        """uses: actions/checkout@v4 (block style) must fail."""
        code, out = run_check('unpinned_block_style')
        self.assertEqual(code, 1, f"Expected exit 1, got {code}. Output:\n{out}")
        self.assertIn('NOT PINNED', out)

    def test_unpinned_flow_style(self):
        """- {name: x, uses: actions/checkout@v4} (flow style) must fail."""
        code, out = run_check('unpinned_flow_style')
        self.assertEqual(code, 1, f"Expected exit 1, got {code}. Output:\n{out}")
        self.assertIn('NOT PINNED', out)

    def test_pinned_no_comment(self):
        """SHA-pinned action with no version comment must fail."""
        code, out = run_check('pinned_no_comment')
        self.assertEqual(code, 1, f"Expected exit 1, got {code}. Output:\n{out}")
        self.assertIn('MISSING version comment', out)

    def test_duplicate_ref_second_missing_comment(self):
        """
        Regression for the duplicate-ref bypass: two jobs using the same SHA,
        version comment present on the first occurrence only, missing on the second.

        OLD behaviour (bug): substring search always found job-a's line, which
        has the comment, and reported both occurrences as OK.

        FIXED behaviour: yaml.compose() source positions resolve job-b's uses:
        to its own line, which lacks the comment -- correctly reported as FAIL.
        """
        code, out = run_check('duplicate_ref_second_missing_comment')
        self.assertEqual(code, 1, f"Expected exit 1, got {code}. Output:\n{out}")
        self.assertIn('MISSING version comment', out)
        # The failure must point to job-b's uses: line (13), NOT job-a's (8).
        self.assertIn(':13]', out, (
            "Expected the error to reference line 13 (job-b's uses: line). "
            f"Actual output:\n{out}"
        ))
        # And job-a's occurrence must still be reported as OK.
        self.assertIn(':8] pinned -- OK', out, (
            "Expected job-a's occurrence on line 8 to be reported as OK. "
            f"Actual output:\n{out}"
        ))

    def test_non_version_trailing_comment(self):
        """
        Regression for the too-loose regex: # verified working, do not touch
        must fail because it is not a version comment.
        """
        code, out = run_check('non_version_comment')
        self.assertEqual(code, 1, f"Expected exit 1, got {code}. Output:\n{out}")
        self.assertIn('MISSING version comment', out)

    def test_properly_pinned_and_commented(self):
        """SHA-pinned action with # v4.4.0 version comment must pass."""
        code, out = run_check('properly_pinned')
        self.assertEqual(code, 0, f"Expected exit 0, got {code}. Output:\n{out}")
        self.assertIn('pinned -- OK', out)

    def test_local_workflow_ref(self):
        """uses: ./.github/workflows/x.yml is exempt and must pass."""
        code, out = run_check('local_workflow_ref')
        self.assertEqual(code, 0, f"Expected exit 0, got {code}. Output:\n{out}")
        self.assertIn('local reusable workflow -- OK', out)

    def test_empty_dir(self):
        """Empty workflows directory must fail closed (fail-safe, not fail-open)."""
        with tempfile.TemporaryDirectory() as tmpdir:
            buf = io.StringIO()
            with redirect_stdout(buf):
                code = check_workflows(tmpdir)
            out = buf.getvalue()
        self.assertEqual(code, 1, f"Expected exit 1, got {code}. Output:\n{out}")
        self.assertIn('Failing closed', out)

    # ── Anchor / alias / cycle handling ─────────────────────────────────────
    #
    # Prior-attempt defect: anchors/aliases caused findings to be attributed
    # to the wrong line, and a cyclic anchor caused unbounded recursion with
    # no cycle guard and no timeout. This checker deliberately refuses to
    # resolve anchors/aliases at all -- see actions_pin_check.py module
    # docstring -- and fails closed instead. These tests prove that policy
    # holds, including for a genuinely self-referential (cyclic) graph, with
    # a measured wall-clock bound so a hang would fail the test rather than
    # hang CI.

    def test_anchor_alias_fails_closed(self):
        """
        A workflow that anchors one (properly pinned) step and aliases it
        into a second job must be REFUSED, not silently passed. Even though
        the aliased content is semantically identical to the anchor (PyYAML
        always resolves an alias to the exact same value), the checker
        cannot verify what physical line the alias occurred on, so it must
        fail closed rather than mis-attribute or skip that occurrence.
        """
        code, out = run_check('anchor_alias_step')
        self.assertEqual(code, 1, f"Expected exit 1, got {code}. Output:\n{out}")
        self.assertIn('REFUSING TO VALIDATE', out)

    def test_cyclic_anchor_fails_closed_and_does_not_hang(self):
        """
        A self-referential anchor (`x: &cycle {b: *cycle}`) must be detected
        and refused near-instantly, not recursed into. This is the direct
        regression test for the prior attempt's unbounded-recursion defect.
        """
        t0 = time.monotonic()
        code, out = run_check('cyclic_anchor')
        elapsed = time.monotonic() - t0
        self.assertEqual(code, 1, f"Expected exit 1, got {code}. Output:\n{out}")
        self.assertIn('REFUSING TO VALIDATE', out)
        self.assertLess(
            elapsed, 2.0,
            f"Cyclic-anchor file took {elapsed:.3f}s to fail closed; "
            "expected near-instant rejection via the cycle guard, not "
            "recursion into the cycle."
        )

    def test_cyclic_node_graph_direct_no_recursion(self):
        """
        Build a literal self-referential Python object graph directly
        (bypassing PyYAML's own composer entirely) and confirm
        find_uses_nodes() detects the cycle on first re-entry and raises
        CycleOrAliasError immediately, rather than recursing until a
        RecursionError / hang. This is a deterministic, environment-
        independent proof that the walker's own cycle guard -- not PyYAML's
        behaviour -- is what prevents unbounded recursion.
        """
        uses_key = _scalar('uses')
        uses_val = _scalar('actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4.4.0')
        cyclic = _mapping([])
        b_key = _scalar('b')
        # cyclic contains a key 'b' whose value is `cyclic` itself -- a
        # genuine Python object self-reference, exactly what an anchor+alias
        # cycle produces in a real PyYAML compose() tree.
        cyclic.value.append((b_key, cyclic))
        cyclic.value.append((uses_key, uses_val))

        t0 = time.monotonic()
        with self.assertRaises(CycleOrAliasError):
            list(find_uses_nodes(cyclic))
        elapsed = time.monotonic() - t0

        self.assertLess(
            elapsed, 0.5,
            f"Cyclic node graph took {elapsed:.3f}s to raise; expected "
            "near-instant detection via the id()-based visited-set guard."
        )

    def test_max_node_depth_guard_direct(self):
        """
        Build a deeply nested (but acyclic, alias-free) node graph directly
        -- deeper than MAX_NODE_DEPTH -- and confirm the walker fails closed
        via the explicit depth ceiling rather than raising a bare Python
        RecursionError. Built via direct node construction (not
        yaml.compose()) so the test is deterministic regardless of PyYAML's
        own composer recursion behaviour on a given Python build.
        """
        node = _mapping([(_scalar('uses'), _scalar(
            'owner/repo@1111111111111111111111111111111111111111 # v1.0.0'))])
        for _ in range(MAX_NODE_DEPTH + 50):
            node = _mapping([(_scalar('wrap'), node)])

        with self.assertRaises(CycleOrAliasError) as ctx:
            list(find_uses_nodes(node))
        self.assertIn('exceeded', str(ctx.exception))

    def test_deeply_nested_no_alias_fixture_fails_closed(self):
        """
        End-to-end (file -> check_workflows) version of the depth-guard
        test: a real, syntactically valid, alias-free workflow file nested
        far past MAX_NODE_DEPTH must fail closed (exit 1), and must do so
        without raising an unhandled exception -- whether that's via our own
        depth guard or via the RecursionError catch around yaml.compose()
        for inputs deep enough to exceed PyYAML's own composer stack.
        """
        t0 = time.monotonic()
        code, out = run_check('deeply_nested_no_alias')
        elapsed = time.monotonic() - t0
        self.assertEqual(code, 1, f"Expected exit 1, got {code}. Output:\n{out}")
        self.assertIn('REFUSING TO VALIDATE', out)
        self.assertLess(
            elapsed, 5.0,
            f"Deeply nested fixture took {elapsed:.3f}s; expected a fast, "
            "bounded failure, not a hang."
        )


if __name__ == '__main__':
    unittest.main()

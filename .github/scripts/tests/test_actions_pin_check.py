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
import unittest
from contextlib import redirect_stdout

# Add the parent directory (.github/scripts) to the path.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from actions_pin_check import check_workflows

FIXTURES = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fixtures')


def run_check(fixture_name):
    """Run check_workflows against a named fixture directory. Returns (exit_code, stdout)."""
    fixture_path = os.path.join(FIXTURES, fixture_name)
    buf = io.StringIO()
    with redirect_stdout(buf):
        exit_code = check_workflows(fixture_path)
    return exit_code, buf.getvalue()


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

        OLD behaviour (bug): substring search always found line 7 (job-a), which
        has the comment, and reported both occurrences as OK.

        FIXED behaviour: yaml.compose() source positions resolve job-b's uses: to
        its own line (11), which lacks the comment -- correctly reported as FAIL.
        """
        code, out = run_check('duplicate_ref_second_missing_comment')
        self.assertEqual(code, 1, f"Expected exit 1, got {code}. Output:\n{out}")
        self.assertIn('MISSING version comment', out)
        # The failure must point to line 11 (job-b's uses:), NOT line 7 (job-a's).
        # This is the key assertion that would have caught the original bug.
        self.assertIn(':11]', out, (
            "Expected the error to reference line 11 (job-b's uses: line). "
            f"Actual output:\n{out}"
        ))
        # And job-a's occurrence must still be reported as OK.
        self.assertIn(':7] pinned -- OK', out, (
            "Expected job-a's occurrence on line 7 to be reported as OK. "
            f"Actual output:\n{out}"
        ))

    def test_non_version_trailing_comment(self):
        """
        Regression for the too-loose regex: # verified working, do not touch
        must fail because it is not a version comment.

        OLD behaviour (bug): '#\\s*v\\S+' matched any word starting with 'v',
        so '# verified working' passed the check.

        FIXED behaviour: '#\\s*v\\d[\\w.\\-+]*\\s*$' requires a digit after 'v'
        and anchors to end of line, so '# verified working, do not touch' fails.
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


if __name__ == '__main__':
    unittest.main()

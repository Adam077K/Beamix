import { inngest } from '../client';
import { embedAndUpsert } from '@/lib/embeddings/embed-corpus';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Incremental re-embed of session files in docs/08-agents_work/sessions/**.
 * Only changed files are re-embedded.
 *
 * R7 FIX: Per-file try/catch added — one corrupt/deleted file logs and skips,
 *   does not crash the whole batch. Matches embed-codebase.ts pattern.
 */
export const embedSessions = inngest.createFunction(
  { id: 'embed-sessions', name: 'Re-embed session files → pgvector' },
  { event: 'git/push' },
  async ({ event, step }) => {
    const paths: string[] = event.data.changed_paths ?? [];
    const sessionPaths = paths.filter(
      (p) => p.startsWith('docs/08-agents_work/sessions/') && p.endsWith('.md'),
    );
    if (sessionPaths.length === 0) {
      return { skipped: true, reason: 'No session files changed' };
    }

    const results: unknown[] = [];
    for (const path of sessionPaths) {
      // R7 fix: per-file try/catch — one bad file skips, others proceed
      const result = await step.run(`embed-${path}`, async () => {
        try {
          const contents = await readFile(join(process.cwd(), path), 'utf-8');
          return await embedAndUpsert({
            corpus: 'sessions',
            path,
            contents,
            chunkBy: 'section',
          });
        } catch (err) {
          // Log and skip — deleted/corrupt session file should not block others
          return { path, error: String(err) };
        }
      });
      results.push(result);
    }

    return { embedded: results.length, paths: sessionPaths };
  },
);

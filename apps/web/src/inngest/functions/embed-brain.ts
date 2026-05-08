import { inngest } from '../client';
import { embedAndUpsert } from '@/lib/embeddings/embed-corpus';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Re-embeds docs/00-brain/** (MOCs + log.md) into pgvector when changed.
 *
 * R7 FIX: Per-file try/catch added — one corrupt/deleted brain file logs and
 *   skips, does not crash the whole batch. Matches embed-codebase.ts pattern.
 */
export const embedBrain = inngest.createFunction(
  { id: 'embed-brain', name: 'Re-embed brain MOCs → pgvector' },
  { event: 'git/push' },
  async ({ event, step }) => {
    const paths: string[] = event.data.changed_paths ?? [];
    const brainPaths = paths.filter(
      (p) => p.startsWith('docs/00-brain/') && p.endsWith('.md'),
    );
    if (brainPaths.length === 0) {
      return { skipped: true, reason: 'No brain files changed' };
    }

    const results: unknown[] = [];
    for (const path of brainPaths) {
      // R7 fix: per-file try/catch — one bad file skips, others proceed
      const result = await step.run(`embed-${path}`, async () => {
        try {
          const contents = await readFile(join(process.cwd(), path), 'utf-8');
          return await embedAndUpsert({
            corpus: 'brain',
            path,
            contents,
            chunkBy: 'section',
          });
        } catch (err) {
          // Log and skip — deleted/corrupt brain file should not block others
          return { path, error: String(err) };
        }
      });
      results.push(result);
    }

    return { embedded: results.length, paths: brainPaths };
  },
);

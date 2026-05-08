import { inngest } from '../client';
import { embedAndUpsert } from '@/lib/embeddings/embed-corpus';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Re-embeds apps/web/src/** on PR merge to main.
 * Triggered by GitHub `pull_request.closed` event with `merged: true` and base `main`.
 */
export const embedCodebase = inngest.createFunction(
  { id: 'embed-codebase', name: 'Re-embed codebase → pgvector' },
  { event: 'github/pr.merged' },
  async ({ event, step }) => {
    const baseBranch: string = event.data.base_branch ?? '';
    if (baseBranch !== 'main') {
      return { skipped: true, reason: `Base branch ${baseBranch} is not main` };
    }

    const paths: string[] = event.data.changed_paths ?? [];
    const codePaths = paths.filter(
      (p) =>
        p.startsWith('apps/web/src/') &&
        (p.endsWith('.ts') || p.endsWith('.tsx')) &&
        !p.endsWith('.test.ts') &&
        !p.endsWith('.test.tsx'),
    );
    if (codePaths.length === 0) {
      return { skipped: true, reason: 'No code files changed' };
    }

    // Batch in chunks of 10 to avoid OpenAI rate limits.
    const results: unknown[] = [];
    const batchSize = 10;
    for (let i = 0; i < codePaths.length; i += batchSize) {
      const batch = codePaths.slice(i, i + batchSize);
      const batchResult = await step.run(`embed-batch-${i}`, async () => {
        const batchResults: unknown[] = [];
        for (const path of batch) {
          try {
            const contents = await readFile(join(process.cwd(), path), 'utf-8');
            const r = await embedAndUpsert({
              corpus: 'codebase',
              path,
              contents,
              chunkBy: 'function', // ~function-sized chunks for code
            });
            batchResults.push(r);
          } catch (err) {
            batchResults.push({ path, error: String(err) });
          }
        }
        return batchResults;
      });
      results.push(batchResult);
    }

    return { embedded: results.length, files: codePaths.length };
  },
);

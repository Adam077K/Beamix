import { inngest } from '../client';
import { embedAndUpsert } from '@/lib/embeddings/embed-corpus';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Re-embeds .claude/memory/DECISIONS.md into pgvector when it changes.
 * Triggered by `git/push` event filtered by file path.
 * Uses OpenAI text-embedding-3-large per TECH-STACK.md §3A.2.
 */
export const embedDecisions = inngest.createFunction(
  { id: 'embed-decisions', name: 'Re-embed DECISIONS.md → pgvector' },
  { event: 'git/push' },
  async ({ event, step }) => {
    const paths: string[] = event.data.changed_paths ?? [];
    if (!paths.some((p) => p.endsWith('.claude/memory/DECISIONS.md'))) {
      return { skipped: true, reason: 'DECISIONS.md unchanged' };
    }

    const contents = await step.run('read-decisions', () =>
      readFile(join(process.cwd(), '.claude/memory/DECISIONS.md'), 'utf-8'),
    );

    const result = await step.run('embed-and-upsert', () =>
      embedAndUpsert({
        corpus: 'decisions',
        path: '.claude/memory/DECISIONS.md',
        contents,
        chunkBy: 'section', // split on `## ` and `### ` headers
      }),
    );

    return result;
  },
);

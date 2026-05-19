import { inngest } from '../client';
import { embedAndUpsert } from '@/lib/embeddings/embed-corpus';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Re-embeds .claude/skills/** into pgvector when SKILL.md files change.
 * Replaces the 42K-token MANIFEST.json scan per WS1 design.
 */
export const embedSkills = inngest.createFunction(
  { id: 'embed-skills', name: 'Re-embed skills → pgvector' },
  { event: 'git/push' },
  async ({ event, step }) => {
    const paths: string[] = event.data.changed_paths ?? [];
    const skillPaths = paths.filter(
      (p) => p.startsWith('.claude/skills/') && p.endsWith('SKILL.md'),
    );
    if (skillPaths.length === 0) {
      return { skipped: true, reason: 'No skill files changed' };
    }

    const results: unknown[] = [];
    for (const path of skillPaths) {
      const result = await step.run(`embed-${path}`, async () => {
        const contents = await readFile(join(process.cwd(), path), 'utf-8');
        return embedAndUpsert({
          corpus: 'skills',
          path,
          contents,
          chunkBy: 'whole', // skills are short — embed whole
        });
      });
      results.push(result);
    }

    return { embedded: results.length, paths: skillPaths };
  },
);

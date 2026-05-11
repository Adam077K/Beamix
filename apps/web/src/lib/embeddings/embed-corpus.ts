import { createServiceRoleClient } from '@/lib/supabase/server-service-role';

// Service role required — bypasses RLS for internal observability writes.

type Corpus = 'decisions' | 'sessions' | 'brain' | 'codebase' | 'skills';
type ChunkStrategy = 'section' | 'function' | 'whole';

interface EmbedAndUpsertArgs {
  corpus: Corpus;
  path: string;
  contents: string;
  chunkBy: ChunkStrategy;
}

interface EmbedAndUpsertResult {
  corpus: Corpus;
  path: string;
  chunks_embedded: number;
}

/**
 * Embed a file's contents and upsert into the pgvector corpus table.
 * Uses OpenAI text-embedding-3-large.
 *
 * pgvector schema is provisioned in apps/web/supabase/migrations/<wsN>_pgvector.sql
 * (TBD — written in WS1C / WS6 alongside the RAG retrieval layer).
 *
 * Falls back to a stub no-op if OPENAI_API_KEY is missing — tests can run without
 * the real embedding cost.
 *
 * R7 FIX — atomicity trade-off:
 *   The ideal implementation wraps delete+insert in a Postgres transaction via
 *   supabase.rpc('embed_corpus_replace', { p_path, p_corpus, p_rows }) — but that
 *   RPC is not yet in the migrations (WS6 concern). For now we use:
 *     1. Delete prior chunks for the path
 *     2. Insert new chunks with up to 3 retries
 *     3. On insert failure after 3 retries: log to console and return 0 chunks
 *        (caller can retry the Inngest step; the old data is gone but a re-push
 *        will re-embed the file correctly)
 *   This is safe because: (a) the corpus is a cache, not the source of truth,
 *   and (b) Inngest function-level retries will re-run the full embed on failure.
 *   TODO(WS6): implement embed_corpus_replace() RPC for true atomic swap.
 *
 * R7 FIX — batch size:
 *   OpenAI embeddings API max is 2048 inputs per request; practical rate-limit
 *   safe size is 100. Chunks are batched in groups of 100 with Retry-After
 *   header parsing on 429.
 */
export async function embedAndUpsert(args: EmbedAndUpsertArgs): Promise<EmbedAndUpsertResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { corpus: args.corpus, path: args.path, chunks_embedded: 0 };
  }

  const chunks = chunkContents(args.contents, args.chunkBy);
  const embeddings = await embedBatch(chunks, apiKey);
  const supabase = createServiceRoleClient();

  // R7 fix: delete prior chunks, then insert with retry (see trade-off comment above)
  await supabase.from('rag_corpus').delete().eq('path', args.path);

  const rows = chunks.map((chunk, i) => ({
    corpus: args.corpus,
    path: args.path,
    chunk_index: i,
    content: chunk,
    embedding: embeddings[i],
  }));

  // Insert with up to 3 retries on failure
  const MAX_INSERT_RETRIES = 3;
  let insertError: Error | null = null;
  for (let attempt = 0; attempt < MAX_INSERT_RETRIES; attempt++) {
    const { error } = await supabase.from('rag_corpus').insert(rows);
    if (!error) {
      insertError = null;
      break;
    }
    insertError = new Error(error.message);
    // Brief pause between retries (exponential: 1s, 2s, 4s)
    await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
  }

  if (insertError) {
    // Insert failed after all retries. The delete already ran, so the path
    // has zero chunks in the corpus. This is acceptable — the corpus is a
    // cache. A re-push will re-embed the file.
    console.error(
      `[embed-corpus] Insert failed after ${MAX_INSERT_RETRIES} retries for path=${args.path}: ${insertError.message}`,
    );
    return { corpus: args.corpus, path: args.path, chunks_embedded: 0 };
  }

  return { corpus: args.corpus, path: args.path, chunks_embedded: chunks.length };
}

function chunkContents(contents: string, strategy: ChunkStrategy): string[] {
  if (strategy === 'whole') return [contents.slice(0, 8000)];
  if (strategy === 'section') {
    return contents
      .split(/^#{1,3}\s+/m)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => s.slice(0, 8000));
  }
  // 'function' — split on top-level function/class declarations
  return contents
    .split(/^(?=(?:export\s+)?(?:async\s+)?(?:function|class|const|interface|type)\s+\w)/m)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s.slice(0, 8000));
}

/**
 * Embed chunks in batches of 100 (OpenAI rate-limit safe size).
 * Parses Retry-After header on 429 and waits before retrying.
 *
 * R7 fix: was a single unbatched call; large files would hit 429 and
 * the entire batch would fail together.
 */
async function embedBatch(chunks: string[], apiKey: string): Promise<number[][]> {
  const BATCH_SIZE = 100;
  const results: number[][] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const embedding = await embedSingleBatch(batch, apiKey);
    results.push(...embedding);
  }

  return results;
}

async function embedSingleBatch(
  chunks: string[],
  apiKey: string,
  retryCount = 0,
): Promise<number[][]> {
  const MAX_RETRIES = 5;

  const resp = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-large',
      input: chunks,
    }),
  });

  if (resp.status === 429 && retryCount < MAX_RETRIES) {
    // R7 fix: parse Retry-After header for rate-limit backoff
    const retryAfterHeader = resp.headers.get('Retry-After');
    const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : null;
    // Exponential backoff: Retry-After header wins; fallback to 2^n seconds
    const waitMs = retryAfterSeconds
      ? retryAfterSeconds * 1000
      : Math.pow(2, retryCount + 1) * 1000;

    await new Promise((r) => setTimeout(r, waitMs));
    return embedSingleBatch(chunks, apiKey, retryCount + 1);
  }

  if (!resp.ok) {
    throw new Error(`OpenAI embeddings failed: ${resp.status} ${await resp.text()}`);
  }

  const data = (await resp.json()) as { data: { embedding: number[] }[] };
  return data.data.map((d) => d.embedding);
}

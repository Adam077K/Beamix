/**
 * POST /api/inbox/[itemId]/edit
 *
 * Accepts a text selection + user prompt, streams a Claude Haiku rewrite,
 * and asynchronously inserts a row into inbox_item_edits.
 *
 * Request body: { selection: string, prompt: string }
 * Response: streaming plain text (each chunk is a token from the model)
 *
 * Headers returned:
 *   x-edit-id — UUID of the inbox_item_edits row (set after insert completes)
 *
 * Graceful degradation:
 *   - 503 if ANTHROPIC_API_KEY is missing
 *   - 401 if user is not authenticated
 *   - 404 if the content_item does not belong to this user
 */

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const HAIKU_MODEL = 'claude-haiku-4-5-20251001'

const SYSTEM_PROMPT = `You are rewriting a snippet of content for AI search (GEO) optimization.
The user has selected a passage and asked you to rewrite it per their instruction.
Return ONLY the rewrite — no preamble, no explanation, no quotation marks around the output.
Match the tone and style of the surrounding content.`

interface EditRequestBody {
  selection: string
  prompt: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { itemId } = await params

  // ── 1. Guard: API key must exist ────────────────────────────────────────

  if (!process.env['ANTHROPIC_API_KEY']) {
    return new Response(
      JSON.stringify({ error: 'AI editing temporarily unavailable' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  // ── 2. Auth ─────────────────────────────────────────────────────────────

  const supabase = (await createClient()) as any
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── 3. Parse body ───────────────────────────────────────────────────────

  let body: EditRequestBody
  try {
    body = (await request.json()) as EditRequestBody
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { selection, prompt } = body

  if (!selection?.trim() || !prompt?.trim()) {
    return new Response(
      JSON.stringify({ error: 'Both selection and prompt are required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  // Limit lengths to prevent abuse
  const safeSelection = selection.slice(0, 2000)
  const safePrompt = prompt.slice(0, 500)

  // ── 4. Verify content item belongs to this user ─────────────────────────

  const { data: contentItem, error: itemError } = await supabase
    .from('content_items')
    .select('id, agent_job_id')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (itemError || !contentItem) {
    return new Response(JSON.stringify({ error: 'Content item not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── 5. Build user message ───────────────────────────────────────────────

  const userMessage = `Selected passage:
"""
${safeSelection}
"""

Rewrite instruction: ${safePrompt}`

  // ── 6. Stream from Anthropic + pipe to client ───────────────────────────

  const anthropic = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })

  // We collect the full response for DB insert while streaming to client
  let fullResponse = ''
  let editId: string | null = null

  // Generate a UUID for this edit row upfront so we can send it as a header
  editId = crypto.randomUUID()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = anthropic.messages.stream({
          model: HAIKU_MODEL,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        })

        // Stream tokens to client
        for await (const event of anthropicStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const text = event.delta.text
            fullResponse += text
            controller.enqueue(new TextEncoder().encode(text))
          }
        }

        // ── 7. Insert into inbox_item_edits after stream completes ──────────
        // Fire-and-forget — do not block the stream close
        ;(async () => {
          try {
            await supabase.from('inbox_item_edits').insert({
              id: editId,
              content_item_id: itemId,
              user_id: user.id,
              selected_text: safeSelection,
              user_prompt: safePrompt,
              ai_response: fullResponse,
              edit_type: 'ai_rewrite',
              accepted: null, // will be updated by PATCH /api/inbox/[itemId]
            })
          } catch (dbErr) {
            // Non-fatal: log but don't crash
            console.error('[inbox/edit] DB insert error:', dbErr)
          }
        })()

        controller.close()
      } catch (streamErr) {
        console.error('[inbox/edit] Anthropic stream error:', streamErr)
        controller.error(streamErr)
      }
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache, no-store',
      'x-edit-id': editId,
    },
  })
}

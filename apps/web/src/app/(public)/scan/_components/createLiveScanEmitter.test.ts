/**
 * createLiveScanEmitter tests.
 *
 * Coverage:
 *   1. Immediately emits a seeded ScanEvent on start() — no dead loading gap.
 *   2. Maps a ScanProgress DB row → ScanEvent field-for-field.
 *   3. done=true event causes the channel to be removed (unsubscribed).
 *   4. status='failed' → synthesizes an 'error' state for any querying engine,
 *      emits done=true.
 *   5. stop() prevents further event emission from late callbacks.
 *   6. Falls back to polling when Realtime channel reports CHANNEL_ERROR >= 3x.
 *
 * No real network calls — Supabase client and fetch are fully mocked.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ScanEvent } from './scan-contract'
import type { ScanProgress } from '@/lib/scan/progress'

// ── Mock @supabase/supabase-js ────────────────────────────────────────────────

let capturedRealtimeCallback: ((payload: { new: unknown }) => void) | null = null
let capturedStatusCallback: ((status: string) => void) | null = null
let channelRemoved = false

const mockChannel = {
  on: vi.fn().mockImplementation(
    (
      _type: string,
      _filter: unknown,
      callback: (payload: { new: unknown }) => void,
    ) => {
      capturedRealtimeCallback = callback
      return mockChannel
    },
  ),
  subscribe: vi.fn().mockImplementation(
    (callback: (status: string) => void) => {
      capturedStatusCallback = callback
      return mockChannel
    },
  ),
}

const mockSupabase = {
  channel: vi.fn().mockReturnValue(mockChannel),
  removeChannel: vi.fn().mockImplementation(() => {
    channelRemoved = true
  }),
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue(mockSupabase),
}))

// ── Mock fetch for polling fallback ──────────────────────────────────────────

const mockFetch = vi.fn()

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('createLiveScanEmitter', () => {
  beforeEach(() => {
    capturedRealtimeCallback = null
    capturedStatusCallback = null
    channelRemoved = false
    mockFetch.mockReset()
    vi.stubGlobal('fetch', mockFetch)
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
    mockChannel.on.mockClear()
    mockChannel.subscribe.mockClear()
    mockSupabase.channel.mockClear()
    mockSupabase.removeChannel.mockClear()
    mockSupabase.from.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('emits a seeded ScanEvent immediately on start()', async () => {
    const { createLiveScanEmitter } = await import('./createLiveScanEmitter')
    const events: ScanEvent[] = []
    const emitter = createLiveScanEmitter(
      'scan-123',
      'testclinic.com',
      'Test Clinic',
      (e) => events.push(e),
    )

    emitter.start()
    emitter.stop()

    expect(events).toHaveLength(1)
    const seeded = events[0]
    expect(seeded.done).toBe(false)
    expect(seeded.progress).toBeGreaterThan(0)
    expect(seeded.engines).toHaveLength(3)
    // First engine should be 'querying'
    expect(seeded.engine.status).toBe('querying')
    // currentQuery should be a real-looking query string
    expect(typeof seeded.currentQuery).toBe('string')
    expect(seeded.currentQuery!.length).toBeGreaterThan(0)
  })

  it('maps a ScanProgress row to ScanEvent correctly', async () => {
    const { createLiveScanEmitter } = await import('./createLiveScanEmitter')
    const events: ScanEvent[] = []
    const emitter = createLiveScanEmitter(
      'scan-456',
      'lawfirm.com',
      'Smith Legal',
      (e) => events.push(e),
    )

    emitter.start()

    // Simulate SUBSCRIBED to trigger fetchInitialRow (which returns null).
    capturedStatusCallback?.('SUBSCRIBED')

    // Simulate a Realtime event with partial progress.
    const mockRow: Record<string, unknown> = {
      engines: [
        { id: 'chatgpt', status: 'done', queryCount: 412, totalQueries: 412 },
        { id: 'gemini', status: 'querying', queryCount: 150, totalQueries: 318 },
        { id: 'perplexity', status: 'queued', queryCount: 0, totalQueries: 0 },
      ],
      progress: 0.55,
      current_query: 'best employment lawyer Tel Aviv',
      done: false,
      status: 'running',
      updated_at: new Date().toISOString(),
    }

    capturedRealtimeCallback?.({ new: mockRow })
    emitter.stop()

    // events[0] is the seeded event, events[1] is from the Realtime row.
    expect(events.length).toBeGreaterThanOrEqual(2)
    const mapped = events[events.length - 1]
    expect(mapped.progress).toBeCloseTo(0.55)
    expect(mapped.currentQuery).toBe('best employment lawyer Tel Aviv')
    expect(mapped.done).toBe(false)
    expect(mapped.engines).toHaveLength(3)

    const chatgpt = mapped.engines.find((e) => e.id === 'chatgpt')
    expect(chatgpt?.status).toBe('done')
    expect(chatgpt?.queryCount).toBe(412)
    expect(chatgpt?.label).toBe('ChatGPT')

    const gemini = mapped.engines.find((e) => e.id === 'gemini')
    expect(gemini?.status).toBe('querying')
    expect(gemini?.queryCount).toBe(150)
  })

  it('removes the channel when done=true is received', async () => {
    const { createLiveScanEmitter } = await import('./createLiveScanEmitter')
    const emitter = createLiveScanEmitter('scan-789', 'dentist.com', undefined, vi.fn())

    emitter.start()
    capturedStatusCallback?.('SUBSCRIBED')

    // Emit a terminal row.
    const doneRow: Record<string, unknown> = {
      engines: [
        { id: 'chatgpt', status: 'done', queryCount: 412, totalQueries: 412 },
        { id: 'gemini', status: 'done', queryCount: 318, totalQueries: 318 },
        { id: 'perplexity', status: 'done', queryCount: 247, totalQueries: 247 },
      ],
      progress: 1,
      current_query: null,
      done: true,
      status: 'complete',
      updated_at: new Date().toISOString(),
    }

    capturedRealtimeCallback?.({ new: doneRow })

    expect(channelRemoved).toBe(true)
  })

  it('synthesizes error state for querying engine on status=failed', async () => {
    const { createLiveScanEmitter } = await import('./createLiveScanEmitter')
    const events: ScanEvent[] = []
    const emitter = createLiveScanEmitter('scan-fail', 'example.com', undefined, (e) =>
      events.push(e),
    )

    emitter.start()
    capturedStatusCallback?.('SUBSCRIBED')

    const failedRow: Record<string, unknown> = {
      engines: [
        { id: 'chatgpt', status: 'done', queryCount: 412, totalQueries: 412 },
        { id: 'gemini', status: 'querying', queryCount: 100, totalQueries: 318 },
        { id: 'perplexity', status: 'queued', queryCount: 0, totalQueries: 0 },
      ],
      progress: 0.4,
      current_query: 'some query',
      done: false,
      status: 'failed',
      updated_at: new Date().toISOString(),
    }

    capturedRealtimeCallback?.({ new: failedRow })

    const lastEvent = events[events.length - 1]
    expect(lastEvent.done).toBe(true)

    // The querying engine (gemini) should have been set to 'error'.
    const gemini = lastEvent.engines.find((e) => e.id === 'gemini')
    expect(gemini?.status).toBe('error')

    // Channel should be removed.
    expect(channelRemoved).toBe(true)
  })

  it('does not emit after stop() is called', async () => {
    const { createLiveScanEmitter } = await import('./createLiveScanEmitter')
    const events: ScanEvent[] = []
    const emitter = createLiveScanEmitter('scan-stopped', 'example.com', undefined, (e) =>
      events.push(e),
    )

    emitter.start()
    emitter.stop()

    const countAfterStop = events.length

    // Simulate a late Realtime callback.
    const lateRow: Record<string, unknown> = {
      engines: [
        { id: 'chatgpt', status: 'done', queryCount: 412, totalQueries: 412 },
        { id: 'gemini', status: 'done', queryCount: 318, totalQueries: 318 },
        { id: 'perplexity', status: 'done', queryCount: 247, totalQueries: 247 },
      ],
      progress: 1,
      current_query: null,
      done: true,
      status: 'complete',
      updated_at: new Date().toISOString(),
    }

    capturedRealtimeCallback?.({ new: lateRow })

    // No new events after stop.
    expect(events).toHaveLength(countAfterStop)
  })

  it('switches to polling after 3 consecutive Realtime channel errors', async () => {
    vi.useFakeTimers()

    const pollingResponse: ScanProgress = {
      engines: [
        { id: 'chatgpt', status: 'querying', queryCount: 50, totalQueries: 412 },
        { id: 'gemini', status: 'queued', queryCount: 0, totalQueries: 318 },
        { id: 'perplexity', status: 'queued', queryCount: 0, totalQueries: 247 },
      ],
      progress: 0.1,
      currentQuery: 'test query',
      done: false,
      status: 'running',
      updated_at: new Date().toISOString(),
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => pollingResponse,
    })

    const { createLiveScanEmitter } = await import('./createLiveScanEmitter')
    const events: ScanEvent[] = []
    const emitter = createLiveScanEmitter('scan-poll', 'test.com', undefined, (e) =>
      events.push(e),
    )

    emitter.start()

    // Trigger 3 channel errors.
    capturedStatusCallback?.('CHANNEL_ERROR')
    capturedStatusCallback?.('CHANNEL_ERROR')
    capturedStatusCallback?.('CHANNEL_ERROR')

    // Advance timers past the poll interval (1000ms = 1Hz).
    await vi.advanceTimersByTimeAsync(1500)

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/scan/free/scan-poll/progress',
      expect.objectContaining({ cache: 'no-store' }),
    )

    emitter.stop()
    vi.useRealTimers()
  })

  it('switches to polling after 5s stale-delta timeout (no row received after SUBSCRIBED)', async () => {
    vi.useFakeTimers()

    const pollingResponse: ScanProgress = {
      engines: [
        { id: 'chatgpt', status: 'querying', queryCount: 30, totalQueries: 412 },
        { id: 'gemini', status: 'queued', queryCount: 0, totalQueries: 318 },
        { id: 'perplexity', status: 'queued', queryCount: 0, totalQueries: 247 },
      ],
      progress: 0.05,
      currentQuery: 'best SaaS CRM for small teams',
      done: false,
      status: 'running',
      updated_at: new Date().toISOString(),
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => pollingResponse,
    })

    const { createLiveScanEmitter } = await import('./createLiveScanEmitter')
    const emitter = createLiveScanEmitter('scan-stale', 'example.com', undefined, vi.fn())

    emitter.start()

    // Subscription becomes active — starts the 5s watchdog.
    capturedStatusCallback?.('SUBSCRIBED')

    // No Realtime rows arrive. Advance 4999ms — should NOT have polled yet.
    await vi.advanceTimersByTimeAsync(4999)
    expect(mockFetch).not.toHaveBeenCalled()

    // Advance 1 more ms — watchdog fires, polling starts.
    await vi.advanceTimersByTimeAsync(1)
    // Advance past the poll interval to trigger the first fetch call.
    await vi.advanceTimersByTimeAsync(1100)

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/scan/free/scan-stale/progress',
      expect.objectContaining({ cache: 'no-store' }),
    )

    emitter.stop()
    vi.useRealTimers()
  })

  it('resets the stale-delta watchdog when a Realtime row arrives', async () => {
    vi.useFakeTimers()

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        engines: [],
        progress: 0.1,
        currentQuery: null,
        done: false,
        status: 'running',
        updated_at: new Date().toISOString(),
      }),
    })

    const { createLiveScanEmitter } = await import('./createLiveScanEmitter')
    const emitter = createLiveScanEmitter('scan-watchdog-reset', 'example.com', undefined, vi.fn())

    emitter.start()
    capturedStatusCallback?.('SUBSCRIBED')

    // Advance 4s — watchdog still running.
    await vi.advanceTimersByTimeAsync(4000)

    // A Realtime row arrives — resets the watchdog timer.
    const midRow: Record<string, unknown> = {
      engines: [
        { id: 'chatgpt', status: 'querying', queryCount: 200, totalQueries: 412 },
        { id: 'gemini', status: 'queued', queryCount: 0, totalQueries: 318 },
        { id: 'perplexity', status: 'queued', queryCount: 0, totalQueries: 247 },
      ],
      progress: 0.3,
      current_query: 'CRM comparison 2026',
      done: false,
      status: 'running',
      updated_at: new Date().toISOString(),
    }
    capturedRealtimeCallback?.({ new: midRow })

    // Advance another 4.9s — watchdog was reset by the row so still has ~0.1s left.
    await vi.advanceTimersByTimeAsync(4900)

    // Polling should NOT have started (watchdog was reset).
    expect(mockFetch).not.toHaveBeenCalled()

    emitter.stop()
    vi.useRealTimers()
  })
})

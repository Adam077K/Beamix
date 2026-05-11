/**
 * RoutineLock — Cloudflare Durable Object for strongly-consistent idempotency.
 *
 * Layer 2 dedup (per ORCHESTRATION.md §2B two-layer idempotency):
 *   Layer 1: Cloudflare KV — ticket-scoped 24h TTL (handles retry dedup across edges)
 *   Layer 2: This DO  — strongly-consistent per (routine_id, ticket_id) key.
 *            Catches cross-region races where KV propagation hasn't completed yet.
 *
 * Auto-release: locks expire after 5 minutes via Durable Object alarm.
 * This prevents orphaned locks when a Worker crashes after acquire but before release.
 *
 * R4 fix: On every acquireLock success, update the alarm to the EARLIEST expiring lock
 * (min-heap by alarm pattern). Previously, the alarm was only set when currentAlarm === null,
 * which left later-acquired locks without an alarm if DO was evicted after the first fires.
 */

import type { DurableObjectState } from "@cloudflare/workers-types";

const LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class RoutineLock {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const action = url.pathname.slice(1); // "acquire" | "release"
    const key = url.searchParams.get("key");

    if (!key) {
      return Response.json({ error: "key is required" }, { status: 400 });
    }

    if (action === "acquire") {
      return Response.json(await this.acquire(key));
    }

    if (action === "release") {
      await this.release(key);
      return Response.json({ released: true });
    }

    return Response.json({ error: "unknown action" }, { status: 400 });
  }

  /**
   * Atomically check and set the lock for `key`.
   * Returns { acquired: true } if lock was not held and is now acquired.
   * Returns { acquired: false } if lock was already held (double-fire prevention).
   *
   * R4: After acquiring, the DO alarm is set to the earliest-expiring lock's time.
   * This ensures every lock gets cleaned up even if the DO is evicted between alarm fires.
   */
  async acquire(key: string): Promise<{ acquired: boolean }> {
    const existing = await this.state.storage.get<number>(key);

    if (existing !== undefined && existing !== null) {
      // Lock is already held — second invocation, drop it
      return { acquired: false };
    }

    const expiresAt = Date.now() + LOCK_TTL_MS;
    await this.state.storage.put(key, expiresAt);

    // R4: Set alarm to the EARLIEST expiring lock (min-heap by alarm pattern).
    // If a new lock expires sooner than the current alarm, advance the alarm forward.
    // This prevents zombie locks if the DO is evicted after the first alarm fires.
    const currentAlarm = await this.state.storage.getAlarm();
    if (currentAlarm === null || expiresAt < currentAlarm) {
      await this.state.storage.setAlarm(expiresAt);
    }

    return { acquired: true };
  }

  /**
   * Explicitly release the lock for `key`.
   */
  async release(key: string): Promise<void> {
    await this.state.storage.delete(key);
  }

  /**
   * Durable Object alarm handler — fires at TTL to clean up expired locks.
   * Iterates all stored keys and deletes any that have expired.
   * Re-schedules the alarm for the next-earliest surviving lock (R4 min-heap pattern).
   */
  async alarm(): Promise<void> {
    const now = Date.now();
    const allEntries = await this.state.storage.list<number>();

    let nextAlarm: number | null = null;

    for (const [key, expiresAt] of allEntries) {
      if (expiresAt <= now) {
        await this.state.storage.delete(key);
      } else {
        // Track the nearest future expiry for re-scheduling the alarm
        if (nextAlarm === null || expiresAt < nextAlarm) {
          nextAlarm = expiresAt;
        }
      }
    }

    // Re-schedule alarm if there are still active locks
    if (nextAlarm !== null) {
      await this.state.storage.setAlarm(nextAlarm);
    }
  }
}

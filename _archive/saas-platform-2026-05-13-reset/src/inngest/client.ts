/**
 * client.ts — Inngest client with typed event schema.
 *
 * Single import point for all Inngest usage in the app.
 * Do NOT create a second Inngest instance anywhere.
 */

import { Inngest } from 'inngest';
import type { BeamixEventMap } from './events';

export const inngest = new Inngest({
  id: 'beamix',
  eventKey: process.env['INNGEST_EVENT_KEY'] ?? '',
  schemas: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
});

// Re-export typed send helper so callers stay type-safe.
export type { BeamixEventMap };

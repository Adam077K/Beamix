/**
 * client.ts — Resend singleton client.
 *
 * All transactional email goes through notify.beamix.tech.
 * From address is controlled by the RESEND_FROM_EMAIL env var.
 */

import { Resend } from 'resend';

let _client: Resend | null = null;

export function getResendClient(): Resend {
  if (!_client) {
    const apiKey = process.env['RESEND_API_KEY'];
    if (!apiKey) throw new Error('RESEND_API_KEY is not set');
    _client = new Resend(apiKey);
  }
  return _client;
}

/** Default From address for all Beamix transactional email. */
export const FROM_ADDRESS =
  process.env['RESEND_FROM_EMAIL'] ?? 'hello@notify.beamix.tech';

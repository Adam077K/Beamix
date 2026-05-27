/**
 * Discovery Agent — Voice Session Adapter
 *
 * Interface for session transports. Wave 1 ships text-only (TextOnlyAdapter).
 * Voice via WebSocket + Whisper-1 is deferred to MVP+90 per CTO decision B2.
 *
 * The VoiceSessionAdapter interface lets the agent's streaming loop remain
 * transport-agnostic. When voice ships, a VoiceWebSocketAdapter will implement
 * this same interface without touching the agent core.
 */

import type { DiscoveryMessage } from './types';

// ---------------------------------------------------------------------------
// VoiceSessionAdapter — transport interface
// ---------------------------------------------------------------------------

export interface VoiceSessionAdapter {
  /**
   * Emit a text message from the agent to the customer.
   * Wave 1: writes to SSE stream.
   * Wave Voice: speaks via TTS + streams to WebSocket.
   */
  sendMessage(message: string): Promise<void>;

  /**
   * Wait for the next customer input.
   * Wave 1: reads from SSE request body / next message.
   * Wave Voice: transcribes from Whisper-1 WebSocket chunk.
   */
  receiveMessage(): Promise<string>;

  /**
   * Whether this session supports real-time voice.
   * False for Wave 1 (text-only). True for future voice transport.
   */
  readonly supportsVoice: boolean;

  /**
   * Optional: returns the session recording URL after completion.
   * Text-only returns null. Voice transport returns Supabase storage URL.
   */
  getRecordingUrl(): Promise<string | null>;

  /**
   * Signal that the discovery session has ended.
   * Wave 1: no-op (SSE stream closes naturally).
   * Voice: sends close frame, stops recording.
   */
  close(): Promise<void>;
}

// ---------------------------------------------------------------------------
// TextOnlyAdapter — Wave 1 text-only implementation
// ---------------------------------------------------------------------------

/**
 * Text-only adapter for Wave 1.
 *
 * Messages flow via a callback pattern — the caller pushes incoming messages
 * and receives outgoing messages through the provided callbacks. This keeps
 * the adapter decoupled from the HTTP layer (SSE route) without dependencies
 * on Node.js streams, which simplifies testing.
 */
export class TextOnlyAdapter implements VoiceSessionAdapter {
  public readonly supportsVoice = false;

  private readonly _outgoing: (message: string) => void;
  private readonly _incoming: () => Promise<string>;

  /**
   * @param onOutgoing - Called whenever the agent sends a message to the customer.
   * @param getIncoming - Called when the agent is ready to receive the next customer message.
   */
  constructor(
    onOutgoing: (message: string) => void,
    getIncoming: () => Promise<string>,
  ) {
    this._outgoing = onOutgoing;
    this._incoming = getIncoming;
  }

  async sendMessage(message: string): Promise<void> {
    this._outgoing(message);
  }

  async receiveMessage(): Promise<string> {
    return this._incoming();
  }

  async getRecordingUrl(): Promise<string | null> {
    return null;
  }

  async close(): Promise<void> {
    // No-op for text sessions — SSE stream closes when the generator returns.
  }
}

// ---------------------------------------------------------------------------
// TestAdapter — in-memory adapter for eval/test use
// ---------------------------------------------------------------------------

/**
 * Synchronous in-memory adapter for use in evals and unit tests.
 * Pre-loads a sequence of customer messages; records all agent messages.
 */
export class TestAdapter implements VoiceSessionAdapter {
  public readonly supportsVoice = false;

  private readonly _customerMessages: string[];
  private _messageIndex = 0;
  public readonly agentMessages: string[] = [];
  public readonly conversationHistory: DiscoveryMessage[] = [];

  constructor(customerMessages: string[]) {
    this._customerMessages = customerMessages;
  }

  async sendMessage(message: string): Promise<void> {
    this.agentMessages.push(message);
    this.conversationHistory.push({
      role: 'assistant',
      content: message,
      timestamp: new Date().toISOString(),
    });
  }

  async receiveMessage(): Promise<string> {
    const msg = this._customerMessages[this._messageIndex];
    if (msg === undefined) {
      // Customer has no more messages — end the conversation
      return 'I think that covers everything, thank you.';
    }
    this.conversationHistory.push({
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
    });
    this._messageIndex += 1;
    return msg;
  }

  async getRecordingUrl(): Promise<string | null> {
    return null;
  }

  async close(): Promise<void> {
    // No-op.
  }
}
